import { convexTest } from 'convex-test'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

function makeGroqResponse(content: unknown) {
  return {
    ok: true,
    json: async () => ({
      choices: [{ message: { content: JSON.stringify(content) } }],
    }),
  } as Response
}

function makeModeratedGroqFetch(auxiliaryResponse: Response) {
  return vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body)) as { model?: unknown }
    return body.model === 'openai/gpt-oss-safeguard-20b'
      ? makeGroqResponse({
          category: null,
          decision: 'safe',
          matchedField: null,
        })
      : auxiliaryResponse
  })
}

describe('customLanguages', () => {
  const previousGroqKey = process.env.GROQ_API_KEY
  const previousGroqHost = process.env.GROQ_HOST
  const previousModerationSecret =
    process.env.CONTENT_MODERATION_MUTATION_SECRET

  afterEach(() => {
    if (previousGroqKey === undefined) delete process.env.GROQ_API_KEY
    else process.env.GROQ_API_KEY = previousGroqKey
    if (previousGroqHost === undefined) delete process.env.GROQ_HOST
    else process.env.GROQ_HOST = previousGroqHost
    if (previousModerationSecret === undefined) {
      delete process.env.CONTENT_MODERATION_MUTATION_SECRET
    } else {
      process.env.CONTENT_MODERATION_MUTATION_SECRET = previousModerationSecret
    }
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

  it('hides stale duplicate custom rows when a native-script replacement exists', async () => {
    const t = convexTest(schema, modules)

    await t.mutation(api.customLanguages.add, {
      code: 'chinese',
      name: 'Chinese',
      nativeName: 'Chinese',
      fontFamily: 'Noto Sans CJK SC, sans-serif',
      keywords: ['chinese'],
    })
    await t.mutation(api.customLanguages.add, {
      code: 'zh',
      name: 'Chinese',
      nativeName: '中文',
      fontFamily: 'Noto Sans SC, sans-serif',
      keywords: ['chinese', 'mandarin'],
    })

    await expect(t.query(api.customLanguages.list, {})).resolves.toEqual([
      expect.objectContaining({
        code: 'zh',
        name: 'Chinese',
        nativeName: '中文',
      }),
    ])
    await expect(
      t.query(api.customLanguages.search, { query: 'chinese' }),
    ).resolves.toEqual([
      expect.objectContaining({
        code: 'zh',
        name: 'Chinese',
        nativeName: '中文',
      }),
    ])
  })

  it('resolveOrCreate uses the AI-provided BCP-47 code and normalized key variants', async () => {
    process.env.GROQ_API_KEY = 'test-key'
    process.env.GROQ_HOST = 'https://groq.test'
    const fetchMock = makeModeratedGroqFetch(
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
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const stored = await t.query(api.customLanguages.findExact, {
      text: 'lt',
    })
    expect(stored).toMatchObject({ code: 'lt', name: 'Lithuanian' })
  })

  it('resolveOrCreate does not reuse the live stale Mexican-to-Nahuatl custom row', async () => {
    process.env.GROQ_API_KEY = 'test-key'
    process.env.GROQ_HOST = 'https://groq.test'
    const fetchMock = makeModeratedGroqFetch(
      makeGroqResponse({
        code: 'es-MX',
        name: 'Mexican Spanish',
        nativeName: 'Español (México)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const t = convexTest(schema, modules)

    // Observed via `npx convex run customLanguages:list '{}'`: a stale row
    // exists with keyword "mexican" but code/name/nativeName for Nahuatl.
    await t.mutation(api.customLanguages.add, {
      code: 'nahuatl',
      name: 'Nahuatl',
      nativeName: 'Nāhuatl',
      fontFamily: 'Inter, system-ui, sans-serif',
      keywords: ['mexican', 'nahuatl'],
    })

    const resolved = await t.action(api.customLanguages.resolveOrCreate, {
      languageInput: 'Mexican',
    })

    expect(resolved).toMatchObject({
      code: 'es-MX',
      name: 'Mexican Spanish',
      nativeName: 'Español (México)',
    })
    expect(resolved?.code).not.toBe('nahuatl')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('resolveOrCreate strips leaked reasoning before parsing observed native-script AI output', async () => {
    process.env.GROQ_API_KEY = 'test-key'
    process.env.GROQ_HOST = 'https://groq.test'
    const fetchMock = makeModeratedGroqFetch({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content:
                '<thinking>mapping script and font</thinking>{"code":"am","english_name":"Amharic","native_name":"አማሪኛ","font_family":"Noto Sans Ethiopic, sans-serif"}',
            },
          },
        ],
      }),
    } as Response)
    vi.stubGlobal('fetch', fetchMock)
    const t = convexTest(schema, modules)

    const resolved = await t.action(api.customLanguages.resolveOrCreate, {
      languageInput: 'Amharic',
    })

    expect(resolved).toMatchObject({
      code: 'am',
      name: 'Amharic',
      nativeName: 'አማሪኛ',
      fontFamily: 'Noto Sans Ethiopic, sans-serif',
    })
    await expect(
      t.query(api.customLanguages.findExact, { text: 'አማሪኛ' }),
    ).resolves.toMatchObject({
      code: 'am',
      name: 'Amharic',
      nativeName: 'አማሪኛ',
    })
  })

  it('resolveOrCreate falls back to a stable slug when AI omits a valid locale code', async () => {
    process.env.GROQ_API_KEY = 'test-key'
    const fetchMock = makeModeratedGroqFetch(
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

  it('flags a deterministic harmful language input before calling Groq', async () => {
    process.env.GROQ_API_KEY = 'test-key'
    process.env.CONTENT_MODERATION_MUTATION_SECRET = 'moderation-secret'
    const fetchMock = vi.fn(async () => {
      throw new Error('Groq must not be called for a deterministic block')
    })
    vi.stubGlobal('fetch', fetchMock)
    const t = convexTest(schema, modules)
    const user = t.withIdentity({
      issuer: 'https://clerk.test',
      subject: 'user_123',
      tokenIdentifier: 'https://clerk.test|user_123',
    })
    const harmfulInput = 'Child porn language pack'

    await expect(
      user.action(api.customLanguages.resolveOrCreate, {
        languageInput: harmfulInput,
      }),
    ).rejects.toMatchObject({
      data: expect.objectContaining({
        code: 'CONTENT_POLICY',
        message:
          '🚫 Not shipping that. Ship Fast blocks harmful, hateful, explicit, or exploitative content. This request was flagged—try a safe idea instead.',
      }),
    })

    expect(fetchMock).not.toHaveBeenCalled()
    await expect(
      t.run(async (ctx) => ({
        flags: await ctx.db.query('contentModerationFlags').collect(),
        languages: await ctx.db.query('customLanguages').collect(),
      })),
    ).resolves.toMatchObject({
      flags: [
        expect.objectContaining({
          matchedField: 'customLanguage',
          prompt: harmfulInput,
          surface: 'custom_language',
          userId: 'https://clerk.test|user_123',
        }),
      ],
      languages: [],
    })
  })

  it('fails closed with the stable safety message when moderation is unavailable', async () => {
    delete process.env.GROQ_API_KEY
    process.env.CONTENT_MODERATION_MUTATION_SECRET = 'moderation-secret'
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const t = convexTest(schema, modules)

    await expect(
      t.action(api.customLanguages.resolveOrCreate, {
        languageInput: 'Dothraki',
      }),
    ).rejects.toMatchObject({
      data: expect.objectContaining({
        code: 'CONTENT_MODERATION_UNAVAILABLE',
        message:
          'Ship Fast’s safety check is temporarily unavailable. Try again shortly.',
      }),
    })

    expect(fetchMock).not.toHaveBeenCalled()
    await expect(
      t.run((ctx) => ctx.db.query('customLanguages').collect()),
    ).resolves.toEqual([])
  })
})
