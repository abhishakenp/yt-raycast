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

function NavigateButton({ target }: { target: string }) {
  const go = useNavigate()

  return (
    <button type="button" onClick={() => go(target)}>
      Navigate
    </button>
  )
}

function NavigationProbe({
  target,
  onPageChange,
}: {
  target: string
  onPageChange: (page: string) => void
}) {
  return (
    <RoutesContext.Provider
      value={{
        currentPage: 'Home',
        pendingSectionId: null,
        routes: ['Home', 'Pricing'],
        setCurrentPage: onPageChange,
        setPendingSectionId: vi.fn(),
        targetMap: {},
      }}
    >
      <NavigateButton target={target} />
    </RoutesContext.Provider>
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

describe('useNavigate behavior', () => {
  it('scrolls to top on page navigation even when there is no hash to clear', () => {
    installImmediateAnimationFrame()
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const onPageChange = vi.fn()

    render(<NavigationProbe target="Pricing" onPageChange={onPageChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Navigate' }))

    expect(onPageChange).toHaveBeenCalledWith('Pricing')
    expect(openUiState.setValue).toHaveBeenCalledWith('Pricing')
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    expect(window.location.hash).toBe('')
  })

  it('clears stale hashes and then scrolls to top on page navigation', () => {
    installImmediateAnimationFrame()
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const onPageChange = vi.fn()
    window.history.replaceState(null, '', '/#pricing_pricing')

    render(<NavigationProbe target="Pricing" onPageChange={onPageChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Navigate' }))

    expect(onPageChange).toHaveBeenCalledWith('Pricing')
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    expect(window.location.pathname + window.location.search).toBe('/')
    expect(window.location.hash).toBe('')
  })
})
