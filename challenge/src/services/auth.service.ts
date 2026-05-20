import type { LoginPayload, LoginResponse, User, UserRole } from '@/types/auth'

const MOCK_TOKEN_PREFIX = 'mock'

export const resolveMockRoleByEmail = (email: string): UserRole => {
  const normalizedEmail = email.toLowerCase()
  if (normalizedEmail.includes('super')) return 'super_admin'
  if (normalizedEmail.includes('admin')) return 'hospital_admin'
  if (normalizedEmail.includes('enfer')) return 'enfermeiro'
  return 'medico'
}

export const resolveMockRoleFromToken = (token: string): UserRole | null => {
  const match = token.match(new RegExp(`^${MOCK_TOKEN_PREFIX}\\.([a-z_]+)\\.token$`))
  if (!match?.[1]) return null

  const role = match[1] as UserRole
  const allowedRoles: UserRole[] = ['super_admin', 'hospital_admin', 'medico', 'enfermeiro']
  return allowedRoles.includes(role) ? role : null
}

const buildMockUser = (role: UserRole, email = 'hugo@hospital.com'): User => ({
  id: 1,
  name: role === 'enfermeiro' ? 'Enf. Hugo Lima' : 'Dr. Hugo Lima',
  email,
  role,
  hospital_id: 1,
  is_active: true,
})

const roleMockFileMap: Record<UserRole, string> = {
  super_admin: '/mocks/auth-me-super-admin.json',
  hospital_admin: '/mocks/auth-me-hospital-admin.json',
  medico: '/mocks/auth-me.json',
  enfermeiro: '/mocks/auth-me-enfermeiro.json',
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    try {
      const res = await fetch('/mocks/auth-login.json')
      if (!res.ok) throw new Error('fetch failed')
      const data: LoginResponse = await res.json()
      // Override with role-aware token based on email
      const role = resolveMockRoleByEmail(payload.email)
      return {
        ...data,
        access_token: `${MOCK_TOKEN_PREFIX}.${role}.token`,
      }
    } catch {
      const role = resolveMockRoleByEmail(payload.email)
      return {
        access_token: `${MOCK_TOKEN_PREFIX}.${role}.token`,
        token_type: 'bearer',
      }
    }
  },

  async me(tokenOverride?: string): Promise<User> {
    const role = tokenOverride ? resolveMockRoleFromToken(tokenOverride) : null
    const resolvedRole = role ?? 'medico'
    const mockFile = roleMockFileMap[resolvedRole]

    try {
      const res = await fetch(mockFile)
      if (!res.ok) throw new Error('fetch failed')
      const data: User = await res.json()
      return data
    } catch {
      return buildMockUser(resolvedRole)
    }
  },
}
