import { push, HistoryEntry } from './history'
import { ensureEid } from './identity'

export interface WriteOpts {
  token?: string
  important?: boolean
  shorthand?: boolean
}

export interface ReadResult {
  raw: string
  effective: string
}

const COLOR_PROPS = new Set<string>([
  'background',
  'background-color',
  'color',
  'border-color',
  'fill',
])

const SIDE_KEYS = ['t', 'r', 'b', 'l'] as const
type SideKey = (typeof SIDE_KEYS)[number]

function isColorProp(prop: string): boolean {
  return COLOR_PROPS.has(prop)
}

function resolveValue(value: string, opts?: WriteOpts): string {
  if (opts && opts.token) return `var(${opts.token})`
  return value
}

function resolvePriority(prop: string, opts?: WriteOpts): '' | 'important' {
  if (opts && typeof opts.important === 'boolean') {
    return opts.important ? 'important' : ''
  }
  return isColorProp(prop) ? 'important' : ''
}

function resolveWriteProp(prop: string, opts?: WriteOpts): string {
  if (opts && opts.shorthand && prop === 'background-color') return 'background'
  if (prop === 'background-color' && opts && opts.shorthand !== false) {
    // Prefer shorthand for background-color by default to beat Tailwind CDN !important rules
    return 'background'
  }
  return prop
}

export function readValue(el: Element, prop: string): ReadResult {
  const html = el as HTMLElement
  let raw = ''
  try {
    raw = html.style ? html.style.getPropertyValue(prop) : ''
  } catch {
    raw = ''
  }
  let effective = ''
  try {
    const cs = window.getComputedStyle(html)
    effective = cs.getPropertyValue(prop) || ''
  } catch {
    effective = ''
  }
  return { raw: raw || '', effective: effective || '' }
}

export function writeValue(
  el: Element,
  prop: string,
  value: string,
  opts?: WriteOpts,
): HistoryEntry {
  const html = el as HTMLElement
  const eid = ensureEid(el)
  const writeProp = resolveWriteProp(prop, opts)
  const writeVal = resolveValue(value, opts)
  const priority = resolvePriority(writeProp, opts)

  const before = readValue(el, writeProp).raw

  try {
    html.style.setProperty(writeProp, writeVal, priority)
  } catch {
    try {
      // Fallback: plain assignment if setProperty rejects the value
      ;(html.style as unknown as Record<string, string>)[writeProp] = writeVal
    } catch {
      /* noop */
    }
  }

  const entry: HistoryEntry = {
    eid,
    kind: 'style',
    prop: writeProp,
    before,
    after: writeVal,
    at: Date.now(),
  }
  push(entry)
  return entry
}

export function bindToken(el: Element, prop: string, cssVar: string): HistoryEntry {
  const token = cssVar.startsWith('--')
    ? cssVar
    : `--${cssVar.replace(/^var\(|\)$/g, '').replace(/^--/, '')}`
  return writeValue(el, prop, `var(${token})`, { token })
}

function sideProp(base: 'padding' | 'margin', side: SideKey): string {
  const map: Record<SideKey, string> = {
    t: `${base}-top`,
    r: `${base}-right`,
    b: `${base}-bottom`,
    l: `${base}-left`,
  }
  return map[side]
}

function readSide(el: Element, base: 'padding' | 'margin', side: SideKey): string {
  const raw = readValue(el, sideProp(base, side)).raw
  if (raw) return raw
  return readValue(el, sideProp(base, side)).effective
}

export function writeSides(
  el: Element,
  sides: { t?: string; r?: string; b?: string; l?: string },
  base: 'padding' | 'margin',
): HistoryEntry[] {
  const provided: SideKey[] = SIDE_KEYS.filter((k) => typeof sides[k] === 'string')
  if (provided.length === 0) return []

  const allFour =
    provided.length === 4 && sides.t === sides.r && sides.r === sides.b && sides.b === sides.l

  if (allFour) {
    const entry = writeValue(el, base, sides.t as string, { important: false })
    return [entry]
  }

  // Build the four effective values, splicing provided over current.
  const resolved: Record<SideKey, string> = {
    t: sides.t ?? readSide(el, base, 't'),
    r: sides.r ?? readSide(el, base, 'r'),
    b: sides.b ?? readSide(el, base, 'b'),
    l: sides.l ?? readSide(el, base, 'l'),
  }

  // If after splicing all four are equal, collapse into a single shorthand write.
  if (
    resolved.t &&
    resolved.t === resolved.r &&
    resolved.r === resolved.b &&
    resolved.b === resolved.l
  ) {
    return [writeValue(el, base, resolved.t, { important: false })]
  }

  const entries: HistoryEntry[] = []
  for (const k of SIDE_KEYS) {
    if (typeof sides[k] !== 'string') continue
    entries.push(writeValue(el, sideProp(base, k), sides[k] as string, { important: false }))
  }
  return entries
}

// Preserved logic from preview-tools-runtime.ts:904-918
export function rgbToHex(rgb: string): string {
  if (!rgb || rgb === 'transparent') return '#ffffff'
  const m: RegExpMatchArray | null = rgb.match(/[\d.]+/g)
  if (!m || m.length < 3) return '#ffffff'
  if (m.length >= 4 && parseFloat(m[3]) === 0) return '#ffffff'
  const h = (n: number): string =>
    Math.max(0, Math.min(255, n | 0))
      .toString(16)
      .padStart(2, '0')
  return '#' + h(+m[0]) + h(+m[1]) + h(+m[2])
}

export function parsePx(s: string): number {
  const n: number = parseFloat(s)
  return Number.isFinite(n) ? n : 0
}
