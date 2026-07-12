import { describe, expect, it, vi, beforeEach } from 'vitest'

// Mock the model so tests are deterministic and offline. The mock returns a JSON
// object of section props keyed by the section ids the compose prompt requests.
const mocks = ((
  globalThis as typeof globalThis & {
    __v2mocks?: { generateText: ReturnType<typeof vi.fn> }
  }
).__v2mocks ??= { generateText: vi.fn() })

vi.mock('../generate.ts', () => ({
  generateText: (...args: unknown[]) =>
    (
      (globalThis as typeof globalThis & { __v2mocks: typeof mocks }).__v2mocks
        .generateText as unknown as (...a: unknown[]) => unknown
    )(...args),
  isHardLlmFailure: () => false,
  formatLlmFailureMessage: (e: unknown) => String(e),
}))

import { auditOpenUIProgram } from './openui-program-audit.ts'
import { getComponentSignature } from './openui-signature.ts'
import {
  FAMILIES,
  classifyFamilies,
  isFlightSimulatorGamePrompt,
  shouldConsiderFreeFormAppMode,
  resolveFamily,
  composePage,
  runV2ComposedGeneration,
} from './v2-compose.ts'

const auditOk = async (src: string): Promise<true | string> => {
  try {
    await auditOpenUIProgram(src, { expectedRoot: 'PageSwitch' })
    return true
  } catch (e) {
    return e instanceof Error ? e.message : String(e)
  }
}

// The compose prompt lists `"<sectionId>": <Signature>` lines — extract ids so
// the mock can answer with realistic per-section props.
const sectionIdsFromPrompt = (user: string): string[] =>
  [...user.matchAll(/"([a-z0-9_]+)":\s*[A-Z]/g)].map((m) => m[1])

const richProps = (user: string): string =>
  JSON.stringify(
    Object.fromEntries(
      sectionIdsFromPrompt(user).map((id) => [
        id,
        {
          heading: `Heading ${id}`,
          subheading: 'Sub',
          items: [{ title: 'A' }, { title: 'B' }],
        },
      ]),
    ),
  )

// Mock reply for the first-pass superagent call: pick the first listed vertical
// and fill every listed section role with content (mirrors the real response).
const superagentReply = (user: string): string => {
  const family =
    (user.match(/Vertical "([A-Za-z0-9]+)"/) ?? [])[1] ?? 'Marketing'
  const keys = [...user.matchAll(/^\s+([a-z0-9]+):\s/gm)].map((m) => m[1])
  const sections = Object.fromEntries(
    [...new Set(keys)].map((k) => [
      k,
      {
        heading: `H ${k}`,
        subheading: 'S',
        items: [{ title: 'A' }, { title: 'B' }],
      },
    ]),
  )
  return JSON.stringify({
    brand: 'Test Brand',
    family,
    title: 'Test Brand — AI Decided Title',
    navLabels: { home: 'Home', pricing: 'Plans', about: 'Our Story' },
    sections,
  })
}

const signal = new AbortController().signal

describe('v2 family discovery', () => {
  it('discovers known vertical families with canonically ordered sections', () => {
    expect(FAMILIES.size).toBeGreaterThan(30)
    const cafe = FAMILIES.get('Cafe')
    expect(cafe).toBeTruthy()
    expect(cafe!.sections).toContain('Hero')
    expect(cafe!.sections).toContain('Navbar')
    // Navbar precedes Hero precedes Footer (canonical order)
    const i = (s: string) => cafe!.sections.indexOf(s)
    expect(i('Navbar')).toBeLessThan(i('Hero'))
    if (i('Footer') >= 0) expect(i('Hero')).toBeLessThan(i('Footer'))
  })

  it('attaches suffix-agnostic bespoke vertical roles (pass 2)', () => {
    expect(FAMILIES.get('FashionStore')!.sections).toContain('Products')
    const event = FAMILIES.get('Event')!.sections
    expect(event).toContain('Speakers')
    expect(event).toContain('Tickets')
    expect(FAMILIES.get('HotelResort')!.sections).toContain('Rooms')
  })

  it('every section reconstructs a real component (name = family+role)', () => {
    for (const fam of ['FashionStore', 'Event']) {
      const family = FAMILIES.get(fam)!
      for (const s of family.sections) {
        expect(getComponentSignature(family.name + s)).toBeTruthy()
      }
    }
  })

  it('bespoke roles sit between head content and tail proof/close blocks', () => {
    const fs = FAMILIES.get('FashionStore')!.sections
    const i = (s: string) => fs.indexOf(s)
    expect(i('Hero')).toBeLessThan(i('Products'))
    for (const tail of ['Footer', 'Testimonials', 'Stats']) {
      if (i(tail) >= 0) expect(i('Products')).toBeLessThan(i(tail))
    }
  })
})

describe('classifyFamilies', () => {
  beforeEach(() => mocks.generateText.mockReset())
  it('parses a comma list, keeps only real families, dedups', async () => {
    mocks.generateText.mockResolvedValue('Cafe, NotAReal, Cafe, Bakery')
    const out = await classifyFamilies('a bakery', 'm', signal)
    expect(out).toContain('Cafe')
    expect(out).not.toContain('NotAReal')
    expect(new Set(out).size).toBe(out.length)
  })
})

describe('generation mode guard', () => {
  it('does not consider SaaS/brand website briefs as free-form apps', () => {
    expect(shouldConsiderFreeFormAppMode('Saas Vape')).toBe(false)
    expect(shouldConsiderFreeFormAppMode('a website for a task app')).toBe(
      false,
    )
    expect(shouldConsiderFreeFormAppMode('todo app')).toBe(true)
    expect(shouldConsiderFreeFormAppMode('mortgage calculator')).toBe(true)
  })

  it('recognizes flight-simulator gameplay intent without matching unrelated games', () => {
    expect(
      isFlightSimulatorGamePrompt(
        'A playable 3D flight simulator: pilot a small plane over an open world',
      ),
    ).toBe(true)
    expect(isFlightSimulatorGamePrompt('a playable arcade puzzle game')).toBe(
      false,
    )
    expect(
      isFlightSimulatorGamePrompt('a marketing site for aviation software'),
    ).toBe(false)
  })
})

describe('composePage (valid by construction, no fallback)', () => {
  beforeEach(() => mocks.generateText.mockReset())

  it('produces an audit-valid composed page from model JSON props', async () => {
    mocks.generateText.mockImplementation(async (..._a: unknown[]) =>
      richProps(String(_a[2])),
    )
    const family = FAMILIES.get('Crm')!
    const page = await composePage({
      prompt: 'a crm for teams',
      family,
      brand: 'Acme',
      nav: ['Home', 'Pricing'],
      pageId: 'home',
      seed: 'seed-1',
      modelId: 'm',
      signal,
    })
    const src = `${page.statements.join('\n')}\nroot = PageSwitch(["Home"], [home])`
    expect(await auditOk(src)).toBe(true)
    expect(page.rootRef).toBe('home')
    expect(page.sections.length).toBeGreaterThan(0)
    expect(
      page.sections.every((s) => s.component.startsWith(family.name)),
    ).toBe(true)
  })

  it('still produces VALID OpenUI when the model returns empty/garbage (degrades, never breaks)', async () => {
    mocks.generateText.mockResolvedValue('not json at all')
    const family = FAMILIES.get('Crm')!
    const page = await composePage({
      prompt: 'a crm',
      family,
      brand: 'Acme',
      nav: ['Home'],
      pageId: 'home',
      seed: 's',
      modelId: 'm',
      signal,
    })
    const src = `${page.statements.join('\n')}\nroot = PageSwitch(["Home"], [home])`
    // No canned fallback page — but mapping with empty props is still valid OpenUI.
    expect(await auditOk(src)).toBe(true)
  })

  // Regression: non-English locales (e.g. Malayalam) previously caused the LLM
  // to write image alt text in the locale, which then became the Pexels search
  // query and returned irrelevant images. The compose system prompt must force
  // alt text to English regardless of locale.
  it('forces image alt text to English for non-English locales (Malayalam)', async () => {
    mocks.generateText.mockImplementation(async (..._a: unknown[]) =>
      richProps(String(_a[2])),
    )
    const family = FAMILIES.get('Crm')!
    await composePage({
      prompt: 'ഓണം സരിക്ക് ഒരു ഷോപ്പിങ് സൈറ്റ്',
      family,
      brand: 'Acme',
      nav: ['Home'],
      pageId: 'home',
      seed: 's',
      modelId: 'm',
      signal,
      locale: 'ml',
    })
    const systemPrompt = String(mocks.generateText.mock.calls[0][1])
    expect(systemPrompt).toContain('Malayalam')
    expect(systemPrompt).toMatch(/alt text.*English/i)
  })

  it('forces image alt text to English even for the default (en) locale', async () => {
    mocks.generateText.mockImplementation(async (..._a: unknown[]) =>
      richProps(String(_a[2])),
    )
    const family = FAMILIES.get('Crm')!
    await composePage({
      prompt: 'a crm',
      family,
      brand: 'Acme',
      nav: ['Home'],
      pageId: 'home',
      seed: 's',
      modelId: 'm',
      signal,
    })
    const systemPrompt = String(mocks.generateText.mock.calls[0][1])
    expect(systemPrompt).toMatch(/alt text.*English/i)
  })
})

describe('runV2ComposedGeneration', () => {
  beforeEach(() => mocks.generateText.mockReset())

  it('selects the deterministic whole-page flight simulator capsule', async () => {
    const result = await runV2ComposedGeneration({
      prompt:
        'A playable 3D flight simulator game built with Three.js. Pilot a small plane in third-person over a huge open world.',
      modelId: 'm',
      sessionSeed: 'flight-simulator',
      signal,
    })

    expect(result.source).toBe('root = FlightSimulator()')
    expect(result.category).toBe('game')
    expect(result.family).toBe('FlightSimulator')
    expect(result.routes).toEqual([])
    expect(result.pages).toEqual([])
    expect(mocks.generateText).not.toHaveBeenCalled()
  })

  it('produces a valid multi-page site with theme, brand and a PageSwitch root', async () => {
    mocks.generateText.mockImplementation(async (..._a: unknown[]) => {
      const user = String(_a[2])
      // first-pass superagent picks vertical + fills home; secondary pages request section JSON.
      if (/Candidate verticals/.test(user)) return superagentReply(user)
      return richProps(user)
    })
    const result = await runV2ComposedGeneration({
      prompt: 'a crm for small sales teams',
      modelId: 'm',
      sessionSeed: 'sess-xyz',
      signal,
    })
    expect(await auditOk(result.source)).toBe(true)
    expect(result.routes.length).toBeGreaterThan(0)
    expect(Object.keys(result.navTargets)).toContain('get started')
    const homePage = result.pages.find((p) => p.id === 'home')
    expect(homePage).toBeTruthy()
    expect(homePage!.sections.length).toBeGreaterThan(0)
    // First content section keeps a scroll offset for the fixed navbar but must
    // NOT carry redundant top padding — section components provide their own,
    // and stacking both caused a large gap below the nav. See v2-compose.ts.
    const firstContent = homePage!.sections.find((s) => s.id !== 'home_navbar')
    expect(firstContent).toBeTruthy()
    expect(firstContent!.anchorClass).toContain('scroll-mt-28')
    expect(firstContent!.anchorClass).not.toContain('pt-24')
    expect(
      homePage!.sections.some((s) => s.anchorClass.includes('pt-24 sm:pt-28')),
    ).toBe(false)
    expect(result.theme).toBeTruthy()
    expect(result.brand.length).toBeGreaterThan(0)
    // home page exists and is composed via Stack
    expect(
      result.pages.some((p) => p.id === 'home' && p.rootRef === 'home'),
    ).toBe(true)
  })

  it('keeps SaaS brand prompts on the website composer path', async () => {
    mocks.generateText.mockImplementation(async (..._a: unknown[]) => {
      const user = String(_a[2])
      if (/Candidate verticals/.test(user)) return superagentReply(user)
      return richProps(user)
    })
    const result = await runV2ComposedGeneration({
      prompt: 'Saas Vape',
      modelId: 'm',
      sessionSeed: 'saas-vape-regression',
      signal,
    })

    expect(await auditOk(result.source)).toBe(true)
    expect(result.routes.length).toBeGreaterThan(0)
    expect(result.family).not.toBe('Freeform')
    // website composer path never emits State primitives (only family components)
    expect(
      result.pages.every((p) =>
        p.sections.every(
          (s) => !/^State(Button|Input|Text)$/.test(s.component),
        ),
      ),
    ).toBe(true)
  })

  it('emits target aliases and excludes full Hero sections from secondary pages', async () => {
    mocks.generateText.mockImplementation(async (..._a: unknown[]) => {
      const user = String(_a[2])
      if (/Candidate verticals/.test(user)) return superagentReply(user)
      return richProps(user)
    })
    const result = await runV2ComposedGeneration({
      prompt: 'a crm with pricing and contact pages',
      modelId: 'm',
      sessionSeed: 'secondary-contracts',
      familyOverride: 'Crm',
      signal,
    })

    expect(await auditOk(result.source)).toBe(true)
    expect(result.navTargets['get started']).toBeTruthy()
    // secondary pages never include a full Hero section
    expect(
      result.pages
        .filter((p) => p.id !== 'home')
        .every((p) => p.sections.every((s) => !s.id.endsWith('_hero'))),
    ).toBe(true)
    expect(result.routes).not.toContain('Explore')
    expect(Object.keys(result.navTargets)).not.toContain('Explore')
  })

  it('keeps structural chrome out of the fullstack manifest', async () => {
    mocks.generateText.mockImplementation(async (..._a: unknown[]) => {
      const user = String(_a[2])
      if (/Candidate verticals/.test(user)) return superagentReply(user)
      return richProps(user)
    })
    const result = await runV2ComposedGeneration({
      prompt: 'beauty store with products and editorial shopping pages',
      modelId: 'm',
      sessionSeed: 'fullstack-chrome-filter',
      familyOverride: 'BeautyStore',
      signal,
    })
    const manifestArtifact = result.artifacts.find(
      (artifact) => artifact.key === 'fullstack-manifest',
    )
    const manifest = JSON.parse(manifestArtifact?.contentJson ?? '{}') as {
      tables?: string[]
    }

    expect(manifest.tables).toContain('items')
    expect(manifest.tables).not.toContain('linkColumns')
    expect(manifest.tables).not.toContain('links')
  })

  it('keeps page planning meaningful across generic website prompt families', async () => {
    mocks.generateText.mockImplementation(async (..._a: unknown[]) => {
      const user = String(_a[2])
      if (/Candidate verticals/.test(user)) return superagentReply(user)
      return richProps(user)
    })
    const prompts = [
      ['SaaS', 'Crm'],
      ['commerce', 'FashionStore'],
      ['restaurant', 'Cafe'],
      ['publication', 'Blog'],
      ['portfolio', 'PortfolioDev'],
      ['event', 'Event'],
    ] as const

    for (const [label, familyOverride] of prompts) {
      const result = await runV2ComposedGeneration({
        prompt: `${label} website with rich navigation and calls to action`,
        modelId: 'm',
        sessionSeed: `matrix-${familyOverride}`,
        familyOverride,
        signal,
      })
      expect(await auditOk(result.source)).toBe(true)
      const routes = result.routes
      expect(routes.length, familyOverride).toBeGreaterThan(1)
      expect(
        result.pages.every((p) => p.sections.length > 0),
        familyOverride,
      ).toBe(true)
      expect(result.navTargets['Home'], familyOverride).toBe('Home')
      expect(routes, familyOverride).not.toContain('Explore')
    }
  })

  it('plans bespoke catalog roles as real secondary pages', async () => {
    mocks.generateText.mockImplementation(async (..._a: unknown[]) => {
      const user = String(_a[2])
      if (/Candidate verticals/.test(user)) return superagentReply(user)
      return richProps(user)
    })
    const cases = [
      {
        prompt: 'university website with admissions and degree programs',
        familyOverride: 'University',
        expectedOneOf: ['Programs'],
      },
      {
        prompt: 'coding bootcamp website with curriculum and career outcomes',
        familyOverride: 'Bootcamp',
        expectedOneOf: ['Curriculum', 'Outcomes'],
      },
      {
        prompt: 'conference website with agenda, speakers, venue, and tickets',
        familyOverride: 'Event',
        expectedOneOf: ['Agenda', 'Speakers', 'Venue', 'Tickets'],
      },
      {
        prompt: 'fashion store website with collections and editorial lookbook',
        familyOverride: 'FashionStore',
        expectedOneOf: ['Collections', 'Lookbook'],
      },
      {
        prompt: 'hotel resort website with rooms, amenities, and booking',
        familyOverride: 'HotelResort',
        expectedOneOf: ['Amenities', 'Booking', 'Rooms'],
      },
      {
        prompt: 'online course website with programs and pricing',
        familyOverride: 'OnlineCourse',
        expectedOneOf: ['Programs'],
      },
    ]

    for (const testCase of cases) {
      const result = await runV2ComposedGeneration({
        prompt: testCase.prompt,
        modelId: 'm',
        sessionSeed: `bespoke-role-${testCase.familyOverride}`,
        familyOverride: testCase.familyOverride,
        signal,
      })
      expect(await auditOk(result.source)).toBe(true)
      const routes = result.routes
      expect(routes, testCase.familyOverride).toEqual(
        expect.arrayContaining(['Home']),
      )
      expect(
        testCase.expectedOneOf.some((label) => routes.includes(label)),
        `${testCase.familyOverride} routes: ${routes.join(', ')}`,
      ).toBe(true)
      expect(routes, testCase.familyOverride).not.toContain('Explore')
      for (const label of routes.filter((route) => route !== 'Home')) {
        const page = result.pages.find((p) => p.label === label)
        expect(page, `${testCase.familyOverride}:${label}`).toBeTruthy()
        expect(
          page!.sections.every((s) => !s.id.endsWith('_hero')),
          `${testCase.familyOverride}:${label} has no hero section`,
        ).toBe(true)
      }
    }
  })

  it('is deterministic per (prompt, seed) and varies composition across seeds', async () => {
    mocks.generateText.mockImplementation(async (..._a: unknown[]) => {
      const user = String(_a[2])
      if (/Candidate verticals/.test(user)) return superagentReply(user)
      return richProps(user)
    })
    const run = (seed: string) =>
      runV2ComposedGeneration({
        prompt: 'a developer security tool',
        modelId: 'm',
        sessionSeed: seed,
        signal,
      })
    const a1 = await run('seedA')
    const a2 = await run('seedA')
    // Same prompt + same seed → byte-identical output.
    expect(a1.source).toBe(a2.source)
    // Family is deterministic PER PROMPT (the superagent/shortlist picks it); the
    // seed varies the COMPOSITION (theme + which sections/order), not the vertical.
    const compositions = new Set<string>()
    for (const seed of ['s1', 's2', 's3', 's4', 's5', 's6']) {
      const r = await run(seed)
      expect(r.family).toBe(a1.family) // same vertical across seeds
      // Structural composition signature: theme + routes + per-page section ids.
      const signature = `${r.theme}|${r.routes.join(',')}|${r.pages
        .map((p) => `${p.id}:${p.sections.map((s) => s.id).join('+')}`)
        .join(';')}`
      compositions.add(signature)
    }
    expect(compositions.size).toBeGreaterThan(1) // composition differs across seeds
  })

  it('returns the LLM-decided title in the result', async () => {
    mocks.generateText.mockImplementation(async (..._a: unknown[]) => {
      const user = String(_a[2])
      if (/Candidate verticals/.test(user)) return superagentReply(user)
      return richProps(user)
    })
    const result = await runV2ComposedGeneration({
      prompt: 'a crm for small sales teams',
      modelId: 'm',
      sessionSeed: 'title-test',
      signal,
    })
    expect(result.title).toBe('Test Brand — AI Decided Title')
  })

  it('uses AI navLabels for page labels instead of hardcoded defaults', async () => {
    mocks.generateText.mockImplementation(async (..._a: unknown[]) => {
      const user = String(_a[2])
      if (/Candidate verticals/.test(user)) return superagentReply(user)
      return richProps(user)
    })
    const result = await runV2ComposedGeneration({
      prompt: 'a crm with pricing and about pages',
      modelId: 'm',
      sessionSeed: 'navlabels-test',
      familyOverride: 'Crm',
      signal,
    })
    // The mock superagentReply provides navLabels: { home: 'Home', pricing: 'Plans', about: 'Our Story' }
    // If a pricing page is planned, its label should be 'Plans' (AI), not 'Pricing' (hardcoded).
    // If an about page is planned, its label should be 'Our Story' (AI), not 'About' (hardcoded).
    const pricingPage = result.pages.find((p) => p.id === 'pricing')
    if (pricingPage) {
      expect(pricingPage.label).toBe('Plans')
      expect(result.routes).toContain('Plans')
    }
    const aboutPage = result.pages.find((p) => p.id === 'about')
    if (aboutPage) {
      expect(aboutPage.label).toBe('Our Story')
      expect(result.routes).toContain('Our Story')
    }
  })

  it('falls back to hardcoded labels when AI does not provide navLabels', async () => {
    mocks.generateText.mockImplementation(async (..._a: unknown[]) => {
      const user = String(_a[2])
      if (/Candidate verticals/.test(user)) {
        const family =
          (user.match(/Vertical "([A-Za-z0-9]+)"/) ?? [])[1] ?? 'Marketing'
        const keys = [...user.matchAll(/^\s+([a-z0-9]+):\s/gm)].map((m) => m[1])
        const sections = Object.fromEntries(
          [...new Set(keys)].map((k) => [
            k,
            { heading: `H ${k}`, subheading: 'S', items: [{ title: 'A' }] },
          ]),
        )
        // No title, no navLabels — simulate older LLM that doesn't return them
        return JSON.stringify({ brand: 'No Labels Brand', family, sections })
      }
      return richProps(user)
    })
    const result = await runV2ComposedGeneration({
      prompt: 'a crm',
      modelId: 'm',
      sessionSeed: 'no-navlabels',
      familyOverride: 'Crm',
      signal,
    })
    expect(result.title).toBeUndefined()
    // Home page should fall back to hardcoded 'Home'
    expect(result.routes).toContain('Home')
    // Pricing page (if planned) should fall back to hardcoded 'Pricing'
    const pricingPage = result.pages.find((p) => p.id === 'pricing')
    if (pricingPage) expect(pricingPage.label).toBe('Pricing')
  })

  it('includes title and navLabels in cached ComposedContent', async () => {
    const capturedContent: Record<string, unknown>[] = []
    mocks.generateText.mockImplementation(async (..._a: unknown[]) => {
      const user = String(_a[2])
      if (/Candidate verticals/.test(user)) return superagentReply(user)
      return richProps(user)
    })
    await runV2ComposedGeneration({
      prompt: 'a crm',
      modelId: 'm',
      sessionSeed: 'cache-test',
      familyOverride: 'Crm',
      signal,
      onContent: (content) => capturedContent.push(content),
    })
    expect(capturedContent.length).toBeGreaterThan(0)
    expect(capturedContent[0].title).toBe('Test Brand — AI Decided Title')
    expect(capturedContent[0].navLabels).toEqual({
      home: 'Home',
      pricing: 'Plans',
      about: 'Our Story',
    })
  })

  it('asks the superagent for title and navLabels in the prompt', async () => {
    mocks.generateText.mockImplementation(async (..._a: unknown[]) => {
      const user = String(_a[2])
      if (/Candidate verticals/.test(user)) return superagentReply(user)
      return richProps(user)
    })
    await runV2ComposedGeneration({
      prompt: 'a crm',
      modelId: 'm',
      sessionSeed: 'prompt-check',
      familyOverride: 'Crm',
      signal,
    })
    const superagentCall = mocks.generateText.mock.calls.find((call) =>
      /Candidate verticals/.test(String(call[2])),
    )
    expect(superagentCall).toBeTruthy()
    const systemPrompt = String(superagentCall![1])
    const userPrompt = String(superagentCall![2])
    // System prompt must instruct the LLM to return title and navLabels
    expect(systemPrompt).toMatch(/site title/i)
    expect(systemPrompt).toMatch(/navLabels/i)
    // User prompt must list possible page role ids
    expect(userPrompt).toMatch(/page role ids/i)
  })
})

describe('resolveFamily', () => {
  it('falls back to a deterministic pick when candidates are all invalid', () => {
    const fam = resolveFamily(['NopeNotReal'], 'seed')
    expect(FAMILIES.has(fam.name)).toBe(true)
  })
})
