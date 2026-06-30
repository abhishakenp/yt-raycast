import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  getDefaultRuntimeConvexEnv,
  getRuntimeConvexUrl,
} from '@/shared/env/convex-runtime'

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

  it('can build its default env from browser-safe Vite env and Node process env', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/shared/env/convex-runtime.ts'),
      'utf8',
    )

    expect(source).toContain('import.meta')
    expect(source).toContain('typeof process')
    expect(getDefaultRuntimeConvexEnv()).toEqual(
      expect.objectContaining({ MODE: expect.any(String) }),
    )
  })

  it('exposes only public Convex URL env names to the Vite client', () => {
    const source = readFileSync(join(process.cwd(), 'vite.config.ts'), 'utf8')

    expect(source).toContain("'CONVEX_URL'")
    expect(source).toContain("'CONVEX_SELF_HOSTED_URL'")
    expect(source).not.toContain("'CONVEX_'")
    expect(source).not.toContain("'CONVEX_SELF_HOSTED_ADMIN_KEY'")
  })
})
