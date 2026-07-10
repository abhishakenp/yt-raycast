/**
 * Codec for multi-image inline-edit payloads.
 *
 * When the user multi-selects images in the inline-edit image panel, the
 * whole selection is persisted in a single image edit record's `afterText`
 * (alt → payload) so it flows through the existing edit/override pipeline
 * unchanged. The payload is a JSON string array — a real image URL can never
 * start with "[", so decode is unambiguous against legacy single-URL edits.
 *
 * Consumers:
 * - `Image` (img.tsx) decodes an override into a slide list and renders a
 *   carousel when it holds 2+ URLs.
 * - `applyImageSwap` (src/lib/edit-helpers.ts) patches static HTML with the
 *   FIRST url so preview.html / exports degrade to a single image gracefully.
 */

export const encodeMultiImageSrc = (urls: string[]): string =>
  JSON.stringify(urls)

/** Parse a multi-image payload. Returns the URL list, or null when the value
 *  is not a payload (plain single URL, empty, or malformed JSON). */
export const decodeMultiImageSrc = (
  value: string | null | undefined,
): string[] | null => {
  const trimmed = value?.trim()
  if (!trimmed || !trimmed.startsWith('[')) return null
  try {
    const parsed = JSON.parse(trimmed) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    const urls = parsed.filter(
      (url): url is string => typeof url === 'string' && url.trim().length > 0,
    )
    return urls.length === parsed.length ? urls : null
  } catch {
    return null
  }
}

/** Resolve the representative single URL from a value that may be either a
 *  plain URL or a multi-image payload. */
export const firstImageSrc = (value: string): string =>
  decodeMultiImageSrc(value)?.[0] ?? value
