import { registerTab, type PanelTab, type PanelContext } from '../host'
import { createChipScale, CHIP_SCALES, type ChipScaleItem } from '../controls/chip-scale'
import { createToggle } from '../controls/toggle'
import { writeSides, readValue } from '../../style-apply'

const ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="12" height="12" rx="1.5"/><rect x="5" y="5" width="6" height="6" rx="1"/></svg>'

type Base = 'padding' | 'margin'
type Side = 't' | 'r' | 'b' | 'l'

function section(title: string): HTMLElement {
  const wrap = document.createElement('div')
  Object.assign(wrap.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
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

function cloneChips(src: ReadonlyArray<{ id: string; label: string; value: string }>): ChipScaleItem[] {
  return src.map((c) => ({ id: c.id, label: c.label, value: c.value }))
}

function matchChipId(chips: ChipScaleItem[], effective: string): string | undefined {
  const v = (effective || '').trim()
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

function readSideEffective(el: Element, base: Base, side: Side): string {
  const map: Record<Side, string> = {
    t: `${base}-top`,
    r: `${base}-right`,
    b: `${base}-bottom`,
    l: `${base}-left`,
  }
  return readValue(el, map[side]).effective
}

function allFourEqual(el: Element, base: Base): string | null {
  const t = (readSideEffective(el, base, 't') || '').trim()
  const r = (readSideEffective(el, base, 'r') || '').trim()
  const b = (readSideEffective(el, base, 'b') || '').trim()
  const l = (readSideEffective(el, base, 'l') || '').trim()
  if (t && t === r && r === b && b === l) return t
  return null
}

interface RegionOpts {
  title: string
  base: Base
  sideLabels: Record<Side, string>
}

function buildRegion(el: Element, ro: RegionOpts): HTMLElement {
  const root = section(ro.title)
  const chipsSource = ro.base === 'padding' ? CHIP_SCALES.padding : CHIP_SCALES.margin

  // Initial state: "Same on all sides" ON when all four sides are equal or unset.
  const allEq = allFourEqual(el, ro.base)
  let sameAll = allEq !== null

  const scaleHost = document.createElement('div')
  root.appendChild(scaleHost)

  const toggleCtrl = createToggle({
    label: 'Same on all sides',
    current: sameAll,
    onChange: (on) => {
      sameAll = on
      renderScale()
    },
  })
  root.appendChild(toggleCtrl.root)

  function renderScale(): void {
    scaleHost.innerHTML = ''
    if (sameAll) {
      const chips = cloneChips(chipsSource)
      const current = matchChipId(chips, allFourEqual(el, ro.base) || '')
      const ctrl = createChipScale({
        label: ro.base === 'padding' ? 'Inside room size' : 'Outside room size',
        chips,
        current,
        onPick: (_id, value) => {
          writeSides(el, { t: value, r: value, b: value, l: value }, ro.base)
        },
      })
      scaleHost.appendChild(ctrl.root)
      return
    }

    const sides: Side[] = ['t', 'r', 'b', 'l']
    for (const s of sides) {
      const chips = cloneChips(chipsSource)
      const current = matchChipId(chips, readSideEffective(el, ro.base, s))
      const ctrl = createChipScale({
        label: ro.sideLabels[s],
        chips,
        current,
        onPick: (_id, value) => {
          const change: { t?: string; r?: string; b?: string; l?: string } = {}
          change[s] = value
          writeSides(el, change, ro.base)
        },
      })
      scaleHost.appendChild(ctrl.root)
    }
  }

  renderScale()
  return root
}

function render(root: HTMLElement, ctx: PanelContext): () => void {
  root.innerHTML = ''
  Object.assign(root.style, { display: 'flex', flexDirection: 'column', gap: '0' })

  const el = ctx.el

  const insideSides: Record<Side, string> = {
    t: 'Top',
    r: 'Right',
    b: 'Bottom',
    l: 'Left',
  }
  const outsideSides: Record<Side, string> = {
    t: 'Top',
    r: 'Right',
    b: 'Bottom',
    l: 'Left',
  }

  root.appendChild(
    buildRegion(el, {
      title: 'Inside room',
      base: 'padding',
      sideLabels: insideSides,
    }),
  )
  root.appendChild(
    buildRegion(el, {
      title: 'Outside room',
      base: 'margin',
      sideLabels: outsideSides,
    }),
  )

  return () => {
    // Controls are rebuilt on re-render.
  }
}

const tab: PanelTab = {
  id: 'spacing',
  label: 'Spacing',
  icon: ICON,
  render,
  isVisible: () => true,
}

registerTab(tab)

export default tab
