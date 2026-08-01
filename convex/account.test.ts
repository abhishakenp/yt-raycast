/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api } from './_generated/api'
import { deletionTombstone } from './account'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const ISSUER = 'https://clerk.test'
const identityFor = (subject: string) => ({
  issuer: ISSUER,
  subject,
  tokenIdentifier: `${ISSUER}|${subject}`,
})

const seedUser = async (
  t: ReturnType<typeof convexTest>,
  userId: string,
): Promise<void> => {
  await t.run(async (ctx) => {
    const sessionId = await ctx.db.insert('sessions', {
      userId,
      prompt: 'A site to erase',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      createdAt: 1,
    })
    const deploymentId = await ctx.db.insert('deployments', {
      sessionId,
      slug: `lakebed-${userId}`,
      url: 'https://example.lakebed.app',
      status: 'ready',
      provider: 'lakebed',
      lakebedDeployId: `deploy-${userId}`,
      createdAt: 1,
      updatedAt: 1,
    })
    await ctx.db.insert('commerceTenants', {
      deploymentId,
      sessionId,
      deploymentSlug: `medusa-${userId}`,
      provider: 'medusa',
      providerTenantId: `tenant-${userId}`,
      status: 'ready',
      syncStatus: 'ready',
      backendUrl: 'https://medusa.example.test',
      adminUrl: 'https://medusa.example.test/app',
      storefrontUrl: 'https://shop.example.test',
      createdAt: 1,
      updatedAt: 1,
    })
    await ctx.db.insert('exports', {
      sessionId,
      target: 'html',
      status: 'ready',
      githubUrl: `https://github.com/example/${userId}`,
      createdAt: 1,
      updatedAt: 1,
    })
    await ctx.db.insert('githubConnections', {
      clerkTokenIdentifier: userId,
      clerkUserId: userId.split('|').at(-1),
      githubUserId: 42,
      githubLogin: 'example',
      accessToken: 'github-token',
      scopes: ['repo'],
      connectedAt: 1,
      updatedAt: 1,
    })
    await ctx.db.insert('githubOAuthStates', {
      state: `state-${userId}`,
      clerkTokenIdentifier: userId,
      clerkUserId: userId.split('|').at(-1),
      returnTo: '/',
      createdAt: 1,
      expiresAt: 2,
    })
    await ctx.db.insert('customerCredits', {
      userId,
      remaining: 3,
      updatedAt: 1,
    })
    await ctx.db.insert('creditLedger', {
      userId,
      amount: 3,
      balanceAfter: 3,
      reason: 'purchase',
      createdAt: 1,
    })
    await ctx.db.insert('subscriptions', {
      userId,
      provider: 'stripe',
      status: 'active',
      planId: 'pro',
      createdAt: 1,
      updatedAt: 1,
    })
  })
}

describe('account deletion', () => {
  it('erases the caller data and anonymises the financial trail', async () => {
    const t = convexTest(schema, modules)
    const identity = identityFor('erasing-user')
    await seedUser(t, identity.tokenIdentifier)

    const result = await t
      .withIdentity(identity)
      .mutation(api.account.deleteAccount, {
        confirmation: 'DELETE MY ACCOUNT',
      })

    expect(result.sessionsDeleted).toBe(1)
    expect(result.externalDeletionRequests).toBe(3)

    const { sessions, credits, ledger, subscriptions, outbox, github } =
      await t.run(async (ctx) => ({
        sessions: await ctx.db.query('sessions').collect(),
        credits: await ctx.db.query('customerCredits').collect(),
        ledger: await ctx.db.query('creditLedger').collect(),
        subscriptions: await ctx.db.query('subscriptions').collect(),
        outbox: await ctx.db.query('accountDeletionOutbox').collect(),
        github: await ctx.db.query('githubConnections').collect(),
      }))

    expect(sessions).toHaveLength(0)
    expect(credits).toHaveLength(0)
    // Payment records survive for tax/audit, without a link to the person.
    const tombstone = deletionTombstone(identity.tokenIdentifier)
    expect(ledger).toHaveLength(1)
    expect(ledger[0]?.userId).toBe(tombstone)
    expect(subscriptions[0]?.userId).toBe(tombstone)
    expect(tombstone).not.toContain(identity.subject)
    expect(github).toHaveLength(0)
    expect(outbox).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'medusa_tenant',
          resourceId: `tenant-${identity.tokenIdentifier}`,
          status: 'pending',
          userTombstone: tombstone,
        }),
        expect.objectContaining({
          kind: 'lakebed_deployment',
          resourceId: `deploy-${identity.tokenIdentifier}`,
          status: 'pending',
        }),
        expect.objectContaining({
          kind: 'github_repository',
          resourceId: `https://github.com/example/${identity.tokenIdentifier}`,
          status: 'pending',
        }),
      ]),
    )
  })

  it('leaves other users untouched', async () => {
    const t = convexTest(schema, modules)
    const mine = identityFor('mine')
    const theirs = identityFor('theirs')
    await seedUser(t, mine.tokenIdentifier)
    await seedUser(t, theirs.tokenIdentifier)

    await t.withIdentity(mine).mutation(api.account.deleteAccount, {
      confirmation: 'DELETE MY ACCOUNT',
    })

    const sessions = await t.run(async (ctx) =>
      ctx.db.query('sessions').collect(),
    )
    expect(sessions).toHaveLength(1)
    expect(sessions[0]?.userId).toBe(theirs.tokenIdentifier)
  })

  it('refuses to delete another account', async () => {
    const t = convexTest(schema, modules)
    const mine = identityFor('mine')
    const theirs = identityFor('theirs')
    await seedUser(t, theirs.tokenIdentifier)

    await expect(
      t.withIdentity(mine).mutation(api.account.deleteAccount, {
        confirmation: 'DELETE MY ACCOUNT',
        userId: theirs.tokenIdentifier,
      }),
    ).rejects.toThrow(/FORBIDDEN/)
  })

  it('requires the typed confirmation', async () => {
    const t = convexTest(schema, modules)
    const identity = identityFor('careless')
    await seedUser(t, identity.tokenIdentifier)

    await expect(
      t.withIdentity(identity).mutation(api.account.deleteAccount, {
        confirmation: 'yes',
      }),
    ).rejects.toThrow(/CONFIRMATION_REQUIRED/)

    const sessions = await t.run(async (ctx) =>
      ctx.db.query('sessions').collect(),
    )
    expect(sessions).toHaveLength(1)
  })

  it('requires authentication', async () => {
    const t = convexTest(schema, modules)

    await expect(
      t.mutation(api.account.deleteAccount, {
        confirmation: 'DELETE MY ACCOUNT',
      }),
    ).rejects.toThrow(/UNAUTHENTICATED/)
  })
})
