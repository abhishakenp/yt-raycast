// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { postDubAttribution } from './partner-client'

const axiosPostMock = vi.hoisted(() => vi.fn())

vi.mock('axios', () => ({
  default: {
    post: axiosPostMock,
  },
}))

function setClerk(clerk: unknown): void {
  Reflect.set(window, 'Clerk', clerk)
}

describe('partner client', () => {
  beforeEach(() => {
    axiosPostMock.mockReset()
    Reflect.deleteProperty(window, 'Clerk')
  })

  afterEach(() => {
    Reflect.deleteProperty(window, 'Clerk')
  })

  it('posts Dub attribution with the Clerk bearer token', async () => {
    setClerk({
      session: { getToken: vi.fn(async () => 'convex-token') },
      user: { id: 'user_123' },
    })
    axiosPostMock.mockResolvedValueOnce({
      data: { claimed: true, reason: 'claimed' },
    })

    await expect(postDubAttribution('click_123')).resolves.toEqual({
      claimed: true,
      reason: 'claimed',
    })
    expect(axiosPostMock).toHaveBeenCalledWith(
      '/api/partners/attribution',
      { clickId: 'click_123' },
      {
        headers: {
          Authorization: 'Bearer convex-token',
          'Content-Type': 'application/json',
        },
      },
    )
  })

  it('returns null while auth is unavailable or the request fails', async () => {
    await expect(postDubAttribution('click_123')).resolves.toBeNull()
    expect(axiosPostMock).not.toHaveBeenCalled()

    setClerk({
      session: { getToken: vi.fn(async () => 'convex-token') },
      user: { id: 'user_123' },
    })
    axiosPostMock.mockRejectedValueOnce(new Error('network unavailable'))

    await expect(postDubAttribution('click_123')).resolves.toBeNull()
  })
})
