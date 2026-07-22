import { describe, expect, it } from 'vitest'

import { resolveGenerationViewSessionId } from '../../../../convex/lib/session_generation_view_helpers'
import {
  generationViewArgs,
  lookupArgs,
} from '../../../../convex/lib/session_validators'
import type { Id } from '../../../../convex/_generated/dataModel'

type MockDb = {
  normalizeId: (
    table: string,
    id: string,
  ) => Id<'sessions'> | Id<'exports'> | null
  get: (id: Id<'exports'>) => Promise<{ sessionId: Id<'sessions'> } | null>
  query: (table: string) => {
    withIndex: (
      fn: (index: { eq: (field: string, value: string) => void }) => void,
    ) => { first: () => Promise<{ sessionId: Id<'sessions'> } | null> }
  }
}

type GenerationViewCtx = Parameters<typeof resolveGenerationViewSessionId>[0]

// A minimal in-memory db that mirrors how resolveGenerationViewSessionId uses
// normalizeId/get/query to resolve a lookup string to a session id.
function makeDb(
  overrides: {
    sessions?: Record<string, Id<'sessions'>>
    exports?: Record<string, { sessionId: Id<'sessions'> }>
    deployments?: Record<string, { sessionId: Id<'sessions'> }>
  } = {},
): MockDb {
  const sessions = overrides.sessions ?? {}
  const exportsTable = overrides.exports ?? {}
  const deployments = overrides.deployments ?? {}

  return {
    normalizeId: (table, id) => {
      if (table === 'sessions') return sessions[id] ?? null
      if (table === 'exports') {
        return exportsTable[id] ? (id as Id<'exports'>) : null
      }
      return null
    },
    get: async (id) => exportsTable[id] ?? null,
    query: (table) => ({
      withIndex: () => ({
        first: async () =>
          table === 'deployments'
            ? (deployments[Object.keys(deployments)[0]] ?? null)
            : null,
      }),
    }),
  }
}

function makeCtx(db: MockDb) {
  return { db } as unknown as GenerationViewCtx
}

describe('dashboard session lookup', () => {
  it('resolves a direct session id arg without touching the db', async () => {
    const ctx = makeCtx(makeDb())
    const sessionId = 'session-direct' as Id<'sessions'>

    const resolved = await resolveGenerationViewSessionId(ctx, {
      sessionId,
    })

    expect(resolved).toBe(sessionId)
  })

  it('resolves a lookup string that normalizes to a session id', async () => {
    const sessionId = 'session-from-lookup' as Id<'sessions'>
    const ctx = makeCtx(
      makeDb({ sessions: { 'lookup-session-token': sessionId } }),
    )

    const resolved = await resolveGenerationViewSessionId(ctx, {
      lookup: 'lookup-session-token',
    })

    expect(resolved).toBe(sessionId)
  })

  it('resolves an export id to its owning session before falling back further', async () => {
    const sessionId = 'session-owned-by-export' as Id<'sessions'>
    const ctx = makeCtx(
      makeDb({
        exports: {
          'export-token': { sessionId },
        },
      }),
    )

    const resolved = await resolveGenerationViewSessionId(ctx, {
      lookup: 'export-token',
    })

    expect(resolved).toBe(sessionId)
  })

  it('falls back to a deployment slug when neither session nor export normalize', async () => {
    const sessionId = 'session-from-deployment' as Id<'sessions'>
    const ctx = makeCtx(
      makeDb({
        deployments: { 'my-deployment-slug': { sessionId } },
      }),
    )

    const resolved = await resolveGenerationViewSessionId(ctx, {
      lookup: 'my-deployment-slug',
    })

    expect(resolved).toBe(sessionId)
  })

  it('returns null when the lookup matches no session, export, or deployment', async () => {
    const ctx = makeCtx(makeDb())

    const resolved = await resolveGenerationViewSessionId(ctx, {
      lookup: 'unknown-token',
    })

    expect(resolved).toBeNull()
  })

  it('accepts lookup as a string validator for generation view and lookup args', () => {
    // lookupArgs.lookup is a required string; generationViewArgs.lookup is an
    // optional string — both let the dashboard pass route params as lookup
    // strings instead of casting them to session ids.
    expect(lookupArgs.lookup).toMatchObject({
      kind: 'string',
      isOptional: 'required',
    })
    expect(generationViewArgs.lookup).toMatchObject({
      kind: 'string',
    })
    expect(generationViewArgs.lookup?.isOptional).toBe('optional')
  })
})
