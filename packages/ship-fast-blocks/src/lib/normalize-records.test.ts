import { describe, expect, it } from 'vitest'
import { normalizeRecords } from './normalize-records.ts'

describe('normalizeRecords', () => {
  it('returns arrays unchanged (filtering malformed rows)', () => {
    const items = [{ id: '1' }, null, { id: '2' }, 'scalar']
    expect(normalizeRecords(items)).toEqual([{ id: '1' }, { id: '2' }])
  })

  it('normalizes DB-shaped record collections to arrays', () => {
    const value = {
      missing: null,
      product_1: { id: 'product_1', label: 'Truffle Box' },
      product_2: { id: 'product_2', label: 'Gift set' },
    }
    expect(normalizeRecords(value)).toEqual([
      { id: 'product_1', label: 'Truffle Box' },
      { id: 'product_2', label: 'Gift set' },
    ])
  })

  it('rejects collections that contain scalar primitive fields', () => {
    // A scalar primitive field indicates a scalar record, not a collection.
    const value = {
      missing: null,
      bad: 'scalar',
      good: { id: 'good' },
    }
    expect(normalizeRecords(value)).toEqual([])
  })

  it('returns empty array for scalar records (non-collection objects)', () => {
    expect(normalizeRecords({ count: 3, query: 'foo' })).toEqual([])
  })

  it('returns empty array for null/undefined/primitives', () => {
    expect(normalizeRecords(null)).toEqual([])
    expect(normalizeRecords(undefined)).toEqual([])
    expect(normalizeRecords('string')).toEqual([])
    expect(normalizeRecords(42)).toEqual([])
  })

  it('returns empty array for empty objects', () => {
    expect(normalizeRecords({})).toEqual([])
  })
})
