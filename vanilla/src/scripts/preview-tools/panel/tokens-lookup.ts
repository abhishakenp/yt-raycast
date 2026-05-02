import { buildTokensVocabulary, type TokenSwatch } from '../palette'

export type ColorControl = 'background' | 'color' | 'border-color' | 'fill'

const COMMON_NEUTRAL_NAMES = new Set<string>([
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'muted',
  'muted-foreground',
  'border',
  'input',
])

function brandFirst(swatches: TokenSwatch[]): TokenSwatch[] {
  const brand: TokenSwatch[] = []
  const neutrals: TokenSwatch[] = []
  const rest: TokenSwatch[] = []
  for (const s of swatches) {
    if (s.category === 'brand') brand.push(s)
    else if (s.category === 'neutral' && COMMON_NEUTRAL_NAMES.has(s.name)) neutrals.push(s)
    else rest.push(s)
  }
  return [...brand, ...neutrals, ...rest]
}

function preferForegroundTokens(swatches: TokenSwatch[]): TokenSwatch[] {
  // for 'color' (text) prefer foreground-flavored tokens first
  const fg: TokenSwatch[] = []
  const bg: TokenSwatch[] = []
  for (const s of swatches) {
    if (/foreground|text/.test(s.name)) fg.push(s)
    else bg.push(s)
  }
  return [...fg, ...bg]
}

function preferBorderTokens(swatches: TokenSwatch[]): TokenSwatch[] {
  const borders: TokenSwatch[] = []
  const others: TokenSwatch[] = []
  for (const s of swatches) {
    if (/border|ring|input|outline/.test(s.name)) borders.push(s)
    else others.push(s)
  }
  return [...borders, ...others]
}

export function resolveSwatchForControl(control: ColorControl): TokenSwatch[] {
  const all = buildTokensVocabulary()
  const ordered = brandFirst(all)
  if (control === 'color') return preferForegroundTokens(ordered)
  if (control === 'border-color') return preferBorderTokens(ordered)
  return ordered
}

function normalizeHex(input: string): string | null {
  const s = input.trim().toLowerCase()
  if (!s) return null
  if (/^#[0-9a-f]{3}$/.test(s)) {
    return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`
  }
  if (/^#[0-9a-f]{6}$/.test(s)) return s
  const m = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (m) {
    const r = Math.max(0, Math.min(255, parseInt(m[1], 10)))
    const g = Math.max(0, Math.min(255, parseInt(m[2], 10)))
    const b = Math.max(0, Math.min(255, parseInt(m[3], 10)))
    const hex = (n: number) => n.toString(16).padStart(2, '0')
    return `#${hex(r)}${hex(g)}${hex(b)}`
  }
  return null
}

function extractVarName(input: string): string | null {
  const m = input.trim().match(/^var\(\s*--([A-Za-z0-9_-]+)/)
  return m ? m[1] : null
}

export function findTokenForValue(cssValue: string): TokenSwatch | null {
  if (!cssValue || typeof cssValue !== 'string') return null
  const all = buildTokensVocabulary()
  if (!all.length) return null

  const varName = extractVarName(cssValue)
  if (varName) {
    const hit = all.find((t) => t.name === varName)
    if (hit) return hit
  }

  const hex = normalizeHex(cssValue)
  if (hex) {
    const hit = all.find((t) => {
      const th = normalizeHex(t.swatch)
      return th && th === hex
    })
    if (hit) return hit
  }

  return null
}
