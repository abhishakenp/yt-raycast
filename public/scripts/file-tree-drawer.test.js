// @vitest-environment jsdom
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

beforeAll(async () => {
  await import('./file-tree-drawer.js')
})

beforeEach(() => {
  document.body.replaceChildren()
})

describe('public file tree drawer runtime', () => {
  it('builds a nested page tree and navigates leaf routes before closing', () => {
    const onNavigate = vi.fn()
    const Drawer = window.FileTreeDrawer

    const drawer = new Drawer({
      currentRoute: '/docs/api',
      isOpen: true,
      onNavigate,
      pages: [
        { id: 'home', name: 'Home', route: '/' },
        { id: 'api', name: 'API', route: '/docs/api' },
        { id: 'guide', name: 'Guide', route: '/docs/guide' },
      ],
    })

    const activeNode = document.querySelector('[data-route="/docs/api"]')
    const guideNode = document.querySelector('[data-route="/docs/guide"]')

    expect(document.body.textContent).toContain('Pages')
    expect(document.body.textContent).toContain('docs')
    expect(document.body.textContent).toContain('api')
    expect(activeNode?.className).toContain('bg-white/10')

    guideNode?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(onNavigate).toHaveBeenCalledWith('/docs/guide')
    expect(drawer.isOpen).toBe(false)
    expect(drawer.overlayElement.style.display).toBe('none')

    drawer.destroy()
    expect(document.querySelector('[aria-label="Toggle file tree"]')).toBeNull()
  })

  it('opens from the visible toggle button when initialized closed', () => {
    const Drawer = window.FileTreeDrawer
    const drawer = new Drawer({
      isOpen: false,
      pages: [{ id: 'home', name: 'Home', route: '/' }],
    })

    document
      .querySelector('[aria-label="Toggle file tree"]')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(drawer.isOpen).toBe(true)
    expect(drawer.overlayElement.style.display).toBe('block')

    drawer.destroy()
  })

  it('updates the highlighted page after route changes', () => {
    const Drawer = window.FileTreeDrawer
    const drawer = new Drawer({
      currentRoute: '/',
      pages: [
        { id: 'home', name: 'Home', route: '/' },
        { id: 'pricing', name: 'Pricing', route: '/pricing' },
      ],
    })

    drawer.updateCurrentRoute('/pricing')

    expect(
      document.querySelector('[data-route="/pricing"]')?.className,
    ).toContain('bg-white/10')
    expect(document.querySelector('[data-route="/"]')?.className).not.toContain(
      'bg-white/10',
    )

    drawer.destroy()
  })

  it('does not crash the deployed page shell when generated page metadata is partial', () => {
    const Drawer = window.FileTreeDrawer

    expect(
      () =>
        new Drawer({
          isOpen: true,
          pages: [
            { id: 'home', name: 'Home', route: '/' },
            { id: 'draft', name: 'Draft without a route' },
            null,
          ],
        }),
    ).not.toThrow()

    expect(document.body.textContent).toContain('Home')
    expect(document.body.textContent).toContain('Pages')
  })

  it('renders an empty page list instead of crashing when a live page update is null', () => {
    const Drawer = window.FileTreeDrawer
    const drawer = new Drawer({
      isOpen: true,
      pages: [{ id: 'home', name: 'Home', route: '/' }],
    })

    expect(() => drawer.updatePages(null)).not.toThrow()

    expect(document.body.textContent).toContain('No pages available')

    drawer.destroy()
  })

  it('renders array-like live page metadata without crashing the deployed shell', () => {
    const Drawer = window.FileTreeDrawer
    const drawer = new Drawer({
      isOpen: true,
      pages: [{ id: 'home', name: 'Home', route: '/' }],
    })

    expect(() =>
      drawer.updatePages({
        0: { id: 'docs', name: 'Docs', route: '/docs' },
        length: 1,
      }),
    ).not.toThrow()

    expect(document.body.textContent).toContain('docs')

    drawer.destroy()
  })
})
