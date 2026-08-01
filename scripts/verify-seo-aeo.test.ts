import { spawnSync } from 'node:child_process'

import { describe, expect, it } from 'vitest'

describe('verify-seo-aeo CLI', () => {
  it('validates generated SEO and AEO artifacts without requiring a live deployment', () => {
    const result = spawnSync(
      'bun',
      ['scripts/verify-seo-aeo.mjs', '--static-only'],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
      },
    )

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('"mode": "static"')
  })

  it('loads the TypeScript HTML renderer before validating CLI input', () => {
    const result = spawnSync(
      'bun',
      ['scripts/verify-seo-aeo.mjs', '--timeout-ms=1'],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
      },
    )

    expect(result.status).toBe(1)
    expect(`${result.stdout}\n${result.stderr}`).toContain(
      '--timeout-ms must be at least 1000',
    )
  })
})
