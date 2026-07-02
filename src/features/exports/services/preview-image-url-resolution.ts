import { resolveStockImage } from '../../../lib/stock-image'

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

const readImageDimension = (value: string | null, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0
    ? Math.min(parsed, 2400)
    : fallback
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

  const isPreviewImageApi =
    parsed.pathname === '/api/pexels' ||
    parsed.pathname === '/api/images' ||
    parsed.pathname === '/api/image'
  if (!isPreviewImageApi) return null

  const query =
    parsed.searchParams.get('query') ??
    parsed.searchParams.get('alt') ??
    parsed.searchParams.get('seed') ??
    fallbackAlt ??
    'generated image'
  const width = readImageDimension(parsed.searchParams.get('w'), 800)
  const height = readImageDimension(parsed.searchParams.get('h'), 600)
  const resolved = await resolveStockImage({
    alt: parsed.searchParams.get('seed') ?? fallbackAlt ?? query,
    query,
    w: width,
    h: height,
  })

  return resolved.imageUrl
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
