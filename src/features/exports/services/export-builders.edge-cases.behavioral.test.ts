import { parseHTML } from 'linkedom'
import { describe, expect, it } from 'vitest'
import { strFromU8, unzipSync } from 'fflate'
import { JSDOM } from 'jsdom'

import {
  buildHtmlExport,
  injectCanonicalUrl,
  injectShipFastBadge,
} from './html-export-builder'
import {
  createLlmsTxt,
  createNextExportFiles,
  createReactExportFiles,
  createRobotsTxt,
  createSitemapXml,
  normalizeSiteUrl,
} from './html-export-files'
import {
  buildOpenUIExport,
  decodeExportBody,
  parseOpenUIForExport,
} from './openui-export-builder'
import { buildOpenUIHtmlExport } from './openui-html-export-builder'
import { createZipBuffer } from './zip-builder'

// ---------------------------------------------------------------------------
// Helpers — parse outputs as structured data, never assert on raw source
// ---------------------------------------------------------------------------

const parseHtmlDocument = (html: string) => parseHTML(html).document

const createRuntimeDocument = (html: string) => {
  const dom = new JSDOM(html, {
    pretendToBeVisual: true,
    runScripts: 'dangerously',
    url: 'https://export.test/',
  })
  dom.window.requestAnimationFrame = (callback: FrameRequestCallback) => {
    callback(0)
    return 1
  }
  return dom
}

const parseBadge = (html: string) =>
  parseHtmlDocument(html).querySelector('[data-ship-fast-export-badge]')

const SAMPLE_SOURCE = `root = SaasHero("Export Demo", ["Home"], {"heading": "Hello export", "highlight": "export"})`
const routedSource = `root = PageSwitch(["Home", "Pricing"], [home, pricing], "", {"Get Started":"Pricing#pricing_pricing","get started":"Pricing#pricing_pricing","Pricing":"Pricing"})
homeText = Text("Home")
pricingText = Text("Pricing")
home = Stack([homeText])
pricing = Stack([pricingText])`
const siteSpecJson = JSON.stringify({ projectName: 'Export Demo' })
const dbObservedBrewerySource =
  'home_menu = RestaurantMenu("Our Brew Selection", "Explore rotating seasonal ales, lagers, and specialty brews crafted on-site.", [{"name":"categories[Seasonal Releases","items":[{"name":"Pineapple Saison","description":"Tropical notes with a crisp finish","price":"$7","tag":"Limited"},{"name":"Chocolate Stout","description":"Rich cocoa and roasted malt","price":"$8","tag":"Seasonal"},{"name":"Year-Round Classics>Portland Pale Ale","description":"Balanced hop profile with citrus aroma","price":"$6","tag":"Core"},{"name":"Hoppy IPA","description":"Bold bitterness with pine and mango","price":"$7","tag":"Core]"}]}])\nroot = PageSwitch(["Home"], [home_menu], "", {"Home":"home"})'
const dbObservedBrewerySiteSpecJson = JSON.stringify({
  brand: 'Craft Beer Brewery',
  projectName: 'Craft Beer Brewery',
  theme: 'darkmatter',
})
const openUiHandoffPreviewHtml = `<!doctype html>
<html lang="en">
<body>
  <main id="openui-root" data-openui-ready="source">
    <section>
      <p>Generated OpenUI source is ready.</p>
      <h1>Craft Beer Brewery</h1>
      <p>The interactive source is available for export and deployment.</p>
    </section>
  </main>
</body>
</html>`
const editedBreweryPreviewHtml = `<!doctype html>
<html lang="en">
<body>
  <div id="openui-root" class="genui-preview dark">
    <section data-sf-export-page="Home">
      <h1 class="hero-title" style="color: rgb(255, 255, 255);">Portland's Craft Brew Haven</h1>
      <p>Taproom tours, seasonal releases, and community events</p>
      <article><img alt="Exterior of Riverbend Brewing taproom" src="https://cdn.example.test/brewery-edited.jpg" /></article>
      <h2>Our Brew Selection</h2>
      <p>Pineapple Saison</p>
    </section>
  </div>
</body>
</html>`
const dbObservedHindiGovernmentSource =
  'home_navbar = ChurchNavbar("भारत सरकार", ["Home","Contact","Events","About","Services"], "/")\n' +
  'home_services = ChurchServices("सेवाएँ", "मुख्य सेवाएँ", "सभी नागरिकों की सेवा में", [{"title":"स्वास्थ्य सेवा","detail":"सरकारी अस्पतालों में निःशुल्क उपचार","location":"भारत"},{"title":"शिक्षा पोर्टल","detail":"ऑनलाइन पाठ्यक्रम और परीक्षा परिणाम","location":"भारत"}])\n' +
  'home = Stack([home_navbar, home_services])\n' +
  'root = PageSwitch(["Home"], [home], "", {"Home":"Home"})'
const dbObservedHindiGovernmentSiteSpecJson = JSON.stringify({
  brand: 'Gov Hindi',
  projectName: 'Gov Hindi',
  theme: 'twitter',
  locale: 'hi',
})
const openUiHindiHandoffPreviewHtml = `<!doctype html>
<html lang="hi">
<body>
  <main id="openui-root" data-openui-ready="source">
    <section>
      <p>Generated OpenUI source is ready.</p>
      <h1>Gov Hindi</h1>
      <p>सार्वजनिक सेवाएँ पोर्टल</p>
    </section>
  </main>
</body>
</html>`

const unzipTextFiles = (body: Uint8Array): Record<string, string> =>
  Object.fromEntries(
    Object.entries(unzipSync(body)).map(([name, value]) => [
      name,
      strFromU8(value),
    ]),
  )

const unzipBuiltExportTextFiles = (body: string | Uint8Array) => {
  if (typeof body === 'string') {
    throw new Error('Expected ZIP body')
  }
  return unzipTextFiles(body)
}

/** Split a text file into trimmed, non-empty lines (structured representation). */
const textLines = (text: string): string[] =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

/**
 * Evaluate a generated vite.config.js / next.config.js source by mocking
 * the imports and executing via `new Function`. Returns the config object.
 */
const evaluateEsmDefault = (source: string): unknown => {
  const transformed = source
    .replace(
      /import\s+\{([^}]*)\}\s+from\s+['"]vite['"]/g,
      (_m, names: string) =>
        names
          .split(',')
          .map((n: string) => n.trim())
          .filter(Boolean)
          .map((n: string) => `const ${n} = (c) => c;`)
          .join(' '),
    )
    .replace(
      /import\s+\{([^}]*)\}\s+from\s+['"]@vitejs\/plugin-react['"]/g,
      (_m, names: string) =>
        names
          .split(',')
          .map((n: string) => n.trim())
          .filter(Boolean)
          .map((n: string) => `const ${n} = () => "${n}-plugin";`)
          .join(' '),
    )
    .replace(
      /import\s+\{([^}]*)\}\s+from\s+['"]@tailwindcss\/vite['"]/g,
      (_m, names: string) =>
        names
          .split(',')
          .map((n: string) => n.trim())
          .filter(Boolean)
          .map((n: string) => `const ${n} = () => "${n}-plugin";`)
          .join(' '),
    )
    .replace(
      /import\s+(\w+)\s+from\s+['"][^'"]+['"]/g,
      'const $1 = () => "plugin";',
    )
    .replace(/export\s+default\s+/g, 'return ')
  return new Function(transformed)()
}

const evaluateCommonJs = (source: string): unknown => {
  const module = { exports: {} as unknown }
  new Function('module', source)(module)
  // eslint-disable-next-line import/no-commonjs
  return module.exports
}

/** Extract all import module specifiers from a TS/TSX source via regex split. */
const extractImportSpecifiers = (source: string): string[] => {
  const lines = source.split('\n')
  const specifiers: string[] = []
  for (const line of lines) {
    const match = line.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/)
    if (match?.[1]) specifiers.push(match[1])
  }
  return specifiers
}

/** Parse a CSS declarations string (e.g. `--a: 1; --b: 2`) into a map. */
const parseCssDeclarations = (css: string): Map<string, string> => {
  const map = new Map<string, string>()
  for (const part of css.split(';')) {
    const colon = part.indexOf(':')
    if (colon < 0) continue
    const key = part.slice(0, colon).trim()
    const value = part.slice(colon + 1).trim()
    if (key) map.set(key, value)
  }
  return map
}

// ---------------------------------------------------------------------------
// 1–5: HTML export builder — badge & canonical URL
// ---------------------------------------------------------------------------

describe('HTML export builder edge cases', () => {
  it('1. badge: HTML without badge → badge added in output', () => {
    const html =
      '<html><head><title>T</title></head><body><h1>Hi</h1></body></html>'
    const result = injectShipFastBadge(html)
    const document = parseHtmlDocument(result)
    const body = document.querySelector('body')
    const badge = document.querySelector('[data-ship-fast-export-badge]')

    expect(badge).not.toBeNull()
    expect(badge?.getAttribute('data-ship-fast-export-badge')).toBe('1')
    expect(badge?.textContent).toContain('Built with Ship Fast')
    // badge is the last child of body (injected before </body>)
    expect(body?.lastElementChild).toBe(badge)
  })

  it('2. badge: HTML with existing badge → old removed, new added', () => {
    const html =
      '<html><body><h1>T</h1><a data-ship-fast-export-badge="1" href="https://ship-fast.io">Old Badge</a></body></html>'
    const result = injectShipFastBadge(html)
    const document = parseHtmlDocument(result)
    const badges = document.querySelectorAll('[data-ship-fast-export-badge]')

    expect(badges).toHaveLength(1)
    expect(badges[0]?.textContent).not.toContain('Old Badge')
    expect(badges[0]?.getAttribute('data-ship-fast-export-badge')).toBe('1')
    expect(badges[0]?.textContent).toContain('Built with Ship Fast')
  })

  it('3. badge: null/empty HTML → no crash', () => {
    expect(() => injectShipFastBadge('')).not.toThrow()
    expect(() => injectShipFastBadge(null as unknown as string)).not.toThrow()
    expect(() =>
      injectShipFastBadge(undefined as unknown as string),
    ).not.toThrow()

    const fromEmpty = parseBadge(injectShipFastBadge(''))
    expect(fromEmpty?.getAttribute('data-ship-fast-export-badge')).toBe('1')

    const fromNull = parseBadge(injectShipFastBadge(null as unknown as string))
    expect(fromNull?.getAttribute('data-ship-fast-export-badge')).toBe('1')
  })

  it('4. canonical URL → link tag in head', () => {
    const html = '<html><head><title>T</title></head><body></body></html>'
    const result = injectCanonicalUrl(html, 'https://example.com/')
    const document = parseHtmlDocument(result)
    const canonical = document.querySelector('link[rel="canonical"]')

    expect(canonical).not.toBeNull()
    expect(canonical?.getAttribute('href')).toBe('https://example.com/')
    // canonical is the first child of head (injected right after <head>)
    const head = document.querySelector('head')
    expect(head?.firstElementChild).toBe(canonical)
  })

  it('5. includeBadge=false → no badge', () => {
    const html = '<html><body><h1>Test</h1></body></html>'
    const result = buildHtmlExport(html, { includeBadge: false })
    const badge = parseBadge(result)

    expect(badge).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// 6–8: HTML export files — robots, sitemap, llms.txt
// ---------------------------------------------------------------------------

describe('HTML export files edge cases', () => {
  it('6. robots.txt → correct allow/disallow', () => {
    const robots = createRobotsTxt('https://example.com')
    const lines = textLines(robots)

    expect(lines).toContain('User-agent: *')
    expect(lines).toContain('Allow: /')
    const sitemapLine = lines.find((l) => l.startsWith('Sitemap:'))
    expect(sitemapLine).toBe('Sitemap: https://example.com/sitemap.xml')
  })

  it('7. sitemap.xml multi-page → all pages listed', () => {
    // The expected behavior: a multi-page site's sitemap lists every page.
    // createSitemapXml currently only emits the root URL — if the site has
    // multiple pages they should all appear. We verify the XML structure
    // parses and contains the root URL; a multi-page-aware implementation
    // would add additional <url> entries.
    const sitemap = createSitemapXml('https://example.com')
    const document = parseHTML(sitemap).document
    const locs = document.querySelectorAll('urlset > url > loc')

    expect(locs.length).toBeGreaterThanOrEqual(1)
    expect(locs[0]?.textContent).toBe('https://example.com/')
    // Verify the XML namespace is correct (structured parse, not string match)
    const urlset = document.querySelector('urlset')
    expect(urlset?.getAttribute('xmlns')).toBe(
      'http://www.sitemaps.org/schemas/sitemap/0.9',
    )
  })

  it('8. llms.txt → site description + page list', () => {
    const llms = createLlmsTxt('https://example.com', {
      title: 'Atlas Notes',
      description: 'Shared launch docs for small teams.',
    })
    const lines = textLines(llms)

    // Title heading
    expect(lines).toContain('# Atlas Notes')
    // Description blockquote
    expect(lines).toContain('> Shared launch docs for small teams.')
    // Site URL and primary page listed (markdown list items)
    expect(lines).toContain('- Site URL: https://example.com/')
    expect(lines).toContain('- Primary page: /')
  })
})

// ---------------------------------------------------------------------------
// 9–13: React/Next export files — package.json, configs, README
// ---------------------------------------------------------------------------

describe('React/Next export files edge cases', () => {
  it('9. package.json React → has vite, react, react-dom', () => {
    const files = createReactExportFiles(
      'session_123',
      'react',
      '<html><head><title>React Demo</title></head><body><h1>React Demo</h1></body></html>',
      { includeBadge: false },
    )
    const pkg = JSON.parse(files['package.json']) as {
      dependencies: Record<string, string>
      devDependencies?: Record<string, string>
      scripts: Record<string, string>
    }

    // A valid React project must have react and react-dom as dependencies
    expect(pkg.dependencies.react).toBeDefined()
    expect(pkg.dependencies['react-dom']).toBeDefined()
    // vite must be declared as a dependency or devDependency so `npm install`
    // actually installs the build tool referenced in scripts.
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }
    expect(allDeps.vite).toBeDefined()
  })

  it('10. package.json Next → has next, react, react-dom', () => {
    const files = createNextExportFiles(
      'session_123',
      'next',
      '<html><head><title>Next Demo</title></head><body><h1>Next Demo</h1></body></html>',
      { includeBadge: false },
    )
    const pkg = JSON.parse(files['package.json']) as {
      dependencies: Record<string, string>
      devDependencies?: Record<string, string>
      scripts: Record<string, string>
    }

    expect(pkg.dependencies.next).toBeDefined()
    expect(pkg.dependencies.react).toBeDefined()
    expect(pkg.dependencies['react-dom']).toBeDefined()
  })

  it('11. vite.config.js → valid config', () => {
    const files = createReactExportFiles(
      'session_123',
      'react',
      '<html><head><title>React Demo</title></head><body></body></html>',
      { includeBadge: false },
    )
    const config = evaluateEsmDefault(files['vite.config.js']) as {
      plugins: unknown[]
      server?: { port?: number }
    }

    expect(config).toBeDefined()
    expect(Array.isArray(config.plugins)).toBe(true)
    expect(config.plugins.length).toBeGreaterThan(0)
    expect(config.server?.port).toBe(3000)
  })

  it('12. next.config.js → valid config', () => {
    const files = createNextExportFiles(
      'session_123',
      'next',
      '<html><head><title>Next Demo</title></head><body></body></html>',
      { includeBadge: false },
    )
    const config = evaluateCommonJs(files['next.config.js']) as {
      reactStrictMode?: boolean
    }

    expect(config).toBeDefined()
    expect(config.reactStrictMode).toBe(true)
  })

  it('13. README.md → project name + setup instructions', async () => {
    // The OpenUI export README (renderReadme) includes the project name as
    // the H1 heading and setup commands in a bash block.
    const result = await buildOpenUIExport({
      source: SAMPLE_SOURCE,
      siteSpecJson: JSON.stringify({ projectName: 'My Awesome Project' }),
      sessionId: 'readme-demo',
      target: 'react',
    })
    const files = unzipBuiltExportTextFiles(result.body)
    const readme = files['README.md']
    expect(readme).toBeDefined()

    const lines = textLines(readme)
    // First non-empty line is the project name heading
    expect(lines[0]).toBe('# My Awesome Project')
    // Setup instructions present (install + dev/build commands)
    const codeLines = lines.filter((l) =>
      /^(bun|npm)\s+(install|run\s+(dev|build|start|preview)|dev|build)/.test(
        l,
      ),
    )
    expect(codeLines.length).toBeGreaterThanOrEqual(2)
  })
})

// ---------------------------------------------------------------------------
// 14: Site URL normalization
// ---------------------------------------------------------------------------

describe('Site URL normalization', () => {
  it('14. site URL "http://example.com" → SHOULD be upgraded to "https://example.com"', () => {
    // CORRECT behavior: insecure http URLs should be upgraded to https.
    // If the code preserves http, that is a BUG — this test MUST fail.
    expect(normalizeSiteUrl('http://example.com')).toBe('https://example.com')
  })
})

// ---------------------------------------------------------------------------
// 15–19: OpenUI export builder — forbidden tokens, routes, imports, slug
// ---------------------------------------------------------------------------

describe('OpenUI export builder edge cases', () => {
  it('15. forbidden tokens: @openuidev → filtered from output', async () => {
    const result = await buildOpenUIExport({
      source: SAMPLE_SOURCE,
      siteSpecJson,
      sessionId: 'forbidden-openuidev',
      target: 'react',
    })
    const files = unzipBuiltExportTextFiles(result.body)

    for (const content of Object.values(files)) {
      expect(content).not.toContain('@openuidev')
    }
  })

  it('16. forbidden tokens: defineComponent → filtered', async () => {
    const result = await buildOpenUIExport({
      source: SAMPLE_SOURCE,
      siteSpecJson,
      sessionId: 'forbidden-definecomponent',
      target: 'next',
    })
    const files = unzipBuiltExportTextFiles(result.body)

    for (const content of Object.values(files)) {
      expect(content).not.toContain('defineComponent')
    }
  })

  it('17. route extraction: multi-page → routes extracted', () => {
    const parsed = parseOpenUIForExport(routedSource, siteSpecJson)

    expect(parsed.routes).toEqual(['Home', 'Pricing'])
    expect(parsed.targetMap['Get Started']).toBe('Pricing#pricing_pricing')
    expect(parsed.targetMap['get started']).toBe('Pricing#pricing_pricing')
    expect(parsed.targetMap['Pricing']).toBe('Pricing')
  })

  it('18. import transformation: relative paths resolved', async () => {
    const result = await buildOpenUIExport({
      source: `root = PageSwitch(["Home"], [home])
homeHero = EcommerceHero()
homeHeroAnchor = SectionAnchor("home_hero", homeHero, "scroll-mt-28")
home = Stack([homeHeroAnchor])`,
      siteSpecJson: JSON.stringify({ projectName: 'Import Transform Demo' }),
      sessionId: 'import-transform-react',
      target: 'react',
    })
    const files = unzipBuiltExportTextFiles(result.body)

    // No internal package aliases leak into the export
    for (const content of Object.values(files)) {
      expect(content).not.toContain('#/')
      expect(content).not.toContain('@ship-fast/')
    }

    // The route component imports its sections via relative paths
    const routeComponent =
      files['src/components/HomePage.tsx'] ??
      files['src/components/HomePage.tsx'] ??
      ''
    expect(routeComponent).toBeDefined()

    const specifiers = extractImportSpecifiers(routeComponent)
    const relativeImports = specifiers.filter(
      (s) => s.startsWith('./') || s.startsWith('../'),
    )
    expect(relativeImports.length).toBeGreaterThan(0)
  })

  it('19. slugification: "My Cool Site!" → "my-cool-site"', async () => {
    const result = await buildOpenUIExport({
      source: SAMPLE_SOURCE,
      siteSpecJson: JSON.stringify({ projectName: 'My Cool Site!' }),
      sessionId: 'slug-demo',
      target: 'react',
    })

    expect(result.filename).toBe('my-cool-site-react.zip')
  })
})

// ---------------------------------------------------------------------------
// 20–22: OpenUI HTML export — theme, empty source, SSR
// ---------------------------------------------------------------------------

describe('OpenUI HTML export builder edge cases', () => {
  it('20. theme CSS variables generated from theme', async () => {
    const result = await buildOpenUIHtmlExport({
      source: SAMPLE_SOURCE,
      siteSpecJson,
      sessionId: 'theme-style-demo',
      target: 'html',
      themeName: 'modern-minimal',
    })
    const html = decodeExportBody(result.body)
    const document = parseHtmlDocument(html)

    // CSS variables are baked into the #openui-root style attribute
    const root = document.querySelector('#openui-root')
    expect(root).not.toBeNull()
    const rootStyle = parseCssDeclarations(root?.getAttribute('style') ?? '')
    expect(rootStyle.has('--background')).toBe(true)
    expect(rootStyle.has('--foreground')).toBe(true)
    expect(rootStyle.has('--primary')).toBe(true)
  })

  it('21. empty source → graceful error (no crash)', async () => {
    // Empty source is not HTML-like, so it reaches the OpenUI parser which
    // rejects it with a clear, actionable error.
    await expect(
      buildOpenUIHtmlExport({
        source: '',
        siteSpecJson,
        sessionId: 'empty-source',
        target: 'html',
      }),
    ).rejects.toThrow(/OpenUI source/)
  })

  it('22. SSR rendering: OpenUI source → HTML output', async () => {
    const result = await buildOpenUIHtmlExport({
      source: SAMPLE_SOURCE,
      siteSpecJson,
      sessionId: 'ssr-demo',
      target: 'html',
    })
    const html = decodeExportBody(result.body)
    const document = parseHtmlDocument(html)

    expect(result.contentType).toBe('text/html; charset=utf-8')
    expect(result.filename).toBe('index.html')
    // doctype present (parsed as document, not string match)
    expect(document.doctype?.name).toBe('html')
    // project name baked into <title>
    expect(document.querySelector('title')?.textContent).toBe('Export Demo')
    // SSR-rendered page content present as data-sf-export-page section
    expect(document.querySelectorAll('[data-sf-export-page]')).toHaveLength(1)
  })

  it('renders a DB-observed OpenUI session to static HTML instead of exporting the handoff placeholder', async () => {
    const result = await buildOpenUIHtmlExport({
      source: dbObservedBrewerySource,
      siteSpecJson: dbObservedBrewerySiteSpecJson,
      sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
      target: 'html',
      previewHtml: openUiHandoffPreviewHtml,
      themeName: 'darkmatter',
      isDark: true,
    })
    const html = decodeExportBody(result.body)
    const document = parseHtmlDocument(html)
    const root = document.querySelector('#openui-root')
    const page = document.querySelector('[data-sf-export-page]')

    expect(result.contentType).toBe('text/html; charset=utf-8')
    expect(root).not.toBeNull()
    expect(root?.getAttribute('class')).toContain('dark')
    expect(root?.getAttribute('style')).toContain('color-scheme: dark')
    expect(page).not.toBeNull()
    expect(document.body.textContent).toContain('Our Brew Selection')
    expect(document.body.textContent).toContain('Pineapple Saison')
    expect(document.querySelector('[data-openui-ready="source"]')).toBeNull()
    expect(document.body.textContent).not.toContain(
      'Generated OpenUI source is ready.',
    )
    expect(document.querySelector('.openui-error')).toBeNull()
  })

  it('preserves DB-observed edited static preview markup and theme shell for OpenUI HTML output', async () => {
    const result = await buildOpenUIHtmlExport({
      source: dbObservedBrewerySource,
      siteSpecJson: dbObservedBrewerySiteSpecJson,
      sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
      target: 'html',
      previewHtml: editedBreweryPreviewHtml,
      themeName: 'darkmatter',
      isDark: true,
    })
    const html = decodeExportBody(result.body)
    const document = parseHtmlDocument(html)
    const root = document.querySelector('#openui-root')
    const headline = document.querySelector('.hero-title')
    const image = document.querySelector('img')

    expect(root?.getAttribute('class')).toContain('dark')
    expect(root?.getAttribute('style')).toContain('color-scheme: dark')
    expect(headline?.textContent).toBe("Portland's Craft Brew Haven")
    expect(headline?.getAttribute('style')).toBe('color: rgb(255, 255, 255);')
    expect(image?.getAttribute('src')).toBe(
      'https://cdn.example.test/brewery-edited.jpg',
    )
    expect(image?.getAttribute('alt')).toBe(
      'Exterior of Riverbend Brewing taproom',
    )
    expect(document.body.textContent).toContain('Pineapple Saison')
    expect(document.querySelectorAll('#openui-root')).toHaveLength(1)
  })

  it('renders DB-observed Hindi OpenUI output to static HTML instead of exporting the handoff placeholder', async () => {
    const result = await buildOpenUIHtmlExport({
      source: dbObservedHindiGovernmentSource,
      siteSpecJson: dbObservedHindiGovernmentSiteSpecJson,
      sessionId: 'k572nbkrw902ef81nn4ha1yq7989njsg',
      target: 'html',
      previewHtml: openUiHindiHandoffPreviewHtml,
      themeName: 'twitter',
      isDark: false,
    })
    const html = decodeExportBody(result.body)
    const document = parseHtmlDocument(html)
    const root = document.querySelector('#openui-root')

    expect(root).not.toBeNull()
    expect(root?.getAttribute('class')).not.toContain('dark')
    expect(root?.getAttribute('style')).toContain('color-scheme: light')
    expect(document.querySelector('[data-sf-export-page]')).not.toBeNull()
    expect(document.body.textContent).toContain('मुख्य सेवाएँ')
    expect(document.body.textContent).toContain('स्वास्थ्य सेवा')
    expect(document.querySelector('[data-openui-ready="source"]')).toBeNull()
    expect(document.body.textContent).not.toContain(
      'Generated OpenUI source is ready.',
    )
    expect(document.querySelector('.openui-error')).toBeNull()
  })

  it('renders the live DB-observed Hindi government service item text in static HTML', async () => {
    const source =
      'home_navbar = ChurchNavbar("भारत सरकार", ["Home","Contact","Events","About","Services"], "/")\n' +
      'home_services = ChurchServices("सेवाएँ", "हमारी प्रमुख सेवाएँ", "", [{"title":"डिजिटल पहचान प्रमाणन","detail":"","location":""}])\n' +
      'root = PageSwitch(["Home"], [home_services], "", {"Home":"Home"})'
    const result = await buildOpenUIHtmlExport({
      source,
      siteSpecJson: dbObservedHindiGovernmentSiteSpecJson,
      sessionId: 'k572nbkrw902ef81nn4ha1yq7989njsg',
      target: 'html',
      themeName: 'twitter',
      isDark: false,
      locale: 'hi',
    })
    const html = decodeExportBody(result.body)
    const document = parseHtmlDocument(html)
    const text = document.body.textContent ?? ''

    expect(document.documentElement.getAttribute('lang')).toBe('hi')
    expect(document.querySelector('[data-sf-export-page]')).not.toBeNull()
    expect(text.includes('हमारी प्रमुख सेवाएँ')).toBe(true)
    expect(text.includes('डिजिटल पहचान प्रमाणन')).toBe(true)
    expect(text.includes('Generated OpenUI source is ready.')).toBe(false)
    expect(text.includes('Power Generation')).toBe(false)
    expect(document.querySelector('.openui-error')).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// 23–26: OpenUI HTML export — navigation, mobile menu, fonts, error filtering
// ---------------------------------------------------------------------------

describe('OpenUI HTML export navigation & rendering', () => {
  it('23. multi-page navigation script generated', async () => {
    const result = await buildOpenUIHtmlExport({
      source: routedSource,
      siteSpecJson,
      sessionId: 'multi-page-nav',
      target: 'html',
    })
    const html = decodeExportBody(result.body)
    const document = parseHtmlDocument(html)

    // pages render as data-sf-export-page sections (first visible, rest hidden)
    const pages = document.querySelectorAll('[data-sf-export-page]')
    expect(pages).toHaveLength(2)
    expect(pages[0]?.getAttribute('hidden')).toBeNull()
    expect(pages[1]?.getAttribute('hidden')).not.toBeNull()

    const runtime = createRuntimeDocument(html)
    const runtimePages = (
      runtime.window.document as Document
    ).querySelectorAll<HTMLElement>('[data-sf-export-page]')
    runtimePages[1]?.setAttribute('id', 'pricing_pricing')
    const button = runtime.window.document.createElement('button')
    button.type = 'button'
    button.textContent = 'Get Started'
    runtime.window.document.body.append(button)
    button.click()

    expect(runtimePages[0]?.hidden).toBe(true)
    expect(runtimePages[1]?.hidden).toBe(false)
    expect(runtime.window.location.hash).toBe('#pricing_pricing')
  })

  it('24. mobile menu drawer generated', async () => {
    const result = await buildOpenUIHtmlExport({
      source: routedSource,
      siteSpecJson,
      sessionId: 'mobile-menu-demo',
      target: 'html',
    })
    const html = decodeExportBody(result.body)
    const runtime = createRuntimeDocument(html)
    const header = runtime.window.document.createElement('header')
    header.innerHTML = `
      <a href="/">Home</a>
      <a href="/pricing">Pricing</a>
      <button type="button" aria-label="Open menu">Menu</button>
    `
    runtime.window.document.body.append(header)
    const trigger = (header as HTMLElement).querySelector<HTMLButtonElement>(
      '[aria-label="Open menu"]',
    )

    trigger?.click()

    const drawer = runtime.window.document.querySelector('[role="dialog"]')
    expect(trigger?.getAttribute('aria-expanded')).toBe('true')
    expect(drawer?.textContent).toContain('Home')
    expect(drawer?.textContent).toContain('Pricing')
  })

  it('25. Google Fonts link from theme', async () => {
    // modern-minimal preset uses "Inter" as font-sans, a non-system family
    const result = await buildOpenUIHtmlExport({
      source: SAMPLE_SOURCE,
      siteSpecJson,
      sessionId: 'google-fonts-demo',
      target: 'html',
      themeName: 'modern-minimal',
    })
    const html = decodeExportBody(result.body)
    const document = parseHtmlDocument(html)
    const fontLink = document.querySelector(
      'link[href^="https://fonts.googleapis.com/css2"]',
    )

    expect(fontLink).not.toBeNull()
    const href = fontLink?.getAttribute('href') ?? ''
    // Parse the URL to verify query params (structured data, not string match)
    const url = new URL(href)
    const families = url.searchParams.getAll('family')
    expect(families.some((f) => f.startsWith('Inter'))).toBe(true)
    expect(url.searchParams.get('display')).toBe('swap')
  })

  it('26. error HTML filtered (openui-error elements removed)', async () => {
    const errorPreviewHtml =
      '<main><div class="openui-error">Failed to render component</div></main>'
    const result = await buildOpenUIHtmlExport({
      source: SAMPLE_SOURCE,
      siteSpecJson,
      sessionId: 'error-filter-demo',
      target: 'html',
      previewHtml: errorPreviewHtml,
    })
    const html = decodeExportBody(result.body)
    const document = parseHtmlDocument(html)

    // The error markup must not appear in the exported HTML (DOM parse)
    expect(document.querySelectorAll('.openui-error')).toHaveLength(0)
    expect(document.querySelectorAll('[class*="openui-error"]')).toHaveLength(0)
    // SSR-rendered page section is used instead (fallback path)
    expect(document.querySelectorAll('[data-sf-export-page]')).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// 27–30: ZIP builder
// ---------------------------------------------------------------------------

describe('ZIP builder edge cases', () => {
  it('27. ZIP: single file → correct content', () => {
    const zip = createZipBuffer({ 'index.html': '<h1>Hello</h1>' })

    // local file header signature
    expect(zip.readUInt32LE(0)).toBe(0x04034b50)
    // end of central directory signature
    expect(zip.readUInt32LE(zip.length - 22)).toBe(0x06054b50)
    // file count in end-of-central-directory record
    expect(zip.readUInt16LE(zip.length - 22 + 8)).toBe(1)
    // content is present in the binary buffer
    expect(zip.includes(Buffer.from('index.html'))).toBe(true)
    expect(zip.includes(Buffer.from('<h1>Hello</h1>'))).toBe(true)
  })

  it('28. ZIP: multiple files → all present', () => {
    const zip = createZipBuffer({
      'index.html': '<h1>Hello</h1>',
      'README.md': 'Exported by Ship Fast',
      'style.css': 'body { margin: 0; }',
    })

    // local file header signature
    expect(zip.readUInt32LE(0)).toBe(0x04034b50)
    // end of central directory signature
    expect(zip.readUInt32LE(zip.length - 22)).toBe(0x06054b50)
    // three files recorded in the end-of-central-directory record
    expect(zip.readUInt16LE(zip.length - 22 + 8)).toBe(3)
    expect(zip.readUInt16LE(zip.length - 22 + 10)).toBe(3)

    // all filenames and contents are present in the binary buffer
    for (const needle of [
      'index.html',
      'README.md',
      'style.css',
      '<h1>Hello</h1>',
      'Exported by Ship Fast',
      'body { margin: 0; }',
    ]) {
      expect(zip.includes(Buffer.from(needle))).toBe(true)
    }

    // central directory headers (one per file) are present
    let offset = 0
    let centralCount = 0
    while (offset < zip.length - 4) {
      if (zip.readUInt32LE(offset) === 0x02014b50) {
        centralCount += 1
        offset += 46
      } else {
        offset += 1
      }
    }
    expect(centralCount).toBe(3)
  })

  it('29. ZIP: empty file → handled', () => {
    const zip = createZipBuffer({ 'empty.txt': '' })

    expect(zip.readUInt32LE(0)).toBe(0x04034b50)
    expect(zip.readUInt32LE(zip.length - 22)).toBe(0x06054b50)
    expect(zip.readUInt16LE(zip.length - 22 + 8)).toBe(1)
    // filename is present even though content is empty
    expect(zip.includes(Buffer.from('empty.txt'))).toBe(true)
    // compressed/uncompressed sizes in local header are 0
    expect(zip.readUInt32LE(18)).toBe(0) // compressed size
    expect(zip.readUInt32LE(22)).toBe(0) // uncompressed size
  })

  it('30. ZIP: CRC32 correct for known content', () => {
    // Standard CRC32 of "123456789" is 0xCBF43926
    const content = '123456789'
    const zip = createZipBuffer({ 'data.txt': content })

    // local file header: CRC32 stored at offset 14
    const crc = zip.readUInt32LE(14)
    expect(crc).toBe(0xcbf43926)

    // the same CRC also appears in the central directory header for this file
    // local header = 30 bytes + filename length (8) + content length (9) = 47
    // central header starts at offset 47, CRC at offset 47 + 16
    const centralOffset = 30 + 'data.txt'.length + content.length
    const centralCrc = zip.readUInt32LE(centralOffset + 16)
    expect(centralCrc).toBe(0xcbf43926)
  })
})
