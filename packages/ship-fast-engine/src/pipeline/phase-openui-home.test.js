import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(join(here, 'phase-openui-home.ts'), 'utf8')

describe('OpenUI homepage phase', () => {
  it('calls the faithful GenUI orchestrator directly without an outer retry wrapper', () => {
    expect(source).toContain('runHomepageOrchestrator({')
    expect(source).not.toContain('MAX_ATTEMPTS')
    expect(source).not.toMatch(/for\s*\(\s*let\s+attempt\s*=/)
    expect(source).not.toContain('attempt ${attempt}')
  })
})
