/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

async function storedLanguages(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    const rows = await ctx.db.query('customLanguages').collect()
    return rows.map((row) => ({
      code: row.code,
      fontFamily: row.fontFamily,
      keywords: row.keywords,
      name: row.name,
      nativeName: row.nativeName,
      searchText: row.searchText,
    }))
  })
}

describe('custom language validation and idempotency boundaries', () => {
  it('rejects blank required fields and persists nothing', async () => {
    const t = convexTest(schema, modules)
    const attempts = await Promise.allSettled([
      t.mutation(api.customLanguages.add, {
        code: '   ',
        name: 'Blank code',
        nativeName: 'Blank code',
        fontFamily: 'Inter, sans-serif',
        keywords: ['blank'],
      }),
      t.mutation(api.customLanguages.add, {
        code: 'blank-name',
        name: '   ',
        nativeName: 'Blank name',
        fontFamily: 'Inter, sans-serif',
        keywords: ['blank'],
      }),
      t.mutation(api.customLanguages.add, {
        code: 'blank-native',
        name: 'Blank native name',
        nativeName: '\n\t',
        fontFamily: 'Inter, sans-serif',
        keywords: ['blank'],
      }),
      t.mutation(api.customLanguages.add, {
        code: 'blank-font',
        name: 'Blank font',
        nativeName: 'Blank font',
        fontFamily: '',
        keywords: ['blank'],
      }),
      t.mutation(api.customLanguages.add, {
        code: 'blank-keyword',
        name: 'Blank keyword',
        nativeName: 'Blank keyword',
        fontFamily: 'Inter, sans-serif',
        keywords: ['', '   '],
      }),
    ])

    expect({
      statuses: attempts.map((attempt) => attempt.status),
      stored: await storedLanguages(t),
    }).toEqual({
      statuses: ['rejected', 'rejected', 'rejected', 'rejected', 'rejected'],
      stored: [],
    })
  })

  it('canonicalizes BCP-47 aliases before enforcing code idempotency', async () => {
    const t = convexTest(schema, modules)
    const first = await t.mutation(api.customLanguages.add, {
      code: ' PT-br ',
      name: ' Brazilian Portuguese ',
      nativeName: ' Português do Brasil ',
      fontFamily: ' Inter, system-ui, sans-serif ',
      keywords: [' portuguese ', 'Portuguese', ' pt-br '],
    })
    const second = await t.mutation(api.customLanguages.add, {
      code: 'pt-BR',
      name: 'Duplicate Portuguese',
      nativeName: 'Duplicado',
      fontFamily: 'serif',
      keywords: ['duplicate'],
    })

    expect({ first, second, stored: await storedLanguages(t) }).toEqual({
      first: {
        code: 'pt-BR',
        name: 'Brazilian Portuguese',
        nativeName: 'Português do Brasil',
        fontFamily: 'Inter, system-ui, sans-serif',
        keywords: ['portuguese', 'pt-br'],
      },
      second: {
        code: 'pt-BR',
        name: 'Brazilian Portuguese',
        nativeName: 'Português do Brasil',
        fontFamily: 'Inter, system-ui, sans-serif',
        keywords: ['portuguese', 'pt-br'],
      },
      stored: [
        {
          code: 'pt-BR',
          fontFamily: 'Inter, system-ui, sans-serif',
          keywords: ['portuguese', 'pt-br'],
          name: 'Brazilian Portuguese',
          nativeName: 'Português do Brasil',
          searchText:
            'Brazilian Portuguese Português do Brasil portuguese pt-br',
        },
      ],
    })
  })

  it('creates one row when the same canonical code is added concurrently', async () => {
    const t = convexTest(schema, modules)
    const entries = await Promise.all([
      t.mutation(api.customLanguages.add, {
        code: 'tlh',
        name: 'Klingon',
        nativeName: 'tlhIngan Hol',
        fontFamily: 'Inter, system-ui, sans-serif',
        keywords: ['klingon'],
      }),
      t.mutation(api.customLanguages.add, {
        code: 'tlh',
        name: 'Duplicate Klingon',
        nativeName: 'Duplicate Klingon',
        fontFamily: 'serif',
        keywords: ['duplicate'],
      }),
    ])

    expect(entries[1]).toEqual(entries[0])
    await expect(storedLanguages(t)).resolves.toHaveLength(1)
  })
})
