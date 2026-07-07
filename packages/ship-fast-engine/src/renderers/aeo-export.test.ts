import { describe, expect, it } from 'vitest'
import { renderHtmlProject } from './html/index'
import { renderNextProject } from './nextjs/index'
import { renderReactProject } from './react/index'

describe('renderHtmlProject AEO export', () => {
  const createSiteSpec = () => ({
    projectName: 'Acme',
    siteType: 'saas',
    generatedTimestamp: new Date().toISOString(),
    exportableFrameworks: ['html'],
    version: '1.0.0',
    seo: {
      siteName: 'Acme',
      siteUrl: 'https://acme.example',
      description: 'Acme helps remote teams plan work clearly.',
    },
    theme: {
      colors: {
        primary: '#4f46e5',
        secondary: '#312e81',
        accent: '#818cf8',
        background: '#09090b',
        surface: '#18181b',
        text: '#fafafa',
        mutedText: '#a1a1aa',
        border: '#27272a',
      },
      typography: { heading: 'Inter', body: 'Inter' },
      radius: { sm: '0.5rem', md: '0.75rem', lg: '1rem' },
      spacing: { sectionY: '4rem', container: '72rem', gap: '1.5rem' },
    },
    pages: [
      {
        id: 'home',
        name: 'Home',
        route: '/',
        title: 'Home',
        description: 'Acme helps remote teams plan work clearly.',
        layoutType: 'marketing',
        seo: {
          title: 'Acme | Project management',
          description: 'Acme helps remote teams plan work clearly.',
          canonicalPath: '/',
        },
        aeo: {
          objective: 'Explain what Acme does',
          targetIntent: 'evaluate project management software',
          suggestedQueries: ['what is acme', 'who is acme for'],
          entitySignals: {
            brandName: 'Acme',
            category: 'Project management software',
            audience: 'Remote product teams',
          },
        },
        sections: [
          {
            id: 'nav',
            type: 'navbar',
            variant: 'default',
            headline: 'Acme',
            links: [{ label: 'Home', href: '/' }],
          },
          {
            id: 'hero',
            type: 'hero',
            variant: 'default',
            headline: 'Plan work with clarity',
            body: 'Acme gives remote teams a shared view of priorities and delivery.',
          },
          {
            id: 'answer',
            type: 'direct-answer',
            variant: 'default',
            body: 'Acme is project management software for remote product teams that need clearer planning and fewer status meetings.',
            items: [{ title: 'Audience', body: 'Remote product teams' }],
          },
          {
            id: 'faq',
            type: 'faq',
            variant: 'accordion',
            headline: 'Frequently asked questions',
            items: [
              {
                title: 'What is Acme?',
                body: 'Acme is project management software for remote teams.',
              },
              {
                title: 'Who is Acme for?',
                body: 'Product teams that need clearer planning.',
              },
              {
                title: 'Why choose Acme?',
                body: 'It reduces coordination overhead with clear ownership.',
              },
            ],
          },
          {
            id: 'footer',
            type: 'footer',
            variant: 'default',
            headline: 'Acme',
          },
        ],
      },
    ],
  })

  it('renders semantic main landmark, llms.txt link, and direct-answer section', () => {
    const { files } = renderHtmlProject(createSiteSpec())
    const html = files['index.html']

    expect(html).toContain('<main id="main-content">')
    expect(html).toContain('href="/llms.txt"')
    expect(html).toContain('class="direct-answer"')
    expect(html).toContain('FAQPage')
    expect(html).toContain('SoftwareApplication')
    expect(html).toContain('Organization')
  })

  it('advertises llms.txt in React exports', () => {
    const { files } = renderReactProject(createSiteSpec())

    expect(files['public/llms.txt']).toContain('# Acme')
    expect(files['index.html']).toContain('href="/llms.txt"')
  })

  it('advertises llms.txt in Next.js exports', () => {
    const { files } = renderNextProject(createSiteSpec(), {})

    expect(files['app/llms.txt/route.js']).toContain('text/plain')
    expect(files['app/layout.jsx']).toContain('href="/llms.txt"')
  })
})
