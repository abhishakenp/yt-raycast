import { describe, expect, it, vi } from 'vitest'

import {
  createReferralRecordApiResponse,
  createReferralStatusApiResponse,
} from './referral-api-response'

const readJson = async (response: Response) =>
  (await response.json()) as Record<string, unknown>

describe('referral API responses', () => {
  it('requires a bearer token before returning referral status', async () => {
    const client = {
      mutation: vi.fn(),
      query: vi.fn(),
      setAuth: vi.fn(),
    }

    const response = await createReferralStatusApiResponse(
      new Request('https://ship-fast.test/api/referrals/status'),
      client,
    )

    expect(response.status).toBe(401)
    await expect(readJson(response)).resolves.toMatchObject({
      error: 'Sign in to view referrals.',
    })
    expect(client.setAuth).not.toHaveBeenCalled()
    expect(client.mutation).not.toHaveBeenCalled()
    expect(client.query).not.toHaveBeenCalled()
  })

  it('creates the current user referral code before reading referral status', async () => {
    const calls: string[] = []
    const status = {
      code: 'ABC12345',
      discountPercent: 50,
      qualifiedCount: 0,
      referralUrl: 'https://ship-fast.test/?ref=ABC12345',
      referrals: [],
      remainingToUnlock: 2,
      threshold: 2,
      unlocked: false,
    }
    const client = {
      mutation: vi.fn(async () => {
        calls.push('mutation')
        return { code: 'ABC12345' }
      }),
      query: vi.fn(async () => {
        calls.push('query')
        return status
      }),
      setAuth: vi.fn(),
    }

    const response = await createReferralStatusApiResponse(
      new Request('https://ship-fast.test/api/referrals/status', {
        headers: { Authorization: 'Bearer convex-jwt' },
      }),
      client,
    )

    expect(response.status).toBe(200)
    expect(client.setAuth).toHaveBeenCalledWith('convex-jwt')
    expect(calls).toEqual(['mutation', 'query'])
    await expect(readJson(response)).resolves.toEqual(status)
  })

  it('rejects invalid referral record JSON before calling Convex', async () => {
    const client = {
      mutation: vi.fn(),
      query: vi.fn(),
      setAuth: vi.fn(),
    }

    const response = await createReferralRecordApiResponse(
      new Request('https://ship-fast.test/api/referrals/record', {
        body: '{',
        headers: { Authorization: 'Bearer convex-jwt' },
        method: 'POST',
      }),
      client,
    )

    expect(response.status).toBe(400)
    await expect(readJson(response)).resolves.toMatchObject({
      error: 'Invalid JSON.',
    })
    expect(client.setAuth).not.toHaveBeenCalled()
    expect(client.mutation).not.toHaveBeenCalled()
  })

  it('records the submitted referral code and email through the authenticated Convex mutation', async () => {
    const client = {
      mutation: vi.fn(async () => ({ recorded: true, reason: 'ok' })),
      query: vi.fn(),
      setAuth: vi.fn(),
    }

    const response = await createReferralRecordApiResponse(
      new Request('https://ship-fast.test/api/referrals/record', {
        body: JSON.stringify({
          code: 'abc12345',
          email: 'new.customer@gmail.com',
        }),
        headers: { Authorization: 'Bearer convex-jwt' },
        method: 'POST',
      }),
      client,
    )

    expect(response.status).toBe(200)
    expect(client.setAuth).toHaveBeenCalledWith('convex-jwt')
    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      code: 'abc12345',
      email: 'new.customer@gmail.com',
    })
    await expect(readJson(response)).resolves.toEqual({
      recorded: true,
      reason: 'ok',
    })
  })
})
