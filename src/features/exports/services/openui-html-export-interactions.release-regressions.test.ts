import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'

import { buildOpenUIHtmlExport } from './openui-html-export-builder'

const bakerySource = `
home_navbar = Navbar({"brand":"Sweet Crumb Bakery","links":["Home","Menu"]})
home_hero = SplitHero({"heading":"Fresh from the oven","primaryCta":"Order now"})
home = Stack([home_navbar, home_hero])
root = PageSwitch(["Home"], [home], "", {"Home":"Home"})
`

const bakeryPreviewHtml = `
<div id="openui-root">
  <section data-sf-export-page="Home">
    <header data-openui-component="Navbar">
      <button type="button" aria-label="Cart">
        Cart
        <span>0</span>
      </button>
    </header>
    <section data-openui-component="SplitHero">
      <button
        type="button"
        aria-label="Add to Cart Chocolate Chip Cookie"
        aria-busy="false"
      >
        Add to Cart
      </button>
    </section>
  </section>
</div>
`

const localizedBakeryPreviewHtml = `
<div id="openui-root">
  <section data-sf-export-page="Home">
    <header data-openui-component="Navbar">
      <button type="button">होम</button>
      <button type="button">मेनू</button>
      <button type="button" aria-label="Cart">
        Cart
        <span>0</span>
      </button>
    </header>
    <section data-openui-component="SplitHero">
      <button
        type="button"
        aria-label="कार्ट में जोड़ें Chocolate Chip Cookie"
        aria-busy="false"
      >
        कार्ट में जोड़ें
      </button>
    </section>
  </section>
  <section data-sf-export-page="Menu" hidden>
    <h1>दैनिक मेनू</h1>
  </section>
</div>
`

function findButtonByText(
  document: Document,
  text: string,
): HTMLButtonElement | undefined {
  return Array.from(
    document.querySelectorAll<HTMLButtonElement>('button'),
  ).find((button) => button.textContent?.trim() === text)
}

describe('OpenUI HTML export interaction release regressions', () => {
  it('increments the static cart badge when a generated add-to-cart button is clicked', async () => {
    const built = await buildOpenUIHtmlExport({
      includeBadge: false,
      previewHtml: bakeryPreviewHtml,
      sessionId: 'bakery-offline-release',
      siteSpecJson: JSON.stringify({
        genui: { category: 'Bakery', version: 1 },
        projectName: 'Sweet Crumb Bakery',
      }),
      source: bakerySource,
      target: 'html',
    })
    const html = typeof built.body === 'string' ? built.body : ''
    const dom = new JSDOM(html, {
      pretendToBeVisual: true,
      runScripts: 'dangerously',
      url: 'https://offline-export.test/index.html',
    })

    try {
      const cartCount = dom.window.document.querySelector(
        'button[aria-label="Cart"] span',
      )
      const addButton = dom.window.document.querySelector(
        'button[aria-label="Add to Cart Chocolate Chip Cookie"]',
      )
      expect(cartCount?.textContent).toBe('0')
      expect(addButton).not.toBeNull()

      addButton?.dispatchEvent(
        new dom.window.MouseEvent('click', {
          bubbles: true,
          cancelable: true,
        }),
      )
      await new Promise((resolve) => dom.window.setTimeout(resolve, 0))

      expect(cartCount?.textContent).toBe('1')
    } finally {
      dom.window.close()
    }
  })

  it('increments the cart when the exported add-to-cart control is translated', async () => {
    const built = await buildOpenUIHtmlExport({
      includeBadge: false,
      locale: 'hi',
      previewHtml: localizedBakeryPreviewHtml,
      sessionId: 'bakery-localized-cart-release',
      siteSpecJson: JSON.stringify({
        genui: { category: 'Bakery', version: 1 },
        locale: 'hi',
        projectName: 'स्वीट क्रम्ब बेकरी',
      }),
      source: bakerySource,
      target: 'html',
    })
    const html = typeof built.body === 'string' ? built.body : ''
    const dom = new JSDOM(html, {
      pretendToBeVisual: true,
      runScripts: 'dangerously',
      url: 'https://offline-export.test/index.html',
    })

    try {
      const cartCount = dom.window.document.querySelector(
        'button[aria-label="Cart"] span',
      )
      const addButton = dom.window.document.querySelector(
        'button[aria-label="कार्ट में जोड़ें Chocolate Chip Cookie"]',
      )
      expect(cartCount?.textContent).toBe('0')
      expect(addButton).not.toBeNull()

      addButton?.dispatchEvent(
        new dom.window.MouseEvent('click', {
          bubbles: true,
          cancelable: true,
        }),
      )
      await new Promise((resolve) => dom.window.setTimeout(resolve, 0))

      expect(cartCount?.textContent).toBe('1')
    } finally {
      dom.window.close()
    }
  })

  it('routes from translated navigation labels without an English runtime lookup', async () => {
    const built = await buildOpenUIHtmlExport({
      includeBadge: false,
      locale: 'hi',
      previewHtml: localizedBakeryPreviewHtml,
      sessionId: 'bakery-localized-navigation-release',
      siteSpecJson: JSON.stringify({
        genui: { category: 'Bakery', version: 1 },
        locale: 'hi',
        projectName: 'स्वीट क्रम्ब बेकरी',
      }),
      source: bakerySource,
      target: 'html',
    })
    const html = typeof built.body === 'string' ? built.body : ''
    const dom = new JSDOM(html, {
      pretendToBeVisual: true,
      runScripts: 'dangerously',
      url: 'https://offline-export.test/index.html',
    })

    try {
      const pages = dom.window.document.querySelectorAll(
        '[data-sf-export-page]',
      )
      const menuButton = findButtonByText(dom.window.document, 'मेनू')
      expect(pages).toHaveLength(2)
      expect(menuButton).not.toBeNull()
      expect(pages[0]?.hasAttribute('hidden')).toBe(false)
      expect(pages[1]?.hasAttribute('hidden')).toBe(true)

      menuButton?.dispatchEvent(
        new dom.window.MouseEvent('click', {
          bubbles: true,
          cancelable: true,
        }),
      )
      await new Promise((resolve) => dom.window.setTimeout(resolve, 0))

      expect(pages[0]?.hasAttribute('hidden')).toBe(true)
      expect(pages[1]?.hasAttribute('hidden')).toBe(false)
    } finally {
      dom.window.close()
    }
  })
})
