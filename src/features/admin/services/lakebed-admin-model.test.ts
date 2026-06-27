import { describe, expect, it } from 'vitest'

import {
  canAddRowsToTable,
  createLakebedAdminTables,
  parseAdminValue,
  previewAdminValue,
} from './lakebed-admin-model'
import type { LakebedAdminTable } from './lakebed-admin-model'

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
