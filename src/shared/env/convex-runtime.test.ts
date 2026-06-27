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

  it('prefers VITE_CONVEX_SELF_HOSTED_URL over VITE_CONVEX_URL and CONVEX_URL', () => {
    expect(
      getRuntimeConvexUrl({
        VITE_CONVEX_SELF_HOSTED_URL: 'https://browser-self-hosted.example.com',
        VITE_CONVEX_URL: 'https://browser-cloud.example.com',
        CONVEX_URL: 'https://cloud.example.com',
      }),
    ).toBe('https://browser-self-hosted.example.com')
  })

  it('prefers VITE_CONVEX_URL over CONVEX_URL to match the frontend deployment', () => {
    expect(
      getRuntimeConvexUrl({
        CONVEX_URL: 'https://cloud-cli.example.com',
        VITE_CONVEX_URL: 'https://browser-cloud.example.com',
      }),
    ).toBe('https://browser-cloud.example.com')
  })

  it('falls back to CONVEX_URL when no VITE_ URL is set', () => {
    expect(
      getRuntimeConvexUrl({
        CONVEX_URL: 'https://cloud.example.com',
      }),
    ).toBe('https://cloud.example.com')
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
})
