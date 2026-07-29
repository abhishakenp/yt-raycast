/**
 * End-to-end behavioral test: simulates the full generative composition pipeline.
 *
 * Tests the complete flow: prompt → (mocked LLM) → parse → compile → verify source
 * for multiple verticals (coffee shop, SaaS, portfolio, restaurant).
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { runComposition } from './composition-runner.ts'
import { parseComposition } from './composition-parser.ts'
import { compileComposition } from './composition-compiler.ts'

// Mock LLM
vi.mock('../generate.ts', () => ({
  generateText: vi.fn(async () => ''),
  generateTextStream: vi.fn(
    async (
      _m: string,
      _s: string,
      _u: string,
      _sig: unknown,
      _onChunk?: (line: string) => void,
    ) => {
      return ''
    },
  ),
}))
vi.mock('../model-list.ts', () => ({ DEFAULT_MODEL: 'test' }))
vi.mock('node:fs', () => ({ writeFileSync: vi.fn() }))
vi.mock('../spec/index.ts', () => ({
  saveSiteSpec: vi.fn(),
  loadSiteSpec: vi.fn(() => null),
  SUPPORTED_EXPORT_TARGETS: ['html', 'react', 'nextjs'],
}))

import { generateTextStream } from '../generate.ts'

function setLLMResponse(text: string) {
  vi.mocked(generateTextStream).mockReset()
  vi.mocked(generateTextStream).mockImplementation(
    async (
      _m: string,
      _s: string,
      _u: string,
      _sig: unknown,
      onChunk?: (line: string) => void,
    ) => {
      if (onChunk) {
        for (const line of text.split('\n')) {
          onChunk(line + '\n')
        }
      }
      return text
    },
  )
}

describe('E2E: Coffee Shop', () => {
  beforeEach(() => {
    setLLMResponse(`<reasoning>A coffee shop needs a warm, inviting design. Editorial typography, rounded corners, soft shadows. Pages: home, menu, about, contact.</reasoning>
@design radius:rounded shadow:soft gradient:subtle density:airy typography:editorial
@brand Bean & Co
@title Bean & Co — Artisan Coffee Roasters
@pages home menu about contact
@nav home:Home menu:Menu about:Our Story contact:Visit Us

@section Navbar
  brand Bean & Co
  links Home Menu About Contact
  cta Order Now

@section SplitHero
  badge Fresh daily
  heading We roast [hl]perfect[/hl] coffee
  subheading Small-batch beans from around the world, roasted in Brooklyn
  primaryCta Order Now
  secondaryCta Our Story
  stats>500+~Cups daily^12~Origins^8yr~Roasting

@section GroupedList
  heading Our Menu
  groups>Espresso>Americano~Double shot~$4^Cappuccino~Espresso with foam~$5^Latte~Creamy and smooth~$6^Pour Over>V60~Floral notes~$5^French Press~Full body~$4^Cold Brew>24hr Steeped~Smooth~$5

@section MediaSplit
  heading Our Story
  text Started in 2016 with a single roaster and a dream. Today we source beans from 12 countries.
  imageAlt Coffee roasting
  reversed true

@section TestimonialRow
  heading Loved by locals
  testimonials>Best coffee in Brooklyn~Mara Whitfield~Regular for 3 years^I come every morning~John Smith~Neighborhood local^The pour over is incredible~Alice Lee~Food blogger

@section MapBlock
  heading Find Us
  address 123 Coffee Lane, Brooklyn NY 11201
  hours Mon-Fri 7am-7pm, Sat-Sun 8am-6pm

@section Footer
  brand Bean & Co
  columns>Pages~Home Menu About Contact^Visit~123 Coffee Lane Brooklyn NY^Connect~Instagram Twitter Facebook`)
  })

  it('runs full pipeline and produces valid source', async () => {
    const result = await runComposition({ prompt: 'a coffee shop in Brooklyn' })

    expect(result.parsed.sections.length).toBeGreaterThan(5)
    expect(result.parsed.design.radius).toBe('rounded')
    expect(result.parsed.design.typography).toBe('editorial')
    expect(result.compiled.brand).toBe('Bean & Co')
    expect(result.compiled.source).toContain('SplitHero')
    expect(result.compiled.source).toContain('GroupedList')
    expect(result.compiled.source).toContain('MediaSplit')
    expect(result.compiled.source).toContain('MapBlock')
    expect(result.compiled.source).toContain('Footer')
    expect(result.compiled.source).toContain('Stack(')
    expect(result.compiled.source).toContain('PageSwitch(')
  })

  it('generates all 4 pages', async () => {
    const result = await runComposition({ prompt: 'coffee shop' })
    expect(result.compiled.pages).toContain('home')
    expect(result.compiled.pages).toContain('menu')
    expect(result.compiled.pages).toContain('about')
    expect(result.compiled.pages).toContain('contact')
  })

  it('menu page gets GroupedList as focused section', async () => {
    const result = await runComposition({ prompt: 'coffee shop' })
    expect(result.compiled.pageSources.menu).toContain('GroupedList')
  })

  it('about page gets MediaSplit as focused section', async () => {
    const result = await runComposition({ prompt: 'coffee shop' })
    expect(result.compiled.pageSources.about).toContain('MediaSplit')
  })

  it('contact page gets MapBlock as focused section', async () => {
    const result = await runComposition({ prompt: 'coffee shop' })
    expect(result.compiled.pageSources.contact).toContain('MapBlock')
  })
})

describe('E2E: SaaS Platform', () => {
  beforeEach(() => {
    setLLMResponse(`<reasoning>A B2B SaaS analytics platform. Sharp, technical, mono typography. Pages: home, pricing, about, contact.</reasoning>
@design radius:sharp shadow:none gradient:subtle density:compact typography:technical
@brand DataFlow
@title DataFlow — Real-time Analytics
@pages home pricing about contact

@section Navbar
  brand DataFlow
  links Home Pricing About Contact
  cta Start Free Trial

@section CenteredHero
  heading Build [hl]faster[/hl] with real-time analytics
  subheading Ship insights in milliseconds, not hours. The platform for data-driven teams.
  primaryCta Start Free Trial
  secondaryCta View Demo
  stats>50ms~Latency^2B+~Events/day^99.9%~Uptime^15K+~Teams

@section CardGrid
  eyebrow Features
  heading Everything you need
  variant collapsed-border
  cards>Real-time~Stream events as they happen^Dashboards~Visualize any metric^Alerts~Get notified instantly^Integrations~Connect your stack

@section PricingTable
  heading Simple pricing
  tiers>Starter~$0~1 project~Basic support~Get started~false^Pro~$29~Unlimited projects~Priority support~Analytics~Start trial~true^Enterprise~Custom~Everything in Pro~SSO~SLA~Contact us~false

@section StatsStrip
  heading By the numbers
  stats>50ms~Latency^2B+~Events/day^99.9%~Uptime^15K+~Active teams

@section FaqAccordion
  heading FAQ
  items>How does pricing work?~Per team, not per user.^Can I export data?~Yes, CSV and API.^Is there a free tier?~Yes, forever.

@section CtaBand
  heading Ready to start?
  subheading Start your free trial today
  cta Start Free Trial

@section Footer
  brand DataFlow
  columns>Product~Home Pricing About^Company~Contact Careers Legal~Privacy~Terms Security`)
  })

  it('produces valid SaaS site', async () => {
    const result = await runComposition({ prompt: 'a SaaS analytics platform' })

    expect(result.parsed.design.radius).toBe('sharp')
    expect(result.parsed.design.typography).toBe('technical')
    expect(result.compiled.source).toContain('CenteredHero')
    expect(result.compiled.source).toContain('PricingTable')
    expect(result.compiled.source).toContain('FaqAccordion')
    expect(result.compiled.source).toContain('CtaBand')
  })

  it('pricing page gets PricingTable', async () => {
    const result = await runComposition({ prompt: 'SaaS' })
    expect(result.compiled.pageSources.pricing).toContain('PricingTable')
  })
})

describe('E2E: Portfolio Site', () => {
  beforeEach(() => {
    setLLMResponse(`<reasoning>A creative portfolio. Bold display typography, sharp corners, no shadows. Pages: home, work, about, contact.</reasoning>
@design radius:sharp shadow:none gradient:none density:airy typography:display
@brand Studio Noir
@title Studio Noir — Design Studio
@pages home work about contact

@section Navbar
  brand Studio Noir
  links Home Work About Contact

@section PosterHero
  heading Visual [hl]stories[/hl] that captivate
  subheading We craft brands, websites, and experiences.
  cta View Work

@section ProjectGallery
  heading Selected Work
  projects>Brand Identity~Branding~Brand identity for a tech startup^E-commerce~Web~Full-stack online store^Mobile App~UI/UX~Fitness tracking app^Editorial~Print~Magazine design

@section PersonGrid
  heading The Team
  people>Mara Whitfield~Creative Director~Portrait of Mara Whitfield^John Smith~Lead Designer~Portrait of John Smith^Alice Lee~Developer~Portrait of Alice Lee

@section ContactForm
  heading Let's work together
  subheading Tell us about your project

@section Footer
  brand Studio Noir
  columns>Studio~Home Work About^Contact~hello@studionoir.com^Social~Instagram Twitter Dribbble`)
  })

  it('produces valid portfolio site', async () => {
    const result = await runComposition({ prompt: 'a design portfolio' })

    expect(result.parsed.design.radius).toBe('sharp')
    expect(result.parsed.design.typography).toBe('display')
    expect(result.compiled.source).toContain('PosterHero')
    expect(result.compiled.source).toContain('ProjectGallery')
    expect(result.compiled.source).toContain('PersonGrid')
    expect(result.compiled.source).toContain('ContactForm')
  })

  it('work page gets ProjectGallery', async () => {
    const result = await runComposition({ prompt: 'portfolio' })
    expect(result.compiled.pageSources.work).toContain('ProjectGallery')
  })
})

describe('E2E: Restaurant', () => {
  beforeEach(() => {
    setLLMResponse(`<reasoning>A fine dining restaurant. Warm, editorial, rounded. Pages: home, menu, contact.</reasoning>
@design radius:rounded shadow:soft gradient:subtle density:balanced typography:editorial
@brand Maison
@title Maison — Fine Dining
@pages home menu contact

@section Navbar
  brand Maison
  links Home Menu Contact
  cta Reserve

@section SplitHero
  badge Michelin Starred
  heading A [hl]culinary[/hl] journey
  subheading Seasonal tasting menus inspired by French tradition
  primaryCta Reserve a Table
  secondaryCta View Menu

@section GroupedList
  heading Tasting Menu
  groups>First Course>Oyster~Champagne mignonette~$18^Foie Gras~Toast brioche~$24^Main Course>Turbot~Brown butter capers~$42^Duck Breast~Cherry gastrique~$38^Dessert~Souffle~Grand Marnier~$16

@section TestimonialRow
  heading Acclaim
  testimonials>An unforgettable evening~Food Critic~NYT^The best meal of my life~Mara Whitfield~Diner^Maison sets the standard~John Smith~Michelin Guide

@section BookingForm
  heading Reserve a Table
  subheading We accept reservations up to 30 days in advance

@section Footer
  brand Maison
  columns>Visit~123 Main St New York^Hours~Tue-Sun 5pm-11pm^Contact~info@maison.com`)
  })

  it('produces valid restaurant site', async () => {
    const result = await runComposition({ prompt: 'a fine dining restaurant' })

    expect(result.parsed.design.radius).toBe('rounded')
    expect(result.parsed.design.typography).toBe('editorial')
    expect(result.compiled.source).toContain('GroupedList')
    expect(result.compiled.source).toContain('BookingForm')
  })

  it('menu page gets GroupedList', async () => {
    const result = await runComposition({ prompt: 'restaurant' })
    expect(result.compiled.pageSources.menu).toContain('GroupedList')
  })

  it('contact page gets BookingForm', async () => {
    const result = await runComposition({ prompt: 'restaurant' })
    expect(result.compiled.pageSources.contact).toContain('BookingForm')
  })
})

describe('E2E: Design intent variations', () => {
  it('brutalist design produces sharp + brutalist classes', () => {
    const input = `@design radius:sharp shadow:brutalist typography:display
@section SplitHero
  heading Hello`
    const parsed = parseComposition(input)
    expect(parsed.design.radius).toBe('sharp')
    expect(parsed.design.shadow).toBe('brutalist')
    expect(parsed.design.typography).toBe('display')
  })

  it('playful design produces rounded + vibrant classes', () => {
    const input = `@design radius:pill shadow:soft gradient:vibrant
@section CenteredHero
  heading Hello`
    const parsed = parseComposition(input)
    expect(parsed.design.radius).toBe('pill')
    expect(parsed.design.gradient).toBe('vibrant')
  })

  it('per-section design override works', () => {
    const input = `@design radius:rounded
@section CardGrid
  @design radius:sharp
  heading Features
@section Footer
  brand Acme`
    const parsed = parseComposition(input)
    expect(parsed.design.radius).toBe('rounded')
    expect(parsed.sections[0].design?.radius).toBe('sharp')
    expect(parsed.sections[1].design).toBeUndefined()
  })
})

describe('E2E: All 40 motifs compile', () => {
  const ALL_MOTIFS = [
    'SplitHero',
    'CenteredHero',
    'PosterHero',
    'ComingSoonHero',
    'CardGrid',
    'BentoGrid',
    'ImageGallery',
    'LogoStrip',
    'TestimonialRow',
    'PersonGrid',
    'PricingTable',
    'StatsStrip',
    'FeatureList',
    'GroupedList',
    'NumberedList',
    'SimpleList',
    'FaqAccordion',
    'Timeline',
    'CtaBand',
    'NewsletterCta',
    'ContactForm',
    'BookingForm',
    'Navbar',
    'Footer',
    'MediaSplit',
    'MapBlock',
    'ArticlePreview',
    'CategoryNav',
    'ComparisonTable',
    'StepProcess',
    'ValueProps',
    'QuoteBand',
    'LogosMarquee',
    'ContentTabs',
    'SearchBar',
    'EventSchedule',
    'ProductGrid',
    'TeamShowcase',
    'ProjectGallery',
    'DonationBand',
  ]

  for (const motif of ALL_MOTIFS) {
    it(`compiles ${motif}`, async () => {
      const input = `@section ${motif}`
      const parsed = parseComposition(input)
      const compiled = await compileComposition(parsed)
      expect(compiled.source).toContain(motif)
    })
  }
})

describe('E2E: @page directive — sub-pages get unique content', () => {
  it('compiles @page-tagged sections into separate pages with unique content', async () => {
    const input = `@design radius:rounded shadow:soft
@brand TestBrand
@pages home about contact
@nav home:Home about:About contact:Contact

@section Navbar
  brand TestBrand
  links Home About Contact

@section SplitHero
  heading Home hero heading

@section CardGrid
  heading Home features

@section Footer
  brand TestBrand

@page about
@section PersonGrid
  heading About our team
  people>Alice~CEO^Bob~CTO

@page contact
@section ContactForm
  heading Get in touch
`
    const parsed = parseComposition(input)
    const compiled = await compileComposition(parsed)

    // Home page should have hero and cardgrid
    expect(compiled.source).toContain('home_splithero')
    expect(compiled.source).toContain('home_cardgrid')

    // About page should have PersonGrid with "About our team" heading
    expect(compiled.source).toContain('about_persongrid')
    expect(compiled.source).toContain('About our team')

    // Contact page should have ContactForm with "Get in touch" heading
    expect(compiled.source).toContain('contact_contactform')
    expect(compiled.source).toContain('Get in touch')

    // About page should NOT have home hero content
    const aboutPageStart = compiled.source.indexOf('about_navbar')
    const aboutPageEnd = compiled.source.indexOf('about = Stack')
    const aboutPageContent = compiled.source.slice(aboutPageStart, aboutPageEnd)
    expect(aboutPageContent).not.toContain('Home hero heading')

    // Contact page should NOT have home hero content
    const contactPageStart = compiled.source.indexOf('contact_navbar')
    const contactPageEnd = compiled.source.indexOf('contact = Stack')
    const contactPageContent = compiled.source.slice(
      contactPageStart,
      contactPageEnd,
    )
    expect(contactPageContent).not.toContain('Home hero heading')
  })

  it('falls back to findFocusedSection when no @page directives are used', async () => {
    const input = `@design radius:rounded shadow:soft
@brand TestBrand
@pages home about
@nav home:Home about:About

@section Navbar
  brand TestBrand
  links Home About

@section SplitHero
  heading Home hero

@section PersonGrid
  heading Our team

@section Footer
  brand TestBrand
`
    const parsed = parseComposition(input)
    // No @page directives → all sections have page="home"
    expect(parsed.sections.every((s) => s.page === 'home')).toBe(true)

    const compiled = await compileComposition(parsed)
    // About page should still exist via findFocusedSection fallback
    expect(compiled.source).toContain('about = Stack')
    // About page should reuse PersonGrid from home (legacy behavior)
    expect(compiled.source).toContain('about_persongrid')
  })
})

describe('E2E: [hl] tags stripped in PosterHero and CenteredHero', () => {
  it('PosterHero strips [hl] tags from heading', async () => {
    const input = `@section PosterHero
  heading Sip [hl]Warmth[/hl] in Seattle
`
    const parsed = parseComposition(input)
    const compiled = await compileComposition(parsed)
    // The compiled source should NOT contain [hl] tags in the heading prop
    expect(compiled.source).not.toContain('[hl]')
    expect(compiled.source).not.toContain('[/hl]')
    // The inner text should be preserved
    expect(compiled.source).toContain('Sip Warmth in Seattle')
  })

  it('CenteredHero strips [hl] tags from heading', async () => {
    const input = `@section CenteredHero
  heading Build [hl]faster[/hl] with us
`
    const parsed = parseComposition(input)
    const compiled = await compileComposition(parsed)
    expect(compiled.source).not.toContain('[hl]')
    expect(compiled.source).not.toContain('[/hl]')
    expect(compiled.source).toContain('Build faster with us')
  })
})
