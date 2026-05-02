export type MessageType =
  | 'SF_SAVE_HOMEPAGE_HTML'
  | 'SF_HISTORY_CHECKPOINT_REQ'
  | 'SF_HISTORY_CHECKPOINT_RES'
  | 'SF_HISTORY_RESTORE_REQ'
  | 'SF_HISTORY_RESTORE_RES'
  | 'SF_PREVIEW_STYLE_AI_REQ'
  | 'SF_PREVIEW_STYLE_AI_RES'
  | 'SF_PREVIEW_TEXT_AI_REQ'
  | 'SF_PREVIEW_TEXT_AI_RES'
  | 'SF_PREVIEW_TOOLS'
  | 'SF_PREVIEW_TOOLS_READY'
  | 'SF_PREVIEW_TOOLS_ESCAPE'
  | 'SF_PREVIEW_TOOLS_CLEAR_ANNOTATOR'
  | 'SF_APPLY_PALETTE'
  | 'SF_INLINE_EDIT_BEGIN'
  | 'SF_INLINE_EDIT_END'
  | 'SF_INLINE_EDIT_UNSUPPORTED'
  | 'SF_ADD_COMPONENT_CLICK'
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
  | 'SF_PANEL_AI_REQ'

export interface MessageEnvelope {
  type: MessageType
  [key: string]: unknown
}

export type MessageHandler = (data: MessageEnvelope, ev: MessageEvent) => void

const handlers: Map<MessageType, Set<MessageHandler>> = new Map()
let listenerAttached = false

function rootListener(ev: MessageEvent): void {
  const data = ev.data as MessageEnvelope | null | undefined
  if (!data || typeof data !== 'object') return
  const t = data.type
  if (typeof t !== 'string') return
  const bucket = handlers.get(t as MessageType)
  if (!bucket || bucket.size === 0) return
  bucket.forEach((h) => {
    try {
      h(data, ev)
    } catch {
      // swallow per-handler errors
    }
  })
}

function ensureListener(): void {
  if (listenerAttached) return
  if (typeof window === 'undefined') return
  window.addEventListener('message', rootListener)
  listenerAttached = true
}

export function post(type: MessageType, payload?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  const msg: MessageEnvelope = { type, ...(payload || {}) }
  const target = window.parent && window.parent !== window ? window.parent : window
  try {
    target.postMessage(msg, '*')
  } catch {
    // cross-origin parent may reject; ignore
  }
}

export function on(type: MessageType, handler: MessageHandler): () => void {
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

export function clearAllHandlers(): void {
  handlers.clear()
}
