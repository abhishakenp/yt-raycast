import { on, post } from './bridge'
import { createEditor } from './shell'
import { registerWith as registerColors } from './tabs/colors'
import { registerWith as registerText } from './tabs/text'
import { registerWith as registerSpacing } from './tabs/spacing'
import { registerWith as registerShape } from './tabs/shape'
import { registerWith as registerShadow } from './tabs/shadow'
import { registerWith as registerLayout } from './tabs/layout'
import { registerWith as registerAi } from './tabs/ai'
import type { PanelOpenPayload } from './types'

let bootstrapped = false

function isTextInput(el: Element | null): boolean {
  if (!el) return false
  const tag = el.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  const ce = (el as HTMLElement).isContentEditable
  return !!ce
}

function coercePayload(data: unknown): PanelOpenPayload | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>
  if (typeof d.eid !== 'string') return null
  if (typeof d.friendlyLabel !== 'string') return null
  if (typeof d.tagName !== 'string') return null
  const cls = d.classification
  if (!cls || typeof cls !== 'object') return null
  const c = cls as Record<string, unknown>
  const classification = {
    canText: !!c.canText,
    canImage: !!c.canImage,
    isContainer: !!c.isContainer,
    tagCategory: typeof c.tagCategory === 'string' ? c.tagCategory : '',
  }
  const thumbnailHtml = typeof d.thumbnailHtml === 'string' ? d.thumbnailHtml : ''
  const computedStyles =
    d.computedStyles && typeof d.computedStyles === 'object'
      ? (d.computedStyles as Record<string, string>)
      : {}
  const rawStyles =
    d.rawStyles && typeof d.rawStyles === 'object'
      ? (d.rawStyles as Record<string, string>)
      : {}
  const tokens = Array.isArray(d.tokens) ? (d.tokens as PanelOpenPayload['tokens']) : []
  const breadcrumb = Array.isArray(d.breadcrumb)
    ? (d.breadcrumb as PanelOpenPayload['breadcrumb'])
    : []
  return {
    eid: d.eid,
    friendlyLabel: d.friendlyLabel,
    tagName: d.tagName,
    classification,
    thumbnailHtml,
    computedStyles,
    rawStyles,
    tokens,
    breadcrumb,
  }
}

function bootstrap(): void {
  if (bootstrapped) return
  // Bail out cleanly if the dashboard shell isn't in the DOM.
  if (!document.getElementById('preview-site-rail-editor')) return
  const controller = createEditor()
  if (!controller) return
  bootstrapped = true

  registerColors(controller)
  registerText(controller)
  registerSpacing(controller)
  registerShape(controller)
  registerShadow(controller)
  registerLayout(controller)
  registerAi(controller)

  on('SF_PANEL_OPEN', (data) => {
    const p = coercePayload(data)
    if (p) controller.open(p)
  })
  on('SF_PANEL_STATE', (data) => {
    const p = coercePayload(data)
    if (p) controller.updateState(p)
  })
  on('SF_PANEL_CLOSE', () => {
    controller.close()
  })

  document.addEventListener(
    'keydown',
    (ev) => {
      if (!controller.getState()) return
      if (isTextInput(document.activeElement)) return
      const mod = ev.metaKey || ev.ctrlKey
      if (!mod) return
      const key = ev.key.toLowerCase()
      if (key === 'z') {
        ev.preventDefault()
        if (ev.shiftKey) post('SF_PANEL_REDO')
        else post('SF_PANEL_UNDO')
      } else if (key === 'y' && !ev.shiftKey) {
        ev.preventDefault()
        post('SF_PANEL_REDO')
      }
    },
    { capture: true },
  )
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap, { once: true })
  } else {
    // DOM may already be parsed but the dashboard shell rendered by a later
    // script; retry after a microtask.
    queueMicrotask(() => {
      if (!document.getElementById('preview-site-rail-editor')) {
        // Try again on window load as a final fallback.
        window.addEventListener('load', bootstrap, { once: true })
        return
      }
      bootstrap()
    })
  }
}
