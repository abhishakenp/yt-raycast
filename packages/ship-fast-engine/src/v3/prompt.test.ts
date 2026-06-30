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
