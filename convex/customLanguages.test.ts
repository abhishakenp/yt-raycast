import { convexTest } from 'convex-test'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const makeGroqResponse = (content: unknown) =>
  ({
    ok: true,
    json: async () => ({
      choices: [{ message: { content: JSON.stringify(content) } }],
    }),
  }) as Response

describe('customLanguages', () => {
  const previousGroqKey = process.env.GROQ_API_KEY
  const previousGroqHost = process.env.GROQ_HOST

  afterEach(() => {
    if (previousGroqKey === undefined) delete process.env.GROQ_API_KEY
    else process.env.GROQ_API_KEY = previousGroqKey
    if (previousGroqHost === undefined) delete process.env.GROQ_HOST
    else process.env.GROQ_HOST = previousGroqHost
    vi.unstubAllGlobals()
  })

  it('stores one language per code and searches by English, native, keyword, and code', async () => {
    const t = convexTest(schema, modules)

    const first = await t.mutation(api.customLanguages.add, {
      code: 'tlh',
      name: 'Klingon',
      nativeName: 'tlhIngan Hol',
      fontFamily: 'Inter, system-ui, sans-serif',
      keywords: ['klingon', 'tlh'],
    })
    const second = await t.mutation(api.customLanguages.add, {
      code: 'tlh',
      name: 'Ignored Duplicate',
      nativeName: 'ignored',
      fontFamily: 'Inter, system-ui, sans-serif',
      keywords: ['ignored'],
    })

    expect(second).toEqual(first)
    await expect(
      t.query(api.customLanguages.findExact, { text: 'Klingon' }),
    ).resolves.toMatchObject({ code: 'tlh', name: 'Klingon' })
    await expect(
      t.query(api.customLanguages.findExact, { text: 'tlhIngan Hol' }),
    ).resolves.toMatchObject({ code: 'tlh', name: 'Klingon' })
    await expect(
      t.query(api.customLanguages.search, { query: 'tlh' }),
    ).resolves.toEqual([
      expect.objectContaining({ code: 'tlh', name: 'Klingon' }),
    ])
    await expect(t.query(api.customLanguages.list, {})).resolves.toEqual([
      expect.objectContaining({ code: 'tlh', name: 'Klingon' }),
    ])
  })

  it('resolveOrCreate uses the AI-provided BCP-47 code and normalized key variants', async () => {
    process.env.GROQ_API_KEY = 'test-key'
    process.env.GROQ_HOST = 'https://groq.test'
    const fetchMock = vi.fn(async () =>
      makeGroqResponse({
        locale: 'lt',
        english_name: 'Lithuanian',
        native_name: 'Lietuvių',
        font_stack: 'Inter, system-ui, sans-serif',
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const t = convexTest(schema, modules)

    const resolved = await t.action(api.customLanguages.resolveOrCreate, {
      languageInput: 'Lithuanian',
    })

    expect(resolved).toMatchObject({
      code: 'lt',
      name: 'Lithuanian',
      nativeName: 'Lietuvių',
      fontFamily: 'Inter, system-ui, sans-serif',
      keywords: ['lithuanian', 'lithuanian', 'lt'],
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const stored = await t.query(api.customLanguages.findExact, {
      text: 'lt',
    })
    expect(stored).toMatchObject({ code: 'lt', name: 'Lithuanian' })
  })

  it('resolveOrCreate falls back to a stable slug when AI omits a valid locale code', async () => {
    process.env.GROQ_API_KEY = 'test-key'
    const fetchMock = vi.fn(async () =>
      makeGroqResponse({
        name: 'Dothraki',
        nativeName: 'Dothraki',
        fontFamily: 'Inter, system-ui, sans-serif',
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const t = convexTest(schema, modules)

    await expect(
      t.action(api.customLanguages.resolveOrCreate, {
        languageInput: 'Dothraki',
      }),
    ).resolves.toMatchObject({
      code: 'dothraki',
      name: 'Dothraki',
      nativeName: 'Dothraki',
    })
  })

  it('resolveOrCreate reuses an existing exact match instead of calling AI again', async () => {
    process.env.GROQ_API_KEY = 'test-key'
    const fetchMock = vi.fn(async () =>
      makeGroqResponse({
        code: 'qya',
        name: 'Quenya',
        nativeName: 'Quenya',
        fontFamily: 'Inter, system-ui, sans-serif',
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const t = convexTest(schema, modules)

    await t.mutation(api.customLanguages.add, {
      code: 'qya',
      name: 'Quenya',
      nativeName: 'Quenya',
      fontFamily: 'Inter, system-ui, sans-serif',
      keywords: ['quenya'],
    })

    await expect(
      t.action(api.customLanguages.resolveOrCreate, {
        languageInput: 'Quenya',
      }),
    ).resolves.toMatchObject({ code: 'qya', name: 'Quenya' })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
