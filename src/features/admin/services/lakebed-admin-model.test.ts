import { describe, expect, it } from 'vitest'

import {
  canAddRowsToTable,
  createLakebedAdminTables,
  parseAdminValue,
  previewAdminValue,
} from './lakebed-admin-model'
import type {
  CapsuleSchemaRegistry,
  LakebedAdminTable,
} from './lakebed-admin-model'

// --- Schema fixtures matching the runtime shape of Lakebed's TableDefinition ---
// Schemas are keyed by dataKey (e.g. 'Restaurant'), NOT component name.
// Section prop docs (e.g. 'RestaurantStory:story_story') must NOT match.

const str = () => ({ kind: 'string' as const })
const num = () => ({ kind: 'number' as const })
const bool = () => ({ kind: 'boolean' as const })

const restaurantSchema: CapsuleSchemaRegistry = {
  Restaurant: {
    catalog: {
      kind: 'table',
      fields: {
        category: str(),
        description: str(),
        name: str(),
        price: str(),
        tag: str(),
      },
      seedFromProps: false,
    },
    orderItems: {
      kind: 'table',
      fields: {
        category: str(),
        description: str(),
        name: str(),
        price: str(),
        quantity: num(),
        tag: str(),
      },
      seedFromProps: false,
    },
    reservations: {
      kind: 'table',
      fields: { label: str(), source: str() },
      seedFromProps: false,
    },
  },
}

const publicationSchema: CapsuleSchemaRegistry = {
  PublicationWorkspace: {
    articles: {
      kind: 'table',
      fields: {
        author: str(),
        category: str(),
        date: str(),
        excerpt: str(),
        target: str(),
        title: str(),
      },
    },
    subscribers: {
      kind: 'table',
      fields: { email: str(), source: str() },
      seedFromProps: false,
    },
  },
}

const expectTable = (
  table: LakebedAdminTable | undefined,
): LakebedAdminTable => {
  expect(table).toBeDefined()
  if (!table) throw new Error('Expected admin table to be defined')
  return table
}

describe('lakebed admin model', () => {
  it('produces no tables for docs without a matching dataKey schema', () => {
    const tables = createLakebedAdminTables([
      {
        capsule: 'Store',
        createdAt: 1,
        updatedAt: 2,
        data: {
          products: [
            { id: 'p1', name: 'Desk', price: 120 },
            { id: 'p2', name: 'Lamp', featured: true },
          ],
        },
      },
    ])
    expect(tables).toHaveLength(0)
  })

  it('produces no tables for section-capsule prop docs', () => {
    const tables = createLakebedAdminTables([
      {
        capsule: 'RestaurantStory:story_story',
        createdAt: 1,
        updatedAt: 2,
        data: {
          heading: 'Our Story',
          body: 'Started in a garage',
          alt: [{ title: 'Award', description: 'Gold medal' }],
        },
      },
    ])
    expect(tables).toHaveLength(0)
  })

  it('filters structural chrome docs out of the admin table list', () => {
    const tables = createLakebedAdminTables(
      [
        {
          capsule: 'RestaurantNavbar:home_navbar',
          createdAt: 1,
          updatedAt: 2,
          data: {
            brand: 'Restaurant',
            linkColumns: [{ title: 'Menu', links: ['Items'] }],
          },
        },
        {
          capsule: 'Restaurant',
          createdAt: 1,
          updatedAt: 2,
          data: {
            catalog: [{ name: 'Ramen' }],
          },
        },
      ],
      restaurantSchema,
    )

    // All schema tables appear from the Restaurant dataKey doc
    expect(tables.map((table) => table.name).sort()).toEqual([
      'catalog',
      'orderItems',
      'reservations',
    ])
    // Navbar chrome doc produces no tables
    expect(tables.map((table) => table.capsule)).not.toContain(
      'RestaurantNavbar:home_navbar',
    )
  })

  it('keeps valid schema docs editable when a generated doc has malformed data', () => {
    const tables = createLakebedAdminTables(
      [
        {
          capsule: 'BrokenProducts:home_products',
          createdAt: 1,
          updatedAt: 2,
          data: undefined,
        },
        {
          capsule: 'Restaurant',
          createdAt: 1,
          updatedAt: 3,
          data: {
            catalog: [{ name: 'Ramen' }],
          },
        },
      ] as never,
      restaurantSchema,
    )

    const catalog = expectTable(
      tables.find((table) => table.name === 'catalog'),
    )
    expect(catalog.rows).toHaveLength(1)
    expect(catalog.rows[0].cells).toMatchObject({
      name: 'Ramen',
    })
  })

  it('only allows adding rows to a single-source collection table', () => {
    const [mergedCatalog] = createLakebedAdminTables(
      [
        {
          capsule: 'Restaurant:home',
          createdAt: 1,
          updatedAt: 2,
          data: { catalog: [{ name: 'Ramen' }] },
        },
        {
          capsule: 'Restaurant:menu',
          createdAt: 1,
          updatedAt: 2,
          data: { catalog: [{ name: 'Gyoza' }] },
        },
      ],
      restaurantSchema,
    )
    const [singleCatalog] = createLakebedAdminTables(
      [
        {
          capsule: 'Restaurant',
          createdAt: 1,
          updatedAt: 2,
          data: { catalog: [{ name: 'Ramen' }] },
        },
      ],
      restaurantSchema,
    )

    expect(canAddRowsToTable(expectTable(mergedCatalog))).toBe(false)
    expect(canAddRowsToTable(expectTable(singleCatalog))).toBe(true)
  })

  it('formats primitive cells without hiding values behind object syntax', () => {
    expect(previewAdminValue('hello')).toBe('hello')
    expect(previewAdminValue(12)).toBe('12')
    expect(previewAdminValue(null)).toBe('null')
  })

  it('parses inline editor values with Convex-like primitive handling', () => {
    expect(parseAdminValue('3')).toBe(3)
    expect(parseAdminValue('true')).toBe(true)
    expect(parseAdminValue('raw text')).toBe('raw text')
  })
})

describe('schema-aware admin table creation', () => {
  it('creates empty tables from capsule schema even when sessionData has no rows', () => {
    const tables = createLakebedAdminTables(
      [
        {
          capsule: 'Restaurant',
          createdAt: 1,
          updatedAt: 2,
          data: {},
        },
      ],
      restaurantSchema,
    )

    const tableNames = tables.map((t) => t.name).sort()
    expect(tableNames).toEqual(['catalog', 'orderItems', 'reservations'])

    const catalog = expectTable(tables.find((t) => t.name === 'catalog'))
    expect(catalog.rows).toHaveLength(0)
    expect(catalog.columns).toEqual([
      '_id',
      'category',
      'description',
      'name',
      'price',
      'tag',
    ])
    expect(catalog.storage).toBe('array')
  })

  it('populates schema-defined columns even when runtime rows are missing fields', () => {
    const tables = createLakebedAdminTables(
      [
        {
          capsule: 'Restaurant',
          createdAt: 1,
          updatedAt: 2,
          data: {
            catalog: [{ name: 'Ramen' }],
          },
        },
      ],
      restaurantSchema,
    )

    const catalog = expectTable(tables.find((t) => t.name === 'catalog'))
    expect(catalog.rows).toHaveLength(1)
    // Schema declares category, description, price, tag even though the row
    // only has name. All schema fields must appear as columns.
    expect(catalog.columns).toEqual([
      '_id',
      'category',
      'description',
      'name',
      'price',
      'tag',
    ])
  })

  it('preserves schema field types as column metadata', () => {
    const tables = createLakebedAdminTables(
      [
        {
          capsule: 'Restaurant',
          createdAt: 1,
          updatedAt: 2,
          data: {
            orderItems: [{ name: 'Ramen', quantity: 2 }],
          },
        },
      ],
      restaurantSchema,
    )

    const orderItems = expectTable(tables.find((t) => t.name === 'orderItems'))
    expect(orderItems.fieldTypes).toMatchObject({
      name: 'string',
      quantity: 'number',
      category: 'string',
    })
  })

  it('populates schema-defined tables with runtime data rows', () => {
    const tables = createLakebedAdminTables(
      [
        {
          capsule: 'Restaurant',
          createdAt: 1,
          updatedAt: 2,
          data: {
            catalog: [
              { name: 'Ramen', price: '12', category: 'Mains' },
              { name: 'Gyoza', price: '6', category: 'Sides' },
            ],
            reservations: [{ source: 'email', label: 'Party of 4' }],
          },
        },
      ],
      restaurantSchema,
    )

    const catalog = expectTable(tables.find((t) => t.name === 'catalog'))
    expect(catalog.rows).toHaveLength(2)
    expect(catalog.rows[0].cells).toMatchObject({
      name: 'Ramen',
      price: '12',
      category: 'Mains',
    })

    const reservations = expectTable(
      tables.find((t) => t.name === 'reservations'),
    )
    expect(reservations.rows).toHaveLength(1)
    expect(reservations.rows[0].cells).toMatchObject({
      source: 'email',
      label: 'Party of 4',
    })
  })

  it('enables canAddRowsToTable for schema-defined collection tables', () => {
    const tables = createLakebedAdminTables(
      [
        {
          capsule: 'Restaurant',
          createdAt: 1,
          updatedAt: 2,
          data: {},
        },
      ],
      restaurantSchema,
    )

    const catalog = expectTable(tables.find((t) => t.name === 'catalog'))
    expect(canAddRowsToTable(catalog)).toBe(true)

    const reservations = expectTable(
      tables.find((t) => t.name === 'reservations'),
    )
    expect(canAddRowsToTable(reservations)).toBe(true)
  })

  it('produces no tables when no schema is provided', () => {
    const tables = createLakebedAdminTables([
      {
        capsule: 'Restaurant',
        createdAt: 1,
        updatedAt: 2,
        data: {
          catalog: [{ name: 'Ramen' }],
        },
      },
    ])

    // Without a schema, no tables are produced — admin tables are
    // derived solely from lakebed.schema, never from runtime inference.
    expect(tables).toHaveLength(0)
  })

  it('does not infer runtime tables for data fields not in schema', () => {
    const tables = createLakebedAdminTables(
      [
        {
          capsule: 'Restaurant',
          createdAt: 1,
          updatedAt: 2,
          data: {
            catalog: [{ name: 'Ramen' }],
            customField: [{ x: 1 }],
          },
        },
      ],
      restaurantSchema,
    )

    // catalog comes from schema; customField is NOT inferred from runtime
    const tableNames = tables.map((t) => t.name).sort()
    expect(tableNames).toContain('catalog')
    expect(tableNames).not.toContain('customField')
  })

  it('merges schema tables across multiple capsules with the same dataKey', () => {
    const tables = createLakebedAdminTables(
      [
        {
          capsule: 'Restaurant:home_story',
          createdAt: 1,
          updatedAt: 2,
          data: {
            catalog: [{ name: 'Ramen' }],
          },
        },
        {
          capsule: 'Restaurant:menu_story',
          createdAt: 1,
          updatedAt: 3,
          data: {
            catalog: [{ name: 'Gyoza' }],
          },
        },
      ],
      restaurantSchema,
    )

    const catalog = expectTable(tables.find((t) => t.name === 'catalog'))
    expect(catalog.rows).toHaveLength(2)
    expect(catalog.sourceCapsules).toHaveLength(2)
    // Merged table should not allow adding rows (ambiguous source capsule)
    expect(canAddRowsToTable(catalog)).toBe(false)
  })

  it('handles multiple capsules with different schemas in one session', () => {
    const schema: CapsuleSchemaRegistry = {
      ...restaurantSchema,
      ...publicationSchema,
    }
    const tables = createLakebedAdminTables(
      [
        {
          capsule: 'Restaurant',
          createdAt: 1,
          updatedAt: 2,
          data: {
            catalog: [{ name: 'Ramen' }],
          },
        },
        {
          capsule: 'PublicationWorkspace',
          createdAt: 1,
          updatedAt: 3,
          data: {
            articles: [{ title: 'Hello World', author: 'Admin' }],
          },
        },
      ],
      schema,
    )

    const tableNames = tables.map((t) => t.name).sort()
    expect(tableNames).toContain('catalog')
    expect(tableNames).toContain('articles')
    expect(tableNames).toContain('orderItems')
    expect(tableNames).toContain('reservations')
    expect(tableNames).toContain('subscribers')

    const articles = expectTable(tables.find((t) => t.name === 'articles'))
    expect(articles.rows).toHaveLength(1)
    expect(articles.rows[0].cells).toMatchObject({
      title: 'Hello World',
      author: 'Admin',
    })
    // Schema fields appear even if not in runtime data
    expect(articles.columns).toContain('excerpt')
    expect(articles.columns).toContain('date')
  })

  it('creates empty schema tables for capsules with no sessionData docs at all', () => {
    // If a capsule has a schema but no sessionData doc, we cannot know it
    // existed. Only capsules that appear in sessionData get tables.
    // This test verifies that an empty sessionData doc still produces
    // schema tables.
    const tables = createLakebedAdminTables(
      [
        {
          capsule: 'PublicationWorkspace',
          createdAt: 1,
          updatedAt: 2,
          data: {},
        },
      ],
      publicationSchema,
    )

    const tableNames = tables.map((t) => t.name).sort()
    expect(tableNames).toEqual(['articles', 'subscribers'])

    const articles = expectTable(tables.find((t) => t.name === 'articles'))
    expect(articles.rows).toHaveLength(0)
    expect(articles.columns).toEqual([
      '_id',
      'author',
      'category',
      'date',
      'excerpt',
      'target',
      'title',
    ])
  })

  it('preserves schema field types for boolean and number fields', () => {
    const schema: CapsuleSchemaRegistry = {
      TestWorkspace: {
        flags: {
          kind: 'table',
          fields: {
            active: bool(),
            count: num(),
            label: str(),
          },
        },
      },
    }
    const tables = createLakebedAdminTables(
      [
        {
          capsule: 'TestWorkspace',
          createdAt: 1,
          updatedAt: 2,
          data: {},
        },
      ],
      schema,
    )

    const flags = expectTable(tables.find((t) => t.name === 'flags'))
    expect(flags.fieldTypes).toMatchObject({
      active: 'boolean',
      count: 'number',
      label: 'string',
    })
  })

  it('ignores schema for structural chrome capsules (Navbar, Footer, etc.)', () => {
    const schema: CapsuleSchemaRegistry = {
      RestaurantNavbar: {
        menuItems: {
          kind: 'table',
          fields: { label: str(), href: str() },
        },
      },
    }
    const tables = createLakebedAdminTables(
      [
        {
          capsule: 'RestaurantNavbar:home_navbar',
          createdAt: 1,
          updatedAt: 2,
          data: { menuItems: [{ label: 'Home' }] },
        },
      ],
      schema,
    )

    // Navbar is structural chrome and should be filtered out
    expect(tables.find((t) => t.name === 'menuItems')).toBeUndefined()
  })
})
