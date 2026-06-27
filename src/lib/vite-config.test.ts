import { describe, expect, it } from 'vitest'

import viteConfig from '../../vite.config.ts'

describe('vite dependency optimization config', () => {
  it('excludes native server-only packages from client dependency optimization', () => {
    const exclude = viteConfig.optimizeDeps?.exclude

    expect(exclude).toBeDefined()
    expect(Array.isArray(exclude)).toBe(true)
    expect(exclude).toContain('playwright')
    expect(exclude).toContain('playwright-core')
    expect(exclude).toContain('fsevents')
  })
})
