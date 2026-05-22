import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isPublicationRoute } from '../utils/publication-route.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PRESETS_DIR = join(__dirname, '../../data/media-presets')

const SITE_TO_PRESET = {
  software: 'saas-hero-presets.json',
  commerce: 'ecommerce-catalog-presets.json',
  'local-experience': 'local-experience-presets.json',
  portfolio: 'portfolio-presets.json',
  agency: 'portfolio-presets.json',
  fitness: 'local-experience-presets.json',
  wellness: 'local-experience-presets.json',
  hotel: 'local-experience-presets.json',
  editorial: 'portfolio-presets.json',
  blog: 'publication-presets.json',
  'ops-console': 'saas-hero-presets.json',
  general: 'saas-hero-presets.json',
}

const cache = new Map()

export function loadMediaPreset(siteHint) {
  const file = SITE_TO_PRESET[siteHint] || SITE_TO_PRESET.general
  if (!cache.has(file)) {
    cache.set(file, JSON.parse(readFileSync(join(PRESETS_DIR, file), 'utf8')))
  }
  return cache.get(file)
}

export function mediaStrategyBlock(siteHint, variety, grammar, brief = '') {
  const publication = isPublicationRoute({ siteHint }, brief)
  const preset = loadMediaPreset(publication ? 'blog' : siteHint)
  const featuredKinds = preset.featuredKinds || preset.heroKinds || []
  const kinds = [...new Set([...(grammar?.mediaKinds || []), ...featuredKinds])]
  if (publication) {
    return `MEDIA STRATEGY (publication index):
- Featured opener: compact masthead with cover image, title, byline, date, excerpt — NOT a full-viewport hero.
- Archive grid: 6+ article cards with thumbnails, categories, read links.
- Visual kinds: ${kinds.join(', ')}
- Decor hints: ${(preset.decorHints || []).join('; ')}
- Proof patterns: ${(preset.proofPatterns || []).join('; ')}
- Treatment this run: ${variety?.mediaTreatment || 'clean-glass'}
- Every data-img must use data-visual="art-surface" and a specific data-visual-kind. Never use raw <img> URLs.`
  }
  return `MEDIA STRATEGY:
- Hero visual kinds (rotate): ${kinds.join(', ')}
- Decor hints: ${(preset.decorHints || []).join('; ')}
- Proof patterns: ${(preset.proofPatterns || []).join('; ')}
- Treatment this run: ${variety?.mediaTreatment || 'clean-glass'}
- Every data-img must use data-visual="art-surface" and a specific data-visual-kind.`
}
