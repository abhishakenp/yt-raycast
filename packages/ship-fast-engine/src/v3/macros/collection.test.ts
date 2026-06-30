import { describe, it, expect } from 'vitest'
import { collection } from './collection'
import type { MacroOutput } from '../types'

describe('collection macro', () => {
  it('generates seeded table with list + sync operations', () => {
    const out: MacroOutput = collection({
      tableName: 'menuItems',
      fields: ['name', 'description', 'price', 'tag'],
    })
    expect(out.tables).toHaveLength(1)
    const table = out.tables[0]
    expect(table.name).toBe('menuItems')
    expect(table.fields.name).toEqual({
      type: 'string',
      default: '',
      seedFromProps: true,
    })
    expect(table.fields.price).toEqual({
      type: 'string',
      default: '',
      seedFromProps: true,
    })
    expect(table.fields.tag.seedFromProps).toBe(true)
    // query
    expect(out.queries).toHaveLength(1)
    expect(out.queries[0].name).toBe('listMenuItems')
    expect(out.queries[0].table).toBe('menuItems')
    expect(out.queries[0].body).toContain("orderBy('updatedAt','desc')")
    // mutation
    expect(out.mutations).toHaveLength(1)
    expect(out.mutations[0].name).toBe('syncMenuItems')
    expect(out.mutations[0].body).toContain('upsert')
    expect(out.mutations[0].body).toContain('name')
  })

  it('uses first field as upsert key', () => {
    const out = collection({
      tableName: 'products',
      fields: ['sku', 'title', 'price'],
    })
    expect(out.mutations[0].name).toBe('syncProducts')
    expect(out.mutations[0].body).toContain('sku')
  })

  it('handles single field table', () => {
    const out = collection({ tableName: 'tags', fields: ['label'] })
    expect(out.tables[0].fields.label.seedFromProps).toBe(true)
    expect(out.queries[0].name).toBe('listTags')
    expect(out.mutations[0].name).toBe('syncTags')
  })
})
