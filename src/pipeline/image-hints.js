import { PEXELS_API_KEY } from '../config.js'

const PEXELS_API_URL = 'https://api.pexels.com/v1/search'
const MAX_REQUESTS = 6
const FETCH_PAGE_SIZE = 18
const KEEP_PER_QUERY = 2
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

const GENERIC_FEATURE_RE =
  /\b(user|auth|login|password|session|token|api|database|stripe|payment|export|import|upload|parse|excel|spreadsheet)\b/i

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
  return []
}

function safeEntityQuery(entity) {
  const e = normalizeText(entity)
  if (!e || e.length < 2) return null
  if (GENERIC_FEATURE_RE.test(e)) return null
  if (e.length > 40) return null
  return `${e} photography`
}

function buildQueries({ prompt, ctx, siteSpec }) {
  const subjectFirst = themedQueries(prompt || '')
  const core = phraseFromPrompt(prompt || '', 6)
  const typed = String(ctx?.site_type || siteSpec?.siteType || '').toLowerCase()

  const fromEntities = uniqueValues(ctx?.entities || [])
    .slice(0, 3)
    .map(safeEntityQuery)
    .filter(Boolean)

  const fromFeatures = uniqueValues(ctx?.features || [])
    .filter((f) => f && !GENERIC_FEATURE_RE.test(normalizeText(f)))
    .slice(0, 2)
    .map((feature) => `${normalizeText(feature).slice(0, 48)} lifestyle photo`)

  const extras = []
  if (core.length > 3) extras.push(core)
  if (typed === 'ecommerce') extras.push('product on white background minimal')
  if (typed === 'portfolio') extras.push('creative work detail close up')

  return uniqueValues([...subjectFirst, ...extras, ...fromEntities, ...fromFeatures]).slice(
    0,
    MAX_REQUESTS,
  )
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
