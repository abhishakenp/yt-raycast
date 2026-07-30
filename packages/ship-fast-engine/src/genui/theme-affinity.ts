/**
 * theme-affinity.ts — maps @design intent → theme preset.
 *
 * The old system used commerce-specific mood pools (luxury, street-bold, etc.).
 * The new system uses the @design axis (radius, shadow, gradient, density,
 * typography, motion) which is more general and works for any prompt.
 *
 * This module picks a theme preset whose vibe matches the design intent,
 * using a seeded RNG for variety within a consistent mood.
 */
import { THEME_NAMES } from '../../../ship-fast-blocks/src/theme-apply.ts'
import type { DesignIntent } from '../../../ship-fast-blocks/src/primitives/design-system.ts'

const KNOWN_THEMES = new Set(THEME_NAMES)

// ─── Design intent → theme pool mapping ──────────────────────────────────
// Each design axis combination maps to a pool of themes with matching vibes.
// The pool is filtered to only known themes.

const DESIGN_THEME_POOLS: Array<{
  match: (d: DesignIntent) => boolean
  pool: string[]
}> = [
  // Brutalist / bold — hard offset shadow is the strongest signal
  {
    match: (d) => d.shadow === 'shadow-[8px_8px_0_0]' || d.shadow === 'shadow-[4px_4px_0_0]',
    pool: ['neo-brutalism', 'doom-64', 'mono', 'bold-tech', 'cyberpunk'],
  },
  // Mesh / futuristic — gradient:mesh is distinctive
  {
    match: (d) => d.gradient === 'mesh',
    pool: ['cosmic-night', 'northern-lights', 'cyberpunk', 'midnight-bloom'],
  },
  // Technical / developer / monospace
  {
    match: (d) => d.typography === 'technical',
    pool: [
      'vercel',
      'darkmatter',
      'graphite',
      'perpetuity',
      'clean-slate',
      'supabase',
    ],
  },
  // Luxury / elegant / editorial serif
  {
    match: (d) => d.typography === 'editorial' && d.radius !== 'rounded-full',
    pool: [
      'elegant-luxury',
      'starry-night',
      'midnight-bloom',
      'vintage-paper',
      'claude',
      'sage-garden',
    ],
  },
  // Display / bold / vibrant
  {
    match: (d) => d.typography === 'display' || d.gradient === 'vibrant',
    pool: [
      'bold-tech',
      'cosmic-night',
      'cyberpunk',
      'tangerine',
      'sunset-horizon',
    ],
  },
  // Organic / natural / warm
  {
    match: (d) => d.gradient === 'subtle' && d.typography === 'humanist',
    pool: [
      'mocha-mousse',
      'kodama-grove',
      'nature',
      'solar-dusk',
      'caffeine',
      'sage-garden',
    ],
  },
  // Humanist / soft / friendly
  {
    match: (d) => d.typography === 'humanist' && (d.radius === 'rounded-xl' || d.radius === 'rounded-2xl'),
    pool: [
      't3-chat',
      'bubblegum',
      'soft-pop',
      'claymorphism',
      'pastel-dreams',
      'candyland',
    ],
  },
  // Soft / rounded / gentle
  {
    match: (d) => d.radius === 'rounded-full',
    pool: [
      'violet-bloom',
      'amethyst-haze',
      'pastel-dreams',
      'catppuccin',
      'soft-pop',
    ],
  },
  // Default: versatile themes
  {
    match: () => true,
    pool: [
      'modern-minimal',
      'amber-minimal',
      'clean-slate',
      'claude',
      'twitter',
      'ocean-breeze',
    ],
  },
]

/**
 * Pick a theme preset that matches the design intent, using a seeded RNG
 * for variety within the mood pool.
 */
export function pickThemeForDesignIntent(
  design: DesignIntent,
  rng: () => number,
): string {
  for (const { match, pool } of DESIGN_THEME_POOLS) {
    if (match(design)) {
      const valid = pool.filter((name) => KNOWN_THEMES.has(name))
      if (valid.length > 0) {
        return valid[
          Math.min(valid.length - 1, Math.floor(rng() * valid.length))
        ]
      }
    }
  }
  // Fallback: pick any known theme
  const allThemes = THEME_NAMES
  return allThemes[
    Math.min(allThemes.length - 1, Math.floor(rng() * allThemes.length))
  ]
}
