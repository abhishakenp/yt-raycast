import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('useOptionalAuth', () => {
  it('does not import Clerk React hooks on anonymous routes', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/shared/auth/use-optional-auth.ts'),
      'utf8',
    )

    expect(source).not.toContain('@clerk/tanstack-react-start')
    expect(source).not.toContain('useAuth()')
    expect(source).not.toContain('useClerk()')
    expect(source).toContain('openSignInEventName')
    expect(source).toContain('window.dispatchEvent')
    expect(source).toContain('getClerk()?.session')
    expect(source).toContain('window.addEventListener(openSignInEventName')
    expect(source).not.toContain('setInterval')
    expect(source).toContain(': anonymousAuth')
    expect(source).toContain(': anonymousClerk')
  })

  it('falls back to the default Clerk token when the Convex JWT template is missing', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/shared/auth/use-optional-auth.ts'),
      'utf8',
    )

    expect(source).toContain('No JWT template exists with name')
    expect(source).toContain('isMissingJwtTemplateError(error)')
    expect(source).toContain('return await session.getToken()')
  })
})
