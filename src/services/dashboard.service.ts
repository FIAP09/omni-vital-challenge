import type { DashboardSummary } from '@/types/surgery'

const MOCK_DASHBOARD_SUMMARY: DashboardSummary = {
  patients_pre_op: 8,
  patients_post_op: 15,
  surgeries_scheduled: 3,
  weight_regain_alerts: 2,
  pending_exams: 5,
}

export const dashboardService = {
  async summary(): Promise<DashboardSummary> {
    try {
      const res = await fetch('/mocks/dashboard-summary.json')
      if (!res.ok) throw new Error('fetch failed')
      const data: DashboardSummary = await res.json()
      return data
    } catch {
      return MOCK_DASHBOARD_SUMMARY
    }
  },
}
