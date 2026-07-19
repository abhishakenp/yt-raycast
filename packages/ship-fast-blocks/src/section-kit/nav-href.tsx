import * as React from 'react'

import {
  resolveRouteHref,
  RoutesContext,
  slugifyRoute,
  type RoutesContextValue,
} from '#/lib/route-context.tsx'

const DEFAULT_ROUTES_CONTEXT: RoutesContextValue = {
  routes: [],
  targetMap: {},
  currentPage: '',
  setCurrentPage: () => {},
  pendingSectionId: null,
  setPendingSectionId: () => {},
}

const FallbackRoutesContext = React.createContext<RoutesContextValue>(
  DEFAULT_ROUTES_CONTEXT,
)
const SectionKitNavBaseContext = React.createContext<string | null>(null)

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
    if (typeof window === 'undefined') return null
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
  target: string | undefined,
): string | undefined {
  const resolveHref = useSectionKitNavHrefResolver()
  return resolveHref(target)
}

export function useSectionKitNavHrefResolver(): (
  target: string | undefined,
) => string | undefined {
  const routing = useRoutesContextValue()
  const basePath = React.useContext(SectionKitNavBaseContext)
  return React.useCallback(
    (target: string | undefined) => {
      const href = resolveRouteHref(target, routing.routes, routing.targetMap)
      return appendBasePath(href, basePath)
    },
    [basePath, routing.routes, routing.targetMap],
  )
}

export function useIsActiveSectionKitNavHref(): (
  target: string | undefined,
) => boolean {
  const resolveHref = useSectionKitNavHrefResolver()
  const routing = useRoutesContextValue()
  const activePageHref = React.useMemo(() => {
    if (!routing.currentPage) return undefined
    return resolveHref(routing.currentPage)
  }, [resolveHref, routing.currentPage])
  return React.useCallback(
    (target: string | undefined) => {
      const href = resolveHref(target)
      if (typeof window === 'undefined' || typeof href !== 'string') {
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
