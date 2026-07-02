import { convexTest } from 'convex-test'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const ISS = 'https://clerk.test'
const id = (u: string) => `${ISS}|${u}`

const asUser = (t: ReturnType<typeof convexTest>, user: string) =>
  t.withIdentity({
    tokenIdentifier: id(user),
    subject: user,
    issuer: ISS,
  })

describe('GitHub Convex integration', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('requires authentication to create OAuth state', async () => {
    const t = convexTest(schema, modules)

    await expect(
      t.mutation(api.github.createOAuthState, {
        state: 'state-1',
        returnTo: '/',
        expiresAt: Date.now() + 60_000,
      }),
    ).rejects.toThrow('AUTH_REQUIRED')
  })

  it('creates, completes, and reads a GitHub OAuth connection for an authed user', async () => {
    const t = convexTest(schema, modules)

    // No connection initially.
    await expect(
      asUser(t, 'alice').query(api.github.getConnectionForCurrentUser, {}),
    ).resolves.toBeNull()

    // Create OAuth state.
    await asUser(t, 'alice').mutation(api.github.createOAuthState, {
      state: 'state-alice',
      returnTo: '/dashboard',
      expiresAt: Date.now() + 60_000,
    })

    // Complete the OAuth connection.
    const result = await asUser(t, 'alice').mutation(
      api.github.completeOAuthConnection,
      {
        state: 'state-alice',
        githubUserId: 12345,
        githubLogin: 'alice-gh',
        accessToken: 'gho_token',
        scopes: ['repo', 'user'],
      },
    )

    expect(result.githubLogin).toBe('alice-gh')
    expect(result.returnTo).toBe('/dashboard')
    expect(result.scopes).toEqual(['repo', 'user'])

    // Connection is now visible to the current user.
    const connection = await asUser(t, 'alice').query(
      api.github.getConnectionForCurrentUser,
      {},
    )
    expect(connection).not.toBeNull()
    expect(connection?.githubLogin).toBe('alice-gh')
    expect(connection?.githubUserId).toBe(12345)
    expect(connection?.accessToken).toBe('gho_token')
    expect(connection?.scopes).toEqual(['repo', 'user'])
  })

  it('rejects completing an expired or invalid OAuth state', async () => {
    const t = convexTest(schema, modules)

    await asUser(t, 'bob').mutation(api.github.createOAuthState, {
      state: 'state-bob-expired',
      returnTo: '/',
      expiresAt: Date.now() - 1_000,
    })

    await expect(
      asUser(t, 'bob').mutation(api.github.completeOAuthConnection, {
        state: 'state-bob-expired',
        githubUserId: 67890,
        githubLogin: 'bob-gh',
        accessToken: 'gho_token_bob',
        scopes: ['repo'],
      }),
    ).rejects.toThrow('OAUTH_STATE_INVALID')

    await expect(
      asUser(t, 'bob').mutation(api.github.completeOAuthConnection, {
        state: 'nonexistent-state',
        githubUserId: 67890,
        githubLogin: 'bob-gh',
        accessToken: 'gho_token_bob',
        scopes: ['repo'],
      }),
    ).rejects.toThrow('OAUTH_STATE_INVALID')
  })

  it('isolates GitHub connections per authenticated identity', async () => {
    const t = convexTest(schema, modules)

    await asUser(t, 'alice').mutation(api.github.createOAuthState, {
      state: 'state-alice-2',
      returnTo: '/',
      expiresAt: Date.now() + 60_000,
    })
    await asUser(t, 'alice').mutation(api.github.completeOAuthConnection, {
      state: 'state-alice-2',
      githubUserId: 111,
      githubLogin: 'alice-gh',
      accessToken: 'gho_alice',
      scopes: ['repo'],
    })

    await asUser(t, 'carol').mutation(api.github.createOAuthState, {
      state: 'state-carol',
      returnTo: '/',
      expiresAt: Date.now() + 60_000,
    })
    await asUser(t, 'carol').mutation(api.github.completeOAuthConnection, {
      state: 'state-carol',
      githubUserId: 222,
      githubLogin: 'carol-gh',
      accessToken: 'gho_carol',
      scopes: ['repo'],
    })

    const aliceConnection = await asUser(t, 'alice').query(
      api.github.getConnectionForCurrentUser,
      {},
    )
    expect(aliceConnection?.githubLogin).toBe('alice-gh')

    const carolConnection = await asUser(t, 'carol').query(
      api.github.getConnectionForCurrentUser,
      {},
    )
    expect(carolConnection?.githubLogin).toBe('carol-gh')
  })

  it('supports anonymous GitHub OAuth when VITE_DISABLE_CLERK is true', async () => {
    vi.stubEnv('VITE_DISABLE_CLERK', 'true')
    const t = convexTest(schema, modules)
    const anonClientId = 'anon_test_client_id'

    // No connection initially.
    await expect(
      t.query(api.github.getConnectionForCurrentUser, {
        anonymousClientId: anonClientId,
      }),
    ).resolves.toBeNull()

    // Create OAuth state without identity.
    await t.mutation(api.github.createOAuthState, {
      state: 'state-anon',
      returnTo: '/dashboard',
      expiresAt: Date.now() + 60_000,
      anonymousClientId: anonClientId,
    })

    // Complete the OAuth connection.
    const result = await t.mutation(api.github.completeOAuthConnection, {
      state: 'state-anon',
      githubUserId: 99999,
      githubLogin: 'anon-gh',
      accessToken: 'gho_anon_token',
      scopes: ['repo'],
    })

    expect(result.githubLogin).toBe('anon-gh')
    expect(result.returnTo).toBe('/dashboard')

    // Connection is now visible via anonymousClientId.
    const connection = await t.query(api.github.getConnectionForCurrentUser, {
      anonymousClientId: anonClientId,
    })
    expect(connection).not.toBeNull()
    expect(connection?.githubLogin).toBe('anon-gh')
    expect(connection?.accessToken).toBe('gho_anon_token')
  })
})
