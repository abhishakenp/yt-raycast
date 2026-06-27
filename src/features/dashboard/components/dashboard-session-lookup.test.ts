import { describe, expect, it } from 'vitest'

import { resolveGenerationViewSessionId } from '../../../../convex/lib/session_generation_view_helpers'
import {
  generationViewArgs,
  lookupArgs,
} from '../../../../convex/lib/session_validators'
import {
  forgetReadySessionPreview,
  readReadySessionPreview,
  rememberReadySessionPreview,
} from '@/features/session/services/ready-session-cache'
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
const makeDb = (
  overrides: {
    sessions?: Record<string, Id<'sessions'>>
    exports?: Record<string, { sessionId: Id<'sessions'> }>
    deployments?: Record<string, { sessionId: Id<'sessions'> }>
  } = {},
): MockDb => {
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

const makeCtx = (db: MockDb) => ({ db }) as unknown as GenerationViewCtx

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

  it('hydrates and clears ready session preview cache entries by session id', () => {
    const store = new Map<string, string>()
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value)
      },
      removeItem: (key: string) => {
        store.delete(key)
      },
    }
    const sessionId = 'session-preview-cache'

    // Nothing cached yet.
    expect(readReadySessionPreview(storage, { sessionId })).toBeNull()

    rememberReadySessionPreview(storage, {
      sessionId,
      status: 'preview_ready',
      prompt: 'Build a cached preview site',
      preferredLanguage: 'en',
      homeModule: { source: '<html><body>cached</body></html>' },
      createdAt: 1_000,
    })

    const cached = readReadySessionPreview(storage, { sessionId, now: 2_000 })
    expect(cached).toMatchObject({
      sessionId,
      status: 'preview_ready',
      prompt: 'Build a cached preview site',
    })
    expect(cached?.homeModule.source).toBe('<html><body>cached</body></html>')

    // Forgetting the preview removes the entry.
    forgetReadySessionPreview(storage, { sessionId })
    expect(readReadySessionPreview(storage, { sessionId })).toBeNull()
  })

  it('rejects expired or malformed ready session preview cache entries', () => {
    const store = new Map<string, string>()
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value)
      },
      removeItem: (key: string) => {
        store.delete(key)
      },
    }
    const sessionId = 'session-preview-expired'

    rememberReadySessionPreview(storage, {
      sessionId,
      status: 'preview_ready',
      prompt: 'Build an expiring preview site',
      preferredLanguage: 'en',
      homeModule: { source: '<html>expiring</html>' },
      createdAt: 0,
    })

    // Beyond the 7-day TTL the entry is treated as stale and removed.
    const stale = readReadySessionPreview(storage, {
      sessionId,
      now: 8 * 24 * 60 * 60 * 1000,
    })
    expect(stale).toBeNull()
    // The stale read also evicts the corrupt/expired entry.
    expect(store.size).toBe(0)
  })
})
