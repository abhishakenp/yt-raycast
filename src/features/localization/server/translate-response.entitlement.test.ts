import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createTranslateResponse } from './translate-response'

const SESSION_ID = 's1'

function translateRequest(
  body: Record<string, unknown>,
  init: {
    bearer?: string
    sessionId?: string
    anonymousOwnerSecret?: string
  } = {},
): Request {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  }
  if (init.bearer) headers.authorization = `Bearer ${init.bearer}`
  return new Request('https://ship-fast.test/api/translate', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ...body,
      sessionId: init.sessionId ?? SESSION_ID,
      ...(init.anonymousOwnerSecret
        ? { anonymousOwnerSecret: init.anonymousOwnerSecret }
        : {}),
    }),
  })
}

describe('createTranslateResponse Pro + same-user entitlement gate', () => {
  const originalClerk = process.env.VITE_DISABLE_CLERK

  beforeEach(() => {
    // Clerk enabled => entitlement gate is active.
    delete process.env.VITE_DISABLE_CLERK
  })

  afterEach(() => {
    process.env.VITE_DISABLE_CLERK = originalClerk
  })

  it('rejects a translate request with no Bearer token (401)', async () => {
    const model = vi.fn(async () => {
      throw new Error('model must not run when unauthenticated')
    })
    const entitlement = vi.fn(async () => ({
      allowed: true,
      code: 'ok' as const,
    }))
    const response = await createTranslateResponse(
      translateRequest({ texts: ['Start now'], locale: 'hi' }),
      model,
      null,
      entitlement,
    )

    expect(response.status).toBe(401)
    expect(entitlement).not.toHaveBeenCalled()
    expect(model).not.toHaveBeenCalled()
  })

  it('rejects a translate request with no sessionId (401)', async () => {
    const model = vi.fn(async () => {
      throw new Error('model must not run without a session')
    })
    const entitlement = vi.fn(async () => ({
      allowed: true,
      code: 'ok' as const,
    }))
    const response = await createTranslateResponse(
      translateRequest(
        { texts: ['Start now'], locale: 'hi' },
        { bearer: 'tok', sessionId: '' },
      ),
      model,
      null,
      entitlement,
    )

    expect(response.status).toBe(401)
    expect(entitlement).not.toHaveBeenCalled()
    expect(model).not.toHaveBeenCalled()
  })

  it('returns 403 when the caller is signed in but not the session owner', async () => {
    const model = vi.fn(async () => {
      throw new Error('model must not run for a non-owner')
    })
    const entitlement = vi.fn(async () => ({
      allowed: false,
      code: 'forbidden' as const,
      message: 'You do not own this session',
    }))
    const response = await createTranslateResponse(
      translateRequest(
        { texts: ['Start now'], locale: 'hi' },
        { bearer: 'tok' },
      ),
      model,
      null,
      entitlement,
    )

    expect(response.status).toBe(403)
    expect(entitlement).toHaveBeenCalledWith({
      sessionId: SESSION_ID,
      anonymousOwnerSecret: undefined,
      bearerToken: 'tok',
    })
    expect(model).not.toHaveBeenCalled()
  })

  it('returns 402 when the caller owns the session but is not Pro', async () => {
    const model = vi.fn(async () => {
      throw new Error('model must not run for a non-Pro owner')
    })
    const entitlement = vi.fn(async () => ({
      allowed: false,
      code: 'payment_required' as const,
      message: 'Subscribe to Pro to translate sites.',
    }))
    const response = await createTranslateResponse(
      translateRequest(
        { texts: ['Start now'], locale: 'hi' },
        { bearer: 'tok', anonymousOwnerSecret: 'owner-secret' },
      ),
      model,
      null,
      entitlement,
    )

    expect(response.status).toBe(402)
    expect(entitlement).toHaveBeenCalledWith({
      sessionId: SESSION_ID,
      anonymousOwnerSecret: 'owner-secret',
      bearerToken: 'tok',
    })
    expect(model).not.toHaveBeenCalled()
  })

  it('runs the model when the caller is a Pro owner', async () => {
    const model = vi.fn(async () => JSON.stringify(['Comienza ahora']))
    const entitlement = vi.fn(async () => ({
      allowed: true,
      code: 'ok' as const,
    }))
    const response = await createTranslateResponse(
      translateRequest(
        { texts: ['Start now'], locale: 'es' },
        { bearer: 'tok' },
      ),
      model,
      null,
      entitlement,
    )

    expect(response.status).toBe(200)
    expect(model).toHaveBeenCalled()
  })

  it('skips the entitlement check for English (free locale skip)', async () => {
    const model = vi.fn(async () => {
      throw new Error('model must not run for english')
    })
    const entitlement = vi.fn(async () => ({
      allowed: true,
      code: 'ok' as const,
    }))
    const response = await createTranslateResponse(
      translateRequest({ texts: ['Start now'], locale: 'en' }),
      model,
      null,
      entitlement,
    )

    expect(response.status).toBe(200)
    expect(entitlement).not.toHaveBeenCalled()
    expect(model).not.toHaveBeenCalled()
  })

  it('gates the entries (cache-write) path with the same entitlement check', async () => {
    const setBatch = vi.fn(async () => null)
    const entitlement = vi.fn(async () => ({
      allowed: false,
      code: 'payment_required' as const,
      message: 'Subscribe to Pro.',
    }))
    const response = await createTranslateResponse(
      translateRequest(
        {
          locale: 'hi',
          entries: [{ text: 'Checkout', translation: 'कैशियर' }],
        },
        { bearer: 'tok' },
      ),
      async () => {
        throw new Error('model must not run for a gated entries path')
      },
      { getBatch: async () => [], setBatch },
      entitlement,
    )

    expect(response.status).toBe(402)
    expect(setBatch).not.toHaveBeenCalled()
  })

  it('fails closed (401) when the entitlement client throws', async () => {
    const model = vi.fn(async () => {
      throw new Error('model must not run when entitlement is unverifiable')
    })
    const entitlement = vi.fn(async () => {
      throw new Error('convex unreachable')
    })
    const response = await createTranslateResponse(
      translateRequest(
        { texts: ['Start now'], locale: 'hi' },
        { bearer: 'tok' },
      ),
      model,
      null,
      entitlement,
    )

    expect(response.status).toBe(401)
    expect(model).not.toHaveBeenCalled()
  })

  it('bypasses the entitlement gate when Clerk is disabled', async () => {
    process.env.VITE_DISABLE_CLERK = 'true'
    const model = vi.fn(async () => JSON.stringify(['Comienza ahora']))
    const entitlement = vi.fn(async () => ({
      allowed: true,
      code: 'ok' as const,
    }))
    const response = await createTranslateResponse(
      translateRequest({ texts: ['Start now'], locale: 'es' }),
      model,
      null,
      entitlement,
    )

    expect(response.status).toBe(200)
    expect(entitlement).not.toHaveBeenCalled()
    expect(model).toHaveBeenCalled()
  })
})
