import { post } from './bridge'
import { requestAi } from './ai'
import type { ApplyOptions, PanelOpenPayload, SidesPayload, TabContext, TabDef } from './types'

export interface EditorController {
  open(state: PanelOpenPayload): void
  updateState(state: PanelOpenPayload): void
  close(): void
  registerTab(tab: TabDef): void
  getState(): PanelOpenPayload | null
}

interface ShellEls {
  rail: HTMLElement
  editor: HTMLElement
  thumb: HTMLElement
  labelTitle: HTMLElement
  labelSub: HTMLElement
  outer: HTMLButtonElement
  inner: HTMLButtonElement
  breadcrumb: HTMLElement
  tabs: HTMLElement
  body: HTMLElement
  undo: HTMLButtonElement
  redo: HTMLButtonElement
  cancel: HTMLButtonElement
  done: HTMLButtonElement
}

function qs<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null
}

function collectEls(): ShellEls | null {
  const rail = qs<HTMLElement>('preview-site-rail')
  const editor = qs<HTMLElement>('preview-site-rail-editor')
  if (!rail || !editor) return null
  const thumb = qs<HTMLElement>('rail-editor-thumb')
  const labelTitle = qs<HTMLElement>('rail-editor-label-title')
  const labelSub = qs<HTMLElement>('rail-editor-label-sub')
  const outer = qs<HTMLButtonElement>('rail-editor-outer')
  const inner = qs<HTMLButtonElement>('rail-editor-inner')
  const breadcrumb = qs<HTMLElement>('rail-editor-breadcrumb')
  const tabs = qs<HTMLElement>('rail-editor-tabs')
  const body = qs<HTMLElement>('rail-editor-body')
  const undo = qs<HTMLButtonElement>('rail-editor-undo')
  const redo = qs<HTMLButtonElement>('rail-editor-redo')
  const cancel = qs<HTMLButtonElement>('rail-editor-cancel')
  const done = qs<HTMLButtonElement>('rail-editor-done')
  if (
    !thumb ||
    !labelTitle ||
    !labelSub ||
    !outer ||
    !inner ||
    !breadcrumb ||
    !tabs ||
    !body ||
    !undo ||
    !redo ||
    !cancel ||
    !done
  ) {
    return null
  }
  return {
    rail,
    editor,
    thumb,
    labelTitle,
    labelSub,
    outer,
    inner,
    breadcrumb,
    tabs,
    body,
    undo,
    redo,
    cancel,
    done,
  }
}

function clearChildren(node: Node): void {
  while (node.firstChild) node.removeChild(node.firstChild)
}

export function createEditor(): EditorController | null {
  const maybeEls = collectEls()
  if (!maybeEls) return null
  const els: ShellEls = maybeEls

  const tabs: TabDef[] = []
  let state: PanelOpenPayload | null = null
  let activeTabId: string | null = null
  let currentDisposer: (() => void) | null = null

  function ctx(): TabContext | null {
    const s = state
    if (!s) return null
    return {
      state: s,
      apply(prop, value, opts) {
        applyStyle(prop, value, opts)
      },
      applySides(sides, base) {
        applySides(sides, base)
      },
      requestAi(instruction, scope) {
        return requestAi({ state: s, instruction, scope })
      },
    }
  }

  function applyStyle(prop: string, value: string, opts?: ApplyOptions): void {
    if (!state) return
    const payload: Record<string, unknown> = {
      eid: state.eid,
      prop,
      value,
    }
    if (opts && typeof opts.token === 'string') payload.token = opts.token
    if (opts && typeof opts.important === 'boolean') payload.important = opts.important
    if (opts && typeof opts.shorthand === 'boolean') payload.shorthand = opts.shorthand
    post('SF_PANEL_APPLY', payload)
  }

  function applySides(sides: SidesPayload, base: 'padding' | 'margin'): void {
    if (!state) return
    const sidesOut: Record<string, string> = {}
    if (typeof sides.t === 'string') sidesOut.t = sides.t
    if (typeof sides.r === 'string') sidesOut.r = sides.r
    if (typeof sides.b === 'string') sidesOut.b = sides.b
    if (typeof sides.l === 'string') sidesOut.l = sides.l
    post('SF_PANEL_APPLY_SIDES', {
      eid: state.eid,
      sides: sidesOut,
      base,
    })
  }

  function renderHeader(s: PanelOpenPayload): void {
    els.labelTitle.textContent = s.friendlyLabel || 'Element'
    els.labelSub.textContent = (s.tagName || '').toLowerCase()
    // Thumbnail: sanitized outerHTML from iframe. Scale down and clip.
    clearChildren(els.thumb)
    const box = document.createElement('div')
    Object.assign(box.style, {
      transform: 'scale(0.5)',
      transformOrigin: 'top left',
      pointerEvents: 'none',
      width: '200%',
      height: '200%',
      overflow: 'hidden',
    })
    box.innerHTML = s.thumbnailHtml || ''
    els.thumb.appendChild(box)
  }

  function renderBreadcrumb(s: PanelOpenPayload): void {
    clearChildren(els.breadcrumb)
    const list = s.breadcrumb || []
    for (let i = 0; i < list.length; i++) {
      const entry = list[i]
      if (i > 0) {
        const sep = document.createElement('span')
        sep.className = 'rail-editor-breadcrumb-sep'
        sep.textContent = '/'
        els.breadcrumb.appendChild(sep)
      }
      const chip = document.createElement('button')
      chip.type = 'button'
      chip.className = 'rail-editor-breadcrumb-chip'
      chip.textContent = entry.label || entry.tagName.toLowerCase()
      chip.setAttribute('data-tip', (entry.tagName || '').toLowerCase())
      if (entry.eid === s.eid) chip.setAttribute('data-active', 'true')
      chip.addEventListener('click', () => {
        if (entry.eid === s.eid) return
        post('SF_PANEL_RESELECT', { eid: entry.eid })
      })
      els.breadcrumb.appendChild(chip)
    }
    // outer = parent; enable if a parent exists in breadcrumb
    const idx = list.findIndex((b) => b.eid === s.eid)
    const hasParent = idx > 0
    els.outer.disabled = !hasParent
    els.outer.style.opacity = hasParent ? '1' : '0.35'
    els.outer.style.pointerEvents = hasParent ? '' : 'none'
    // inner: we don't have a deterministic child eid in this payload; keep disabled.
    els.inner.disabled = true
    els.inner.style.opacity = '0.35'
    els.inner.style.pointerEvents = 'none'
  }

  function renderTabs(s: PanelOpenPayload): void {
    clearChildren(els.tabs)
    const visible = tabs.filter((t) => (t.isVisible ? t.isVisible(s.classification) : true))
    if (!visible.length) {
      activeTabId = null
      return
    }
    if (!activeTabId || !visible.some((t) => t.id === activeTabId)) {
      activeTabId = visible[0].id
    }
    for (const t of visible) {
      const b = document.createElement('button')
      b.type = 'button'
      b.className = 'rail-editor-tabs-btn'
      b.setAttribute('role', 'tab')
      b.setAttribute('data-tab-id', t.id)
      b.setAttribute('data-tip', t.label)
      b.setAttribute('aria-label', t.label)
      b.innerHTML = t.icon
      if (t.id === activeTabId) b.setAttribute('data-active', 'true')
      b.addEventListener('click', () => {
        if (activeTabId === t.id) return
        activeTabId = t.id
        paintTabs()
        renderActiveTabBody()
      })
      els.tabs.appendChild(b)
    }
  }

  function paintTabs(): void {
    const all = Array.from(els.tabs.querySelectorAll<HTMLElement>('.rail-editor-tabs-btn'))
    for (const b of all) {
      const id = b.getAttribute('data-tab-id')
      if (id === activeTabId) b.setAttribute('data-active', 'true')
      else b.removeAttribute('data-active')
    }
  }

  function renderActiveTabBody(): void {
    if (currentDisposer) {
      try {
        currentDisposer()
      } catch {
        /* ignore */
      }
      currentDisposer = null
    }
    clearChildren(els.body)
    const c = ctx()
    if (!c) return
    const active = tabs.find((t) => t.id === activeTabId)
    if (!active) return
    try {
      currentDisposer = active.render(els.body, c) || null
    } catch {
      currentDisposer = null
    }
  }

  function renderAll(s: PanelOpenPayload): void {
    renderHeader(s)
    renderBreadcrumb(s)
    renderTabs(s)
    renderActiveTabBody()
  }

  function open(s: PanelOpenPayload): void {
    state = s
    els.rail.classList.add('is-editing')
    els.editor.removeAttribute('hidden')
    renderAll(s)
  }

  function updateState(s: PanelOpenPayload): void {
    state = s
    if (!els.rail.classList.contains('is-editing')) {
      els.rail.classList.add('is-editing')
      els.editor.removeAttribute('hidden')
    }
    renderHeader(s)
    renderBreadcrumb(s)
    renderTabs(s)
    renderActiveTabBody()
  }

  function close(): void {
    if (currentDisposer) {
      try {
        currentDisposer()
      } catch {
        /* ignore */
      }
      currentDisposer = null
    }
    state = null
    els.rail.classList.remove('is-editing')
    els.editor.setAttribute('hidden', '')
    clearChildren(els.body)
    clearChildren(els.breadcrumb)
    clearChildren(els.tabs)
    clearChildren(els.thumb)
    els.labelTitle.textContent = 'Element'
    els.labelSub.textContent = ''
  }

  function registerTab(tab: TabDef): void {
    tabs.push(tab)
  }

  // Footer wiring
  els.undo.addEventListener('click', () => post('SF_PANEL_UNDO'))
  els.redo.addEventListener('click', () => post('SF_PANEL_REDO'))
  els.cancel.addEventListener('click', () => {
    close()
    post('SF_PANEL_CLOSE')
  })
  els.done.addEventListener('click', () => post('SF_PANEL_DONE'))

  // Nav wiring
  els.outer.addEventListener('click', () => {
    if (!state) return
    const list = state.breadcrumb || []
    const idx = list.findIndex((b) => b.eid === state!.eid)
    if (idx > 0) post('SF_PANEL_RESELECT', { eid: list[idx - 1].eid })
  })
  // inner: disabled by default — no deterministic child eid in the open payload.
  els.inner.addEventListener('click', () => {
    /* no-op: enable once payload carries a child hint */
  })

  return {
    open,
    updateState,
    close,
    registerTab,
    getState: () => state,
  }
}
