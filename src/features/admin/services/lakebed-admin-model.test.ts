import { describe, expect, it } from 'vitest'

import {
  createLakebedAdminTables,
  parseAdminValue,
  previewAdminValue,
} from './lakebed-admin-model'

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
