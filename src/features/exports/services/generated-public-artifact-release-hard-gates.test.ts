import { JSDOM } from 'jsdom'
import { beforeAll, describe, expect, it } from 'vitest'

import { buildOpenUIArtifactFiles } from './openui-artifact-files'

type Target = 'html' | 'lakebed' | 'next' | 'react'
type ArtifactFiles = Record<string, string>
type ArtifactEntry = { files: ArtifactFiles; target: Target }

const targets: Target[] = ['html', 'react', 'next', 'lakebed']
const siteOrigin = 'https://release-contract.example'
const expectedPublicUrls = [`${siteOrigin}/`, `${siteOrigin}/menu`]
const source = `home_title = Text('Release contract home')
home = Stack([home_title])
menu_title = Text('Release contract menu')
menu = Stack([menu_title])
root = PageSwitch(['Home','Menu'], [home,menu], '', {'Home':'Home','Menu':'Menu'})`
const previewHtml = `<!doctype html>
<html lang="en">
  <head><title>Release Contract</title></head>
  <body>
    <div id="openui-root">
      <section data-sf-export-page="Home"><main><h1>Release contract home</h1></main></section>
      <section data-sf-export-page="Menu" hidden><main><h1>Release contract menu</h1></main></section>
    </div>
  </body>
</html>`
const siteSpecJson = JSON.stringify({
  locale: 'en',
  pages: [
    {
      route: '/',
      title: 'Release Contract',
      seo: {
        description: 'Release contract home description.',
        title: 'Release Contract',
      },
    },
    {
      route: '/menu',
      title: 'Menu',
      seo: {
        description: 'Release contract menu description.',
        title: 'Menu | Release Contract',
      },
    },
  ],
  projectName: 'Release Contract',
  seo: {
    description: 'Release contract home description.',
    locale: 'en_US',
    siteName: 'Release Contract',
    siteUrl: siteOrigin,
  },
})

let artifacts: Record<Target, ArtifactFiles>
let hostileMetadataHtml = ''
let unsafeUrlHtml = ''
let arabicHtml = ''

function artifactFor(entries: ArtifactEntry[], target: Target) {
  const entry = entries.find((candidate) => candidate.target === target)
  if (entry === undefined) throw new Error(`Missing ${target} artifact`)
  return entry.files
}

function fileNamed(files: ArtifactFiles, basename: string) {
  const path = Object.keys(files).find(
    (candidate) => candidate === basename || candidate.endsWith(`/${basename}`),
  )
  return path === undefined ? '' : (files[path] ?? '')
}

function sitemapUrls(files: ArtifactFiles) {
  const xml = fileNamed(files, 'sitemap.xml')
  if (xml === '') return []
  const dom = new JSDOM(xml, { contentType: 'text/xml' })
  try {
    return [...dom.window.document.querySelectorAll('loc')]
      .map((node) => node.textContent?.trim() ?? '')
      .filter(Boolean)
  } finally {
    dom.window.close()
  }
}

function robotsSitemapUrls(files: ArtifactFiles) {
  return fileNamed(files, 'robots.txt')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.toLowerCase().startsWith('sitemap:'))
    .map((line) => line.slice(line.indexOf(':') + 1).trim())
}

function llmsUrls(files: ArtifactFiles) {
  return fileNamed(files, 'llms.txt')
    .split(/\s+/)
    .map((token) => token.replace(/^[<(\[]+|[>)\],.]+$/g, ''))
    .filter(
      (token) => token.startsWith('http://') || token.startsWith('https://'),
    )
}

function htmlDocument(html: string): Document {
  return new JSDOM(html).window.document
}

function jsonLdFailures(document: Document) {
  return [
    ...document.querySelectorAll<HTMLScriptElement>(
      'script[type="application/ld+json"]',
    ),
  ].flatMap((script, index) => {
    try {
      JSON.parse(script.textContent ?? '')
      return []
    } catch (error) {
      return [
        `script ${index}: ${error instanceof Error ? error.message : String(error)}`,
      ]
    }
  })
}

function unsafeDomUrls(document: Document) {
  return [
    ...document.querySelectorAll<HTMLElement>(
      '[href],[src],[action],[formaction]',
    ),
  ]
    .flatMap((element) =>
      ['href', 'src', 'action', 'formaction'].flatMap((attribute) => {
        const value = element.getAttribute(attribute)
        return value === null ? [] : [value.trim()]
      }),
    )
    .filter((value) => {
      const scheme = value.split(':', 1)[0]?.toLowerCase() ?? ''
      return (
        scheme === 'javascript' ||
        scheme === 'vbscript' ||
        value.toLowerCase().startsWith('data:text/html')
      )
    })
}

beforeAll(async () => {
  const built = await Promise.all(
    targets.map(async (target) => {
      const result = await buildOpenUIArtifactFiles({
        includeBadge: false,
        locale: 'en',
        previewHtml,
        sessionId: `public-contract-${target}`,
        siteSpecJson,
        source,
        syncSecret: 'release-public-contract-sync-secret',
        target,
      })
      return { files: result.files, target }
    }),
  )
  artifacts = {
    html: artifactFor(built, 'html'),
    lakebed: artifactFor(built, 'lakebed'),
    next: artifactFor(built, 'next'),
    react: artifactFor(built, 'react'),
  }

  const injection = `</script><script id="metadata-injection">globalThis.metadataInjected = true</script>`
  const hostile = await buildOpenUIArtifactFiles({
    includeBadge: false,
    previewHtml: '<main><h1>Hostile metadata fixture</h1></main>',
    sessionId: 'hostile-metadata',
    siteSpecJson: JSON.stringify({
      locale: 'en',
      pages: [
        {
          route: '/',
          seo: { description: injection, title: injection },
          title: injection,
        },
      ],
      projectName: injection,
      seo: {
        description: injection,
        siteName: injection,
        siteUrl: 'https://hostile-metadata.example',
      },
    }),
    source,
    target: 'html',
  })
  hostileMetadataHtml = hostile.files['index.html'] ?? ''

  const unsafe = await buildOpenUIArtifactFiles({
    includeBadge: false,
    previewHtml: `<!doctype html><html><body><main>
      <a href="javascript:globalThis.linkExecuted=true">Unsafe link</a>
      <img alt="Unsafe image" src="vbscript:msgbox('unsafe')">
      <form action="data:text/html,<script>globalThis.formExecuted=true</script>">
        <button formaction="javascript:globalThis.buttonExecuted=true">Submit</button>
      </form>
    </main></body></html>`,
    sessionId: 'unsafe-url-artifact',
    source,
    target: 'html',
  })
  unsafeUrlHtml = unsafe.files['index.html'] ?? ''

  const arabic = await buildOpenUIArtifactFiles({
    includeBadge: false,
    locale: 'ar',
    previewHtml: '<main><h1>مخبز الإصدار</h1><p>خبز طازج كل صباح</p></main>',
    sessionId: 'arabic-release-artifact',
    siteSpecJson: JSON.stringify({
      locale: 'ar',
      pages: [
        {
          route: '/',
          seo: { description: 'خبز طازج كل صباح', title: 'مخبز الإصدار' },
          title: 'مخبز الإصدار',
        },
      ],
      projectName: 'مخبز الإصدار',
    }),
    source: `home = Text('مخبز الإصدار')
root = PageSwitch(['الرئيسية'], [home], '', {'الرئيسية':'Home'})`,
    target: 'html',
  })
  arabicHtml = arabic.files['index.html'] ?? ''
}, 180_000)

describe('generated public metadata parity', () => {
  it.each(targets)(
    '%s exports publish the complete route inventory',
    (target) => {
      expect(sitemapUrls(artifacts[target]).sort()).toEqual(
        [...expectedPublicUrls].sort(),
      )
    },
  )

  it.each(targets)(
    '%s robots discovery points at the exported sitemap on the canonical origin',
    (target) => {
      expect(robotsSitemapUrls(artifacts[target])).toEqual([
        `${siteOrigin}/sitemap.xml`,
      ])
    },
  )

  it.each(targets)(
    '%s answer-engine metadata references every public page without fallback domains',
    (target) => {
      const urls = llmsUrls(artifacts[target])
      expect(urls).toEqual(expect.arrayContaining(expectedPublicUrls))
      expect(urls.every((value) => new URL(value).origin === siteOrigin)).toBe(
        true,
      )
    },
  )

  it('keeps standalone canonical, sitemap, robots, and llms metadata on one origin', () => {
    const document = htmlDocument(artifacts.html['index.html'] ?? '')
    const canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    )
    const urls = [
      canonical?.href ?? '',
      ...sitemapUrls(artifacts.html),
      ...robotsSitemapUrls(artifacts.html),
      ...llmsUrls(artifacts.html),
    ].filter(Boolean)

    expect(canonical?.href).toBe(`${siteOrigin}/`)
    expect(urls.every((value) => new URL(value).origin === siteOrigin)).toBe(
      true,
    )
  })

  it('emits parseable standalone JSON-LD for public routes', () => {
    const document = htmlDocument(artifacts.html['index.html'] ?? '')
    const scripts = document.querySelectorAll(
      'script[type="application/ld+json"]',
    )

    expect(scripts.length).toBeGreaterThan(0)
    expect(jsonLdFailures(document)).toEqual([])
  })
})

describe('generated public artifact hostile-input behavior', () => {
  it('escapes metadata that attempts to terminate JSON-LD and create a script', () => {
    const document = htmlDocument(hostileMetadataHtml)
    const view = document.defaultView

    expect(document.querySelector('#metadata-injection')).toBeNull()
    expect(jsonLdFailures(document)).toEqual([])
    expect(
      view === null ? undefined : Reflect.get(view, 'metadataInjected'),
    ).toBeUndefined()
  })

  it('removes executable URL schemes from exported markup', () => {
    const document = htmlDocument(unsafeUrlHtml)

    expect(unsafeDomUrls(document)).toEqual([])
  })

  it('marks Arabic standalone exports with language and RTL direction', () => {
    const document = htmlDocument(arabicHtml)

    expect(document.documentElement.lang).toBe('ar')
    expect(document.documentElement.dir).toBe('rtl')
    expect(document.body.textContent).toContain('مخبز الإصدار')
  })
})
