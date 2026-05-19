import { useCallback } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import type { AppModule } from '@/types/app-access'
import type { UserRole } from '@/types/auth'
import { useViewAs } from './useViewAs'

type Permission = 'view:dashboard' | 'view:surgeries' | 'view:monitor' | 'view:alerts' | 'view:patients'

const rolePermissions: Record<UserRole, Permission[]> = {
  super_admin: ['view:dashboard', 'view:surgeries', 'view:monitor', 'view:alerts', 'view:patients'],
  hospital_admin: ['view:dashboard', 'view:surgeries', 'view:monitor', 'view:alerts', 'view:patients'],
  medico: ['view:dashboard', 'view:surgeries', 'view:monitor', 'view:alerts', 'view:patients'],
  enfermeiro: ['view:dashboard', 'view:surgeries', 'view:monitor', 'view:alerts'],
}

const permissionToModule: Record<Permission, string> = {
  'view:dashboard': 'dashboard',
  'view:surgeries': 'cirurgias',
  'view:monitor': 'monitor',
  'view:alerts': 'alertas',
  'view:patients': 'pacientes',
}

export function usePermission() {
  const user = useAuthStore((s) => s.user)
  const { canModule } = useViewAs()

  const can = useCallback((permission: Permission) => {
    const role = user?.role
    if (!role) return false
    if (!rolePermissions[role].includes(permission)) return false
    return canModule(permissionToModule[permission] as AppModule)
  }, [user?.role, canModule])

  return { can }
}
