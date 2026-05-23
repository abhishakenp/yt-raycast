/** Context-aware stock photo hydration for blog/publication homepages. */

const PEXELS_API_URL = 'https://api.pexels.com/v1/search'
const REQUEST_TIMEOUT_MS = 4500

const STATIC_QUERY_POOLS = {
  'dog leash training': [1805164, 5732433, 7516465],
  'dog training commands': [1805164, 5732433, 4588435],
  'dog breed portrait': [825947, 2253275, 1108099],
  'dog rescue adoption': [4587995, 7516465, 6795740],
  'dog harness gear': [4588435, 4587995, 1851164],
  'dog behavior body language': [1851164, 5732433, 1108099],
  'dog grooming care': [1108099, 4588435, 825947],
  'dog walking park': [1805164, 2253275, 6795740],
  'dog puppy cute': [1108099, 825947, 4587995],
  'cat portrait indoor': [1170986, 1048275, 2071872],
  'cat kitten playful': [1048275, 1170986, 2071872],
  'journalism city hall': [1181395, 268533, 159751],
  'civic infrastructure policy': [159751, 1181395, 3760067],
  'technology policy editorial': [3861969, 1181677, 159751],
  'newsletter editorial desk': [7688336, 159751, 1181395],
  'magazine editorial spread': [1152077, 1446292, 1628239],
  'writer laptop coffee': [7688336, 159751, 1181395],
}

const GENERIC_EDITORIAL_IDS = [1152077, 1034812, 1446292, 1628239, 1670770, 1755386]

const queryPhotoCache = new Map()

function formatPexelsUrl(id, width = 800, height = 600) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}&h=${height}&fit=crop`
}

function escapeAttr(value = '') {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function plainText(value = '') {
  return String(value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractArticleContext(block, brief = '') {
  const title =
    block.match(/<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/i)?.[1]?.replace(/<[^>]+>/g, ' ').trim() ||
    block.match(/\balt=["']([^"']+)["']/i)?.[1] ||
    ''
  const category =
    block.match(/<span[^>]*class="[^"]*(?:uppercase|chip|pill)[^"]*"[^>]*>([\s\S]*?)<\/span>/i)?.[1]?.replace(/<[^>]+>/g, ' ').trim() ||
    block.match(/\b(?:category|topic):\s*([^<\n]+)/i)?.[1]?.trim() ||
    ''
  const alt = block.match(/<img\b[^>]*\balt=["']([^"']*)["']/i)?.[1] || title
  return { title, category, alt, text: plainText(block), brief }
}

function extractFeaturedContext(html, brief = '') {
  const featured =
    html.match(/<section\b[^>]*\bid=["']featured["'][\s\S]*?<\/section>/i)?.[0] ||
    html.match(/<section\b[^>]*\bid=["']masthead["'][\s\S]*?<\/section>/i)?.[0] ||
    ''
  if (!featured) return { title: '', category: 'Featured', alt: 'featured cover', text: '', brief }
  return extractArticleContext(featured, brief)
}

export function buildPhotoQuery(context, brief = '') {
  const title = String(context?.title || context?.alt || '').toLowerCase()
  const category = String(context?.category || '').toLowerCase()
  const briefLower = String(brief || context?.brief || '').toLowerCase()
  const haystack = `${title} ${category} ${context?.text || ''}`.toLowerCase()

  if (/\b(dog|dogs|puppy|puppies|pup|canine|retriever|beagle|husky|terrier|bulldog)\b/.test(`${briefLower} ${haystack}`)) {
    if (/leash|train|command|walk|pull|heel|sit|stay/.test(haystack)) return 'dog leash training'
    if (/breed|retriever|beagle|husky|poodle|apartment|collie|shepherd/.test(haystack)) return 'dog breed portrait'
    if (/adopt|rescue|shelter|checklist|handoff|decompression/.test(haystack)) return 'dog rescue adoption'
    if (/harness|gear|jacket|review|product|groom|brush|dental|kit/.test(haystack)) return 'dog harness gear'
    if (/tail|body language|bark|behavior|whale eye|stress/.test(haystack)) return 'dog behavior body language'
    if (/groom|shed|coat|nutrition|health|dental/.test(haystack)) return 'dog grooming care'
    if (/puppy|cute|small dog/.test(haystack)) return 'dog puppy cute'
    return 'dog walking park'
  }

  if (/\b(cat|cats|kitten|kittens|feline)\b/.test(`${briefLower} ${haystack}`)) {
    if (/kitten|play|toy/.test(haystack)) return 'cat kitten playful'
    return 'cat portrait indoor'
  }

  if (/\b(policy|civic|infrastructure|journalism|government|legislat|public sector)\b/.test(briefLower)) {
    if (/transit|transport|bridge|road|grid|utility|broadband/.test(haystack)) return 'civic infrastructure policy'
    if (/tech|digital|privacy|ai|software|platform/.test(haystack)) return 'technology policy editorial'
    if (/newsletter|subscribe|dispatch|reader/.test(haystack)) return 'newsletter editorial desk'
    return 'journalism city hall'
  }

  if (/\b(newsletter|journal|magazine|editorial|publication|essay|reporting)\b/.test(briefLower)) {
    if (/writer|author|desk|coffee|notebook/.test(haystack)) return 'writer laptop coffee'
    return 'magazine editorial spread'
  }

  const topicWords = `${category} ${title}`
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !/^(with|from|that|this|your|what|when|should|guide|tips|blog|post|story|article|cover|photo|image)$/.test(word))
    .slice(0, 4)
    .join(' ')

  if (topicWords.length >= 4) return `${topicWords} editorial photo`
  if (category) return `${category.toLowerCase()} editorial photo`
  return 'magazine editorial spread'
}

function staticPhotoForQuery(query, slot = 0) {
  const pool = STATIC_QUERY_POOLS[query] || GENERIC_EDITORIAL_IDS
  const id = pool[slot % pool.length]
  return { url: formatPexelsUrl(id), alt: query, query, id }
}

async function fetchPexelsPhoto(query, slot = 0) {
  const cacheKey = `${query}:${slot}`
  if (queryPhotoCache.has(cacheKey)) return queryPhotoCache.get(cacheKey)

  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) {
    const photo = staticPhotoForQuery(query, slot)
    queryPhotoCache.set(cacheKey, photo)
    return photo
  }

  const url = new URL(PEXELS_API_URL)
  url.searchParams.set('query', query)
  url.searchParams.set('per_page', '8')
  url.searchParams.set('orientation', 'landscape')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      headers: { Authorization: apiKey },
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`pexels ${res.status}`)
    const payload = await res.json()
    const photos = payload?.photos || []
    const pick = photos[slot % photos.length] || photos[0]
    if (!pick?.id) throw new Error('no photos')
    const photo = {
      url: formatPexelsUrl(pick.id),
      alt: typeof pick.alt === 'string' && pick.alt.trim() ? pick.alt.trim() : query,
      query,
      id: pick.id,
    }
    queryPhotoCache.set(cacheKey, photo)
    return photo
  } catch {
    const photo = staticPhotoForQuery(query, slot)
    queryPhotoCache.set(cacheKey, photo)
    return photo
  } finally {
    clearTimeout(timer)
  }
}

function imgTag(photo, className = 'w-full h-48 object-cover rounded-md', alt = '') {
  const safeAlt = escapeAttr(alt || photo.alt || photo.query || 'article cover')
  return `<img class="${escapeAttr(className)}" src="${photo.url}" alt="${safeAlt}" loading="lazy" decoding="async" />`
}

function replaceFirstImage(block, photo, alt) {
  const thumb = imgTag(photo, block.match(/<img\b[^>]*\bclass=["']([^"']*)["']/i)?.[1] || 'w-full h-48 object-cover rounded-md', alt)
  if (/<img\b/i.test(block)) return block.replace(/<img\b[^>]*>/i, thumb)
  if (/<div\b[^>]*\bdata-visual=["']art-surface["'][^>]*>[\s\S]*?<\/div>/i.test(block)) {
    return block.replace(/<div\b[^>]*\bdata-visual=["']art-surface["'][^>]*>[\s\S]*?<\/div>/i, thumb)
  }
  if (/<div\b[^>]*\bdata-img=[^>]*>[\s\S]*?<\/div>/i.test(block)) {
    return block.replace(/<div\b[^>]*\bdata-img=[^>]*>[\s\S]*?<\/div>/i, thumb)
  }
  if (/<div\b[^>]*\bclass=["'][^"']*\bimg\b[^"']*["'][^>]*>\s*<\/div>/i.test(block)) {
    return block.replace(/<div\b[^>]*\bclass=["'][^"']*\bimg\b[^"']*["'][^>]*>\s*<\/div>/i, thumb)
  }
  return block.replace(/(<article[^>]*>)/i, `$1\n${thumb}`)
}

function isEmptyThumbnailBlock(tag) {
  if (/<img\b[^>]*\bsrc=["']https?:\/\//i.test(tag)) return false
  if (/\bbackground-image:\s*url\(/i.test(tag)) return false
  if (/\bdata-visual=["']art-surface["']/i.test(tag) && !/\bopacity-\[0\.04\]|data-lucide|mix-blend/i.test(tag)) return true
  if (/\bdata-img=/i.test(tag) && !/<img\b/i.test(tag)) return true
  if (/\bclass="[^"]*\bimg\b[^"]*"/i.test(tag) && !/<img\b/i.test(tag)) return true
  return false
}

async function hydratePublicationImagesInternal(html, brief = '', { useApi = false } = {}) {
  const source = String(html ?? '')
  if (!source) return source
  const briefText = String(brief ?? '')
  let slot = 0
  let out = source

  const resolvePhoto = async (context) => {
    const query = buildPhotoQuery(context, briefText)
    const photo = useApi ? await fetchPexelsPhoto(query, slot) : staticPhotoForQuery(query, slot)
    slot += 1
    return { ...photo, query, alt: context.title || context.alt || photo.alt }
  }

  const featuredMatch = out.match(/<section\b[^>]*\bid=["']featured["'][\s\S]*?<\/section>/i)
  if (featuredMatch) {
    const block = featuredMatch[0]
    const context = extractArticleContext(block, briefText)
    const photo = await resolvePhoto({ ...context, category: 'Featured' })
    out = out.replace(block, replaceFirstImage(block, photo, context.title || 'Featured post'))
  }

  const articleMatches = [...out.matchAll(/<article\b[\s\S]*?<\/article>/gi)]
  for (const match of articleMatches) {
    const block = match[0]
    const context = extractArticleContext(block, briefText)
    const photo = await resolvePhoto(context)
    out = out.replace(block, replaceFirstImage(block, photo, context.title || context.alt))
  }

  const dataImgMatches = [...out.matchAll(/<div\b([^>]*\bdata-img=["']([^"']*)["'][^>]*)>\s*(?:<!--[\s\S]*?-->)?\s*<\/div>/gi)]
  for (const match of dataImgMatches) {
    const full = match[0]
    if (!isEmptyThumbnailBlock(full)) continue
    const attrs = match[1]
    const subject = match[2]
    const photo = await resolvePhoto({ title: subject, category: '', alt: subject, text: subject, brief: briefText })
    const cls = attrs.match(/\bclass=["']([^"']*)["']/i)?.[1] || 'w-full aspect-[4/3] object-cover rounded-xl'
    out = out.replace(full, imgTag(photo, cls, subject))
  }

  const emptyDivMatches = [...out.matchAll(/<div\s+class="([^"]*\bimg\b[^"]*)"[^>]*>\s*<\/div>/gi)]
  for (const match of emptyDivMatches) {
    const full = match[0]
    const cls = match[1]
    const photo = await resolvePhoto({ title: 'article cover', category: '', alt: 'cover photo', text: '', brief: briefText })
    out = out.replace(full, imgTag(photo, cls, 'cover photo'))
  }

  out = out.replace(/<img\b([^>]*?)\bsrc=["']https?:\/\/(?!images\.pexels\.com)[^"']+["']([^>]*)>/gi, (full) => {
    const cls = full.match(/\bclass=["']([^"']*)["']/i)?.[1] || 'w-full h-48 object-cover rounded-md'
    const subject = full.match(/\balt=["']([^"']*)["']/i)?.[1] || 'editorial cover'
    const query = buildPhotoQuery({ title: subject, category: '', alt: subject, text: subject, brief: briefText }, briefText)
    const photo = staticPhotoForQuery(query, slot++)
    return imgTag(photo, cls, subject)
  })

  return out
}

/** Sync hydration — topic-mapped static pools (no API). */
export function hydratePublicationImages(html, brief = '') {
  const source = String(html ?? '')
  if (!source) return source
  const briefText = String(brief ?? '')
  let slot = 0
  let out = source

  const assignPhoto = (block, context) => {
    const query = buildPhotoQuery(context, briefText)
    const photo = staticPhotoForQuery(query, slot++)
    return replaceFirstImage(block, photo, context.title || context.alt || query)
  }

  const featuredMatch = out.match(/<section\b[^>]*\bid=["']featured["'][\s\S]*?<\/section>/i)
  if (featuredMatch) {
    const block = featuredMatch[0]
    const context = extractArticleContext(block, briefText)
    out = out.replace(block, assignPhoto(block, { ...context, category: 'Featured' }))
  }

  out = out.replace(/<article\b[\s\S]*?<\/article>/gi, (block) => {
    const context = extractArticleContext(block, briefText)
    return assignPhoto(block, context)
  })

  out = out.replace(/<div\s+class="([^"]*\bimg\b[^"]*)"[^>]*>\s*<\/div>/gi, (full, cls) => {
    const query = buildPhotoQuery({ title: 'article cover', category: '', alt: 'cover photo', brief: briefText }, briefText)
    const photo = staticPhotoForQuery(query, slot++)
    return imgTag(photo, cls, 'cover photo')
  })

  out = out.replace(
    /<div\b([^>]*\bdata-img=["']([^"']*)["'][^>]*)>\s*(?:<!--[\s\S]*?-->)?\s*<\/div>/gi,
    (full, attrs, subject) => {
      if (!isEmptyThumbnailBlock(full)) return full
      const query = buildPhotoQuery({ title: subject, category: '', alt: subject, brief: briefText }, briefText)
      const photo = staticPhotoForQuery(query, slot++)
      const cls = attrs.match(/\bclass=["']([^"']*)["']/i)?.[1] || 'w-full aspect-[4/3] object-cover rounded-xl'
      return imgTag(photo, cls, subject)
    },
  )

  out = out.replace(/<img\b([^>]*?)\bsrc=["']https?:\/\/(?!images\.pexels\.com)[^"']+["']([^>]*)>/gi, (full) => {
    const cls = full.match(/\bclass=["']([^"']*)["']/i)?.[1] || 'w-full h-48 object-cover rounded-md'
    const subject = full.match(/\balt=["']([^"']*)["']/i)?.[1] || 'editorial cover'
    const query = buildPhotoQuery({ title: subject, category: '', alt: subject, brief: briefText }, briefText)
    const photo = staticPhotoForQuery(query, slot++)
    return imgTag(photo, cls, subject)
  })

  return out
}

/** Async hydration — Pexels search per article when API key is set. */
export async function hydratePublicationImagesAsync(html, brief = '') {
  return hydratePublicationImagesInternal(html, brief, { useApi: Boolean(process.env.PEXELS_API_KEY) })
}

export function publicationPhotoForQuery(query, slot = 0) {
  return staticPhotoForQuery(query, slot)
}

export function countPublicationPhotos(html) {
  return (String(html ?? '').match(/<img\b[^>]*\bsrc=["']https:\/\/images\.pexels\.com/gi) || []).length
}
