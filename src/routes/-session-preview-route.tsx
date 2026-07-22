import { getRouteApi, useRouterState } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { SessionPreviewPage } from '@/features/dashboard/components/SessionPreviewPage'
import {
  PreviewUrlBridgeContext,
  type PreviewUrlBridgeValue,
} from '@ship-fast/blocks/runtime'

const previewRouteApi = getRouteApi('/preview/$slug')

export function extractPreviewPageSlugFromPath(
  pathname: string,
  previewSlug: string,
): string | null {
  const prefix = `/preview/${previewSlug}/`
  if (!pathname.startsWith(prefix)) return null
  const rest = pathname.slice(prefix.length)
  if (!rest) return null
  const firstSegment = rest.split('/')[0]
  return firstSegment || null
}

export const PreviewRoute = () => {
  const { slug } = previewRouteApi.useParams()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const [pageFromUrl, setPageFromUrl] = useState<string | null>(() =>
    typeof window !== 'undefined'
      ? extractPreviewPageSlugFromPath(window.location.pathname, slug)
      : null,
  )

  useEffect(() => {
    const onPopState = () => {
      setPageFromUrl(
        extractPreviewPageSlugFromPath(window.location.pathname, slug),
      )
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [slug])

  useEffect(() => {
    setPageFromUrl(extractPreviewPageSlugFromPath(pathname, slug))
  }, [pathname, slug])

  const navigateToPage = useCallback(
    (pageSlug: string | null) => {
      const baseUrl = `/preview/${slug}`
      const targetUrl = pageSlug ? `${baseUrl}/${pageSlug}` : baseUrl
      window.history.pushState(null, '', targetUrl)
      setPageFromUrl(pageSlug)
    },
    [slug],
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
      <SessionPreviewPage
        key={`${slug}:${pageFromUrl ?? 'home'}`}
        sessionId={slug}
      />
    </PreviewUrlBridgeContext.Provider>
  )
}
