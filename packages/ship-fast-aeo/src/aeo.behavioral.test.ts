import { describe, expect, it } from 'vitest'
import { parseHTML } from 'linkedom'

import { buildNextMetadata } from './metadata/build-next-metadata.ts'
import { buildPreviewSeoHead } from './metadata/build-preview-head.ts'
import {
  auditSiteSpecAeo,
  siteSpecPassesAeoAudit,
} from './validate/aeo-audit.ts'
import { extractFaqItems } from './seo/extract-faq.ts'
import { resolvePageSeo } from './seo/resolve-page-seo.ts'
import { renderBreadcrumbs } from './sections/breadcrumbs.ts'
import { renderComparisonTableSection } from './sections/comparison-table.ts'
import { renderFaqSection } from './sections/faq.ts'
import { renderFeatureListSection } from './sections/feature-list.ts'
import { renderHowItWorksSection } from './sections/how-it-works.ts'
import { renderPricingSummarySection } from './sections/pricing-summary.ts'
import { renderTestimonialsSection } from './sections/testimonials.ts'
import { renderUseCasesSection } from './sections/use-cases.ts'
import { renderWhoForSection } from './sections/who-for.ts'
import type {
  SectionLike,
  SitePageLike,
  SiteSpecLike,
} from './contracts/page-aeo.ts'

const SITE: SiteSpecLike = {
  projectName: 'KubeMeter',
  siteType: 'software',
  theme: { colors: { background: '#0b0f1a' } },
  seo: {
    siteName: 'KubeMeter',
    siteUrl: 'https://kubemeter.io',
    description: 'Kubernetes cost observability for engineering teams.',
    locale: 'en_US',
    keywords: ['kubernetes cost', 'finops', 'cloud spend'],
    ogImage: '/social/kubemeter.png',
    ogImageAlt: 'KubeMeter dashboard preview',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
  },
  pages: [
    {
      route: '/',
      title: 'KubeMeter — Kubernetes cost observability',
      description:
        'KubeMeter shows engineering teams where Kubernetes spend goes and how to cut it.',
      breadcrumbs: [{ label: 'Home', href: '/' }],
      sections: [
        {
          id: 'direct-answer',
          type: 'direct-answer',
          body: 'KubeMeter is a Kubernetes cost observability platform for engineering teams.',
          items: [
            {
              title: 'Audience',
              body: 'Platform and SRE teams running Kubernetes at scale.',
            },
          ],
        },
        {
          id: 'faq',
          type: 'faq',
          headline: 'Frequently asked questions about KubeMeter',
          items: [
            {
              title: 'What is KubeMeter?',
              body: 'A cost observability platform for Kubernetes.',
            },
            {
              title: 'How does KubeMeter work?',
              body: 'It reads cluster metrics and maps them to cloud spend.',
            },
            {
              title: 'Is KubeMeter open source?',
              body: 'The agent is open source; the dashboard is hosted.',
            },
          ],
        },
      ],
    },
    {
      route: '/pricing',
      title: 'Pricing — KubeMeter',
      description: 'Simple per-cluster pricing for teams of any size.',
      seo: { canonicalPath: '/pricing', noIndex: false },
    },
  ],
}

describe('AEO behavioral', () => {
  describe('buildPreviewSeoHead', () => {
    it('escapes generated preview head text and attributes without emitting executable markup', () => {
      const markup = buildPreviewSeoHead(
        {
          projectName: 'Acme <script>alert(1)</script>',
          seo: {
            siteName: 'Acme "quoted"',
            siteUrl: 'https://acme.test',
            description: 'Build <strong>fast</strong> & ship "safely"',
            ogImage: '/social/<bad>.png',
            ogImageAlt: 'Preview "alt" <tag>',
          },
          pages: [
            {
              route: '/',
              title: 'Home <script>alert(2)</script>',
              description: 'Trusted <copy> for teams',
              seo: {
                title: 'Custom "Title" <script>alert(3)</script>',
              },
            },
          ],
        },
        'Acme <script>alert(4)</script>',
        'Prompt <script>alert(5)</script>',
      )

      const { document: doc } = parseHTML(
        `<!doctype html><head>${markup}</head>`,
      )

      expect(doc.querySelectorAll('script')).toHaveLength(1)
      expect(
        doc.querySelector('script[type="application/ld+json"]'),
      ).toBeTruthy()
      expect(doc.querySelector('title')?.textContent).toBe(
        'Custom "Title" <script>alert(3)</script>',
      )
      expect(
        doc.querySelector('meta[name="description"]')?.getAttribute('content'),
      ).toBe('Trusted <copy> for teams')
      expect(
        doc.querySelector('meta[property="og:title"]')?.getAttribute('content'),
      ).toBe('Custom "Title" <script>alert(3)</script>')
      expect(
        doc.querySelector('meta[property="og:image"]')?.getAttribute('content'),
      ).toBe('https://acme.test/social/%3Cbad%3E.png')
      expect(markup).not.toContain('<script>alert')
      expect(markup).not.toContain('<strong>')
      expect(markup).not.toContain('<copy>')
    })

    it('generates title, description, canonical, og and twitter meta tags for a preview', () => {
      const markup = buildPreviewSeoHead(
        SITE,
        'KubeMeter',
        'Kubernetes cost observability',
      )

      expect(markup).toContain('<title>')
      expect(markup).toMatch(/KubeMeter.*Preview/i)
      expect(markup).toContain('name="description"')
      expect(markup).toContain('rel="canonical"')
      expect(markup).toContain('property="og:title"')
      expect(markup).toContain('property="og:description"')
      expect(markup).toContain('property="og:site_name"')
      expect(markup).toContain('property="og:locale"')
      expect(markup).toContain('name="twitter:card"')
      expect(markup).toContain('name="twitter:title"')
      expect(markup).toContain('name="twitter:description"')
      expect(markup).toContain('application/ld+json')
    })

    it('falls back to a synthetic home page when the spec has no pages', () => {
      const markup = buildPreviewSeoHead(
        {
          projectName: 'Acme',
          seo: { siteName: 'Acme', siteUrl: 'https://acme.test' },
        },
        'Acme',
        'Acme makes widgets',
      )
      expect(markup).toContain('<title>')
      expect(markup).toContain('Acme')
      expect(markup).toContain('rel="canonical"')
      expect(markup).toContain('https://acme.test')
    })
  })

  describe('buildNextMetadata', () => {
    it('generates a valid Next.js Metadata object from resolved SEO', () => {
      const seo = resolvePageSeo(SITE, SITE.pages![1])
      const metadata = buildNextMetadata(seo)
      expect(metadata).toBeDefined()

      expect(metadata!.title).toBe(seo.title)
      expect(metadata!.description).toBe(seo.description)
      expect(metadata!.keywords).toEqual(seo.keywords)
      expect(metadata!.alternates).toEqual({ canonical: seo.canonicalUrl })
      expect(metadata!.robots).toEqual({ index: true, follow: true })
      expect(metadata!.openGraph?.type).toBe('website')
      expect(metadata!.openGraph?.locale).toBe('en_US')
      expect(metadata!.openGraph?.url).toBe(seo.canonicalUrl)
      expect(metadata!.openGraph?.siteName).toBe('KubeMeter')
      expect(metadata!.openGraph?.images).toEqual([
        { url: seo.ogImage, alt: seo.ogImageAlt },
      ])
      expect(metadata!.twitter?.card).toBe('summary_large_image')
      expect(metadata!.twitter?.images).toEqual([seo.ogImage])
      expect(metadata!.themeColor).toBe('#0b0f1a')
    })

    it('emits a summary twitter card and no images when ogImage is absent', () => {
      const seo = resolvePageSeo(
        { projectName: 'Plain', seo: { siteUrl: 'https://plain.test' } },
        { route: '/', title: 'Plain', description: 'No image here.' },
      )
      const metadata = buildNextMetadata(seo)
      expect(metadata).toBeDefined()

      expect(metadata!.twitter?.card).toBe('summary')
      expect(metadata!.twitter?.images).toBeUndefined()
      expect(metadata!.openGraph?.images).toBeUndefined()
    })

    it('marks noindex pages with index:false, follow:false', () => {
      const seo = resolvePageSeo(
        { projectName: 'X', seo: { siteUrl: 'https://x.test' } },
        { route: '/secret', title: 'Secret', seo: { noIndex: true } },
      )
      const metadata = buildNextMetadata(seo)
      expect(metadata).toBeDefined()
      expect(metadata!.robots).toEqual({ index: false, follow: false })
    })
  })

  describe('resolvePageSeo', () => {
    it('resolves every field from site spec + page', () => {
      const seo = resolvePageSeo(SITE, SITE.pages![0])

      expect(seo.title).toBe('KubeMeter — Kubernetes cost observability')
      expect(seo.description).toContain('KubeMeter shows engineering teams')
      expect(seo.siteName).toBe('KubeMeter')
      expect(seo.siteUrl).toBe('https://kubemeter.io')
      expect(seo.routePath).toBe('/')
      expect(seo.canonicalUrl).toBe('https://kubemeter.io/')
      expect(seo.locale).toBe('en_US')
      expect(seo.htmlLang).toBe('en-US')
      expect(seo.robots).toBe('index, follow')
      expect(seo.keywords).toEqual(['kubernetes cost', 'finops', 'cloud spend'])
      expect(seo.ogImage).toBe('https://kubemeter.io/social/kubemeter.png')
      expect(seo.ogImageAlt).toBe('KubeMeter dashboard preview')
      expect(seo.twitterCard).toBe('summary_large_image')
      expect(seo.themeColor).toBe('#0b0f1a')
      expect(seo.noIndex).toBe(false)
    })

    it('joins canonical path to site url and respects page canonicalUrl override', () => {
      const seo = resolvePageSeo(SITE, SITE.pages![1])
      expect(seo.routePath).toBe('/pricing')
      expect(seo.canonicalUrl).toBe('https://kubemeter.io/pricing')
    })

    it('normalizes a bare site url and merges site + page keywords uniquely', () => {
      const seo = resolvePageSeo(
        {
          projectName: 'P',
          seo: { siteUrl: 'plain.test', keywords: ['a', 'b'] },
        },
        { route: '/x', title: 'X', seo: { keywords: ['b', 'c'] } },
      )
      expect(seo.siteUrl).toBe('https://plain.test')
      expect(seo.canonicalUrl).toBe('https://plain.test/x')
      expect(seo.keywords).toEqual(['a', 'b', 'c'])
    })

    it('returns noindex robots when page opts out', () => {
      const seo = resolvePageSeo(
        { projectName: 'P', seo: { siteUrl: 'https://p.test' } },
        { route: '/n', title: 'N', seo: { noIndex: true } },
      )
      expect(seo.robots).toBe('noindex, nofollow')
      expect(seo.noIndex).toBe(true)
    })
  })

  describe('extractFaqItems', () => {
    it('pulls FAQ items out of page sections', () => {
      const items = extractFaqItems(SITE.pages![0])
      expect(items).toHaveLength(3)
      expect(items[0]).toEqual({
        question: 'What is KubeMeter?',
        answer: 'A cost observability platform for Kubernetes.',
      })
    })

    it('drops items missing a question or answer', () => {
      const page: SitePageLike = {
        route: '/',
        sections: [
          {
            type: 'faq',
            items: [
              { title: 'Q1', body: 'A1' },
              { title: 'No answer' },
              { body: 'No question' },
              { title: '', body: '' },
            ],
          },
        ],
      }
      expect(extractFaqItems(page)).toEqual([{ question: 'Q1', answer: 'A1' }])
    })

    it('returns [] when there are no faq sections', () => {
      expect(extractFaqItems({ route: '/', sections: [] })).toEqual([])
      expect(extractFaqItems(null)).toEqual([])
    })
  })

  describe('aeo audit', () => {
    it('detects missing title and description as errors', () => {
      const issues = auditSiteSpecAeo({
        pages: [{ route: '/' }],
      })
      const codes = issues.map((i) => i.code)
      expect(codes).toContain('missing_title')
      expect(codes).toContain('missing_description')
      expect(issues.find((i) => i.code === 'missing_title')?.level).toBe(
        'error',
      )
    })

    it('warns when the home page lacks a direct-answer section', () => {
      const issues = auditSiteSpecAeo({
        projectName: 'NoDA',
        seo: { siteUrl: 'https://x.test' },
        pages: [
          {
            route: '/',
            title: 'NoDA',
            description: 'desc',
            sections: [{ type: 'faq', items: [] }],
          },
        ],
      })
      const da = issues.find((i) => i.code === 'missing_direct_answer')
      expect(da).toBeDefined()
      expect(da?.level).toBe('warn')
      expect(da?.pageRoute).toBe('/')
    })

    it('flags h1 count and missing <main> from rendered html', () => {
      const issues = auditSiteSpecAeo(
        {
          projectName: 'X',
          seo: { siteUrl: 'https://x.test' },
          pages: [
            {
              route: '/',
              title: 'X',
              description: 'd',
              sections: [{ type: 'direct-answer', body: 'd' }],
            },
          ],
        },
        { '/': '<h1>One</h1><h1>Two</h1><div>no main</div>' },
      )
      const h1 = issues.find((i) => i.code === 'h1_count')
      const main = issues.find((i) => i.code === 'missing_main')
      expect(h1?.level).toBe('error')
      expect(h1?.message).toContain('found 2')
      expect(main?.level).toBe('warn')
    })

    it('warns on thin faq sections with fewer than 3 complete items', () => {
      const issues = auditSiteSpecAeo({
        projectName: 'Thin',
        seo: { siteUrl: 'https://x.test' },
        pages: [
          {
            route: '/',
            title: 'Thin',
            description: 'd',
            sections: [
              { type: 'direct-answer', body: 'd' },
              {
                type: 'faq',
                items: [{ title: 'Q', body: 'A' }],
              },
            ],
          },
        ],
      })
      const thin = issues.find((i) => i.code === 'thin_faq')
      expect(thin).toBeDefined()
      expect(thin?.level).toBe('warn')
    })

    it('siteSpecPassesAeoAudit reports ok=false on errors and partitions warnings', () => {
      const result = siteSpecPassesAeoAudit({
        projectName: 'Broken',
        pages: [{ route: '/' }],
      })
      expect(result.ok).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(Array.isArray(result.warnings)).toBe(true)
    })

    it('passes a well-formed spec with warnings allowed', () => {
      const result = siteSpecPassesAeoAudit(SITE, {
        '/': '<main><h1>KubeMeter</h1></main>',
      })
      expect(result.errors).toEqual([])
      expect(result.ok).toBe(true)
    })
  })

  describe('section renderers', () => {
    it('breadcrumbs: renders nav > ol with links and aria-current on the last item', () => {
      const html = renderBreadcrumbs([
        { label: 'Home', href: '/' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Current' },
      ])
      expect(html).toContain('<nav class="breadcrumbs"')
      expect(html).toContain('aria-label="Breadcrumb"')
      expect(html).toContain('<ol>')
      expect(html).toContain('<a href="/">Home</a>')
      expect(html).toContain('<a href="/pricing">Pricing</a>')
      expect(html).toContain('aria-current="page"')
      expect(html).toContain('>Current</li>')
    })

    it('breadcrumbs: returns empty string for no items', () => {
      expect(renderBreadcrumbs([])).toBe('')
    })

    it('faq: renders accordion section with trigger buttons and content', () => {
      const section: SectionLike = {
        id: 'faq',
        type: 'faq',
        headline: 'FAQ headline',
        items: [
          { title: 'Q1', body: 'A1' },
          { title: 'Q2', body: 'A2' },
        ],
      }
      const html = renderFaqSection(section)
      expect(html).toContain('<section class="section faq"')
      expect(html).toContain('id="faq"')
      expect(html).toContain('data-accordion')
      expect(html).toContain('<h2>FAQ headline</h2>')
      expect(html).toContain('class="faq-item is-open"')
      expect(html).toContain('aria-expanded="true"')
      expect(html).toContain('aria-expanded="false"')
      expect(html).toContain('data-accordion-trigger')
      expect(html).toContain('data-accordion-content')
      expect(html).toContain('<h3>Q1</h3>')
      expect(html).toContain('<p>A1</p>')
    })

    it('feature-list: renders feature list items and a card grid', () => {
      const section: SectionLike = {
        id: 'features',
        type: 'feature-list',
        headline: 'Features',
        subheadline: 'Why teams choose us',
        items: [
          { title: 'Fast', body: 'Sub-second queries.' },
          { title: 'Accurate', body: 'Cent-level attribution.' },
        ],
      }
      const html = renderFeatureListSection(section)
      expect(html).toContain('<section class="section features"')
      expect(html).toContain('id="features"')
      expect(html).toContain('class="eyebrow"')
      expect(html).toContain('<h2>Features</h2>')
      expect(html).toContain('<ul class="feature-list"')
      expect(html).toContain('Fast: Sub-second queries.')
      expect(html).toContain('class="card-grid"')
      expect(html).toContain('<article class="card"')
    })

    it('how-it-works: renders an ordered list of numbered steps', () => {
      const section: SectionLike = {
        id: 'how',
        type: 'how-it-works',
        headline: 'How it works',
        items: [
          { title: 'Connect cluster', body: 'One-line install.' },
          { title: 'Map spend', body: 'Auto attribution.' },
        ],
      }
      const html = renderHowItWorksSection(section)
      expect(html).toContain('<section class="section how-it-works"')
      expect(html).toContain('<ol class="how-it-works-steps"')
      expect(html).toContain('class="step-number"')
      expect(html).toContain('1')
      expect(html).toContain('2')
      expect(html).toContain('Connect cluster')
      expect(html).toContain('Map spend')
    })

    it('pricing-summary: renders pricing cards with price and feature lists', () => {
      const section: SectionLike = {
        id: 'pricing',
        type: 'pricing-summary',
        headline: 'Pricing',
        items: [
          {
            title: 'Starter',
            price: '$29/mo',
            body: 'For small clusters.',
            features: ['1 cluster', 'Email support'],
          },
          {
            title: 'Pro',
            price: '$99/mo',
            body: 'For growing teams.',
            features: ['10 clusters', 'Slack support'],
          },
        ],
      }
      const html = renderPricingSummarySection(section)
      expect(html).toContain('<section class="section pricing"')
      expect(html).toContain('class="pricing-grid"')
      expect(html).toContain('class="pricing-card"')
      expect(html).toContain('<div class="price">$29/mo</div>')
      expect(html).toContain('<div class="price">$99/mo</div>')
      expect(html).toContain('<li>1 cluster</li>')
      expect(html).toContain('<li>Slack support</li>')
    })

    it('testimonials: renders blockquote cards with author cite', () => {
      const section: SectionLike = {
        id: 'testimonials',
        type: 'testimonials',
        headline: 'Loved by teams',
        items: [
          { quote: 'Saved us 30%.', author: 'Ada Lovelace' },
          { quote: 'Best finops tool.', author: 'Grace Hopper' },
        ],
      }
      const html = renderTestimonialsSection(section)
      expect(html).toContain('<section class="section testimonials"')
      expect(html).toContain('<blockquote class="card quote-card"')
      expect(html).toContain('cite="Ada Lovelace"')
      expect(html).toContain('“Saved us 30%.”')
      expect(html).toContain('<strong>Grace Hopper</strong>')
    })

    it('use-cases: renders use-case cards in a grid', () => {
      const section: SectionLike = {
        id: 'use-cases',
        type: 'use-cases',
        headline: 'Use cases',
        items: [
          { title: 'Cost allocation', body: 'Charge back teams accurately.' },
          { title: 'Rightsizing', body: 'Find idle workloads.' },
        ],
      }
      const html = renderUseCasesSection(section)
      expect(html).toContain('<section class="section use-cases"')
      expect(html).toContain('class="card-grid"')
      expect(html).toContain('class="card use-case-card"')
      expect(html).toContain('Cost allocation')
      expect(html).toContain('Find idle workloads.')
    })

    it('who-for: renders a list of audience bullets', () => {
      const section: SectionLike = {
        id: 'who-for',
        type: 'who-for',
        headline: 'Who is KubeMeter for?',
        items: [
          { title: 'Platform engineers', body: 'Own cluster cost.' },
          { title: 'FinOps teams', body: 'Report on Kubernetes spend.' },
        ],
      }
      const html = renderWhoForSection(section)
      expect(html).toContain('<section class="section who-for"')
      expect(html).toContain('<ul class="who-for-list"')
      expect(html).toContain('<strong>Platform engineers</strong>')
      expect(html).toContain('FinOps teams')
    })

    it('comparison-table: renders a table with columns and rows', () => {
      const section: SectionLike = {
        id: 'comparison',
        type: 'comparison-table',
        headline: 'KubeMeter vs others',
        columns: [{ title: 'KubeMeter', highlight: true }, { title: 'Legacy' }],
        rows: [
          { label: 'Real-time', values: ['Yes', 'No'] },
          { label: 'Namespace split', values: ['Yes', 'Partial'] },
        ],
      }
      const html = renderComparisonTableSection(section)
      expect(html).toContain('<section class="section comparison"')
      expect(html).toContain('<table class="comparison-table"')
      expect(html).toContain('<caption')
      expect(html).toContain('<th scope="col">Feature</th>')
      expect(html).toContain('<th scope="col">KubeMeter</th>')
      expect(html).toContain('<th scope="row">Real-time</th>')
      expect(html).toContain('<td>Yes</td>')
      expect(html).toContain('<td>Partial</td>')
    })

    it('comparison-table: derives columns and rows from items when omitted', () => {
      const section: SectionLike = {
        type: 'comparison-table',
        items: [
          { title: 'Col A', body: 'val A' },
          { title: 'Col B', body: 'val B' },
        ],
      }
      const html = renderComparisonTableSection(section)
      expect(html).toContain('<th scope="col">Col A</th>')
      expect(html).toContain('<th scope="row">Col A</th>')
      expect(html).toContain('<td>val A</td>')
    })
  })
})
