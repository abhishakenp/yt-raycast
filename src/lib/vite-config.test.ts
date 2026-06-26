import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const readViteConfig = (): string =>
  readFileSync(join(process.cwd(), 'vite.config.ts'), 'utf8')

describe('vite dependency optimization config', () => {
  it('excludes native server-only packages from client dependency optimization', () => {
    const source = readViteConfig()

    expect(source).toContain('optimizeDeps')
    expect(source).toContain('playwright')
    expect(source).toContain('playwright-core')
    expect(source).toContain('fsevents')
  })
})
