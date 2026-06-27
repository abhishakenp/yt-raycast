import { describe, expect, it } from 'vitest'

import {
  injectStorefrontCartUi,
  stripStorefrontCartUi,
} from './storefront-cart-ui.js'

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

const injectedStyle = (html: string) =>
  html.match(/<style id="sf-storefront-cart-style">([\s\S]*?)<\/style>/)?.[1] ??
  ''

describe('storefront cart UI injection', () => {
  it('injects a cart drawer that inherits generated theme tokens', () => {
    const html = injectStorefrontCartUi(themedStorefrontHtml)
    const style = injectedStyle(html)

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
})
