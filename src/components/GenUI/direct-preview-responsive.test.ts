import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'
import { enhanceGeneratedMobileNavs } from './generated-mobile-nav'

const readProjectFile = (path: string): string =>
  readFileSync(join(process.cwd(), path), 'utf8')

describe('generated preview responsive safeguards', () => {
  it('exposes the simulated device mode to scoped preview CSS', () => {
    const dashboardSource = readProjectFile('src/features/dashboard/components/Dashboard.tsx')
    const stylesSource = readProjectFile('src/styles.css')

    expect(dashboardSource).toContain('data-preview-device={currentDevice}')
    expect(dashboardSource).toContain('previewDeviceWidth')
    expect(stylesSource).toContain(".genui-preview[data-preview-device='mobile']")
    expect(stylesSource).toContain(".genui-preview[data-preview-device='tablet']")
    expect(stylesSource).toContain('overflow-wrap: anywhere')
    expect(stylesSource).toContain('grid-template-columns: minmax(0, 1fr)')
  })

  it('maps generated responsive nav classes to the simulated mobile frame', () => {
    const stylesSource = readProjectFile('src/styles.css')

    expect(stylesSource).toContain('button[class*="md:hidden"]')
    expect(stylesSource).toContain('div[class*="flex"][class*="md:hidden"]')
    expect(stylesSource).toContain('[class*="hidden"][class*="md:flex"]')
    expect(stylesSource).toContain('display: inline-flex !important')
    expect(stylesSource).toContain('display: flex !important')
    expect(stylesSource).toContain('display: none !important')
  })

  it('adds a working burger menu for generated pages that only have desktop nav links', () => {
    const dom = new JSDOM(`
      <div class="genui-preview">
        <header>
          <div class="header-row flex items-center justify-between">
            <div class="brand">Brand</div>
            <nav class="hidden items-center gap-8 md:flex">
              <button type="button" id="home">Home</button>
              <button type="button" id="pricing">Pricing</button>
            </nav>
          </div>
        </header>
      </div>
    `)
    const root = dom.window.document.querySelector('.genui-preview') as HTMLElement
    const row = root.querySelector('.header-row') as HTMLElement
    let clicked = ''
    root.querySelector('#pricing')?.addEventListener('click', () => {
      clicked = 'pricing'
    })

    enhanceGeneratedMobileNavs(root, 'mobile')

    const button = root.querySelector('[data-generated-mobile-nav-button]') as HTMLButtonElement
    const panel = root.querySelector('[data-generated-mobile-nav-panel]') as HTMLElement

    expect(button).toBeTruthy()
    expect(button.parentElement).toBe(row)
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(panel.hidden).toBe(true)

    button.click()
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(panel.hidden).toBe(false)
    expect(panel.textContent).toContain('Home')
    expect(panel.textContent).toContain('Pricing')

    const pricing = [...panel.querySelectorAll('button')].find((item) => item.textContent === 'Pricing')
    pricing?.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
    expect(clicked).toBe('pricing')
  })

  it('wires generated mobile menu content lazily to existing burger buttons without panels', async () => {
    const dom = new JSDOM(`
      <div class="genui-preview">
        <header>
          <button type="button" class="p-2 md:hidden" aria-label="Menu"></button>
          <nav class="hidden items-center gap-8 md:flex">
            <button type="button" id="work">Work</button>
          </nav>
        </header>
      </div>
    `)
    const root = dom.window.document.querySelector('.genui-preview') as HTMLElement

    enhanceGeneratedMobileNavs(root, 'mobile')

    const existingButton = root.querySelector('button[aria-label="Menu"]') as HTMLButtonElement
    const injectedButton = root.querySelector('[data-generated-mobile-nav-button]')

    expect(injectedButton).toBeNull()
    expect(root.querySelector('[data-generated-mobile-nav-panel]')).toBeNull()

    existingButton.click()
    await new Promise((resolve) => setTimeout(resolve, 0))

    const panel = root.querySelector('[data-generated-mobile-nav-panel]') as HTMLElement

    expect(existingButton.getAttribute('aria-expanded')).toBe('true')
    expect(panel.hidden).toBe(false)
    expect(panel.textContent).toContain('Work')
  })

  it('does not create a fallback panel when an existing burger opens its own menu', async () => {
    const dom = new JSDOM(`
      <div class="genui-preview">
        <header>
          <button type="button" class="p-2 md:hidden" aria-label="Menu"></button>
          <nav class="hidden items-center gap-8 md:flex">
            <button type="button">Work</button>
          </nav>
        </header>
      </div>
    `)
    const root = dom.window.document.querySelector('.genui-preview') as HTMLElement
    const header = root.querySelector('header') as HTMLElement
    const existingButton = root.querySelector('button[aria-label="Menu"]') as HTMLButtonElement

    existingButton.addEventListener('click', () => {
      const nativePanel = dom.window.document.createElement('div')
      nativePanel.className = 'flex flex-col border-t border-border bg-background px-4 py-6 md:hidden'
      nativePanel.innerHTML = '<button type="button">Work</button>'
      header.appendChild(nativePanel)
    })

    enhanceGeneratedMobileNavs(root, 'mobile')
    existingButton.click()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(root.querySelector('[data-generated-mobile-nav-panel]')).toBeNull()
    expect(header.querySelector('.flex.flex-col')).toBeTruthy()
  })
})
