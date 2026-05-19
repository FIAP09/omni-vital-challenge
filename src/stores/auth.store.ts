import { create } from 'zustand'
import { authService } from '@/services/auth.service'
import { useViewAsStore } from '@/stores/view-as.store'
import type { LoginPayload, User } from '@/types/auth'

const TOKEN_KEY = 'omni-vital:token'

interface AuthState {
  token: string
  user: User | null
  loading: boolean
  login: (payload: LoginPayload) => Promise<void>
  loadCurrentUser: () => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  token: localStorage.getItem(TOKEN_KEY) || '',
  user: null,
  loading: false,

  login: async (payload: LoginPayload) => {
    set({ loading: true })
    const viewAs = useViewAsStore.getState()

    try {
      const response = await authService.login(payload)
      const profile = await authService.me(response.access_token)

      localStorage.setItem(TOKEN_KEY, response.access_token)
      set({ token: response.access_token, user: profile })
      viewAs.initializeForRole(profile.role)
    } catch (error) {
      get().logout()
      throw error
    } finally {
      set({ loading: false })
    }
  },

  loadCurrentUser: async () => {
    const { token } = get()
    if (!token) return
    const viewAs = useViewAsStore.getState()
    const user = await authService.me(token)
    set({ user })
    viewAs.initializeForRole(user.role)
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ token: '', user: null })
  },
}))

/** Selector: whether the user is authenticated (has a token). */
export const selectIsAuthenticated = (state: AuthState) => Boolean(state.token)
