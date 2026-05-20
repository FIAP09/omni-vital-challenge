import { create } from 'zustand'

export type GoalEntryRating = 'adequado' | 'com_ressalvas' | 'pendente_avaliacao'

export interface JourneyEvaluationPatch {
  rating: GoalEntryRating
  notes: string
  evaluator: string
  evaluatedAt: string
}

function patchKey(patientProfileId: string, goalId: string, entryId: string) {
  return `${patientProfileId}::${goalId}::${entryId}`
}

interface PatientJourneyEvaluationsState {
  patches: Record<string, JourneyEvaluationPatch>
  getPatch: (patientProfileId: string, goalId: string, entryId: string) => JourneyEvaluationPatch | undefined
  setPatch: (patientProfileId: string, goalId: string, entryId: string, data: JourneyEvaluationPatch) => void
}

export const usePatientJourneyEvaluationsStore = create<PatientJourneyEvaluationsState>()((set, get) => ({
  patches: {},

  getPatch: (patientProfileId: string, goalId: string, entryId: string) => {
    return get().patches[patchKey(patientProfileId, goalId, entryId)]
  },

  setPatch: (patientProfileId: string, goalId: string, entryId: string, data: JourneyEvaluationPatch) => {
    set((state) => ({
      patches: {
        ...state.patches,
        [patchKey(patientProfileId, goalId, entryId)]: data,
      },
    }))
  },
}))
