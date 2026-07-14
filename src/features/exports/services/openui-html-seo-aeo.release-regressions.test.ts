// @vitest-environment jsdom

import { beforeAll, describe, expect, it } from 'vitest'

import { buildOpenUIHtmlExport } from './openui-html-export-builder'

const localizedDescription =
  'हर सुबह ताज़ी कारीगर रोटी, पेस्ट्री और केक, स्थानीय पिकअप और डिलीवरी के साथ।'
const localizedTitle = 'स्वीट क्रम्ब बेकरी | ताज़ी रोटी और पेस्ट्री'
const canonicalUrl = 'https://sweet-crumb.example/'

const localizedBakerySource = `
home_navbar = BakeryNavbar("स्वीट क्रम्ब बेकरी", ["होम","मेनू"], "अभी ऑर्डर करें", "मेनू", "0", "")
home_menu = BakeryMenu({"heading":"दैनिक मेनू","description":"आज ताज़ा बेक किया गया","breads":[{"name":"खट्टी रोटी","description":"धीमी आंच पर पकी","price":"₹250"}],"pastries":[],"cakes":[],"addLabel":"कार्ट में जोड़ें"})
home = Stack([home_navbar,home_menu])
root = PageSwitch(["होम"], [home], "", {"होम":"होम","अभी ऑर्डर करें":"होम"})
`

const fallbackSource = `
home_navbar = BakeryNavbar()
home_hero = BakeryHero()
home = Stack([home_navbar,home_hero])
root = PageSwitch(["Home"], [home], "", {"Home":"Home"})
`

const fallbackPreviewHtml = `
<div id="openui-root">
  <header>
    <nav>Home Menu</nav>
    <button type="button" aria-label="Search">Search products</button>
    <button type="button">Sign in</button>
    <button type="button" aria-label="Cart">0</button>
  </header>
  <main>
    <h1>Sweet Crumb Bakery</h1>
    <p>Fresh artisan bread, pastries, and cakes baked every morning.</p>
  </main>
</div>
`

let localizedHtml = ''
let fallbackHtml = ''

function parseHtml(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function readJsonLd(document: Document): Record<string, unknown>[] {
  return Array.from(
    document.querySelectorAll<HTMLScriptElement>(
      'script[type="application/ld+json"]',
    ),
  ).flatMap((script) => {
    const parsed: unknown = JSON.parse(script.textContent ?? 'null')
    if (Array.isArray(parsed)) return parsed.filter(isRecord)
    return isRecord(parsed) ? [parsed] : []
  })
}

function readMeta(document: Document, name: string): string | null {
  return (
    document
      .querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
      ?.getAttribute('content') ?? null
  )
}

function readProperty(document: Document, property: string): string | null {
  return (
    document
      .querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
      ?.getAttribute('content') ?? null
  )
}

function readSchemaType(entry: Record<string, unknown>): string {
  return typeof entry['@type'] === 'string' ? entry['@type'] : ''
}

function readRelativeDependencies(document: Document): string[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[src],[href]'))
    .flatMap((element) => {
      const value = element.getAttribute('src') ?? element.getAttribute('href')
      return typeof value === 'string' ? [value] : []
    })
    .filter(
      (value) =>
        value.startsWith('/') ||
        value.startsWith('./') ||
        value.startsWith('../'),
    )
}

beforeAll(async () => {
  const localized = await buildOpenUIHtmlExport({
    includeBadge: false,
    isDark: false,
    locale: 'hi',
    sessionId: 'localized-seo-aeo-release',
    siteSpecJson: JSON.stringify({
      genui: { category: 'Bakery', version: 1 },
      locale: 'hi',
      pages: [
        {
          route: '/',
          sections: [
            {
              id: 'daily-menu',
              items: [
                {
                  body: 'धीमी आंच पर पकी कारीगर रोटी',
                  price: '250',
                  title: 'खट्टी रोटी',
                },
              ],
              type: 'product-detail',
            },
          ],
          seo: {
            description: localizedDescription,
            title: localizedTitle,
          },
          title: localizedTitle,
        },
      ],
      projectName: 'स्वीट क्रम्ब बेकरी',
      seo: {
        description: localizedDescription,
        locale: 'hi_IN',
        ogImage: 'https://sweet-crumb.example/social-preview.jpg',
        ogImageAlt: 'स्वीट क्रम्ब बेकरी का ताज़ा बेकरी प्रदर्शन',
        siteName: 'स्वीट क्रम्ब बेकरी',
        siteUrl: canonicalUrl,
        twitterCard: 'summary_large_image',
      },
    }),
    source: localizedBakerySource,
    target: 'html',
    themeName: 'vintage-paper',
  })
  localizedHtml = typeof localized.body === 'string' ? localized.body : ''

  const fallback = await buildOpenUIHtmlExport({
    includeBadge: false,
    previewHtml: fallbackPreviewHtml,
    sessionId: 'fallback-description-release',
    siteSpecJson: JSON.stringify({
      genui: { category: 'Bakery', version: 1 },
      projectName: 'Sweet Crumb Bakery',
    }),
    source: fallbackSource,
    target: 'html',
  })
  fallbackHtml = typeof fallback.body === 'string' ? fallback.body : ''
}, 180_000)

describe('standalone OpenUI HTML SEO and AEO release gates', () => {
  it('keeps title, descriptions, locale, canonical, and social metadata consistent', () => {
    const document = parseHtml(localizedHtml)

    expect(document.documentElement.lang).toBe('hi')
    expect(document.title).toBe(localizedTitle)
    expect(readMeta(document, 'description')).toBe(localizedDescription)
    expect(readMeta(document, 'robots')).toBe('index, follow')
    expect(
      document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href,
    ).toBe(canonicalUrl)
    expect(readProperty(document, 'og:title')).toBe(localizedTitle)
    expect(readProperty(document, 'og:description')).toBe(localizedDescription)
    expect(readProperty(document, 'og:url')).toBe(canonicalUrl)
    expect(readProperty(document, 'og:locale')).toBe('hi_IN')
    expect(readProperty(document, 'og:image')).toBe(
      'https://sweet-crumb.example/social-preview.jpg',
    )
    expect(readMeta(document, 'twitter:card')).toBe('summary_large_image')
    expect(readMeta(document, 'twitter:title')).toBe(localizedTitle)
    expect(readMeta(document, 'twitter:description')).toBe(localizedDescription)
    expect(readMeta(document, 'twitter:image')).toBe(
      'https://sweet-crumb.example/social-preview.jpg',
    )
  })

  it('emits valid domain-specific JSON-LD instead of describing a bakery as software', () => {
    const document = parseHtml(localizedHtml)
    const entries = readJsonLd(document)
    const types = entries.map(readSchemaType)

    expect.soft(entries.length).toBeGreaterThan(0)
    expect.soft(types).toContain('WebSite')
    expect.soft(types).toContain('WebPage')
    expect.soft(types).toContain('Organization')
    expect.soft(types).toContain('Product')
    expect.soft(types).toContain('Bakery')
    expect.soft(types).not.toContain('SoftwareApplication')
    expect
      .soft(
        entries.every((entry) => entry['@context'] === 'https://schema.org'),
      )
      .toBe(true)
  })

  it('derives a meaningful fallback description without navigation or overlay chrome', () => {
    const document = parseHtml(fallbackHtml)
    const description = readMeta(document, 'description')

    expect(description).toBe(
      'Fresh artisan bread, pastries, and cakes baked every morning.',
    )
    expect(description).not.toMatch(/Search products|Sign in|\bCart\b/)
  })

  it('ships semantic primary content and complete precompiled utility CSS', () => {
    const document = parseHtml(localizedHtml)
    const styleText = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n')

    expect.soft(document.querySelectorAll('main')).toHaveLength(1)
    expect.soft(document.querySelectorAll('h1')).toHaveLength(1)
    expect.soft(styleText.length).toBeGreaterThan(500_000)
    expect.soft(styleText).toMatch(/\.text-4xl\b/)
    expect.soft(styleText).toMatch(/\.font-semibold\b/)
    expect.soft(styleText).toMatch(/\.lg\\:text-6xl\b/)
  })

  it('has no relative dependency that breaks when only index.html is hosted', () => {
    const document = parseHtml(localizedHtml)

    expect(readRelativeDependencies(document)).toEqual([])
    expect(readJsonLd(document).length).toBeGreaterThan(0)
  })
})
