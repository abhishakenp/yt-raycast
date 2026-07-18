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
import { BaseImage as Image } from '@ship-fast/blocks'
import schema from '../../../convex/schema'

// ─── helpers ──────────────────────────────────────────────────────────────

/** Collect every Text node under `el` in document order. */
function textNodesOf(el: Node): Text[] {
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
  const hookReturn = {
    current: { commitEdit: () => {}, cancelEdit: () => {} },
  }

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
    cancelEdit: () => hookReturn.current.cancelEdit(),
  }
}

// ─── useTextEdit ───────────────────────────────────────────────────────────

describe('useTextEdit — behavioral', () => {
  beforeEach(() => {
    // Run rAF callbacks synchronously so deferred blur handlers fire
    // immediately — this exercises the re-entrant finishEdit path.
    vi.stubGlobal('requestAnimationFrame', (cb: (time: number) => void) => {
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

// ─── useTextEdit — cancel/revert ───────────────────────────────────────────

describe('useTextEdit — cancel reverts text changes', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (cb: (time: number) => void) => {
      cb(0)
      return 0
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    cleanup()
  })

  it('cancelEdit reverts text to original and does NOT fire onTextChange', () => {
    const onTextChange = vi.fn<TextChangeHandler>()
    const { container, cancelEdit } = renderEditor(onTextChange)

    container.innerHTML = '<p>Hello World</p>'
    const p = container.querySelector('p')!

    fireEvent.click(p, { clientX: 5, clientY: 5 })
    p.firstChild!.nodeValue = 'Changed Text'

    cancelEdit()

    // Text should be reverted
    expect(p.textContent).toBe('Hello World')
    // onTextChange should NOT have been called
    expect(onTextChange).not.toHaveBeenCalled()
  })

  it('cancelEdit reverts <br>-separated text preserving structure', () => {
    const onTextChange = vi.fn<TextChangeHandler>()
    const { container, cancelEdit } = renderEditor(onTextChange)

    container.innerHTML = '<h1>Line one<br>Line two</h1>'
    const h1 = container.querySelector('h1')!

    fireEvent.click(h1, { clientX: 5, clientY: 5 })
    const nodes = textNodesOf(h1)
    nodes[0].nodeValue = 'Changed one'
    nodes[1].nodeValue = 'Changed two'

    cancelEdit()

    // Both text nodes should be reverted, <br> preserved
    expect(h1.textContent).toBe('Line oneLine two')
    expect(h1.innerHTML).toContain('<br>')
    expect(onTextChange).not.toHaveBeenCalled()
  })

  it('cancelEdit reverts button text with SVG icon preserved', () => {
    const onTextChange = vi.fn<TextChangeHandler>()
    const { container, cancelEdit } = renderEditor(onTextChange)

    container.innerHTML =
      '<button><svg viewBox="0 0 24 24"><path d="M18.71"/></svg>App Store</button>'
    const btn = container.querySelector('button')!

    fireEvent.click(btn, { clientX: 50, clientY: 5 })
    const nodes = textNodesOf(btn)
    nodes[0].nodeValue = 'Changed'

    cancelEdit()

    // Text reverted, SVG preserved
    expect(btn.textContent).toContain('App Store')
    expect(btn.querySelector('svg')).not.toBeNull()
    expect(btn.querySelector('path')).not.toBeNull()
    expect(onTextChange).not.toHaveBeenCalled()
  })

  it('cancelEdit is a no-op when no edit is active', () => {
    const onTextChange = vi.fn<TextChangeHandler>()
    const { container, cancelEdit } = renderEditor(onTextChange)

    container.innerHTML = '<p>Hello</p>'

    // Cancel without any active edit — should not throw
    expect(() => cancelEdit()).not.toThrow()
    expect(onTextChange).not.toHaveBeenCalled()
  })

  it('cancelEdit removes contenteditable attribute', () => {
    const onTextChange = vi.fn<TextChangeHandler>()
    const { container, cancelEdit } = renderEditor(onTextChange)

    container.innerHTML = '<p>Hello</p>'
    const p = container.querySelector('p')!

    fireEvent.click(p, { clientX: 5, clientY: 5 })
    // contentEditable property is set by the hook
    expect(p.contentEditable).toBe('true')

    cancelEdit()

    // After cancel, the contenteditable attribute should be removed
    // (cleanupElement uses removeAttribute, not setting to false)
    expect(p.getAttribute('contenteditable')).toBeNull()
  })

  it('cancelEdit unlocks non-text children (SVG icons)', () => {
    const onTextChange = vi.fn<TextChangeHandler>()
    const { container, cancelEdit } = renderEditor(onTextChange)

    container.innerHTML =
      '<button><svg viewBox="0 0 24 24"><path d="M1"/></svg>Click Me</button>'
    const btn = container.querySelector('button')!
    const svg = btn.querySelector('svg')!

    fireEvent.click(btn, { clientX: 50, clientY: 5 })
    // SVG should be locked during editing
    expect(svg.getAttribute('contenteditable')).toBe('false')

    cancelEdit()

    // SVG should be unlocked after cancel
    expect(svg.getAttribute('contenteditable')).toBeNull()
  })

  it('cancelEdit then commitEdit does not fire onTextChange', () => {
    const onTextChange = vi.fn<TextChangeHandler>()
    const { container, cancelEdit, commitEdit } = renderEditor(onTextChange)

    container.innerHTML = '<p>Hello</p>'
    const p = container.querySelector('p')!

    fireEvent.click(p, { clientX: 5, clientY: 5 })
    p.firstChild!.nodeValue = 'Changed'

    cancelEdit()

    // After cancel, commit should be a no-op (no active edit)
    commitEdit()
    expect(onTextChange).not.toHaveBeenCalled()
  })

  it('commitEdit fires onTextChange; cancelEdit after commit is no-op', () => {
    const onTextChange = vi.fn<TextChangeHandler>()
    const { container, cancelEdit, commitEdit } = renderEditor(onTextChange)

    container.innerHTML = '<p>Hello</p>'
    const p = container.querySelector('p')!

    fireEvent.click(p, { clientX: 5, clientY: 5 })
    p.firstChild!.nodeValue = 'World'

    commitEdit()
    expect(onTextChange).toHaveBeenCalledTimes(1)
    expect(onTextChange.mock.calls[0][0].newText).toBe('World')

    // Cancel after commit — should be a no-op
    cancelEdit()
    // Text should still be the edited value (cancel can't undo a commit)
    expect(p.textContent).toBe('World')
    expect(onTextChange).toHaveBeenCalledTimes(1)
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
  it('applyPreviewTextEdit corrupts OpenUI source when used as image fallback', () => {
    // This test documents WHY image edits must not fall back to
    // applyPreviewTextEdit: it replaces the alt TEXT with the image URL,
    // turning Image("Hero") into Image("/new-hero.jpg") — corrupting the source.
    const openUiSource = 'hero = Image("Hero")'
    const result = applyPreviewTextEdit(openUiSource, 'Hero', '/new-hero.jpg')
    if (result.replaced) {
      // The source is corrupted: the alt "Hero" was replaced with the URL
      expect(result.html).toContain('/new-hero.jpg')
      expect(result.html).not.toMatch(/Image\("Hero"\)/)
    }
  })

  it('applyImageSwap returns replaced:false when alt not found (no img tags)', () => {
    // When preview.html is OpenUI source (no <img> tags), applyImageSwap
    // correctly returns replaced:false — the server must save the edit record
    // and reapply client-side via imageOverrides, NOT corrupt the source.
    const result = applyImageSwap('$page = "Home"', 'Hero', '/new.jpg')
    expect(result.replaced).toBe(false)
  })
})
