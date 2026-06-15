/**
 * Context-aware image query generation
 * Ported from packages/ship-fast-engine/src/pipeline/image-hints.js
 */

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'for',
  'with',
  'from',
  'your',
  'our',
  'this',
  'that',
  'into',
  'about',
  'beautiful',
  'visual',
  'premium',
  'modern',
  'build',
  'create',
  'website',
  'site',
  'brand',
  'called',
  'goal',
  'style',
  'mood',
  'section',
  'sections',
  'include',
  'includes',
  'including',
  'collection',
  'collections',
  'luxurious',
  'elegant',
  'timeless',
  'sophisticated',
  'single',
  'page',
  'feel',
  'blog',
  'complete',
  'powerful',
  'polished',
  'sleek',
  'bold',
  'clean',
  'mixed',
  'english',
  'hindi',
  'hinglish',
  'describe',
  'generate',
  'banao',
  'liye',
])

const LOW_SIGNAL_QUERY_WORDS = new Set([
  'photo',
  'photos',
  'photography',
  'portrait',
  'editorial',
  'product',
  'products',
  'lifestyle',
  'woman',
  'women',
  'man',
  'men',
  'person',
  'people',
  'model',
  'models',
  'close',
  'minimal',
  'premium',
  'luxury',
  'fresh',
  'happy',
  'small',
  'cute',
  'indoor',
  'outdoor',
  'natural',
  'light',
  'cozy',
  'white',
  'background',
  'table',
  'detail',
  'details',
  'creative',
  'traditional',
  'indian',
])

const MATCH_ALIASES: Record<string, string[]> = {
  bridal: ['bridal', 'bride', 'wedding'],
  bride: ['bride', 'bridal', 'wedding'],
  wedding: ['wedding', 'bridal', 'bride'],
  saree: ['saree', 'sari'],
  sari: ['sari', 'saree'],
  jewelry: ['jewelry', 'jewellery', 'gold'],
  jewellery: ['jewellery', 'jewelry', 'gold'],
  dairy: ['dairy', 'milk', 'paneer', 'curd', 'yogurt', 'lassi', 'butter', 'cheese'],
  milk: ['milk', 'dairy'],
  butter: ['butter', 'dairy'],
  cheese: ['cheese', 'dairy'],
  dessert: ['dessert', 'desserts', 'sweet', 'sweets'],
  sweets: ['sweets', 'sweet', 'dessert', 'desserts'],
  snack: ['snack', 'snacks', 'munch', 'munchies'],
  snacks: ['snacks', 'snack', 'munch', 'munchies'],
  protein: ['protein', 'energy'],
  millet: ['millet', 'grain'],
  granola: ['granola', 'oats'],
  chips: ['chips', 'crisps'],
  cookies: ['cookies', 'cookie', 'biscuits', 'biscuit'],
  cookie: ['cookie', 'cookies', 'biscuit', 'biscuits'],
  bar: ['bar', 'bars', 'protein bar', 'energy bar'],
  bars: ['bars', 'bar', 'protein bar', 'energy bar'],
  bites: ['bites', 'bite', 'balls'],
  nuts: ['nuts', 'trail mix', 'seeds'],
  wellness: ['wellness', 'healthy', 'clean', 'organic'],
  recipe: ['recipe', 'cooking', 'kitchen', 'chef'],
  boutique: ['boutique', 'showroom', 'store'],
  showroom: ['showroom', 'boutique', 'store'],
  ethnic: ['ethnic', 'traditional', 'attire', 'outfit', 'wear'],
  outfit: ['outfit', 'attire', 'wear', 'fashion'],
  fashion: ['fashion', 'attire', 'outfit', 'wear'],
  dog: ['dog', 'dogs', 'puppy', 'puppies', 'canine'],
  cat: ['cat', 'cats', 'kitten', 'kittens', 'feline'],
}

const VISUAL_PHRASE_RE =
  /\b(dairy|milk|butter|cheese|paneer|curd|yogurt|lassi|ice cream|icecream|chocolate|beverage|sweet|dessert|mithai|recipe|snack|snacks|protein|millet|granola|chips|cookie|cookies|bar|bars|bites|trail mix|nuts|wellness|saree|silk|bridal|bride|lehenga|salwar|kurta|sherwani|ethnic wear|fashion|boutique|showroom|store|jewelry|gold|perfume|makeup|skincare|watch|shoe|bag|furniture|interior|sofa|chair|lamp|living room|bedroom|hotel|resort|homestay|restaurant|bakery|coffee|spa|salon|fitness|gym|yoga|clinic|hospital|pharmacy|diagnostic|lab|doctor|dental|physiotherapy|pet|dog|cat|farm|agriculture|crop|mandi|solar|rooftop|ev|electric|vehicle|charging|logistics|warehouse|freight|shipping|container|construction|contractor|excavator|coaching|school|college|university|temple|ngo|charity|court|legal|law|real\s+estate|property|rera|chartered|gst|payroll|shipping|export|import|bharatanatyam|kathak|odissi|kuchipudi|kathakali|mohiniyattam|manipuri|sattriya|arangetram|classical dance|folk dance|garba|dandiya|bhangra|lavani|bihu|ghoomar|handloom|khadi|madhubani|warli|handicraft|weaving|loom|carnatic|hindustani|tabla|sitar|classical music|heritage walk|museum|cultural centre|cultural center|natya|nritya)\b/i

const GENERIC_FEATURE_RE =
  /\b(user|auth|login|password|session|token|api|database|stripe|payment|checkout|cart|wishlist|order|tracking|returns?|shipping|delivery|search|filter|sort|dashboard|admin|responsive|mobile|navigation|footer|header|faq|newsletter|testimonial|review|support|contact|export|import|upload|parse|excel|spreadsheet|inventory|subscription|analytics|notification|account)\b/i

const NON_VISUAL_PHRASE_RE =
  /\b(responsive|mobile|desktop|navigation|footer|header|faq|testimonial|support|contact|newsletter|signup|login|checkout|cart|wishlist|order tracking|returns?|shipping|payment|search|filters?|hover|scroll|layout|copy|tone|goal|functional requirements|extra pages|page|pricing|account dashboard|user authentication)\b/i

export type SiteType = 'landing' | 'ecommerce' | 'portfolio' | 'blog' | 'saas'

export interface ImageContext {
  /** The section/type of UI component (hero, product-grid, about, etc.) */
  section?: string
  /** The overall site type */
  siteType?: SiteType
  /** The original user prompt/brief */
  prompt?: string
  /** Additional context about the brand or business */
  brandContext?: string
}

function normalizeText(value = ''): string {
  return String(value).replace(/\s+/g, ' ').trim().toLowerCase()
}

function escapeRegex(value = ''): string {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function uniqueValues(values: (string | undefined)[] = []): string[] {
  return [
    ...new Set(
      values.filter((value) => value).map((value) => normalizeText(value)),
    ),
  ].filter((value) => value !== 'undefined' && value !== 'null' && value.length > 0)
}

function tokenizeForMatch(value = ''): string[] {
  return normalizeText(value)
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token))
}

function queryMatchTokens(query = ''): { tokens: string[]; core: string[] } {
  const tokens = [...new Set(tokenizeForMatch(query))]
  const core = tokens.filter((token) => !LOW_SIGNAL_QUERY_WORDS.has(token))
  return {
    tokens,
    core: core.length ? core : tokens,
  }
}

function tokenMatchesText(token: string, text: string): boolean {
  const normalized = normalizeText(text)
  if (!normalized || !token) return false

  const variants = MATCH_ALIASES[token] || [token]
  return variants.some((variant) =>
    new RegExp(`\\b${escapeRegex(variant)}\\b`, 'i').test(normalized),
  )
}

function phraseFromPrompt(prompt: string, maxWords = 5): string {
  const raw = normalizeText(prompt).replace(/[^a-z0-9\s-]/g, ' ')
  const parts = raw.split(/\s+/).filter((w) => w.length > 1 && !STOP_WORDS.has(w))
  if (!parts.length) return ''
  return parts.slice(0, maxWords).join(' ')
}

function cleanupPromptLine(line = ''): string {
  return String(line)
    .replace(/^[\s>*-]+/, '')
    .replace(/^\d+[.)]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripLeadPhrase(phrase = ''): string {
  return normalizeText(phrase)
    .replace(
      /^(product categories?(?: like)?|featured collections?|shop by category|shop by occasion|hero section|promotional banner(?: for)?|large hero banner(?: featuring)?|focus on|include(?: these sections)?|main features to include|craftsmanship section|boutique experience|new arrivals?(?: \/ signature pieces)?|store locator(?: or where to buy)?|instagram\/gallery section|product showcase cards?)\b[:\s-]*/i,
      '',
    )
    .replace(/^(like|featuring|including|with)\s+/i, '')
    .trim()
}

function isVisualPhrase(phrase = ''): boolean {
  const p = normalizeText(phrase)
  if (!p || p.length < 3 || p.length > 56) return false
  if (GENERIC_FEATURE_RE.test(p) || NON_VISUAL_PHRASE_RE.test(p)) return false
  return VISUAL_PHRASE_RE.test(p)
}

function extractVisualPhrases(prompt = ''): string[] {
  const lines = String(prompt).split('\n').map(cleanupPromptLine).filter(Boolean)

  const hits: string[] = []
  for (const line of lines) {
    const content = line.includes(':') ? line.split(':').slice(1).join(':') : line
    const parts = content
      .split(/,|\/|\band\b/gi)
      .map(stripLeadPhrase)
      .filter(Boolean)

    for (const part of parts) {
      if (isVisualPhrase(part)) hits.push(part)
    }

    if (isVisualPhrase(content)) hits.push(stripLeadPhrase(content))
  }

  return uniqueValues(hits)
}

function inferVisualSiteType(prompt = '', siteType?: SiteType): SiteType {
  if (siteType && siteType !== 'saas') return siteType

  const p = normalizeText(prompt)
  if (/\b(ecommerce|shop|store|boutique|catalog|collection|buy|products?)\b/.test(p))
    return 'ecommerce'
  if (/\b(portfolio|case study|selected work|gallery)\b/.test(p)) return 'portfolio'
  if (/\b(blog|article|story|stories|editorial)\b/.test(p)) return 'blog'
  return siteType || 'landing'
}

function queriesForVisualPhrase(
  phrase: string,
  siteType: SiteType = 'landing',
  prompt = '',
): string[] {
  const p = normalizeText(phrase)
  const source = `${normalizeText(prompt)} ${p}`

  // Industry-specific query mappings
  if (/\b(hospital|multispeciality|multi-speciality|clinic|diagnostics|pathology)\b/.test(p)) {
    return ['modern hospital interior corridor healthcare', 'doctor patient consultation clinic']
  }
  if (/\b(pharmacy|medicine distributor|ethical pharma)\b/.test(p)) {
    return ['pharmacy shelves medicine', 'pharmacist consultation counter']
  }
  if (/\b(solar|photovoltaic|rooftop\s+solar|epc\s+renewable)\b/.test(p)) {
    return ['residential rooftop solar panels blue sky', 'solar panel installation technician roof']
  }
  if (/\b(logistics|warehouse|3pl|freight|cold\s+storage|cold\s+chain)\b/.test(p)) {
    return ['warehouse pallets logistics interior', 'shipping container port logistics truck']
  }
  if (/\b(coaching|jee|neet|upsc|academy|tuition)\b/.test(p)) {
    return ['students studying classroom exam preparation', 'library books study desk']
  }
  if (/\b(temple|trust|darshan|donation\s+portal)\b/.test(p)) {
    return ['indian temple architecture exterior', 'temple lamp prayer ceremony']
  }
  if (/\b(nbfc|gold\s+loan|mutual\s+fund|insurance|fintech|upi)\b/.test(p)) {
    return ['financial planning desk calculator', 'mobile banking smartphone secure']
  }
  if (
    /\b(bharatanatyam|kathak|odissi|kuchipudi|kathakali|mohiniyattam|manipuri|sattriya|arangetram|classical dance|nritya|natya)\b/.test(
      p,
    )
  ) {
    return [
      'indian classical dancer costume mudra',
      'bharatanatyam dance performance stage',
      'kathak dancer traditional costume',
      'odissi dance pose temple sculpture aesthetic',
    ]
  }
  if (/\b(garba|dandiya|navratri|bhangra|lavani|bihu|ghoomar|folk dance)\b/.test(p)) {
    return [
      'indian folk dance festival colorful attire',
      'garba dancers traditional celebration',
      'bhangra dance celebration punjab',
    ]
  }
  if (/\b(handloom|khadi|madhubani|warli|handicraft|weaving|loom|block print)\b/.test(p)) {
    return [
      'handloom weaving textile india artisan',
      'madhubani folk art painting india',
      'indian handicraft artisan workshop',
    ]
  }
  if (/\b(carnatic|hindustani|tabla|sitar|classical music|ragam)\b/.test(p)) {
    return [
      'indian classical music instrument tabla',
      'carnatic music concert performance',
      'hindustani classical singer stage',
    ]
  }

  // Generic site-type based queries
  const words = tokenizeForMatch(p).filter((w) => !STOP_WORDS.has(w))
  const core = words.slice(0, 6).join(' ')
  if (!core) return []

  if (siteType === 'ecommerce') return [`${core} product photography commercial`]
  if (siteType === 'portfolio') return [`${core} creative work photography`]
  return [`${core} professional photography editorial`]
}

function extractSalientPhrases(prompt = '', max = 4): string[] {
  const raw = normalizeText(prompt)
  const out: string[] = []
  const stripTail = (s: string) =>
    s
      .replace(/\s+with\s+[\s\S]+$/i, '')
      .replace(/\s+including\s+[\s\S]+$/i, '')
      .replace(/\s+and\s+(appointment|booking|sections?|cta)[\s\S]+$/i, '')
      .trim()

  const mFor = raw.match(/\b(?:for|about)\s+(?:a|an|the)\s+([a-z0-9][a-z0-9\s,'-]{10,100})/i)
  if (mFor?.[1]) {
    const chunk = stripTail(mFor[1]).slice(0, 96)
    if (chunk.length > 10) out.push(chunk)
  }
  const mBare = raw.match(/\bfor\s+([a-z0-9][a-z0-9\s,'-]{10,100})/i)
  if (!out.length && mBare?.[1]) {
    const chunk = stripTail(mBare[1]).slice(0, 96)
    if (chunk.length > 10 && !/^a\s+/i.test(chunk)) out.push(chunk)
  }

  const words = raw
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w) && !LOW_SIGNAL_QUERY_WORDS.has(w))
  if (words.length >= 5) {
    out.push(words.slice(0, 9).join(' '))
  }

  return uniqueValues(out).slice(0, max)
}

function salientSearchQueries(phrase: string, siteType: SiteType = 'landing', prompt = ''): string[] {
  const p = normalizeText(phrase)
  if (!p || p.length < 8) return []
  if (isVisualPhrase(p)) return queriesForVisualPhrase(p, siteType, prompt)
  
  const words = tokenizeForMatch(p).filter((w) => !STOP_WORDS.has(w))
  const core = words.slice(0, 6).join(' ')
  if (!core) return []
  
  if (siteType === 'ecommerce') return [`${core} product photography commercial`]
  if (siteType === 'portfolio') return [`${core} creative work photography`]
  return [`${core} professional photography editorial`]
}

/**
 * Generate a context-aware search query for stock images
 * Combines alt text with visual phrases, site type, and user prompt
 */
export function generateContextAwareQuery(
  alt: string,
  context: ImageContext = {},
): string {
  const { section, siteType, prompt, brandContext } = context
  
  // Start with the base alt text
  const baseQuery = normalizeText(alt) || 'nature'
  
  // Extract visual phrases from prompt if available
  const visualPhrases = prompt ? extractVisualPhrases(prompt) : []
  
  // Extract salient phrases for broader context
  const salientPhrases = prompt ? extractSalientPhrases(prompt, 2) : []
  
  // Determine the effective site type
  const effectiveSiteType = inferVisualSiteType(prompt || '', siteType)
  
  // Build query components
  const queryComponents: string[] = [baseQuery]
  
  // Add section-specific context
  if (section) {
    const sectionLower = normalizeText(section)
    if (sectionLower.includes('hero') || sectionLower.includes('banner')) {
      queryComponents.unshift('hero banner')
    } else if (sectionLower.includes('product')) {
      if (effectiveSiteType === 'ecommerce') {
        queryComponents.push('product photography')
      }
    } else if (sectionLower.includes('about') || sectionLower.includes('team')) {
      queryComponents.push('lifestyle portrait')
    } else if (sectionLower.includes('gallery')) {
      queryComponents.push('gallery collection')
    }
  }
  
  // Add visual phrases from prompt - prioritize those that match industry-specific patterns
  if (visualPhrases.length > 0) {
    // First try to find industry-specific phrases
    const industryPhrase = visualPhrases.find((phrase) => {
      const p = normalizeText(phrase)
      return /\b(hospital|clinic|medical|dental|pharmacy|solar|logistics|coaching|temple|fintech|dance|music|handloom|fashion|dairy|food|travel|fitness)\b/.test(p)
    })
    
    if (industryPhrase) {
      const phraseQueries = queriesForVisualPhrase(industryPhrase, effectiveSiteType, prompt)
      queryComponents.push(...phraseQueries.slice(0, 2))
    } else {
      // Otherwise add any visual phrase that has some relevance
      const matchingPhrase = visualPhrases.find((phrase) => {
        const phraseTokens = tokenizeForMatch(phrase)
        const altTokens = tokenizeForMatch(baseQuery)
        return phraseTokens.some((token) => altTokens.includes(token)) || phraseTokens.length > 0
      })
      if (matchingPhrase) {
        const phraseQueries = salientSearchQueries(matchingPhrase, effectiveSiteType, prompt)
        queryComponents.push(...phraseQueries.slice(0, 2))
      }
    }
  }
  
  // Add salient phrases for broader context
  if (salientPhrases.length > 0) {
    queryComponents.push(...salientPhrases.slice(0, 1))
  }
  
  // Add brand context if available
  if (brandContext) {
    const brandTokens = tokenizeForMatch(brandContext).slice(0, 3)
    if (brandTokens.length > 0) {
      queryComponents.push(brandTokens.join(' '))
    }
  }
  
  // Add site-type specific enhancement
  if (effectiveSiteType === 'ecommerce') {
    queryComponents.push('product photography')
    queryComponents.push('commercial')
  } else if (effectiveSiteType === 'portfolio') {
    queryComponents.push('creative')
  }
  
  // Combine and deduplicate, but preserve important site-type specific terms
  const allTokens = queryComponents.flatMap((c) => tokenizeForMatch(c))
  const uniqueTokens = [...new Set(allTokens)]
  
  // Ensure site-type specific terms are preserved even if they're in low-signal list
  const importantTerms = new Set(['product', 'creative', 'commercial', 'hero', 'lifestyle', 'portrait'])
  const preservedTokens = uniqueTokens.filter(token => 
    importantTerms.has(token) || !LOW_SIGNAL_QUERY_WORDS.has(token)
  )
  
  // If we filtered too much, fall back to unique tokens
  const finalTokens = preservedTokens.length > 0 ? preservedTokens : uniqueTokens
  const { core } = queryMatchTokens(finalTokens.join(' '))
  
  // Build final query with proper ordering
  let finalQuery = core.slice(0, 8).join(' ')
  
  // Ensure query is not too long for APIs
  if (finalQuery.length > 96) {
    finalQuery = finalQuery.slice(0, 96).trim()
  }
  
  // Fallback if query is too short
  if (finalQuery.length < 3) {
    finalQuery = baseQuery.length > 2 ? baseQuery : 'nature'
  }
  
  return finalQuery
}
