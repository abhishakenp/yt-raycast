const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

const srgbToLin = (c) => {
  const x = c / 255
  return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
}

const luminance = (rgb) => {
  if (!rgb) return null
  const r = srgbToLin(rgb.r)
  const g = srgbToLin(rgb.g)
  const b = srgbToLin(rgb.b)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const parseHex = (s) => {
  const m = String(s || '')
    .trim()
    .match(HEX)
  if (!m) return null
  let h = m[1]
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  }
  const n = Number.parseInt(h, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

const parseRgbStr = (s) => {
  const t = String(s || '').trim()
  const m = t.match(
    /^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)$/i,
  )
  if (!m) return null
  return {
    r: Math.min(255, Math.max(0, Number(m[1]))),
    g: Math.min(255, Math.max(0, Number(m[2]))),
    b: Math.min(255, Math.max(0, Number(m[3]))),
  }
}

export const parseColor = (s) => {
  if (!s || typeof s !== 'string') return null
  const t = s.trim()
  return parseHex(t) || parseRgbStr(t)
}

const contrastRatio = (L1, L2) => {
  const a = L1 > L2 ? L1 : L2
  const b = L1 > L2 ? L2 : L1
  return (a + 0.05) / (b + 0.05)
}

const ratioForColors = (bgStr, fgStr) => {
  const bg = parseColor(bgStr)
  const fg = parseColor(fgStr)
  if (!bg || !fg) return null
  const lb = luminance(bg)
  const lf = luminance(fg)
  if (lb == null || lf == null) return null
  return contrastRatio(lb, lf)
}

const TEXT_CANDIDATES = ['#f8fafc', '#f1f5f9', '#0f172a', '#171717', '#fafafa', '#e2e8f0', '#1e293b']

const pickBestText = (bgStr, surfaceStr, fallbackText) => {
  const candidates = [fallbackText, ...TEXT_CANDIDATES].filter(Boolean)
  const seen = new Set()
  const uniq = []
  for (const c of candidates) {
    const k = String(c).toLowerCase()
    if (!seen.has(k)) {
      seen.add(k)
      uniq.push(c)
    }
  }
  let best = fallbackText || '#f8fafc'
  let bestMin = 0
  for (const cand of uniq) {
    const r1 = ratioForColors(bgStr, cand)
    const r2 = ratioForColors(surfaceStr || bgStr, cand)
    if (r1 == null || r2 == null) continue
    const m = Math.min(r1, r2)
    if (m > bestMin) {
      bestMin = m
      best = cand
    }
  }
  if (bestMin >= 4.5) return best
  const bg = parseColor(bgStr)
  if (bg && luminance(bg) != null && luminance(bg) > 0.55) return '#0f172a'
  return '#f8fafc'
}

const pickMuted = (bgStr, surfaceStr, fallbackMuted) => {
  const candidates = [
    fallbackMuted,
    '#64748b',
    '#475569',
    '#94a3b8',
    '#a1a1aa',
    '#cbd5e1',
    '#78716c',
  ].filter(Boolean)
  let best = fallbackMuted || '#64748b'
  let bestMin = 0
  for (const cand of candidates) {
    const r1 = ratioForColors(bgStr, cand)
    const r2 = ratioForColors(surfaceStr || bgStr, cand)
    if (r1 == null || r2 == null) continue
    const m = Math.min(r1, r2)
    if (m > bestMin) {
      bestMin = m
      best = cand
    }
  }
  if (bestMin >= 3) return best
  const bgP = parseColor(bgStr)
  const surfP = parseColor(surfaceStr || bgStr)
  const bl = bgP ? luminance(bgP) : 0.1
  const sl = surfP ? luminance(surfP) : bl
  const light = Math.max(bl, sl) > 0.55
  return light ? '#475569' : '#cbd5e1'
}

// ─── Vibe-driven palette repair ────────────────────────────────────────
// The site-spec LLM (gpt-oss-120b) frequently emits monotone palettes —
// primary/secondary/accent all near-grayscale, often with a saturated
// border color (#FF9F00 etc.) that visually clashes. This module detects
// those cases deterministically and replaces the palette with one keyed
// off the prompt's vibe.

const rgbToHsl = (rgb) => {
  if (!rgb) return null
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d) % 6
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  h = Math.round(h * 60)
  if (h < 0) h += 360
  return { h, s, l }
}

const colorHsl = (hex) => rgbToHsl(parseColor(hex))

// Curated vibe palettes. Each picks distinct hues for primary/secondary/
// accent, an appropriate background/surface pair, and a low-saturation
// border so it can't compete with brand colors. Optional `typography`
// block applies heading + body font defaults — currently set only on
// vibes that have been validated against real production references.
//
// coffee tokens derived from Playwright extraction of:
//   bluebottlecoffee.com, stumptowncoffee.com, vervecoffee.com,
//   onyxcoffeelab.com, counterculturecoffee.com, seycoffee.com
// Consensus: warm cream/paper backgrounds (NOT pure white), deep warm-brown
// or near-black text, accent is a CONTRAST color (deep blue) — real sites
// don't use brown for CTAs, brown is the atmosphere. Heading uses a custom
// display serif (Bajern, SC BNCanyon, GT-America-Condensed) → closest free
// Google Font is Fraunces. Body uses founders-grotesk / GT Flexa / Akkurat
// → closest free is Inter.
const VIBE_PALETTES = {
  coffee: {
    primary: '#28201D', secondary: '#3B2415', accent: '#0F4C75',
    background: '#F4EEE5', surface: '#EADBC4', border: '#D9C4A6',
    typography: { heading: 'Fraunces', body: 'Inter' },
  },
  // farmersmarket tokens derived from Playwright extraction of:
  //   misfitsmarket.com, imperfectfoods.com, hungryroot.com,
  //   goodeggs.com, sweetgreen.com
  // Consensus: cream/oat/faint-mint backgrounds, dark warm-gray text,
  // bold display-or-Grotesk heading, modern sans body. CTAs are an
  // accent — Sweetgreen's deep forest #00473C, Misfits' mustard #F1C34A,
  // Imperfect's magenta #B32274. Going with deep forest primary (the
  // most "farm trust" of the three) and harvest-mustard accent.
  farmersmarket: {
    primary: '#2D4A2A', secondary: '#7B5E3D', accent: '#F1C34A',
    background: '#F9F8F4', surface: '#EEF5EA', border: '#D9D2BC',
    typography: { heading: 'Fraunces', body: 'Inter' },
  },
  wellness: {
    primary: '#6B8E5A', secondary: '#A8624D', accent: '#D9A89F',
    background: '#FAF5EE', surface: '#F0E6D6', border: '#D8C9B2',
  },
  fitness: {
    primary: '#0E0E12', secondary: '#1E1E26', accent: '#A6F500',
    background: '#0A0A0E', surface: '#15151B', border: '#23232C',
  },
  jewelry: {
    primary: '#8B0F2A', secondary: '#1A1A1D', accent: '#C9A96E',
    background: '#FBF6EC', surface: '#F2E9D6', border: '#DECDA8',
  },
  fashion: {
    primary: '#0A0A0A', secondary: '#FAFAFA', accent: '#D44C2A',
    background: '#FAFAFA', surface: '#F0F0F0', border: '#D9D9D9',
  },
  tech: {
    primary: '#7C3AED', secondary: '#22D3EE', accent: '#A78BFA',
    background: '#09090B', surface: '#18181B', border: '#27272A',
  },
  kids: {
    primary: '#F4B400', secondary: '#3CA0E7', accent: '#E84A5F',
    background: '#FFF8E7', surface: '#FFEFC7', border: '#F1D88A',
  },
  food: {
    primary: '#B23A28', secondary: '#1F4F2C', accent: '#E0A82E',
    background: '#FFF4E6', surface: '#FBE5C2', border: '#E5CCA1',
  },
  realestate: {
    primary: '#0F2A4A', secondary: '#1F3A66', accent: '#C9A96E',
    background: '#FBF8F2', surface: '#F0EADC', border: '#D9CFB8',
  },
  outdoors: {
    primary: '#2F4A2C', secondary: '#A86A2C', accent: '#6FA1C9',
    background: '#F4EFE3', surface: '#E6DEC8', border: '#C8BFA0',
  },
  saas: {
    primary: '#6366F1', secondary: '#8B5CF6', accent: '#22D3EE',
    background: '#0A0A0F', surface: '#15151F', border: '#23232E',
  },
}

// Keyword → vibe mapping. Order matters — more specific keywords first.
const VIBE_KEYWORDS = [
  ['coffee', /\b(coffee|cafe|café|espresso|barista|roastery|tea\s*house|bakery|patisserie)\b/i],
  ['farmersmarket', /\b(farmer'?s?\s*market|farm|produce|harvest|organic|grocery|grocer|csa|local\s*food|farm.to.table|seasonal\s*produce|veggie|vegetable\s*box)\b/i],
  ['wellness', /\b(wellness|spa|yoga|meditation|herbal|ayurveda|holistic|naturopath|massage)\b/i],
  ['fitness', /\b(gym|fitness|crossfit|workout|bodybuilding|martial.arts|boxing|hiit|trainer)\b/i],
  ['jewelry', /\b(jewel(ry|lery)?|gold|diamond|ring|necklace|bridal|gemstone|wedding\s*band)\b/i],
  ['fashion', /\b(fashion|streetwear|apparel|clothing|boutique|runway|atelier|couture|outfit)\b/i],
  ['kids', /\b(kid|kids|child|children|toy|toys|playschool|baby|nursery|daycare)\b/i],
  ['food', /\b(restaurant|diner|bistro|kitchen|menu|chef|cuisine|food\s*delivery|takeaway|pizza|burger|sushi)\b/i],
  ['realestate', /\b(real.estate|property|realty|broker|construction|architect|interior\s*design|homes?\s*for\s*sale)\b/i],
  ['outdoors', /\b(travel|tour|tourism|trek|hike|adventure|outdoor|camping|safari|guide|itiner)\b/i],
  ['tech', /\b(saas|dashboard|analytics|platform|api|developer|devops|infra|cloud|machine\s*learning|ai\s*tool)\b/i],
  ['saas', /\b(software|app|tool|productivity|workflow|automation|crm|erp)\b/i],
]

// Returns { vibe, confident } — confident=true means a keyword matched
// (we can override the LLM's palette aggressively); confident=false means
// we fell through to a siteType default (only override if palette is bad).
const inferVibeFromPrompt = (prompt = '', siteType = '') => {
  const text = String(prompt || '').toLowerCase()
  for (const [vibe, re] of VIBE_KEYWORDS) {
    if (re.test(text)) return { vibe, confident: true }
  }
  if (String(siteType).toLowerCase() === 'ecommerce') return { vibe: 'fashion', confident: false }
  return { vibe: 'tech', confident: false }
}

// True if primary, secondary, accent are all near-grayscale (low saturation)
// OR all crammed within a tiny luminance range (the "5 shades of gray" bug).
const palettePrimariesAreMonotone = (primary, secondary, accent) => {
  const ps = [colorHsl(primary), colorHsl(secondary), colorHsl(accent)].filter(Boolean)
  if (ps.length < 2) return false
  const allLowSat = ps.every((p) => p.s < 0.15)
  if (allLowSat) return true
  const lums = ps.map((p) => p.l)
  const lumSpread = Math.max(...lums) - Math.min(...lums)
  if (allLowSatNeg(ps) && lumSpread < 0.18) return true
  return false
}
const allLowSatNeg = (ps) => ps.filter((p) => p.s < 0.2).length >= 2

// True if the border is more saturated than primary AND accent — i.e. the
// border is shouting for attention instead of framing.
const borderIsGarish = (border, primary, accent) => {
  const b = colorHsl(border)
  if (!b || b.s < 0.4) return false
  const p = colorHsl(primary)
  const a = colorHsl(accent)
  const maxBrand = Math.max(p?.s ?? 0, a?.s ?? 0)
  return b.s > maxBrand + 0.15
}

// Shortest distance between two hues on the 0-360 wheel.
const hueDistance = (a, b) => {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

// True if the LLM-emitted primary is in a hue family that's clearly wrong
// for the matched vibe (e.g. SaaS-purple primary for a farmers market).
// Only call this when the vibe match was keyword-confident, AND the
// vibe palette itself has a meaningfully saturated primary (so we have
// a target hue to compare against). Threshold is generous (>= 60°) so
// e.g. coffee accepts both deep brown and warm orange-brown.
const paletteIsOffVibe = (primary, vibe) => {
  const v = VIBE_PALETTES[vibe]
  if (!v) return false
  const expected = colorHsl(v.primary)
  const actual = colorHsl(primary)
  if (!expected || !actual) return false
  if (expected.s < 0.15 || actual.s < 0.15) return false // either side near-grayscale: not a hue mismatch
  return hueDistance(expected.h, actual.h) >= 60
}

const applyVibePalette = (colors, vibe) => {
  const v = VIBE_PALETTES[vibe] || VIBE_PALETTES.tech
  colors.primary = v.primary
  colors.secondary = v.secondary
  colors.accent = v.accent
  colors.background = v.background
  colors.surface = v.surface
  colors.border = v.border
}

// True if typography is generic Inter-only — the LLM's known fallback that
// looks identical regardless of vibe. Real production sites in any given
// category have characterful display fonts; defaulting to Inter+Inter is
// the typography equivalent of the monotone palette bug.
const typographyIsGeneric = (typography) => {
  if (!typography || typeof typography !== 'object') return true
  const heading = String(typography.heading || '').trim().toLowerCase()
  const body = String(typography.body || '').trim().toLowerCase()
  if (!heading && !body) return true
  // Both unset, or both set to the same generic system sans
  const generic = new Set(['', 'inter', 'system-ui', 'sans-serif', 'arial', 'helvetica'])
  return generic.has(heading) && generic.has(body)
}

const applyVibeTypography = (theme, vibe) => {
  const v = VIBE_PALETTES[vibe]
  if (!v?.typography) return false
  if (!theme.typography || typeof theme.typography !== 'object') theme.typography = {}
  theme.typography.heading = v.typography.heading
  theme.typography.body = v.typography.body
  return true
}

export const repairThemeColors = (theme, fallbackTheme, options = {}) => {
  if (!theme || typeof theme !== 'object') return theme
  const colors = theme.colors && typeof theme.colors === 'object' ? theme.colors : null
  if (!colors) return theme
  const fb = fallbackTheme?.colors && typeof fallbackTheme.colors === 'object' ? fallbackTheme.colors : {}

  // ─── Palette quality (vibe-driven, runs first so contrast pass sees fixed bg) ───
  const userPrompt = options.userPrompt || fallbackTheme?.userPrompt || ''
  const siteType = options.siteType || fallbackTheme?.siteType || ''
  const { vibe, confident: vibeConfident } = inferVibeFromPrompt(userPrompt, siteType)
  const monotone = palettePrimariesAreMonotone(colors.primary, colors.secondary, colors.accent)
  const garish = borderIsGarish(colors.border, colors.primary, colors.accent)
  // Off-vibe trigger: only fires when keyword-confident, otherwise we
  // can't be sure the vibe match is correct enough to override.
  const offVibe = vibeConfident && paletteIsOffVibe(colors.primary, vibe)
  if (monotone || offVibe) {
    applyVibePalette(colors, vibe)
  } else if (garish) {
    // Border-only fix — keep the LLM's primary/accent.
    const v = VIBE_PALETTES[vibe] || VIBE_PALETTES.tech
    colors.border = v.border
  }
  // Typography repair: independent of palette repair — even a good palette
  // looks generic with Inter+Inter on a coffee shop. Only applies when the
  // matched vibe has a validated typography default.
  if (typographyIsGeneric(theme.typography)) {
    applyVibeTypography(theme, vibe)
  }

  // ─── Contrast safety on text/mutedText (existing behavior) ───
  const bg = typeof colors.background === 'string' ? colors.background : '#09090b'
  const surface = typeof colors.surface === 'string' ? colors.surface : bg
  const fbText = typeof fb.text === 'string' ? fb.text : '#f4f4f5'
  const fbMuted = typeof fb.mutedText === 'string' ? fb.mutedText : '#94a3b8'

  const textFixed = pickBestText(bg, surface, fbText)
  colors.text = textFixed

  const mutedFixed = pickMuted(bg, surface, fbMuted)
  colors.mutedText = mutedFixed

  const rBody = ratioForColors(bg, colors.text)
  const rBodySurf = ratioForColors(surface, colors.text)
  const rMutedBg = ratioForColors(bg, colors.mutedText)
  const rMutedSurf = ratioForColors(surface, colors.mutedText)
  const bgRgb = parseColor(bg)
  const surfRgb = parseColor(surface)
  const bgLum = bgRgb ? luminance(bgRgb) : 0.1
  const surfLum = surfRgb ? luminance(surfRgb) : bgLum
  const anyLight = Math.max(bgLum, surfLum) > 0.55
  if (
    (rBody != null && rBody < 3) ||
    (rBodySurf != null && rBodySurf < 3) ||
    (rMutedBg != null && rMutedBg < 2.5) ||
    (rMutedSurf != null && rMutedSurf < 2.5)
  ) {
    colors.text = anyLight ? '#0f172a' : '#f8fafc'
    colors.mutedText = anyLight ? '#475569' : '#cbd5e1'
  }

  return theme
}
