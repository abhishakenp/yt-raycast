import { registerTab, PanelTab, PanelContext } from '../host'
import { createChipScale, CHIP_SCALES } from '../controls/chip-scale'
import { createSlider } from '../controls/slider'
import { writeValue, readValue } from '../../style-apply'

function section(title: string): HTMLElement {
  const wrap = document.createElement('div')
  Object.assign(wrap.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '14px',
  })
  const h = document.createElement('div')
  h.textContent = title
  Object.assign(h.style, {
    fontSize: '11px',
    opacity: '0.75',
    fontWeight: '600',
    color: '#e8e4ff',
  })
  wrap.appendChild(h)
  return wrap
}

function matchShadowId(raw: string): string | undefined {
  const v = (raw || '').trim()
  if (!v) return undefined
  for (const c of CHIP_SCALES.shadow) if (c.value === v) return c.id
  return undefined
}

function readOpacityPct(el: Element): number {
  const { raw, effective } = readValue(el, 'opacity')
  const src = raw || effective || '1'
  const n = parseFloat(src)
  if (!Number.isFinite(n)) return 100
  const clamped = Math.max(0, Math.min(1, n))
  return Math.round(clamped * 100)
}

function render(root: HTMLElement, ctx: PanelContext): () => void {
  root.innerHTML = ''

  const currentShadow = readValue(ctx.el, 'box-shadow').raw

  const shadowSection = section('Drop shadow')
  const chipScale = createChipScale({
    label: 'Shadow',
    chips: CHIP_SCALES.shadow.slice(),
    current: matchShadowId(currentShadow),
    onPick(_id: string, value: string): void {
      writeValue(ctx.el, 'box-shadow', value)
    },
  })
  shadowSection.appendChild(chipScale.root)
  root.appendChild(shadowSection)

  const opacitySection = section('Transparency')
  const startPct = readOpacityPct(ctx.el)
  const slider = createSlider({
    label: 'See-through',
    min: 0,
    max: 100,
    step: 1,
    current: startPct,
    formatValue: (v: number): string => `${v}%`,
    onInput(v: number): void {
      const css = (v / 100).toFixed(2)
      writeValue(ctx.el, 'opacity', css)
    },
  })
  opacitySection.appendChild(slider.root)
  root.appendChild(opacitySection)

  return (): void => {
    /* noop */
  }
}

const tab: PanelTab = {
  id: 'shadow',
  label: 'Shadow',
  icon: `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="9" height="9" rx="1.5"/><rect x="5" y="5" width="9" height="9" rx="1.5" fill="currentColor" opacity="0.3" stroke="none"/></svg>`,
  render,
  isVisible: (): boolean => true,
}

registerTab(tab)

export { tab as shadowTab }
