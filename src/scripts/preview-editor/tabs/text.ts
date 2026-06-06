import { CHIP_SCALES, createChipScale, createIconRow, createToggle } from '../controls'
import type { EditorController } from '../shell'
import type { PanelClassification, PanelOpenPayload, TabContext, TabDef } from '../types'

const ICON =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4 H13 M8 4 V13 M5 13 H11"/></svg>'

const ICON_ALIGN_LEFT =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="2" y1="4" x2="12" y2="4"/><line x1="2" y1="8" x2="9" y2="8"/><line x1="2" y1="12" x2="13" y2="12"/></svg>'
const ICON_ALIGN_CENTER =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="3" y1="4" x2="13" y2="4"/><line x1="5" y1="8" x2="11" y2="8"/><line x1="3" y1="12" x2="13" y2="12"/></svg>'
const ICON_ALIGN_RIGHT =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="4" y1="4" x2="14" y2="4"/><line x1="7" y1="8" x2="14" y2="8"/><line x1="3" y1="12" x2="14" y2="12"/></svg>'
const ICON_ALIGN_JUSTIFY =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/></svg>'

function readCurrent(state: PanelOpenPayload, prop: string): string {
  return (state.rawStyles[prop] || state.computedStyles[prop] || '').trim()
}

function matchChipId(
  chips: ReadonlyArray<{ id: string; value: string }>,
  v: string,
): string | undefined {
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

  const size = createChipScale({
    label: 'Size',
    chips: CHIP_SCALES.fontSize.slice(),
    current: matchChipId(CHIP_SCALES.fontSize, readCurrent(state, 'font-size')),
    onPick: (_id, value) => ctx.apply('font-size', value),
  })
  body.appendChild(size.root)

  const weight = createChipScale({
    label: 'Weight',
    chips: CHIP_SCALES.fontWeight.slice(),
    current: matchChipId(CHIP_SCALES.fontWeight, readCurrent(state, 'font-weight')),
    onPick: (_id, value) => ctx.apply('font-weight', value),
  })
  body.appendChild(weight.root)

  const italic = createToggle({
    label: 'Italic',
    current: readCurrent(state, 'font-style') === 'italic',
    onChange: (v) => ctx.apply('font-style', v ? 'italic' : 'normal'),
  })
  body.appendChild(italic.root)

  const underline = createToggle({
    label: 'Underline',
    current: /underline/.test(
      readCurrent(state, 'text-decoration') || readCurrent(state, 'text-decoration-line'),
    ),
    onChange: (v) => ctx.apply('text-decoration', v ? 'underline' : 'none'),
  })
  body.appendChild(underline.root)

  const currentAlign = readCurrent(state, 'text-align') || 'left'
  const align = createIconRow({
    label: 'Align',
    icons: [
      { id: 'left', label: 'Left', svg: ICON_ALIGN_LEFT },
      { id: 'center', label: 'Center', svg: ICON_ALIGN_CENTER },
      { id: 'right', label: 'Right', svg: ICON_ALIGN_RIGHT },
      { id: 'justify', label: 'Justify', svg: ICON_ALIGN_JUSTIFY },
    ],
    current: currentAlign,
    onPick: (id) => ctx.apply('text-align', id),
  })
  body.appendChild(align.root)

  const line = createChipScale({
    label: 'Line height',
    chips: CHIP_SCALES.lineHeight.slice(),
    current: matchChipId(CHIP_SCALES.lineHeight, readCurrent(state, 'line-height')),
    onPick: (_id, value) => ctx.apply('line-height', value),
  })
  body.appendChild(line.root)

  return () => {
    /* no listeners */
  }
}

const tab: TabDef = {
  id: 'text',
  label: 'Text',
  icon: ICON,
  isVisible: (cls: PanelClassification) => cls.canText,
  render,
}

export function registerWith(controller: EditorController): void {
  controller.registerTab(tab)
}

export default tab
