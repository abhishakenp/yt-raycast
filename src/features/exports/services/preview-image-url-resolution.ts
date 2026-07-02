import {
  generateContextAwareQuery,
  type ImageContext,
} from '../../../lib/image-context'
import {
  orientationFromSize,
  picsumUrl,
  searchQueryFromAlt,
  seedFromAlt,
} from '../../../lib/image-query'

type PexelsPhoto = {
  src?: {
    large?: string
    large2x?: string
    original?: string
    medium?: string
  }
}

type PexelsResponse = {
  photos?: PexelsPhoto[]
}

type UnsplashPhoto = {
  urls?: { raw?: string; full?: string; regular?: string; small?: string }
}

type UnsplashResponse = { results?: UnsplashPhoto[] }

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

const readServerEnv = (key: string): string =>
  typeof process !== 'undefined' ? (process.env?.[key]?.trim() ?? '') : ''

const readImageDimension = (
  value: string | null,
  fallback: number,
  min = 1,
): number => {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(parsed, min), 2400)
}

const choosePhotoUrl = (
  photo: PexelsPhoto | undefined,
  w: number,
  h: number,
): string | null => {
  if (!photo?.src) return null
  if (w > 1200 || h > 1200) {
    return (
      photo.src.original ??
      photo.src.large2x ??
      photo.src.large ??
      photo.src.medium ??
      null
    )
  }
  if (w > 800 || h > 800) {
    return (
      photo.src.large2x ??
      photo.src.large ??
      photo.src.original ??
      photo.src.medium ??
      null
    )
  }
  if (w > 400 || h > 400) {
    return (
      photo.src.large ??
      photo.src.large2x ??
      photo.src.medium ??
      photo.src.original ??
      null
    )
  }
  return (
    photo.src.medium ??
    photo.src.large ??
    photo.src.large2x ??
    photo.src.original ??
    null
  )
}

const resolvePexelsSearchQuery = (
  query: string,
  seed: string | null,
): string => {
  const trimmed = query.trim() || 'nature'
  if (seed?.trim()) return trimmed.slice(0, 96)
  return searchQueryFromAlt(trimmed)
}

const searchPexels = async (
  searchQuery: string,
  w: number,
  h: number,
  seed: string,
): Promise<string | null> => {
  const pexelsApiKey = readServerEnv('PEXELS_API_KEY')
  if (!pexelsApiKey) return null
  const pexelsUrl = new URL('https://api.pexels.com/v1/search')
  pexelsUrl.searchParams.set('query', searchQuery.slice(0, 96))
  pexelsUrl.searchParams.set('per_page', '15')
  pexelsUrl.searchParams.set('orientation', orientationFromSize(w, h))
  try {
    const response = await fetch(pexelsUrl, {
      headers: { Authorization: pexelsApiKey },
    })
    if (!response.ok) return null
    const data = (await response.json()) as PexelsResponse
    const photos = data.photos ?? []
    if (!photos.length) return null
    return choosePhotoUrl(photos[seedFromAlt(seed) % photos.length], w, h)
  } catch {
    return null
  }
}

const searchUnsplash = async (
  searchQuery: string,
  w: number,
  h: number,
  seed: string,
): Promise<string | null> => {
  const unsplashAccessKey = readServerEnv('UNSPLASH_ACCESS_KEY')
  if (!unsplashAccessKey) return null
  const unsplashUrl = new URL('https://api.unsplash.com/search/photos')
  unsplashUrl.searchParams.set('query', searchQuery.slice(0, 96))
  unsplashUrl.searchParams.set('per_page', '15')
  unsplashUrl.searchParams.set('orientation', orientationFromSize(w, h))
  try {
    const response = await fetch(unsplashUrl, {
      headers: { Authorization: `Client-ID ${unsplashAccessKey}` },
    })
    if (!response.ok) return null
    const data = (await response.json()) as UnsplashResponse
    const results = data.results ?? []
    if (!results.length) return null
    const photo = results[seedFromAlt(seed) % results.length]
    const base =
      photo?.urls?.regular ??
      photo?.urls?.small ??
      photo?.urls?.full ??
      photo?.urls?.raw
    if (!base) return null
    const targetW = Math.min(Math.max(w, 400), 2400)
    const targetH = Math.min(Math.max(h, 300), 1600)
    return `${base}&w=${targetW}&h=${targetH}&fit=crop`
  } catch {
    return null
  }
}

const resolvePexelsPreviewUrl = async (parsed: URL): Promise<string> => {
  const query =
    parsed.searchParams.get('query') ?? parsed.searchParams.get('q') ?? ''
  const seed = parsed.searchParams.get('seed')
  const width = readImageDimension(parsed.searchParams.get('w'), 800, 100)
  const height = readImageDimension(parsed.searchParams.get('h'), 600, 100)
  const context: ImageContext = {
    section: parsed.searchParams.get('section') || undefined,
    siteType:
      (parsed.searchParams.get('siteType') as ImageContext['siteType']) ||
      undefined,
    prompt: parsed.searchParams.get('prompt') || undefined,
    brandContext: parsed.searchParams.get('brandContext') || undefined,
  }
  const rawQuery = query.trim() || 'nature'
  const searchQuery =
    context.section ||
    context.siteType ||
    context.prompt ||
    context.brandContext
      ? generateContextAwareQuery(rawQuery, context)
      : resolvePexelsSearchQuery(rawQuery, seed)
  const seedKey = seed ?? searchQuery

  return (
    (await searchPexels(searchQuery, width, height, seedKey)) ??
    (await searchUnsplash(searchQuery, width, height, seedKey)) ??
    picsumUrl(seed || searchQuery, width, height)
  )
}

export const resolvePreviewImageUrl = async (
  value: string,
  fallbackAlt?: string,
): Promise<string | null> => {
  let parsed: URL
  try {
    parsed = new URL(value, 'https://ship-fast.local')
  } catch {
    return null
  }

  if (parsed.pathname === '/api/pexels') {
    return await resolvePexelsPreviewUrl(parsed)
  }

  const isFallbackImageApi =
    parsed.pathname === '/api/images' || parsed.pathname === '/api/image'
  if (!isFallbackImageApi) return null

  const query =
    parsed.searchParams.get('query') ??
    parsed.searchParams.get('alt') ??
    parsed.searchParams.get('seed') ??
    fallbackAlt ??
    'generated image'
  const width = readImageDimension(parsed.searchParams.get('w'), 800)
  const height = readImageDimension(parsed.searchParams.get('h'), 600)
  return picsumUrl(
    parsed.searchParams.get('seed') ?? fallbackAlt ?? query,
    width,
    height,
  )
}

const replaceAsync = async (
  value: string,
  pattern: RegExp,
  replacer: (...args: string[]) => Promise<string>,
): Promise<string> => {
  const replacements = await Promise.all(
    Array.from(value.matchAll(pattern), (match) => replacer(...match)),
  )
  let index = 0
  return value.replace(pattern, () => replacements[index++] ?? '')
}

export const rewritePreviewImageUrls = async (
  html: string,
): Promise<string> => {
  const withAttributes = await replaceAsync(
    html,
    /(\s(?:src|poster)\s*=\s*)(["'])([^"']+)\2/gi,
    async (match: string, prefix: string, quote: string, value: string) => {
      const rewritten = await resolvePreviewImageUrl(decodeHtmlEntities(value))
      return rewritten ? `${prefix}${quote}${rewritten}${quote}` : match
    },
  )

  return await replaceAsync(
    withAttributes,
    /url\((["']?)([^"')]+)\1\)/gi,
    async (match: string, quote: string, value: string) => {
      const rewritten = await resolvePreviewImageUrl(decodeHtmlEntities(value))
      return rewritten ? `url(${quote}${rewritten}${quote})` : match
    },
  )
}
