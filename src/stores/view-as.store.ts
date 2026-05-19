import { create } from 'zustand'
import { VIEW_AS_OPTIONS, type ViewAsOption } from '@/constants/view-as'
import type { UserRole } from '@/types/auth'

const SELECTED_CONTEXT_KEY = 'omni-vital:selected-context'
const ACTIVE_VIEW_AS_KEY = 'omni-vital:active-view-as'

const ADMIN_ROLES: UserRole[] = ['super_admin', 'hospital_admin']

export const canUseViewAs = (role?: UserRole | null) => Boolean(role && ADMIN_ROLES.includes(role))

export const resolveContextFromRole = (role?: UserRole | null) => {
  if (!role) return null
  if (role === 'medico' || role === 'enfermeiro') return 'equipe_cirurgia'
  return 'equipe_cirurgia'
}

function findOption(id: string | null): ViewAsOption | null {
  if (!id) return null
  return VIEW_AS_OPTIONS.find((option) => option.id === id) ?? null
}

export interface ViewAsState {
  selectedContextId: string | null
  activeViewAsId: string | null
  setSelectedContext: (id: string) => void
  setActiveViewAs: (id: string) => void
  clearContext: () => void
  initializeForRole: (role?: UserRole | null) => void
}

export const useViewAsStore = create<ViewAsState>()((set, get) => ({
  selectedContextId: localStorage.getItem(SELECTED_CONTEXT_KEY),
  activeViewAsId: localStorage.getItem(ACTIVE_VIEW_AS_KEY),

  setSelectedContext: (id: string) => {
    localStorage.setItem(SELECTED_CONTEXT_KEY, id)
    localStorage.setItem(ACTIVE_VIEW_AS_KEY, id)
    set({ selectedContextId: id, activeViewAsId: id })
  },

  setActiveViewAs: (id: string) => {
    localStorage.setItem(ACTIVE_VIEW_AS_KEY, id)
    set({ activeViewAsId: id })
  },

  clearContext: () => {
    localStorage.removeItem(SELECTED_CONTEXT_KEY)
    localStorage.removeItem(ACTIVE_VIEW_AS_KEY)
    set({ selectedContextId: null, activeViewAsId: null })
  },

  initializeForRole: (role?: UserRole | null) => {
    if (!role) return

    const state = get()

    // Preserva contexto escolhido no seletor (demo) para nao sobrescrever no login.
    if (state.selectedContextId) {
      if (!state.activeViewAsId) {
        localStorage.setItem(ACTIVE_VIEW_AS_KEY, state.selectedContextId)
        set({ activeViewAsId: state.selectedContextId })
      }
      return
    }

    if (canUseViewAs(role)) {
      if (!state.selectedContextId) {
        const defaultAdminOption = VIEW_AS_OPTIONS.find((option) => option.context === 'equipe_cirurgia') ?? VIEW_AS_OPTIONS[0]
        if (defaultAdminOption) {
          state.setSelectedContext(defaultAdminOption.id)
        }
      }
      return
    }

    const targetContext = resolveContextFromRole(role)
    const fallbackOption = VIEW_AS_OPTIONS.find((option) => option.context === targetContext) ?? VIEW_AS_OPTIONS[0]

    if (fallbackOption) {
      state.setSelectedContext(fallbackOption.id)
    }
  },
}))

/** Selector: resolved selectedContext option. */
export const selectSelectedContext = (state: ViewAsState) => findOption(state.selectedContextId)

/** Selector: resolved activeViewAs option. */
export const selectActiveViewAs = (state: ViewAsState) => findOption(state.activeViewAsId)

/** Selector: options available for the current context. */
export const selectAvailableByContext = (state: ViewAsState) => {
  const selected = findOption(state.selectedContextId)
  if (!selected) return []
  return VIEW_AS_OPTIONS.filter((option) => option.context === selected.context)
}

/** Selector: all view-as options (for admin). */
export const selectAvailableForAdmin = (_state: ViewAsState) => VIEW_AS_OPTIONS
