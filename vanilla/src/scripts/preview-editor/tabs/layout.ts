import { CHIP_SCALES, createChipScale, createIconRow } from '../controls'
import type { EditorController } from '../shell'
import type { PanelClassification, PanelOpenPayload, TabContext, TabDef } from '../types'

const ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="2.5" width="4.5" height="4.5"/><rect x="9" y="2.5" width="4.5" height="4.5"/><rect x="2.5" y="9" width="4.5" height="4.5"/><rect x="9" y="9" width="4.5" height="4.5"/></svg>'

const ICON_STACK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="2.5" width="10" height="3" rx="0.5"/><rect x="3" y="6.5" width="10" height="3" rx="0.5"/><rect x="3" y="10.5" width="10" height="3" rx="0.5"/></svg>'
const ICON_ROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="3" width="3" height="10" rx="0.5"/><rect x="6.5" y="3" width="3" height="10" rx="0.5"/><rect x="10.5" y="3" width="3" height="10" rx="0.5"/></svg>'
const ICON_GRID = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="2.5" width="5" height="5" rx="0.5"/><rect x="8.5" y="2.5" width="5" height="5" rx="0.5"/><rect x="2.5" y="8.5" width="5" height="5" rx="0.5"/><rect x="8.5" y="8.5" width="5" height="5" rx="0.5"/></svg>'

const ICON_ALIGN_LEFT = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="2" y1="2" x2="2" y2="14"/><rect x="3" y="4" width="7" height="3"/><rect x="3" y="9" width="10" height="3"/></svg>'
const ICON_ALIGN_CENTER_H = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="8" y1="2" x2="8" y2="14"/><rect x="4.5" y="4" width="7" height="3"/><rect x="3" y="9" width="10" height="3"/></svg>'
const ICON_ALIGN_RIGHT = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="14" y1="2" x2="14" y2="14"/><rect x="6" y="4" width="7" height="3"/><rect x="3" y="9" width="10" height="3"/></svg>'
const ICON_ALIGN_TOP = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="2" y1="2" x2="14" y2="2"/><rect x="4" y="3" width="3" height="7"/><rect x="9" y="3" width="3" height="10"/></svg>'
const ICON_ALIGN_MIDDLE = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="2" y1="8" x2="14" y2="8"/><rect x="4" y="4.5" width="3" height="7"/><rect x="9" y="3" width="3" height="10"/></svg>'
const ICON_ALIGN_BOTTOM = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="2" y1="14" x2="14" y2="14"/><rect x="4" y="6" width="3" height="7"/><rect x="9" y="3" width="3" height="10"/></svg>'

interface Arrangement {
  id: string
  label: string
  svg: string
  display: string
  direction?: string
  extras?: { prop: string; value: string }[]
}

const ARRANGEMENTS: Arrangement[] = [
  { id: 'stack', label: 'Stack vertically', svg: ICON_STACK, display: 'flex', direction: 'column' },
  { id: 'row', label: 'Side-by-side', svg: ICON_ROW, display: 'flex', direction: 'row' },
  {
    id: 'grid',
    label: 'Grid',
    svg: ICON_GRID,
    display: 'grid',
    extras: [{ prop: 'grid-template-columns', value: 'repeat(auto-fit, minmax(200px, 1fr))' }],
  },
]

const JUSTIFY_MAP: Record<string, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
}
const ALIGN_MAP: Record<string, string> = {
  top: 'flex-start',
  middle: 'center',
  bottom: 'flex-end',
}

function readCurrent(state: PanelOpenPayload, prop: string): string {
  return (state.rawStyles[prop] || state.computedStyles[prop] || '').trim()
}

function currentArrangement(state: PanelOpenPayload): string | undefined {
  const display = readCurrent(state, 'display')
  if (display === 'grid') return 'grid'
  if (display === 'flex') {
    const dir = readCurrent(state, 'flex-direction')
    return dir === 'column' ? 'stack' : 'row'
  }
  return undefined
}

function currentAlignIds(state: PanelOpenPayload): string[] {
  const out: string[] = []
  const jc = readCurrent(state, 'justify-content')
  for (const k of Object.keys(JUSTIFY_MAP)) {
    if (JUSTIFY_MAP[k] === jc) {
      out.push(k)
      break
    }
  }
  const ai = readCurrent(state, 'align-items')
  for (const k of Object.keys(ALIGN_MAP)) {
    if (ALIGN_MAP[k] === ai) {
      out.push(k)
      break
    }
  }
  return out
}

function matchChipId(chips: ReadonlyArray<{ id: string; value: string }>, v: string): string | undefined {
  if (!v) return undefined
  const hit = chips.find((c) => c.value === v)
  if (hit) return hit.id
  const nv = parseFloat(v)
  if (Number.isFinite(nv)) {
    const hit2 = chips.find((c) => {
      const cv = parseFloat(c.value)
      return Number.isFinite(cv) && Math.abs(cv - nv) < 0.51
    })
    if (hit2) return hit2.id
  }
  return undefined
}

function render(body: HTMLElement, ctx: TabContext): () => void {
  const state = ctx.state

  const arrangement = createIconRow({
    label: 'Arrangement',
    icons: ARRANGEMENTS.map((a) => ({ id: a.id, label: a.label, svg: a.svg })),
    current: currentArrangement(state),
    onPick: (id) => {
      const a = ARRANGEMENTS.find((x) => x.id === id)
      if (!a) return
      ctx.apply('display', a.display)
      if (a.display === 'flex' && a.direction) {
        ctx.apply('flex-direction', a.direction)
      }
      if (a.extras) {
        for (const ex of a.extras) ctx.apply(ex.prop, ex.value)
      }
    },
  })
  body.appendChild(arrangement.root)

  const align = createIconRow({
    label: 'Align',
    multiSelect: true,
    icons: [
      { id: 'left', label: 'Left', svg: ICON_ALIGN_LEFT },
      { id: 'center', label: 'Center', svg: ICON_ALIGN_CENTER_H },
      { id: 'right', label: 'Right', svg: ICON_ALIGN_RIGHT },
      { id: 'top', label: 'Top', svg: ICON_ALIGN_TOP },
      { id: 'middle', label: 'Middle', svg: ICON_ALIGN_MIDDLE },
      { id: 'bottom', label: 'Bottom', svg: ICON_ALIGN_BOTTOM },
    ],
    current: currentAlignIds(state),
    onPick: (id) => {
      if (JUSTIFY_MAP[id]) ctx.apply('justify-content', JUSTIFY_MAP[id])
      if (ALIGN_MAP[id]) ctx.apply('align-items', ALIGN_MAP[id])
    },
  })
  body.appendChild(align.root)

  const gap = createChipScale({
    label: 'Gap',
    chips: CHIP_SCALES.gap.slice(),
    current: matchChipId(CHIP_SCALES.gap, readCurrent(state, 'gap')),
    onPick: (_id, value) => ctx.apply('gap', value),
  })
  body.appendChild(gap.root)

  return () => {
    /* no listeners */
  }
}

const tab: TabDef = {
  id: 'layout',
  label: 'Layout',
  icon: ICON,
  isVisible: (cls: PanelClassification) => cls.isContainer,
  render,
}

export function registerWith(controller: EditorController): void {
  controller.registerTab(tab)
}

export default tab
