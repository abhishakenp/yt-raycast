import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  parseOpenUIForExport,
  buildOpenUIExport,
} from './openui-export-builder'
import { buildOpenUIHtmlExport } from './openui-html-export-builder'
import { renderOpenUIToHTML } from '@ship-fast/engine/openui-ssr.js'

/**
 * Contract tests for three cross-cutting export concerns that the generic
 * fixture contract test does not isolate:
 *
 * 1. Localization — non-English fixtures (Hindi, Marathi, Hinglish) must render
 *    with their locale and round-trip through both React and HTML export
 *    builders without dropping or mangling non-ASCII text.
 * 2. CMS annotations — HTML carrying `data-cms="..."` binding attributes (the
 *    format produced by convex/lib/cms_helpers.ts and consumed by the CMS
 *    panel) must survive the HTML export pipeline intact so bound fields stay
 *    addressable after export.
 * 3. Commerce integration — sources built from ecommerce component families
 *    (FashionStore*, Ecommerce*) must still parse and export, and a commerce
 *    config payload (matching convex/lib/session_commerce_helpers.ts shape)
 *    must not break the export path.
 *
 * These guard against regressions where a refactor of the export builders
 * silently drops locale text, strips data-cms attributes, or rejects
 * ecommerce component trees.
 */

const fixtureDir = join(process.cwd(), '__fixtures__', 'openui-sources')

function loadFixture(name: string): string {
  return readFileSync(join(fixtureDir, `${name}.openui`), 'utf-8')
}

const siteSpecJson = JSON.stringify({
  projectName: 'Localization/CMS/Commerce Contract',
})

describe('localization export contract', () => {
  it('coffee-saas-hindi renders with locale hi and exports (React + HTML)', async () => {
    const source = loadFixture('coffee-saas-hindi')

    // Render with the Hindi locale — the SSR renderer takes locale as the
    // third argument. The rendered HTML must retain Hindi (Devanagari) text.
    const html = await renderOpenUIToHTML(source, undefined, 'hi')
    expect(typeof html).toBe('string')
    expect(html.length).toBeGreaterThan(0)
    // Devanagari script range — assert the rendered output actually contains
    // Hindi text from the fixture (e.g. the signup CTA "साइन अप करें").
    expect(html).toContain('साइन अप करें')

    // The source must parse for export without throwing.
    expect(() => parseOpenUIForExport(source, siteSpecJson)).not.toThrow()
    const parsed = parseOpenUIForExport(source, siteSpecJson)
    expect(parsed.routes.length).toBeGreaterThan(0)

    // React zip export must succeed.
    const react = await buildOpenUIExport({
      source,
      siteSpecJson,
      sessionId: 'loc-coffee-saas-hindi',
      target: 'react',
    })
    expect(react.contentType).toBe('application/zip')

    // HTML export must succeed.
    const htmlExport = await buildOpenUIHtmlExport({
      source,
      siteSpecJson,
      sessionId: 'loc-coffee-saas-hindi',
      target: 'html',
    })
    expect(htmlExport.contentType).toBe('text/html; charset=utf-8')
  })

  it('travel-booking-marathi renders with locale mr and exports (React + HTML)', async () => {
    const source = loadFixture('travel-booking-marathi')

    // Render with the Marathi locale. The home page uses default-arg
    // TravelAgency components, so the Marathi copy lives on the Gallery page;
    // we assert the render call succeeds with the locale and then verify the
    // Marathi text is present in the full HTML export (which builds every
    // page).
    const html = await renderOpenUIToHTML(source, undefined, 'mr')
    expect(typeof html).toBe('string')
    expect(html.length).toBeGreaterThan(0)

    expect(() => parseOpenUIForExport(source, siteSpecJson)).not.toThrow()
    const parsed = parseOpenUIForExport(source, siteSpecJson)
    expect(parsed.routes.length).toBeGreaterThan(0)

    const react = await buildOpenUIExport({
      source,
      siteSpecJson,
      sessionId: 'loc-travel-booking-marathi',
      target: 'react',
    })
    expect(react.contentType).toBe('application/zip')

    const htmlExport = await buildOpenUIHtmlExport({
      source,
      siteSpecJson,
      sessionId: 'loc-travel-booking-marathi',
      target: 'html',
    })
    expect(htmlExport.contentType).toBe('text/html; charset=utf-8')
    const htmlBody =
      typeof htmlExport.body === 'string'
        ? htmlExport.body
        : new TextDecoder().decode(htmlExport.body)
    // Marathi (Devanagari) text from the fixture gallery heading must survive
    // the multi-page HTML export.
    expect(htmlBody).toContain('आकर्षक गंतव्यस्थाने')
  })

  it('movie-fans-hinglish renders and exports (React + HTML) preserving Hinglish copy', async () => {
    const source = loadFixture('movie-fans-hinglish')

    // Hinglish fixtures mix Latin-script Hindi with English; no dedicated
    // locale code, so render with the default locale and assert the Hinglish
    // copy survives rendering.
    const html = await renderOpenUIToHTML(source, undefined, 'en')
    expect(typeof html).toBe('string')
    expect(html.length).toBeGreaterThan(0)
    // Hinglish phrase from the hero subheading.
    expect(html).toContain('Har din naye movies')

    expect(() => parseOpenUIForExport(source, siteSpecJson)).not.toThrow()
    const parsed = parseOpenUIForExport(source, siteSpecJson)
    expect(parsed.routes.length).toBeGreaterThan(0)

    const react = await buildOpenUIExport({
      source,
      siteSpecJson,
      sessionId: 'loc-movie-fans-hinglish',
      target: 'react',
    })
    expect(react.contentType).toBe('application/zip')

    const htmlExport = await buildOpenUIHtmlExport({
      source,
      siteSpecJson,
      sessionId: 'loc-movie-fans-hinglish',
      target: 'html',
    })
    expect(htmlExport.contentType).toBe('text/html; charset=utf-8')
  })
})

describe('CMS annotation export contract', () => {
  it('HTML export preserves data-cms binding attributes in previewHtml', async () => {
    // The CMS binding format (convex/lib/cms_helpers.ts) wraps bound text in
    // elements carrying data-cms="<selector>" so the CMS panel can swap field
    // values post-export. The HTML export must not strip these attributes.
    const source = loadFixture('tech-blog')
    const baseHtml = await renderOpenUIToHTML(source, undefined, 'en')
    expect(baseHtml.length).toBeGreaterThan(0)

    // Inject a CMS-bound span around a hero heading, matching the
    // `<tag ... data-cms="selector">...</tag>` shape cms_helpers parses.
    const cmsAnnotatedHtml = baseHtml.replace(
      /(<h1[^>]*>(?:(?!<\/h1>).)*?)([^<>\s][^<>]*)(<\/(?:a|span|strong|em)>|<\/h1>)/s,
      `$1<span data-cms="hero.title">$2</span>$3`,
    )
    expect(cmsAnnotatedHtml).toContain('data-cms="hero.title"')

    const htmlExport = await buildOpenUIHtmlExport({
      source,
      siteSpecJson,
      previewHtml: cmsAnnotatedHtml,
      sessionId: 'cms-annotation-tech-blog',
      target: 'html',
    })
    expect(htmlExport.contentType).toBe('text/html; charset=utf-8')
    const body =
      typeof htmlExport.body === 'string'
        ? htmlExport.body
        : new TextDecoder().decode(htmlExport.body)
    // The data-cms attribute must survive the export pipeline.
    expect(body).toContain('data-cms="hero.title"')
  })

  it('data-cms attribute binding (src/href) survives HTML export', async () => {
    // cms_helpers.replaceCmsBoundAttribute targets tags carrying
    // data-cms="<selector>" plus a src/href attribute. Verify such a tag
    // round-trips through the HTML export intact.
    const source = loadFixture('travel-booking')
    const baseHtml = await renderOpenUIToHTML(source, undefined, 'en')
    expect(baseHtml.length).toBeGreaterThan(0)

    const cmsAnnotatedHtml = baseHtml.replace(
      /(<img[^>]*?)(\s+src=)/,
      `$1 data-cms="hero.image"$2`,
    )
    expect(cmsAnnotatedHtml).toContain('data-cms="hero.image"')

    const htmlExport = await buildOpenUIHtmlExport({
      source,
      siteSpecJson,
      previewHtml: cmsAnnotatedHtml,
      sessionId: 'cms-attr-travel-booking',
      target: 'html',
    })
    expect(htmlExport.contentType).toBe('text/html; charset=utf-8')
    const body =
      typeof htmlExport.body === 'string'
        ? htmlExport.body
        : new TextDecoder().decode(htmlExport.body)
    expect(body).toContain('data-cms="hero.image"')
  })

  it('source with data-cms-style annotations still parses and exports', async () => {
    // Even if a future engine emits data-cms attributes inside literal HTML
    // strings within the OpenUI source, the export parser must not reject the
    // source. Use a minimal source with an HTML string carrying data-cms.
    const source = [
      'home_hero = CafeHero({"heading":"<span data-cms=\\"hero.title\\">Welcome</span>"})',
      'home = Stack([home_hero])',
      'root = PageSwitch(["Home"], [home], "", {"Home":"Home"})',
    ].join('\n')

    expect(() => parseOpenUIForExport(source, siteSpecJson)).not.toThrow()
    const react = await buildOpenUIExport({
      source,
      siteSpecJson,
      sessionId: 'cms-source-annotation',
      target: 'react',
    })
    expect(react.contentType).toBe('application/zip')
  })
})

describe('commerce integration export contract', () => {
  it('sneaker-ecommerce (FashionStore family) parses and exports (React + HTML)', async () => {
    const source = loadFixture('sneaker-ecommerce')

    expect(() => parseOpenUIForExport(source, siteSpecJson)).not.toThrow()
    const parsed = parseOpenUIForExport(source, siteSpecJson)
    expect(parsed.routes.length).toBeGreaterThan(0)
    // The fixture is built from the FashionStore ecommerce component family.
    expect(source).toContain('FashionStore')

    const react = await buildOpenUIExport({
      source,
      siteSpecJson,
      sessionId: 'commerce-sneaker-ecommerce',
      target: 'react',
    })
    expect(react.contentType).toBe('application/zip')

    const htmlExport = await buildOpenUIHtmlExport({
      source,
      siteSpecJson,
      sessionId: 'commerce-sneaker-ecommerce',
      target: 'html',
    })
    expect(htmlExport.contentType).toBe('text/html; charset=utf-8')
  })

  it('pizza-ecommerce (Ecommerce family) parses and exports (React + HTML)', async () => {
    const source = loadFixture('pizza-ecommerce')

    expect(() => parseOpenUIForExport(source, siteSpecJson)).not.toThrow()
    const parsed = parseOpenUIForExport(source, siteSpecJson)
    expect(parsed.routes.length).toBeGreaterThan(0)
    expect(source).toContain('Ecommerce')

    const react = await buildOpenUIExport({
      source,
      siteSpecJson,
      sessionId: 'commerce-pizza-ecommerce',
      target: 'react',
    })
    expect(react.contentType).toBe('application/zip')

    const htmlExport = await buildOpenUIHtmlExport({
      source,
      siteSpecJson,
      sessionId: 'commerce-pizza-ecommerce',
      target: 'html',
    })
    expect(htmlExport.contentType).toBe('text/html; charset=utf-8')
  })

  it('commerce config payload (session_commerce_helpers shape) does not break export', async () => {
    // convex/lib/session_commerce_helpers.ts serializes a commerce config with
    // backendUrl / adminUrl / storefrontUrl / productCount / configJson. The
    // export pipeline must accept a siteSpec that carries commerce integration
    // metadata without rejecting the source.
    const source = loadFixture('sneaker-ecommerce')
    const commerceSiteSpec = JSON.stringify({
      projectName: 'Commerce Contract',
      commerce: {
        configId: 'commerce_config_test',
        status: 'ready',
        backendUrl: 'https://medusa.example.com',
        adminUrl: 'https://admin.example.com',
        storefrontUrl: 'https://shop.example.com',
        productCount: 12,
        configJson: '{}',
      },
    })

    expect(() => parseOpenUIForExport(source, commerceSiteSpec)).not.toThrow()
    const react = await buildOpenUIExport({
      source,
      siteSpecJson: commerceSiteSpec,
      sessionId: 'commerce-config-sneaker',
      target: 'react',
    })
    expect(react.contentType).toBe('application/zip')

    const htmlExport = await buildOpenUIHtmlExport({
      source,
      siteSpecJson: commerceSiteSpec,
      sessionId: 'commerce-config-sneaker',
      target: 'html',
    })
    expect(htmlExport.contentType).toBe('text/html; charset=utf-8')
  })
})
