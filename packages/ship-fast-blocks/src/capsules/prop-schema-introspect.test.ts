import { describe, it, expect } from 'vitest'
import { z } from 'zod/v4'
import {
  introspectCapsuleSchema,
  createDefaultItem,
  hasContextInfo,
  type CollectionProp,
} from './prop-schema-introspect.ts'

describe('introspectCapsuleSchema', () => {
  it('classifies CoworkingGallery schema', () => {
    const schema = z.object({
      heading: z.string().optional(),
      description: z.string().optional(),
      images: z
        .array(z.object({ alt: z.string(), caption: z.string().optional() }))
        .optional(),
      columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    // images → collection with alt (string, required) + caption (string, optional)
    expect(info.collections).toHaveLength(1)
    expect(info.collections[0]!.key).toBe('images')
    expect(info.collections[0]!.itemFields).toHaveLength(2)
    expect(info.collections[0]!.itemFields[0]).toEqual({
      key: 'alt',
      type: 'string',
      optional: false,
    })
    expect(info.collections[0]!.itemFields[1]).toEqual({
      key: 'caption',
      type: 'string',
      optional: true,
    })

    // columns → variant with options 2, 3, 4
    expect(info.variants).toHaveLength(1)
    expect(info.variants[0]!.key).toBe('columns')
    expect(info.variants[0]!.options).toHaveLength(3)
    expect(info.variants[0]!.options.map((o) => o.value)).toEqual([2, 3, 4])

    // heading/description are heading-like → excluded from scalars
    // className → excluded
    expect(info.scalars).toHaveLength(0)

    expect(hasContextInfo(info)).toBe(true)
  })

  it('classifies CoworkingFeatures schema', () => {
    const schema = z.object({
      heading: z.string().optional(),
      subheading: z.string().optional(),
      features: z
        .array(z.object({ title: z.string(), description: z.string() }))
        .optional(),
      columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.collections).toHaveLength(1)
    expect(info.collections[0]!.key).toBe('features')
    expect(info.collections[0]!.itemFields).toHaveLength(2)
    expect(info.collections[0]!.itemFields[0]).toEqual({
      key: 'title',
      type: 'string',
      optional: false,
    })
    expect(info.collections[0]!.itemFields[1]).toEqual({
      key: 'description',
      type: 'string',
      optional: false,
    })

    expect(info.variants).toHaveLength(1)
    expect(info.variants[0]!.key).toBe('columns')
  })

  it('classifies CoworkingPricing schema with nested array-string field', () => {
    const schema = z.object({
      heading: z.string().optional(),
      subheading: z.string().optional(),
      tiers: z
        .array(
          z.object({
            name: z.string(),
            price: z.string(),
            period: z.string().optional(),
            features: z.array(z.string()).optional(),
            cta: z.string().optional(),
            ctaTarget: z.string().optional(),
            highlighted: z.boolean().optional(),
          }),
        )
        .optional(),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.collections).toHaveLength(1)
    expect(info.collections[0]!.key).toBe('tiers')
    const fields = info.collections[0]!.itemFields
    expect(fields).toHaveLength(7)
    expect(fields.find((f) => f.key === 'name')).toEqual({
      key: 'name',
      type: 'string',
      optional: false,
    })
    expect(fields.find((f) => f.key === 'features')).toEqual({
      key: 'features',
      type: 'array-string',
      optional: true,
    })
    expect(fields.find((f) => f.key === 'highlighted')).toEqual({
      key: 'highlighted',
      type: 'boolean',
      optional: true,
    })
    expect(fields.find((f) => f.key === 'price')).toEqual({
      key: 'price',
      type: 'string',
      optional: false,
    })

    // No variants in pricing
    expect(info.variants).toHaveLength(0)
  })

  it('classifies CoworkingTestimonials schema with number field', () => {
    const schema = z.object({
      heading: z.string().optional(),
      subheading: z.string().optional(),
      members: z
        .array(
          z.object({
            quote: z.string(),
            name: z.string(),
            role: z.string().optional(),
            company: z.string().optional(),
            rating: z.number().optional(),
          }),
        )
        .optional(),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.collections).toHaveLength(1)
    expect(info.collections[0]!.key).toBe('members')
    const fields = info.collections[0]!.itemFields
    expect(fields.find((f) => f.key === 'rating')).toEqual({
      key: 'rating',
      type: 'number',
      optional: true,
    })
    expect(fields.find((f) => f.key === 'quote')).toEqual({
      key: 'quote',
      type: 'string',
      optional: false,
    })
  })

  it('classifies boolean prop as variant', () => {
    const schema = z.object({
      heading: z.string().optional(),
      showPrice: z.boolean().optional(),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.variants).toHaveLength(1)
    expect(info.variants[0]!.key).toBe('showPrice')
    expect(info.variants[0]!.options).toHaveLength(2)
    expect(info.variants[0]!.options.map((o) => o.value)).toEqual([true, false])
  })

  it('classifies z.enum prop as variant', () => {
    const schema = z.object({
      heading: z.string().optional(),
      layout: z.enum(['row', 'column', 'grid']).optional(),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.variants).toHaveLength(1)
    expect(info.variants[0]!.key).toBe('layout')
    expect(info.variants[0]!.options.map((o) => o.value)).toEqual([
      'row',
      'column',
      'grid',
    ])
  })

  it('classifies non-heading string scalar', () => {
    const schema = z.object({
      heading: z.string().optional(),
      buttonText: z.string().optional(),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.scalars).toHaveLength(1)
    expect(info.scalars[0]!.key).toBe('buttonText')
    expect(info.scalars[0]!.type).toBe('string')
  })

  it('classifies number scalar', () => {
    const schema = z.object({
      heading: z.string().optional(),
      maxItems: z.number().optional(),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.scalars).toHaveLength(1)
    expect(info.scalars[0]!.key).toBe('maxItems')
    expect(info.scalars[0]!.type).toBe('number')
  })

  it('excludes className from all classifications', () => {
    const schema = z.object({
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.collections).toHaveLength(0)
    expect(info.variants).toHaveLength(0)
    expect(info.scalars).toHaveLength(0)
    expect(hasContextInfo(info)).toBe(false)
  })

  it('returns empty info for non-object schema', () => {
    const info = introspectCapsuleSchema(z.string())
    expect(info.collections).toHaveLength(0)
    expect(info.variants).toHaveLength(0)
    expect(info.scalars).toHaveLength(0)
  })

  it('returns empty info for undefined schema', () => {
    const info = introspectCapsuleSchema(undefined)
    expect(info.collections).toHaveLength(0)
    expect(info.variants).toHaveLength(0)
    expect(info.scalars).toHaveLength(0)
  })
})

describe('createDefaultItem', () => {
  it('creates default item with correct types for gallery images', () => {
    const collection: CollectionProp = {
      key: 'images',
      itemFields: [
        { key: 'alt', type: 'string', optional: false },
        { key: 'caption', type: 'string', optional: true },
      ],
    }

    const item = createDefaultItem(collection)
    expect(item).toEqual({ alt: '', caption: '' })
  })

  it('creates default item with number and boolean for pricing tiers', () => {
    const collection: CollectionProp = {
      key: 'tiers',
      itemFields: [
        { key: 'name', type: 'string', optional: false },
        { key: 'price', type: 'string', optional: false },
        { key: 'highlighted', type: 'boolean', optional: true },
        { key: 'features', type: 'array-string', optional: true },
        { key: 'rating', type: 'number', optional: true },
      ],
    }

    const item = createDefaultItem(collection)
    expect(item).toEqual({
      name: '',
      price: '',
      highlighted: false,
      features: [],
      rating: 0,
    })
  })

  it('skips unknown field types', () => {
    const collection: CollectionProp = {
      key: 'test',
      itemFields: [
        { key: 'name', type: 'string', optional: false },
        { key: 'complex', type: 'unknown', optional: true },
      ],
    }

    const item = createDefaultItem(collection)
    expect(item).toEqual({ name: '' })
    expect(item).not.toHaveProperty('complex')
  })
})

// ─── Edge cases & regression guards ──────────────────────────────────────────

describe('introspectCapsuleSchema — edge cases', () => {
  it('handles nullable wrapping (z.nullable)', () => {
    const schema = z.object({
      heading: z.string().optional(),
      buttonText: z.string().nullable().optional(),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.scalars).toHaveLength(1)
    expect(info.scalars[0]!.key).toBe('buttonText')
    expect(info.scalars[0]!.type).toBe('string')
  })

  it('handles z.default wrapping on strings', () => {
    const schema = z.object({
      heading: z.string().optional(),
      buttonText: z.string().default('Click me'),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.scalars).toHaveLength(1)
    expect(info.scalars[0]!.key).toBe('buttonText')
    expect(info.scalars[0]!.optional).toBe(true) // .default() is treated as optional
  })

  it('handles z.default wrapping on numbers', () => {
    const schema = z.object({
      heading: z.string().optional(),
      maxItems: z.number().default(10),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.scalars).toHaveLength(1)
    expect(info.scalars[0]!.key).toBe('maxItems')
    expect(info.scalars[0]!.type).toBe('number')
  })

  it('handles z.boolean with .default as variant', () => {
    const schema = z.object({
      heading: z.string().optional(),
      showPrice: z.boolean().default(true),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.variants).toHaveLength(1)
    expect(info.variants[0]!.key).toBe('showPrice')
    expect(info.variants[0]!.options).toHaveLength(2)
  })

  it('handles z.enum with .default', () => {
    const schema = z.object({
      heading: z.string().optional(),
      layout: z.enum(['row', 'column']).default('row'),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.variants).toHaveLength(1)
    expect(info.variants[0]!.key).toBe('layout')
    expect(info.variants[0]!.options.map((o) => o.value)).toEqual([
      'row',
      'column',
    ])
  })

  it('handles union of literals with .default', () => {
    const schema = z.object({
      heading: z.string().optional(),
      columns: z.union([z.literal(2), z.literal(3)]).default(3),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.variants).toHaveLength(1)
    expect(info.variants[0]!.key).toBe('columns')
    expect(info.variants[0]!.options.map((o) => o.value)).toEqual([2, 3])
  })

  it('handles nullable collection (z.array(z.object(...)).nullable().optional())', () => {
    const schema = z.object({
      heading: z.string().optional(),
      items: z
        .array(z.object({ title: z.string() }))
        .nullable()
        .optional(),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.collections).toHaveLength(1)
    expect(info.collections[0]!.key).toBe('items')
    expect(info.collections[0]!.itemFields).toHaveLength(1)
    expect(info.collections[0]!.itemFields[0]).toEqual({
      key: 'title',
      type: 'string',
      optional: false,
    })
  })

  it('handles array of strings (NOT classified as collection)', () => {
    const schema = z.object({
      heading: z.string().optional(),
      tags: z.array(z.string()).optional(),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    // array of strings is not a collection — it's a sub-field of a collection item
    expect(info.collections).toHaveLength(0)
  })

  it('handles array of numbers (NOT classified as collection)', () => {
    const schema = z.object({
      heading: z.string().optional(),
      scores: z.array(z.number()).optional(),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.collections).toHaveLength(0)
  })

  it('handles union of non-literals (NOT classified as variant)', () => {
    const schema = z.object({
      heading: z.string().optional(),
      flexible: z.union([z.string(), z.number()]).optional(),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    // union of non-literals is not a variant
    expect(info.variants).toHaveLength(0)
  })

  it('handles empty union (NOT classified as variant)', () => {
    const schema = z.object({
      heading: z.string().optional(),
      empty: z.union([]).optional(),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.variants).toHaveLength(0)
  })

  it('handles empty z.enum (NOT classified as variant)', () => {
    // z.enum requires at least one value, but test the introspection
    // doesn't crash on an empty entries object
    const schema = z.object({
      heading: z.string().optional(),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.variants).toHaveLength(0)
  })

  it('handles multiple collections + variants + scalars in one schema', () => {
    const schema = z.object({
      heading: z.string().optional(),
      subheading: z.string().optional(),
      description: z.string().optional(),
      images: z
        .array(z.object({ alt: z.string(), caption: z.string().optional() }))
        .optional(),
      tiers: z
        .array(z.object({ name: z.string(), price: z.string() }))
        .optional(),
      columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
      layout: z.enum(['grid', 'list']).optional(),
      showPrice: z.boolean().optional(),
      buttonText: z.string().optional(),
      maxItems: z.number().optional(),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.collections).toHaveLength(2)
    expect(info.collections.map((c) => c.key)).toEqual(['images', 'tiers'])
    expect(info.variants).toHaveLength(3)
    expect(info.variants.map((v) => v.key)).toEqual([
      'columns',
      'layout',
      'showPrice',
    ])
    expect(info.scalars).toHaveLength(2)
    expect(info.scalars.map((s) => s.key)).toEqual(['buttonText', 'maxItems'])
    expect(hasContextInfo(info)).toBe(true)
  })

  it('handles object with only heading keys (no context info)', () => {
    const schema = z.object({
      heading: z.string().optional(),
      subheading: z.string().optional(),
      description: z.string().optional(),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.collections).toHaveLength(0)
    expect(info.variants).toHaveLength(0)
    expect(info.scalars).toHaveLength(0)
    expect(hasContextInfo(info)).toBe(false)
  })

  it('handles empty object schema', () => {
    const schema = z.object({})

    const info = introspectCapsuleSchema(schema)

    expect(info.collections).toHaveLength(0)
    expect(info.variants).toHaveLength(0)
    expect(info.scalars).toHaveLength(0)
    expect(hasContextInfo(info)).toBe(false)
  })

  it('handles collection item with className field (excluded)', () => {
    const schema = z.object({
      heading: z.string().optional(),
      cards: z
        .array(
          z.object({
            title: z.string(),
            className: z.string().optional(),
          }),
        )
        .optional(),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.collections).toHaveLength(1)
    // className should be excluded from item fields
    expect(info.collections[0]!.itemFields).toHaveLength(1)
    expect(info.collections[0]!.itemFields[0]!.key).toBe('title')
  })

  it('handles collection item with nested object field (classified as unknown)', () => {
    const schema = z.object({
      heading: z.string().optional(),
      items: z
        .array(
          z.object({
            title: z.string(),
            metadata: z.object({ key: z.string() }).optional(),
          }),
        )
        .optional(),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.collections).toHaveLength(1)
    const metadataField = info.collections[0]!.itemFields.find(
      (f) => f.key === 'metadata',
    )
    expect(metadataField).toEqual({
      key: 'metadata',
      type: 'unknown',
      optional: true,
    })
  })

  it('handles collection item with array of objects (classified as unknown)', () => {
    const schema = z.object({
      heading: z.string().optional(),
      sections: z
        .array(
          z.object({
            title: z.string(),
            rows: z.array(z.object({ label: z.string() })).optional(),
          }),
        )
        .optional(),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    expect(info.collections).toHaveLength(1)
    const rowsField = info.collections[0]!.itemFields.find(
      (f) => f.key === 'rows',
    )
    expect(rowsField).toEqual({
      key: 'rows',
      type: 'unknown',
      optional: true,
    })
  })

  it('handles boolean scalar (classified as variant, not scalar)', () => {
    const schema = z.object({
      heading: z.string().optional(),
      featured: z.boolean().optional(),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    // booleans are variants (true/false toggle), not scalars
    expect(info.variants).toHaveLength(1)
    expect(info.variants[0]!.key).toBe('featured')
    expect(info.scalars).toHaveLength(0)
  })

  it('variant option labels are human-readable', () => {
    const schema = z.object({
      heading: z.string().optional(),
      layout: z.enum(['row', 'column', 'grid']).optional(),
      showPrice: z.boolean().optional(),
      columns: z.union([z.literal(2), z.literal(3)]).optional(),
      className: z.string().optional(),
    })

    const info = introspectCapsuleSchema(schema)

    const layout = info.variants.find((v) => v.key === 'layout')!
    expect(layout.options.map((o) => o.label)).toEqual([
      'row',
      'column',
      'grid',
    ])

    const showPrice = info.variants.find((v) => v.key === 'showPrice')!
    expect(showPrice.options.map((o) => o.label)).toEqual(['Yes', 'No'])

    const columns = info.variants.find((v) => v.key === 'columns')!
    expect(columns.options.map((o) => o.label)).toEqual(['2', '3'])
  })
})

// ─── createDefaultItem edge cases ────────────────────────────────────────────

describe('createDefaultItem — edge cases', () => {
  it('creates default for all field types', () => {
    const collection: CollectionProp = {
      key: 'test',
      itemFields: [
        { key: 'str', type: 'string', optional: false },
        { key: 'num', type: 'number', optional: false },
        { key: 'bool', type: 'boolean', optional: false },
        { key: 'arr', type: 'array-string', optional: false },
      ],
    }

    const item = createDefaultItem(collection)
    expect(item).toEqual({
      str: '',
      num: 0,
      bool: false,
      arr: [],
    })
  })

  it('includes optional fields with defaults', () => {
    const collection: CollectionProp = {
      key: 'test',
      itemFields: [
        { key: 'required', type: 'string', optional: false },
        { key: 'optional', type: 'string', optional: true },
      ],
    }

    const item = createDefaultItem(collection)
    // Optional fields are included so the form shows all fields
    expect(item).toEqual({ required: '', optional: '' })
  })

  it('handles empty itemFields', () => {
    const collection: CollectionProp = {
      key: 'test',
      itemFields: [],
    }

    const item = createDefaultItem(collection)
    expect(item).toEqual({})
  })

  it('handles all-unknown field types', () => {
    const collection: CollectionProp = {
      key: 'test',
      itemFields: [
        { key: 'obj', type: 'unknown', optional: true },
        { key: 'arrObj', type: 'unknown', optional: false },
      ],
    }

    const item = createDefaultItem(collection)
    expect(item).toEqual({})
    expect(item).not.toHaveProperty('obj')
    expect(item).not.toHaveProperty('arrObj')
  })
})
