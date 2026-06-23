import type { CapturedPage, ExtractedTokens } from "./types.ts"

// Extract palette/fonts/radius/spacing from computed styles → synthesized theme token set

// Clamp a number into the 0..255 byte range.
function clampByte(n: number): number {
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(255, Math.round(n)))
}

// Compose an #rrggbb string from three channels.
function channelsToHex(r: number, g: number, b: number): string {
  const h = (n: number) => clampByte(n).toString(16).padStart(2, "0")
  return `#${h(r)}${h(g)}${h(b)}`
}

// hsl() → rgb channels. h in degrees, s/l in 0..1.
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255]
}

// A small set of CSS named colors commonly returned by getComputedStyle when a
// site uses keyword colors. getComputedStyle normally resolves to rgb(), but
// some properties (e.g. inherited keywords) can surface a bare name; map the
// common ones to #rrggbb so the token value is always a valid hex.
const NAMED_COLORS: Record<string, string> = {
  transparent: "#00000000",
  white: "#ffffff",
  black: "#000000",
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  gray: "#808080",
  grey: "#808080",
  silver: "#c0c0c0",
  yellow: "#ffff00",
  orange: "#ffa500",
  purple: "#800080",
  navy: "#000080",
  teal: "#008080",
  cyan: "#00ffff",
  magenta: "#ff00ff",
  maroon: "#800000",
  olive: "#808000",
  lime: "#00ff00",
  aqua: "#00ffff",
  fuchsia: "#ff00ff",
  pink: "#ffc0cb",
  brown: "#a52a2a",
  gold: "#ffd700",
  indigo: "#4b0082",
  violet: "#ee82ee",
  currentcolor: "#000000",
}

// Normalize a CSS color string to #rrggbb. Handles rgb(), rgba(), hsl(),
// hsla(), CSS named colors and existing #hex / #rgb shorthand. Returns the
// input unchanged if it cannot be parsed (caller decides what to do with
// non-color values).
function rgbToHex(input: string): string {
  const value = (input || "").trim()
  if (!value) return value

  // CSS named color keyword (white/black/transparent/...) -> #rrggbb.
  const named = NAMED_COLORS[value.toLowerCase()]
  if (named) return named

  // Already a hex color: normalize #rgb shorthand to #rrggbb, keep #rrggbb.
  const hexMatch = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hexMatch) {
    const h = hexMatch[1]
    if (h.length === 3) {
      return `#${h.split("").map((c) => c + c).join("")}`.toLowerCase()
    }
    return `#${h}`.toLowerCase()
  }

  // rgb()/rgba() — alpha is ignored for the hex token.
  const rgbMatch = value.match(
    /^rgba?\(\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*(?:[,/]\s*[\d.%]+\s*)?\)$/i,
  )
  if (rgbMatch) {
    return channelsToHex(
      parseFloat(rgbMatch[1]),
      parseFloat(rgbMatch[2]),
      parseFloat(rgbMatch[3]),
    )
  }

  // hsl()/hsla() — alpha is ignored for the hex token.
  const hslMatch = value.match(
    /^hsla?\(\s*(\d+(?:\.\d+)?)\s*(?:deg)?\s*[, ]\s*(\d+(?:\.\d+)?)%\s*[, ]\s*(\d+(?:\.\d+)?)%\s*(?:[,/]\s*[\d.%]+\s*)?\)$/i,
  )
  if (hslMatch) {
    const [r, g, b] = hslToRgb(
      parseFloat(hslMatch[1]),
      parseFloat(hslMatch[2]) / 100,
      parseFloat(hslMatch[3]) / 100,
    )
    return channelsToHex(r, g, b)
  }

  return value
}

// Extract dominant color from computed styles. `fallback` is returned when no
// property yields a usable (non-transparent) color — callers pick a sensible
// neutral so an unset/transparent surface never collapses to pure black.
function extractColor(
  styles: Record<string, string>,
  properties: string[],
  fallback = "#000000",
): string {
  for (const prop of properties) {
    const value = styles[prop]?.trim() || ""
    if (value && value !== "rgba(0, 0, 0, 0)" && value !== "transparent") {
      return rgbToHex(value)
    }
  }
  return fallback
}

// Parse #rrggbb to channels; returns null for non-hex.
function hexChannels(hex: string): [number, number, number] | null {
  const m = (hex || "").match(/^#([0-9a-f]{6})$/i)
  if (!m) return null
  return [
    parseInt(m[1].slice(0, 2), 16),
    parseInt(m[1].slice(2, 4), 16),
    parseInt(m[1].slice(4, 6), 16),
  ]
}

// Relative luminance 0..1 (perceptual-ish, sRGB weighted).
function luminance(hex: string): number {
  const c = hexChannels(hex)
  if (!c) return 0.5
  return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255
}

// Chroma 0..255 — how far a color is from gray. Near-0 means neutral.
function chroma(hex: string): number {
  const c = hexChannels(hex)
  if (!c) return 0
  return Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2])
}

// Linearly blend two hex colors. t=0 -> a, t=1 -> b. Used to derive tonal
// surfaces (card/muted/border) from the base palette on any site.
function mix(a: string, b: string, t: number): string {
  const ca = hexChannels(a) || [255, 255, 255]
  const cb = hexChannels(b) || [0, 0, 0]
  const k = Math.max(0, Math.min(1, t))
  return channelsToHex(
    ca[0] + (cb[0] - ca[0]) * k,
    ca[1] + (cb[1] - ca[1]) * k,
    ca[2] + (cb[2] - ca[2]) * k,
  )
}

// Are two hex colors visually distinct (channel distance threshold)?
function distinct(a: string, b: string, min = 24): boolean {
  const ca = hexChannels(a)
  const cb = hexChannels(b)
  if (!ca || !cb) return a.toLowerCase() !== b.toLowerCase()
  return Math.abs(ca[0] - cb[0]) + Math.abs(ca[1] - cb[1]) + Math.abs(ca[2] - cb[2]) >= min
}

// Generic CSS font keywords carry no brand identity; a real per-site typeface is a
// *named* family. Reject the keywords so font extraction prefers a concrete face.
const GENERIC_FONT_KEYWORDS = new Set([
  "sans-serif",
  "serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-sans-serif",
  "ui-serif",
  "ui-monospace",
  "ui-rounded",
  "inherit",
  "initial",
  "unset",
])

// First family token of a font stack, unquoted/lowercased. "" if generic/empty so
// callers can tell "no concrete face" from a real typeface name.
function firstConcreteFamily(stack: string): string {
  const first = (stack || "").split(",")[0]?.trim().replace(/^["']|["']$/g, "") || ""
  if (!first) return ""
  if (GENERIC_FONT_KEYWORDS.has(first.toLowerCase())) return ""
  return first
}

// Heuristic: does a font stack read as a serif/display family? Drives the heading
// typeface so cloned pages keep the original's serif vs sans character on content
// bands instead of defaulting every heading to one hardcoded serif. Structural —
// keyed on the stack's generic fallback + common serif name tokens, never a site.
export function looksSerif(stack: string): boolean {
  const s = (stack || "").toLowerCase()
  if (/\b(sans-serif|monospace|system-ui|ui-sans-serif)\b/.test(s)) return false
  if (/\bserif\b/.test(s)) return true
  return /\b(georgia|times|garamond|playfair|merriweather|lora|cormorant|libre|baskerville|spectral|noto serif|pt serif|source serif|dm serif|crimson|cardo|bitter|frank|tinos|domine|zilla|newsreader|fraunces|recoleta)\b/.test(
    s,
  )
}

// Pick the dominant value of a property across captured elements (excluding the
// supplied baseline value). Surveying real content components — not just <body> —
// recovers signals that live on cards/buttons/headings (border-radius, gap,
// non-generic typeface) which body almost never carries. Returns "" when no
// element offers a usable value, so the caller keeps its baseline.
function dominantValue(
  styles: Map<string, Record<string, string>>,
  prop: string,
  accept: (v: string) => string | null,
): string {
  const counts = new Map<string, number>()
  for (const [, style] of styles.entries()) {
    const norm = accept((style[prop] ?? "").trim())
    if (!norm) continue
    counts.set(norm, (counts.get(norm) ?? 0) + 1)
  }
  let best = ""
  let bestN = 0
  for (const [val, n] of counts.entries()) {
    if (n > bestN) {
      bestN = n
      best = val
    }
  }
  return best
}

// Analyze page styles to extract theme tokens
export function extractTokens(captured: CapturedPage): ExtractedTokens {
  const styles = captured.computedStyles

  // Get body styles as baseline. The root <html> element also carries the page's
  // canvas color; UAs paint the viewport with html's (then body's) background, so
  // consult it when body's own background is transparent/unset.
  const bodyStyles = styles.get("body") || {}
  const htmlStyles = styles.get("html") || styles.get(":root") || {}

  // Extract colors. A transparent/unset page surface must NOT collapse to pure
  // black — UAs render an unstyled document on white, and most doc/minimal pages
  // are a light neutral. Default the canvas to a light surface and fall back to
  // html's background before giving up, so cloned pages match the original light
  // ground instead of a dark/black canvas.
  let background = extractColor(bodyStyles, ["background-color", "backgroundColor"], "")
  if (!/^#[0-9a-f]{6}$/i.test(background)) {
    background = extractColor(htmlStyles, ["background-color", "backgroundColor"], "#ffffff")
  }
  let foreground = extractColor(bodyStyles, ["color"], "")
  if (!/^#[0-9a-f]{6}$/i.test(foreground)) {
    foreground = extractColor(htmlStyles, ["color"], "#0f172a")
  }

  // Guard: if the page reports the same value for bg and fg (common when a scrape
  // misses an inherited color), force a contrasting foreground so text is legible
  // instead of invisible.
  if (!distinct(background, foreground, 48)) {
    foreground = luminance(background) > 0.5 ? "#0f172a" : "#f8fafc"
  }

  // Try to find primary/accent colors from buttons or links.
  // Collect *chromatic* brand colors — the page background is usually a neutral
  // (near-gray), so a real accent has visible chroma and differs from the bg.
  let primary = "#3b82f6" // Default blue
  let accent = "#8b5cf6" // Default purple
  const secondary = "#64748b" // Slate — stays neutral; used as a tonal surface

  const brandCandidates: string[] = []
  for (const [_, style] of styles.entries()) {
    for (const prop of ["background-color", "color", "border-color"]) {
      const raw = style[prop]?.trim() || ""
      if (!raw || raw === "rgba(0, 0, 0, 0)" || raw === "transparent") continue
      const hex = rgbToHex(raw)
      if (!/^#[0-9a-f]{6}$/i.test(hex)) continue
      // A brand color is chromatic and clearly distinct from the page background.
      if (chroma(hex) >= 40 && distinct(hex, background, 60)) {
        brandCandidates.push(hex)
      }
    }
  }
  if (brandCandidates.length) {
    // Most saturated candidate -> primary; the next most-distinct -> accent.
    const byChroma = [...new Set(brandCandidates)].sort((a, b) => chroma(b) - chroma(a))
    primary = byChroma[0]
    const alt = byChroma.find((h) => distinct(h, primary, 80))
    if (alt) accent = alt
  }

  // Extract font family. <body> frequently reports a generic keyword
  // ("sans-serif") while the real brand typeface lives on content elements
  // (headings, cards, nav). Prefer body's *concrete* face; otherwise adopt the
  // dominant concrete family across captured elements so the cloned typography
  // matches the original instead of collapsing to a system default. This is what
  // makes theme typography confirmable on the content bands, not just the heading.
  let fontFamily = bodyStyles["font-family"]?.trim() || ""
  if (!firstConcreteFamily(fontFamily)) {
    const dominantFont = dominantValue(styles, "font-family", (v) =>
      firstConcreteFamily(v) ? v : null,
    )
    fontFamily = dominantFont || fontFamily || "sans-serif"
  }

  // Border radius is a content-component signal (cards/buttons/inputs), not a body
  // property — body's radius is almost always 0. Adopt the dominant *non-zero*
  // radius across captured elements so the cloned page keeps the original's
  // rounded/sharp character; fall back to body, then a sensible default.
  const acceptRadius = (v: string): string | null => {
    if (!v) return null
    // Reject 0 / 0px / 0rem and multi-value (per-corner) noise — keep a single
    // uniform non-zero radius which is what the theme token represents.
    const first = v.split(/\s+/)[0]
    if (!first) return null
    if (/^0(px|rem|em|%)?$/.test(first)) return null
    if (!/^[\d.]+(px|rem|em|%)$/.test(first)) return null
    return first
  }
  const bodyRadius = acceptRadius(bodyStyles["border-radius"]?.trim() || "")
  const radius = bodyRadius || dominantValue(styles, "border-radius", acceptRadius) || "0.5rem"

  // Spacing comes from the dominant gap among flex/grid containers; body rarely
  // sets gap, so survey captured layout elements before falling back.
  const acceptGap = (v: string): string | null => {
    if (!v) return null
    const first = v.split(/\s+/)[0]
    if (!first || /^(normal|0(px|rem|em|%)?)$/.test(first)) return null
    if (!/^[\d.]+(px|rem|em)$/.test(first)) return null
    return first
  }
  const bodyGap = acceptGap(bodyStyles["gap"]?.trim() || "")
  const spacing = bodyGap || dominantValue(styles, "gap", acceptGap) || "1rem"

  // Muted is consumed downstream as a *tonal surface* (the background of alternate
  // sections), so it must be a low-contrast shift of the page background toward the
  // foreground — NOT an arbitrary gray text color (which collapsed every muted
  // section to the same flat fill). Mixing 8% of foreground into the background
  // yields a subtle but visible surface that differentiates sections on any palette.
  const muted = mix(background, foreground, 0.08)

  // Extract border color; fall back to a faint surface derived from the palette so
  // section edges remain visible on both light and dark backgrounds.
  const rawBorder = bodyStyles["border-color"]?.trim() || ""
  let border = rawBorder && rawBorder !== "transparent" ? rgbToHex(rawBorder) : ""
  if (!/^#[0-9a-f]{6}$/i.test(border) || !distinct(border, background, 16)) {
    border = mix(background, foreground, 0.16)
  }

  return {
    background,
    foreground,
    primary,
    secondary,
    muted,
    accent,
    border,
    radius,
    fontFamily,
    spacing,
  }
}

// Map extracted tokens to theme variable keys
export function tokensToThemeVars(tokens: ExtractedTokens): Partial<Record<string, string>> {
  return {
    "--background": tokens.background,
    "--foreground": tokens.foreground,
    "--primary": tokens.primary,
    "--secondary": tokens.secondary,
    "--muted": tokens.muted,
    "--accent": tokens.accent,
    "--border": tokens.border,
    "--radius": tokens.radius,
    "--font-sans": tokens.fontFamily,
    "--spacing": tokens.spacing,
  }
}

// A valid #rrggbb hex, else the supplied fallback. Guards against empty/invalid
// tokens (e.g. a scrape that surfaced "transparent" or a font name in a color slot)
// so a derived theme never ships a broken CSS var.
function safeHex(value: string | undefined, fallback: string): string {
  const v = (value || "").trim()
  return /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : fallback
}

// Readable text color to lay on top of `bg`: near-black on light surfaces,
// near-white on dark ones. Uses the same luminance model as the rest of the file.
function readableOn(bg: string): string {
  return luminance(bg) > 0.5 ? "#0a0a0a" : "#fafafa"
}

// Build full light + dark theme maps from extracted tokens so a cloned site's
// DEFAULT theme matches the source's look (palette/fonts/radius). Keys are the
// kebab-case, unprefixed names the theme system applies (see THEME_VAR_KEYS in
// ship-fast-blocks/theme-apply.ts) — exactly what a preset's styles.light/.dark
// must contain. Generic engine rule: derived structurally from tokens, never
// hardcoded per site.
export function tokensToThemePreset(
  tokens: ExtractedTokens,
): { light: Record<string, string>; dark: Record<string, string> } {
  // Defensive defaults — an empty/invalid token must never collapse the theme.
  const background = safeHex(tokens.background, "#ffffff")
  const foreground = safeHex(tokens.foreground, "#0a0a0a")
  const primary = safeHex(tokens.primary, "#3b82f6")
  const accent = safeHex(tokens.accent, primary)
  const secondary = safeHex(tokens.secondary, mix(background, foreground, 0.06))
  const muted = safeHex(tokens.muted, mix(background, foreground, 0.08))
  const border = safeHex(tokens.border, mix(background, foreground, 0.16))
  const radius = (tokens.radius || "").trim() || "0.5rem"
  const fontSans = (tokens.fontFamily || "").trim() || "sans-serif"

  // Foreground sitting on top of muted surfaces: a mid blend reads as a softened
  // body/secondary text color on either light or dark surfaces.
  const mutedForeground = mix(foreground, background, 0.45)
  const primaryForeground = readableOn(primary)
  const accentForeground = readableOn(accent)
  const secondaryForeground = readableOn(secondary)

  const light: Record<string, string> = {
    background,
    foreground,
    card: background,
    "card-foreground": foreground,
    popover: background,
    "popover-foreground": foreground,
    primary,
    "primary-foreground": primaryForeground,
    secondary,
    "secondary-foreground": secondaryForeground,
    muted,
    "muted-foreground": mutedForeground,
    accent,
    "accent-foreground": accentForeground,
    border,
    input: border,
    ring: primary,
    radius,
    "font-sans": fontSans,
  }

  // Dark variant: swap the canvas to a dark ground with a light foreground while
  // keeping the brand primary/accent/radius/font intact. Surfaces (card/muted/
  // border) are derived as tonal lifts off the dark background so the dark theme
  // is internally consistent rather than a flat fill. If the source is already
  // dark we keep its colors and only ensure a contrasting foreground.
  const sourceIsDark = luminance(background) <= 0.5
  const darkBg = sourceIsDark ? background : "#0a0a0a"
  const darkFg = sourceIsDark ? foreground : "#fafafa"
  const darkCard = mix(darkBg, "#ffffff", 0.06)
  const darkMuted = mix(darkBg, "#ffffff", 0.1)
  const darkBorder = mix(darkBg, "#ffffff", 0.16)
  const darkSecondary = mix(darkBg, "#ffffff", 0.12)

  const dark: Record<string, string> = {
    background: darkBg,
    foreground: darkFg,
    card: darkCard,
    "card-foreground": darkFg,
    popover: darkCard,
    "popover-foreground": darkFg,
    primary,
    "primary-foreground": primaryForeground,
    secondary: darkSecondary,
    "secondary-foreground": darkFg,
    muted: darkMuted,
    "muted-foreground": mix(darkFg, darkBg, 0.4),
    accent,
    "accent-foreground": accentForeground,
    border: darkBorder,
    input: darkBorder,
    ring: primary,
    radius,
    "font-sans": fontSans,
  }

  return { light, dark }
}
