/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

async function cacheRows(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    const cache = await ctx.db.query('translationCache').collect()
    const claims = await ctx.db.query('translationCacheClaims').collect()
    return {
      cache: cache.map((row) => ({
        locale: row.locale,
        sourceText: row.sourceText,
        translation: row.translation,
      })),
      claims: claims.map((claim) => ({
        locale: claim.locale,
        owner: claim.owner,
        sourceText: claim.sourceText,
      })),
    }
  })
}

describe('translation cache lease ownership boundaries', () => {
  const originalClerk = process.env.VITE_DISABLE_CLERK

  beforeEach(() => {
    process.env.VITE_DISABLE_CLERK = 'true'
  })

  afterEach(() => {
    process.env.VITE_DISABLE_CLERK = originalClerk
  })

  it('does not accept a completion after its claim lease expired', async () => {
    const t = convexTest(schema, modules)
    await t.run(async (ctx) => {
      const now = Date.now()
      await ctx.db.insert('translationCacheClaims', {
        cacheKey: 'hi\nCheckout',
        locale: 'hi',
        sourceText: 'Checkout',
        owner: 'expired-worker',
        expiresAt: now - 1,
        createdAt: now - 30_001,
        updatedAt: now - 30_001,
      })
    })

    await Promise.allSettled([
      t.mutation(api.translationCache.completeBatch, {
        secret: process.env.SHARE_BONUS_MUTATION_SECRET,
        locale: 'hi',
        owner: 'expired-worker',
        entries: [{ text: 'Checkout', translation: 'चेकआउट' }],
      }),
    ])

    await expect(cacheRows(t)).resolves.toEqual({
      cache: [],
      claims: [
        { locale: 'hi', owner: 'expired-worker', sourceText: 'Checkout' },
      ],
    })
  })

  it('allows only the replacement owner to complete after lease takeover', async () => {
    const t = convexTest(schema, modules)
    await t.run(async (ctx) => {
      const now = Date.now()
      await ctx.db.insert('translationCacheClaims', {
        cacheKey: 'fr\nCheckout',
        locale: 'fr',
        sourceText: 'Checkout',
        owner: 'stale-worker',
        expiresAt: now - 1,
        createdAt: now - 30_001,
        updatedAt: now - 30_001,
      })
    })

    await t.mutation(api.translationCache.claimBatch, {
      locale: 'fr',
      texts: ['Checkout'],
      owner: 'replacement-worker',
    })
    const stale = await t.mutation(api.translationCache.completeBatch, {
      secret: process.env.SHARE_BONUS_MUTATION_SECRET,
      locale: 'fr',
      owner: 'stale-worker',
      entries: [{ text: 'Checkout', translation: 'Ancienne valeur' }],
    })
    const replacement = await t.mutation(api.translationCache.completeBatch, {
      secret: process.env.SHARE_BONUS_MUTATION_SECRET,
      locale: 'fr',
      owner: 'replacement-worker',
      entries: [{ text: 'Checkout', translation: 'Paiement' }],
    })

    expect({
      replacement,
      stale,
      state: await cacheRows(t),
    }).toEqual({
      replacement: ['Paiement'],
      stale: [null],
      state: {
        cache: [
          {
            locale: 'fr',
            sourceText: 'Checkout',
            translation: 'Paiement',
          },
        ],
        claims: [],
      },
    })
  })

  it('does not let a wrong owner release another worker lease', async () => {
    const t = convexTest(schema, modules)
    await t.mutation(api.translationCache.claimBatch, {
      locale: 'es',
      texts: ['Checkout'],
      owner: 'lease-owner',
    })

    const released = await t.mutation(api.translationCache.releaseBatch, {
      secret: process.env.SHARE_BONUS_MUTATION_SECRET,
      locale: 'es',
      texts: ['Checkout'],
      owner: 'different-owner',
    })

    expect({ released, state: await cacheRows(t) }).toEqual({
      released: 0,
      state: {
        cache: [],
        claims: [
          { locale: 'es', owner: 'lease-owner', sourceText: 'Checkout' },
        ],
      },
    })
  })

  it('persists exactly one translation for a live owner completion replay', async () => {
    const t = convexTest(schema, modules)
    await t.mutation(api.translationCache.claimBatch, {
      locale: 'de',
      texts: ['Checkout'],
      owner: 'live-owner',
    })

    const first = await t.mutation(api.translationCache.completeBatch, {
      secret: process.env.SHARE_BONUS_MUTATION_SECRET,
      locale: 'de',
      owner: 'live-owner',
      entries: [{ text: 'Checkout', translation: 'Kasse' }],
    })
    const replay = await t.mutation(api.translationCache.completeBatch, {
      secret: process.env.SHARE_BONUS_MUTATION_SECRET,
      locale: 'de',
      owner: 'live-owner',
      entries: [{ text: 'Checkout', translation: 'Different replay' }],
    })

    expect({ first, replay, state: await cacheRows(t) }).toEqual({
      first: ['Kasse'],
      replay: ['Kasse'],
      state: {
        cache: [{ locale: 'de', sourceText: 'Checkout', translation: 'Kasse' }],
        claims: [],
      },
    })
  })
})
