import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { resolvePexelsSearchQuery } from '../routes/api/pexels'

describe('/api/pexels query resolution', () => {
  it('does not import engine config on the route-tree startup path', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/routes/api/pexels.ts'),
      'utf8',
    )

    expect(source).not.toContain('@ship-fast/engine/config')
    expect(source).toContain("readServerEnv('PEXELS_API_KEY')")
    expect(source).toContain("readServerEnv('UNSPLASH_ACCESS_KEY')")
  })

  it('derives semantic stock queries for raw prompt text', () => {
    expect(
      resolvePexelsSearchQuery(
        'Elegant dental clinic waiting room with patients',
        null,
      ),
    ).toBe('medical clinic healthcare dental waiting room patients')
  })

  it('keeps pre-resolved generated image queries stable when a seed is present', () => {
    expect(
      resolvePexelsSearchQuery(
        'medical clinic healthcare dental waiting room patients',
        'Elegant dental clinic waiting room with patients',
      ),
    ).toBe('medical clinic healthcare dental waiting room patients')
  })
})
