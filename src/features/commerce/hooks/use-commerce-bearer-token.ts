import { useEffect, useState } from 'react'

import { useOptionalAuth } from '@/shared/auth/use-optional-auth'

type TokenIdentity = 'anonymous' | 'disabled' | 'signed-in'

type CommerceBearerTokenState = {
  bearerToken?: string
  identity: TokenIdentity | null
}

export function useCommerceBearerToken(enabled: boolean): {
  bearerToken?: string
  isReady: boolean
} {
  const { getToken, isLoaded, isSignedIn } = useOptionalAuth()
  const identity: TokenIdentity = !enabled
    ? 'disabled'
    : isSignedIn
      ? 'signed-in'
      : 'anonymous'
  const [state, setState] = useState<CommerceBearerTokenState>(() => ({
    identity: identity === 'signed-in' ? null : identity,
  }))

  useEffect(() => {
    let cancelled = false

    if (!isLoaded) {
      setState({ identity: null })
      return () => {
        cancelled = true
      }
    }

    if (identity !== 'signed-in') {
      setState({ identity })
      return () => {
        cancelled = true
      }
    }

    setState({ identity: null })
    void getToken({ template: 'convex' })
      .then((bearerToken) => {
        if (cancelled) return
        setState({
          ...(bearerToken === null ? {} : { bearerToken }),
          identity: 'signed-in',
        })
      })
      .catch(() => {
        if (cancelled) return
        setState({ identity: 'signed-in' })
      })

    return () => {
      cancelled = true
    }
  }, [getToken, identity, isLoaded])

  return {
    ...(state.bearerToken === undefined
      ? {}
      : { bearerToken: state.bearerToken }),
    isReady: isLoaded && state.identity === identity,
  }
}
