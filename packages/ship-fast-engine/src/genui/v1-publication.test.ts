import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  generateText: vi.fn(),
  isHardLlmFailure: vi.fn(),
}))

vi.mock('../generate.ts', () => ({
  formatLlmFailureMessage: (error: unknown) => String(error),
  generateText: mocks.generateText,
  isHardLlmFailure: mocks.isHardLlmFailure,
}))

import { THEME_CATALOG } from '../../../ship-fast-blocks/src/theme-apply.ts'
import {
  classifySiteCategory,
  runV1PublicationGeneration,
  type V1PublicationEvent,
} from './v1-publication.ts'

// Every publication page id the skeleton fills. Used to build a fully valid
// mocked generation where each page resolves to a concrete component.
const PAGE_IDS = ['home', 'post', 'archive', 'topics', 'authors', 'admin']

// The alias each page id uses, mirroring PUBLICATION_PAGES order.
const PAGE_ALIAS: Record<string, string> = {
  home: 'PublicationHome',
  post: 'PublicationPost',
  archive: 'PublicationArchive',
  topics: 'PublicationTopics',
  authors: 'PublicationAuthors',
  admin: 'PublicationAdmin',
}

// Build a valid single-statement OpenUI module for a page. The generator emits
// `${page.alias}(...)` then resolveAliases swaps the alias for a concrete block.
const moduleFor = (id: string): string =>
  `${id} = ${PAGE_ALIAS[id]}("Field Notes", ["Home", "Latest", "Archive", "Topics", "Authors", "Admin"], { title: "Field Notes ${id}", stories: ["one", "two", "three", "four", "five", "six"] })`

// Mock implementation that answers both the classify call and the page calls.
const validGeneration =
  (category = 'blog') =>
  async (_modelId: string, system: string) => {
    if (system.startsWith('Classify the requested website')) return category
    const idMatch = /alias (\w+);/.exec(system)
    const alias = idMatch?.[1]
    const id = Object.keys(PAGE_ALIAS).find((key) => PAGE_ALIAS[key] === alias)
    if (id) return moduleFor(id)
    return ''
  }

describe('classifySiteCategory', () => {
  beforeEach(() => {
    mocks.generateText.mockReset()
    mocks.isHardLlmFailure.mockReset()
    mocks.isHardLlmFailure.mockReturnValue(false)
  })

  it('normalizes publication-family words to "publication"', async () => {
    for (const raw of ['blog', 'news', 'magazine', 'newsletter', 'media']) {
      mocks.generateText.mockResolvedValueOnce(raw)
      const result = await classifySiteCategory('a site', 'model-x')
      expect(result).toBe('publication')
    }
  })

  it('passes through other category words', async () => {
    mocks.generateText.mockResolvedValueOnce('commerce')
    expect(await classifySiteCategory('a shop', 'model-x')).toBe('commerce')
  })

  it('defaults to "publication" on a soft failure', async () => {
    mocks.generateText.mockRejectedValueOnce(new Error('transient timeout'))
    mocks.isHardLlmFailure.mockReturnValue(false)
    expect(await classifySiteCategory('whatever', 'model-x')).toBe(
      'publication',
    )
  })

  it('re-throws a hard failure instead of defaulting', async () => {
    mocks.generateText.mockRejectedValueOnce(new Error('invalid api key'))
    mocks.isHardLlmFailure.mockReturnValue(true)
    await expect(classifySiteCategory('whatever', 'model-x')).rejects.toThrow(
      'invalid api key',
    )
  })
})

describe('runV1PublicationGeneration', () => {
  beforeEach(() => {
    mocks.generateText.mockReset()
    mocks.isHardLlmFailure.mockReset()
    mocks.isHardLlmFailure.mockReturnValue(false)
  })

  it('produces a resolved source, six artifacts and a catalog theme on the happy path', async () => {
    mocks.generateText.mockImplementation(validGeneration('blog'))

    const result = await runV1PublicationGeneration({
      prompt: 'Build a publication for Field Notes',
      modelId: 'model-x',
      sessionSeed: 'seed-happy',
    })

    expect(result.source.trim().length).toBeGreaterThan(0)
    // Aliases must be replaced by concrete components — no alias survives.
    for (const alias of Object.values(PAGE_ALIAS)) {
      expect(result.source).not.toContain(`${alias}(`)
    }
    // Concrete blocks are the resolved component names.
    expect(result.source).toMatch(/KimiPage/)
    expect(result.category).toBe('publication')
    expect(result.artifacts).toHaveLength(6)
    expect(result.artifacts.map((artifact) => artifact.key).sort()).toEqual(
      [
        'admin-policy',
        'category-grammar',
        'fullstack-manifest',
        'openui-manifest',
        'resolved-variant-map',
        'theme-genome',
      ].sort(),
    )
    expect(THEME_CATALOG.map((entry) => entry.name)).toContain(result.theme)
  })

  it('is deterministic for a given session seed (variantMap + theme)', async () => {
    mocks.generateText.mockImplementation(validGeneration('blog'))
    const first = await runV1PublicationGeneration({
      prompt: 'Build a publication',
      modelId: 'model-x',
      sessionSeed: 'stable-seed',
    })

    mocks.generateText.mockImplementation(validGeneration('blog'))
    const second = await runV1PublicationGeneration({
      prompt: 'Build a publication',
      modelId: 'model-x',
      sessionSeed: 'stable-seed',
    })

    expect(first.theme).toBe(second.theme)
    const variantOf = (result: typeof first) =>
      result.artifacts.find(
        (artifact) => artifact.key === 'resolved-variant-map',
      )?.contentJson
    expect(variantOf(first)).toBe(variantOf(second))
  })

  it('falls back to the schema page when a module fails validation', async () => {
    // Every page returns an invalid (non-assignment) module → fallbackPage used.
    mocks.generateText.mockImplementation(
      async (_modelId: string, system: string) => {
        if (system.startsWith('Classify the requested website')) return 'blog'
        return 'root = Text("not a page assignment")'
      },
    )
    const failed: string[] = []
    const events: V1PublicationEvent[] = []

    const result = await runV1PublicationGeneration({
      prompt: 'Build a publication',
      modelId: 'model-x',
      sessionSeed: 'seed-fallback',
      onEvent: (event) => {
        events.push(event)
        if (event.type === 'module' && event.failed) failed.push(event.id)
      },
    })

    expect(failed.length).toBeGreaterThan(0)
    expect(result.source.trim().length).toBeGreaterThan(0)
    // Fallback source is still resolved (no surviving aliases).
    for (const alias of Object.values(PAGE_ALIAS)) {
      expect(result.source).not.toContain(`${alias}(`)
    }
    expect(events.some((event) => event.type === 'done')).toBe(true)
  })

  it('skips the classify call when category is supplied', async () => {
    mocks.generateText.mockImplementation(validGeneration('blog'))

    const result = await runV1PublicationGeneration({
      prompt: 'Build a publication',
      modelId: 'model-x',
      sessionSeed: 'seed-precat',
      category: 'publication',
    })

    expect(result.category).toBe('publication')
    // No classify call should have been issued — only page-fill calls.
    const classifyCalls = mocks.generateText.mock.calls.filter(
      ([, system]) =>
        typeof system === 'string' &&
        system.startsWith('Classify the requested website'),
    )
    expect(classifyCalls).toHaveLength(0)
    expect(mocks.generateText).toHaveBeenCalledTimes(PAGE_IDS.length)
  })

  it('does not hang when given an already-aborted signal', async () => {
    mocks.generateText.mockImplementation(
      async (
        _modelId: string,
        system: string,
        _user: string,
        signal: AbortSignal,
      ) => {
        if (system.startsWith('Classify the requested website')) return 'blog'
        // Page calls honor the (already aborted) signal by rejecting.
        if (signal?.aborted) throw new Error('aborted')
        return 'root = Text("noop")'
      },
    )
    const controller = new AbortController()
    controller.abort()

    const result = await runV1PublicationGeneration({
      prompt: 'Build a publication',
      modelId: 'model-x',
      sessionSeed: 'seed-abort',
      category: 'publication',
      signal: controller.signal,
    })

    // Aborted page generation falls back per-page; the run still resolves.
    expect(result.source.trim().length).toBeGreaterThan(0)
  }, 10000)
})
