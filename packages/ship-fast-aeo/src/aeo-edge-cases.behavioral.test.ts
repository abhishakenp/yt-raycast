// @vitest-environment jsdom

/**
 * Behavioral edge-case coverage for AEO structured-data build, section
 * renderers, resolvePageSeo, extractFaqItems, aeo-audit, and enrich-aeo.
 *
 * Philosophy: assert EXPECTED/CORRECT behavior. If the implementation is
 * buggy, the test MUST fail — current behavior is never pinned. Section
 * renderers are verified by parsing the emitted HTML into a DOM and asserting
 * on structure via querySelector (no source-string assertions). Structured
 * data is asserted as parsed objects. Runs under jsdom so DOMParser is
 * available; no jest-dom matchers are used.
 */

import { describe, expect, it } from 'vitest'

import { buildStructuredData } from './structured-data/build.ts'
import {
  auditSiteSpecAeo,
  siteSpecPassesAeoAudit,
} from './validate/aeo-audit.ts'
import { extractFaqItems } from './seo/extract-faq.ts'
import { resolvePageSeo } from './seo/resolve-page-seo.ts'
import { enrichSiteSpecAeo } from './compatibility/enrich-aeo.ts'
import { renderBreadcrumbs } from './sections/breadcrumbs.ts'
import { renderComparisonTableSection } from './sections/comparison-table.ts'
import { renderDirectAnswerSection } from './sections/direct-answer.ts'
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

function parseHtml(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html')
}

function findEntry(entries: Record<string, unknown>[], type: string) {
  return entries.find((entry) => entry['@type'] === type)
}

const BUSINESS_SITE: SiteSpecLike = {
  projectName: 'Acme Co',
  siteType: 'landing',
  seo: {
    siteName: 'Acme Co',
    siteUrl: 'https://acme.example',
    description: 'Acme Co delivers consulting services.',
    ogImage: '/social/acme.png',
    logo: 'https://acme.example/logo.png',
  },
  pages: [],
}

const SOFTWARE_SITE: SiteSpecLike = {
  projectName: 'KubeMeter',
  siteType: 'software',
  seo: {
    siteName: 'KubeMeter',
    siteUrl: 'https://kubemeter.io',
    description: 'Kubernetes cost observability.',
  },
  pages: [
    {
      route: '/',
      title: 'KubeMeter',
      aeo: {
        entitySignals: {
          brandName: 'KubeMeter',
          category: 'Finops platform',
          benefits: ['Reduce spend', 'Forecast cost'],
          useCases: ['Cluster sizing'],
          contact: { email: 'hello@kubemeter.io' },
        },
      },
    },
  ],
}

const COMMERCE_SITE: SiteSpecLike = {
  projectName: 'Shoply',
  siteType: 'ecommerce',
  seo: {
    siteName: 'Shoply',
    siteUrl: 'https://shoply.example',
    description: 'Buy widgets online.',
  },
  pages: [
    {
      route: '/products/widget',
      title: 'Widget',
      sections: [
        {
          id: 'product-detail',
          type: 'product-detail',
          items: [{ title: 'Widget', body: 'A fine widget.', price: '29.99' }],
        },
      ],
    },
  ],
}

describe('structured data edge cases', () => {
  it('1. Organization schema: name, url, and logo (missing logo is a BUG)', () => {
    const page: SitePageLike = { route: '/about', title: 'About Acme Co' }
    const entries = buildStructuredData(BUSINESS_SITE, page)
    const org = findEntry(entries, 'Organization')
    expect(org).toBeTruthy()
    expect(org?.name).toBe('Acme Co')
    expect(org?.url).toBe('https://acme.example')
    // A Organization schema SHOULD include a logo. If missing, that's a bug.
    expect(org?.logo).toBe('https://acme.example/logo.png')
  })

  it('2. WebSite schema: name, url, and potentialAction SearchAction (missing is a BUG)', () => {
    const entries = buildStructuredData(BUSINESS_SITE, { route: '/' })
    const website = findEntry(entries, 'WebSite')
    expect(website).toBeTruthy()
    expect(website?.name).toBe('Acme Co')
    expect(website?.url).toBe('https://acme.example')
    // A WebSite schema SHOULD expose a SearchAction potentialAction. If
    // missing, that's a bug.
    expect(website?.potentialAction).toMatchObject({
      '@type': 'SearchAction',
      target: expect.any(Object),
    })
  })

  it('3. SoftwareApplication schema: name, applicationCategory, offers', () => {
    const home = SOFTWARE_SITE.pages?.[0]
    const entries = buildStructuredData(SOFTWARE_SITE, home!)
    const app = findEntry(entries, 'SoftwareApplication')
    expect(app).toBeTruthy()
    expect(app?.name).toBe('KubeMeter')
    expect(app?.applicationCategory).toBe('Finops platform')
    expect(app?.offers).toMatchObject({
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    })
  })

  it('4. FAQPage schema: mainEntity questions with acceptedAnswer', () => {
    const page: SitePageLike = {
      route: '/help',
      title: 'Help',
      sections: [
        {
          id: 'faq',
          type: 'faq',
          items: [
            { title: 'What is Acme?', body: 'A consultancy.' },
            { title: 'How does it work?', body: 'Clear plans.' },
          ],
        },
      ],
    }
    const entries = buildStructuredData(BUSINESS_SITE, page)
    const faq = findEntry(entries, 'FAQPage')
    expect(faq).toBeTruthy()
    expect(Array.isArray(faq?.mainEntity)).toBe(true)
    expect(faq?.mainEntity).toHaveLength(2)
    expect((faq?.mainEntity as unknown[])[0]).toMatchObject({
      '@type': 'Question',
      name: 'What is Acme?',
      acceptedAnswer: { '@type': 'Answer', text: 'A consultancy.' },
    })
  })

  it('5. BreadcrumbList schema: itemListElement with positions', () => {
    const page: SitePageLike = {
      route: '/products/widget',
      title: 'Widget',
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Widget', href: '/products/widget' },
      ],
    }
    const entries = buildStructuredData(BUSINESS_SITE, page)
    const crumbs = findEntry(entries, 'BreadcrumbList')
    expect(crumbs).toBeTruthy()
    expect(crumbs?.itemListElement).toHaveLength(3)
    expect((crumbs?.itemListElement as unknown[])[0]).toMatchObject({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
    })
    expect(
      ((crumbs?.itemListElement as unknown[])[2] as Record<string, unknown>)
        .name,
    ).toBe('Widget')
  })

  it('6. Article schema: blog post emits Article with headline, author, datePublished (WebPage-only is a BUG)', () => {
    const blogSite: SiteSpecLike = {
      ...BUSINESS_SITE,
      siteType: 'blog',
      pages: [
        {
          route: '/posts/launch',
          title: 'Launch day',
          description: 'We launched our product.',
          sections: [{ id: 'post', type: 'article', body: 'We launched.' }],
        },
      ],
    }
    const page = blogSite.pages![0]
    const entries = buildStructuredData(blogSite, page)
    // A blog post SHOULD emit Article schema. Emitting only WebPage is a bug.
    const article = findEntry(entries, 'Article')
    expect(article).toBeTruthy()
    expect(article?.headline).toBe('Launch day')
    expect(article?.author).toBeTruthy()
    expect(article?.datePublished).toBeTruthy()
  })

  it('7. Product schema: name, offers, price, brand', () => {
    const page = COMMERCE_SITE.pages![0]
    const entries = buildStructuredData(COMMERCE_SITE, page)
    const product = findEntry(entries, 'Product')
    expect(product).toBeTruthy()
    expect(product?.name).toBe('Widget')
    expect(product?.offers).toMatchObject({
      '@type': 'Offer',
      price: '29.99',
      priceCurrency: 'USD',
    })
    expect(product?.brand).toMatchObject({ '@type': 'Brand', name: 'Shoply' })
  })

  it('8. inferBreadcrumbs: /products/item infers [Home, Products, Item]', () => {
    const page: SitePageLike = { route: '/products/item', title: 'Item' }
    const entries = buildStructuredData(BUSINESS_SITE, page)
    const crumbs = findEntry(entries, 'BreadcrumbList')
    expect(crumbs).toBeTruthy()
    const names = (crumbs?.itemListElement as unknown[]).map(
      (el: unknown) => (el as Record<string, unknown>).name,
    )
    expect(names).toEqual(['Home', 'Products', 'Item'])
  })

  it('9. entitySignals: software site yields SoftwareApplication; commerce yields Product', () => {
    const swEntries = buildStructuredData(
      SOFTWARE_SITE,
      SOFTWARE_SITE.pages?.[0] ?? SOFTWARE_SITE.pages![0],
    )
    expect(findEntry(swEntries, 'SoftwareApplication')).toBeTruthy()
    expect(
      findEntry(swEntries, 'SoftwareApplication')?.applicationCategory,
    ).toBe('Finops platform')

    const coEntries = buildStructuredData(
      COMMERCE_SITE,
      COMMERCE_SITE.pages?.[0] ?? COMMERCE_SITE.pages![0],
    )
    expect(findEntry(coEntries, 'SoftwareApplication')).toBeUndefined()
    expect(findEntry(coEntries, 'Product')).toBeTruthy()
  })

  it('10. Multiple schema types emitted on the same page', () => {
    const page: SitePageLike = {
      route: '/help',
      title: 'Help',
      sections: [
        {
          id: 'faq',
          type: 'faq',
          items: [
            { title: 'Q1', body: 'A1' },
            { title: 'Q2', body: 'A2' },
          ],
        },
      ],
    }
    const entries = buildStructuredData(BUSINESS_SITE, page)
    expect(findEntry(entries, 'Organization')).toBeTruthy()
    expect(findEntry(entries, 'WebPage')).toBeTruthy()
    expect(findEntry(entries, 'FAQPage')).toBeTruthy()
  })
})

describe('section renderer edge cases', () => {
  it('11. Breadcrumbs: nav with ol/li, last item current', () => {
    const doc = parseHtml(
      renderBreadcrumbs([
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Widget', href: '/products/widget' },
      ]),
    )
    const nav = doc.querySelector('nav.breadcrumbs')
    expect(nav).not.toBeNull()
    expect(nav?.getAttribute('aria-label')).toBe('Breadcrumb')
    const items = doc.querySelectorAll('nav.breadcrumbs ol > li')
    expect(items).toHaveLength(3)
    // first two are links
    expect(items[0].querySelector('a')?.getAttribute('href')).toBe('/')
    expect(items[1].querySelector('a')?.getAttribute('href')).toBe('/products')
    // last item is current page, no anchor
    expect(items[2].getAttribute('aria-current')).toBe('page')
    expect(items[2].querySelector('a')).toBeNull()
    expect(items[2].textContent?.trim()).toBe('Widget')
  })

  it('12. Comparison table: correct rows/cols', () => {
    const section: SectionLike = {
      id: 'compare',
      type: 'comparison',
      headline: 'Compare',
      columns: [
        { title: 'Basic' },
        { title: 'Pro', highlight: true },
        { title: 'Enterprise' },
      ],
      rows: [
        { label: 'Speed', values: ['1x', '2x', '4x'] },
        { label: 'Seats', values: ['1', '5', '20'] },
        { label: 'Support', values: ['email', 'priority', 'dedicated'] },
        { label: 'SLA', values: ['none', '99%', '99.9%'] },
      ],
    }
    const doc = parseHtml(renderComparisonTableSection(section))
    const table = doc.querySelector('table.comparison-table')
    expect(table).not.toBeNull()
    // 1 hardcoded "Feature" header + 3 product columns = 4 column headers
    const colHeaders = doc.querySelectorAll('thead th[scope="col"]')
    expect(colHeaders).toHaveLength(4)
    expect(colHeaders[0].textContent?.trim()).toBe('Feature')
    expect(colHeaders[1].textContent?.trim()).toBe('Basic')
    expect(colHeaders[3].textContent?.trim()).toBe('Enterprise')
    // 4 feature rows
    const bodyRows = doc.querySelectorAll('tbody tr')
    expect(bodyRows).toHaveLength(4)
    // first row: row header "Speed" + 3 value cells
    const firstCells = bodyRows[0].querySelectorAll('th[scope="row"], td')
    expect(firstCells[0].textContent?.trim()).toBe('Speed')
    expect(firstCells).toHaveLength(4)
    expect(firstCells[3].textContent?.trim()).toBe('4x')
  })

  it('13. Direct answer: answer text present, no h1', () => {
    const doc = parseHtml(
      renderDirectAnswerSection({
        id: 'direct-answer',
        type: 'direct-answer',
        body: 'Acme helps teams ship faster.',
        items: [{ title: 'Audience', body: 'Product teams' }],
      }),
    )
    const section = doc.querySelector('section.direct-answer')
    expect(section).not.toBeNull()
    expect(section?.getAttribute('aria-label')).toBe('Overview')
    expect(section?.textContent).toContain('Acme helps teams ship faster.')
    const whoFor = section?.querySelector('.who-for')
    expect(whoFor).not.toBeNull()
    expect(whoFor?.textContent).toContain('Who this is for')
    expect(whoFor?.textContent).toContain('Product teams')
    // a direct-answer section must not introduce its own h1
    expect(doc.querySelectorAll('h1')).toHaveLength(0)
  })

  it('14. FAQ: Q&A structure with question + answer per item', () => {
    const items = Array.from({ length: 5 }, (_, i) => ({
      title: `Question ${i + 1}`,
      body: `Answer ${i + 1}`,
    }))
    const doc = parseHtml(
      renderFaqSection({
        id: 'faq',
        type: 'faq',
        headline: 'FAQ',
        items,
      }),
    )
    const section = doc.querySelector('section.faq')
    expect(section).not.toBeNull()
    expect(section?.getAttribute('data-accordion')).not.toBeNull()
    const faqItems = doc.querySelectorAll('article.faq-item')
    expect(faqItems).toHaveLength(5)
    // each item pairs a question heading with an answer body
    expect(faqItems[0].querySelector('h3')?.textContent).toContain('Question 1')
    expect(faqItems[0].querySelector('.faq-content p')?.textContent).toBe(
      'Answer 1',
    )
    expect(faqItems[4].querySelector('.faq-content p')?.textContent).toBe(
      'Answer 5',
    )
    // first item is open by default
    expect(faqItems[0].classList.contains('is-open')).toBe(true)
    expect(
      faqItems[0].querySelector('.faq-trigger')?.getAttribute('aria-expanded'),
    ).toBe('true')
  })

  it('15. Feature list: feature items rendered', () => {
    const items = Array.from({ length: 6 }, (_, i) => ({
      title: `Feature ${i + 1}`,
      body: `Detail ${i + 1}`,
    }))
    const doc = parseHtml(
      renderFeatureListSection({
        id: 'features',
        type: 'features',
        headline: 'Features',
        items,
      }),
    )
    const section = doc.querySelector('section.features')
    expect(section).not.toBeNull()
    const listItems = doc.querySelectorAll('ul.feature-list > li')
    expect(listItems).toHaveLength(6)
    expect(listItems[5].textContent).toContain('Feature 6')
    expect(listItems[5].textContent).toContain('Detail 6')
    const cards = doc.querySelectorAll('.card-grid article.card')
    expect(cards).toHaveLength(6)
  })

  it('16. How it works: numbered steps', () => {
    const items = Array.from({ length: 4 }, (_, i) => ({
      title: `Step ${i + 1}`,
      body: `Do ${i + 1}`,
    }))
    const doc = parseHtml(
      renderHowItWorksSection({
        id: 'how-it-works',
        type: 'how-it-works',
        headline: 'How it works',
        items,
      }),
    )
    const section = doc.querySelector('section.how-it-works')
    expect(section).not.toBeNull()
    const steps = doc.querySelectorAll('ol.how-it-works-steps > li')
    expect(steps).toHaveLength(4)
    const stepNumbers = doc.querySelectorAll('.step-number')
    expect(stepNumbers).toHaveLength(4)
    expect(stepNumbers[0].textContent?.trim()).toBe('1')
    expect(stepNumbers[3].textContent?.trim()).toBe('4')
    expect(steps[0].querySelector('article h3')?.textContent).toContain(
      'Step 1',
    )
  })

  it('17. Pricing: price cards', () => {
    const items = [
      { title: 'Basic', price: '$0', body: 'Free', features: ['a', 'b'] },
      {
        title: 'Pro',
        price: '$29',
        body: 'For teams',
        features: ['a', 'b', 'c'],
      },
      {
        title: 'Enterprise',
        price: 'Custom',
        body: 'Custom',
        features: ['all'],
      },
    ]
    const doc = parseHtml(
      renderPricingSummarySection({
        id: 'pricing',
        type: 'pricing',
        headline: 'Pricing',
        items,
      }),
    )
    const section = doc.querySelector('section.pricing')
    expect(section).not.toBeNull()
    const cards = doc.querySelectorAll('article.pricing-card')
    expect(cards).toHaveLength(3)
    expect(cards[0].querySelector('h3')?.textContent).toBe('Basic')
    expect(cards[1].querySelector('.price')?.textContent).toBe('$29')
    expect(cards[2].querySelector('.price')?.textContent).toBe('Custom')
    // feature lists inside cards
    const proFeatures = cards[1].querySelectorAll('ul li')
    expect(proFeatures).toHaveLength(3)
  })

  it('18. Testimonials: review cards', () => {
    const items = [
      { quote: 'Great', author: 'Alice' },
      { quote: 'Good', author: 'Bob' },
      { quote: 'Ok', author: 'Carol' },
    ]
    const doc = parseHtml(
      renderTestimonialsSection({
        id: 'testimonials',
        type: 'testimonials',
        headline: 'Reviews',
        items,
      }),
    )
    const section = doc.querySelector('section.testimonials')
    expect(section).not.toBeNull()
    const quotes = doc.querySelectorAll('blockquote.quote-card')
    expect(quotes).toHaveLength(3)
    expect(quotes[0].querySelector('p')?.textContent).toContain('Great')
    expect(quotes[0].querySelector('footer strong')?.textContent).toBe('Alice')
    expect(quotes[2].querySelector('footer strong')?.textContent).toBe('Carol')
    expect(quotes[0].getAttribute('cite')).toBe('Alice')
  })

  it('19. Use cases: items', () => {
    const items = Array.from({ length: 4 }, (_, i) => ({
      title: `Use case ${i + 1}`,
      body: `For ${i + 1}`,
    }))
    const doc = parseHtml(
      renderUseCasesSection({
        id: 'use-cases',
        type: 'use-cases',
        headline: 'Use cases',
        items,
      }),
    )
    const section = doc.querySelector('section.use-cases')
    expect(section).not.toBeNull()
    const cards = doc.querySelectorAll('article.use-case-card')
    expect(cards).toHaveLength(4)
    expect(cards[3].querySelector('h3')?.textContent).toBe('Use case 4')
    expect(cards[3].querySelector('p')?.textContent).toBe('For 4')
  })

  it('20. Who for: audience cards/list', () => {
    const items = [
      { title: 'Devs', body: 'Ship faster' },
      { title: 'PMs', body: 'Plan clearly' },
      { title: 'Founders', body: 'Launch' },
    ]
    const doc = parseHtml(
      renderWhoForSection({
        id: 'who-for',
        type: 'who-for',
        headline: 'Who for',
        items,
      }),
    )
    const section = doc.querySelector('section.who-for')
    expect(section).not.toBeNull()
    const lis = doc.querySelectorAll('ul.who-for-list > li')
    expect(lis).toHaveLength(3)
    expect(lis[2].querySelector('strong')?.textContent).toBe('Founders')
    expect(lis[2].textContent).toContain('Launch')
  })

  it('21. Empty input: each renderer handles empty data gracefully (no crash)', () => {
    // breadcrumbs with no items returns empty string
    expect(renderBreadcrumbs([])).toBe('')
    const empty: SectionLike = { type: 'empty', items: [] }
    // every renderer must not throw on empty input
    expect(() => parseHtml(renderComparisonTableSection(empty))).not.toThrow()
    expect(() => parseHtml(renderDirectAnswerSection(empty))).not.toThrow()
    expect(() => parseHtml(renderFaqSection(empty))).not.toThrow()
    expect(() => parseHtml(renderFeatureListSection(empty))).not.toThrow()
    expect(() => parseHtml(renderHowItWorksSection(empty))).not.toThrow()
    expect(() => parseHtml(renderPricingSummarySection(empty))).not.toThrow()
    expect(() => parseHtml(renderTestimonialsSection(empty))).not.toThrow()
    expect(() => parseHtml(renderUseCasesSection(empty))).not.toThrow()
    expect(() => parseHtml(renderWhoForSection(empty))).not.toThrow()
    // empty renders still produce a section shell (except breadcrumbs)
    expect(
      parseHtml(renderFaqSection(empty)).querySelector('section.faq'),
    ).not.toBeNull()
    expect(
      parseHtml(renderPricingSummarySection(empty)).querySelector(
        'section.pricing',
      ),
    ).not.toBeNull()
  })
})

describe('seo edge cases', () => {
  it('22. ogImage: page ogImage set; without → site default', () => {
    const withImage = resolvePageSeo(BUSINESS_SITE, {
      route: '/about',
      seo: { ogImage: '/social/about.png' },
    })
    expect(withImage.ogImage).toBe('https://acme.example/social/about.png')

    const withoutImage = resolvePageSeo(BUSINESS_SITE, { route: '/about' })
    expect(withoutImage.ogImage).toBe('https://acme.example/social/acme.png')
  })

  it('23. noindex page → robots noindex; normal → index, follow', () => {
    const noindex = resolvePageSeo(BUSINESS_SITE, {
      route: '/private',
      seo: { noIndex: true },
    })
    expect(noindex.robots).toBe('noindex, nofollow')
    expect(noindex.noIndex).toBe(true)

    const normal = resolvePageSeo(BUSINESS_SITE, { route: '/about' })
    expect(normal.robots).toBe('index, follow')
    expect(normal.noIndex).toBe(false)
  })

  it('24. canonical URL override used over computed', () => {
    const resolved = resolvePageSeo(BUSINESS_SITE, {
      route: '/about',
      seo: { canonicalUrl: 'https://canonical.example/about' },
    })
    expect(resolved.canonicalUrl).toBe('https://canonical.example/about')

    const computed = resolvePageSeo(BUSINESS_SITE, { route: '/about' })
    expect(computed.canonicalUrl).toBe('https://acme.example/about')
  })

  it('25. extractFaqItems: with FAQ sections → items; without → empty', () => {
    const withFaq: SitePageLike = {
      route: '/help',
      sections: [
        {
          id: 'faq',
          type: 'faq',
          items: [
            { title: 'Q1', body: 'A1' },
            { title: 'Q2', body: 'A2' },
          ],
        },
      ],
    }
    expect(extractFaqItems(withFaq)).toHaveLength(2)

    const withoutFaq: SitePageLike = {
      route: '/about',
      sections: [{ id: 'hero', type: 'hero' }],
    }
    expect(extractFaqItems(withoutFaq)).toEqual([])
    expect(extractFaqItems(null)).toEqual([])
  })

  it('26. extractFaqItems: incomplete Q (no A) → dropped', () => {
    const page: SitePageLike = {
      route: '/help',
      sections: [
        {
          id: 'faq',
          type: 'faq',
          items: [
            { title: 'Has answer', body: 'Yes' },
            { title: 'No answer', body: '' },
            { title: '', body: 'No question' },
          ],
        },
      ],
    }
    const items = extractFaqItems(page)
    expect(items).toHaveLength(1)
    expect(items[0].question).toBe('Has answer')
    expect(items[0].answer).toBe('Yes')
  })
})

describe('aeo audit edge cases', () => {
  // Bare spec with no projectName/seo fallbacks so title/description are
  // truly missing.
  function specWith(pages: SitePageLike[]): SiteSpecLike {
    return { siteType: 'landing', seo: { siteUrl: 'https://x.example' }, pages }
  }

  it('27. Missing title → error', () => {
    const issues = auditSiteSpecAeo(
      specWith([{ route: '/x', description: 'd' }]),
    )
    expect(
      issues.some((i) => i.code === 'missing_title' && i.level === 'error'),
    ).toBe(true)
  })

  it('28. Missing description → error', () => {
    const issues = auditSiteSpecAeo(
      specWith([{ route: '/x', title: 'Has title' }]),
    )
    expect(
      issues.some(
        (i) => i.code === 'missing_description' && i.level === 'error',
      ),
    ).toBe(true)
  })

  it('29. Missing direct-answer on home → warning', () => {
    const issues = auditSiteSpecAeo(
      specWith([
        {
          route: '/',
          title: 'Home',
          description: 'Desc',
          sections: [{ id: 'hero', type: 'hero' }],
        },
      ]),
    )
    expect(
      issues.some(
        (i) => i.code === 'missing_direct_answer' && i.level === 'warn',
      ),
    ).toBe(true)
  })

  it('30. Multiple h1 → SHOULD be error (warn-only is a BUG)', () => {
    // More than one h1 is a structural error. If the audit only warns, that
    // is a bug — this test must fail until the audit treats it as an error.
    const multi = auditSiteSpecAeo(
      specWith([
        {
          route: '/',
          title: 'Home',
          description: 'Desc',
          sections: [{ id: 'direct-answer', type: 'direct-answer' }],
        },
      ]),
      { '/': '<main><h1>A</h1><h1>B</h1></main>' },
    )
    const h1Issue = multi.find((i) => i.code === 'h1_count')
    expect(h1Issue).toBeTruthy()
    expect(h1Issue?.level).toBe('error')

    // zero h1 is also an error
    const zero = auditSiteSpecAeo(
      specWith([
        {
          route: '/',
          title: 'Home',
          description: 'Desc',
          sections: [{ id: 'direct-answer', type: 'direct-answer' }],
        },
      ]),
      { '/': '<main></main>' },
    )
    const zeroIssue = zero.find((i) => i.code === 'h1_count')
    expect(zeroIssue?.level).toBe('error')
  })

  it('31. Missing main → warning', () => {
    const issues = auditSiteSpecAeo(
      specWith([
        {
          route: '/',
          title: 'Home',
          description: 'Desc',
          sections: [{ id: 'direct-answer', type: 'direct-answer' }],
        },
      ]),
      { '/': '<h1>Home</h1><div>content</div>' },
    )
    expect(
      issues.some((i) => i.code === 'missing_main' && i.level === 'warn'),
    ).toBe(true)
  })

  it('32. Thin FAQ (1 item) → warning', () => {
    const issues = auditSiteSpecAeo(
      specWith([
        {
          route: '/',
          title: 'Home',
          description: 'Desc',
          sections: [
            { id: 'direct-answer', type: 'direct-answer' },
            {
              id: 'faq',
              type: 'faq',
              items: [{ title: 'Only one', body: 'A' }],
            },
          ],
        },
      ]),
    )
    expect(
      issues.some((i) => i.code === 'thin_faq' && i.level === 'warn'),
    ).toBe(true)
  })

  it('33. Clean spec → passes, no errors/warnings', () => {
    const clean = specWith([
      {
        route: '/',
        title: 'Home',
        description: 'A clean home page.',
        sections: [
          { id: 'direct-answer', type: 'direct-answer' },
          {
            id: 'faq',
            type: 'faq',
            items: [
              { title: 'Q1', body: 'A1' },
              { title: 'Q2', body: 'A2' },
              { title: 'Q3', body: 'A3' },
            ],
          },
        ],
      },
    ])
    const html = {
      '/': '<main><h1>Home</h1><section class="direct-answer"></section></main>',
    }
    const result = siteSpecPassesAeoAudit(clean, html, {
      allowWarnings: false,
    })
    expect(result.errors).toEqual([])
    expect(result.warnings).toEqual([])
    expect(result.ok).toBe(true)
  })
})

describe('enrich aeo edge cases', () => {
  it('34. Legacy spec without AEO fields → enriched with defaults', () => {
    const legacy: SiteSpecLike = {
      projectName: 'LegacyCo',
      siteType: 'software',
      pages: [{ route: '/', title: 'Home' }],
    }
    const enriched = enrichSiteSpecAeo(legacy, 'A tool for devs')
    expect(enriched.seo?.siteName).toBe('LegacyCo')
    expect(enriched.seo?.title).toBeTruthy()
    const home = enriched.pages?.find((p) => p.route === '/')
    expect(home?.aeo).toBeTruthy()
    expect(home?.aeo?.entitySignals?.brandName).toBe('LegacyCo')
    expect(home?.aeo?.suggestedQueries?.length).toBeGreaterThan(0)
    // home page gets a direct-answer + faq injected
    expect(home?.sections?.some((s) => s.type === 'direct-answer')).toBe(true)
    expect(home?.sections?.some((s) => s.type === 'faq')).toBe(true)
  })

  it('35. Modern spec → preserved (category SHOULD be preserved, not overwritten)', () => {
    const modern: SiteSpecLike = {
      projectName: 'ModernCo',
      siteType: 'software',
      seo: {
        siteName: 'ModernCo',
        siteUrl: 'https://modern.example',
        title: 'ModernCo | Custom Title',
        description: 'Custom description',
        keywords: ['custom'],
        ogImage: '/custom.png',
        locale: 'en_US',
        robots: 'index, follow',
      },
      pages: [
        {
          route: '/',
          title: 'Home',
          description: 'Page desc',
          aeo: {
            objective: 'Custom objective',
            targetIntent: 'custom intent',
            suggestedQueries: ['custom query'],
            entitySignals: {
              brandName: 'ModernCo',
              category: 'Custom category',
              audience: 'Custom audience',
              useCases: ['custom use case'],
              benefits: ['custom benefit'],
            },
          },
          sections: [
            { id: 'direct-answer', type: 'direct-answer', body: 'Custom DA' },
            {
              id: 'faq',
              type: 'faq',
              items: [
                { title: 'CQ1', body: 'CA1' },
                { title: 'CQ2', body: 'CA2' },
                { title: 'CQ3', body: 'CA3' },
              ],
            },
          ],
        },
      ],
    }
    const enriched = enrichSiteSpecAeo(modern, 'A tool')
    expect(enriched.seo?.title).toBe('ModernCo | Custom Title')
    expect(enriched.seo?.description).toBe('Custom description')
    const home = enriched.pages?.find((p) => p.route === '/')
    // AEO fields preserved
    expect(home?.aeo?.objective).toBe('Custom objective')
    expect(home?.aeo?.targetIntent).toBe('custom intent')
    expect(home?.aeo?.suggestedQueries).toEqual(['custom query'])
    // category SHOULD be preserved, not overwritten by re-inference.
    // If enrich overwrites it, that's a bug — this test must fail.
    expect(home?.aeo?.entitySignals?.category).toBe('Custom category')
    expect(home?.aeo?.entitySignals?.brandName).toBe('ModernCo')
    expect(home?.aeo?.entitySignals?.audience).toBe('Custom audience')
    expect(home?.aeo?.entitySignals?.useCases).toEqual(['custom use case'])
    expect(home?.aeo?.entitySignals?.benefits).toEqual(['custom benefit'])
    // existing sections not duplicated
    const daCount = home?.sections?.filter(
      (s) => s.type === 'direct-answer',
    ).length
    const faqCount = home?.sections?.filter((s) => s.type === 'faq').length
    expect(daCount).toBe(1)
    expect(faqCount).toBe(1)
    // existing direct-answer body preserved
    expect(home?.sections?.find((s) => s.type === 'direct-answer')?.body).toBe(
      'Custom DA',
    )
  })
})
