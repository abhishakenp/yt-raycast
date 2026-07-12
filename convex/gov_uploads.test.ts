import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Doc, Id } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { generateUploadUrl, getStorageUrl } from './gov_uploads'

// Mock the session access helper so we can control ownership checks.
vi.mock('./lib/session_access_helpers', () => ({
  assertCanMutateSession: vi.fn(),
}))

import { assertCanMutateSession } from './lib/session_access_helpers'

type SessionDoc = Doc<'sessions'>

const sessionId = 'session_gov_upload' as Id<'sessions'>
const storageId = 'storage_test_123' as Id<'_storage'>

function sessionDoc(overrides: Partial<SessionDoc> = {}): SessionDoc {
  return {
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Gov upload test',
    workspace: 'default',
    ...overrides,
  } as SessionDoc
}

/** Convex mutation/query objects store the raw handler on `_handler`. */
type MutationWithHandler<Args, Ret> = {
  _handler: (ctx: MutationCtx, args: Args) => Promise<Ret>
}

type QueryWithHandler<Args, Ret> = {
  _handler: (ctx: QueryCtx, args: Args) => Promise<Ret>
}

type GenerateUploadUrlArgs = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
}

type GetStorageUrlArgs = {
  sessionId: Id<'sessions'>
  storageId: Id<'_storage'>
}

const generateUploadUrlHandler = (
  generateUploadUrl as unknown as MutationWithHandler<
    GenerateUploadUrlArgs,
    string
  >
)._handler

const getStorageUrlHandler = (
  getStorageUrl as unknown as QueryWithHandler<GetStorageUrlArgs, string | null>
)._handler

describe('gov_uploads.generateUploadUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws ConvexError when the session is not found', async () => {
    const db = {
      get: async () => null,
    } as unknown as MutationCtx['db']
    const ctx = { db } as unknown as MutationCtx

    await expect(
      generateUploadUrlHandler(ctx, { sessionId }),
    ).rejects.toMatchObject({
      data: { code: 'NOT_FOUND', message: 'Session not found' },
    })

    // assertCanMutateSession should NOT have been called (early return).
    expect(assertCanMutateSession).not.toHaveBeenCalled()
  })

  it('calls assertCanMutateSession with the session and anonymous owner secret', async () => {
    const session = sessionDoc({ userId: 'token:owner' })
    const db = {
      get: async () => session,
    } as unknown as MutationCtx['db']
    const generateUploadUrlFn = vi
      .fn()
      .mockResolvedValue('https://upload.test/signed-url')
    const ctx = {
      db,
      storage: { generateUploadUrl: generateUploadUrlFn },
    } as unknown as MutationCtx

    ;(assertCanMutateSession as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    )

    const result = await generateUploadUrlHandler(ctx, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
    })

    expect(result).toBe('https://upload.test/signed-url')
    expect(assertCanMutateSession).toHaveBeenCalledTimes(1)
    const [assertCtx, assertSession, assertSecret] = (
      assertCanMutateSession as ReturnType<typeof vi.fn>
    ).mock.calls[0]
    expect(assertCtx).toBe(ctx)
    expect(assertSession).toBe(session)
    expect(assertSecret).toBe('owner-secret')
    expect(generateUploadUrlFn).toHaveBeenCalledTimes(1)
  })

  it('returns the generated upload URL', async () => {
    const session = sessionDoc()
    const db = {
      get: async () => session,
    } as unknown as MutationCtx['db']
    const generateUploadUrlFn = vi
      .fn()
      .mockResolvedValue('https://upload.test/abc123')
    const ctx = {
      db,
      storage: { generateUploadUrl: generateUploadUrlFn },
    } as unknown as MutationCtx

    ;(assertCanMutateSession as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    )

    const url = await generateUploadUrlHandler(ctx, { sessionId })

    expect(url).toBe('https://upload.test/abc123')
    expect(generateUploadUrlFn).toHaveBeenCalledTimes(1)
  })

  it('propagates ownership check failures from assertCanMutateSession', async () => {
    const session = sessionDoc({ userId: 'token:other' })
    const db = {
      get: async () => session,
    } as unknown as MutationCtx['db']
    const generateUploadUrlFn = vi.fn()
    const ctx = {
      db,
      storage: { generateUploadUrl: generateUploadUrlFn },
    } as unknown as MutationCtx

    const forbiddenError = Object.assign(new Error('Forbidden'), {
      data: { code: 'FORBIDDEN', message: 'You do not own this session' },
    })
    ;(assertCanMutateSession as ReturnType<typeof vi.fn>).mockRejectedValue(
      forbiddenError,
    )

    await expect(
      generateUploadUrlHandler(ctx, { sessionId }),
    ).rejects.toMatchObject({ data: { code: 'FORBIDDEN' } })

    // storage.generateUploadUrl should NOT have been called.
    expect(generateUploadUrlFn).not.toHaveBeenCalled()
  })
})

describe('gov_uploads.getStorageUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws ConvexError when the session is not found', async () => {
    const db = {
      get: async () => null,
    } as unknown as QueryCtx['db']
    const ctx = { db } as unknown as QueryCtx

    await expect(
      getStorageUrlHandler(ctx, { sessionId, storageId }),
    ).rejects.toMatchObject({
      data: { code: 'NOT_FOUND', message: 'Session not found' },
    })
  })

  it('returns the storage URL for a valid session', async () => {
    const session = sessionDoc()
    const db = {
      get: async () => session,
    } as unknown as QueryCtx['db']
    const getUrlFn = vi.fn().mockResolvedValue('https://storage.test/file.pdf')
    const ctx = {
      db,
      storage: { getUrl: getUrlFn },
    } as unknown as QueryCtx

    const url = await getStorageUrlHandler(ctx, { sessionId, storageId })

    expect(url).toBe('https://storage.test/file.pdf')
    expect(getUrlFn).toHaveBeenCalledTimes(1)
    expect(getUrlFn).toHaveBeenCalledWith(storageId)
  })

  it('returns null when the storage URL does not exist', async () => {
    const session = sessionDoc()
    const db = {
      get: async () => session,
    } as unknown as QueryCtx['db']
    const getUrlFn = vi.fn().mockResolvedValue(null)
    const ctx = {
      db,
      storage: { getUrl: getUrlFn },
    } as unknown as QueryCtx

    const url = await getStorageUrlHandler(ctx, { sessionId, storageId })

    expect(url).toBeNull()
  })
})
