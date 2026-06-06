import type { TokenSwatch } from '../../palette'
import { findTokenForValue } from '../tokens-lookup'

export interface SwatchCurrent {
  raw: string
  effective: string
}

export interface SwatchPickValue {
  css: string
  tokenCssVar?: string
}

export interface SwatchOptions {
  label: string
  tokens: TokenSwatch[]
  neutrals?: string[]
  current?: SwatchCurrent
  allowGradient?: boolean
  allowImage?: boolean
  onPick(value: SwatchPickValue): void
  onUnlink?(): void
}

export interface SwatchControl {
  root: HTMLElement
  refresh(current: SwatchCurrent): void
}

const GRADIENT_PRESETS: { id: string; label: string; css: string }[] = [
  { id: 'soft', label: 'Soft', css: 'linear-gradient(135deg, var(--primary), var(--accent))' },
  { id: 'sunset', label: 'Sunset', css: 'linear-gradient(135deg, var(--accent), var(--primary))' },
  { id: 'ocean', label: 'Ocean', css: 'linear-gradient(180deg, var(--primary), var(--muted))' },
  {
    id: 'emerald',
    label: 'Emerald',
    css: 'linear-gradient(135deg, var(--primary), var(--surface))',
  },
  { id: 'mono', label: 'Monochrome', css: 'linear-gradient(180deg, var(--surface), var(--muted))' },
]

export function createSwatch(opts: SwatchOptions): SwatchControl {
  const root = document.createElement('div')
  root.setAttribute('data-sf-panel-control', 'swatch')
  Object.assign(root.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontFamily: 'system-ui, sans-serif',
    color: '#e8e4ff',
  })

  const label = document.createElement('div')
  label.textContent = opts.label
  Object.assign(label.style, { fontSize: '11px', opacity: '0.75', fontWeight: '600' })
  root.appendChild(label)

  const brandRow = document.createElement('div')
  Object.assign(brandRow.style, { display: 'flex', flexWrap: 'wrap', gap: '6px' })
  root.appendChild(brandRow)

  const brandChips: { el: HTMLButtonElement; swatch: TokenSwatch }[] = []
  for (const t of opts.tokens) {
    const b = makeChip(t.swatch, t.displayLabel)
    b.addEventListener('click', () => {
      opts.onPick({ css: `var(${t.cssVar})`, tokenCssVar: t.cssVar })
    })
    brandRow.appendChild(b)
    brandChips.push({ el: b, swatch: t })
  }

  const neutralChips: { el: HTMLButtonElement; hex: string }[] = []
  if (opts.neutrals && opts.neutrals.length) {
    const nRow = document.createElement('div')
    Object.assign(nRow.style, { display: 'flex', flexWrap: 'wrap', gap: '6px' })
    for (const hex of opts.neutrals) {
      const b = makeChip(hex, hex)
      b.addEventListener('click', () => opts.onPick({ css: hex }))
      nRow.appendChild(b)
      neutralChips.push({ el: b, hex })
    }
    root.appendChild(nRow)
  }

  const actionsRow = document.createElement('div')
  Object.assign(actionsRow.style, { display: 'flex', gap: '6px', flexWrap: 'wrap' })
  root.appendChild(actionsRow)

  const customBtn = makeActionBtn('Custom…')
  const colorInput = document.createElement('input')
  colorInput.type = 'color'
  Object.assign(colorInput.style, { display: 'none' })
  customBtn.appendChild(colorInput)
  customBtn.addEventListener('click', (e) => {
    if (e.target !== colorInput) colorInput.click()
  })
  colorInput.addEventListener('input', () => opts.onPick({ css: colorInput.value }))
  actionsRow.appendChild(customBtn)

  if (opts.onUnlink) {
    const unlinkBtn = makeActionBtn('Unlink')
    unlinkBtn.addEventListener('click', () => opts.onUnlink && opts.onUnlink())
    actionsRow.appendChild(unlinkBtn)
  }

  if (opts.allowImage) {
    const imgBtn = makeActionBtn('Upload image')
    const fileIn = document.createElement('input')
    fileIn.type = 'file'
    fileIn.accept = 'image/*'
    fileIn.style.display = 'none'
    imgBtn.appendChild(fileIn)
    imgBtn.addEventListener('click', (e) => {
      if (e.target !== fileIn) fileIn.click()
    })
    fileIn.addEventListener('change', () => {
      const f = fileIn.files && fileIn.files[0]
      if (!f) return
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = String(reader.result || '')
        if (dataUrl) opts.onPick({ css: `url("${dataUrl}")` })
      }
      reader.readAsDataURL(f)
    })
    actionsRow.appendChild(imgBtn)
  }

  const gradientChips: { el: HTMLButtonElement; css: string }[] = []
  if (opts.allowGradient) {
    const gLabel = document.createElement('div')
    gLabel.textContent = 'Gradient'
    Object.assign(gLabel.style, { fontSize: '10px', opacity: '0.6', marginTop: '4px' })
    root.appendChild(gLabel)
    const gRow = document.createElement('div')
    Object.assign(gRow.style, { display: 'flex', flexWrap: 'wrap', gap: '6px' })
    for (const g of GRADIENT_PRESETS) {
      const b = makeChip(g.css, g.label)
      b.addEventListener('click', () => opts.onPick({ css: g.css }))
      gRow.appendChild(b)
      gradientChips.push({ el: b, css: g.css })
    }
    root.appendChild(gRow)
  }

  function highlight(activeVar?: string, activeHex?: string): void {
    for (const c of brandChips) {
      c.el.style.boxShadow =
        c.swatch.cssVar === activeVar ? '0 0 0 2px #fff, 0 0 0 3px rgba(167,139,250,0.8)' : 'none'
    }
    for (const n of neutralChips) {
      n.el.style.boxShadow =
        n.hex.toLowerCase() === (activeHex || '').toLowerCase()
          ? '0 0 0 2px #fff, 0 0 0 3px rgba(167,139,250,0.8)'
          : 'none'
    }
    for (const g of gradientChips) g.el.style.boxShadow = 'none'
  }

  function refresh(current: SwatchCurrent): void {
    const raw = (current.raw || '').trim()
    const effective = (current.effective || '').trim()
    const m = raw.match(/var\((--[\w-]+)\)/)
    if (m) return highlight(m[1], undefined)
    const tok = findTokenForValue(effective)
    if (tok) return highlight(tok.cssVar, undefined)
    highlight(undefined, effective)
  }

  if (opts.current) refresh(opts.current)

  return { root, refresh }
}

function makeChip(preview: string, title: string): HTMLButtonElement {
  const b = document.createElement('button')
  b.type = 'button'
  b.title = title
  Object.assign(b.style, {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: preview,
    cursor: 'pointer',
    padding: '0',
    flex: '0 0 auto',
  })
  return b
}

function makeActionBtn(text: string): HTMLButtonElement {
  const b = document.createElement('button')
  b.type = 'button'
  b.textContent = text
  Object.assign(b.style, {
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid #3d3758',
    background: 'transparent',
    color: '#e8e4ff',
    fontSize: '11px',
    fontFamily: 'system-ui, sans-serif',
    cursor: 'pointer',
    position: 'relative',
  })
  return b
}
