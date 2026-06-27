import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { useStateField } from '@openuidev/react-lang'
import { signInWithGoogle, signOut } from '@ship-fast/lakebed/react'

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

const normalizeTarget = (value: string): string => value.trim().toLowerCase()

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

  const exact = routes.find((r) => normalizeTarget(r) === normalized)
  if (exact) return { type: 'page', page: exact }

  const find = (routePattern: RegExp, sectionPattern?: RegExp) => {
    const route = routes.find((r) => routePattern.test(normalizeTarget(r)))
    if (route) return { type: 'page' as const, page: route }
    if (sectionPattern) {
      const entry = Object.values(targetMap)
        .map(parseRouteTarget)
        .find(
          (candidate): candidate is RouteTarget =>
            candidate !== null &&
            typeof candidate.sectionId === 'string' &&
            sectionPattern.test(normalizeTarget(candidate.sectionId)),
        )
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

export function useNavigate() {
  const routing = useContext(RoutesContext)
  const page = useStateField<string>('page')
  return (target?: string) => {
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

    const nextPage =
      routing.routes.find(
        (route) => normalizeTarget(route) === normalizeTarget(resolved.page),
      ) ?? resolved.page
    if (!nextPage || !routing.routes.includes(nextPage)) {
      console.warn(`[ShipFast] Unresolved navigation page: ${resolved.page}`)
      return
    }

    routing.setPendingSectionId(
      resolved.type === 'section' ? (resolved.sectionId ?? null) : null,
    )
    routing.setCurrentPage(nextPage)
    page.setValue(nextPage)
    if (resolved.type === 'section' && resolved.sectionId) {
      if (typeof window !== 'undefined')
        window.history.replaceState(null, '', `#${resolved.sectionId}`)
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
}
