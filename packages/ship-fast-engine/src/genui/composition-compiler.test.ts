import { describe, expect, it } from 'vitest'
import { compileComposition } from './composition-compiler.ts'
import { parseComposition } from './composition-parser.ts'

describe('compileComposition', async () => {
  it('compiles a simple composition with one section', async () => {
    const input = `@brand Acme
@pages home

@section SplitHero
  heading Hello World
  primaryCta Start`
    const parsed = parseComposition(input)
    const result = await compileComposition(parsed)
    expect(result.brand).toBe('Acme')
    expect(result.source).toContain('SplitHero')
    expect(result.source).toContain('home = Stack(')
    expect(result.source).toContain('root = PageSwitch(')
  })

  it('compiles multiple sections into home page stack', async () => {
    const input = `@brand Acme
@pages home

@section Navbar
  brand Acme
@section SplitHero
  heading Hello
@section Footer
  brand Acme`
    const parsed = parseComposition(input)
    const result = await compileComposition(parsed)
    expect(result.source).toContain('Navbar')
    expect(result.source).toContain('SplitHero')
    expect(result.source).toContain('Footer')
    expect(result.source).toContain('home = Stack(')
  })

  it('generates skeleton with PageSwitch', async () => {
    const input = `@pages home about contact
@section SplitHero
  heading Hello`
    const parsed = parseComposition(input)
    const result = await compileComposition(parsed)
    expect(result.skeleton).toContain('PageSwitch')
    expect(result.skeleton).toContain('home')
    expect(result.skeleton).toContain('about')
    expect(result.skeleton).toContain('contact')
  })

  it('generates secondary pages with focused sections', async () => {
    const input = `@brand Acme
@pages home about contact

@section Navbar
  brand Acme
@section SplitHero
  heading Hello
@section MediaSplit
  heading About Us
@section ContactForm
  heading Contact
@section Footer
  brand Acme`
    const parsed = parseComposition(input)
    const result = await compileComposition(parsed)
    expect(result.pageSources.about).toBeTruthy()
    expect(result.pageSources.contact).toBeTruthy()
    expect(result.pageSources.about).toContain('MediaSplit')
    expect(result.pageSources.contact).toContain('ContactForm')
  })

  it('serializes design intent into result', async () => {
    const input = `@design radius:rounded shadow:soft
@section SplitHero
  heading Hello`
    const parsed = parseComposition(input)
    const result = await compileComposition(parsed)
    expect(result.design).toContain('radius:rounded')
    expect(result.design).toContain('shadow:soft')
  })

  it('uses default brand when not specified', async () => {
    const input = `@section SplitHero
  heading Hello`
    const parsed = parseComposition(input)
    const result = await compileComposition(parsed)
    expect(result.brand).toBe('Brand')
  })

  it('generates nav labels from pages', async () => {
    const input = `@pages home about pricing
@section SplitHero
  heading Hello`
    const parsed = parseComposition(input)
    const result = await compileComposition(parsed)
    expect(result.navLabels).toEqual({
      home: 'Home',
      about: 'About',
      pricing: 'Pricing',
    })
  })

  it('uses LLM-provided nav labels when present', async () => {
    const input = `@pages home about pricing
@nav home:Home about:Our Story pricing:Plans
@section SplitHero
  heading Hello`
    const parsed = parseComposition(input)
    const result = await compileComposition(parsed)
    expect(result.navLabels?.about).toBe('Our Story')
    expect(result.navLabels?.pricing).toBe('Plans')
  })

  it('produces SectionAnchor for each section', async () => {
    const input = `@section SplitHero
  heading Hello
@section CardGrid
  heading Features`
    const parsed = parseComposition(input)
    const result = await compileComposition(parsed)
    expect(result.source).toContain('SectionAnchor')
  })

  it('handles nested groups in compiled output', async () => {
    const input = `@section SplitHero
  heading Hello
  stats>120+~Projects^45~Awards`
    const parsed = parseComposition(input)
    const result = await compileComposition(parsed)
    expect(result.source).toContain('SplitHero')
  })

  it('parses | as item separator in leaf context (PricingTable tiers)', async () => {
    const input = `@brand Test
@pages home
@nav home:Home

@section PricingTable
  heading Plans
  tiers>Starter~$0~1 project, community support~Sign up~false|Pro~$29~10 projects, priority support~Start trial~true`
    const parsed = parseComposition(input)
    const result = await compileComposition(parsed)
    expect(result.source).toContain('"name":"Starter"')
    expect(result.source).toContain('"name":"Pro"')
    expect(result.source).toContain('"price":"$0"')
    expect(result.source).toContain('"price":"$29"')
  })

  it('flattens nested children when LLM uses > as field separator (CardGrid)', async () => {
    // LLM incorrectly uses > between fields within cards instead of ~
    const input = `@brand Test
@pages home
@nav home:Home

@section CardGrid
  heading Features
  cards>Fast Deploys>Deploy in seconds~imageAlt~dashboard.jpg^Zero Downtime>No interruptions~imageAlt~server.jpg`
    const parsed = parseComposition(input)
    const result = await compileComposition(parsed)
    expect(result.source).toContain('"title":"Fast Deploys"')
    expect(result.source).toContain('"title":"Zero Downtime"')
    expect(result.source).toContain('"description":"Deploy in seconds"')
    expect(result.source).toContain('"description":"No interruptions"')
  })

  it('maps span enum correctly when imageSrc is omitted (BentoGrid)', async () => {
    const input = `@brand Test
@pages home
@nav home:Home

@section BentoGrid
  heading Features
  cells>Instant Previews~Every PR gets a live URL~Preview deployment~wide|Zero-Downtime~Blue-green deploys~Server rack~tall`
    const parsed = parseComposition(input)
    const result = await compileComposition(parsed)
    expect(result.source).toContain('"span":"wide"')
    expect(result.source).toContain('"span":"tall"')
    expect(result.source).not.toContain('"imageSrc":"wide"')
    expect(result.source).not.toContain('"imageSrc":"tall"')
  })

  it('parses | as column separator in Footer', async () => {
    const input = `@brand Test
@pages home
@nav home:Home

@section Footer
  brand Test
  columns>Product~Features, Pricing, Docs|Company~About, Careers, Blog
  social>Twitter, GitHub, LinkedIn`
    const parsed = parseComposition(input)
    const result = await compileComposition(parsed)
    expect(result.source).toContain('"title":"Product"')
    expect(result.source).toContain('"title":"Company"')
    expect(result.source).toContain('"links":["Features","Pricing","Docs"]')
    expect(result.source).toContain('"links":["About","Careers","Blog"]')
  })
})
