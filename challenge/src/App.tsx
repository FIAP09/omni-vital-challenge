import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

const AppLayout = lazy(() => import('./layouts/AppLayout'))
const LandingPage = lazy(() => import('./pages/LandingPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const AlertsPage = lazy(() => import('./pages/AlertsPage'))
const PatientDetailPage = lazy(() => import('./pages/PatientDetailPage'))
const OrientationsPage = lazy(() => import('./pages/OrientationsPage'))

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="patients/:id" element={<PatientDetailPage />} />
          <Route path="orientations" element={<OrientationsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
