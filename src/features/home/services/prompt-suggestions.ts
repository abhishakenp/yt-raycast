const PARTIAL_MAX = 480
const LINE_MAX = 380
const MIN_TAIL = 6

export const PROMPT_SUGGESTION_CACHE_PREFIX = 'ship-fast:prompt-suggestions:'

const genericTails = [
  'with a polished hero, clear navigation, trust signals, featured sections, and a direct conversion path.',
  'with a premium responsive layout, strong visuals, useful content blocks, FAQs, and a simple contact flow.',
  'with audience-focused copy, practical sections, social proof, mobile-first spacing, and launch-ready styling.',
  'with a distinctive brand feel, conversion-focused calls to action, testimonials, and a clean footer.',
] as const

const blogTails = [
  'with featured articles, category filters, editor picks, author cards, newsletter signup, and a warm editorial layout.',
  'with a magazine-style hero, trending posts, practical guides, searchable categories, and a strong subscription flow.',
  'with long-form story cards, topic collections, expert tips, social proof, and a mobile-friendly reading experience.',
  'with a clear publication structure, latest posts, resources, testimonials, and a polished newsletter call to action.',
] as const

const commerceTails = [
  'with a premium storefront, product collections, featured bundles, reviews, cart-ready calls to action, and trust badges.',
  'with conversion-focused product cards, best sellers, category navigation, promotions, and a smooth checkout story.',
  'with a bold ecommerce hero, curated collections, social proof, FAQs, and clear purchase paths across mobile and desktop.',
  'with launch-ready merchandising, product benefits, customer reviews, delivery details, and polished checkout prompts.',
] as const

const appTails = [
  'with a focused product hero, feature cards, workflow screenshots, integrations, pricing, and a clear signup path.',
  'with a modern SaaS layout, dashboard preview, benefits, use cases, testimonials, and conversion-focused pricing.',
  'with crisp positioning, product modules, metrics, security notes, customer proof, and a fast onboarding call to action.',
  'with a polished app marketing page, interactive-feeling sections, comparison blocks, FAQs, and a launch-ready footer.',
] as const

const portfolioTails = [
  'with selected work, case studies, process notes, client proof, a concise bio, and an elegant contact section.',
  'with a refined portfolio grid, project stories, services, testimonials, awards, and a direct inquiry flow.',
  'with strong personal branding, featured projects, skills, experience highlights, and a polished mobile layout.',
  'with immersive case studies, visual project cards, credibility signals, and a simple booking or contact path.',
] as const

function inferTails(partial: string): readonly string[] {
  const lower = partial.toLowerCase()
  if (
    /\b(blog|publication|newsletter|articles?|magazine|editorial)\b/.test(lower)
  ) {
    return blogTails
  }
  if (
    /\b(shop|store|e-?commerce|commerce|products?|checkout|cart|marketplace)\b/.test(
      lower,
    )
  ) {
    return commerceTails
  }
  if (
    /\b(app|saas|software|dashboard|platform|tool|ai|analytics)\b/.test(lower)
  ) {
    return appTails
  }
  if (
    /\b(portfolio|designer|developer|photographer|studio|agency|creator)\b/.test(
      lower,
    )
  ) {
    return portfolioTails
  }
  return genericTails
}

function normalizePartial(partial: string): string {
  return String(partial ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

function joinPartialTail(partial: string, tail: string): string {
  return /\s$/.test(partial) || /^[,.;:!?]/.test(tail)
    ? `${partial}${tail}`
    : `${partial} ${tail}`
}

export function getPromptSuggestionCacheKey(
  partial: string,
  language?: string,
): string {
  return `${PROMPT_SUGGESTION_CACHE_PREFIX}${String(language || 'en').toLowerCase()}:${normalizePartial(partial).toLowerCase()}`
}

export function sanitizePromptSuggestions(
  values: unknown,
  partial: string,
  max = 4,
): string[] {
  const p = normalizePartial(partial)
  if (!p || !Array.isArray(values)) return []

  const seen = new Set<string>()
  const out: string[] = []
  for (const value of values) {
    if (typeof value !== 'string') continue
    const suggestion = value.replace(/\s+/g, ' ').trim()
    if (!suggestion.startsWith(p)) continue
    if (suggestion.length > LINE_MAX) continue
    if (suggestion.length < p.length + MIN_TAIL) continue
    const key = suggestion.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(suggestion)
    if (out.length >= max) break
  }
  return out
}

export function buildLocalPromptSuggestions(
  partial: string,
  _language?: string,
  max = 4,
): string[] {
  const p = normalizePartial(partial)
  if (p.length < 2 || p.length > PARTIAL_MAX) return []
  return sanitizePromptSuggestions(
    inferTails(p).map((tail) => joinPartialTail(p, tail)),
    p,
    max,
  )
}
