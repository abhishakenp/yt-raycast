// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'

import type { SectionLike } from '../contracts/page-aeo.ts'
import { promptSnippet } from '../compatibility/prompt-snippet.ts'
import { renderComparisonTableSection } from './comparison-table.ts'
import { renderFeatureListSection } from './feature-list.ts'
import { renderHowItWorksSection } from './how-it-works.ts'
import { renderPricingSummarySection } from './pricing-summary.ts'
import { renderUseCasesSection } from './use-cases.ts'
import { renderWhoForSection } from './who-for.ts'

function parseHtml(html: string) {
  return new DOMParser().parseFromString(html, 'text/html')
}

describe('AEO section renderer fallback contracts', () => {
  it('uses stable default section ids and omits empty headings', () => {
    const cases = [
      {
        expectedId: 'features',
        render: renderFeatureListSection,
        selector: 'section.features',
      },
      {
        expectedId: 'how-it-works',
        render: renderHowItWorksSection,
        selector: 'section.how-it-works',
      },
      {
        expectedId: 'use-cases',
        render: renderUseCasesSection,
        selector: 'section.use-cases',
      },
      {
        expectedId: 'who-for',
        render: renderWhoForSection,
        selector: 'section.who-for',
      },
      {
        expectedId: 'comparison',
        render: renderComparisonTableSection,
        selector: 'section.comparison',
      },
      {
        expectedId: 'pricing',
        render: renderPricingSummarySection,
        selector: 'section.pricing',
      },
    ]

    for (const testCase of cases) {
      const doc = parseHtml(testCase.render({ items: [] }))
      const section = doc.querySelector(testCase.selector)
      expect(section?.id).toBe(testCase.expectedId)
      expect(section?.querySelector('h2')).toBeNull()
    }
  })

  it('renders aliases as text while escaping hostile section content', () => {
    const id = 'features"><script data-attack>'
    const doc = parseHtml(
      renderFeatureListSection({
        body: 'Use <img src=x onerror=alert(1)> safely',
        headline: '<Launch & learn>',
        id,
        items: [
          {
            description: 'No <script>execution</script>',
            label: 'Fast & safe',
          },
        ],
        subheadline: 'Built for <teams>',
      }),
    )
    const section = doc.querySelector('section.features')

    expect(section?.id).toBe(id)
    expect(section?.querySelector('script')).toBeNull()
    expect(section?.querySelector('img')).toBeNull()
    expect(section?.querySelector('h2')?.textContent).toBe('<Launch & learn>')
    expect(section?.querySelector('.eyebrow')?.textContent).toBe(
      'Built for <teams>',
    )
    expect(section?.querySelector('.card h3')?.textContent).toBe('Fast & safe')
    expect(section?.querySelector('.card p')?.textContent).toBe(
      'No <script>execution</script>',
    )
  })

  it('supplies numbered step titles and description aliases', () => {
    const doc = parseHtml(
      renderHowItWorksSection({
        items: [
          { description: 'Connect the data source.' },
          { label: 'Launch' },
        ],
      }),
    )
    const steps = doc.querySelectorAll('ol.how-it-works-steps > li')

    expect(steps).toHaveLength(2)
    expect(steps[0]?.querySelector('h3')?.textContent).toContain('Step 1')
    expect(steps[0]?.querySelector('p')?.textContent).toBe(
      'Connect the data source.',
    )
    expect(steps[1]?.querySelector('h3')?.textContent).toContain('Launch')
  })

  it('uses generic item labels when deriving a comparison table', () => {
    const section: SectionLike = {
      headline: 'Plans',
      items: [{ label: 'Starter', description: 'Basic plan' }],
    }
    const doc = parseHtml(renderComparisonTableSection(section))

    expect(doc.querySelectorAll('thead th')).toHaveLength(2)
    expect(doc.querySelectorAll('thead th')[1]?.textContent).toBe('Starter')
    expect(doc.querySelector('tbody th')?.textContent).toBe('Starter')
    expect(doc.querySelector('tbody td')?.textContent).toBe('Basic plan')
  })

  it('uses generic item labels for pricing card headings', () => {
    const doc = parseHtml(
      renderPricingSummarySection({
        items: [
          {
            description: 'For small teams',
            features: ['One workspace'],
            label: 'Starter',
            price: '$9',
          },
        ],
      }),
    )
    const card = doc.querySelector('article.pricing-card')

    expect(card?.querySelector('h3')?.textContent).toBe('Starter')
    expect(card?.querySelector('.price')?.textContent).toBe('$9')
    expect(card?.querySelector('p')?.textContent).toBe('For small teams')
    expect(card?.querySelectorAll('ul li')).toHaveLength(1)
  })

  it('normalizes prompt snippets and truncates within the requested limit', () => {
    expect(promptSnippet('  Build\n\ta launch site  ')).toBe(
      'Build a launch site',
    )
    expect(promptSnippet('   ', 80, 'fallback')).toBe('fallback')
    expect(promptSnippet('abcdefghij', 6)).toBe('abcde…')
    expect(promptSnippet('short', 5)).toBe('short')
  })
})
