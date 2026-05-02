export type EditorMessageType =
  | 'SF_PANEL_OPEN'
  | 'SF_PANEL_CLOSE'
  | 'SF_PANEL_STATE'
  | 'SF_PANEL_APPLY'
  | 'SF_PANEL_APPLY_SIDES'
  | 'SF_PANEL_RESELECT'
  | 'SF_PANEL_UNDO'
  | 'SF_PANEL_REDO'
  | 'SF_PANEL_REVERT'
  | 'SF_PANEL_DONE'
  | 'SF_PREVIEW_STYLE_AI_REQ'
  | 'SF_PREVIEW_STYLE_AI_RES'

export interface EditorEnvelope {
  type: EditorMessageType
  [key: string]: unknown
}

export type EditorHandler = (data: EditorEnvelope, ev: MessageEvent) => void

const handlers: Map<EditorMessageType, Set<EditorHandler>> = new Map()
let listenerAttached = false

function rootListener(ev: MessageEvent): void {
  const data = ev.data as EditorEnvelope | null | undefined
  if (!data || typeof data !== 'object') return
  const t = (data as { type?: unknown }).type
  if (typeof t !== 'string') return
  const bucket = handlers.get(t as EditorMessageType)
  if (!bucket || bucket.size === 0) return
  bucket.forEach((h) => {
    try {
      h(data, ev)
    } catch {
      /* swallow */
    }
  })
}

function ensureListener(): void {
  if (listenerAttached) return
  if (typeof window === 'undefined') return
  window.addEventListener('message', rootListener)
  listenerAttached = true
}

function iframeWindow(): Window | null {
  if (typeof document === 'undefined') return null
  const el = document.getElementById('preview-iframe') as HTMLIFrameElement | null
  if (!el) return null
  return el.contentWindow
}

export function post(type: EditorMessageType, payload?: Record<string, unknown>): void {
  const target = iframeWindow()
  if (!target) return
  const msg: EditorEnvelope = { type, ...(payload || {}) }
  try {
    target.postMessage(msg, '*')
  } catch {
    /* cross-origin may reject; ignore */
  }
}

export function on(type: EditorMessageType, handler: EditorHandler): () => void {
  ensureListener()
  let bucket = handlers.get(type)
  if (!bucket) {
    bucket = new Set()
    handlers.set(type, bucket)
  }
  bucket.add(handler)
  return () => {
    const b = handlers.get(type)
    if (!b) return
    b.delete(handler)
    if (b.size === 0) handlers.delete(type)
  }
}
