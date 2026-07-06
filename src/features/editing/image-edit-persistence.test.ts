import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'

import { applyImageSwap, applyPreviewTextEdit } from '@/lib/edit-helpers'
import { Image } from '../../../packages/ship-fast-blocks/src/lib/img'

/**
 * Image swap edit persistence contract tests.
 *
 * Full chain: applyImageSwap (server patches preview.html) → edit record
 * stored → client rebuilds imageOverrides from edit history → Image component
 * reads override from context → swap persists on reload.
 *
 * Key architectural decisions verified:
 * - Anchoring on `alt` (stable) not `src` (varies between stored/live DOM)
 * - Occurrence index disambiguates images sharing the same alt
 * - Image edits do NOT patch homeModule.source (unlike text edits) — they
 *   are reapplied client-side via imageOverrides → ImageContextProvider
 * - Override priority: matching override by alt or current src > explicit src prop > Pexels lookup
 */

// ─── Helpers ──────────────────────────────────────────────────────────────

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
globalThis.document = dom.window.document as unknown as Document
globalThis.window = dom.window as unknown as Window & typeof globalThis

/**
 * Build imageOverrides from edit history — mirrors Dashboard.tsx logic.
 * Maps alt → newSrc for all image edits.
 */
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
      // edits are newest-first, so the first seen alt wins (latest swap).
      map[edit.beforeText] = edit.afterText
    }
  }
  return map
}

// ─── Tests: applyImageSwap (server-side patching) ─────────────────────────

describe('image edit persistence: applyImageSwap on rendered HTML', () => {
  it('replaces src on img matching alt anchor', () => {
    const html = '<img alt="Hero" src="/old.jpg" />'
    const result = applyImageSwap(html, 'Hero', '/new.jpg')
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('src="/new.jpg"')
    expect(result.html).toContain('alt="Hero"')
    expect(result.html).not.toContain('/old.jpg')
  })

  it('preserves other attributes when swapping src', () => {
    const html =
      '<img alt="Product" src="/old.png" class="w-full rounded" loading="lazy" width="400" height="300" />'
    const result = applyImageSwap(html, 'Product', '/new.png')
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('src="/new.png"')
    expect(result.html).toContain('class="w-full rounded"')
    expect(result.html).toContain('loading="lazy"')
    expect(result.html).toContain('width="400"')
    expect(result.html).toContain('height="300"')
  })

  it('targets correct occurrence when multiple images share alt', () => {
    const html =
      '<img alt="product" src="/a.png"><img alt="product" src="/b.png"><img alt="product" src="/c.png">'
    const result = applyImageSwap(html, 'product', '/new.png', 1)
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('src="/a.png"')
    expect(result.html).toContain('src="/new.png"')
    expect(result.html).toContain('src="/c.png"')
    expect(result.html).not.toContain('src="/b.png"')
  })

  it('defaults to first occurrence when no index specified', () => {
    const html =
      '<img alt="photo" src="/first.jpg"><img alt="photo" src="/second.jpg">'
    const result = applyImageSwap(html, 'photo', '/replacement.jpg')
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('src="/replacement.jpg"')
    expect(result.html).toContain('src="/second.jpg"')
  })

  it('clamps occurrenceIndex to last available image', () => {
    const html = '<img alt="single" src="/only.jpg">'
    const result = applyImageSwap(html, 'single', '/new.jpg', 5)
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('src="/new.jpg"')
  })

  it('returns replaced:false when alt not found', () => {
    const html = '<img alt="Hero" src="/old.jpg" />'
    const result = applyImageSwap(html, 'Nonexistent', '/new.jpg')
    expect(result.replaced).toBe(false)
    expect(result.html).toBe(html)
  })

  it('returns replaced:false when no images in HTML', () => {
    const html = '<div>No images here</div>'
    const result = applyImageSwap(html, 'Hero', '/new.jpg')
    expect(result.replaced).toBe(false)
  })

  it('returns replaced:false for empty alt', () => {
    const html = '<img alt="" src="/old.jpg" />'
    const result = applyImageSwap(html, '', '/new.jpg')
    expect(result.replaced).toBe(false)
  })

  it('handles single-quoted alt attributes', () => {
    const html = "<img alt='Hero' src='/old.jpg' />"
    const result = applyImageSwap(html, 'Hero', '/new.jpg')
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('src="/new.jpg"')
  })

  it('escapes double quotes in new src URL', () => {
    const html = '<img alt="Hero" src="/old.jpg" />'
    const result = applyImageSwap(html, 'Hero', '/path?query="test"')
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('&quot;test&quot;')
  })

  it('handles URLs with query parameters and fragments', () => {
    const html = '<img alt="Hero" src="/old.jpg" />'
    const newSrc = 'https://cdn.example.com/img.jpg?w=400&h=300#fragment'
    const result = applyImageSwap(html, 'Hero', newSrc)
    expect(result.replaced).toBe(true)
    expect(result.html).toContain(`src="${newSrc}"`)
  })

  it('appends src attribute when img tag has none', () => {
    const html = '<img alt="Hero">'
    const result = applyImageSwap(html, 'Hero', '/new.jpg')
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('src="/new.jpg"')
    expect(result.html).toContain('alt="Hero"')
  })

  it('only swaps images matching alt, leaves others untouched', () => {
    const html =
      '<img alt="Hero" src="/hero-old.jpg"><img alt="Logo" src="/logo.png"><img alt="Banner" src="/banner.gif">'
    const result = applyImageSwap(html, 'Logo', '/new-logo.png')
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('src="/hero-old.jpg"')
    expect(result.html).toContain('src="/new-logo.png"')
    expect(result.html).toContain('src="/banner.gif"')
  })
})

// ─── Tests: imageOverrides construction from edit history ─────────────────

describe('image edit persistence: imageOverrides from edit history', () => {
  it('builds alt→src map from image edits only', () => {
    const edits = [
      { editType: 'image', beforeText: 'Hero', afterText: '/new-hero.jpg' },
      { editType: 'text', beforeText: 'Hello', afterText: 'Hi' },
      { editType: 'image', beforeText: 'Logo', afterText: '/new-logo.png' },
      { editType: 'style', beforeText: 'hero-title', afterText: 'color: red;' },
    ]
    const overrides = buildImageOverrides(edits)
    expect(Object.keys(overrides)).toHaveLength(2)
    expect(overrides['Hero']).toBe('/new-hero.jpg')
    expect(overrides['Logo']).toBe('/new-logo.png')
  })

  it('latest image edit wins (edits are newest-first)', () => {
    const edits = [
      { editType: 'image', beforeText: 'Hero', afterText: '/latest.jpg' },
      { editType: 'image', beforeText: 'Hero', afterText: '/older.jpg' },
    ]
    const overrides = buildImageOverrides(edits)
    expect(overrides['Hero']).toBe('/latest.jpg')
  })

  it('ignores edits with missing beforeText or afterText', () => {
    const edits = [
      { editType: 'image', beforeText: undefined, afterText: '/new.jpg' },
      { editType: 'image', beforeText: 'Hero', afterText: undefined },
      { editType: 'image', beforeText: 'Logo', afterText: '/logo.png' },
    ]
    const overrides = buildImageOverrides(edits)
    expect(Object.keys(overrides)).toHaveLength(1)
    expect(overrides['Logo']).toBe('/logo.png')
  })

  it('handles empty edit history', () => {
    const overrides = buildImageOverrides([])
    expect(Object.keys(overrides)).toHaveLength(0)
  })
})

// ─── Tests: Image component override reapply (client-side) ────────────────

describe('image edit persistence: Image component override reapply', () => {
  it('uses override src from context overrides', () => {
    const markup = renderToStaticMarkup(
      createElement(Image, {
        alt: 'Hero image',
        context: {
          overrides: { 'Hero image': 'https://cdn.example.com/override.jpg' },
        },
      }),
    )
    expect(markup).toContain('src="https://cdn.example.com/override.jpg"')
    expect(markup).not.toContain('/api/pexels')
  })

  it('uses an override keyed by the current src when the image alt is not stable enough', () => {
    const currentSrc =
      '/api/pexels?query=glass+polished+showcase+installations&w=800&h=600&seed=Showcase+of+polished+glass+installations'
    const overrideSrc =
      'https://images.pexels.com/photos/7195588/pexels-photo-7195588.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'

    const markup = renderToStaticMarkup(
      createElement(Image, {
        alt: 'Showcase of polished glass installations',
        src: currentSrc,
        context: {
          overrides: { [currentSrc]: overrideSrc },
        },
      }),
    )

    expect(markup).toContain(`src="${overrideSrc.replace(/&/g, '&amp;')}"`)
    expect(markup).not.toContain(currentSrc.replace(/&/g, '&amp;'))
  })

  it('keeps an explicit src when no alt or src override matches', () => {
    const currentSrc = 'https://cdn.example.com/original.jpg'
    const markup = renderToStaticMarkup(
      createElement(Image, {
        alt: 'Stable hero',
        src: currentSrc,
        context: {
          overrides: { 'Other hero': 'https://cdn.example.com/other.jpg' },
        },
      }),
    )

    expect(markup).toContain(`src="${currentSrc}"`)
    expect(markup).not.toContain('https://cdn.example.com/other.jpg')
    expect(markup).not.toContain('/api/pexels')
  })

  it('override takes precedence over Pexels lookup', () => {
    const markup = renderToStaticMarkup(
      createElement(Image, {
        alt: 'Product photo',
        context: {
          overrides: { 'Product photo': 'https://cdn.example.com/product.jpg' },
        },
      }),
    )
    expect(markup).toContain('https://cdn.example.com/product.jpg')
    expect(markup).not.toContain('/api/pexels')
  })

  it('falls back to Pexels when no override exists for alt', () => {
    const markup = renderToStaticMarkup(
      createElement(Image, {
        alt: 'Unknown image',
        context: {
          overrides: { 'Other image': '/other.jpg' },
        },
      }),
    )
    // No override for "Unknown image" → should use Pexels proxy
    expect(markup).toContain('/api/pexels')
  })

  it('falls back to Pexels when no context provided', () => {
    const markup = renderToStaticMarkup(
      createElement(Image, {
        alt: 'Some image',
      }),
    )
    expect(markup).toContain('/api/pexels')
  })

  it('handles multiple overrides in same context', () => {
    const overrides = {
      Hero: '/hero.jpg',
      Logo: '/logo.png',
      Banner: '/banner.gif',
    }
    const heroMarkup = renderToStaticMarkup(
      createElement(Image, { alt: 'Hero', context: { overrides } }),
    )
    const logoMarkup = renderToStaticMarkup(
      createElement(Image, { alt: 'Logo', context: { overrides } }),
    )
    expect(heroMarkup).toContain('src="/hero.jpg"')
    expect(logoMarkup).toContain('src="/logo.png"')
  })
})

// ─── Tests: full chain (edit history → overrides → Image reapply) ─────────

describe('image edit persistence: full chain', () => {
  it('full chain: edit history → imageOverrides → Image renders override', () => {
    // Simulate reload flow:
    // 1. Edit history loaded from server
    // 2. Dashboard builds imageOverrides from edits
    // 3. Image component receives overrides via context

    const editHistory = [
      {
        editType: 'image',
        beforeText: 'Hero banner',
        afterText: 'https://cdn.example.com/new-hero.jpg',
      },
    ]

    // Step 2: Build overrides
    const overrides = buildImageOverrides(editHistory)
    expect(overrides['Hero banner']).toBe(
      'https://cdn.example.com/new-hero.jpg',
    )

    // Step 3: Image component renders with override
    const markup = renderToStaticMarkup(
      createElement(Image, {
        alt: 'Hero banner',
        context: { overrides },
      }),
    )
    expect(markup).toContain('https://cdn.example.com/new-hero.jpg')
    expect(markup).not.toContain('/api/pexels')
  })

  it('full chain: multiple image swaps persist independently', () => {
    const editHistory = [
      { editType: 'image', beforeText: 'Hero', afterText: '/hero-new.jpg' },
      {
        editType: 'image',
        beforeText: 'Product',
        afterText: '/product-new.jpg',
      },
      { editType: 'image', beforeText: 'Footer', afterText: '/footer-new.jpg' },
    ]

    const overrides = buildImageOverrides(editHistory)

    for (const [alt, expectedSrc] of Object.entries(overrides)) {
      const markup = renderToStaticMarkup(
        createElement(Image, { alt, context: { overrides } }),
      )
      expect(markup).toContain(`src="${expectedSrc}"`)
    }
  })

  it('full chain: latest swap wins for same alt', () => {
    const editHistory = [
      { editType: 'image', beforeText: 'Hero', afterText: '/latest.jpg' },
      { editType: 'image', beforeText: 'Hero', afterText: '/older.jpg' },
    ]

    const overrides = buildImageOverrides(editHistory)
    expect(overrides['Hero']).toBe('/latest.jpg')

    const markup = renderToStaticMarkup(
      createElement(Image, { alt: 'Hero', context: { overrides } }),
    )
    expect(markup).toContain('src="/latest.jpg"')
    expect(markup).not.toContain('/older.jpg')
  })

  it('full chain: server patches preview.html, client reapply agrees', () => {
    // Server side: applyImageSwap patches the stored preview.html
    const storedHtml =
      '<img alt="Hero" src="https://api.pexels.com/v1/search?query=food" />'
    const serverResult = applyImageSwap(storedHtml, 'Hero', '/cdn/new-hero.jpg')
    expect(serverResult.replaced).toBe(true)

    // Client side: same edit recorded, override built, Image renders
    const editHistory = [
      { editType: 'image', beforeText: 'Hero', afterText: '/cdn/new-hero.jpg' },
    ]
    const overrides = buildImageOverrides(editHistory)
    const markup = renderToStaticMarkup(
      createElement(Image, { alt: 'Hero', context: { overrides } }),
    )

    // Both server-patched HTML and client-rendered Image show the same src
    expect(serverResult.html).toContain('src="/cdn/new-hero.jpg"')
    expect(markup).toContain('src="/cdn/new-hero.jpg"')
  })
})

// ─── Tests: occurrence index disambiguation ───────────────────────────────

describe('image edit persistence: occurrence index disambiguation', () => {
  it('swaps 2nd of 3 images with same alt', () => {
    const html = `
      <div class="gallery">
        <img alt="photo" src="/photo-1.jpg">
        <img alt="photo" src="/photo-2.jpg">
        <img alt="photo" src="/photo-3.jpg">
      </div>
    `
    const result = applyImageSwap(html, 'photo', '/replacement.jpg', 1)
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('src="/photo-1.jpg"')
    expect(result.html).toContain('src="/replacement.jpg"')
    expect(result.html).toContain('src="/photo-3.jpg"')
    expect(result.html).not.toContain('src="/photo-2.jpg"')
  })

  it('swaps last occurrence', () => {
    const html =
      '<img alt="icon" src="/a.svg"><img alt="icon" src="/b.svg"><img alt="icon" src="/c.svg">'
    const result = applyImageSwap(html, 'icon', '/new.svg', 2)
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('src="/a.svg"')
    expect(result.html).toContain('src="/b.svg"')
    expect(result.html).toContain('src="/new.svg"')
  })

  it('swaps first occurrence (index 0)', () => {
    const html = '<img alt="icon" src="/a.svg"><img alt="icon" src="/b.svg">'
    const result = applyImageSwap(html, 'icon', '/new.svg', 0)
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('src="/new.svg"')
    expect(result.html).toContain('src="/b.svg"')
    expect(result.html).not.toContain('src="/a.svg"')
  })
})

// ─── Tests: server-side fallback when applyImageSwap fails ───────────────

describe('image edit persistence: server-side fallback when applyImageSwap fails', () => {
  // These tests verify the contract that when applyImageSwap returns
  // replaced:false, the server must NOT fall back to applyPreviewTextEdit
  // (which would replace the alt TEXT in the OpenUI source with the image URL,
  // corrupting the source). Instead, image edits should be treated like style
  // edits: save the edit record and reapply client-side via imageOverrides.

  it('applyImageSwap returns replaced:false when alt is not found in HTML', () => {
    // Simulates the case where preview.html is OpenUI source (no <img> tags)
    // or the alt doesn't match any img tag
    const html = '<div>Some content without images</div>'
    const result = applyImageSwap(html, 'Hero', '/new-hero.jpg')
    expect(result.replaced).toBe(false)
  })

  it('applyImageSwap returns replaced:false for empty alt', () => {
    const html = '<img alt="" src="/old.jpg">'
    const result = applyImageSwap(html, '', '/new.jpg')
    expect(result.replaced).toBe(false)
  })

  it('applyPreviewTextEdit would corrupt OpenUI source if used as image fallback', () => {
    // This test documents the bug: if the server falls back to
    // applyPreviewTextEdit for image edits, it replaces the alt TEXT with the
    // URL, corrupting the source. This is why image edits must NOT use the
    // text edit fallback.
    const openUiSource = 'hero = Image("Hero")'
    const result = applyPreviewTextEdit(openUiSource, 'Hero', '/new-hero.jpg')
    // If this "succeeds", it means the alt text "Hero" was replaced with the
    // URL — corrupting the OpenUI source by turning Image("Hero") into
    // Image("/new-hero.jpg"). This is the bug.
    if (result.replaced) {
      expect(result.html).toContain('/new-hero.jpg')
      // The source is now corrupted — Image("Hero") became Image("/new-hero.jpg")
      expect(result.html).not.toMatch(/Image\("Hero"\)/)
    }
  })

  it('imageOverrides reapply works even when applyImageSwap fails on preview.html', () => {
    // The full persistence chain when applyImageSwap fails:
    // 1. applyImageSwap fails (preview.html has no matching img)
    // 2. Server saves edit record (editType: 'image', beforeText: alt, afterText: newSrc)
    // 3. Client builds imageOverrides from edit history
    // 4. Image component uses override on re-render
    const alt = 'Hero'
    const newSrc = 'https://images.unsplash.com/photo-new?w=400&h=300&fit=crop'

    // Step 1: applyImageSwap fails
    const previewHtml = '<div>No img tags here</div>'
    const swapResult = applyImageSwap(previewHtml, alt, newSrc)
    expect(swapResult.replaced).toBe(false)

    // Step 2: Edit record is saved (simulated)
    const editHistory = [
      { editType: 'image', beforeText: alt, afterText: newSrc },
    ]

    // Step 3: Client builds imageOverrides
    const imageOverrides = buildImageOverrides(editHistory)
    expect(imageOverrides[alt]).toBe(newSrc)

    // Step 4: Image component uses override
    const markup = renderToStaticMarkup(
      createElement(Image, { alt, context: { overrides: imageOverrides } }),
    )
    // URLs are HTML-encoded in attributes (& → &amp;)
    const encodedSrc = newSrc.replace(/&/g, '&amp;')
    expect(markup).toContain(encodedSrc)
    expect(markup).toContain(`alt="${alt}"`)
  })

  it('imageOverrides persist across reloads via edit history', () => {
    // Simulate: user swaps image, page reloads, edit history is loaded from
    // server, imageOverrides rebuilt, Image component renders with override
    const editHistory = [
      { editType: 'text', beforeText: 'Old Title', afterText: 'New Title' },
      {
        editType: 'image',
        beforeText: 'Hero',
        afterText: 'https://cdn.example.com/hero.jpg',
      },
      {
        editType: 'image',
        beforeText: 'Logo',
        afterText: 'https://cdn.example.com/logo.png',
      },
    ]

    const overrides = buildImageOverrides(editHistory)
    expect(Object.keys(overrides)).toHaveLength(2)
    expect(overrides['Hero']).toBe('https://cdn.example.com/hero.jpg')
    expect(overrides['Logo']).toBe('https://cdn.example.com/logo.png')

    // Verify both overrides are applied by the Image component
    const heroMarkup = renderToStaticMarkup(
      createElement(Image, { alt: 'Hero', context: { overrides } }),
    )
    expect(heroMarkup).toContain('https://cdn.example.com/hero.jpg')

    const logoMarkup = renderToStaticMarkup(
      createElement(Image, { alt: 'Logo', context: { overrides } }),
    )
    expect(logoMarkup).toContain('https://cdn.example.com/logo.png')
  })

  it('latest image swap wins when same alt is swapped multiple times', () => {
    // Edit history is newest-first. The first occurrence of an alt in the
    // history is the latest swap — that's the one that should win.
    const editHistory = [
      { editType: 'image', beforeText: 'Hero', afterText: '/latest.jpg' },
      { editType: 'image', beforeText: 'Hero', afterText: '/older.jpg' },
    ]

    const overrides = buildImageOverrides(editHistory)
    expect(overrides['Hero']).toBe('/latest.jpg')
  })

  it('override is used even when applyImageSwap would fail on realistic preview.html', () => {
    // Realistic scenario: preview.html is stored as OpenUI source (not rendered
    // HTML), so applyImageSwap can't find <img> tags. The override mechanism
    // must still work.
    const openUiAsHtml = '$page = "Home"\nhero = Image("Hero")'
    const newSrc = 'https://images.pexels.com/photos/new.jpg'

    // applyImageSwap fails because there are no <img> tags
    const swapResult = applyImageSwap(openUiAsHtml, 'Hero', newSrc)
    expect(swapResult.replaced).toBe(false)

    // But imageOverrides still works
    const overrides = buildImageOverrides([
      { editType: 'image', beforeText: 'Hero', afterText: newSrc },
    ])

    const markup = renderToStaticMarkup(
      createElement(Image, { alt: 'Hero', context: { overrides } }),
    )
    expect(markup).toContain(newSrc)
    expect(markup).toContain('alt="Hero"')
  })
})
