import type { ImgHTMLAttributes } from "react"

function normalizeAlt(alt: unknown): string {
  if (typeof alt === "string") return alt.trim() || "image"
  if (typeof alt === "number" || typeof alt === "boolean" || typeof alt === "bigint") return String(alt)
  if (alt && typeof alt === "object") {
    for (const key of ["alt", "label", "title", "name", "description"]) {
      const value = (alt as Record<string, unknown>)[key]
      if (typeof value === "string" && value.trim().length > 0) return value.trim()
    }
  }

  return "image"
}

function slugify(alt: unknown): string {
  return (
    normalizeAlt(alt)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "image"
  )
}

/** Legacy fallback — deterministic placeholder from alt text. */
export function picsum(alt: unknown, w = 800, h = 600): string {
  const seed = slugify(alt)
  return `https://picsum.photos/seed/${seed}/${w}/${h}`
}

/** Generate proxy URL for Pexels image. */
function getPexelsProxyUrl(alt: unknown, w: number, h: number): string {
  const seed = slugify(alt)
  return `/api/pexels?query=${encodeURIComponent(seed)}&w=${w}&h=${h}`
}

/** Drop-in replacement for `<img>` that resolves a relevant Pexels image from `alt` text.
 *  Uses server-side proxy for SSR compatibility. Pass an explicit `src` to use a pre-resolved URL verbatim
 *  (e.g. a photo already synced to Medusa), bypassing Pexels resolution entirely. */
export function Image({
  alt,
  src,
  w = 800,
  h = 600,
  className,
  loading,
  ...rest
}: {
  alt?: unknown
  src?: string
  w?: number
  h?: number
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "width" | "height">) {
  const normalizedAlt = normalizeAlt(alt)
  const explicitSrc = typeof src === "string" && src.trim() ? src : null
  if (explicitSrc) {
    return (
      <img
        src={explicitSrc}
        alt={normalizedAlt}
        width={w}
        height={h}
        className={className}
        loading={loading}
        {...rest}
      />
    )
  }

  const proxyUrl = getPexelsProxyUrl(alt, w, h)

  return (
    <img
      src={proxyUrl}
      alt={normalizedAlt}
      width={w}
      height={h}
      className={className}
      loading={loading}
      {...rest}
    />
  )
}
