import { describe, expect, it } from 'vitest'

import { normalizeRecords } from './normalize-records.ts'

type CartItem = {
  id: string
  label?: string
  quantity?: number
}

describe('normalizeRecords', () => {
  it('turns DB-shaped Lakebed record maps into arrays while dropping malformed rows', () => {
    const records = normalizeRecords<CartItem>({
      cart_1: { id: 'cart_1', label: 'Hydrating Serum', quantity: 2 },
      cart_2: null,
      cart_3: { id: 'cart_3', label: 'Night Cream', quantity: 1 },
      cart_4: undefined,
    })

    expect(records).toEqual([
      { id: 'cart_1', label: 'Hydrating Serum', quantity: 2 },
      { id: 'cart_3', label: 'Night Cream', quantity: 1 },
    ])
    expect(records.map((item) => item.label)).toEqual([
      'Hydrating Serum',
      'Night Cream',
    ])
  })

  it('keeps malformed deployed query payloads from masquerading as arrays', () => {
    for (const malformed of [
      undefined,
      null,
      'not-json',
      42,
      { id: 'cart_1', label: 'Scalar record, not a collection' },
      { items: [{ id: 'nested-array' }] },
      { cart_1: { id: 'cart_1' }, count: 1 },
      { cart_1: { id: 'cart_1' }, cart_2: ['bad row'] },
    ]) {
      expect(normalizeRecords<CartItem>(malformed)).toEqual([])
    }
  })

  it('normalizes valid array payloads and filters rows that generated UI cannot render', () => {
    const records = normalizeRecords<CartItem>([
      { id: 'cart_1', label: 'Coffee Beans', quantity: 1 },
      null,
      'bad row',
      ['bad row'],
      { id: 'cart_2', label: 'Ceramic Mug', quantity: 3 },
    ])

    expect(records).toEqual([
      { id: 'cart_1', label: 'Coffee Beans', quantity: 1 },
      { id: 'cart_2', label: 'Ceramic Mug', quantity: 3 },
    ])
  })
})
