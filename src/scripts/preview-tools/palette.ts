import { THEME_PRESETS } from '../theme-presets'

export interface PalettePayload {
  css?: string
  palette?: { dark?: Record<string, string>; id?: string }
}

export interface PersistedPalette {
  dark?: Record<string, string>
  light?: Record<string, string>
  id?: string
}

export type TokenCategory = 'brand' | 'neutral' | 'semantic'

export interface TokenSwatch {
  name: string
  category: TokenCategory
  cssVar: string
  displayLabel: string
  swatch: string
}

// The SSR theme head defines tokens as bare RGB channels consumed via
// `rgb(var(--token) / <alpha>)` (see buildThemeHead in the engine), so a root var
// MUST hold channels ("34 29 39"), not a hex string — `rgb(#221d27 / 1)` is
// invalid and the color silently drops (e.g. the body background falls back to a
// default). Convert hex values to channels; pass non-hex values (radius, fonts,
// already-channel/hsl) through untouched. Note: buildTailwindOverrideCss keeps the
// raw hex because there the value is a literal color, not a channel triple.
function hexToRgbChannels(value: string): string {
  let s = value.trim()
  if (s[0] !== '#') return value
  s = s.slice(1)
  if (/^[0-9a-fA-F]{3}$/.test(s)) s = s.split('').map((c) => c + c).join('')
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return value
  const r = parseInt(s.slice(0, 2), 16)
  const g = parseInt(s.slice(2, 4), 16)
  const b = parseInt(s.slice(4, 6), 16)
  return `${r} ${g} ${b}`
}

export function buildRootVarsCss(dark: Record<string, string>): string {
  const entries = Object.entries(dark).filter(([, v]) => typeof v === 'string' && v.length)
  if (!entries.length) return ''
  const decls = entries.map(([k, v]) => `  --${k}: ${hexToRgbChannels(v)} !important;`).join('\n')
  return `:root, .dark, html, body {\n${decls}\n}`
}

export function applyPalettePayload(payload: PalettePayload): void {
  const parts: string[] = []
  if (typeof payload.css === 'string' && payload.css.length) parts.push(payload.css)
  const dark = payload.palette?.dark || null
  if (dark) {
    if (!payload.css) {
      const rootCss = buildRootVarsCss(dark)
      if (rootCss) parts.push(rootCss)
    }
    const tailwindCss = buildTailwindOverrideCss(dark)
    if (tailwindCss) parts.push(tailwindCss)
  }
  if (!parts.length) return
  let styleEl = document.getElementById('sf-palette-override') as HTMLStyleElement | null
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'sf-palette-override'
    ;(document.head || document.documentElement).appendChild(styleEl)
  }
  styleEl.textContent = parts.join('\n\n')
}

export function bootstrapPersistedPalette(): void {
  try {
    const w = window as unknown as { __SF_PERSISTED_PALETTE__?: PersistedPalette }
    const persisted = w.__SF_PERSISTED_PALETTE__
    if (persisted && persisted.dark && typeof persisted.dark === 'object') {
      applyPalettePayload({ palette: { dark: persisted.dark } })
    }
  } catch {
    /* ignore */
  }
}

export function discoverTailwindColorNames(): string[] {
  const names = new Set<string>()
  try {
    const w = window as unknown as {
      tailwind?: {
        config?: {
          theme?: {
            extend?: { colors?: Record<string, unknown> }
            colors?: Record<string, unknown>
          }
        }
      }
    }
    const cfg = w.tailwind?.config?.theme
    const fromCfg = { ...(cfg?.colors || {}), ...(cfg?.extend?.colors || {}) }
    Object.keys(fromCfg).forEach((n) => names.add(n))
  } catch {
    /* ignore */
  }
  const scripts = document.querySelectorAll('script')
  scripts.forEach((s) => {
    const t = s.textContent || ''
    if (!t.includes('tailwind.config')) return
    const m = t.match(/colors\s*:\s*\{([\s\S]*?)\}/)
    if (!m) return
    const body = m[1]
    const keyRe = /(?:^|,|\s)([A-Za-z][A-Za-z0-9_-]*)\s*:/g
    let km: RegExpExecArray | null
    while ((km = keyRe.exec(body))) {
      names.add(km[1])
    }
  })
  return Array.from(names)
}

export function mapNameToPaletteVar(name: string, dark: Record<string, string>): string | null {
  const k = name.toLowerCase()
  const pick = (...keys: string[]): string | null => {
    for (const key of keys) {
      const v = dark[key]
      if (typeof v === 'string' && v.length) return v
    }
    return null
  }
  if (/(^|-)(bg|background|base|page)$/i.test(k)) return pick('background')
  if (/(^|-)(surface|card|panel|tile)$/i.test(k)) return pick('card', 'popover', 'background')
  if (/(^|-)(elev|elevated|popover|raised|overlay)$/i.test(k))
    return pick('popover', 'card', 'background')
  if (/(^|-)(ink|fg|foreground|text|copy|body|content)$/i.test(k)) return pick('foreground')
  if (/(^|-)(primary|accent|brand|highlight|cta)$/i.test(k)) return pick('primary', 'accent')
  if (/(^|-)(secondary)$/i.test(k)) return pick('secondary', 'muted')
  if (/(^|-)(muted|subtle|soft|dim)$/i.test(k)) return pick('muted', 'secondary')
  if (/(^|-)(border|outline|divider|rule|edge)$/i.test(k)) return pick('border', 'input')
  if (/(^|-)(ring|focus)$/i.test(k)) return pick('ring', 'primary')
  if (/(^|-)(destructive|danger|error|red)$/i.test(k)) return pick('destructive')
  if (/(^|-)(success|ok|green)$/i.test(k)) return pick('chart-2')
  if (/(^|-)(warning|warn|yellow|amber)$/i.test(k)) return pick('chart-3')
  if (/(^|-)(info|blue)$/i.test(k)) return pick('chart-4')
  if (/(^|-)(ghost|mute)$/i.test(k)) return pick('muted')
  return null
}

function escapeCssName(name: string): string {
  return name.replace(/([^a-zA-Z0-9_-])/g, '\\$1')
}

export function buildTailwindOverrideCss(dark: Record<string, string>): string {
  const names = discoverTailwindColorNames()
  if (!names.length) return ''
  const lines: string[] = []
  const UTILS: Array<[string, string]> = [
    ['bg', 'background-color'],
    ['text', 'color'],
    ['border', 'border-color'],
    ['ring', '--tw-ring-color'],
    ['from', '--tw-gradient-from'],
    ['to', '--tw-gradient-to'],
    ['via', '--tw-gradient-via'],
    ['fill', 'fill'],
    ['stroke', 'stroke'],
    ['outline', 'outline-color'],
    ['decoration', 'text-decoration-color'],
    ['accent', 'accent-color'],
    ['caret', 'caret-color'],
    ['divide', 'border-color'],
    ['placeholder', 'color'],
  ]
  for (const name of names) {
    const value = mapNameToPaletteVar(name, dark)
    if (!value) continue
    const safe = escapeCssName(name)
    for (const [util, prop] of UTILS) {
      const sel =
        util === 'divide'
          ? `.${util}-${safe} > :not([hidden]) ~ :not([hidden])`
          : util === 'placeholder'
            ? `.${util}-${safe}::placeholder`
            : `.${util}-${safe}`
      lines.push(`${sel} { ${prop}: ${value} !important; }`)
      const opacities = [5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100]
      for (const o of opacities) {
        const selOpa =
          util === 'divide'
            ? `.${util}-${safe}\\/${o} > :not([hidden]) ~ :not([hidden])`
            : util === 'placeholder'
              ? `.${util}-${safe}\\/${o}::placeholder`
              : `.${util}-${safe}\\/${o}`
        lines.push(`${selOpa} { ${prop}: ${value} !important; }`)
      }
    }
  }
  return lines.join('\n')
}

// ── Token vocabulary ──────────────────────────────────────────────────────

const BRAND_TOKENS: Array<{ name: string; label: string }> = [
  { name: 'primary', label: 'Primary' },
  { name: 'primary-foreground', label: 'Primary text' },
  { name: 'accent', label: 'Accent' },
  { name: 'accent-foreground', label: 'Accent text' },
  { name: 'secondary', label: 'Secondary' },
  { name: 'secondary-foreground', label: 'Secondary text' },
]

const NEUTRAL_TOKENS: Array<{ name: string; label: string }> = [
  { name: 'background', label: 'Page background' },
  { name: 'foreground', label: 'Page text' },
  { name: 'card', label: 'Card' },
  { name: 'card-foreground', label: 'Card text' },
  { name: 'popover', label: 'Popover' },
  { name: 'popover-foreground', label: 'Popover text' },
  { name: 'muted', label: 'Muted' },
  { name: 'muted-foreground', label: 'Muted text' },
  { name: 'border', label: 'Border' },
  { name: 'input', label: 'Input' },
]

const SEMANTIC_TOKENS: Array<{ name: string; label: string }> = [
  { name: 'destructive', label: 'Danger' },
  { name: 'destructive-foreground', label: 'Danger text' },
  { name: 'ring', label: 'Focus ring' },
  { name: 'chart-1', label: 'Chart 1' },
  { name: 'chart-2', label: 'Chart 2' },
  { name: 'chart-3', label: 'Chart 3' },
  { name: 'chart-4', label: 'Chart 4' },
  { name: 'chart-5', label: 'Chart 5' },
]

function resolveLabelFromPresets(tokenName: string, fallback: string): string {
  void THEME_PRESETS // anchored import for label resolution parity
  return fallback
}

function readPersistedDark(): Record<string, string> | null {
  try {
    const w = window as unknown as { __SF_PERSISTED_PALETTE__?: PersistedPalette }
    const p = w.__SF_PERSISTED_PALETTE__
    if (p && p.dark && typeof p.dark === 'object') return p.dark
  } catch {
    /* ignore */
  }
  return null
}

export function buildTokensVocabulary(
  palette?: PersistedPalette | Record<string, string> | null,
): TokenSwatch[] {
  let dark: Record<string, string> | null = null
  if (palette && typeof palette === 'object') {
    const maybeOuter = palette as PersistedPalette
    if (maybeOuter.dark && typeof maybeOuter.dark === 'object') {
      dark = maybeOuter.dark
    } else {
      dark = palette as Record<string, string>
    }
  }
  if (!dark) dark = readPersistedDark()
  if (!dark) dark = {}

  const groups: Array<{ items: Array<{ name: string; label: string }>; category: TokenCategory }> =
    [
      { items: BRAND_TOKENS, category: 'brand' },
      { items: NEUTRAL_TOKENS, category: 'neutral' },
      { items: SEMANTIC_TOKENS, category: 'semantic' },
    ]

  const out: TokenSwatch[] = []
  for (const group of groups) {
    for (const item of group.items) {
      const swatch = (dark && dark[item.name]) || ''
      if (!swatch) continue
      out.push({
        name: item.name,
        category: group.category,
        cssVar: `var(--${item.name})`,
        displayLabel: resolveLabelFromPresets(item.name, item.label),
        swatch,
      })
    }
  }
  return out
}
