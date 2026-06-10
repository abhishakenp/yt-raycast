import { describe, expect, it } from 'vitest'
import { getRuntimeConvexUrl } from '@/shared/env/convex-runtime'

describe('runtime Convex URL', () => {
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
    expect(getRuntimeConvexUrl({ VITE_CONVEX_URL: 'https://browser-cloud.example.com' })).toBe(
      'https://browser-cloud.example.com',
    )
  })

  it('requires a configured URL', () => {
    expect(() => getRuntimeConvexUrl({})).toThrow('Convex URL is not configured')
  })
})
