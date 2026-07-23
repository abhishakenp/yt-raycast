import { generateText } from '../generate.ts'
import { stripFences } from './parser.ts'
import {
  getComponentSignature,
  buildComponentCall,
  arrayFieldNames,
} from './openui-signature.ts'
import type { GeneratedArtifact } from './events.ts'
import { THEME_CATALOG } from '../../../ship-fast-blocks/src/theme-apply.ts'
import { pickThemeForContext } from './theme-affinity.ts'
import spec from './generated/component-spec.json'
import {
  buildRouteTargetMap,
  PAGE_ROLE_IDS,
  planPages,
} from './navigation-plan.ts'

/**
 * v2 composable generator. Instead of one monolithic *KimiPage per page, a page
 * is COMPOSED from section capsules of a chosen vertical "family" (Crm, Bakery,
 * LawFirm, …). The model authors NAMED props (JSON) for each section in a single
 * call; the engine maps them to positional OpenUI via the spec signature, so the
 * output is valid by construction — no free-form OpenUI to mis-parse, no fallback.
 */

const COMPONENTS = (
  spec as { components: Record<string, { signature: string }> }
).components

// Canonical top-to-bottom section order for a composed marketing/home page.
// HEAD = content block (intro → offering); TAIL = proof/convert/close block.
// Bespoke vertical roles (pass 2) sit BETWEEN head and tail.
const HEAD = [
  'Navbar',
  'Hero',
  'FeaturedStory',
  'StoryGrid',
  'Logos',
  'Bento',
  'Features',
  'Services',
  'Steps',
  'Process',
  'Work',
  'Projects',
  'Gallery',
  'Topics',
  'Menu',
  'Schedule',
  'Events',
  'Programs',
] as const
const TAIL = [
  'Stats',
  'Pricing',
  'Testimonials',
  'Authors',
  'Faq',
  'Contact',
  'Cta',
  'Subscribe',
  'About',
  'Footer',
] as const
// Combined canonical order (unchanged) for pass-1 suffix matching.
const SECTION_ORDER = [...HEAD, ...TAIL] as const
const KNOWN_ROLES = new Set<string>(SECTION_ORDER)

export type Family = { name: string; sections: string[] }

/**
 * Discover vertical families (name → ordered section types present in the spec).
 * Pass 1 suffix-matches known roles; families with >=5 known roles are KEPT.
 * Pass 2 is suffix-agnostic: any leftover component whose name starts with a kept
 * family (longest-first to avoid Blog/BlogPost collisions) contributes a bespoke
 * role. role = name.slice(fam.length) so fam+role === name (always a real key).
 */
function discoverFamilies(): Map<string, Family> {
  const families = new Map<string, Family>()
  const allNames = new Set(Object.keys(COMPONENTS))
  // ---- pass 1: known-role suffix match ----
  for (const name of allNames) {
    for (const sec of SECTION_ORDER) {
      if (name.endsWith(sec) && name.length > sec.length) {
        const fam = name.slice(0, -sec.length)
        if (!fam || !/^[A-Z]/.test(fam)) continue
        const entry = families.get(fam) ?? { name: fam, sections: [] }
        if (!entry.sections.includes(sec)) entry.sections.push(sec)
        families.set(fam, entry)
        break
      }
    }
  }
  // Keep only substantive families (>=5 known roles).
  const keptFamilies = new Map<string, Family>()
  for (const [name, fam] of families) {
    const known = SECTION_ORDER.filter((s) => fam.sections.includes(s))
    if (known.length >= 5) keptFamilies.set(name, { name, sections: known })
  }
  // Components actually assigned to a kept family in pass 1 (full names).
  const assignedKnown = new Set<string>()
  for (const name of allNames) {
    for (const sec of SECTION_ORDER) {
      if (name.endsWith(sec) && name.length > sec.length) {
        const fam = name.slice(0, -sec.length)
        if (fam && keptFamilies.has(fam)) assignedKnown.add(name)
        break
      }
    }
  }
  // ---- pass 2: suffix-agnostic bespoke roles ----
  const keptNames = [...keptFamilies.keys()].sort((a, b) => b.length - a.length)
  const bespoke = new Map<string, string[]>()
  for (const name of allNames) {
    if (assignedKnown.has(name)) continue
    const fam = keptNames.find(
      (f) => name.startsWith(f) && name.length > f.length,
    )
    if (!fam) continue
    const role = name.slice(fam.length)
    if (!/^[A-Z]/.test(role)) continue
    if (KNOWN_ROLES.has(role)) continue // defensive: not this kept family's role
    const list = bespoke.get(fam) ?? []
    if (!list.includes(role)) list.push(role)
    bespoke.set(fam, list)
  }
  // ---- final ordering: HEAD known, then bespoke, then TAIL known ----
  const out = new Map<string, Family>()
  for (const [name, fam] of keptFamilies) {
    const present = new Set(fam.sections)
    const sections = [
      ...HEAD.filter((s) => present.has(s)),
      ...(bespoke.get(name) ?? []),
      ...TAIL.filter((s) => present.has(s)),
    ]
    out.set(name, { name, sections })
  }
  return out
}

export const FAMILIES = discoverFamilies()
export const FAMILY_NAMES = [...FAMILIES.keys()].sort()

// ---- seeded RNG (same pattern as v1 so same-prompt → reproducible variation) ----
function hashString(value: string): number {
  let h = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function makeSeededRng(seed: string): () => number {
  let state = hashString(seed) || 1
  return () => {
    state += 0x6d2b79f5
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function pick<T>(rng: () => number, xs: readonly T[]): T {
  return xs[Math.min(xs.length - 1, Math.floor(rng() * xs.length))]
}

// ─── Brand extraction ───────────────────────────────────────────────────────
// The LLM extracts the brand in the first-pass superagent call (zero extra
// cost — same call that picks the vertical and authors content). This minimal
// fallback is ONLY used when:
//   1. The free-form app path runs (no superagent call)
//   2. The LLM omits the "brand" field from its JSON response
//   3. An old cache entry has no brand
// It just grabs the first few meaningful words from the prompt — no heuristics.

const BRAND_FALLBACK_STOP = new Set([
  'a',
  'an',
  'the',
  'for',
  'with',
  'about',
  'to',
  'of',
  'in',
  'on',
  'and',
  'or',
  'my',
  'your',
  'our',
  'is',
  'are',
  'was',
  'were',
  'be',
  'i',
  'want',
  'need',
  'build',
  'make',
  'create',
  'generate',
  'website',
  'site',
  'app',
  'page',
  'landing',
  'homepage',
  'called',
  'named',
  'that',
  'this',
  'should',
  'have',
  'has',
  'will',
  'would',
  'can',
  'could',
])

export function brandFromPrompt(prompt: string): string {
  const words = String(prompt || '')
    .replace(/[^\p{L}\p{N}&'\u2019-]+/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !BRAND_FALLBACK_STOP.has(w.toLowerCase()))
    .slice(0, 2)
  if (words.length === 0) return 'Studio'
  if (words.every((w) => /^\d+$/.test(w))) return 'Studio'
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function classifySystem(): string {
  return `Pick the 3 best-fitting verticals for the requested website from this list, most-fitting first, comma-separated. Output ONLY names from the list.\n${FAMILY_NAMES.join(', ')}`
}

function norm(s: string): string {
  return s.replace(/[^A-Za-z]/g, '').toLowerCase()
}
const BY_NORM = new Map(FAMILY_NAMES.map((n) => [norm(n), n]))

/**
 * Rank the vertical families that fit the prompt (one cheap LLM call). Returns
 * up to 3 valid family names, most-fitting first — the seed later picks among
 * them so the SAME prompt yields different (but on-vertical) layouts each run.
 */
export async function classifyFamilies(
  prompt: string,
  modelId: string,
  signal: AbortSignal,
): Promise<string[]> {
  const raw = await generateText(
    modelId,
    classifySystem(),
    `Build request: ${prompt}\nOutput 3 vertical names from the list, comma-separated, best first.`,
    signal,
    1,
  )
  const picks = stripFences(raw)
    .split(/[,\n]/)
    .map((p) => BY_NORM.get(norm(p)))
    .filter((n): n is string => Boolean(n))
  const unique = [...new Set(picks)]
  return unique.length ? unique.slice(0, 3) : ['Marketing']
}

/** Seed-pick a family from the ranked candidates (deterministic per seed). */
export function resolveFamily(candidates: string[], seed: string): Family {
  const valid = candidates
    .map((c) => FAMILIES.get(c))
    .filter((f): f is Family => Boolean(f))
  const pool = valid.length ? valid : [...FAMILIES.values()]
  const rng = makeSeededRng(`${seed}:family`)
  return pick(rng, pool)
}

/** Generation authoring stays English-first; localization happens after render. */
function localeDirective(_locale?: string): string {
  return `

CRITICAL — VISIBLE COPY LANGUAGE:
1. Generate ALL user-visible content in polished English only: headings, copy, labels, nav labels, button text, item names, testimonials, form labels, and helper text.
2. Ignore any instruction in the user brief to write the generated site in another language. Localization runs later as a deterministic post-processing step.
3. If the brief is written in any other language/script, understand it as source context and translate concepts to their closest natural English equivalents before authoring copy.
4. Do not output native-script or romanized target-language visible copy. Preserve clear brand/proper names only when needed, transliterated to Latin characters if they appear in a non-Latin script.
5. Keep JSON keys, component names, URLs, paths, and program syntax in ASCII.`
}

function composeSystem(locale?: string): string {
  return `You author website content as JSON. You are given a page's section list with each section's component signature. Return ONE JSON object whose keys are the section ids and whose values are the section's props (named fields matching the signature shapes). Fill rich, realistic, on-topic content: real headings, copy, arrays of items with distinct entries, image alt text, links as quoted strings. Do NOT set brand or nav (the engine injects them). Output ONLY JSON, no prose, no markdown fences.

CRITICAL — IMAGE ALT TEXT RULES (alt text is used as the stock-photo search query):
1. Alt text MUST ALWAYS be in English, regardless of the page content language. No exceptions — not for avatars, not for product images, not for hero images.
2. When the brief contains non-English concepts, TRANSLATE them to their closest English visual equivalent. Examples: Malayalam "sarikk" → "silk saree", "onam" → "harvest festival", "ponnundu" → "gift box"; Hindi "mithai" → "Indian sweets"; Tamil "pookkalam" → "flower rangoli". Never transliterate — Pexels/Unsplash search in English and cannot match transliterated words.
3. Alt text must be a descriptive English phrase that a stock photographer would use. Write "Traditional Kerala saree on display" not "onam sarikk". Write "Portrait of smiling woman" not a non-English name. Write "Festive gift box with flowers" not "/images/hero1.jpg".
4. Never use file paths, URLs, or non-English script as alt text.${localeDirective(locale)}`
}

function composeUser(input: {
  prompt: string
  brand: string
  sections: { id: string; component: string }[]
}): string {
  const lines = input.sections
    .map((s) => `"${s.id}": ${getComponentSignature(s.component)}`)
    .join('\n')
  return `Build request: ${input.prompt}
Brand: ${input.brand}
Return a JSON object with exactly these keys, each filled with rich props matching its signature:
${lines}
Every value distinct and on-topic. Arrays should have several entries. Strings quoted.`
}

function parseJsonObject(raw: string): Record<string, Record<string, unknown>> {
  const text = stripFences(raw).trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start < 0 || end <= start)
    throw new Error('no JSON object in model output')
  return JSON.parse(text.slice(start, end + 1))
}

// ---- local family shortlist (NO LLM) so the homepage lands in the FIRST pass ----
function buildFamilyKeywords(): Map<string, string> {
  const map = new Map<string, string>()
  for (const [name, fam] of FAMILIES) {
    const parts = [name.replace(/([a-z])([A-Z])/g, '$1 $2')]
    for (const sec of fam.sections) {
      const d = (COMPONENTS as Record<string, { description?: string }>)[
        `${name}${sec}`
      ]?.description
      if (d) parts.push(d)
    }
    map.set(name, parts.join(' ').toLowerCase())
  }
  return map
}
const FAMILY_KEYWORDS = buildFamilyKeywords()
const STOPWORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'for',
  'with',
  'to',
  'of',
  'in',
  'on',
  'site',
  'website',
  'web',
  'app',
  'page',
  'build',
  'make',
  'create',
  'my',
  'your',
  'our',
  'that',
  'this',
  'new',
  'modern',
  'simple',
  'clean',
  'best',
  'platform',
])
function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
}

function splitCamel(s: string): string {
  return s.replace(/([a-z])([A-Z])/g, '$1 $2')
}
// Coarse intent synonyms → boost whole groups of families the keywords miss.
const INTENT_GROUPS: { hints: string[]; families: string[] }[] = [
  {
    hints: [
      'store',
      'shop',
      'buy',
      'ecommerce',
      'storefront',
      'merch',
      'sell',
      'product',
      'goods',
    ],
    families: [
      'FashionStore',
      'ElectronicsStore',
      'JewelryStore',
      'FurnitureStore',
      'BeautyStore',
      'Directory',
    ],
  },
  {
    hints: [
      'restaurant',
      'dining',
      'eatery',
      'bistro',
      'food',
      'menu',
      'chef',
      'cuisine',
    ],
    families: ['Cafe', 'Bakery', 'BarNightclub', 'FoodTruck', 'FoodDelivery'],
  },
  {
    hints: [
      'saas',
      'software',
      'api',
      'developer',
      'dev',
      'tool',
      'platform',
      'dashboard',
      'analytics',
    ],
    families: [
      'DevTool',
      'Crm',
      'CloudInfra',
      'Cybersecurity',
      'NoCode',
      'AiProduct',
    ],
  },
  // Auth / identity products ("authentication as a service", SSO/MFA) collide with
  // CleaningService on the generic word "service" — boost Auth explicitly.
  {
    hints: [
      'auth',
      'authentication',
      'login',
      'signin',
      'signup',
      'sso',
      'mfa',
      'oauth',
      'identity',
      'passwordless',
      'credential',
      'credentials',
      'session',
      'otp',
      'verification',
    ],
    families: ['Auth'],
  },
  {
    hints: [
      'fintech',
      'finance',
      'financial',
      'banking',
      'bank',
      'payments',
      'payment',
      'wallet',
      'lending',
      'loan',
      'invest',
      'investing',
      'money',
      'remittance',
      'neobank',
    ],
    families: ['Fintech', 'Lending', 'Investing', 'Crypto'],
  },
  {
    hints: [
      'marketplace',
      'vendors',
      'sellers',
      'multivendor',
      'classifieds',
      'buyers',
    ],
    families: ['Marketplace', 'Directory'],
  },
  {
    hints: [
      'estate',
      'realtor',
      'property',
      'properties',
      'homes',
      'housing',
      'rental',
      'rentals',
      'apartment',
      'apartments',
      'mortgage',
    ],
    families: ['RealEstate', 'PropertyListing', 'VacationRental'],
  },
  {
    hints: [
      'telehealth',
      'telemedicine',
      'doctor',
      'doctors',
      'clinic',
      'patient',
      'patients',
      'medical',
    ],
    families: ['Telehealth', 'Healthcare', 'Dental', 'MentalHealth'],
  },
  {
    hints: [
      'portfolio',
      'designer',
      'artist',
      'creative',
      'photographer',
      'freelance',
    ],
    families: ['Illustrator', 'FilmDirector', 'MusicArtist', 'Agency'],
  },
  {
    hints: [
      'news',
      'magazine',
      'newsroom',
      'editorial',
      'press',
      'journal',
      'publication',
      'blog',
    ],
    families: ['Newsroom', 'Newsletter'],
  },
]

/** Top-K candidate families by local keyword overlap (no model call). */
export function shortlistFamilies(prompt: string, k = 3): string[] {
  const pt = new Set(tokenize(prompt))
  const groupBoost = new Map<string, number>()
  for (const g of INTENT_GROUPS) {
    if (g.hints.some((h) => pt.has(h)))
      for (const f of g.families)
        groupBoost.set(f, (groupBoost.get(f) ?? 0) + 4)
  }
  const scored = [...FAMILIES.keys()]
    .map((name) => {
      const text = FAMILY_KEYWORDS.get(name) ?? ''
      let score = groupBoost.get(name) ?? 0
      for (const t of pt) if (text.includes(t)) score += 1
      for (const nt of tokenize(splitCamel(name))) if (pt.has(nt)) score += 6
      return { name, score }
    })
    .sort((a, b) => b.score - a.score)
  const top = scored
    .filter((s) => s.score > 0)
    .slice(0, k)
    .map((s) => s.name)
  if (top.length < k && !top.includes('Marketing')) top.push('Marketing')
  return top.length ? top.slice(0, Math.max(k, 1)) : ['Marketing']
}

function superagentSystem(locale?: string): string {
  return `You are a website superagent. You are given a build request and several CANDIDATE verticals, each with its homepage section components and prop signatures. Do ALL in one step: (1) extract the brand/business/person name from the build request (the proper noun the site is FOR — e.g. "Acme Cafe", "Kaveri Silks", "Dr. Pepper"; if none, infer a short plausible brand from the vertical/topic, e.g. "Coffee House" for a coffee shop; NEVER use the verb "generate"/"build"/"create" or generic words like "website"/"app" as the brand), (2) choose the single best-fitting vertical for the request, (3) decide a concise, descriptive site title for the <title> tag — include the brand and what the site is about (e.g. "Kaveri Silks — Premium Sarees & Traditional Wear"), NOT just the brand name, (4) suggest English navigation labels for the site's pages as a navLabels object mapping page role ids to display labels (only include roles relevant to the chosen vertical; "home" is always the first), (5) author rich, realistic, on-topic homepage content as JSON props for THAT chosen vertical's sections (match each section's signature field shapes; arrays get several distinct entries). Do NOT set brand or nav in the section props (the engine injects them). Output ONLY a JSON object: {"brand":"<extracted brand name>","family":"<ChosenVertical>","title":"<descriptive site title>","navLabels":{"home":"<label>",...},"sections":{"<sectionKeyLowercase>":{...props...}}}. No prose, no markdown fences.

CRITICAL — IMAGE ALT TEXT MUST ALWAYS BE IN ENGLISH. Alt text is used as the stock-photo search query. When the brief contains non-English concepts, TRANSLATE them to their closest English visual equivalent (e.g. "sarikk" → "silk saree", "onam" → "harvest festival", "mithai" → "Indian sweets"). Never transliterate. Never use file paths or non-English script as alt text.${localeDirective(locale)}`
}

function superagentUser(input: {
  prompt: string
  brand: string
  candidates: { family: string; lines: string[] }[]
}): string {
  const blocks = input.candidates
    .map((c) => `Vertical "${c.family}":\n${c.lines.join('\n')}`)
    .join('\n\n')
  return `Build request: ${input.prompt}
Brand (heuristic guess, may be wrong — verify against the build request and correct if needed): ${input.brand}
Candidate verticals and their homepage sections (sectionKey: signature):
${blocks}

Possible page role ids for navLabels (only label the ones relevant to your chosen vertical):
${PAGE_ROLE_IDS.join(', ')}

Choose ONE vertical that best fits the build request, extract the real brand name from the request, decide a descriptive site title, suggest nav labels for relevant page roles, then return:
{"brand":"<the real brand name extracted from the request>","family":"<one of the candidate vertical names>","title":"<descriptive site title>","navLabels":{"home":"<label>","pricing":"<label>",...},"sections":{ "<sectionKey>": { ...rich props matching that section's signature... } }}
Fill every section of the chosen vertical with distinct, on-topic content.`
}

export type FirstPassHome = {
  family: Family
  propsByKey: Record<string, Record<string, unknown>>
  /** LLM-extracted brand name (empty string if the model didn't return one). */
  brand?: string
  /** LLM-decided descriptive site title for the <title> tag. */
  title?: string
  /** LLM-suggested nav labels mapping page role id → display label. */
  navLabels?: Record<string, string>
}

/**
 * FIRST-PASS homepage: one superagent call that picks the vertical AND authors
 * all home-section props. Family shortlist is local (no model call), so the
 * homepage lands in the first LLM pass. Seed-independent (cacheable per prompt);
 * the caller applies the seed to vary which sections/order/theme are composed.
 */
export async function composeHomeFirstPass(input: {
  prompt: string
  brand: string
  modelId: string
  signal: AbortSignal
  familyOverride?: string
  locale?: string
}): Promise<FirstPassHome> {
  const names = input.familyOverride
    ? [input.familyOverride]
    : shortlistFamilies(input.prompt, 3)
  const shortlist = names
    .map((n) => FAMILIES.get(n))
    .filter((f): f is Family => Boolean(f))
  const candidates = shortlist.map((fam) => ({
    family: fam.name,
    lines: fam.sections.map(
      (sec) =>
        `  ${sec.toLowerCase()}: ${getComponentSignature(`${fam.name}${sec}`) ?? `${fam.name}${sec}(...)`}`,
    ),
  }))
  const ask = async (strict: boolean) => {
    const sys = strict
      ? `${superagentSystem(input.locale)} You MUST fill EVERY section listed for the chosen vertical with rich content — never return an empty or partial object.`
      : superagentSystem(input.locale)
    const raw = await generateText(
      input.modelId,
      sys,
      superagentUser({ prompt: input.prompt, brand: input.brand, candidates }),
      input.signal,
      1,
    )
    let parsed: Record<string, unknown> = {}
    try {
      const text = stripFences(raw).trim()
      parsed = JSON.parse(
        text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1),
      )
    } catch {
      parsed = {}
    }
    const family = typeof parsed.family === 'string' ? parsed.family : undefined
    const brand =
      typeof parsed.brand === 'string' ? parsed.brand.trim() : undefined
    const title =
      typeof parsed.title === 'string' ? parsed.title.trim() : undefined
    const navLabels =
      parsed.navLabels &&
      typeof parsed.navLabels === 'object' &&
      !Array.isArray(parsed.navLabels)
        ? Object.fromEntries(
            Object.entries(parsed.navLabels)
              .filter(([, v]) => typeof v === 'string' && v.trim())
              .map(([k, v]) => [k, String(v).trim()]),
          )
        : undefined
    // Tolerant: props live under "sections", else any top-level object value (the
    // model sometimes flattens). Normalize keys to lowercase section roles.
    const rawSections =
      parsed.sections && typeof parsed.sections === 'object'
        ? (parsed.sections as Record<string, unknown>)
        : parsed
    const props: Record<string, Record<string, unknown>> = {}
    for (const [key, value] of Object.entries(rawSections)) {
      if (
        key === 'family' ||
        key === 'sections' ||
        key === 'brand' ||
        key === 'title' ||
        key === 'navLabels'
      )
        continue
      if (value && typeof value === 'object' && !Array.isArray(value))
        props[key.toLowerCase()] = value as Record<string, unknown>
    }
    return { family, brand, title, navLabels, props }
  }

  let out = await ask(false)
  let chosen =
    (out.family && FAMILIES.get(out.family)) ||
    shortlist[0] ||
    FAMILIES.get('Marketing')!
  // Quality strictness: the home must be substantially filled (hero + ≥ half the
  // sections). If not, retry once with a stricter instruction — never ship an
  // empty/placeholder homepage.
  const enough = (fam: Family, props: Record<string, unknown>) => {
    const have = fam.sections.filter(
      (s: string) => props[s.toLowerCase()],
    ).length
    return Boolean(props['hero']) && have >= Math.ceil(fam.sections.length / 2)
  }
  if (!enough(chosen, out.props)) {
    const retry = await ask(true)
    const retryFam = (retry.family && FAMILIES.get(retry.family)) || chosen
    if (Object.keys(retry.props).length >= Object.keys(out.props).length) {
      out = retry
      chosen = retryFam
    }
  }
  return {
    family: chosen,
    propsByKey: out.props,
    brand: out.brand && out.brand.length >= 2 ? out.brand : undefined,
    title: out.title && out.title.length >= 2 ? out.title : undefined,
    navLabels:
      out.navLabels && Object.keys(out.navLabels).length > 0
        ? out.navLabels
        : undefined,
  }
}

/** Assemble a composed page from already-authored per-section props (no model call). */
export function assembleComposedPage(input: {
  family: Family
  propsByKey: Record<string, Record<string, unknown>>
  brand: string
  nav: string[]
  pageId: string
  seed: string
  sectionFilter?: (sections: string[]) => string[]
}): ComposedPage {
  const rng = makeSeededRng(`${input.seed}:${input.pageId}`)
  let sections = input.family.sections
  if (input.sectionFilter) sections = input.sectionFilter(sections)
  const SPINE = new Set(['Navbar', 'Hero', 'Footer'])
  const optional = sections.filter((s) => !SPINE.has(s))
  const keep = new Set<string>()
  for (const s of optional) if (rng() > 0.28) keep.add(s)
  if (keep.size < Math.min(3, optional.length)) {
    for (const s of optional) {
      if (keep.size >= 3) break
      keep.add(s)
    }
  }
  const used = sections.filter((s) => SPINE.has(s) || keep.has(s))
  const statements: string[] = []
  const refs: string[] = []
  const sectionIds: string[] = []
  const composedSections: ComposedSection[] = []
  for (const sec of used) {
    const id = `${input.pageId}_${sec.toLowerCase()}`
    const anchorId = `${id}_anchor`
    const anchorClass = sec === 'Navbar' ? '' : 'scroll-mt-28'
    const call = buildComponentCall({
      component: `${input.family.name}${sec}`,
      props: input.propsByKey[sec.toLowerCase()] ?? {},
      brand: input.brand,
      nav: input.nav,
    })
    if (!call) continue
    statements.push(`${id} = ${call}`)
    statements.push(
      anchorClass
        ? `${anchorId} = SectionAnchor("${id}", ${id}, "${anchorClass}")`
        : `${anchorId} = SectionAnchor("${id}", ${id})`,
    )
    refs.push(anchorId)
    sectionIds.push(id)
    composedSections.push({
      id,
      component: `${input.family.name}${sec}`,
      anchorClass,
    })
  }
  statements.push(`${input.pageId} = Stack([${refs.join(', ')}])`)
  return {
    statements,
    rootRef: input.pageId,
    family: input.family.name,
    sectionIds,
    sections: composedSections,
  }
}

export type ComposedSection = {
  id: string
  component: string
  anchorClass: string
}

export type ComposedPage = {
  statements: string[]
  rootRef: string
  family: string
  sectionIds: string[]
  sections: ComposedSection[]
}

/**
 * Compose one page from a family's sections in a SINGLE model call. Returns the
 * section statements plus a `Stack(...)` root reference (assigned by the caller).
 * Missing/!malformed section props degrade to fewer props (still valid OpenUI) —
 * there is no canned fallback page.
 */
export async function composePage(input: {
  prompt: string
  family: Family
  brand: string
  nav: string[]
  pageId: string
  seed: string
  modelId: string
  signal: AbortSignal
  locale?: string
  /** Limit which section types to include (e.g. a slimmer interior page). */
  sectionFilter?: (sections: string[]) => string[]
}): Promise<ComposedPage> {
  const rng = makeSeededRng(`${input.seed}:${input.pageId}`)
  let sections = input.family.sections
  if (input.sectionFilter) sections = input.sectionFilter(sections)
  // Seeded structural variation so the same prompt yields a different layout per
  // seed: keep the spine (Navbar/Hero/Footer always), then independently include
  // each optional section with a seeded coin flip (biased to keep most).
  const SPINE = new Set(['Navbar', 'Hero', 'Footer'])
  const optional = sections.filter((s) => !SPINE.has(s))
  // Guarantee at least 3 optional sections survive for a substantial page.
  const keep = new Set<string>()
  for (const s of optional) if (rng() > 0.28) keep.add(s)
  if (keep.size < Math.min(3, optional.length)) {
    for (const s of optional) {
      if (keep.size >= 3) break
      keep.add(s)
    }
  }
  const used = sections.filter((s) => SPINE.has(s) || keep.has(s))

  const sectionDefs = used.map((sec) => ({
    id: `${input.pageId}_${sec.toLowerCase()}`,
    component: `${input.family.name}${sec}`,
    sec,
  }))

  const raw = await generateText(
    input.modelId,
    composeSystem(input.locale),
    composeUser({
      prompt: input.prompt,
      brand: input.brand,
      sections: sectionDefs,
    }),
    input.signal,
    1,
  )
  let props: Record<string, Record<string, unknown>> = {}
  try {
    props = parseJsonObject(raw)
  } catch {
    // one strict retry; still no canned page — empty props degrade gracefully.
    const retry = await generateText(
      input.modelId,
      `${composeSystem(input.locale)} Return STRICT JSON only.`,
      composeUser({
        prompt: input.prompt,
        brand: input.brand,
        sections: sectionDefs,
      }),
      input.signal,
      1,
    )
    try {
      props = parseJsonObject(retry)
    } catch {
      props = {}
    }
  }

  const statements: string[] = []
  const refs: string[] = []
  const sectionIds: string[] = []
  const composedSections: ComposedSection[] = []
  for (const def of sectionDefs) {
    const anchorId = `${def.id}_anchor`
    const anchorClass = def.sec === 'Navbar' ? '' : 'scroll-mt-28'
    const call = buildComponentCall({
      component: def.component,
      props: props[def.id] ?? props[def.sec.toLowerCase()] ?? {},
      brand: input.brand,
      nav: input.nav,
    })
    if (!call) continue
    statements.push(`${def.id} = ${call}`)
    statements.push(
      anchorClass
        ? `${anchorId} = SectionAnchor("${def.id}", ${def.id}, "${anchorClass}")`
        : `${anchorId} = SectionAnchor("${def.id}", ${def.id})`,
    )
    refs.push(anchorId)
    sectionIds.push(def.id)
    composedSections.push({
      id: def.id,
      component: def.component,
      anchorClass,
    })
  }
  statements.push(`${input.pageId} = Stack([${refs.join(', ')}])`)
  return {
    statements,
    rootRef: input.pageId,
    family: input.family.name,
    sectionIds,
    sections: composedSections,
  }
}

// ---- multi-page orchestrator (home-first, then parallel fan-out) ----

export type V2Event =
  | { type: 'status'; message: string }
  | { type: 'theme'; name: string }
  | { type: 'locale'; code: string }
  | { type: 'plan'; ids: string[] }
  | { type: 'skeleton'; text: string }
  | { type: 'module'; id: string; text: string }
  | { type: 'source'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string }

export type V2PagePlan = {
  id: string
  label: string
  rootRef: string
  sections: ComposedSection[]
}

export type V2Result = {
  source: string
  theme: string | null
  locale: string
  brand: string
  /** LLM-decided descriptive site title for the <title> tag. */
  title?: string
  category: string
  family: string
  artifacts: GeneratedArtifact[]
  /** Page labels in route order (the PageSwitch nav array). */
  routes: string[]
  /** Structured per-page plan with composed section details. */
  pages: V2PagePlan[]
  /** Navigation target aliases → resolved targets (the PageSwitch targetMap). */
  navTargets: Record<string, string>
}

/**
 * Auto-generated fullstack manifest: the editable collections (array-typed prop
 * fields across the family's sections — e.g. stories, plans, products, items)
 * become managed tables. Drives the Lakebed backend + the existing generic
 * admin (which introspects sessionData). Derived from the components used.
 */
function buildFullstackManifest(family: Family): GeneratedArtifact {
  const tables = new Set<string>()
  for (const sec of family.sections) {
    if (/^(Navbar|Footer)$/.test(sec)) continue
    for (const field of arrayFieldNames(`${family.name}${sec}`))
      tables.add(field)
  }
  const manifest = {
    version: 2,
    kind: family.name,
    schema: `${family.name.toLowerCase()}-fullstack-v2`,
    auth: { provider: 'shoo' },
    storage: {
      html: 'browser-storage',
      react: 'browser-storage',
      next: 'app-data-runtime',
      lakebed: 'lakebed',
    },
    tables: [...tables].sort(),
  }
  return { key: 'fullstack-manifest', contentJson: JSON.stringify(manifest) }
}

/** Tolerantly parse model JSON into { sectionRole(lowercased) → props }. */
function parsePropsByRole(
  raw: string,
  roles: string[],
): Record<string, Record<string, unknown>> {
  let parsed: Record<string, unknown> = {}
  try {
    const t = stripFences(raw).trim()
    parsed = JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1))
  } catch {
    parsed = {}
  }
  const src =
    parsed.sections && typeof parsed.sections === 'object'
      ? (parsed.sections as Record<string, unknown>)
      : parsed
  const out: Record<string, Record<string, unknown>> = {}
  for (const role of roles) {
    const v = (src as Record<string, unknown>)[role.toLowerCase()]
    if (v && typeof v === 'object' && !Array.isArray(v))
      out[role.toLowerCase()] = v as Record<string, unknown>
  }
  return out
}

const PAGE_ROLE_CONTRACTS: Record<
  string,
  { purpose: string; goals: string[] }
> = {
  pricing: {
    purpose:
      'Help a visitor compare plans, understand value, and choose the next commercial step.',
    goals: [
      'include concrete plan names, prices or package tiers when the component supports them',
      'answer buying objections with FAQ/CTA content',
      'avoid generic company overview copy',
    ],
  },
  menu: {
    purpose:
      'Show the actual menu, categories, popular items, and ordering or reservation path.',
    goals: [
      'make item names and descriptions specific to the business',
      'use gallery/support sections to reinforce the menu experience',
      'avoid broad homepage positioning copy',
    ],
  },
  programs: {
    purpose:
      'Help visitors compare programs, courses, classes, degrees, tracks, or offerings and choose the right path.',
    goals: [
      'name concrete programs and who each is for',
      'connect schedules, pricing, proof, or application CTAs to enrollment intent',
      'avoid generic institution overview copy',
    ],
  },
  curriculum: {
    purpose:
      'Show the learning path, modules, skills, mentors, outcomes, and commitment clearly.',
    goals: [
      'make modules or lessons specific and sequenced',
      'connect outcomes and mentors to learner confidence',
      'avoid treating this as a generic services page',
    ],
  },
  outcomes: {
    purpose:
      'Explain measurable results, learner/customer outcomes, proof points, and next steps.',
    goals: [
      'make outcomes concrete and credible',
      'tie stats, testimonials, and FAQ answers to the requested site',
      'avoid repeating program descriptions without proof',
    ],
  },
  services: {
    purpose:
      'Explain the service lines, process, proof, and how to start an engagement.',
    goals: [
      'make each service distinct and practical',
      'connect process/stats/CTA sections to booking or inquiry intent',
      'avoid repeating the homepage hero promise',
    ],
  },
  products: {
    purpose:
      'Help visitors browse concrete products, collections, offers, and purchase paths.',
    goals: [
      'make products or collections specific to the requested store',
      'include practical buying cues such as categories, benefits, or social proof',
      'avoid generic brand manifesto copy',
    ],
  },
  collections: {
    purpose:
      'Merchandise curated collections, categories, edits, or product groups for browsing and purchase.',
    goals: [
      'name concrete collections that fit the requested store',
      'connect products, lookbook, and proof sections to shopping intent',
      'avoid generic product category filler',
    ],
  },
  lookbook: {
    purpose:
      'Present an editorial visual browsing path with seasonal looks, collections, or style stories.',
    goals: [
      'make each look or visual story specific to the brand',
      'connect images and CTAs to collections or products',
      'avoid turning the page into a plain product grid',
    ],
  },
  work: {
    purpose:
      'Showcase representative projects, outcomes, cases, or portfolio work.',
    goals: [
      'name concrete project examples',
      'emphasize outcomes, proof, and client context',
      'make the page useful even without a full hero',
    ],
  },
  projects: {
    purpose:
      'Show concrete projects, case studies, client work, or portfolio examples.',
    goals: [
      'name distinct project examples',
      'focus on outcomes, scope, and credibility',
      'avoid broad service-list repetition',
    ],
  },
  gallery: {
    purpose:
      'Let visitors browse visual examples, atmosphere, products, spaces, or past work.',
    goals: [
      'write image/gallery labels that match the requested site',
      'use testimonials or supporting text to add context',
      'avoid turning the page into a generic about page',
    ],
  },
  about: {
    purpose:
      'Explain the story, mission, credibility, team, and operating philosophy.',
    goals: [
      'make the origin and values specific to the brief',
      'use stats/process/testimonials as credibility, not filler',
      'avoid pricing or product-grid language unless relevant',
    ],
  },
  contact: {
    purpose:
      'Give visitors clear ways to contact, book, visit, request a quote, or ask questions.',
    goals: [
      'include practical contact paths, hours, location, or response expectations when supported',
      'use FAQ content for contact-specific concerns',
      'keep calls to action direct and low-friction',
    ],
  },
  stories: {
    purpose:
      'Give readers a useful publication index with articles, categories, authors, and reading paths.',
    goals: [
      'write story titles and summaries that match the topic',
      'make categories or authors help readers choose what to read next',
      'avoid generic homepage marketing copy',
    ],
  },
  topics: {
    purpose:
      'Organize publication, docs, or content themes into browsable topic paths.',
    goals: [
      'make each topic distinct and useful',
      'connect topics to stories, guides, or subscription intent',
      'avoid filler category names',
    ],
  },
  subscribe: {
    purpose:
      'Convert interested readers or customers into subscribers or members.',
    goals: [
      'explain what subscribers receive',
      'make signup value concrete',
      'handle frequency, access, or membership questions when supported',
    ],
  },
  newsletter: {
    purpose:
      'Explain the value of joining an email list, drop list, publication, or customer update channel.',
    goals: [
      'make the subscriber benefit specific',
      'connect products, topics, or offers to signup intent',
      'avoid vague "stay updated" filler',
    ],
  },
  schedule: {
    purpose:
      'Show the timing, agenda, classes, itinerary, or upcoming program clearly.',
    goals: [
      'include specific sessions, times, or sequence when supported',
      'connect schedule content to booking or attendance',
      'avoid generic event hype',
    ],
  },
  agenda: {
    purpose:
      'Show a clear event, webinar, conference, retreat, or program agenda that helps visitors decide to attend.',
    goals: [
      'include concrete sessions, sequencing, or timing when supported',
      'connect speakers, venue, and ticket content to registration intent',
      'avoid generic event overview copy',
    ],
  },
  events: {
    purpose:
      'Show upcoming events, experiences, notices, or happenings with enough detail to act.',
    goals: [
      'make each event distinct',
      'include date, location, audience, or value where supported',
      'connect to tickets, booking, or RSVP intent',
    ],
  },
  tickets: {
    purpose:
      'Help visitors compare ticket, pass, package, or registration options.',
    goals: [
      'make options and inclusions concrete',
      'answer buyer objections with FAQ/CTA content',
      'avoid unrelated event overview copy',
    ],
  },
  speakers: {
    purpose:
      'Introduce speakers, hosts, instructors, performers, or guests with useful credibility and context.',
    goals: [
      'make speaker roles and topics distinct',
      'connect lineup content to agenda or ticket intent',
      'avoid generic team-page language',
    ],
  },
  venue: {
    purpose:
      'Show location, venue, access, atmosphere, and practical attendance details.',
    goals: [
      'make location and visitor logistics concrete',
      'connect venue details to confidence about attending or booking',
      'avoid unrelated broad event hype',
    ],
  },
  rooms: {
    purpose:
      'Show lodging, rooms, suites, spaces, or stay options with booking context.',
    goals: [
      'describe concrete room or package options',
      'connect gallery/pricing/testimonials to booking confidence',
      'avoid generic hospitality slogans',
    ],
  },
  amenities: {
    purpose:
      'Show facilities, inclusions, amenities, services, and on-site advantages that help visitors choose.',
    goals: [
      'make each amenity specific and useful',
      'connect amenities to rooms, booking, or visitor confidence',
      'avoid generic luxury adjectives without details',
    ],
  },
  booking: {
    purpose:
      'Give visitors a clear reservation, booking, appointment, or inquiry path with practical choices.',
    goals: [
      'include concrete steps, options, and expectations when supported',
      'connect room/service/product choices to the booking action',
      'avoid generic contact-page language',
    ],
  },
  team: {
    purpose:
      'Introduce people, roles, expertise, and credibility behind the organization.',
    goals: [
      'make team members or roles specific',
      'connect credibility to services or visitor next steps',
      'avoid generic about-page prose',
    ],
  },
  authors: {
    purpose:
      'Introduce writers, hosts, contributors, or editorial voices behind the publication.',
    goals: [
      'make author beats and voices distinct',
      'connect authors to articles or subscription intent',
      'avoid generic team copy',
    ],
  },
}

function summarizeHomeProps(
  homeProps: Record<string, Record<string, unknown>> | undefined,
): string {
  if (!homeProps) return 'No homepage summary available yet.'
  const snippets: string[] = []
  for (const role of ['hero', 'features', 'services', 'menu', 'storygrid']) {
    const props = homeProps[role]
    if (!props) continue
    for (const key of ['heading', 'title', 'subheading', 'description']) {
      const value = props[key]
      if (typeof value === 'string' && value.trim()) snippets.push(value.trim())
      if (snippets.length >= 4) break
    }
    if (snippets.length >= 4) break
  }
  return snippets.length
    ? snippets.join(' | ')
    : 'Homepage establishes the brand and primary offer.'
}

/** One model call → section props (content only) for a page's sections. No seed. */
export async function composePageProps(input: {
  prompt: string
  family: Family
  pageId: string
  pageLabel?: string
  sections: string[]
  navTargets?: string[]
  homepageSummary?: string
  modelId: string
  signal: AbortSignal
  locale?: string
}): Promise<Record<string, Record<string, unknown>>> {
  const lines = input.sections
    .map(
      (sec) =>
        `"${sec.toLowerCase()}": ${getComponentSignature(`${input.family.name}${sec}`) ?? `${input.family.name}${sec}(...)`}`,
    )
    .join('\n')
  const contract = PAGE_ROLE_CONTRACTS[input.pageId] ?? {
    purpose: `Make the ${input.pageLabel ?? input.pageId} page useful and distinct from the homepage.`,
    goals: [
      'write content for this page role only',
      'make section copy specific to the requested site',
      'avoid filler or repeated homepage copy',
    ],
  }
  const user = `Build request: ${input.prompt}
Page contract:
- page id: ${input.pageId}
- page label: ${input.pageLabel ?? input.pageId}
- site kind / family: ${input.family.name}
- allowed sections only: ${input.sections.join(', ')}
- nav targets available: ${(input.navTargets ?? []).join(', ')}
- homepage summary for continuity: ${input.homepageSummary ?? 'No homepage summary available.'}
- page purpose: ${contract.purpose}
- content goals:
${contract.goals.map((goal) => `  - ${goal}`).join('\n')}
- this is a secondary page; do not write full landing-page hero content unless Hero is explicitly listed
Return a JSON object with exactly these keys, each filled with rich props matching its signature:
${lines}
Every value distinct and on-topic for this page role. Arrays should have several entries. Strings quoted. CTA/link labels may be persuasive; the engine resolves their targets deterministically.`
  const raw = await generateText(
    input.modelId,
    composeSystem(input.locale),
    user,
    input.signal,
    1,
  )
  return parsePropsByRole(raw, input.sections)
}

/**
 * Cacheable composition content: the vertical + per-page section props the AI
 * authored. Keyed by prompt at the convex layer — a per-session seed then
 * re-randomizes the COMPOSITION (pages/sections/order/theme) from this content,
 * so the same prompt yields a different layout every time at zero model cost.
 */
export type ComposedContent = {
  family: string
  pageProps: Record<string, Record<string, Record<string, unknown>>>
  /** LLM-extracted brand name (cached so cache hits reuse it). */
  brand?: string
  /** LLM-decided descriptive site title (cached so cache hits reuse it). */
  title?: string
  /** LLM-suggested nav labels mapping page role id → display label. */
  navLabels?: Record<string, string>
}

// ---- free-form app generation (no vertical family) ----
// Generic building blocks for arbitrary interactive UIs — layout, text, inputs,
// display + the interactivity primitives. Deliberately EXCLUDES vertical
// marketing sections so an "app" prompt yields a focused tool, not a site.
// Nothing here knows about any specific app (no counter/todo/etc. hardcoding).
const APP_PRIMITIVES = [
  'Stack',
  'Section',
  'Heading',
  'Text',
  'Button',
  'StateText',
  'StateButton',
  'StateInput',
  'Input',
  'Textarea',
  'Card',
  'Badge',
  'Separator',
  'Image',
  'Switch',
  'Slider',
  'Progress',
  'Avatar',
  'SignIn',
] as const

function appPrimitiveCatalog(): string {
  return APP_PRIMITIVES.map((n) => {
    const sig = COMPONENTS[n]?.signature
    return sig ? `${n}${sig.startsWith('(') ? '' : ' '}${sig}` : null
  })
    .filter((x): x is string => Boolean(x))
    .join('\n')
}

/** Light structural check: root is a Stack and every component call is known. */
function isValidFreeForm(source: string): boolean {
  if (!/(^|\n)\s*root\s*=\s*Stack\s*\(/.test(source)) return false
  const names = [...source.matchAll(/\b([A-Z][A-Za-z0-9]+)\s*\(/g)].map(
    (m) => m[1],
  )
  return names.length > 0 && names.every((n) => n in COMPONENTS)
}

const EXPLICIT_APP_TERMS =
  /\b(app|tool|widget|calculator|tracker|timer|counter|todo|kanban|game|quiz|converter|simulator|editor|dashboard|admin|form builder|chatbot)\b/i
const WEBSITE_TERMS =
  /\b(website|site|landing|homepage|page|blog|publication|newsletter|store|shop|restaurant|cafe|portfolio|agency|service|services|saas|startup|product|brand|company|marketing|vape|hotel|venue|event|clinic|studio|firm)\b/i
const TOOL_ONLY_TERMS =
  /\b(calculator|tracker|timer|counter|todo|kanban|game|quiz|converter|simulator|editor|dashboard|admin|form builder|chatbot)\b/i
const FLIGHT_SIMULATOR_TERMS =
  /\b(flight\s+sim(?:ulator)?|aviation\s+sim(?:ulator)?|pilot(?:ing)?\s+(?:a|the)?\s*(?:plane|aircraft)|fly(?:ing)?\s+(?:a|the)?\s*(?:plane|aircraft)|aircraft\s+(?:game|simulator))\b/i
const PLAYABLE_FLIGHT_TERMS =
  /\b(playable|game|gameplay|pilot|flying?|third-person|controls?|hud)\b/i
const FLIGHT_MARKETING_TERMS =
  /\b(marketing\s+(?:site|website|page)|landing\s+page|website\s+for)\b/i

/** Route playable aviation simulations to the dedicated runtime capsule. */
export function isFlightSimulatorGamePrompt(prompt: string): boolean {
  const text = prompt.trim()
  return (
    FLIGHT_SIMULATOR_TERMS.test(text) &&
    PLAYABLE_FLIGHT_TERMS.test(text) &&
    !FLIGHT_MARKETING_TERMS.test(text)
  )
}

export function shouldConsiderFreeFormAppMode(prompt: string): boolean {
  const text = prompt.trim()
  if (!EXPLICIT_APP_TERMS.test(text)) return false
  if (TOOL_ONLY_TERMS.test(text)) return true
  return !WEBSITE_TERMS.test(text)
}

/**
 * Route a build request between a vertical WEBSITE (curated family composition)
 * and a free-form interactive APP. One cheap call; the model generalizes — there
 * is no per-app logic. Defaults to 'website' on any ambiguity (safe path).
 */
export async function classifyGenerationMode(
  prompt: string,
  modelId: string,
  signal: AbortSignal,
): Promise<'website' | 'app'> {
  const system = `Classify the build request as exactly ONE word.
WEBSITE — a marketing, content, or business website for a real-world organization, product, brand, or person (it informs or sells, with pages like home/about/services).
APP — a self-contained interactive tool, utility, widget, tracker, calculator, or game that a person OPERATES with controls and live state, and is NOT a marketing website.
Output only the single word WEBSITE or APP.`
  const raw = await generateText(
    modelId,
    system,
    `Request: ${prompt}`,
    signal,
    0,
  )
  const first = stripFences(raw)
    .trim()
    .split(/[^A-Za-z]/)[0]
    ?.toUpperCase()
  return first === 'APP' ? 'app' : 'website'
}

/**
 * Author a complete, self-contained interactive program (root = Stack) from the
 * generic primitive set for any app/tool/widget. Validates + retries once.
 */
export async function composeFreeForm(input: {
  prompt: string
  brand: string
  modelId: string
  locale: string
  signal: AbortSignal
}): Promise<string> {
  const system = `You build a SELF-CONTAINED interactive UI as an OpenUI-Lang program for the user's request — a tool / app / widget / game. NO navbar, hero, or footer unless explicitly asked; render only what the request needs, centered and well-spaced.

Components (name + signature):
${appPrimitiveCatalog()}

INTERACTIVITY — state lives in NAMED SHARED FIELDS:
- StateText shows the live value of a field (prefix/suffix are labels).
- StateButton mutates a field on click — op: increment | decrement | set | toggle | reset (amount = step; value = target for set).
- StateInput is a two-way-bound input.
Any components that reference the SAME field string share one value. Compose these to build whatever the request needs.

SYNTAX — each line is "varName = Component(positional, args)"; reference earlier vars by name inside arrays; the LAST line MUST be "root = Stack([...])". Example (a toggle):
status = StateText("on", false, "Status: ")
toggle = StateButton("Toggle", "on", "toggle")
root = Stack([status, toggle])

RULES: output ONLY the program lines (no prose, no markdown, no comments). Reference ONLY the components listed above. Style with theme TOKEN classes (text-foreground, text-muted-foreground, bg-card, bg-primary, border-border, …) — NEVER hex.${localeDirective(input.locale)}`
  const user = `Build: ${input.prompt}\nTitle/brand if relevant: ${input.brand}`
  let source = stripFences(
    await generateText(input.modelId, system, user, input.signal, 0.4),
  ).trim()
  if (!isValidFreeForm(source)) {
    source = stripFences(
      await generateText(
        input.modelId,
        `${system}\n\nYour previous output was INVALID. Output ONLY valid program lines using ONLY the listed components, ending with root = Stack([...]).`,
        user,
        input.signal,
        0.2,
      ),
    ).trim()
  }
  return source
}

/**
 * Generate a full composable site. CONTENT (vertical + section props) is authored
 * by the model (homepage first, paints immediately; other pages fan out) OR taken
 * from `cachedContent`; the per-session seed then composes pages/sections/theme
 * from that content. Output is valid OpenUI by construction — no fallback.
 */
export async function runV2ComposedGeneration(input: {
  prompt: string
  modelId: string
  sessionSeed?: string
  preferredLanguage?: string
  familyOverride?: string
  signal?: AbortSignal
  /** Reuse already-authored content (cache hit) instead of calling the model. */
  cachedContent?: ComposedContent
  /** Emitted with the (possibly cache-augmented) content so the caller can cache it. */
  onContent?: (content: ComposedContent) => void
  onEvent?: (event: V2Event) => void
  onSource?: (source: string) => void
}): Promise<V2Result> {
  const abort = new AbortController()
  input.signal?.addEventListener('abort', () => abort.abort(), { once: true })
  const seed = input.sessionSeed || `${Date.now()}-${input.prompt.length}`
  const rng = makeSeededRng(seed)
  // Heuristic brand guess — used as a HINT to the LLM and as a fallback if the
  // LLM doesn't return a brand. The LLM-extracted brand (from the first-pass
  // superagent call) takes priority because only the LLM can understand
  // context like "Acme inspired" (not literally "Acme") or non-Latin scripts.
  let brand = brandFromPrompt(input.prompt)
  let title: string | undefined
  let navLabels: Record<string, string> | undefined
  const locale = input.preferredLanguage || 'en'
  const themeRoll = rng()
  let theme = pick(() => themeRoll, THEME_CATALOG).name
  const emit = (e: V2Event) => input.onEvent?.(e)

  // A flight simulator is a real-time Three.js runtime, not a composition of
  // generic form/state primitives. Select the registered whole-page capsule by
  // game intent so the output remains deterministic and immediately playable.
  if (!input.familyOverride && isFlightSimulatorGamePrompt(input.prompt)) {
    const source = 'root = FlightSimulator()'
    emit({ type: 'status', message: 'Preparing your flight simulator' })
    emit({ type: 'theme', name: theme })
    emit({ type: 'locale', code: locale })
    input.onSource?.(source)
    emit({ type: 'source', text: source })
    emit({ type: 'done' })
    return {
      source,
      theme,
      locale,
      brand,
      category: 'game',
      family: 'FlightSimulator',
      artifacts: [],
      routes: [],
      pages: [],
      navTargets: {},
    }
  }

  // CONTENT — reuse cached props, else author the homepage in the first pass.
  const cached =
    input.cachedContent && FAMILIES.has(input.cachedContent.family)
      ? input.cachedContent
      : undefined
  const pageProps: Record<string, Record<string, Record<string, unknown>>> = {
    ...(cached?.pageProps ?? {}),
  }
  let family: Family
  if (cached) {
    family = FAMILIES.get(cached.family)!
    // Reuse the LLM-extracted brand from the cache if present.
    if (cached.brand && cached.brand.length >= 2) brand = cached.brand
    // Reuse the LLM-decided title and nav labels from the cache if present.
    if (cached.title && cached.title.length >= 2) title = cached.title
    if (cached.navLabels && Object.keys(cached.navLabels).length > 0)
      navLabels = cached.navLabels
  } else {
    emit({ type: 'status', message: 'Designing your homepage' })
    const firstPass = await composeHomeFirstPass({
      prompt: input.prompt,
      brand,
      modelId: input.modelId,
      signal: abort.signal,
      familyOverride: input.familyOverride,
      locale,
    })
    family = firstPass.family
    pageProps.home = firstPass.propsByKey
    // LLM-extracted brand takes priority over the heuristic guess.
    if (firstPass.brand && firstPass.brand.length >= 2) brand = firstPass.brand
    // LLM-decided title and nav labels take priority over heuristics.
    if (firstPass.title && firstPass.title.length >= 2) title = firstPass.title
    if (firstPass.navLabels && Object.keys(firstPass.navLabels).length > 0)
      navLabels = firstPass.navLabels
  }

  theme =
    pickThemeForContext({
      prompt: input.prompt,
      familyName: family.name,
      rng: () => themeRoll,
    }) ?? theme

  const pages = planPages(family, seed, navLabels)
  const nav = pages.map((p) => p.label)
  emit({ type: 'theme', name: theme })
  emit({ type: 'locale', code: locale })
  emit({ type: 'plan', ids: pages.map((p) => p.id) })
  const composedByPage = new Map<string, ComposedPage>()
  const renderSkeleton = () => {
    const targetMap = buildRouteTargetMap({ pages, pageProps })
    return `root = PageSwitch(${JSON.stringify(nav)}, [${pages.map((p) => p.id).join(', ')}], "", ${JSON.stringify(targetMap)})`
  }
  const skeleton = renderSkeleton()
  emit({ type: 'skeleton', text: skeleton })

  const byPage = new Map<string, string[]>()
  const renderSource = () => {
    const stmts: string[] = []
    for (const p of pages) {
      const s = byPage.get(p.id)
      if (s) stmts.push(...s)
    }
    return `${stmts.join('\n')}\n${renderSkeleton()}`
  }

  // HOME — compose from content (cached or first-pass), paint immediately.
  const home = assembleComposedPage({
    family,
    propsByKey: pageProps.home ?? {},
    brand,
    nav,
    pageId: 'home',
    seed,
  })
  byPage.set('home', home.statements)
  composedByPage.set('home', home)
  emit({ type: 'module', id: 'home', text: home.statements.join('\n') })
  input.onSource?.(renderSource())
  emit({ type: 'source', text: renderSource() })

  // SECONDARY PAGES — content from cache, else generate; then compose (seeded).
  await Promise.all(
    pages.slice(1).map(async (p) => {
      if (!pageProps[p.id]) {
        pageProps[p.id] = await composePageProps({
          prompt: input.prompt,
          family,
          pageId: p.id,
          pageLabel: p.label,
          sections: p.sections,
          navTargets: nav,
          homepageSummary: summarizeHomeProps(pageProps.home),
          modelId: input.modelId,
          signal: abort.signal,
          locale,
        })
      }
      const composed = assembleComposedPage({
        family,
        propsByKey: pageProps[p.id],
        brand,
        nav,
        pageId: p.id,
        seed,
        sectionFilter: (all) => all.filter((s) => p.sections.includes(s)),
      })
      byPage.set(p.id, composed.statements)
      composedByPage.set(p.id, composed)
      emit({ type: 'module', id: p.id, text: composed.statements.join('\n') })
      input.onSource?.(renderSource())
      emit({ type: 'source', text: renderSource() })
    }),
  )

  input.onContent?.({ family: family.name, pageProps, brand, title, navLabels })
  const source = renderSource()
  const navTargets = buildRouteTargetMap({ pages, pageProps })
  const pagePlans: V2PagePlan[] = pages.map((p) => {
    const composed = composedByPage.get(p.id)
    return {
      id: p.id,
      label: p.label,
      rootRef: composed?.rootRef ?? p.id,
      sections: composed?.sections ?? [],
    }
  })
  emit({ type: 'done' })
  return {
    source,
    theme,
    locale,
    brand,
    title,
    category: family.name,
    family: family.name,
    artifacts: [buildFullstackManifest(family)],
    routes: nav,
    pages: pagePlans,
    navTargets,
  }
}
