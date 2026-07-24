import { JSDOM, VirtualConsole } from 'jsdom'
import { describe, expect, it } from 'vitest'

import {
  injectStorefrontCartUi,
  stripStorefrontCartUi,
} from './storefront-cart-ui'

const themedStorefrontHtml = `<!doctype html>
<html>
  <head>
    <style>
      :root {
        --background: oklch(0.13 0.02 90);
        --foreground: oklch(0.95 0.01 90);
        --primary: oklch(0.72 0.18 55);
        --primary-foreground: oklch(0.12 0.02 90);
        --border: oklch(0.28 0.03 90);
      }
    </style>
  </head>
  <body>
    <header>
      <nav>
        <div class="utilities">
          <button id="cart-toggle" aria-label="Cart">
            Cart <span id="cart-count" class="cart-badge">0</span>
          </button>
        </div>
      </nav>
    </header>
  </body>
</html>`

function injectedStyle(html: string) {
  return (
    html.match(
      /<style id="sf-storefront-cart-style">([\s\S]*?)<\/style>/,
    )?.[1] ?? ''
  )
}

describe('storefront cart UI injection', () => {
  it('injects a cart drawer that inherits generated theme tokens', () => {
    const html = injectStorefrontCartUi(themedStorefrontHtml)
    const style = injectedStyle(html)

    expect(html).toContain("var API_BASE='/api/medusa-store';")
    expect(html).not.toContain('/api/storefront/medusa')
    expect(style).toContain('background:var(--background,Canvas)')
    expect(style).toContain('color:var(--foreground,CanvasText)')
    expect(style).toContain('background:var(--primary,ButtonText)')
    expect(style).toContain('color:var(--primary-foreground,ButtonFace)')
    expect(style).toContain('color:var(--foreground,currentColor)!important')
    expect(style).not.toMatch(/#[0-9a-fA-F]{3,8}/)
    expect(style).not.toMatch(/rgba?\(/)
  })

  it('can replace stale injected cart chrome when forced', () => {
    const first = injectStorefrontCartUi(themedStorefrontHtml)
    const replaced = injectStorefrontCartUi(first, { force: true })

    expect(stripStorefrontCartUi(first)).not.toContain('sf-cart-drawer')
    expect(replaced.match(/id="sf-cart-drawer"/g)).toHaveLength(1)
  })

  it('keeps the injected drawer usable when a cart API returns a malformed items collection', async () => {
    const html = injectStorefrontCartUi(themedStorefrontHtml, {
      variantMap: { byTitle: { 'Alpha Serum': 'variant_alpha' } },
    })
    const runtimeErrors: unknown[] = []
    const virtualConsole = new VirtualConsole()
    virtualConsole.on('jsdomError', (error) => runtimeErrors.push(error))

    const dom = new JSDOM(html, {
      beforeParse(window: any) {
        window.requestAnimationFrame = (callback: (time: number) => void) => {
          callback(0)
          return 0
        }
        window.addEventListener('error', (event: ErrorEvent) => {
          runtimeErrors.push(event.error || event.message)
        })
        window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
          const url = String(input)
          if (url.endsWith('/config')) {
            return new Response(JSON.stringify({ enabled: true }))
          }
          if (url.endsWith('/cart') && init?.method === 'POST') {
            return new Response(
              JSON.stringify({
                cart: { completed_at: null, id: 'cart_malformed' },
              }),
            )
          }
          if (url.includes('/cart/cart_malformed')) {
            return new Response(
              JSON.stringify({
                cart: {
                  completed_at: null,
                  id: 'cart_malformed',
                  items: { stale: true },
                  region: { currency_code: 'USD' },
                  total: 0,
                },
              }),
            )
          }
          return new Response(JSON.stringify({}), { status: 404 })
        }
      },
      runScripts: 'dangerously',
      url: 'https://example.test/',
      virtualConsole,
    })

    await new Promise((resolve) => setTimeout(resolve, 0))
    await new Promise((resolve) => setTimeout(resolve, 0))

    dom.window.document
      .getElementById('cart-toggle')
      ?.dispatchEvent(
        new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }),
      )

    expect(runtimeErrors).toEqual([])
    expect(dom.window.document.getElementById('sf-cart-drawer')?.hidden).toBe(
      false,
    )
    expect(
      dom.window.document.getElementById('sf-cart-summary')?.textContent,
    ).toBe('Your bag is empty.')
    dom.window.close()
  })
})
