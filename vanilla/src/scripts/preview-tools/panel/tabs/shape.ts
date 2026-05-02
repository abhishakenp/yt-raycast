import { registerTab, PanelTab, PanelContext } from '../host'
import { createIconRow, IconRowItem } from '../controls/icon-row'
import { createChipScale, CHIP_SCALES } from '../controls/chip-scale'
import { writeValue, readValue } from '../../style-apply'

const ICON_SQUARE = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="2.5" width="11" height="11"/></svg>`
const ICON_SOFT = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="2.5" width="11" height="11" rx="2"/></svg>`
const ICON_ROUND = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="2.5" width="11" height="11" rx="4"/></svg>`
const ICON_PILL = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="4.5" width="13" height="7" rx="3.5"/></svg>`
const ICON_CIRCLE = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="5.5"/></svg>`

interface ShapePreset {
  id: string
  label: string
  svg: string
  value: string
}

const SHAPE_PRESETS: ShapePreset[] = [
  { id: 'square', label: 'Square', svg: ICON_SQUARE, value: '0' },
  { id: 'soft', label: 'Soft corners', svg: ICON_SOFT, value: '4px' },
  { id: 'round', label: 'Rounded', svg: ICON_ROUND, value: '12px' },
  { id: 'pill', label: 'Pill', svg: ICON_PILL, value: '9999px' },
  { id: 'circle', label: 'Circle', svg: ICON_CIRCLE, value: '50%' },
]

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

function matchPresetId(raw: string): string | undefined {
  const v = (raw || '').trim()
  if (!v) return undefined
  for (const p of SHAPE_PRESETS) if (p.value === v) return p.id
  return undefined
}

function matchChipId(raw: string): string | undefined {
  const v = (raw || '').trim()
  if (!v) return undefined
  for (const c of CHIP_SCALES.radius) if (c.value === v) return c.id
  return undefined
}

function render(root: HTMLElement, ctx: PanelContext): () => void {
  root.innerHTML = ''

  const current = readValue(ctx.el, 'border-radius').raw

  const presetSection = section('Corner roundness')
  const iconItems: IconRowItem[] = SHAPE_PRESETS.map((p) => ({
    id: p.id,
    label: p.label,
    svg: p.svg,
  }))
  const iconRow = createIconRow({
    icons: iconItems,
    current: matchPresetId(current),
    onPick(id: string): void {
      const preset = SHAPE_PRESETS.find((p) => p.id === id)
      if (!preset) return
      writeValue(ctx.el, 'border-radius', preset.value)
      chipScale.select('')
    },
  })
  presetSection.appendChild(iconRow.root)
  root.appendChild(presetSection)

  const chipSection = section('Size')
  const chipScale = createChipScale({
    label: 'Corner size',
    chips: CHIP_SCALES.radius.slice(),
    current: matchChipId(current),
    onPick(_id: string, value: string): void {
      writeValue(ctx.el, 'border-radius', value)
      iconRow.select('')
    },
  })
  chipSection.appendChild(chipScale.root)
  root.appendChild(chipSection)

  return (): void => {
    /* noop */
  }
}

const tab: PanelTab = {
  id: 'shape',
  label: 'Shape',
  icon: `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="2.5" width="11" height="11" rx="3"/></svg>`,
  render,
  isVisible: (): boolean => true,
}

registerTab(tab)

export { tab as shapeTab }
