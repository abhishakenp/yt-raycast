import { describe, expect, it } from 'vitest'

import { buildFallbackSiteSpec } from './defaults.js'
import { validateSiteSpec } from './validate.js'

describe('validateSiteSpec', () => {
  it('accepts a normalized fallback site spec with renderable pages', () => {
    const spec = buildFallbackSiteSpec({
      prompt: 'Acme analytics platform for support teams',
      ctx: {
        project_name: 'Acme Analytics',
        site_type: 'saas',
        pages: ['Home', 'Pricing', 'FAQ', 'Contact'],
      },
    })

    expect(validateSiteSpec(spec)).toEqual({ valid: true, errors: [] })
  })

  it('reports top-level schema failures and unsupported export options', () => {
    const result = validateSiteSpec({
      exportableFrameworks: ['html', 'astro'],
      exportOptions: { cms: 'contentful', embedSanityStudio: 'yes' },
      pages: [],
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'projectName is required.',
        'slug is required.',
        'siteType is required.',
        'Unsupported export target "astro".',
        'theme is required.',
        'Unsupported exportOptions.cms "contentful".',
        'exportOptions.embedSanityStudio must be a boolean.',
        'pages must contain at least one page.',
      ]),
    )
  })

  it('reports duplicate pages, invalid sections, and incomplete render blueprints', () => {
    const result = validateSiteSpec({
      projectName: 'Broken Site',
      slug: 'broken-site',
      siteType: 'landing',
      exportableFrameworks: ['html'],
      theme: { colors: {} },
      pages: [
        {
          id: 'page-home',
          name: 'Home',
          route: '/',
          sections: [
            { id: 'hero', type: 'hero' },
            { id: 'hero', type: 'unknown-section' },
            { type: 'features' },
          ],
          renderBlueprint: { title: 'Home' },
        },
        {
          id: 'page-home',
          name: 'Duplicate Home',
          route: '/',
          sections: 'not-an-array',
        },
      ],
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'Page "page-home" has duplicate section id "hero".',
        'Section "hero" has unsupported type "unknown-section".',
        'Page "page-home" has a section without an id.',
        'Page "page-home" renderBlueprint is missing bodyHtml.',
        'Duplicate page id "page-home".',
        'Duplicate page route "/".',
        'Page "Duplicate Home" must include sections.',
      ]),
    )
  })

  it('rejects non-object input without throwing', () => {
    expect(validateSiteSpec(null)).toEqual({
      valid: false,
      errors: ['Site spec must be an object.'],
    })
  })
})
