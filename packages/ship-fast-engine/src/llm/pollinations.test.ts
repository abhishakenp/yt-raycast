import { describe, expect, it, vi } from 'vitest'

describe('Pollinations text adapter', () => {
  it('requires a server-side API key', async () => {
    vi.stubEnv('POLLINATIONS_API_KEY', '')
    const { pollinationsText } = await import('./pollinations')

    expect(() => pollinationsText('openai')).toThrow(
      'POLLINATIONS_API_KEY is not set',
    )
    vi.unstubAllEnvs()
  })
})
