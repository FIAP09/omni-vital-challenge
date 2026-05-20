import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, User } from 'lucide-react'
import { usePatientPersona } from '@/hooks/usePatientPersona'
import { useAuthStore } from '@/stores/auth.store'

interface UserDropdownProps {
  className?: string
}

export default function UserDropdown({ className }: UserDropdownProps) {
  const auth = useAuthStore()
  const navigate = useNavigate()
  const { displayName, displaySubtitle } = usePatientPersona()
  const userName = displayName
  const subtitle = displaySubtitle
  const menuRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen((prev) => !prev)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (!menuRef.current?.contains(target)) {
        closeMenu()
      }
    }

    document.addEventListener('click', onDocumentClick)
    return () => {
      document.removeEventListener('click', onDocumentClick)
    }
  }, [])

  const handleLogout = () => {
    closeMenu()
    auth.logout()
    navigate('/')
  }

  const goToAccount = () => {
    closeMenu()
    navigate('/app/patients/1')
  }

  return (
    <div ref={menuRef} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        className="flex max-w-[min(100%,11rem)] items-center gap-2 rounded-xl bg-transparent px-1 py-2 text-left touch-manipulation hover:bg-slate-200/50 sm:max-w-none sm:gap-3 sm:px-2 dark:hover:bg-slate-800/70"
        onClick={(e) => {
          e.stopPropagation()
          toggleMenu()
        }}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2f6adf] text-sm font-semibold text-white sm:h-8 sm:w-8">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1 sm:min-w-[120px]">
          <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-100">{userName}</p>
          <p className="hidden truncate text-xs text-slate-500 sm:block dark:text-slate-400">{subtitle}</p>
        </div>
        <ChevronDown size={16} className={`shrink-0 text-slate-500 transition-transform dark:text-slate-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-[min(calc(100vw-1.5rem),16rem)] overflow-hidden rounded-2xl border border-slate-700 bg-[#0f1834] shadow-xl sm:min-w-[220px] sm:w-full">
          <button
            className="flex w-full items-center gap-2 border-b border-slate-700 px-4 py-3 text-sm text-slate-200 hover:bg-slate-800/80"
            onClick={goToAccount}
          >
            <User size={16} />
            Minha Conta
          </button>
          <button
            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-slate-800/80"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      )}
    </div>
  )
}
