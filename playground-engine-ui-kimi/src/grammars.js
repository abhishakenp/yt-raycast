import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pickSeeded } from './utils/hash.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA = join(__dirname, '../data/page-grammars')

let verticalGrammars = null
let appShellGrammars = null
let editorialGrammars = null

function loadJson(file) {
  return JSON.parse(readFileSync(join(DATA, file), 'utf8'))
}

export function getVerticalGrammars() {
  if (!verticalGrammars) verticalGrammars = loadJson('vertical-grammars.json')
  return verticalGrammars
}

export function getAppShellGrammars() {
  if (!appShellGrammars) appShellGrammars = loadJson('app-shell-grammars.json')
  return appShellGrammars
}

export function getEditorialGrammars() {
  if (!editorialGrammars) editorialGrammars = loadJson('editorial-grammars.json')
  return editorialGrammars
}

function grammarPool(siteHint, pageKind) {
  if (pageKind === 'app-shell') return getAppShellGrammars()
  if (siteHint === 'blog' || siteHint === 'editorial') return [...getEditorialGrammars(), ...getVerticalGrammars()]
  return getVerticalGrammars()
}

const GRAMMAR_BY_SITE_HINT = {
  blog: 'editorial-blog-index',
  portfolio: 'gallery-masonry',
  agency: 'hero-editorial-split',
  fitness: 'timeline-led',
  wellness: 'hero-immersive',
  hotel: 'hero-immersive',
}

export function pickGrammar({ brief, siteHint, seed, pageKind } = {}) {
  const kind = pageKind || (siteHint === 'ops-console' ? 'app-shell' : 'vertical-doc')
  const pool = grammarPool(siteHint, kind).filter((grammar) => {
    if (grammar.pageKind !== kind) return false
    if (!grammar.siteHints?.length) return true
    return grammar.siteHints.includes(siteHint) || grammar.siteHints.includes('general')
  })
  const candidates = pool.length ? pool : grammarPool(siteHint, kind)
  const forcedId = GRAMMAR_BY_SITE_HINT[siteHint]
  const forced = forcedId ? candidates.find((grammar) => grammar.id === forcedId) : null
  const grammar = forced || pickSeeded(candidates, seed, `grammar:${siteHint}:${kind}`) || candidates[0]
  return { ...grammar, pageKind: kind }
}

export function grammarPromptBlock(grammar, variety) {
  if (!grammar) return ''
  return `PAGE GRAMMAR (follow this composition — do not default to generic SaaS):
- Grammar: ${grammar.label} (${grammar.id})
- Hero pattern: ${grammar.heroPattern || grammar.layoutPattern || 'confident identity band'}
- Section rhythm: ${(grammar.sectionRhythm || grammar.islands || []).join(' → ')}
- Content strategy this run: ${variety?.contentStrategy || 'story-forward'}
- Media treatment this run: ${variety?.mediaTreatment || 'clean-glass'}
- Preferred visual kinds: ${(grammar.mediaKinds || []).join(', ')}`
}
