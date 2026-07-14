import { describe, expect, it } from 'vitest'

import {
  dnaSectionsBlock,
  mobbinDoctrineBlock,
  mobbinSessionBlock,
  resolveAnchor,
} from './prompt-blocks'

describe('Mobbin prompt blocks', () => {
  it('does not invent an anchor when the app name is absent', () => {
    expect(resolveAnchor({})).toBeNull()
    expect(resolveAnchor({ app: '' })).toBeNull()
  })

  it('resolves curated anchor DNA and preserves export-time inputs', () => {
    const anchor = resolveAnchor({
      app: 'Linear',
      category: 'Developer Tools',
      palette: ['#101010', '#5e6ad2', '#f7f8f8'],
    })

    expect(anchor).toMatchObject({
      app: 'Linear',
      category: 'Developer Tools',
      palette: ['#101010', '#5e6ad2', '#f7f8f8'],
    })
    expect(anchor?.dna).toBeTruthy()
  })

  it('synthesizes deterministic DNA for an unknown anchor', () => {
    const anchor = resolveAnchor({
      app: 'Unlisted Product',
      palette: ['#050505', '#2563eb', '#fafafa'],
    })

    expect(anchor?.dna?._synthesized).toBe(true)
    expect(anchor?.copyExamples).toBeNull()
  })

  it('returns no section grammar without concrete sections', () => {
    expect(dnaSectionsBlock(null, 'Linear')).toBe('')
    expect(dnaSectionsBlock({}, 'Linear')).toBe('')
  })

  it('precompiles section types, variants, and notes into the site grammar', () => {
    const block = dnaSectionsBlock(
      {
        sections: [
          { type: 'hero', variant: 'product-window', note: 'Show real UI' },
          { type: 'proof' },
        ],
      },
      'Linear',
    )

    expect(block).toContain("Section pattern for Linear's homepage")
    expect(block).toContain('type: "hero" | variant: "product-window"')
    expect(block).toContain('Show real UI')
    expect(block).toContain('type: "proof"')
  })

  it('skips malformed section entries instead of emitting undefined types', () => {
    const block = dnaSectionsBlock(
      {
        sections: [{ type: '' }, { type: 'footer' }],
      },
      'Linear',
    )

    expect(block).not.toContain('type: ""')
    expect(block).not.toContain('undefined')
    expect(block).toContain('type: "footer"')
  })

  it('returns no session block without a resolved anchor', () => {
    expect(mobbinSessionBlock(null)).toBe('')
  })

  it('bakes palette roles and literal colors before runtime', () => {
    const anchor = resolveAnchor({
      app: 'Unlisted Product',
      category: 'Software',
      palette: ['#050505', '#181818', '#2563eb', '#fafafa'],
    })
    const block = mobbinSessionBlock(anchor)

    expect(block).toContain('ANCHOR: Unlisted Product (Software)')
    expect(block).toContain('Palette: #050505, #181818, #2563eb, #fafafa')
    expect(block).toContain(
      'background=#050505, surface=#181818, primary=#2563eb, body=#fafafa',
    )
    expect(block).toContain('descriptor above was synthesized')
  })

  it('does not claim role assignment for incomplete or invalid palettes', () => {
    const anchor = resolveAnchor({
      app: 'Unlisted Product',
      palette: ['invalid', '#050505'],
    })
    const block = mobbinSessionBlock(anchor)

    expect(block).toContain('Palette: invalid, #050505')
    expect(block).not.toContain('Role assignment:')
  })

  it('derives a complementary-primary instruction for monochrome palettes', () => {
    const anchor = resolveAnchor({
      app: 'Unlisted Product',
      palette: ['#000000', '#111111', '#eeeeee'],
    })
    const block = mobbinSessionBlock(anchor)

    expect(block).toContain('no distinct accent in palette')
    expect(block).toContain('derive a complementary primary')
  })

  it('assigns a stable middle primary for a four-step grayscale palette', () => {
    const anchor = resolveAnchor({
      app: 'Unlisted Product',
      palette: ['#000000', '#111111', '#222222', '#ffffff'],
    })
    const block = mobbinSessionBlock(anchor)

    expect(block).toContain(
      'background=#000000, surface=#111111, primary=#222222, body=#ffffff',
    )
  })

  it('uses curated DNA accents when no explicit anchor palette exists', () => {
    const block = mobbinSessionBlock({
      app: 'Reference Product',
      category: null,
      palette: null,
      copyExamples: { headlines: [], subs: [], products: [] },
      dna: { accents: ['#123456', '#abcdef', '#ffffff'] },
    })

    expect(block).toContain('ANCHOR: Reference Product')
    expect(block).toContain('Palette: #123456, #abcdef, #ffffff')
    expect(block).not.toContain('headline shapes')
    expect(block).not.toContain('sub-headline shapes')
    expect(block).not.toContain('product nouns')
  })

  it('bakes typography, layout, copy, doctrine, and anti-pattern constraints', () => {
    const block = mobbinSessionBlock({
      app: 'Reference Product',
      category: 'Software',
      palette: null,
      copyExamples: null,
      dna: {
        display: 'Display Sans',
        body: 'Body Sans',
        mono: 'Mono Code',
        layout: 'Dense product grid',
        copy: 'Precise and direct',
        doctrine: ['Show product evidence'],
        avoid: ['Empty gradient placeholders'],
        composition: 'Hero, proof, features, pricing, footer',
      },
    })

    expect(block).toContain('Display typography: Display Sans')
    expect(block).toContain('Body typography: Body Sans')
    expect(block).toContain('Mono typography: Mono Code')
    expect(block).toContain('Layout signature: Dense product grid')
    expect(block).toContain('Copy register: Precise and direct')
    expect(block).toContain('Required move: Show product evidence')
    expect(block).toContain('Empty gradient placeholders')
    expect(block).toContain('Hero, proof, features, pricing, footer')
  })

  it('includes curated copy only as inspiration and limits examples', () => {
    const block = mobbinSessionBlock({
      app: 'Reference Product',
      category: null,
      palette: null,
      dna: null,
      copyExamples: {
        headlines: ['One', 'Two', 'Three', 'Four'],
        subs: ['Sub one', 'Sub two', 'Sub three'],
        products: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      },
    })

    expect(block).toContain('"One" | "Two" | "Three"')
    expect(block).not.toContain('"Four"')
    expect(block).toContain('"Sub one" | "Sub two"')
    expect(block).not.toContain('"Sub three"')
    expect(block).toContain('A, B, C, D, E, F')
    expect(block).not.toContain('A, B, C, D, E, F, G')
    expect(block).toContain('DO NOT copy verbatim')
  })

  it('keeps the always-on doctrine strict about precompiled colors and real UI', () => {
    const doctrine = mobbinDoctrineBlock()

    expect(doctrine).toContain('hex strings MUST appear')
    expect(doctrine).toContain(
      'Real product surfaces, not gradient placeholders',
    )
    expect(doctrine).toMatch(/not an empty rectangle\s+behind a gradient/)
    expect(doctrine).toContain('9-11 distinct sections')
    expect(doctrine).toContain('anchor is law')
  })
})
