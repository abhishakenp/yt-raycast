import { describe, expect, it, vi, beforeEach } from 'vitest'
import { runComposition } from './composition-runner.ts'

// Mock the LLM generateText to return a fixed composition DSL
vi.mock('../generate.ts', () => ({
  generateText: vi.fn(
    async () =>
      `<reasoning>Let me think about this coffee shop...</reasoning>
@design radius:rounded shadow:soft gradient:subtle density:airy typography:editorial
@brand Bean & Co
@title Bean & Co — Artisan Coffee
@pages home about menu contact

@section Navbar
  brand Bean & Co
  links Home About Menu Contact
  cta Order Now

@section SplitHero
  badge Fresh daily
  heading We roast [hl]perfect[/hl] coffee
  subheading Artisan beans, small-batch roasted in Brooklyn
  primaryCta Order Now
  secondaryCta Our Story
  stats>120+~Cups daily^15~Bean origins^8yr~Roasting

@section CardGrid
  eyebrow What we do
  heading Our craft
  cards>Espresso~Double shot intensity^Pour Over~Slow extraction^Cold Brew~24hr steeped

@section GroupedList
  heading Our Menu
  groups>Espresso>Americano~Double shot~$4^Cappuccino~Espresso+foam~$5^Latte~Creamy~$6^Pour Over>V60~Floral~$5^French Press~Full body~$4

@section TestimonialRow
  heading What customers say
  testimonials>Best coffee in Brooklyn~Jane Doe~Regular^I come here every day~John Smith~Local

@section MapBlock
  heading Find us
  address 123 Coffee Lane, Brooklyn NY
  hours Mon-Fri 7am-7pm, Sat-Sun 8am-6pm

@section Footer
  brand Bean & Co
  columns>Pages~Home About Menu Contact^Company~Our Story Careers
  social Instagram Twitter`,
  ),
  generateTextStream: vi.fn(
    async (_model, _system, _user, _signal, onChunk) => {
      const text = `<reasoning>Let me think about this coffee shop...</reasoning>
@design radius:rounded shadow:soft gradient:subtle density:airy typography:editorial
@brand Bean & Co
@title Bean & Co — Artisan Coffee
@pages home about menu contact

@section Navbar
  brand Bean & Co
  links Home About Menu Contact
  cta Order Now

@section SplitHero
  badge Fresh daily
  heading We roast [hl]perfect[/hl] coffee
  subheading Artisan beans, small-batch roasted in Brooklyn
  primaryCta Order Now
  secondaryCta Our Story
  stats>120+~Cups daily^15~Bean origins^8yr~Roasting

@section CardGrid
  eyebrow What we do
  heading Our craft
  cards>Espresso~Double shot intensity^Pour Over~Slow extraction^Cold Brew~24hr steeped

@section GroupedList
  heading Our Menu
  groups>Espresso>Americano~Double shot~$4^Cappuccino~Espresso+foam~$5^Latte~Creamy~$6^Pour Over>V60~Floral~$5^French Press~Full body~$4

@section TestimonialRow
  heading What customers say
  testimonials>Best coffee in Brooklyn~Jane Doe~Regular^I come here every day~John Smith~Local

@section MapBlock
  heading Find us
  address 123 Coffee Lane, Brooklyn NY
  hours Mon-Fri 7am-7pm, Sat-Sun 8am-6pm

@section Footer
  brand Bean & Co
  columns>Pages~Home About Menu Contact^Company~Our Story Careers
  social Instagram Twitter`
      for (const line of text.split('\n')) {
        onChunk?.(line + '\n')
      }
      return text
    },
  ),
}))

// Mock DEFAULT_MODEL
vi.mock('../model-list.ts', () => ({
  DEFAULT_MODEL: 'test-model',
}))

// Mock fs writes
vi.mock('node:fs', () => ({
  writeFileSync: vi.fn(),
}))

// Mock spec save/load
vi.mock('../spec/index.ts', () => ({
  saveSiteSpec: vi.fn(),
  loadSiteSpec: vi.fn(() => null),
  SUPPORTED_EXPORT_TARGETS: ['html', 'react', 'nextjs'],
}))

describe('runComposition', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('runs the full pipeline: prompt → LLM → parse → compile', async () => {
    const result = await runComposition({
      prompt: 'a coffee shop in Brooklyn',
      workspace: '/tmp/test',
    })

    expect(result.raw).toContain('@design')
    expect(result.raw).toContain('@section')
    expect(result.parsed.sections.length).toBeGreaterThan(0)
    expect(result.compiled.source).toContain('SplitHero')
    expect(result.compiled.source).toContain('Stack(')
    expect(result.compiled.source).toContain('PageSwitch(')
    expect(result.compiled.brand).toBe('Bean & Co')
    expect(result.duration).toBeGreaterThan(0)
  })

  it('parses design intent from LLM output', async () => {
    const result = await runComposition({ prompt: 'coffee shop' })
    expect(result.parsed.design.radius).toBe('rounded')
    expect(result.parsed.design.shadow).toBe('soft')
  })

  it('includes serialized design intent in the saved site-spec', async () => {
    const { saveSiteSpec } = await import('../spec/index.ts')
    await runComposition({ prompt: 'coffee shop' })
    const spec = vi.mocked(saveSiteSpec).mock.calls[0]?.[1]
    expect(spec).toBeTruthy()
    expect(typeof spec?.design).toBe('string')
    expect(spec?.design).toContain('radius:rounded')
    expect(spec?.design).toContain('shadow:soft')
  })

  it('compiles all sections into source', async () => {
    const result = await runComposition({ prompt: 'coffee shop' })
    expect(result.compiled.source).toContain('Navbar')
    expect(result.compiled.source).toContain('SplitHero')
    expect(result.compiled.source).toContain('CardGrid')
    expect(result.compiled.source).toContain('GroupedList')
    expect(result.compiled.source).toContain('Footer')
  })

  it('generates secondary pages', async () => {
    const result = await runComposition({ prompt: 'coffee shop' })
    expect(result.compiled.pageSources.about).toBeTruthy()
    expect(result.compiled.pageSources.menu).toBeTruthy()
    expect(result.compiled.pageSources.contact).toBeTruthy()
  })

  it('broadcasts source via sessionCtx', async () => {
    const broadcasts: Record<string, unknown>[] = []
    const sessionCtx = {
      id: 'test-session',
      broadcast: (payload: unknown) =>
        broadcasts.push(payload as Record<string, unknown>),
      setPrompt: vi.fn(),
      setTasks: vi.fn(),
      updateTask: vi.fn(),
      signalHomepageReady: vi.fn(),
      signalOpenuiReady: vi.fn(),
      setElapsed: vi.fn(),
      setCost: vi.fn(),
    }
    await runComposition({ prompt: 'coffee shop', sessionCtx })
    const sourceBroadcast = broadcasts.find((b) => b.type === 'source')
    expect(sourceBroadcast).toBeTruthy()
    expect((sourceBroadcast?.text as string)?.length).toBeGreaterThan(0)
  })

  it('throws on empty sections', async () => {
    // Override mock to return empty output
    const { generateTextStream } = await import('../generate.ts')
    vi.mocked(generateTextStream).mockResolvedValueOnce('no sections here')

    await expect(runComposition({ prompt: 'test' })).rejects.toThrow(
      '0 sections',
    )
  })
})
