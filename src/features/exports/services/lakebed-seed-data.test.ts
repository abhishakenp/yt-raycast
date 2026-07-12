import { describe, expect, it } from 'vitest'

import { renderSeedData } from './openui-lakebed-export-builder'

/**
 * A Lakebed deploy must seed its DB with the SAME full catalog the live preview
 * shows (published to the session's shared Lakebed row), not the tiny sample
 * baked into page props. `renderSeedData` therefore prefers `externalSeed` rows
 * per table, projecting them onto the table's declared fields (dropping
 * engine-managed keys like id/createdAt), and only falls back to props/default
 * rows for tables with no external data.
 */

function parseSeedRows(source: string): Record<string, unknown[]> {
  const match = source.match(/const seedRows[^=]*=\s*(\{[\s\S]*?\});/)
  if (!match) throw new Error('seedRows literal not found')
  return JSON.parse(match[1]) as Record<string, unknown[]>
}

describe('renderSeedData — deploy seeds the real session catalog', () => {
  const tableFields = new Map<string, string[]>([
    ['tenders', ['nitNo', 'title', 'date', 'docUrl']],
  ])

  it('bakes ALL external rows, projected onto declared fields', () => {
    const external = {
      tenders: Array.from({ length: 40 }, (_, i) => ({
        id: `id-${i}`, // engine-managed, must be dropped
        createdAt: i, // engine-managed, must be dropped
        nitNo: `NIT/${i}`,
        title: `Real Tender ${i}`,
        date: '2025-01-01',
        docUrl: `https://convex/api/storage/doc-${i}`,
      })),
    }
    const rows = parseSeedRows(renderSeedData([], tableFields, external))

    expect(rows.tenders).toHaveLength(40)
    const first = rows.tenders[0] as Record<string, string>
    expect(first).toEqual({
      nitNo: 'NIT/0',
      title: 'Real Tender 0',
      date: '2025-01-01',
      docUrl: 'https://convex/api/storage/doc-0',
    })
    // engine-managed keys are not seeded
    expect(first).not.toHaveProperty('id')
    expect(first).not.toHaveProperty('createdAt')
  })

  it('falls back to props/default rows when a table has no external data', () => {
    const withExternal = parseSeedRows(
      renderSeedData([], tableFields, { tenders: [] }),
    )
    const noExternal = parseSeedRows(renderSeedData([], tableFields, undefined))
    // Both take the sample/default path (identical output), not the 40 real rows.
    expect(withExternal).toEqual(noExternal)
    expect((withExternal.tenders ?? []).length).toBeLessThan(40)
  })
})
