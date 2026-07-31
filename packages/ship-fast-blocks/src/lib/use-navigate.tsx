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
  currentPage: string
  setCurrentPage: (page: string) => void
  pendingSectionId: string | null
  setPendingSectionId: Dispatch<SetStateAction<string | null>>
}

export const RoutesContext = createContext<RoutesContextValue>({
  routes: [],
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
  function isExactRoute(route: string) {
    return normalizeTarget(route) === normalized
  }
  const exact = routes.find(isExactRoute)
  if (exact) return { type: 'page', page: exact }

  // 2. Single-route sites: everything resolves to the one route.
  const singleRoute = routes.length === 1 ? routes[0] : undefined
  return singleRoute ? { type: 'page', page: singleRoute } : null
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
  target: string | null | undefined,
  routes: string[],
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
  if (!routes.length) return rawTarget.startsWith('/') ? rawTarget : rawTarget

  const resolved = resolveRouteTarget(rawTarget, routes)
  if (!resolved) return rawTarget.startsWith('/') ? rawTarget : undefined
  const resolvedPage = resolved.page

  function isResolvedPage(route: string) {
    return normalizeTarget(route) === normalizeTarget(resolvedPage)
  }

  const page = routes.find(isResolvedPage) ?? resolvedPage
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

export function useRouteHref(
  target: string | null | undefined,
): string | undefined {
  const routing = useContext(RoutesContext)
  const urlBridge = useContext(PreviewUrlBridgeContext)
  return resolveRouteHref(target, routing.routes, {
    currentPage: routing.currentPage,
    currentPathname:
      typeof window === 'undefined' ? undefined : window.location.pathname,
    previewBase: urlBridge.navigateToPage !== null,
  })
}

export function useIsActiveRoute(): (
  target: string | null | undefined,
) => boolean {
  const routing = useContext(RoutesContext)
  const urlBridge = useContext(PreviewUrlBridgeContext)

  function isActiveRoute(target: string | null | undefined) {
    if (typeof window === 'undefined') return false
    const href = resolveRouteHref(target, routing.routes, {
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

    const resolved = resolveRouteTarget(rawTarget, routing.routes)
    if (!resolved) {
      console.warn(`[ShipFast] Unresolved navigation target: ${target ?? ''}`)
      return
    }
    const resolvedPage = resolved.page

    function isResolvedPage(route: string) {
      return normalizeTarget(route) === normalizeTarget(resolvedPage)
    }

    const nextPage = routing.routes.find(isResolvedPage) ?? resolvedPage
    if (!nextPage || !routing.routes.includes(nextPage)) {
      console.warn(`[ShipFast] Unresolved navigation page: ${resolvedPage}`)
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
