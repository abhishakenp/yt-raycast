import { describe, expect, it } from 'vitest'
import { buildStructuredData } from './build.ts'

describe('buildStructuredData', () => {
  it('emits Organization, WebSite, SoftwareApplication, FAQPage, and BreadcrumbList when relevant', () => {
    const siteSpec = {
      projectName: 'Acme',
      siteType: 'saas',
      seo: {
        siteName: 'Acme',
        siteUrl: 'https://acme.example',
        description: 'Acme helps remote teams plan work clearly.',
      },
      pages: [
        {
          route: '/',
          title: 'Home',
          description: 'Acme helps remote teams plan work clearly.',
          seo: {
            title: 'Acme | Project management',
            description: 'Acme helps remote teams plan work clearly.',
          },
          aeo: {
            entitySignals: {
              brandName: 'Acme',
              category: 'Project management software',
              audience: 'Remote product teams',
              benefits: ['Fewer meetings'],
            },
          },
          sections: [
            {
              type: 'faq',
              items: [
                {
                  title: 'What is Acme?',
                  body: 'Acme is project management software.',
                },
              ],
            },
          ],
        },
        {
          route: '/pricing',
          title: 'Pricing',
          description: 'Acme pricing',
          seo: { title: 'Pricing | Acme', description: 'Acme pricing' },
        },
      ],
    }

    const home = buildStructuredData(siteSpec, siteSpec.pages[0])
    const types = home.map((entry) => entry['@type'])

    expect(types).toContain('WebSite')
    expect(types).toContain('Organization')
    expect(types).toContain('SoftwareApplication')
    expect(types).toContain('FAQPage')
    expect(types).toContain('WebPage')

    const pricing = buildStructuredData(siteSpec, siteSpec.pages[1])
    expect(pricing.some((entry) => entry['@type'] === 'BreadcrumbList')).toBe(
      true,
    )
  })
})
