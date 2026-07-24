import { describe, expect, it } from 'vitest'

import subdomainRewrite from '../../server/middleware/subdomain-rewrite'

describe('subdomain rewrite middleware', () => {
  it('loads with the app-level h3 dependency available', () => {
    expect(typeof subdomainRewrite).toBe('function')
  })
})
