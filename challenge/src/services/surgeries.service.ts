import type { Surgery, SurgeryRecord } from '@/types/surgery'

const MOCK_SURGERIES: Surgery[] = [
  {
    id: 1,
    patient_name: 'Joao Silva',
    status: 'IN_RECOVERY',
    scheduled_at: '2026-01-15T08:00:00.000Z',
    started_at: '2026-01-15T08:20:00.000Z',
    finished_at: '2026-01-15T10:40:00.000Z',
    risk_level: 'medio',
  },
  {
    id: 3,
    patient_name: 'Paula Ribeiro',
    status: 'SCHEDULED',
    scheduled_at: '2026-05-20T13:15:00.000Z',
    risk_level: 'alto',
  },
  {
    id: 4,
    patient_name: 'Carlos Mendes',
    status: 'APPROVED',
    scheduled_at: '2026-06-10T07:30:00.000Z',
    risk_level: 'medio',
  },
]

const MOCK_SURGERY_RECORDS: Record<number, SurgeryRecord> = {
  1: {
    surgery_id: 1,
    patient_id: 1,
    technique: 'sleeve',
    duration_minutes: 140,
    complications: [],
    notes: 'Procedimento transcorreu sem intercorrências. Paciente estável ao final.',
    surgeon: 'Dr. Lucas Lima',
    date: '2026-01-15',
  },
}

export const surgeriesService = {
  async list(): Promise<Surgery[]> {
    try {
      const res = await fetch('/mocks/surgeries.json')
      if (!res.ok) throw new Error('fetch failed')
      const data: Surgery[] = await res.json()
      return data.length ? data : MOCK_SURGERIES
    } catch {
      return MOCK_SURGERIES
    }
  },

  async record(patientId: number): Promise<SurgeryRecord | null> {
    try {
      const res = await fetch(`/mocks/surgery-record-${patientId}.json`)
      if (res.ok) {
        const data: SurgeryRecord = await res.json()
        return data
      }
    } catch {
      // fall through to hardcoded fallback
    }

    return MOCK_SURGERY_RECORDS[patientId] ?? null
  },
}
