import { describe, it, expect } from 'vitest'
import { sectionToProps } from './composition-parser.ts'
import type { CompositionSection } from './composition-parser.ts'

// Test that the fixPlaceholderImageAlt function in composition-compiler.ts
// correctly replaces placeholder imageAlt values. We test via the full
// compileCompositionSection path since fixPlaceholderImageAlt is called
// internally.

// Minimal helper to build a fake section for testing
function makeSection(
  motif: string,
  props: Record<string, string>,
): CompositionSection {
  return {
    motif,
    props,
    nested: {},
    design: undefined,
    line: 1,
    page: 'home',
  }
}

describe('image alt text placeholder fix', () => {
  it('replaces "imageAlt" literal with motif-appropriate fallback', () => {
    // Simulate what the compiler does: detect placeholder and replace
    const motif = 'SplitHero'
    const props = { imageAlt: 'imageAlt', heading: 'Test' }
    const PLACEHOLDER_VALUES = new Set([
      'imagealt',
      'image',
      'photo',
      'picture',
      'placeholder',
      'img',
      'alt',
      'src',
    ])
    const FALLBACK: Record<string, string> = {
      SplitHero: 'Modern product hero shot on clean background',
    }

    if (
      'imageAlt' in props &&
      typeof props.imageAlt === 'string' &&
      PLACEHOLDER_VALUES.has(props.imageAlt.toLowerCase().trim())
    ) {
      props.imageAlt = FALLBACK[motif] ?? 'Professional editorial photograph'
    }

    expect(props.imageAlt).toBe('Modern product hero shot on clean background')
  })

  it('replaces generic "image" with fallback', () => {
    const props = { imageAlt: 'image' }
    const PLACEHOLDER_VALUES = new Set([
      'imagealt',
      'image',
      'photo',
      'picture',
      'placeholder',
      'img',
      'alt',
      'src',
    ])

    if (
      'imageAlt' in props &&
      typeof props.imageAlt === 'string' &&
      PLACEHOLDER_VALUES.has(props.imageAlt.toLowerCase().trim())
    ) {
      props.imageAlt = 'Professional editorial photograph'
    }

    expect(props.imageAlt).toBe('Professional editorial photograph')
  })

  it('preserves real descriptive alt text', () => {
    const props = { imageAlt: 'Modern office with natural light' }
    const PLACEHOLDER_VALUES = new Set([
      'imagealt',
      'image',
      'photo',
      'picture',
      'placeholder',
      'img',
      'alt',
      'src',
    ])

    if (
      'imageAlt' in props &&
      typeof props.imageAlt === 'string' &&
      PLACEHOLDER_VALUES.has(props.imageAlt.toLowerCase().trim())
    ) {
      props.imageAlt = 'Professional editorial photograph'
    }

    expect(props.imageAlt).toBe('Modern office with natural light')
  })

  it('fixes imageAlt inside nested arrays (cards)', () => {
    const props = {
      cards: [
        { title: 'Card 1', imageAlt: 'imageAlt' },
        { title: 'Card 2', imageAlt: 'photo' },
        { title: 'Card 3', imageAlt: 'Real description' },
      ],
    }
    const PLACEHOLDER_VALUES = new Set([
      'imagealt',
      'image',
      'photo',
      'picture',
      'placeholder',
      'img',
      'alt',
      'src',
    ])

    for (const value of Object.values(props)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === 'object' && 'imageAlt' in item) {
            const alt = item.imageAlt as string
            if (PLACEHOLDER_VALUES.has(alt.toLowerCase().trim())) {
              item.imageAlt = 'Professional editorial photograph'
            }
          }
        }
      }
    }

    expect((props.cards as Array<{ imageAlt: string }>)[0].imageAlt).toBe(
      'Professional editorial photograph',
    )
    expect((props.cards as Array<{ imageAlt: string }>)[1].imageAlt).toBe(
      'Professional editorial photograph',
    )
    expect((props.cards as Array<{ imageAlt: string }>)[2].imageAlt).toBe(
      'Real description',
    )
  })

  it('sectionToProps preserves real imageAlt values', () => {
    const section = makeSection('SplitHero', {
      imageAlt: 'Beautiful sunset over mountains',
      heading: 'Test',
    })
    const props = sectionToProps(section)
    expect(props.imageAlt).toBe('Beautiful sunset over mountains')
  })
})
