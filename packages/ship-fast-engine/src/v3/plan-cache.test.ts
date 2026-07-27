import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

const restaurantDsl = `restaurant
hero Farm to Table|Wood-fired cuisine in the heart of the valley|Seasonal menus sourced from local farms cooked over open flame|Rustic dining room with candlelit tables
menu Autumn Menu|Three courses from Chef Marco changing weekly with the harvest
reservations Book a Table|Parties up to 8 for larger groups call us
footer
@pages menu reservations`

const generateTextMock = vi.hoisted(() =>
  vi.fn(
    async (_modelId: unknown, _system: string, _user: string) => restaurantDsl,
  ),
)
const generateTextStreamMock = vi.hoisted(() =>
  vi.fn(
    async (
      _modelId: unknown,
      _system: string,
      _user: string,
      _signal: AbortSignal,
      onLine: (line: string) => void,
    ) => {
      for (const line of restaurantDsl.split('\n')) {
        onLine(line + '\n')
      }
      return restaurantDsl
    },
  ),
)

const resolvePipelineLanguageMock = vi.hoisted(() =>
  vi.fn(async () => ({
    code: 'en',
    name: 'English',
    nativeName: 'English',
    script: 'Latin',
    needsTranslation: false,
    prompt: 'a farm-to-table restaurant',
  })),
)

vi.mock('../generate.ts', () => ({
  generateText: generateTextMock,
  generateTextStream: generateTextStreamMock,
}))
vi.mock('../pipeline/prompt-language.js', () => ({
  resolvePipelineLanguage: resolvePipelineLanguageMock,
}))

const buildPromptMock = vi.hoisted(() =>
  vi.fn(() => ({ system: 'sys', user: 'usr', path: 'high' })),
)
const parseSitePlanMock = vi.hoisted(() =>
  vi.fn(() => ({
    kind: 'restaurant',
    sections: [
      { role: 'hero', content: ['Farm to Table'] },
      { role: 'menu', content: ['Autumn Menu'] },
      { role: 'reservations', content: ['Book a Table'] },
      { role: 'footer', content: [] },
    ],
    pages: ['menu', 'reservations'],
    tables: [],
    operations: [],
  })),
)
const retryLoopMock = vi.hoisted(() =>
  vi.fn(() => ({
    plan: parseSitePlanMock(),
    attempts: 1,
    valid: true,
  })),
)
const compileSitePlanMock = vi.hoisted(() =>
  vi.fn(() => ({
    skeleton: 'root = PageSwitch({ home: Home })',
    source: 'root = PageSwitch({ home: Home })',
    pageSources: { home: 'home = Stack([])' },
    lakebed: { tables: [], queries: [], mutations: [] },
    siteSpec: {
      brand: 'Farm Table',
      tagline: 'Farm to Table',
      theme: 'default',
      locale: 'en',
      skeleton: 'root = PageSwitch({ home: Home })',
      modules: { home: 'home = Stack([])' },
      kind: 'restaurant',
      lakebed: { tables: [], queries: [], mutations: [] },
      fullstackManifest: { tables: [], schemaVersion: 1, auth: false },
      sitePlan: {
        kind: 'restaurant',
        sections: [],
        pages: [],
        tables: [],
        operations: [],
      },
    },
  })),
)
const compileSectionMock = vi.hoisted(() =>
  vi.fn(() => ({ statements: ['sec = Section()'], ref: 'sec' })),
)
const streamingParserCtor = vi.hoisted(() =>
  vi.fn(function (this: any) {
    this.onSectionStart = vi.fn()
    this.onSectionComplete = vi.fn()
    this.onMetadata = vi.fn()
    this.feed = vi.fn()
    this.flush = vi.fn()
    this.navLabels = {}
    this.pages = []
  }),
)
const inferLakebedMock = vi.hoisted(() =>
  vi.fn(() => ({ tables: [], queries: [], mutations: [] })),
)
const getVocabularyMock = vi.hoisted(() => vi.fn(() => ({ roles: [] })))

vi.mock('./prompt', () => ({
  buildPrompt: buildPromptMock,
  buildLowConfidenceKindPrompt: vi.fn(),
  buildLowConfidenceFillPrompt: vi.fn(),
}))
vi.mock('./parser', () => ({ parseSitePlan: parseSitePlanMock }))
vi.mock('./validator', () => ({
  validatePlan: vi.fn(() => ({ valid: true, errors: [] })),
}))
vi.mock('./fixer', () => ({ fixPlan: vi.fn((p: unknown) => p) }))
vi.mock('./retry', () => ({ retryLoop: retryLoopMock }))
vi.mock('./compiler', () => ({
  compileSitePlan: compileSitePlanMock,
  compileSection: compileSectionMock,
}))
vi.mock('./streaming', () => ({ StreamingParser: streamingParserCtor }))
vi.mock('./inference', () => ({ inferLakebed: inferLakebedMock }))
vi.mock('./vocabulary', () => ({ getVocabulary: getVocabularyMock }))

function makeSessionCtx() {
  return {
    id: 'test-session',
    broadcast: vi.fn(),
    setPrompt: vi.fn(),
    setTasks: vi.fn(),
    updateTask: vi.fn(),
    signalHomepageReady: vi.fn(),
    signalOpenuiReady: vi.fn(),
    setElapsed: vi.fn(),
    setCost: vi.fn(),
  }
}

describe('runAllV3 plan cache', () => {
  it('skips the LLM call on a cache hit and reuses the cached raw plan', async () => {
    const { runAllV3 } = await import('./index.ts')
    generateTextMock.mockClear()
    generateTextStreamMock.mockClear()

    const planCacheClient = {
      get: vi.fn(async () => restaurantDsl),
      set: vi.fn(async () => undefined),
    }

    await runAllV3({
      workspace: mkdtempSync(join(tmpdir(), 'sf-plan-cache-hit-')),
      prompt: 'a farm-to-table restaurant',
      preferredLanguage: 'en',
      sessionCtx: makeSessionCtx(),
      planCacheClient,
      promptCacheKey: 'en:a farm-to-table restaurant',
    })

    // Cache hit → LLM must NOT be called.
    expect(generateTextMock).not.toHaveBeenCalled()
    expect(generateTextStreamMock).not.toHaveBeenCalled()
    // Cache get was called with the right key.
    expect(planCacheClient.get).toHaveBeenCalledWith({
      promptCacheKey: 'en:a farm-to-table restaurant',
    })
    // Cache set must NOT be called on a hit.
    expect(planCacheClient.set).not.toHaveBeenCalled()
  })

  it('calls the LLM and writes to cache on a cache miss', async () => {
    const { runAllV3 } = await import('./index.ts')
    generateTextMock.mockClear()
    generateTextStreamMock.mockClear()

    const planCacheClient = {
      get: vi.fn(async () => null),
      set: vi.fn(async () => undefined),
    }

    await runAllV3({
      workspace: mkdtempSync(join(tmpdir(), 'sf-plan-cache-miss-')),
      prompt: 'a farm-to-table restaurant',
      preferredLanguage: 'en',
      sessionCtx: makeSessionCtx(),
      planCacheClient,
      promptCacheKey: 'en:a farm-to-table restaurant',
    })

    // Cache miss → streaming LLM call IS made.
    expect(generateTextStreamMock).toHaveBeenCalledTimes(1)
    // Cache set was called with the raw plan.
    expect(planCacheClient.set).toHaveBeenCalledWith({
      promptCacheKey: 'en:a farm-to-table restaurant',
      rawPlan: restaurantDsl,
    })
  })

  it('does not call the cache when no planCacheClient is provided', async () => {
    const { runAllV3 } = await import('./index.ts')
    generateTextMock.mockClear()
    generateTextStreamMock.mockClear()

    await runAllV3({
      workspace: mkdtempSync(join(tmpdir(), 'sf-plan-cache-none-')),
      prompt: 'a farm-to-table restaurant',
      preferredLanguage: 'en',
      sessionCtx: makeSessionCtx(),
    })

    expect(generateTextStreamMock).toHaveBeenCalledTimes(1)
  })

  it('falls back to the LLM when the cache get throws', async () => {
    const { runAllV3 } = await import('./index.ts')
    generateTextMock.mockClear()
    generateTextStreamMock.mockClear()

    const planCacheClient = {
      get: vi.fn(async () => {
        throw new Error('cache unavailable')
      }),
      set: vi.fn(async () => undefined),
    }

    await runAllV3({
      workspace: mkdtempSync(join(tmpdir(), 'sf-plan-cache-error-')),
      prompt: 'a farm-to-table restaurant',
      preferredLanguage: 'en',
      sessionCtx: makeSessionCtx(),
      planCacheClient,
      promptCacheKey: 'en:a farm-to-table restaurant',
    })

    // Cache error → falls back to LLM.
    expect(generateTextStreamMock).toHaveBeenCalledTimes(1)
    // Cache set is still called (best-effort write).
    expect(planCacheClient.set).toHaveBeenCalled()
  })
}, 30_000)
