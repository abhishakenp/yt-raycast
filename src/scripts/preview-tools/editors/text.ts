import { push } from '../history'
import { ensureEid } from '../identity'
import { post } from '../bridge'

export interface TextEditorHandle {
  open(el: Element): void
  close(): void
  isOpen(): boolean
  activeElement(): Element | null
}

export interface TextEditorOpts {
  getBridge?: () => void
  onChange?: (el: Element) => void
}

interface TextEditorState {
  el: HTMLElement
  eid: string
  snapshot: string
  beforeText: string
  onBlur: (ev: FocusEvent) => void
  onKeyDown: (ev: KeyboardEvent) => void
  onDocMouseDown: (ev: MouseEvent) => void
  onScroll: EventListener
  toolbar: HTMLDivElement
  restoreOnClose: boolean
}

const OUTLINE = '2px solid rgba(167, 139, 250, 0.95)'
const OUTLINE_OFFSET = '3px'

export function createTextEditor(opts: TextEditorOpts = {}): TextEditorHandle {
  let state: TextEditorState | null = null

  function placeCaretAtEnd(el: HTMLElement): void {
    try {
      const range = document.createRange()
      range.selectNodeContents(el)
      range.collapse(false)
      const sel = window.getSelection()
      if (sel) {
        sel.removeAllRanges()
        sel.addRange(range)
      }
    } catch {
      /* ignore */
    }
  }

  function positionToolbarNear(toolbar: HTMLDivElement, el: Element): void {
    const r = el.getBoundingClientRect()
    const pad = 8
    const tw = toolbar.offsetWidth || 220
    const th = toolbar.offsetHeight || 40
    let top = r.bottom + pad
    let left = r.left
    if (left + tw > window.innerWidth - pad) left = window.innerWidth - tw - pad
    if (left < pad) left = pad
    if (r.bottom + th + pad * 2 > window.innerHeight) top = r.top - th - pad
    toolbar.style.position = 'fixed'
    toolbar.style.top = Math.max(pad, top) + 'px'
    toolbar.style.left = left + 'px'
  }

  function makeFmtButton(label: string, title: string, onClick: () => void): HTMLButtonElement {
    const b = document.createElement('button')
    b.type = 'button'
    b.textContent = label
    b.title = title
    b.setAttribute('aria-label', title)
    b.setAttribute('data-sf-text-toolbar', 'btn')
    Object.assign(b.style, {
      minWidth: '28px',
      height: '28px',
      padding: '0 8px',
      borderRadius: '6px',
      border: '1px solid #3d3758',
      background: 'transparent',
      color: '#fff',
      cursor: 'pointer',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontWeight: '600',
    } as Partial<CSSStyleDeclaration>)
    // mousedown must not steal focus from contentEditable
    b.addEventListener('mousedown', (ev) => ev.preventDefault())
    b.addEventListener('click', (ev) => {
      ev.preventDefault()
      ev.stopPropagation()
      onClick()
    })
    return b
  }

  function buildToolbar(): HTMLDivElement {
    const bar = document.createElement('div')
    bar.setAttribute('data-sf-text-toolbar', '1')
    bar.setAttribute('data-sf-panel-control', '1')
    Object.assign(bar.style, {
      position: 'fixed',
      zIndex: '2147483000',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '6px 8px',
      borderRadius: '8px',
      background: 'linear-gradient(180deg, #1e1a2e 0%, #12101c 100%)',
      border: '1px solid rgba(124, 58, 237, 0.45)',
      boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      color: '#e8e4ff',
    } as Partial<CSSStyleDeclaration>)

    const exec = (cmd: string, arg?: string): void => {
      try {
        document.execCommand(cmd, false, arg)
      } catch {
        /* ignore */
      }
    }

    bar.appendChild(makeFmtButton('B', 'Bold', () => exec('bold')))
    const i = makeFmtButton('I', 'Italic', () => exec('italic'))
    i.style.fontStyle = 'italic'
    bar.appendChild(i)
    const u = makeFmtButton('U', 'Underline', () => exec('underline'))
    u.style.textDecoration = 'underline'
    bar.appendChild(u)
    bar.appendChild(
      makeFmtButton('🔗', 'Link', () => {
        const href = window.prompt('Link URL')
        if (!href) return
        exec('createLink', href)
      }),
    )
    return bar
  }

  function commitIfChanged(s: TextEditorState): boolean {
    const after = s.el.textContent ?? ''
    if (after === s.beforeText) return false
    push({
      eid: s.eid,
      kind: 'textContent',
      before: s.beforeText,
      after,
      at: Date.now(),
    })
    if (opts.onChange) {
      try {
        opts.onChange(s.el)
      } catch {
        /* ignore */
      }
    }
    return true
  }

  function teardown(restore: boolean): void {
    if (!state) return
    const s = state
    state = null
    window.removeEventListener('scroll', s.onScroll, true)
    document.removeEventListener('mousedown', s.onDocMouseDown, true)
    s.el.removeEventListener('blur', s.onBlur, true)
    s.el.removeEventListener('keydown', s.onKeyDown, true)
    if (s.toolbar.parentNode) s.toolbar.parentNode.removeChild(s.toolbar)
    if (restore) {
      try {
        s.el.outerHTML = s.snapshot
      } catch {
        /* ignore */
      }
    } else {
      s.el.contentEditable = 'false'
      s.el.style.outline = ''
      s.el.style.outlineOffset = ''
      commitIfChanged(s)
    }
    post('SF_INLINE_EDIT_END')
  }

  function open(target: Element): void {
    if (!target || target.nodeType !== 1) return
    if (state) teardown(false)
    const el = target as HTMLElement
    const eid = ensureEid(el)
    const snapshot = el.outerHTML
    const beforeText = el.textContent ?? ''

    el.contentEditable = 'true'
    el.style.outline = OUTLINE
    el.style.outlineOffset = OUTLINE_OFFSET

    const toolbar = buildToolbar()
    document.documentElement.appendChild(toolbar)

    const onBlur = (_ev: FocusEvent): void => {
      // Defer: a click on the toolbar steals focus briefly before the button's
      // mousedown preventDefault fires. If focus returns to the element we stay
      // open; otherwise we close and commit.
      window.setTimeout(() => {
        if (!state) return
        if (document.activeElement === state.el) return
        if (toolbar.contains(document.activeElement)) return
        teardown(false)
      }, 0)
    }

    const onKeyDown = (ev: KeyboardEvent): void => {
      if (ev.key === 'Escape') {
        ev.preventDefault()
        ev.stopPropagation()
        teardown(true)
      }
    }

    const onDocMouseDown = (ev: MouseEvent): void => {
      if (!state) return
      const tgt = ev.target as Node | null
      if (!tgt) return
      if (state.el.contains(tgt)) return
      if (toolbar.contains(tgt)) return
      teardown(false)
    }

    const onScroll: EventListener = () => {
      if (state) positionToolbarNear(state.toolbar, state.el)
    }

    state = {
      el,
      eid,
      snapshot,
      beforeText,
      onBlur,
      onKeyDown,
      onDocMouseDown,
      onScroll,
      toolbar,
      restoreOnClose: false,
    }

    el.addEventListener('blur', onBlur, true)
    el.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('scroll', onScroll, true)
    // Defer doc mousedown listener so the click that opened us doesn't close us.
    window.setTimeout(() => {
      if (state) document.addEventListener('mousedown', state.onDocMouseDown, true)
    }, 0)

    positionToolbarNear(toolbar, el)
    post('SF_INLINE_EDIT_BEGIN')
    el.focus()
    placeCaretAtEnd(el)
  }

  function close(): void {
    teardown(false)
  }

  function isOpen(): boolean {
    return state !== null
  }

  function activeElement(): Element | null {
    return state ? state.el : null
  }

  return { open, close, isOpen, activeElement }
}
