import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useViewAs } from '@/hooks/useViewAs'
import { patientsService } from '@/services/patients.service'
import type { Patient } from '@/types/patient'

type Companion = {
  id: number
  patientId: number
  name: string
  email: string
}

const COMPANIONS_STORAGE_KEY = 'omni-vital-demo-companions'

function loadCompanionsFromStorage(): Companion[] {
  try {
    const raw = localStorage.getItem(COMPANIONS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Companion[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistCompanions(list: Companion[]) {
  try {
    localStorage.setItem(COMPANIONS_STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

export default function PatientsPage() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState<Patient[]>([])
  const [companions, setCompanions] = useState<Companion[]>([])

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'edit' | 'companions'>('list')
  const [editingPatientId, setEditingPatientId] = useState<number | null>(null)
  const [companionsPatientId, setCompanionsPatientId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [perPage, setPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const [addForm, setAddForm] = useState({
    profile: 'paciente' as 'paciente' | 'acompanhante',
    name: '',
    email: '',
    linkedPatientId: null as number | null,
  })

  const [newCompanionForPatientForm, setNewCompanionForPatientForm] = useState({
    name: '',
    email: '',
  })

  const [editForm, setEditForm] = useState({
    id: 0,
    name: '',
    risk_level: 'baixo' as Patient['risk_level'],
    bmi: 0,
  })

  const viewAs = useViewAs()
  const isMedicalTeam = useMemo(() => viewAs.currentContext === 'equipe_cirurgia', [viewAs.currentContext])

  useEffect(() => {
    patientsService.list().then(setPatients)
    const stored = loadCompanionsFromStorage()
    if (stored.length > 0) {
      setCompanions(stored)
    } else {
      const defaults: Companion[] = [
        { id: 1, patientId: 1, name: 'Ana Souza', email: 'ana@email.com' },
        { id: 2, patientId: 2, name: 'Carlos Oliveira', email: 'carlos@email.com' },
        { id: 3, patientId: 3, name: 'Roberta Lima', email: 'roberta@email.com' },
      ]
      setCompanions(defaults)
      persistCompanions(defaults)
    }
  }, [])

  // Sync addForm.linkedPatientId when profile or patients change
  useEffect(() => {
    if (addForm.profile === 'paciente') {
      setAddForm((prev) => ({ ...prev, linkedPatientId: null }))
    } else if (patients.length > 0) {
      const ok = patients.some((x) => x.id === addForm.linkedPatientId)
      if (!ok) setAddForm((prev) => ({ ...prev, linkedPatientId: patients[0].id }))
    }
  }, [addForm.profile, patients.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const inviteLink = (email: string) =>
    `${window.location.origin}/ativar-acesso?email=${encodeURIComponent(email)}`

  function pushCompanion(patientId: number, name: string, email: string) {
    const row: Companion = { id: Date.now(), patientId, name, email }
    const updated = [row, ...companions]
    setCompanions(updated)
    persistCompanions(updated)
  }

  const submitAdd = () => {
    if (!addForm.name || !addForm.email) {
      alert('Preencha nome e e-mail para enviar o convite.')
      return
    }

    if (addForm.profile === 'paciente') {
      setPatients((prev) => [
        {
          id: Date.now(),
          name: addForm.name,
          birth_date: new Date().toISOString().slice(0, 10),
          weight: 0,
          height: 0,
          bmi: 0,
          risk_level: 'baixo',
          status: 'REQUESTED',
          initial_weight: 0,
          target_weight: 0,
        },
        ...prev,
      ])
    } else {
      if (addForm.linkedPatientId == null) {
        alert('Selecione o paciente ao qual este acompanhante sera vinculado.')
        return
      }
      const patient = patients.find((p) => p.id === addForm.linkedPatientId)
      if (!patient) {
        alert('Paciente invalido.')
        return
      }
      pushCompanion(patient.id, addForm.name.trim(), addForm.email.trim())
    }

    alert(`Convite enviado para ${addForm.email}. Link: ${inviteLink(addForm.email)}`)
    setAddForm({ profile: 'paciente', name: '', email: '', linkedPatientId: null })
  }

  const submitNewCompanionForPatient = () => {
    if (!companionsPatient) return
    const name = newCompanionForPatientForm.name.trim()
    const email = newCompanionForPatientForm.email.trim()
    if (!name || !email) {
      alert('Preencha nome e e-mail do acompanhante.')
      return
    }
    pushCompanion(companionsPatient.id, name, email)
    alert(`Acompanhante vinculado a ${companionsPatient.name}. Convite: ${inviteLink(email)}`)
    setNewCompanionForPatientForm({ name: '', email: '' })
  }

  const sendPatientRegistrationEmail = () => {
    if (!addForm.email) {
      alert('Preencha o e-mail do paciente.')
      return
    }
    alert('E-mail enviado com sucesso')
  }

  const companionsByPatientId = useMemo(() => {
    const map: Record<number, Companion[]> = {}
    for (const c of companions) {
      if (!map[c.patientId]) map[c.patientId] = []
      map[c.patientId].push(c)
    }
    return map
  }, [companions])

  function companionsForPatient(patientId: number): Companion[] {
    return companionsByPatientId[patientId] ?? []
  }

  const filteredPatients = useMemo(() => {
    const term = searchQuery.trim().toLowerCase()
    return patients.filter((patient) => {
      return !term || `${patient.name} ${patient.risk_level}`.toLowerCase().includes(term)
    })
  }, [patients, searchQuery])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredPatients.length / perPage)),
    [filteredPatients.length, perPage],
  )

  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * perPage
    const end = start + perPage
    return filteredPatients.slice(start, end)
  }, [filteredPatients, currentPage, perPage])

  const pageLabel = useMemo(() => {
    if (filteredPatients.length === 0) return 'Mostrando 0-0 de 0'
    const start = (currentPage - 1) * perPage + 1
    const end = Math.min(filteredPatients.length, start + perPage - 1)
    return `Mostrando ${start}-${end} de ${filteredPatients.length}`
  }, [filteredPatients.length, currentPage, perPage])

  const openEditTab = (patient: Patient) => {
    setEditingPatientId(patient.id)
    setEditForm({
      id: patient.id,
      name: patient.name,
      risk_level: patient.risk_level,
      bmi: patient.bmi,
    })
    setActiveTab('edit')
  }

  const openPatientDetail = (patient: Patient) => {
    navigate(`/app/patients/${patient.id}`)
  }

  const openCompanionsTab = (patient: Patient) => {
    setCompanionsPatientId(patient.id)
    setActiveTab('companions')
  }

  const submitEdit = () => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === editForm.id
          ? { ...p, name: editForm.name, risk_level: editForm.risk_level, bmi: editForm.bmi }
          : p,
      ),
    )
    alert('Paciente atualizado com sucesso.')
  }

  const closeEditTab = () => {
    setEditingPatientId(null)
    setActiveTab('list')
  }

  const closeCompanionsTab = () => {
    setCompanionsPatientId(null)
    setActiveTab('list')
  }

  const companionsPatient = useMemo(
    () => patients.find((p) => p.id === companionsPatientId) ?? null,
    [patients, companionsPatientId],
  )

  const runSearch = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setPerPage(10)
    setCurrentPage(1)
  }, [])

  const tabClass = (tab: string) =>
    `border-b-2 px-1 pb-2 text-sm font-semibold transition ${activeTab === tab ? 'border-[#FFE14D] text-slate-700 dark:text-slate-100' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-100">
          Pacientes e acompanhantes
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Cadastro e acompanhamento com ficha integrada e vinculo de acompanhantes.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap items-center gap-5">
          <button className={tabClass('list')} onClick={() => setActiveTab('list')}>
            Listagem
          </button>
          <button className={tabClass('add')} onClick={() => setActiveTab('add')}>
            Adicionar
          </button>
          {editingPatientId && (
            <button className={tabClass('edit')} onClick={() => setActiveTab('edit')}>
              Editar
            </button>
          )}
          {companionsPatientId && (
            <button className={tabClass('companions')} onClick={() => setActiveTab('companions')}>
              Acompanhantes
            </button>
          )}
        </div>
      </div>

      {/* View mode + permission badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600">
            <button
              className={`px-4 py-2 text-sm font-semibold transition ${viewMode === 'grid' ? 'bg-[#FFE14D] text-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button
              className={`px-4 py-2 text-sm font-semibold transition ${viewMode === 'list' ? 'bg-[#FFE14D] text-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'}`}
              onClick={() => setViewMode('list')}
            >
              Lista
            </button>
          </div>
        </div>
        {!isMedicalTeam && (
          <span className="rounded-full bg-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-200">
            Apenas equipe medica pode cadastrar
          </span>
        )}
      </div>

      {/* Add tab */}
      {activeTab === 'add' && isMedicalTeam && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-4 text-base font-semibold text-slate-700 dark:text-slate-100">
            Cadastrar e enviar link de acesso
          </h3>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Para{' '}
            <strong className="font-medium text-slate-700 dark:text-slate-200">acompanhante</strong>
            , escolha o paciente cadastrado ao qual ele tera acesso a jornada (mesmo vinculo usado no
            app).
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-500 dark:text-slate-400">
                Perfil
              </label>
              <select
                value={addForm.profile}
                onChange={(e) =>
                  setAddForm((prev) => ({
                    ...prev,
                    profile: e.target.value as 'paciente' | 'acompanhante',
                  }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base dark:border-slate-600 dark:bg-slate-800"
              >
                <option value="paciente">Paciente</option>
                <option value="acompanhante">Acompanhante</option>
              </select>
            </div>
            {addForm.profile === 'acompanhante' && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Paciente vinculado
                </label>
                {patients.length > 0 ? (
                  <select
                    value={addForm.linkedPatientId ?? ''}
                    onChange={(e) =>
                      setAddForm((prev) => ({
                        ...prev,
                        linkedPatientId: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base dark:border-slate-600 dark:bg-slate-800"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="rounded-lg border border-dashed border-slate-300 px-3 py-3 text-sm text-slate-500 dark:border-slate-600">
                    Cadastre um paciente antes de vincular acompanhantes.
                  </p>
                )}
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-500 dark:text-slate-400">
                Nome completo
              </label>
              <input
                value={addForm.name}
                onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))}
                type="text"
                placeholder="Nome do convidado"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base dark:border-slate-600 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-500 dark:text-slate-400">
                E-mail
              </label>
              <input
                value={addForm.email}
                onChange={(e) => setAddForm((prev) => ({ ...prev, email: e.target.value }))}
                type="email"
                placeholder="E-mail para convite"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base dark:border-slate-600 dark:bg-slate-800"
              />
            </div>
          </div>
          {addForm.profile === 'paciente' && (
            <button
              className="mt-4 rounded-lg border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              onClick={sendPatientRegistrationEmail}
            >
              Enviar e-mail para cadastro
            </button>
          )}
          <button
            className="mt-4 rounded-lg bg-[#FFE14D] px-5 py-3 text-base font-semibold text-slate-700 hover:brightness-95"
            onClick={submitAdd}
          >
            Enviar convite de senha
          </button>
        </div>
      )}

      {/* Edit tab */}
      {activeTab === 'edit' && editingPatientId && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-100">
              Editar paciente
            </h3>
            <button
              className="text-sm text-slate-500 hover:underline dark:text-slate-300"
              onClick={closeEditTab}
            >
              Fechar guia
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={editForm.name}
              onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              type="text"
              placeholder="Nome"
              className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-base dark:border-slate-600 dark:bg-slate-800"
            />
            <input
              value={editForm.bmi}
              onChange={(e) => setEditForm((prev) => ({ ...prev, bmi: Number(e.target.value) }))}
              type="number"
              step="0.1"
              placeholder="IMC"
              className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-base dark:border-slate-600 dark:bg-slate-800"
            />
            <select
              value={editForm.risk_level}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  risk_level: e.target.value as Patient['risk_level'],
                }))
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-base dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="baixo">Baixo</option>
              <option value="medio">Medio</option>
              <option value="alto">Alto</option>
              <option value="critico">Critico</option>
            </select>
          </div>
          <button
            className="mt-4 rounded-lg bg-[#FFE14D] px-5 py-3 text-base font-semibold text-slate-700 hover:brightness-95"
            onClick={submitEdit}
          >
            Salvar edicao
          </button>
        </div>
      )}

      {/* Companions tab */}
      {activeTab === 'companions' && companionsPatient && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-100">
              Acompanhantes de {companionsPatient.name}
            </h3>
            <button
              className="text-sm text-slate-500 hover:underline dark:text-slate-300"
              onClick={closeCompanionsTab}
            >
              Fechar guia
            </button>
          </div>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Quem voce cadastra aqui enxerga a jornada deste paciente no app, no perfil de
            acompanhante (demo: vinculo salvo neste navegador).
          </p>

          {isMedicalTeam && (
            <div className="mb-6 rounded-lg border border-[#c8a800]/35 bg-[#fffdf5] p-4 dark:border-[#FFE14D]/25 dark:bg-[#152754]/60">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Adicionar acompanhante a este paciente
              </h4>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Nome
                  </label>
                  <input
                    value={newCompanionForPatientForm.name}
                    onChange={(e) =>
                      setNewCompanionForPatientForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    type="text"
                    placeholder="Nome completo"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                    E-mail
                  </label>
                  <input
                    value={newCompanionForPatientForm.email}
                    onChange={(e) =>
                      setNewCompanionForPatientForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    type="email"
                    placeholder="E-mail para convite"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-800"
                  />
                </div>
              </div>
              <button
                type="button"
                className="mt-3 rounded-lg bg-[#FFE14D] px-4 py-2.5 text-sm font-semibold text-slate-700 hover:brightness-95"
                onClick={submitNewCompanionForPatient}
              >
                Vincular e enviar convite
              </button>
            </div>
          )}

          {companionsForPatient(companionsPatient.id).length === 0 ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Nenhum acompanhante vinculado a este paciente.
            </div>
          ) : (
            <div className="space-y-2">
              {companionsForPatient(companionsPatient.id).map((companion) => (
                <article
                  key={companion.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60"
                >
                  <p className="font-semibold text-slate-700 dark:text-slate-100">
                    {companion.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{companion.email}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* List tab content */}
      {activeTab === 'list' && (
        <>
          {patients.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-base text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              Nenhum paciente encontrado
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {patients.map((patient) => (
                <article
                  key={patient.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-100">
                        {patient.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        IMC {patient.bmi} · risco {patient.risk_level}
                      </p>
                    </div>
                    <button
                      className="rounded-lg bg-[#FFE14D] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:brightness-95"
                      onClick={() => openPatientDetail(patient)}
                    >
                      Ver detalhe
                    </button>
                    <button
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                      onClick={() => openEditTab(patient)}
                    >
                      Editar
                    </button>
                    <button
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                      onClick={() => openCompanionsTab(patient)}
                    >
                      Acompanhantes
                    </button>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Acompanhantes
                    </h4>
                    {companionsForPatient(patient.id).length === 0 ? (
                      <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Nenhum acompanhante vinculado.
                      </div>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {companionsForPatient(patient.id).map((companion) => (
                          <span
                            key={companion.id}
                            className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {companion.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                      <h4 className="text-base font-semibold text-slate-700 dark:text-slate-100">
                        Ficha pre-operatoria
                      </h4>
                      <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                        <li>IMC e comorbidades avaliados</li>
                        <li>Exames laboratoriais anexados</li>
                        <li>Autorizacao do convenio validada</li>
                        <li>Jejum confirmado</li>
                      </ul>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                      <h4 className="text-base font-semibold text-slate-700 dark:text-slate-100">
                        Ficha pos-operatoria
                      </h4>
                      <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                        <li>Dor referida: leve</li>
                        <li>Temperatura: 36.8 C</li>
                        <li>Saturacao: 97%</li>
                        <li>Mobilidade assistida iniciada</li>
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Search panel */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                  A pesquisa usa registros mockados armazenados no navegador.
                </p>
                <div className="max-w-xl">
                  <label className="mb-1 block text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Pesquisar
                  </label>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      type="text"
                      placeholder="Nome, tipo ou risco"
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                    />
                    <button
                      className="rounded-lg bg-[#FFE14D] px-4 py-2 text-sm font-semibold text-slate-700"
                      onClick={runSearch}
                    >
                      Pesquisar
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
                  <button
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  >
                    Filtros {isFiltersOpen ? '▴' : '▾'}
                  </button>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Refine a busca e controle a paginacao com filtros compactos.
                  </p>
                </div>
                {isFiltersOpen && (
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-500 dark:text-slate-400">
                        Itens por pagina
                      </label>
                      <select
                        value={perPage}
                        onChange={(e) => setPerPage(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                        onClick={clearFilters}
                      >
                        Limpar filtros
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                      Resultados da pesquisa
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {filteredPatients.length} pacientes encontrados.
                    </p>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{pageLabel}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                      <tr>
                        <th className="p-3 text-left">Paciente</th>
                        <th className="p-3 text-left">IMC</th>
                        <th className="p-3 text-left">Risco</th>
                        <th className="p-3 text-left">Acompanhantes</th>
                        <th className="p-3 text-left">Acoes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPatients.map((patient) => (
                        <tr
                          key={patient.id}
                          className="border-t border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-100"
                        >
                          <td className="p-3">{patient.name}</td>
                          <td className="p-3">{patient.bmi}</td>
                          <td className="p-3">{patient.risk_level}</td>
                          <td className="p-3">
                            {companionsForPatient(patient.id).length} vinculado(s)
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <button
                                className="text-sm font-semibold text-[#FFE14D] hover:underline"
                                onClick={() => openPatientDetail(patient)}
                              >
                                Ver detalhe
                              </button>
                              <button
                                className="text-sm font-semibold text-slate-500 hover:underline dark:text-slate-300"
                                onClick={() => openEditTab(patient)}
                              >
                                Editar
                              </button>
                              <button
                                className="text-sm font-semibold text-slate-500 hover:underline dark:text-slate-300"
                                onClick={() => openCompanionsTab(patient)}
                              >
                                Acompanhantes
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Pagina {currentPage} de {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Anterior
                    </button>
                    <button
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Proxima
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
