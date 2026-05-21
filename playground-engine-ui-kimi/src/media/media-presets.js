import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

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

export function mediaStrategyBlock(siteHint, variety, grammar) {
  const preset = loadMediaPreset(siteHint)
  const kinds = [...new Set([...(grammar?.mediaKinds || []), ...(preset.heroKinds || [])])]
  return `MEDIA STRATEGY:
- Hero visual kinds (rotate): ${kinds.join(', ')}
- Decor hints: ${(preset.decorHints || []).join('; ')}
- Proof patterns: ${(preset.proofPatterns || []).join('; ')}
- Treatment this run: ${variety?.mediaTreatment || 'clean-glass'}
- Every data-img must use data-visual="art-surface" and a specific data-visual-kind.`
}
