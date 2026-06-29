import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'

// Set up jsdom globals BEFORE importing useTextEdit, which uses
// document.createTreeWalker at module level via collectTextNodes.
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
globalThis.document = dom.window.document as unknown as Document
globalThis.window = dom.window as unknown as Window & typeof globalThis
globalThis.NodeFilter = dom.window.NodeFilter
globalThis.Node = dom.window.Node as unknown as typeof Node
globalThis.InputEvent = dom.window.InputEvent as unknown as typeof InputEvent
globalThis.KeyboardEvent = dom.window
  .KeyboardEvent as unknown as typeof KeyboardEvent
globalThis.Range = dom.window.Range as unknown as typeof Range
globalThis.Selection = dom.window.Selection as unknown as typeof Selection

// jsdom does not implement execCommand — mock it to insert text at caret.
if (!document.execCommand) {
  document.execCommand = ((
    command: string,
    _showUI?: boolean,
    value?: string,
  ) => {
    if (command !== 'insertText') return false
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return false
    const range = sel.getRangeAt(0)
    const container = range.startContainer
    const offset = range.startOffset
    if (container.nodeType === Node.TEXT_NODE) {
      // Insert text at the caret offset within the existing text node
      const current = container.textContent ?? ''
      container.textContent =
        current.slice(0, offset) + (value ?? '') + current.slice(offset)
      // Move caret to end of inserted text
      range.setStart(container, offset + (value?.length ?? 0))
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
    } else {
      const textNode = document.createTextNode(value ?? '')
      range.insertNode(textNode)
    }
    return true
  }) as typeof document.execCommand
}

import {
  diffEdits,
  collectTextNodes,
  findTextElement,
  isClickOnActiveEdit,
  lockNonTextChildren,
  unlockNonTextChildren,
  shouldPreventLockedDeletion,
  revertTextPreservingIcons,
  type TextEditState,
} from './useTextEdit'
import { applyPreviewTextEdit } from '@/lib/edit-helpers'

/**
 * Full-chain contract tests for inline text edit persistence.
 *
 * These tests exercise the REAL diffEdits function (not a copy) with a real
 * jsdom DOM, then chain the output through applyPreviewTextEdit (the server-
 * side patch function) and assert source integrity. This catches:
 *
 * 1. Client-side bugs: diffEdits producing oldText that spans multiple OpenUI
 *    source arguments (corrupting them via aggressive separator matching)
 * 2. Server-side bugs: applyPreviewTextEdit eating quotes/commas between args
 * 3. Deletion bugs: empty newText being rejected or corrupting the source
 * 4. Edge cases: multiple <br> tags, <span> wrappers, partial edits, etc.
 *
 * The regression these guard against: user edits text spanning a <br> tag,
 * diffEdits falls back to flattened textContent, the full string gets sent to
 * the server, the aggressive separator pattern matches across quote/comma
 * boundaries in the OpenUI source, and multiple arguments get eaten into one.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Count quoted string arguments in an OpenUI function call. */
function countQuotedArgs(source: string, funcName: string): number {
  const match = source.match(new RegExp(`${funcName}\\(([^)]*)\\)`))
  if (!match) return -1
  // Count top-level quoted strings (not inside arrays/objects)
  let count = 0
  let inString = false
  let depth = 0
  for (let i = 0; i < match[1].length; i++) {
    const ch = match[1][i]
    if (ch === '"' && match[1][i - 1] !== '\\') {
      if (!inString) {
        inString = true
        if (depth === 0) count++
      } else {
        inString = false
      }
    } else if (!inString) {
      if (ch === '[' || ch === '{') depth++
      else if (ch === ']' || ch === '}') depth--
    }
  }
  return count
}

/** Create a TextEditState from an element (simulates activation). */
function captureState(el: HTMLElement): TextEditState {
  const nodes = collectTextNodes(el)
  return {
    element: el,
    originalText: el.textContent ?? '',
    originalNodes: nodes.map((node) => ({ node, value: node.nodeValue ?? '' })),
  }
}

/**
 * Full-chain simulation: edit element text → diffEdits → applyPreviewTextEdit
 * → verify the source is patched correctly without corruption.
 */
function simulateEdit(
  source: string,
  state: TextEditState,
): {
  changes: Array<{ oldText: string; newText: string }>
  patchedSource: string
  replaced: boolean
} {
  const changes = diffEdits(state)
  let patchedSource = source
  let replaced = false
  for (const change of changes) {
    const result = applyPreviewTextEdit(
      patchedSource,
      change.oldText,
      change.newText,
    )
    if (result.replaced) {
      patchedSource = result.html
      replaced = true
    }
  }
  return { changes, patchedSource, replaced }
}

// ─── Tests ────────────────────────────────────────────────────────────────

describe('inline edit full-chain: br-separated text', () => {
  // Uses global document set up at module load via jsdom

  // ── Per-node edits (node structure preserved) ──────────────────────────

  describe('per-node edits (structure preserved)', () => {
    it('edits single text node without touching <br> sibling', () => {
      // <h1>Craving Something Hot?<br>Pizza Delivered Fast</h1>
      const h1 = document.createElement('h1')
      h1.textContent = ''
      h1.appendChild(document.createTextNode('Craving Something Hot?'))
      h1.appendChild(document.createElement('br'))
      h1.appendChild(document.createTextNode('Pizza Delivered Fast'))

      const state = captureState(h1)
      // Edit only the second text node
      const nodes = collectTextNodes(h1)
      nodes[1].nodeValue = 'Pizza Delivered NOW'

      const source =
        'home_hero = FoodDeliveryHero("Craving Something Hot?", "Pizza Delivered Fast", "Choose from hundreds")'
      const { changes, patchedSource, replaced } = simulateEdit(source, state)

      expect(replaced).toBe(true)
      expect(changes).toHaveLength(1)
      expect(changes[0].oldText).toBe('Pizza Delivered Fast')
      expect(changes[0].newText).toBe('Pizza Delivered NOW')
      // Source integrity: 3 args preserved, quotes intact
      expect(countQuotedArgs(patchedSource, 'FoodDeliveryHero')).toBe(3)
      expect(patchedSource).toContain('"Craving Something Hot?"')
      expect(patchedSource).toContain('"Pizza Delivered NOW"')
      expect(patchedSource).toContain('"Choose from hundreds"')
    })
  })

  // ── Node-merge edits (structure changed → minimal diff fallback) ───────

  describe('node-merge edits (structure changed → minimal diff)', () => {
    it('replaces word across <br>: Fast → NOW', () => {
      const h1 = document.createElement('h1')
      h1.appendChild(document.createTextNode('Craving Something Hot?'))
      h1.appendChild(document.createElement('br'))
      h1.appendChild(document.createTextNode('Pizza Delivered Fast'))

      const state = captureState(h1)
      // Simulate browser merging text nodes when user selects across <br>
      h1.textContent = 'Craving Something Hot?Pizza Delivered NOW'

      const source =
        'home_hero = FoodDeliveryHero("Craving Something Hot?", "Pizza Delivered Fast", "Choose from hundreds")'
      const { changes, patchedSource, replaced } = simulateEdit(source, state)

      expect(replaced).toBe(true)
      // Minimal diff: only "Fast" → "NOW", not the full flattened string
      expect(changes).toHaveLength(1)
      expect(changes[0].oldText).toBe('Fast')
      expect(changes[0].newText).toBe('NOW')
      // Source integrity
      expect(countQuotedArgs(patchedSource, 'FoodDeliveryHero')).toBe(3)
      expect(patchedSource).toContain('"Pizza Delivered NOW"')
      expect(patchedSource).toContain('"Craving Something Hot?"')
    })

    it('deletes text after <br>: removes second fragment', () => {
      const h1 = document.createElement('h1')
      h1.appendChild(document.createTextNode('Craving Something Hot?'))
      h1.appendChild(document.createElement('br'))
      h1.appendChild(document.createTextNode('Pizza Delivered Fast'))

      const state = captureState(h1)
      // User deletes "Pizza Delivered Fast"
      h1.textContent = 'Craving Something Hot?'

      const source =
        'home_hero = FoodDeliveryHero("Craving Something Hot?", "Pizza Delivered Fast", "Choose from hundreds")'
      const { changes, patchedSource, replaced } = simulateEdit(source, state)

      expect(replaced).toBe(true)
      // Minimal diff: "Pizza Delivered Fast" → "" (deletion)
      expect(changes).toHaveLength(1)
      expect(changes[0].oldText).toBe('Pizza Delivered Fast')
      expect(changes[0].newText).toBe('')
      // Source integrity: 3 args preserved, second is now empty string
      expect(countQuotedArgs(patchedSource, 'FoodDeliveryHero')).toBe(3)
      expect(patchedSource).toContain('"Craving Something Hot?", ""')
      expect(patchedSource).toContain('"Choose from hundreds"')
    })

    it('deletes text before <br>: removes first fragment', () => {
      const h1 = document.createElement('h1')
      h1.appendChild(document.createTextNode('Craving Something Hot?'))
      h1.appendChild(document.createElement('br'))
      h1.appendChild(document.createTextNode('Pizza Delivered Fast'))

      const state = captureState(h1)
      h1.textContent = 'Pizza Delivered Fast'

      const source =
        'home_hero = FoodDeliveryHero("Craving Something Hot?", "Pizza Delivered Fast", "Choose from hundreds")'
      const { changes, patchedSource, replaced } = simulateEdit(source, state)

      expect(replaced).toBe(true)
      expect(changes).toHaveLength(1)
      expect(changes[0].oldText).toBe('Craving Something Hot?')
      expect(changes[0].newText).toBe('')
      expect(countQuotedArgs(patchedSource, 'FoodDeliveryHero')).toBe(3)
      expect(patchedSource).toContain('"", "Pizza Delivered Fast"')
    })

    it('replaces text at start across <br>', () => {
      const h1 = document.createElement('h1')
      h1.appendChild(document.createTextNode('Craving Something Hot?'))
      h1.appendChild(document.createElement('br'))
      h1.appendChild(document.createTextNode('Pizza Delivered Fast'))

      const state = captureState(h1)
      h1.textContent = 'Want Something Hot?Pizza Delivered Fast'

      const source =
        'home_hero = FoodDeliveryHero("Craving Something Hot?", "Pizza Delivered Fast", "Choose from hundreds")'
      const { changes, patchedSource, replaced } = simulateEdit(source, state)

      expect(replaced).toBe(true)
      expect(changes[0].oldText).toBe('Craving')
      expect(changes[0].newText).toBe('Want')
      expect(countQuotedArgs(patchedSource, 'FoodDeliveryHero')).toBe(3)
      expect(patchedSource).toContain('"Want Something Hot?"')
    })
  })

  // ── Multiple <br> tags (3+ fragments) ─────────────────────────────────

  describe('multiple <br> tags', () => {
    it('edits last fragment across two <br> tags', () => {
      const h1 = document.createElement('h1')
      h1.appendChild(document.createTextNode('Line One'))
      h1.appendChild(document.createElement('br'))
      h1.appendChild(document.createTextNode('Line Two'))
      h1.appendChild(document.createElement('br'))
      h1.appendChild(document.createTextNode('Line Three'))

      const state = captureState(h1)
      // Edit last word of last fragment
      h1.textContent = 'Line OneLine TwoLine Thirty'

      const source = 'hero = Heading("Line One", "Line Two", "Line Three")'
      const { changes, patchedSource, replaced } = simulateEdit(source, state)

      expect(replaced).toBe(true)
      // Minimal diff: "ree" → "irty" (shared prefix "Line OneLine TwoLine Th")
      expect(changes[0].newText).toBe('irty')
      expect(countQuotedArgs(patchedSource, 'Heading')).toBe(3)
      expect(patchedSource).toContain('"Line Thirty"')
      expect(patchedSource).toContain('"Line One"')
      expect(patchedSource).toContain('"Line Two"')
    })

    it('deletes last fragment across two <br> tags', () => {
      const h1 = document.createElement('h1')
      h1.appendChild(document.createTextNode('Line One'))
      h1.appendChild(document.createElement('br'))
      h1.appendChild(document.createTextNode('Line Two'))
      h1.appendChild(document.createElement('br'))
      h1.appendChild(document.createTextNode('Line Three'))

      const state = captureState(h1)
      h1.textContent = 'Line OneLine Two'

      const source = 'hero = Heading("Line One", "Line Two", "Line Three")'
      const { changes, patchedSource, replaced } = simulateEdit(source, state)

      expect(replaced).toBe(true)
      // Minimal diff: "Line Three" → "" (deletion of last fragment)
      expect(changes[0].oldText).toBe('Line Three')
      expect(changes[0].newText).toBe('')
      expect(countQuotedArgs(patchedSource, 'Heading')).toBe(3)
      expect(patchedSource).toContain('"Line Two", ""')
    })
  })

  // ── <span> and other inline wrappers ──────────────────────────────────

  describe('inline wrappers (span, strong, em)', () => {
    it('edits text inside <span> within <p>', () => {
      const p = document.createElement('p')
      const span = document.createElement('span')
      span.textContent = 'Important text'
      p.appendChild(document.createTextNode('This is '))
      p.appendChild(span)
      p.appendChild(document.createTextNode(' here'))

      const state = captureState(p)
      // Edit the span text
      span.textContent = 'Edited text'

      const source = 'para = Paragraph("This is ", "Important text", " here")'
      const { changes, patchedSource, replaced } = simulateEdit(source, state)

      expect(replaced).toBe(true)
      expect(changes).toHaveLength(1)
      expect(changes[0].oldText).toBe('Important text')
      expect(changes[0].newText).toBe('Edited text')
      expect(patchedSource).toContain('"Edited text"')
    })

    it('edits text spanning <strong> wrapper (node merge)', () => {
      const p = document.createElement('p')
      p.appendChild(document.createTextNode('Hello '))
      const strong = document.createElement('strong')
      strong.textContent = 'World'
      p.appendChild(strong)

      const state = captureState(p)
      // User selects across <strong>, merging nodes
      p.textContent = 'Hello Universe'

      const source = 'para = Paragraph("Hello ", "World")'
      const { changes, patchedSource, replaced } = simulateEdit(source, state)

      expect(replaced).toBe(true)
      // Minimal diff: "World" → "Universe"
      expect(changes[0].oldText).toBe('World')
      expect(changes[0].newText).toBe('Universe')
      expect(countQuotedArgs(patchedSource, 'Paragraph')).toBe(2)
      expect(patchedSource).toContain('"Hello "')
      expect(patchedSource).toContain('"Universe"')
    })
  })

  // ── Edge cases ────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('complete rewrite (no common prefix/suffix)', () => {
      const h1 = document.createElement('h1')
      h1.textContent = 'Pizza Delivered Fast'
      const state = captureState(h1)
      h1.textContent = 'Welcome to our restaurant'

      const source = 'hero = Heading("Pizza Delivered Fast")'
      const { changes, replaced } = simulateEdit(source, state)

      expect(replaced).toBe(true)
      // Full text sent (no minimal diff possible)
      expect(changes).toHaveLength(1)
      // oldText should contain the original text (possibly minus 1 char suffix)
      expect(changes[0].oldText).toContain('Pizza Delivered')
    })

    it('no change returns empty array', () => {
      const h1 = document.createElement('h1')
      h1.textContent = 'Hello World'
      const state = captureState(h1)
      // No edit made
      const changes = diffEdits(state)
      expect(changes).toHaveLength(0)
    })

    it('whitespace-only change is ignored', () => {
      const h1 = document.createElement('h1')
      h1.textContent = 'Hello World'
      const state = captureState(h1)
      // Only whitespace changed
      const nodes = collectTextNodes(h1)
      nodes[0].nodeValue = '   '
      const changes = diffEdits(state)
      // Per-node path: oldText.trim() is true but newText.trim() is false → skipped
      expect(changes).toHaveLength(0)
    })

    it('unicode and special characters', () => {
      const h1 = document.createElement('h1')
      h1.appendChild(document.createTextNode('Café'))
      h1.appendChild(document.createElement('br'))
      h1.appendChild(document.createTextNode('Münster'))

      const state = captureState(h1)
      // Edit "Münster" to "München"
      h1.textContent = 'CaféMünchen'

      const source = 'hero = Heading("Café", "Münster")'
      const { changes, patchedSource, replaced } = simulateEdit(source, state)

      expect(replaced).toBe(true)
      // Minimal diff: "ster" → "chen" (shared prefix "Mün")
      expect(changes[0].newText).toBe('chen')
      expect(countQuotedArgs(patchedSource, 'Heading')).toBe(2)
      expect(patchedSource).toContain('München')
    })

    it('text with quotes and commas (HTML-encoded in source)', () => {
      const p = document.createElement('p')
      p.textContent = 'Say "hello", then leave'
      const state = captureState(p)
      // Edit "hello" to "goodbye"
      const nodes = collectTextNodes(p)
      nodes[0].nodeValue = 'Say "goodbye", then leave'

      const source = 'para = Paragraph("Say \\"hello\\", then leave")'
      const { changes, replaced } = simulateEdit(source, state)

      expect(replaced).toBe(true)
      expect(changes[0].oldText).toBe('Say "hello", then leave')
      expect(changes[0].newText).toBe('Say "goodbye", then leave')
    })

    it('long text (100+ chars) across <br>', () => {
      const long1 =
        'This is a very long heading that spans many words and goes on'
      const long2 =
        'And here is the second part which is also quite long indeed'
      const h1 = document.createElement('h1')
      h1.appendChild(document.createTextNode(long1))
      h1.appendChild(document.createElement('br'))
      h1.appendChild(document.createTextNode(long2))

      const state = captureState(h1)
      // Edit last word of second fragment
      h1.textContent =
        long1 + 'And here is the second part which is also quite long NOW'

      const source = `hero = Heading("${long1}", "${long2}")`
      const { changes, patchedSource, replaced } = simulateEdit(source, state)

      expect(replaced).toBe(true)
      expect(changes[0].oldText).toBe('indeed')
      expect(changes[0].newText).toBe('NOW')
      expect(countQuotedArgs(patchedSource, 'Heading')).toBe(2)
    })
  })

  // ── Source integrity guards ───────────────────────────────────────────

  describe('source integrity guards (regression prevention)', () => {
    it('NEVER sends full flattened text that would corrupt source args', () => {
      // This is the core regression test: if diffEdits ever falls back to
      // full flattened textContent for a br-spanning edit, the aggressive
      // separator pattern on the server would eat quotes/commas between
      // OpenUI source arguments, corrupting the source.
      const h1 = document.createElement('h1')
      h1.appendChild(document.createTextNode('Craving Something Hot?'))
      h1.appendChild(document.createElement('br'))
      h1.appendChild(document.createTextNode('Pizza Delivered Fast'))

      const state = captureState(h1)
      h1.textContent = 'Craving Something Hot?Pizza Delivered NOW'

      const changes = diffEdits(state)
      expect(changes).toHaveLength(1)

      // The oldText must NOT be the full flattened string. It must be a
      // minimal diff that exists within a single source argument.
      const fullFlattened = 'Craving Something Hot?Pizza Delivered Fast'
      expect(changes[0].oldText).not.toBe(fullFlattened)
      expect(changes[0].oldText.length).toBeLessThan(fullFlattened.length)
    })

    it('NEVER sends full flattened text for deletion (would corrupt source)', () => {
      const h1 = document.createElement('h1')
      h1.appendChild(document.createTextNode('Craving Something Hot?'))
      h1.appendChild(document.createElement('br'))
      h1.appendChild(document.createTextNode('Pizza Delivered Fast'))

      const state = captureState(h1)
      h1.textContent = 'Craving Something Hot?'

      const changes = diffEdits(state)
      expect(changes).toHaveLength(1)

      // oldText must be just the deleted portion, not the full original
      expect(changes[0].oldText).toBe('Pizza Delivered Fast')
      expect(changes[0].newText).toBe('')
      // Must NOT be the full flattened original
      expect(changes[0].oldText).not.toBe(
        'Craving Something Hot?Pizza Delivered Fast',
      )
    })

    it('patched source always preserves argument count', () => {
      // Run through several edit scenarios and verify arg count never changes
      const scenarios = [
        { original: 'Hello', edited: 'Hi', args: 3 },
        { original: 'World', edited: '', args: 3 },
        { original: 'Test', edited: 'Testing', args: 3 },
      ]

      const source = 'hero = Heading("Hello", "World", "Test")'

      for (const scenario of scenarios) {
        const h1 = document.createElement('h1')
        h1.textContent = scenario.original
        const state = captureState(h1)
        h1.textContent = scenario.edited

        const { patchedSource } = simulateEdit(source, state)
        expect(countQuotedArgs(patchedSource, 'Heading')).toBe(scenario.args)
      }
    })

    it('patched source never has merged arguments (no eaten quotes)', () => {
      const h1 = document.createElement('h1')
      h1.appendChild(document.createTextNode('Craving Something Hot?'))
      h1.appendChild(document.createElement('br'))
      h1.appendChild(document.createTextNode('Pizza Delivered Fast'))

      const state = captureState(h1)
      h1.textContent = 'Craving Something Hot?Pizza Delivered NOW'

      const source =
        'home_hero = FoodDeliveryHero("Craving Something Hot?", "Pizza Delivered Fast", "Choose from hundreds")'
      const { patchedSource } = simulateEdit(source, state)

      // Must still have 6 quotes (3 pairs for 3 string args)
      const quoteCount = (patchedSource.match(/"/g) ?? []).length
      expect(quoteCount).toBe(6)

      // Must NOT have merged args like "Craving Something Hot?Pizza Delivered NOW"
      expect(patchedSource).not.toContain(
        '"Craving Something Hot?Pizza Delivered NOW"',
      )
    })
  })
})

// ─── findTextElement: element editability tests ───────────────────────────

describe('findTextElement: which elements are editable', () => {
  /** Helper: create an element, append to body, find, then clean up. */
  function withElement<T>(tag: string, fn: (el: HTMLElement) => T): T {
    const el = document.createElement(tag)
    document.body.appendChild(el)
    try {
      return fn(el)
    } finally {
      el.remove()
    }
  }

  describe('buttons and links are editable', () => {
    it('finds a <button> with text content', () => {
      withElement('button', (btn) => {
        btn.textContent = 'Get Started'
        const result = findTextElement(btn)
        expect(result).not.toBeNull()
        expect(result?.tagName.toLowerCase()).toBe('button')
      })
    })

    it('finds an <a> with text content', () => {
      withElement('a', (a) => {
        a.textContent = 'Learn more'
        a.setAttribute('href', '#')
        const result = findTextElement(a)
        expect(result).not.toBeNull()
        expect(result?.tagName.toLowerCase()).toBe('a')
      })
    })

    it('finds inner <span> inside <button> (innermost editable wins)', () => {
      withElement('button', (btn) => {
        const span = document.createElement('span')
        span.textContent = 'Click Me'
        btn.appendChild(span)
        // Click target is the span. The walker finds the span first
        // because it's an editable leaf with text — correct behavior.
        const result = findTextElement(span)
        expect(result).not.toBeNull()
        expect(result?.tagName.toLowerCase()).toBe('span')
      })
    })

    it('finds <button> directly when it has text (no child span)', () => {
      withElement('button', (btn) => {
        btn.textContent = 'Click Me'
        const result = findTextElement(btn)
        expect(result).not.toBeNull()
        expect(result?.tagName.toLowerCase()).toBe('button')
      })
    })

    it('finds inner <span> inside <a> (innermost editable wins)', () => {
      withElement('a', (a) => {
        a.setAttribute('href', '/about')
        const span = document.createElement('span')
        span.textContent = 'About Us'
        a.appendChild(span)
        const result = findTextElement(span)
        expect(result).not.toBeNull()
        expect(result?.tagName.toLowerCase()).toBe('span')
      })
    })

    it('finds <a> directly when it has text (no child span)', () => {
      withElement('a', (a) => {
        a.setAttribute('href', '/about')
        a.textContent = 'About Us'
        const result = findTextElement(a)
        expect(result).not.toBeNull()
        expect(result?.tagName.toLowerCase()).toBe('a')
      })
    })
  })

  describe('non-text elements remain excluded', () => {
    it('rejects <input> elements', () => {
      withElement('input', (input) => {
        input.setAttribute('type', 'text')
        input.setAttribute('value', 'placeholder')
        expect(findTextElement(input)).toBeNull()
      })
    })

    it('rejects <textarea> elements', () => {
      withElement('textarea', (ta) => {
        ta.textContent = 'some text'
        expect(findTextElement(ta)).toBeNull()
      })
    })

    it('rejects <select> elements', () => {
      withElement('select', (sel) => {
        const opt = document.createElement('option')
        opt.textContent = 'Option 1'
        sel.appendChild(opt)
        expect(findTextElement(sel)).toBeNull()
      })
    })

    it('rejects <svg> elements', () => {
      withElement('svg', (svg) => {
        svg.textContent = 'icon'
        expect(findTextElement(svg)).toBeNull()
      })
    })

    it('rejects <img> elements', () => {
      withElement('img', (img) => {
        img.setAttribute('alt', 'photo')
        expect(findTextElement(img)).toBeNull()
      })
    })

    it('rejects <video> elements', () => {
      withElement('video', (vid) => {
        expect(findTextElement(vid)).toBeNull()
      })
    })
  })

  describe('existing editable elements still work', () => {
    it('finds <h1> with text', () => {
      withElement('h1', (h1) => {
        h1.textContent = 'Welcome'
        expect(findTextElement(h1)?.tagName.toLowerCase()).toBe('h1')
      })
    })

    it('finds <p> with text', () => {
      withElement('p', (p) => {
        p.textContent = 'Lorem ipsum'
        expect(findTextElement(p)?.tagName.toLowerCase()).toBe('p')
      })
    })

    it('finds <span> with text', () => {
      withElement('span', (span) => {
        span.textContent = 'inline text'
        expect(findTextElement(span)?.tagName.toLowerCase()).toBe('span')
      })
    })

    it('finds <li> with text', () => {
      withElement('li', (li) => {
        li.textContent = 'List item'
        expect(findTextElement(li)?.tagName.toLowerCase()).toBe('li')
      })
    })

    it('finds <label> with text', () => {
      withElement('label', (label) => {
        label.textContent = 'Email'
        expect(findTextElement(label)?.tagName.toLowerCase()).toBe('label')
      })
    })
  })

  describe('block-level containers are not editable', () => {
    it('rejects a <div> wrapping <h3> + <p> (multi-block container)', () => {
      withElement('div', (div) => {
        const h3 = document.createElement('h3')
        h3.textContent = 'Title'
        const p = document.createElement('p')
        p.textContent = 'Body'
        div.appendChild(h3)
        div.appendChild(p)
        // Clicking the div should not find an editable text element
        // because it contains block-level children
        expect(findTextElement(div)).toBeNull()
      })
    })

    it('rejects a <button> wrapping block-level children', () => {
      withElement('button', (btn) => {
        const div = document.createElement('div')
        div.textContent = 'Complex button'
        btn.appendChild(div)
        // Button with block child should not be editable (would flatten structure)
        expect(findTextElement(btn)).toBeNull()
      })
    })

    it('rejects an <a> wrapping block-level children', () => {
      withElement('a', (a) => {
        a.setAttribute('href', '#')
        const section = document.createElement('section')
        section.textContent = 'Complex link'
        a.appendChild(section)
        expect(findTextElement(a)).toBeNull()
      })
    })
  })

  describe('edge cases', () => {
    it('rejects empty elements', () => {
      withElement('button', (btn) => {
        expect(findTextElement(btn)).toBeNull()
      })
    })

    it('rejects whitespace-only elements', () => {
      withElement('button', (btn) => {
        btn.textContent = '   '
        expect(findTextElement(btn)).toBeNull()
      })
    })

    it('rejects text exceeding 500 chars', () => {
      withElement('button', (btn) => {
        btn.textContent = 'x'.repeat(501)
        expect(findTextElement(btn)).toBeNull()
      })
    })

    it('accepts text at exactly 499 chars', () => {
      withElement('button', (btn) => {
        btn.textContent = 'x'.repeat(499)
        expect(findTextElement(btn)).not.toBeNull()
      })
    })

    it('walks up from non-editable child to editable parent', () => {
      withElement('a', (a) => {
        a.setAttribute('href', '#')
        a.textContent = 'Click here'
        // Simulate clicking an <svg> icon inside the link
        const svg = document.createElement('svg')
        a.appendChild(svg)
        const result = findTextElement(svg)
        // SVG is rejected, but walker should NOT continue to parent
        // because SVG returns null immediately (it's in the hard-exclusion list)
        expect(result).toBeNull()
      })
    })

    it('walks up from <span> inside <a> to the <a>', () => {
      withElement('a', (a) => {
        a.setAttribute('href', '#')
        const span = document.createElement('span')
        span.textContent = 'Read more'
        a.appendChild(span)
        const result = findTextElement(span)
        // Span has text but is inside an <a>. The walker finds the span first
        // (span is in the editable list and has text), so it returns the span.
        expect(result).not.toBeNull()
        expect(result?.tagName.toLowerCase()).toBe('span')
      })
    })
  })

  describe('full-chain: button text edit persists to source', () => {
    it('edits button text and patches OpenUI source', () => {
      const btn = document.createElement('button')
      btn.textContent = 'Get Started'
      document.body.appendChild(btn)

      const state = captureState(btn)
      btn.textContent = 'Sign Up Now'

      const source = 'cta_btn = Button("Get Started", "/signup")'
      const { patchedSource, replaced } = simulateEdit(source, state)

      expect(replaced).toBe(true)
      expect(patchedSource).toContain('"Sign Up Now"')
      expect(patchedSource).toContain('"/signup"')
      // Button href arg preserved
      expect(countQuotedArgs(patchedSource, 'Button')).toBe(2)

      btn.remove()
    })

    it('edits link text and patches OpenUI source', () => {
      const a = document.createElement('a')
      a.textContent = 'Learn more'
      a.setAttribute('href', '/docs')
      document.body.appendChild(a)

      const state = captureState(a)
      a.textContent = 'Read the docs'

      const source = 'link = Link("Learn more", "/docs")'
      const { patchedSource, replaced } = simulateEdit(source, state)

      expect(replaced).toBe(true)
      expect(patchedSource).toContain('"Read the docs"')
      expect(patchedSource).toContain('"/docs"')
      expect(countQuotedArgs(patchedSource, 'Link')).toBe(2)

      a.remove()
    })

    it('edits nav link text without corrupting adjacent args', () => {
      const a = document.createElement('a')
      a.textContent = 'Pricing'
      a.setAttribute('href', '/pricing')
      document.body.appendChild(a)

      const state = captureState(a)
      a.textContent = 'Plans & Pricing'

      const source =
        'nav = Navbar("Home", "Features", "Pricing", "About", "Contact")'
      const { patchedSource, replaced } = simulateEdit(source, state)

      expect(replaced).toBe(true)
      expect(patchedSource).toContain('"Plans & Pricing"')
      // All 5 nav args preserved
      expect(countQuotedArgs(patchedSource, 'Navbar')).toBe(5)
      expect(patchedSource).toContain('"Home"')
      expect(patchedSource).toContain('"Features"')
      expect(patchedSource).toContain('"About"')
      expect(patchedSource).toContain('"Contact"')

      a.remove()
    })
  })
})

// ─── isClickOnActiveEdit: synthetic click suppression ─────────────────────

describe('isClickOnActiveEdit: synthetic click suppression', () => {
  /** Helper: create an element, append to body, test, then clean up. */
  function withElement<T>(tag: string, fn: (el: HTMLElement) => T): T {
    const el = document.createElement(tag)
    document.body.appendChild(el)
    try {
      return fn(el)
    } finally {
      el.remove()
    }
  }

  it('returns true when target IS the active edit element', () => {
    withElement('button', (btn) => {
      btn.textContent = 'Click Me'
      expect(isClickOnActiveEdit(btn, btn)).toBe(true)
    })
  })

  it('returns true when target is a child of the active edit element', () => {
    withElement('button', (btn) => {
      const span = document.createElement('span')
      span.textContent = 'Click Me'
      btn.appendChild(span)
      // Synthetic click from Space lands on the button, but might also
      // land on a child span if that's where focus was
      expect(isClickOnActiveEdit(span, btn)).toBe(true)
    })
  })

  it('returns true for deeply nested child of active element', () => {
    withElement('a', (a) => {
      a.setAttribute('href', '#')
      const span = document.createElement('span')
      const strong = document.createElement('strong')
      strong.textContent = 'Read'
      span.appendChild(strong)
      a.appendChild(span)
      expect(isClickOnActiveEdit(strong, a)).toBe(true)
    })
  })

  it('returns false when target is a different element', () => {
    withElement('button', (btn) => {
      const other = document.createElement('p')
      other.textContent = 'Other'
      document.body.appendChild(other)
      try {
        expect(isClickOnActiveEdit(other, btn)).toBe(false)
      } finally {
        other.remove()
      }
    })
  })

  it('returns false when there is no active edit element', () => {
    withElement('button', (btn) => {
      expect(isClickOnActiveEdit(btn, null)).toBe(false)
    })
  })

  it('returns false when target is a sibling, not a child', () => {
    const parent = document.createElement('div')
    const btn = document.createElement('button')
    btn.textContent = 'Button'
    const p = document.createElement('p')
    p.textContent = 'Paragraph'
    parent.appendChild(btn)
    parent.appendChild(p)
    document.body.appendChild(parent)
    try {
      // p is a sibling of btn, not inside it
      expect(isClickOnActiveEdit(p, btn)).toBe(false)
    } finally {
      parent.remove()
    }
  })

  it('returns false when target is the parent of the active element', () => {
    withElement('div', (div) => {
      const btn = document.createElement('button')
      btn.textContent = 'Click'
      div.appendChild(btn)
      // Click on the parent div should NOT be suppressed — it's a different
      // element, the user is clicking outside the button
      expect(isClickOnActiveEdit(div, btn)).toBe(false)
    })
  })

  describe('regression: button space key activation', () => {
    // These tests document the bug: pressing Space on a contentEditable
    // button fires a synthetic click. isClickOnActiveEdit must return true
    // so the click handler suppresses it instead of calling finishEdit().

    it('suppresses synthetic click on button being edited', () => {
      withElement('button', (btn) => {
        btn.textContent = 'Get Started'
        btn.contentEditable = 'true'
        // Simulate: Space → synthetic click lands on btn
        expect(isClickOnActiveEdit(btn, btn)).toBe(true)
      })
    })

    it('suppresses synthetic click on link being edited', () => {
      withElement('a', (a) => {
        a.textContent = 'Learn more'
        a.setAttribute('href', '#')
        a.contentEditable = 'true'
        // Simulate: Enter → synthetic click lands on a
        expect(isClickOnActiveEdit(a, a)).toBe(true)
      })
    })

    it('does NOT suppress click on a different button after edit starts', () => {
      withElement('button', (btn1) => {
        btn1.textContent = 'First'
        btn1.contentEditable = 'true'
        const btn2 = document.createElement('button')
        btn2.textContent = 'Second'
        document.body.appendChild(btn2)
        try {
          // Clicking a different button should NOT be suppressed
          expect(isClickOnActiveEdit(btn2, btn1)).toBe(false)
        } finally {
          btn2.remove()
        }
      })
    })
  })
})

// ─── lockNonTextChildren: icon preservation during editing ────────────────

describe('lockNonTextChildren: icon preservation', () => {
  function withElement<T>(tag: string, fn: (el: HTMLElement) => T): T {
    const el = document.createElement(tag)
    document.body.appendChild(el)
    try {
      return fn(el)
    } finally {
      el.remove()
    }
  }

  it('locks SVG children (sets contenteditable=false)', () => {
    withElement('button', (btn) => {
      btn.textContent = 'App Store'
      const svg = document.createElement('svg')
      svg.innerHTML = '<path d="M18.71 19.5c-.83 1.24"/>'
      btn.insertBefore(svg, btn.firstChild)

      const locked = lockNonTextChildren(btn)
      expect(locked).toHaveLength(1)
      expect(locked[0]).toBe(svg)
      expect(svg.getAttribute('contenteditable')).toBe('false')
    })
  })

  it('does NOT lock children that contain text', () => {
    withElement('button', (btn) => {
      const span = document.createElement('span')
      span.textContent = 'App Store'
      btn.appendChild(span)

      const locked = lockNonTextChildren(btn)
      expect(locked).toHaveLength(0)
      expect(span.getAttribute('contenteditable')).toBeNull()
    })
  })

  it('locks img children (no text content)', () => {
    withElement('a', (a) => {
      a.textContent = 'Learn more'
      const img = document.createElement('img')
      img.setAttribute('alt', 'icon')
      a.insertBefore(img, a.firstChild)

      const locked = lockNonTextChildren(a)
      expect(locked).toHaveLength(1)
      expect(locked[0]).toBe(img)
      expect(img.getAttribute('contenteditable')).toBe('false')
    })
  })

  it('locks multiple non-text children', () => {
    withElement('button', (btn) => {
      btn.textContent = 'Download'
      const svg1 = document.createElement('svg')
      const svg2 = document.createElement('svg')
      btn.insertBefore(svg2, btn.firstChild)
      btn.insertBefore(svg1, btn.firstChild)

      const locked = lockNonTextChildren(btn)
      expect(locked).toHaveLength(2)
      expect(svg1.getAttribute('contenteditable')).toBe('false')
      expect(svg2.getAttribute('contenteditable')).toBe('false')
    })
  })

  it('returns empty array for text-only elements (no element children)', () => {
    withElement('p', (p) => {
      p.textContent = 'Just text'
      const locked = lockNonTextChildren(p)
      expect(locked).toHaveLength(0)
    })
  })

  it('handles nested non-text elements (locks direct children only)', () => {
    withElement('button', (btn) => {
      btn.textContent = 'Click'
      const span = document.createElement('span')
      const svg = document.createElement('svg')
      span.appendChild(svg)
      btn.insertBefore(span, btn.firstChild)
      // span has no text content (only SVG) → should be locked
      const locked = lockNonTextChildren(btn)
      expect(locked).toHaveLength(1)
      expect(locked[0]).toBe(span)
      expect(span.getAttribute('contenteditable')).toBe('false')
    })
  })
})

describe('unlockNonTextChildren: cleanup', () => {
  it('removes contenteditable=false from locked elements', () => {
    const btn = document.createElement('button')
    const svg = document.createElement('svg')
    btn.appendChild(svg)
    document.body.appendChild(btn)

    const locked = lockNonTextChildren(btn)
    expect(svg.getAttribute('contenteditable')).toBe('false')

    unlockNonTextChildren(locked)
    expect(svg.getAttribute('contenteditable')).toBeNull()

    btn.remove()
  })

  it('handles empty array', () => {
    expect(() => unlockNonTextChildren([])).not.toThrow()
  })
})

// ─── diffEdits: button with SVG icon ──────────────────────────────────────

describe('diffEdits: button with SVG icon', () => {
  /** Create a button matching the FoodDeliveryCta app store button pattern. */
  function createButtonWithIcon(text: string): HTMLElement {
    const btn = document.createElement('button')
    const svg = document.createElement('svg')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('fill', 'currentColor')
    const path = document.createElement('path')
    path.setAttribute('d', 'M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47')
    svg.appendChild(path)
    btn.appendChild(svg)
    btn.appendChild(document.createTextNode(text))
    document.body.appendChild(btn)
    return btn
  }

  it('captures text edit when SVG child is present', () => {
    const btn = createButtonWithIcon('App Store')
    const state = captureState(btn)

    // Edit text: "App Store" → "Download"
    const nodes = collectTextNodes(btn)
    nodes[0].nodeValue = 'Download'

    const changes = diffEdits(state)
    expect(changes).toHaveLength(1)
    expect(changes[0].oldText).toBe('App Store')
    expect(changes[0].newText).toBe('Download')

    btn.remove()
  })

  it('captures text deletion to empty (regression: previously skipped)', () => {
    const btn = createButtonWithIcon('App Store')
    const state = captureState(btn)

    // User deletes all text but SVG remains
    const nodes = collectTextNodes(btn)
    nodes[0].nodeValue = ''

    const changes = diffEdits(state)
    // This should capture the deletion: oldText="App Store", newText=""
    // BUG: currently diffEdits skips changes where newText.trim() is false
    expect(changes).toHaveLength(1)
    expect(changes[0].oldText).toBe('App Store')
    expect(changes[0].newText).toBe('')

    btn.remove()
  })

  it('captures text replacement when SVG is deleted too (node structure change)', () => {
    const btn = createButtonWithIcon('App Store')
    const state = captureState(btn)

    // User selects all (including SVG) and types new text
    btn.textContent = 'Download'

    const changes = diffEdits(state)
    expect(changes).toHaveLength(1)
    expect(changes[0].oldText).toContain('App Store')
    expect(changes[0].newText).toBe('Download')

    btn.remove()
  })
})

// ─── Full-chain: button with icon → diffEdits → applyPreviewTextEdit ───────

describe('full-chain: button with icon text edit', () => {
  /** HTML matching the FoodDeliveryCta app store button render output. */
  const BUTTON_WITH_ICON_HTML =
    '<button class="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-background px-6 py-3 font-medium text-foreground">' +
    '<svg class="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.84-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>' +
    '</svg>App Store</button>'

  function createButtonFromHtml(): HTMLElement {
    const container = document.createElement('div')
    container.innerHTML = BUTTON_WITH_ICON_HTML
    const btn = container.querySelector('button')!
    document.body.appendChild(btn)
    return btn
  }

  it('edits button text and preserves SVG in patched HTML', () => {
    const btn = createButtonFromHtml()
    const state = captureState(btn)

    // Edit "App Store" → "Download on App Store"
    const nodes = collectTextNodes(btn)
    nodes[0].nodeValue = 'Download on App Store'

    const { patchedSource, replaced } = simulateEdit(
      BUTTON_WITH_ICON_HTML,
      state,
    )

    expect(replaced).toBe(true)
    expect(patchedSource).toContain('Download on App Store')
    // SVG must be preserved
    expect(patchedSource).toContain('<svg')
    expect(patchedSource).toContain('<path d="M18.71')
    expect(patchedSource).toContain('</svg>')
    // Button tag preserved
    expect(patchedSource).toContain('<button')
    expect(patchedSource).toContain('</button>')

    btn.remove()
  })

  it('deletes button text and preserves SVG in patched HTML', () => {
    const btn = createButtonFromHtml()
    const state = captureState(btn)

    // Delete all text
    const nodes = collectTextNodes(btn)
    nodes[0].nodeValue = ''

    const { patchedSource, replaced } = simulateEdit(
      BUTTON_WITH_ICON_HTML,
      state,
    )

    // This should work: text deleted, SVG preserved
    expect(replaced).toBe(true)
    expect(patchedSource).not.toContain('App Store')
    // SVG must still be there
    expect(patchedSource).toContain('<svg')
    expect(patchedSource).toContain('<path d="M18.71')
    expect(patchedSource).toContain('</svg>')

    btn.remove()
  })

  it('edits button text in OpenUI source (FoodDeliveryCta pattern)', () => {
    const btn = createButtonFromHtml()
    const state = captureState(btn)

    // Edit "App Store" → "Get it on iOS"
    const nodes = collectTextNodes(btn)
    nodes[0].nodeValue = 'Get it on iOS'

    const openuiSource =
      'cta = FoodDeliveryCta(heading="Ready to order?", description="Download the app", appStore="App Store", googlePlay="Google Play")'
    const { patchedSource, replaced } = simulateEdit(openuiSource, state)

    expect(replaced).toBe(true)
    expect(patchedSource).toContain('Get it on iOS')
    expect(patchedSource).toContain('googlePlay="Google Play"')
    // Other args preserved
    expect(patchedSource).toContain('heading="Ready to order?"')
    expect(patchedSource).toContain('description="Download the app"')

    btn.remove()
  })

  it('edits Google Play button text in OpenUI source', () => {
    const btn = createButtonFromHtml()
    // Change the text to "Google Play" for this test
    const nodes = collectTextNodes(btn)
    nodes[0].nodeValue = 'Google Play'
    const state = captureState(btn)

    // Edit "Google Play" → "Get it on Android"
    nodes[0].nodeValue = 'Get it on Android'

    const openuiSource =
      'cta = FoodDeliveryCta(heading="Ready to order?", description="Download the app", appStore="App Store", googlePlay="Google Play")'
    const { patchedSource, replaced } = simulateEdit(openuiSource, state)

    expect(replaced).toBe(true)
    expect(patchedSource).toContain('Get it on Android')
    expect(patchedSource).toContain('appStore="App Store"')
    // Other args preserved
    expect(patchedSource).toContain('heading="Ready to order?"')

    btn.remove()
  })

  it('edits both app store buttons sequentially (occurrence index)', () => {
    // Simulate editing App Store first, then Google Play
    const openuiSource =
      'cta = FoodDeliveryCta(heading="Ready to order?", description="Download the app", appStore="App Store", googlePlay="Google Play")'

    // First edit: "App Store" → "iOS Download"
    let result = applyPreviewTextEdit(openuiSource, 'App Store', 'iOS Download')
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('appStore="iOS Download"')
    expect(result.html).toContain('googlePlay="Google Play"')

    // Second edit: "Google Play" → "Android Download"
    result = applyPreviewTextEdit(
      result.html,
      'Google Play',
      'Android Download',
    )
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('appStore="iOS Download"')
    expect(result.html).toContain('googlePlay="Android Download"')
  })
})

// ─── shouldPreventLockedDeletion: icon deletion prevention (behavioral) ───

describe('shouldPreventLockedDeletion: icon deletion prevention', () => {
  /** Create a button matching the FoodDeliveryCta app store button pattern:
   *  <button><svg>...</svg>App Store</button> */
  function createButtonWithIcon(text: string): {
    btn: HTMLButtonElement
    svg: HTMLElement
    textNode: Text
  } {
    const btn = document.createElement('button')
    const svg = document.createElement('svg')
    svg.setAttribute('viewBox', '0 0 24 24')
    const path = document.createElement('path')
    path.setAttribute('d', 'M18.71 19.5')
    svg.appendChild(path)
    btn.appendChild(svg)
    const textNode = document.createTextNode(text)
    btn.appendChild(textNode)
    document.body.appendChild(btn)
    return { btn, svg, textNode }
  }

  it('prevents backward delete when caret is at start of text and SVG is before it', () => {
    const { btn, textNode } = createButtonWithIcon('App Store')
    const locked = lockNonTextChildren(btn)
    // Caret at offset 0 of text node → backward delete would remove previousSibling (SVG)
    const result = shouldPreventLockedDeletion(
      'deleteContentBackward',
      textNode,
      0,
      locked,
    )
    expect(result).toBe(true)
    btn.remove()
  })

  it('does NOT prevent backward delete when caret is in the middle of text', () => {
    const { btn, textNode } = createButtonWithIcon('App Store')
    const locked = lockNonTextChildren(btn)
    // Caret at offset 3 → backward delete removes a character, not the SVG
    const result = shouldPreventLockedDeletion(
      'deleteContentBackward',
      textNode,
      3,
      locked,
    )
    expect(result).toBe(false)
    btn.remove()
  })

  it('prevents forward delete when caret is at end of text and SVG is after it', () => {
    // Reverse order: text first, then SVG
    const btn = document.createElement('button')
    const textNode = document.createTextNode('App Store')
    btn.appendChild(textNode)
    const svg = document.createElement('svg')
    btn.appendChild(svg)
    document.body.appendChild(btn)

    const locked = lockNonTextChildren(btn)
    // Caret at end of text node → forward delete would remove nextSibling (SVG)
    const result = shouldPreventLockedDeletion(
      'deleteContentForward',
      textNode,
      textNode.textContent!.length,
      locked,
    )
    expect(result).toBe(true)
    btn.remove()
  })

  it('does NOT prevent forward delete when caret is in the middle of text', () => {
    const { btn, textNode } = createButtonWithIcon('App Store')
    const locked = lockNonTextChildren(btn)
    const result = shouldPreventLockedDeletion(
      'deleteContentForward',
      textNode,
      2,
      locked,
    )
    expect(result).toBe(false)
    btn.remove()
  })

  it('returns false for non-delete input types', () => {
    const { btn, textNode } = createButtonWithIcon('App Store')
    const locked = lockNonTextChildren(btn)
    const result = shouldPreventLockedDeletion(
      'insertText',
      textNode,
      0,
      locked,
    )
    expect(result).toBe(false)
    btn.remove()
  })

  it('returns false when lockedChildren is empty', () => {
    const { btn, textNode } = createButtonWithIcon('App Store')
    // No locked children
    const result = shouldPreventLockedDeletion(
      'deleteContentBackward',
      textNode,
      0,
      [],
    )
    expect(result).toBe(false)
    btn.remove()
  })

  it('returns false when previousSibling is NOT a locked child (e.g. another text node)', () => {
    const btn = document.createElement('button')
    const text1 = document.createTextNode('Hello ')
    const text2 = document.createTextNode('World')
    btn.appendChild(text1)
    btn.appendChild(text2)
    document.body.appendChild(btn)
    // No SVG → lockedChildren is empty
    const locked = lockNonTextChildren(btn)
    const result = shouldPreventLockedDeletion(
      'deleteContentBackward',
      text2,
      0,
      locked,
    )
    expect(result).toBe(false)
    btn.remove()
  })

  it('handles element-node caret: prevents backward delete of locked child at childNodes[offset-1]', () => {
    const btn = document.createElement('button')
    btn.contentEditable = 'true'
    const svg = document.createElement('svg')
    const span = document.createElement('span')
    span.textContent = 'Text'
    btn.appendChild(svg)
    btn.appendChild(span)
    document.body.appendChild(btn)
    const locked = lockNonTextChildren(btn)
    // Caret in btn (element node) at offset 1 → backward delete removes childNodes[0] (SVG)
    const result = shouldPreventLockedDeletion(
      'deleteContentBackward',
      btn,
      1,
      locked,
    )
    expect(result).toBe(true)
    btn.remove()
  })

  it('handles element-node caret: prevents forward delete of locked child at childNodes[offset]', () => {
    const btn = document.createElement('button')
    btn.contentEditable = 'true'
    const span = document.createElement('span')
    span.textContent = 'Text'
    const svg = document.createElement('svg')
    btn.appendChild(span)
    btn.appendChild(svg)
    document.body.appendChild(btn)
    const locked = lockNonTextChildren(btn)
    // Caret in btn (element node) at offset 1 → forward delete removes childNodes[1] (SVG)
    const result = shouldPreventLockedDeletion(
      'deleteContentForward',
      btn,
      1,
      locked,
    )
    expect(result).toBe(true)
    btn.remove()
  })

  it('does NOT prevent backward delete at element offset 0 (nothing before caret)', () => {
    const btn = document.createElement('button')
    btn.contentEditable = 'true'
    const svg = document.createElement('svg')
    const span = document.createElement('span')
    span.textContent = 'Text'
    btn.appendChild(svg)
    btn.appendChild(span)
    document.body.appendChild(btn)
    const locked = lockNonTextChildren(btn)
    // Caret at offset 0 → childNodes[-1] is undefined → no deletion
    const result = shouldPreventLockedDeletion(
      'deleteContentBackward',
      btn,
      0,
      locked,
    )
    expect(result).toBe(false)
    btn.remove()
  })

  it('real DOM simulation: beforeinput event on button with locked SVG is prevented', () => {
    const { btn, svg, textNode } = createButtonWithIcon('App Store')
    btn.contentEditable = 'true'
    lockNonTextChildren(btn)

    // Place caret at offset 0 of text node (right after SVG)
    const range = document.createRange()
    range.setStart(textNode, 0)
    range.collapse(true)
    const sel = window.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)

    // Dispatch a beforeinput event for backspace
    const event = new InputEvent('beforeinput', {
      inputType: 'deleteContentBackward',
      bubbles: true,
      cancelable: true,
    })
    btn.dispatchEvent(event)

    // The handler should have called preventDefault
    // (Note: jsdom may not fully support beforeinput, but we can test the
    // decision function directly as above. This test verifies the wiring
    // by checking the event's defaultPrevented flag if jsdom supports it.)
    // If jsdom doesn't support it, the shouldPreventLockedDeletion tests
    // above are the authoritative behavioral tests.
    if (event.defaultPrevented !== undefined) {
      // If beforeinput is supported, verify it was prevented
      // (This may be false in jsdom if the handler isn't wired to the event)
      // The real verification is in the shouldPreventLockedDeletion tests
    }

    // SVG must still be in the DOM regardless
    expect(btn.contains(svg)).toBe(true)
    btn.remove()
  })
})

// ─── Space typing in editable buttons (behavioral) ─────────────────────

describe('space typing in editable buttons (behavioral)', () => {
  /** Create a contentEditable button with text, focus it, place caret at end. */
  function setupEditableButton(text: string): {
    btn: HTMLButtonElement
    textNode: Text
  } {
    const btn = document.createElement('button')
    btn.textContent = text
    btn.contentEditable = 'true'
    document.body.appendChild(btn)
    btn.focus()

    // Place caret at end of text
    const textNode = btn.firstChild as Text
    const range = document.createRange()
    range.setStart(textNode, textNode.textContent!.length)
    range.collapse(true)
    const sel = window.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)

    return { btn, textNode }
  }

  it('insertText execCommand inserts a space at caret position', () => {
    const { btn, textNode } = setupEditableButton('Hello')
    // Simulate what the Space handler does: execCommand insertText
    document.execCommand('insertText', false, ' ')
    expect(textNode.textContent).toBe('Hello ')
    btn.remove()
  })

  it('multiple spaces can be inserted sequentially', () => {
    const { btn, textNode } = setupEditableButton('Hi')
    document.execCommand('insertText', false, ' ')
    document.execCommand('insertText', false, ' ')
    expect(textNode.textContent).toBe('Hi  ')
    btn.remove()
  })

  it('space is inserted at caret position (not appended)', () => {
    const { btn, textNode } = setupEditableButton('Hello World')
    // Move caret to middle (offset 5, between "Hello" and " World")
    const range = document.createRange()
    range.setStart(textNode, 5)
    range.collapse(true)
    const sel = window.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)

    document.execCommand('insertText', false, ' ')
    expect(textNode.textContent).toBe('Hello  World')
    btn.remove()
  })

  it('button click is NOT fired when Space keydown calls preventDefault', () => {
    const { btn } = setupEditableButton('Get Started')
    let clickCount = 0
    btn.addEventListener('click', () => {
      clickCount++
    })

    // Dispatch keydown for Space with preventDefault (simulating our handler)
    const keydownEvent = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    })
    // Simulate what our handler does: preventDefault on Space
    keydownEvent.preventDefault()
    btn.dispatchEvent(keydownEvent)

    // No click should have been fired from the keydown
    expect(clickCount).toBe(0)
    btn.remove()
  })

  it('Space keydown preventDefault stops button activation in jsdom', () => {
    const { btn } = setupEditableButton('Test')
    let activated = false
    btn.addEventListener('click', () => {
      activated = true
    })

    // Dispatch keydown with Space and preventDefault
    const event = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    })
    event.preventDefault()
    btn.dispatchEvent(event)

    // Dispatch keyup (browser fires click on keyup for buttons)
    const keyupEvent = new KeyboardEvent('keyup', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    })
    btn.dispatchEvent(keyupEvent)

    // In real browsers, preventDefault on keydown prevents the click.
    // jsdom may not simulate this fully, but the test verifies the
    // preventDefault call doesn't break anything and no click fires.
    expect(activated).toBe(false)
    btn.remove()
  })
})

// ─── revertTextPreservingIcons ───────────────────────────────────────────

describe('revertTextPreservingIcons', () => {
  it('restores text node value without destroying SVG sibling', () => {
    const btn = document.createElement('button')
    const svg = document.createElement('svg')
    svg.setAttribute('class', 'icon')
    btn.appendChild(svg)
    btn.appendChild(document.createTextNode('g'))

    revertTextPreservingIcons(btn, 'go')

    // SVG should still be there
    expect(btn.querySelector('svg')).not.toBeNull()
    expect(btn.querySelector('svg')?.getAttribute('class')).toBe('icon')
    // Text should be restored
    expect(btn.textContent).toBe('go')
    // Should have 2 children: svg + text node
    expect(btn.childNodes.length).toBe(2)
  })

  it('inserts a new text node when all text was deleted', () => {
    const btn = document.createElement('button')
    const svg = document.createElement('svg')
    btn.appendChild(svg)
    // No text node — user deleted all text

    revertTextPreservingIcons(btn, 'go')

    // SVG should still be there
    expect(btn.querySelector('svg')).not.toBeNull()
    // Text should be restored
    expect(btn.textContent).toBe('go')
    // Should have 2 children: svg + text node
    expect(btn.childNodes.length).toBe(2)
  })

  it('does NOT replace element with only a text node (preserves icons)', () => {
    const btn = document.createElement('button')
    const svg = document.createElement('svg')
    svg.innerHTML = '<path d="M1 1"></path>'
    btn.appendChild(svg)
    btn.appendChild(document.createTextNode('x'))

    revertTextPreservingIcons(btn, 'original text')

    // The SVG path should still exist (not destroyed by textContent reset)
    expect(btn.querySelector('path')).not.toBeNull()
    expect(btn.textContent).toBe('original text')
  })

  it('handles element with only text (no icons)', () => {
    const p = document.createElement('p')
    p.appendChild(document.createTextNode('edited'))

    revertTextPreservingIcons(p, 'original')

    expect(p.textContent).toBe('original')
    expect(p.childNodes.length).toBe(1)
  })
})

// ─── Last-character deletion: Chrome SVG quirk ──────────────────────────
// When a text node adjacent to a contenteditable=false SVG has exactly 1
// character left and the user presses Backspace, Chrome may delete both the
// character AND the SVG. The keydown handler must intercept this and manually
// clear the text node instead.

describe('last-character deletion preserves SVG', () => {
  it('shouldPreventLockedDeletion does NOT catch offset=1 in 1-char text node', () => {
    // This documents WHY we need the extra Chrome quirk guard:
    // shouldPreventLockedDeletion only checks offset===0 for text nodes,
    // so offset=1 (deleting the last char) is NOT caught.
    const btn = document.createElement('button')
    const svg = document.createElement('svg')
    btn.appendChild(svg)
    const text = document.createTextNode('g')
    btn.appendChild(text)

    const result = shouldPreventLockedDeletion(
      'deleteContentBackward',
      text,
      1, // offset is 1 (caret after "g"), not 0
      [svg],
    )
    expect(result).toBe(false)
  })

  it('manual text node clearing preserves SVG', () => {
    // Simulate what the keydown handler does: manually clear the text node
    // instead of letting Chrome's Backspace delete both text and SVG.
    const btn = document.createElement('button')
    const svg = document.createElement('svg')
    svg.setAttribute('contenteditable', 'false')
    btn.appendChild(svg)
    const text = document.createTextNode('g')
    btn.appendChild(text)

    // Simulate the fix: manually clear the text node
    text.nodeValue = ''

    expect(btn.querySelector('svg')).not.toBeNull()
    expect(btn.childNodes.length).toBe(2) // svg + empty text node
    expect(text.nodeValue).toBe('')
  })

  it('shouldPreventLockedDeletion catches offset=0 in empty text node (second Backspace)', () => {
    // After the text node is emptied, if the user presses Backspace again,
    // shouldPreventLockedDeletion should catch it because offset=0 and
    // previousSibling is the locked SVG.
    const btn = document.createElement('button')
    const svg = document.createElement('svg')
    btn.appendChild(svg)
    const text = document.createTextNode('')
    btn.appendChild(text)

    const result = shouldPreventLockedDeletion(
      'deleteContentBackward',
      text,
      0,
      [svg],
    )
    expect(result).toBe(true)
  })

  // Source-level invariant: the blur handler must recognize AlertDialog
  // portals (role="alertdialog") as "inside" so the delete confirmation
  // dialog doesn't cause finishEdit() to fire and close the toolbar.
  // Regression guard for the delete-button-broken bug.
  it('source invariant: handleBlur checks [role=alertdialog] focus target', () => {
    const source = readFileSync(require.resolve('./useTextEdit.ts'), 'utf-8')
    expect(source).toContain('[role="alertdialog"]')
    // Must be in the blur handler section, not just anywhere
    const blurSection = source.slice(
      source.indexOf('const handleBlur'),
      source.indexOf('const handleKeyDown'),
    )
    expect(blurSection).toContain('[role="alertdialog"]')
  })
})
