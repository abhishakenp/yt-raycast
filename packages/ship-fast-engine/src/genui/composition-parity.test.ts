/**
 * composition-parity.test.ts — verifies the composition engine produces
 * everything the old v3 engine produced: lakebed, convex backend, data
 * bindings, svelte scripts, theme, and manifest.
 */
import { describe, expect, it } from 'vitest'

import { parseComposition } from './composition-parser.ts'
import { compileComposition } from './composition-compiler.ts'
import { inferLakebedFromComposition } from './inference.ts'
import { generateConvexBackend } from './convex-codegen.ts'
import { validateSvelteSource, compileSvelteBlock } from './svelte-compiler.ts'
import { getInteraction } from './interactions.ts'
import { pickThemeForDesignIntent } from './theme-affinity.ts'
import {
  DEFAULT_DESIGN,
  type DesignIntent,
} from '../../../ship-fast-blocks/src/primitives/design-system.ts'
import { THEME_NAMES } from '../../../ship-fast-blocks/src/theme-apply.ts'

describe('composition parity — full feature set', async () => {
  it('infers lakebed from interactive motifs (ContactForm → messages table)', async () => {
    const lakebed = inferLakebedFromComposition([
      { motif: 'SplitHero' },
      { motif: 'ContactForm' },
      { motif: 'Footer' },
    ])

    expect(lakebed.tables.some((t) => t.name === 'messages')).toBe(true)
    expect(lakebed.queries.some((q) => q.name === 'contactExperience')).toBe(
      true,
    )
    expect(lakebed.mutations.some((m) => m.name === 'sendMessage')).toBe(true)
  })

  it('infers lakebed from ProductGrid (collection + cart)', async () => {
    const lakebed = inferLakebedFromComposition([{ motif: 'ProductGrid' }])

    expect(lakebed.tables.some((t) => t.name === 'products')).toBe(true)
    expect(lakebed.tables.some((t) => t.name === 'orderItems')).toBe(true)
    expect(lakebed.queries.some((q) => q.name === 'productCatalog')).toBe(true)
    expect(lakebed.queries.some((q) => q.name === 'cartSummary')).toBe(true)
    expect(lakebed.mutations.some((m) => m.name === 'addToCart')).toBe(true)
    expect(lakebed.mutations.some((m) => m.name === 'removeFromCart')).toBe(
      true,
    )
  })

  it('generates Convex backend files from lakebed', async () => {
    const lakebed = inferLakebedFromComposition([{ motif: 'ContactForm' }])
    const convex = generateConvexBackend(lakebed, {})

    expect(Object.keys(convex)).toContain('convex/schema.ts')
    expect(Object.keys(convex)).toContain('convex/messages.ts')
    expect(convex['convex/schema.ts']).toContain('messages')
    expect(convex['convex/messages.ts']).toContain('sendMessage')
  })

  it('generates data bindings for interactive motifs', async () => {
    const dsl = `
@design radius:rounded shadow:soft gradient:none density:balanced typography:editorial
@brand TestBrand
@title TestBrand — Home
@pages home

@section SplitHero
  heading Welcome

@section ContactForm
  heading Contact Us

@section Footer
  brand TestBrand
`
    const parsed = parseComposition(dsl)
    const compiled = await compileComposition(parsed, {})

    expect(Object.keys(compiled.dataBindings)).toContain('home_contactform')
    const binding = compiled.dataBindings['home_contactform']
    expect(binding.component).toBe('ContactForm')
    expect(binding.queries).toHaveProperty('submissionSummary')
    expect(binding.mutations).toHaveProperty('submit')
  })

  it('compiles @svelte blocks into SvelteIsland calls', async () => {
    const dsl = `
@design radius:sharp shadow:none gradient:none density:compact typography:technical
@brand GameStudio
@title GameStudio — Play
@pages home

@section SplitHero
  heading Play Games

@section CustomGame
  heading Tic Tac Toe
  @svelte
    <script>let count = 0</script>
    <button on:click={() => count++}>{count}</button>

@section Footer
  brand GameStudio
`
    const parsed = parseComposition(dsl)

    // Verify svelte was parsed
    const gameSection = parsed.sections.find((s) => s.motif === 'CustomGame')
    expect(gameSection).toBeDefined()
    expect(gameSection?.svelte?.source).toContain('<script>')
    expect(gameSection?.svelte?.source).toContain('on:click')

    // Verify svelte compiles
    const svelteResult = validateSvelteSource(gameSection!.svelte!.source)
    expect(svelteResult.valid).toBe(true)

    // Verify the compiled output includes SvelteIsland
    const compiled = await compileComposition(parsed, {})
    expect(compiled.source).toContain('SvelteIsland')
    expect(compiled.svelteScripts).toBeDefined()
    expect(Object.keys(compiled.svelteScripts).length).toBeGreaterThan(0)
  })

  it('picks a theme based on @design intent', async () => {
    // Brutalist design → should pick from brutalist pool
    const brutalistRng = () => 0.1
    const brutalistTheme = pickThemeForDesignIntent(
      {
        ...DEFAULT_DESIGN,
        shadow: 'brutalist',
        radius: 'sharp',
        typography: 'technical',
      },
      brutalistRng,
    )
    expect(THEME_NAMES).toContain(brutalistTheme)

    // Editorial design → should pick from elegant pool
    const editorialRng = () => 0.1
    const editorialTheme = pickThemeForDesignIntent(
      { ...DEFAULT_DESIGN, typography: 'editorial', radius: 'rounded' },
      editorialRng,
    )
    expect(THEME_NAMES).toContain(editorialTheme)

    // Technical design → should pick from tech pool
    const techRng = () => 0.1
    const techTheme = pickThemeForDesignIntent(
      { ...DEFAULT_DESIGN, typography: 'technical' },
      techRng,
    )
    expect(THEME_NAMES).toContain(techTheme)
  })

  it('theme pick is deterministic for same seed', async () => {
    const design: DesignIntent = {
      ...DEFAULT_DESIGN,
      typography: 'editorial',
    }
    const rng1 = () => 0.5
    const rng2 = () => 0.5
    expect(pickThemeForDesignIntent(design, rng1)).toBe(
      pickThemeForDesignIntent(design, rng2),
    )
  })

  it('produces fullstackManifest with table names', async () => {
    const dsl = `
@design radius:rounded shadow:soft gradient:none density:balanced typography:editorial
@brand TestBrand
@title TestBrand — Home
@pages home

@section SplitHero
  heading Welcome

@section ContactForm
  heading Contact Us

@section Footer
  brand TestBrand
`
    const parsed = parseComposition(dsl)
    const compiled = await compileComposition(parsed, {})

    expect(compiled.fullstackManifest.tables).toContain('messages')
    expect(compiled.fullstackManifest.schemaVersion).toBe(1)
  })

  it('presentational-only motifs produce empty lakebed', async () => {
    const lakebed = inferLakebedFromComposition([
      { motif: 'SplitHero' },
      { motif: 'CardGrid' },
      { motif: 'Footer' },
    ])

    expect(lakebed.tables.length).toBe(0)
    expect(lakebed.queries.length).toBe(0)
    expect(lakebed.mutations.length).toBe(0)
  })

  it('getInteraction returns null for unknown motifs', async () => {
    expect(getInteraction('NonExistentMotif')).toBeNull()
  })

  it('getInteraction returns profile for ContactForm', async () => {
    const profile = getInteraction('ContactForm')
    expect(profile).not.toBeNull()
    expect(profile!.profiles).toContain('submission')
  })

  it('compileSvelteBlock produces SSR HTML and JS', async () => {
    const source =
      '<script>let count = 0</script><button on:click={() => count++}>{count}</button>'
    const compiled = await compileSvelteBlock(source, 'Counter')

    expect(compiled.ssrHtml).toBeDefined()
    expect(compiled.domJs).toBeDefined()
    expect(compiled.css).toBeDefined()
    expect(compiled.ssrHtml.length).toBeGreaterThan(0)
  })
})
