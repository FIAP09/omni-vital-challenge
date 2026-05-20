import { useMemo } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { useViewAs } from '@/hooks/useViewAs'
import { getJourneyLabel, resolvePatientJourneyType } from '@/constants/patient-journey-content'
import type { PatientJourneyType } from '@/types/patient-journey'

const roleLabels: Record<string, string> = {
  super_admin: 'Super administrador',
  hospital_admin: 'Administrador hospitalar',
  medico: 'Medico',
  enfermeiro: 'Enfermeiro',
}

export function usePatientPersona() {
  const user = useAuthStore((s) => s.user)
  const { currentContext, activeViewAs } = useViewAs()

  const isPatientContext = useMemo(() => currentContext === 'paciente', [currentContext])
  const isCompanionContext = useMemo(() => currentContext === 'acompanhante', [currentContext])

  const journeyType = useMemo<PatientJourneyType | null>(
    () => resolvePatientJourneyType(activeViewAs),
    [activeViewAs],
  )

  const displayName = useMemo(() => {
    if (isPatientContext || isCompanionContext) {
      return activeViewAs?.name ?? 'Usuario'
    }
    return user?.name ?? 'Usuario'
  }, [isPatientContext, isCompanionContext, activeViewAs, user?.name])

  const displaySubtitle = useMemo(() => {
    if (isPatientContext) {
      const j = journeyType
      if (j) return `Paciente · ${getJourneyLabel(j)}`
      return 'Paciente'
    }
    if (isCompanionContext) {
      return 'Acompanhante'
    }
    const role = user?.role
    return role ? roleLabels[role] ?? role : ''
  }, [isPatientContext, isCompanionContext, journeyType, user?.role])

  return {
    isPatientContext,
    isCompanionContext,
    journeyType,
    displayName,
    displaySubtitle,
  }
}
