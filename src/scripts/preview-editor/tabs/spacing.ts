import { CHIP_SCALES, createChipScale, createToggle } from '../controls'
import type { EditorController } from '../shell'
import type { PanelOpenPayload, TabContext, TabDef } from '../types'

const ICON =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="12" height="12" rx="1.5"/><rect x="5" y="5" width="6" height="6" rx="1"/></svg>'

type Base = 'padding' | 'margin'
type Side = 't' | 'r' | 'b' | 'l'

const SIDES: Side[] = ['t', 'r', 'b', 'l']
const SIDE_PROP: Record<Base, Record<Side, string>> = {
  padding: { t: 'padding-top', r: 'padding-right', b: 'padding-bottom', l: 'padding-left' },
  margin: { t: 'margin-top', r: 'margin-right', b: 'margin-bottom', l: 'margin-left' },
}
const SIDE_LABEL: Record<Side, string> = { t: 'Top', r: 'Right', b: 'Bottom', l: 'Left' }

function readSide(state: PanelOpenPayload, base: Base, side: Side): string {
  const prop = SIDE_PROP[base][side]
  return (state.rawStyles[prop] || state.computedStyles[prop] || '').trim()
}

function sidesEqual(state: PanelOpenPayload, base: Base): boolean {
  const t = readSide(state, base, 't')
  const r = readSide(state, base, 'r')
  const b = readSide(state, base, 'b')
  const l = readSide(state, base, 'l')
  return t === r && r === b && b === l && t !== ''
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

function renderSection(body: HTMLElement, ctx: TabContext, base: Base, title: string): void {
  const state = ctx.state
  let uniform = sidesEqual(state, base)
  const container = document.createElement('div')
  body.appendChild(container)

  function rebuild(): void {
    while (container.firstChild) container.removeChild(container.firstChild)

    const toggle = createToggle({
      label: `${title} — same on all sides`,
      current: uniform,
      onChange: (v) => {
        uniform = v
        rebuild()
      },
    })
    container.appendChild(toggle.root)

    if (uniform) {
      const chips = base === 'padding' ? CHIP_SCALES.padding : CHIP_SCALES.margin
      const current = readSide(state, base, 't')
      const scale = createChipScale({
        label: title,
        chips: chips.slice(),
        current: matchChipId(chips, current),
        onPick: (_id, value) => {
          ctx.applySides({ t: value, r: value, b: value, l: value }, base)
        },
      })
      container.appendChild(scale.root)
    } else {
      for (const side of SIDES) {
        const chips = base === 'padding' ? CHIP_SCALES.padding : CHIP_SCALES.margin
        const current = readSide(state, base, side)
        const scale = createChipScale({
          label: `${title} ${SIDE_LABEL[side]}`,
          chips: chips.slice(),
          current: matchChipId(chips, current),
          onPick: (_id, value) => {
            const partial: { [k in Side]?: string } = {}
            partial[side] = value
            ctx.applySides(partial, base)
          },
        })
        container.appendChild(scale.root)
      }
    }
  }

  rebuild()
}

function render(body: HTMLElement, ctx: TabContext): () => void {
  renderSection(body, ctx, 'padding', 'Inside room')
  renderSection(body, ctx, 'margin', 'Outside room')
  return () => {
    /* no listeners */
  }
}

const tab: TabDef = {
  id: 'spacing',
  label: 'Spacing',
  icon: ICON,
  render,
}

export function registerWith(controller: EditorController): void {
  controller.registerTab(tab)
}

export default tab
