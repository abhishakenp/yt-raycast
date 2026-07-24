import { getRouteApi, useRouterState } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { SessionPreviewPage } from '@/features/dashboard/components/SessionPreviewPage'
import {
  PreviewUrlBridgeContext,
  type PreviewUrlBridgeValue,
} from '@ship-fast/blocks/runtime'

const subdomainRouteApi = getRouteApi('/deployed/$slug')

/**
 * Extract the page slug from a deployment subdomain URL path.
 * `/` → null (home), `/about` → 'about', `/blog/post-1` → 'blog' (first
 * segment only, matching the export builder's `/${slugifyRoute(label)}`
 * convention used by the in-app preview route).
 */
export function extractSubdomainPageSlugFromPath(
  pathname: string,
): string | null {
  if (pathname === '/' || pathname === '') return null
  const trimmed = pathname.replace(/^\/+/, '')
  if (!trimmed) return null
  const firstSegment = trimmed.split('/')[0]
  return firstSegment || null
}

export const SubdomainPreviewRoute = () => {
  const { slug } = subdomainRouteApi.useParams()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const [pageFromUrl, setPageFromUrl] = useState<string | null>(() =>
    typeof window !== 'undefined'
      ? extractSubdomainPageSlugFromPath(window.location.pathname)
      : null,
  )

  useEffect(() => {
    const onPopState = () => {
      setPageFromUrl(extractSubdomainPageSlugFromPath(window.location.pathname))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    // The router's internal pathname is `/deployed/<slug>/<rest>`; the browser
    // URL is `/<rest>`. Read the page slug from the browser URL so pushState
    // nav and back/forward stay on the clean subdomain path.
    setPageFromUrl(
      typeof window !== 'undefined'
        ? extractSubdomainPageSlugFromPath(window.location.pathname)
        : extractSubdomainPageSlugFromPath(pathname),
    )
  }, [pathname])

  const navigateToPage = useCallback((pageSlug: string | null) => {
    // Keep the browser URL on the subdomain root (`/`) or `/<pageSlug>` — never
    // leak the internal `/deployed/<slug>` prefix or a session id.
    const targetUrl = pageSlug ? `/${pageSlug}` : '/'
    window.history.pushState(null, '', targetUrl)
    setPageFromUrl(pageSlug)
  }, [])

  const bridgeValue = useMemo<PreviewUrlBridgeValue>(
    () => ({
      navigateToPage,
      pageFromUrl,
    }),
    [navigateToPage, pageFromUrl],
  )

  return (
    <PreviewUrlBridgeContext.Provider value={bridgeValue}>
      <SessionPreviewPage
        key={`${slug}:${pageFromUrl ?? 'home'}`}
        sessionId={slug}
      />
    </PreviewUrlBridgeContext.Provider>
  )
}
