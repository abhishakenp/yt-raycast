import { createContext, type Dispatch, type SetStateAction } from 'react'

export type RouteTarget = {
  type: 'page' | 'section'
  page: string
  sectionId?: string
}

export type RoutesContextValue = {
  routes: string[]
  currentPage: string
  setCurrentPage: (page: string) => void
  pendingSectionId: string | null
  setPendingSectionId: Dispatch<SetStateAction<string | null>>
  /** Page IDs parallel to routes — used for URL slug generation. */
  pageIds: string[]
}

export const RoutesContext = createContext<RoutesContextValue>({
  routes: [],
  currentPage: '',
  setCurrentPage: () => {},
  pendingSectionId: null,
  setPendingSectionId: () => {},
  pageIds: [],
})

/**
 * Provides `setPage` — the OpenUI runtime's `$page` state setter — to nav
 * components outside the `<Renderer>` tree. `PageSwitch` populates this when
 * it renders (it calls `useStateField('page')` inside a Renderer). Nav link
 * click handlers read from this context instead of calling `useStateField`
 * directly, so they don't crash when rendered in isolation (unit tests,
 * storybook) without a Renderer.
 */
export const PageStateContext = createContext<{
  setPage: (page: string) => void
}>({ setPage: () => {} })

function normalizeTarget(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export function parseRouteTarget(
  value: string | null | undefined,
): RouteTarget | null {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw) return null
  const hash = raw.indexOf('#')
  if (hash >= 0) {
    const page = raw.slice(0, hash).trim()
    const sectionId = raw.slice(hash + 1).trim()
    if (page && sectionId) return { type: 'section', page, sectionId }
    if (sectionId) return { type: 'section', page: '', sectionId }
    return null
  }
  return { type: 'page', page: raw }
}

export function resolveRouteTarget(
  target: string | null | undefined,
  routes: string[],
): RouteTarget | null {
  const normalized = normalizeTarget(target)
  if (!normalized) return null

  // 1. Exact case-insensitive match against route names.
  //    The routes array IS the source of truth — display labels are route
  //    names, URL slugs are derived via slugifyRoute, pages are positional.
  function isExactRoute(route: string) {
    return normalizeTarget(route) === normalized
  }
  const exact = routes.find(isExactRoute)
  if (exact) return { type: 'page', page: exact }

  // 2. Commerce mutation phrases (add/remove from cart, checkout actions) are
  //    not navigation — they mutate shared client state.
  if (isCommerceMutationPhrase(normalized)) return null

  // 3. Single-route sites: everything resolves to the one route.
  const singleRoute = routes.length === 1 ? routes[0] : undefined
  return singleRoute ? { type: 'page', page: singleRoute } : null
}

const COMMERCE_MUTATION_RE =
  /\b(?:add|remove|update|delete)\b.*\b(?:to|from|in)\b.*\bcart\b|\b(?:checkout|place order|complete order|submit order)\b/

function isCommerceMutationPhrase(normalizedTarget: string): boolean {
  return COMMERCE_MUTATION_RE.test(normalizedTarget)
}

export function slugifyRoute(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'page'
  )
}

function fallbackHref(target: string): string {
  return target.startsWith('/') ? target : `#${slugifyRoute(target)}`
}

function previewBasePath(currentPathname: string, currentPage: string): string {
  const pageSlug = slugifyRoute(currentPage)
  if (!pageSlug || !currentPathname.endsWith(`/${pageSlug}`)) {
    return currentPathname || '/'
  }
  return currentPathname.slice(0, -pageSlug.length - 1) || '/'
}

export function resolveRouteHref(
  target: string | null | undefined,
  routes: string[],
  options: {
    currentPage?: string
    currentPathname?: string
    previewBase?: boolean
    pageIds?: string[]
  } = {},
): string | undefined {
  const rawTarget = (target ?? '').trim()
  if (!rawTarget) return undefined
  if (
    /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(rawTarget) ||
    rawTarget.startsWith('#')
  ) {
    return rawTarget
  }
  if (!routes.length) return fallbackHref(rawTarget)

  const resolved = resolveRouteTarget(rawTarget, routes)
  if (!resolved) return fallbackHref(rawTarget)
  const resolvedPage = resolved.page

  function isResolvedPage(route: string) {
    return normalizeTarget(route) === normalizeTarget(resolvedPage)
  }

  const page = routes.find(isResolvedPage) ?? resolvedPage
  if (!page || !routes.includes(page)) return fallbackHref(rawTarget)

  // Use page ID slug when available (stable identifier), fall back to
  // nav label slug for backward compatibility.
  const routeIdx = routes.indexOf(page)
  const pageId = options.pageIds?.[routeIdx]
  const path = page === routes[0] ? '/' : `/${slugifyRoute(pageId ?? page)}`
  const hash =
    resolved.type === 'section' && resolved.sectionId
      ? `#${resolved.sectionId}`
      : ''
  if (!options.previewBase) return `${path}${hash}`

  const currentPathname = options.currentPathname ?? '/'
  const currentPage = options.currentPage ?? routes[0] ?? ''
  const base = previewBasePath(currentPathname, currentPage)
  if (path === '/') return `${base}${hash}`
  return `${base.replace(/\/$/, '')}${path}${hash}`
}
