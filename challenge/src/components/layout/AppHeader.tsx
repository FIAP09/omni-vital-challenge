import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Menu, Moon, PanelLeftClose, Sun, X } from 'lucide-react'
import { useAlertsStore, selectCriticalCount } from '@/stores/alerts.store'
import { useTheme } from '@/hooks/useTheme'
import { useViewAs } from '@/hooks/useViewAs'
import ViewAsControl from './ViewAsControl'
import UserDropdown from './UserDropdown'

interface AppHeaderProps {
  sidebarCollapsed: boolean
  isMobileViewport?: boolean
  mobileNavOpen?: boolean
  onToggleSidebar: () => void
}

export default function AppHeader({ sidebarCollapsed, isMobileViewport, mobileNavOpen, onToggleSidebar }: AppHeaderProps) {
  const { isDark, toggleTheme } = useTheme()
  const { canModule, isAdmin } = useViewAs()
  const items = useAlertsStore((s) => s.items)
  const fetchAlerts = useAlertsStore((s) => s.fetchAlerts)
  const criticalCount = useAlertsStore(selectCriticalCount)
  const navigate = useNavigate()

  const showAlerts = canModule('alertas')
  const [isAlertsOpen, setIsAlertsOpen] = useState(false)
  const topAlerts = useMemo(() => items.slice(0, 3), [items])

  useEffect(() => {
    fetchAlerts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goToAlerts = () => {
    setIsAlertsOpen(false)
    navigate('/app/alerts')
  }

  const toggleButtonTitle = isMobileViewport
    ? mobileNavOpen
      ? 'Fechar menu'
      : 'Abrir menu'
    : sidebarCollapsed
      ? 'Expandir menu'
      : 'Recolher menu'

  const renderToggleIcon = () => {
    if (isMobileViewport && mobileNavOpen) return <X size={20} />
    if (isMobileViewport) return <Menu size={20} />
    if (!sidebarCollapsed) return <PanelLeftClose size={18} />
    return <Menu size={18} />
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-[#f3e5a8] bg-[#fff9e8] pl-2 pr-3 pt-[env(safe-area-inset-top)] dark:border-[#1b2747] dark:bg-[#07122E] sm:h-20 sm:gap-3 sm:pl-3 sm:pr-4 lg:pl-4 lg:pr-8">
      <div className="flex min-w-0 items-center">
        <button
          type="button"
          className="-ml-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 transition touch-manipulation hover:bg-slate-200/40 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/40 dark:hover:text-white sm:h-10 sm:w-10"
          title={toggleButtonTitle}
          onClick={onToggleSidebar}
        >
          {renderToggleIcon()}
        </button>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2 md:gap-3">
        {isAdmin && <ViewAsControl className="min-w-0 shrink" />}
        {showAlerts && (
          <div className="relative shrink-0">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border-0 bg-transparent text-slate-600 transition touch-manipulation hover:bg-[#fff4c4] dark:text-slate-100 dark:hover:bg-slate-700/50 sm:h-10 sm:w-10"
              title="Alertas"
              onClick={() => setIsAlertsOpen((prev) => !prev)}
            >
              <Bell size={16} />
            </button>
            {criticalCount > 0 && (
              <span className="absolute -right-1 -top-1 z-10 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full border-0 bg-[#FFE14D] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-slate-800 shadow-none ring-0 outline-none">
                {criticalCount}
              </span>
            )}

            {isAlertsOpen && (
              <div className="fixed left-3 right-3 top-[calc(4rem+env(safe-area-inset-top))] z-50 max-h-[min(24rem,70vh)] overflow-y-auto rounded-xl border border-slate-700 bg-[#0f1834] p-3 shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-none sm:w-80 sm:overflow-visible">
                <h3 className="mb-2 text-sm font-semibold text-slate-100">Alertas recentes</h3>
                {topAlerts.length === 0 ? (
                  <div className="text-sm text-slate-400">Sem alertas no momento.</div>
                ) : (
                  <div className="space-y-2">
                    {topAlerts.map((alert) => (
                      <article key={alert.id} className="rounded-lg border border-slate-700 px-3 py-2">
                        <p className="text-sm font-medium text-slate-100">{alert.patient_name}</p>
                        <p className="text-xs text-slate-400">{alert.message}</p>
                      </article>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  className="mt-3 w-full rounded-lg border border-slate-600 px-3 py-2.5 text-sm font-semibold text-slate-100 touch-manipulation hover:bg-slate-700/50 sm:py-2"
                  onClick={goToAlerts}
                >
                  Ver mais
                </button>
              </div>
            )}
          </div>
        )}
        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-600 transition touch-manipulation hover:bg-[#fff4c4] dark:text-slate-100 dark:hover:bg-slate-700/50 sm:h-10 sm:w-10"
          title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
          onClick={toggleTheme}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <UserDropdown className="min-w-0 shrink" />
      </div>
    </header>
  )
}
