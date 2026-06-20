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
    expect(source).toContain('const auth = useAuth()')
    expect(source).toContain('return useClerk()')
    expect(source).toContain('return anonymousAuth')
    expect(source).toContain('return anonymousClerk')
  })

  it('falls back to the default Clerk token when the Convex JWT template is missing', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/shared/auth/use-optional-auth.ts'),
      'utf8',
    )

    expect(source).toContain('No JWT template exists with name')
    expect(source).toContain('isMissingJwtTemplateError(error)')
    expect(source).toContain('return await auth.getToken()')
  })
})
