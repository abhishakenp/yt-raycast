import { registerTab, PanelTab, PanelContext } from '../host'
import { Classification } from '../../targeting'
import { createIconRow, IconRowItem } from '../controls/icon-row'
import { createChipScale, CHIP_SCALES } from '../controls/chip-scale'
import { writeValue, readValue } from '../../style-apply'

const ICON_STACK = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="2.5" width="10" height="3" rx="0.5"/><rect x="3" y="6.5" width="10" height="3" rx="0.5"/><rect x="3" y="10.5" width="10" height="3" rx="0.5"/></svg>`
const ICON_ROW = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="3" width="3" height="10" rx="0.5"/><rect x="6.5" y="3" width="3" height="10" rx="0.5"/><rect x="10.5" y="3" width="3" height="10" rx="0.5"/></svg>`
const ICON_GRID = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="2.5" width="5" height="5" rx="0.5"/><rect x="8.5" y="2.5" width="5" height="5" rx="0.5"/><rect x="2.5" y="8.5" width="5" height="5" rx="0.5"/><rect x="8.5" y="8.5" width="5" height="5" rx="0.5"/></svg>`

const ICON_ALIGN_LEFT = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="2" y1="2" x2="2" y2="14"/><rect x="3" y="4" width="7" height="3"/><rect x="3" y="9" width="10" height="3"/></svg>`
const ICON_ALIGN_CENTER_H = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="8" y1="2" x2="8" y2="14"/><rect x="4.5" y="4" width="7" height="3"/><rect x="3" y="9" width="10" height="3"/></svg>`
const ICON_ALIGN_RIGHT = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="14" y1="2" x2="14" y2="14"/><rect x="6" y="4" width="7" height="3"/><rect x="3" y="9" width="10" height="3"/></svg>`
const ICON_ALIGN_TOP = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="2" y1="2" x2="14" y2="2"/><rect x="4" y="3" width="3" height="7"/><rect x="9" y="3" width="3" height="10"/></svg>`
const ICON_ALIGN_MIDDLE = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="2" y1="8" x2="14" y2="8"/><rect x="4" y="4.5" width="3" height="7"/><rect x="9" y="3" width="3" height="10"/></svg>`
const ICON_ALIGN_BOTTOM = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="2" y1="14" x2="14" y2="14"/><rect x="4" y="6" width="3" height="7"/><rect x="9" y="3" width="3" height="10"/></svg>`

interface Arrangement {
  id: string
  label: string
  svg: string
  display: string
  direction?: string
  extra?: { prop: string; value: string }[]
}

const ARRANGEMENTS: Arrangement[] = [
  {
    id: 'stack',
    label: 'Stack vertically',
    svg: ICON_STACK,
    display: 'flex',
    direction: 'column',
  },
  {
    id: 'row',
    label: 'Side-by-side',
    svg: ICON_ROW,
    display: 'flex',
    direction: 'row',
  },
  {
    id: 'grid',
    label: 'Grid',
    svg: ICON_GRID,
    display: 'grid',
    extra: [{ prop: 'grid-template-columns', value: 'repeat(auto-fit, minmax(200px, 1fr))' }],
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

function matchArrangementId(el: Element): string | undefined {
  const display = (readValue(el, 'display').raw || readValue(el, 'display').effective || '').trim()
  const direction = (
    readValue(el, 'flex-direction').raw ||
    readValue(el, 'flex-direction').effective ||
    ''
  ).trim()
  if (display === 'grid') return 'grid'
  if (display === 'flex') {
    if (direction === 'column' || direction === 'column-reverse') return 'stack'
    return 'row'
  }
  return undefined
}

function matchJustifyId(el: Element): string | undefined {
  const v = (
    readValue(el, 'justify-content').raw ||
    readValue(el, 'justify-content').effective ||
    ''
  ).trim()
  for (const key of Object.keys(JUSTIFY_MAP)) {
    if (JUSTIFY_MAP[key] === v) return key
  }
  return undefined
}

function matchAlignId(el: Element): string | undefined {
  const v = (
    readValue(el, 'align-items').raw ||
    readValue(el, 'align-items').effective ||
    ''
  ).trim()
  for (const key of Object.keys(ALIGN_MAP)) {
    if (ALIGN_MAP[key] === v) return key
  }
  return undefined
}

function matchGapId(el: Element): string | undefined {
  const raw = (readValue(el, 'gap').raw || '').trim()
  if (!raw) return undefined
  for (const c of CHIP_SCALES.gap) if (c.value === raw) return c.id
  return undefined
}

function applyArrangement(el: Element, a: Arrangement): void {
  writeValue(el, 'display', a.display)
  if (a.direction) writeValue(el, 'flex-direction', a.direction)
  if (a.extra) {
    for (const e of a.extra) writeValue(el, e.prop, e.value)
  }
}

function render(root: HTMLElement, ctx: PanelContext): () => void {
  root.innerHTML = ''

  const arrangementSection = section('Arrangement')
  const arrangementItems: IconRowItem[] = ARRANGEMENTS.map((a) => ({
    id: a.id,
    label: a.label,
    svg: a.svg,
  }))
  const arrangementRow = createIconRow({
    icons: arrangementItems,
    current: matchArrangementId(ctx.el),
    onPick(id: string): void {
      const a = ARRANGEMENTS.find((x) => x.id === id)
      if (!a) return
      applyArrangement(ctx.el, a)
    },
  })
  arrangementSection.appendChild(arrangementRow.root)
  root.appendChild(arrangementSection)

  const alignSection = section('Alignment')
  const alignItems: IconRowItem[] = [
    { id: 'left', label: 'Align left', svg: ICON_ALIGN_LEFT },
    { id: 'center', label: 'Align center', svg: ICON_ALIGN_CENTER_H },
    { id: 'right', label: 'Align right', svg: ICON_ALIGN_RIGHT },
    { id: 'top', label: 'Align top', svg: ICON_ALIGN_TOP },
    { id: 'middle', label: 'Align middle', svg: ICON_ALIGN_MIDDLE },
    { id: 'bottom', label: 'Align bottom', svg: ICON_ALIGN_BOTTOM },
  ]
  // We maintain two axes independently. Icon-row is used in multiSelect mode
  // as a plain visual surface; we drive its active set manually so that one
  // horizontal and one vertical can light up at the same time.
  const axisState: { h?: string; v?: string } = {
    h: matchJustifyId(ctx.el),
    v: matchAlignId(ctx.el),
  }
  const alignRow = createIconRow({
    icons: alignItems,
    multiSelect: true,
    onPick(id: string): void {
      if (id in JUSTIFY_MAP) {
        if (axisState.h && axisState.h !== id) alignRow.toggle(axisState.h)
        // createIconRow already toggled `id` itself; if user re-clicked the
        // same active id it's now off — reflect that by clearing state.
        axisState.h = axisState.h === id ? undefined : id
        if (axisState.h) writeValue(ctx.el, 'justify-content', JUSTIFY_MAP[id])
      } else if (id in ALIGN_MAP) {
        if (axisState.v && axisState.v !== id) alignRow.toggle(axisState.v)
        axisState.v = axisState.v === id ? undefined : id
        if (axisState.v) writeValue(ctx.el, 'align-items', ALIGN_MAP[id])
      }
    },
  })
  // Prime both axes visually after construction.
  if (axisState.h) alignRow.toggle(axisState.h)
  if (axisState.v) alignRow.toggle(axisState.v)
  alignSection.appendChild(alignRow.root)
  root.appendChild(alignSection)

  const gapSection = section('Space between')
  const gapScale = createChipScale({
    label: 'Gap',
    chips: CHIP_SCALES.gap.slice(),
    current: matchGapId(ctx.el),
    onPick(_id: string, value: string): void {
      writeValue(ctx.el, 'gap', value)
    },
  })
  gapSection.appendChild(gapScale.root)
  root.appendChild(gapSection)

  return (): void => {
    /* noop */
  }
}

const tab: PanelTab = {
  id: 'layout',
  label: 'Layout',
  icon: `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="2.5" width="5" height="5"/><rect x="8.5" y="2.5" width="5" height="5"/><rect x="2.5" y="8.5" width="11" height="5"/></svg>`,
  render,
  isVisible: (cls: Classification): boolean => cls.isContainer === true,
}

registerTab(tab)

export { tab as layoutTab }
