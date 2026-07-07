import { describe, expect, it, vi } from 'vitest'

import { withLLMRetry } from './retry'

describe('withLLMRetry', () => {
  it('retries transient model errors and returns the eventual success result', async () => {
    const fn = vi
      .fn()
      .mockResolvedValueOnce({ content: '', error: 'rate limit exceeded' })
      .mockResolvedValueOnce({ content: 'ok' })

    await expect(
      withLLMRetry(fn, { attempts: 3, baseDelayMs: 0 }),
    ).resolves.toEqual({
      content: 'ok',
    })
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('returns permanent model errors without retrying', async () => {
    const fn = vi
      .fn()
      .mockResolvedValue({ content: '', error: 'invalid api key' })

    await expect(
      withLLMRetry(fn, { attempts: 3, baseDelayMs: 0 }),
    ).resolves.toEqual({
      content: '',
      error: 'invalid api key',
    })
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries thrown failures and throws the final error after attempts are exhausted', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('connection reset'))
      .mockRejectedValueOnce(new Error('bad gateway'))

    await expect(
      withLLMRetry(fn, { attempts: 2, baseDelayMs: 0 }),
    ).rejects.toThrow('bad gateway')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('throws the last transient model error if no attempt succeeds', async () => {
    const fn = vi
      .fn()
      .mockResolvedValue({ content: '', error: '503 service unavailable' })

    await expect(
      withLLMRetry(fn, { attempts: 2, baseDelayMs: 0 }),
    ).rejects.toThrow('503 service unavailable')
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
