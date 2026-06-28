import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'

// Set up jsdom globals BEFORE importing useTextEdit, which uses
// document.createTreeWalker at module level via collectTextNodes.
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
globalThis.document = dom.window.document as unknown as Document
globalThis.window = dom.window as unknown as Window & typeof globalThis
globalThis.NodeFilter = dom.window.NodeFilter

import { diffEdits, collectTextNodes, type TextEditState } from './useTextEdit'
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
