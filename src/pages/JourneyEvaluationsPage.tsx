import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getJourneyLabel,
  getPatientDashboardMock,
  goalEntryRatingBadgeClass,
  goalEntryRatingLabel,
  goalEntryRatingRowClass,
  type GoalEntryRating,
  type GoalItem,
  type GoalProgressEntry,
} from '@/constants/patient-journey-content'
import { VIEW_AS_OPTIONS, type ViewAsOption } from '@/constants/view-as'
import { usePatientJourneyEvaluationsStore } from '@/stores/patient-journey-evaluations.store'

const ratingOptions: GoalEntryRating[] = ['adequado', 'com_ressalvas', 'pendente_avaliacao']

const QUICK_NOTES: Array<{ id: string; label: string; text: string }> = [
  {
    id: 'estavel',
    label: 'Paciente estável',
    text: 'Paciente estável, sem queixas no período avaliado.',
  },
  {
    id: 'aderencia',
    label: 'Boa aderência',
    text: 'Boa aderência ao plano alimentar e suplementação em uso regular.',
  },
  {
    id: 'reganho',
    label: 'Reganho leve',
    text: 'Reganho leve identificado; reforçar atividade física e revisar plano alimentar.',
  },
  {
    id: 'gi',
    label: 'Sintomas GI',
    text: 'Relato de náuseas ocasionais; orientado fracionamento das refeições.',
  },
  {
    id: 'lab',
    label: 'Lab alterado',
    text: 'Exame laboratorial com alteração relevante; agendar reavaliação clínica.',
  },
]

const MOCK_DICTATIONS: Array<{ text: string; rating: GoalEntryRating }> = [
  {
    text: 'Paciente comparece à consulta apresentando perda ponderal adequada para a fase, refere boa aceitação da dieta hiperproteica e nega episódios de dumping. Suplementação em uso regular.',
    rating: 'adequado',
  },
  {
    text: 'Paciente relata estagnação de peso nas últimas duas semanas, com queixa de ansiedade alimentar no período noturno. Orientado retorno ao acompanhamento psicológico semanal e revisão da meta.',
    rating: 'com_ressalvas',
  },
  {
    text: 'Avaliação pendente: paciente não trouxe os exames solicitados na última consulta. Reagendar com pedido atualizado de B12, ferritina e vitamina D.',
    rating: 'pendente_avaliacao',
  },
]

export default function JourneyEvaluationsPage() {
  const evalStore = usePatientJourneyEvaluationsStore()

  const patientOptions = useMemo(
    () => VIEW_AS_OPTIONS.filter((o) => o.context === 'paciente'),
    [],
  )

  const [selectedId, setSelectedId] = useState(patientOptions[0]?.id ?? '')

  const selectedOption = useMemo<ViewAsOption | null>(
    () => patientOptions.find((o) => o.id === selectedId) ?? null,
    [patientOptions, selectedId],
  )

  const dashboardMock = useMemo(
    () => getPatientDashboardMock(selectedOption),
    [selectedOption],
  )

  const mergedGoal = (goal: GoalItem): GoalItem => {
    const pid = selectedOption?.id
    if (!pid || !goal.entries) return goal
    return {
      ...goal,
      entries: goal.entries.map((e) => {
        const p = evalStore.getPatch(pid, goal.id, e.id)
        if (!p) return e
        return {
          ...e,
          rating: p.rating,
          notes: p.notes,
          evaluator: p.evaluator,
          date: p.evaluatedAt.length >= 10 ? p.evaluatedAt.slice(0, 10) : e.date,
        }
      }),
    }
  }

  const [draftRating, setDraftRating] = useState<GoalEntryRating>('adequado')
  const [draftNotes, setDraftNotes] = useState('')
  const [draftEvaluator, setDraftEvaluator] = useState('Dr. Lucas Lima')
  const [editingKey, setEditingKey] = useState<string | null>(null)

  const [dictationState, setDictationState] = useState<'idle' | 'recording' | 'transcribing'>(
    'idle',
  )
  const [suggestedRating, setSuggestedRating] = useState<GoalEntryRating | null>(null)
  const [dictationCycle, setDictationCycle] = useState(0)
  const dictationTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (dictationTimerRef.current != null) window.clearTimeout(dictationTimerRef.current)
    }
  }, [])

  function clearDictationTimer() {
    if (dictationTimerRef.current != null) {
      window.clearTimeout(dictationTimerRef.current)
      dictationTimerRef.current = null
    }
  }

  function resetDictation() {
    clearDictationTimer()
    setDictationState('idle')
    setSuggestedRating(null)
  }

  function startEdit(goalId: string, entry: GoalProgressEntry) {
    setEditingKey(`${goalId}::${entry.id}`)
    const pid = selectedOption?.id
    const patched = pid ? evalStore.getPatch(pid, goalId, entry.id) : undefined
    setDraftRating(patched?.rating ?? entry.rating)
    setDraftNotes(patched?.notes ?? entry.notes)
    setDraftEvaluator(patched?.evaluator ?? entry.evaluator)
    resetDictation()
  }

  function cancelEdit() {
    setEditingKey(null)
    resetDictation()
  }

  function applyQuickNote(text: string) {
    setDraftNotes((prev) => {
      const trimmed = prev.trim()
      if (!trimmed || trimmed === '—') return text
      return `${trimmed}\n${text}`
    })
  }

  function startDictation() {
    clearDictationTimer()
    setDictationState('recording')
    setSuggestedRating(null)
    dictationTimerRef.current = window.setTimeout(() => {
      setDictationState('transcribing')
      dictationTimerRef.current = window.setTimeout(() => {
        const sample = MOCK_DICTATIONS[dictationCycle % MOCK_DICTATIONS.length]
        setDictationCycle((n) => n + 1)
        setDraftNotes(sample.text)
        setSuggestedRating(sample.rating)
        setDictationState('idle')
      }, 700)
    }, 2400)
  }

  function stopDictationEarly() {
    clearDictationTimer()
    setDictationState('idle')
  }

  function acceptSuggestedRating() {
    if (!suggestedRating) return
    setDraftRating(suggestedRating)
    setSuggestedRating(null)
  }

  function saveEvaluation(goalId: string, entryId: string) {
    const pid = selectedOption?.id
    if (!pid) return
    evalStore.setPatch(pid, goalId, entryId, {
      rating: draftRating,
      notes: draftNotes.trim() || '—',
      evaluator: draftEvaluator.trim() || '—',
      evaluatedAt: new Date().toISOString().slice(0, 10),
    })
    alert('Avaliacao registrada (demo).')
    setEditingKey(null)
    resetDictation()
  }

  function ratingSelectClass(rating: GoalEntryRating) {
    switch (rating) {
      case 'adequado':
        return 'border-emerald-300 bg-emerald-50/80 text-emerald-950 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100'
      case 'com_ressalvas':
        return 'border-amber-300 bg-amber-50/80 text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100'
      case 'pendente_avaliacao':
        return 'border-sky-300 bg-sky-50/80 text-sky-950 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-100'
      default:
        return ''
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-700 dark:text-slate-100">
          Avaliacoes da jornada
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Registre ou atualize avaliacoes por sessao, dia ou item. As alteracoes aparecem no painel
          do paciente e do acompanhante (demo em memoria).
        </p>
        <p className="mt-2 inline-flex flex-wrap items-center gap-2 rounded-lg border border-[#c8a800]/35 bg-[#fffdf5] px-3 py-1.5 text-xs text-slate-600 dark:border-[#FFE14D]/25 dark:bg-[#152754]/60 dark:text-slate-300">
          <span className="font-semibold text-[#9e8500] dark:text-[#FFE14D]">Novo:</span>
          ao avaliar, use o botão{' '}
          <span className="font-medium text-slate-700 dark:text-slate-100">Ditar nota</span>{' '}
          para transcrever a voz em nota clínica, ou os chips de{' '}
          <span className="font-medium text-slate-700 dark:text-slate-100">notas rápidas</span>{' '}
          para inserir observações comuns com um clique.
        </p>
      </div>

      {/* Patient selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">
          Paciente
        </label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          {patientOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name} — {getJourneyLabel(opt.patientJourney ?? null)}
            </option>
          ))}
        </select>
        {selectedOption && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {selectedOption.institution} · {selectedOption.details}
          </p>
        )}
      </div>

      {/* No mock data */}
      {!dashboardMock && (
        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
          Nao ha jornada mockada para este perfil.
        </div>
      )}

      {/* Goals */}
      {dashboardMock &&
        dashboardMock.goals.map((goal) => (
          <div
            key={goal.id}
            className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
              <h2 className="font-semibold text-slate-800 dark:text-slate-100">{goal.title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Referencia: {goal.professional}
              </p>
            </div>
            {!goal.entries?.length ? (
              <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                Sem itens detalhados para avaliacao nesta meta (demo).
              </div>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {mergedGoal(goal).entries!.map((entry) => (
                  <li
                    key={entry.id}
                    className={`py-4 pl-4 pr-4 ${goalEntryRatingRowClass(entry.rating)}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 dark:text-slate-100">
                          {entry.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {entry.date} · {entry.evaluator}
                        </p>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                          {entry.notes}
                        </p>
                        <span
                          className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${goalEntryRatingBadgeClass(entry.rating)}`}
                        >
                          {goalEntryRatingLabel(entry.rating)}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                        onClick={() => startEdit(goal.id, entry)}
                      >
                        Avaliar / editar
                      </button>
                    </div>

                    {/* Inline edit form */}
                    {editingKey === `${goal.id}::${entry.id}` && (
                      <div className="mt-4 space-y-3 rounded-lg border border-[#f3e5a8] bg-[#fffdf5] p-4 dark:border-[#FFE14D]/30 dark:bg-[#0f1834]">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                            Classificacao
                          </label>
                          <select
                            value={draftRating}
                            onChange={(e) =>
                              setDraftRating(e.target.value as GoalEntryRating)
                            }
                            className={`w-full rounded-lg border px-3 py-2 text-sm font-medium ${ratingSelectClass(draftRating)}`}
                          >
                            {ratingOptions.map((r) => (
                              <option key={r} value={r}>
                                {goalEntryRatingLabel(r)}
                              </option>
                            ))}
                          </select>
                          {suggestedRating && suggestedRating !== draftRating && (
                            <div className="mt-2 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 px-2.5 py-1.5 text-xs text-emerald-900 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-100">
                              <span>
                                Sugestão a partir do ditado:{' '}
                                <strong>{goalEntryRatingLabel(suggestedRating)}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={acceptSuggestedRating}
                                className="ml-auto rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-emerald-700"
                              >
                                Aplicar
                              </button>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                            Profissional
                          </label>
                          <input
                            value={draftEvaluator}
                            onChange={(e) => setDraftEvaluator(e.target.value)}
                            type="text"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                          />
                        </div>
                        <div>
                          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                              Notas clinicas / orientacao
                            </label>
                            <button
                              type="button"
                              onClick={
                                dictationState === 'recording'
                                  ? stopDictationEarly
                                  : dictationState === 'transcribing'
                                    ? undefined
                                    : startDictation
                              }
                              disabled={dictationState === 'transcribing'}
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition disabled:opacity-70 ${
                                dictationState === 'recording'
                                  ? 'bg-rose-600 text-white shadow-sm hover:bg-rose-700'
                                  : dictationState === 'transcribing'
                                    ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200'
                                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'
                              }`}
                            >
                              <span
                                className={`relative inline-flex h-2 w-2 rounded-full ${
                                  dictationState === 'recording'
                                    ? 'bg-white'
                                    : dictationState === 'transcribing'
                                      ? 'bg-slate-500'
                                      : 'bg-rose-500'
                                }`}
                              >
                                {dictationState === 'recording' && (
                                  <span className="absolute inset-0 animate-ping rounded-full bg-white/80" />
                                )}
                              </span>
                              {dictationState === 'recording'
                                ? 'Gravando — toque para parar'
                                : dictationState === 'transcribing'
                                  ? 'Transcrevendo…'
                                  : 'Ditar nota'}
                            </button>
                          </div>

                          <div className="mb-2 flex flex-wrap gap-1.5">
                            <span className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Notas rápidas:
                            </span>
                            {QUICK_NOTES.map((note) => (
                              <button
                                key={note.id}
                                type="button"
                                onClick={() => applyQuickNote(note.text)}
                                className="rounded-full border border-slate-300 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                              >
                                + {note.label}
                              </button>
                            ))}
                          </div>

                          {dictationState !== 'idle' && (
                            <div className="mb-2 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50/70 px-3 py-2 text-xs text-rose-900 dark:border-rose-800/50 dark:bg-rose-950/30 dark:text-rose-100">
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500">
                                {dictationState === 'recording' && (
                                  <span className="absolute inset-0 animate-ping rounded-full bg-rose-500/80" />
                                )}
                              </span>
                              {dictationState === 'recording'
                                ? 'Ouvindo — fale livremente; o texto será transcrito automaticamente.'
                                : 'Transcrevendo o áudio em nota clínica…'}
                            </div>
                          )}

                          <textarea
                            value={draftNotes}
                            onChange={(e) => setDraftNotes(e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="rounded-lg bg-[#FFE14D] px-4 py-2 text-sm font-semibold text-slate-800 hover:brightness-95"
                            onClick={() => saveEvaluation(goal.id, entry.id)}
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 dark:border-slate-600 dark:text-slate-300"
                            onClick={cancelEdit}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
    </section>
  )
}
