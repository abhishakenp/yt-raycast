import { THEME_NAMES } from '../../../ship-fast-blocks/src/theme-apply.ts'

// Category-aware theme routing for commerce verticals. The composer used to
// seed-pick a theme uniformly from the FULL catalog, so a jewelry atelier and a
// snack shop could both land on 'doom-64'. This module narrows the pick to a
// mood pool derived from the brief's category semantics (never from a slug or
// brand name), keeping per-seed variety while staying on-category.
//
// Mechanism is generic: prompt keywords → retail mood → pool of EXISTING theme
// presets. Unknown moods and non-commerce families return null and the caller
// keeps its full-catalog behavior.

export type RetailMood =
  | 'luxury'
  | 'street-bold'
  | 'organic-craft'
  | 'pop-retail'
  | 'tech-mono'
  | 'fresh-active'
  | 'retail-general'

const MOOD_POOLS: Record<RetailMood, string[]> = {
  luxury: [
    'elegant-luxury',
    'starry-night',
    'midnight-bloom',
    'amethyst-haze',
    'vintage-paper',
  ],
  'street-bold': ['neo-brutalism', 'bold-tech', 'cyberpunk', 'mono', 'doom-64'],
  'organic-craft': [
    'sage-garden',
    'nature',
    'kodama-grove',
    'mocha-mousse',
    'solar-dusk',
    'caffeine',
  ],
  'pop-retail': [
    'bubblegum',
    'candyland',
    'soft-pop',
    't3-chat',
    'retro-arcade',
    'tangerine',
  ],
  'tech-mono': [
    'vercel',
    'darkmatter',
    'clean-slate',
    'graphite',
    'cosmic-night',
    'perpetuity',
  ],
  'fresh-active': [
    'ocean-breeze',
    'northern-lights',
    'sunset-horizon',
    'modern-minimal',
  ],
  'retail-general': [
    'modern-minimal',
    'amber-minimal',
    'claude',
    'elegant-luxury',
    'sage-garden',
    'tangerine',
    'soft-pop',
    'ocean-breeze',
  ],
}

// Prompt-keyword buckets, checked in order. First match wins so the most
// distinctive signals (luxury materials, street culture) outrank generic ones.
const MOOD_HINTS: Array<[RegExp, RetailMood]> = [
  [
    /\b(luxur\w*|jewel\w*|watch(es)?|fragrance|perfume|couture|atelier|bespoke|heritage|diamond|gold|silk|cashmere|fine\s+(?:art|goods|leather))\b/i,
    'luxury',
  ],
  [
    /\b(sneaker\w*|streetwear|skate\w*|hype|drops?|urban|graffiti|hip.?hop|vinyl|band\s+merch)\b/i,
    'street-bold',
  ],
  [
    /\b(organic|skincare|wellness|candle\w*|soap|botanic\w*|natural|artisan\w*|handmade|hand-?crafted|craft\w*|eco\b|sustainab\w*|ceramic\w*|pottery|tea|apothecary)\b/i,
    'organic-craft',
  ],
  [
    /\b(snack\w*|candy|sweets|toy\w*|kids?|children\w*|pet\w*|party|stationery|sticker\w*|plush\w*|bakery)\b/i,
    'pop-retail',
  ],
  [
    /\b(electronic\w*|gadget\w*|audio|headphone\w*|keyboard\w*|camera\w*|drone\w*|hardware|comput\w*|gaming|console\w*|smart\s?home|tech)\b/i,
    'tech-mono',
  ],
  [
    /\b(surf\w*|outdoor\w*|sport\w*|fitness|swim\w*|beach|hik\w*|cycl\w*|run(?:ning)?|supplement\w*|hydration|yoga\s?gear)\b/i,
    'fresh-active',
  ],
]

// Family fallbacks when the brief carries no category keywords. Keyed on the
// vertical family kind, never on a specific brand/slug.
const FAMILY_DEFAULT_MOOD: Record<string, RetailMood> = {
  JewelryStore: 'luxury',
  FashionStore: 'luxury',
  BeautyStore: 'organic-craft',
  FurnitureStore: 'organic-craft',
  ElectronicsStore: 'tech-mono',
  Ecommerce: 'retail-general',
}

export const COMMERCE_FAMILIES: ReadonlySet<string> = new Set(
  Object.keys(FAMILY_DEFAULT_MOOD),
)

const KNOWN_THEMES = new Set(THEME_NAMES)

/** Pool of valid theme preset names for a mood (unknown presets filtered out). */
export function themePoolFor(mood: RetailMood): string[] {
  return MOOD_POOLS[mood].filter((name) => KNOWN_THEMES.has(name))
}

/**
 * Resolve the retail mood for a brief + composed family, or null when the
 * context is not a storefront (caller keeps its full-catalog theme pick).
 */
export function resolveRetailMood(
  prompt: string,
  familyName: string,
): RetailMood | null {
  if (!COMMERCE_FAMILIES.has(familyName)) return null
  const text = String(prompt || '')
  for (const [re, mood] of MOOD_HINTS) {
    if (re.test(text)) return mood
  }
  return FAMILY_DEFAULT_MOOD[familyName] ?? 'retail-general'
}

/**
 * Seeded on-category theme pick for storefront generations. Returns null for
 * non-commerce families or when the pool is empty so the caller can fall back
 * to its existing full-catalog behavior.
 */
export function pickThemeForContext(input: {
  prompt: string
  familyName: string
  rng: () => number
}): string | null {
  const mood = resolveRetailMood(input.prompt, input.familyName)
  if (!mood) return null
  const pool = themePoolFor(mood)
  if (!pool.length) return null
  return pool[Math.min(pool.length - 1, Math.floor(input.rng() * pool.length))]
}
