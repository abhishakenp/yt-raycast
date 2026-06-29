// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { createPortal } from 'react-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import DirectPreview, { type PreviewSelection } from './DirectPreview'
import type { InspectorSelection } from '@/features/editing/element-path'
import { usePortalContainer } from '@ship-fast/blocks/portal'
import type { ThemeStyles } from '../../genui/theme-presets'

// --- jsdom polyfills --------------------------------------------------------
// jsdom lacks ResizeObserver / IntersectionObserver; MutationObserver exists
// but we ensure a stable stub so the style-override observer is deterministic.
if (typeof globalThis.ResizeObserver === 'undefined') {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    writable: true,
    value: class ResizeObserver {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
  })
}
if (typeof globalThis.IntersectionObserver === 'undefined') {
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    configurable: true,
    writable: true,
    value: class IntersectionObserver {
      readonly root: Element | null = null
      readonly rootMargin: string = ''
      readonly thresholds: ReadonlyArray<number> = []
      disconnect() {}
      observe() {}
      takeRecords(): IntersectionObserverEntry[] {
        return []
      }
      unobserve() {}
    },
  })
}
if (typeof globalThis.MutationObserver === 'undefined') {
  Object.defineProperty(globalThis, 'MutationObserver', {
    configurable: true,
    writable: true,
    value: class MutationObserver {
      disconnect() {}
      observe() {}
      takeRecords(): MutationRecord[] {
        return []
      }
    },
  })
}
if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = function scrollIntoView() {}
}

// --- mocks ------------------------------------------------------------------
// convex/react is not directly imported by DirectPreview but is mocked per the
// test contract so any transitive editor wiring never hits a real backend.
vi.mock('convex/react', () => ({
  useQuery: () => undefined,
  useMutation: () => vi.fn(),
  useConvex: () => ({}),
}))

// Hoisted capture holders so the vi.mock factories (which are hoisted above
// imports) can reference them without TDZ errors.
const { useTextEditMock, useElementInspectorMock } = vi.hoisted(() => ({
  useTextEditMock: vi.fn(),
  useElementInspectorMock: vi.fn(),
}))

// Mock the editor hooks so we can (a) verify DirectPreview threads the correct
// params into them, and (b) capture the forwarded callbacks to exercise
// DirectPreview's wiring without running the full contentEditable machinery.
vi.mock('@/features/editing/hooks/useTextEdit', () => ({
  useTextEdit: (
    ref: unknown,
    editMode: boolean,
    onTextChange: unknown,
    onImageChange: unknown,
    onElementActivate: unknown,
  ) => {
    useTextEditMock(
      ref,
      editMode,
      onTextChange,
      onImageChange,
      onElementActivate,
    )
    return { commitEdit: vi.fn(), cancelEdit: vi.fn() }
  },
}))

vi.mock('@/features/editing/hooks/useElementInspector', () => ({
  useElementInspector: (
    ref: unknown,
    active: boolean,
    onSectionSelect: unknown,
  ) => {
    useElementInspectorMock(ref, active, onSectionSelect)
  },
}))

// --- helpers ----------------------------------------------------------------
const customTheme: ThemeStyles = {
  light: {
    background: '#f0f8ff',
    foreground: '#102030',
    primary: '#ff5000',
    'primary-foreground': '#ffffff',
    'font-sans': 'Poppins, sans-serif',
  },
  dark: {
    background: '#0b0f14',
    foreground: '#e5e7eb',
    primary: '#ff7a00',
    'primary-foreground': '#000000',
    'font-sans': 'Poppins, sans-serif',
  },
}

const systemOnlyTheme: ThemeStyles = {
  light: {
    background: '#ffffff',
    foreground: '#111111',
    'font-sans': 'system-ui, sans-serif',
  },
  dark: {
    background: '#000000',
    foreground: '#eeeeee',
    'font-sans': 'system-ui, sans-serif',
  },
}

// Real generated markup typically has intermediate utility classes between
// `hidden` and `md:flex`, e.g. `hidden items-center gap-8 md:flex`.
const DESKTOP_NAV_CLASS_WITH_INTERMEDIATE = 'hidden items-center gap-8 md:flex'

// The minimal Tailwind responsive pattern with NO intermediate classes. This
// is a perfectly valid, common markup pattern (`hidden md:flex`) and the mobile
// nav detector MUST recognize it just like the intermediate-class variant.
const DESKTOP_NAV_CLASS_MINIMAL = 'hidden md:flex'

const headerWithDesktopNav = (
  navClassName: string = DESKTOP_NAV_CLASS_WITH_INTERMEDIATE,
  extra: React.ReactNode = null,
): React.ReactNode => (
  <header>
    <nav className={navClassName}>
      <a href="#home">Home</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </nav>
    {extra}
  </header>
)

const headerWithExistingHamburger: React.ReactNode = (
  <header>
    <nav className={DESKTOP_NAV_CLASS_WITH_INTERMEDIATE}>
      <a href="#home">Home</a>
      <a href="#pricing">Pricing</a>
    </nav>
    <button type="button" className="p-2 md:hidden" aria-label="Open menu">
      Menu
    </button>
  </header>
)

const removeThemeFontLinks = () => {
  document.head
    .querySelectorAll('[data-theme-font]')
    .forEach((node) => node.remove())
}

describe('DirectPreview edge cases', () => {
  beforeEach(() => {
    useTextEditMock.mockClear()
    useElementInspectorMock.mockClear()
    removeThemeFontLinks()
  })

  afterEach(() => {
    cleanup()
    removeThemeFontLinks()
  })

  // 1. Theme CSS variables injected on container.
  it('injects theme CSS custom properties onto the preview container', () => {
    const { container } = render(
      <DirectPreview themeStyles={customTheme} isDark={false}>
        <p>hello</p>
      </DirectPreview>,
    )

    const root = container.querySelector('.genui-preview') as HTMLElement
    expect(root).toBeTruthy()
    expect(root.style.getPropertyValue('--background')).toBe('#f0f8ff')
    expect(root.style.getPropertyValue('--primary')).toBe('#ff5000')
    expect(root.style.getPropertyValue('--primary-foreground')).toBe('#ffffff')
  })

  // 2. Theme font injection → Google Fonts link.
  it('injects a Google Fonts link when the theme declares a non-system family', () => {
    render(
      <DirectPreview themeStyles={customTheme} isDark={false}>
        <p>fonted</p>
      </DirectPreview>,
    )

    const link = document.head.querySelector(
      '[data-theme-font]',
    ) as HTMLLinkElement | null
    expect(link).toBeTruthy()
    expect(link?.rel).toBe('stylesheet')
    expect(link?.href).toContain('fonts.googleapis.com')
    expect(link?.href).toContain('family=Poppins')
  })

  it('does not inject a font link when only system families are used', () => {
    render(
      <DirectPreview themeStyles={systemOnlyTheme} isDark={false}>
        <p>system</p>
      </DirectPreview>,
    )

    expect(document.head.querySelector('[data-theme-font]')).toBeNull()
  })

  // 3. Dark mode → .dark class + dark vars.
  it('adds the .dark class and applies dark variant CSS vars in dark mode', () => {
    const { container } = render(
      <DirectPreview themeStyles={customTheme} isDark={true}>
        <p>dark</p>
      </DirectPreview>,
    )

    const root = container.querySelector('.genui-preview') as HTMLElement
    expect(root.classList.contains('dark')).toBe(true)
    expect(root.style.colorScheme).toBe('dark')
    // dark values overlay the light ones
    expect(root.style.getPropertyValue('--background')).toBe('#0b0f14')
    expect(root.style.getPropertyValue('--primary')).toBe('#ff7a00')
  })

  // 4. Light mode → no .dark class, light vars.
  it('omits the .dark class and applies light vars in light mode', () => {
    const { container } = render(
      <DirectPreview themeStyles={customTheme} isDark={false}>
        <p>light</p>
      </DirectPreview>,
    )

    const root = container.querySelector('.genui-preview') as HTMLElement
    expect(root.classList.contains('dark')).toBe(false)
    expect(root.style.colorScheme).toBe('light')
    expect(root.style.getPropertyValue('--background')).toBe('#f0f8ff')
  })

  it('toggles dark class when isDark flips without remount', () => {
    const { container, rerender } = render(
      <DirectPreview themeStyles={customTheme} isDark={false}>
        <p>flip</p>
      </DirectPreview>,
    )
    const root = container.querySelector('.genui-preview') as HTMLElement
    expect(root.classList.contains('dark')).toBe(false)

    rerender(
      <DirectPreview themeStyles={customTheme} isDark={true}>
        <p>flip</p>
      </DirectPreview>,
    )
    expect(root.classList.contains('dark')).toBe(true)
    expect(root.style.getPropertyValue('--background')).toBe('#0b0f14')

    rerender(
      <DirectPreview themeStyles={customTheme} isDark={false}>
        <p>flip</p>
      </DirectPreview>,
    )
    expect(root.classList.contains('dark')).toBe(false)
    expect(root.style.getPropertyValue('--background')).toBe('#f0f8ff')
  })

  // 5. Style override reapplication before paint (no flash).
  it('applies style overrides synchronously during commit (useLayoutEffect, no flash)', () => {
    const { container } = render(
      <DirectPreview
        themeStyles={null}
        isDark={false}
        styleOverrides={[
          {
            classAnchor: 'hero-title',
            occurrenceIndex: 0,
            style: 'font-weight: bold; color: rgb(255, 0, 0)',
          },
        ]}
      >
        <h1 className="hero-title">Ship Fast</h1>
      </DirectPreview>,
    )

    const heading = container.querySelector('.hero-title') as HTMLElement
    // useLayoutEffect runs before paint; the inline style is already set when
    // render returns, so the first painted frame shows the override.
    expect(heading.style.fontWeight).toBe('bold')
    expect(heading.style.color).toBe('rgb(255, 0, 0)')
  })

  // 6. Style override update without remount.
  it('reapplies updated style overrides without remounting the preview', () => {
    const { container, rerender } = render(
      <DirectPreview
        themeStyles={null}
        isDark={false}
        styleOverrides={[
          {
            classAnchor: 'hero-title',
            occurrenceIndex: 0,
            style: 'font-weight: bold',
          },
        ]}
      >
        <h1 className="hero-title">Ship Fast</h1>
      </DirectPreview>,
    )

    const heading = container.querySelector('.hero-title') as HTMLElement
    expect(heading.style.fontWeight).toBe('bold')

    rerender(
      <DirectPreview
        themeStyles={null}
        isDark={false}
        styleOverrides={[
          {
            classAnchor: 'hero-title',
            occurrenceIndex: 0,
            style: 'font-weight: normal; text-decoration: underline',
          },
        ]}
      >
        <h1 className="hero-title">Ship Fast</h1>
      </DirectPreview>,
    )

    const sameHeading = container.querySelector('.hero-title') as HTMLElement
    expect(sameHeading).toBe(heading)
    expect(sameHeading.style.fontWeight).toBe('normal')
    expect(sameHeading.style.textDecoration).toBe('underline')
  })

  it('reapplies style overrides when children re-render (MutationObserver)', () => {
    const { container, rerender } = render(
      <DirectPreview
        themeStyles={null}
        isDark={false}
        styleOverrides={[
          {
            classAnchor: 'hero-title',
            occurrenceIndex: 0,
            style: 'font-weight: bold',
          },
        ]}
      >
        <h1 className="hero-title">First</h1>
      </DirectPreview>,
    )

    // React re-renders the heading node; the MutationObserver must reapply.
    rerender(
      <DirectPreview
        themeStyles={null}
        isDark={false}
        styleOverrides={[
          {
            classAnchor: 'hero-title',
            occurrenceIndex: 0,
            style: 'font-weight: bold',
          },
        ]}
      >
        <h1 className="hero-title">Second</h1>
      </DirectPreview>,
    )

    const heading = container.querySelector('.hero-title') as HTMLElement
    expect(heading.textContent).toBe('Second')
    expect(heading.style.fontWeight).toBe('bold')
  })

  // 7. Device mode mobile → hamburger button created.
  it('activates mobile nav enhancement in mobile mode (creates hamburger)', () => {
    const { container } = render(
      <DirectPreview themeStyles={null} isDark={false} deviceMode="mobile">
        {headerWithDesktopNav()}
      </DirectPreview>,
    )

    const button = container.querySelector(
      '[data-generated-mobile-nav-button]',
    ) as HTMLButtonElement | null
    expect(button).toBeTruthy()
    expect(button?.getAttribute('aria-label')).toBe('Menu')
    expect(button?.getAttribute('aria-expanded')).toBe('false')
  })

  // 8. Device mode desktop → mobile nav enhancement deactivated.
  it('deactivates mobile nav enhancement in desktop mode (no hamburger)', () => {
    const { container } = render(
      <DirectPreview themeStyles={null} isDark={false} deviceMode="desktop">
        {headerWithDesktopNav()}
      </DirectPreview>,
    )

    expect(
      container.querySelector('[data-generated-mobile-nav-button]'),
    ).toBeNull()
    expect(
      container.querySelector('[data-generated-mobile-nav-panel]'),
    ).toBeNull()
    expect(
      container.querySelector('[data-generated-mobile-nav-host]'),
    ).toBeNull()
  })

  // 9. Mobile nav: desktop nav with md: breakpoint → panel with nav items.
  it('builds a panel populated from desktop nav items when the hamburger is created', () => {
    const { container } = render(
      <DirectPreview themeStyles={null} isDark={false} deviceMode="mobile">
        {headerWithDesktopNav()}
      </DirectPreview>,
    )

    const panel = container.querySelector(
      '[data-generated-mobile-nav-panel]',
    ) as HTMLElement | null
    expect(panel).toBeTruthy()
    expect(panel?.hidden).toBe(true)

    const items = Array.from(
      panel!.querySelectorAll('button.genui-generated-mobile-nav-item'),
    ).map((btn) => btn.textContent)
    expect(items).toEqual(['Home', 'About', 'Contact'])
  })

  // 10. Mobile nav toggle: click → show; click again → hide.
  it('toggles the generated panel visibility on hamburger click', () => {
    const { container } = render(
      <DirectPreview themeStyles={null} isDark={false} deviceMode="mobile">
        {headerWithDesktopNav()}
      </DirectPreview>,
    )

    const button = container.querySelector(
      '[data-generated-mobile-nav-button]',
    ) as HTMLButtonElement
    const panel = container.querySelector(
      '[data-generated-mobile-nav-panel]',
    ) as HTMLElement

    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(panel.hidden).toBe(true)

    fireEvent.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(panel.hidden).toBe(false)

    fireEvent.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(panel.hidden).toBe(true)
  })

  it('creates a fallback panel on click when an existing hamburger button is present', async () => {
    const { container } = render(
      <DirectPreview themeStyles={null} isDark={false} deviceMode="mobile">
        {headerWithExistingHamburger}
      </DirectPreview>,
    )

    const header = container.querySelector('header') as HTMLElement
    expect(
      header.querySelector('[data-generated-mobile-nav-button]'),
    ).toBeNull()
    expect(header.querySelector('[data-generated-mobile-nav-panel]')).toBeNull()

    const existingButton = header.querySelector(
      'button.md\\:hidden',
    ) as HTMLButtonElement
    fireEvent.click(existingButton)

    await waitFor(() => {
      expect(
        header.querySelector('[data-generated-mobile-nav-panel]'),
      ).toBeTruthy()
    })

    const panel = header.querySelector(
      '[data-generated-mobile-nav-panel]',
    ) as HTMLElement
    const items = Array.from(
      panel.querySelectorAll('button.genui-generated-mobile-nav-item'),
    ).map((btn) => btn.textContent)
    expect(items).toEqual(['Home', 'Pricing'])
  })

  // 11. Mobile nav cleanup: mobile → desktop removes hamburger + panel.
  it('removes generated hamburger and panel when device mode changes to desktop', () => {
    const { container, rerender } = render(
      <DirectPreview themeStyles={null} isDark={false} deviceMode="mobile">
        {headerWithDesktopNav()}
      </DirectPreview>,
    )

    expect(
      container.querySelector('[data-generated-mobile-nav-button]'),
    ).toBeTruthy()
    expect(
      container.querySelector('[data-generated-mobile-nav-panel]'),
    ).toBeTruthy()

    rerender(
      <DirectPreview themeStyles={null} isDark={false} deviceMode="desktop">
        {headerWithDesktopNav()}
      </DirectPreview>,
    )

    expect(
      container.querySelector('[data-generated-mobile-nav-button]'),
    ).toBeNull()
    expect(
      container.querySelector('[data-generated-mobile-nav-panel]'),
    ).toBeNull()
    expect(
      container.querySelector('[data-generated-mobile-nav-host]'),
    ).toBeNull()
  })

  // 12. Preview selection: click element → ship-fast-preview-select event.
  it('dispatches ship-fast-preview-select with selection data on element click in select mode', () => {
    const onPreviewSelect = vi.fn()
    const { container } = render(
      <DirectPreview
        themeStyles={null}
        isDark={false}
        previewToolMode="select"
        onPreviewSelect={onPreviewSelect}
      >
        <main>
          <h1>Generated headline</h1>
        </main>
      </DirectPreview>,
    )

    const root = container.querySelector('.genui-preview') as HTMLElement
    const headline = container.querySelector('h1') as HTMLElement

    let eventDetail: PreviewSelection | undefined
    root.addEventListener('ship-fast-preview-select', (event) => {
      eventDetail = (event as CustomEvent<PreviewSelection>).detail
    })

    fireEvent.click(headline)

    expect(headline.getAttribute('data-ship-fast-selected')).toBe('true')
    expect(onPreviewSelect).toHaveBeenCalledTimes(1)
    expect(eventDetail).toMatchObject({
      label: 'Generated headline',
      tagName: 'h1',
      selectedText: 'Generated headline',
      elementPath: expect.stringContaining('h1'),
      html: '<h1>Generated headline</h1>',
    })
  })

  // 13. Element activation: onElementActivate forwarded to useTextEdit.
  it('forwards onElementActivate into useTextEdit and invokes the parent callback', () => {
    const onElementActivate = vi.fn()
    render(
      <DirectPreview
        themeStyles={null}
        isDark={false}
        editMode
        onElementActivate={onElementActivate}
      >
        <p>edit me</p>
      </DirectPreview>,
    )

    expect(useTextEditMock).toHaveBeenCalled()
    // DirectPreview re-renders once after setPortalContainer(root) flips the
    // portal context from null → node, so the hook fires >=1 times; use the
    // latest call to read the forwarded callbacks.
    const forwardedOnElementActivate = useTextEditMock.mock.calls.at(
      -1,
    )![4] as typeof onElementActivate
    expect(typeof forwardedOnElementActivate).toBe('function')

    const fakeEl = document.createElement('span')
    const fakeRect = { x: 1, y: 2, width: 3, height: 4 } as DOMRect
    forwardedOnElementActivate(fakeEl, fakeRect)
    expect(onElementActivate).toHaveBeenCalledWith(fakeEl, fakeRect)
  })

  // 14. Section selection: onSectionSelect forwarded to useElementInspector.
  it('forwards onSectionSelect into useElementInspector and invokes the parent callback', () => {
    const onSectionSelect = vi.fn()
    render(
      <DirectPreview
        themeStyles={null}
        isDark={false}
        editMode
        onSectionSelect={onSectionSelect}
      >
        <section>section</section>
      </DirectPreview>,
    )

    expect(useElementInspectorMock).toHaveBeenCalled()
    const forwarded = useElementInspectorMock.mock.calls.at(
      -1,
    )![2] as typeof onSectionSelect
    expect(typeof forwarded).toBe('function')

    const selection: InspectorSelection = {
      tag: 'section',
      elementPath: 'main > section:nth-of-type(1)',
      textContent: 'section',
      outerHTML: '<section>section</section>',
      boundingBox: { x: 0, y: 0, width: 10, height: 10 },
    }
    forwarded(selection)
    expect(onSectionSelect).toHaveBeenCalledWith(selection)
  })

  // 15. Image change: onImageChange forwarded to useTextEdit.
  it('forwards onImageChange into useTextEdit and invokes the parent callback', () => {
    const onImageChange = vi.fn()
    render(
      <DirectPreview
        themeStyles={null}
        isDark={false}
        editMode
        onImageChange={onImageChange}
      >
        <img src="/old.png" alt="pic" />
      </DirectPreview>,
    )

    expect(useTextEditMock).toHaveBeenCalled()
    const forwarded = useTextEditMock.mock.calls.at(
      -1,
    )![3] as typeof onImageChange
    expect(typeof forwarded).toBe('function')

    const img = document.createElement('img')
    const change = {
      oldSrc: '/old.png',
      newSrc: '/new.png',
      element: img,
      alt: 'pic',
    }
    forwarded(change)
    expect(onImageChange).toHaveBeenCalledWith(change)
  })

  it('passes editMode and the preview root ref into both editor hooks', () => {
    const { container } = render(
      <DirectPreview
        themeStyles={null}
        isDark={false}
        editMode
        onTextChange={vi.fn()}
        onImageChange={vi.fn()}
        onElementActivate={vi.fn()}
        onSectionSelect={vi.fn()}
      >
        <p>x</p>
      </DirectPreview>,
    )

    const root = container.querySelector('.genui-preview') as HTMLElement
    const textEditCall = useTextEditMock.mock.calls.at(-1)!
    const inspectorCall = useElementInspectorMock.mock.calls.at(-1)!

    expect(textEditCall[0]?.current).toBe(root)
    expect(textEditCall[1]).toBe(true)
    expect(inspectorCall[0]?.current).toBe(root)
    expect(inspectorCall[1]).toBe(true)
  })

  // 16. Portal container: portals render within the preview container.
  it('renders portals inside the preview container, not document.body', () => {
    const PortaledChild = () => {
      const portalContainer = usePortalContainer()
      if (!portalContainer) return null
      return createPortal(
        <div data-testid="portaled-content">in-portal</div>,
        portalContainer,
      )
    }

    const { container, getByTestId } = render(
      <DirectPreview themeStyles={null} isDark={false}>
        <PortaledChild />
      </DirectPreview>,
    )

    const root = container.querySelector('.genui-preview') as HTMLElement
    const portaled = getByTestId('portaled-content') as HTMLElement
    expect(root.contains(portaled)).toBe(true)
    // Not a top-level child of document.body (i.e. not the default portal target).
    expect(document.body.contains(portaled)).toBe(true)
    expect(portaled.parentElement).toBe(root)
  })

  // 17. Scroll position preserved across re-renders (container node reused).
  it('preserves scroll position across re-renders without remounting the container', () => {
    const { container, rerender } = render(
      <DirectPreview themeStyles={null} isDark={false}>
        <div style={{ height: '2000px' }}>tall</div>
      </DirectPreview>,
    )

    const root = container.querySelector('.genui-preview') as HTMLElement
    root.scrollTop = 250
    expect(root.scrollTop).toBe(250)

    rerender(
      <DirectPreview themeStyles={null} isDark={false}>
        <div style={{ height: '2000px' }}>tall v2</div>
      </DirectPreview>,
    )

    const sameRoot = container.querySelector('.genui-preview') as HTMLElement
    expect(sameRoot).toBe(root)
    expect(sameRoot.scrollTop).toBe(250)
  })

  // 18. Mobile nav: the minimal `hidden md:flex` pattern (no intermediate
  // utility classes) is a valid, common Tailwind responsive pattern and MUST be
  // detected just like `hidden items-center gap-8 md:flex`. If the detector's
  // regex only matches when there are intermediate classes between `hidden` and
  // `md:flex`, that is a BUG — this test asserts the CORRECT behavior (the
  // hamburger + panel are created) and is expected to fail until the regex is
  // fixed to consume the single separating space correctly.
  it('detects the minimal "hidden md:flex" desktop nav pattern (no intermediate classes)', () => {
    const { container } = render(
      <DirectPreview themeStyles={null} isDark={false} deviceMode="mobile">
        {headerWithDesktopNav(DESKTOP_NAV_CLASS_MINIMAL)}
      </DirectPreview>,
    )

    const button = container.querySelector(
      '[data-generated-mobile-nav-button]',
    ) as HTMLButtonElement | null
    expect(button).toBeTruthy()
    expect(button?.getAttribute('aria-label')).toBe('Menu')
    expect(button?.getAttribute('aria-expanded')).toBe('false')

    const panel = container.querySelector(
      '[data-generated-mobile-nav-panel]',
    ) as HTMLElement | null
    expect(panel).toBeTruthy()
    expect(panel?.hidden).toBe(true)

    const items = Array.from(
      panel!.querySelectorAll('button.genui-generated-mobile-nav-item'),
    ).map((btn) => btn.textContent)
    expect(items).toEqual(['Home', 'About', 'Contact'])
  })
})
