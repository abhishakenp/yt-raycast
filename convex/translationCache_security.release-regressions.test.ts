/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

describe('translation cache authorization release gates', () => {
  it('rejects anonymous writes that could poison translations for every session', async () => {
    const t = convexTest(schema, modules)

    await expect(
      t.mutation(api.translationCache.setBatch, {
        locale: 'hi',
        entries: [{ text: 'Checkout', translation: 'attacker-controlled' }],
      }),
    ).rejects.toThrow(/auth|unauthorized/i)
  })

  it('rejects anonymous cache claims that could suppress legitimate model calls', async () => {
    const t = convexTest(schema, modules)

    await expect(
      t.mutation(api.translationCache.claimBatch, {
        locale: 'hi',
        texts: ['Checkout'],
        owner: 'attacker-controlled-owner',
      }),
    ).rejects.toThrow(/auth|unauthorized/i)
  })
})
