import { describe, it, expect } from 'vitest'
import { search } from './search'

describe('search macro', () => {
  it('generates state + searches tables', () => {
    const out = search({
      stateFields: ['query', 'category'],
      searchFields: ['term', 'filters'],
    })
    expect(out.tables).toHaveLength(2)
    expect(out.tables[0].name).toBe('state')
    expect(out.tables[1].name).toBe('searches')
    expect(out.tables[0].fields.query.seedFromProps).toBe(false)
    expect(out.tables[1].fields.term.seedFromProps).toBe(false)
    // query
    expect(out.queries).toHaveLength(1)
    expect(out.queries[0].name).toBe('searchState')
    expect(out.queries[0].body).toContain('state')
    expect(out.queries[0].body).toContain('history')
    // mutation
    expect(out.mutations).toHaveLength(1)
    expect(out.mutations[0].name).toBe('setSearch')
    expect(out.mutations[0].body).toContain('upsert')
    expect(out.mutations[0].body).toContain('insert')
  })

  it('handles empty field lists', () => {
    const out = search({})
    expect(out.tables).toHaveLength(2)
    expect(Object.keys(out.tables[0].fields)).toHaveLength(0)
    expect(out.queries[0].name).toBe('searchState')
  })

  it('both tables have seedFromProps false', () => {
    const out = search({ stateFields: ['q'], searchFields: ['term'] })
    expect(out.tables[0].fields.q.seedFromProps).toBe(false)
    expect(out.tables[1].fields.term.seedFromProps).toBe(false)
  })
})
