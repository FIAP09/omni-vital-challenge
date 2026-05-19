import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'

interface SidebarContextType {
  isExpanded: boolean
  isMobileOpen: boolean
  isHovered: boolean
  activeItem: string | null
  openSubmenu: string | null
  toggleSidebar: () => void
  toggleMobileSidebar: () => void
  setIsHovered: (isHovered: boolean) => void
  setActiveItem: (item: string | null) => void
  toggleSubmenu: (item: string) => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const location = useLocation()

  const [isExpanded, setIsExpanded] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isHovered, setIsHoveredState] = useState(false)
  const [activeItem, setActiveItemState] = useState<string | null>(null)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setIsMobileOpen(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Auto-close sidebar on route change (for mobile)
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsMobileOpen((prev) => !prev)
    } else {
      setIsExpanded((prev) => !prev)
    }
  }, [isMobile])

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileOpen((prev) => !prev)
  }, [])

  const setIsHovered = useCallback((value: boolean) => {
    setIsHoveredState(value)
  }, [])

  const setActiveItem = useCallback((item: string | null) => {
    setActiveItemState(item)
  }, [])

  const toggleSubmenu = useCallback((item: string) => {
    setOpenSubmenu((prev) => (prev === item ? null : item))
  }, [])

  const contextValue = useMemo<SidebarContextType>(() => ({
    isExpanded: isMobile ? false : isExpanded,
    isMobileOpen,
    isHovered,
    activeItem,
    openSubmenu,
    toggleSidebar,
    toggleMobileSidebar,
    setIsHovered,
    setActiveItem,
    toggleSubmenu,
  }), [
    isMobile,
    isExpanded,
    isMobileOpen,
    isHovered,
    activeItem,
    openSubmenu,
    toggleSidebar,
    toggleMobileSidebar,
    setIsHovered,
    setActiveItem,
    toggleSubmenu,
  ])

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar(): SidebarContextType {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error(
      'useSidebar must be used within a component that has SidebarProvider as an ancestor',
    )
  }
  return context
}
