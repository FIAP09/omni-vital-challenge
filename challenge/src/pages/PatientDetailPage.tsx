import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Activity,
  Apple,
  Bed,
  Dumbbell,
  FileText,
  FlaskConical,
  Scale,
  Stethoscope,
} from 'lucide-react'
import { useViewAs } from '@/hooks/useViewAs'
import { patientsService } from '@/services/patients.service'
import { bariatricService } from '@/services/bariatric.service'
import { surgeriesService } from '@/services/surgeries.service'
import type { Patient } from '@/types/patient'
import type {
  ExamTimelineEntry,
  WeightEntry,
  LabEntry,
  DietEntry,
  SleepEntry,
  ActivityEntry,
  OrientationDocument,
} from '@/types/bariatric'
import type { SurgeryRecord } from '@/types/surgery'
import WeightChart from '@/components/bariatric/WeightChart'
import ExamTimeline from '@/components/bariatric/ExamTimeline'
import LabTracker from '@/components/bariatric/LabTracker'
import DietLog from '@/components/bariatric/DietLog'
import SleepLog from '@/components/bariatric/SleepLog'
import ActivityLog from '@/components/bariatric/ActivityLog'
import SurgeryRecordComponent from '@/components/bariatric/SurgeryRecord'
import OrientationViewer from '@/components/bariatric/OrientationViewer'
import type { LucideIcon } from 'lucide-react'

interface TabDef {
  key: string
  label: string
  icon: LucideIcon
}

const tabs: TabDef[] = [
  { key: 'resumo', label: 'Resumo', icon: Activity },
  { key: 'exames', label: 'Exames', icon: Stethoscope },
  { key: 'peso', label: 'Peso', icon: Scale },
  { key: 'laboratorio', label: 'Laboratorio', icon: FlaskConical },
  { key: 'dieta', label: 'Dieta', icon: Apple },
  { key: 'sono', label: 'Sono', icon: Bed },
  { key: 'atividade', label: 'Atividade', icon: Dumbbell },
  { key: 'cirurgia', label: 'Cirurgia', icon: FileText },
  { key: 'orientacoes', label: 'Orientacoes', icon: FileText },
]

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentContext } = useViewAs()
  const showBackButton = currentContext !== 'paciente' && currentContext !== 'acompanhante'
  const patientId = Number(id)

  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('resumo')

  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([])
  const [examEntries, setExamEntries] = useState<ExamTimelineEntry[]>([])
  const [labHistory, setLabHistory] = useState<LabEntry[]>([])
  const [dietEntries, setDietEntries] = useState<DietEntry[]>([])
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([])
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>([])
  const [surgeryRecord, setSurgeryRecord] = useState<SurgeryRecord | null>(null)
  const [orientations, setOrientations] = useState<OrientationDocument[]>([])

  const statusLabel = useMemo(() => {
    if (!patient) return ''
    const m: Record<string, string> = {
      REQUESTED: 'Solicitada',
      APPROVED: 'Aprovada',
      SCHEDULED: 'Agendada',
      ADMITTED: 'Internacao',
      IN_SURGERY: 'Em cirurgia',
      IN_RECOVERY: 'Em recuperacao',
      DISCHARGED: 'Alta',
      COMPLICATION: 'Complicacao',
      CANCELLED: 'Cancelada',
    }
    return m[patient.status] ?? patient.status
  }, [patient])

  const age = useMemo(() => {
    if (!patient) return 0
    const birth = new Date(patient.birth_date)
    const now = new Date()
    let a = now.getFullYear() - birth.getFullYear()
    if (
      now.getMonth() < birth.getMonth() ||
      (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
    )
      a--
    return a
  }, [patient])

  const weightLost = useMemo(() => {
    if (!patient) return 0
    return patient.initial_weight - patient.weight
  }, [patient])

  const weightLostPercent = useMemo(() => {
    if (!patient || patient.initial_weight === 0) return 0
    return Math.round((weightLost / patient.initial_weight) * 100)
  }, [patient, weightLost])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      patientsService.get(patientId),
      bariatricService.weightHistory(patientId),
      bariatricService.examTimeline(patientId),
      bariatricService.labHistory(patientId),
      bariatricService.dietLog(patientId),
      bariatricService.sleepLog(patientId),
      bariatricService.activityLog(patientId),
      surgeriesService.record(patientId),
      bariatricService.orientations(),
    ])
      .then(([p, w, e, l, d, s, a, sr, o]) => {
        setPatient(p)
        setWeightHistory(w)
        setExamEntries(e)
        setLabHistory(l)
        setDietEntries(d)
        setSleepEntries(s)
        setActivityEntries(a)
        setSurgeryRecord(sr)
        setOrientations(o)
      })
      .finally(() => setLoading(false))
  }, [patientId])

  if (loading) {
    return (
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Carregando dados do paciente...
        </div>
      </section>
    )
  }

  if (!patient) {
    return (
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Paciente nao encontrado.
          <button
            className="mx-auto mt-2 block text-[#FFE14D] hover:underline"
            onClick={() => navigate('/app/patients')}
          >
            Voltar para lista
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 pb-4">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => navigate('/app/patients')}
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-100">
              {patient.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {age} anos · IMC {patient.bmi} · {statusLabel}
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="mt-4 overflow-x-auto border-b border-slate-200 dark:border-slate-700">
          <div className="flex min-w-max items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-[#FFE14D] text-[#0f2743] dark:text-[#FFE14D]'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <Icon size={16} className="shrink-0" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        {activeTab === 'resumo' && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Peso atual
                </p>
                <p className="mt-1 text-2xl font-semibold text-[#0f2743] dark:text-[#FFE14D]">
                  {patient.weight} kg
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Peso inicial
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-700 dark:text-slate-100">
                  {patient.initial_weight} kg
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Peso perdido
                </p>
                <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                  -{weightLost} kg ({weightLostPercent}%)
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Meta
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-700 dark:text-slate-100">
                  {patient.target_weight} kg
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                  Dados pessoais
                </h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Data de nascimento</dt>
                    <dd className="font-medium text-slate-700 dark:text-slate-100">
                      {new Date(patient.birth_date).toLocaleDateString('pt-BR')}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Altura</dt>
                    <dd className="font-medium text-slate-700 dark:text-slate-100">
                      {patient.height}m
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">IMC atual</dt>
                    <dd className="font-medium text-slate-700 dark:text-slate-100">
                      {patient.bmi}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Nivel de risco</dt>
                    <dd className="font-medium capitalize text-slate-700 dark:text-slate-100">
                      {patient.risk_level}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                  Cirurgia
                </h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Data da cirurgia</dt>
                    <dd className="font-medium text-slate-700 dark:text-slate-100">
                      {patient.surgery_date
                        ? new Date(patient.surgery_date).toLocaleDateString('pt-BR')
                        : 'Nao realizada'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Tecnica</dt>
                    <dd className="font-medium text-slate-700 dark:text-slate-100">
                      {surgeryRecord?.technique === 'sleeve'
                        ? 'Sleeve'
                        : surgeryRecord?.technique === 'bypass_gastrico'
                          ? 'Bypass Gastrico'
                          : surgeryRecord?.technique ?? 'N/A'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Status</dt>
                    <dd className="font-medium text-slate-700 dark:text-slate-100">
                      {statusLabel}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exames' && <ExamTimeline entries={examEntries} />}

        {activeTab === 'peso' && (
          <WeightChart
            entries={weightHistory}
            targetWeight={patient.target_weight}
            initialWeight={patient.initial_weight}
          />
        )}

        {activeTab === 'laboratorio' && <LabTracker entries={labHistory} />}

        {activeTab === 'dieta' && <DietLog entries={dietEntries} />}

        {activeTab === 'sono' && <SleepLog entries={sleepEntries} />}

        {activeTab === 'atividade' && <ActivityLog entries={activityEntries} />}

        {activeTab === 'cirurgia' && <SurgeryRecordComponent record={surgeryRecord} />}

        {activeTab === 'orientacoes' && <OrientationViewer documents={orientations} />}
      </div>
    </section>
  )
}
