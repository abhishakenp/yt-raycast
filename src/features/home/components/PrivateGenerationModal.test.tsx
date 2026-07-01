// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PrivateGenerationModal } from './PrivateGenerationModal'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    ...props
  }: {
    children: ReactNode
    to: string
    [key: string]: unknown
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

describe('PrivateGenerationModal', () => {
  afterEach(cleanup)

  it('is hidden from users and assistive tech until opened', () => {
    const onClose = vi.fn()
    const view = render(
      <PrivateGenerationModal isOpen={false} onClose={onClose} />,
    )
    const modal = view.container.querySelector('#private-gen-modal')

    expect(modal?.classList.contains('hidden')).toBe(true)
    expect(modal?.classList.contains('flex')).toBe(false)
    expect(modal?.getAttribute('aria-hidden')).toBe('true')
    expect(view.getByRole('dialog', { hidden: true })).toBeTruthy()
  })

  it('renders the Pro upgrade dialog and closes from both explicit and backdrop actions', () => {
    const onClose = vi.fn()
    const view = render(<PrivateGenerationModal isOpen onClose={onClose} />)

    expect(view.getByRole('dialog').getAttribute('aria-labelledby')).toBe(
      'private-gen-modal-title',
    )
    expect(
      view.getByRole('heading', { name: 'Private Generation' }),
    ).toBeTruthy()
    expect(view.getByText(/only you can access it/i)).toBeTruthy()
    expect(
      view.getByRole('link', { name: 'Upgrade to Pro' }).getAttribute('href'),
    ).toBe('/pricing')

    fireEvent.click(view.getByRole('button', { name: 'Close' }))
    fireEvent.click(
      view.container.querySelector(
        '#private-gen-modal-backdrop',
      ) as HTMLElement,
    )

    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
