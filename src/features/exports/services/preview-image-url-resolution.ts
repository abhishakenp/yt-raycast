import { resolvePexelsPreviewImageUrl } from '../../images/server/pexels-preview-image'
import { picsumUrl } from '../../../lib/image-query'

export type PreviewImageUrlResolutionOptions = {
  fallbackAlt?: string
  overrideGeneratedSrc?: string
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

export type PreviewImageSourceReference = {
  alt: string
  originalSrc: string
  originalSrcKey: string
}

function readHtmlAttribute(tag: string, name: string): string | null {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const quoted = tag.match(
    new RegExp(`${escaped}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'),
  )
  if (quoted?.[2]) return decodeHtmlEntities(quoted[2].trim())

  const unquoted = tag.match(new RegExp(`${escaped}\\s*=\\s*([^\\s>]+)`, 'i'))
  return unquoted?.[1] ? decodeHtmlEntities(unquoted[1].trim()) : null
}

function isPreviewImageSourceValue(src: string): boolean {
  return (
    /^(https?:)?\/\//i.test(src) ||
    src.startsWith('/') ||
    src.startsWith('data:image/')
  )
}

export function previewImageSourceKey(src: string): string {
  return encodeURIComponent(src.trim())
}

export function extractPreviewImageSourceReferences(
  html: string | undefined,
): PreviewImageSourceReference[] {
  if (!html) return []
  const sources: PreviewImageSourceReference[] = []
  const seen = new Set<string>()
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0]
    const alt = readHtmlAttribute(tag, 'alt')
    const src = readHtmlAttribute(tag, 'src')
    if (!alt || !src || !isPreviewImageSourceValue(src)) continue
    const key = `${alt}\u0000${src}`
    if (seen.has(key)) continue
    seen.add(key)
    sources.push({
      alt,
      originalSrc: src,
      originalSrcKey: previewImageSourceKey(src),
    })
  }
  return sources
}

function readServerEnv(...keys: string[]): string {
  if (typeof process === 'undefined') return ''
  for (const key of keys) {
    const value = process.env?.[key]?.trim()
    if (value) return value
  }
  return ''
}

function readAppBaseUrl(): string {
  const raw = readServerEnv(
    'APP_BASE_URL',
    'SHIP_FAST_BASE_URL',
    'NEXT_PUBLIC_SITE_URL',
    'VITE_APP_BASE_URL',
    'VITE_PUBLIC_APP_URL',
    'SITE_URL',
  )
  if (raw) return raw
  const vercelUrl = readServerEnv('VERCEL_URL')
  return vercelUrl ? `https://${vercelUrl}` : ''
}

function readImageDimension(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(parsed, 1), 2400)
}

function readRedirectLocation(
  response: Response,
  requestUrl: URL,
): string | null {
  const location =
    response.headers.get('Location') ?? response.headers.get('location')
  if (location) {
    try {
      return new URL(location, requestUrl).toString()
    } catch {
      return null
    }
  }
  if (response.url && response.url !== requestUrl.toString()) {
    try {
      return new URL(response.url).toString()
    } catch {
      return null
    }
  }
  return null
}

async function resolveViaPreviewImageRoute(
  parsed: URL,
): Promise<string | null> {
  const appBaseUrl = readAppBaseUrl()
  if (!appBaseUrl) return null

  let requestUrl: URL
  try {
    requestUrl = new URL(`${parsed.pathname}${parsed.search}`, appBaseUrl)
  } catch {
    return null
  }

  try {
    const response = await fetch(requestUrl, { redirect: 'manual' })
    const location = readRedirectLocation(response, requestUrl)
    if (!location) return null
    const resolved = new URL(location)
    if (
      resolved.pathname === parsed.pathname &&
      resolved.search === parsed.search
    ) {
      return null
    }
    return resolved.toString()
  } catch {
    return null
  }
}

async function resolvePexelsPreviewUrl(parsed: URL): Promise<string> {
  const routedImageUrl = await resolveViaPreviewImageRoute(parsed)
  if (routedImageUrl) return routedImageUrl

  return await resolvePexelsPreviewImageUrl(parsed)
}

export async function resolvePreviewImageUrl(
  value: string,
  options: string | PreviewImageUrlResolutionOptions = {},
): Promise<string | null> {
  const normalizedOptions =
    typeof options === 'string' ? { fallbackAlt: options } : options
  const sourceValue = normalizedOptions.overrideGeneratedSrc ?? value
  let parsed: URL
  try {
    parsed = new URL(sourceValue, 'https://ship-fast.local')
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
    normalizedOptions.fallbackAlt ??
    'generated image'
  const width = readImageDimension(parsed.searchParams.get('w'), 800)
  const height = readImageDimension(parsed.searchParams.get('h'), 600)
  return picsumUrl(
    parsed.searchParams.get('seed') ?? normalizedOptions.fallbackAlt ?? query,
    width,
    height,
  )
}

async function replaceAsync(
  value: string,
  pattern: RegExp,
  replacer: (...args: string[]) => Promise<string>,
): Promise<string> {
  const replacements = await Promise.all(
    Array.from(value.matchAll(pattern), (match) => replacer(...match)),
  )
  let index = 0
  return value.replace(pattern, () => replacements[index++] ?? '')
}

export async function rewritePreviewImageUrls(html: string): Promise<string> {
  const withAttributes = await replaceAsync(
    html,
    /(\s(?:src|poster|href)\s*=\s*)(["'])([^"']+)\2/gi,
    async (match, prefix, quote, value) => {
      const rewritten = await resolvePreviewImageUrl(decodeHtmlEntities(value))
      return rewritten ? `${prefix}${quote}${rewritten}${quote}` : match
    },
  )

  const withCssUrls = await replaceAsync(
    withAttributes,
    /url\((["']?)([^"')]+)\1\)/gi,
    async (match: string, quote: string, value: string) => {
      const rewritten = await resolvePreviewImageUrl(decodeHtmlEntities(value))
      return rewritten ? `url(${quote}${rewritten}${quote})` : match
    },
  )

  // Strip loading-placeholder classes (animate-pulse, bg-accent) from <img>
  // tags. These are added at runtime by the ImgElement wrapper to show a
  // pulsing skeleton until the image loads. In exported/deployed artifacts
  // the images resolve immediately, so the placeholder classes must be
  // removed to avoid a permanent pulse animation.
  return withCssUrls.replace(
    /(<img\b[^>]*\sclass\s*=\s*)(["'])([^"']*)\2/gi,
    (_match: string, prefix: string, quote: string, classValue: string) => {
      const cleaned = classValue
        .split(/\s+/)
        .filter((cls: string) => cls !== 'animate-pulse' && cls !== 'bg-accent')
        .join(' ')
        .trim()
      return `${prefix}${quote}${cleaned}${quote}`
    },
  )
}
