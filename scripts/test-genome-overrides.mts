/**
 * test-genome-overrides.mts
 *
 * Runs the full composition pipeline with real LLM calls to test:
 * 1. Detailed user spec → user preferences should override genome
 * 2. Vague prompt × 2 → should produce unique outputs (variation preserved)
 *
 * Measures: time, token count, genome vs resolved design, section count, page count.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { runComposition } from '../packages/ship-fast-engine/src/genui/composition-runner.ts'
import { generateGenome } from '../packages/ship-fast-engine/src/genui/genome.ts'
import { buildCompositionPrompt } from '../packages/ship-fast-engine/src/genui/composition-prompt.ts'
import { parseComposition } from '../packages/ship-fast-engine/src/genui/composition-parser.ts'

// ─── Test matrix ─────────────────────────────────────────────────────────

interface TestRun {
  id: string
  prompt: string
  sessionId: string
  description: string
}

const TEST_RUNS: TestRun[] = [
  {
    id: 'detailed-spec',
    prompt:
      'dog blog called "Paws & Tales" with square buttons, retro vintage style, split hero section, elegant serif typography, minimal clean design with no gradients and no shadows, compact layout. Include a blog post grid, newsletter signup, and about page.',
    sessionId: 'test-detailed-spec-001',
    description:
      'Detailed design spec — should override genome on all specified axes',
  },
  {
    id: 'vague-dog-1',
    prompt: 'dog blog site',
    sessionId: 'test-vague-dog-001',
    description: 'Vague prompt run 1 — genome should control design',
  },
  {
    id: 'vague-dog-2',
    prompt: 'dog blog site',
    sessionId: 'test-vague-dog-002',
    description: 'Vague prompt run 2 — different genome, different output',
  },
  {
    id: 'vague-cat-1',
    prompt: 'cat blog site',
    sessionId: 'test-vague-cat-001',
    description: 'Vague prompt run 1 — genome should control design',
  },
  {
    id: 'vague-cat-2',
    prompt: 'cat blog site',
    sessionId: 'test-vague-cat-002',
    description: 'Vague prompt run 2 — different genome, different output',
  },
]

// ─── Runner ──────────────────────────────────────────────────────────────

interface RunResult {
  testId: string
  prompt: string
  sessionId: string
  description: string
  genome: {
    hero: string
    design: {
      radius: string
      shadow: string
      gradient: string
      density: string
      typography: string
    }
    sectionCount: number
    pageCount: number
    chromes: string[]
  }
  resolved: {
    design: {
      radius: string
      shadow: string
      gradient: string
      density: string
      typography: string
    }
    hero: string
    sectionCount: number
    pageCount: number
    pages: string[]
  }
  duration: number
  rawLength: number
  tokenEstimate: number
  sectionCount: number
  pageCount: number
  motifs: string[]
  hasHlTags: boolean
  brand: string
  title: string
  error?: string
}

async function runTest(test: TestRun): Promise<RunResult> {
  const genome = generateGenome(test.sessionId)
  const { system, user } = buildCompositionPrompt(test.prompt, { genome })

  // Estimate tokens (rough: 4 chars = 1 token)
  const promptTokens = Math.ceil((system.length + user.length) / 4)

  // Create workspace
  const ws = join(process.cwd(), '.forge', 'genome-test', test.id)
  mkdirSync(ws, { recursive: true })

  // Write prompt for debugging
  writeFileSync(join(ws, 'prompt-system.txt'), system)
  writeFileSync(join(ws, 'prompt-user.txt'), user)

  const t0 = Date.now()

  try {
    const result = await runComposition({
      prompt: test.prompt,
      workspace: ws,
      sessionId: test.sessionId,
      model: 'openai/gpt-oss-120b',
    })

    const duration = Date.now() - t0
    const parsed = result.parsed
    const rawTokens = Math.ceil(result.raw.length / 4)

    // Extract resolved design from parsed output
    const resolvedDesign = {
      radius: parsed.design.radius ?? genome.design.radius,
      shadow: parsed.design.shadow ?? genome.design.shadow,
      gradient: parsed.design.gradient ?? genome.design.gradient,
      density: parsed.design.density ?? genome.design.density,
      typography: parsed.design.typography ?? genome.design.typography,
    }

    // Extract hero from sections
    const heroSection = parsed.sections.find(
      (s) =>
        s.motif === 'SplitHero' ||
        s.motif === 'CenteredHero' ||
        s.motif === 'PosterHero' ||
        s.motif === 'ComingSoonHero',
    )
    const resolvedHero = heroSection?.motif ?? genome.hero

    // Count content sections (excluding Navbar/Footer)
    const contentSections = parsed.sections.filter(
      (s) => s.motif !== 'Navbar' && s.motif !== 'Footer',
    )

    // Get unique motifs
    const motifs = [...new Set(parsed.sections.map((s) => s.motif))]

    // Check for [hl] tags in raw
    const hasHlTags = result.raw.includes('[hl]')

    // Write raw output
    writeFileSync(join(ws, 'raw.txt'), result.raw)
    writeFileSync(join(ws, 'home.openui'), result.compiled.source)

    return {
      testId: test.id,
      prompt: test.prompt,
      sessionId: test.sessionId,
      description: test.description,
      genome: {
        hero: genome.hero,
        design: genome.design,
        sectionCount: genome.sectionCount,
        pageCount: genome.pageCount,
        chromes: genome.chromes,
      },
      resolved: {
        design: resolvedDesign,
        hero: resolvedHero,
        sectionCount: contentSections.length,
        pageCount: parsed.pages.length,
        pages: parsed.pages,
      },
      duration,
      rawLength: result.raw.length,
      tokenEstimate: promptTokens + rawTokens,
      sectionCount: contentSections.length,
      pageCount: parsed.pages.length,
      motifs,
      hasHlTags,
      brand: parsed.brand ?? 'Unknown',
      title: parsed.title ?? 'Unknown',
    }
  } catch (err) {
    const duration = Date.now() - t0
    return {
      testId: test.id,
      prompt: test.prompt,
      sessionId: test.sessionId,
      description: test.description,
      genome: {
        hero: genome.hero,
        design: genome.design,
        sectionCount: genome.sectionCount,
        pageCount: genome.pageCount,
        chromes: genome.chromes,
      },
      resolved: {
        design: genome.design,
        hero: genome.hero,
        sectionCount: 0,
        pageCount: 0,
        pages: [],
      },
      duration,
      rawLength: 0,
      tokenEstimate: promptTokens,
      sectionCount: 0,
      pageCount: 0,
      motifs: [],
      hasHlTags: false,
      brand: 'Error',
      title: 'Error',
      error: String(err),
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Genome Override Test Suite ===\n')
  console.log(`Running ${TEST_RUNS.length} tests sequentially...\n`)

  const results: RunResult[] = []

  for (const test of TEST_RUNS) {
    console.log(`[${test.id}] Running...`)
    const result = await runTest(test)
    results.push(result)

    if (result.error) {
      console.log(
        `  ✗ FAILED in ${(result.duration / 1000).toFixed(1)}s: ${result.error}`,
      )
    } else {
      console.log(`  ✓ Done in ${(result.duration / 1000).toFixed(1)}s`)
      console.log(
        `    Genome:  hero=${result.genome.hero} radius=${result.genome.design.radius} typo=${result.genome.design.typography}`,
      )
      console.log(
        `    Resolved: hero=${result.resolved.hero} radius=${result.resolved.design.radius} typo=${result.resolved.design.typography}`,
      )
      console.log(
        `    Sections: ${result.sectionCount} | Pages: ${result.pageCount} (${result.resolved.pages.join(', ')})`,
      )
      console.log(`    Brand: ${result.brand} | [hl] tags: ${result.hasHlTags}`)
    }
    console.log()
  }

  // ─── Summary table ───────────────────────────────────────────────────
  console.log('\n=== RESULTS TABLE ===\n')
  console.log(
    '| Test ID | Prompt (truncated) | Time (s) | Est. Tokens | Genome Hero | Resolved Hero | Genome Radius | Resolved Radius | Genome Typo | Resolved Typo | Sections | Pages | [hl] Tags | Brand |',
  )
  console.log(
    '|---------|-------------------|----------|-------------|-------------|---------------|---------------|-----------------|-------------|---------------|----------|-------|-----------|-------|',
  )

  for (const r of results) {
    const promptShort = r.prompt.slice(0, 40).replace(/\|/g, '\\|')
    const time = (r.duration / 1000).toFixed(1)
    console.log(
      `| ${r.testId} | ${promptShort} | ${time} | ~${r.tokenEstimate} | ${r.genome.hero} | ${r.resolved.hero} | ${r.genome.design.radius} | ${r.resolved.design.radius} | ${r.genome.design.typography} | ${r.resolved.design.typography} | ${r.sectionCount} | ${r.pageCount} | ${r.hasHlTags ? 'YES' : 'no'} | ${r.brand} |`,
    )
  }

  // ─── Analysis ────────────────────────────────────────────────────────
  console.log('\n=== ANALYSIS ===\n')

  // Test 1: Detailed spec — check if user preferences were respected
  const detailed = results[0]
  if (!detailed.error) {
    console.log('1. DETAILED SPEC TEST:')
    console.log(
      `   User asked for: square buttons (radius:sharp), retro (typography:editorial), split hero, minimal (gradient:none, shadow:none)`,
    )
    console.log(
      `   Genome assigned: radius=${detailed.genome.design.radius}, typography=${detailed.genome.design.typography}, hero=${detailed.genome.hero}, gradient=${detailed.genome.design.gradient}, shadow=${detailed.genome.design.shadow}`,
    )
    console.log(
      `   LLM resolved to: radius=${detailed.resolved.design.radius}, typography=${detailed.resolved.design.typography}, hero=${detailed.resolved.hero}, gradient=${detailed.resolved.design.gradient}, shadow=${detailed.resolved.design.shadow}`,
    )

    const overrides: string[] = []
    if (detailed.resolved.design.radius === 'sharp')
      overrides.push('radius:sharp ✓')
    else
      overrides.push(
        `radius:${detailed.resolved.design.radius} ✗ (expected sharp)`,
      )
    if (detailed.resolved.design.typography === 'editorial')
      overrides.push('typography:editorial ✓')
    else
      overrides.push(
        `typography:${detailed.resolved.design.typography} ✗ (expected editorial)`,
      )
    if (detailed.resolved.hero === 'SplitHero')
      overrides.push('hero:SplitHero ✓')
    else overrides.push(`hero:${detailed.resolved.hero} ✗ (expected SplitHero)`)
    if (detailed.resolved.design.gradient === 'none')
      overrides.push('gradient:none ✓')
    else
      overrides.push(
        `gradient:${detailed.resolved.design.gradient} ✗ (expected none)`,
      )
    if (detailed.resolved.design.shadow === 'none')
      overrides.push('shadow:none ✓')
    else
      overrides.push(
        `shadow:${detailed.resolved.design.shadow} ✗ (expected none)`,
      )

    console.log(`   Overrides: ${overrides.join(', ')}`)
    const passCount = overrides.filter((o) => o.includes('✓')).length
    console.log(`   Score: ${passCount}/5 axes respected`)
  }

  // Test 2-3: Vague dog blog — check variation
  const dog1 = results[1]
  const dog2 = results[2]
  if (!dog1.error && !dog2.error) {
    console.log('\n2. VARIATION TEST (dog blog × 2):')
    const samePrompt = dog1.prompt === dog2.prompt
    const differentGenome =
      dog1.genome.hero !== dog2.genome.hero ||
      dog1.genome.design.radius !== dog2.genome.design.radius
    const differentOutput =
      dog1.resolved.hero !== dog2.resolved.hero ||
      dog1.resolved.design.radius !== dog2.resolved.design.radius ||
      dog1.resolved.design.typography !== dog2.resolved.design.typography
    console.log(`   Same prompt: ${samePrompt}`)
    console.log(`   Different genome: ${differentGenome}`)
    console.log(`   Different resolved design: ${differentOutput}`)
    console.log(
      `   Run 1: hero=${dog1.resolved.hero} radius=${dog1.resolved.design.radius} typo=${dog1.resolved.design.typography} sections=${dog1.sectionCount} motifs=${dog1.motifs.length}`,
    )
    console.log(
      `   Run 2: hero=${dog2.resolved.hero} radius=${dog2.resolved.design.radius} typo=${dog2.resolved.design.typography} sections=${dog2.sectionCount} motifs=${dog2.motifs.length}`,
    )
    console.log(`   Variation preserved: ${differentOutput ? '✓' : '✗'}`)
  }

  // Test 4-5: Vague cat blog — check variation
  const cat1 = results[3]
  const cat2 = results[4]
  if (!cat1.error && !cat2.error) {
    console.log('\n3. VARIATION TEST (cat blog × 2):')
    const differentOutput =
      cat1.resolved.hero !== cat2.resolved.hero ||
      cat1.resolved.design.radius !== cat2.resolved.design.radius ||
      cat1.resolved.design.typography !== cat2.resolved.design.typography
    console.log(
      `   Run 1: hero=${cat1.resolved.hero} radius=${cat1.resolved.design.radius} typo=${cat1.resolved.design.typography} sections=${cat1.sectionCount} motifs=${cat1.motifs.length}`,
    )
    console.log(
      `   Run 2: hero=${cat2.resolved.hero} radius=${cat2.resolved.design.radius} typo=${cat2.resolved.design.typography} sections=${cat2.sectionCount} motifs=${cat2.motifs.length}`,
    )
    console.log(`   Variation preserved: ${differentOutput ? '✓' : '✗'}`)
  }

  // Cross-test: dog vs cat
  if (!dog1.error && !cat1.error) {
    console.log('\n4. CROSS-PROMPT VARIATION (dog vs cat):')
    const differentContent = dog1.brand !== cat1.brand
    console.log(`   Dog brand: ${dog1.brand} | Cat brand: ${cat1.brand}`)
    console.log(`   Content differs: ${differentContent ? '✓' : '✗'}`)
  }

  // Write full results JSON
  const resultsPath = join(
    process.cwd(),
    '.forge',
    'genome-test',
    'results.json',
  )
  writeFileSync(resultsPath, JSON.stringify(results, null, 2))
  console.log(`\nFull results saved to: ${resultsPath}`)
  console.log(`Individual outputs saved to: .forge/genome-test/<test-id>/`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
