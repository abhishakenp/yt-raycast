import { getRouteApi, useRouterState } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Dashboard } from '@/features/dashboard/components/Dashboard'
import {
  PreviewUrlBridgeContext,
  type PreviewUrlBridgeValue,
} from '@ship-fast/blocks/runtime'

const generateRouteApi = getRouteApi('/generate/$sessionId/$')

/**
 * Extract the page slug from the URL path after the session base.
 * `/generate/<sessionId>` → null (home)
 * `/generate/<sessionId>/pricing` → 'pricing'
 * `/generate/<sessionId>/blog/post-1` → 'blog' (first segment only)
 */
export function extractSlugFromPath(
  pathname: string,
  sessionId: string,
): string | null {
  const prefix = `/generate/${sessionId}/`
  if (!pathname.startsWith(prefix)) return null
  const rest = pathname.slice(prefix.length)
  if (!rest) return null
  // Take the first segment only — the slug is a single path segment
  // matching the export builder's `/${slugifyRoute(label)}` convention.
  const firstSegment = rest.split('/')[0]
  return firstSegment || null
}

export const GenerateRoute = () => {
  const { sessionId } = generateRouteApi.useParams()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  // Track the current page slug in local state. Initialized from the URL
  // on mount, updated on pushState (in-app navigation) and popstate
  // (browser back/forward). This avoids TanStack Router route transitions
  // for page changes — matching the Lakebed deployment's pushState pattern.
  const [pageFromUrl, setPageFromUrl] = useState<string | null>(() =>
    typeof window !== 'undefined'
      ? extractSlugFromPath(window.location.pathname, sessionId)
      : null,
  )

  // Sync state when the URL changes via browser back/forward.
  useEffect(() => {
    const onPopState = () => {
      setPageFromUrl(extractSlugFromPath(window.location.pathname, sessionId))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [sessionId])

  useEffect(() => {
    setPageFromUrl(extractSlugFromPath(pathname, sessionId))
  }, [pathname, sessionId])

  const navigateToPage = useCallback(
    (pageSlug: string | null) => {
      const baseUrl = `/generate/${sessionId}`
      const targetUrl = pageSlug ? `${baseUrl}/${pageSlug}` : baseUrl
      // pushState does NOT fire popstate — TanStack Router won't intervene,
      // so this is instant with no route transition overhead.
      window.history.pushState(null, '', targetUrl)
      setPageFromUrl(pageSlug)
    },
    [sessionId],
  )

  const bridgeValue = useMemo<PreviewUrlBridgeValue>(
    () => ({
      navigateToPage,
      pageFromUrl,
    }),
    [navigateToPage, pageFromUrl],
  )

  return (
    <PreviewUrlBridgeContext.Provider value={bridgeValue}>
      <Dashboard sessionId={sessionId} />
    </PreviewUrlBridgeContext.Provider>
  )
}
