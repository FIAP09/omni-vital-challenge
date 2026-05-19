import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bell, BookOpen, ChevronDown, ClipboardList, Home, UserRound, Users } from 'lucide-react'
import { useViewAs } from '@/hooks/useViewAs'
import type { LucideIcon } from 'lucide-react'

interface AppSidebarProps {
  collapsed?: boolean
  isMobileLayout?: boolean
  mobileOpen?: boolean
}

const iconMap: Record<string, LucideIcon> = {
  'Início': Home,
  'Alertas': Bell,
  'Pacientes': UserRound,
  'Avaliações': ClipboardList,
  'Orientações': BookOpen,
  'Equipe': Users,
}

type SidebarChild = {
  to: string
  label: string
  show: boolean
  exact?: boolean
}

type SidebarItem = {
  label: string
  displayLabel?: string
  to: string
  show: boolean
  exact?: boolean
  children?: SidebarChild[]
}

export default function AppSidebar({ collapsed, isMobileLayout, mobileOpen }: AppSidebarProps) {
  const location = useLocation()
  const { canModule, currentContext, activeViewAs } = useViewAs()
  const [expandedModule, setExpandedModule] = useState<string | null>(null)

  const isPatientOrCompanion = currentContext === 'paciente' || currentContext === 'acompanhante'

  const patientDetailPath = useMemo(() => {
    const pid = activeViewAs?.linkedPatientId
    return pid ? `/app/patients/${pid}` : '/app/patients'
  }, [activeViewAs])

  const patientMenuLabel = useMemo(() => {
    if (currentContext === 'paciente') return 'Meus Dados'
    if (currentContext === 'acompanhante') return 'Paciente'
    return undefined
  }, [currentContext])

  const items = useMemo<SidebarItem[]>(() => [
    {
      label: 'Início',
      to: '/app/dashboard',
      show: canModule('dashboard'),
      exact: true,
    },
    {
      label: 'Pacientes',
      displayLabel: patientMenuLabel,
      to: isPatientOrCompanion ? patientDetailPath : '/app/patients',
      show: canModule('pacientes'),
      exact: isPatientOrCompanion,
    },
    {
      label: 'Avaliações',
      to: '/app/journey-evaluations',
      show: canModule('pacientes') && !isPatientOrCompanion,
      exact: true,
    },
    {
      label: 'Alertas',
      to: '/app/alerts',
      show: canModule('alertas'),
    },
    {
      label: 'Orientações',
      to: '/app/orientations',
      show: canModule('orientacoes'),
      exact: true,
    },
    {
      label: 'Equipe',
      to: '/app/team',
      show: canModule('equipe'),
      exact: true,
    },
  ], [canModule, patientMenuLabel, isPatientOrCompanion, patientDetailPath])

  const visibleChildren = (item: SidebarItem) => (item.children ?? []).filter((child) => child.show)

  const isChildActive = (to: string, child?: SidebarChild) => {
    if (child?.exact) return location.pathname === to
    if (to === '/app/patients') return location.pathname === '/app/patients'
    return location.pathname === to || location.pathname.startsWith(`${to}/`)
  }

  const isModuleActive = (item: SidebarItem) => {
    if (item.label === 'Pacientes') return location.pathname.startsWith('/app/patients')
    if (item.exact) return location.pathname === item.to
    return location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
  }

  const showLabels = isMobileLayout ? true : !collapsed

  // Watch for route/collapsed/items changes to auto-expand active module
  useEffect(() => {
    if (collapsed && !isMobileLayout) return
    const activeItem = items.find(
      (item) => item.show && visibleChildren(item).length > 0 && isModuleActive(item),
    )
    if (activeItem) {
      setExpandedModule(activeItem.label)
      return
    }
    setExpandedModule((prev) => {
      if (!prev) {
        const firstVisible = items.find((item) => item.show)
        return firstVisible?.label ?? null
      }
      return prev
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, collapsed, isMobileLayout, items])

  const toggleModule = (label: string) => {
    setExpandedModule((prev) => (prev === label ? null : label))
  }

  return (
    <aside
      className={[
        'flex h-full shrink-0 flex-col border-r border-[#f3e5a8] bg-[#fff9e8] transition-all duration-200 ease-out dark:border-[#1b2747] dark:bg-[#07122E]',
        collapsed && !isMobileLayout ? 'w-[4.5rem]' : 'w-72',
        'max-lg:w-[min(18rem,calc(100vw-1rem))]',
        'max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-[100] max-lg:max-w-[85vw] max-lg:pt-[env(safe-area-inset-top)]',
        'lg:relative lg:z-auto lg:translate-x-0',
        isMobileLayout && !mobileOpen ? 'max-lg:pointer-events-none max-lg:-translate-x-full' : 'translate-x-0',
      ].join(' ')}
      aria-hidden={isMobileLayout ? (!mobileOpen ? 'true' : 'false') : 'false'}
    >
      <div className={`flex h-16 shrink-0 items-center border-b border-[#f3e5a8] sm:h-20 dark:border-[#1b2747] ${collapsed && !isMobileLayout ? 'justify-center px-2' : 'px-4 sm:px-5'}`}>
        {showLabels ? (
          <p className="text-base font-semibold tracking-wide text-[#0f2743] dark:text-white">Omni Vital</p>
        ) : (
          <p className="mx-auto text-base font-semibold tracking-wide text-[#0f2743] dark:text-white">OV</p>
        )}
      </div>
      <nav className={`flex-1 overflow-y-auto overscroll-contain py-4 sm:py-5 ${collapsed && !isMobileLayout ? 'px-2' : 'px-3 sm:px-4'}`}>
        {showLabels && (
          <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-[#9e8500] dark:text-slate-500">
            Menu
          </p>
        )}
        {items.map((item) => {
          if (!item.show) return null

          const Icon = iconMap[item.label]
          const moduleActive = isModuleActive(item)
          const children = visibleChildren(item)

          return (
            <section key={item.label} className="mb-1">
              <div className="flex items-center gap-1">
                <Link
                  to={item.to}
                  className={[
                    'flex min-h-11 min-w-0 items-center rounded-lg text-base transition touch-manipulation active:opacity-90',
                    !showLabels ? 'w-full justify-center px-0 py-2.5' : 'flex-1 gap-2 px-3 py-2.5',
                    moduleActive
                      ? 'bg-[#FFE14D]/45 font-semibold text-[#0f2743] dark:bg-[#152754] dark:font-normal dark:text-white'
                      : 'text-slate-600 hover:bg-[#fff4c4]/90 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[#101F45] dark:hover:text-white',
                  ].join(' ')}
                  title={!showLabels ? item.label : ''}
                >
                  {Icon && <Icon size={18} className="shrink-0" />}
                  {showLabels && <span className="truncate">{item.displayLabel ?? item.label}</span>}
                </Link>
                {showLabels && children.length > 0 && (
                  <button
                    type="button"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-slate-500 transition touch-manipulation hover:bg-[#fff4c4]/90 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-[#101F45] dark:hover:text-white"
                    onClick={() => toggleModule(item.label)}
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${expandedModule === item.label ? 'rotate-180' : ''}`}
                    />
                  </button>
                )}
              </div>

              {showLabels && children.length > 0 && expandedModule === item.label && (
                <div className="mt-1 space-y-1 pl-2">
                  {children.map((child) => (
                    <Link
                      key={child.to}
                      to={child.to}
                      className={[
                        'flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm transition touch-manipulation active:opacity-90',
                        isChildActive(child.to, child)
                          ? 'bg-[#FFE14D]/45 font-semibold text-[#0f2743] dark:bg-[#152754] dark:font-normal dark:text-white'
                          : 'text-slate-600 hover:bg-[#fff4c4]/90 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[#101F45] dark:hover:text-white',
                      ].join(' ')}
                    >
                      {Icon && <Icon size={16} className="shrink-0" />}
                      <span className="truncate">{child.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </nav>
    </aside>
  )
}
