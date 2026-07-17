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
    ref: React.RefObject<HTMLElement | null>,
    editMode: boolean,
    onTextChange: (change: {
      oldText: string
      newText: string
      element: HTMLElement
      occurrenceIndex: number
    }) => void,
    onImageChange?: (change: {
      oldSrc: string
      newSrc: string
      element: HTMLImageElement
      alt: string
    }) => void,
    onElementActivate?: (element: HTMLElement, rect: DOMRect) => void,
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
    ref: React.RefObject<HTMLElement | null>,
    active: boolean,
    onSectionSelect?: (selection: unknown) => void,
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

function headerWithDesktopNav(
  navClassName: string = DESKTOP_NAV_CLASS_WITH_INTERMEDIATE,
  extra: React.ReactNode = null,
): React.ReactNode {
  return (
    <header>
      <nav className={navClassName}>
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
      {extra}
    </header>
  )
}

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

  it('removes leaked inline editor artifacts from generated preview content when edit mode is off', () => {
    const { container } = render(
      <DirectPreview themeStyles={null} isDark={false} editMode={false}>
        <h1
          className="hero-title"
          contentEditable
          data-ship-fast-inline-editing="true"
          style={{
            outline: '2px solid hsl(var(--primary))',
            outlineOffset: '2px',
            cursor: 'text',
          }}
          suppressContentEditableWarning
        >
          Leaked editor title
        </h1>
      </DirectPreview>,
    )

    const heading = container.querySelector('.hero-title') as HTMLElement
    expect(heading.hasAttribute('contenteditable')).toBe(false)
    expect(heading.dataset.shipFastInlineEditing).toBeUndefined()
    expect(heading.style.outline).toBe('')
    expect(heading.style.outlineOffset).toBe('')
    expect(heading.style.cursor).toBe('')
  })

  it('removes leaked inline editor artifacts that arrive after the preview mounts', async () => {
    const { container } = render(
      <DirectPreview themeStyles={null} isDark={false} editMode={false}>
        <div>initial preview shell</div>
      </DirectPreview>,
    )
    const root = container.querySelector('.genui-preview') as HTMLElement
    const leaked = document.createElement('h1')
    leaked.className = 'late-hero-title'
    leaked.contentEditable = 'true'
    leaked.dataset.shipFastInlineEditing = 'true'
    leaked.style.outline = '2px solid hsl(var(--primary))'
    leaked.style.outlineOffset = '2px'
    leaked.style.cursor = 'text'
    leaked.textContent = 'Late editor title'

    root.appendChild(leaked)

    await waitFor(() => {
      expect(leaked.hasAttribute('contenteditable')).toBe(false)
    })
    expect(leaked.dataset.shipFastInlineEditing).toBeUndefined()
    expect(leaked.style.outline).toBe('')
    expect(leaked.style.outlineOffset).toBe('')
    expect(leaked.style.cursor).toBe('')
  })

  it('keeps inline editor artifacts while edit mode is active', () => {
    const { container } = render(
      <DirectPreview themeStyles={null} isDark={false} editMode>
        <h1
          className="hero-title"
          contentEditable
          data-ship-fast-inline-editing="true"
          style={{
            outline: '2px solid hsl(var(--primary))',
            outlineOffset: '2px',
            cursor: 'text',
          }}
          suppressContentEditableWarning
        >
          Active editor title
        </h1>
      </DirectPreview>,
    )

    const heading = container.querySelector('.hero-title') as HTMLElement
    expect(heading.getAttribute('contenteditable')).toBe('true')
    expect(heading.dataset.shipFastInlineEditing).toBe('true')
    expect(heading.style.outline).toContain('2px')
    expect(heading.style.cursor).toBe('text')
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

  it('applies style overrides to id-only sections using an id anchor', () => {
    const imageUrl = 'https://images.pexels.com/photos/newsletter-bg.jpeg'
    const { container } = render(
      <DirectPreview
        themeStyles={null}
        isDark={false}
        styleOverrides={[
          {
            classAnchor: '#newsletter_newsletter',
            occurrenceIndex: 0,
            style: `background-image: url("${imageUrl}"); background-size: cover; background-position: center center;`,
          },
        ]}
      >
        <section id="newsletter_newsletter">Newsletter section</section>
      </DirectPreview>,
    )

    const section = container.querySelector(
      '#newsletter_newsletter',
    ) as HTMLElement
    expect(section.style.backgroundImage).toContain(imageUrl)
    expect(section.style.backgroundSize).toBe('cover')
    expect(section.style.backgroundPosition).toBe('center center')
  })

  it('applies style overrides to OpenUI sections using data-openui-var anchors', () => {
    const imageUrl = 'https://images.pexels.com/photos/openui-var-bg.jpeg'
    const { container } = render(
      <DirectPreview
        themeStyles={null}
        isDark={false}
        styleOverrides={[
          {
            classAnchor: '[data-openui-var="home_hero"]',
            occurrenceIndex: 0,
            style: `background-image: url("${imageUrl}"); background-size: cover`,
          },
        ]}
      >
        <section data-openui-var="home_hero">Hero section</section>
      </DirectPreview>,
    )

    const section = container.querySelector(
      '[data-openui-var="home_hero"]',
    ) as HTMLElement
    expect(section.style.backgroundImage).toContain(imageUrl)
    expect(section.style.backgroundSize).toBe('cover')
  })

  it('applies style overrides to raw id anchors that are awkward CSS selectors', () => {
    const imageUrl = 'https://images.pexels.com/photos/special-bg.jpeg'
    const { container } = render(
      <DirectPreview
        themeStyles={null}
        isDark={false}
        styleOverrides={[
          {
            classAnchor: '#hero:newsletter/1',
            occurrenceIndex: 0,
            style: `background-image: url("${imageUrl}")`,
          },
        ]}
      >
        <section id="hero:newsletter/1">Newsletter section</section>
      </DirectPreview>,
    )

    const section = container.querySelector(
      '[id="hero:newsletter/1"]',
    ) as HTMLElement
    expect(section.style.backgroundImage).toContain(imageUrl)
  })

  it('reapplies saved style overrides when generated class token order changes', () => {
    const { container } = render(
      <DirectPreview
        themeStyles={null}
        isDark={false}
        styleOverrides={[
          {
            classAnchor: 'hero-section bg-white py-20',
            occurrenceIndex: 0,
            style: 'background-color: rgb(12, 34, 56)',
          },
        ]}
      >
        <section className="py-20 hero-section bg-white">Hero section</section>
      </DirectPreview>,
    )

    const section = container.querySelector('.hero-section') as HTMLElement
    expect(section.style.backgroundColor).toBe('rgb(12, 34, 56)')
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

  it('replays saved text overrides into the rendered preview in chronological order', () => {
    const { container } = render(
      <DirectPreview
        themeStyles={null}
        isDark={false}
        textOverrides={[
          {
            beforeText: 'Second headline',
            afterText: 'Final headline',
            occurrenceIndex: 0,
          },
          {
            beforeText: 'Original headline',
            afterText: 'Second headline',
            occurrenceIndex: 0,
          },
        ]}
      >
        <h1>Original headline</h1>
      </DirectPreview>,
    )

    expect(container.querySelector('h1')?.textContent).toBe('Final headline')
  })

  it('applies a text override to the requested repeated occurrence only', () => {
    const { container } = render(
      <DirectPreview
        themeStyles={null}
        isDark={false}
        textOverrides={[
          {
            beforeText: 'Book now',
            afterText: 'Reserve now',
            occurrenceIndex: 1,
          },
        ]}
      >
        <nav>
          <a>Book now</a>
        </nav>
        <main>
          <button>Book now</button>
        </main>
      </DirectPreview>,
    )

    expect(container.querySelector('nav a')?.textContent).toBe('Book now')
    expect(container.querySelector('main button')?.textContent).toBe(
      'Reserve now',
    )
  })

  it('replays translated text overrides against the intended repeated occurrence only', () => {
    const { container } = render(
      <DirectPreview
        themeStyles={null}
        isDark={false}
        textOverrides={[
          {
            beforeText: 'पॉलिश किया हुआ',
            afterText: 'एजेंट सत्यापन शीर्षक',
            occurrenceIndex: 1,
          },
        ]}
      >
        <header>कांच का पॉलिश किया हुआ</header>
        <main>
          <h1>के साथ अपने स्थान को ऊपर उठाएं पॉलिश किया हुआ</h1>
        </main>
        <footer>कांच का पॉलिश किया हुआ</footer>
      </DirectPreview>,
    )

    expect(container.querySelector('header')?.textContent).toBe(
      'कांच का पॉलिश किया हुआ',
    )
    expect(container.querySelector('main h1')?.textContent).toBe(
      'के साथ अपने स्थान को ऊपर उठाएं एजेंट सत्यापन शीर्षक',
    )
    expect(container.querySelector('footer')?.textContent).toBe(
      'कांच का पॉलिश किया हुआ',
    )
  })

  it('reapplies translated text overrides when translation mutates a text node after render', async () => {
    const { container } = render(
      <DirectPreview
        themeStyles={null}
        isDark={false}
        textOverrides={[
          {
            beforeText: 'मूल शीर्षक',
            afterText: 'संपादित शीर्षक',
            occurrenceIndex: 0,
          },
        ]}
      >
        <h1>Original headline</h1>
      </DirectPreview>,
    )

    const heading = container.querySelector('h1') as HTMLElement
    heading.firstChild!.textContent = 'मूल शीर्षक'

    await waitFor(() => {
      expect(heading.textContent).toBe('संपादित शीर्षक')
    })
  })

  it('does not repeatedly reapply an override when the replacement contains the original text', async () => {
    const { container } = render(
      <DirectPreview
        themeStyles={null}
        isDark={false}
        textOverrides={[
          {
            beforeText: 'Glass',
            afterText: 'Glass installations',
            occurrenceIndex: 0,
          },
        ]}
      >
        <h1>Glass</h1>
      </DirectPreview>,
    )

    const heading = container.querySelector('h1') as HTMLElement
    await waitFor(() => {
      expect(heading.textContent).toBe('Glass installations')
    })
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(heading.textContent).toBe('Glass installations')
  })

  it('does not loop when chronological text overrides net back to the original text', async () => {
    const { container } = render(
      <DirectPreview
        themeStyles={null}
        isDark={false}
        textOverrides={[
          {
            beforeText: 'Temporary headline',
            afterText: 'Original headline',
            occurrenceIndex: 0,
          },
          {
            beforeText: 'Original headline',
            afterText: 'Temporary headline',
            occurrenceIndex: 0,
          },
        ]}
      >
        <h1>Original headline</h1>
      </DirectPreview>,
    )

    const heading = container.querySelector('h1') as HTMLElement
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(heading.textContent).toBe('Original headline')
  })

  it('does not repeatedly prepend prefix-chain text edits over already-patched source', async () => {
    const { container } = render(
      <DirectPreview
        themeStyles={null}
        isDark={false}
        textOverrides={[
          {
            beforeText: 'Dreamy हिंदी पक्का सत्यापन 0704',
            afterText: 'Crystal-clear हिंदी पक्का सत्यापन 0704',
            occurrenceIndex: 0,
          },
          {
            beforeText: 'हिंदी पक्का सत्यापन 0704',
            afterText: 'Dreamy हिंदी पक्का सत्यापन 0704',
            occurrenceIndex: 0,
          },
          {
            beforeText: 'हिंदी पक्का सत्यापन 0703',
            afterText: 'हिंदी पक्का सत्यापन 0704',
            occurrenceIndex: 0,
          },
        ]}
      >
        <h1>हिंदी पक्का सत्यापन 0704</h1>
      </DirectPreview>,
    )

    const heading = container.querySelector('h1') as HTMLElement
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(heading.textContent).toBe('Crystal-clear हिंदी पक्का सत्यापन 0704')

    heading.firstChild!.textContent = heading.textContent
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(heading.textContent).toBe('Crystal-clear हिंदी पक्का सत्यापन 0704')
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
