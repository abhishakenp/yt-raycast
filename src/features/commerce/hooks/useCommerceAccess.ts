import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

// Backs the paid-entitlement CommercePanel: a thin wrapper over the
// customer-isolated commerce Convex API (see convex/commerceInstances.ts).
// Replaces the old credential-based useCommerceController for the new UI —
// that hook still exists for the legacy shared-Medusa provision route, which
// is retired separately (see the plan's decommission sequence).
export function useCommerceAccess(sessionId: string) {
  const access = useQuery(api.commerceInstances.getCommerceAccess, {
    sessionId: sessionId as Id<'sessions'>,
  })
  const enableCommerceMutation = useMutation(api.commerceInstances.enableCommerce)
  const requestAdminSsoMutation = useMutation(
    api.commerceInstances.requestAdminSso,
  )

  const [isEnabling, setIsEnabling] = useState(false)
  const [enableError, setEnableError] = useState<string>()
  const [isOpeningAdmin, setIsOpeningAdmin] = useState(false)
  const [adminError, setAdminError] = useState<string>()

  const enableCommerce = async () => {
    setEnableError(undefined)
    setIsEnabling(true)
    try {
      return await enableCommerceMutation({
        sessionId: sessionId as Id<'sessions'>,
      })
    } catch (error) {
      setEnableError(errorMessage(error, 'Enabling commerce failed.'))
      return undefined
    } finally {
      setIsEnabling(false)
    }
  }

  const openAdmin = async () => {
    setAdminError(undefined)
    setIsOpeningAdmin(true)
    try {
      const result = await requestAdminSsoMutation({
        sessionId: sessionId as Id<'sessions'>,
      })
      if (typeof window !== 'undefined') {
        window.open(result.url, '_blank', 'noopener,noreferrer')
      }
      return result
    } catch (error) {
      setAdminError(errorMessage(error, 'Could not open the admin.'))
      return undefined
    } finally {
      setIsOpeningAdmin(false)
    }
  }

  return {
    access,
    adminError,
    enableCommerce,
    enableError,
    isEnabling,
    isOpeningAdmin,
    openAdmin,
  }
}
