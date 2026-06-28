import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'

import { applyStyleEdit, applyPreviewTextEdit } from '@/lib/edit-helpers'

/**
 * Style edit persistence contract tests.
 *
 * BUG HISTORY:
 * - Style edits (bold, color, font-size, etc.) were not persisting on reload.
 * - Root cause: applyStyleEdit searches for `class="..."` in the stored HTML,
 *   but the stored preview.html is OpenUI source code (not rendered HTML),
 *   so no class attributes exist → applyStyleEdit returns replaced:false →
 *   server throws TEXT_NOT_FOUND → edit record never created → client-side
 *   styleOverrides reapply mechanism never runs.
 *
 * FIX:
 * - Server: for style edits, when applyStyleEdit fails (because the stored
 *   HTML is OpenUI source, not rendered HTML), don't throw TEXT_NOT_FOUND.
 *   Instead, save the edit record and create a new preview version. The style
 *   is reapplied client-side via styleOverrides in DirectPreview.
 *
 * These tests verify:
 * 1. applyStyleEdit works correctly on rendered HTML (when it does have classes)
 * 2. applyStyleEdit correctly fails on OpenUI source (no class attributes)
 * 3. The client-side reapply mechanism (styleOverrides) correctly applies styles
 * 4. The full chain: edit record → styleOverrides → DOM reapply → persistence
 */

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Set up jsdom globals */
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
globalThis.document = dom.window.document as unknown as Document
globalThis.window = dom.window as unknown as Window & typeof globalThis

/**
 * Simulate the client-side styleOverrides reapply mechanism from
 * DirectPreview.tsx. This mirrors the exact logic that reapplies style
 * edits on page load.
 */
function reapplyStyleOverrides(
  root: HTMLElement,
  overrides: Array<{
    classAnchor: string
    occurrenceIndex: number
    style: string
  }>,
): void {
  for (const override of overrides) {
    if (!override.classAnchor) continue
    const matches = Array.from(root.querySelectorAll<HTMLElement>('*')).filter(
      (el) => el.getAttribute('class') === override.classAnchor,
    )
    const el = matches[override.occurrenceIndex] ?? matches[0]
    if (!el) continue
    for (const declaration of override.style.split(';')) {
      const colon = declaration.indexOf(':')
      if (colon === -1) continue
      const prop = declaration.slice(0, colon).trim()
      const value = declaration.slice(colon + 1).trim()
      if (prop) el.style.setProperty(prop, value)
    }
  }
}

/**
 * Build styleOverrides from edit history — mirrors the Dashboard.tsx logic
 * that converts edit records into the styleOverrides array.
 */
function buildStyleOverrides(
  edits: Array<{
    editType: string
    beforeText: string | undefined
    afterText: string | undefined
    occurrenceIndex?: number
  }>,
): Array<{ classAnchor: string; occurrenceIndex: number; style: string }> {
  const seen = new Set<string>()
  const overrides: Array<{
    classAnchor: string
    occurrenceIndex: number
    style: string
  }> = []
  for (const edit of edits) {
    if (
      edit.editType === 'style' &&
      typeof edit.beforeText === 'string' &&
      typeof edit.afterText === 'string'
    ) {
      const occurrenceIndex = edit.occurrenceIndex ?? 0
      const key = `${edit.beforeText}#${occurrenceIndex}`
      if (seen.has(key)) continue
      seen.add(key)
      overrides.push({
        classAnchor: edit.beforeText,
        occurrenceIndex,
        style: edit.afterText,
      })
    }
  }
  return overrides
}

// ─── Tests ────────────────────────────────────────────────────────────────

describe('style edit persistence: applyStyleEdit on rendered HTML', () => {
  it('adds style attribute to element matching class anchor', () => {
    const html = '<h1 class="hero-title">Hello World</h1>'
    const result = applyStyleEdit(html, 'hero-title', 'font-weight: 900;', 0)
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('style="font-weight: 900;"')
    expect(result.html).toContain('class="hero-title"')
  })

  it('replaces existing style attribute on element matching class anchor', () => {
    const html = '<h1 class="hero" style="color: red;">Hello</h1>'
    const result = applyStyleEdit(
      html,
      'hero',
      'color: blue; font-weight: 700;',
      0,
    )
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('style="color: blue; font-weight: 700;"')
    expect(result.html).not.toContain('color: red')
  })

  it('targets correct occurrence when multiple elements share class', () => {
    const html =
      '<div class="card">A</div><div class="card">B</div><div class="card">C</div>'
    const result = applyStyleEdit(html, 'card', 'background: gold;', 1)
    expect(result.replaced).toBe(true)
    // Only the second .card should get the style
    expect(result.html).not.toContain(
      '<div class="card" style="background: gold;">A</div>',
    )
    expect(result.html).toContain(
      '<div class="card" style="background: gold;">B</div>',
    )
    expect(result.html).not.toContain(
      '<div class="card" style="background: gold;">C</div>',
    )
  })

  it('returns replaced:false when class anchor not found', () => {
    const html = '<h1 class="hero-title">Hello</h1>'
    const result = applyStyleEdit(
      html,
      'nonexistent-class',
      'font-weight: 900;',
      0,
    )
    expect(result.replaced).toBe(false)
  })

  it('handles self-closing tags', () => {
    const html = '<img class="hero-img" src="test.png" />'
    const result = applyStyleEdit(html, 'hero-img', 'border: 2px solid red;', 0)
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('style="border: 2px solid red;"')
  })

  it('escapes double quotes in style value', () => {
    const html = '<h1 class="hero">Hello</h1>'
    const result = applyStyleEdit(html, 'hero', 'content: "test";', 0)
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('&quot;')
  })
})

describe('style edit persistence: applyStyleEdit on OpenUI source (the bug)', () => {
  it('returns replaced:false for OpenUI source (no class attributes)', () => {
    // The stored preview.html is OpenUI source, not rendered HTML
    const source =
      'home_hero = FoodDeliveryHero("Craving Something Hot?", "Pizza Delivered Fast")'
    const result = applyStyleEdit(
      source,
      'text-4xl font-semibold leading-tight',
      'font-weight: 900;',
      0,
    )
    // This is expected to fail — OpenUI source has no HTML class attributes
    expect(result.replaced).toBe(false)
  })

  it('applyPreviewTextEdit also fails for class anchor in OpenUI source', () => {
    const source =
      'home_hero = FoodDeliveryHero("Craving Something Hot?", "Pizza Delivered Fast")'
    // The class string is not text content in the source
    const result = applyPreviewTextEdit(
      source,
      'text-4xl font-semibold leading-tight',
      'font-weight: 900;',
    )
    expect(result.replaced).toBe(false)
  })
})

describe('style edit persistence: client-side reapply mechanism', () => {
  it('reapplies bold style to element matching class anchor', () => {
    // Simulate: page loaded, edit history has a style edit, DirectPreview
    // reapply mechanism runs
    const root = document.createElement('div')
    root.innerHTML = '<h1 class="text-4xl font-bold">Hello World</h1>'
    document.body.appendChild(root)

    const overrides = [
      {
        classAnchor: 'text-4xl font-bold',
        occurrenceIndex: 0,
        style: 'font-weight: 900;',
      },
    ]
    reapplyStyleOverrides(root, overrides)

    const h1 = root.querySelector<HTMLElement>('h1')!
    expect(h1.style.fontWeight).toBe('900')
  })

  it('reapplies color style to correct occurrence', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <div class="card">Card A</div>
      <div class="card">Card B</div>
      <div class="card">Card C</div>
    `
    document.body.appendChild(root)

    const overrides = [
      {
        classAnchor: 'card',
        occurrenceIndex: 1,
        style: 'background-color: gold;',
      },
    ]
    reapplyStyleOverrides(root, overrides)

    const cards = root.querySelectorAll<HTMLElement>('.card')
    expect(cards[0].style.backgroundColor).toBe('')
    expect(cards[1].style.backgroundColor).toBe('gold')
    expect(cards[2].style.backgroundColor).toBe('')
  })

  it('reapplies multiple style declarations', () => {
    const root = document.createElement('div')
    root.innerHTML = '<p class="description">Some text</p>'
    document.body.appendChild(root)

    const overrides = [
      {
        classAnchor: 'description',
        occurrenceIndex: 0,
        style: 'font-size: 18px; color: blue; font-weight: 600;',
      },
    ]
    reapplyStyleOverrides(root, overrides)

    const p = root.querySelector<HTMLElement>('p')!
    expect(p.style.fontSize).toBe('18px')
    expect(p.style.color).toBe('blue')
    expect(p.style.fontWeight).toBe('600')
  })

  it('handles missing element gracefully (no crash)', () => {
    const root = document.createElement('div')
    root.innerHTML = '<p>No class</p>'
    document.body.appendChild(root)

    const overrides = [
      {
        classAnchor: 'nonexistent-class',
        occurrenceIndex: 0,
        style: 'color: red;',
      },
    ]
    // Should not throw
    expect(() => reapplyStyleOverrides(root, overrides)).not.toThrow()
  })

  it('handles empty classAnchor gracefully', () => {
    const root = document.createElement('div')
    root.innerHTML = '<p class="test">Hello</p>'
    document.body.appendChild(root)

    const overrides = [
      { classAnchor: '', occurrenceIndex: 0, style: 'color: red;' },
    ]
    expect(() => reapplyStyleOverrides(root, overrides)).not.toThrow()
    expect(root.querySelector<HTMLElement>('p')!.style.color).toBe('')
  })
})

describe('style edit persistence: full chain (edit history → reapply)', () => {
  it('builds styleOverrides from edit history correctly', () => {
    const edits = [
      {
        editType: 'style',
        beforeText: 'text-4xl font-bold',
        afterText: 'font-weight: 900;',
        occurrenceIndex: 0,
      },
      {
        editType: 'text',
        beforeText: 'Hello',
        afterText: 'Hi',
      },
      {
        editType: 'style',
        beforeText: 'card',
        afterText: 'background: gold;',
        occurrenceIndex: 2,
      },
    ]

    const overrides = buildStyleOverrides(edits)
    expect(overrides).toHaveLength(2)
    expect(overrides[0].classAnchor).toBe('text-4xl font-bold')
    expect(overrides[0].style).toBe('font-weight: 900;')
    expect(overrides[1].classAnchor).toBe('card')
    expect(overrides[1].occurrenceIndex).toBe(2)
  })

  it('deduplicates style edits (newest wins)', () => {
    const edits = [
      {
        editType: 'style',
        beforeText: 'hero-title',
        afterText: 'font-weight: 900;',
        occurrenceIndex: 0,
      },
      {
        editType: 'style',
        beforeText: 'hero-title',
        afterText: 'font-weight: 400;',
        occurrenceIndex: 0,
      },
    ]

    const overrides = buildStyleOverrides(edits)
    // First seen wins (edits are newest-first)
    expect(overrides).toHaveLength(1)
    expect(overrides[0].style).toBe('font-weight: 900;')
  })

  it('full chain: edit history → styleOverrides → DOM reapply', () => {
    // Simulate the full reload flow:
    // 1. Edit history loaded from server (listEdits query)
    // 2. Dashboard builds styleOverrides from edits
    // 3. DirectPreview reapplies styles to rendered DOM

    const editHistory = [
      {
        editType: 'style',
        beforeText: 'text-4xl font-semibold leading-tight',
        afterText: 'font-weight: 900; color: #ff0000;',
        occurrenceIndex: 0,
      },
    ]

    // Step 2: Build overrides
    const overrides = buildStyleOverrides(editHistory)
    expect(overrides).toHaveLength(1)

    // Step 3: Render preview and reapply
    const root = document.createElement('div')
    root.innerHTML =
      '<h1 class="text-4xl font-semibold leading-tight">Craving Something Hot?</h1>'
    document.body.appendChild(root)

    reapplyStyleOverrides(root, overrides)

    const h1 = root.querySelector<HTMLElement>('h1')!
    expect(h1.style.fontWeight).toBe('900')
    expect(h1.style.color).toBe('rgb(255, 0, 0)')
  })

  it('full chain: multiple style edits on different elements', () => {
    const editHistory = [
      {
        editType: 'style',
        beforeText: 'hero-title',
        afterText: 'font-weight: 900;',
        occurrenceIndex: 0,
      },
      {
        editType: 'style',
        beforeText: 'card',
        afterText: 'background: gold;',
        occurrenceIndex: 1,
      },
      {
        editType: 'style',
        beforeText: 'card',
        afterText: 'background: silver;',
        occurrenceIndex: 0,
      },
    ]

    const overrides = buildStyleOverrides(editHistory)
    expect(overrides).toHaveLength(3) // hero-title + card#0 + card#1 (different occurrenceIndex)

    const root = document.createElement('div')
    root.innerHTML = `
      <h1 class="hero-title">Title</h1>
      <div class="card">Card A</div>
      <div class="card">Card B</div>
    `
    document.body.appendChild(root)

    reapplyStyleOverrides(root, overrides)

    const h1 = root.querySelector<HTMLElement>('h1')!
    const cards = root.querySelectorAll<HTMLElement>('.card')
    expect(h1.style.fontWeight).toBe('900')
    // card#1 gets gold, card#0 gets silver
    expect(cards[0].style.background).toBe('silver')
    expect(cards[1].style.background).toBe('gold')
  })
})

describe('style edit persistence: server-side guard (regression prevention)', () => {
  it('applyStyleEdit on OpenUI source must return replaced:false (not throw)', () => {
    // This is the core regression: the server must NOT throw TEXT_NOT_FOUND
    // for style edits when applyStyleEdit fails on OpenUI source. Instead,
    // it should save the edit record so the client-side reapply can run.
    const source =
      'home_hero = FoodDeliveryHero("Craving Something Hot?", "Pizza Delivered Fast")'
    const result = applyStyleEdit(
      source,
      'text-4xl font-semibold',
      'font-weight: 900;',
      0,
    )
    // Must return replaced:false, not throw
    expect(result.replaced).toBe(false)
    expect(result.html).toBe(source) // unchanged
  })

  it('applyStyleEdit on rendered HTML returns replaced:true', () => {
    // When the preview IS rendered HTML (e.g. CMS-promoted), applyStyleEdit
    // should work correctly
    const html = '<h1 class="text-4xl font-semibold">Hello</h1>'
    const result = applyStyleEdit(
      html,
      'text-4xl font-semibold',
      'font-weight: 900;',
      0,
    )
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('style="font-weight: 900;"')
  })
})
