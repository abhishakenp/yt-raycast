import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getDefaultRuntimeConvexEnv,
  getRuntimeConvexUrl,
} from '@/shared/env/convex-runtime'

describe('runtime Convex URL', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('prefers the self-hosted server URL', () => {
    expect(
      getRuntimeConvexUrl({
        CONVEX_SELF_HOSTED_URL: 'https://self-hosted.example.com',
        CONVEX_URL: 'https://cloud.example.com',
        VITE_CONVEX_SELF_HOSTED_URL: 'https://browser-self-hosted.example.com',
        VITE_CONVEX_URL: 'https://browser-cloud.example.com',
      }),
    ).toBe('https://self-hosted.example.com')
  })

  it('falls back to browser-safe Convex URLs', () => {
    expect(
      getRuntimeConvexUrl({
        VITE_CONVEX_URL: 'https://browser-cloud.example.com',
      }),
    ).toBe('https://browser-cloud.example.com')
  })

  it('requires a configured URL', () => {
    expect(() => getRuntimeConvexUrl({})).toThrow(
      'Convex URL is not configured',
    )
  })

  it('builds its default env from browser-safe Vite env and Node process env', () => {
    vi.stubEnv('VITE_CONVEX_URL', 'https://vite-cloud.example.com')
    vi.stubEnv('CONVEX_URL', 'https://server-cloud.example.com')

    expect(getDefaultRuntimeConvexEnv()).toEqual(
      expect.objectContaining({
        CONVEX_URL: 'https://server-cloud.example.com',
        VITE_CONVEX_URL: 'https://vite-cloud.example.com',
      }),
    )
  })

  it('keeps bare server URLs ahead of browser-safe fallbacks at runtime', () => {
    vi.stubEnv('VITE_CONVEX_URL', 'https://vite-cloud.example.com')
    vi.stubEnv('CONVEX_URL', 'https://server-cloud.example.com')

    expect(getRuntimeConvexUrl()).toBe('https://server-cloud.example.com')
  })
})
