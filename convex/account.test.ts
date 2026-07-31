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
    await ctx.db.insert('sessions', {
      userId,
      prompt: 'A site to erase',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      createdAt: 1,
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

    const { sessions, credits, ledger, subscriptions } = await t.run(
      async (ctx) => ({
        sessions: await ctx.db.query('sessions').collect(),
        credits: await ctx.db.query('customerCredits').collect(),
        ledger: await ctx.db.query('creditLedger').collect(),
        subscriptions: await ctx.db.query('subscriptions').collect(),
      }),
    )

    expect(sessions).toHaveLength(0)
    expect(credits).toHaveLength(0)
    // Payment records survive for tax/audit, without a link to the person.
    const tombstone = deletionTombstone(identity.tokenIdentifier)
    expect(ledger).toHaveLength(1)
    expect(ledger[0]?.userId).toBe(tombstone)
    expect(subscriptions[0]?.userId).toBe(tombstone)
    expect(tombstone).not.toContain(identity.subject)
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
