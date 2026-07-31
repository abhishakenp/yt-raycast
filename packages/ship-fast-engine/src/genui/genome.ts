/**
 * genome.ts — Structural genome for generative site diversity.
 *
 * Each generation session gets a unique genome that constrains the LLM's
 * structural choices: which motifs to use, which chromes, which design axes,
 * which rhythm pattern. This replaces the old fixed "vertical → structure"
 * mapping with a random stratified sample, so two "coffee shop" prompts
 * produce structurally different sites.
 *
 * The genome is generated from a seeded RNG (seed = session ID), so it's
 * deterministic per session but varies across sessions.
 */

// ── Motif categories ───────────────────────────────────────────────────────
// Structural motifs are always available. Content motifs are randomly sampled.

const HERO_MOTIFS = [
  'SplitHero',
  'CenteredHero',
  'PosterHero',
  'ComingSoonHero',
] as const

const STRUCTURAL_MOTIFS = ['Navbar', 'Footer'] as const

const CONTENT_MOTIFS = [
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
  'ProductDetail',
  'BlogPost',
  'SidebarNav',
] as const

const CHROMES = [
  'hairline',
  'brutalist',
  'terminal',
  'editorial',
  'gradient',
  'none',
] as const

const RHYTHMS = ['dense', 'airy', 'alternating', 'cinematic'] as const

// Tailwind axes — store Tailwind classes directly, no invented vocabulary
const RADII = [
  'rounded-none',
  'rounded-lg',
  'rounded-xl',
  'rounded-full',
] as const
const SHADOWS = [
  'shadow-none',
  'shadow-sm',
  'shadow-[4px_4px_0_0]',
  'shadow-[8px_8px_0_0]',
] as const
// Named-concept axes — keep presets (no Tailwind equivalent)
const GRADIENTS = ['none', 'subtle', 'vibrant'] as const
const DENSITIES = ['compact', 'balanced', 'airy'] as const
const TYPOGRAPHIES = ['editorial', 'technical', 'display', 'humanist'] as const

const NAVBAR_VARIANTS = ['default', 'centered', 'minimal', 'split'] as const

// ── Genome type ────────────────────────────────────────────────────────────

export interface StructuralGenome {
  hero: string
  contentMotifs: string[]
  availableMotifs: string[]
  chromes: string[]
  design: {
    radius: string
    shadow: string
    gradient: string
    density: string
    typography: string
  }
  rhythm: string
  sectionCount: number
  pageCount: number
  navbarVariant: string
}

// ── Seeded RNG (FNV-1a) ────────────────────────────────────────────────────

function hashString(value: string): number {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function makeSeededRng(seed: string): () => number {
  let state = hashString(seed) || 1
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

// ── Sampling helpers ───────────────────────────────────────────────────────

function pickOne<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function shuffle<T>(rng: () => number, arr: readonly T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function pickN<T>(rng: () => number, arr: readonly T[], n: number): T[] {
  return shuffle(rng, arr).slice(0, n)
}

function randomInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1))
}

// ── Genome generation ──────────────────────────────────────────────────────

/**
 * Generate a structural genome from a session seed.
 *
 * The genome uses stratified sampling:
 * - 1 hero (from 4 hero motifs)
 * - Navbar + Footer (always present)
 * - 6-8 content motifs (from 34 content motifs, randomly sampled)
 * - 2-3 chromes (from 6 chrome options)
 * - Random design axes
 * - Random rhythm pattern
 * - Random section/page counts
 *
 * Variation space: ~2 trillion combinations (41 bits of entropy).
 */
export function generateGenome(seed: string): StructuralGenome {
  const rng = makeSeededRng(`genome:${seed}`)

  const hero = pickOne(rng, HERO_MOTIFS)
  const contentCount = randomInt(rng, 6, 8)
  const contentMotifs = pickN(rng, CONTENT_MOTIFS, contentCount)
  const availableMotifs = [hero, ...STRUCTURAL_MOTIFS, ...contentMotifs]

  const chromeCount = randomInt(rng, 2, 3)
  const chromes = pickN(rng, CHROMES, chromeCount)

  const design = {
    radius: pickOne(rng, RADII),
    shadow: pickOne(rng, SHADOWS),
    gradient: pickOne(rng, GRADIENTS),
    density: pickOne(rng, DENSITIES),
    typography: pickOne(rng, TYPOGRAPHIES),
  }

  const rhythm = pickOne(rng, RHYTHMS)
  const sectionCount = randomInt(rng, 5, 9)
  const pageCount = randomInt(rng, 1, 6)
  const navbarVariant = pickOne(rng, NAVBAR_VARIANTS)

  return {
    hero,
    contentMotifs,
    availableMotifs,
    chromes,
    design,
    rhythm,
    sectionCount,
    pageCount,
    navbarVariant,
  }
}
