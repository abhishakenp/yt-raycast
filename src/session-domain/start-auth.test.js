import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  createSession,
  initSessionDir,
  readAnonOwnerSecret,
} from '../server/sessions.js'
import {
  assertStartSessionAccess,
  resolveStartClerkUser,
} from './start-auth.js'

let tmpRoot = null

function createOwnedSession(userId = null) {
  tmpRoot = mkdtempSync(join(tmpdir(), 'ship-fast-start-auth-'))
  initSessionDir(tmpRoot)
  const session = createSession(tmpRoot, 'A website for Atlas Notes', userId)
  mkdirSync(session.workspace, { recursive: true })
  return session
}

afterEach(() => {
  if (tmpRoot) rmSync(tmpRoot, { recursive: true, force: true })
  tmpRoot = null
})

describe('Start auth bridge', () => {
  it('resolves Clerk users from bearer headers or explicit tokens', async () => {
    const verified = []
    const verifyClerkToken = async (token) => {
      verified.push(token)
      return { sub: `user_${token}`, email: `${token}@example.com` }
    }

    await expect(
      resolveStartClerkUser({ authorization: 'Bearer alpha' }, { verifyClerkToken }),
    ).resolves.toEqual({
      uid: 'user_alpha',
      clerkUserId: 'user_alpha',
      email: 'alpha@example.com',
    })
    await expect(
      resolveStartClerkUser({ authToken: 'beta' }, { verifyClerkToken }),
    ).resolves.toEqual({
      uid: 'user_beta',
      clerkUserId: 'user_beta',
      email: 'beta@example.com',
    })
    expect(verified).toEqual(['alpha', 'beta'])
  })

  it('keeps anonymous sessions protected by owner secret', () => {
    const session = createOwnedSession()

    expect(() =>
      assertStartSessionAccess(session, {
        action: 'download',
        ownerSecret: 'wrong',
      }),
    ).toThrow('Anonymous owner secret is required')

    expect(() =>
      assertStartSessionAccess(session, {
        action: 'download',
        ownerSecret: readAnonOwnerSecret(session.workspace),
      }),
    ).not.toThrow()
  })

  it('allows only the owning authenticated user for user sessions', () => {
    const session = createOwnedSession('user_clerk_1')

    expect(() =>
      assertStartSessionAccess(session, {
        action: 'deploy',
      }),
    ).toThrow('Sign in with Clerk is required')
    expect(() =>
      assertStartSessionAccess(session, {
        action: 'deploy',
        authUser: { uid: 'user_clerk_2' },
      }),
    ).toThrow('belongs to another user')
    expect(() =>
      assertStartSessionAccess(session, {
        action: 'deploy',
        authUser: { uid: 'user_clerk_1' },
      }),
    ).not.toThrow()
  })
})
