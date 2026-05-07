export type DerivedPalette = {
  id: 'custom'
  name: 'Custom'
  dark: Record<string, string>
  light: Record<string, string>
  bg: string
  surface: string
  accent: string
  text: string
  border: string
  seedHex: string
}

const FALLBACK_SEED = '#3b82f6'

function normalizeHex(input: string): string {
  if (typeof input !== 'string') return FALLBACK_SEED
  let s = input.trim().toLowerCase()
  if (s.startsWith('#')) s = s.slice(1)
  if (/^[0-9a-f]{3}$/.test(s)) s = s.split('').map((c) => c + c).join('')
  if (!/^[0-9a-f]{6}$/.test(s)) return FALLBACK_SEED
  return '#' + s
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const n = normalizeHex(hex)
  const r = parseInt(n.slice(1, 3), 16) / 255
  const g = parseInt(n.slice(3, 5), 16) / 255
  const b = parseInt(n.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }
  return { h, s: s * 100, l: l * 100 }
}

export function hslToHex(h: number, s: number, l: number): string {
  const hh = ((h % 360) + 360) % 360
  const ss = Math.max(0, Math.min(100, s)) / 100
  const ll = Math.max(0, Math.min(100, l)) / 100
  const c = (1 - Math.abs(2 * ll - 1)) * ss
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1))
  const m = ll - c / 2
  let r = 0, g = 0, b = 0
  if (hh < 60) { r = c; g = x }
  else if (hh < 120) { r = x; g = c }
  else if (hh < 180) { g = c; b = x }
  else if (hh < 240) { g = x; b = c }
  else if (hh < 300) { r = x; b = c }
  else { r = c; b = x }
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0')
  return '#' + to(r) + to(g) + to(b)
}

export function luminance(hex: string): number {
  const n = normalizeHex(hex)
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(n.slice(i, i + 2), 16) / 255)
  const lin = [r, g, b].map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)))
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
}

export function deriveCustomPalette(seedHex: string): DerivedPalette {
  const seed = normalizeHex(seedHex)
  const { h } = hexToHsl(seed)
  const primaryFg = luminance(seed) < 0.5 ? '#ffffff' : '#0b0b0d'
  const dark: Record<string, string> = {
    'background': hslToHex(h, 12, 6),
    'foreground': hslToHex(h, 8, 96),
    'card': hslToHex(h, 10, 9),
    'card-foreground': hslToHex(h, 8, 96),
    'popover': hslToHex(h, 10, 9),
    'popover-foreground': hslToHex(h, 8, 96),
    'primary': seed,
    'primary-foreground': primaryFg,
    'secondary': hslToHex(h, 18, 16),
    'secondary-foreground': hslToHex(h, 8, 96),
    'muted': hslToHex(h, 10, 14),
    'muted-foreground': hslToHex(h, 10, 65),
    'accent': hslToHex(h, 22, 22),
    'accent-foreground': hslToHex(h, 8, 96),
    'border': hslToHex(h, 12, 18),
    'input': hslToHex(h, 12, 18),
    'ring': seed,
  }
  const light: Record<string, string> = {
    'background': hslToHex(h, 20, 98),
    'foreground': hslToHex(h, 12, 12),
    'card': hslToHex(h, 20, 100),
    'card-foreground': hslToHex(h, 12, 12),
    'popover': hslToHex(h, 20, 100),
    'popover-foreground': hslToHex(h, 12, 12),
    'primary': seed,
    'primary-foreground': primaryFg,
    'secondary': hslToHex(h, 20, 94),
    'secondary-foreground': hslToHex(h, 12, 16),
    'muted': hslToHex(h, 18, 95),
    'muted-foreground': hslToHex(h, 10, 40),
    'accent': hslToHex(h, 22, 90),
    'accent-foreground': hslToHex(h, 12, 16),
    'border': hslToHex(h, 14, 88),
    'input': hslToHex(h, 14, 88),
    'ring': seed,
  }
  return {
    id: 'custom',
    name: 'Custom',
    dark,
    light,
    bg: dark.background,
    surface: dark.card,
    accent: dark.primary,
    text: dark.foreground,
    border: dark.border,
    seedHex: seed,
  }
}
