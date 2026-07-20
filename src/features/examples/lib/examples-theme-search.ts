const EXAMPLES_THEME_NAMES = new Set([
  'modern-minimal',
  'violet-bloom',
  't3-chat',
  'twitter',
  'mocha-mousse',
  'bubblegum',
  'amethyst-haze',
  'notebook',
  'doom-64',
  'catppuccin',
  'graphite',
  'perpetuity',
  'kodama-grove',
  'cosmic-night',
  'tangerine',
  'quantum-rose',
  'nature',
  'bold-tech',
  'elegant-luxury',
  'amber-minimal',
  'supabase',
  'neo-brutalism',
  'solar-dusk',
  'claymorphism',
  'cyberpunk',
  'pastel-dreams',
  'clean-slate',
  'corporate',
  'caffeine',
  'ocean-breeze',
  'retro-arcade',
  'midnight-bloom',
  'candyland',
  'northern-lights',
  'vintage-paper',
  'sunset-horizon',
  'starry-night',
  'claude',
  'vercel',
  'darkmatter',
  'mono',
  'soft-pop',
  'sage-garden',
])

export const DEFAULT_EXAMPLES_THEME = 'modern-minimal'

const isKnownExamplesTheme = (value: unknown): value is string =>
  typeof value === 'string' && EXAMPLES_THEME_NAMES.has(value)

export type ExamplesThemeSearch = {
  theme: string
  mode: 'light' | 'dark'
}

export const parseExamplesThemeSearch = (
  search: Record<string, unknown>,
): ExamplesThemeSearch => ({
  theme: isKnownExamplesTheme(search.theme)
    ? search.theme
    : DEFAULT_EXAMPLES_THEME,
  mode: search.mode === 'dark' ? 'dark' : 'light',
})
