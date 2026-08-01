import { beforeEach, describe, expect, it } from 'vitest'

import {
  admitModelCall,
  dailyCallCap,
  isModelSpendKilled,
  modelSpendBlockedResponse,
  resetSpendCounters,
} from './spend-cap'

describe('global model spend cap', () => {
  beforeEach(() => {
    resetSpendCounters()
  })

  it('allows everything when no cap is configured', () => {
    const env = {} as NodeJS.ProcessEnv
    expect(dailyCallCap(env)).toBe(Number.POSITIVE_INFINITY)
    for (let call = 0; call < 100; call += 1) {
      expect(admitModelCall(Date.now(), env).allowed).toBe(true)
    }
  })

  it('stops admitting calls once the daily ceiling is reached', () => {
    const env = { MODEL_DAILY_CALL_CAP: '3' } as NodeJS.ProcessEnv
    const now = 1_700_000_000_000

    expect(admitModelCall(now, env).allowed).toBe(true)
    expect(admitModelCall(now, env).allowed).toBe(true)
    expect(admitModelCall(now, env).allowed).toBe(true)

    const blocked = admitModelCall(now, env)
    expect(blocked).toEqual({ allowed: false, reason: 'daily_cap' })
  })

  it('rolls the window over after a day', () => {
    const env = { MODEL_DAILY_CALL_CAP: '1' } as NodeJS.ProcessEnv
    const now = 1_700_000_000_000

    expect(admitModelCall(now, env).allowed).toBe(true)
    expect(admitModelCall(now, env).allowed).toBe(false)
    expect(admitModelCall(now + 24 * 60 * 60 * 1000 + 1, env).allowed).toBe(
      true,
    )
  })

  it('counts calls from every caller against one global budget', () => {
    const env = { MODEL_DAILY_CALL_CAP: '1' } as NodeJS.ProcessEnv
    const now = 1_700_000_000_000

    expect(admitModelCall(now, env).allowed).toBe(true)
    expect(admitModelCall(now, env).allowed).toBe(false)
  })

  it('the kill switch blocks everything regardless of the cap', () => {
    const env = { DISABLE_MODEL_SPEND: 'true' } as NodeJS.ProcessEnv
    expect(isModelSpendKilled(env)).toBe(true)
    expect(admitModelCall(Date.now(), env)).toEqual({
      allowed: false,
      reason: 'kill_switch',
    })
  })

  it('ignores a malformed cap instead of blocking every call', () => {
    const env = { MODEL_DAILY_CALL_CAP: 'not-a-number' } as NodeJS.ProcessEnv
    expect(admitModelCall(Date.now(), env).allowed).toBe(true)
  })

  it('responds 503 with a retry hint when blocked', async () => {
    const response = modelSpendBlockedResponse({
      allowed: false,
      reason: 'daily_cap',
    })
    expect(response.status).toBe(503)
    expect(response.headers.get('Retry-After')).toBe('3600')
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining('temporarily'),
    })
  })
})
