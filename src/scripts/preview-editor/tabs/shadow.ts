import { CHIP_SCALES, createChipScale, createSlider } from '../controls'
import type { EditorController } from '../shell'
import type { PanelOpenPayload, TabContext, TabDef } from '../types'

const ICON =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="5" y="5" width="8" height="8" rx="1.5" opacity="0.45"/></svg>'

function readCurrent(state: PanelOpenPayload, prop: string): string {
  return (state.rawStyles[prop] || state.computedStyles[prop] || '').trim()
}

function matchShadowId(v: string): string | undefined {
  if (!v) return undefined
  for (const c of CHIP_SCALES.shadow) if (c.value === v) return c.id
  // computed often uses "rgb(...)" not "rgba(...)" style — fall back to substring heuristic
  for (const c of CHIP_SCALES.shadow) {
    if (c.id === 'none') {
      if (v === 'none' || v === '') return 'none'
      continue
    }
    if (v.indexOf(c.value.split(' ')[0]) !== -1 && v.indexOf(c.value.split(' ')[1] || '') !== -1) {
      return c.id
    }
  }
  return undefined
}

function parseOpacity(v: string): number {
  if (!v) return 100
  const n = parseFloat(v)
  if (!Number.isFinite(n)) return 100
  return Math.max(0, Math.min(100, Math.round(n * 100)))
}

function render(body: HTMLElement, ctx: TabContext): () => void {
  const state = ctx.state
  const currentShadow = readCurrent(state, 'box-shadow')
  const currentOpacity = parseOpacity(readCurrent(state, 'opacity'))

  const scale = createChipScale({
    label: 'Shadow',
    chips: CHIP_SCALES.shadow.slice(),
    current: matchShadowId(currentShadow),
    onPick: (_id, value) => ctx.apply('box-shadow', value),
  })
  body.appendChild(scale.root)

  const slider = createSlider({
    label: 'Opacity',
    min: 0,
    max: 100,
    step: 1,
    current: currentOpacity,
    formatValue: (v) => `${v}%`,
    onInput: (v) => ctx.apply('opacity', (v / 100).toFixed(2)),
  })
  body.appendChild(slider.root)

  return () => {
    /* no listeners */
  }
}

const tab: TabDef = {
  id: 'shadow',
  label: 'Shadow',
  icon: ICON,
  render,
}

export function registerWith(controller: EditorController): void {
  controller.registerTab(tab)
}

export default tab
