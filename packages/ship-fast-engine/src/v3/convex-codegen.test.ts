import { describe, it, expect } from 'vitest'
import {
  generateConvexSchema,
  generateConvexFunctions,
  generateConvexBackend,
} from './convex-codegen'
import type { LakebedDefinition } from './types'

const mockLakebed: LakebedDefinition = {
  tables: [
    {
      name: 'menuItems',
      fields: {
        name: { type: 'string', default: '', seedFromProps: true },
        description: { type: 'string', default: '', seedFromProps: true },
        price: { type: 'string', default: '', seedFromProps: true },
        tag: { type: 'string', default: '', seedFromProps: true },
      },
    },
    {
      name: 'reservations',
      fields: {
        label: { type: 'string', default: '', seedFromProps: false },
        source: { type: 'string', default: '', seedFromProps: false },
      },
    },
  ],
  queries: [
    {
      name: 'listMenuItems',
      table: 'menuItems',
      body: "ctx.db.menuItems.orderBy('updatedAt','desc').all()",
    },
  ],
  mutations: [
    {
      name: 'syncMenuItems',
      table: 'menuItems',
      body: 'ctx.db.menuItems.upsert({name: args.name}, args)',
    },
    {
      name: 'reserveTable',
      table: 'reservations',
      body: 'ctx.db.reservations.insert(args)',
    },
  ],
}

describe('generateConvexSchema', () => {
  it('generates a valid schema.ts with defineTable for each table', () => {
    const schema = generateConvexSchema(mockLakebed)
    expect(schema).toContain('defineSchema')
    expect(schema).toContain('menuItems: defineTable')
    expect(schema).toContain('reservations: defineTable')
    expect(schema).toContain('v.string()')
    expect(schema).toContain('updatedAt: v.number()')
  })

  it('returns empty string for empty lakebed', () => {
    expect(
      generateConvexSchema({ tables: [], queries: [], mutations: [] }),
    ).toBe('')
  })
})

describe('generateConvexFunctions', () => {
  it('generates query and mutation functions grouped by table', () => {
    const files = generateConvexFunctions(mockLakebed)
    expect(Object.keys(files)).toContain('convex/menuItems.ts')
    expect(Object.keys(files)).toContain('convex/reservations.ts')

    const menuFile = files['convex/menuItems.ts']
    expect(menuFile).toContain('listMenuItems')
    expect(menuFile).toContain('syncMenuItems')
    expect(menuFile).toContain("ctx.db.query('menuItems')")
  })

  it('generates insert mutation for reservations', () => {
    const files = generateConvexFunctions(mockLakebed)
    const resFile = files['convex/reservations.ts']
    expect(resFile).toContain('reserveTable')
    expect(resFile).toContain("ctx.db.insert('reservations'")
  })
})

describe('generateConvexBackend', () => {
  it('generates schema + functions as a complete file map', () => {
    const files = generateConvexBackend(mockLakebed)
    expect(Object.keys(files)).toContain('convex/schema.ts')
    expect(Object.keys(files)).toContain('convex/menuItems.ts')
    expect(Object.keys(files)).toContain('convex/reservations.ts')
  })

  it('includes seed data when provided', () => {
    const seedData = {
      menuItems: [
        {
          name: 'Espresso',
          description: 'Strong coffee',
          price: '4',
          tag: 'Hot',
        },
      ],
    }
    const files = generateConvexBackend(mockLakebed, seedData)
    expect(Object.keys(files)).toContain('convex/seed/seedData.ts')
    const seed = files['convex/seed/seedData.ts']
    expect(seed).toContain('Espresso')
    expect(seed).toContain('seedAll')
  })

  it('skips seed file when no seed data', () => {
    const files = generateConvexBackend(mockLakebed)
    expect(Object.keys(files)).not.toContain('convex/seed/seedData.ts')
  })
})
