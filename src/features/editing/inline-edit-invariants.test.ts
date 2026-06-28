// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { createElement, type RefObject, useRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useTextEdit } from './hooks/useTextEdit'
import {
  applyImageSwap,
  applyPreviewTextEdit,
  applyStyleEdit,
} from '../../lib/edit-helpers'
import { Image } from '../../../packages/ship-fast-blocks/src/lib/img'
import schema from '../../../convex/schema'

// ─── helpers ──────────────────────────────────────────────────────────────

/** Collect every Text node under `el` in document order. */
const textNodesOf = (el: Node): Text[] => {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  let current = walker.nextNode()
  while (current) {
    nodes.push(current as Text)
    current = walker.nextNode()
  }
  return nodes
}

type TextChangeHandler = (change: {
  oldText: string
  newText: string
  element: HTMLElement
  occurrenceIndex: number
}) => void

/** Render a harness that wires useTextEdit to a container div. Returns the
 *  container element and the hook's commitEdit function. */
function renderEditor(onTextChange: TextChangeHandler, editMode = true) {
  const hookReturn = { current: { commitEdit: () => {} } }

  function Harness() {
    const containerRef = useRef<HTMLDivElement>(null)
    const result = useTextEdit(
      containerRef as RefObject<HTMLElement | null>,
      editMode,
      onTextChange,
    )
    hookReturn.current = result
    return createElement('div', { ref: containerRef, 'data-testid': 'editor' })
  }

  const { container: renderContainer } = render(createElement(Harness))
  const editorDiv = renderContainer.querySelector(
    '[data-testid="editor"]',
  ) as HTMLDivElement

  return {
    container: editorDiv,
    commitEdit: () => hookReturn.current.commitEdit(),
  }
}

// ─── useTextEdit ───────────────────────────────────────────────────────────

describe('useTextEdit — behavioral', () => {
  beforeEach(() => {
    // Run rAF callbacks synchronously so deferred blur handlers fire
    // immediately — this exercises the re-entrant finishEdit path.
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 0
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    cleanup()
  })

  it('preserves <br> structure when editing a text node', () => {
    const onTextChange = vi.fn<TextChangeHandler>()
    const { container, commitEdit } = renderEditor(onTextChange)

    container.innerHTML = '<p>Line one<br>Line two</p>'
    const p = container.querySelector('p')!

    // Activate editing by clicking the text element
    fireEvent.click(p, { clientX: 5, clientY: 5 })

    // Modify only the first text node — <br> stays in place
    const nodes = textNodesOf(p)
    expect(nodes.length).toBe(2)
    nodes[0].nodeValue = 'Line one edited'

    commitEdit()

    expect(onTextChange).toHaveBeenCalledTimes(1)
    expect(onTextChange.mock.calls[0][0].oldText).toBe('Line one')
    expect(onTextChange.mock.calls[0][0].newText).toBe('Line one edited')
    // <br> is preserved in the DOM
    expect(p.innerHTML).toContain('<br>')
    expect(p.innerHTML).toContain('Line two')
  })

  it('preserves <span> structure when editing a text node', () => {
    const onTextChange = vi.fn<TextChangeHandler>()
    const { container, commitEdit } = renderEditor(onTextChange)

    container.innerHTML = '<p>Hello <span>beautiful</span> world</p>'
    const p = container.querySelector('p')!

    fireEvent.click(p, { clientX: 5, clientY: 5 })

    // Edit the text inside the <span>
    const nodes = textNodesOf(p)
    const spanNode = nodes.find((n) => n.nodeValue === 'beautiful')!
    spanNode.nodeValue = 'amazing'

    commitEdit()

    expect(onTextChange).toHaveBeenCalledTimes(1)
    expect(onTextChange.mock.calls[0][0].oldText).toBe('beautiful')
    expect(onTextChange.mock.calls[0][0].newText).toBe('amazing')
    // <span> is preserved
    expect(p.innerHTML).toContain('<span>amazing</span>')
  })

  it('places the caret at the click point rather than selecting all text', () => {
    const onTextChange = vi.fn<TextChangeHandler>()
    const { container } = renderEditor(onTextChange)

    container.innerHTML = '<p>Some longer text content here</p>'
    const p = container.querySelector('p')!

    fireEvent.click(p, { clientX: 50, clientY: 10 })

    const sel = window.getSelection()
    expect(sel).not.toBeNull()
    expect(sel!.rangeCount).toBe(1)
    // The range must be collapsed (a caret), not a select-all selection
    expect(sel!.getRangeAt(0).collapsed).toBe(true)
  })

  it('clears activeEditRef before the callback fires (no double-submit)', () => {
    const onTextChange = vi.fn<TextChangeHandler>()
    const { container, commitEdit } = renderEditor(onTextChange)

    container.innerHTML = '<p>Original text</p>'
    const p = container.querySelector('p')!

    fireEvent.click(p, { clientX: 5, clientY: 5 })
    p.firstChild!.nodeValue = 'Modified text'

    // Commit — cleanupElement removes contenteditable which can trigger a
    // re-entrant blur → finishEdit. The ref is cleared first, so the
    // re-entrant call is a no-op and the callback fires exactly once.
    commitEdit()

    // Simulate a re-entrant blur to verify no double-submit
    fireEvent.blur(p)

    expect(onTextChange).toHaveBeenCalledTimes(1)
    expect(onTextChange.mock.calls[0][0].newText).toBe('Modified text')
  })
})

// ─── edit-helpers ──────────────────────────────────────────────────────────

describe('edit-helpers — behavioral', () => {
  it('applyImageSwap anchors on the alt attribute, not the src', () => {
    const html =
      '<img src="old.jpg" alt="Hero" /><img src="other.jpg" alt="Logo" />'
    const result = applyImageSwap(html, 'Hero', 'new.jpg')
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('src="new.jpg"')
    expect(result.html).toContain('alt="Hero"')
    // The second image (different alt) is unchanged
    expect(result.html).toContain('src="other.jpg"')
    expect(result.html).toContain('alt="Logo"')
  })

  it('applyStyleEdit anchors on the class attribute', () => {
    const html =
      '<div class="hero-section">Content</div><div class="footer">Footer</div>'
    const result = applyStyleEdit(html, 'hero-section', 'color: red;')
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('class="hero-section"')
    expect(result.html).toContain('style="color: red;"')
    // The footer div is unchanged — no style attribute added
    const footerMatch = result.html.match(/<div class="footer"[^>]*>/)
    expect(footerMatch).not.toBeNull()
    expect(footerMatch![0]).not.toContain('style=')
  })
})

// ─── Img component ─────────────────────────────────────────────────────────

describe('Img component — override src', () => {
  it('uses the override src from context overrides before the stock lookup', () => {
    const markup = renderToStaticMarkup(
      createElement(Image, {
        alt: 'Hero image',
        context: {
          overrides: { 'Hero image': 'https://cdn.example.com/override.jpg' },
        },
      }),
    )
    expect(markup).toContain('src="https://cdn.example.com/override.jpg"')
    // Should NOT fall back to the Pexels proxy
    expect(markup).not.toContain('/api/pexels')
  })
})

// ─── schema ────────────────────────────────────────────────────────────────

describe('schema — edits table', () => {
  it('includes the image edit type literal and occurrenceIndex field', () => {
    const editsTable = schema.tables.edits
    expect(editsTable).toBeDefined()

    interface ConvexFieldValidator {
      kind: string
      value?: string
      isOptional?: string
      members?: ConvexFieldValidator[]
    }
    const validator = editsTable.validator as {
      fields: Record<string, ConvexFieldValidator>
    }

    // editType is a union of literals — 'image' must be among them
    const editTypeValues = (validator.fields.editType.members ?? []).map(
      (m) => m.value,
    )
    expect(editTypeValues).toContain('image')

    // occurrenceIndex is an optional field
    expect(validator.fields.occurrenceIndex).toBeDefined()
    expect(validator.fields.occurrenceIndex.isOptional).toBeTruthy()
  })
})

// ─── export helpers ────────────────────────────────────────────────────────

describe('export helpers — exported functions', () => {
  it('applyPreviewTextEdit, applyImageSwap, and applyStyleEdit are exported functions', () => {
    expect(typeof applyPreviewTextEdit).toBe('function')
    expect(typeof applyImageSwap).toBe('function')
    expect(typeof applyStyleEdit).toBe('function')

    // Quick behavioral smoke: applyPreviewTextEdit replaces text in HTML
    const result = applyPreviewTextEdit('<p>Hello world</p>', 'Hello', 'Hi')
    expect(result.replaced).toBe(true)
    expect(result.html).toBe('<p>Hi world</p>')
  })
})

// ─── server-side image edit fallback invariant ────────────────────────────

describe('server-side image edit fallback invariant', () => {
  // Source-level test: verify that the server-side mutation helper treats
  // image edits like style edits when applyImageSwap fails — NOT falling back
  // to applyPreviewTextEdit (which would corrupt the OpenUI source by
  // replacing alt text with image URLs).
  it('session_edit_mutation_helpers treats image edits like style edits on fallback', async () => {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const sourcePath = resolve(
      import.meta.dirname,
      '../../../convex/lib/session_edit_mutation_helpers.ts',
    )
    const source = readFileSync(sourcePath, 'utf8')

    // The fallback condition must include 'image' alongside 'style'
    expect(source).toMatch(
      /editType\s*===?\s*['"]style['"]\s*\|\|\s*args\.editType\s*===?\s*['"]image['"]/,
    )
  })

  it('session_edit_mutation_helpers does NOT call applyPreviewTextEdit for image fallback', async () => {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const sourcePath = resolve(
      import.meta.dirname,
      '../../../convex/lib/session_edit_mutation_helpers.ts',
    )
    const source = readFileSync(sourcePath, 'utf8')

    // The fallback if-block must include both 'style' and 'image' in the
    // same condition, and the else branch (text-edit fallback) must come after.
    const ifMatch = source.match(
      /if\s*\(args\.editType\s*===?\s*['"]style['"]\s*\|\|\s*args\.editType\s*===?\s*['"]image['"]\)/,
    )
    expect(ifMatch).not.toBeNull()

    // The else branch with applyPreviewTextEdit must exist AFTER this if-block
    const elseIdx = source.indexOf('else', ifMatch!.index!)
    expect(elseIdx).toBeGreaterThan(ifMatch!.index!)
  })
})
