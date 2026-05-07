import { friendlyLabel } from './panel/labels'

export type TagCategory = 'container' | 'text' | 'image' | 'control' | 'other'

export interface Classification {
  canText: boolean
  canImage: boolean
  isContainer: boolean
  tagCategory: TagCategory
  friendlyLabel: string
}

type HoverCallback = (el: Element | null) => void

const hoverCallbacks: HoverCallback[] = []

export function onHoverChange(cb: HoverCallback): () => void {
  hoverCallbacks.push(cb)
  return () => {
    const i = hoverCallbacks.indexOf(cb)
    if (i >= 0) hoverCallbacks.splice(i, 1)
  }
}

function emitHover(el: Element | null): void {
  for (const cb of hoverCallbacks) {
    try {
      cb(el)
    } catch {
      /* ignore */
    }
  }
}

interface OverlayRefs {
  veil?: Element | null
  highlight?: Element | null
  canvas?: Element | null
}

let overlayRefs: OverlayRefs = {}

export function setOverlayRefs(refs: OverlayRefs): void {
  overlayRefs = { ...overlayRefs, ...refs }
}

const OVERLAY_ATTRS = [
  'data-sf-pt-veil',
  'data-sf-pt-hl',
  'data-sf-pt-draw',
  'data-sf-inline-toolbar',
  'data-sf-panel',
  'data-sf-breadcrumb',
  'data-sf-friendly-label',
]

function hasOverlayAncestor(el: Element | null): boolean {
  let cur: Element | null = el
  while (cur && cur.nodeType === 1) {
    for (const attr of OVERLAY_ATTRS) {
      if (cur.getAttribute && cur.getAttribute(attr) != null) return true
    }
    cur = cur.parentElement
  }
  return false
}

export function isOverlayNode(el: Node | null): boolean {
  if (!el || el.nodeType !== 1) return true
  const element: Element = el as Element
  if (overlayRefs.veil && element === overlayRefs.veil) return true
  if (overlayRefs.highlight && element === overlayRefs.highlight) return true
  if (overlayRefs.canvas && element === overlayRefs.canvas) return true
  if (element.getAttribute('data-sf-pt-veil') != null) return true
  if (element.getAttribute('data-sf-pt-hl') != null) return true
  if (element.getAttribute('data-sf-pt-draw') != null) return true
  if (element.getAttribute('data-sf-inline-toolbar') != null) return true
  if (element.getAttribute('data-sf-panel') != null) return true
  if (element.getAttribute('data-sf-breadcrumb') != null) return true
  if (element.getAttribute('data-sf-friendly-label') != null) return true
  if (hasOverlayAncestor(element.parentElement)) return true
  return false
}

export function pickTarget(ev: MouseEvent | PointerEvent): Element | null {
  let list: Element[] = []
  try {
    list = document.elementsFromPoint(ev.clientX, ev.clientY)
  } catch {
    return null
  }
  for (let i = 0; i < list.length; i++) {
    const el: Element = list[i]
    if (isOverlayNode(el)) continue
    const tag: string = el.tagName
    if (tag === 'HTML' || tag === 'BODY') continue
    return el
  }
  return null
}

function ensureHighlight(): HTMLElement {
  let h: HTMLElement | null = (overlayRefs.highlight as HTMLElement) || null
  if (h && document.contains(h)) return h
  h = document.createElement('div')
  h.setAttribute('data-sf-pt-hl', '1')
  Object.assign(h.style, {
    position: 'fixed',
    pointerEvents: 'none',
    border: '2px solid #7c3aed',
    borderRadius: '4px',
    zIndex: '2147482010',
    display: 'none',
    boxSizing: 'border-box',
  })
  document.body.appendChild(h)
  overlayRefs.highlight = h
  return h
}

let lastHover: Element | null = null

export function syncHighlight(el: Element | null): void {
  const h: HTMLElement = ensureHighlight()
  if (!el || !el.getBoundingClientRect) {
    h.style.display = 'none'
    if (lastHover !== null) {
      lastHover = null
      emitHover(null)
    }
    return
  }
  const r: DOMRect = el.getBoundingClientRect()
  if (r.width < 1 && r.height < 1) {
    h.style.display = 'none'
    if (lastHover !== null) {
      lastHover = null
      emitHover(null)
    }
    return
  }
  h.style.display = 'block'
  h.style.left = r.left + 'px'
  h.style.top = r.top + 'px'
  h.style.width = r.width + 'px'
  h.style.height = r.height + 'px'
  if (lastHover !== el) {
    lastHover = el
    emitHover(el)
  }
}

const CONTAINER_TAGS: Record<string, number> = {
  DIV: 1,
  SECTION: 1,
  ARTICLE: 1,
  HEADER: 1,
  FOOTER: 1,
  NAV: 1,
  MAIN: 1,
  ASIDE: 1,
}

const TEXT_TAGS: Record<string, number> = {
  P: 1,
  H1: 1,
  H2: 1,
  H3: 1,
  H4: 1,
  H5: 1,
  H6: 1,
  SPAN: 1,
  A: 1,
  LI: 1,
  LABEL: 1,
  FIGCAPTION: 1,
  TD: 1,
  TH: 1,
  BLOCKQUOTE: 1,
  SMALL: 1,
  STRONG: 1,
  EM: 1,
  B: 1,
  I: 1,
  CODE: 1,
  PRE: 1,
}

const CONTROL_TAGS: Record<string, number> = {
  BUTTON: 1,
  INPUT: 1,
  TEXTAREA: 1,
  SELECT: 1,
}

const MEDIA_TAGS: Record<string, number> = {
  SVG: 1,
  VIDEO: 1,
  CANVAS: 1,
  IFRAME: 1,
}

function hasElementChildren(el: Element): boolean {
  const kids = el.children
  return !!(kids && kids.length > 0)
}

function hasNonEmptyText(el: Element): boolean {
  const t = el.textContent
  return !!(t && t.trim().length > 0)
}

export function classify(el: Element): Classification {
  const label = friendlyLabel(el)
  if (!el || el.nodeType !== 1) {
    return { canText: false, canImage: false, isContainer: false, tagCategory: 'other', friendlyLabel: label }
  }
  const t = el.tagName

  if (t === 'IMG') {
    return { canText: false, canImage: true, isContainer: false, tagCategory: 'image', friendlyLabel: label }
  }

  if (MEDIA_TAGS[t]) {
    return { canText: false, canImage: false, isContainer: false, tagCategory: 'other', friendlyLabel: label }
  }

  if (CONTROL_TAGS[t]) {
    const canText = t === 'BUTTON'
    return { canText, canImage: false, isContainer: false, tagCategory: 'control', friendlyLabel: label }
  }

  if (CONTAINER_TAGS[t]) {
    // text-leaf heuristic: DIV with no element children but non-empty text is editable
    if ((t === 'DIV') && !hasElementChildren(el) && hasNonEmptyText(el)) {
      return { canText: true, canImage: false, isContainer: false, tagCategory: 'text', friendlyLabel: label }
    }
    return { canText: false, canImage: false, isContainer: true, tagCategory: 'container', friendlyLabel: label }
  }

  if (t === 'SPAN') {
    if (!hasElementChildren(el) && hasNonEmptyText(el)) {
      return { canText: true, canImage: false, isContainer: false, tagCategory: 'text', friendlyLabel: label }
    }
    return { canText: false, canImage: false, isContainer: false, tagCategory: 'text', friendlyLabel: label }
  }

  if (TEXT_TAGS[t]) {
    return { canText: true, canImage: false, isContainer: false, tagCategory: 'text', friendlyLabel: label }
  }

  return { canText: false, canImage: false, isContainer: false, tagCategory: 'other', friendlyLabel: label }
}
