import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  cleanupGeneratedMobileNavs,
  enhanceGeneratedMobileNavs,
  observeGeneratedMobileNavs,
} from './generated-mobile-nav'

const previewDom = (html: string) =>
  new JSDOM(`<div class="genui-preview">${html}</div>`, {
    pretendToBeVisual: true,
  })

const rootFrom = (dom: JSDOM) =>
  dom.window.document.querySelector('.genui-preview') as HTMLElement

const headerWithDesktopNav = () => `
  <header>
    <div class="header-row flex items-center justify-between">
      <a href="/" class="brand">Brand</a>
      <nav class="hidden items-center gap-8 md:flex">
        <button type="button" id="home">Home</button>
        <button type="button" id="pricing">Pricing</button>
      </nav>
    </div>
  </header>
`

describe('generated mobile nav helper', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('is idempotent when mobile enhancement runs repeatedly on the same header', () => {
    const root = rootFrom(previewDom(headerWithDesktopNav()))

    enhanceGeneratedMobileNavs(root, 'mobile')
    enhanceGeneratedMobileNavs(root, 'mobile')

    expect(
      root.querySelectorAll('[data-generated-mobile-nav-button]'),
    ).toHaveLength(1)
    expect(
      root.querySelectorAll('[data-generated-mobile-nav-panel]'),
    ).toHaveLength(1)
    expect(
      root.querySelectorAll('header[data-generated-mobile-nav-host]'),
    ).toHaveLength(1)
  })

  it('removes generated controls and host markers when switching away from mobile', () => {
    const root = rootFrom(previewDom(headerWithDesktopNav()))
    enhanceGeneratedMobileNavs(root, 'mobile')

    enhanceGeneratedMobileNavs(root, 'desktop')

    expect(root.querySelector('[data-generated-mobile-nav-button]')).toBeNull()
    expect(root.querySelector('[data-generated-mobile-nav-panel]')).toBeNull()
    expect(root.querySelector('[data-generated-mobile-nav-host]')).toBeNull()
  })

  it('opens the generated panel and proxies menu item clicks to the source nav controls', () => {
    const root = rootFrom(previewDom(headerWithDesktopNav()))
    const onPricing = vi.fn()
    root.querySelector('#pricing')?.addEventListener('click', onPricing)

    enhanceGeneratedMobileNavs(root, 'mobile')

    const button = root.querySelector(
      '[data-generated-mobile-nav-button]',
    ) as HTMLButtonElement
    const panel = root.querySelector(
      '[data-generated-mobile-nav-panel]',
    ) as HTMLElement

    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(panel.hidden).toBe(true)

    button.click()

    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(panel.hidden).toBe(false)
    ;[...panel.querySelectorAll('button')]
      .find((item) => item.textContent === 'Pricing')
      ?.click()

    expect(onPricing).toHaveBeenCalledTimes(1)
  })

  it('keeps an existing mobile panel untouched and does not add duplicate generated controls', () => {
    const root = rootFrom(
      previewDom(`
        <header>
          <button type="button" class="md:hidden" aria-label="Menu">Menu</button>
          <nav class="hidden items-center gap-8 md:flex">
            <button type="button">Home</button>
          </nav>
          <div class="flex flex-col gap-3 md:hidden">
            <button type="button">Existing mobile home</button>
          </div>
        </header>
      `),
    )

    enhanceGeneratedMobileNavs(root, 'mobile')

    expect(root.querySelector('[data-generated-mobile-nav-button]')).toBeNull()
    expect(root.querySelector('[data-generated-mobile-nav-panel]')).toBeNull()
    expect(root.textContent).toContain('Existing mobile home')
  })

  it('falls back to generated panel content when an existing mobile button does not reveal menu items', async () => {
    const dom = previewDom(`
      <header>
        <button type="button" class="md:hidden" aria-label="Menu">Menu</button>
        <nav class="hidden items-center gap-8 md:flex">
          <button type="button" id="home">Home</button>
          <button type="button" id="pricing">Pricing</button>
        </nav>
      </header>
    `)
    const root = rootFrom(dom)
    const onHome = vi.fn()
    root.querySelector('#home')?.addEventListener('click', onHome)

    enhanceGeneratedMobileNavs(root, 'mobile')
    root.querySelector<HTMLButtonElement>('button[aria-label="Menu"]')?.click()
    await new Promise((resolve) => dom.window.setTimeout(resolve, 0))

    const panel = root.querySelector(
      '[data-generated-mobile-nav-panel]',
    ) as HTMLElement

    expect(panel.hidden).toBe(false)
    ;[...panel.querySelectorAll('button')]
      .find((item) => item.textContent === 'Home')
      ?.click()

    expect(onHome).toHaveBeenCalledTimes(1)
  })

  it('observes newly inserted headers and cleans them up when disconnected', async () => {
    const dom = previewDom('')
    const root = rootFrom(dom)
    const originalMutationObserver = globalThis.MutationObserver
    globalThis.MutationObserver = dom.window.MutationObserver

    const disconnect = observeGeneratedMobileNavs(root, 'mobile')
    root.insertAdjacentHTML('beforeend', headerWithDesktopNav())
    await new Promise((resolve) => dom.window.setTimeout(resolve, 0))

    expect(
      root.querySelector('[data-generated-mobile-nav-button]'),
    ).toBeTruthy()
    expect(root.querySelector('[data-generated-mobile-nav-panel]')).toBeTruthy()

    disconnect()
    expect(root.querySelector('[data-generated-mobile-nav-button]')).toBeNull()
    expect(root.querySelector('[data-generated-mobile-nav-panel]')).toBeNull()
    globalThis.MutationObserver = originalMutationObserver
  })

  it('cleanup removes generated leftovers even when the original header state is gone', () => {
    const root = rootFrom(previewDom(headerWithDesktopNav()))
    enhanceGeneratedMobileNavs(root, 'mobile')
    root
      .querySelector('header')
      ?.removeAttribute('data-generated-mobile-nav-host')

    cleanupGeneratedMobileNavs(root)

    expect(root.querySelector('[data-generated-mobile-nav-button]')).toBeNull()
    expect(root.querySelector('[data-generated-mobile-nav-panel]')).toBeNull()
  })
})
