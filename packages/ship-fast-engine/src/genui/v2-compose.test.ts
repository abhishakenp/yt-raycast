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
        { heading: `Heading ${id}`, subheading: 'Sub', items: [{ title: 'A' }, { title: 'B' }] },
      ]),
    ),
  )

// Mock reply for the first-pass superagent call: pick the first listed vertical
// and fill every listed section role with content (mirrors the real response).
const superagentReply = (user: string): string => {
  const family = (user.match(/Vertical "([A-Za-z0-9]+)"/) ?? [])[1] ?? 'Marketing'
  const keys = [...user.matchAll(/^\s+([a-z0-9]+):\s/gm)].map((m) => m[1])
  const sections = Object.fromEntries(
    [...new Set(keys)].map((k) => [
      k,
      { heading: `H ${k}`, subheading: 'S', items: [{ title: 'A' }, { title: 'B' }] },
    ]),
  )
  return JSON.stringify({ family, sections })
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
    expect(page.statements.at(-1)).toMatch(/^home = Stack\(\[/)
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
})

describe('runV2ComposedGeneration', () => {
  beforeEach(() => mocks.generateText.mockReset())

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
    expect(result.source).toMatch(/root = PageSwitch\(/)
    expect(result.theme).toBeTruthy()
    expect(result.brand.length).toBeGreaterThan(0)
    // home page statement exists and is composed via Stack
    expect(result.source).toMatch(/\bhome = Stack\(\[/)
  })

  it('is deterministic per (prompt, seed) and varies composition across seeds', async () => {
    mocks.generateText.mockImplementation(async (..._a: unknown[]) => {
      const user = String(_a[2])
      if (/Candidate verticals/.test(user)) return superagentReply(user)
      return richProps(user)
    })
    const run = (seed: string) =>
      runV2ComposedGeneration({ prompt: 'a developer security tool', modelId: 'm', sessionSeed: seed, signal })
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
      const pageSwitch = (r.source.match(/PageSwitch\([^\]]*\][^\]]*\]/) ?? [''])[0]
      compositions.add(`${r.theme}|${pageSwitch}|${r.source.length}`)
    }
    expect(compositions.size).toBeGreaterThan(1) // composition differs across seeds
  })
})

describe('resolveFamily', () => {
  it('falls back to a deterministic pick when candidates are all invalid', () => {
    const fam = resolveFamily(['NopeNotReal'], 'seed')
    expect(FAMILIES.has(fam.name)).toBe(true)
  })
})
