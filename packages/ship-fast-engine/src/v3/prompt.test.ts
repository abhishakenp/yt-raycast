import { describe, it, expect } from 'vitest'
import {
  buildPrompt,
  buildLowConfidenceKindPrompt,
  buildLowConfidenceFillPrompt,
  renderVocabulary,
  renderRoleSignature,
} from './prompt'
import { getVocabulary } from './vocabulary'
import { KINDS } from './kinds'

const highConfidence = {
  kind: 'restaurant',
  confidence: 0.9,
  top3: ['restaurant', 'commerce', 'saas'],
}

describe('buildPrompt (high-confidence)', () => {
  const r = buildPrompt({
    prompt: 'a farm-to-table restaurant',
    confidence: highConfidence,
    locale: 'en',
  })

  it('returns path=high', () => {
    expect(r.path).toBe('high')
  })

  it('system contains the inferred top-1 kind name only', () => {
    expect(r.system).toContain('restaurant')
    // high-confidence path sends only the inferred kind, not top-3
    expect(r.system).not.toContain('Sections for commerce:')
    expect(r.system).not.toContain('Sections for saas:')
  })

  it('system contains role signature lines for the inferred kind', () => {
    expect(r.system).toContain('Sections for restaurant:')
    // restaurant menu signature with nested categories
    expect(r.system).toContain('menu:')
    expect(r.system).toContain(
      'categories[name>items[name~description~price~tag]]',
    )
    // footer with tagline, columns, social
    expect(r.system).toContain(
      'footer: tagline|columns[title~links[]]|social[]',
    )
  })

  it('system contains the worked menu example', () => {
    expect(r.system).toContain('Example (restaurant menu')
    expect(r.system).toContain('Autumn Menu')
    expect(r.system).toContain('Roasted Beet Tartare')
  })

  it('system contains locale directive', () => {
    expect(r.system).toContain('Write all content in en')
  })

  it('user contains the build request', () => {
    expect(r.user).toBe('Build request: a farm-to-table restaurant')
  })

  it('system contains app detection guidance in reasoning phase', () => {
    expect(r.system).toContain('IS THIS A WEBSITE OR AN APP')
    expect(r.system).toContain('@svelte')
    expect(r.system).toContain('@type')
  })

  it('system has app vs website decision framework', () => {
    expect(r.system).toContain('READ')
    expect(r.system).toContain('INTERACT')
    expect(r.system).toContain('WEBSITE')
    expect(r.system).toContain('APP')
  })

  it('system has app request examples', () => {
    expect(r.system).toContain('todo list app')
    expect(r.system).toContain('counter app')
    expect(r.system).toContain('tic tac toe')
  })
})

describe('buildLowConfidenceKindPrompt (call 1)', () => {
  const r = buildLowConfidenceKindPrompt('zzz florb gnarp')

  it('system lists all 17 kinds with summaries', () => {
    expect(KINDS).toHaveLength(17)
    for (const k of KINDS) {
      expect(r.system).toContain(k.kind)
    }
  })

  it('user instructs to output only the kind name', () => {
    expect(r.user).toContain('Output ONLY the kind name')
    expect(r.user).toContain('zzz florb gnarp')
  })

  it('system guides app requests to marketing', () => {
    expect(r.system).toContain('interactive APP')
    expect(r.system).toContain('todo list')
    expect(r.system).toContain('@svelte')
  })

  it('user guides app requests to marketing', () => {
    expect(r.user).toContain('app/tool request')
    expect(r.user).toContain('marketing')
  })
})

describe('buildLowConfidenceFillPrompt (call 2)', () => {
  const r = buildLowConfidenceFillPrompt({
    prompt: 'a clinic',
    kind: 'healthcare',
    locale: 'fr',
  })

  it('returns path=low', () => {
    expect(r.path).toBe('low')
  })

  it('system has only the one chosen kind vocabulary', () => {
    expect(r.system).toContain('Sections for healthcare:')
    expect(r.system).not.toContain('Sections for restaurant:')
    expect(r.system).not.toContain('Sections for commerce:')
  })

  it('system contains locale directive for chosen locale', () => {
    expect(r.system).toContain('Write all content in fr')
  })

  it('user contains the build request', () => {
    expect(r.user).toBe('Build request: a clinic')
  })
})

describe('renderVocabulary / renderRoleSignature', () => {
  it('renders footer with tagline, columns, social', () => {
    const vocab = getVocabulary('restaurant')
    const footer = vocab.roles.find((rv) => rv.role === 'footer')!
    expect(renderRoleSignature(footer)).toBe(
      'footer: tagline|columns[title~links[]]|social[]',
    )
  })

  it('renders nested grouped array signature', () => {
    const vocab = getVocabulary('restaurant')
    const menu = vocab.roles.find((rv) => rv.role === 'menu')!
    const line = renderRoleSignature(menu)
    expect(line).toBe(
      'menu: heading|description|categories[name>items[name~description~price~tag]]',
    )
  })

  it('renders primitive array as name[]', () => {
    const vocab = getVocabulary('commerce')
    const footer = vocab.roles.find((rv) => rv.role === 'footer')!
    const social = footer.fields.find((f) => f.name === 'social')!
    const line = renderRoleSignature({ role: 'footer', fields: [social] })
    expect(line).toBe('footer: social[]')
  })

  it('renders object array with nested field names', () => {
    const vocab = getVocabulary('commerce')
    const gallery = vocab.roles.find((rv) => rv.role === 'gallery')!
    const products = gallery.fields.find((f) => f.name === 'products')!
    expect(products.nested!.length).toBeGreaterThan(0)
    const line = renderRoleSignature({ role: 'gallery', fields: [products] })
    expect(line).toContain('products[name~price')
  })

  it('renderVocabulary emits Sections for header', () => {
    const out = renderVocabulary(getVocabulary('saas'))
    expect(out.startsWith('Sections for saas:')).toBe(true)
    expect(out).toContain('hero:')
  })
})

describe('@svelte format rules in prompt', () => {
  const r = buildPrompt({
    prompt: 'a todo list app',
    confidence: {
      kind: 'marketing',
      confidence: 0,
      top3: ['marketing', 'saas', 'restaurant'],
    },
    locale: 'en',
  })

  it('includes @svelte blocks instruction section', () => {
    expect(r.system).toContain('@svelte blocks')
    expect(r.system).toContain('Svelte 4')
  })

  it('mentions Svelte 4 syntax (not Svelte 5 runes)', () => {
    expect(r.system).toContain('Svelte 4 syntax')
    expect(r.system).toContain('NOT Svelte 5 runes')
  })

  it('mentions on:click and bind:value', () => {
    expect(r.system).toContain('on:click')
    expect(r.system).toContain('bind:value')
  })

  it('mentions $lakebed import for data access', () => {
    expect(r.system).toContain('$lakebed')
    expect(r.system).toContain('queries')
    expect(r.system).toContain('mutations')
  })

  it('includes todo list example in @svelte blocks', () => {
    expect(r.system).toContain('todowidget')
    expect(r.system).toContain('Buy groceries')
    expect(r.system).toContain('toggle')
  })

  it('includes counter example in @svelte blocks', () => {
    expect(r.system).toContain('counterdemo')
    expect(r.system).toContain('let count = 0')
    expect(r.system).toContain('count++')
  })

  it('OUTPUT FORMAT mentions @svelte blocks', () => {
    expect(r.system).toContain('Then: @svelte blocks')
  })

  it('uses @svelte/@endsvelte markers', () => {
    expect(r.system).toContain('@svelte')
    expect(r.system).toContain('@endsvelte')
  })

  it('does NOT reference old @freeform grammar', () => {
    expect(r.system).not.toContain('@freeform')
    expect(r.system).not.toContain('@endfreeform')
    expect(r.system).not.toContain('state: var1=initval')
    expect(r.system).not.toContain('actions: action1')
  })

  it('does NOT reference + line grammar', () => {
    expect(r.system).not.toContain('+ tableName')
    expect(r.system).not.toContain('+ opName macroType')
    expect(r.system).not.toContain('macroType must be one of')
  })
})
