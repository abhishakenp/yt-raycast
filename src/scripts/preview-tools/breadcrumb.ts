import { state } from '../state'
import { friendlyLabel } from './labels'
import { isOverlayNode } from '../targeting'

export interface BreadcrumbHandle {
  root: HTMLElement
  refresh(el: Element | null): void
  destroy(): void
}

export interface BreadcrumbOpts {
  onPick(el: Element): void
  onHover(el: Element | null): void
}

const PANEL_WIDTH = 320
const MAX_LABEL_CH = 22

function truncate(s: string): string {
  if (!s) return ''
  if (s.length <= MAX_LABEL_CH) return s
  return s.slice(0, MAX_LABEL_CH - 1) + '…'
}

function buildChain(el: Element): Element[] {
  const chain: Element[] = []
  let cur: Element | null = el
  while (cur && cur.nodeType === 1) {
    const tag = cur.tagName
    if (tag === 'BODY' || tag === 'HTML') break
    if (!isOverlayNode(cur)) chain.push(cur)
    cur = cur.parentElement
  }
  chain.reverse()
  return chain
}

function buildRoot(): HTMLElement {
  const r = document.createElement('div')
  r.setAttribute('data-sf-breadcrumb', '1')
  Object.assign(r.style, {
    position: 'fixed',
    left: '0',
    right: PANEL_WIDTH + 'px',
    bottom: '0',
    zIndex: String(state.zBase + 18),
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '0 10px',
    overflowX: 'auto',
    overflowY: 'hidden',
    whiteSpace: 'nowrap',
    background: 'linear-gradient(180deg, rgba(18, 16, 28, 0.85) 0%, rgba(18, 16, 28, 0.95) 100%)',
    borderTop: '1px solid rgba(124, 58, 237, 0.35)',
    boxShadow: '0 -6px 18px rgba(0,0,0,0.35)',
    fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
    fontSize: '11px',
    color: '#e8e4ff',
    boxSizing: 'border-box',
  })
  return r
}

function separator(): HTMLElement {
  const s = document.createElement('span')
  s.textContent = '›'
  Object.assign(s.style, {
    color: 'rgba(232, 228, 255, 0.4)',
    fontSize: '12px',
    flex: '0 0 auto',
    pointerEvents: 'none',
    userSelect: 'none',
  })
  return s
}

function chip(label: string, isLast: boolean): HTMLButtonElement {
  const b = document.createElement('button')
  b.type = 'button'
  b.textContent = truncate(label)
  b.title = label
  Object.assign(b.style, {
    flex: '0 0 auto',
    padding: '4px 9px',
    borderRadius: '999px',
    border: isLast ? '1px solid rgba(167, 139, 250, 0.6)' : '1px solid rgba(124, 58, 237, 0.3)',
    background: isLast ? 'rgba(124, 58, 237, 0.3)' : 'rgba(0,0,0,0.3)',
    color: '#f4f1ff',
    fontWeight: isLast ? '600' : '500',
    fontSize: '11px',
    cursor: 'pointer',
    maxWidth: '180px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  })
  return b
}

function rootChip(): HTMLButtonElement {
  const b = document.createElement('button')
  b.type = 'button'
  b.textContent = 'Page'
  b.title = 'Page'
  Object.assign(b.style, {
    flex: '0 0 auto',
    padding: '4px 9px',
    borderRadius: '999px',
    border: '1px solid rgba(124, 58, 237, 0.3)',
    background: 'rgba(0,0,0,0.3)',
    color: 'rgba(232, 228, 255, 0.8)',
    fontWeight: '500',
    fontSize: '11px',
    cursor: 'default',
  })
  return b
}

export function createBreadcrumb(opts: BreadcrumbOpts): BreadcrumbHandle {
  const root = buildRoot()
  document.body.appendChild(root)

  function render(el: Element | null): void {
    root.innerHTML = ''
    root.appendChild(rootChip())
    if (!el) return
    const chain = buildChain(el)
    if (chain.length === 0) return
    for (let i = 0; i < chain.length; i++) {
      const node = chain[i]
      root.appendChild(separator())
      const label = friendlyLabel(node)
      const isLast = i === chain.length - 1
      const c = chip(label, isLast)
      c.addEventListener('click', () => {
        try {
          opts.onPick(node)
        } catch {
          /* ignore */
        }
      })
      c.addEventListener('mouseenter', () => {
        try {
          opts.onHover(node)
        } catch {
          /* ignore */
        }
      })
      c.addEventListener('mouseleave', () => {
        try {
          opts.onHover(null)
        } catch {
          /* ignore */
        }
      })
      root.appendChild(c)
    }
  }

  function refresh(el: Element | null): void {
    render(el)
  }

  function destroy(): void {
    if (root.parentNode) {
      try {
        root.parentNode.removeChild(root)
      } catch {
        /* ignore */
      }
    }
  }

  return { root, refresh, destroy }
}
