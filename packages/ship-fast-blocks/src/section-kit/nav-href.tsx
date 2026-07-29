import * as React from 'react'

import {
  PageStateContext,
  resolveRouteHref,
  resolveRouteTarget,
  RoutesContext,
  slugifyRoute,
  type RoutesContextValue,
} from '#/lib/route-context.tsx'
import { PreviewUrlBridgeContext } from '#/lib/preview-url-bridge.tsx'

const DEFAULT_ROUTES_CONTEXT: RoutesContextValue = {
  routes: [],
  currentPage: '',
  setCurrentPage: () => {},
  pendingSectionId: null,
  setPendingSectionId: () => {},
}

const FallbackRoutesContext = React.createContext<RoutesContextValue>(
  DEFAULT_ROUTES_CONTEXT,
)
const SectionKitNavBaseContext = React.createContext<string | null>(null)
const leadingHashPattern = new RegExp('^#')

function normalizeBasePath(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/'
}

export function resolveSectionKitNavBasePath({
  currentPathname,
  routes,
}: {
  currentPathname: string
  routes: string[]
}): string {
  const pathname = normalizeBasePath(currentPathname)
  if (!routes.length) {
    return pathname
  }

  const pageSlugs = new Set(routes.slice(1).map(slugifyRoute))
  const lastSegment = pathname.split('/').filter(Boolean).at(-1)
  if (!lastSegment || !pageSlugs.has(lastSegment)) return pathname

  const pageSuffix = `/${lastSegment}`
  if (pathname === pageSuffix) return '/'
  return normalizeBasePath(pathname.slice(0, -pageSuffix.length))
}

function appendBasePath(
  href: string | undefined,
  basePath: string | null,
): string | undefined {
  if (!href || !basePath || !href.startsWith('/')) return href
  const base = normalizeBasePath(basePath)
  if (base === '/') return href
  if (href === base || href.startsWith(`${base}/`)) return href
  return href === '/' ? base : `${base}${href}`
}

function normalizePathname(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/'
}

function isActiveHref(href: string): boolean {
  if (typeof window === 'undefined' || !window.location) return false
  const current = new URL(window.location.href)
  const target = new URL(href, window.location.href)
  if (
    normalizePathname(current.pathname) !== normalizePathname(target.pathname)
  ) {
    return false
  }
  return !target.hash || target.hash === current.hash
}

function hrefsMatch(leftHref: string, rightHref: string): boolean {
  if (typeof window === 'undefined' || !window.location) return false
  const left = new URL(leftHref, window.location.href)
  const right = new URL(rightHref, window.location.href)
  if (normalizePathname(left.pathname) !== normalizePathname(right.pathname)) {
    return false
  }
  return !left.hash || left.hash === right.hash
}

function useRoutesContextValue(): RoutesContextValue {
  const context =
    (RoutesContext as React.Context<RoutesContextValue> | undefined) ??
    FallbackRoutesContext
  return React.useContext(context) ?? DEFAULT_ROUTES_CONTEXT
}

export function SectionKitNavHrefProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const routing = useRoutesContextValue()
  const basePath = React.useMemo(() => {
    // In SSR / edge-runtime, `window` may be absent or present without a
    // `location` (e.g. cloudflare workers). Treat both as "no base path".
    if (typeof window === 'undefined' || !window.location) return null
    return resolveSectionKitNavBasePath({
      currentPathname: window.location.pathname,
      routes: routing.routes,
    })
  }, [routing.routes])

  return (
    <SectionKitNavBaseContext.Provider value={basePath}>
      {children}
    </SectionKitNavBaseContext.Provider>
  )
}

export function useSectionKitNavHref(
  target: string | null | undefined,
): string | undefined {
  const resolveHref = useSectionKitNavHrefResolver()
  return resolveHref(target)
}

export function useSectionKitNavHrefResolver(): (
  target: string | null | undefined,
) => string | undefined {
  const routing = useRoutesContextValue()
  const basePath = React.useContext(SectionKitNavBaseContext)
  return React.useCallback(
    (target: string | null | undefined) => {
      const rawTarget = (target ?? '').trim()
      if (!rawTarget) return undefined
      const href = resolveRouteHref(rawTarget, routing.routes, {
        pageIds: routing.pageIds,
      })
      return appendBasePath(href, basePath)
    },
    [basePath, routing.routes, routing.pageIds],
  )
}

export function useIsActiveSectionKitNavHref(): (
  target: string | null | undefined,
) => boolean {
  const resolveHref = useSectionKitNavHrefResolver()
  const routing = useRoutesContextValue()
  const activePageHref = React.useMemo(() => {
    if (!routing.currentPage) return undefined
    return resolveHref(routing.currentPage)
  }, [resolveHref, routing.currentPage])
  return React.useCallback(
    (target: string | null | undefined) => {
      const href = resolveHref(target)
      if (
        typeof window === 'undefined' ||
        !window.location ||
        typeof href !== 'string'
      ) {
        return false
      }
      if (typeof activePageHref === 'string') {
        return hrefsMatch(href, activePageHref)
      }
      return isActiveHref(href)
    },
    [activePageHref, resolveHref],
  )
}

/**
 * Returns a click handler that drives in-preview page switching for a nav
 * link targeting `target`. Mirrors the legacy `useNavigate` behavior:
 * resolves the target to a route page, updates the shared `$page` state and
 * `RoutesContext.currentPage`, and pushes the slug to the host URL bridge when
 * one is active. When no routes context is present (exported/deployed site or
 * isolated component test), the handler is a no-op so the native anchor
 * navigation proceeds.
 *
 * Auth-intent targets are intentionally ignored here — `SignInButton` owns the
 * real auth flow now.
 *
 * Implementation note: `useStateField` requires the generated UI runtime
 * context. SiteNav compound components are also rendered in isolation (unit
 * tests, storybook) without that runtime, so we read the `$page` setter from
 * `PageStateContext` (provided by `PageSwitch`) instead of calling
 * `useStateField` directly. The context defaults to a no-op setter, so
 * isolated renders don't crash.
 */
// Module-level navigation fallback. Tests that mock `#/lib/use-navigate.tsx`
// can set this to intercept section-kit nav clicks when no RoutesContext
// provider is present. In production (exported/deployed sites), this stays
// null and nav clicks on route links are no-ops (native anchor navigation).
let navClickFallback: ((target: string) => void) | null = null

export function setSectionKitNavClickFallback(
  fn: ((target: string) => void) | null,
): void {
  navClickFallback = fn
}

export function useSectionKitNavClick(
  target: string | null | undefined,
): (event: React.MouseEvent) => void {
  const routing = useRoutesContextValue()
  const urlBridge = React.useContext(PreviewUrlBridgeContext)
  const { setPage } = React.useContext(PageStateContext)
  return React.useCallback(
    (event: React.MouseEvent) => {
      const rawTarget = (target ?? '').trim()
      if (!rawTarget) return
      if (!routing.routes.length) {
        // No routes context — use the fallback if set (tests), otherwise
        // let the native anchor navigation proceed.
        if (navClickFallback) {
          event.preventDefault()
          navClickFallback(rawTarget)
        }
        return
      }
      let resolved = resolveRouteTarget(rawTarget, routing.routes)
      if (
        resolved === null &&
        urlBridge.navigateToPage !== null &&
        typeof window !== 'undefined' &&
        window.location &&
        event.currentTarget instanceof HTMLAnchorElement
      ) {
        const targetUrl = new URL(
          event.currentTarget.href,
          window.location.href,
        )
        if (targetUrl.origin === window.location.origin) {
          const matchedRoute = routing.routes.find((route) => {
            const href = resolveRouteHref(route, routing.routes, {
              currentPage: routing.currentPage,
              currentPathname: window.location.pathname,
              previewBase: true,
              pageIds: routing.pageIds,
            })
            if (typeof href !== 'string') return false
            const routeUrl = new URL(href, window.location.href)
            return (
              normalizePathname(routeUrl.pathname) ===
              normalizePathname(targetUrl.pathname)
            )
          })
          if (matchedRoute) {
            const sectionId = targetUrl.hash.replace(leadingHashPattern, '')
            resolved = sectionId
              ? { type: 'section', page: matchedRoute, sectionId }
              : { type: 'page', page: matchedRoute }
          }
        }
      }
      if (!resolved) return
      const nextPage =
        routing.routes.find(
          (route) =>
            route.trim().toLowerCase() === resolved.page.trim().toLowerCase(),
        ) ?? resolved.page
      if (!nextPage || !routing.routes.includes(nextPage)) return

      // In-preview (and test) navigation: a RoutesContext with routes means a
      // PageSwitch is driving the view, so intercept the click and switch the
      // page in-place. Exported/deployed sites have no routes context here and
      // let the native anchor navigation proceed to the real route.
      event.preventDefault()
      routing.setPendingSectionId(
        resolved.type === 'section' ? (resolved.sectionId ?? null) : null,
      )
      routing.setCurrentPage(nextPage)
      setPage(nextPage)
      const isHome = nextPage === routing.routes[0]
      // Use page ID slug for URL when available (stable identifier),
      // fall back to nav label slug for backward compatibility.
      const routeIdx = routing.routes.indexOf(nextPage)
      const pageId = routing.pageIds?.[routeIdx]
      const urlSlug = pageId ? slugifyRoute(pageId) : slugifyRoute(nextPage)
      urlBridge.navigateToPage?.(isHome ? null : urlSlug)
    },
    [routing, setPage, target, urlBridge],
  )
}
