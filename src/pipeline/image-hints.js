import { PEXELS_API_KEY, UNSPLASH_ACCESS_KEY } from '../config.js'

const PEXELS_API_URL = 'https://api.pexels.com/v1/search'
const PEXELS_VIDEOS_API_URL = 'https://api.pexels.com/v1/videos/search'
const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos'
const MAX_REQUESTS = 6
const MAX_REQUESTS_WITH_CTX = 8
const FETCH_PAGE_SIZE = 18
const KEEP_PER_QUERY = 3
const KEEP_VIDEOS_PER_QUERY = 1
const MAX_VIDEO_QUERIES = 4
const MAX_VIDEOS_TOTAL = 6
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

const SNACK_PROMPT_RE =
  /\b(snack|snacks|healthy snack|protein snack|millet snack|baked snack|kids snack|travel snack|trail mix|granola|chips|cookies|bars?|bites)\b/i

const GENERIC_FEATURE_RE =
  /\b(user|auth|login|password|session|token|api|database|stripe|payment|checkout|cart|wishlist|order|tracking|returns?|shipping|delivery|search|filter|sort|dashboard|admin|responsive|mobile|navigation|footer|header|faq|newsletter|testimonial|review|support|contact|export|import|upload|parse|excel|spreadsheet|inventory|subscription|analytics|notification|account)\b/i

const NON_VISUAL_PHRASE_RE =
  /\b(responsive|mobile|desktop|navigation|footer|header|faq|testimonial|support|contact|newsletter|signup|login|checkout|cart|wishlist|order tracking|returns?|shipping|payment|search|filters?|hover|scroll|layout|copy|tone|goal|functional requirements|extra pages|page|pricing|account dashboard|user authentication)\b/i

const VISUAL_PHRASE_RE =
  /\b(dairy|milk|butter|cheese|paneer|curd|yogurt|lassi|ice cream|icecream|chocolate|beverage|sweet|dessert|mithai|recipe|snack|snacks|protein|millet|granola|chips|cookie|cookies|bar|bars|bites|trail mix|nuts|wellness|saree|silk|bridal|bride|lehenga|salwar|kurta|sherwani|ethnic wear|fashion|boutique|showroom|store|jewelry|gold|perfume|makeup|skincare|watch|shoe|bag|furniture|interior|sofa|chair|lamp|living room|bedroom|hotel|resort|homestay|restaurant|bakery|coffee|spa|salon|fitness|gym|yoga|clinic|hospital|pharmacy|diagnostic|lab|doctor|dental|physiotherapy|pet|dog|cat|farm|agriculture|crop|mandi|solar|rooftop|ev|electric|vehicle|charging|logistics|warehouse|freight|shipping|container|construction|contractor|excavator|coaching|school|college|university|temple|ngo|charity|court|legal|law|real\s+estate|property|rera|chartered|gst|payroll|shipping|export|import|bharatanatyam|kathak|odissi|kuchipudi|kathakali|mohiniyattam|manipuri|sattriya|arangetram|classical dance|folk dance|garba|dandiya|bhangra|lavani|bihu|ghoomar|handloom|khadi|madhubani|warli|handicraft|weaving|loom|carnatic|hindustani|tabla|sitar|classical music|heritage walk|museum|cultural centre|cultural center|natya|nritya)\b/i

const PRODUCT_LABEL_RE =
  /\b(product|snack|snacks|protein|millet|granola|chips|cookie|cookies|bar|bars|bites|trail mix|nuts|pack|box|combo|flavor|flavour)\b/i

const LIFESTYLE_LABEL_RE =
  /\b(friend|friends|family|people|person|couple|team|founder|story|about|brand|lifestyle|community|testimonial|review)\b/i

const PRODUCT_PHOTO_RE =
  /\b(product|snack|granola|chips|cookie|bar|trail mix|pack|box|assortment|flat lay|close up)\b/i

const LIFESTYLE_PHOTO_RE =
  /\b(friend|friends|family|couple|person|people|holding|sharing|lifestyle|portrait|outdoor|smiling)\b/i

const TRANSPARENT_PIXEL_GIF =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
const NEUTRAL_IMG_FALLBACK_STYLE =
  'background:linear-gradient(to bottom right,rgb(244 244 245),rgb(228 228 231));object-fit:cover;width:100%'

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

const MATCH_ALIASES = {
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

function normalizeText(value = '') {
  return String(value).replace(/\s+/g, ' ').trim().toLowerCase()
}

function escapeRegex(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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

function formatUnsplashUrl(baseUrl, width = 1400, height = 900) {
  const src = String(baseUrl || '').trim()
  if (!src) return ''
  const separator = src.includes('?') ? '&' : '?'
  return `${src}${separator}auto=format&fit=crop&w=${width}&h=${height}&q=80`
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
  const alt =
    typeof photo?.matchText === 'string' && photo.matchText.trim()
      ? photo.matchText
      : typeof photo?.alt === 'string'
        ? photo.alt
        : ''
  const pet = subjectKey === 'dog' || subjectKey === 'cat'
  if (pet) {
    if (BAD_ALT_PET_RE.test(alt)) return false
    if (!altMatchesSubject(alt, subjectKey)) return false
    return true
  }
  if (BAD_ALT_META_RE.test(alt)) return false
  return true
}

function tokenizeForMatch(value = '') {
  return normalizeText(value)
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token))
}

function queryMatchTokens(query = '') {
  const tokens = [...new Set(tokenizeForMatch(query))]
  const core = tokens.filter((token) => !LOW_SIGNAL_QUERY_WORDS.has(token))
  return {
    tokens,
    core: core.length ? core : tokens,
  }
}

function descriptivePhotoHint(photo) {
  const query = normalizeText(photo?.query || '')
  const alt = normalizeText(photo?.alt || '')
  if (query && alt && alt !== query) return `[${query}] ${alt}`
  if (query) return `[${query}]`
  return alt
}

function tokenMatchesText(token, text) {
  const normalized = normalizeText(text)
  if (!normalized || !token) return false

  const variants = MATCH_ALIASES[token] || [token]
  return variants.some((variant) => new RegExp(`\\b${escapeRegex(variant)}\\b`, 'i').test(normalized))
}

function overlapCount(tokens, text) {
  let count = 0
  for (const token of tokens) {
    if (tokenMatchesText(token, text)) count++
  }
  return count
}

function hasRelevantQueryMatch(photo) {
  const matchText = normalizeText(photo?.matchText || '')
  const { tokens, core } = queryMatchTokens(photo?.query || '')

  if (!tokens.length) return true
  if (!matchText) return photo?.provider === 'pexels'

  const coreOverlap = overlapCount(core, matchText)
  const tokenOverlap = overlapCount(tokens, matchText)

  if (core.length > 0) return coreOverlap > 0 || tokenOverlap > 0
  return tokenOverlap > 0
}

function relevanceScore(photo) {
  const matchText = normalizeText(photo?.matchText || '')
  const { tokens, core } = queryMatchTokens(photo?.query || '')

  const coreOverlap = overlapCount(core, matchText)
  const tokenOverlap = overlapCount(tokens, matchText)
  const providerBias = photo?.provider === 'pexels' ? 0.4 : 0.2
  const rankBias = Math.max(0, 3 - (Number(photo?.sourceRank) || 0)) * 0.1
  const metadataPenalty = matchText ? 0 : photo?.provider === 'unsplash' ? -3 : -1

  return coreOverlap * 10 + tokenOverlap * 4 + providerBias + rankBias + metadataPenalty
}

function labelRelevanceScore(photo, label = '', usageCount = 0) {
  const labelText = normalizeText(label)
  if (!labelText) return -Infinity

  const matchText = normalizeText(
    [photo?.query || '', photo?.alt || '', photo?.matchText || ''].filter(Boolean).join(' '),
  )
  const { tokens, core } = queryMatchTokens(labelText)
  const coreOverlap = overlapCount(core, matchText)
  const tokenOverlap = overlapCount(tokens, matchText)
  const productBoost =
    PRODUCT_LABEL_RE.test(labelText) && PRODUCT_PHOTO_RE.test(matchText)
      ? 3
      : PRODUCT_LABEL_RE.test(labelText) && LIFESTYLE_PHOTO_RE.test(matchText)
        ? -2
        : 0
  const lifestyleBoost =
    LIFESTYLE_LABEL_RE.test(labelText) && LIFESTYLE_PHOTO_RE.test(matchText)
      ? 2
      : LIFESTYLE_LABEL_RE.test(labelText) && PRODUCT_PHOTO_RE.test(matchText)
        ? -1
        : 0
  const reusePenalty = usageCount * 0.35

  return coreOverlap * 10 + tokenOverlap * 4 + productBoost + lifestyleBoost - reusePenalty
}

function phraseFromPrompt(prompt, maxWords = 5) {
  const raw = normalizeText(prompt).replace(/[^a-z0-9\s-]/g, ' ')
  const parts = raw.split(/\s+/).filter((w) => w.length > 1 && !STOP_WORDS.has(w))
  if (!parts.length) return ''
  return parts.slice(0, maxWords).join(' ')
}

function extractSalientPhrases(prompt, max = 4) {
  const raw = normalizeText(prompt)
  const out = []
  const stripTail = (s) =>
    s
      .replace(/\s+with\s+[\s\S]+$/i, '')
      .replace(/\s+including\s+[\s\S]+$/i, '')
      .replace(/\s+and\s+(appointment|booking|sections?|cta)[\s\S]+$/i, '')
      .trim()

  const mFor = raw.match(
    /\b(?:for|about)\s+(?:a|an|the)\s+([a-z0-9][a-z0-9\s,'-]{10,100})/i,
  )
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

function salientSearchQueries(phrase, typed, prompt) {
  const p = normalizeText(phrase)
  if (!p || p.length < 8) return []
  if (isVisualPhrase(p)) return queriesForVisualPhrase(p, typed, prompt)
  const words = tokenizeForMatch(p).filter((w) => !STOP_WORDS.has(w))
  const core = words.slice(0, 6).join(' ')
  if (!core) return []
  if (typed === 'ecommerce') return [`${core} product photography commercial`]
  if (typed === 'portfolio') return [`${core} creative work photography`]
  return [`${core} professional photography editorial`]
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
  const explicit = String(
    ctx?.site_type || ctx?.siteType || siteSpec?.siteType || siteSpec?.metadata?.siteType || '',
  ).toLowerCase()
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
      'indian classical music tabla sitar',
      'carnatic music concert performance india',
      'sitar musician traditional instrument',
    ]
  }
  if (/\b(museum|heritage walk|cultural centre|cultural center|monument tour)\b/.test(p)) {
    return [
      'india museum heritage gallery exhibition',
      'historical monument india tourism architecture',
      'cultural festival india traditional',
    ]
  }

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
  if (/\b(protein snacks?|protein)\b/.test(p)) {
    return ['protein bar healthy snack product', 'healthy protein snack pack']
  }
  if (/\b(millet snacks?|millet)\b/.test(p)) {
    return ['millet crackers healthy snack product', 'millet snack pack close up']
  }
  if (/\b(baked snacks?|chips)\b/.test(p)) {
    return ['baked chips healthy snack product', 'veggie chips snack pack']
  }
  if (/\b(kids snacks?|kids)\b/.test(p)) {
    return ['kids healthy snack pack', 'fruit snack product close up']
  }
  if (/\b(travel snacks?|trail mix)\b/.test(p)) {
    return ['trail mix healthy snack pack', 'travel snack assortment']
  }
  if (/\b(bestsellers?|assortment)\b/.test(p)) {
    return ['healthy snacks assortment flat lay', 'packaged snack assortment']
  }
  if (/\b(granola)\b/.test(p)) {
    return ['granola snack product close up', 'oats granola healthy snack']
  }
  if (/\b(cookies?)\b/.test(p)) {
    return ['healthy cookie snack product', 'biscuit snack close up']
  }
  if (/\b(bars?)\b/.test(p)) {
    return ['protein bar snack product', 'energy bar healthy snack']
  }
  if (/\b(bites?)\b/.test(p)) {
    return ['energy bites healthy snack product', 'snack bites close up']
  }
  if (/\b(snacks?|wellness)\b/.test(p)) {
    return ['healthy packaged snack product', 'friends sharing healthy snacks']
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
  if (
    /\b(jewelry|jewellery|ornaments?|tribal\s+craft|925\s+silver|sterling\s+silver|handcrafted\s+jewelry|bangles|necklace\s+gold)\b/.test(
      p,
    )
  ) {
    return uniqueValues([
      'indian traditional gold silver jewelry',
      'handcrafted silver jewelry editorial',
      'ethnic jewelry woman portrait',
      'indian festival jewelry necklace',
      'artisan jewelry workshop detail',
    ]).slice(0, MAX_REQUESTS)
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
  if (SNACK_PROMPT_RE.test(p)) {
    return uniqueValues([
      'healthy packaged snack product',
      'protein bar healthy snack product',
      'millet snack pack close up',
      'trail mix healthy snack pack',
      'friends sharing healthy snacks',
      'granola snack product close up',
    ]).slice(0, MAX_REQUESTS)
  }
  if (/\b(hospital|multispeciality|multi-speciality|clinic|diagnostics|pathology)\b/.test(p)) {
    return uniqueValues([
      'modern hospital building healthcare',
      'doctor patient consultation clinic room',
      'medical equipment hospital',
      'diagnostics laboratory interior',
      'healthcare nurses hospital corridor',
      'ambulance hospital entrance',
    ]).slice(0, MAX_REQUESTS)
  }
  if (/\b(pharmacy|pharma|medicine distributor)\b/.test(p)) {
    return uniqueValues([
      'pharmacy interior medicine shelves',
      'pharmacist customer consultation',
      'medicine tablets packaging',
    ]).slice(0, MAX_REQUESTS)
  }
  if (/\b(solar|photovoltaic|rooftop|epc|renewable energy)\b/.test(p)) {
    return uniqueValues([
      'rooftop solar panels residential house',
      'solar farm panels installation',
      'solar technician roof work',
      'industrial solar panel array field',
    ]).slice(0, MAX_REQUESTS)
  }
  if (/\b(logistics|warehouse|3pl|freight|fulfillment|cold storage)\b/.test(p)) {
    return uniqueValues([
      'warehouse interior pallets forklift',
      'shipping container port crane',
      'delivery truck loading dock',
      'logistics hub distribution center',
    ]).slice(0, MAX_REQUESTS)
  }
  if (/\b(coaching|jee|neet|upsc|psc|academy|tuition|school|college)\b/.test(p)) {
    return uniqueValues([
      'students classroom studying india',
      'library books exam preparation',
      'teacher whiteboard coaching class',
      'university campus building',
    ]).slice(0, MAX_REQUESTS)
  }
  if (/\b(legal|law firm|advocate|litigation|contracts)\b/.test(p)) {
    return uniqueValues([
      'law office books library',
      'lawyer desk consultation',
      'courthouse building columns',
    ]).slice(0, MAX_REQUESTS)
  }
  if (/\b(temple|charitable trust|darshan|prayer)\b/.test(p)) {
    return uniqueValues([
      'indian temple architecture',
      'temple courtyard devotees',
      'oil lamp temple ritual',
    ]).slice(0, MAX_REQUESTS)
  }
  if (/\b(ngo|csr|non-profit|nonprofit|volunteer)\b/.test(p)) {
    return uniqueValues([
      'community volunteer helping children',
      'rural development india volunteer',
      'tree planting volunteers team',
    ]).slice(0, MAX_REQUESTS)
  }
  if (/\b(ev|electric vehicle|charging station|dealership)\b/.test(p)) {
    return uniqueValues([
      'electric car charging station',
      'ev showroom modern vehicle',
      'electric scooter charging urban',
    ]).slice(0, MAX_REQUESTS)
  }
  if (/\b(real estate|rera|broker|co-living|pg|property)\b/.test(p)) {
    return uniqueValues([
      'modern apartment building city',
      'real estate agent showing apartment',
      'luxury living room interior design',
    ]).slice(0, MAX_REQUESTS)
  }
  if (/\b(nbfc|gold loan|lending|mutual fund|insurance|fintech|upi|wealth)\b/.test(p)) {
    return uniqueValues([
      'financial planning documents desk',
      'mobile banking app smartphone hand',
      'gold coins investment wealth',
      'family insurance protection home',
    ]).slice(0, MAX_REQUESTS)
  }
  if (/\b(agriculture|farmer|fpo|mandi|crop|organic farm)\b/.test(p)) {
    return uniqueValues([
      'indian farmer field agriculture',
      'vegetable harvest farm produce',
      'tractor agriculture field india',
    ]).slice(0, MAX_REQUESTS)
  }
  if (
    /\b(bharatanatyam|kathak|odissi|kuchipudi|kathakali|mohiniyattam|manipuri|sattriya|arangetram|classical dance|nritya|natya)\b/.test(
      p,
    )
  ) {
    return uniqueValues([
      'indian classical dance performance costume',
      'bharatanatyam dancer mudra hands',
      'kathak dancer spinning lehenga',
      'odissi dance silver jewelry costume',
      'traditional indian dance stage lighting',
    ]).slice(0, MAX_REQUESTS)
  }
  if (/\b(garba|dandiya|navratri|bhangra|lavani|bihu|ghoomar|folk dance)\b/.test(p)) {
    return uniqueValues([
      'garba night traditional dress india',
      'dandiya sticks dance festival',
      'bhangra dancers colorful punjab',
      'indian folk dance celebration outdoor',
    ]).slice(0, MAX_REQUESTS)
  }
  if (/\b(handloom|khadi|madhubani|warli|handicraft|weaving|loom)\b/.test(p)) {
    return uniqueValues([
      'handloom saree weaving india workshop',
      'khadi fabric textile natural dye',
      'madhubani painting art wall india',
      'warli tribal art painting maharashtra',
    ]).slice(0, MAX_REQUESTS)
  }
  if (/\b(carnatic|hindustani|tabla|sitar|classical music|ragam)\b/.test(p)) {
    return uniqueValues([
      'tabla drums indian classical music',
      'sitar veena carnatic concert',
      'indian classical vocalist performance',
    ]).slice(0, MAX_REQUESTS)
  }
  if (/\b(museum|heritage walk|cultural centre|cultural center|archaeology|fort palace tour)\b/.test(p)) {
    return uniqueValues([
      'india museum artifact gallery',
      'heritage fort india architecture tourism',
      'cultural heritage exhibition india',
    ]).slice(0, MAX_REQUESTS)
  }
  return []
}

function buildQueries({ prompt, ctx, siteSpec, maxQueries }) {
  const cap = typeof maxQueries === 'number' ? maxQueries : MAX_REQUESTS
  const subjectFirst = themedQueries(prompt || '')
  const typed = inferVisualSiteType(prompt || '', ctx, siteSpec)
  const salientRaw = extractSalientPhrases(prompt || '', 3)
  const salientQueries = salientRaw.flatMap((phrase) =>
    salientSearchQueries(phrase, typed, prompt),
  )

  const core = phraseFromPrompt(prompt || '', 6)
  const extracted = extractVisualPhrases(prompt || '')
    .slice(0, 8)
    .flatMap((phrase) => queriesForVisualPhrase(phrase, typed, prompt))

  const fromEntities = uniqueValues(ctx?.entities || [])
    .filter(isVisualPhrase)
    .slice(0, 3)
    .flatMap((entity) => queriesForVisualPhrase(entity, typed, prompt))

  const fromFeatures = uniqueValues(ctx?.features || [])
    .filter(isVisualPhrase)
    .slice(0, 3)
    .flatMap((feature) => queriesForVisualPhrase(feature, typed, prompt))

  const fromProject = []
  const pn = ctx?.project_name
  if (pn && String(pn).trim()) {
    const n = normalizeText(pn)
    if (isVisualPhrase(n)) fromProject.push(...queriesForVisualPhrase(n, typed, prompt))
    else fromProject.push(`${n.slice(0, 48)} brand photography`)
  }
  if (ctx?.tagline) {
    fromProject.push(
      ...extractVisualPhrases(ctx.tagline)
        .slice(0, 2)
        .flatMap((ph) => queriesForVisualPhrase(ph, typed, prompt)),
    )
  }

  const fromPages =
    Array.isArray(siteSpec?.pages) && siteSpec.pages.length
      ? siteSpec.pages
          .slice(0, 4)
          .map((page) => [page?.title, page?.name, page?.description].filter(Boolean).join(' '))
          .filter(Boolean)
          .flatMap((line) =>
            extractVisualPhrases(line).flatMap((ph) => queriesForVisualPhrase(ph, typed, prompt)),
          )
      : []

  const extras = isVisualPhrase(core) ? queriesForVisualPhrase(core, typed, prompt) : []
  if (typed === 'ecommerce') extras.push('product on white background minimal')
  if (typed === 'portfolio') extras.push('creative work detail close up')

  return uniqueValues([
    ...subjectFirst,
    ...salientQueries,
    ...extracted,
    ...extras,
    ...fromEntities,
    ...fromFeatures,
    ...fromProject,
    ...fromPages,
  ]).slice(0, cap)
}

function subjectKeyFromPrompt(prompt) {
  const p = normalizeText(prompt || '')
  if (DOG_PROMPT_RE.test(p)) return 'dog'
  if (CAT_PROMPT_RE.test(p)) return 'cat'
  if (APPLE_STORE_RE.test(p)) return 'electronics'
  return null
}

async function fetchPexelsPhotos(query, subjectKey, keep = KEEP_PER_QUERY) {
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
    for (const [sourceRank, photo] of (payload.photos || []).entries()) {
      const id = sanitizeId(photo.id)
      if (!id) continue
      const alt = typeof photo.alt === 'string' ? photo.alt.trim() : ''
      const matchText = alt
      const candidate = {
        provider: 'pexels',
        query,
        id,
        sourceRank,
        url: formatImageUrl(id),
        rawUrl:
          typeof photo?.src?.large2x === 'string'
            ? photo.src.large2x
            : formatImageUrl(id, 1400, 900),
        alt: alt || query,
        matchText,
      }
      if (!isUsablePhoto(candidate, subjectKey) || !hasRelevantQueryMatch(candidate)) continue
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

async function fetchUnsplashPhotos(query, subjectKey, keep = KEEP_PER_QUERY) {
  if (!query || !UNSPLASH_ACCESS_KEY || keep <= 0) return []
  const url = new URL(UNSPLASH_API_URL)
  url.searchParams.set('query', query)
  url.searchParams.set('per_page', String(Math.max(keep * 3, 10)))
  url.searchParams.set('orientation', 'landscape')
  url.searchParams.set('content_filter', 'high')

  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        'Accept-Version': 'v1',
      },
      signal: controller.signal,
    })

    if (!res.ok) return []
    const payload = await res.json()
    const out = []

    for (const [sourceRank, photo] of (payload.results || []).entries()) {
      const id = String(photo?.id || '').trim()
      if (!id) continue

      const alt = String(photo?.alt_description || photo?.description || '').trim()
      const slug = String(photo?.slug || '').trim().replace(/-/g, ' ')
      const matchText = [alt, slug].filter(Boolean).join(' ').trim()
      const regularUrl = formatUnsplashUrl(photo?.urls?.regular || photo?.urls?.raw)
      const rawUrl = formatUnsplashUrl(photo?.urls?.raw || photo?.urls?.regular)
      if (!regularUrl) continue

      const candidate = {
        provider: 'unsplash',
        query,
        id,
        sourceRank,
        url: regularUrl,
        rawUrl: rawUrl || regularUrl,
        alt: alt || query,
        matchText,
      }

      if (!isUsablePhoto(candidate, subjectKey) || !hasRelevantQueryMatch(candidate)) continue
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

async function fetchPhotos(query, subjectKey, keep = KEEP_PER_QUERY) {
  if (!query || keep <= 0) return []

  const [pexels, unsplash] = await Promise.all([
    fetchPexelsPhotos(query, subjectKey, keep),
    fetchUnsplashPhotos(query, subjectKey, keep),
  ])

  const merged = [...pexels, ...unsplash]
  const seen = new Set()

  return merged
    .filter((photo) => {
      if (!photo?.url || seen.has(photo.url)) return false
      seen.add(photo.url)
      return true
    })
    .sort((left, right) => relevanceScore(right) - relevanceScore(left))
    .slice(0, keep)
}

function pickBestVideoFile(files) {
  if (!Array.isArray(files) || !files.length) return null
  const mp4 = files.filter((f) => String(f?.file_type || '').includes('mp4') && f?.link)
  if (!mp4.length) return null
  const landscape = mp4.filter((f) => Number(f.width) >= Number(f.height))
  const pool = landscape.length ? landscape : mp4
  const hd = pool.filter((f) => f.quality === 'hd')
  const tier = hd.length ? hd : pool
  return [...tier].sort((a, b) => Number(b.width) - Number(a.width))[0] || null
}

async function fetchPexelsVideos(query, subjectKey, keep = KEEP_VIDEOS_PER_QUERY) {
  if (!query || !PEXELS_API_KEY || keep <= 0) return []
  const url = new URL(PEXELS_VIDEOS_API_URL)
  url.searchParams.set('query', query)
  url.searchParams.set('per_page', '12')
  url.searchParams.set('orientation', 'landscape')
  url.searchParams.set('size', 'medium')

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
    for (const [sourceRank, video] of (payload.videos || []).entries()) {
      const file = pickBestVideoFile(video?.video_files)
      if (!file?.link) continue
      const candidate = {
        kind: 'video',
        provider: 'pexels',
        query,
        id: String(video.id),
        sourceRank,
        url: file.link,
        rawUrl: file.link,
        posterUrl: typeof video.image === 'string' ? video.image : '',
        alt: query,
        matchText: query,
      }
      if (!isUsablePhoto(candidate, subjectKey) || !hasRelevantQueryMatch(candidate)) continue
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

function toMediaPromptBlock(photos, videos) {
  const lines = []
  if (Array.isArray(photos) && photos.length) {
    lines.push(
      `Approved still images (use only these URLs in img src):\n${photos
        .slice(0, 8)
        .map((item, index) => {
          const hint = descriptivePhotoHint(item).slice(0, 140)
          return `- ${index + 1}. ${hint}: ${item.url}`
        })
        .join('\n')}`,
    )
  }
  if (Array.isArray(videos) && videos.length) {
    lines.push(
      `Approved short videos (use only these mp4 URLs; set the matching poster when listed):\n${videos
        .slice(0, MAX_VIDEOS_TOTAL)
        .map((item, index) => {
          const hint = descriptivePhotoHint(item).slice(0, 120)
          const poster = item.posterUrl ? `\n  poster: ${item.posterUrl}` : ''
          return `- ${index + 1}. ${hint}\n  mp4: ${item.url}${poster}`
        })
        .join('\n')}`,
    )
  }
  if (!lines.length) return ''
  return `\n${lines.join('\n\n')}\n`
}

function mergeVideosLists(va = [], vb = []) {
  const merged = []
  const seen = new Set()
  for (const v of [...vb, ...va]) {
    if (!v?.url || seen.has(v.url)) continue
    seen.add(v.url)
    merged.push(v)
    if (merged.length >= 8) break
  }
  return merged
}

export function mergeImageHintLists(primary, secondary) {
  const a = primary?.photos ?? []
  const b = secondary?.photos ?? []
  const va = primary?.videos ?? []
  const vb = secondary?.videos ?? []
  const hydrationPrompt =
    secondary?.hydrationPrompt ??
    primary?.hydrationPrompt ??
    secondary?.prompt ??
    primary?.prompt ??
    ''
  const prompt = secondary?.prompt ?? primary?.prompt ?? ''
  const meta = { hydrationPrompt, prompt }

  if (!b.length) {
    if (!a.length) {
      const vOnly = mergeVideosLists(va, [])
      return vOnly.length
        ? { photos: [], videos: vOnly, promptBlock: toMediaPromptBlock([], vOnly), ...meta }
        : { photos: [], videos: [], promptBlock: '', ...meta }
    }
    const vm = mergeVideosLists(va, [])
    return { photos: a, videos: vm, promptBlock: toMediaPromptBlock(a, vm), ...meta }
  }
  if (!a.length) {
    const vm = mergeVideosLists([], vb)
    return { photos: b, videos: vm, promptBlock: toMediaPromptBlock(b, vm), ...meta }
  }
  const seen = new Set()
  const merged = []
  for (const photo of [...b, ...a]) {
    if (!photo?.url || seen.has(photo.url)) continue
    seen.add(photo.url)
    merged.push(photo)
    if (merged.length >= 18) break
  }
  const vm = mergeVideosLists(va, vb)
  return { photos: merged, videos: vm, promptBlock: toMediaPromptBlock(merged, vm), ...meta }
}

function chooseBestPhotoForLabel(label, photos, usage) {
  if (!label || !Array.isArray(photos) || !photos.length) return null

  let bestScore = -Infinity
  for (const photo of photos) {
    const usageCount = usage.get(photo.url) || 0
    const score = labelRelevanceScore(photo, label, usageCount)
    if (score > bestScore) bestScore = score
  }
  if (bestScore <= 0) return null

  const ties = []
  for (const photo of photos) {
    const usageCount = usage.get(photo.url) || 0
    const score = labelRelevanceScore(photo, label, usageCount)
    if (score === bestScore) ties.push(photo)
  }
  if (ties.length === 1) return ties[0]
  let minU = Infinity
  let pick = ties[0]
  for (const photo of ties) {
    const u = usage.get(photo.url) || 0
    if (u < minU) {
      minU = u
      pick = photo
    }
  }
  return pick
}

function pickPhotoForImg(label, photos, usage) {
  if (!photos.length) return null
  const best = chooseBestPhotoForLabel(label, photos, usage)
  if (best) return best
  let minU = Infinity
  let pick = photos[0]
  for (const photo of photos) {
    const u = usage.get(photo.url) || 0
    if (u < minU) {
      minU = u
      pick = photo
    }
  }
  return pick
}

const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function tryDerivePexelsFallbackUrl(url) {
  try {
    const parsed = new URL(String(url || '').trim())
    if (parsed.hostname !== 'images.pexels.com') return null
    const id = parsed.pathname.match(/\/photos\/(\d+)\//)?.[1]
    if (!id) return null
    return formatImageUrl(id, 1400, 1050)
  } catch {
    return null
  }
}

function isKnownStockCdnUrl(url) {
  try {
    const h = new URL(String(url || '').trim()).hostname
    return (
      h === 'images.pexels.com' ||
      h.endsWith('.pexels.com') ||
      h === 'images.unsplash.com' ||
      h.endsWith('.unsplash.com')
    )
  } catch {
    return false
  }
}

function responseLooksLikeImage(res, url) {
  const ct = String(res.headers.get('content-type') || '').toLowerCase()
  if (ct.includes('image/')) return true
  if (ct.includes('application/octet-stream') && isKnownStockCdnUrl(url)) return true
  return false
}

async function fetchUrlProbe(u, init) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    return await fetch(u, { ...init, signal: controller.signal, redirect: 'follow' })
  } finally {
    clearTimeout(timeout)
  }
}

async function isImageUrlHealthy(url, { attempt = 0 } = {}) {
  const u = String(url || '').trim()
  if (!u) return false
  if (u.startsWith('data:image/')) return true

  const probes = [
    () => fetchUrlProbe(u, { method: 'HEAD' }),
    () => fetchUrlProbe(u, { method: 'GET', headers: { Range: 'bytes=0-2047' } }),
    () => fetchUrlProbe(u, { method: 'GET', headers: { Range: 'bytes=0-0' } }),
  ]

  try {
    for (const run of probes) {
      const r = await run()
      if (r.ok && responseLooksLikeImage(r, u)) return true
    }
  } catch {
    if (attempt === 0) {
      await sleep(220)
      return isImageUrlHealthy(u, { attempt: 1 })
    }
    return false
  }
  return false
}

async function validateAndRepairPhotoList(photos) {
  const next = []
  for (const photo of photos || []) {
    if (next.length >= 12) break
    const ok = await isImageUrlHealthy(photo.url)
    if (ok) {
      next.push(photo)
      continue
    }
    const fallback = tryDerivePexelsFallbackUrl(photo.url)
    if (fallback && (await isImageUrlHealthy(fallback))) {
      next.push({ ...photo, url: fallback })
    }
  }
  if (next.length === 0 && (photos?.length ?? 0) > 0) {
    return photos.slice(0, 12)
  }
  return next
}

function extractVideoLabel(block) {
  const open = String(block).match(/^<video\b[^>]*/i)?.[0] || ''
  const aria = extractAttribute(open, 'aria-label')
  if (aria) return aria
  const title = extractAttribute(open, 'title')
  if (title) return title
  const dataAlt = extractAttribute(open, 'data-alt')
  if (dataAlt) return dataAlt
  return ''
}

function replaceVideoMp4Url(block, url) {
  let next = block
  if (/<source/i.test(next)) {
    let first = true
    next = next.replace(/<source\b[^>]*>/gi, (st) => {
      if (!first) return st
      first = false
      if (!/\bsrc\s*=/i.test(st)) return st
      return st.replace(/\bsrc\s*=\s*["'][^"']*["']/i, `src="${url}"`)
    })
    return next
  }
  const open = next.match(/^<video\b[^>]*/i)?.[0] || ''
  if (/\bsrc\s*=/i.test(open)) {
    return next.replace(/^<video\b[^>]*/i, (tag) =>
      tag.replace(/\bsrc\s*=\s*["'][^"']*["']/i, `src="${url}"`),
    )
  }
  return next.replace(/^<video\b[^>]*>/i, (tag) => `${tag}<source src="${url}" type="video/mp4">`)
}

function applyVideoPoster(block, posterUrl) {
  if (!posterUrl) return block
  const open = block.match(/^<video\b[^>]*/i)?.[0] || ''
  if (/\bposter\s*=/i.test(open)) {
    return block.replace(/\bposter\s*=\s*["'][^"']*["']/i, `poster="${posterUrl}"`)
  }
  return block.replace(/^<video\b/i, `<video poster="${posterUrl}"`)
}

function enforceVerifiedVideoElements(html, videos, usage) {
  if (!videos.length) return html
  return html.replace(/<video\b[\s\S]*?<\/video>/gi, (block) => {
    if (/data-sf-skip-video/i.test(block)) return block
    const open = block.match(/^<video\b[^>]*/i)?.[0] || ''
    let label = extractVideoLabel(block)
    if (!label) {
      const poster = extractAttribute(open, 'poster')
      if (poster) label = poster
    }
    const v = pickPhotoForImg(label, videos, usage)
    if (!v) return block
    usage.set(v.url, (usage.get(v.url) || 0) + 1)
    let next = replaceVideoMp4Url(block, v.url)
    next = applyVideoPoster(next, v.posterUrl)
    return next
  })
}

function stripSrcsetFromTag(tag) {
  return tag
    .replace(/\s+srcset\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s+sizes\s*=\s*["'][^"']*["']/gi, '')
}

function replaceAttributeValue(tag, attr, value) {
  const pattern = new RegExp(`(${attr}\\s*=\\s*["'])[^"']*(["'])`, 'i')
  return tag.replace(pattern, `$1${value}$2`)
}

function extractAttribute(tag, attr) {
  const match = tag.match(new RegExp(`${attr}\\s*=\\s*["']([^"']*)["']`, 'i'))
  return match ? match[1] : ''
}

function setImgSrcAttribute(tag, value) {
  if (/\bsrc\s*=/i.test(tag)) return replaceAttributeValue(tag, 'src', value)
  return tag.replace(/<img\b/i, `<img src="${value}" `)
}

function looksLikeTrustedStockImageUrl(src) {
  const s = String(src || '').trim()
  if (!s || s.startsWith('data:')) return false
  try {
    const u = new URL(s)
    if (u.protocol !== 'https:') return false
    const h = u.hostname
    return (
      h === 'images.pexels.com' ||
      h.endsWith('.pexels.com') ||
      h === 'images.unsplash.com' ||
      h.endsWith('.unsplash.com')
    )
  } catch {
    return false
  }
}

function isLikelyLogoTag(tag) {
  const cls = extractAttribute(tag, 'class')
  const alt = extractAttribute(tag, 'alt')
  if (/\blogo\b/i.test(alt) || /\blogo\b|brand-mark|navbar-brand|site-logo|footer-brand/i.test(cls))
    return true
  const w = extractAttribute(tag, 'width')
  const h = extractAttribute(tag, 'height')
  if (w && h && Number(w) <= 56 && Number(h) <= 56) return true
  return false
}

function enforceVerifiedPhotoSources(html, photos, usage) {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    if (isLikelyLogoTag(tag)) return tag
    const alt = extractAttribute(tag, 'alt')
    const photo = pickPhotoForImg(alt, photos, usage)
    if (!photo) return stripSrcsetFromTag(tag)
    usage.set(photo.url, (usage.get(photo.url) || 0) + 1)
    const out = setImgSrcAttribute(tag, photo.url)
    return stripSrcsetFromTag(out)
  })
}

function neutralizeNonStockImages(html) {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    if (isLikelyLogoTag(tag)) return tag
    const rawSrc = extractAttribute(tag, 'src')
    if (looksLikeTrustedStockImageUrl(rawSrc)) return stripSrcsetFromTag(tag)
    let out = setImgSrcAttribute(tag, TRANSPARENT_PIXEL_GIF)
    out = stripSrcsetFromTag(out)
    if (!/\bstyle\s*=/i.test(out)) {
      out = out.replace(/<img/i, `<img style="${NEUTRAL_IMG_FALLBACK_STYLE}"`)
    } else {
      out = out.replace(/\bstyle\s*=\s*["']([^"']*)["']/i, (m, st) => `style="${st};${NEUTRAL_IMG_FALLBACK_STYLE}"`)
    }
    return out
  })
}

function realignObjectImageUrls(html, photos, usage) {
  if (!photos.length) return html
  const pattern =
    /((?:"?(?:name|title)"?)\s*:\s*["'`])([^"'`]+)(["'`][\s\S]{0,240}?(?:"?image"?)\s*:\s*["'`])([^"'`]+)(["'`])/gi

  return html.replace(pattern, (match, prefix, label, middle, currentUrl, suffix) => {
    const best = pickPhotoForImg(label, photos, usage)
    if (!best || best.url === currentUrl) return match

    usage.set(best.url, (usage.get(best.url) || 0) + 1)
    return `${prefix}${label}${middle}${best.url}${suffix}`
  })
}

export function alignGeneratedImagesToContext(html, imageHints = null) {
  const photos = imageHints?.photos ?? []
  const videos = imageHints?.videos ?? []
  if (!html || typeof html !== 'string') return html

  const usage = new Map()
  let next = html
  if (photos.length) {
    next = enforceVerifiedPhotoSources(next, photos, usage)
    next = realignObjectImageUrls(next, photos, usage)
  } else {
    next = neutralizeNonStockImages(next)
  }
  if (videos.length) {
    next = enforceVerifiedVideoElements(next, videos, usage)
  }
  return next
}

const VERIFIED_FALLBACK_PEXELS_IDS = [
  1152077, 1034812, 1446292, 1628239, 1670770, 1755386, 1855765, 2149475, 2036646, 3760772, 298863,
  267320, 2983464,
]

const TEA_BEVERAGE_PEXELS_IDS = [
  5946964, 5946965, 5946966, 5946967, 5946968, 5946969, 5946970, 5946971, 5946972, 5946973, 5946974, 5946975,
  5946976, 5946977, 5946978, 5946979, 5946980, 5946981, 5946982, 5946983, 5946985,
]

const HYDRATION_MATCH_BLOB = {
  tea: 'tea assam oolong sencha chamomile chai matcha black tea green tea white tea herbal loose leaf beverage cup drink organic brew kettle malt honey ginger cardamom rose floral peony breakfast evening garden spiced hot calming restful grassy delicate bold full bodied',
  coffee:
    'coffee espresso latte cappuccino roast arabica beans cup cafe beverage hot cold brew organic craft pour iced morning',
  leather: 'leather bag wallet tote handbag craft premium accessory grain stitch natural tanned artisan',
  generic:
    'product retail ecommerce catalog commercial still life studio photography clean minimal merchandise shopping',
}

function detectHydrationRetailCategory(prompt = '') {
  const p = String(prompt || '')
  if (
    /\b(tea|oolong|chai|chamomile|sencha|assam|matcha|herbal|loose[\s-]?leaf|kettle|teapot|black tea|green tea|brew|steep|leaf)\b/i.test(
      p,
    )
  )
    return 'tea'
  if (/\b(coffee|espresso|latte|cappuccino|roast|arabica|coffee beans?)\b/i.test(p)) return 'coffee'
  if (/\b(leather|wallet|tote|handbag|satchel|accessories)\b/i.test(p)) return 'leather'
  return 'generic'
}

function buildSyntheticFallbackPhotos(category) {
  let ids = VERIFIED_FALLBACK_PEXELS_IDS
  let blob = HYDRATION_MATCH_BLOB.generic
  let query = 'product photography retail'
  if (category === 'tea') {
    ids = TEA_BEVERAGE_PEXELS_IDS
    blob = HYDRATION_MATCH_BLOB.tea
    query = 'loose leaf tea beverage'
  } else if (category === 'coffee') {
    ids = TEA_BEVERAGE_PEXELS_IDS
    blob = HYDRATION_MATCH_BLOB.coffee
    query = 'coffee beverage cafe'
  } else if (category === 'leather') {
    blob = HYDRATION_MATCH_BLOB.leather
    query = 'leather goods product'
  }
  return ids.map((id) => ({
    url: formatImageUrl(id, 1400, 900),
    alt: '',
    matchText: blob,
    query,
  }))
}

function escapeHtmlAttribute(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
}

function stockPhotosForHydration(imageHints = null) {
  const prompt = imageHints?.hydrationPrompt ?? imageHints?.prompt ?? ''
  const cat = detectHydrationRetailCategory(prompt)
  if (cat === 'tea' || cat === 'coffee' || cat === 'leather') {
    return buildSyntheticFallbackPhotos(cat)
  }
  const fromApi = imageHints?.photos
  if (Array.isArray(fromApi) && fromApi.length) return fromApi
  return buildSyntheticFallbackPhotos(cat)
}

function injectStockHydrationCss(html) {
  if (!html || html.includes('data-sf-stock-hydration')) return html
  const block = `<style data-sf-stock-hydration>
.product-card img.img,.product-card > img.img{width:100%;object-fit:cover;display:block}
.product-card img.img{height:200px}
.collection-card img.img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.hero-visual img{width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit}
.materials .visual img{width:100%;height:100%;object-fit:cover;display:block;border-radius:var(--radius,.75rem)}
</style>`
  return /<\s*\/\s*head\s*>/i.test(html) ? html.replace(/<\s*\/\s*head\s*>/i, `${block}\n</head>`) : `${block}\n${html}`
}

export function hydrateStorefrontGradientSlots(html, imageHints = null) {
  if (!html || typeof html !== 'string') return html
  if (!/product-card|collection-card/i.test(html)) return html

  const photos = stockPhotosForHydration(imageHints)
  if (!photos.length) return html

  const usage = new Map()
  let next = html

  next = next.replace(/<article\s+class="product-card"[^>]*>([\s\S]*?)<\/article>/gi, (block) => {
    const h = block.match(/<h3[^>]*>([^<]*)</i)
    const title = (h?.[1] ?? 'Product').trim()
    const desc =
      block.match(/class\s*=\s*["'][^"']*desc[^"']*["'][^>]*>([^<]*)</i)?.[1] ??
      block.match(/<p[^>]*class\s*=\s*["'][^"']*desc[^"']*["'][^>]*>([^<]*)</i)?.[1] ??
      ''
    const label = [title, String(desc).trim()].filter(Boolean).join(' ')
    const pick = pickPhotoForImg(label, photos, usage)
    const url = pick?.url ?? photos[0].url
    usage.set(url, (usage.get(url) || 0) + 1)
    return block.replace(
      /<div\s+class="img"[^>]*>\s*<\/div>/i,
      `<img class="img" src="${url}" alt="${escapeHtmlAttribute(title)}" loading="lazy" decoding="async" width="800" height="600" />`,
    )
  })

  next = next.replace(/<article\s+class="collection-card"[^>]*>([\s\S]*?)<\/article>/gi, (block) => {
    const lab = block.match(/class="label"[^>]*>([^<]*)</i)
    const title = (lab?.[1] ?? 'Collection').trim()
    const promptCtx = String(imageHints?.hydrationPrompt ?? imageHints?.prompt ?? '').slice(0, 160)
    const label = [title, promptCtx].filter(Boolean).join(' ')
    const pick = pickPhotoForImg(label, photos, usage)
    const url = pick?.url ?? photos[0].url
    usage.set(url, (usage.get(url) || 0) + 1)
    return block.replace(
      /<div\s+class="img"[^>]*>\s*<\/div>/i,
      `<img class="img" src="${url}" alt="${escapeHtmlAttribute(title)}" loading="lazy" decoding="async" width="800" height="1000" />`,
    )
  })

  next = next.replace(/<div\s+class="hero-visual"[^>]*>\s*<\/div>/i, () => {
    const hp = String(imageHints?.hydrationPrompt ?? imageHints?.prompt ?? '').slice(0, 220)
    const pick = pickPhotoForImg(hp || 'hero product lifestyle editorial retail', photos, usage)
    const url = pick?.url ?? photos[0].url
    usage.set(url, (usage.get(url) || 0) + 1)
    return `<div class="hero-visual"><img src="${url}" alt="${escapeHtmlAttribute('Featured product')}" loading="eager" decoding="async" width="1200" height="900" /></div>`
  })

  next = next.replace(/(<section[^>]*class="[^"]*materials[^"]*"[^>]*>)([\s\S]*?)(<\/section>)/i, (full, open, inner, close) => {
    if (!/<div\s+class="visual"[^>]*>\s*<\/div>/i.test(inner)) return full
    const mp = String(imageHints?.hydrationPrompt ?? imageHints?.prompt ?? '').slice(0, 200)
    const pick = pickPhotoForImg(
      mp ? `${mp} materials craft ingredients story` : 'materials craft ingredients product',
      photos,
      usage,
    )
    const url = pick?.url ?? photos[0].url
    usage.set(url, (usage.get(url) || 0) + 1)
    const inner2 = inner.replace(
      /<div\s+class="visual"[^>]*>\s*<\/div>/i,
      `<div class="visual"><img src="${url}" alt="${escapeHtmlAttribute('Materials and craft')}" loading="lazy" decoding="async" width="1000" height="800" /></div>`,
    )
    return open + inner2 + close
  })

  if (next !== html) next = injectStockHydrationCss(next)
  return next
}

export async function verifyTrustedStockImageUrls(html) {
  if (!html || typeof html !== 'string') return html
  const fallbacks = VERIFIED_FALLBACK_PEXELS_IDS.map((id) => formatImageUrl(id, 1400, 900))
  let fi = 0
  const re = /<img\b[^>]*>/gi
  let m
  let out = ''
  let lastIndex = 0
  while ((m = re.exec(html)) !== null) {
    out += html.slice(lastIndex, m.index)
    let tag = m[0]
    const src = extractAttribute(tag, 'src')
    if (looksLikeTrustedStockImageUrl(src) && !isLikelyLogoTag(tag)) {
      const healthy = await isImageUrlHealthy(src)
      if (!healthy) {
        const rep = fallbacks[fi % fallbacks.length]
        fi += 1
        tag = stripSrcsetFromTag(setImgSrcAttribute(tag, rep))
      }
    }
    out += tag
    lastIndex = m.index + m[0].length
  }
  out += html.slice(lastIndex)
  return out
}

export async function resolvePexelsImageHints(hintsInput = null) {
  const prompt = hintsInput?.prompt ?? ''
  const meta = {
    prompt,
    hydrationPrompt: hintsInput?.hydrationPrompt ?? prompt,
  }
  if (!PEXELS_API_KEY && !UNSPLASH_ACCESS_KEY) return { photos: [], videos: [], promptBlock: '', ...meta }
  const hasRichCtx =
    (hintsInput?.ctx &&
      (hintsInput.ctx.project_name ||
        hintsInput.ctx.tagline ||
        (hintsInput.ctx.entities && hintsInput.ctx.entities.length) ||
        (hintsInput.ctx.features && hintsInput.ctx.features.length))) ||
    (hintsInput?.siteSpec?.pages && hintsInput.siteSpec.pages.length > 0)

  const maxQueries = hasRichCtx ? MAX_REQUESTS_WITH_CTX : MAX_REQUESTS
  const queries = buildQueries({
    prompt,
    ctx: hintsInput?.ctx,
    siteSpec: hintsInput?.siteSpec,
    maxQueries,
  })
  if (!queries.length) return { photos: [], videos: [], promptBlock: '', ...meta }

  const subjectKey = subjectKeyFromPrompt(prompt)

  const videoQueries = queries.slice(0, MAX_VIDEO_QUERIES)
  const [results, videoLists] = await Promise.all([
    Promise.all(queries.map((query) => fetchPhotos(query, subjectKey))),
    PEXELS_API_KEY && videoQueries.length
      ? Promise.all(
          videoQueries.map((query) => fetchPexelsVideos(query, subjectKey, KEEP_VIDEOS_PER_QUERY)),
        )
      : Promise.resolve([]),
  ])
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
  const healthyPhotos = await validateAndRepairPhotoList(photos)
  const seenV = new Set()
  const videos = []
  for (const list of videoLists) {
    for (const item of list || []) {
      if (videos.length >= MAX_VIDEOS_TOTAL) break
      if (seenV.has(item.url)) continue
      seenV.add(item.url)
      videos.push(item)
    }
  }

  return {
    photos: healthyPhotos,
    videos,
    promptBlock: toMediaPromptBlock(healthyPhotos, videos),
    ...meta,
  }
}
