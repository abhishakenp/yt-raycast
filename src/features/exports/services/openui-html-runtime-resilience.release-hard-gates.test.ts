import { JSDOM } from 'jsdom'
import { beforeAll, describe, expect, it } from 'vitest'

import { buildOpenUIHtmlExport } from './openui-html-export-builder'

type SiteFixture = {
  html: string
  item: string
  name: string
}

type StorageFactory = (values: Map<string, string>) => Storage

const createMemoryStorage: StorageFactory = (values) => ({
  get length() {
    return values.size
  },
  clear: () => values.clear(),
  getItem: (key) => values.get(key) ?? null,
  key: (index) => [...values.keys()][index] ?? null,
  removeItem: (key) => values.delete(key),
  setItem: (key, value) => values.set(key, value),
})

type BrowserWindow = Window & typeof globalThis
type BeforeParseHandler = (window: BrowserWindow) => void

function domWindow(dom: JSDOM): BrowserWindow {
  return dom.window
}

function domDocument(dom: JSDOM): Document {
  return domWindow(dom).document
}

function sourceFor(name: string) {
  return `home = Text(${JSON.stringify(`${name} home`)})
shop = Text(${JSON.stringify(`${name} shop`)})
root = PageSwitch(['Home','Shop'], [home,shop], '', {'Home':'Home','Shop':'Shop'})`
}

function previewFor(name: string, item: string) {
  return `<!doctype html>
<html lang="en">
  <head><title>${name}</title></head>
  <body>
    <div id="openui-root">
      <section data-sf-export-page="Home">
        <header>
          <nav>
            <button id="nav-home" type="button">Home</button>
            <button id="nav-shop" type="button">Shop</button>
          </nav>
          <button id="sign-in" data-contract="sign-in" type="button">Sign in</button>
          <button id="open-cart" data-contract="cart-open" aria-haspopup="dialog" aria-expanded="false" type="button">
            Cart <span data-cart-count>0</span>
          </button>
        </header>
        <main>
          <article data-item-key="release-item">
            <h1>${item}</h1>
            <button id="add-item" data-contract="add-cart" data-item-key="release-item" data-item-label="${item}" data-item-price="$9" type="button">Add to cart</button>
          </article>
          <form id="newsletter">
            <label>Email <input name="email" type="email"></label>
            <button id="subscribe" type="submit">Subscribe</button>
            <output aria-live="polite"></output>
          </form>
        </main>
      </section>
      <section data-sf-export-page="Shop" hidden>
        <main><h1>${name} shop</h1></main>
      </section>
      <aside id="cart-dialog" role="dialog" aria-label="Cart" hidden>
        <div data-cart-items></div>
      </aside>
    </div>
  </body>
</html>`
}

async function buildFixture(name: string, item: string): Promise<SiteFixture> {
  const result = await buildOpenUIHtmlExport({
    includeBadge: false,
    previewHtml: previewFor(name, item),
    sessionId: name.toLowerCase().replaceAll(' ', '-'),
    siteSpecJson: JSON.stringify({ projectName: name }),
    source: sourceFor(name),
    target: 'html',
  })
  if (typeof result.body !== 'string') {
    throw new Error(`${name} HTML export returned binary bytes`)
  }
  return { html: result.body, item, name }
}

type OpenedFixture = {
  dom: JSDOM
  errors: string[]
  storage: Map<string, string>
}

function openFixture(
  fixture: SiteFixture,
  storage = new Map<string, string>(),
  url = 'https://static-export.example/',
): OpenedFixture {
  const errors: string[] = []
  const beforeParse: BeforeParseHandler = (window) => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(storage),
    })
    window.requestAnimationFrame = (callback) =>
      window.setTimeout(() => callback(Date.now()), 0)
    window.scrollTo = () => undefined
    window.HTMLElement.prototype.scrollIntoView = () => undefined
    window.addEventListener('error', (event) => errors.push(event.message))
  }
  const dom = new JSDOM(fixture.html, {
    beforeParse,
    runScripts: 'dangerously',
    url,
  })
  return { dom, errors, storage }
}

async function click(dom: JSDOM, selector: string) {
  const control = domDocument(dom).querySelector<HTMLElement>(selector)
  if (control === null) throw new Error(`Missing control ${selector}`)
  control.click()
  await new Promise((resolve) => domWindow(dom).setTimeout(resolve, 0))
}

async function submit(dom: JSDOM, selector: string) {
  const form = domDocument(dom).querySelector<HTMLFormElement>(selector)
  if (form === null) throw new Error(`Missing form ${selector}`)
  form.dispatchEvent(
    new (domWindow(dom).Event)('submit', { bubbles: true, cancelable: true }),
  )
  await new Promise((resolve) => domWindow(dom).setTimeout(resolve, 0))
}

function visiblePage(dom: JSDOM) {
  return (
    domDocument(dom)
      .querySelector<HTMLElement>('[data-sf-export-page]:not([hidden])')
      ?.getAttribute('data-sf-export-page') ?? null
  )
}

let alpha: SiteFixture
let beta: SiteFixture

beforeAll(async () => {
  ;[alpha, beta] = await Promise.all([
    buildFixture('Alpha Bakery', 'Alpha Croissant'),
    buildFixture('Beta Bakery', 'Beta Sourdough'),
  ])
}, 180_000)

describe('standalone HTML state isolation and recovery', () => {
  it('persists a cart for the same export without leaking it into another export', async () => {
    const storage = new Map<string, string>()
    const first = openFixture(alpha, storage)
    try {
      await click(first.dom, '#add-item')
      expect(
        domDocument(first.dom).querySelector('[data-cart-count]')?.textContent,
      ).toBe('1')
    } finally {
      first.dom.window.close()
    }

    const sameSite = openFixture(alpha, storage)
    try {
      expect(
        domDocument(sameSite.dom).querySelector('[data-cart-count]')
          ?.textContent,
      ).toBe('1')
    } finally {
      sameSite.dom.window.close()
    }

    const otherSite = openFixture(beta, storage)
    try {
      expect(
        domDocument(otherSite.dom).querySelector('[data-cart-count]')
          ?.textContent,
      ).toBe('0')
      await click(otherSite.dom, '#open-cart')
      expect(
        domDocument(otherSite.dom).querySelector('[data-cart-items]')
          ?.textContent,
      ).not.toContain(alpha.item)
    } finally {
      otherSite.dom.window.close()
    }
  })

  it('recovers from corrupt persisted cart data without a runtime error', () => {
    const storage = new Map([['static-site-cart-v1', '{not-json']])
    const opened = openFixture(alpha, storage)
    try {
      expect(opened.errors).toEqual([])
      expect(
        domDocument(opened.dom).querySelector('[data-cart-count]')?.textContent,
      ).toBe('0')
    } finally {
      opened.dom.window.close()
    }
  })

  it('restores signed-in state after a full reload of the same export', async () => {
    const storage = new Map<string, string>()
    const first = openFixture(alpha, storage)
    try {
      await click(first.dom, '#sign-in')
      expect(
        domDocument(first.dom)
          .querySelector('#sign-in')
          ?.getAttribute('data-auth-state'),
      ).toBe('signed-in')
    } finally {
      first.dom.window.close()
    }

    const reloaded = openFixture(alpha, storage)
    try {
      const signIn = domDocument(reloaded.dom).querySelector('#sign-in')
      expect(signIn?.getAttribute('data-auth-state')).toBe('signed-in')
      expect(signIn?.getAttribute('aria-pressed')).toBe('true')
    } finally {
      reloaded.dom.window.close()
    }
  })

  it('restores a subscribed email after a full reload of the same export', async () => {
    const storage = new Map<string, string>()
    const first = openFixture(alpha, storage)
    try {
      const input = domDocument(first.dom).querySelector<HTMLInputElement>(
        '#newsletter input[name="email"]',
      )
      if (input === null) throw new Error('Missing newsletter email input')
      input.value = 'release@example.com'
      await submit(first.dom, '#newsletter')
      expect(
        domDocument(first.dom)
          .querySelector('#newsletter')
          ?.getAttribute('data-submit-state'),
      ).toBe('submitted')
    } finally {
      first.dom.window.close()
    }

    const reloaded = openFixture(alpha, storage)
    try {
      expect(
        domDocument(reloaded.dom).querySelector<HTMLInputElement>(
          '#newsletter input[name="email"]',
        )?.value,
      ).toBe('release@example.com')
    } finally {
      reloaded.dom.window.close()
    }
  })
})

describe('standalone HTML navigation and cart lifecycle', () => {
  it('opens the route encoded in a direct-link URL', () => {
    const opened = openFixture(
      alpha,
      new Map<string, string>(),
      'https://static-export.example/#shop',
    )
    try {
      expect(visiblePage(opened.dom)).toBe('Shop')
    } finally {
      opened.dom.window.close()
    }
  })

  it('reflects route navigation in the address so reload and Back remain meaningful', async () => {
    const opened = openFixture(alpha)
    try {
      await click(opened.dom, '#nav-shop')
      expect(visiblePage(opened.dom)).toBe('Shop')
      expect(
        `${domWindow(opened.dom).location.pathname}${domWindow(opened.dom).location.hash}`.toLowerCase(),
      ).toContain('shop')
    } finally {
      opened.dom.window.close()
    }
  })

  it('lets a user remove an item from the exported cart', async () => {
    const opened = openFixture(alpha)
    try {
      await click(opened.dom, '#add-item')
      await click(opened.dom, '#open-cart')
      const remove = domDocument(opened.dom).querySelector<HTMLElement>(
        '[data-cart-remove], button[aria-label^="Remove" i]',
      )
      expect(remove).not.toBeNull()
      remove?.click()
      await new Promise((resolve) =>
        domWindow(opened.dom).setTimeout(resolve, 0),
      )
      expect(
        domDocument(opened.dom).querySelector('[data-cart-count]')?.textContent,
      ).toBe('0')
    } finally {
      opened.dom.window.close()
    }
  })

  it('closes the cart with Escape and restores focus to its trigger', async () => {
    const opened = openFixture(alpha)
    try {
      await click(opened.dom, '#open-cart')
      const trigger = domDocument(opened.dom).querySelector('#open-cart')
      const dialog = domDocument(opened.dom).querySelector<HTMLElement>(
        '#cart-dialog',
      )
      expect(dialog?.hidden).toBe(false)
      domDocument(opened.dom).dispatchEvent(
        new (domWindow(opened.dom).KeyboardEvent)('keydown', {
          bubbles: true,
          key: 'Escape',
        }),
      )
      await new Promise((resolve) =>
        domWindow(opened.dom).setTimeout(resolve, 220),
      )

      expect(dialog?.hidden).toBe(true)
      expect(trigger?.getAttribute('aria-expanded')).toBe('false')
      expect(domDocument(opened.dom).activeElement).toBe(trigger)
    } finally {
      opened.dom.window.close()
    }
  })
})
