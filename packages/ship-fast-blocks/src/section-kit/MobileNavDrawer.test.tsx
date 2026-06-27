// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'

const navigate = vi.fn()

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => navigate,
}))

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

const { cleanup, fireEvent, render, screen, waitFor } =
  await import('@testing-library/react')
const { MobileNavDrawer } = await import('./MobileNavDrawer.tsx')

afterEach(() => {
  cleanup()
  navigate.mockReset()
})

describe('MobileNavDrawer', () => {
  it('opens a real sheet and navigates from drawer links, not the trigger', async () => {
    render(
      <MobileNavDrawer
        brand="Northridge"
        nav={['Services', 'Pricing']}
        cta={{ label: 'Schedule Consultation', target: 'Contact' }}
        buttonClassName="md:hidden"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))

    expect(navigate).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('Northridge')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Pricing' }))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Pricing')
    })
  })

  it('routes the home action to Home instead of the first nav item', async () => {
    render(
      <MobileNavDrawer
        brand="Northridge"
        nav={['Services', 'Pricing']}
        buttonClassName="md:hidden"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    fireEvent.click(screen.getByRole('button', { name: 'Home' }))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Home')
    })
  })

  it('does not duplicate Home when nav already contains Home', () => {
    render(
      <MobileNavDrawer
        brand="Northridge"
        nav={['Home', 'Services', 'Pricing']}
        buttonClassName="md:hidden"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))

    expect(screen.getAllByRole('button', { name: 'Home' })).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Services' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Pricing' })).toBeTruthy()
  })

  it('keeps long drawer navigation scroll-contained and renders footer content', () => {
    render(
      <MobileNavDrawer
        brand="Northridge"
        nav={Array.from({ length: 30 }, (_, index) => `Section ${index + 1}`)}
        buttonClassName="md:hidden"
        footer={<button type="button">Account</button>}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))

    const dialog = screen.getByRole('dialog')
    expect(dialog.classList.contains('overflow-y-auto')).toBe(true)
    expect(dialog.classList.contains('overscroll-contain')).toBe(true)
    expect(screen.getByRole('button', { name: 'Section 30' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Account' })).toBeTruthy()
  })
})
