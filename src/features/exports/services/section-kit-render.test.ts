import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'

import { buildOpenUIHtmlExport } from './openui-html-export-builder'

const siteSpecJson = JSON.stringify({ projectName: 'Kit Render' })

const renderSource = async (source: string) => {
  const result = await buildOpenUIHtmlExport({
    source,
    siteSpecJson,
    sessionId: 'test-session',
    target: 'html',
  })
  return typeof result.body === 'string'
    ? result.body
    : new TextDecoder().decode(result.body)
}

const createStaticDom = (html: string) => {
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1]
  if (!script) throw new Error('Expected exported HTML to include runtime')
  const dom = new JSDOM(html.replace(/<style>[\s\S]*?<\/style>/g, ''), {
    pretendToBeVisual: true,
    url: 'http://localhost/',
  })
  dom.window.requestAnimationFrame = (callback: (time: number) => void) => {
    dom.window.setTimeout(() => callback(Date.now()), 0)
    return 1
  }
  new Function('window', `with (window) { ${script} }`)(dom.window)
  return dom
}

// V3 deliberately uses the generic registry. These tests protect the same
// export boundary as the retired family fixtures: a composed navigation block
// renders, its static mobile drawer works, and route navigation remains live.
describe('generic registry navigation renders through the OpenUI runtime', () => {
  it('renders Navbar with semantic labels', async () => {
    const html = await renderSource(
      'root = Navbar("Saffron & Sage", ["Menu", "About", "Gallery"])',
    )

    expect(html).not.toContain('Failed to render')
    expect(html).toContain('Saffron &amp; Sage')
    expect(html).toContain('Menu')
    expect(html).toContain('About')
  })

  it('opens a static drawer from a Navbar mobile trigger', async () => {
    const dom = createStaticDom(
      await renderSource(
        'root = Navbar("Acme", ["Features", "Pricing"], "Get Started")',
      ),
    )
    await new Promise((resolve) => dom.window.setTimeout(resolve, 0))

    const trigger = dom.window.document.querySelector(
      '[aria-label="Open menu"]',
    )
    if (!(trigger instanceof dom.window.HTMLButtonElement)) {
      throw new Error('Expected exported Navbar to include a mobile trigger')
    }

    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    trigger.click()
    await new Promise((resolve) => dom.window.setTimeout(resolve, 20))

    const dialog = dom.window.document.querySelector('[role="dialog"]')
    expect(dialog?.textContent).toContain('Features')
    expect(dialog?.textContent).toContain('Pricing')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('routes semantic drawer labels to a PageSwitch page', async () => {
    const dom = createStaticDom(
      await renderSource(`
root = PageSwitch(["Home", "Lookbook"], [home, lookbook])
home = Stack([Navbar("Atelier", ["Explore Full Lookbook"]), Text("Home page")])
lookbook = Stack([Text("Lookbook page")])`),
    )
    await new Promise((resolve) => dom.window.setTimeout(resolve, 0))

    const pages = Array.from(
      dom.window.document.querySelectorAll('[data-sf-export-page]'),
    )
    const homePage = pages.find(
      (page) => page.getAttribute('data-sf-export-page') === 'Home',
    )
    const lookbookPage = pages.find(
      (page) => page.getAttribute('data-sf-export-page') === 'Lookbook',
    )
    const trigger = dom.window.document.querySelector(
      '[aria-label="Open menu"]',
    )
    if (!(trigger instanceof dom.window.HTMLButtonElement)) {
      throw new Error('Expected exported Navbar to include a mobile trigger')
    }

    trigger.click()
    await new Promise((resolve) => dom.window.setTimeout(resolve, 20))
    const drawerButton = Array.from(
      dom.window.document.querySelectorAll('[role="dialog"] button'),
    ).find((button) => button.textContent === 'Explore Full Lookbook')
    if (!(drawerButton instanceof dom.window.HTMLButtonElement)) {
      throw new Error('Expected static drawer to include semantic nav item')
    }
    drawerButton.click()
    await new Promise((resolve) => dom.window.setTimeout(resolve, 20))

    expect(homePage?.hasAttribute('hidden')).toBe(true)
    expect(lookbookPage?.hasAttribute('hidden')).toBe(false)
  })
})
