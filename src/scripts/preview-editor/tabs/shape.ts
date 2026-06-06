import { CHIP_SCALES, createChipScale, createIconRow } from '../controls'
import type { EditorController } from '../shell'
import type { PanelOpenPayload, TabContext, TabDef } from '../types'

const ICON =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="2.5" width="11" height="11" rx="3"/></svg>'

const ICON_SQUARE =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="2.5" width="11" height="11"/></svg>'
const ICON_SOFT =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="2.5" width="11" height="11" rx="2"/></svg>'
const ICON_ROUND =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="2.5" width="11" height="11" rx="4"/></svg>'
const ICON_PILL =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="4.5" width="13" height="7" rx="3.5"/></svg>'
const ICON_CIRCLE =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="5.5"/></svg>'

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

function readCurrent(state: PanelOpenPayload, prop: string): string {
  return (state.rawStyles[prop] || state.computedStyles[prop] || '').trim()
}

function matchPresetId(v: string): string | undefined {
  if (!v) return undefined
  for (const p of SHAPE_PRESETS) if (p.value === v) return p.id
  return undefined
}

function matchChipId(v: string): string | undefined {
  if (!v) return undefined
  for (const c of CHIP_SCALES.radius) if (c.value === v) return c.id
  const nv = parseFloat(v)
  if (Number.isFinite(nv)) {
    for (const c of CHIP_SCALES.radius) {
      const cv = parseFloat(c.value)
      if (Number.isFinite(cv) && Math.abs(cv - nv) < 0.51) return c.id
    }
  }
  return undefined
}

function render(body: HTMLElement, ctx: TabContext): () => void {
  const state = ctx.state
  const current = readCurrent(state, 'border-radius')

  const preset = createIconRow({
    label: 'Corner',
    icons: SHAPE_PRESETS.map((p) => ({ id: p.id, label: p.label, svg: p.svg })),
    current: matchPresetId(current),
    onPick: (id) => {
      const p = SHAPE_PRESETS.find((x) => x.id === id)
      if (!p) return
      ctx.apply('border-radius', p.value)
      scale.select(undefined)
    },
  })
  body.appendChild(preset.root)

  const scale = createChipScale({
    label: 'Radius',
    chips: CHIP_SCALES.radius.slice(),
    current: matchChipId(current),
    onPick: (_id, value) => {
      ctx.apply('border-radius', value)
      preset.select(matchPresetId(value) || '')
    },
  })
  body.appendChild(scale.root)

  return () => {
    /* no listeners */
  }
}

const tab: TabDef = {
  id: 'shape',
  label: 'Shape',
  icon: ICON,
  render,
}

export function registerWith(controller: EditorController): void {
  controller.registerTab(tab)
}

export default tab
