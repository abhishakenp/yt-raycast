import { generateText } from '../generate.ts'
import { stripFences } from './parser.ts'
import {
  getComponentSignature,
  buildComponentCall,
  arrayFieldNames,
} from './openui-signature.ts'
import type { GeneratedArtifact } from './events.ts'
import { THEME_CATALOG } from '../../../ship-fast-blocks/src/theme-apply.ts'
import spec from './generated/component-spec.json'

/**
 * v2 composable generator. Instead of one monolithic *KimiPage per page, a page
 * is COMPOSED from section capsules of a chosen vertical "family" (Crm, Bakery,
 * LawFirm, …). The model authors NAMED props (JSON) for each section in a single
 * call; the engine maps them to positional OpenUI via the spec signature, so the
 * output is valid by construction — no free-form OpenUI to mis-parse, no fallback.
 */

const COMPONENTS = (spec as { components: Record<string, { signature: string }> })
  .components

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
    const fam = keptNames.find((f) => name.startsWith(f) && name.length > f.length)
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
const pick = <T>(rng: () => number, xs: readonly T[]): T =>
  xs[Math.min(xs.length - 1, Math.floor(rng() * xs.length))]

export function brandFromPrompt(prompt: string): string {
  const cleaned = prompt
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^A-Za-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 2 &&
        !/^(the|and|for|with|about|site|shop|store|make|build|app|website)$/i.test(
          w,
        ),
    )
    .slice(0, 2)
  if (cleaned.length === 0) return 'Studio'
  return cleaned.map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')
}

function classifySystem(): string {
  return `Pick the 3 best-fitting verticals for the requested website from this list, most-fitting first, comma-separated. Output ONLY names from the list.\n${FAMILY_NAMES.join(', ')}`
}

const norm = (s: string): string => s.replace(/[^A-Za-z]/g, '').toLowerCase()
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
  const valid = candidates.map((c) => FAMILIES.get(c)).filter((f): f is Family => Boolean(f))
  const pool = valid.length ? valid : [...FAMILIES.values()]
  const rng = makeSeededRng(`${seed}:family`)
  return pick(rng, pool)
}

const LANG_NAMES: Record<string, string> = {
  fr: 'French', es: 'Spanish', de: 'German', it: 'Italian', pt: 'Portuguese',
  nl: 'Dutch', sv: 'Swedish', da: 'Danish', no: 'Norwegian', fi: 'Finnish',
  pl: 'Polish', tr: 'Turkish', ja: 'Japanese', zh: 'Chinese', ko: 'Korean',
  ar: 'Arabic', hi: 'Hindi', ru: 'Russian', uk: 'Ukrainian', he: 'Hebrew',
  th: 'Thai', vi: 'Vietnamese', id: 'Indonesian', ms: 'Malay', cs: 'Czech',
  el: 'Greek', ro: 'Romanian', hu: 'Hungarian', ta: 'Tamil', ml: 'Malayalam',
}
/** Instruction that forces all user-visible content into a non-English locale. */
function localeDirective(locale?: string): string {
  if (!locale || locale === 'en') return ''
  const name = LANG_NAMES[locale] ?? locale
  return ` Write ALL user-visible content (headings, copy, labels, button text, item names) in ${name} (${locale}). Keep JSON keys, component names, and URLs/paths unchanged and in ASCII.`
}

function composeSystem(locale?: string): string {
  return `You author website content as JSON. You are given a page's section list with each section's component signature. Return ONE JSON object whose keys are the section ids and whose values are the section's props (named fields matching the signature shapes). Fill rich, realistic, on-topic content: real headings, copy, arrays of items with distinct entries, image alt text, links as quoted strings. Do NOT set brand or nav (the engine injects them). Output ONLY JSON, no prose, no markdown fences.${localeDirective(locale)}`
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
  if (start < 0 || end <= start) throw new Error('no JSON object in model output')
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
  'the', 'a', 'an', 'and', 'or', 'for', 'with', 'to', 'of', 'in', 'on', 'site',
  'website', 'web', 'app', 'page', 'build', 'make', 'create', 'my', 'your',
  'our', 'that', 'this', 'new', 'modern', 'simple', 'clean', 'best', 'platform',
])
const tokenize = (s: string): string[] =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))

const splitCamel = (s: string): string => s.replace(/([a-z])([A-Z])/g, '$1 $2')
// Coarse intent synonyms → boost whole groups of families the keywords miss.
const INTENT_GROUPS: { hints: string[]; families: string[] }[] = [
  { hints: ['store', 'shop', 'buy', 'ecommerce', 'storefront', 'merch', 'sell', 'product', 'goods'], families: ['FashionStore', 'ElectronicsStore', 'JewelryStore', 'FurnitureStore', 'BeautyStore', 'Directory'] },
  { hints: ['restaurant', 'dining', 'eatery', 'bistro', 'food', 'menu', 'chef', 'cuisine'], families: ['Cafe', 'Bakery', 'BarNightclub', 'FoodTruck', 'FoodDelivery'] },
  { hints: ['saas', 'software', 'api', 'developer', 'dev', 'tool', 'platform', 'dashboard', 'analytics'], families: ['DevTool', 'Crm', 'CloudInfra', 'Cybersecurity', 'NoCode', 'AiProduct'] },
  // Auth / identity products ("authentication as a service", SSO/MFA) collide with
  // CleaningService on the generic word "service" — boost Auth explicitly.
  { hints: ['auth', 'authentication', 'login', 'signin', 'signup', 'sso', 'mfa', 'oauth', 'identity', 'passwordless', 'credential', 'credentials', 'session', 'otp', 'verification'], families: ['Auth'] },
  { hints: ['fintech', 'finance', 'financial', 'banking', 'bank', 'payments', 'payment', 'wallet', 'lending', 'loan', 'invest', 'investing', 'money', 'remittance', 'neobank'], families: ['Fintech', 'Lending', 'Investing', 'Crypto'] },
  { hints: ['marketplace', 'vendors', 'sellers', 'multivendor', 'classifieds', 'buyers'], families: ['Marketplace', 'Directory'] },
  { hints: ['estate', 'realtor', 'property', 'properties', 'homes', 'housing', 'rental', 'rentals', 'apartment', 'apartments', 'mortgage'], families: ['RealEstate', 'PropertyListing', 'VacationRental'] },
  { hints: ['telehealth', 'telemedicine', 'doctor', 'doctors', 'clinic', 'patient', 'patients', 'medical'], families: ['Telehealth', 'Healthcare', 'Dental', 'MentalHealth'] },
  { hints: ['portfolio', 'designer', 'artist', 'creative', 'photographer', 'freelance'], families: ['Illustrator', 'FilmDirector', 'MusicArtist', 'Agency'] },
  { hints: ['news', 'magazine', 'newsroom', 'editorial', 'press', 'journal', 'publication', 'blog'], families: ['Newsroom', 'Newsletter'] },
  // Classic Indian-government / public-sector / PSU portals are an obvious, common
  // ask ("indian government site", "classical site", "PSU power utility") — route
  // them firmly to the GovernmentPortal family.
  { hints: ['government', 'indian', 'india', 'sarkari', 'gov', 'public', 'sector', 'psu', 'ministry', 'department', 'municipal', 'municipality', 'civic', 'citizen', 'classic', 'classical', 'official', 'portal', 'tender', 'notice', 'utility', 'electricity', 'nigam', 'nagar', 'board', 'authority', 'commission'], families: ['GovernmentPortal'] },
]

/** Top-K candidate families by local keyword overlap (no model call). */
export function shortlistFamilies(prompt: string, k = 3): string[] {
  const pt = new Set(tokenize(prompt))
  const groupBoost = new Map<string, number>()
  for (const g of INTENT_GROUPS) {
    if (g.hints.some((h) => pt.has(h)))
      for (const f of g.families) groupBoost.set(f, (groupBoost.get(f) ?? 0) + 4)
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
  const top = scored.filter((s) => s.score > 0).slice(0, k).map((s) => s.name)
  if (top.length < k && !top.includes('Marketing')) top.push('Marketing')
  return top.length ? top.slice(0, Math.max(k, 1)) : ['Marketing']
}

function superagentSystem(locale?: string): string {
  return `You are a website superagent. You are given a build request and several CANDIDATE verticals, each with its homepage section components and prop signatures. Do BOTH in one step: (1) choose the single best-fitting vertical for the request, (2) author rich, realistic, on-topic homepage content as JSON props for THAT chosen vertical's sections (match each section's signature field shapes; arrays get several distinct entries). Do NOT set brand or nav (the engine injects them). Output ONLY a JSON object: {"family":"<ChosenVertical>","sections":{"<sectionKeyLowercase>":{...props...}}}. No prose, no markdown fences.${localeDirective(locale)}`
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
Brand: ${input.brand}
Candidate verticals and their homepage sections (sectionKey: signature):
${blocks}

Choose ONE vertical that best fits the build request, then return:
{"family":"<one of the candidate vertical names>","sections":{ "<sectionKey>": { ...rich props matching that section's signature... } }}
Fill every section of the chosen vertical with distinct, on-topic content.`
}

export type FirstPassHome = {
  family: Family
  propsByKey: Record<string, Record<string, unknown>>
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
  const ask = async (strict: boolean): Promise<{ family?: string; props: Record<string, Record<string, unknown>> }> => {
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
      parsed = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1))
    } catch {
      parsed = {}
    }
    const family = typeof parsed.family === 'string' ? parsed.family : undefined
    // Tolerant: props live under "sections", else any top-level object value (the
    // model sometimes flattens). Normalize keys to lowercase section roles.
    const rawSections =
      parsed.sections && typeof parsed.sections === 'object'
        ? (parsed.sections as Record<string, unknown>)
        : parsed
    const props: Record<string, Record<string, unknown>> = {}
    for (const [key, value] of Object.entries(rawSections)) {
      if (key === 'family' || key === 'sections') continue
      if (value && typeof value === 'object' && !Array.isArray(value))
        props[key.toLowerCase()] = value as Record<string, unknown>
    }
    return { family, props }
  }

  let out = await ask(false)
  let chosen = (out.family && FAMILIES.get(out.family)) || shortlist[0] || FAMILIES.get('Marketing')!
  // Quality strictness: the home must be substantially filled (hero + ≥ half the
  // sections). If not, retry once with a stricter instruction — never ship an
  // empty/placeholder homepage.
  const enough = (fam: Family, props: Record<string, unknown>): boolean => {
    const have = fam.sections.filter((s) => props[s.toLowerCase()]).length
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
  return { family: chosen, propsByKey: out.props }
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
  for (const sec of used) {
    const id = `${input.pageId}_${sec.toLowerCase()}`
    const call = buildComponentCall({
      component: `${input.family.name}${sec}`,
      props: input.propsByKey[sec.toLowerCase()] ?? {},
      brand: input.brand,
      nav: input.nav,
    })
    if (!call) continue
    statements.push(`${id} = ${call}`)
    refs.push(id)
  }
  statements.push(`${input.pageId} = Stack([${refs.join(', ')}])`)
  return { statements, rootRef: input.pageId, family: input.family.name, sectionIds: refs }
}

export type ComposedPage = {
  statements: string[]
  rootRef: string
  family: string
  sectionIds: string[]
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
  for (const def of sectionDefs) {
    const call = buildComponentCall({
      component: def.component,
      props: props[def.id] ?? props[def.sec.toLowerCase()] ?? {},
      brand: input.brand,
      nav: input.nav,
    })
    if (!call) continue
    statements.push(`${def.id} = ${call}`)
    refs.push(def.id)
  }
  statements.push(`${input.pageId} = Stack([${refs.join(', ')}])`)
  return {
    statements,
    rootRef: input.pageId,
    family: input.family.name,
    sectionIds: refs,
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

export type V2Result = {
  source: string
  theme: string | null
  locale: string
  brand: string
  category: string
  family: string
  artifacts: GeneratedArtifact[]
}

type PagePlan = { id: string; label: string; sections: string[] }

/**
 * Auto-generated fullstack manifest: the editable collections (array-typed prop
 * fields across the family's sections — e.g. stories, plans, products, items)
 * become managed tables. Drives the Lakebed backend + the existing generic
 * admin (which introspects sessionData). Derived from the components used.
 */
function buildFullstackManifest(family: Family): GeneratedArtifact {
  const tables = new Set<string>()
  for (const sec of family.sections) {
    for (const field of arrayFieldNames(`${family.name}${sec}`)) tables.add(field)
  }
  const manifest = {
    version: 2,
    kind: family.name,
    schema: `${family.name.toLowerCase()}-fullstack-v2`,
    auth: { provider: 'shoo', adminPolicyKey: 'admin-policy' },
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

const SECONDARY_ROLES: { id: string; label: string; need: string; want: string[] }[] = [
  { id: 'pricing', label: 'Pricing', need: 'Pricing', want: ['Navbar', 'Hero', 'Pricing', 'Faq', 'Cta', 'Footer'] },
  { id: 'menu', label: 'Menu', need: 'Menu', want: ['Navbar', 'Hero', 'Menu', 'Gallery', 'Footer'] },
  { id: 'services', label: 'Services', need: 'Services', want: ['Navbar', 'Hero', 'Services', 'Process', 'Stats', 'Cta', 'Footer'] },
  { id: 'work', label: 'Work', need: 'Work', want: ['Navbar', 'Hero', 'Work', 'Projects', 'Stats', 'Testimonials', 'Footer'] },
  { id: 'gallery', label: 'Gallery', need: 'Gallery', want: ['Navbar', 'Hero', 'Gallery', 'Testimonials', 'Footer'] },
  { id: 'about', label: 'About', need: 'About', want: ['Navbar', 'Hero', 'About', 'Stats', 'Process', 'Testimonials', 'Footer'] },
  { id: 'contact', label: 'Contact', need: 'Contact', want: ['Navbar', 'Hero', 'Contact', 'Faq', 'Footer'] },
]

/** Pick the homepage + 2-3 secondary pages this family can actually compose. */
function planPages(family: Family, seed: string): PagePlan[] {
  const home: PagePlan = { id: 'home', label: 'Home', sections: family.sections }
  const rng = makeSeededRng(`${seed}:pages`)
  const has = new Set(family.sections)
  const candidates = SECONDARY_ROLES.filter((r) => has.has(r.need)).map((r) => ({
    id: r.id,
    label: r.label,
    sections: family.sections.filter((s) => r.want.includes(s)),
  }))
  // Always provide an "Explore" page from sections not foregrounded elsewhere so
  // even families with few named roles still ship a multi-page site.
  const spine = ['Navbar', 'Hero', 'Footer']
  const leftover = family.sections.filter(
    (s) => !spine.includes(s) && !candidates.some((c) => c.sections.includes(s)),
  )
  if (leftover.length >= 2) {
    candidates.push({
      id: 'explore',
      label: 'Explore',
      sections: ['Navbar', 'Hero', ...leftover, 'Footer'].filter((s) => has.has(s)),
    })
  }
  const usable = candidates.filter((p) => p.sections.length >= 3)
  const shuffled = [...usable].sort(() => rng() - 0.5)
  const count = Math.min(3, Math.max(2, shuffled.length))
  return [home, ...shuffled.slice(0, count)]
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

/** One model call → section props (content only) for a page's sections. No seed. */
export async function composePageProps(input: {
  prompt: string
  family: Family
  pageId: string
  sections: string[]
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
  const user = `Build request: ${input.prompt}
Return a JSON object with exactly these keys, each filled with rich props matching its signature:
${lines}
Every value distinct and on-topic. Arrays should have several entries. Strings quoted.`
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
}

// ---- free-form app generation (no vertical family) ----
// Generic building blocks for arbitrary interactive UIs — layout, text, inputs,
// display + the interactivity primitives. Deliberately EXCLUDES vertical
// marketing sections so an "app" prompt yields a focused tool, not a site.
// Nothing here knows about any specific app (no counter/todo/etc. hardcoding).
const APP_PRIMITIVES = [
  'Stack', 'Section', 'Heading', 'Text', 'Button',
  'StateText', 'StateButton', 'StateInput',
  'Input', 'Textarea', 'Card', 'Badge', 'Separator', 'Image',
  'Switch', 'Slider', 'Progress', 'Avatar', 'SignIn',
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
  const names = [...source.matchAll(/\b([A-Z][A-Za-z0-9]+)\s*\(/g)].map((m) => m[1])
  return names.length > 0 && names.every((n) => n in COMPONENTS)
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
  const raw = await generateText(modelId, system, `Request: ${prompt}`, signal, 0)
  const first = stripFences(raw).trim().split(/[^A-Za-z]/)[0]?.toUpperCase()
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
  const brand = brandFromPrompt(input.prompt)
  const locale = input.preferredLanguage || 'en'
  const theme = pick(rng, THEME_CATALOG).name
  const emit = (e: V2Event) => input.onEvent?.(e)

  // ROUTE — a self-contained interactive app/tool/widget (not a marketing
  // website) is generated FREE-FORM from the generic primitives, so the engine
  // is not limited to the curated vertical families. The classifier generalizes
  // from a principle (operated tool vs marketing site); no per-app logic here.
  if (!input.cachedContent && !input.familyOverride) {
    const mode = await classifyGenerationMode(
      input.prompt,
      input.modelId,
      abort.signal,
    )
    if (mode === 'app') {
      emit({ type: 'status', message: 'Building your app' })
      emit({ type: 'theme', name: theme })
      emit({ type: 'locale', code: locale })
      const source = await composeFreeForm({
        prompt: input.prompt,
        brand,
        modelId: input.modelId,
        locale,
        signal: abort.signal,
      })
      input.onSource?.(source)
      emit({ type: 'source', text: source })
      emit({ type: 'done' })
      return {
        source,
        theme,
        locale,
        brand,
        category: 'app',
        family: 'Freeform',
        artifacts: [],
      }
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
  }

  const pages = planPages(family, seed)
  const nav = pages.map((p) => p.label)
  emit({ type: 'theme', name: theme })
  emit({ type: 'locale', code: locale })
  emit({ type: 'plan', ids: pages.map((p) => p.id) })
  const skeleton = `root = PageSwitch(${JSON.stringify(nav)}, [${pages.map((p) => p.id).join(', ')}])`
  emit({ type: 'skeleton', text: skeleton })

  const byPage = new Map<string, string[]>()
  const renderSource = () => {
    const stmts: string[] = []
    for (const p of pages) {
      const s = byPage.get(p.id)
      if (s) stmts.push(...s)
    }
    return `${stmts.join('\n')}\n${skeleton}`
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
          sections: p.sections,
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
      emit({ type: 'module', id: p.id, text: composed.statements.join('\n') })
      input.onSource?.(renderSource())
      emit({ type: 'source', text: renderSource() })
    }),
  )

  input.onContent?.({ family: family.name, pageProps })
  const source = renderSource()
  emit({ type: 'done' })
  return {
    source,
    theme,
    locale,
    brand,
    category: family.name,
    family: family.name,
    artifacts: [buildFullstackManifest(family)],
  }
}
