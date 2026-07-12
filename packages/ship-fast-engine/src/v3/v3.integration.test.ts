import { mkdtempSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

// Restaurant DSL fixture (from .plans/v3-engine.md "Positional DSL Format").
const restaurantDsl = `restaurant
hero Farm to Table|Wood-fired cuisine in the heart of the valley|Seasonal menus sourced from local farms cooked over open flame|Rustic dining room with candlelit tables
menu Autumn Menu|Three courses from Chef Marco changing weekly with the harvest|Starters>Roasted Beet Tartare~Charred beets horseradish creme rye crisp~14~Vegan^Charred Octopus~Smoked paprika fingerling potato aioli~18|Mains>Grilled Ribeye~Charred onion confit~42^Pan-seared Salmon~Lemon butter capers~34
reservations Book a Table|Parties up to 8 for larger groups call us
footer
@pages menu reservations`

// Mock generateText to return the restaurant DSL.
const generateTextMock = vi.hoisted(() =>
  vi.fn(async (_modelId, _system, _user, _signal, _retries?) => restaurantDsl),
)

// Mock resolvePipelineLanguage to return a fixed English mode.
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
}))
vi.mock('../pipeline/prompt-language.js', () => ({
  resolvePipelineLanguage: resolvePipelineLanguageMock,
}))

// Mock v3 sibling modules (parallel subagents own them; mock so this test is standalone).
const buildPromptMock = vi.hoisted(() =>
  vi.fn(() => ({
    system: 'v3 system prompt (mocked)',
    user: 'v3 user prompt (mocked)',
  })),
)
const buildLowConfidenceKindPromptMock = vi.hoisted(() =>
  vi.fn(() => ({ system: 'kind system', user: 'kind user' })),
)
const buildLowConfidenceFillPromptMock = vi.hoisted(() =>
  vi.fn(() => ({ system: 'fill system', user: 'fill user' })),
)
const parseSitePlanMock = vi.hoisted(() =>
  vi.fn(() => ({
    kind: 'restaurant',
    sections: [
      {
        role: 'hero',
        content: [
          'Farm to Table',
          'Wood-fired cuisine in the heart of the valley',
          'Seasonal menus sourced from local farms cooked over open flame',
          'Rustic dining room with candlelit tables',
        ],
      },
      {
        role: 'menu',
        content: ['Autumn Menu', 'Three courses from Chef Marco'],
        nested: [
          {
            name: 'Starters',
            items: [
              {
                fields: [
                  'Roasted Beet Tartare',
                  'Charred beets horseradish creme rye crisp',
                  '14',
                  'Vegan',
                ],
              },
              {
                fields: [
                  'Charred Octopus',
                  'Smoked paprika fingerling potato aioli',
                  '18',
                ],
              },
            ],
          },
        ],
      },
      { role: 'reservations', content: ['Book a Table'] },
      { role: 'footer', content: [] },
    ],
    pages: ['menu', 'reservations'],
    tables: [],
    operations: [],
  })),
)
const validatePlanMock = vi.hoisted(() =>
  vi.fn(() => ({ valid: true, errors: [] })),
)
const fixPlanMock = vi.hoisted(() => vi.fn((plan) => plan))
const retryLoopMock = vi.hoisted(() =>
  vi.fn(() => ({
    plan: parseSitePlanMock(),
    attempts: 1,
    valid: true,
  })),
)
const compileSitePlanMock = vi.hoisted(() =>
  vi.fn(() => ({
    skeleton: 'root = PageSwitch({\n  home: Home,\n})',
    source:
      'root = PageSwitch({\n  home: Home,\n  menu: Menu,\n  reservations: Reservations,\n})\n',
    pageSources: {
      home: 'home = Stack([])',
      Menu: 'Menu = Section({ title: "Autumn Menu" })',
      Reservations: 'Reservations = Section({ title: "Book a Table" })',
    },
    lakebed: {
      tables: [
        {
          name: 'menuItems',
          fields: {
            name: { type: 'string', default: '', seedFromProps: true },
            description: { type: 'string', default: '', seedFromProps: true },
            price: { type: 'string', default: '', seedFromProps: true },
            tag: { type: 'string', default: '', seedFromProps: true },
          },
        },
        {
          name: 'orderItems',
          fields: {
            name: { type: 'string', default: '', seedFromProps: false },
            quantity: { type: 'number', default: 1, seedFromProps: false },
          },
        },
      ],
      queries: [{ name: 'menuCatalog', table: 'menuItems', body: 'all' }],
      mutations: [{ name: 'addMenuItem', table: 'orderItems', body: 'upsert' }],
    },
    siteSpec: {
      brand: 'Farm Table',
      tagline: 'Farm to Table',
      theme: 'default',
      locale: 'en',
      skeleton: 'root = PageSwitch({\n  home: Home,\n})',
      modules: { home: 'root = PageSwitch(...)', Menu: 'Menu = ...' },
      kind: 'restaurant',
      lakebed: {
        tables: [{ name: 'menuItems', fields: {} }],
        queries: [],
        mutations: [],
      },
      fullstackManifest: {
        tables: ['menuItems', 'orderItems'],
        schemaVersion: 1,
        auth: false,
      },
      sitePlan: {
        kind: 'restaurant',
        sections: [{ role: 'hero', content: [] }],
        pages: ['menu', 'reservations'],
        tables: [],
        operations: [],
      },
    },
  })),
)
const streamingParserCtor = vi.hoisted(() =>
  vi.fn(function (this: any) {
    this.onSectionStart = vi.fn()
    this.onSectionComplete = vi.fn()
    this.feed = vi.fn()
    this.flush = vi.fn()
  }),
)
const inferLakebedMock = vi.hoisted(() =>
  vi.fn(() => ({
    tables: [{ name: 'menuItems', fields: {} }],
    queries: [],
    mutations: [],
  })),
)
const getVocabularyMock = vi.hoisted(() => vi.fn(() => ({ roles: [] })))

vi.mock('./prompt', () => ({
  buildPrompt: buildPromptMock,
  buildLowConfidenceKindPrompt: buildLowConfidenceKindPromptMock,
  buildLowConfidenceFillPrompt: buildLowConfidenceFillPromptMock,
}))
vi.mock('./parser', () => ({ parseSitePlan: parseSitePlanMock }))
vi.mock('./validator', () => ({ validatePlan: validatePlanMock }))
vi.mock('./fixer', () => ({ fixPlan: fixPlanMock }))
vi.mock('./retry', () => ({ retryLoop: retryLoopMock }))
const compileSectionMock = vi.hoisted(() =>
  vi.fn(() => ({
    statements: ['sectionStub = Hero("test")'],
    ref: 'sectionStub',
  })),
)
vi.mock('./compiler', () => ({
  compileSitePlan: compileSitePlanMock,
  compileSection: compileSectionMock,
}))
vi.mock('./streaming', () => ({ StreamingParser: streamingParserCtor }))
vi.mock('./inference', () => ({ inferLakebed: inferLakebedMock }))
vi.mock('./vocabulary', () => ({ getVocabulary: getVocabularyMock }))

describe('runAllV3', () => {
  it('orchestrates site-plan → compile → persist + emits expected events', async () => {
    const { runAllV3 } = await import('./index.ts')
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-run-v3-'))
    const broadcasts: unknown[] = []
    const signalHomepageReady = vi.fn()
    const signalOpenuiReady = vi.fn()
    const sessionCtx = {
      id: 'test-session-v3',
      broadcast: (payload) => broadcasts.push(payload),
      setPrompt: vi.fn(),
      setTasks: vi.fn(),
      updateTask: vi.fn(),
      signalHomepageReady,
      signalOpenuiReady,
      setElapsed: vi.fn(),
      setCost: vi.fn(),
    }

    await runAllV3({
      workspace,
      prompt: 'a farm-to-table restaurant with seasonal menus',
      preferredLanguage: 'en',
      sessionCtx,
      integrations: undefined,
    })

    const eventTypes = broadcasts
      .map((b) => (b as { type?: string }).type)
      .filter(Boolean)

    // Expected events: theme, locale, plan, skeleton, module, source, lakebed, done, run_completed.
    expect(eventTypes).toContain('theme')
    expect(eventTypes).toContain('locale')
    expect(eventTypes).toContain('plan')
    expect(eventTypes).toContain('skeleton')
    expect(eventTypes).toContain('module')
    expect(eventTypes).toContain('source')
    expect(eventTypes).toContain('lakebed')
    expect(eventTypes).toContain('done')
    expect(eventTypes).toContain('run_completed')

    // home.openui written and contains PageSwitch.
    const homeSource = readFileSync(join(workspace, 'home.openui'), 'utf8')
    expect(homeSource).toContain('root = PageSwitch(')

    // site-spec.json written with kind='restaurant' and non-empty lakebed.tables.
    const siteSpec = JSON.parse(
      readFileSync(join(workspace, 'site-spec.json'), 'utf8'),
    )
    expect(siteSpec.kind).toBe('restaurant')
    expect(Array.isArray(siteSpec.lakebed?.tables)).toBe(true)
    expect(siteSpec.lakebed.tables.length).toBeGreaterThan(0)

    // openui-manifest.json written.
    expect(existsSync(join(workspace, 'openui-manifest.json'))).toBe(true)

    // index.html written by SSR step (required by engine adapter) must be the
    // final static OpenUI document, not a live preview-client shell.
    expect(existsSync(join(workspace, 'index.html'))).toBe(true)
    const indexHtml = readFileSync(join(workspace, 'index.html'), 'utf8')
    expect(indexHtml.length).toBeGreaterThan(0)
    expect(indexHtml).toContain('data-sf-export-page')
    expect(indexHtml).not.toContain('openui-preview-client.js')
    expect(indexHtml).not.toContain('<div id="openui-root"></div>')
    expect(indexHtml).not.toContain('Generated OpenUI source is ready')
    expect(indexHtml).not.toContain('ship-fast-openui-source')

    // tasks.json shows DONE.
    const tasks = JSON.parse(
      readFileSync(join(workspace, 'tasks.json'), 'utf8'),
    )
    expect(tasks.tasks.map((t) => t.status)).toEqual(['DONE'])

    // generateText was called (high-confidence restaurant prompt).
    expect(generateTextMock).toHaveBeenCalled()

    // signalHomepageReady fired (plan says: when first section's OpenUI emits).
    expect(sessionCtx.signalHomepageReady).toHaveBeenCalled()
    expect(sessionCtx.signalOpenuiReady).toHaveBeenCalled()
  }, 15_000)
})
