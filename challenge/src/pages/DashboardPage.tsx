import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Users,
} from 'lucide-react'
import ExpandableDetailRow from '@/components/journey/ExpandableDetailRow'
import ExpandableGoalCard from '@/components/journey/ExpandableGoalCard'
import { useViewAs } from '@/hooks/useViewAs'
import {
  buildPatientMoments,
  examStatusLabel,
  getCompanionPhaseCards,
  getJourneyLabel,
  getPatientDashboardMock,
  resolvePatientJourneyType,
  type ExamStatus,
  type GoalItem,
  type GoalProgressEntry,
  type JourneyMoment,
} from '@/constants/patient-journey-content'
import { evaluationSubjectProfileId } from '@/constants/view-as'
import { dashboardService } from '@/services/dashboard.service'
import { surgeriesService } from '@/services/surgeries.service'
import { useAlertsStore, selectCriticalCount } from '@/stores/alerts.store'
import { usePatientJourneyEvaluationsStore } from '@/stores/patient-journey-evaluations.store'
import type { Alert } from '@/types/alert'
import type { DashboardSummary, RiskLevel, Surgery, SurgeryStatus } from '@/types/surgery'

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [surgeries, setSurgeries] = useState<Surgery[]>([])
  const [loading, setLoading] = useState(true)

  const alertItems = useAlertsStore((s) => s.items)
  const fetchAlerts = useAlertsStore((s) => s.fetchAlerts)
  const criticalCount = useAlertsStore(selectCriticalCount)

  const evalGetPatch = usePatientJourneyEvaluationsStore((s) => s.getPatch)

  const { currentContext, activeViewAs, canModule } = useViewAs()

  const isCompanionContext = currentContext === 'acompanhante'
  const isPatientContext = currentContext === 'paciente'
  const showOperationalDashboard = !isCompanionContext && !isPatientContext

  const linkedPatientName = useMemo(
    () => activeViewAs?.linkedPatientDisplayName ?? activeViewAs?.name ?? 'Paciente vinculado',
    [activeViewAs],
  )

  const patientMock = useMemo(() => getPatientDashboardMock(activeViewAs ?? null), [activeViewAs])

  const showPatientJourneyPanel = useMemo(
    () => (isPatientContext || isCompanionContext) && Boolean(patientMock),
    [isPatientContext, isCompanionContext, patientMock],
  )

  const journeyLabel = useMemo(() => {
    const j = resolvePatientJourneyType(activeViewAs ?? null)
    return j ? getJourneyLabel(j) : ''
  }, [activeViewAs])

  const journeyHeroTitle = useMemo(() => {
    if (isPatientContext) return patientMock?.titleFirstPerson ?? ''
    return `Jornada de ${linkedPatientName}`
  }, [isPatientContext, patientMock, linkedPatientName])

  const journeyHeroSubtitle = useMemo(() => {
    if (isPatientContext) return patientMock?.subtitleFirstPerson ?? ''
    return `Metas, avaliações e orientações da equipe sobre ${linkedPatientName}.`
  }, [isPatientContext, patientMock, linkedPatientName])

  const journeyEyebrow = useMemo(
    () => (isPatientContext ? 'Sua jornada' : 'Jornada acompanhada'),
    [isPatientContext],
  )

  const journeyCarouselRef = useRef<HTMLDivElement | null>(null)
  const [journeySlideIndex, setJourneySlideIndex] = useState(0)

  const journeySlideStepLabel = useMemo(
    () => (journeySlideIndex === 0 ? journeyEyebrow : 'Acompanhamento'),
    [journeySlideIndex, journeyEyebrow],
  )

  const journeySlideDescription = useMemo(() => {
    if (journeySlideIndex === 0) {
      return isPatientContext
        ? 'Visão geral e etapas da sua jornada'
        : 'Visão geral da jornada do paciente'
    }
    return isPatientContext
      ? 'Metas e exames — toque para ver detalhes e avaliações'
      : `Metas e exames de ${linkedPatientName}`
  }, [journeySlideIndex, isPatientContext, linkedPatientName])

  const goJourneySlide = useCallback(
    (index: 0 | 1) => {
      const el = journeyCarouselRef.current
      if (!el) {
        setJourneySlideIndex(index)
        return
      }
      const w = el.clientWidth
      el.scrollTo({ left: index * w, behavior: 'smooth' })
      setJourneySlideIndex(index)
    },
    [],
  )

  const onJourneyCarouselScroll = useCallback(() => {
    const el = journeyCarouselRef.current
    if (!el) return
    const w = el.clientWidth
    if (w <= 0) return
    const i = Math.round(el.scrollLeft / w)
    setJourneySlideIndex(Math.min(1, Math.max(0, i)))
  }, [])

  // Reset carousel when activeViewAs changes
  const prevViewAsRef = useRef(activeViewAs)
  useEffect(() => {
    if (prevViewAsRef.current !== activeViewAs) {
      prevViewAsRef.current = activeViewAs
      setJourneySlideIndex(0)
      journeyCarouselRef.current?.scrollTo({ left: 0 })
    }
  }, [activeViewAs])

  const patientGoals = useMemo(() => patientMock?.goals ?? [], [patientMock])

  const journeyProfileId = useMemo(
    () => evaluationSubjectProfileId(activeViewAs ?? null) ?? '',
    [activeViewAs],
  )

  const mergedGoals = useMemo(() => {
    const mock = patientMock
    const pid = journeyProfileId
    if (!mock?.goals || !pid) return []
    return mock.goals.map((g: GoalItem) => ({
      ...g,
      entries: g.entries?.map((e: GoalProgressEntry) => {
        const p = evalGetPatch(pid, g.id, e.id)
        if (!p) return e
        return {
          ...e,
          rating: p.rating,
          notes: p.notes,
          evaluator: p.evaluator,
          date: p.evaluatedAt.length >= 10 ? p.evaluatedAt.slice(0, 10) : e.date,
        }
      }),
    }))
  }, [patientMock, journeyProfileId, evalGetPatch])

  const hasJourneyFollowUpContent = useMemo(
    () => mergedGoals.length > 0 || Boolean(patientMock?.exams?.length),
    [mergedGoals, patientMock],
  )

  const goalProgressPrefix = useMemo(
    () => (isCompanionContext ? 'Está em' : 'Você está em'),
    [isCompanionContext],
  )

  function normalizePersonName(s: string) {
    return s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
  }

  const patientCareDisplayName = useMemo(() => {
    if (activeViewAs?.context === 'paciente') return activeViewAs.name
    if (activeViewAs?.context === 'acompanhante') return activeViewAs.linkedPatientDisplayName
    return null
  }, [activeViewAs])

  const patientCareSurgery = useMemo(() => {
    const name = patientCareDisplayName
    if (!name || (!isPatientContext && !isCompanionContext)) return null
    const n = normalizePersonName(name)
    return surgeries.find((row: Surgery) => normalizePersonName(row.patient_name) === n) ?? null
  }, [patientCareDisplayName, isPatientContext, isCompanionContext, surgeries])

  const patientCareStatus = useMemo<SurgeryStatus>(
    () => patientCareSurgery?.status ?? 'SCHEDULED',
    [patientCareSurgery],
  )
  const patientCareMatched = useMemo(() => Boolean(patientCareSurgery), [patientCareSurgery])

  const overallProgress = useMemo(() => {
    const goals = patientGoals
    if (goals.length === 0) return 0
    const percentage =
      goals.reduce(
        (acc: number, goal: GoalItem) => acc + Math.min(100, (goal.current / goal.target) * 100),
        0,
      ) / goals.length
    return Math.round(percentage)
  }, [patientGoals])

  const patientJourneyType = useMemo(
    () => resolvePatientJourneyType(activeViewAs ?? null),
    [activeViewAs],
  )

  const patientMoments = useMemo(() => {
    const journey = patientJourneyType
    if (!journey) return []
    return buildPatientMoments(journey, patientCareStatus, overallProgress, patientCareMatched)
  }, [patientJourneyType, patientCareStatus, overallProgress, patientCareMatched])

  const journeyFocusMoment = useMemo(
    () => patientMoments.find((m: JourneyMoment) => m.status === 'Em foco agora') ?? null,
    [patientMoments],
  )

  const journeyIsComplete = useMemo(
    () =>
      patientMoments.length > 0 &&
      patientMoments.every((m: JourneyMoment) => m.status === 'Concluído'),
    [patientMoments],
  )

  function journeyStepIndex(moment: JourneyMoment) {
    return patientMoments.indexOf(moment) + 1
  }

  function journeyStepRingClass(moment: JourneyMoment) {
    if (moment.status === 'Em foco agora') {
      return 'bg-[#FFE14D] text-slate-900 ring-4 ring-[#FFE14D]/35 shadow-lg'
    }
    if (moment.status === 'Concluído') {
      return 'bg-emerald-500/90 text-white dark:bg-emerald-600'
    }
    return 'border-2 border-dashed border-slate-300 bg-white text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
  }

  const surgeryPhase = useMemo<SurgeryStatus>(
    () => surgeries[0]?.status ?? 'SCHEDULED',
    [surgeries],
  )

  const companionJourney = useMemo(
    () => activeViewAs?.linkedPatientJourney ?? null,
    [activeViewAs],
  )

  const phaseCards = useMemo(
    () => getCompanionPhaseCards(companionJourney, surgeryPhase),
    [companionJourney, surgeryPhase],
  )

  function examBadgeClass(status: ExamStatus) {
    return status === 'ok'
      ? 'bg-success-100 text-success-800 dark:bg-success-900/40 dark:text-success-200'
      : status === 'pending'
        ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
        : 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-200'
  }

  function capitalizePt(s: string) {
    if (!s) return s
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  const agendaDateLong = useMemo(
    () =>
      capitalizePt(
        new Intl.DateTimeFormat('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date()),
      ),
    [],
  )

  function formatAgendaTime(iso: string) {
    return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(
      new Date(iso),
    )
  }

  function surgeryStatusLabelPt(status: SurgeryStatus): string {
    const m: Record<SurgeryStatus, string> = {
      REQUESTED: 'Solicitada',
      APPROVED: 'Aprovada',
      SCHEDULED: 'Agendada',
      ADMITTED: 'Internação',
      IN_SURGERY: 'Em cirurgia',
      IN_RECOVERY: 'Em recuperação',
      DISCHARGED: 'Alta',
      COMPLICATION: 'Complicação',
      CANCELLED: 'Cancelada',
    }
    return m[status] ?? status
  }

  function riskLabelPt(level: RiskLevel): string {
    const m: Record<RiskLevel, string> = {
      baixo: 'baixo',
      medio: 'médio',
      alto: 'alto',
      critico: 'crítico',
    }
    return m[level] ?? level
  }

  function surgeryStatusPillClass(status: SurgeryStatus): string {
    switch (status) {
      case 'IN_SURGERY':
        return 'bg-[#FFE14D]/25 text-[#7a6200] dark:bg-[#FFE14D]/20 dark:text-[#FFE14D]'
      case 'IN_RECOVERY':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
      case 'COMPLICATION':
        return 'bg-error-100 text-error-800 dark:bg-error-900/40 dark:text-error-200'
      case 'CANCELLED':
        return 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
    }
  }

  const sortedAgendaSurgeries = useMemo(
    () =>
      [...surgeries].sort(
        (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
      ),
    [surgeries],
  )

  const openCriticalAlerts = useMemo(
    () => alertItems.filter((a: Alert) => a.severity === 'CRITICAL' && !a.resolved_at),
    [alertItems],
  )

  const openWarningAlerts = useMemo(
    () => alertItems.filter((a: Alert) => a.severity === 'WARNING' && !a.resolved_at),
    [alertItems],
  )

  function alertRelativeHint(alert: Alert) {
    const t = new Date(alert.created_at).getTime()
    const diffMin = Math.round((Date.now() - t) / 60000)
    if (diffMin < 1) return 'agora'
    if (diffMin < 60) return `há ${diffMin} min`
    const h = Math.floor(diffMin / 60)
    if (h < 24) return `há ${h} h`
    return formatAgendaTime(alert.created_at)
  }

  // Data fetching on mount
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([dashboardService.summary(), surgeriesService.list(), fetchAlerts()])
      .then(([s, list]) => {
        if (cancelled) return
        setSummary(s)
        setSurgeries(list)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [fetchAlerts])

  return (
    <section className="min-w-0 space-y-6">
      {/* ============================================================ */}
      {/* PATIENT / COMPANION JOURNEY PANEL                            */}
      {/* ============================================================ */}
      {showPatientJourneyPanel && patientMock && (
        <div className="min-w-0 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9e8500] dark:text-[#FFE14D]/90">
                {journeySlideStepLabel}
              </p>
              <p className="mt-1 text-sm leading-snug text-slate-600 dark:text-slate-400">
                {journeySlideDescription}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`h-1.5 w-8 rounded-full transition-colors ${
                    journeySlideIndex === 0 ? 'bg-[#FFE14D]' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                  aria-hidden="true"
                />
                <span
                  className={`h-1.5 w-8 rounded-full transition-colors ${
                    journeySlideIndex === 1 ? 'bg-[#FFE14D]' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                  aria-hidden="true"
                />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {journeySlideIndex === 1 && (
                <button
                  type="button"
                  className="rounded-full p-2 text-[#0f2743] transition hover:bg-black/5 dark:text-[#FFE14D] dark:hover:bg-white/10"
                  aria-label="Voltar para a visão geral da jornada"
                  onClick={() => goJourneySlide(0)}
                >
                  <ChevronLeft className="h-6 w-6" strokeWidth={2} />
                </button>
              )}
              {journeySlideIndex === 0 && (
                <button
                  type="button"
                  className="rounded-full p-2 text-[#0f2743] transition hover:bg-black/5 dark:text-[#FFE14D] dark:hover:bg-white/10"
                  aria-label="Ir para acompanhamento: metas e exames"
                  onClick={() => goJourneySlide(1)}
                >
                  <ChevronRight className="h-6 w-6" strokeWidth={2} />
                </button>
              )}
            </div>
          </div>

          {/* Carousel container */}
          <div className="min-w-0 max-w-full overflow-x-hidden">
            <div
              ref={journeyCarouselRef}
              className="flex min-h-0 min-w-0 w-full max-w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onScroll={onJourneyCarouselScroll}
            >
              {/* Slide 0: Journey overview */}
              <div className="box-border min-w-0 max-w-full flex-[0_0_100%] snap-start overflow-x-hidden pb-2">
                {patientMoments.length > 0 ? (
                  <div className="space-y-6">
                    <div className="relative pt-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h2 className="text-xl font-semibold leading-snug text-[#0f2743] dark:text-white sm:text-2xl">
                          {journeyHeroTitle}
                        </h2>
                        {journeyLabel && (
                          <span className="rounded-full border border-[#c8a800]/40 bg-white/80 px-3 py-0.5 text-[11px] font-semibold text-[#0f2743] backdrop-blur-sm dark:border-[#FFE14D]/35 dark:bg-[#152754]/90 dark:text-[#FFE14D]">
                            {journeyLabel}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {journeyHeroSubtitle}
                      </p>
                      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                        <span className="shrink-0 text-sm font-medium text-slate-700 dark:text-slate-200">
                          Progresso geral
                        </span>
                        <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-md">
                          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/80">
                            <div
                              className="h-full rounded-full bg-[#FFE14D] transition-all duration-500 dark:bg-[#FFE14D]"
                              style={{ width: `${overallProgress}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold tabular-nums text-[#0f2743] dark:text-[#FFE14D]">
                            {overallProgress}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Focus moment highlight */}
                    <div>
                      {journeyFocusMoment ? (
                        <div className="rounded-xl border-2 border-[#FFE14D]/55 bg-white/90 p-5 shadow-md dark:border-[#FFE14D]/40 dark:bg-slate-900/85 dark:shadow-none">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9e8500] dark:text-[#FFE14D]">
                            Momento em destaque
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-slate-800 dark:text-white">
                            {journeyFocusMoment.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                            {journeyFocusMoment.description}
                          </p>
                        </div>
                      ) : journeyIsComplete ? (
                        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 p-5 dark:border-emerald-800/50 dark:bg-emerald-950/40">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                            Etapas principais concluídas
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-emerald-950 dark:text-emerald-100">
                            Você avançou nesta fase
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-emerald-900/90 dark:text-emerald-200/90">
                            As etapas centrais da sua jornada aqui estão registradas como
                            concluídas. Continue seguindo o plano da sua equipe e use o
                            painel de acompanhamento para metas e orientações.
                          </p>
                        </div>
                      ) : null}
                    </div>

                    {/* Journey steps */}
                    <div className="border-t border-slate-200/80 pt-6 dark:border-slate-700/80">
                      <p className="mb-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Como está organizada sua jornada
                      </p>
                      <div className="flex flex-col gap-5 md:flex-row md:items-stretch md:gap-4">
                        {patientMoments.map((moment) => (
                          <div
                            key={moment.id}
                            className={`flex flex-1 flex-col rounded-xl border border-slate-200/90 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/60 ${
                              moment.status === 'Em foco agora'
                                ? 'ring-2 ring-[#FFE14D]/50 dark:ring-[#FFE14D]/35'
                                : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-shadow ${journeyStepRingClass(moment)}`}
                              >
                                {journeyStepIndex(moment)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-800 dark:text-slate-100">
                                  {moment.title}
                                </p>
                                <p
                                  className={`mt-1 text-[11px] font-semibold uppercase tracking-wide ${
                                    moment.status === 'Em foco agora'
                                      ? 'text-[#9e8500] dark:text-[#FFE14D]'
                                      : moment.status === 'Concluído'
                                        ? 'text-emerald-700 dark:text-emerald-400'
                                        : 'text-slate-500 dark:text-slate-400'
                                  }`}
                                >
                                  {moment.status}
                                </p>
                                {moment.status !== 'Em foco agora' ? (
                                  <p className="mt-2 text-sm leading-snug text-slate-600 dark:text-slate-400">
                                    {moment.description}
                                  </p>
                                ) : (
                                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">
                                    Veja o destaque acima para mais detalhes.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
                    Visão geral da jornada indisponível para este perfil. Use a seta para
                    ver o acompanhamento, se houver itens.
                  </div>
                )}
              </div>

              {/* Slide 1: Follow-up (goals + exams) */}
              <div className="box-border min-w-0 max-w-full flex-[0_0_100%] snap-start overflow-x-hidden pb-6">
                <div className="space-y-4">
                  {mergedGoals.length > 0 && (
                    <div className="grid gap-4 lg:grid-cols-3">
                      {mergedGoals.map((goal) => (
                        <ExpandableGoalCard
                          key={goal.id}
                          goal={goal}
                          progressPrefix={goalProgressPrefix}
                        />
                      ))}
                    </div>
                  )}

                  {patientMock?.exams?.length ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                      <h3 className="mb-2 text-base font-semibold text-slate-700 dark:text-slate-100">
                        Exames e critérios acompanhados pela equipe
                      </h3>
                      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                        Informação ilustrativa para demo; decisões clínicas são sempre da equipe.
                      </p>
                      <ul>
                        {patientMock.exams.map((exam) => (
                          <ExpandableDetailRow
                            key={exam.id}
                            title={exam.name}
                            badge={examStatusLabel(exam.status)}
                            badgeClass={examBadgeClass(exam.status)}
                            summary={exam.detail?.summary}
                            criteria={exam.detail?.criteria}
                            meta={
                              exam.detail
                                ? `${exam.detail.lastEvaluatedAt !== '—' ? exam.detail.lastEvaluatedAt + ' · ' : ''}${exam.detail.evaluator}`
                                : undefined
                            }
                          />
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {!hasJourneyFollowUpContent && (
                    <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
                      Nenhum item de acompanhamento nesta demo para este perfil.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* COMPANION: phase cards + alerts                               */}
      {/* ============================================================ */}
      {isCompanionContext && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-100">
            Acompanhamento de {linkedPatientName}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Visão resumida do acompanhamento, preparação e recuperação pós-cirurgia
            bariátrica — conforme o perfil vinculado.
          </p>
        </div>
      )}

      {isCompanionContext && (
        <div className="grid gap-4 lg:grid-cols-3">
          {phaseCards.map((phaseCard) => (
            <article
              key={phaseCard.key}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700 dark:text-slate-100">
                  {phaseCard.title}
                </h3>
                <span className="rounded-full bg-[#FFE14D]/40 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-100">
                  {phaseCard.status}
                </span>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {phaseCard.details.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}

      {isCompanionContext && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-3 text-base font-semibold text-slate-700 dark:text-slate-100">
            Alertas do paciente
          </h3>
          {alertItems.length === 0 ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Nenhum alerta relevante no momento.
            </div>
          ) : (
            <div className="space-y-2">
              {alertItems.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
                >
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-100">
                    {alert.message}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{alert.severity}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* OPERATIONAL DASHBOARD (equipe_cirurgia)                      */}
      {/* ============================================================ */}
      {showOperationalDashboard && (
        <div className="space-y-6">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              Carregando painel...
            </div>
          ) : (
            <>
              {/* Hero header with summary cards */}
              <div className="overflow-hidden rounded-2xl border border-[#f3e5a8]/80 bg-gradient-to-br from-[#fff9e8] via-white to-[#fffdf5] shadow-sm dark:border-[#1b2747] dark:from-[#0a1332] dark:via-[#07122E] dark:to-[#0f1834]">
                <div className="flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-8 sm:py-8">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9e8500] dark:text-[#FFE14D]/90">
                      Equipe · Painel bariátrico
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[#0f2743] dark:text-white">
                      <Calendar
                        className="h-6 w-6 shrink-0 text-[#9e8500] dark:text-[#FFE14D]"
                        strokeWidth={1.75}
                      />
                      <h1 className="text-xl font-semibold leading-tight sm:text-2xl">
                        Painel operacional
                      </h1>
                    </div>
                    <p className="mt-2 text-sm capitalize text-slate-600 dark:text-slate-300">
                      {agendaDateLong}
                    </p>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      Acompanhe pacientes em pré e pós-operatório, cirurgias agendadas,
                      alertas de reganho de peso e exames pendentes. Jornadas e metas dos pacientes
                      ficam em{' '}
                      <span className="font-medium text-[#0f2743] dark:text-[#FFE14D]/90">
                        Avaliações da jornada
                      </span>{' '}
                      quando disponível ao seu perfil.
                    </p>
                  </div>
                  {summary && (
                    <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:min-w-[280px]">
                      <div className="rounded-xl border border-[#c8a800]/25 bg-white/90 px-3 py-2.5 dark:border-[#FFE14D]/20 dark:bg-[#152754]/80">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Pré-op
                        </p>
                        <p className="mt-0.5 text-lg font-semibold tabular-nums text-[#0f2743] dark:text-[#FFE14D]">
                          {summary.patients_pre_op}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Pacientes</p>
                      </div>
                      <div className="rounded-xl border border-[#c8a800]/25 bg-white/90 px-3 py-2.5 dark:border-[#FFE14D]/20 dark:bg-[#152754]/80">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Pós-op
                        </p>
                        <p className="mt-0.5 text-lg font-semibold tabular-nums text-[#0f2743] dark:text-[#FFE14D]">
                          {summary.patients_post_op}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Pacientes</p>
                      </div>
                      <div className="rounded-xl border border-[#c8a800]/25 bg-white/90 px-3 py-2.5 dark:border-[#FFE14D]/20 dark:bg-[#152754]/80">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Agendadas
                        </p>
                        <p className="mt-0.5 text-lg font-semibold tabular-nums text-[#0f2743] dark:text-[#FFE14D]">
                          {summary.surgeries_scheduled}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Cirurgias</p>
                      </div>
                      <div className="rounded-xl border border-error-200/80 bg-error-50/90 px-3 py-2.5 dark:border-error-800/50 dark:bg-error-950/50">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-error-700 dark:text-error-300">
                          Reganho
                        </p>
                        <p className="mt-0.5 text-lg font-semibold tabular-nums text-error-700 dark:text-error-200">
                          {summary.weight_regain_alerts}
                        </p>
                        <p className="text-[11px] text-error-600/90 dark:text-error-300/80">
                          Alertas
                        </p>
                      </div>
                      <div className="rounded-xl border border-error-300/80 bg-white/90 px-3 py-2.5 dark:border-error-800/40 dark:bg-[#152754]/80">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-error-700 dark:text-error-300">
                          Exames
                        </p>
                        <p className="mt-0.5 text-lg font-semibold tabular-nums text-error-700 dark:text-error-200">
                          {summary.pending_exams}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Pendentes</p>
                      </div>
                      <div className="rounded-xl border border-error-300/80 bg-white/90 px-3 py-2.5 dark:border-error-800/40 dark:bg-[#152754]/80">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-error-700 dark:text-error-300">
                          Críticos
                        </p>
                        <p className="mt-0.5 text-lg font-semibold tabular-nums text-error-700 dark:text-error-200">
                          {criticalCount}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Abertos</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick links */}
              <div className="flex flex-wrap gap-2">
                {canModule('pacientes') && (
                  <Link
                    to="/app/patients"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    <Users className="h-4 w-4 shrink-0 opacity-70" strokeWidth={2} />
                    Pacientes
                    <ArrowRight className="h-4 w-4 opacity-70" />
                  </Link>
                )}
                {canModule('alertas') && (
                  <Link
                    to="/app/alerts"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0 opacity-70" strokeWidth={2} />
                    Alertas
                    <ArrowRight className="h-4 w-4 opacity-70" />
                  </Link>
                )}
                {canModule('orientacoes') && (
                  <Link
                    to="/app/orientations"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    <BookOpen className="h-4 w-4 shrink-0 opacity-70" strokeWidth={2} />
                    Orientações
                    <ArrowRight className="h-4 w-4 opacity-70" />
                  </Link>
                )}
                {canModule('pacientes') && (
                  <Link
                    to="/app/journey-evaluations"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#c8a800]/40 bg-[#fffdf5] px-3 py-2 text-sm font-medium text-[#0f2743] transition hover:bg-[#fff4c4] dark:border-[#FFE14D]/35 dark:bg-[#152754]/90 dark:text-[#FFE14D] dark:hover:bg-[#1a3158]"
                  >
                    <ClipboardList className="h-4 w-4 shrink-0" strokeWidth={2} />
                    Avaliações da jornada
                    <ArrowRight className="h-4 w-4 opacity-70" />
                  </Link>
                )}
              </div>

              {/* Critical alerts panel */}
              {openCriticalAlerts.length > 0 && (
                <div className="rounded-xl border border-error-200 bg-error-50/80 p-4 dark:border-error-900/50 dark:bg-error-950/35">
                  <div className="flex items-center gap-2 text-error-800 dark:text-error-200">
                    <AlertTriangle className="h-5 w-5 shrink-0" strokeWidth={2} />
                    <h2 className="text-base font-semibold">Atenção imediata</h2>
                  </div>
                  <p className="mt-1 text-sm text-error-800/90 dark:text-error-200/85">
                    Alertas críticos abertos — priorize checagem e registro no
                    detalhe do paciente.
                  </p>
                  <ul className="mt-3 space-y-2">
                    {openCriticalAlerts.map((alert) => (
                      <li key={alert.id}>
                        <Link
                          to={`/app/patients/${alert.surgery_id}`}
                          className="flex flex-col gap-0.5 rounded-lg border border-error-200/80 bg-white/90 px-3 py-2.5 transition hover:bg-white dark:border-error-800/40 dark:bg-[#0f1834] dark:hover:bg-[#152754]"
                        >
                          <span className="font-medium text-slate-800 dark:text-slate-100">
                            {alert.patient_name}
                          </span>
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            {alert.message}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {alertRelativeHint(alert)} · ver detalhes
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warning alerts panel */}
              {openWarningAlerts.length > 0 && (
                <div className="rounded-xl border border-warning-200 bg-warning-50/60 p-4 dark:border-warning-800/40 dark:bg-warning-950/25">
                  <h2 className="text-base font-semibold text-warning-900 dark:text-warning-200">
                    Avisos ativos
                  </h2>
                  <ul className="mt-2 space-y-2">
                    {openWarningAlerts.map((alert) => (
                      <li key={alert.id}>
                        <Link
                          to={`/app/patients/${alert.surgery_id}`}
                          className="flex flex-col gap-0.5 rounded-lg border border-warning-200/80 bg-white/80 px-3 py-2 dark:border-warning-800/30 dark:bg-slate-900/80"
                        >
                          <span className="font-medium text-slate-800 dark:text-slate-100">
                            {alert.patient_name}
                          </span>
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            {alert.message}
                          </span>
                          <span className="text-xs text-slate-500">
                            {alertRelativeHint(alert)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Patient list sorted by schedule */}
              <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-700 sm:px-5">
                  <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    Pacientes por horário
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Horários previstos de início; status atual do paciente. Toque
                    para abrir o detalhe.
                  </p>
                </div>

                {sortedAgendaSurgeries.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400 sm:px-5">
                    Nenhum paciente na lista para exibir.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sortedAgendaSurgeries.map((surgery) => (
                      <Link
                        key={surgery.id}
                        to={`/app/patients/${surgery.id}`}
                        className="flex gap-3 px-4 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:gap-4 sm:px-5"
                      >
                        <div className="w-14 shrink-0 text-right sm:w-16">
                          <p className="text-base font-semibold tabular-nums text-[#9e8500] dark:text-[#FFE14D]">
                            {formatAgendaTime(surgery.scheduled_at)}
                          </p>
                          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            Previsto
                          </p>
                        </div>
                        <div className="relative min-w-0 flex-1 border-l-2 border-slate-200 pl-4 dark:border-slate-600">
                          <span
                            className="absolute -left-[5px] top-2 h-2 w-2 rounded-full bg-[#FFE14D] ring-4 ring-[#FFE14D]/20 dark:ring-[#FFE14D]/15"
                            aria-hidden="true"
                          />
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 dark:text-slate-100">
                                {surgery.patient_name}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${surgeryStatusPillClass(surgery.status)}`}
                            >
                              {surgeryStatusLabelPt(surgery.status)}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            Risco {riskLabelPt(surgery.risk_level)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}
