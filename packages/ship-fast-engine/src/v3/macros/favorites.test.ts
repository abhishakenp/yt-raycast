import { describe, it, expect } from 'vitest'
import { favorites } from './favorites'

describe('favorites macro', () => {
  it('generates saved table with list + toggle', () => {
    const out = favorites({
      tableName: 'favorites',
      fields: ['name', 'url'],
      key: 'name',
    })
    expect(out.tables).toHaveLength(1)
    const table = out.tables[0]
    expect(table.name).toBe('favorites')
    expect(table.fields.name.seedFromProps).toBe(false)
    expect(table.fields.url.seedFromProps).toBe(false)
    // query
    expect(out.queries).toHaveLength(1)
    expect(out.queries[0].name).toBe('savedList')
    expect(out.queries[0].body).toContain('all()')
    // mutation
    expect(out.mutations).toHaveLength(1)
    expect(out.mutations[0].name).toBe('toggleSave')
    expect(out.mutations[0].body).toContain('name')
    expect(out.mutations[0].body).toContain('insert')
    expect(out.mutations[0].body).toContain('delete')
  })

  it('uses key for toggle logic', () => {
    const out = favorites({
      tableName: 'bookmarks',
      fields: ['id', 'title'],
      key: 'id',
    })
    expect(out.mutations[0].body).toContain('id')
  })

  it('handles rating field as numeric', () => {
    const out = favorites({ tableName: 'saved', fields: ['name', 'rating'] })
    expect(out.tables[0].fields.rating.type).toBe('number')
  })
})
