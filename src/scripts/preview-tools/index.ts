import { bootstrapPersistedPalette, applyPalettePayload, type PalettePayload } from './palette'
import { post, on, type MessageEnvelope } from './bridge'
import { attachKeyboard, undo as historyUndo, redo as historyRedo } from './history'
import { createTextEditor } from './editors/text'
import { createImageEditor } from './editors/image'
import {
  createElementEditor,
  buildPanelPayload,
  getActiveElement,
} from './editors/element'
import { createSelectMode, createAnnotateMode } from './modes'
import { writeValue, writeSides } from './style-apply'
import { findByEid } from './identity'

interface HistoryCheckpointEntry {
  id: string
  at: number
  label?: string
}

// ── DOM serialization / save helpers ─────────────────────────────────────

const OVERLAY_ATTRS = [
  'data-sf-panel',
  'data-sf-breadcrumb',
  'data-sf-panel-header',
  'data-sf-panel-control',
  'data-sf-image-toolbar',
  'data-sf-text-toolbar',
  'data-sf-friendly-label',
  'data-sf-pt-veil',
  'data-sf-pt-hl',
  'data-sf-pt-draw',
  'data-sf-inline-toolbar',
]

function stripOverlayNodes(root: Document): void {
  const selector = OVERLAY_ATTRS.map((a) => `[${a}]`).join(',')
  try {
    root.querySelectorAll(selector).forEach((n) => {
      try {
        n.remove()
      } catch {
        /* ignore */
      }
    })
  } catch {
    /* ignore */
  }
}

function stripContentEditableAll(root: Document): void {
  try {
    root.querySelectorAll('[contenteditable]').forEach((n) => {
      try {
        n.removeAttribute('contenteditable')
      } catch {
        /* ignore */
      }
    })
  } catch {
    /* ignore */
  }
}

function stripPaletteOverrideStyle(root: Document): void {
  try {
    const el = root.getElementById('sf-palette-override')
    if (el && el.parentNode) el.parentNode.removeChild(el)
  } catch {
    /* ignore */
  }
}

function stripPreviewRuntimeScripts(root: Document): void {
  try {
    root
      .querySelectorAll(
        'script#sf-preview-tools-runtime, script[data-sf-preview-tools]'
      )
      .forEach((n) => {
        try {
          n.remove()
        } catch {
          /* ignore */
        }
      })
  } catch {
    /* ignore */
  }
}

/**
 * Produce a cleaned outer HTML of <html> for full-document save.
 * - Removes all overlay / editor chrome.
 * - Strips contenteditable="true" on every element (not just the active one).
 * - Drops the <style id="sf-palette-override"> (palette is persisted separately).
 * - Drops the <script data-sf-preview-tools> loader (server re-injects on serve).
 * The original document is not mutated — we clone, clean the clone, then
 * serialize.
 */
export function prepareDocumentForSave(): string {
  try {
    const doc = document.implementation.createHTMLDocument('sf-save')
    // clone the live documentElement into the staging doc
    const liveHtml = document.documentElement
    const cloned = liveHtml.cloneNode(true) as HTMLElement
    // swap the staging doc's documentElement with the clone
    doc.replaceChild(cloned, doc.documentElement)

    stripOverlayNodes(doc)
    stripContentEditableAll(doc)
    stripPaletteOverrideStyle(doc)
    stripPreviewRuntimeScripts(doc)

    return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML
  } catch {
    // Fallback: best-effort string-level cleanup from live doc.
    const raw = '<!DOCTYPE html>\n' + document.documentElement.outerHTML
    return raw
  }
}

function saveHomepageFromDom(): void {
  const html = prepareDocumentForSave()
  // Parent already writes a checkpoint when handling SF_SAVE_HOMEPAGE_HTML
  // (see server index.js preview-homepage-html endpoint), so a single post is
  // enough — no need to separately fire SF_HISTORY_CHECKPOINT_REQ here.
  post('SF_SAVE_HOMEPAGE_HTML', { html })
  post('SF_INLINE_EDIT_END')
}

// ── Same-origin link intercept ────────────────────────────────────────────
// Preserves behavior from the old runtime (lines 1291-1311): keep preview-
// internal navigation out of the browser's session history so Back always
// exits the preview instead of walking backwards through preview pages.
function attachLinkIntercept(): void {
  document.addEventListener(
    'click',
    (ev: MouseEvent): void => {
      if (ev.defaultPrevented || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return
      const link = (ev.target as Element | null)?.closest('a[href]') as HTMLAnchorElement | null
      if (!link) return
      const href = link.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:'))
        return
      if (link.target && link.target !== '_self') return
      try {
        const url = new URL(href, location.href)
        if (url.origin !== location.origin) return
        ev.preventDefault()
        location.replace(url.href)
      } catch {
        /* malformed URL — let the browser handle it normally */
      }
    },
    true
  )
}

// ── Boot ───────────────────────────────────────────────────────────────────

function boot(): void {
  bootstrapPersistedPalette()
  if (document.readyState !== 'complete') {
    window.addEventListener('DOMContentLoaded', bootstrapPersistedPalette, { once: true })
    window.addEventListener('load', bootstrapPersistedPalette, { once: true })
  }

  const textEditor = createTextEditor()
  const imageEditor = createImageEditor()

  // The panel UI now lives in the parent dashboard sidebar. The element editor
  // is a thin messenger — it posts SF_PANEL_* messages; the parent renders
  // the panel and posts SF_PANEL_APPLY / _APPLY_SIDES / _RESELECT / _UNDO /
  // _REDO / _REVERT / _DONE back to the iframe.
  const elementEditor = createElementEditor()

  const selectMode = createSelectMode({ textEditor, imageEditor, elementEditor })
  const annotateMode = createAnnotateMode()

  function postActiveState(): void {
    const active = getActiveElement()
    if (!active) return
    try {
      const payload = buildPanelPayload(active)
      post('SF_PANEL_STATE', payload as unknown as Record<string, unknown>)
    } catch {
      /* ignore */
    }
  }

  function closeAllEditors(): void {
    try { textEditor.close() } catch { /* ignore */ }
    try { imageEditor.close() } catch { /* ignore */ }
    try { elementEditor.close() } catch { /* ignore */ }
  }

  function applyModeMessage(mode: unknown, selectFlag: unknown, annotateFlag: unknown): void {
    // Support both explicit mode strings and the legacy boolean flags used by
    // dashboard-main so existing parent code keeps working unchanged.
    let target: 'select' | 'annotate' | 'inactive'
    if (typeof mode === 'string' && (mode === 'select' || mode === 'annotate' || mode === 'inactive')) {
      target = mode
    } else {
      const sel = Boolean(selectFlag)
      const ann = Boolean(annotateFlag)
      if (ann) target = 'annotate'
      else if (sel) target = 'select'
      else target = 'inactive'
    }

    if (target === 'select') {
      annotateMode.deactivate()
      selectMode.activate()
      return
    }
    if (target === 'annotate') {
      selectMode.deactivate()
      annotateMode.activate()
      return
    }
    selectMode.deactivate()
    annotateMode.deactivate()
  }

  // ── Parent messages ─────────────────────────────────────────────────────
  on('SF_PREVIEW_TOOLS', (envelope: MessageEnvelope) => {
    applyModeMessage(
      (envelope as { mode?: unknown }).mode,
      (envelope as { selectMode?: unknown }).selectMode,
      (envelope as { annotateMode?: unknown }).annotateMode
    )
  })

  on('SF_PREVIEW_TOOLS_ESCAPE', () => {
    closeAllEditors()
    selectMode.deactivate()
    annotateMode.deactivate()
  })

  on('SF_PREVIEW_TOOLS_CLEAR_ANNOTATOR', () => {
    annotateMode.clear()
  })

  on('SF_APPLY_PALETTE', (envelope: MessageEnvelope) => {
    applyPalettePayload(envelope as unknown as PalettePayload)
  })

  const checkpointHistory: HistoryCheckpointEntry[] = []
  on('SF_HISTORY_CHECKPOINT_RES', (envelope: MessageEnvelope) => {
    const e = envelope as { checkpointId?: unknown; id?: unknown; error?: unknown }
    if (e.error) return
    const cid = typeof e.checkpointId === 'string' ? e.checkpointId : null
    if (!cid) return
    checkpointHistory.push({ id: cid, at: Date.now() })
    if (checkpointHistory.length > 50) {
      checkpointHistory.splice(0, checkpointHistory.length - 50)
    }
  })

  on('SF_HISTORY_RESTORE_RES', () => {
    // Page reload is driven by parent; nothing to do iframe-side.
  })

  // ── Parent → iframe panel commands ──────────────────────────────────────
  on('SF_PANEL_APPLY', (envelope: MessageEnvelope) => {
    const e = envelope as {
      eid?: unknown
      prop?: unknown
      value?: unknown
      token?: unknown
      important?: unknown
      shorthand?: unknown
    }
    const eid = typeof e.eid === 'string' ? e.eid : null
    const prop = typeof e.prop === 'string' ? e.prop : null
    const value = typeof e.value === 'string' ? e.value : null
    if (!eid || !prop || value == null) return
    const el = findByEid(eid)
    if (!el) return
    try {
      writeValue(el, prop, value, {
        token: typeof e.token === 'string' ? e.token : undefined,
        important: typeof e.important === 'boolean' ? e.important : undefined,
        shorthand: typeof e.shorthand === 'boolean' ? e.shorthand : undefined,
      })
    } catch {
      /* ignore */
    }
    postActiveState()
  })

  on('SF_PANEL_APPLY_SIDES', (envelope: MessageEnvelope) => {
    const e = envelope as {
      eid?: unknown
      sides?: unknown
      base?: unknown
    }
    const eid = typeof e.eid === 'string' ? e.eid : null
    const base = e.base === 'padding' || e.base === 'margin' ? e.base : null
    if (!eid || !base) return
    const sidesRaw = (e.sides && typeof e.sides === 'object') ? (e.sides as Record<string, unknown>) : {}
    const sides: { t?: string; r?: string; b?: string; l?: string } = {}
    if (typeof sidesRaw.t === 'string') sides.t = sidesRaw.t
    if (typeof sidesRaw.r === 'string') sides.r = sidesRaw.r
    if (typeof sidesRaw.b === 'string') sides.b = sidesRaw.b
    if (typeof sidesRaw.l === 'string') sides.l = sidesRaw.l
    const el = findByEid(eid)
    if (!el) return
    try {
      writeSides(el, sides, base)
    } catch {
      /* ignore */
    }
    postActiveState()
  })

  on('SF_PANEL_RESELECT', (envelope: MessageEnvelope) => {
    const e = envelope as { eid?: unknown }
    const eid = typeof e.eid === 'string' ? e.eid : null
    if (!eid) return
    const next = findByEid(eid)
    if (!next) return
    elementEditor.reselect(next)
  })

  on('SF_PANEL_UNDO', () => {
    historyUndo()
    postActiveState()
  })

  on('SF_PANEL_REDO', () => {
    historyRedo()
    postActiveState()
  })

  on('SF_PANEL_REVERT', () => {
    // Minimal impl: pop the most-recent history entry regardless of eid.
    historyUndo()
    postActiveState()
  })

  on('SF_PANEL_DONE', () => {
    try {
      saveHomepageFromDom()
    } catch {
      /* ignore */
    }
    if (elementEditor.isOpen()) {
      elementEditor.close()
    } else {
      post('SF_PANEL_CLOSE')
      post('SF_INLINE_EDIT_END')
    }
  })

  // ── Global key / unload handlers ─────────────────────────────────────────
  window.addEventListener('keydown', (ev: KeyboardEvent) => {
    if (ev.key !== 'Escape') return
    // Priority: close the most "local" thing first.
    if (textEditor.isOpen()) {
      ev.preventDefault()
      textEditor.close()
      return
    }
    if (imageEditor.isOpen()) {
      ev.preventDefault()
      imageEditor.close()
      return
    }
    if (elementEditor.isOpen()) {
      ev.preventDefault()
      elementEditor.close()
      return
    }
    if (selectMode.isActive() || annotateMode.isActive()) {
      ev.preventDefault()
      selectMode.deactivate()
      annotateMode.deactivate()
      post('SF_PREVIEW_TOOLS_ESCAPE')
    }
  })

  attachKeyboard(document)
  attachLinkIntercept()

  // ── Ready signal ─────────────────────────────────────────────────────────
  const announceReady = (): void => {
    post('SF_PREVIEW_TOOLS_READY', { route: location.pathname || '/' })
  }
  if (document.readyState === 'complete') {
    announceReady()
  } else {
    window.addEventListener('load', announceReady, { once: true })
  }
}

boot()
