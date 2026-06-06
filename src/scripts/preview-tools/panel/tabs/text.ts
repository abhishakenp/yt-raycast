import { registerTab, type PanelTab, type PanelContext } from '../host'
import { createChipScale, CHIP_SCALES, type ChipScaleItem } from '../controls/chip-scale'
import { createIconRow } from '../controls/icon-row'
import { createToggle } from '../controls/toggle'
import { writeValue, readValue } from '../../style-apply'
import type { Classification } from '../../targeting'

const ICON =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h10"/><path d="M8 4v9"/><path d="M6 13h4"/></svg>'

const ALIGN_ICONS = [
  {
    id: 'left',
    label: 'Align left',
    svg: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M2 4h12"/><path d="M2 7h8"/><path d="M2 10h12"/><path d="M2 13h6"/></svg>',
  },
  {
    id: 'center',
    label: 'Align center',
    svg: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M2 4h12"/><path d="M4 7h8"/><path d="M2 10h12"/><path d="M5 13h6"/></svg>',
  },
  {
    id: 'right',
    label: 'Align right',
    svg: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M2 4h12"/><path d="M6 7h8"/><path d="M2 10h12"/><path d="M8 13h6"/></svg>',
  },
]

function section(title: string): HTMLElement {
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

function cloneChips(
  src: ReadonlyArray<{ id: string; label: string; value: string }>,
): ChipScaleItem[] {
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

function render(root: HTMLElement, ctx: PanelContext): () => void {
  root.innerHTML = ''
  Object.assign(root.style, { display: 'flex', flexDirection: 'column', gap: '0' })

  const el = ctx.el

  // SIZE
  const sizeSection = section('Size')
  const sizeChips = cloneChips(CHIP_SCALES.fontSize)
  const sizeCtrl = createChipScale({
    label: 'Text size',
    chips: sizeChips,
    current: matchChipId(sizeChips, readValue(el, 'font-size').effective),
    onPick: (_id, value) => writeValue(el, 'font-size', value, { important: false }),
  })
  sizeSection.appendChild(sizeCtrl.root)
  root.appendChild(sizeSection)

  // WEIGHT
  const weightSection = section('Weight')
  const weightChips = cloneChips(CHIP_SCALES.fontWeight)
  const weightCtrl = createChipScale({
    label: 'Thickness',
    chips: weightChips,
    current: matchChipId(weightChips, readValue(el, 'font-weight').effective),
    onPick: (_id, value) => writeValue(el, 'font-weight', value, { important: false }),
  })
  weightSection.appendChild(weightCtrl.root)
  root.appendChild(weightSection)

  // ITALIC + UNDERLINE
  const styleSection = section('Style')
  const italicOn = (readValue(el, 'font-style').effective || '').trim() === 'italic'
  const underlineOn = /underline/.test(readValue(el, 'text-decoration').effective || '')
  const italicCtrl = createToggle({
    label: 'Italic',
    current: italicOn,
    onChange: (on) => writeValue(el, 'font-style', on ? 'italic' : 'normal', { important: false }),
  })
  const underlineCtrl = createToggle({
    label: 'Underline',
    current: underlineOn,
    onChange: (on) =>
      writeValue(el, 'text-decoration', on ? 'underline' : 'none', { important: false }),
  })
  styleSection.appendChild(italicCtrl.root)
  styleSection.appendChild(underlineCtrl.root)
  root.appendChild(styleSection)

  // ALIGN
  const alignSection = section('Align')
  const alignRaw = (readValue(el, 'text-align').effective || '').trim().toLowerCase()
  const alignCurrent = ['left', 'center', 'right'].includes(alignRaw) ? alignRaw : undefined
  const alignCtrl = createIconRow({
    icons: ALIGN_ICONS,
    current: alignCurrent,
    onPick: (id) => writeValue(el, 'text-align', id, { important: false }),
  })
  alignSection.appendChild(alignCtrl.root)
  root.appendChild(alignSection)

  // LINE SPACING
  const lineSection = section('Line spacing')
  const lineChips = cloneChips(CHIP_SCALES.lineHeight)
  const lineCtrl = createChipScale({
    label: 'Spacing between lines',
    chips: lineChips,
    current: matchChipId(lineChips, readValue(el, 'line-height').effective),
    onPick: (_id, value) => writeValue(el, 'line-height', value, { important: false }),
  })
  lineSection.appendChild(lineCtrl.root)
  root.appendChild(lineSection)

  return () => {
    // Controls are rebuilt on re-render.
  }
}

const tab: PanelTab = {
  id: 'text',
  label: 'Text',
  icon: ICON,
  render,
  isVisible: (cls: Classification) => cls.canText === true,
}

registerTab(tab)

export default tab
