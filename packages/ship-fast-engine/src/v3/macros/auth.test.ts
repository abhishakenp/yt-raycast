import { describe, it, expect } from 'vitest'
import { auth } from './auth'

describe('auth macro', () => {
  it('generates fixed authSessions table', () => {
    const out = auth()
    expect(out.tables).toHaveLength(1)
    const table = out.tables[0]
    expect(table.name).toBe('authSessions')
    expect(table.fields.source).toEqual({
      type: 'string',
      default: '',
      seedFromProps: false,
    })
    expect(table.fields.timestamp).toEqual({
      type: 'number',
      default: 0,
      seedFromProps: false,
    })
  })

  it('generates sessionSummary query', () => {
    const out = auth()
    expect(out.queries).toHaveLength(1)
    expect(out.queries[0].name).toBe('sessionSummary')
    expect(out.queries[0].table).toBe('authSessions')
    expect(out.queries[0].body).toContain('count')
    expect(out.queries[0].body).toContain('latest')
  })

  it('generates recordSession + clearSessions mutations', () => {
    const out = auth()
    expect(out.mutations).toHaveLength(2)
    expect(out.mutations[0].name).toBe('recordSession')
    expect(out.mutations[0].body).toContain('insert')
    expect(out.mutations[1].name).toBe('clearSessions')
    expect(out.mutations[1].body).toContain('deleteAll')
  })
})
