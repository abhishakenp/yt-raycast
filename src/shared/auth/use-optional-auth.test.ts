import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('useOptionalAuth', () => {
  it('falls back to anonymous auth when Clerk is configured but not mounted', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/shared/auth/use-optional-auth.ts'),
      'utf8',
    )

    expect(source).toContain('try {')
    expect(source).toContain('return useAuth()')
    expect(source).toContain('return useClerk()')
    expect(source).toContain('return anonymousAuth')
    expect(source).toContain('return anonymousClerk')
  })
})
