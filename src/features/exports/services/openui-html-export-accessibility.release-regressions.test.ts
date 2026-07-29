import { JSDOM } from 'jsdom'
import { beforeAll, describe, expect, it } from 'vitest'

import { buildOpenUIHtmlExport } from './openui-html-export-builder'

// V3 removed commerce-specific Bakery capsules. Keep this release gate on the
// portable HTML contract: localized routes, names, IDs, and keyboard controls.
const localizedSource = `home = Stack([Navbar({"brand":"स्वीट क्रम्ब बेकरी","links":["होम","मेनू"],"cta":"अभी ऑर्डर करें"}), ProductGrid({"heading":"दैनिक मेनू","products":[{"name":"खट्टी रोटी","price":"₹250","imageAlt":"धीमी आंच पर पकी कारीगर रोटी"}]})])
menu = Stack([Navbar({"brand":"स्वीट क्रम्ब बेकरी","links":["होम","मेनू"],"cta":"अभी ऑर्डर करें"}), Text("मेनू पृष्ठ")])
root = PageSwitch(["होम","मेनू"], [home,menu], "", {"होम":"home","मेनू":"menu"})`

let artifactHtml = ''

beforeAll(async () => {
  const built = await buildOpenUIHtmlExport({
    includeBadge: false,
    isDark: false,
    locale: 'hi',
    sessionId: 'localized-accessibility-release',
    siteSpecJson: JSON.stringify({ locale: 'hi', projectName: 'स्वीट क्रम्ब बेकरी' }),
    source: localizedSource,
    target: 'html',
    themeName: 'modern-minimal',
  })
  artifactHtml = typeof built.body === 'string' ? built.body : ''
}, 180_000)

const openArtifact = () =>
  new JSDOM(artifactHtml, {
    pretendToBeVisual: true,
    runScripts: 'dangerously',
    url: 'https://offline-export.test/index.html',
  })

const accessibleName = (element: HTMLElement) =>
  element.getAttribute('aria-label')?.trim() ||
  element.textContent?.replace(/\s+/g, ' ').trim() ||
  ''

describe('OpenUI standalone HTML accessibility release regressions', () => {
  it('renders localized route containers with one visible route', () => {
    const dom = openArtifact()
    try {
      const pages = Array.from(dom.window.document.querySelectorAll<HTMLElement>('[data-export-page],[data-sf-export-page]'))
      expect(pages).toHaveLength(2)
      expect(pages.filter((page) => !page.hidden)).toHaveLength(1)
      expect(pages.map((page) => page.getAttribute('data-export-page') ?? page.getAttribute('data-sf-export-page'))).toEqual(['होम', 'मेनू'])
    } finally {
      dom.window.close()
    }
  })

  it('gives every generated interactive control a non-empty accessible name', () => {
    const dom = openArtifact()
    try {
      const controls = Array.from(dom.window.document.querySelectorAll<HTMLElement>('button,a,input,select,textarea'))
      expect(controls.length).toBeGreaterThan(0)
      expect(controls.filter((control) => !accessibleName(control))).toEqual([])
    } finally {
      dom.window.close()
    }
  })

  it('keeps every exported ARIA reference resolvable', () => {
    const dom = openArtifact()
    try {
      const unresolved = Array.from(dom.window.document.querySelectorAll<HTMLElement>('[aria-controls],[aria-describedby],[aria-labelledby]'))
        .flatMap((element) => ['aria-controls', 'aria-describedby', 'aria-labelledby'].flatMap((attribute) => (element.getAttribute(attribute) ?? '').split(/\s+/).filter(Boolean)))
        .filter((id) => !dom.window.document.getElementById(id))
      expect(unresolved).toEqual([])
    } finally {
      dom.window.close()
    }
  })

  it('uses canonical ASCII identifiers while keeping localized visible content', () => {
    const dom = openArtifact()
    try {
      const ids = Array.from(dom.window.document.querySelectorAll<HTMLElement>('[id]')).map((element) => element.id)
      expect(ids.filter((id) => /[\u0900-\u097f]/.test(id))).toEqual([])
      expect(dom.window.document.body.textContent).toContain('खट्टी रोटी')
    } finally {
      dom.window.close()
    }
  })
})
