import { describe, it, expect } from 'vitest'
import { cart } from './cart'

describe('cart macro', () => {
  it('generates order table with quantity + 3 mutations', () => {
    const out = cart({
      tableName: 'orderItems',
      fields: ['name', 'price'],
      key: 'name',
    })
    expect(out.tables).toHaveLength(1)
    const table = out.tables[0]
    expect(table.name).toBe('orderItems')
    expect(table.fields.name).toEqual({
      type: 'string',
      default: '',
      seedFromProps: false,
    })
    expect(table.fields.quantity).toEqual({
      type: 'number',
      default: 1,
      seedFromProps: false,
    })
    // query
    expect(out.queries).toHaveLength(1)
    expect(out.queries[0].name).toBe('orderSummary')
    expect(out.queries[0].body).toContain('count')
    // mutations
    expect(out.mutations).toHaveLength(3)
    expect(out.mutations.map((m) => m.name)).toEqual([
      'addToOrder',
      'removeFromOrder',
      'clearOrder',
    ])
    expect(out.mutations[0].body).toContain('name')
    expect(out.mutations[0].body).toContain('quantity')
  })

  it('uses provided key for upsert/delete', () => {
    const out = cart({
      tableName: 'cart',
      fields: ['sku', 'label'],
      key: 'sku',
    })
    expect(out.mutations[0].body).toContain('sku')
    expect(out.mutations[1].body).toContain('sku')
  })

  it('quantity field is numeric even with rating field present', () => {
    const out = cart({ tableName: 'rated', fields: ['name', 'rating'] })
    expect(out.tables[0].fields.rating.type).toBe('number')
    expect(out.tables[0].fields.quantity.type).toBe('number')
  })
})
