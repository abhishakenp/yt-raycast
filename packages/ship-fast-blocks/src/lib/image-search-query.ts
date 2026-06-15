/**
 * Blends the page-level domain (user prompt / brand) into a per-image search
 * query so generated UIs get stock images relevant to the actual business —
 * not just to the generic alt text baked into a capsule.
 *
 * Design rule (see CLAUDE.md "generic engine, not infinite special cases"):
 * NO per-vertical regexes or hardcoded business branches. We distil the most
 * salient tokens from the prompt and let the DOMAIN lead, with the image's own
 * alt-derived query refining it. Domain-led ordering means a mismatched capsule
 * default alt (e.g. "artist desk" on a dairy site) is corrected by the prompt
 * instead of overriding it.
 */

export interface ImageContext {
  /** The section/type of UI component (hero, product-grid, about, …). */
  section?: string
  /** The overall site type. */
  siteType?: 'landing' | 'ecommerce' | 'portfolio' | 'blog' | 'saas'
  /** The original user prompt / brief. */
  prompt?: string
  /** Brand or business descriptor (name + tagline). */
  brandContext?: string
}

// Prompt scaffolding and generic web words that carry no visual signal.
const DOMAIN_STOP = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'at', 'for', 'with',
  'from', 'by', 'as', 'is', 'are', 'be', 'that', 'this', 'these', 'those',
  'your', 'our', 'my', 'their', 'us', 'them', 'it', 'its',
  'create', 'build', 'make', 'design', 'generate', 'want', 'need', 'please',
  'website', 'site', 'web', 'page', 'pages', 'homepage', 'landing', 'app',
  'application', 'platform', 'online', 'service', 'services', 'solution',
  'solutions', 'brand', 'business', 'company', 'startup', 'project',
  'modern', 'beautiful', 'clean', 'simple', 'professional', 'premium',
  'luxury', 'luxurious', 'elegant', 'sleek', 'bold', 'minimal', 'minimalist',
  'best', 'top', 'new', 'fresh', 'quality', 'selling', 'sell', 'buy',
  'including', 'include', 'includes', 'feature', 'features', 'section',
  'sections', 'home', 'about', 'contact', 'using', 'like', 'called',
])

// Alt tokens that describe the image SLOT rather than the subject. When an alt
// is mostly these, it carries little subject signal — the domain should lead.
const GENERIC_ALT = new Set([
  'image', 'images', 'photo', 'photos', 'picture', 'pictures', 'hero', 'banner',
  'team', 'gallery', 'product', 'products', 'shot', 'background', 'placeholder',
  'card', 'item', 'items', 'thumbnail', 'avatar', 'illustration', 'graphic',
  'visual', 'visuals', 'section', 'cover', 'showcase', 'collection', 'about',
  'feature', 'featured', 'content', 'media', 'asset', 'figure', 'graphics',
])

const tokenize = (value: string): string[] =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2)

/**
 * Distil up to `max` salient subject tokens from the prompt + brand, in the
 * order they appear (prompts lead with the domain: "a website for a dental
 * clinic in Mumbai" → "dental clinic mumbai").
 */
export const extractDomainHint = (context: ImageContext, max = 3): string => {
  const source = `${context.brandContext ?? ''} ${context.prompt ?? ''}`
  const seen = new Set<string>()
  const tokens: string[] = []
  for (const token of tokenize(source)) {
    if (DOMAIN_STOP.has(token) || seen.has(token)) continue
    seen.add(token)
    tokens.push(token)
    if (tokens.length >= max) break
  }
  return tokens.join(' ')
}

const isGenericAlt = (alt: string): boolean => {
  const meaningful = tokenize(alt).filter((t) => !DOMAIN_STOP.has(t))
  if (meaningful.length <= 1) return true
  const generic = meaningful.filter((t) => GENERIC_ALT.has(t)).length
  return generic / meaningful.length >= 0.5
}

/**
 * Combine a per-image base query (already derived from the alt) with the page
 * domain. Domain leads; the base query refines. Deduped, capped for the API.
 *
 * With no usable context this returns `baseQuery` unchanged — so non-generated
 * usages are entirely backward compatible.
 */
export const buildImageSearchQuery = (
  alt: string,
  baseQuery: string,
  context?: ImageContext,
): string => {
  const base = baseQuery.trim()
  if (!context || (!context.prompt && !context.brandContext)) return base

  // A generic alt ("hero image") gets a wider domain hint; a specific alt keeps
  // more of its own subject and just gets a short domain anchor.
  const domain = extractDomainHint(context, isGenericAlt(alt) ? 4 : 2)
  if (!domain) return base

  const seen = new Set<string>()
  const merged: string[] = []
  for (const token of `${domain} ${base}`.split(/\s+/)) {
    if (!token || seen.has(token)) continue
    seen.add(token)
    merged.push(token)
    if (merged.length >= 8) break
  }
  return merged.join(' ').slice(0, 96).trim()
}
