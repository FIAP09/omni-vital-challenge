import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AppHeader from '@/components/layout/AppHeader'
import AppSidebar from '@/components/layout/AppSidebar'
import { useAuthStore } from '@/stores/auth.store'

const MOBILE_QUERY = '(max-width: 1023px)'

export default function AppLayout() {
  const location = useLocation()
  const loadCurrentUser = useAuthStore((s) => s.loadCurrentUser)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const updateViewport = useCallback(() => {
    const isMobile = window.matchMedia(MOBILE_QUERY).matches
    setIsMobileViewport(isMobile)
    if (!isMobile) {
      setMobileNavOpen(false)
    }
  }, [])

  const toggleSidebar = useCallback(() => {
    if (isMobileViewport) {
      setMobileNavOpen((prev) => !prev)
    } else {
      setIsSidebarCollapsed((prev) => !prev)
    }
  }, [isMobileViewport])

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false)
  }, [])

  useEffect(() => {
    loadCurrentUser()
  }, [loadCurrentUser])

  // Resize listener
  useEffect(() => {
    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => {
      window.removeEventListener('resize', updateViewport)
    }
  }, [updateViewport])

  // Close mobile nav on route change
  useEffect(() => {
    if (isMobileViewport) {
      setMobileNavOpen(false)
    }
  }, [location.pathname, isMobileViewport])

  return (
    <div
      className={`h-screen overflow-hidden bg-[#FFFDF5] text-slate-700 dark:bg-[#0b1533] dark:text-slate-100 ${
        isMobileViewport && mobileNavOpen ? 'max-lg:overflow-hidden' : ''
      }`}
    >
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-[1px] lg:hidden"
        aria-hidden="true"
        onClick={closeMobileNav}
        style={{ display: isMobileViewport && mobileNavOpen ? undefined : 'none' }}
      />

      <div className="flex h-full min-h-0">
        <AppSidebar
          collapsed={!isMobileViewport && isSidebarCollapsed}
          isMobileLayout={isMobileViewport}
          mobileOpen={mobileNavOpen}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader
            isMobileViewport={isMobileViewport}
            mobileNavOpen={mobileNavOpen}
            sidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={toggleSidebar}
          />
          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pt-6 md:px-8 md:py-8 lg:px-12 lg:py-10 xl:px-14 xl:py-12">
            <div className="mx-auto flex w-full min-h-0 min-w-0 max-w-[1480px] flex-1 flex-col">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
