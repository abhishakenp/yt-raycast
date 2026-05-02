import { ensureEid } from '../identity'
import { post } from '../bridge'
import { setActive, state } from '../state'
import { Classification, classify } from '../targeting'
import { buildTokensVocabulary, type TokenSwatch } from '../palette'
import { friendlyLabel } from '../panel/labels'

export interface ElementEditorHandle {
  open(el: Element, classification: Classification): void
  close(): void
  isOpen(): boolean
  activeElement(): Element | null
  reselect(next: Element): void
}

export interface ElementEditorOpts {
  panel?: {
    open?(el: Element, classification: Classification): void
    close?(): void
    refresh?(): void
  }
  onHoverOutside?: (el: Element | null) => void
}

export interface BreadcrumbEntry {
  eid: string
  label: string
  tagName: string
}

export interface PanelClassificationPayload {
  canText: boolean
  canImage: boolean
  isContainer: boolean
  tagCategory: string
}

export interface PanelOpenPayload {
  eid: string
  friendlyLabel: string
  tagName: string
  classification: PanelClassificationPayload
  thumbnailHtml: string
  computedStyles: Record<string, string>
  rawStyles: Record<string, string>
  tokens: TokenSwatch[]
  breadcrumb: BreadcrumbEntry[]
}

interface ActiveState {
  el: Element
  classification: Classification
}

let currentActive: ActiveState | null = null

// Whitelist mirrored from panel/tabs/ai.ts — the 42-prop AI payload set.
const COMPUTED_PROPS: string[] = [
  'display', 'position', 'width', 'height', 'min-width', 'min-height',
  'max-width', 'max-height', 'margin', 'padding', 'background',
  'background-color', 'background-image', 'color', 'border',
  'border-radius', 'box-shadow', 'opacity', 'font-family', 'font-size',
  'font-weight', 'font-style', 'line-height', 'letter-spacing',
  'text-align', 'text-decoration', 'text-transform', 'flex',
  'flex-direction', 'flex-wrap', 'gap', 'grid-template-columns',
  'justify-content', 'align-items', 'align-content', 'overflow',
  'z-index', 'cursor', 'transition', 'transform', 'filter',
  'visibility', 'outline',
]

const SANITIZE_STRIP_ATTRS = /\s(?:contenteditable|data-sf-[\w-]+)="[^"]*"/gi
const SANITIZE_STRIP_SCRIPTS = /<script[\s\S]*?<\/script>/gi
const SANITIZE_STRIP_STYLE_TAGS = /<style[\s\S]*?<\/style>/gi

function sanitizeThumbnailHtml(el: Element): string {
  let html = ''
  try {
    html = (el as HTMLElement).outerHTML || ''
  } catch {
    html = ''
  }
  if (!html) return ''
  let out = html
  out = out.replace(SANITIZE_STRIP_SCRIPTS, '')
  out = out.replace(SANITIZE_STRIP_STYLE_TAGS, '')
  out = out.replace(SANITIZE_STRIP_ATTRS, '')
  // Drop any single `style` attribute longer than 1KB to keep payloads small.
  out = out.replace(/\sstyle="([^"]*)"/gi, (match, inner: string) => {
    return inner.length > 1024 ? '' : match
  })
  return out
}

function serializeComputed(el: Element): Record<string, string> {
  const out: Record<string, string> = {}
  try {
    const cs = window.getComputedStyle(el as HTMLElement)
    for (const prop of COMPUTED_PROPS) {
      const v = cs.getPropertyValue(prop)
      if (v) out[prop] = v.trim()
    }
  } catch {
    /* ignore */
  }
  return out
}

function serializeRaw(el: Element): Record<string, string> {
  const out: Record<string, string> = {}
  const html = el as HTMLElement
  try {
    if (!html.style) return out
    for (const prop of COMPUTED_PROPS) {
      const v = html.style.getPropertyValue(prop)
      if (v) out[prop] = v
    }
  } catch {
    /* ignore */
  }
  return out
}

function buildBreadcrumb(el: Element): BreadcrumbEntry[] {
  const chain: Element[] = []
  const body = typeof document !== 'undefined' ? document.body : null
  let cur: Element | null = el
  while (cur && cur.nodeType === 1 && cur !== body) {
    chain.push(cur)
    cur = cur.parentElement
  }
  chain.reverse()
  return chain.map((node) => ({
    eid: ensureEid(node),
    label: friendlyLabel(node),
    tagName: node.tagName,
  }))
}

export function buildPanelPayload(el: Element): PanelOpenPayload {
  const cls = classify(el)
  const eid = ensureEid(el)
  return {
    eid,
    friendlyLabel: cls.friendlyLabel,
    tagName: el.tagName,
    classification: {
      canText: cls.canText,
      canImage: cls.canImage,
      isContainer: cls.isContainer,
      tagCategory: cls.tagCategory,
    },
    thumbnailHtml: sanitizeThumbnailHtml(el),
    computedStyles: serializeComputed(el),
    rawStyles: serializeRaw(el),
    tokens: buildTokensVocabulary(),
    breadcrumb: buildBreadcrumb(el),
  }
}

export function getActiveElement(): Element | null {
  return currentActive ? currentActive.el : null
}

export function createElementEditor(opts: ElementEditorOpts = {}): ElementEditorHandle {
  function openInternal(el: Element, classification: Classification, postBegin: boolean): void {
    if (!el || el.nodeType !== 1) return
    // Guard: this editor must NEVER toggle contentEditable on the target.
    ensureEid(el)
    currentActive = { el, classification }
    setActive(el)
    state.panelOpen = true
    const payload = buildPanelPayload(el)
    post('SF_PANEL_OPEN', payload as unknown as Record<string, unknown>)
    if (postBegin) {
      post('SF_INLINE_EDIT_BEGIN', { friendlyLabel: classification.friendlyLabel })
    }
    // Legacy in-iframe panel host, if any caller passed one, is intentionally
    // not invoked — the parent dashboard now owns the panel UI.
  }

  function open(el: Element, classification: Classification): void {
    if (currentActive && currentActive.el === el) {
      // Already open on this target — re-emit state so parent refreshes.
      const payload = buildPanelPayload(el)
      post('SF_PANEL_STATE', payload as unknown as Record<string, unknown>)
      return
    }
    if (currentActive) {
      reselect(el)
      return
    }
    openInternal(el, classification, true)
  }

  function close(): void {
    if (!currentActive) return
    currentActive = null
    setActive(null)
    state.panelOpen = false
    post('SF_PANEL_CLOSE')
    post('SF_INLINE_EDIT_END')
  }

  function reselect(next: Element): void {
    if (!next || next.nodeType !== 1) return
    // Swap targets in-place. Do NOT post close/end — the editor session
    // stays open, only the selected element changes. Parent replaces state.
    const nextCls = classify(next)
    openInternal(next, nextCls, false)
  }

  function isOpen(): boolean {
    return currentActive !== null
  }

  function activeElement(): Element | null {
    return currentActive ? currentActive.el : null
  }

  // `opts` currently unused; preserved for future hover callbacks etc.
  void opts

  return { open, close, isOpen, activeElement, reselect }
}
