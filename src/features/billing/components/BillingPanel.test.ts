import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

describe('BillingPanel', () => {
  it('uses Clerk Convex JWTs for Convex-backed billing APIs', () => {
    const source = readFileSync(
      'src/features/billing/components/BillingPanel.tsx',
      'utf8',
    )

    expect(source).toContain("await getToken({ template: 'convex' })")
    expect(source.match(/template: 'convex'/g)).toHaveLength(2)
    expect(source).not.toContain('await getToken()')
  })
})
