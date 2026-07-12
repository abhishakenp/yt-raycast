import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'

import { buildOpenUIHtmlExport } from './openui-html-export-builder'

const bakerySource = `
home_navbar = BakeryNavbar()
home_hero = BakeryHero()
home = Stack([home_navbar, home_hero])
root = PageSwitch(["Home"], [home], "", {"Home":"Home"})
`

const bakeryPreviewHtml = `
<div id="openui-root">
  <section data-sf-export-page="Home">
    <header data-openui-component="BakeryNavbar">
      <button type="button" aria-label="Cart">
        Cart
        <span>0</span>
      </button>
    </header>
    <section data-openui-component="BakeryHero">
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
})
