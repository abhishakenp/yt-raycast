import { registerTab, type PanelTab, type PanelContext } from '../host'
import { createSwatch, type SwatchControl, type SwatchPickValue } from '../controls/swatch'
import { resolveSwatchForControl } from '../tokens-lookup'
import { writeValue, readValue } from '../../style-apply'

const ICON =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><circle cx="5.5" cy="7" r="0.6" fill="currentColor"/><circle cx="8" cy="5" r="0.6" fill="currentColor"/><circle cx="10.5" cy="7" r="0.6" fill="currentColor"/><circle cx="9" cy="10" r="0.6" fill="currentColor"/></svg>'

const COMMON_NEUTRALS = ['#ffffff', '#f3f4f6', '#d1d5db', '#6b7280', '#1f2937', '#000000']

function sectionContainer(title: string): HTMLElement {
  const wrap = document.createElement('div')
  Object.assign(wrap.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '10px 0',
    borderBottom: '1px solid rgba(124, 58, 237, 0.15)',
  })
  const head = document.createElement('div')
  head.textContent = title
  Object.assign(head.style, {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    opacity: '0.7',
    fontWeight: '700',
  })
  wrap.appendChild(head)
  return wrap
}

function render(root: HTMLElement, ctx: PanelContext): () => void {
  root.innerHTML = ''
  Object.assign(root.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  })

  const swatches: SwatchControl[] = []

  // BACKGROUND
  const bgSection = sectionContainer('Background')
  const bgSwatch = createSwatch({
    label: 'Background',
    tokens: resolveSwatchForControl('background'),
    neutrals: COMMON_NEUTRALS,
    current: readCurrent(ctx.el, 'background-color'),
    allowGradient: true,
    allowImage: true,
    onPick: (v: SwatchPickValue) => {
      writeValue(ctx.el, 'background-color', v.css, {
        token: v.tokenCssVar,
        important: true,
        shorthand: true,
      })
    },
    onUnlink: () => {
      writeValue(ctx.el, 'background-color', 'inherit', {
        important: true,
        shorthand: true,
      })
    },
  })
  swatches.push(bgSwatch)
  bgSection.appendChild(bgSwatch.root)
  root.appendChild(bgSection)

  // TEXT
  const textSection = sectionContainer('Text')
  const textSwatch = createSwatch({
    label: 'Text color',
    tokens: resolveSwatchForControl('color'),
    neutrals: COMMON_NEUTRALS,
    current: readCurrent(ctx.el, 'color'),
    onPick: (v: SwatchPickValue) => {
      writeValue(ctx.el, 'color', v.css, {
        token: v.tokenCssVar,
        important: true,
        shorthand: false,
      })
    },
    onUnlink: () => {
      writeValue(ctx.el, 'color', 'inherit', { important: true, shorthand: false })
    },
  })
  swatches.push(textSwatch)
  textSection.appendChild(textSwatch.root)
  root.appendChild(textSection)

  // BORDER
  const borderSection = sectionContainer('Border')
  const borderSwatch = createSwatch({
    label: 'Border color',
    tokens: resolveSwatchForControl('border-color'),
    neutrals: COMMON_NEUTRALS,
    current: readCurrent(ctx.el, 'border-color'),
    onPick: (v: SwatchPickValue) => {
      writeValue(ctx.el, 'border-color', v.css, {
        token: v.tokenCssVar,
        important: true,
        shorthand: false,
      })
    },
    onUnlink: () => {
      writeValue(ctx.el, 'border-color', 'inherit', { important: true, shorthand: false })
    },
  })
  swatches.push(borderSwatch)
  borderSection.appendChild(borderSwatch.root)
  root.appendChild(borderSection)

  return () => {
    // Controls are rebuilt on re-render; nothing external to detach.
    swatches.length = 0
  }
}

function readCurrent(el: Element, prop: string): { raw: string; effective: string } {
  const r = readValue(el, prop)
  // Background color lives under 'background' shorthand when we write it that way.
  if (prop === 'background-color' && !r.raw) {
    const bg = readValue(el, 'background')
    if (bg.raw) return { raw: bg.raw, effective: r.effective }
  }
  return { raw: r.raw, effective: r.effective }
}

const tab: PanelTab = {
  id: 'colors',
  label: 'Colors',
  icon: ICON,
  render,
  isVisible: () => true,
}

registerTab(tab)

export default tab
