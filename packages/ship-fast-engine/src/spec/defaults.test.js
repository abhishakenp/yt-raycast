import { describe, expect, it } from 'vitest'

import {
  SITE_SPEC_VERSION,
  SUPPORTED_EXPORT_TARGETS,
  buildFallbackSiteSpec,
} from './defaults.js'
import { validateSiteSpec } from './validate.js'

describe('buildFallbackSiteSpec', () => {
  it('builds a valid ecommerce spec with normalized URL, palette, typography, and commerce data', () => {
    const spec = buildFallbackSiteSpec({
      prompt: 'Premium leather goods store',
      siteType: 'ecommerce',
      designBrief: [
        'Palette: #111111 #f6f0e8 #c99745 #ffffff #eeeeee #121212 #707070 #dddddd',
        'Typography: Space Grotesk headings, Manrope body, Fira Code mono',
      ].join('\n'),
      ctx: {
        project_name: 'Atelier Goods',
        site_url: 'atelier.example/store/',
        tagline: 'Objects made to last.',
      },
    })

    expect(validateSiteSpec(spec)).toEqual({ valid: true, errors: [] })
    expect(spec).toMatchObject({
      projectName: 'Atelier Goods',
      slug: 'atelier-goods',
      siteType: 'ecommerce',
      version: SITE_SPEC_VERSION,
      exportableFrameworks: SUPPORTED_EXPORT_TARGETS,
      seo: {
        siteUrl: 'https://atelier.example/store',
        description: 'Objects made to last.',
      },
      theme: {
        colors: {
          primary: '#111111',
          secondary: '#f6f0e8',
          accent: '#c99745',
        },
        typography: {
          heading: 'Space Grotesk',
          body: 'Space Grotesk',
          mono: 'Fira Code',
        },
      },
      ecommerce: {
        provider: 'medusa',
        settings: {
          currency: 'USD',
          storeName: 'Atelier Goods',
          provider: 'medusa',
        },
      },
    })
    expect(spec.pages.map((page) => [page.name, page.route])).toEqual([
      ['Home', '/'],
      ['Shop', '/shop'],
      ['Cart', '/cart'],
      ['FAQ', '/faq'],
      ['Contact', '/contact'],
    ])
    expect(spec.navigation.ctas).toEqual([
      { id: 'cta-primary', label: 'Shop', href: '/shop', style: 'primary' },
      { id: 'cta-secondary', label: 'Cart', href: '/cart', style: 'secondary' },
    ])
    expect(spec.pages[0].sections.map((section) => section.type)).toEqual(
      expect.arrayContaining([
        'hero',
        'featured-products',
        'product-grid',
        'cart-summary',
      ]),
    )
    expect(spec.ecommerce.products).toHaveLength(6)
    expect(spec.forms[0]).toMatchObject({
      id: 'contact-form',
      pageId: 'page-home',
      action: { type: 'placeholder', target: 'lead_capture' },
    })
  })

  it('builds institutional defaults with official page roles and CTA routes', () => {
    const spec = buildFallbackSiteSpec({
      prompt: 'Public sector careers and notices portal',
      siteType: 'institutional',
      ctx: {
        project_name: 'Civic Works',
        tagline: 'Official public information.',
        features: ['Tender notices'],
      },
    })

    expect(validateSiteSpec(spec)).toEqual({ valid: true, errors: [] })
    expect(spec.pages.map((page) => [page.name, page.route])).toEqual([
      ['Home', '/'],
      ['Notices', '/notices'],
      ['Careers', '/careers'],
      ['Contact', '/contact'],
    ])
    expect(spec.navigation.ctas).toEqual([
      {
        id: 'cta-primary',
        label: 'Careers',
        href: '/careers',
        style: 'primary',
      },
      {
        id: 'cta-secondary',
        label: 'Notices',
        href: '/notices',
        style: 'secondary',
      },
    ])
    expect(spec.pages[0].sections.map((section) => section.type)).toEqual(
      expect.arrayContaining([
        'notice-board',
        'document-list',
        'careers-table',
      ]),
    )
    expect(spec.pages[1].description).toContain('tenders, circulars')
    expect(spec.pages[2].sections[0]).toMatchObject({
      id: 'careers-openings',
      type: 'careers-table',
    })
  })

  it('builds generic blog defaults with publication structure for arbitrary subjects', () => {
    for (const prompt of [
      'Independent magazine about urban gardening',
      'Founder journal for robotics operations',
    ]) {
      const spec = buildFallbackSiteSpec({
        prompt,
        siteType: 'blog',
        ctx: {
          project_name: 'Field Notes',
          tagline: 'Practical dispatches from the field.',
        },
      })

      expect(validateSiteSpec(spec)).toEqual({ valid: true, errors: [] })
      expect(spec.siteType).toBe('blog')
      expect(spec.navigation.global.map((item) => item.label)).toEqual([
        'Home',
        'Blog',
        'About',
        'Contact',
      ])
      expect(spec.navigation.ctas).toEqual([
        { id: 'cta-primary', label: 'Blog', href: '/blog', style: 'primary' },
        {
          id: 'cta-secondary',
          label: 'About',
          href: '/about',
          style: 'secondary',
        },
      ])
      expect(spec.pages.map((page) => [page.name, page.route])).toEqual([
        ['Home', '/'],
        ['Blog', '/blog'],
        ['About', '/about'],
        ['Contact', '/contact'],
      ])
      expect(spec.pages[0].sections.map((section) => section.type)).toEqual([
        'navbar',
        'blog-list',
        'newsletter',
        'content',
      ])
      const blogList = spec.pages[0].sections.find(
        (section) => section.id === 'blog-list',
      )
      expect(blogList).toMatchObject({
        id: 'blog-list',
        variant: 'featured-grid',
      })
      expect(blogList.items.length).toBeGreaterThanOrEqual(2)
      expect(JSON.stringify(spec)).not.toMatch(/blog-dogs|KubeMeter/i)
    }
  })

  it('uses custom page names, fallback URLs, and default typography when hints are sparse', () => {
    const spec = buildFallbackSiteSpec({
      prompt: 'Internal dashboard for finance operations',
      ctx: {
        site_type: 'dashboard',
        project_name: 'Ops Console',
        slug: 'ops',
        site_url: 'ftp://not-allowed.example',
        pages: ['Home', 'Docs', 'Contact'],
        features: [
          'Approvals',
          'Audit trail',
          'Realtime metrics',
          'Policy checks',
        ],
      },
    })

    expect(validateSiteSpec(spec)).toEqual({ valid: true, errors: [] })
    expect(spec.slug).toBe('ops')
    expect(spec.siteType).toBe('dashboard')
    expect(spec.seo.siteUrl).toBe('')
    expect(spec.theme.typography).toMatchObject({
      heading: 'Inter',
      body: 'Inter',
      mono: 'JetBrains Mono',
    })
    expect(
      spec.pages.map((page) => [page.name, page.route, page.layoutType]),
    ).toEqual([
      ['Home', '/', 'app-shell'],
      ['Docs', '/docs', 'app-shell'],
      ['Contact', '/contact', 'app-shell'],
    ])
    expect(spec.pages[0].sections.map((section) => section.type)).toEqual(
      expect.arrayContaining([
        'hero',
        'dashboard-shell',
        'pricing',
        'contact-form',
      ]),
    )
    expect(
      spec.pages[0].sections.find((section) => section.id === 'hero').items,
    ).toEqual([
      { title: 'Approvals' },
      { title: 'Audit trail' },
      { title: 'Realtime metrics' },
    ])
    expect(spec.backendFeatureHints).toEqual([
      'Approvals',
      'Audit trail',
      'Realtime metrics',
      'Policy checks',
    ])
  })
})
