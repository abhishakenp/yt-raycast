import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { LakebedClientRuntime } from '@ship-fast/lakebed/react'
import { GlobeIcon, Loader2Icon, MoonIcon, SunIcon } from 'lucide-react'

import { cn } from '#/lib/utils.ts'
import {
  AccountDropdown,
  AccountDropdownTrigger,
  AccountDropdownContent,
  AccountDropdownLabel,
  AccountDropdownSeparator,
  AccountDropdownSignOut,
  AccountDropdownUnauthenticated,
} from '#/section-kit/AccountDropdown.tsx'
import type {
  govPortalLakebed,
  GrievanceInput,
  VendorInput,
  BidInput,
  RfxPaymentInput,
} from './gov-portal-lakebed.ts'

export type GovPortalLakebed = LakebedClientRuntime<typeof govPortalLakebed>
export type GovLang = 'en' | 'hi'

/** Catalog table names, so sections can safely read before data loads. */
export const GOV_CATALOG_KEYS = [
  'tenders',
  'extensionNotices',
  'corrigendums',
  'cancellationNotices',
  'publicNotices',
  'circulars',
  'employmentNotices',
  'updates',
  'boardMembers',
  'messages',
  'powerPlants',
  'directory',
  'media',
  'newsEvents',
  'downloads',
  'ashReports',
  'importantLinks',
] as const

export type GovCatalogKey = (typeof GOV_CATALOG_KEYS)[number]
export type GovRow = Record<string, unknown>
export type GovCatalog = Record<GovCatalogKey, GovRow[]>

/**
 * Reads the shared GovPortal catalog from Lakebed. When the session hasn't
 * seeded a table (or during SSR / library preview) the caller's prop fallback
 * for that table is used, so every section renders standalone.
 */
export function useGovCatalog(
  lakebed: GovPortalLakebed,
  fallback?: Partial<Record<GovCatalogKey, GovRow[]>>,
): GovCatalog {
  const catalog = lakebed.useQuery('govPortalCatalog') as GovCatalog | null

  return useMemo(() => {
    // Baked catalog (the full tvnl.in data) injected into the client at deploy
    // by the export builder. It is the source of truth for the deployed site —
    // Lakebed's per-context DB state isn't reliably shared between the seed
    // path and the page's queries, so we render from the baked data and treat
    // any live query result as an override when present.
    const baked =
      typeof globalThis !== 'undefined'
        ? (globalThis as { __LAKEBED_GOV_SEED__?: Partial<GovCatalog> })
            .__LAKEBED_GOV_SEED__
        : undefined
    const merged = {} as GovCatalog
    for (const key of GOV_CATALOG_KEYS) {
      const live = catalog?.[key]
      if (live && live.length) merged[key] = live
      else if (baked?.[key]?.length) merged[key] = baked[key] as GovRow[]
      else merged[key] = fallback?.[key] ?? []
    }
    return merged
  }, [catalog, fallback])
}

const STRINGS = {
  home: ['Home', 'होम'],
  tenders: ['Tenders', 'निविदाएँ'],
  notices: ['Notices', 'सूचनाएँ'],
  company: ['The Company', 'कंपनी'],
  power: ['Power Generation', 'विद्युत उत्पादन'],
  sustainability: ['Sustainability', 'सततता'],
  media: ['Media', 'मीडिया'],
  infoDesk: ['Info Desk', 'सूचना डेस्क'],
  contact: ['Contact Us', 'संपर्क करें'],
  vendor: ['Vendor Portal', 'विक्रेता पोर्टल'],
  login: ['Login', 'लॉगिन'],
  signIn: ['Sign in', 'साइन इन करें'],
  career: ['Career', 'कैरियर'],
  events: ['Events', 'कार्यक्रम'],
  readMore: ['Read more', 'और पढ़ें'],
  download: ['Download', 'डाउनलोड'],
  submit: ['Submit', 'जमा करें'],
  search: ['Search', 'खोज'],
  allYears: ['All Financial Years', 'सभी वित्तीय वर्ष'],
} as const

export type GovStringKey = keyof typeof STRINGS

export function pickLang<T>(lang: GovLang, en: T, hi: T): T {
  return lang === 'hi' ? hi : en
}

export const GOV_LANG_STORAGE_KEY = 'gov-portal:lang'
const GOV_LANG_EVENT = 'gov-portal:langchange'

function readStoredLang(): GovLang {
  if (typeof window === 'undefined') return 'en'
  try {
    return window.localStorage.getItem(GOV_LANG_STORAGE_KEY) === 'hi'
      ? 'hi'
      : 'en'
  } catch {
    return 'en'
  }
}

/**
 * Shared language state (EN/HI) held in the browser via localStorage — NOT in
 * Lakebed. A deployed site's Lakebed DB is a single shared store, so DB-backed
 * language would flip the language for every visitor at once and depends on a
 * mutation/query round-trip that a per-visitor UI preference should never need.
 * localStorage keeps the choice per browser and instant; a custom event keeps
 * every section on the page in sync within the same tab.
 */
export function useGovLang(_lakebed?: GovPortalLakebed) {
  const [lang, setLangState] = useState<GovLang>('en')

  useEffect(() => {
    setLangState(readStoredLang())
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<{ lang?: GovLang }>).detail?.lang
      setLangState(
        next === 'hi' ? 'hi' : next === 'en' ? 'en' : readStoredLang(),
      )
    }
    window.addEventListener(GOV_LANG_EVENT, onChange)
    return () => window.removeEventListener(GOV_LANG_EVENT, onChange)
  }, [])

  const setLang = useCallback((next: GovLang) => {
    try {
      window.localStorage.setItem(GOV_LANG_STORAGE_KEY, next)
    } catch {
      // ignore storage failures; still update in-memory + notify listeners
    }
    window.dispatchEvent(
      new CustomEvent(GOV_LANG_EVENT, { detail: { lang: next } }),
    )
    setLangState(next)
  }, [])

  const t = useCallback(
    (key: GovStringKey) => pickLang(lang, STRINGS[key][0], STRINGS[key][1]),
    [lang],
  )

  return { lang, setLang, t, isPending: false }
}

export function GovLanguagePicker({
  className,
}: {
  // Language is a per-browser localStorage preference — no Lakebed runtime
  // needed. `lakebed` is accepted-and-ignored for call-site compatibility.
  lakebed?: GovPortalLakebed
  className?: string
}) {
  const { lang, setLang } = useGovLang()
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-border bg-background/60 p-0.5 text-xs font-medium',
        className,
      )}
    >
      <GlobeIcon className="ml-1 size-3.5 text-muted-foreground" aria-hidden />
      {(['en', 'hi'] as const).map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
          className={cn(
            'rounded-full px-2 py-1 transition-colors',
            lang === code
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {code === 'en' ? 'EN' : 'हिं'}
        </button>
      ))}
    </div>
  )
}

// ---- dark / light mode toggle ----------------------------------------------
// Contract: the whole site's light/dark palettes ship as CSS variables — the
// light palette on `:root` and the dark palette on `.dark` (see the Lakebed
// theme runtime). Toggling the `.dark` class on <html> therefore repaints the
// site with the theme's REAL dark colors. The active mode persists under
// GOV_THEME_STORAGE_KEY (shared with the theme runtime) and a custom event
// keeps multiple toggles / the runtime in sync within the tab.
const GOV_THEME_STORAGE_KEY = 'lakebed:theme-dark'
const GOV_THEME_EVENT = 'lakebed:themechange'
// Editor-only fallback. The standalone deploy has a real `.dark` palette, but
// the editor preview inlines light vars on `.genui-preview` (which out-specifies
// a plain `.dark`), so there we inject an `!important` override scoped to
// `.dark .genui-preview`. On the deployed site no `.genui-preview` exists, so
// this rule never matches and the real theme dark palette wins.
const DEFAULT_DARK_VARS: Record<string, string> = {
  background: '#0b1220',
  foreground: '#e5e9f2',
  card: '#111a2e',
  'card-foreground': '#e5e9f2',
  popover: '#111a2e',
  'popover-foreground': '#e5e9f2',
  primary: '#6366f1',
  'primary-foreground': '#ffffff',
  secondary: '#1e293b',
  'secondary-foreground': '#e5e9f2',
  muted: '#1e293b',
  'muted-foreground': '#9aa8c2',
  accent: '#1f2b45',
  'accent-foreground': '#e5e9f2',
  destructive: '#ef4444',
  'destructive-foreground': '#ffffff',
  border: '#24314a',
  input: '#24314a',
  ring: '#6366f1',
}

const DARK_STYLE_ID = 'gov-portal-editor-dark-vars'

function ensureEditorDarkStyle(vars: Record<string, string>) {
  if (typeof document === 'undefined') return
  const decls = Object.entries(vars)
    .map(([k, v]) => `--${k}: ${v} !important;`)
    .join(' ')
  const css = `.dark .genui-preview { ${decls} color-scheme: dark; }`
  let el = document.getElementById(DARK_STYLE_ID) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = DARK_STYLE_ID
    document.head.appendChild(el)
  }
  if (el.textContent !== css) el.textContent = css
}

function readStoredDark(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const stored = window.localStorage.getItem(GOV_THEME_STORAGE_KEY)
    if (stored === '1') return true
    if (stored === '0') return false
  } catch {
    // fall through
  }
  return (
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  )
}

export function GovDarkModeToggle({
  lakebed,
  className,
}: {
  lakebed?: GovPortalLakebed
  className?: string
}) {
  const { lang } = useGovLang()
  const brand = lakebed
    ? (lakebed.useQuery('govPortalBrand') as { themeDark?: string } | null)
    : null
  const [isDark, setIsDark] = useState(false)

  // Adopt the mode already resolved by the theme runtime (or persisted), and
  // stay in sync if another toggle flips it.
  useEffect(() => {
    setIsDark(readStoredDark())
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<{ dark?: boolean }>).detail?.dark
      if (typeof next === 'boolean') setIsDark(next)
    }
    window.addEventListener(GOV_THEME_EVENT, onChange)
    return () => window.removeEventListener(GOV_THEME_EVENT, onChange)
  }, [])

  // Editor-only fallback palette (see note above). Harmless on the deploy.
  useEffect(() => {
    let vars = DEFAULT_DARK_VARS
    if (brand?.themeDark) {
      try {
        const parsed = JSON.parse(brand.themeDark) as Record<string, string>
        if (parsed && typeof parsed === 'object') {
          vars = { ...DEFAULT_DARK_VARS, ...parsed }
        }
      } catch {
        // ignore malformed palette; fall back to defaults
      }
    }
    ensureEditorDarkStyle(vars)
  }, [brand])

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', next)
      }
      try {
        window.localStorage.setItem(GOV_THEME_STORAGE_KEY, next ? '1' : '0')
      } catch {
        // ignore storage failures
      }
      window.dispatchEvent(
        new CustomEvent(GOV_THEME_EVENT, { detail: { dark: next } }),
      )
      return next
    })
  }, [])

  return (
    <button
      type="button"
      aria-pressed={isDark}
      aria-label={pickLang(
        lang,
        isDark ? 'Switch to light mode' : 'Switch to dark mode',
        isDark ? 'लाइट मोड पर जाएँ' : 'डार्क मोड पर जाएँ',
      )}
      onClick={toggle}
      className={cn(
        'inline-flex size-7 items-center justify-center rounded-full transition-colors hover:opacity-80',
        className,
      )}
    >
      {isDark ? (
        <SunIcon className="size-4" aria-hidden />
      ) : (
        <MoonIcon className="size-4" aria-hidden />
      )}
    </button>
  )
}

export function GovMutationSpinner({ className }: { className?: string }) {
  return (
    <Loader2Icon
      className={cn('size-4 animate-spin', className)}
      aria-hidden="true"
    />
  )
}

export function GovAccountButton({
  lakebed,
  label = 'Account',
  buttonClassName,
  children,
}: {
  lakebed: GovPortalLakebed
  label?: string
  buttonClassName?: string
  children?: ReactNode
}) {
  return (
    <AccountDropdown auth={lakebed}>
      <AccountDropdownTrigger aria-label={label} className={buttonClassName} />
      <AccountDropdownContent>
        <AccountDropdownLabel />
        <AccountDropdownSeparator />
        <AccountDropdownSignOut />
      </AccountDropdownContent>
      <AccountDropdownUnauthenticated>
        {children ?? 'Sign in'}
      </AccountDropdownUnauthenticated>
    </AccountDropdown>
  )
}

// ---- form hooks ------------------------------------------------------------

export function useGrievanceForm(lakebed: GovPortalLakebed) {
  const submitGrievance = lakebed.useMutation('submitGrievance')
  const [submitted, setSubmitted] = useState<string | null>(null)

  const submit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (submitGrievance.isPending) return
      const form = event.currentTarget
      const data = new FormData(form)
      const input: GrievanceInput = {
        name: String(data.get('name') ?? ''),
        email: String(data.get('email') ?? ''),
        mobile: String(data.get('mobile') ?? ''),
        subject: String(data.get('subject') ?? ''),
        description: String(data.get('description') ?? ''),
        address: String(data.get('address') ?? ''),
      }
      if (!input.name.trim() || !input.subject.trim()) return
      await submitGrievance(input)
      setSubmitted(input.subject.trim())
      form.reset()
    },
    [submitGrievance],
  )

  return { submit, submitted, isPending: submitGrievance.isPending }
}

export function useVendorPortal(lakebed: GovPortalLakebed) {
  const registerVendor = lakebed.useMutation('registerVendor')
  const submitBid = lakebed.useMutation('submitBid')
  const createRfxPayment = lakebed.useMutation('createRfxPayment')
  const markRfxPaid = lakebed.useMutation('markRfxPaid')
  const vendors =
    (lakebed.useQuery('govPortalVendors') as Array<
      Record<string, unknown>
    > | null) ?? []
  const bids =
    (lakebed.useQuery('govPortalBids') as Array<
      Record<string, unknown>
    > | null) ?? []
  const payments =
    (lakebed.useQuery('govPortalPayments') as Array<
      Record<string, unknown>
    > | null) ?? []
  const auth = lakebed.useAuth()

  const register = useCallback(
    async (input: VendorInput) => {
      if (registerVendor.isPending) return
      await registerVendor({
        ...input,
        shooUserId: auth?.user?.userId ?? '',
      })
    },
    [registerVendor, auth],
  )

  const bid = useCallback(
    async (input: BidInput) => {
      if (submitBid.isPending) return
      await submitBid(input)
    },
    [submitBid],
  )

  const pay = useCallback(
    async (input: RfxPaymentInput) => {
      if (createRfxPayment.isPending || markRfxPaid.isPending) return
      await createRfxPayment(input)
      // mock gateway: immediately mark the RFx payment paid
      await markRfxPaid(input.rfxNo)
    },
    [createRfxPayment, markRfxPaid],
  )

  return {
    register,
    bid,
    pay,
    vendors,
    bids,
    payments,
    isAuthenticated: Boolean(auth?.isAuthenticated && !auth?.user?.isGuest),
    registerPending: registerVendor.isPending,
    bidPending: submitBid.isPending,
    payPending: createRfxPayment.isPending || markRfxPaid.isPending,
  }
}
