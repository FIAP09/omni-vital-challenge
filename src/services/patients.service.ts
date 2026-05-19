import type { Patient } from '@/types/patient'

const MOCK_PATIENTS: Patient[] = [
  {
    id: 1,
    name: 'Joao Silva',
    birth_date: '1987-03-10',
    weight: 95,
    height: 1.79,
    bmi: 29.6,
    risk_level: 'medio',
    status: 'IN_RECOVERY',
    initial_weight: 120,
    target_weight: 85,
    surgery_date: '2026-01-15',
  },
  {
    id: 3,
    name: 'Paula Ribeiro',
    birth_date: '1981-01-05',
    weight: 104,
    height: 1.64,
    bmi: 38.7,
    risk_level: 'alto',
    status: 'SCHEDULED',
    initial_weight: 104,
    target_weight: 70,
  },
  {
    id: 4,
    name: 'Carlos Mendes',
    birth_date: '1990-07-22',
    weight: 130,
    height: 1.75,
    bmi: 42.4,
    risk_level: 'medio',
    status: 'APPROVED',
    initial_weight: 130,
    target_weight: 88,
  },
]

export const patientsService = {
  async list(): Promise<Patient[]> {
    try {
      const res = await fetch('/mocks/patients.json')
      if (!res.ok) throw new Error('fetch failed')
      const data: Patient[] = await res.json()
      return data.length ? data : MOCK_PATIENTS
    } catch {
      return MOCK_PATIENTS
    }
  },

  async get(id: number): Promise<Patient | null> {
    // Try fetching specific patient file first
    try {
      const res = await fetch(`/mocks/patient-${id}.json`)
      if (res.ok) {
        const data: Patient = await res.json()
        return data
      }
    } catch {
      // fall through to list-based lookup
    }

    // Fallback: filter from full list
    const all = await this.list()
    return all.find((p) => p.id === id) ?? null
  },
}
