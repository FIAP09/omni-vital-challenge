import { create } from 'zustand'
import { alertsService } from '@/services/alerts.service'
import type { Alert } from '@/types/alert'

interface AlertsState {
  items: Alert[]
  loading: boolean
  fetchAlerts: () => Promise<void>
}

export const useAlertsStore = create<AlertsState>()((set) => ({
  items: [],
  loading: false,

  fetchAlerts: async () => {
    set({ loading: true })
    try {
      const items = await alertsService.list()
      set({ items })
    } finally {
      set({ loading: false })
    }
  },
}))

/** Selector: count of unresolved critical alerts. */
export const selectCriticalCount = (state: AlertsState) =>
  state.items.filter((a) => a.severity === 'CRITICAL' && !a.resolved_at).length
