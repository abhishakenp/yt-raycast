// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { matchElementToProp, buildPropPatch } from './prop-text-matcher'
import type { CapsulePropContext } from './prop-text-matcher'

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeEl(text: string, tag = 'p'): HTMLElement {
  const el = document.createElement(tag)
  el.textContent = text
  return el
}

function scalarContext(
  propKey: string,
  capsuleName = 'TestCapsule',
  statementId = 'home_test',
): CapsulePropContext {
  return {
    lakebedKey: `${capsuleName}:${statementId}`,
    capsuleName,
    statementId,
    propKey,
    kind: 'scalar',
  }
}

function collectionContext(
  propKey: string,
  index: number,
  fieldKey: string,
  capsuleName = 'TestCapsule',
  statementId = 'home_test',
): CapsulePropContext {
  return {
    lakebedKey: `${capsuleName}:${statementId}`,
    capsuleName,
    statementId,
    propKey,
    index,
    fieldKey,
    kind: 'collection',
  }
}

// ─── matchElementToProp ─────────────────────────────────────────────────────

describe('matchElementToProp', () => {
  describe('scalar matching', () => {
    it('matches a scalar string prop by exact text', () => {
      const el = makeEl('Hello World')
      const result = matchElementToProp(el, 'CoworkingHero', 'home_hero', {
        heading: 'Hello World',
      })
      expect(result).toEqual(
        scalarContext('heading', 'CoworkingHero', 'home_hero'),
      )
    })

    it('matches heading-like props (excluded from schema scalars but valid edit targets)', () => {
      const el = makeEl('Flexible Membership Plans')
      const result = matchElementToProp(
        el,
        'CoworkingPricing',
        'home_pricing',
        { heading: 'Flexible Membership Plans' },
      )
      expect(result).toEqual(
        scalarContext('heading', 'CoworkingPricing', 'home_pricing'),
      )
    })

    it('matches subheading prop', () => {
      const el = makeEl('Choose the perfect plan for your team')
      const result = matchElementToProp(
        el,
        'CoworkingPricing',
        'home_pricing',
        { subheading: 'Choose the perfect plan for your team' },
      )
      expect(result).toEqual(
        scalarContext('subheading', 'CoworkingPricing', 'home_pricing'),
      )
    })

    it('normalizes whitespace before matching', () => {
      const el = makeEl('  Hello   World  ')
      const result = matchElementToProp(el, 'CoworkingHero', 'home_hero', {
        heading: 'Hello World',
      })
      expect(result).toEqual(
        scalarContext('heading', 'CoworkingHero', 'home_hero'),
      )
    })

    it('returns null when no prop matches', () => {
      const el = makeEl('Nonexistent text')
      const result = matchElementToProp(el, 'CoworkingHero', 'home_hero', {
        heading: 'Different text',
      })
      expect(result).toBeNull()
    })

    it('returns null for empty element text', () => {
      const el = makeEl('')
      const result = matchElementToProp(el, 'CoworkingHero', 'home_hero', {
        heading: 'Hello',
      })
      expect(result).toBeNull()
    })

    it('skips reserved/infrastructure keys', () => {
      const el = makeEl('some-class')
      const result = matchElementToProp(el, 'CoworkingHero', 'home_hero', {
        className: 'some-class',
        shipFastGeneratedProps: {},
        heading: 'Hello',
      })
      expect(result).toBeNull()
    })

    it('skips non-string prop values', () => {
      const el = makeEl('42')
      const result = matchElementToProp(el, 'CoworkingHero', 'home_hero', {
        columns: 42,
        heading: 'Hello',
      })
      expect(result).toBeNull()
    })

    it('skips empty string prop values', () => {
      const el = makeEl('')
      const result = matchElementToProp(el, 'CoworkingHero', 'home_hero', {
        heading: '',
        eyebrow: 'Premium',
      })
      expect(result).toBeNull()
    })

    it('matches the first prop when multiple have the same value', () => {
      const el = makeEl('Same Text')
      const result = matchElementToProp(el, 'CoworkingHero', 'home_hero', {
        heading: 'Same Text',
        subheading: 'Same Text',
      })
      // heading comes first in object iteration order
      expect(result?.propKey).toBe('heading')
    })

    it('matches CTA label props', () => {
      const el = makeEl('Explore Plans')
      const result = matchElementToProp(el, 'CoworkingHero', 'home_hero', {
        primaryCta: 'Explore Plans',
      })
      expect(result).toEqual(
        scalarContext('primaryCta', 'CoworkingHero', 'home_hero'),
      )
    })
  })

  describe('collection matching', () => {
    it('matches a collection item field by exact text', () => {
      const el = makeEl('Private Offices')
      const result = matchElementToProp(
        el,
        'CoworkingFeatures',
        'home_features',
        {
          features: [
            { title: 'Private Offices', description: 'Lockable rooms' },
            { title: 'Hot Desks', description: 'Pick any desk' },
          ],
        },
      )
      expect(result).toEqual(
        collectionContext(
          'features',
          0,
          'title',
          'CoworkingFeatures',
          'home_features',
        ),
      )
    })

    it('matches the correct item index', () => {
      const el = makeEl('Hot Desks')
      const result = matchElementToProp(
        el,
        'CoworkingFeatures',
        'home_features',
        {
          features: [
            { title: 'Private Offices', description: 'Lockable rooms' },
            { title: 'Hot Desks', description: 'Pick any desk' },
          ],
        },
      )
      expect(result).toEqual(
        collectionContext(
          'features',
          1,
          'title',
          'CoworkingFeatures',
          'home_features',
        ),
      )
    })

    it('matches a description field within a collection item', () => {
      const el = makeEl('Lockable rooms')
      const result = matchElementToProp(
        el,
        'CoworkingFeatures',
        'home_features',
        {
          features: [
            { title: 'Private Offices', description: 'Lockable rooms' },
          ],
        },
      )
      expect(result).toEqual(
        collectionContext(
          'features',
          0,
          'description',
          'CoworkingFeatures',
          'home_features',
        ),
      )
    })

    it('matches pricing tier name field', () => {
      const el = makeEl('Hot Desk')
      const result = matchElementToProp(
        el,
        'CoworkingPricing',
        'home_pricing',
        {
          tiers: [
            { name: 'Hot Desk', price: '$199', period: 'month' },
            { name: 'Dedicated Desk', price: '$399', period: 'month' },
          ],
        },
      )
      expect(result).toEqual(
        collectionContext(
          'tiers',
          0,
          'name',
          'CoworkingPricing',
          'home_pricing',
        ),
      )
    })

    it('matches pricing tier price field', () => {
      const el = makeEl('$199')
      const result = matchElementToProp(
        el,
        'CoworkingPricing',
        'home_pricing',
        {
          tiers: [{ name: 'Hot Desk', price: '$199', period: 'month' }],
        },
      )
      expect(result).toEqual(
        collectionContext(
          'tiers',
          0,
          'price',
          'CoworkingPricing',
          'home_pricing',
        ),
      )
    })

    it('returns null when collection is not an array', () => {
      const el = makeEl('Test')
      const result = matchElementToProp(
        el,
        'CoworkingFeatures',
        'home_features',
        {
          features: 'not an array',
        },
      )
      expect(result).toBeNull()
    })

    it('returns null when collection items are not objects', () => {
      const el = makeEl('Test')
      const result = matchElementToProp(
        el,
        'CoworkingFeatures',
        'home_features',
        {
          features: ['string item', 42],
        },
      )
      expect(result).toBeNull()
    })

    it('returns null when no field value matches', () => {
      const el = makeEl('Nonexistent')
      const result = matchElementToProp(
        el,
        'CoworkingFeatures',
        'home_features',
        {
          features: [
            { title: 'Private Offices', description: 'Lockable rooms' },
          ],
        },
      )
      expect(result).toBeNull()
    })
  })

  describe('priority: scalar vs collection', () => {
    it('checks scalar props before collection fields', () => {
      const el = makeEl('Shared Text')
      const result = matchElementToProp(el, 'CoworkingHero', 'home_hero', {
        heading: 'Shared Text',
        features: [{ title: 'Shared Text' }],
      })
      // Scalar match takes priority
      expect(result?.kind).toBe('scalar')
      expect(result?.propKey).toBe('heading')
    })
  })

  describe('edge cases', () => {
    it('handles whitespace-only text content', () => {
      const el = makeEl('   ')
      const result = matchElementToProp(el, 'CoworkingHero', 'home_hero', {
        heading: 'Hello',
      })
      expect(result).toBeNull()
    })

    it('handles null textContent', () => {
      const el = document.createElement('div')
      // No text content
      const result = matchElementToProp(el, 'CoworkingHero', 'home_hero', {
        heading: 'Hello',
      })
      expect(result).toBeNull()
    })

    it('handles empty mergedProps', () => {
      const el = makeEl('Hello')
      const result = matchElementToProp(el, 'CoworkingHero', 'home_hero', {})
      expect(result).toBeNull()
    })
  })
})

// ─── buildPropPatch ─────────────────────────────────────────────────────────

describe('buildPropPatch', () => {
  describe('scalar patches', () => {
    it('builds a simple scalar patch', () => {
      const ctx = scalarContext('heading')
      const patch = buildPropPatch(ctx, 'New Heading', {
        heading: 'Old Heading',
      })
      expect(patch).toEqual({ heading: 'New Heading' })
    })

    it('builds a scalar patch for CTA labels', () => {
      const ctx = scalarContext('primaryCta')
      const patch = buildPropPatch(ctx, 'Get Started', {
        primaryCta: 'Join Now',
      })
      expect(patch).toEqual({ primaryCta: 'Get Started' })
    })
  })

  describe('collection patches', () => {
    it('patches a single field in a collection item', () => {
      const ctx = collectionContext('features', 1, 'title')
      const currentData = {
        features: [
          { title: 'Private Offices', description: 'Lockable rooms' },
          { title: 'Hot Desks', description: 'Pick any desk' },
        ],
      }
      const patch = buildPropPatch(ctx, 'Shared Desks', currentData)
      expect(patch).toEqual({
        features: [
          { title: 'Private Offices', description: 'Lockable rooms' },
          { title: 'Shared Desks', description: 'Pick any desk' },
        ],
      })
    })

    it('preserves other fields in the patched item', () => {
      const ctx = collectionContext('tiers', 0, 'price')
      const currentData = {
        tiers: [
          {
            name: 'Hot Desk',
            price: '$199',
            period: 'month',
            highlighted: false,
          },
        ],
      }
      const patch = buildPropPatch(ctx, '$299', currentData)
      expect(patch).toEqual({
        tiers: [
          {
            name: 'Hot Desk',
            price: '$299',
            period: 'month',
            highlighted: false,
          },
        ],
      })
    })

    it('preserves other items in the collection', () => {
      const ctx = collectionContext('tiers', 1, 'name')
      const currentData = {
        tiers: [
          { name: 'Hot Desk', price: '$199' },
          { name: 'Dedicated Desk', price: '$399' },
          { name: 'Private Office', price: '$599' },
        ],
      }
      const patch = buildPropPatch(ctx, 'Dedicated Desk Pro', currentData)
      expect(patch).toEqual({
        tiers: [
          { name: 'Hot Desk', price: '$199' },
          { name: 'Dedicated Desk Pro', price: '$399' },
          { name: 'Private Office', price: '$599' },
        ],
      })
    })

    it('returns empty patch when collection is not an array', () => {
      const ctx = collectionContext('features', 0, 'title')
      const patch = buildPropPatch(ctx, 'New', { features: 'not array' })
      expect(patch).toEqual({})
    })

    it('returns empty patch when index is missing', () => {
      const ctx = scalarContext('heading') as CapsulePropContext
      ctx.kind = 'collection'
      // index and fieldKey are undefined
      const patch = buildPropPatch(ctx, 'New', { heading: 'Old' })
      expect(patch).toEqual({})
    })
  })
})
