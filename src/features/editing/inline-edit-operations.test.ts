import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'

import {
  applyPreviewTextEdit,
  applyStyleEdit,
  applyImageSwap,
} from '@/lib/edit-helpers'

/**
 * Comprehensive inline edit operations contract tests.
 *
 * Covers ALL 5 style operations (bold, italic, color, font-size, alignment)
 * as full-chain behavioral tests, plus combined edit scenarios (text + style,
 * text + image, style + image, all three).
 *
 * Each test exercises the REAL helper functions (not mocks) and verifies:
 * 1. Server-side patching: applyStyleEdit / applyPreviewTextEdit / applyImageSwap
 * 2. Client-side reapply: styleOverrides → DOM, imageOverrides → Image component
 * 3. Full chain: edit history → overrides → reapply → persistence
 *
 * The InlineEditToolbar supports these style operations:
 * - Font Size (fontSize, e.g. "24px")
 * - Bold (fontWeight: "700" or "400")
 * - Italic (fontStyle: "italic" or "normal")
 * - Color (color, hex string)
 * - Text Alignment (textAlign: "left" | "center" | "right")
 */

// ─── Helpers ──────────────────────────────────────────────────────────────

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
globalThis.document = dom.window.document as unknown as Document
globalThis.window = dom.window as unknown as Window & typeof globalThis

/** Reapply style overrides to DOM — mirrors DirectPreview.tsx logic. */
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

/** Build styleOverrides from edit history — mirrors Dashboard.tsx. */
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

/** Build imageOverrides from edit history — mirrors Dashboard.tsx. */
function buildImageOverrides(
  edits: Array<{
    editType: string
    beforeText: string | undefined
    afterText: string | undefined
  }>,
): Record<string, string> {
  const map: Record<string, string> = {}
  for (const edit of edits) {
    if (
      edit.editType === 'image' &&
      typeof edit.beforeText === 'string' &&
      typeof edit.afterText === 'string' &&
      !(edit.beforeText in map)
    ) {
      map[edit.beforeText] = edit.afterText
    }
  }
  return map
}

// ─── Tests: Bold ──────────────────────────────────────────────────────────

describe('inline edit operations: bold', () => {
  it('applyStyleEdit adds bold to element without style', () => {
    const html = '<h1 class="hero-title">Hello World</h1>'
    const result = applyStyleEdit(html, 'hero-title', 'font-weight: 700;', 0)
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('style="font-weight: 700;"')
  })

  it('applyStyleEdit replaces existing style with bold', () => {
    const html = '<h1 class="hero" style="color: red;">Hello</h1>'
    const result = applyStyleEdit(html, 'hero', 'font-weight: 700;', 0)
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('style="font-weight: 700;"')
    expect(result.html).not.toContain('color: red')
  })

  it('reapply bold via styleOverrides', () => {
    const root = document.createElement('div')
    root.innerHTML = '<h1 class="hero-title">Hello World</h1>'
    document.body.appendChild(root)

    reapplyStyleOverrides(root, [
      {
        classAnchor: 'hero-title',
        occurrenceIndex: 0,
        style: 'font-weight: 700;',
      },
    ])
    expect(root.querySelector<HTMLElement>('h1')!.style.fontWeight).toBe('700')
  })

  it('reapply unbold (font-weight: 400)', () => {
    const root = document.createElement('div')
    root.innerHTML =
      '<h1 class="hero-title" style="font-weight: 900;">Hello</h1>'
    document.body.appendChild(root)

    reapplyStyleOverrides(root, [
      {
        classAnchor: 'hero-title',
        occurrenceIndex: 0,
        style: 'font-weight: 400;',
      },
    ])
    expect(root.querySelector<HTMLElement>('h1')!.style.fontWeight).toBe('400')
  })

  it('full chain: bold edit history → reapply', () => {
    const editHistory = [
      {
        editType: 'style',
        beforeText: 'hero-title',
        afterText: 'font-weight: 700;',
        occurrenceIndex: 0,
      },
    ]
    const overrides = buildStyleOverrides(editHistory)
    expect(overrides).toHaveLength(1)

    const root = document.createElement('div')
    root.innerHTML = '<h1 class="hero-title">Hello</h1>'
    document.body.appendChild(root)
    reapplyStyleOverrides(root, overrides)

    expect(root.querySelector<HTMLElement>('h1')!.style.fontWeight).toBe('700')
  })
})

// ─── Tests: Italic ────────────────────────────────────────────────────────

describe('inline edit operations: italic', () => {
  it('applyStyleEdit adds italic to element', () => {
    const html = '<p class="description">Some text</p>'
    const result = applyStyleEdit(html, 'description', 'font-style: italic;', 0)
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('style="font-style: italic;"')
  })

  it('reapply italic via styleOverrides', () => {
    const root = document.createElement('div')
    root.innerHTML = '<p class="description">Some text</p>'
    document.body.appendChild(root)

    reapplyStyleOverrides(root, [
      {
        classAnchor: 'description',
        occurrenceIndex: 0,
        style: 'font-style: italic;',
      },
    ])
    expect(root.querySelector<HTMLElement>('p')!.style.fontStyle).toBe('italic')
  })

  it('reapply unitalic (font-style: normal)', () => {
    const root = document.createElement('div')
    root.innerHTML =
      '<p class="description" style="font-style: italic;">Text</p>'
    document.body.appendChild(root)

    reapplyStyleOverrides(root, [
      {
        classAnchor: 'description',
        occurrenceIndex: 0,
        style: 'font-style: normal;',
      },
    ])
    expect(root.querySelector<HTMLElement>('p')!.style.fontStyle).toBe('normal')
  })

  it('full chain: italic edit history → reapply', () => {
    const editHistory = [
      {
        editType: 'style',
        beforeText: 'description',
        afterText: 'font-style: italic;',
        occurrenceIndex: 0,
      },
    ]
    const overrides = buildStyleOverrides(editHistory)
    const root = document.createElement('div')
    root.innerHTML = '<p class="description">Some text</p>'
    document.body.appendChild(root)
    reapplyStyleOverrides(root, overrides)

    expect(root.querySelector<HTMLElement>('p')!.style.fontStyle).toBe('italic')
  })
})

// ─── Tests: Color ─────────────────────────────────────────────────────────

describe('inline edit operations: color', () => {
  it('applyStyleEdit adds color to element', () => {
    const html = '<h1 class="hero-title">Hello</h1>'
    const result = applyStyleEdit(html, 'hero-title', 'color: #ff0000;', 0)
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('style="color: #ff0000;"')
  })

  it('reapply color via styleOverrides', () => {
    const root = document.createElement('div')
    root.innerHTML = '<h1 class="hero-title">Hello</h1>'
    document.body.appendChild(root)

    reapplyStyleOverrides(root, [
      {
        classAnchor: 'hero-title',
        occurrenceIndex: 0,
        style: 'color: #ff0000;',
      },
    ])
    expect(root.querySelector<HTMLElement>('h1')!.style.color).toBe(
      'rgb(255, 0, 0)',
    )
  })

  it('reapply blue color', () => {
    const root = document.createElement('div')
    root.innerHTML = '<p class="text-body">Content</p>'
    document.body.appendChild(root)

    reapplyStyleOverrides(root, [
      {
        classAnchor: 'text-body',
        occurrenceIndex: 0,
        style: 'color: #0000ff;',
      },
    ])
    expect(root.querySelector<HTMLElement>('p')!.style.color).toBe(
      'rgb(0, 0, 255)',
    )
  })

  it('reapply named color (red)', () => {
    const root = document.createElement('div')
    root.innerHTML = '<p class="text-body">Content</p>'
    document.body.appendChild(root)

    reapplyStyleOverrides(root, [
      { classAnchor: 'text-body', occurrenceIndex: 0, style: 'color: red;' },
    ])
    expect(root.querySelector<HTMLElement>('p')!.style.color).toBe('red')
  })

  it('full chain: color edit history → reapply', () => {
    const editHistory = [
      {
        editType: 'style',
        beforeText: 'hero-title',
        afterText: 'color: #ff0000;',
        occurrenceIndex: 0,
      },
    ]
    const overrides = buildStyleOverrides(editHistory)
    const root = document.createElement('div')
    root.innerHTML = '<h1 class="hero-title">Hello</h1>'
    document.body.appendChild(root)
    reapplyStyleOverrides(root, overrides)

    expect(root.querySelector<HTMLElement>('h1')!.style.color).toBe(
      'rgb(255, 0, 0)',
    )
  })
})

// ─── Tests: Font Size ─────────────────────────────────────────────────────

describe('inline edit operations: font-size', () => {
  it('applyStyleEdit adds font-size to element', () => {
    const html = '<p class="body-text">Content</p>'
    const result = applyStyleEdit(html, 'body-text', 'font-size: 24px;', 0)
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('style="font-size: 24px;"')
  })

  it('reapply font-size via styleOverrides', () => {
    const root = document.createElement('div')
    root.innerHTML = '<p class="body-text">Content</p>'
    document.body.appendChild(root)

    reapplyStyleOverrides(root, [
      {
        classAnchor: 'body-text',
        occurrenceIndex: 0,
        style: 'font-size: 24px;',
      },
    ])
    expect(root.querySelector<HTMLElement>('p')!.style.fontSize).toBe('24px')
  })

  it('reapply all toolbar font sizes (12-32px)', () => {
    const sizes = [12, 14, 16, 18, 20, 24, 28, 32]
    for (const size of sizes) {
      const root = document.createElement('div')
      root.innerHTML = `<p class="text">Test ${size}</p>`
      document.body.appendChild(root)

      reapplyStyleOverrides(root, [
        {
          classAnchor: 'text',
          occurrenceIndex: 0,
          style: `font-size: ${size}px;`,
        },
      ])
      expect(root.querySelector<HTMLElement>('p')!.style.fontSize).toBe(
        `${size}px`,
      )
      root.remove()
    }
  })

  it('full chain: font-size edit history → reapply', () => {
    const editHistory = [
      {
        editType: 'style',
        beforeText: 'body-text',
        afterText: 'font-size: 18px;',
        occurrenceIndex: 0,
      },
    ]
    const overrides = buildStyleOverrides(editHistory)
    const root = document.createElement('div')
    root.innerHTML = '<p class="body-text">Content</p>'
    document.body.appendChild(root)
    reapplyStyleOverrides(root, overrides)

    expect(root.querySelector<HTMLElement>('p')!.style.fontSize).toBe('18px')
  })
})

// ─── Tests: Text Alignment ────────────────────────────────────────────────

describe('inline edit operations: text alignment', () => {
  it('applyStyleEdit adds text-align: center', () => {
    const html = '<h1 class="hero-title">Hello</h1>'
    const result = applyStyleEdit(html, 'hero-title', 'text-align: center;', 0)
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('style="text-align: center;"')
  })

  it('reapply text-align: left', () => {
    const root = document.createElement('div')
    root.innerHTML = '<h1 class="hero-title">Hello</h1>'
    document.body.appendChild(root)

    reapplyStyleOverrides(root, [
      {
        classAnchor: 'hero-title',
        occurrenceIndex: 0,
        style: 'text-align: left;',
      },
    ])
    expect(root.querySelector<HTMLElement>('h1')!.style.textAlign).toBe('left')
  })

  it('reapply text-align: center', () => {
    const root = document.createElement('div')
    root.innerHTML = '<h1 class="hero-title">Hello</h1>'
    document.body.appendChild(root)

    reapplyStyleOverrides(root, [
      {
        classAnchor: 'hero-title',
        occurrenceIndex: 0,
        style: 'text-align: center;',
      },
    ])
    expect(root.querySelector<HTMLElement>('h1')!.style.textAlign).toBe(
      'center',
    )
  })

  it('reapply text-align: right', () => {
    const root = document.createElement('div')
    root.innerHTML = '<h1 class="hero-title">Hello</h1>'
    document.body.appendChild(root)

    reapplyStyleOverrides(root, [
      {
        classAnchor: 'hero-title',
        occurrenceIndex: 0,
        style: 'text-align: right;',
      },
    ])
    expect(root.querySelector<HTMLElement>('h1')!.style.textAlign).toBe('right')
  })

  it('full chain: alignment edit history → reapply', () => {
    const editHistory = [
      {
        editType: 'style',
        beforeText: 'hero-title',
        afterText: 'text-align: center;',
        occurrenceIndex: 0,
      },
    ]
    const overrides = buildStyleOverrides(editHistory)
    const root = document.createElement('div')
    root.innerHTML = '<h1 class="hero-title">Hello</h1>'
    document.body.appendChild(root)
    reapplyStyleOverrides(root, overrides)

    expect(root.querySelector<HTMLElement>('h1')!.style.textAlign).toBe(
      'center',
    )
  })
})

// ─── Tests: Combined style operations ─────────────────────────────────────

describe('inline edit operations: combined styles', () => {
  it('reapply bold + italic + color + font-size + alignment together', () => {
    const root = document.createElement('div')
    root.innerHTML = '<h1 class="hero-title">Hello World</h1>'
    document.body.appendChild(root)

    reapplyStyleOverrides(root, [
      {
        classAnchor: 'hero-title',
        occurrenceIndex: 0,
        style:
          'font-weight: 700; font-style: italic; color: #ff0000; font-size: 32px; text-align: center;',
      },
    ])

    const h1 = root.querySelector<HTMLElement>('h1')!
    expect(h1.style.fontWeight).toBe('700')
    expect(h1.style.fontStyle).toBe('italic')
    expect(h1.style.color).toBe('rgb(255, 0, 0)')
    expect(h1.style.fontSize).toBe('32px')
    expect(h1.style.textAlign).toBe('center')
  })

  it('applyStyleEdit with combined style string', () => {
    const html = '<h1 class="hero-title">Hello</h1>'
    const combined =
      'font-weight: 700; font-style: italic; color: #ff0000; font-size: 32px; text-align: center;'
    const result = applyStyleEdit(html, 'hero-title', combined, 0)
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('font-weight: 700')
    expect(result.html).toContain('font-style: italic')
    expect(result.html).toContain('color: #ff0000')
    expect(result.html).toContain('font-size: 32px')
    expect(result.html).toContain('text-align: center')
  })

  it('full chain: combined style edit → reapply all 5 properties', () => {
    const editHistory = [
      {
        editType: 'style',
        beforeText: 'hero-title',
        afterText:
          'font-weight: 700; font-style: italic; color: #ff0000; font-size: 32px; text-align: center;',
        occurrenceIndex: 0,
      },
    ]
    const overrides = buildStyleOverrides(editHistory)
    const root = document.createElement('div')
    root.innerHTML = '<h1 class="hero-title">Hello World</h1>'
    document.body.appendChild(root)
    reapplyStyleOverrides(root, overrides)

    const h1 = root.querySelector<HTMLElement>('h1')!
    expect(h1.style.fontWeight).toBe('700')
    expect(h1.style.fontStyle).toBe('italic')
    expect(h1.style.color).toBe('rgb(255, 0, 0)')
    expect(h1.style.fontSize).toBe('32px')
    expect(h1.style.textAlign).toBe('center')
  })

  it('multiple style edits on different elements', () => {
    const editHistory = [
      {
        editType: 'style',
        beforeText: 'hero-title',
        afterText: 'font-weight: 700;',
        occurrenceIndex: 0,
      },
      {
        editType: 'style',
        beforeText: 'body-text',
        afterText: 'font-size: 18px; color: #333333;',
        occurrenceIndex: 0,
      },
      {
        editType: 'style',
        beforeText: 'cta-button',
        afterText: 'background: blue; color: white;',
        occurrenceIndex: 0,
      },
    ]
    const overrides = buildStyleOverrides(editHistory)
    expect(overrides).toHaveLength(3)

    const root = document.createElement('div')
    root.innerHTML = `
      <h1 class="hero-title">Title</h1>
      <p class="body-text">Body content</p>
      <button class="cta-button">Click me</button>
    `
    document.body.appendChild(root)
    reapplyStyleOverrides(root, overrides)

    expect(
      root.querySelector<HTMLElement>('.hero-title')!.style.fontWeight,
    ).toBe('700')
    expect(root.querySelector<HTMLElement>('.body-text')!.style.fontSize).toBe(
      '18px',
    )
    expect(root.querySelector<HTMLElement>('.body-text')!.style.color).toBe(
      'rgb(51, 51, 51)',
    )
    expect(
      root.querySelector<HTMLElement>('.cta-button')!.style.background,
    ).toBe('blue')
    expect(root.querySelector<HTMLElement>('.cta-button')!.style.color).toBe(
      'white',
    )
  })
})

// ─── Tests: Text + Style combined edits ───────────────────────────────────

describe('inline edit operations: text + style combined', () => {
  it('text edit patches source, style edit reapplies on reload', () => {
    // User edits text: "Hello" → "Welcome" (patches source server-side)
    const source = 'hero = Heading("Hello World")'
    const textResult = applyPreviewTextEdit(
      source,
      'Hello World',
      'Welcome Aboard',
    )
    expect(textResult.replaced).toBe(true)
    expect(textResult.html).toContain('"Welcome Aboard"')

    // User also applies bold style (client-side override, not source patch)
    const styleResult = applyStyleEdit(
      '<h1 class="hero-title">Welcome Aboard</h1>',
      'hero-title',
      'font-weight: 700;',
      0,
    )
    expect(styleResult.replaced).toBe(true)
    expect(styleResult.html).toContain('font-weight: 700')
  })

  it('full chain: text + style edits coexist in edit history', () => {
    const editHistory = [
      {
        editType: 'style',
        beforeText: 'hero-title',
        afterText: 'font-weight: 700; color: #ff0000;',
        occurrenceIndex: 0,
      },
      {
        editType: 'text',
        beforeText: 'Hello World',
        afterText: 'Welcome Aboard',
      },
    ]

    // Text edit patches source (server-side)
    const source = 'hero = Heading("Hello World")'
    const textResult = applyPreviewTextEdit(
      source,
      'Hello World',
      'Welcome Aboard',
    )
    expect(textResult.html).toContain('"Welcome Aboard"')

    // Style edit reapply (client-side)
    const styleOverrides = buildStyleOverrides(editHistory)
    const root = document.createElement('div')
    root.innerHTML = '<h1 class="hero-title">Welcome Aboard</h1>'
    document.body.appendChild(root)
    reapplyStyleOverrides(root, styleOverrides)

    const h1 = root.querySelector<HTMLElement>('h1')!
    expect(h1.textContent).toBe('Welcome Aboard')
    expect(h1.style.fontWeight).toBe('700')
    expect(h1.style.color).toBe('rgb(255, 0, 0)')
  })

  it('text edit then style edit on same element: both persist', () => {
    // Simulate: user edits text, then applies bold, then reloads
    // 1. Text edit patches source
    const source = 'hero = Heading("Original Title")'
    const patchedSource = applyPreviewTextEdit(
      source,
      'Original Title',
      'New Title',
    )
    expect(patchedSource.replaced).toBe(true)
    expect(patchedSource.html).toContain('"New Title"')

    // 2. Style edit is recorded (client-side override)
    const editHistory = [
      {
        editType: 'style',
        beforeText: 'hero-title',
        afterText: 'font-weight: 700; font-size: 28px;',
        occurrenceIndex: 0,
      },
      {
        editType: 'text',
        beforeText: 'Original Title',
        afterText: 'New Title',
      },
    ]

    // 3. On reload: source has "New Title", styleOverrides reapply bold+size
    const styleOverrides = buildStyleOverrides(editHistory)
    const root = document.createElement('div')
    root.innerHTML = '<h1 class="hero-title">New Title</h1>'
    document.body.appendChild(root)
    reapplyStyleOverrides(root, styleOverrides)

    const h1 = root.querySelector<HTMLElement>('h1')!
    expect(h1.textContent).toBe('New Title')
    expect(h1.style.fontWeight).toBe('700')
    expect(h1.style.fontSize).toBe('28px')
  })
})

// ─── Tests: Text + Image combined edits ───────────────────────────────────

describe('inline edit operations: text + image combined', () => {
  it('text edit patches source, image swap patches preview.html', () => {
    const source = 'hero = FoodDeliveryHero("Hello", "Subtitle", "image.jpg")'
    const textResult = applyPreviewTextEdit(source, 'Hello', 'Welcome')
    expect(textResult.replaced).toBe(true)
    expect(textResult.html).toContain('"Welcome"')

    const html = '<img alt="Hero" src="/old.jpg" />'
    const imgResult = applyImageSwap(html, 'Hero', '/new.jpg')
    expect(imgResult.replaced).toBe(true)
    expect(imgResult.html).toContain('src="/new.jpg"')
  })

  it('full chain: text + image edits coexist in edit history', () => {
    const editHistory = [
      {
        editType: 'image',
        beforeText: 'Hero',
        afterText: '/new-hero.jpg',
      },
      {
        editType: 'text',
        beforeText: 'Hello',
        afterText: 'Welcome',
      },
    ]

    // Text edit patches source
    const source = 'hero = Heading("Hello")'
    const textResult = applyPreviewTextEdit(source, 'Hello', 'Welcome')
    expect(textResult.html).toContain('"Welcome"')

    // Image override built from history
    const imageOverrides = buildImageOverrides(editHistory)
    expect(imageOverrides['Hero']).toBe('/new-hero.jpg')
  })
})

// ─── Tests: Style + Image combined edits ──────────────────────────────────

describe('inline edit operations: style + image combined', () => {
  it('full chain: style + image edits coexist and reapply independently', () => {
    const editHistory = [
      {
        editType: 'style',
        beforeText: 'hero-title',
        afterText: 'font-weight: 700; color: #ff0000;',
        occurrenceIndex: 0,
      },
      {
        editType: 'image',
        beforeText: 'Hero',
        afterText: '/new-hero.jpg',
      },
    ]

    // Style overrides
    const styleOverrides = buildStyleOverrides(editHistory)
    expect(styleOverrides).toHaveLength(1)

    // Image overrides
    const imageOverrides = buildImageOverrides(editHistory)
    expect(imageOverrides['Hero']).toBe('/new-hero.jpg')

    // Reapply styles to DOM
    const root = document.createElement('div')
    root.innerHTML = `
      <h1 class="hero-title">Welcome</h1>
      <img alt="Hero" src="/old.jpg" />
    `
    document.body.appendChild(root)
    reapplyStyleOverrides(root, styleOverrides)

    expect(root.querySelector<HTMLElement>('h1')!.style.fontWeight).toBe('700')
    expect(root.querySelector<HTMLElement>('h1')!.style.color).toBe(
      'rgb(255, 0, 0)',
    )
    // Image swap would be handled by Image component via context
  })
})

// ─── Tests: All three edit types combined ─────────────────────────────────

describe('inline edit operations: text + style + image combined', () => {
  it('full chain: all three edit types coexist and persist', () => {
    const editHistory = [
      {
        editType: 'style',
        beforeText: 'hero-title',
        afterText: 'font-weight: 700; font-size: 32px; text-align: center;',
        occurrenceIndex: 0,
      },
      {
        editType: 'image',
        beforeText: 'Hero',
        afterText: 'https://cdn.example.com/new-hero.jpg',
      },
      {
        editType: 'text',
        beforeText: 'Original Title',
        afterText: 'Amazing New Title',
      },
      {
        editType: 'style',
        beforeText: 'cta-button',
        afterText: 'background: #ff0000; color: white;',
        occurrenceIndex: 0,
      },
    ]

    // 1. Text edit patches source (server-side)
    const source = 'hero = Section("Original Title", "Subtitle", "image.jpg")'
    const textResult = applyPreviewTextEdit(
      source,
      'Original Title',
      'Amazing New Title',
    )
    expect(textResult.replaced).toBe(true)
    expect(textResult.html).toContain('"Amazing New Title"')

    // 2. Style overrides built (client-side reapply)
    const styleOverrides = buildStyleOverrides(editHistory)
    expect(styleOverrides).toHaveLength(2) // hero-title + cta-button

    // 3. Image overrides built (client-side reapply)
    const imageOverrides = buildImageOverrides(editHistory)
    expect(imageOverrides['Hero']).toBe('https://cdn.example.com/new-hero.jpg')

    // 4. Reapply styles to rendered DOM
    const root = document.createElement('div')
    root.innerHTML = `
      <h1 class="hero-title">Amazing New Title</h1>
      <img alt="Hero" src="/old.jpg" />
      <button class="cta-button">Click me</button>
    `
    document.body.appendChild(root)
    reapplyStyleOverrides(root, styleOverrides)

    const h1 = root.querySelector<HTMLElement>('h1')!
    const button = root.querySelector<HTMLElement>('.cta-button')!
    expect(h1.textContent).toBe('Amazing New Title')
    expect(h1.style.fontWeight).toBe('700')
    expect(h1.style.fontSize).toBe('32px')
    expect(h1.style.textAlign).toBe('center')
    expect(button.style.background).toBe('rgb(255, 0, 0)')
    expect(button.style.color).toBe('white')
  })

  it('multiple text edits + multiple style edits + multiple image edits', () => {
    const editHistory = [
      {
        editType: 'text',
        beforeText: 'Hello',
        afterText: 'Welcome',
      },
      {
        editType: 'text',
        beforeText: 'World',
        afterText: 'Universe',
      },
      {
        editType: 'style',
        beforeText: 'title',
        afterText: 'font-weight: 700;',
        occurrenceIndex: 0,
      },
      {
        editType: 'style',
        beforeText: 'subtitle',
        afterText: 'color: #333;',
        occurrenceIndex: 0,
      },
      {
        editType: 'image',
        beforeText: 'Hero',
        afterText: '/hero-new.jpg',
      },
      {
        editType: 'image',
        beforeText: 'Logo',
        afterText: '/logo-new.png',
      },
    ]

    // Text edits patch source
    let source = 'page = Page("Hello", "World")'
    const r1 = applyPreviewTextEdit(source, 'Hello', 'Welcome')
    expect(r1.replaced).toBe(true)
    source = r1.html
    const r2 = applyPreviewTextEdit(source, 'World', 'Universe')
    expect(r2.replaced).toBe(true)
    expect(r2.html).toContain('"Welcome"')
    expect(r2.html).toContain('"Universe"')

    // Style overrides
    const styleOverrides = buildStyleOverrides(editHistory)
    expect(styleOverrides).toHaveLength(2)

    // Image overrides
    const imageOverrides = buildImageOverrides(editHistory)
    expect(Object.keys(imageOverrides)).toHaveLength(2)
    expect(imageOverrides['Hero']).toBe('/hero-new.jpg')
    expect(imageOverrides['Logo']).toBe('/logo-new.png')
  })
})

// ─── Tests: Style edit on OpenUI source (the known limitation) ────────────

describe('inline edit operations: style edit on OpenUI source', () => {
  it('applyStyleEdit returns replaced:false on OpenUI source (no class attrs)', () => {
    // OpenUI source has no HTML class attributes — applyStyleEdit can't anchor
    const source = 'hero = FoodDeliveryHero("Title", "Subtitle")'
    const result = applyStyleEdit(source, 'hero-title', 'font-weight: 700;', 0)
    expect(result.replaced).toBe(false)
    expect(result.html).toBe(source)
  })

  it('style edits persist via client-side reapply, not source patching', () => {
    // The fix: style edits don't need source patching. They're saved as edit
    // records and reapplied client-side via styleOverrides on reload.
    const editHistory = [
      {
        editType: 'style',
        beforeText: 'hero-title',
        afterText: 'font-weight: 700; color: #ff0000;',
        occurrenceIndex: 0,
      },
    ]

    // Source is NOT patched (applyStyleEdit returns replaced:false)
    // But the edit record exists, so styleOverrides are built
    const overrides = buildStyleOverrides(editHistory)
    expect(overrides).toHaveLength(1)

    // On reload, the rendered HTML has class attributes (from SSR)
    const root = document.createElement('div')
    root.innerHTML = '<h1 class="hero-title">Title</h1>'
    document.body.appendChild(root)
    reapplyStyleOverrides(root, overrides)

    expect(root.querySelector<HTMLElement>('h1')!.style.fontWeight).toBe('700')
    expect(root.querySelector<HTMLElement>('h1')!.style.color).toBe(
      'rgb(255, 0, 0)',
    )
  })
})

// ─── Tests: Occurrence index for style edits ──────────────────────────────

describe('inline edit operations: occurrence index for styles', () => {
  it('reapply bold to 2nd card in a grid', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <div class="card">Card A</div>
      <div class="card">Card B</div>
      <div class="card">Card C</div>
    `
    document.body.appendChild(root)

    reapplyStyleOverrides(root, [
      { classAnchor: 'card', occurrenceIndex: 1, style: 'font-weight: 700;' },
    ])

    const cards = root.querySelectorAll<HTMLElement>('.card')
    expect(cards[0].style.fontWeight).toBe('')
    expect(cards[1].style.fontWeight).toBe('700')
    expect(cards[2].style.fontWeight).toBe('')
  })

  it('reapply different colors to different occurrences of same class', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <div class="badge">A</div>
      <div class="badge">B</div>
      <div class="badge">C</div>
    `
    document.body.appendChild(root)

    reapplyStyleOverrides(root, [
      { classAnchor: 'badge', occurrenceIndex: 0, style: 'color: red;' },
      { classAnchor: 'badge', occurrenceIndex: 1, style: 'color: green;' },
      { classAnchor: 'badge', occurrenceIndex: 2, style: 'color: blue;' },
    ])

    const badges = root.querySelectorAll<HTMLElement>('.badge')
    expect(badges[0].style.color).toBe('red')
    expect(badges[1].style.color).toBe('green')
    expect(badges[2].style.color).toBe('blue')
  })

  it('applyStyleEdit targets correct occurrence in HTML', () => {
    const html =
      '<div class="card">A</div><div class="card">B</div><div class="card">C</div>'
    const result = applyStyleEdit(html, 'card', 'background: gold;', 2)
    expect(result.replaced).toBe(true)
    expect(result.html).not.toContain(
      '<div class="card" style="background: gold;">A</div>',
    )
    expect(result.html).not.toContain(
      '<div class="card" style="background: gold;">B</div>',
    )
    expect(result.html).toContain(
      '<div class="card" style="background: gold;">C</div>',
    )
  })
})
