if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

import { checkPromptContentPolicy, CONTENT_POLICY_CLIENT_MESSAGE } from '../lib/content-policy'
import { preferMixedEnglishBcp47FromSnippet } from '../lib/home/mixed-english-hints'
import { preferRomanizedBcp47FromSnippet } from '../config/languages.js'
import { INDIAN_SAMPLE_PROMPTS } from '../lib/home/indian-sample-prompts'
import { LOCAL_DEV_PROMPT_SHORTCUTS } from '../lib/home/sample-prompts'
import { getRandomPrompt } from '../lib/home/random-prompt'
import { withAuthTokenHeader } from '../lib/home/auth-fetch'
import { bindHomepageClerkSignIn } from '../lib/home/clerk-signin'

declare const __SF_DEV_SCRIPTS__: boolean
import { openEmbeddedSession, isMarketingHomePath } from './home-session-embed'

type CurrentUser = unknown | null

type GallerySource = 'public' | 'user'

type GalleryMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasPrev?: boolean
  hasNext?: boolean
}

type SessionItem = {
  id: string
  prompt: string
  homepageReady: boolean
  elapsed: number | null
  cost: number | null
  html?: string | null
}

type StoredAnonSessionEntry = {
  id: string
  prompt: string
  secret?: string
}

type FrancFn = (input: string, options?: { minLength?: number }) => string | null

declare global {
  interface Window {
    __sfAuthFetch?: (url: string, options?: RequestInit) => Promise<Response>
    __sfDelegatedSubmitReady?: boolean
    __sfHomeScriptReady?: boolean
    shipFastDashboardAuth?: {
      getCurrentIdToken?: () => Promise<string>
    }
  }
}

const getTypedElement = <T extends HTMLElement>(id: string): T | null =>
  document.getElementById(id) as T | null

let currentUser: CurrentUser = null
let authResolved = false
let hasSessionResizeListener = false

const openAuthOverlay = () => {
  window.dispatchEvent(new CustomEvent('sf-request-auth-overlay'))
}

bindHomepageClerkSignIn({ win: window, doc: document })

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const bridge = window.__sfAuthFetch
  if (bridge) return bridge(url, options)
  const authedOptions = await withAuthTokenHeader(options, () =>
    window.shipFastDashboardAuth?.getCurrentIdToken?.(),
  )
  return fetch(url, authedOptions)
}

async function showAnonymousApp() {
  if (getGenerationCount() >= GENERATION_LIMIT) {
    try {
      const resp = await fetch('/api/share-bonus')
      if (resp.ok) {
        const data = await resp.json()
        if (data.claimed) shareBonusClaimed = true
      }
    } catch {
      /* ignore */
    }
  }
  updateGenerationCounter()
  syncSubmitButtonState()
  publicGalleryPage = 1
  userGalleryPage = 1
  await hydrateAnonymousOrPublicGallery()
}

async function showApp() {
  updateGenerationCounter()
  syncSubmitButtonState()
  loadSessions()
}

const form = getTypedElement<HTMLFormElement>('prompt-form')!
const input = getTypedElement<HTMLInputElement>('prompt-input')!
const languageSelect = getTypedElement<HTMLSelectElement>('prompt-language')!
const promptLanguageRow = getTypedElement<HTMLElement>('prompt-language-row')!
const submitButton = getTypedElement<HTMLButtonElement>('submit-btn')!
const submitButtonLabel = submitButton?.querySelector('.btn-label') as HTMLElement | null
const logoTagline = getTypedElement<HTMLElement>('logo-tagline')!
const SUBMIT_BTN_DEFAULT_LABEL = 'Generate'
const generationCounter = getTypedElement<HTMLElement>('gen-counter')!
const promptPlaceholder = getTypedElement<HTMLElement>('prompt-placeholder')!
const promptPlaceholderText = getTypedElement<HTMLElement>('prompt-placeholder-text')!
const promptPlaceholderLabel = promptPlaceholder.querySelector(
  '.prompt-placeholder-label',
) as HTMLElement | null
const promptSuggestions = getTypedElement<HTMLElement>('prompt-suggestions')!
const promptSuggestionsList = getTypedElement<HTMLElement>('prompt-suggestions-list')!
const privateGenRow = getTypedElement<HTMLElement>('private-gen-row')!
const privateGenCheckbox = getTypedElement<HTMLInputElement>('private-gen-checkbox')!
const privateGenModal = getTypedElement<HTMLElement>('private-gen-modal')!
const policyBlock = getTypedElement<HTMLElement>('prompt-policy-block')!
const sessionPagination = getTypedElement<HTMLElement>('session-pagination')!
const sessionPaginationActions = getTypedElement<HTMLElement>('session-pagination-actions')!
const sessionPagePrev = getTypedElement<HTMLButtonElement>('session-page-prev')!
const sessionPageNext = getTypedElement<HTMLButtonElement>('session-page-next')!
const sessionPageStatus = getTypedElement<HTMLElement>('session-page-status')!
const GALLERY_PAGE_SIZE = 12
const GALLERY_RESTORE_PAGE_KEY = 'sf_gallery_restore_page'
const GALLERY_RESTORE_SOURCE_KEY = 'sf_gallery_restore_source'
let publicGalleryPage = 1
let userGalleryPage = 1
let gallerySource: GallerySource = 'public'
let galleryLaunchSuspended = false
let galleryMeta: GalleryMeta | null = null
let anonSessionEntriesCacheT = 0
let anonSessionEntriesCacheV: SessionItem[] | null = null
const ANON_SESSION_ENTRIES_TTL_MS = 45_000
const SF_PUBLIC_GALLERY_STALE_MS = 90_000

function consumeGalleryRestore(): { page: number; source: GallerySource | null } {
  const pageRaw = sessionStorage.getItem(GALLERY_RESTORE_PAGE_KEY)
  const sourceRaw = sessionStorage.getItem(GALLERY_RESTORE_SOURCE_KEY)
  if (pageRaw != null) sessionStorage.removeItem(GALLERY_RESTORE_PAGE_KEY)
  if (sourceRaw != null) sessionStorage.removeItem(GALLERY_RESTORE_SOURCE_KEY)
  // Fall back to URL query (?page=&source=) so paginated views are deep-linkable
  // and survive reload / back-forward, not just intra-session restore.
  const urlParams = new URLSearchParams(location.search)
  const urlPage = urlParams.get('page')
  const urlSource = urlParams.get('source')
  const page =
    pageRaw != null
      ? Math.max(1, parseInt(pageRaw, 10) || 1)
      : urlPage != null
        ? Math.max(1, parseInt(urlPage, 10) || 1)
        : 1
  // A public deep-link is just `?page=N` with no `source` (syncGalleryUrl only
  // writes source for the user gallery). Default a bare page to 'public' so
  // reload / deep-link of page>1 restores that page instead of snapping to 1.
  const source =
    sourceRaw === 'user' || sourceRaw === 'public'
      ? sourceRaw
      : urlSource === 'user' || urlSource === 'public'
        ? urlSource
        : urlPage != null || pageRaw != null
          ? 'public'
          : null
  return { page, source }
}
const GENERATION_LIMIT = 2
const GENERATION_LIMIT_WITH_BONUS = 3
const MIN_PROMPT_LENGTH = 15
const PROMPT_LANG_DETECT_MIN_CHARS = 65
const PROMPT_LANG_DETECT_DEBOUNCE_MS = 400
const PROMPT_LANG_DETECT_SNIPPET_MAX = 800
const PROMPT_SUGGEST_MIN_CHARS = 2
const PROMPT_SUGGEST_MAX_SHOW = 4
const PROMPT_SUGGEST_DEBOUNCE_MS = 380
const PREFERRED_LANGUAGE_KEY = 'sf_preferred_language'

const FRANC_ISO639_3_TO_BCP47: Record<string, string> = {
  eng: 'en',
  fra: 'fr',
  ita: 'it',
  spa: 'es',
  deu: 'de',
  nld: 'nl',
  por: 'pt',
  rus: 'ru',
  pol: 'pl',
  tur: 'tr',
  hun: 'hu',
  ces: 'cs',
  slk: 'sk',
  ron: 'ro',
  ell: 'el',
  swe: 'sv',
  dan: 'da',
  fin: 'fi',
  nor: 'no',
  nob: 'nb',
  nno: 'nn',
  ind: 'id',
  jpn: 'ja',
  kor: 'ko',
  zho: 'zh',
  arb: 'ar',
  ara: 'ar',
  pes: 'fa',
  hin: 'hi',
  tam: 'ta',
  tel: 'te',
  kan: 'kn',
  mal: 'ml',
  ben: 'bn',
  mar: 'mr',
  guj: 'gu',
  pan: 'pa',
  ori: 'or',
  asm: 'as',
  urd: 'ur',
  mai: 'mai',
  kok: 'kok',
  mni: 'mni',
  sat: 'sat',
  kas: 'ks',
  doi: 'doi',
  brx: 'brx',
  snd: 'sd',
  san: 'sa',
  nep: 'ne',
}

const PROMPT_DETECT_INDIAN_FRANC = new Set<string>([
  'hin',
  'tam',
  'tel',
  'kan',
  'mal',
  'ben',
  'mar',
  'guj',
  'pan',
  'ori',
  'asm',
  'urd',
  'mai',
  'kok',
  'mni',
  'sat',
  'kas',
  'doi',
  'brx',
  'snd',
  'san',
  'nep',
])

const GENERATE_CTA_BY_LANG: Record<string, string> = {
  en: 'Generate',
  hinglish: 'बनाओ',
  hi: 'बनाएं',
  ta: 'உருவாக்கு',
  te: 'సృష్టించు',
  kn: 'ರಚಿಸಿ',
  ml: 'സൃഷ്ടിക്കുക',
  bn: 'তৈরি করুন',
  mr: 'तयार करा',
  gu: 'બનાવો',
  pa: 'ਬਣਾਓ',
  or: 'ତିଆରି କରନ୍ତୁ',
  as: 'সৃষ্টি কৰক',
  ur: 'پیدا کریں',
  mai: 'बनाब',
  kok: 'तयार करात',
  mni: 'Generate',
  sat: 'ᱛᱮᱭᱟᱨ ᱢᱮ',
  ks: 'تیار کٔرِو',
  doi: 'बनाओ',
  brx: 'सोलोंथाइ',
  sd: 'تيار ڪريو',
  sa: 'जनयतु',
  ne: 'सिर्जना गर्नुहोस्',
  fr: 'Générer',
  it: 'Genera',
  es: 'Generar',
  de: 'Generieren',
  nl: 'Genereren',
  pt: 'Gerar',
  ru: 'Создать',
  pl: 'Generuj',
  tr: 'Oluştur',
  hu: 'Generálás',
  cs: 'Vygenerovat',
  sk: 'Vygenerovať',
  ro: 'Generează',
  el: 'Δημιούργησε',
  sv: 'Generera',
  da: 'Generer',
  fi: 'Luo',
  no: 'Generer',
  nb: 'Generer',
  nn: 'Generer',
  id: 'Hasilkan',
  ja: '生成',
  ko: '생성',
  zh: '生成',
  ar: 'توليد',
  fa: 'تولید',
}

const SHIPFAST_TAGLINE_BY_LANG: Record<string, string> = {
  hinglish: 'तेज़ शिप',
  hi: 'तेज़ भेजें',
  ta: 'விரைவாக அனுப்பு',
  te: 'వేగంగా పంపు',
  kn: 'ವೇಗವಾಗಿ ರವಾನಿಸಿ',
  ml: 'വേഗത്തിൽ അയയ്ക്കുക',
  bn: 'দ্রুত পাঠান',
  mr: 'पटकन पाठवा',
  gu: 'ઝડપથી મોકલો',
  pa: 'ਤੇਜ਼ੀ ਨਾਲ ਭੇਜੋ',
  or: 'ଶୀଘ୍ର ପଠାନ୍ତୁ',
  as: 'দ্ৰুততেৰে পঠাওক',
  ur: 'تیز بھیجیں',
  mai: 'तेजी सँ पठाब',
  kok: 'वेगान पाठयात',
  mni: 'Ship Fast',
  sat: 'ᱞᱚᱜᱚᱱ ᱯᱚᱛᱟᱹᱣ',
  ks: 'ژٕ تٲزیٖ پٲٹٲیو',
  doi: 'तेजी साँ पेजॊ',
  brx: 'थांखो थांफाय',
  sd: 'تڪي سان موڪليو',
  sa: 'शीघ्रं प्रेषय',
  ne: 'छिटो पठाउनुहोस्',
  fr: 'Livraison rapide',
  it: 'Spedizione veloce',
  es: 'Envío veloz',
  de: 'Schnell liefern',
  nl: 'Snel verzenden',
  pt: 'Envio rápido',
  ru: 'Быстрая отправка',
  pl: 'Szybka wysyłka',
  tr: 'Hızlı gönder',
  hu: 'Gyors szállítás',
  cs: 'Rychlé odeslání',
  sk: 'Rýchle odoslanie',
  ro: 'Livrare rapidă',
  el: 'Γρήγορη αποστολή',
  sv: 'Snabb leverans',
  da: 'Hurtig forsendelse',
  fi: 'Nopea toimitus',
  no: 'Rask forsendelse',
  nb: 'Rask forsendelse',
  nn: 'Rask forsendelse',
  id: 'Kirim cepat',
  ja: '迅速発送',
  ko: '빠른 배송',
  zh: '极速发货',
  ar: 'شحن سريع',
  fa: 'ارسال سریع',
}

const PROMPT_HINGLISH_LATIN = new Set<string>(
  `ke liye kaa ki ka ko se par pe aur ya phir bhi ho hai hain hoon hun main tum aap ham hum aapka aapki mere meri apna apni apne kuch sab koi kuchh kitna kab kahan kaise kyun kyo kyon bas fir tab jab banao banaye bana karo karein chahiye chahie milega milegi dekho dekhe suno samjho samajh wala wale wali accha achha achhi theek thik bahut zyada thoda kam sahi galat nahi nahin nhi haan haanji na mat jaldi jald jisse apne apni bas fir woh wo yeh ye koi kabhi kabhi sirf sirf bass reh reho rehi karenge karunga karungi hona honi hoga hogi`.split(
    /\s+/,
  ),
)

const PROMPT_ENGLISH_LEXICON = new Set<string>(
  `the and for with from into about over under this that these those your our their its was were been being have has had do does did will would could should may might can must shall need want like make made makes making take took give gave go went come came see saw know think say said get got use used work worked call called try tried help helped show showed look looked find found keep kept let put set run ran move add added open opened close closed save saved load loaded click tapped type types typed enter enter submit cancel delete edit update create created build built design designed ship fast page home landing site web website internet online digital product products service services customer customers user users client clients team teams member members account accounts login sign signup signin register password email phone contact contacts pricing price plan plans paid free pro premium trial subscribe feature features faq help support docs doc api blog news story stories video image photo photos gallery map maps list lists search filter sort menu nav header footer sidebar modal popover popup button link links form forms field fields input inputs select checkbox radio toggle slider range progress loading spinner toast alert badge pill tag tags label labels chart charts graph graphs stats stat analytics dashboard panel admin profile settings billing payment pay invoice cart checkout order orders shipping delivery pickup return refund coupon discount offer sale deal gift promo subscription monthly yearly gym fitness fit trainer trainers train class classes schedule schedules booking book session sessions ladies women men kids family kid friendly safe safely security secure private public modern clean minimal bold premium luxury brand brands mission vision value values trust trusted review reviews rating ratings hero banner card cards grid layout layouts responsive mobile tablet desktop animation scroll slide gallery tour faq question answer answers step steps guide guides tutorial resource resources download upload share shared invite join community forum chat message messages notify notification notifications push sms otp verify account`.split(
    /\s+/,
  ),
)

const PROMPT_FRENCH_LEXICON = new Set<string>(
  `un une des du de la le les et ou pour avec dans sur sous ce cette ces cet votre vos notre nos leur leurs mon ma mes ton ta tes son sa ses au aux par est sont etre être été avoir avez nous vous ils elles je tu il elle on qui que quoi dont quand comment pourquoi parce plus moins tres très site page accueil boutique restaurant agence marque produit produits service services client clients formulaire contact prix offre offres blog article articles galerie reservation réservation rendez-vous equipe équipe créer cree crée créez generer générer français francaise française rapide moderne élégant elegante responsive mobile application entreprise association école ecole hôtel hotel immobilier portfolio evenement événement`.split(
    /\s+/,
  ),
)

function promptLatinEnglishLean(text: string): { lean: number; en: number; hi: number; n: number } {
  const words = String(text || '')
    .toLowerCase()
    .match(/\b[a-z]{2,}\b/g)
  if (!words || words.length === 0) return { lean: 0, en: 0, hi: 0, n: 0 }
  let en = 0
  let hi = 0
  for (const word of words) {
    if (PROMPT_HINGLISH_LATIN.has(word)) hi += 1
    else if (PROMPT_ENGLISH_LEXICON.has(word)) en += 1
  }
  const rest = words.length - en - hi
  const lean = (en + rest * 0.22) / words.length
  return { lean, en, hi, n: words.length }
}

function promptFrenchScore(text: string): {
  score: number
  hits: number
  words: number
  accented: boolean
} {
  const lower = String(text || '').toLowerCase()
  const accented = /[àâçéèêëîïôûùüÿœæ]/i.test(lower)
  const words = lower.match(/\b[a-zàâçéèêëîïôûùüÿœæ]{2,}\b/g) || []
  let hits = accented ? 2 : 0
  for (const word of words) {
    if (PROMPT_FRENCH_LEXICON.has(word)) hits += 1
  }
  return { score: words.length ? hits / words.length : 0, hits, words: words.length, accented }
}

function preferFrenchCode3ForPrompt(
  snippet: string,
  code3: string | null | undefined,
): string | null | undefined {
  const french = promptFrenchScore(snippet)
  if (french.hits >= 3 && french.score >= 0.18) return 'fra'
  if (french.accented && french.hits >= 2 && french.words >= 4) return 'fra'
  if (code3 === 'eng' && french.hits >= 2 && french.score >= 0.3) return 'fra'
  return code3
}

function resolveFrancCode3ForPrompt(
  snippet: string,
  code3: string | null | undefined,
): string | null | undefined {
  code3 = preferFrenchCode3ForPrompt(snippet, code3)
  if (!code3 || code3 === 'und') return code3
  if (code3 === 'eng' || PROMPT_DETECT_INDIAN_FRANC.has(code3)) return code3
  const { lean, en, hi, n } = promptLatinEnglishLean(snippet)
  if (n < 4) return code3
  if (lean >= 0.36 && en > hi && en >= 4) return 'eng'
  return code3
}

function resolveFrancCode3HinglishPreference(
  snippet: string,
  code3: string | null | undefined,
): string | null | undefined {
  if (!code3 || code3 === 'und') return code3
  if (code3 === 'urd') return code3
  if (PROMPT_DETECT_INDIAN_FRANC.has(code3) && code3 !== 'hin') return code3
  const lower = String(snippet || '').toLowerCase()
  const { hi, en, n } = promptLatinEnglishLean(snippet)
  const hasKeLiye = /\bke\s+liye\b/.test(lower)
  const hasBanao = /\bbanao\b/.test(lower)
  const hinglishStrong =
    hasKeLiye || hi >= 2 || (hi >= 1 && hasBanao) || (n >= 6 && hi >= 2 && hi >= en * 0.35)
  if (hinglishStrong) return 'hinglish'
  if (code3 === 'hin') return 'hin'
  return code3
}

let francLoadPromise: Promise<FrancFn> | null = null
let promptLangDetectTimer: number | null = null
let promptLangDetectToken = 0
let lastPromptTrimLen = 0
let promptLanguageRowUnlocked = false

// Lazy-load franc library only when needed
function getFranc(): Promise<FrancFn> {
  if (!francLoadPromise) {
    francLoadPromise = import('franc-min').then((m) => m.default)
  }
  return francLoadPromise
}
const isLocalDevHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1')
/** True when the browser script was built for non-production (see `build-browser-scripts.ts`) or the page is on a loopback host. LAN IP + production script build → false. */
const isHomeDevPromptsEnabled = (): boolean => {
  if (typeof __SF_DEV_SCRIPTS__ !== 'undefined' && __SF_DEV_SCRIPTS__) return true
  return isLocalDevHost
}
const SAMPLE_PROMPTS: string[] = [
  'A cinematic travel landing page for curated weekend escapes with reviews and fast booking.',
  'A polished SaaS homepage for an AI sales copilot with pipeline analytics and clear pricing.',
  'A premium architecture studio site with immersive case studies, awards, and inquiry scheduling.',
  'A bold ecommerce homepage for handcrafted coffee gear with bundles and subscriptions.',
  'A sleek fintech landing page for founders tracking runway, burn, and investor updates.',
  'A modern fitness club website with class schedules, trainer profiles, and membership plans.',
  ...INDIAN_SAMPLE_PROMPTS,
]

function normalizeLanguageCode(value: unknown): string {
  const v = String(value || '')
    .trim()
    .toLowerCase()
  if (!v) return ''
  if (v === 'hinglish') return 'hinglish'
  if (/^[a-z]{2,8}-en$/.test(v)) return v
  if (/^[a-z]{2,8}-latn$/.test(v)) return v
  return v.split(/[-_]/)[0]
}

function getBrowserLanguageCandidates(): string[] {
  const navigatorLanguages = Array.isArray(navigator.languages) ? navigator.languages : []
  const candidates =
    navigatorLanguages.length > 0 ? navigatorLanguages : [navigator.language].filter(Boolean)
  const normalized = candidates
    .map((entry) => normalizeLanguageCode(entry))
    .filter(Boolean)
    .filter((value, index, self) => self.indexOf(value) === index)

  return normalized
}

function getLanguageDisplayName(code: string): string {
  const normalized = normalizeLanguageCode(code)
  if (!normalized) return 'Language'
  if (typeof Intl === 'undefined' || typeof Intl.DisplayNames === 'undefined') {
    return normalized
  }
  try {
    const display = new Intl.DisplayNames(undefined, { type: 'language' })
    return display.of(normalized) || normalized
  } catch {
    return normalized
  }
}

function getSavedPreferredLanguage(): string | null {
  if (!languageSelect) return null
  const preferred = localStorage.getItem(PREFERRED_LANGUAGE_KEY)
  const normalized = normalizeLanguageCode(preferred)
  if (!normalized) return null
  return Array.from(languageSelect.options).some((option) => option.value === normalized)
    ? normalized
    : null
}

function savePreferredLanguage(language: string): void {
  const normalized = normalizeLanguageCode(language)
  if (!normalized) return
  if (!languageSelect) return
  if (!Array.from(languageSelect.options).some((option) => option.value === normalized)) return
  localStorage.setItem(PREFERRED_LANGUAGE_KEY, normalized)
}

function detectBrowserLanguage(): string {
  if (!languageSelect) return 'en'
  const available = new Set(Array.from(languageSelect.options).map((option) => option.value))
  const storedLanguage = getSavedPreferredLanguage()
  if (storedLanguage && storedLanguage !== 'en') return storedLanguage
  const normalizedCandidates = getBrowserLanguageCandidates()

  const supportedNonEnglishMatch = normalizedCandidates.find(
    (language) => language !== 'en' && available.has(language),
  )
  if (supportedNonEnglishMatch) return supportedNonEnglishMatch

  const browserNonEnglish = normalizedCandidates.find((language) => language !== 'en')
  if (browserNonEnglish) return browserNonEnglish

  if (available.has('en')) return 'en'
  if (Array.from(available).length > 0) return Array.from(available)[0]
  return available.values().next().value || 'en'
}

function focusLanguageOptions(preferredLanguage: string): void {
  if (!languageSelect) return
  const options = Array.from(languageSelect.options)
  const englishOption = options.find((option) => option.value === 'en')
  const preferredOption = options.find((option) => option.value === preferredLanguage)
  if (!englishOption) return

  const normalizedPreferred = normalizeLanguageCode(preferredLanguage)
  const preferredToShow =
    normalizedPreferred && preferredOption && normalizedPreferred !== 'en' ? preferredOption : null
  const customPreferredToShow =
    normalizedPreferred && normalizedPreferred !== 'en' && !preferredOption
      ? new Option(getLanguageDisplayName(normalizedPreferred), normalizedPreferred)
      : null

  languageSelect.innerHTML = ''
  languageSelect.appendChild(englishOption.cloneNode(true))
  if (preferredToShow) languageSelect.appendChild(preferredToShow.cloneNode(true))
  if (customPreferredToShow) languageSelect.appendChild(customPreferredToShow)

  languageSelect.value = normalizedPreferred || 'en'
}

function mergeLanguageOptionsSelect(selectedCode: string): void {
  if (!languageSelect) return
  const normalized = normalizeLanguageCode(selectedCode) || 'en'
  const existing = Array.from(languageSelect.options)
  const englishOpt = existing.find((option) => option.value === 'en')
  if (!englishOpt) return

  const extras = []
  const seen = new Set()
  for (const option of existing) {
    if (option.value === 'en') continue
    if (seen.has(option.value)) continue
    seen.add(option.value)
    extras.push(option)
  }
  if (normalized !== 'en' && !seen.has(normalized)) {
    seen.add(normalized)
    extras.push(new Option(getLanguageDisplayName(normalized), normalized))
  }

  languageSelect.innerHTML = ''
  languageSelect.appendChild(englishOpt.cloneNode(true))
  for (const option of extras) {
    languageSelect.appendChild(option.cloneNode(true))
  }
  languageSelect.value = normalized
}

function applyBrowserPreferredLanguage(): void {
  const nextLanguage = detectBrowserLanguage()
  focusLanguageOptions(nextLanguage)
  if (!languageSelect) return
  languageSelect.value = nextLanguage
}

function resetSubmitCtaLabel(): void {
  if (!submitButtonLabel) return
  submitButtonLabel.textContent = SUBMIT_BTN_DEFAULT_LABEL
  submitButton?.classList.remove('submit-btn--cta-shake')
}

function getLogoTaglineText(bcp47: string): string {
  const key = normalizeLanguageCode(bcp47)
  if (!key || key === 'en') return ''
  const direct = SHIPFAST_TAGLINE_BY_LANG[key]
  if (direct) return direct
  const base = /^([a-z]{2,8})-en$/.exec(key)?.[1]
  return (base && SHIPFAST_TAGLINE_BY_LANG[base]) || ''
}

function resetLogoTagline(): void {
  if (!logoTagline) return
  logoTagline.textContent = ''
  logoTagline.setAttribute('aria-hidden', 'true')
  logoTagline.classList.remove('logo-tagline--in', 'logo-tagline--settled')
}

function playLogoTaglineIn(text: string): void {
  if (!logoTagline) return
  logoTagline.textContent = text
  logoTagline.setAttribute('aria-hidden', 'false')
  logoTagline.classList.remove('logo-tagline--settled', 'logo-tagline--in')
  void logoTagline.offsetWidth
  logoTagline.classList.add('logo-tagline--in')
}

function getGenerateCtaLabel(bcp47: string): string {
  const key = normalizeLanguageCode(bcp47)
  if (!key) return SUBMIT_BTN_DEFAULT_LABEL
  const direct = GENERATE_CTA_BY_LANG[key]
  if (direct) return direct
  const base = /^([a-z]{2,8})-en$/.exec(key)?.[1]
  return (base && GENERATE_CTA_BY_LANG[base]) || SUBMIT_BTN_DEFAULT_LABEL
}

function syncPreferredLanguageUi(): void {
  if (!languageSelect || !promptLanguageRow || !promptLanguageRowUnlocked) return
  if (promptLanguageRow.classList.contains('is-hidden')) return
  if (submitButtonLabel) submitButtonLabel.textContent = getGenerateCtaLabel(languageSelect.value)
  const tag = getLogoTaglineText(languageSelect.value)
  if (tag) playLogoTaglineIn(tag)
  else resetLogoTagline()
}

function playSubmitCtaShake(): void {
  if (!submitButton) return
  submitButton.classList.remove('submit-btn--cta-shake')
  void submitButton.offsetWidth
  submitButton.classList.add('submit-btn--cta-shake')
}

function syncPromptLanguageRowVisibility(): void {
  if (!promptLanguageRow || !languageSelect) return
  const show = input.value.trim().length >= PROMPT_LANG_DETECT_MIN_CHARS
  promptLanguageRow.classList.toggle('is-hidden', !show)
  if (!show) {
    resetSubmitCtaLabel()
    resetLogoTagline()
    if (promptLanguageRowUnlocked) {
      focusLanguageOptions('en')
      languageSelect.value = 'en'
      savePreferredLanguage('en')
    }
    promptLanguageRowUnlocked = false
    return
  }
  if (!promptLanguageRowUnlocked) {
    applyBrowserPreferredLanguage()
    promptLanguageRowUnlocked = true
    syncPreferredLanguageUi()
  }
}

function loadFranc(): Promise<FrancFn> {
  francLoadPromise =
    francLoadPromise ||
    import('franc-min').then((mod) => (mod as any).franc ?? (mod as any).default)
  return francLoadPromise
}

async function detectSnippetLanguageBcp47(fullText: string): Promise<string | null> {
  const snippet = String(fullText || '').slice(0, PROMPT_LANG_DETECT_SNIPPET_MAX)
  const frenchFirst = preferFrenchCode3ForPrompt(snippet, 'und')
  if (frenchFirst === 'fra') return 'fr'
  const fromRomanizedHint = preferRomanizedBcp47FromSnippet(fullText)
  if (fromRomanizedHint) return fromRomanizedHint
  const fromMixedHint = preferMixedEnglishBcp47FromSnippet(fullText)
  if (fromMixedHint) return fromMixedHint
  let franc: FrancFn | undefined
  try {
    franc = await loadFranc()
  } catch {
    return null
  }
  if (typeof franc !== 'function') return null
  let code3: string = franc(snippet, { minLength: 10 }) || 'und'
  if (code3 !== 'und') {
    code3 = resolveFrancCode3ForPrompt(snippet, code3) ?? 'und'
    if (code3 === 'und') code3 = 'eng'
  } else {
    code3 = 'eng'
  }
  code3 = resolveFrancCode3HinglishPreference(snippet, code3) ?? code3
  if (!code3 || code3 === 'und') return null
  const toBcp47 = (resolved: string): string | undefined =>
    resolved === 'hinglish' ? 'hinglish' : FRANC_ISO639_3_TO_BCP47[resolved]
  return toBcp47(code3) || null
}

function runPromptLangDetectAsync(runToken: number, options?: { skipIfUnchanged?: boolean }): void {
  void (async () => {
    if (!languageSelect) return
    if (runToken !== promptLangDetectToken) return
    const currentText = input.value.trim()
    if (currentText.length < PROMPT_LANG_DETECT_MIN_CHARS) return
    if (runToken !== promptLangDetectToken) return
    const bcp47 = await detectSnippetLanguageBcp47(
      currentText.slice(0, PROMPT_LANG_DETECT_SNIPPET_MAX),
    )
    if (!bcp47) return
    if (runToken !== promptLangDetectToken) return
    if (input.value.trim().length < PROMPT_LANG_DETECT_MIN_CHARS) return
    if (options?.skipIfUnchanged) {
      const hasOption = Array.from(languageSelect.options).some(
        (option: HTMLOptionElement) => option.value === bcp47,
      )
      if (languageSelect.value === bcp47 && hasOption) return
    }
    mergeLanguageOptionsSelect(bcp47)
    savePreferredLanguage(bcp47)
    if (submitButtonLabel) {
      submitButtonLabel.textContent = getGenerateCtaLabel(bcp47)
      playSubmitCtaShake()
    }
    const tag = getLogoTaglineText(bcp47)
    if (tag) playLogoTaglineIn(tag)
    else resetLogoTagline()
  })()
}

function schedulePromptLanguageDetect(): void {
  if (!languageSelect) return
  const text = input.value.trim()
  if (text.length < PROMPT_LANG_DETECT_MIN_CHARS) {
    if (promptLangDetectTimer !== null) {
      clearTimeout(promptLangDetectTimer)
      promptLangDetectTimer = null
    }
    promptLangDetectToken += 1
    return
  }
  if (promptLangDetectTimer !== null) {
    clearTimeout(promptLangDetectTimer)
    promptLangDetectTimer = null
  }
  const runToken = ++promptLangDetectToken
  promptLangDetectTimer = window.setTimeout(() => {
    promptLangDetectTimer = null
    runPromptLangDetectAsync(runToken, { skipIfUnchanged: true })
  }, PROMPT_LANG_DETECT_DEBOUNCE_MS)
}

let promptSuggestTimer: number | null = null
let promptSuggestToken = 0
let promptSuggestAbort: AbortController | null = null
let promptSuggestActive: number = -1
let promptSuggestRows: string[] = []
let promptSuggestOpen = false

function escapeSuggestHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatSuggestRowHtml(full: string, qLen: number): string {
  return `${escapeSuggestHtml(full.slice(0, qLen))}<mark>${escapeSuggestHtml(full.slice(qLen))}</mark>`
}

function setPromptSuggestActive(next: number): void {
  if (!promptSuggestionsList) return
  const items = promptSuggestionsList.querySelectorAll('.prompt-suggestions-item')
  const n = items.length
  if (n === 0) return
  const idx = ((next % n) + n) % n
  promptSuggestActive = idx
  items.forEach((el, i) => el.classList.toggle('is-active', i === idx))
  input.setAttribute('aria-activedescendant', `prompt-suggest-${idx}`)
}

function closePromptSuggestions(): void {
  promptSuggestOpen = false
  promptSuggestActive = -1
  promptSuggestRows = []
  if (promptSuggestions) {
    promptSuggestions.classList.remove('is-open')
    promptSuggestions.hidden = true
  }
  if (promptSuggestionsList) promptSuggestionsList.innerHTML = ''
  input.removeAttribute('aria-activedescendant')
}

function renderPromptSuggestions(rows: string[], queryLen: number): void {
  if (!promptSuggestions || !promptSuggestionsList) return
  if (rows.length === 0) {
    closePromptSuggestions()
    return
  }
  promptSuggestRows = rows
  promptSuggestOpen = true
  promptSuggestions.hidden = false
  promptSuggestionsList.innerHTML = ''
  rows.forEach((text, i) => {
    const li = document.createElement('li')
    li.className = 'prompt-suggestions-item'
    li.setAttribute('role', 'option')
    li.id = `prompt-suggest-${i}`
    li.innerHTML = formatSuggestRowHtml(text, queryLen)
    li.addEventListener('mousedown', (event) => {
      event.preventDefault()
      applyPromptSuggestion(text)
    })
    promptSuggestionsList.appendChild(li)
  })
  setPromptSuggestActive(0)
  requestAnimationFrame(() => promptSuggestions.classList.add('is-open'))
}

function applyPromptSuggestion(fullText: string): void {
  closePromptSuggestions()
  input.value = fullText
  hidePolicyViolation()
  validatePrompt(false)
  syncSamplePromptVisibility()
  syncSubmitButtonState()
  const prev = lastPromptTrimLen
  const t = input.value.trim()
  const crossed = prev < PROMPT_LANG_DETECT_MIN_CHARS && t.length >= PROMPT_LANG_DETECT_MIN_CHARS
  lastPromptTrimLen = t.length
  syncPromptLanguageRowVisibility()
  if (crossed) {
    if (promptLangDetectTimer !== null) {
      clearTimeout(promptLangDetectTimer)
      promptLangDetectTimer = null
    }
    const runToken = ++promptLangDetectToken
    requestAnimationFrame(() => runPromptLangDetectAsync(runToken, { skipIfUnchanged: false }))
  } else {
    schedulePromptLanguageDetect()
  }
  input.focus()
}

async function fetchPromptSuggestionsFromApi(
  raw: string,
  runToken: number,
  signal: AbortSignal,
): Promise<void> {
  const q = raw.trim()
  const qLen = q.length
  if (qLen < PROMPT_SUGGEST_MIN_CHARS) {
    closePromptSuggestions()
    return
  }
  if (document.activeElement !== input) {
    closePromptSuggestions()
    return
  }
  try {
    const resp = await authFetch('/api/prompt-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partial: q }),
      signal,
    })
    if (runToken !== promptSuggestToken) return
    if (!resp.ok) {
      closePromptSuggestions()
      return
    }
    const data = await resp.json()
    if (runToken !== promptSuggestToken) return
    const rows = Array.isArray(data.suggestions)
      ? data.suggestions
          .filter((x: unknown): x is string => typeof x === 'string')
          .slice(0, PROMPT_SUGGEST_MAX_SHOW)
      : []
    renderPromptSuggestions(rows, qLen)
  } catch (err) {
    if ((err as { name?: string })?.name === 'AbortError') return
    if (runToken !== promptSuggestToken) return
    closePromptSuggestions()
  }
}

function schedulePromptSuggestUpdate(): void {
  if (promptSuggestTimer !== null) {
    clearTimeout(promptSuggestTimer)
    promptSuggestTimer = null
  }
  if (promptSuggestAbort) {
    promptSuggestAbort.abort()
    promptSuggestAbort = null
  }
  const runToken = ++promptSuggestToken
  const ac = new AbortController()
  promptSuggestAbort = ac
  promptSuggestTimer = window.setTimeout(() => {
    promptSuggestTimer = null
    if (runToken !== promptSuggestToken) return
    if (document.activeElement !== input) {
      closePromptSuggestions()
      return
    }
    const raw = input.value
    const q = raw.trim()
    if (q.length < PROMPT_SUGGEST_MIN_CHARS) {
      closePromptSuggestions()
      return
    }
    void fetchPromptSuggestionsFromApi(raw, runToken, ac.signal)
  }, PROMPT_SUGGEST_DEBOUNCE_MS)
}

let samplePromptIndex = 0
let samplePromptLength = 0
let samplePromptMode: 'typing' | 'holding' | 'deleting' = 'typing'
let samplePromptTimer: number | null = null

function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function renderSamplePrompt(): void {
  promptPlaceholderText.textContent = SAMPLE_PROMPTS[samplePromptIndex].slice(0, samplePromptLength)
}

function stopSamplePromptAnimation(): void {
  if (samplePromptTimer !== null) {
    window.clearTimeout(samplePromptTimer)
    samplePromptTimer = null
  }
}

function scheduleSamplePromptStep(delay: number): void {
  stopSamplePromptAnimation()
  samplePromptTimer = window.setTimeout(stepSamplePromptAnimation, delay)
}

function syncSamplePromptVisibility(): void {
  const hasValue = input.value.length > 0

  if (hasValue) {
    if (promptPlaceholderLabel) promptPlaceholderLabel.textContent = 'Your prompt'
    promptPlaceholderText.textContent = ''
    promptPlaceholder.classList.add('label-only')
    promptPlaceholder.classList.remove('is-hidden')
    stopSamplePromptAnimation()
    return
  }

  if (promptPlaceholderLabel) promptPlaceholderLabel.textContent = 'Try a prompt like'
  promptPlaceholder.classList.remove('label-only')
  promptPlaceholder.classList.remove('is-hidden')

  if (samplePromptTimer === null) {
    scheduleSamplePromptStep(samplePromptLength === 0 ? 320 : 80)
  }
}

function resetPromptForNextGeneration(): void {
  if (!input) return
  input.value = ''
  input.removeAttribute('aria-invalid')
  closePromptSuggestions()
  hidePolicyViolation()
  stopSamplePromptAnimation()
  samplePromptLength = 0
  samplePromptMode = 'typing'
  renderSamplePrompt()
  syncSamplePromptVisibility()
  syncPromptLanguageRowVisibility()
  resetSubmitCtaLabel()
  submitButton?.classList.remove('loading')
  syncSubmitButtonState()
}

function stepSamplePromptAnimation(): void {
  samplePromptTimer = null

  if (input.value.length > 0) {
    syncSamplePromptVisibility()
    return
  }

  const currentPrompt = SAMPLE_PROMPTS[samplePromptIndex]

  if (samplePromptMode === 'typing') {
    samplePromptLength += 1
    renderSamplePrompt()

    if (samplePromptLength < currentPrompt.length) {
      scheduleSamplePromptStep(randomDelay(16, 30))
      return
    }

    samplePromptMode = 'holding'
    scheduleSamplePromptStep(1800)
    return
  }

  if (samplePromptMode === 'holding') {
    samplePromptMode = 'deleting'
    scheduleSamplePromptStep(640)
    return
  }

  samplePromptLength = Math.max(0, samplePromptLength - 1)
  renderSamplePrompt()

  if (samplePromptLength > 0) {
    scheduleSamplePromptStep(randomDelay(10, 18))
    return
  }

  samplePromptIndex = (samplePromptIndex + 1) % SAMPLE_PROMPTS.length
  SAMPLE_PROMPTS[samplePromptIndex] = getRandomPrompt()
  samplePromptMode = 'typing'
  scheduleSamplePromptStep(260)
}

const showPolicyViolation = (message?: string): void => {
  if (!policyBlock) return
  policyBlock.textContent = message || CONTENT_POLICY_CLIENT_MESSAGE
  policyBlock.hidden = false
  policyBlock.classList.add('is-visible')
  policyBlock.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}

const hidePolicyViolation = (): void => {
  if (!policyBlock) return
  policyBlock.textContent = ''
  policyBlock.hidden = true
  policyBlock.classList.remove('is-visible')
}

function validatePrompt(showError = false): boolean {
  const promptLength = input.value.trim().length

  if (showError && promptLength < MIN_PROMPT_LENGTH) {
    input.setAttribute('aria-invalid', 'true')
    return false
  }

  input.removeAttribute('aria-invalid')
  return promptLength >= MIN_PROMPT_LENGTH
}

let shareBonusClaimed = false

function hasShareBonus(): boolean {
  return shareBonusClaimed
}

function getEffectiveLimit(): number {
  return shareBonusClaimed ? GENERATION_LIMIT_WITH_BONUS : GENERATION_LIMIT
}

async function claimShareBonus(): Promise<void> {
  if (shareBonusClaimed) return
  try {
    const resp = await fetch('/api/share-bonus', { method: 'POST' })
    if (resp.ok) shareBonusClaimed = true
  } catch {
    /* ignore network errors */
  }
  updateGenerationCounter()
  syncSubmitButtonState()
}

function isGenerationLimitReached(): boolean {
  if (isLocalDevHost) return false
  if (authResolved && currentUser) return false
  if (!authResolved) return false
  return getGenerationCount() >= getEffectiveLimit()
}

function syncSubmitButtonState(): void {
  if (!submitButton) return
  submitButton.disabled =
    submitButton.classList.contains('loading') ||
    isGenerationLimitReached() ||
    input.value.trim().length < MIN_PROMPT_LENGTH
}

function getGenerationCount(): number {
  return parseInt(localStorage.getItem('sf_generation_count') || '0', 10)
}

const wait = (ms: number): Promise<void> => new Promise((resolve) => window.setTimeout(resolve, ms))

async function waitForSessionReady(sessionId: string, timeoutMs = 90000): Promise<boolean> {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await authFetch(`/api/sessions/${encodeURIComponent(sessionId)}`)
      let data: any = {}
      try {
        data = await response.json()
      } catch {
        data = {}
      }
      if (data?.homepageReady && data?.siteSpecReady) return true
    } catch {}
    await wait(1000)
  }
  return false
}

function navigateToSession(sessionId: string): void {
  const url = new URL(`/generate/${encodeURIComponent(sessionId)}`, window.location.origin)
  const targetWindow = window.top && window.top !== window ? window.top : window
  targetWindow.location.assign(url.href)
  window.setTimeout(() => {
    if (window.location.pathname !== url.pathname) window.location.href = url.href
  }, 500)
}

function suspendGalleryIframesForLaunch(): void {
  galleryLaunchSuspended = true
  document
    .querySelectorAll<HTMLIFrameElement>('.session-thumbnail iframe')
    .forEach((iframe) => {
      iframe.removeAttribute('srcdoc')
      iframe.removeAttribute('src')
    })
}

function updateGenerationCounter(): void {
  const shareBonusPanel = getTypedElement<HTMLElement>('share-bonus-panel')
  const hideAll = () => {
    generationCounter.style.display = 'none'
    privateGenRow.style.display = 'none'
    if (shareBonusPanel) shareBonusPanel.style.display = 'none'
  }
  if (isLocalDevHost || !authResolved || currentUser) {
    hideAll()
    syncSubmitButtonState()
    return
  }

  const count = getGenerationCount()
  if (count === 0) {
    hideAll()
    syncSubmitButtonState()
    return
  }

  const limit = getEffectiveLimit()
  generationCounter.style.display = 'block'
  privateGenRow.style.display = 'none'

  if (isGenerationLimitReached()) {
    if (!hasShareBonus()) {
      // Show share-for-credit option
      generationCounter.innerHTML = `${GENERATION_LIMIT}/${GENERATION_LIMIT} free previews used`
      generationCounter.classList.add('limit-reached')
      if (shareBonusPanel) {
        shareBonusPanel.style.display = 'flex'
        initShareBonusPanel()
      }
    } else {
      // Bonus already used — only sign-up remains
      generationCounter.innerHTML = `${limit}/${limit} free previews used — <a href="#" id="gen-signup-link" style="color:inherit;text-decoration:underline;">sign up instead</a>`
      generationCounter.classList.add('limit-reached')
      if (shareBonusPanel) shareBonusPanel.style.display = 'none'
      getTypedElement<HTMLElement>('gen-signup-link')?.addEventListener(
        'click',
        (e: MouseEvent) => {
          e.preventDefault()
          openAuthOverlay()
        },
      )
    }
  } else {
    generationCounter.textContent = `${count} / ${limit} free previews used`
    generationCounter.classList.remove('limit-reached')
    if (shareBonusPanel) shareBonusPanel.style.display = 'none'
  }

  syncSubmitButtonState()
}

let shareBonusPanelInitialized = false
function initShareBonusPanel(): void {
  if (shareBonusPanelInitialized) return
  shareBonusPanelInitialized = true

  const siteUrl = 'https://ship-fast.io'
  const byLang: Record<string, string> = {
    en: `I just built a site in minutes with Ship Fast — try it free: ${siteUrl}`,
    hi: `मैंने Ship Fast से मिनटों में साइट बनाई — आप भी बनाएं: ${siteUrl}`,
    ta: `Ship Fast மூலம் நிமிடங்களில் தளம் உருவாக்கினேன் — நீங்களும் முயற்சிக்கவும்: ${siteUrl}`,
    te: `Ship Fast తో నిమిషాల్లో సైట్ చేశాను — మీరూ ట్రై చేయండి: ${siteUrl}`,
    bn: `Ship Fast দিয়ে মিনিটে সাইট বানিয়েছি — আপনিও চেষ্টা করুন: ${siteUrl}`,
    mr: `Ship Fast ने मिनिटांत साइट बनवली — तुम्हीही बनवा: ${siteUrl}`,
    kn: `Ship Fast ನಿಂದ ನಿಮಿಷಗಳಲ್ಲಿ ಸೈಟ್ ಮಾಡಿದೆ — ನೀವೂ ಮಾಡಿ: ${siteUrl}`,
    ml: `Ship Fast ഉപയോഗിച്ച് മിനിറ്റുകളിൽ സൈറ്റ് ഉണ്ടാക്കി — നിങ്ങളും ചെയ്യൂ: ${siteUrl}`,
    pa: `Ship Fast ਨਾਲ ਮਿੰਟਾਂ 'ਚ ਸਾਈਟ ਬਣਾਈ — ਤੁਸੀਂ ਵੀ ਬਣਾਓ: ${siteUrl}`,
    gu: `Ship Fast વડે મિનિટોમાં સાઇટ બનાવી — તમે પણ બનાવો: ${siteUrl}`,
  }
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
  let locale: string = 'en'
  for (const L of langs) {
    const c = String(L || '')
      .toLowerCase()
      .split('-')[0]
    if (c && c !== 'en' && byLang[c]) {
      locale = c
      break
    }
  }
  const msg = byLang[locale] || byLang.en
  const encUrl = encodeURIComponent(siteUrl)
  const encMsg = encodeURIComponent(msg)

  const targets: Record<string, string> = {
    'bonus-share-wa': `https://api.whatsapp.com/send?text=${encMsg}`,
    'bonus-share-fb': `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`,
    'bonus-share-tw': `https://twitter.com/intent/tweet?text=${encMsg}`,
    'bonus-share-tg': `https://t.me/share/url?url=${encUrl}&text=${encMsg}`,
    'bonus-share-li': `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`,
  }
  for (const [id, href] of Object.entries(targets)) {
    const el = getTypedElement<any>(id)
    if (!el) continue
    el.href = href
    el.addEventListener('click', () => claimShareBonus())
  }

  const nativeBtn = getTypedElement<HTMLElement>('bonus-share-native')
  if (nativeBtn) {
    nativeBtn.hidden = typeof navigator.share !== 'function'
    nativeBtn.addEventListener('click', () => {
      claimShareBonus()
      navigator.share({ title: 'Ship Fast', text: msg, url: siteUrl }).catch(() => {})
    })
  }

  const signupLink = getTypedElement<HTMLElement>('share-bonus-signup-link')
  if (signupLink) {
    signupLink.addEventListener('click', (e) => {
      e.preventDefault()
      openAuthOverlay()
    })
  }
}

function openPrivateGenModal(): void {
  privateGenCheckbox.checked = false
  privateGenModal.classList.add('is-open')
  privateGenModal.setAttribute('aria-hidden', 'false')
}

function closePrivateGenModal(): void {
  privateGenModal.classList.remove('is-open')
  privateGenModal.setAttribute('aria-hidden', 'true')
}

privateGenCheckbox.addEventListener('change', () => {
  if (privateGenCheckbox.checked) openPrivateGenModal()
})

getTypedElement<HTMLElement>('private-gen-modal-close')?.addEventListener(
  'click',
  closePrivateGenModal,
)
getTypedElement<HTMLElement>('private-gen-modal-backdrop')?.addEventListener(
  'click',
  closePrivateGenModal,
)

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && privateGenModal.classList.contains('is-open')) closePrivateGenModal()
})

syncPromptLanguageRowVisibility()
updateGenerationCounter()
renderSamplePrompt()
syncSamplePromptVisibility()
syncSubmitButtonState()

const applyPromptChip = (text: string): void => {
  input.value = text
  validatePrompt(false)
  syncSamplePromptVisibility()
  syncSubmitButtonState()
  lastPromptTrimLen = input.value.trim().length
  syncPromptLanguageRowVisibility()
  schedulePromptLanguageDetect()
}

const homeDevPromptsEnabled = isHomeDevPromptsEnabled()
let deleteDevSessionsWithPrompt: ((target: string) => Promise<void>) | null = null

if (homeDevPromptsEnabled) {
  deleteDevSessionsWithPrompt = async (target: string): Promise<void> => {
    const want = target.trim()
    if (!want) return
    try {
      if (currentUser) {
        const r = await authFetch(`/api/sessions?page=1&limit=50`)
        if (!r.ok) return
        const raw = await r.json()
        const items = Array.isArray(raw?.items) ? raw.items : []
        const matches = items.filter(
          (s: { id: string; prompt?: string }) => (s.prompt || '').trim() === want,
        )
        await Promise.all(
          matches.map((s: { id: string }) =>
            authFetch(`/api/sessions/${s.id}`, { method: 'DELETE' }).catch(() => null),
          ),
        )
      } else {
        const stored = JSON.parse(
          localStorage.getItem(ANON_SESSIONS_KEY) || '[]',
        ) as StoredAnonSessionEntry[]
        if (!Array.isArray(stored)) return
        const matches = stored.filter((s) => (s?.prompt || '').trim() === want)
        await Promise.all(
          matches.map((s) =>
            fetch(`/api/sessions/${s.id}`, {
              method: 'DELETE',
              headers: s.secret ? { 'x-ship-fast-anon-owner': String(s.secret) } : {},
            })
              .then(() => removeAnonSession(s.id))
              .catch(() => null),
          ),
        )
      }
    } catch {
      /* ignore */
    }
  }

  document.addEventListener(
    'keydown',
    (event) => {
      if (!event.metaKey && !event.ctrlKey) return
      if (!/^[1-9]$/.test(event.key)) return
      const text = LOCAL_DEV_PROMPT_SHORTCUTS[Number(event.key) - 1]
      if (!text) return
      event.preventDefault()
      event.stopPropagation()
      applyPromptChip(text)
      input.focus()
    },
    true,
  )
}

const IMAGE_STUDIO_PROMPT =
  'This app is going to be an image generation studio using various AI models to turn a prompt into images. Design a mocked version (no backend). It should be dark mode. Focus on making it beautiful.'

const chipDefs: Array<{ label: string; text: string }> = [
  { label: 'Image studio', text: IMAGE_STUDIO_PROMPT },
  { label: 'Pet wellness', text: LOCAL_DEV_PROMPT_SHORTCUTS[1] },
  { label: 'SaaS dashboard', text: LOCAL_DEV_PROMPT_SHORTCUTS[2] },
  { label: 'Hindi gym site', text: LOCAL_DEV_PROMPT_SHORTCUTS[0] },
]

const wirePromptChipButton = (btn: HTMLButtonElement, def: { text: string }): void => {
  btn.addEventListener('click', async () => {
    btn.disabled = true
    try {
      if (deleteDevSessionsWithPrompt) await deleteDevSessionsWithPrompt(def.text)
      applyPromptChip(def.text)
      form.requestSubmit()
    } finally {
      btn.disabled = false
    }
  })
}

const existingChipBar = document.querySelector<HTMLElement>('.dev-prompt-chips')
const chipBar = existingChipBar || document.createElement('div')
chipBar.className = 'dev-prompt-chips dev-prompt-chips--glass'
chipBar.setAttribute('aria-label', 'Example prompts')
if (existingChipBar) {
  chipBar.querySelectorAll<HTMLButtonElement>('.dev-prompt-chip').forEach((btn, i) => {
    const text = btn.dataset.prompt || chipDefs[i]?.text || ''
    if (!text) return
    btn.title = text
    wirePromptChipButton(btn, { text })
  })
} else {
  chipDefs.forEach((def, i) => {
    if (!def.text) return
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'dev-prompt-chip'
    btn.title = def.text
    btn.innerHTML = `<span class="dev-prompt-chip-num">${i + 1}</span><span class="dev-prompt-chip-label">${def.label}</span>`
    wirePromptChipButton(btn, def)
    chipBar.appendChild(btn)
  })
}
const heroCard = document.getElementById('hero-card')
if (!existingChipBar) heroCard?.parentElement?.insertBefore(chipBar, heroCard.nextSibling)

if (heroCard) {
  const setHeroGlow = (x: string, y: string): void => {
    heroCard.style.setProperty('--hero-glow-x', x)
    heroCard.style.setProperty('--hero-glow-y', y)
  }

  heroCard.addEventListener('pointermove', (event: PointerEvent) => {
    const rect = heroCard.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    setHeroGlow(
      `${Math.max(0, Math.min(100, x)).toFixed(1)}%`,
      `${Math.max(0, Math.min(100, y)).toFixed(1)}%`,
    )
  })

  heroCard.addEventListener('pointerleave', () => {
    setHeroGlow('30%', '20%')
  })
}

input.addEventListener('input', () => {
  hidePolicyViolation()
  validatePrompt(false)
  syncSamplePromptVisibility()
  syncSubmitButtonState()
  const prev = lastPromptTrimLen
  const t = input.value.trim()
  const crossed = prev < PROMPT_LANG_DETECT_MIN_CHARS && t.length >= PROMPT_LANG_DETECT_MIN_CHARS
  lastPromptTrimLen = t.length
  syncPromptLanguageRowVisibility()
  if (crossed) {
    if (promptLangDetectTimer !== null) {
      clearTimeout(promptLangDetectTimer)
      promptLangDetectTimer = null
    }
    const runToken = ++promptLangDetectToken
    requestAnimationFrame(() => runPromptLangDetectAsync(runToken, { skipIfUnchanged: false }))
  } else {
    schedulePromptLanguageDetect()
  }
  schedulePromptSuggestUpdate()
})

input.addEventListener('blur', () => {
  window.setTimeout(() => {
    if (document.activeElement === input) return
    closePromptSuggestions()
  }, 120)
})

logoTagline?.addEventListener('animationend', (event) => {
  if (event.animationName !== 'logo-tagline-scale-in') return
  logoTagline.classList.remove('logo-tagline--in')
  logoTagline.classList.add('logo-tagline--settled')
})

submitButton?.addEventListener('animationend', (event) => {
  if (event.animationName !== 'submit-cta-wiggle') return
  submitButton.classList.remove('submit-btn--cta-shake')
})

languageSelect?.addEventListener('change', () => {
  if (languageSelect) savePreferredLanguage(languageSelect.value)
  syncPreferredLanguageUi()
})

input.addEventListener('keydown', (event) => {
  if (promptSuggestOpen && promptSuggestRows.length > 0) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setPromptSuggestActive(promptSuggestActive + 1)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setPromptSuggestActive(promptSuggestActive - 1)
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      closePromptSuggestions()
      return
    }
    if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault()
      applyPromptSuggestion(promptSuggestRows[promptSuggestActive])
      return
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      applyPromptSuggestion(promptSuggestRows[promptSuggestActive])
      return
    }
  }
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    form.requestSubmit()
  }
})

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!submitButton) return
  if (!validatePrompt(true)) {
    syncSubmitButtonState()
    return
  }
  const prompt = input.value.trim()
  if (!checkPromptContentPolicy(prompt).ok) {
    showPolicyViolation(CONTENT_POLICY_CLIENT_MESSAGE)
    syncSubmitButtonState()
    return
  }
  const preferredLanguage = languageSelect?.value || 'en'
  savePreferredLanguage(preferredLanguage)

  if (isGenerationLimitReached()) {
    openAuthOverlay()
    return
  }

  submitButton.classList.add('loading')
  syncSubmitButtonState()
  suspendGalleryIframesForLaunch()

  const ref1 = getTypedElement<HTMLInputElement>('design-ref-url-1')?.value?.trim() || ''
  const ref2 = getTypedElement<HTMLInputElement>('design-ref-url-2')?.value?.trim() || ''
  const designReferenceUrls = [ref1, ref2].filter(Boolean)
  const designReferenceNotes =
    getTypedElement<HTMLInputElement>('design-ref-notes')?.value?.trim() || ''

  try {
    const response = await authFetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        preferredLanguage,
        ...(designReferenceUrls.length
          ? {
              designReferenceUrls,
              ...(designReferenceNotes ? { designReferenceNotes } : {}),
            }
          : {}),
      }),
    })
    let data: any = {}
    try {
      data = await response.json()
    } catch {
      data = {}
    }

    if (data.id) {
      const sessionId = String(data.id)
      if (!currentUser) saveAnonSession(sessionId, prompt, data.anonOwnerSecret)
      localStorage.setItem('sf_generation_count', String(getGenerationCount() + 1))
      if (isMarketingHomePath()) {
        sessionStorage.setItem('sf_return_home', '1')
        localStorage.setItem(`sf_openui_prompt_${sessionId}`, prompt)
        sessionStorage.setItem('sf_openui_prompt', prompt)
        navigateToSession(sessionId)
        return
      }
      sessionStorage.setItem('sf_return_home', '1')
      localStorage.setItem(`sf_openui_prompt_${sessionId}`, prompt)
      sessionStorage.setItem('sf_openui_prompt', prompt)
      try {
        const launchAudio = new Audio('/assets/launch.mp3')
        launchAudio.volume = 0.72
        void launchAudio.play().catch(() => undefined)
      } catch {}
      navigateToSession(sessionId)
      return
    }

    if (data.code === 'CONTENT_POLICY' || response.status === 422) {
      showPolicyViolation(data.error || CONTENT_POLICY_CLIENT_MESSAGE)
    } else if (!currentUser && response.status === 429) {
      if (data.shareBonusClaimed !== undefined) shareBonusClaimed = data.shareBonusClaimed
      updateGenerationCounter()
      if (shareBonusClaimed) {
        openAuthOverlay()
      }
    } else {
      alert(data.error || 'Failed to create session')
    }
  } catch (error: unknown) {
    alert(`Connection error: ${(error as Error).message}`)
  }

  submitButton.classList.remove('loading')
  syncSubmitButtonState()
})

submitButton?.addEventListener('click', (event) => {
  if (submitButton.disabled || submitButton.classList.contains('loading')) return
  event.preventDefault()
  event.stopPropagation()
  const submitEvent =
    typeof SubmitEvent === 'function'
      ? new SubmitEvent('submit', {
          bubbles: true,
          cancelable: true,
          submitter: submitButton,
        })
      : new Event('submit', { bubbles: true, cancelable: true })
  form.dispatchEvent(submitEvent)
})

let delegatedPromptSubmitInFlight = false

async function submitCurrentPromptForm(event?: Event): Promise<void> {
  event?.preventDefault()
  const currentForm = getTypedElement<HTMLFormElement>('prompt-form')
  const currentInput = getTypedElement<HTMLTextAreaElement>('prompt-input')
  const currentButton = getTypedElement<HTMLButtonElement>('submit-btn')
  const currentLanguageSelect = getTypedElement<HTMLSelectElement>('prompt-language')
  if (!currentForm || !currentInput || !currentButton || delegatedPromptSubmitInFlight) return

  const prompt = currentInput.value.trim()
  if (!prompt || !checkPromptContentPolicy(prompt).ok) return

  const preferredLanguage = currentLanguageSelect?.value || 'en'
  savePreferredLanguage(preferredLanguage)

  if (isGenerationLimitReached()) {
    openAuthOverlay()
    return
  }

  delegatedPromptSubmitInFlight = true
  currentButton.classList.add('loading')
  currentButton.disabled = true

  try {
    const response = await authFetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, preferredLanguage }),
    })
    let data: any = {}
    try {
      data = await response.json()
    } catch {
      data = {}
    }

    if (data.id) {
      const sessionId = String(data.id)
      if (!currentUser) saveAnonSession(sessionId, prompt, data.anonOwnerSecret)
      localStorage.setItem('sf_generation_count', String(getGenerationCount() + 1))
      sessionStorage.setItem('sf_return_home', '1')
      localStorage.setItem(`sf_openui_prompt_${sessionId}`, prompt)
      sessionStorage.setItem('sf_openui_prompt', prompt)
      navigateToSession(sessionId)
      return
    }

    alert(data.error || 'Failed to create session')
  } catch (error: unknown) {
    alert(`Connection error: ${(error as Error).message}`)
  } finally {
    delegatedPromptSubmitInFlight = false
    currentButton.classList.remove('loading')
    currentButton.disabled = false
  }
}

document.addEventListener('submit', (event) => {
  if ((event.target as HTMLElement | null)?.id !== 'prompt-form') return
  void submitCurrentPromptForm(event)
})

document.addEventListener('click', (event) => {
  const target = event.target as Element | null
  const currentButton = target?.closest?.('#submit-btn') as HTMLButtonElement | null
  if (!currentButton || currentButton.disabled || currentButton.classList.contains('loading')) return
  void submitCurrentPromptForm(event)
})

window.__sfDelegatedSubmitReady = true

const ANON_SESSIONS_KEY = 'sf_anon_sessions'

function invalidateAnonSessionEntriesCache() {
  anonSessionEntriesCacheT = 0
  anonSessionEntriesCacheV = null
}

function saveAnonSession(id: string, prompt: string, ownerSecret?: string): void {
  const stored = (
    JSON.parse(localStorage.getItem(ANON_SESSIONS_KEY) || '[]') as StoredAnonSessionEntry[]
  ).filter((session) => session?.id !== id)
  const entry: StoredAnonSessionEntry = { id, prompt }
  if (ownerSecret) entry.secret = String(ownerSecret)
  stored.unshift(entry)
  localStorage.setItem(ANON_SESSIONS_KEY, JSON.stringify(stored))
  invalidateAnonSessionEntriesCache()
}

function removeAnonSession(id: string): void {
  const stored = JSON.parse(
    localStorage.getItem(ANON_SESSIONS_KEY) || '[]',
  ) as StoredAnonSessionEntry[]
  localStorage.setItem(ANON_SESSIONS_KEY, JSON.stringify(stored.filter((s) => s.id !== id)))
  invalidateAnonSessionEntriesCache()
}

function clearAnonSessions(): void {
  localStorage.removeItem(ANON_SESSIONS_KEY)
  invalidateAnonSessionEntriesCache()
}

function getAnonOwnerSecretForSession(sessionId: string): string {
  try {
    const stored = JSON.parse(
      localStorage.getItem(ANON_SESSIONS_KEY) || '[]',
    ) as StoredAnonSessionEntry[]
    if (!Array.isArray(stored)) return ''
    const hit = stored.find((s) => s && s.id === sessionId)
    return hit?.secret ? String(hit.secret) : ''
  } catch {
    return ''
  }
}

let sessionItemPointerDown: { id: string | undefined; x: number; y: number } | null = null
let sessionListNavTimer: number | null = null
const SESSION_OPEN_DRAG_THRESHOLD_SQ = 64

const selectionSpansSessionItem = (item: HTMLElement): boolean => {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false
  if (!sel.toString().trim()) return false
  return item.contains(sel.anchorNode) && item.contains(sel.focusNode)
}

const openSessionFromList = (id: string): void => {
  sessionStorage.setItem(GALLERY_RESTORE_PAGE_KEY, String(publicGalleryPage))
  sessionStorage.setItem(GALLERY_RESTORE_SOURCE_KEY, gallerySource)
  if (isMarketingHomePath()) {
    openEmbeddedSession(id)
    return
  }
  sessionStorage.setItem('sf_return_home', '1')
  location.href = `/session/${id}`
}

const hideGalleryPagination = (): void => {
  galleryMeta = null
  if (sessionPagination) sessionPagination.hidden = true
  if (sessionPageStatus) sessionPageStatus.textContent = ''
  if (sessionPagePrev) {
    sessionPagePrev.hidden = true
    sessionPagePrev.disabled = true
  }
  if (sessionPageNext) {
    sessionPageNext.hidden = true
    sessionPageNext.disabled = true
  }
  if (sessionPaginationActions) sessionPaginationActions.hidden = true
}

const updateGalleryPagination = (meta: GalleryMeta | null): void => {
  if (!sessionPagination || !sessionPagePrev || !sessionPageNext || !sessionPageStatus) return
  if (!meta || meta.total === 0) {
    sessionPagination.hidden = true
    sessionPageStatus.textContent = ''
    return
  }
  const showPrev = Boolean(meta.hasPrev)
  const showNext = Boolean(meta.hasNext)
  if (!showPrev && !showNext) {
    sessionPagination.hidden = true
    sessionPageStatus.textContent = ''
    sessionPagePrev.hidden = true
    sessionPageNext.hidden = true
    sessionPagePrev.disabled = true
    sessionPageNext.disabled = true
    if (sessionPaginationActions) sessionPaginationActions.hidden = true
    return
  }
  sessionPagination.hidden = false
  if (sessionPaginationActions) sessionPaginationActions.hidden = false
  const from = (meta.page - 1) * meta.limit + 1
  const to = Math.min(meta.page * meta.limit, meta.total)
  sessionPageStatus.textContent = `Page ${meta.page} of ${meta.totalPages} \u00B7 ${from}\u2013${to} of ${meta.total}`
  sessionPagePrev.hidden = !showPrev
  sessionPageNext.hidden = !showNext
  sessionPagePrev.disabled = !showPrev
  sessionPageNext.disabled = !showNext
}

// Reflect the active gallery page in the URL so pagination is observable,
// deep-linkable and works with browser back/forward (page swaps in place via
// fetch, so without this the URL never changes and a "Next" click looks inert).
const syncGalleryUrl = (page: number, source: GallerySource): void => {
  const params = new URLSearchParams()
  if (page > 1) params.set('page', String(page))
  if (source === 'user') params.set('source', 'user')
  const qs = params.toString()
  const url = qs ? `/?${qs}` : '/'
  if (location.pathname + location.search !== url) {
    history.pushState({ galleryPage: page, gallerySource: source }, '', url)
  }
}

const goToGalleryPage = async (page: number): Promise<void> => {
  if (gallerySource === 'public') await loadRecentPublicSessions(page)
  else if (gallerySource === 'user') {
    userGalleryPage = page
    await loadUserSessionsPage()
  }
  syncGalleryUrl(page, gallerySource)
  // Keep the pagination controls in view so the updated page status is visible.
  // Don't scroll the gallery top into view — that pushes the controls off screen
  // and makes a successful page change look like nothing happened.
  sessionPagination?.scrollIntoView({ block: 'nearest' })
}

sessionPagePrev?.addEventListener('click', () => {
  if (!galleryMeta?.hasPrev) return
  void goToGalleryPage((Number(galleryMeta.page) || 1) - 1)
})

sessionPageNext?.addEventListener('click', () => {
  if (!galleryMeta?.hasNext) return
  void goToGalleryPage((Number(galleryMeta.page) || 1) + 1)
})

// Restore the gallery page when navigating browser history (back/forward).
window.addEventListener('popstate', () => {
  const params = new URLSearchParams(location.search)
  const page = Math.max(1, parseInt(params.get('page') || '1', 10) || 1)
  const source: GallerySource = params.get('source') === 'user' && currentUser ? 'user' : 'public'
  if (source === 'user') {
    userGalleryPage = page
    void loadUserSessionsPage()
  } else {
    void loadRecentPublicSessions(page)
  }
})

getTypedElement<HTMLElement>('session-list')?.addEventListener(
  'pointerdown',
  (event: PointerEvent) => {
    if (event.button !== 0) return
    const item = (event.target as HTMLElement | null)?.closest(
      '.session-item',
    ) as HTMLElement | null
    sessionItemPointerDown = item
      ? { id: item.dataset.id, x: event.clientX, y: event.clientY }
      : null
  },
)

getTypedElement<HTMLElement>('session-list')?.addEventListener('click', (event: MouseEvent) => {
  if (sessionListNavTimer !== null) window.clearTimeout(sessionListNavTimer)
  sessionListNavTimer = null
  const item = (event.target as HTMLElement | null)?.closest('.session-item') as HTMLElement | null
  if (!item) return
  const id = item.dataset.id
  if (!id) return
  if (event.metaKey || event.ctrlKey || event.shiftKey) {
    window.open(`/session/${id}`, '_blank', 'noopener,noreferrer')
    return
  }
  if ((event.target as HTMLElement | null)?.closest('button')) return
  if (selectionSpansSessionItem(item)) return
  if (
    sessionItemPointerDown?.id === id &&
    (event.clientX - sessionItemPointerDown.x) ** 2 +
      (event.clientY - sessionItemPointerDown.y) ** 2 >
      SESSION_OPEN_DRAG_THRESHOLD_SQ
  ) {
    return
  }
  if ((event.target as HTMLElement | null)?.closest('.session-info')) {
    sessionListNavTimer = window.setTimeout(() => {
      sessionListNavTimer = null
      const live = document.querySelector(`.session-item[data-id="${id}"]`) as HTMLElement | null
      if (!live) return
      if (selectionSpansSessionItem(live as HTMLElement)) return
      openSessionFromList(id)
    }, 320)
    return
  }
  openSessionFromList(id)
})

function renderSessions(sessions: SessionItem[]): void {
  const section = getTypedElement<HTMLElement>('sessions-section')!
  const list = getTypedElement<HTMLElement>('session-list')!
  if (galleryLaunchSuspended) return

  if (sessions.length === 0) {
    list.innerHTML = ''
    section.style.display = 'none'
    document.body.classList.remove('has-sessions')
    list.classList.remove('single-col', 'two-col')
    return
  }

  document.body.classList.add('has-sessions')

  list.classList.remove('single-col', 'two-col')
  if (sessions.length === 1) list.classList.add('single-col')
  else if (sessions.length === 2) list.classList.add('two-col')

  const placeholderSvg =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>'

  const eagerThumbnailCount = 6

  list.innerHTML = sessions
    .map(
      (session, index) => `
        <li class="session-item" data-id="${session.id}" role="button" tabindex="0" aria-label="View session: ${session.prompt.replace(/"/g, '&quot;')}">
          <div class="session-thumbnail">
            ${
              session.html
                ? index < eagerThumbnailCount
                  ? `<iframe class="session-srcdoc" data-srcdoc-idx="${index}" loading="eager" sandbox="allow-same-origin allow-scripts" tabindex="-1"></iframe>`
                  : `<iframe class="session-srcdoc" data-srcdoc-idx="${index}" data-lazy="1" loading="lazy" sandbox="allow-same-origin allow-scripts" tabindex="-1"></iframe>`
                : session.homepageReady
                  ? `<img class="session-thumb-img" src="/api/sessions/${session.id}/gallery-thumb" alt="" loading="${index < eagerThumbnailCount ? 'eager' : 'lazy'}" decoding="async" data-session-id="${session.id}" />`
                  : `<div class="session-placeholder">${placeholderSvg}</div>`
            }
            <div class="session-badges">
              ${
                session.elapsed
                  ? `<span class="session-badge badge-time"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>${session.elapsed}s</span>`
                  : ''
              }
              ${
                session.cost != null
                  ? `<span class="session-badge badge-cost session-cost" style="display:none">$${session.cost.toFixed(4)}</span>`
                  : ''
              }
            </div>
          </div>
          <div class="session-info">
            <span class="session-prompt">${session.prompt.replace(/</g, '&lt;')}</span>
          </div>
        </li>
      `,
    )
    .join('')

  section.style.display = 'block'

  const scaleIframes = (): void => {
    list.querySelectorAll<HTMLIFrameElement>('.session-thumbnail iframe').forEach((iframe) => {
      const parent = iframe.parentElement as HTMLElement | null
      const containerWidth = parent?.offsetWidth || 0
      const containerHeight = parent?.offsetHeight || 0
      if (!containerWidth || !containerHeight) return
      const scale = Math.max(containerWidth / 1280, containerHeight / 800)
      const scaledWidth = 1280 * scale
      const left = (containerWidth - scaledWidth) / 2
      iframe.style.left = `${left}px`
      iframe.style.top = '0'
      iframe.style.transform = `scale(${scale})`
      iframe.style.transformOrigin = 'top left'
    })
  }

  // Render generated full-document HTML inside an isolated iframe (srcdoc) so its
  // global <style>/<link> rules can't leak into the homepage and clobber it
  // (raw innerHTML injection turned paginated gallery pages white). srcdoc is set
  // via the JS property to avoid attribute-escaping the whole document; a doctype
  // is prepended so previews render in standards mode, not quirks.
  const assignSrcdoc = (iframe: HTMLIFrameElement): void => {
    if (galleryLaunchSuspended) return
    const idx = iframe.dataset.srcdocIdx
    if (idx == null) return
    const html = sessions[Number(idx)]?.html
    if (!html) return
    iframe.srcdoc = /^\s*<!doctype/i.test(html) ? html : `<!doctype html>${html}`
    iframe.addEventListener('load', scaleIframes, { once: true })
  }

  list
    .querySelectorAll<HTMLIFrameElement>('iframe[data-srcdoc-idx]:not([data-lazy])')
    .forEach(assignSrcdoc)

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scaleIframes()
    })
  })
  if (!hasSessionResizeListener) {
    window.addEventListener('resize', scaleIframes)
    hasSessionResizeListener = true
  }

  const loadLazyIframe = (iframe: HTMLIFrameElement): void => {
    if (galleryLaunchSuspended) return
    if (iframe.dataset.srcdocIdx != null) {
      assignSrcdoc(iframe)
      return
    }
    const src = iframe.dataset.src
    if (!src) return
    iframe.src = src
    iframe.addEventListener('load', scaleIframes, { once: true })
  }

  const iframes = list.querySelectorAll<HTMLIFrameElement>('iframe[data-src], iframe[data-lazy]')
  if (iframes.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const iframe = entry.target as HTMLIFrameElement
          loadLazyIframe(iframe)
          observer.unobserve(iframe)
          requestAnimationFrame(scaleIframes)
        })
      },
      { rootMargin: '200px' },
    )
    iframes.forEach((iframe) => observer.observe(iframe))
  } else {
    iframes.forEach(loadLazyIframe)
    requestAnimationFrame(scaleIframes)
  }

  const mountIframeFallback = (img: HTMLImageElement): void => {
    if (galleryLaunchSuspended) return
    if (img.dataset.fallback === '1') return
    img.dataset.fallback = '1'
    const id = img.dataset.sessionId
    if (!id) return
    const iframe = document.createElement('iframe')
    const previewSrc = `/preview/${id}/?gallery=1`
    iframe.src = previewSrc
    iframe.loading = img.loading === 'eager' ? 'eager' : 'lazy'
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts')
    iframe.tabIndex = -1
    iframe.addEventListener('load', scaleIframes, { once: true })
    img.replaceWith(iframe)
    requestAnimationFrame(scaleIframes)
  }

  const scheduleThumbRetry = (img: HTMLImageElement): void => {
    const id = img.dataset.sessionId
    if (!id) {
      mountIframeFallback(img)
      return
    }
    const retries = parseInt(img.dataset.thumbRetries || '0', 10)
    if (retries >= 12) {
      mountIframeFallback(img)
      return
    }
    img.dataset.thumbRetries = String(retries + 1)
    window.setTimeout(() => {
      img.src = `/api/sessions/${id}/gallery-thumb?v=${Date.now()}`
    }, 2000)
  }

  list.querySelectorAll<HTMLImageElement>('.session-thumb-img').forEach((img) => {
    img.addEventListener('error', () => {
      scheduleThumbRetry(img)
    })
  })

  list.querySelectorAll('.session-thumbnail iframe[src]:not([data-src])').forEach((iframe) => {
    iframe.addEventListener('load', scaleIframes, { once: true })
  })

  if (localStorage.getItem('sf_show_cost') === '1') {
    list.querySelectorAll('.session-cost').forEach((element) => {
      ;(element as HTMLElement).style.display = 'flex'
    })
  }
}

async function fetchPublicGalleryPageFromNetwork(
  page: number,
): Promise<{ ok: boolean; items: SessionItem[]; data: GalleryMeta }> {
  const r = await fetch(`/api/gallery?page=${page}&limit=${GALLERY_PAGE_SIZE}`)
  if (!r.ok) throw new Error('recent-sessions')
  const data = await r.json()
  return { ok: true, items: Array.isArray(data.items) ? data.items : [], data }
}

async function fetchPublicGalleryPage(
  page: number,
): Promise<{ ok: boolean; items: SessionItem[]; data: GalleryMeta | null }> {
  const qc = (window as any).__sfQueryClient
  if (qc) {
    try {
      return await qc.fetchQuery({
        queryKey: ['sf-public-gallery', page, GALLERY_PAGE_SIZE],
        queryFn: () => fetchPublicGalleryPageFromNetwork(page),
        staleTime: SF_PUBLIC_GALLERY_STALE_MS,
      })
    } catch {
      return { ok: false, items: [], data: null }
    }
  }
  try {
    return await fetchPublicGalleryPageFromNetwork(page)
  } catch {
    return { ok: false, items: [], data: null }
  }
}

async function loadAnonymousSessionEntries(): Promise<SessionItem[]> {
  const now = Date.now()
  if (anonSessionEntriesCacheV && now - anonSessionEntriesCacheT < ANON_SESSION_ENTRIES_TTL_MS) {
    return anonSessionEntriesCacheV
  }
  try {
    const stored = JSON.parse(localStorage.getItem(ANON_SESSIONS_KEY) || '[]')
    if (stored.length === 0) {
      anonSessionEntriesCacheT = now
      anonSessionEntriesCacheV = []
      return []
    }

    const results = await Promise.all(
      stored.map(async ({ id, prompt }: StoredAnonSessionEntry) => {
        try {
          const res = await fetch(`/api/sessions/${id}`)
          if (!res.ok) return null
          const data = await res.json()
          return {
            id: data.id,
            prompt: data.prompt || prompt,
            homepageReady: data.homepageReady,
            elapsed: data.elapsed,
            cost: data.cost,
          }
        } catch {
          return { id, prompt, homepageReady: false, elapsed: null, cost: null }
        }
      }),
    )

    const valid = results.filter((x): x is SessionItem => Boolean(x))
    const validIds = new Set(valid.map((s) => s.id))
    const pruned = stored.filter((s: StoredAnonSessionEntry) => validIds.has(s.id))
    if (pruned.length !== stored.length) {
      localStorage.setItem(ANON_SESSIONS_KEY, JSON.stringify(pruned))
    }
    anonSessionEntriesCacheT = Date.now()
    anonSessionEntriesCacheV = valid
    return valid
  } catch {
    return []
  }
}

async function loadRecentPublicSessions(page = 1): Promise<void> {
  gallerySource = 'public'
  publicGalleryPage = page
  try {
    const { ok, items, data } = await fetchPublicGalleryPage(page)
    if (!ok) {
      renderSessions([])
      hideGalleryPagination()
      return
    }
    galleryMeta = data
    if (items.length === 0) {
      renderSessions([])
      hideGalleryPagination()
      return
    }
    renderSessions(items)
    updateGalleryPagination(data)
  } catch {
    renderSessions([])
    hideGalleryPagination()
  }
}

async function loadUserSessionsPage(): Promise<boolean> {
  gallerySource = 'user'
  try {
    const response = await authFetch(
      `/api/sessions?page=${userGalleryPage}&limit=${GALLERY_PAGE_SIZE}`,
    )
    if (!response.ok) return false
    const raw = await response.json()
    if (!raw.items || !Array.isArray(raw.items)) return false
    galleryMeta = raw
    renderSessions(raw.items)
    updateGalleryPagination(raw)
    return true
  } catch {
    return false
  }
}

async function loadSessions(): Promise<void> {
  const { page, source } = consumeGalleryRestore()
  if (source === 'user' && currentUser) {
    gallerySource = 'user'
    userGalleryPage = page
    publicGalleryPage = 1
    await loadUserSessionsPage()
    return
  }
  if (source === 'public' && page > 1) {
    gallerySource = 'public'
    publicGalleryPage = page
    userGalleryPage = 1
    await loadRecentPublicSessions(page)
    return
  }
  userGalleryPage = 1
  publicGalleryPage = 1
  gallerySource = 'public'
  await loadRecentPublicSessions(1)
}

async function hydrateAnonymousOrPublicGallery(): Promise<void> {
  const { page, source } = consumeGalleryRestore()
  if (source === 'public' && page > 1) {
    gallerySource = 'public'
    publicGalleryPage = page
    await loadRecentPublicSessions(page)
    return
  }
  if (source === 'user' && currentUser) {
    gallerySource = 'user'
    userGalleryPage = page
    await loadUserSessionsPage()
    return
  }
  publicGalleryPage = 1
  gallerySource = 'public'
  try {
    const { ok, items, data } = await fetchPublicGalleryPage(1)
    if (!ok) {
      renderSessions([])
      hideGalleryPagination()
      return
    }
    galleryMeta = data
    if (items.length === 0) {
      renderSessions([])
      hideGalleryPagination()
      return
    }
    renderSessions(items)
    updateGalleryPagination(data)
  } catch {
    renderSessions([])
    hideGalleryPagination()
  }
}

const reloadHomeGalleryIfReady = () => {
  if (!authResolved) return
  if (currentUser) void loadSessions()
  else void hydrateAnonymousOrPublicGallery()
}

function activeElementIsTextEntry(): boolean {
  const tagName = document.activeElement?.tagName
  return tagName === 'TEXTAREA' || tagName === 'INPUT'
}

const galleryDeleteTargetId = (): string | null =>
  (document.querySelector('.session-item:hover') as HTMLElement | null)?.dataset?.id || null

document.addEventListener('keydown', async (event) => {
  if (event.repeat) return
  if (event.code !== 'KeyD' && event.code !== 'PageDown') return
  const id = galleryDeleteTargetId()
  if (!id) return
  if (activeElementIsTextEntry()) event.preventDefault()
  if (event.code === 'PageDown') event.preventDefault()
  const card = document.querySelector(
    `.session-item[data-id="${id}"]`,
  ) as HTMLElement | null as HTMLElement | null
  if (card) card.style.opacity = '0.3'

  if (currentUser) {
    const r = await authFetch(`/api/sessions/${id}`, { method: 'DELETE' })
    if (!r.ok) {
      if (card) card.style.opacity = ''
      return
    }
  } else {
    const secret = getAnonOwnerSecretForSession(id)
    const r = await fetch(`/api/sessions/${id}`, {
      method: 'DELETE',
      headers: secret ? { 'x-ship-fast-anon-owner': secret } : {},
    })
    if (!r.ok) {
      if (card) card.style.opacity = ''
      return
    }
    removeAnonSession(id)
  }
  if (card) card.remove()

  const remaining = document.querySelectorAll('.session-item')
  if (remaining.length === 0) {
    getTypedElement<HTMLElement>('sessions-section')!.style.display = 'none'
    document.body.classList.remove('has-sessions')
    return
  }

  const list = document.getElementById('session-list') as HTMLElement
  list.classList.remove('single-col', 'two-col')
  if (remaining.length === 1) list.classList.add('single-col')
  else if (remaining.length === 2) list.classList.add('two-col')
})

document.addEventListener('keydown', (event) => {
  if (event.key !== 'p' || activeElementIsTextEntry()) return
  const visible = localStorage.getItem('sf_show_cost') === '1'
  localStorage.setItem('sf_show_cost', visible ? '0' : '1')
  document.querySelectorAll<HTMLElement>('.session-cost').forEach((element) => {
    element.style.display = visible ? 'none' : 'flex'
  })
})

let deletePresses: number[] = []
document.addEventListener('keydown', async (event) => {
  if (event.code !== 'KeyD' || activeElementIsTextEntry()) return
  const now = Date.now()
  deletePresses.push(now)
  deletePresses = deletePresses.filter((timestamp) => now - timestamp < 1500)

  if (deletePresses.length < 5) return

  deletePresses = []
  document.querySelectorAll('.session-item').forEach((card) => {
    ;(card as HTMLElement).style.opacity = '0.3'
  })

  if (currentUser) {
    const r = await authFetch('/api/sessions', { method: 'DELETE' })
    if (!r.ok) {
      document.querySelectorAll('.session-item').forEach((c) => {
        ;(c as HTMLElement).style.opacity = ''
      })
      return
    }
  } else {
    try {
      const stored = JSON.parse(localStorage.getItem(ANON_SESSIONS_KEY) || '[]')
      if (Array.isArray(stored)) {
        await Promise.all(
          stored.map((s) => {
            if (!s?.id || !s?.secret) return Promise.resolve()
            return fetch(`/api/sessions/${s.id}`, {
              method: 'DELETE',
              headers: { 'x-ship-fast-anon-owner': String(s.secret) },
            })
          }),
        )
      }
    } catch {
      void 0
    }
    clearAnonSessions()
  }
  getTypedElement<HTMLElement>('session-list')!.innerHTML = ''
  getTypedElement<HTMLElement>('sessions-section')!.style.display = 'none'
  document.body.classList.remove('has-sessions')
})

const stitchGrid = getTypedElement<HTMLElement>('stitch-grid')
const stitchGridLit = getTypedElement<HTMLElement>('stitch-grid-lit')
const prefersReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (!prefersReduceMotion && stitchGrid && stitchGridLit) {
  let glowState: { x: number; y: number; alpha: number; lastMoveTime: number } | null = null
  let glowRaf = 0

  const clearGlow = () => {
    stitchGridLit.style.maskImage = 'linear-gradient(transparent, transparent)'
    stitchGridLit.style.webkitMaskImage = 'linear-gradient(transparent, transparent)'
    stitchGridLit.style.opacity = '0'
  }

  const paintGlow = () => {
    if (!glowState || glowState.alpha <= 0.01) {
      clearGlow()
      return
    }
    const alpha = Math.min(glowState.alpha, 1)
    const radius = getComputedStyle(document.documentElement)
      .getPropertyValue('--stitch-glow-radius')
      .trim()
    const mask = `radial-gradient(circle ${radius} at ${glowState.x}px ${glowState.y}px, rgba(0,0,0,${alpha}) 0%, rgba(0,0,0,${alpha * 0.8}) 25%, rgba(0,0,0,${alpha * 0.4}) 55%, transparent 100%)`
    stitchGridLit.style.opacity = '1'
    stitchGridLit.style.maskImage = mask
    stitchGridLit.style.webkitMaskImage = mask
  }

  const fadeGlow = () => {
    if (!glowState) {
      glowRaf = 0
      return
    }
    const fadeMs = Number(
      getComputedStyle(document.documentElement).getPropertyValue('--stitch-glow-fade-ms').trim(),
    )
    const elapsed = performance.now() - glowState.lastMoveTime
    glowState.alpha = 1 - Math.min(elapsed / fadeMs, 1)
    paintGlow()
    if (glowState.alpha > 0.01) {
      glowRaf = requestAnimationFrame(fadeGlow)
      return
    }
    glowState = null
    glowRaf = 0
    clearGlow()
  }

  const queueFade = () => {
    if (!glowRaf) glowRaf = requestAnimationFrame(fadeGlow)
  }

  window.addEventListener('mousemove', (event) => {
    const rect = stitchGrid.getBoundingClientRect()
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      return
    glowState = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      alpha: 1,
      lastMoveTime: performance.now(),
    }
    queueFade()
  })
}

const designRefToggle = getTypedElement<HTMLInputElement>('design-ref-toggle')
const designRefPanel = getTypedElement<HTMLElement>('design-ref-panel')
const designRefSearch = getTypedElement<HTMLInputElement>('design-ref-search')
const designRefPreview = getTypedElement<HTMLElement>('design-ref-preview')
const designRefPreviewFavicon = getTypedElement<HTMLImageElement>('design-ref-preview-favicon')
const designRefPreviewTitle = getTypedElement<HTMLElement>('design-ref-preview-title')
const designRefPreviewUrl = getTypedElement<HTMLElement>('design-ref-preview-url')
const designRefPreviewRemove = getTypedElement<HTMLElement>('design-ref-preview-remove')
const designRefUrl1 = getTypedElement<HTMLInputElement>('design-ref-url-1')

const SITE_SEARCH_DB = [
  { k: 'stripe', u: 'https://stripe.com', t: 'Stripe' },
  { k: 'linear', u: 'https://linear.app', t: 'Linear' },
  { k: 'vercel', u: 'https://vercel.com', t: 'Vercel' },
  { k: 'notion', u: 'https://notion.so', t: 'Notion' },
  { k: 'figma', u: 'https://figma.com', t: 'Figma' },
  { k: 'github', u: 'https://github.com', t: 'GitHub' },
  { k: 'slack', u: 'https://slack.com', t: 'Slack' },
  { k: 'discord', u: 'https://discord.com', t: 'Discord' },
  { k: 'spotify', u: 'https://spotify.com', t: 'Spotify' },
  { k: 'airbnb', u: 'https://airbnb.com', t: 'Airbnb' },
  { k: 'shopify', u: 'https://shopify.com', t: 'Shopify' },
  { k: 'apple', u: 'https://apple.com', t: 'Apple' },
  { k: 'tesla', u: 'https://tesla.com', t: 'Tesla' },
  { k: 'netflix', u: 'https://netflix.com', t: 'Netflix' },
  { k: 'dribbble', u: 'https://dribbble.com', t: 'Dribbble' },
  { k: 'behance', u: 'https://behance.net', t: 'Behance' },
  { k: 'twitch', u: 'https://twitch.tv', t: 'Twitch' },
  { k: 'supabase', u: 'https://supabase.com', t: 'Supabase' },
  { k: 'tailwind', u: 'https://tailwindcss.com', t: 'Tailwind CSS' },
  { k: 'nextjs', u: 'https://nextjs.org', t: 'Next.js' },
  { k: 'next', u: 'https://nextjs.org', t: 'Next.js' },
  { k: 'framer', u: 'https://framer.com', t: 'Framer' },
  { k: 'raycast', u: 'https://raycast.com', t: 'Raycast' },
  { k: 'cal', u: 'https://cal.com', t: 'Cal.com' },
  { k: 'resend', u: 'https://resend.com', t: 'Resend' },
  { k: 'openai', u: 'https://openai.com', t: 'OpenAI' },
  { k: 'anthropic', u: 'https://anthropic.com', t: 'Anthropic' },
  { k: 'midjourney', u: 'https://midjourney.com', t: 'Midjourney' },
  { k: 'uber', u: 'https://uber.com', t: 'Uber' },
  { k: 'google', u: 'https://google.com', t: 'Google' },
  { k: 'twitter', u: 'https://x.com', t: 'X (Twitter)' },
  { k: 'instagram', u: 'https://instagram.com', t: 'Instagram' },
  { k: 'youtube', u: 'https://youtube.com', t: 'YouTube' },
  { k: 'amazon', u: 'https://amazon.com', t: 'Amazon' },
  { k: 'dropbox', u: 'https://dropbox.com', t: 'Dropbox' },
  { k: 'intercom', u: 'https://intercom.com', t: 'Intercom' },
  { k: 'loom', u: 'https://loom.com', t: 'Loom' },
  { k: 'arc', u: 'https://arc.net', t: 'Arc Browser' },
  { k: 'revolut', u: 'https://revolut.com', t: 'Revolut' },
  { k: 'monzo', u: 'https://monzo.com', t: 'Monzo' },
  { k: 'wise', u: 'https://wise.com', t: 'Wise' },
]

const setDesignRefPreview = (url: string, title?: string): void => {
  if (!designRefPreview) return
  const hostname = (() => {
    try {
      return new URL(url).hostname
    } catch {
      return url
    }
  })()
  designRefPreviewFavicon!.src = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`
  designRefPreviewTitle!.textContent = title || hostname
  designRefPreviewUrl!.textContent = url
  designRefPreview.classList.add('is-visible')
  designRefUrl1!.value = url
}

const clearDesignRefPreview = (): void => {
  if (!designRefPreview) return
  designRefPreview.classList.remove('is-visible')
  designRefPreviewFavicon!.src = ''
  designRefPreviewTitle!.textContent = ''
  designRefPreviewUrl!.textContent = ''
  designRefUrl1!.value = ''
  if (designRefSearch) designRefSearch.value = ''
}

let designRefSearchTimer: number | null = null

const handleDesignRefSearch = (value: string): void => {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) {
    clearDesignRefPreview()
    return
  }

  if (/^https?:\/\//i.test(trimmed) || /^[a-z0-9][-a-z0-9]*\.[a-z]{2,}/i.test(trimmed)) {
    const url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    const hostname = (() => {
      try {
        return new URL(url).hostname.replace(/^www\./, '')
      } catch {
        return trimmed
      }
    })()
    const title = hostname.split('.')[0]
    setDesignRefPreview(url, title.charAt(0).toUpperCase() + title.slice(1))
    return
  }

  const match = SITE_SEARCH_DB.find(
    (s) => s.k.startsWith(trimmed) || s.t.toLowerCase().startsWith(trimmed),
  )
  if (match) {
    setDesignRefPreview(match.u, match.t)
  } else {
    clearDesignRefPreview()
  }
}

designRefToggle?.addEventListener('change', () => {
  designRefPanel?.classList.toggle('is-visible', designRefToggle.checked)
  if (!designRefToggle.checked) clearDesignRefPreview()
  else designRefSearch?.focus()
})

designRefSearch?.addEventListener('input', () => {
  if (designRefSearchTimer !== null) clearTimeout(designRefSearchTimer)
  designRefSearchTimer = window.setTimeout(() => {
    designRefSearchTimer = null
    handleDesignRefSearch(designRefSearch.value)
  }, 200)
})

designRefSearch?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    if (designRefSearchTimer !== null) {
      clearTimeout(designRefSearchTimer)
      designRefSearchTimer = null
    }
    handleDesignRefSearch(designRefSearch.value)
  }
})

designRefPreviewRemove?.addEventListener('click', clearDesignRefPreview)

try {
  fetch('chrome-extension://gppongmhjkpfnbhagpmjfkannfbllamg/js/js.js')
    .then(() => {
      getTypedElement<HTMLElement>('wappalyzer-banner')!.style.display = 'block'
    })
    .catch(() => {})
} catch {}

const applyHomeTabTitle = (): void => {
  const tabMeta = document.querySelector('meta[name="sf-home-tab-title"]')
  const tabTitle = tabMeta?.getAttribute('content')
  if (tabTitle) document.title = tabTitle
}
applyHomeTabTitle()

// Auto-open embedded session from redirect
const _autoOpenId = new URLSearchParams(location.search).get('s')
if (_autoOpenId) {
  history.replaceState(null, '', '/')
  openEmbeddedSession(_autoOpenId)
}

window.addEventListener('sf-sync-home-gallery', reloadHomeGalleryIfReady)

window.addEventListener('sf-home-session-closed', () => {
  resetPromptForNextGeneration()
  const scheduleGalleryReload = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        void reloadHomeGalleryIfReady()
      })
    })
  }
  if (authResolved) scheduleGalleryReload()
  else {
    window.addEventListener(
      'sf-home-auth-state',
      () => {
        scheduleGalleryReload()
      },
      { once: true },
    )
  }
})

window.addEventListener('pageshow', (event) => {
  applyHomeTabTitle()
  const nav = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined
  const navType = nav && 'type' in nav ? nav.type : ''
  const fromCachedPage = Boolean(event.persisted)
  const isBackNav = navType === 'back_forward'
  if (fromCachedPage || isBackNav) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.scrollTo(0, 0))
    })
  }

  const cameFromSession =
    fromCachedPage || isBackNav || sessionStorage.getItem('sf_return_home') === '1'
  if (!cameFromSession) return

  if (sessionStorage.getItem('sf_return_home') === '1') {
    sessionStorage.removeItem('sf_return_home')
  }
  resetPromptForNextGeneration()

  const scheduleGalleryReload = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        void reloadHomeGalleryIfReady()
      })
    })
  }

  if (authResolved) scheduleGalleryReload()
  else {
    window.addEventListener(
      'sf-home-auth-state',
      () => {
        scheduleGalleryReload()
      },
      { once: true },
    )
  }
})

window.addEventListener('sf-home-auth-state', (e: Event) => {
  currentUser = (e as CustomEvent<{ user: unknown }>).detail.user
  authResolved = true
  if (currentUser) void showApp()
  else void showAnonymousApp()
})


window.__sfHomeScriptReady = true
window.dispatchEvent(new CustomEvent('sf-home-script-ready'))
