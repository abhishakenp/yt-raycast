import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const SOURCE = readFileSync(resolve(__dirname, './customLanguages.ts'), 'utf8')

describe('customLanguages source invariants', () => {
  it('maps common generated language names to ISO locale codes for translation', () => {
    expect(SOURCE).toContain('mexican: {')
    expect(SOURCE).toContain("code: 'es-MX'")
    expect(SOURCE).toContain("name: 'Mexican Spanish'")
    expect(SOURCE).toContain("nativeName: 'Español (México)'")
    expect(SOURCE).toContain('lithuanian: {')
    expect(SOURCE).toContain("code: 'lt'")
    expect(SOURCE).toContain("nativeName: 'Lietuvių'")
    expect(SOURCE).toContain('japanese: {')
    expect(SOURCE).toContain("code: 'ja'")
    expect(SOURCE).toContain("nativeName: '日本語'")
    expect(SOURCE).toContain('chinese: {')
    expect(SOURCE).toContain("code: 'zh'")
    expect(SOURCE).toContain("nativeName: '中文'")
  })

  it('does not return stale exact matches when canonical metadata needs repair', () => {
    expect(SOURCE).toContain('needsCanonicalRepair(existing, input)')
    expect(SOURCE).toContain(
      'withCanonicalLanguageMetadata(input, await generateNativeName(input))',
    )
  })

  it('uses canonical browser-native locale metadata before calling AI', () => {
    expect(SOURCE).toContain(
      'const canonical = canonicalLanguageMetadata(input)',
    )
    const compact = SOURCE.replace(/\s+/g, ' ')
    expect(compact).toContain(
      'canonical ?? withCanonicalLanguageMetadata(input, await generateNativeName(input))',
    )
  })

  it('filters stale DB entries that claimed a canonical alias with the wrong code', () => {
    expect(SOURCE).toContain('isStaleCanonicalAlias')
    expect(SOURCE).toContain('doc.code !== canonical.code')
    expect(SOURCE).toContain(
      'docs.filter((doc) => !isStaleCanonicalAlias(doc))',
    )
  })

  it('asks AI for BCP-47 locale codes, not just display labels', () => {
    expect(SOURCE).toContain('"code": "<BCP-47 locale code')
    expect(SOURCE).toContain('Mexican" means Mexican Spanish')
    expect(SOURCE).toContain('normalizeAiLocaleCode')
  })
})
