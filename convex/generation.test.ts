import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))

describe('convex generation action', () => {
  it('passes the session preferred language to the homepage orchestrator', () => {
    const source = readFileSync(join(here, 'generation.ts'), 'utf8')

    expect(source).toContain('preferredLanguage: session.preferredLanguage')
  })
})
