import { describe, it, expect } from 'vitest'
import {
  strField,
  numField,
  fieldFor,
  buildFields,
  pascalCase,
} from './helpers'
import type { LakebedField } from '../types'

describe('strField', () => {
  it('returns a string field with default empty string', () => {
    const field = strField(true)
    expect(field).toEqual({
      type: 'string',
      default: '',
      seedFromProps: true,
    })
  })

  it('passes seedFromProps=false through', () => {
    const field = strField(false)
    expect(field.seedFromProps).toBe(false)
  })

  it('always has type string and default empty string', () => {
    expect(strField(true).type).toBe('string')
    expect(strField(false).default).toBe('')
  })
})

describe('numField', () => {
  it('returns a number field with given default', () => {
    const field = numField(42, true)
    expect(field).toEqual({
      type: 'number',
      default: 42,
      seedFromProps: true,
    })
  })

  it('passes seedFromProps through', () => {
    expect(numField(0, false).seedFromProps).toBe(false)
  })

  it('supports zero as default', () => {
    const field = numField(0, true)
    expect(field.default).toBe(0)
    expect(field.type).toBe('number')
  })
})

describe('fieldFor', () => {
  it('returns a number field with default 1 for quantity', () => {
    const field = fieldFor('quantity', false)
    expect(field).toEqual({
      type: 'number',
      default: 1,
      seedFromProps: false,
    })
  })

  it('returns a number field with default 0 for rating', () => {
    const field = fieldFor('rating', false)
    expect(field).toEqual({
      type: 'number',
      default: 0,
      seedFromProps: false,
    })
  })

  it('returns a string field for other names', () => {
    const field = fieldFor('name', true)
    expect(field).toEqual({
      type: 'string',
      default: '',
      seedFromProps: true,
    })
  })

  it('returns a string field for arbitrary field names', () => {
    const field = fieldFor('description', true)
    expect(field.type).toBe('string')
  })
})

describe('buildFields', () => {
  it('builds a record from a list of field names', () => {
    const fields = buildFields(['name', 'price'], false)
    expect(Object.keys(fields)).toEqual(['name', 'price'])
    expect(fields.name.type).toBe('string')
    expect(fields.price.type).toBe('string')
  })

  it('uses number type for quantity field', () => {
    const fields = buildFields(['name', 'quantity'], false)
    expect(fields.quantity).toEqual({
      type: 'number',
      default: 1,
      seedFromProps: false,
    })
  })

  it('uses number type for rating field', () => {
    const fields = buildFields(['name', 'rating'], true)
    expect(fields.rating).toEqual({
      type: 'number',
      default: 0,
      seedFromProps: true,
    })
  })

  it('returns empty record for empty list', () => {
    const fields = buildFields([], false)
    expect(fields).toEqual({})
  })

  it('passes seedFromProps value to all fields', () => {
    const fields = buildFields(['name', 'quantity'], true)
    expect(fields.name.seedFromProps).toBe(true)
    expect(fields.quantity.seedFromProps).toBe(true)
  })

  it('produces valid LakebedField values', () => {
    const fields = buildFields(['name', 'quantity', 'rating'], false)
    for (const key of Object.keys(fields)) {
      const field: LakebedField = fields[key]
      expect(['string', 'number']).toContain(field.type)
      expect(field.seedFromProps).toBe(false)
    }
  })
})

describe('pascalCase', () => {
  it('capitalizes the first letter of a camelCase name', () => {
    expect(pascalCase('menuItems')).toBe('MenuItems')
  })

  it('returns empty string for empty input', () => {
    expect(pascalCase('')).toBe('')
  })

  it('uppercases a single character', () => {
    expect(pascalCase('a')).toBe('A')
  })

  it('preserves the rest of the string unchanged', () => {
    expect(pascalCase('helloWorld')).toBe('HelloWorld')
  })

  it('uppercases an already-capitalized name (idempotent)', () => {
    expect(pascalCase('MenuItems')).toBe('MenuItems')
  })

  it('handles a single-word lowercase name', () => {
    expect(pascalCase('products')).toBe('Products')
  })
})
