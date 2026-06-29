// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'

import { applyMedusaProductsToPreviewDom } from './medusa-preview-sync'

describe('applyMedusaProductsToPreviewDom', () => {
  it('patches generated product titles and prices from Medusa products', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <section>
        <article>
          <h3>Truffle Box</h3>
          <p>Twelve-piece gift box</p>
          <strong>$79</strong>
        </article>
        <article>
          <h3>Dark Bar</h3>
          <strong>$12</strong>
        </article>
      </section>
    `

    applyMedusaProductsToPreviewDom(root, {
      generatedProducts: [
        { handle: 'truffle-box', price: 79, title: 'Truffle Box' },
        { handle: 'dark-bar', price: 12, title: 'Dark Bar' },
      ],
      medusaProducts: [
        {
          currencyCode: 'eur',
          handle: 'ship-fast-session-truffle-box',
          price: 89,
          sourceHandle: 'truffle-box',
          title: 'Medusa Edited Truffle Box',
        },
      ],
    })

    expect(root.textContent).toContain('Medusa Edited Truffle Box')
    expect(root.textContent).toContain('89,00 €')
    expect(root.querySelector('h3')?.textContent).not.toBe('Truffle Box')
    expect(root.textContent).toContain('Dark Bar')
    expect(root.textContent).toContain('$12')
  })

  it('does not append decimals repeatedly when polling reapplies Medusa prices', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <article>
        <h3>Chocolate Sampler</h3>
        <strong>€39</strong>
      </article>
    `
    const input = {
      generatedProducts: [
        { handle: 'chocolate-sampler', price: 39, title: 'Chocolate Sampler' },
      ],
      medusaProducts: [
        {
          currencyCode: 'eur',
          handle: 'ship-fast-session-chocolate-sampler',
          price: 39,
          sourceHandle: 'chocolate-sampler',
          title: 'Medusa Tenant Sampler Sync',
        },
      ],
    }

    applyMedusaProductsToPreviewDom(root, input)
    applyMedusaProductsToPreviewDom(root, input)
    applyMedusaProductsToPreviewDom(root, input)

    expect(root.textContent).toContain('39,00 €')
    expect(root.textContent).not.toContain('39,00 €,00 €')
  })
})
