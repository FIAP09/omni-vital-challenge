import { useMemo, useCallback } from 'react'
import {
  canAccessModule,
  canAccessSubmodule,
  userModuleGrants,
  type AppModule,
  type AppSubmodule,
} from '@/constants/access-control'
import { useAuthStore } from '@/stores/auth.store'
import {
  canUseViewAs,
  resolveContextFromRole,
  useViewAsStore,
  selectActiveViewAs,
  selectSelectedContext,
  selectAvailableForAdmin,
} from '@/stores/view-as.store'

export function useViewAs() {
  const user = useAuthStore((s) => s.user)
  const activeViewAsOption = useViewAsStore(selectActiveViewAs)
  const selectedContextOption = useViewAsStore(selectSelectedContext)
  const availableForAdmin = useViewAsStore(selectAvailableForAdmin)
  const setActiveViewAs = useViewAsStore((s) => s.setActiveViewAs)

  const isAdmin = useMemo(() => canUseViewAs(user?.role), [user?.role])

  const currentContext = useMemo(() => {
    return activeViewAsOption?.context ?? selectedContextOption?.context ?? resolveContextFromRole(user?.role)
  }, [activeViewAsOption, selectedContextOption, user?.role])

  const activeViewAs = useMemo(() => {
    return isAdmin ? activeViewAsOption : selectedContextOption
  }, [isAdmin, activeViewAsOption, selectedContextOption])

  const options = useMemo(() => {
    return isAdmin ? availableForAdmin : []
  }, [isAdmin, availableForAdmin])

  const canModule = useCallback((moduleName: AppModule) => {
    if (!user || !currentContext) return false
    return canAccessModule(user.role, currentContext, moduleName, userModuleGrants(user))
  }, [user, currentContext])

  const canSubmodule = useCallback((submoduleName: AppSubmodule) => {
    if (!user || !currentContext) return false
    return canAccessSubmodule(user.role, currentContext, submoduleName, userModuleGrants(user))
  }, [user, currentContext])

  return {
    isAdmin,
    currentContext,
    activeViewAs,
    options,
    canModule,
    canSubmodule,
    setActiveViewAs,
  }
}
