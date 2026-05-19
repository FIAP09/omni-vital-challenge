import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore, selectIsAuthenticated } from './stores/auth.store'

// --- Layouts ---
const AuthLayout = lazy(() => import('./layouts/AuthLayout'))
const AppLayout = lazy(() => import('./layouts/AppLayout'))

// --- Public pages ---
const LandingPage = lazy(() => import('./pages/LandingPage'))
const SelectorPage = lazy(() => import('./pages/SelectorPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const CreateAccessPage = lazy(() => import('./pages/CreateAccessPage'))

// --- Protected pages ---
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const AlertsPage = lazy(() => import('./pages/AlertsPage'))
const PatientsPage = lazy(() => import('./pages/PatientsPage'))
const PatientDetailPage = lazy(() => import('./pages/PatientDetailPage'))
const JourneyEvaluationsPage = lazy(() => import('./pages/JourneyEvaluationsPage'))
const OrientationsPage = lazy(() => import('./pages/OrientationsPage'))
const TeamPage = lazy(() => import('./pages/TeamPage'))

// --- Loading fallback ---
function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
    </div>
  )
}

// --- Protected route wrapper ---
function ProtectedRoute() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/seletor" element={<SelectorPage />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/criar-acesso" element={<CreateAccessPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="patients/:id" element={<PatientDetailPage />} />
            <Route path="journey-evaluations" element={<JourneyEvaluationsPage />} />
            <Route path="orientations" element={<OrientationsPage />} />
            <Route path="team" element={<TeamPage />} />
          </Route>
        </Route>

        {/* Redirects */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
