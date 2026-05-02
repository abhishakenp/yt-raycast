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

export const repairThemeColors = (theme, fallbackTheme) => {
  if (!theme || typeof theme !== 'object') return theme
  const colors = theme.colors && typeof theme.colors === 'object' ? theme.colors : null
  if (!colors) return theme
  const fb = fallbackTheme?.colors && typeof fallbackTheme.colors === 'object' ? fallbackTheme.colors : {}
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
