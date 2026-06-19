import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const readConvexSource = (path: string) =>
  readFileSync(join(process.cwd(), 'convex', path), 'utf8')

describe('GitHub Convex integration source invariants', () => {
  it('stores OAuth state and GitHub connections keyed by authenticated identity', () => {
    const schema = readConvexSource('schema.ts')
    const github = readConvexSource('github.ts')

    expect(schema).toContain('githubConnections: defineTable')
    expect(schema).toContain('githubOAuthStates: defineTable')
    expect(schema).toContain('clerkTokenIdentifier: v.string()')
    expect(schema).toContain(".index('by_clerkTokenIdentifier'")
    expect(github).toContain('ctx.auth.getUserIdentity()')
    expect(github).toContain('identity.tokenIdentifier')
    expect(github).toContain('createOAuthState')
    expect(github).toContain('completeOAuthConnection')
    expect(github).toContain('getConnectionForCurrentUser')
    expect(github).not.toContain('userId: v.string()')
    expect(github).not.toContain('clerkUserId: v.string()')
  })
})
