import type { TokenSwatch } from './types'

export const CHIP_SCALES = {
  padding: [
    { id: 'none', label: 'None', value: '0' },
    { id: 'tight', label: 'Tight', value: '4px' },
    { id: 'cozy', label: 'Cozy', value: '8px' },
    { id: 'roomy', label: 'Roomy', value: '16px' },
    { id: 'spacious', label: 'Spacious', value: '24px' },
  ],
  margin: [
    { id: 'none', label: 'None', value: '0' },
    { id: 'tight', label: 'Tight', value: '4px' },
    { id: 'cozy', label: 'Cozy', value: '8px' },
    { id: 'roomy', label: 'Roomy', value: '16px' },
    { id: 'spacious', label: 'Spacious', value: '24px' },
  ],
  radius: [
    { id: 'small', label: 'Small', value: '4px' },
    { id: 'medium', label: 'Medium', value: '10px' },
    { id: 'large', label: 'Large', value: '20px' },
    { id: 'full', label: 'Full', value: '9999px' },
  ],
  fontSize: [
    { id: 'xs', label: 'XS', value: '12px' },
    { id: 's', label: 'S', value: '14px' },
    { id: 'm', label: 'M', value: '16px' },
    { id: 'l', label: 'L', value: '20px' },
    { id: 'xl', label: 'XL', value: '28px' },
    { id: 'xxl', label: 'XXL', value: '40px' },
  ],
  fontWeight: [
    { id: 'light', label: 'Light', value: '300' },
    { id: 'normal', label: 'Normal', value: '400' },
    { id: 'bold', label: 'Bold', value: '700' },
    { id: 'extraBold', label: 'ExtraBold', value: '800' },
  ],
  lineHeight: [
    { id: 'tight', label: 'Tight', value: '1.15' },
    { id: 'normal', label: 'Normal', value: '1.5' },
    { id: 'loose', label: 'Loose', value: '1.8' },
  ],
  shadow: [
    { id: 'none', label: 'None', value: 'none' },
    { id: 'soft', label: 'Soft', value: '0 1px 2px rgba(0,0,0,0.06)' },
    { id: 'medium', label: 'Medium', value: '0 4px 10px rgba(0,0,0,0.10)' },
    { id: 'strong', label: 'Strong', value: '0 10px 25px rgba(0,0,0,0.15)' },
    { id: 'dramatic', label: 'Dramatic', value: '0 25px 50px rgba(0,0,0,0.25)' },
  ],
  gap: [
    { id: 'tight', label: 'Tight', value: '4px' },
    { id: 'cozy', label: 'Cozy', value: '8px' },
    { id: 'roomy', label: 'Roomy', value: '16px' },
    { id: 'spacious', label: 'Spacious', value: '24px' },
  ],
} as const

export type ChipScaleKey = keyof typeof CHIP_SCALES

export const GRADIENT_PRESETS: { id: string; label: string; css: string }[] = [
  { id: 'soft', label: 'Soft', css: 'linear-gradient(135deg, var(--primary), var(--accent))' },
  { id: 'sunset', label: 'Sunset', css: 'linear-gradient(135deg, var(--accent), var(--primary))' },
  { id: 'ocean', label: 'Ocean', css: 'linear-gradient(180deg, var(--primary), var(--muted))' },
  { id: 'emerald', label: 'Emerald', css: 'linear-gradient(135deg, var(--primary), var(--surface))' },
  { id: 'mono', label: 'Monochrome', css: 'linear-gradient(180deg, var(--surface), var(--muted))' },
]

function group(labelText: string): { root: HTMLElement; body: HTMLElement } {
  const root = document.createElement('div')
  root.className = 'sf-control-group'
  const label = document.createElement('div')
  label.className = 'sf-control-label'
  label.textContent = labelText
  root.appendChild(label)
  const body = document.createElement('div')
  Object.assign(body.style, { display: 'flex', flexDirection: 'column', gap: '6px' })
  root.appendChild(body)
  return { root, body }
}

export interface SwatchPickValue {
  css: string
  tokenCssVar?: string
}

export interface SwatchRowOptions {
  label: string
  tokens: TokenSwatch[]
  neutrals?: string[]
  current?: string
  allowGradient?: boolean
  onPick(value: SwatchPickValue): void
  onUnlink?(): void
}

export interface SwatchRowControl {
  root: HTMLElement
  refresh(current: string | undefined): void
}

export function createSwatchRow(opts: SwatchRowOptions): SwatchRowControl {
  const g = group(opts.label)

  const brandRow = document.createElement('div')
  brandRow.className = 'sf-swatch-row'
  g.body.appendChild(brandRow)

  const brandChips: { el: HTMLButtonElement; cssVar: string }[] = []
  for (const t of opts.tokens) {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'sf-swatch'
    b.style.background = t.swatch
    b.setAttribute('data-token', `var(${t.cssVar})`)
    b.setAttribute('data-tip', t.displayLabel)
    b.addEventListener('click', () => {
      opts.onPick({ css: `var(${t.cssVar})`, tokenCssVar: t.cssVar })
    })
    brandRow.appendChild(b)
    brandChips.push({ el: b, cssVar: t.cssVar })
  }

  const neutralChips: { el: HTMLButtonElement; hex: string }[] = []
  if (opts.neutrals && opts.neutrals.length) {
    const nRow = document.createElement('div')
    nRow.className = 'sf-swatch-row'
    for (const hex of opts.neutrals) {
      const b = document.createElement('button')
      b.type = 'button'
      b.className = 'sf-swatch'
      b.style.background = hex
      b.setAttribute('data-tip', hex)
      b.addEventListener('click', () => opts.onPick({ css: hex }))
      nRow.appendChild(b)
      neutralChips.push({ el: b, hex })
    }
    g.body.appendChild(nRow)
  }

  const actions = document.createElement('div')
  Object.assign(actions.style, { display: 'flex', gap: '6px', flexWrap: 'wrap' })
  g.body.appendChild(actions)

  const customBtn = actionButton('Custom')
  const colorInput = document.createElement('input')
  colorInput.type = 'color'
  colorInput.style.display = 'none'
  customBtn.appendChild(colorInput)
  customBtn.addEventListener('click', (e) => {
    if (e.target !== colorInput) colorInput.click()
  })
  colorInput.addEventListener('input', () => opts.onPick({ css: colorInput.value }))
  actions.appendChild(customBtn)

  if (opts.onUnlink) {
    const unlinkBtn = actionButton('Unlink')
    unlinkBtn.addEventListener('click', () => {
      if (opts.onUnlink) opts.onUnlink()
    })
    actions.appendChild(unlinkBtn)
  }

  const gradientChips: { el: HTMLButtonElement; css: string }[] = []
  if (opts.allowGradient) {
    const gLabel = document.createElement('div')
    gLabel.textContent = 'Gradient'
    Object.assign(gLabel.style, {
      fontSize: '10px',
      opacity: '0.55',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginTop: '4px',
    })
    g.body.appendChild(gLabel)
    const gRow = document.createElement('div')
    gRow.className = 'sf-swatch-row'
    for (const p of GRADIENT_PRESETS) {
      const b = document.createElement('button')
      b.type = 'button'
      b.className = 'sf-swatch'
      b.style.background = p.css
      b.setAttribute('data-tip', p.label)
      b.addEventListener('click', () => opts.onPick({ css: p.css }))
      gRow.appendChild(b)
      gradientChips.push({ el: b, css: p.css })
    }
    g.body.appendChild(gRow)
  }

  function highlight(raw: string | undefined): void {
    const v = (raw || '').trim()
    const varMatch = v.match(/var\((--[\w-]+)\)/)
    const activeVar = varMatch ? varMatch[1] : null
    const lowerV = v.toLowerCase()
    for (const c of brandChips) {
      c.el.setAttribute('data-active', c.cssVar === activeVar ? 'true' : 'false')
    }
    for (const n of neutralChips) {
      n.el.setAttribute('data-active', n.hex.toLowerCase() === lowerV ? 'true' : 'false')
    }
    for (const g2 of gradientChips) {
      g2.el.setAttribute('data-active', g2.css === v ? 'true' : 'false')
    }
  }

  highlight(opts.current)

  return {
    root: g.root,
    refresh(current: string | undefined): void {
      highlight(current)
    },
  }
}

function actionButton(text: string): HTMLButtonElement {
  const b = document.createElement('button')
  b.type = 'button'
  b.textContent = text
  Object.assign(b.style, {
    padding: '3px 9px',
    borderRadius: '7px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'transparent',
    color: 'rgba(255,255,255,0.78)',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    position: 'relative',
  })
  return b
}

export interface ChipScaleItem {
  id: string
  label: string
  value: string
}

export interface ChipScaleOptions {
  label: string
  chips: ChipScaleItem[]
  current?: string
  onPick(id: string, value: string): void
}

export interface ChipScaleControl {
  root: HTMLElement
  select(id: string | undefined): void
}

export function createChipScale(opts: ChipScaleOptions): ChipScaleControl {
  const g = group(opts.label)
  const row = document.createElement('div')
  row.className = 'sf-chip-scale'
  row.setAttribute('role', 'radiogroup')
  g.body.appendChild(row)

  const buttons: { el: HTMLButtonElement; chip: ChipScaleItem }[] = []
  let currentId = opts.current

  function paint(): void {
    for (const b of buttons) {
      const active = b.chip.id === currentId
      b.el.setAttribute('data-active', active ? 'true' : 'false')
      b.el.setAttribute('aria-checked', active ? 'true' : 'false')
    }
  }

  for (const c of opts.chips) {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'sf-chip-scale-chip'
    b.textContent = c.label
    b.setAttribute('role', 'radio')
    b.addEventListener('click', () => {
      currentId = c.id
      paint()
      opts.onPick(c.id, c.value)
    })
    row.appendChild(b)
    buttons.push({ el: b, chip: c })
  }

  paint()

  return {
    root: g.root,
    select(id: string | undefined): void {
      currentId = id
      paint()
    },
  }
}

export interface IconRowItem {
  id: string
  label: string
  svg: string
}

export interface IconRowOptions {
  label?: string
  icons: IconRowItem[]
  current?: string | string[]
  multiSelect?: boolean
  onPick(id: string): void
}

export interface IconRowControl {
  root: HTMLElement
  select(ids: string | string[]): void
  toggle(id: string): void
}

export function createIconRow(opts: IconRowOptions): IconRowControl {
  let root: HTMLElement
  let row: HTMLElement
  if (opts.label) {
    const g = group(opts.label)
    root = g.root
    row = document.createElement('div')
    row.className = 'sf-icon-row'
    g.body.appendChild(row)
  } else {
    root = document.createElement('div')
    root.className = 'sf-icon-row'
    row = root
  }

  const active = new Set<string>()
  if (Array.isArray(opts.current)) for (const c of opts.current) active.add(c)
  else if (opts.current) active.add(opts.current)

  const buttons = new Map<string, HTMLButtonElement>()

  function paint(): void {
    for (const [id, b] of buttons) {
      const on = active.has(id)
      b.setAttribute('data-active', on ? 'true' : 'false')
      b.setAttribute('aria-pressed', on ? 'true' : 'false')
    }
  }

  for (const ic of opts.icons) {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'sf-icon-row-btn'
    b.setAttribute('data-tip', ic.label)
    b.setAttribute('aria-label', ic.label)
    b.innerHTML = ic.svg
    b.addEventListener('click', () => {
      if (opts.multiSelect) {
        if (active.has(ic.id)) active.delete(ic.id)
        else active.add(ic.id)
      } else {
        active.clear()
        active.add(ic.id)
      }
      paint()
      opts.onPick(ic.id)
    })
    row.appendChild(b)
    buttons.set(ic.id, b)
  }

  paint()

  return {
    root,
    select(ids: string | string[]): void {
      active.clear()
      if (Array.isArray(ids)) for (const i of ids) active.add(i)
      else if (ids) active.add(ids)
      paint()
    },
    toggle(id: string): void {
      if (active.has(id)) active.delete(id)
      else active.add(id)
      paint()
    },
  }
}

export interface ToggleOptions {
  label: string
  current?: boolean
  onChange(v: boolean): void
}

export interface ToggleControl {
  root: HTMLElement
  set(v: boolean): void
}

export function createToggle(opts: ToggleOptions): ToggleControl {
  const root = document.createElement('div')
  Object.assign(root.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '2px 0',
  })

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'sf-toggle'
  btn.setAttribute('role', 'switch')
  let value = !!opts.current

  function paint(): void {
    btn.setAttribute('data-active', value ? 'true' : 'false')
    btn.setAttribute('aria-checked', value ? 'true' : 'false')
  }
  paint()

  btn.addEventListener('click', () => {
    value = !value
    paint()
    opts.onChange(value)
  })

  const text = document.createElement('span')
  text.textContent = opts.label
  Object.assign(text.style, {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '500',
  })

  root.appendChild(btn)
  root.appendChild(text)

  return {
    root,
    set(v: boolean): void {
      value = !!v
      paint()
    },
  }
}

export interface SliderOptions {
  label: string
  min: number
  max: number
  step?: number
  current?: number
  formatValue?(v: number): string
  onInput(v: number): void
}

export interface SliderControl {
  root: HTMLElement
  set(v: number): void
}

export function createSlider(opts: SliderOptions): SliderControl {
  const g = group(opts.label)
  const head = g.root.querySelector('.sf-control-label') as HTMLElement | null
  const fmt = opts.formatValue || ((v: number) => String(v))

  const wrap = document.createElement('div')
  Object.assign(wrap.style, { display: 'flex', alignItems: 'center', gap: '8px' })

  const input = document.createElement('input')
  input.type = 'range'
  input.className = 'sf-slider'
  input.min = String(opts.min)
  input.max = String(opts.max)
  input.step = String(opts.step ?? 1)
  const start = typeof opts.current === 'number' ? opts.current : opts.min
  input.value = String(start)

  const chip = document.createElement('span')
  Object.assign(chip.style, {
    minWidth: '36px',
    textAlign: 'center',
    fontSize: '10px',
    color: 'rgba(255,255,255,0.78)',
    padding: '2px 8px',
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(0,0,0,0.25)',
  })

  function pct(v: number): string {
    const span = opts.max - opts.min
    if (span <= 0) return '0%'
    return `${(((v - opts.min) / span) * 100).toFixed(2)}%`
  }
  function paint(v: number): void {
    chip.textContent = fmt(v)
    input.style.setProperty('--sf-slider-pct', pct(v))
  }
  paint(start)

  input.addEventListener('input', () => {
    const v = Number(input.value)
    paint(v)
    opts.onInput(v)
  })

  wrap.appendChild(input)
  wrap.appendChild(chip)
  g.body.appendChild(wrap)

  // appease unused lint
  void head

  return {
    root: g.root,
    set(v: number): void {
      input.value = String(v)
      paint(v)
    },
  }
}
