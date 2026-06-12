import type { ImgHTMLAttributes } from "react"

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "of",
  "with",
  "and",
  "or",
  "in",
  "on",
  "at",
  "for",
  "to",
  "from",
  "by",
  "as",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "shall",
  "can",
  "need",
  "showing",
  "featuring",
  "during",
  "while",
  "against",
  "between",
  "into",
  "through",
  "across",
  "over",
  "under",
  "above",
  "below",
  "their",
  "they",
  "them",
  "his",
  "her",
  "its",
  "our",
  "your",
  "who",
  "which",
  "that",
  "this",
  "these",
  "those",
  "very",
  "really",
  "beautiful",
  "stunning",
  "elegant",
  "professional",
  "natural",
  "warm",
  "soft",
  "bright",
  "dark",
  "light",
  "small",
  "large",
  "high",
  "quality",
  "detail",
  "close",
  "up",
  "view",
  "scene",
  "image",
  "photo",
  "picture",
  "background",
])

const VISUAL_HINTS: Array<{ match: RegExp; query: string }> = [
  { match: /\bheadshot\b/, query: "professional headshot portrait" },
  { match: /\bportrait\b/, query: "portrait photography" },
  { match: /\bavatar\b/, query: "portrait person" },
  { match: /\blogo\b/, query: "logo brand" },
  { match: /\binterior\b/, query: "interior design" },
  { match: /\bexterior\b/, query: "architecture exterior" },
  { match: /\bfood\b|\bmeal\b|\bdish\b|\bcuisine\b/, query: "food photography" },
  { match: /\bproduct\b/, query: "product photography" },
  { match: /\bwedding\b/, query: "wedding photography" },
  { match: /\boffice\b|\bworkspace\b/, query: "modern office workspace" },
  { match: /\bbeach\b|\bocean\b|\bcoast\b/, query: "beach ocean" },
  { match: /\bcoffee\b|\bcafe\b/, query: "coffee shop cafe" },
  { match: /\bgym\b|\bfitness\b|\bworkout\b/, query: "fitness gym workout" },
  { match: /\bhospital\b|\bmedical\b|\bdental\b|\bclinic\b/, query: "medical clinic healthcare" },
  { match: /\breal\s*estate\b|\bproperty\b|\bapartment\b|\bhome\b/, query: "real estate home interior" },
]

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

function searchQueryFromAlt(alt: string): string {
  const trimmed = alt.trim()
  if (!trimmed) return "nature"

  const lower = trimmed.toLowerCase()
  const hint = VISUAL_HINTS.find((entry) => entry.match.test(lower))?.query
  const words = lower
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))

  const hintWords = new Set((hint ?? "").split(/\s+/).filter(Boolean))
  const uniqueWords = words.filter((word) => !hintWords.has(word))
  const core = uniqueWords.slice(0, 4).join(" ")

  if (hint && core) return `${hint} ${core}`.trim().slice(0, 96)
  if (hint) return hint
  if (core) return core.slice(0, 96)
  return "nature"
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
  const normalizedAlt = normalizeAlt(alt)
  const query = searchQueryFromAlt(normalizedAlt)
  return `/api/pexels?query=${encodeURIComponent(query)}&w=${w}&h=${h}&seed=${encodeURIComponent(normalizedAlt)}`
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
  const imageSrc = typeof src === "string" && src.trim() ? src : getPexelsProxyUrl(normalizedAlt, w, h)

  return (
    <img
      src={imageSrc}
      alt={normalizedAlt}
      width={w}
      height={h}
      className={className}
      loading={loading}
      {...rest}
    />
  )
}
