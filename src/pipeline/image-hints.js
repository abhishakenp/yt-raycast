import { PEXELS_API_KEY } from '../config.js'

const PEXELS_API_URL = 'https://api.pexels.com/v1/search'
const MAX_REQUESTS = 6
const FETCH_PAGE_SIZE = 18
const KEEP_PER_QUERY = 3
const REQUEST_TIMEOUT_MS = 5000

const BAD_ALT_PET_RE =
  /\b(laptop|macbook|imac|computer|monitor|display\s+screen|smartphone|iphone|ipad|tablet|coding|programmer|developer|office\s+desk|desk\s+setup|workspace\s+tech|pexels|website\s+on|browser\s+window|stock\s+photo\s+website)\b/i

const BAD_ALT_META_RE =
  /\b(pexels|website\s+on|browser\s+window|stock\s+photo\s+website|coding|programmer|developer)\b/i

const APPLE_STORE_RE =
  /\b(iphone|ipad|macbook|imac|airpods|apple\s+watch|apple\s+store|apple\s+products?|apple\s+devices?|sell(s|ing)?\s+apple)\b/i

const DOG_PROMPT_RE =
  /\b(dog|dogs|puppy|puppies|pup|canine|retriever|collie|husky|poodle|beagle|spaniel|shepherd|terrier|bulldog|dachshund|mutt|kennel|dog\s+park|dog\s+blog|dog\s+lover)\b/i

const CAT_PROMPT_RE = /\b(cat|cats|kitten|kittens|feline|kitty)\b/i
const FASHION_PROMPT_RE =
  /\b(fashion|ethnic wear|ethnic|saree|sari|lehenga|bridal|bride|wedding|boutique|couture|silk|embroidery|occasion wear|festive wear|designer wear)\b/i
const SOUTH_INDIAN_FASHION_RE =
  /\b(kerala|south indian|south india|kasavu|muhurtham|silks?)\b/i

const DAIRY_PROMPT_RE =
  /\b(amul|dairy|milk|butter|cheese|paneer|curd|yogurt|lassi|ice cream|icecream|chocolate|beverage|sweets?|dessert|recipe)\b/i

const FOOD_PROMPT_RE =
  /\b(cafe|coffee|restaurant|bakery|pizza|burger|dessert|pastry|cake|food|kitchen|chef|recipe)\b/i

const GENERIC_FEATURE_RE =
  /\b(user|auth|login|password|session|token|api|database|stripe|payment|checkout|cart|wishlist|order|tracking|returns?|shipping|delivery|search|filter|sort|dashboard|admin|responsive|mobile|navigation|footer|header|faq|newsletter|testimonial|review|support|contact|export|import|upload|parse|excel|spreadsheet|inventory|subscription|analytics|notification|account)\b/i

const NON_VISUAL_PHRASE_RE =
  /\b(responsive|mobile|desktop|navigation|footer|header|faq|testimonial|support|contact|newsletter|signup|login|checkout|cart|wishlist|order tracking|returns?|shipping|payment|search|filters?|hover|scroll|layout|copy|tone|goal|functional requirements|extra pages|page|pricing|account dashboard|user authentication)\b/i

const VISUAL_PHRASE_RE =
  /\b(dairy|milk|butter|cheese|paneer|curd|yogurt|lassi|ice cream|icecream|chocolate|beverage|sweet|dessert|recipe|saree|silk|bridal|bride|lehenga|salwar|kurta|sherwani|ethnic wear|fashion|boutique|showroom|store|jewelry|perfume|makeup|skincare|watch|shoe|bag|furniture|interior|sofa|chair|lamp|living room|bedroom|hotel|resort|restaurant|bakery|coffee|spa|salon|fitness|gym|yoga|clinic|doctor|dental|pet|dog|cat|farm)\b/i

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
])

function normalizeText(value = '') {
  return String(value).replace(/\s+/g, ' ').trim().toLowerCase()
}

function uniqueValues(values = []) {
  return [...new Set(values.filter((value) => value).map((value) => normalizeText(value)))].filter(
    (value) => value !== 'undefined' && value !== 'null' && value.length > 0,
  )
}

function sanitizeId(value) {
  if (!value) return null
  const asString = String(value)
  if (!/^\d+$/.test(asString)) return null
  return asString
}

function formatImageUrl(id, width = 1400, height = 900) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}&h=${height}&fit=crop`
}

function altMatchesSubject(alt, subject) {
  if (!subject) return true
  const a = normalizeText(alt)
  if (!a) return false
  if (subject === 'dog') {
    if (
      /\b(cat|cats|kitten|kittens|feline)\b/.test(a) &&
      !/\b(dog|dogs|puppy|puppies|pup|canine)\b/.test(a)
    )
      return false
    return /\b(dog|dogs|puppy|puppies|pup|canine|retriever|collie|husky|hound|shepherd|terrier|beagle)\b/.test(
      a,
    )
  }
  if (subject === 'cat') {
    if (
      /\b(dog|dogs|puppy|puppies|canine)\b/.test(a) &&
      !/\b(cat|cats|kitten|kittens|feline)\b/.test(a)
    )
      return false
    return /\b(cat|cats|kitten|kittens|feline|kitty)\b/.test(a)
  }
  return true
}

function isUsablePhoto(photo, subjectKey) {
  const alt = typeof photo?.alt === 'string' ? photo.alt : ''
  const pet = subjectKey === 'dog' || subjectKey === 'cat'
  if (pet) {
    if (BAD_ALT_PET_RE.test(alt)) return false
    if (!altMatchesSubject(alt, subjectKey)) return false
    return true
  }
  if (BAD_ALT_META_RE.test(alt)) return false
  return true
}

function phraseFromPrompt(prompt, maxWords = 5) {
  const raw = normalizeText(prompt).replace(/[^a-z0-9\s-]/g, ' ')
  const parts = raw.split(/\s+/).filter((w) => w.length > 1 && !STOP_WORDS.has(w))
  if (!parts.length) return ''
  return parts.slice(0, maxWords).join(' ')
}

function cleanupPromptLine(line = '') {
  return String(line)
    .replace(/^[\s>*-]+/, '')
    .replace(/^\d+[.)]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripLeadPhrase(phrase = '') {
  return normalizeText(phrase)
    .replace(
      /^(product categories?(?: like)?|featured collections?|shop by category|shop by occasion|hero section|promotional banner(?: for)?|large hero banner(?: featuring)?|focus on|include(?: these sections)?|main features to include|craftsmanship section|boutique experience|new arrivals?(?: \/ signature pieces)?|store locator(?: or where to buy)?|instagram\/gallery section|product showcase cards?)\b[:\s-]*/i,
      '',
    )
    .replace(/^(like|featuring|including|with)\s+/i, '')
    .trim()
}

function isVisualPhrase(phrase = '') {
  const p = normalizeText(phrase)
  if (!p || p.length < 3 || p.length > 56) return false
  if (GENERIC_FEATURE_RE.test(p) || NON_VISUAL_PHRASE_RE.test(p)) return false
  return VISUAL_PHRASE_RE.test(p)
}

function extractVisualPhrases(prompt = '') {
  const lines = String(prompt)
    .split('\n')
    .map(cleanupPromptLine)
    .filter(Boolean)

  const hits = []
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

function inferVisualSiteType(prompt = '', ctx = null, siteSpec = null) {
  const explicit = String(ctx?.site_type || siteSpec?.siteType || '').toLowerCase()
  if (explicit && explicit !== 'saas') return explicit

  const p = normalizeText(prompt)
  if (/\b(ecommerce|shop|store|boutique|catalog|collection|buy|products?)\b/.test(p))
    return 'ecommerce'
  if (/\b(portfolio|case study|selected work|gallery)\b/.test(p)) return 'portfolio'
  if (/\b(blog|article|story|stories|editorial)\b/.test(p)) return 'blog'
  return explicit || 'landing'
}

function queriesForVisualPhrase(phrase, typed = 'landing', prompt = '') {
  const p = normalizeText(phrase)
  const source = `${normalizeText(prompt)} ${p}`

  if (/\b(ice cream|icecream)\b/.test(p)) {
    return ['ice cream scoop dessert', 'ice cream product close up']
  }
  if (/\b(milk|dairy|paneer|curd|yogurt|lassi)\b/.test(p)) {
    return ['fresh dairy products on table', 'milk bottle dairy product']
  }
  if (/\bbutter\b/.test(p)) {
    return ['butter on toast close up', 'butter dairy product']
  }
  if (/\bcheese\b/.test(p)) {
    return ['cheese platter close up', 'artisan cheese product']
  }
  if (/\b(chocolate|cocoa)\b/.test(p)) {
    return ['chocolate bar close up', 'chocolate dessert product']
  }
  if (/\b(beverage|drink|juice)\b/.test(p)) {
    return ['cold beverage bottle product', 'refreshing drink product photo']
  }
  if (/\b(sweets?|dessert|mithai)\b/.test(p)) {
    return ['indian sweets platter', 'festive dessert close up']
  }
  if (/\b(recipe|kitchen|cooking|chef)\b/.test(p)) {
    return ['indian cooking dairy recipe', 'kitchen recipe preparation']
  }
  if (/\b(store|showroom|boutique)\b/.test(p) && FASHION_PROMPT_RE.test(source)) {
    return ['indian fashion boutique interior', 'luxury boutique showroom']
  }
  if (/\b(saree|silk)\b/.test(p)) {
    return ['indian silk saree woman portrait', 'luxury saree editorial']
  }
  if (/\b(bridal|bride|wedding)\b/.test(p)) {
    return ['indian bridal saree jewelry', 'south indian bridal fashion model']
  }
  if (/\b(lehenga)\b/.test(p)) {
    return ['indian lehenga model portrait', 'bridal lehenga fashion editorial']
  }
  if (/\b(salwar|kurta|ethnic wear|traditional outfits?)\b/.test(p)) {
    return ['indian ethnic wear fashion model', 'traditional outfit editorial portrait']
  }
  if (/\b(men.?s ethnic wear|sherwani)\b/.test(p)) {
    return ['indian man sherwani portrait', 'mens ethnic wear fashion']
  }
  if (/\b(kids collection|kids wear)\b/.test(p)) {
    return ['kids ethnic wear portrait', 'children traditional outfit']
  }
  if (/\b(jewelry|gold|necklace)\b/.test(p)) {
    return ['bridal jewelry close up', 'gold jewelry editorial']
  }
  if (/\b(farm)\b/.test(p)) {
    return ['dairy farm morning', 'green farm landscape']
  }
  if (typed === 'ecommerce') return [`${p.slice(0, 42)} product photo`]
  if (typed === 'portfolio') return [`${p.slice(0, 42)} editorial photo`]
  return [`${p.slice(0, 42)} photography`]
}

function themedQueries(prompt) {
  const p = normalizeText(prompt)
  if (DOG_PROMPT_RE.test(p)) {
    return [
      'golden retriever dog portrait outdoor',
      'border collie dog running grass',
      'happy dog rescue shelter adoption',
      'small puppy cute close up',
      'dog owner walking park',
      'husky dog snow',
    ]
  }
  if (CAT_PROMPT_RE.test(p)) {
    return [
      'orange tabby cat portrait',
      'kitten playing home',
      'cat window natural light',
      'sleepy cat cozy',
      'maine coon cat indoor',
      'cat rescue shelter adoption',
    ]
  }
  if (APPLE_STORE_RE.test(p)) {
    return [
      'macbook pro laptop minimal aluminum',
      'iphone smartphone product hand',
      'ipad tablet desk creative',
      'wireless earbuds white aesthetic',
      'smartwatch wrist lifestyle technology',
      'premium electronics store retail',
    ]
  }
  if (FASHION_PROMPT_RE.test(p)) {
    const queries = [
      'luxury ethnic wear woman portrait',
      'silk saree woman editorial',
      'indian fashion boutique interior',
      'embroidery textile detail close up',
    ]

    if (/\b(bridal|bride|wedding)\b/.test(p)) {
      queries.unshift('indian bridal fashion model', 'south indian bridal saree jewelry')
    }

    if (/\b(saree|sari|silk)\b/.test(p)) {
      queries.push('indian silk saree woman portrait')
    }

    if (SOUTH_INDIAN_FASHION_RE.test(p)) {
      queries.push('kerala saree woman portrait')
    }

    return uniqueValues(queries).slice(0, MAX_REQUESTS)
  }
  if (DAIRY_PROMPT_RE.test(p)) {
    const queries = [
      'fresh dairy products on table',
      'milk bottle dairy product',
      'butter on toast close up',
      'cheese platter close up',
      'ice cream scoop dessert',
      'indian sweets platter festive',
    ]

    if (/\b(recipe|kitchen|chef)\b/.test(p)) {
      queries.push('indian cooking dairy recipe')
    }

    return uniqueValues(queries).slice(0, MAX_REQUESTS)
  }
  if (FOOD_PROMPT_RE.test(p)) {
    return uniqueValues([
      'chef preparing food in kitchen',
      'restaurant dish close up',
      'fresh dessert photography',
      'coffee shop interior',
      'bakery pastry display',
      'food plating editorial',
    ]).slice(0, MAX_REQUESTS)
  }
  return []
}

function buildQueries({ prompt, ctx, siteSpec }) {
  const subjectFirst = themedQueries(prompt || '')
  const core = phraseFromPrompt(prompt || '', 6)
  const typed = inferVisualSiteType(prompt || '', ctx, siteSpec)
  const extracted = extractVisualPhrases(prompt || '')
    .slice(0, 8)
    .flatMap((phrase) => queriesForVisualPhrase(phrase, typed, prompt))

  const fromEntities = uniqueValues(ctx?.entities || [])
    .filter(isVisualPhrase)
    .slice(0, 2)
    .flatMap((entity) => queriesForVisualPhrase(entity, typed, prompt))

  const fromFeatures = uniqueValues(ctx?.features || [])
    .filter(isVisualPhrase)
    .slice(0, 2)
    .flatMap((feature) => queriesForVisualPhrase(feature, typed, prompt))

  const extras = isVisualPhrase(core) ? queriesForVisualPhrase(core, typed, prompt) : []
  if (typed === 'ecommerce') extras.push('product on white background minimal')
  if (typed === 'portfolio') extras.push('creative work detail close up')

  return uniqueValues([
    ...subjectFirst,
    ...extracted,
    ...extras,
    ...fromEntities,
    ...fromFeatures,
  ]).slice(0, MAX_REQUESTS)
}

function subjectKeyFromPrompt(prompt) {
  const p = normalizeText(prompt || '')
  if (DOG_PROMPT_RE.test(p)) return 'dog'
  if (CAT_PROMPT_RE.test(p)) return 'cat'
  if (APPLE_STORE_RE.test(p)) return 'electronics'
  return null
}

async function fetchPhotos(query, subjectKey, keep = KEEP_PER_QUERY) {
  if (!query || !PEXELS_API_KEY) return []
  const url = new URL(PEXELS_API_URL)
  url.searchParams.set('query', query)
  url.searchParams.set('per_page', String(FETCH_PAGE_SIZE))
  url.searchParams.set('orientation', 'landscape')

  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
      signal: controller.signal,
    })

    if (!res.ok) return []
    const payload = await res.json()
    const out = []
    for (const photo of payload.photos || []) {
      const id = sanitizeId(photo.id)
      if (!id) continue
      const alt = typeof photo.alt === 'string' ? photo.alt.trim() : ''
      const candidate = {
        query,
        id,
        url: formatImageUrl(id),
        rawUrl:
          typeof photo?.src?.large2x === 'string'
            ? photo.src.large2x
            : formatImageUrl(id, 1400, 900),
        alt: alt || query,
      }
      if (!isUsablePhoto(candidate, subjectKey)) continue
      out.push(candidate)
      if (out.length >= keep) break
    }
    return out
  } catch {
    return []
  } finally {
    clearTimeout(timeout)
  }
}

function toPromptBlock(hits) {
  if (!Array.isArray(hits) || hits.length === 0) return ''
  return `\nVERIFIED PEXELS IMAGES:\n${hits
    .slice(0, 8)
    .map((item, index) => {
      const hint = String(item.alt || item.query).slice(0, 120)
      return `- ${index + 1}. ${hint}: ${item.url}`
    })
    .join('\n')}`
}

export async function resolvePexelsImageHints(ctx = null) {
  if (!PEXELS_API_KEY) return { photos: [], promptBlock: '' }

  const prompt = ctx?.prompt ?? ''
  const queries = buildQueries(ctx ?? { prompt })
  if (!queries.length) return { photos: [], promptBlock: '' }

  const subjectKey = subjectKeyFromPrompt(prompt)

  const results = await Promise.all(queries.map((query) => fetchPhotos(query, subjectKey)))
  const seen = new Set()
  const photos = []

  for (const list of results) {
    for (const photo of list || []) {
      if (photos.length >= 12) break
      if (seen.has(photo.url)) continue
      seen.add(photo.url)
      photos.push(photo)
    }
  }

  return {
    photos,
    promptBlock: toPromptBlock(photos),
  }
}
