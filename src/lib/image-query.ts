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

export const slugifyAlt = (alt: string | undefined): string =>
  (alt ?? "image")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "image"

export const seedFromAlt = (alt: string): number => {
  let hash = 0
  for (let i = 0; i < alt.length; i++) {
    hash = (hash * 31 + alt.charCodeAt(i)) >>> 0
  }
  return hash
}

/** Turn descriptive alt text into a short stock-photo search query. */
export const searchQueryFromAlt = (alt: string): string => {
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

export const picsumUrl = (alt: string | undefined, w = 800, h = 600): string =>
  `https://picsum.photos/seed/${slugifyAlt(alt)}/${w}/${h}`

export const orientationFromSize = (
  w: number,
  h: number,
): "landscape" | "portrait" | "square" => {
  const ratio = w / h
  if (ratio > 1.15) return "landscape"
  if (ratio < 0.87) return "portrait"
  return "square"
}
