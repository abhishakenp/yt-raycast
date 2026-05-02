import { findByEid } from './identity'

export type HistoryKind = 'style' | 'class' | 'html' | 'textContent'

export interface HistoryEntry {
  eid: string
  kind: HistoryKind
  prop?: string
  before: string
  after: string
  at: number
}

const MAX_ENTRIES = 200

const undoStack: HistoryEntry[] = []
const redoStack: HistoryEntry[] = []

function applyValue(el: Element, kind: HistoryKind, prop: string | undefined, value: string): void {
  switch (kind) {
    case 'style': {
      if (!prop) return
      const htmlEl = el as HTMLElement
      if (!htmlEl.style) return
      if (value === '') {
        htmlEl.style.removeProperty(prop)
      } else {
        // preserve !important if the value contained it
        const trimmed = value.trim()
        const importantMatch = /!important\s*$/i.test(trimmed)
        const clean = importantMatch ? trimmed.replace(/!important\s*$/i, '').trim() : trimmed
        htmlEl.style.setProperty(prop, clean, importantMatch ? 'important' : '')
      }
      return
    }
    case 'class': {
      el.setAttribute('class', value)
      return
    }
    case 'html': {
      ;(el as HTMLElement).innerHTML = value
      return
    }
    case 'textContent': {
      el.textContent = value
      return
    }
  }
}

export function push(entry: HistoryEntry): void {
  undoStack.push(entry)
  if (undoStack.length > MAX_ENTRIES) {
    undoStack.splice(0, undoStack.length - MAX_ENTRIES)
  }
  // new edit invalidates redo chain
  redoStack.length = 0
}

export function undo(): HistoryEntry | null {
  const entry = undoStack.pop()
  if (!entry) return null
  const el = findByEid(entry.eid)
  if (!el) {
    // element gone; discard silently
    return null
  }
  applyValue(el, entry.kind, entry.prop, entry.before)
  redoStack.push(entry)
  if (redoStack.length > MAX_ENTRIES) {
    redoStack.splice(0, redoStack.length - MAX_ENTRIES)
  }
  return entry
}

export function redo(): HistoryEntry | null {
  const entry = redoStack.pop()
  if (!entry) return null
  const el = findByEid(entry.eid)
  if (!el) return null
  applyValue(el, entry.kind, entry.prop, entry.after)
  undoStack.push(entry)
  if (undoStack.length > MAX_ENTRIES) {
    undoStack.splice(0, undoStack.length - MAX_ENTRIES)
  }
  return entry
}

export function clear(): void {
  undoStack.length = 0
  redoStack.length = 0
}

export function size(): { undo: number; redo: number } {
  return { undo: undoStack.length, redo: redoStack.length }
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof Element)) return false
  const el = target as HTMLElement
  const tag = el.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (el.isContentEditable) return true
  return false
}

export function attachKeyboard(doc: Document): () => void {
  const handler = (ev: KeyboardEvent): void => {
    const mod = ev.metaKey || ev.ctrlKey
    if (!mod) return
    const key = ev.key.toLowerCase()
    if (key !== 'z') return
    if (isTypingTarget(ev.target)) return
    if (ev.shiftKey) {
      const entry = redo()
      if (entry) {
        ev.preventDefault()
        ev.stopPropagation()
      }
    } else {
      const entry = undo()
      if (entry) {
        ev.preventDefault()
        ev.stopPropagation()
      }
    }
  }
  doc.addEventListener('keydown', handler, true)
  return () => {
    doc.removeEventListener('keydown', handler, true)
  }
}
