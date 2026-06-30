import { describe, it, expect } from 'vitest'
import { submission } from './submission'

describe('submission macro', () => {
  it('generates form table with summary + submit mutation', () => {
    const out = submission({
      tableName: 'reservations',
      fields: ['label', 'source'],
    })
    expect(out.tables).toHaveLength(1)
    const table = out.tables[0]
    expect(table.name).toBe('reservations')
    expect(table.fields.label).toEqual({
      type: 'string',
      default: '',
      seedFromProps: false,
    })
    expect(table.fields.source.seedFromProps).toBe(false)
    // query
    expect(out.queries).toHaveLength(1)
    expect(out.queries[0].name).toBe('submissionSummary')
    expect(out.queries[0].body).toContain('count')
    expect(out.queries[0].body).toContain('latest')
    // mutation
    expect(out.mutations).toHaveLength(1)
    expect(out.mutations[0].name).toBe('submitReservations')
    expect(out.mutations[0].body).toContain('insert')
  })

  it('handles contact form fields', () => {
    const out = submission({
      tableName: 'contacts',
      fields: ['name', 'email', 'message'],
    })
    expect(out.mutations[0].name).toBe('submitContacts')
    expect(out.mutations[0].body).toContain('name')
    expect(out.mutations[0].body).toContain('email')
  })

  it('seedFromProps is false for all fields', () => {
    const out = submission({ tableName: 'leads', fields: ['phone', 'note'] })
    expect(out.tables[0].fields.phone.seedFromProps).toBe(false)
    expect(out.tables[0].fields.note.seedFromProps).toBe(false)
  })
})
