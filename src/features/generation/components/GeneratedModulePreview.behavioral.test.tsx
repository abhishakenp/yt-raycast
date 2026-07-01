// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

// jsdom lacks ResizeObserver / IntersectionObserver — DirectPreview's hooks
// (useTextEdit / useElementInspector) and theme runtime touch the DOM heavily.
if (typeof ResizeObserver === 'undefined') {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: class ResizeObserver {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
    writable: true,
  })
}
if (typeof IntersectionObserver === 'undefined') {
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    configurable: true,
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
    writable: true,
  })
}

// Mock the lazy-loaded OpenUIViewer with a lightweight real-DOM renderer so
// style/image overrides can be observed in the rendered output.
vi.mock('@/island/openui/OpenUIViewer', () => ({
  default: ({
    response,
    imageContext,
    selectedBrandLogo,
  }: {
    response: string
    imageContext?: {
      prompt?: string
      brandContext?: string
      overrides?: Record<string, string>
    } | null
    selectedBrandLogo?: {
      name: string
      icon?: string | null
      logo?: string | null
    } | null
  }) => (
    <div data-testid="openui-viewer" data-response={response}>
      <div className="hero-anchor" data-testid="hero-anchor">
        Hero
      </div>
      <div
        data-testid="image-context"
        data-overrides={JSON.stringify(imageContext?.overrides ?? null)}
      />
      <div
        data-testid="selected-brand-logo"
        data-logo={JSON.stringify(selectedBrandLogo ?? null)}
      />
    </div>
  ),
}))

// Mock the Lakebed session provider (pulls in convex/react + auth) as a passthrough.
vi.mock('@ship-fast/lakebed/react', () => ({
  LakebedSessionProvider: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}))

vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: () => undefined,
}))

import { defaultPresets } from '@/genui/theme-presets'
import { GeneratedModulePreview } from './GeneratedModulePreview'

const HTML_DOC = '<!DOCTYPE html><html><body><h1>SFF site</h1></body></html>'

describe('GeneratedModulePreview (real component)', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders an HTML document source in an iframe via srcDoc', () => {
    render(<GeneratedModulePreview source={HTML_DOC} sessionId="session-1" />)

    const iframe = screen.getByTitle('Generated website preview')
    expect(iframe).toBeInstanceOf(HTMLIFrameElement)
    expect(iframe.getAttribute('srcdoc')).toBe(HTML_DOC)
    expect(iframe.hasAttribute('src')).toBe(false)
    expect(screen.queryByTestId('openui-viewer')).toBeNull()
  })

  it('renders an HTML URL source in an iframe via src', () => {
    render(
      <GeneratedModulePreview
        source=""
        sourceUrl="https://storage.test/tvnl-home"
        sessionId="session-1"
      />,
    )

    const iframe = screen.getByTitle('Generated website preview')
    expect(iframe).toBeInstanceOf(HTMLIFrameElement)
    expect(iframe.getAttribute('src')).toBe('https://storage.test/tvnl-home')
    expect(iframe.hasAttribute('srcdoc')).toBe(false)
    expect(screen.queryByTestId('openui-viewer')).toBeNull()
  })

  it('renders an OpenUI source via the lazy OpenUIViewer', async () => {
    render(
      <GeneratedModulePreview
        source='root = Text("OpenUI site")'
        sessionId="session-1"
      />,
    )

    const viewer = await screen.findByTestId('openui-viewer')
    expect(viewer.getAttribute('data-response')).toContain('OpenUI site')
    expect(screen.queryByTitle('Generated website preview')).toBeNull()
  })

  it('does not render a blank OpenUI preview when the session has no source yet', async () => {
    render(
      <GeneratedModulePreview
        source=""
        sessionId="k574ms14ma9f94keq30r7dq24x89n1k2"
      />,
    )

    await waitFor(() => {
      expect(screen.queryByTestId('openui-viewer')).toBeNull()
      expect(screen.getByRole('status').textContent).toMatch(
        /generating|loading|preview/i,
      )
    })
  })

  it('applies theme styles as CSS custom properties on the preview container', () => {
    const themeStyles = defaultPresets['modern-minimal'].styles

    render(
      <GeneratedModulePreview
        source={HTML_DOC}
        sessionId="session-1"
        themeStyles={themeStyles}
        isDark
      />,
    )

    const container = document.querySelector('.genui-preview') as HTMLElement
    expect(container).toBeInstanceOf(HTMLElement)
    // applyThemeVars sets `--<key>` for every theme prop on the container.
    expect(container.style.getPropertyValue('--background')).toBe(
      themeStyles.dark.background ?? themeStyles.light.background,
    )
    expect(container.style.getPropertyValue('--primary')).toBe(
      themeStyles.dark.primary ?? themeStyles.light.primary,
    )
    expect(container.classList.contains('dark')).toBe(true)
    expect(container.style.colorScheme).toBe('dark')
  })

  it('clears theme vars and toggles light colorScheme when isDark=false', () => {
    const themeStyles = defaultPresets['modern-minimal'].styles

    render(
      <GeneratedModulePreview
        source={HTML_DOC}
        sessionId="session-1"
        themeStyles={themeStyles}
        isDark={false}
      />,
    )

    const container = document.querySelector('.genui-preview') as HTMLElement
    expect(container.style.colorScheme).toBe('light')
    expect(container.classList.contains('dark')).toBe(false)
    // Light-mode values come from the light palette.
    expect(container.style.getPropertyValue('--background')).toBe(
      themeStyles.light.background,
    )
  })

  it('records the device mode on the preview container (drives dimension CSS)', () => {
    const { rerender } = render(
      <GeneratedModulePreview
        source={HTML_DOC}
        sessionId="session-1"
        deviceMode="mobile"
      />,
    )

    let container = document.querySelector('.genui-preview') as HTMLElement
    expect(container.getAttribute('data-preview-device')).toBe('mobile')

    rerender(
      <GeneratedModulePreview
        source={HTML_DOC}
        sessionId="session-1"
        deviceMode="tablet"
      />,
    )
    container = document.querySelector('.genui-preview') as HTMLElement
    expect(container.getAttribute('data-preview-device')).toBe('tablet')

    rerender(
      <GeneratedModulePreview
        source={HTML_DOC}
        sessionId="session-1"
        deviceMode="desktop"
      />,
    )
    container = document.querySelector('.genui-preview') as HTMLElement
    expect(container.getAttribute('data-preview-device')).toBe('desktop')
  })

  it('passes image overrides (alt -> src) through to the OpenUI renderer', async () => {
    const imageOverrides = { 'Hero photo': 'https://cdn.test/hero.png' }

    render(
      <GeneratedModulePreview
        source='root = Text("OpenUI site")'
        sessionId="session-1"
        prompt="coffee shop"
        imageOverrides={imageOverrides}
      />,
    )

    const ctx = await screen.findByTestId('image-context')
    expect(JSON.parse(ctx.getAttribute('data-overrides')!)).toEqual(
      imageOverrides,
    )
  })

  it('passes the selected brand logo through to the OpenUI renderer', async () => {
    const selectedBrandLogo = {
      name: 'Linear',
      domain: 'linear.app',
      brandId: 'linear',
      icon: 'https://cdn.test/linear-icon.png',
      logo: null,
    }

    render(
      <GeneratedModulePreview
        source='root = Text("OpenUI site")'
        sessionId="session-1"
        selectedBrandLogo={selectedBrandLogo}
      />,
    )

    const logo = await screen.findByTestId('selected-brand-logo')
    expect(JSON.parse(logo.getAttribute('data-logo')!)).toEqual(
      selectedBrandLogo,
    )
  })

  it('applies style overrides to matching elements in the rendered output', async () => {
    render(
      <GeneratedModulePreview
        source='root = Text("OpenUI site")'
        sessionId="session-1"
        styleOverrides={[
          {
            classAnchor: 'hero-anchor',
            occurrenceIndex: 0,
            style: 'color: rgb(255, 0, 0); font-weight: bold',
          },
        ]}
      />,
    )

    const anchor = await screen.findByTestId('hero-anchor')
    // DirectPreview re-applies style overrides via a useLayoutEffect + observer.
    await waitFor(() => {
      expect(anchor.style.color).toBe('rgb(255, 0, 0)')
    })
    expect(anchor.style.fontWeight).toBe('bold')
  })

  it('shows editing controls (inspector overlays) when editMode is enabled', () => {
    render(
      <GeneratedModulePreview
        source={HTML_DOC}
        sessionId="session-1"
        editMode
      />,
    )

    // useElementInspector appends hover + selected overlay divs to document.body
    // only while editMode is active.
    const overlays = document.querySelectorAll(
      '[data-ship-fast-inspector-overlay]',
    )
    expect(overlays.length).toBeGreaterThan(0)
  })

  it('hides editing controls when editMode is disabled', () => {
    render(
      <GeneratedModulePreview
        source={HTML_DOC}
        sessionId="session-1"
        editMode={false}
      />,
    )

    const overlays = document.querySelectorAll(
      '[data-ship-fast-inspector-overlay]',
    )
    expect(overlays.length).toBe(0)
  })
})
