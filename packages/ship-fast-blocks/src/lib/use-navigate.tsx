import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { useStateField } from '@openuidev/react-lang'
import { signInWithGoogle, signOut } from '@ship-fast/lakebed/react'
import { PreviewUrlBridgeContext } from './preview-url-bridge.tsx'

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

export const scrollToPageTop = () => {
  if (typeof window === 'undefined') return
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

// Auth-intent labels — any button/CTA routing to one of these triggers the REAL
// Shoo/lakebed auth instead of a page switch, so a generated "Sign in"/"Sign up"/
// "Log out" control authenticates for real across EVERY family (kit or inline),
// hero, footer, anywhere — because every block routes through useNavigate.
const SIGN_OUT_INTENT = /\b(sign\s*-?\s*out|log\s*-?\s*out|logout)\b/i
const SIGN_IN_INTENT =
  /\b(sign\s*-?\s*in|log\s*-?\s*in|login|signin|sign\s*-?\s*up|signup|my\s*account|create\s*(?:a\s*|an\s*|your\s*|free\s*)?account)\b/i

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
  if (!routes.length) return rawTarget.startsWith('/') ? rawTarget : undefined

  const resolved = resolveRouteTarget(rawTarget, routes, targetMap)
  if (!resolved) return rawTarget.startsWith('/') ? rawTarget : undefined

  function isResolvedPage(route: string) {
    return normalizeTarget(route) === normalizeTarget(resolved.page)
  }

  const page = routes.find(isResolvedPage) ?? resolved.page
  if (!page || !routes.includes(page)) return undefined

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

export function useRouteHref(target: string | undefined): string | undefined {
  const routing = useContext(RoutesContext)
  const urlBridge = useContext(PreviewUrlBridgeContext)
  return resolveRouteHref(target, routing.routes, routing.targetMap, {
    currentPage: routing.currentPage,
    currentPathname:
      typeof window === 'undefined' ? undefined : window.location.pathname,
    previewBase: urlBridge.navigateToPage !== null,
  })
}

export function useIsActiveRoute(): (target: string | undefined) => boolean {
  const routing = useContext(RoutesContext)
  const urlBridge = useContext(PreviewUrlBridgeContext)

  function isActiveRoute(target: string | undefined) {
    if (typeof window === 'undefined') return false
    const href = resolveRouteHref(target, routing.routes, routing.targetMap, {
      currentPage: routing.currentPage,
      currentPathname: window.location.pathname,
      previewBase: urlBridge.navigateToPage !== null,
    })
    return (
      typeof href === 'string' &&
      new URL(href, window.location.href).href === window.location.href
    )
  }

  return isActiveRoute
}

export function useNavigate() {
  const routing = useContext(RoutesContext)
  const page = useStateField<string>('page')
  const urlBridge = useContext(PreviewUrlBridgeContext)
  function navigate(target?: string) {
    const rawTarget = (target ?? '').trim()
    const t = rawTarget.toLowerCase()
    // Real auth takes precedence over page routing.
    if (SIGN_OUT_INTENT.test(t)) {
      signOut()
      return
    }
    if (SIGN_IN_INTENT.test(t)) {
      void signInWithGoogle({
        returnTo:
          typeof window !== 'undefined'
            ? window.location.pathname +
              window.location.search +
              window.location.hash
            : undefined,
      })
      return
    }
    if (!routing.routes.length) return

    const resolved = resolveRouteTarget(
      rawTarget,
      routing.routes,
      routing.targetMap,
    )
    if (!resolved) {
      console.warn(`[ShipFast] Unresolved navigation target: ${target ?? ''}`)
      return
    }

    function isResolvedPage(route: string) {
      return normalizeTarget(route) === normalizeTarget(resolved.page)
    }

    const nextPage = routing.routes.find(isResolvedPage) ?? resolved.page
    if (!nextPage || !routing.routes.includes(nextPage)) {
      console.warn(`[ShipFast] Unresolved navigation page: ${resolved.page}`)
      return
    }

    routing.setPendingSectionId(
      resolved.type === 'section' ? (resolved.sectionId ?? null) : null,
    )
    routing.setCurrentPage(nextPage)
    page.setValue(nextPage)
    // Push the page slug to the host URL router so the browser URL reflects
    // the active page (mirrors the deployed site's URL structure).
    // Home page (routes[0]) → null → base URL, matching both export builders
    // where index 0 maps to '/'. Other pages → slugifyRoute(label).
    const isHome = nextPage === routing.routes[0]
    urlBridge.navigateToPage?.(isHome ? null : slugifyRoute(nextPage))
    if (resolved.type === 'section' && resolved.sectionId) {
      if (typeof window !== 'undefined')
        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}${window.location.search}#${resolved.sectionId}`,
        )
    } else if (typeof window !== 'undefined') {
      if (window.location.hash) {
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search,
        )
      }
      scrollToPageTop()
    }
  }
  return navigate
}
