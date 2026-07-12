// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

const openUiState = vi.hoisted(() => ({
  setValue: vi.fn(),
}))

vi.mock('@openuidev/react-lang', () => ({
  useStateField: () => ({
    setValue: openUiState.setValue,
    value: 'Home',
  }),
}))

vi.mock('@ship-fast/lakebed/react', () => ({
  signInWithGoogle: vi.fn(async () => ({
    bundle: { challenge: '', state: '', verifier: '' },
    url: '',
  })),
  signOut: vi.fn(),
}))

import { RoutesContext, useNavigate } from './use-navigate.tsx'
import {
  PreviewUrlBridgeContext,
  type PreviewUrlBridgeValue,
} from './preview-url-bridge.tsx'

function NavigateButton({ target }: { target: string }) {
  const go = useNavigate()
  return (
    <button type="button" onClick={() => go(target)}>
      Navigate
    </button>
  )
}

function Probe({
  target,
  routes,
  bridgeValue,
  onPageChange,
}: {
  target: string
  routes: string[]
  bridgeValue: PreviewUrlBridgeValue
  onPageChange: (page: string) => void
}) {
  return (
    <PreviewUrlBridgeContext.Provider value={bridgeValue}>
      <RoutesContext.Provider
        value={{
          currentPage: routes[0],
          pendingSectionId: null,
          routes,
          setCurrentPage: onPageChange,
          setPendingSectionId: vi.fn(),
          targetMap: {},
        }}
      >
        <NavigateButton target={target} />
      </RoutesContext.Provider>
    </PreviewUrlBridgeContext.Provider>
  )
}

const installImmediateAnimationFrame = () => {
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    callback(0)
    return 1
  })
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  openUiState.setValue.mockReset()
  window.history.replaceState(null, '', '/')
})

describe('useNavigate + PreviewUrlBridge behavior', () => {
  it('calls navigateToPage(null) for home page (routes[0])', () => {
    installImmediateAnimationFrame()
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const navigateToPage = vi.fn()
    const onPageChange = vi.fn()

    render(
      <Probe
        target="Home"
        routes={['Home', 'Pricing', 'Contact']}
        bridgeValue={{ navigateToPage, pageFromUrl: null }}
        onPageChange={onPageChange}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Navigate' }))

    expect(onPageChange).toHaveBeenCalledWith('Home')
    expect(navigateToPage).toHaveBeenCalledWith(null)
  })

  it('calls navigateToPage(slug) for non-home pages', () => {
    installImmediateAnimationFrame()
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const navigateToPage = vi.fn()
    const onPageChange = vi.fn()

    render(
      <Probe
        target="Pricing"
        routes={['Home', 'Pricing', 'Contact']}
        bridgeValue={{ navigateToPage, pageFromUrl: null }}
        onPageChange={onPageChange}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Navigate' }))

    expect(onPageChange).toHaveBeenCalledWith('Pricing')
    expect(navigateToPage).toHaveBeenCalledWith('pricing')
  })

  it('slugifies multi-word route labels', () => {
    installImmediateAnimationFrame()
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const navigateToPage = vi.fn()
    const onPageChange = vi.fn()

    render(
      <Probe
        target="About Us"
        routes={['Home', 'About Us']}
        bridgeValue={{ navigateToPage, pageFromUrl: null }}
        onPageChange={onPageChange}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Navigate' }))

    expect(navigateToPage).toHaveBeenCalledWith('about-us')
  })

  it('does not call navigateToPage when bridge is null (exported site)', () => {
    installImmediateAnimationFrame()
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const onPageChange = vi.fn()

    render(
      <Probe
        target="Pricing"
        routes={['Home', 'Pricing']}
        bridgeValue={{ navigateToPage: null, pageFromUrl: null }}
        onPageChange={onPageChange}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Navigate' }))

    expect(onPageChange).toHaveBeenCalledWith('Pricing')
    // No crash, no navigateToPage call — exported site uses its own routing
  })

  it('treats first route as home regardless of label', () => {
    installImmediateAnimationFrame()
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const navigateToPage = vi.fn()
    const onPageChange = vi.fn()

    // Even if the first route is not literally "Home", it should get null
    render(
      <Probe
        target="Welcome"
        routes={['Welcome', 'Pricing']}
        bridgeValue={{ navigateToPage, pageFromUrl: null }}
        onPageChange={onPageChange}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Navigate' }))

    expect(onPageChange).toHaveBeenCalledWith('Welcome')
    expect(navigateToPage).toHaveBeenCalledWith(null)
  })
})
