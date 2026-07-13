import { convexTest } from 'convex-test'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

describe('translationCache', () => {
  const originalClerk = process.env.VITE_DISABLE_CLERK

  beforeEach(() => {
    process.env.VITE_DISABLE_CLERK = 'true'
  })

  afterEach(() => {
    process.env.VITE_DISABLE_CLERK = originalClerk
  })

  it('returns cached translations positionally and normalizes locale/text keys', async () => {
    const t = convexTest(schema, modules)

    await t.mutation(api.translationCache.setBatch, {
      locale: ' ES-MX ',
      entries: [
        { text: ' Start now ', translation: ' Iniciar ' },
        { text: 'Book a call', translation: 'Reservar una llamada' },
        { text: '   ', translation: 'ignored' },
        { text: 'Empty translation', translation: '   ' },
      ],
    })

    await expect(
      t.query(api.translationCache.getBatch, {
        locale: 'es-mx',
        texts: ['Start now', 'Book a call', 'Unknown', '   '],
      }),
    ).resolves.toEqual(['Iniciar', 'Reservar una llamada', null, ''])
  })

  it('updates existing translations without duplicating cache rows', async () => {
    const t = convexTest(schema, modules)

    await t.mutation(api.translationCache.setBatch, {
      locale: 'fr',
      entries: [{ text: 'Start now', translation: 'Commencer' }],
    })
    await t.mutation(api.translationCache.setBatch, {
      locale: 'FR',
      entries: [{ text: ' Start now ', translation: 'Demarrer' }],
    })

    await expect(
      t.query(api.translationCache.getBatch, {
        locale: 'fr',
        texts: ['Start now'],
      }),
    ).resolves.toEqual(['Demarrer'])
  })
})
