// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'

const openUiState = vi.hoisted(() => ({
  holdValue: false,
  initialValue: undefined as string | undefined,
  setValue: vi.fn(),
}))

// useStateField mock that tracks value changes via React state,
// so the two effects in PageSwitch (page.value sync + URL sync) agree.
vi.mock('@openuidev/react-lang', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@openuidev/react-lang')>()
  const { useState, useCallback } = await import('react')
  return {
    ...actual,
    useStateField: (_key: string, initial: unknown) => {
      const [value, setValue] = useState(openUiState.initialValue ?? initial)
      const stableSetValue = useCallback((next: unknown) => {
        if (!openUiState.holdValue) setValue(next)
        openUiState.setValue(next)
      }, [])
      return { setValue: stableSetValue, value }
    },
  }
})

vi.mock('@ship-fast/lakebed/react', () => ({
  signInWithGoogle: vi.fn(async () => ({
    bundle: { challenge: '', state: '', verifier: '' },
    url: '',
  })),
  signOut: vi.fn(),
}))

// Mock defineCapsule to bypass lakebed client creation (which needs Convex).
// We only need the component function for these tests.
vi.mock('#/capsules/openui.ts', () => ({
  defineCapsule: (config: Record<string, unknown>) => ({
    name: config.name,
    description: config.description,
    props: config.props,
    component: config.component,
  }),
}))

import { createElement, type ComponentType, type ReactNode } from 'react'
import { PreviewUrlBridgeContext } from '#/lib/preview-url-bridge.tsx'
import type { PreviewUrlBridgeValue } from '#/lib/preview-url-bridge.tsx'

import { PageSwitch } from './page-switch.tsx'

function renderNode(node: unknown): ReactNode {
  if (
    node !== null &&
    typeof node === 'object' &&
    'typeName' in node &&
    typeof (node as { typeName: unknown }).typeName === 'string'
  ) {
    return createElement(
      'div',
      { 'data-testid': `page-${(node as { typeName: string }).typeName}` },
      (node as { typeName: string }).typeName,
    )
  }
  return null
}

function makePageNode(label: string) {
  return {
    type: 'element',
    typeName: label,
    props: {},
  }
}

function PageSwitchHost({
  routes,
  pages,
  bridgeValue,
}: {
  routes: string[]
  pages: ReturnType<typeof makePageNode>[]
  bridgeValue: PreviewUrlBridgeValue
}) {
  return (
    <PreviewUrlBridgeContext.Provider value={bridgeValue}>
      {createElement(
        PageSwitch.component as ComponentType<{
          props: { routes: string[]; pages: unknown[]; className?: string }
          renderNode: (node: unknown) => ReactNode
        }>,
        {
          props: { routes, pages, className: '' },
          renderNode,
        },
      )}
    </PreviewUrlBridgeContext.Provider>
  )
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  openUiState.holdValue = false
  openUiState.initialValue = undefined
  openUiState.setValue.mockReset()
})

describe('PageSwitch URL bridge sync behavior', () => {
  it('renders the first page (home) when pageFromUrl is null', () => {
    render(
      <PageSwitchHost
        routes={['Home', 'Pricing', 'Contact']}
        pages={[
          makePageNode('Home'),
          makePageNode('Pricing'),
          makePageNode('Contact'),
        ]}
        bridgeValue={{ navigateToPage: vi.fn(), pageFromUrl: null }}
      />,
    )

    expect(screen.getByTestId('page-Home')).toBeTruthy()
    expect(screen.queryByTestId('page-Pricing')).toBeNull()
  })

  it('switches to the page matching the URL slug', async () => {
    render(
      <PageSwitchHost
        routes={['Home', 'Pricing', 'Contact']}
        pages={[
          makePageNode('Home'),
          makePageNode('Pricing'),
          makePageNode('Contact'),
        ]}
        bridgeValue={{ navigateToPage: vi.fn(), pageFromUrl: 'pricing' }}
      />,
    )

    await waitFor(() => {
      expect(screen.getByTestId('page-Pricing')).toBeTruthy()
    })
    expect(screen.queryByTestId('page-Home')).toBeNull()
  })

  it('matches multi-word route labels via slugify', async () => {
    render(
      <PageSwitchHost
        routes={['Home', 'About Us', 'Contact']}
        pages={[
          makePageNode('Home'),
          makePageNode('About Us'),
          makePageNode('Contact'),
        ]}
        bridgeValue={{ navigateToPage: vi.fn(), pageFromUrl: 'about-us' }}
      />,
    )

    await waitFor(() => {
      expect(screen.getByTestId('page-About Us')).toBeTruthy()
    })
  })

  it('falls back to home when slug does not match any route', () => {
    render(
      <PageSwitchHost
        routes={['Home', 'Pricing']}
        pages={[makePageNode('Home'), makePageNode('Pricing')]}
        bridgeValue={{ navigateToPage: vi.fn(), pageFromUrl: 'nonexistent' }}
      />,
    )

    expect(screen.getByTestId('page-Home')).toBeTruthy()
  })

  it('does not sync from URL when bridge is null (exported site)', () => {
    render(
      <PageSwitchHost
        routes={['Home', 'Pricing']}
        pages={[makePageNode('Home'), makePageNode('Pricing')]}
        bridgeValue={{ navigateToPage: null, pageFromUrl: 'pricing' }}
      />,
    )

    expect(screen.getByTestId('page-Home')).toBeTruthy()
  })

  it('keeps URL bridge state authoritative over a stale OpenUI page field', async () => {
    openUiState.holdValue = true
    openUiState.initialValue = 'Gallery'

    render(
      <PageSwitchHost
        routes={['Home', 'Gallery']}
        pages={[makePageNode('Home'), makePageNode('Gallery')]}
        bridgeValue={{ navigateToPage: vi.fn(), pageFromUrl: null }}
      />,
    )

    await waitFor(() => {
      expect(screen.getByTestId('page-Home')).toBeTruthy()
    })
    expect(screen.queryByTestId('page-Gallery')).toBeNull()
    expect(openUiState.setValue).toHaveBeenCalledWith('Home')
  })
})
