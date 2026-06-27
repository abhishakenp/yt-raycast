import { describe, expect, it, vi } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import {
  listSessionAiCapsules,
  upsertSessionAiCapsule,
} from './session_ai_capsule_helpers'

type AiCapsuleRecord = Doc<'aiCapsules'>

const sessionId = 'session_ai_capsule' as Id<'sessions'>

const capsuleRow = (
  overrides: Partial<AiCapsuleRecord> = {},
): AiCapsuleRecord =>
  ({
    _id: 'ai_capsule_1' as Id<'aiCapsules'>,
    _creationTime: 1,
    sessionId,
    capsuleName: 'AICustom_SaasHero_v1',
    parentCapsule: 'SaasHero',
    compiledJs: 'export default {}',
    description: 'AI-edited hero with gradient',
    createdAt: 100,
    updatedAt: 110,
    ...overrides,
  }) as AiCapsuleRecord

const queryCtxFor = (rows: AiCapsuleRecord[] = []) => {
  const indexBuilder = {
    eq: vi.fn().mockReturnThis(),
  }
  const db = {
    query: vi.fn((table: string) => {
      if (table !== 'aiCapsules') {
        throw new Error(`Unexpected table: ${table}`)
      }
      return {
        withIndex: vi.fn(
          (
            _index: string,
            apply: (q: typeof indexBuilder) => typeof indexBuilder,
          ) => {
            apply(indexBuilder)
            return {
              collect: vi.fn(async () => rows),
            }
          },
        ),
      }
    }),
  }
  return { db } as unknown as QueryCtx
}

const mutationCtxFor = (existing: AiCapsuleRecord[] = []) => {
  const rows = [...existing]
  const inserted: AiCapsuleRecord[] = []
  const patched: Array<{
    id: Id<'aiCapsules'>
    patch: Record<string, unknown>
  }> = []
  let nextId = 1

  const indexBuilder = {
    eq: vi.fn().mockReturnThis(),
  }
  const db = {
    query: vi.fn((table: string) => {
      if (table !== 'aiCapsules') {
        throw new Error(`Unexpected table: ${table}`)
      }
      return {
        withIndex: vi.fn(
          (
            _index: string,
            apply: (q: typeof indexBuilder) => typeof indexBuilder,
          ) => {
            apply(indexBuilder)
            return {
              unique: vi.fn(async () => rows[0] ?? null),
            }
          },
        ),
      }
    }),
    insert: vi.fn(async (_table: string, doc: Record<string, unknown>) => {
      const id = `ai_capsule_${nextId++}` as Id<'aiCapsules'>
      const record = { _id: id, _creationTime: 1, ...doc } as AiCapsuleRecord
      inserted.push(record)
      rows.push(record)
      return id
    }),
    patch: vi.fn(
      async (id: Id<'aiCapsules'>, patch: Record<string, unknown>) => {
        patched.push({ id, patch })
        const row = rows.find((r) => r._id === id)
        if (row) Object.assign(row, patch)
      },
    ),
  }
  return { db, inserted, patched } as unknown as MutationCtx & {
    inserted: AiCapsuleRecord[]
    patched: Array<{ id: Id<'aiCapsules'>; patch: Record<string, unknown> }>
  }
}

describe('listSessionAiCapsules', () => {
  it('queries aiCapsules by sessionId', async () => {
    const rows = [
      capsuleRow(),
      capsuleRow({ capsuleName: 'AICustom_BlogFooter_v1' }),
    ]
    const ctx = queryCtxFor(rows)
    const result = await listSessionAiCapsules(ctx, sessionId)
    expect(result).toHaveLength(2)
    expect(result[0].capsuleName).toBe('AICustom_SaasHero_v1')
    expect(result[1].capsuleName).toBe('AICustom_BlogFooter_v1')
  })

  it('returns empty array when no capsules exist', async () => {
    const ctx = queryCtxFor([])
    const result = await listSessionAiCapsules(ctx, sessionId)
    expect(result).toEqual([])
  })
})

describe('upsertSessionAiCapsule', () => {
  it('inserts a new capsule when none exists', async () => {
    const ctx = mutationCtxFor([])
    const id = await upsertSessionAiCapsule(ctx, {
      sessionId,
      capsuleName: 'AICustom_SaasHero_v1',
      parentCapsule: 'SaasHero',
      compiledJs: 'export default {}',
      description: 'AI-edited hero',
    })
    expect(id).toBeTruthy()
    expect(ctx.inserted).toHaveLength(1)
    expect(ctx.inserted[0].capsuleName).toBe('AICustom_SaasHero_v1')
    expect(ctx.inserted[0].parentCapsule).toBe('SaasHero')
    expect(ctx.patched).toHaveLength(0)
  })

  it('updates in place when capsule already exists (re-edit)', async () => {
    const existing = capsuleRow()
    const ctx = mutationCtxFor([existing])
    const id = await upsertSessionAiCapsule(ctx, {
      sessionId,
      capsuleName: 'AICustom_SaasHero_v1',
      parentCapsule: 'SaasHero',
      compiledJs: 'export default { /* v2 */ }',
      description: 'AI-edited hero v2',
    })
    expect(id).toBe(existing._id)
    expect(ctx.inserted).toHaveLength(0)
    expect(ctx.patched).toHaveLength(1)
    expect(ctx.patched[0].patch.compiledJs).toContain('v2')
    expect(ctx.patched[0].patch.description).toBe('AI-edited hero v2')
  })
})
