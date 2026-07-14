/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const issuer = 'https://clerk.release.test'

function asUser(t: ReturnType<typeof convexTest>, userId: string) {
  return t.withIdentity({
    issuer,
    subject: userId,
    tokenIdentifier: `${issuer}|${userId}`,
  })
}

function connectionArgs(state: string, login = 'release-user') {
  return {
    state,
    githubUserId: 44,
    githubLogin: login,
    accessToken: `token-${login}`,
    scopes: [' Repo ', 'repo', 'USER', '', ' user '],
  }
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('GitHub OAuth replay and validation boundaries', () => {
  it('invalidates the previous state when the same identity starts again', async () => {
    const t = convexTest(schema, modules)
    const user = asUser(t, 'replacement-user')

    await user.mutation(api.github.createOAuthState, {
      state: 'state-old',
      returnTo: '/dashboard',
      expiresAt: Date.now() + 60_000,
    })
    await user.mutation(api.github.createOAuthState, {
      state: 'state-current',
      returnTo: '/dashboard',
      expiresAt: Date.now() + 60_000,
    })

    await expect(
      user.mutation(
        api.github.completeOAuthConnection,
        connectionArgs('state-old'),
      ),
    ).rejects.toThrow('OAUTH_STATE_INVALID')
    await expect(
      user.mutation(
        api.github.completeOAuthConnection,
        connectionArgs('state-current'),
      ),
    ).resolves.toMatchObject({ githubLogin: 'release-user' })
  })

  it('cancellation is idempotent and makes completion impossible', async () => {
    const t = convexTest(schema, modules)
    const user = asUser(t, 'cancel-user')

    await user.mutation(api.github.createOAuthState, {
      state: 'state-cancelled',
      returnTo: '/exports',
      expiresAt: Date.now() + 60_000,
    })

    await expect(
      user.mutation(api.github.cancelOAuthState, {
        state: 'state-cancelled',
      }),
    ).resolves.toEqual({ returnTo: '/exports' })
    await expect(
      user.mutation(api.github.cancelOAuthState, {
        state: 'state-cancelled',
      }),
    ).resolves.toEqual({ returnTo: '/' })
    await expect(
      user.mutation(
        api.github.completeOAuthConnection,
        connectionArgs('state-cancelled'),
      ),
    ).rejects.toThrow('OAUTH_STATE_INVALID')
  })

  it('consumes OAuth state once and preserves the first connection on replay', async () => {
    const t = convexTest(schema, modules)
    const user = asUser(t, 'replay-user')

    await user.mutation(api.github.createOAuthState, {
      state: 'state-single-use',
      returnTo: '/',
      expiresAt: Date.now() + 60_000,
    })
    await user.mutation(
      api.github.completeOAuthConnection,
      connectionArgs('state-single-use', 'first-login'),
    )

    await expect(
      user.mutation(
        api.github.completeOAuthConnection,
        connectionArgs('state-single-use', 'replayed-login'),
      ),
    ).rejects.toThrow('OAUTH_STATE_INVALID')
    await expect(
      user.query(api.github.getConnectionForCurrentUser, {}),
    ).resolves.toMatchObject({
      githubLogin: 'first-login',
      accessToken: 'token-first-login',
    })
  })

  it('normalizes and deduplicates granted scopes', async () => {
    const t = convexTest(schema, modules)
    const user = asUser(t, 'scope-user')

    await user.mutation(api.github.createOAuthState, {
      state: 'state-scopes',
      returnTo: '/',
      expiresAt: Date.now() + 60_000,
    })

    await expect(
      user.mutation(
        api.github.completeOAuthConnection,
        connectionArgs('state-scopes'),
      ),
    ).resolves.toMatchObject({ scopes: ['repo', 'user'] })
  })

  it('isolates anonymous connections by hashed client id', async () => {
    vi.stubEnv('VITE_DISABLE_CLERK', 'true')
    const t = convexTest(schema, modules)

    await t.mutation(api.github.createOAuthState, {
      state: 'state-anonymous-a',
      returnTo: '/',
      expiresAt: Date.now() + 60_000,
      anonymousClientId: 'anonymous-a',
    })
    await t.mutation(
      api.github.completeOAuthConnection,
      connectionArgs('state-anonymous-a', 'anonymous-login'),
    )

    await expect(
      t.query(api.github.getConnectionForCurrentUser, {
        anonymousClientId: 'anonymous-b',
      }),
    ).resolves.toBeNull()
    await expect(
      t.query(api.github.getConnectionForCurrentUser, {
        anonymousClientId: 'anonymous-a',
      }),
    ).resolves.toMatchObject({ githubLogin: 'anonymous-login' })
  })

  it('rejects empty states and external return targets at creation time', async () => {
    const t = convexTest(schema, modules)
    const user = asUser(t, 'validation-user')
    const results = await Promise.allSettled([
      user.mutation(api.github.createOAuthState, {
        state: '',
        returnTo: '/',
        expiresAt: Date.now() + 60_000,
      }),
      user.mutation(api.github.createOAuthState, {
        state: 'external-absolute',
        returnTo: 'https://attacker.example/phish',
        expiresAt: Date.now() + 60_000,
      }),
      user.mutation(api.github.createOAuthState, {
        state: 'external-protocol-relative',
        returnTo: '//attacker.example/phish',
        expiresAt: Date.now() + 60_000,
      }),
    ])

    expect(results.map((result) => result.status)).toEqual([
      'rejected',
      'rejected',
      'rejected',
    ])
  })
})
