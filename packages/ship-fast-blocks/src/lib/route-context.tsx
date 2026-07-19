import { createContext, type Dispatch, type SetStateAction } from 'react'

export type RouteTarget = {
  type: 'page' | 'section'
  page: string
  sectionId?: string
}

export type RoutesContextValue = {
  routes: string[]
  targetMap: Record<string, string>
  currentPage: string
  setCurrentPage: (page: string) => void
  pendingSectionId: string | null
  setPendingSectionId: Dispatch<SetStateAction<string | null>>
}

export const RoutesContext = createContext<RoutesContextValue>({
  routes: [],
  targetMap: {},
  currentPage: '',
  setCurrentPage: () => {},
  pendingSectionId: null,
  setPendingSectionId: () => {},
})

function normalizeTarget(value: string): string {
  return value.trim().toLowerCase()
}

export function parseRouteTarget(value: string): RouteTarget | null {
  const raw = value.trim()
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
  target: string,
  routes: string[],
  targetMap: Record<string, string>,
): RouteTarget | null {
  const normalized = normalizeTarget(target)
  const mapped = targetMap[target] ?? targetMap[normalized]
  if (mapped) return parseRouteTarget(mapped)

  function isExactRoute(route: string) {
    return normalizeTarget(route) === normalized
  }

  const exact = routes.find(isExactRoute)
  if (exact) return { type: 'page', page: exact }

  function find(
    routePattern: RegExp,
    sectionPattern?: RegExp,
  ): RouteTarget | null {
    function matchesRoute(route: string) {
      return routePattern.test(normalizeTarget(route))
    }

    const route = routes.find(matchesRoute)
    if (route) return { type: 'page', page: route }
    if (sectionPattern) {
      function isMatchingSection(
        candidate: RouteTarget | null,
      ): candidate is RouteTarget {
        return (
          candidate !== null &&
          typeof candidate.sectionId === 'string' &&
          sectionPattern.test(normalizeTarget(candidate.sectionId))
        )
      }

      const entry = Object.values(targetMap)
        .map(parseRouteTarget)
        .find(isMatchingSection)
      if (entry) return entry
    }
    return null
  }

  return (
    (/program|course|curriculum/.test(normalized) &&
      find(/program|course|curriculum/, /program|curriculum/)) ||
    (/lookbook|collection/.test(normalized) &&
      find(
        /lookbook|collection|shop|product/,
        /lookbook|collection|product/,
      )) ||
    (/speaker|agenda|venue|ticket/.test(normalized) &&
      find(
        /speaker|agenda|venue|ticket|schedule/,
        /speaker|agenda|venue|ticket|schedule/,
      )) ||
    (/amenit/.test(normalized) && find(/amenit/, /amenit/)) ||
    (/room/.test(normalized) && find(/room|booking|reserve/, /room|booking/)) ||
    (/\b(?:book|booking|reserve)\b/.test(normalized) &&
      find(/\b(?:book|booking|reserve)\b|room/, /\bbooking\b|room|contact/)) ||
    (/shop|store|product|buy|cart|order|browse|collection/.test(normalized) &&
      find(
        /shop|store|product|collection|lookbook|menu|work|gallery/,
        /shop|product|collection|lookbook|menu|work|gallery/,
      )) ||
    (/price|plan|pricing|subscribe|upgrade|tier|membership/.test(normalized) &&
      find(/pric|plan|member/, /pricing|membership/)) ||
    (/contact|reach|get in touch|book|reserve|demo|quote|start|join|get started|register/.test(
      normalized,
    ) &&
      find(
        /contact|book|booking|reserve|demo|start|join|ticket|apply/,
        /contact|booking|tickets|apply|cta|subscribe/,
      )) ||
    (/about|story|team|who we are|mission/.test(normalized) &&
      find(/about|team|story/, /about|team|story/)) ||
    (/blog|news|post|article|read|stories|journal|tips/.test(normalized) &&
      find(/blog|news|post|article|stories|tips/, /story|stories|topics/)) ||
    (/feature|service|how it works|learn|explore|tour|class|schedule|trainer|program|course|curriculum|speaker|agenda|venue|amenit|room|lookbook/.test(
      normalized,
    ) &&
      find(
        /feature|service|how|class|schedule|program|course|curriculum|speaker|agenda|venue|amenit|room|lookbook/,
        /feature|service|steps|process|schedule|program|curriculum|speaker|agenda|venue|amenit|room|lookbook/,
      )) ||
    null
  )
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

function routePath(page: string, routes: string[]): string {
  return page === routes[0] ? '/' : `/${slugifyRoute(page)}`
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
  target: string | undefined,
  routes: string[],
  targetMap: Record<string, string>,
  options: {
    currentPage?: string
    currentPathname?: string
    previewBase?: boolean
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

  const resolved = resolveRouteTarget(rawTarget, routes, targetMap)
  if (!resolved) return fallbackHref(rawTarget)

  function isResolvedPage(route: string) {
    return normalizeTarget(route) === normalizeTarget(resolved.page)
  }

  const page = routes.find(isResolvedPage) ?? resolved.page
  if (!page || !routes.includes(page)) return fallbackHref(rawTarget)

  const path = routePath(page, routes)
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
