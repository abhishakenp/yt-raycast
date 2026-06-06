import { friendlyLabel } from './labels'
import { isOverlayNode } from '../targeting'

export interface PanelHeaderHandle {
  root: HTMLElement
  refresh(el: Element): void
}

export interface PanelHeaderOpts {
  el: Element
  onReselect(next: Element): void
}

const THUMB_SIZE = 56

function isAtRootLevel(el: Element): boolean {
  const p = el.parentElement
  if (!p) return true
  const tag = p.tagName
  return tag === 'BODY' || tag === 'HTML'
}

function firstUsableChild(el: Element): Element | null {
  for (let i = 0; i < el.children.length; i++) {
    const c = el.children[i]
    if (c.nodeType !== 1) continue
    if (isOverlayNode(c)) continue
    return c
  }
  return null
}

function buildThumbnail(el: Element): HTMLElement {
  const wrap = document.createElement('div')
  Object.assign(wrap.style, {
    width: THUMB_SIZE + 'px',
    height: THUMB_SIZE + 'px',
    flex: '0 0 auto',
    borderRadius: '6px',
    border: '1px solid rgba(124, 58, 237, 0.4)',
    background: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  })

  // Attempt a clone-snapshot approach first. If the source element has a
  // usable bounding box, scale a cloned copy to fit the thumbnail box so
  // the user sees roughly what they clicked on.
  let rect: DOMRect | null = null
  try {
    rect = el.getBoundingClientRect()
  } catch {
    rect = null
  }
  const w = rect && rect.width > 0 ? rect.width : 0
  const h = rect && rect.height > 0 ? rect.height : 0

  if (w > 0 && h > 0) {
    try {
      const clone = el.cloneNode(true) as HTMLElement
      // Strip data-sf-* attributes on clone and any descendants to avoid
      // isOverlayNode interference from editor-injected marks.
      const stripAttrs = (e: Element): void => {
        const attrs = Array.from(e.attributes || [])
        for (const a of attrs) {
          if (a.name.startsWith('data-sf-')) e.removeAttribute(a.name)
          if (a.name === 'contenteditable') e.removeAttribute(a.name)
        }
        for (let i = 0; i < e.children.length; i++) stripAttrs(e.children[i])
      }
      try {
        stripAttrs(clone)
      } catch {
        /* ignore */
      }
      const scale = Math.min(THUMB_SIZE / w, THUMB_SIZE / h)
      const stage = document.createElement('div')
      Object.assign(stage.style, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: w + 'px',
        height: h + 'px',
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: 'center center',
        pointerEvents: 'none',
      })
      // Neutralize clone positioning that could break the preview layout.
      Object.assign(clone.style, {
        position: 'static',
        margin: '0',
        maxWidth: 'none',
        maxHeight: 'none',
      })
      stage.appendChild(clone)
      wrap.appendChild(stage)
      return wrap
    } catch {
      /* fall through to fallback */
    }
  }

  // Fallback: show a background swatch + first bit of text content.
  try {
    const cs = getComputedStyle(el)
    const fill = document.createElement('div')
    Object.assign(fill.style, {
      position: 'absolute',
      inset: '0',
      background:
        cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)'
          ? cs.backgroundColor
          : 'rgba(124, 58, 237, 0.15)',
    })
    wrap.appendChild(fill)
    const t = (el.textContent || '').trim().slice(0, 24)
    if (t) {
      const txt = document.createElement('div')
      txt.textContent = t
      Object.assign(txt.style, {
        position: 'relative',
        fontSize: '9px',
        color: '#fff',
        textAlign: 'center',
        padding: '2px 4px',
        textShadow: '0 1px 2px rgba(0,0,0,0.7)',
        overflow: 'hidden',
      })
      wrap.appendChild(txt)
    }
  } catch {
    /* ignore */
  }
  return wrap
}

function buildLabelBlock(el: Element): HTMLElement {
  const wrap = document.createElement('div')
  Object.assign(wrap.style, {
    flex: '1 1 auto',
    minWidth: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    justifyContent: 'center',
  })
  const label = document.createElement('div')
  label.textContent = friendlyLabel(el)
  Object.assign(label.style, {
    fontSize: '13px',
    fontWeight: '600',
    color: '#f4f1ff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  })
  const tag = document.createElement('div')
  tag.textContent = el.tagName ? el.tagName.toLowerCase() : ''
  Object.assign(tag.style, {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '10px',
    color: 'rgba(232, 228, 255, 0.55)',
  })
  wrap.appendChild(label)
  wrap.appendChild(tag)
  return wrap
}

function navBtn(label: string, disabled: boolean): HTMLButtonElement {
  const b = document.createElement('button')
  b.type = 'button'
  b.textContent = label
  b.disabled = disabled
  Object.assign(b.style, {
    padding: '6px 10px',
    borderRadius: '8px',
    border: '1px solid #3d3758',
    background: 'transparent',
    color: '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: '600',
    fontSize: '11px',
    opacity: disabled ? '0.45' : '1',
    whiteSpace: 'nowrap',
  })
  return b
}

export function createPanelHeader(opts: PanelHeaderOpts): PanelHeaderHandle {
  const root = document.createElement('div')
  root.setAttribute('data-sf-panel-header', '1')
  Object.assign(root.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '10px',
    borderBottom: '1px solid rgba(124, 58, 237, 0.25)',
    background: 'rgba(0,0,0,0.2)',
  })

  const topRow = document.createElement('div')
  Object.assign(topRow.style, {
    display: 'flex',
    flexDirection: 'row',
    gap: '10px',
    alignItems: 'center',
  })

  const navRow = document.createElement('div')
  Object.assign(navRow.style, {
    display: 'flex',
    flexDirection: 'row',
    gap: '6px',
  })

  root.appendChild(topRow)
  root.appendChild(navRow)

  let currentEl: Element | null = opts.el || null

  function render(el: Element): void {
    topRow.innerHTML = ''
    navRow.innerHTML = ''
    if (!el) return
    topRow.appendChild(buildThumbnail(el))
    topRow.appendChild(buildLabelBlock(el))

    const outerDisabled = isAtRootLevel(el)
    const outer = navBtn('Outer area ⬆', outerDisabled)
    outer.addEventListener('click', () => {
      if (outerDisabled) return
      const p = el.parentElement
      if (!p) return
      if (p.tagName === 'BODY' || p.tagName === 'HTML') return
      opts.onReselect(p)
    })

    const child = firstUsableChild(el)
    const innerDisabled = !child
    const inner = navBtn('Inner part ⬇', innerDisabled)
    inner.addEventListener('click', () => {
      if (innerDisabled || !child) return
      opts.onReselect(child)
    })

    navRow.appendChild(outer)
    navRow.appendChild(inner)
  }

  if (currentEl) render(currentEl)

  function refresh(el: Element): void {
    currentEl = el
    render(el)
  }

  return { root, refresh }
}
