import { describe, expect, it } from 'vitest'

import type { SectionLike } from '../contracts/page-aeo.ts'
import { renderAeoSectionHtml } from './render-aeo-section.ts'

describe('renderAeoSectionHtml', () => {
  it('dispatches supported section types to their rendered HTML contracts', () => {
    const sections: SectionLike[] = [
      {
        type: 'direct-answer',
        body: 'A direct answer for assistants.',
      },
      {
        type: 'faq',
        headline: 'Questions',
        items: [{ title: 'What is it?', body: 'A website generator.' }],
      },
      {
        type: 'features',
        headline: 'Features',
        items: [{ title: 'Fast', body: 'Generates quickly.' }],
      },
      {
        type: 'comparison',
        headline: 'Compare',
        columns: [{ title: 'Ship Fast' }],
        rows: [{ label: 'Export', values: ['HTML'] }],
      },
      {
        type: 'use-cases',
        headline: 'Use cases',
        items: [{ title: 'Agencies', body: 'Launch client sites.' }],
      },
      {
        type: 'how-it-works',
        headline: 'How it works',
        items: [{ title: 'Prompt', body: 'Describe the site.' }],
      },
      {
        type: 'who-for',
        headline: 'Who it is for',
        items: [{ title: 'Founders', body: 'Launch faster.' }],
      },
      {
        type: 'testimonials',
        headline: 'Testimonials',
        items: [{ title: 'Ari', body: 'It shipped.' }],
      },
      {
        type: 'pricing',
        headline: 'Pricing',
        items: [{ title: 'Pro', price: '$20', features: ['Exports'] }],
      },
      {
        type: 'breadcrumbs',
        items: [
          { label: 'Home', href: '/' },
          { label: 'Pricing', href: '/pricing' },
        ],
      },
    ]

    const html = sections.map((section) => renderAeoSectionHtml(section))

    expect(
      html.every((item) => typeof item === 'string' && item.length > 0),
    ).toBe(true)
    expect(html.join('\n')).toContain('A direct answer for assistants.')
    expect(html.join('\n')).toContain('data-accordion')
    expect(html.join('\n')).toContain('feature-list')
    expect(html.join('\n')).toContain('comparison-table')
    expect(html.join('\n')).toContain('use-case-card')
    expect(html.join('\n')).toContain('how-it-works-steps')
    expect(html.join('\n')).toContain('who-for-list')
    expect(html.join('\n')).toContain('testimonial')
    expect(html.join('\n')).toContain('pricing-card')
    expect(html.join('\n')).toContain('aria-label="Breadcrumb"')
  })

  it('returns null for unknown sections instead of emitting broken markup', () => {
    expect(
      renderAeoSectionHtml({ type: 'unknown-section' } as SectionLike),
    ).toBeNull()
  })
})
