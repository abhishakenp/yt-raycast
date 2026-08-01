import { afterEach, describe, expect, it } from 'vitest'

import {
  CIRCUIT_BREAKER_OPEN_MS,
  PROVIDER_FALLBACK_MODELS,
  isProviderCircuitOpen,
  providerFallbackModelIds,
  recordProviderFailure,
  recordProviderSuccess,
  resetProviderCircuitsForTest,
} from './provider-fallback'

afterEach(resetProviderCircuitsForTest)

describe('provider fallback circuit breaker', () => {
  it('uses Cerebras, then Groq, then Pollinations when all circuits are closed', () => {
    expect(providerFallbackModelIds()).toEqual(PROVIDER_FALLBACK_MODELS)
  })

  it('keeps an explicitly selected provider as the first attempt', () => {
    expect(providerFallbackModelIds('openai/gpt-oss-120b')).toEqual([
      'openai/gpt-oss-120b',
      'cerebras/gpt-oss-120b',
      'pollinations/openai',
    ])
  })

  it('opens a failed provider after five consecutive failures for sixty seconds', () => {
    const now = 1_000
    for (let attempt = 0; attempt < 5; attempt += 1) {
      recordProviderFailure('cerebras/gpt-oss-120b', now)
    }

    expect(isProviderCircuitOpen('cerebras/gpt-oss-120b', now)).toBe(true)
    expect(providerFallbackModelIds(undefined, now)).not.toContain(
      'cerebras/gpt-oss-120b',
    )
    expect(
      isProviderCircuitOpen(
        'cerebras/gpt-oss-120b',
        now + CIRCUIT_BREAKER_OPEN_MS,
      ),
    ).toBe(false)
  })

  it('resets a provider failure count after a successful request', () => {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      recordProviderFailure('openai/gpt-oss-120b')
    }
    recordProviderSuccess('openai/gpt-oss-120b')
    recordProviderFailure('openai/gpt-oss-120b')

    expect(isProviderCircuitOpen('openai/gpt-oss-120b')).toBe(false)
  })
})
