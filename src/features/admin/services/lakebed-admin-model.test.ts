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

const str = () => ({ kind: 'string' as const })
const num = () => ({ kind: 'number' as const })
const bool = () => ({ kind: 'boolean' as const })

const restaurantSchema: CapsuleSchemaRegistry = {
  RestaurantStory: {
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
  PublicationFeatured: {
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
  it('infers array fields as editable data tables', () => {
    const [products] = createLakebedAdminTables([
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

    expect(products).toMatchObject({
      capsule: 'Store',
      columns: ['_id', 'id', 'name', 'price', 'featured'],
      field: 'products',
      name: 'products',
      storage: 'array',
    })
    expect(products?.rows).toHaveLength(2)
    expect(products?.rows.map((row) => row.id)).toEqual(['p1', 'p2'])
  })

  it('infers object maps as data tables with stable row keys', () => {
    const [orders] = createLakebedAdminTables([
      {
        capsule: 'Orders',
        createdAt: 1,
        updatedAt: 2,
        data: {
          byId: {
            order_1: { status: 'paid', total: 42 },
            order_2: { status: 'open', total: 9 },
          },
        },
      },
    ])

    expect(orders).toMatchObject({
      columns: ['_id', '_key', 'status', 'total'],
      storage: 'map',
    })
    expect(orders?.rows[0]).toMatchObject({
      id: 'order_1',
      key: 'order_1',
      cells: { _key: 'order_1', status: 'paid', total: 42 },
    })
  })

  it('filters structural chrome docs out of the admin table list', () => {
    const tables = createLakebedAdminTables([
      {
        capsule: 'BeautyStoreFooter:explore_footer',
        createdAt: 1,
        updatedAt: 2,
        data: {
          brand: 'Beauty Store',
          linkColumns: [{ title: 'Shop', links: ['Products'] }],
        },
      },
      {
        capsule: 'BeautyStoreProducts:home_products',
        createdAt: 1,
        updatedAt: 2,
        data: {
          items: [{ id: 'p1', title: 'Serum' }],
        },
      },
    ])

    expect(tables.map((table) => table.name)).toEqual(['items'])
    expect(tables.map((table) => table.capsule)).not.toContain(
      'BeautyStoreFooter:explore_footer',
    )
    expect(tables.map((table) => table.name)).not.toContain(
      'BeautyStoreFooter:explore_footer.brand',
    )
  })

  it('keeps valid Lakebed docs editable when a generated doc has malformed data', () => {
    const tables = createLakebedAdminTables([
      {
        capsule: 'BrokenProducts:home_products',
        createdAt: 1,
        updatedAt: 2,
        data: undefined,
      },
      {
        capsule: 'BeautyStoreProducts:home_products',
        createdAt: 1,
        updatedAt: 3,
        data: {
          items: [{ id: 'p1', title: 'Serum' }],
        },
      },
    ] as never)

    const products = expectTable(tables.find((table) => table.name === 'items'))
    expect(products.rows).toHaveLength(1)
    expect(products.rows[0].cells).toMatchObject({
      _id: 'p1',
      id: 'p1',
      title: 'Serum',
    })
  })

  it('filters all structural chrome docs out of admin tables', () => {
    const tables = createLakebedAdminTables([
      {
        capsule: 'DashboardHeader:home_header',
        createdAt: 1,
        updatedAt: 2,
        data: { title: 'Overview' },
      },
      {
        capsule: 'AnalyticsSidebar:admin_sidebar',
        createdAt: 1,
        updatedAt: 2,
        data: { items: [{ label: 'Reports' }] },
      },
      {
        capsule: 'DashboardOrdersTable:admin_orders',
        createdAt: 1,
        updatedAt: 2,
        data: { orders: [{ id: 'order_1', status: 'new' }] },
      },
    ])

    expect(tables.map((table) => table.name)).toEqual(['orders'])
    expect(tables.flatMap((table) => table.sourceCapsules)).toEqual([
      'DashboardOrdersTable:admin_orders',
    ])
  })

  it('merges repeated section arrays into one semantic table', () => {
    const [items] = createLakebedAdminTables([
      {
        capsule: 'BeautyStoreProducts:home_products',
        createdAt: 1,
        updatedAt: 2,
        data: {
          items: [{ id: 'p1', title: 'Serum' }],
        },
      },
      {
        capsule: 'BeautyStoreProducts:products_products',
        createdAt: 1,
        updatedAt: 4,
        data: {
          items: [{ id: 'p2', title: 'Cleanser' }],
        },
      },
    ])

    expect(items).toMatchObject({
      field: 'items',
      name: 'items',
      sourceCapsules: [
        'BeautyStoreProducts:home_products',
        'BeautyStoreProducts:products_products',
      ],
      storage: 'array',
      updatedAt: 4,
    })
    expect(items?.rows).toMatchObject([
      {
        cells: { _id: 'p1', id: 'p1', title: 'Serum' },
        id: 'BeautyStoreProducts:home_products:items:p1',
        sourceCapsule: 'BeautyStoreProducts:home_products',
      },
      {
        cells: { _id: 'p2', id: 'p2', title: 'Cleanser' },
        id: 'BeautyStoreProducts:products_products:items:p2',
        sourceCapsule: 'BeautyStoreProducts:products_products',
      },
    ])
  })

  it('merges repeated primitive fields without exposing capsule namespaces', () => {
    const [brand] = createLakebedAdminTables([
      {
        capsule: 'BeautyStoreHero:home_hero',
        createdAt: 1,
        updatedAt: 2,
        data: { brand: 'Glow' },
      },
      {
        capsule: 'BeautyStoreNewsletter:home_newsletter',
        createdAt: 1,
        updatedAt: 4,
        data: { brand: 'Glow Club' },
      },
    ])

    expect(brand).toMatchObject({
      field: 'brand',
      name: 'brand',
      sourceCapsules: [
        'BeautyStoreHero:home_hero',
        'BeautyStoreNewsletter:home_newsletter',
      ],
      storage: 'value',
    })
    expect(brand?.rows).toMatchObject([
      {
        cells: { _id: '1', value: 'Glow' },
        sourceCapsule: 'BeautyStoreHero:home_hero',
      },
      {
        cells: { _id: '1', value: 'Glow Club' },
        sourceCapsule: 'BeautyStoreNewsletter:home_newsletter',
      },
    ])
    expect(brand?.name).not.toContain(':')
  })

  it('only allows adding rows to a single-source collection table', () => {
    const [mergedItems] = createLakebedAdminTables([
      {
        capsule: 'StoreHome:products',
        createdAt: 1,
        updatedAt: 2,
        data: { items: [{ id: 'p1' }] },
      },
      {
        capsule: 'StoreCatalog:products',
        createdAt: 1,
        updatedAt: 2,
        data: { items: [{ id: 'p2' }] },
      },
    ])
    const [singleOrders] = createLakebedAdminTables([
      {
        capsule: 'Orders:admin',
        createdAt: 1,
        updatedAt: 2,
        data: { orders: [{ id: 'o1' }] },
      },
    ])

    expect(canAddRowsToTable(expectTable(mergedItems))).toBe(false)
    expect(canAddRowsToTable(expectTable(singleOrders))).toBe(true)
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
          capsule: 'RestaurantStory:story_story',
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
          capsule: 'RestaurantStory:story_story',
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
          capsule: 'RestaurantStory:story_story',
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
          capsule: 'RestaurantStory:story_story',
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
          capsule: 'RestaurantStory:story_story',
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

  it('still infers tables from runtime data when no schema is provided', () => {
    const tables = createLakebedAdminTables([
      {
        capsule: 'RestaurantStory:story_story',
        createdAt: 1,
        updatedAt: 2,
        data: {
          catalog: [{ name: 'Ramen' }],
        },
      },
    ])

    // Without schema, only tables with runtime data appear
    expect(tables.map((t) => t.name)).toEqual(['catalog'])
    const catalog = expectTable(tables[0])
    // Without schema, columns are only from runtime row keys
    expect(catalog.columns).toEqual(['_id', 'name'])
  })

  it('falls back to runtime inference for data fields not in schema', () => {
    const tables = createLakebedAdminTables(
      [
        {
          capsule: 'RestaurantStory:story_story',
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

    // catalog comes from schema; customField is inferred from runtime
    const tableNames = tables.map((t) => t.name).sort()
    expect(tableNames).toContain('catalog')
    expect(tableNames).toContain('customField')
  })

  it('merges schema tables across multiple capsules with the same component', () => {
    const tables = createLakebedAdminTables(
      [
        {
          capsule: 'RestaurantStory:home_story',
          createdAt: 1,
          updatedAt: 2,
          data: {
            catalog: [{ name: 'Ramen' }],
          },
        },
        {
          capsule: 'RestaurantStory:menu_story',
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
          capsule: 'RestaurantStory:story_story',
          createdAt: 1,
          updatedAt: 2,
          data: {
            catalog: [{ name: 'Ramen' }],
          },
        },
        {
          capsule: 'PublicationFeatured:home_featured',
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
          capsule: 'PublicationFeatured:home_featured',
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
      TestComponent: {
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
          capsule: 'TestComponent:test_test',
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
