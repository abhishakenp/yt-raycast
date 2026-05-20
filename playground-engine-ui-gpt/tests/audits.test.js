import { describe, expect, it } from 'vitest'
import { compareSignatures, validateFullWidthSections } from '../src/audits.js'

function section(i) {
  return `<section class="w-full bg-[#101010] py-16"><div class="mx-auto max-w-7xl px-6"><h2>Section ${i}</h2><p>Real content for this section.</p></div></section>`
}

describe('deterministic audits', () => {
  it('accepts full-width sections with inner wrappers', () => {
    const html = Array.from({ length: 6 }, (_, i) => section(i)).join('\n')
    expect(validateFullWidthSections(html).ok).toBe(true)
  })

  it('rejects narrow structural sections', () => {
    const html = '<section class="max-w-md py-10"><div><h2>Narrow</h2></div></section>'
    const audit = validateFullWidthSections(html)
    expect(audit.ok).toBe(false)
    expect(audit.issues.join(' ')).toContain('w-full')
  })

  it('compares signatures across visible variety axes', () => {
    const result = compareSignatures(
      { anchor: 'Linear', secondary: 'Stripe', layoutGrammar: 'poster-grid', palette: ['#000', '#fff'], fonts: ['A', 'B'], pageKind: 'vertical-doc', tokenSample: ['grid-cols-2'] },
      { anchor: 'Vogue', secondary: 'Apple', layoutGrammar: 'catalog-wall', palette: ['#111', '#f00'], fonts: ['C', 'D'], pageKind: 'vertical-doc', tokenSample: ['grid-cols-5'] },
    )
    expect(result.ok).toBe(true)
    expect(result.diffs.length).toBeGreaterThanOrEqual(3)
  })
})
