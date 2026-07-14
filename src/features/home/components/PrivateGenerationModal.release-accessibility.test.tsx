// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { PrivateGenerationModal } from './PrivateGenerationModal'

function ModalHarness() {
  const [isOpen, setIsOpen] = useState(false)
  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return (
    <>
      <button type="button" onClick={openModal}>
        Private generation
      </button>
      <PrivateGenerationModal isOpen={isOpen} onClose={closeModal} />
    </>
  )
}

describe('PrivateGenerationModal release accessibility', () => {
  afterEach(cleanup)

  it('moves focus into the dialog when it opens', () => {
    const view = render(<ModalHarness />)
    const opener = view.getByRole('button', { name: 'Private generation' })
    opener.focus()
    fireEvent.click(opener)

    expect(document.activeElement).toBe(
      view.getByRole('button', { name: 'Close' }),
    )
  })

  it('dismisses the dialog with Escape', () => {
    const view = render(<ModalHarness />)
    const opener = view.getByRole('button', { name: 'Private generation' })
    opener.focus()
    fireEvent.click(opener)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(view.queryByRole('dialog')).toBeNull()
  })

  it('wraps keyboard focus inside the open dialog', () => {
    const view = render(<ModalHarness />)
    const opener = view.getByRole('button', { name: 'Private generation' })
    opener.focus()
    fireEvent.click(opener)
    const closeButton = view.getByRole('button', { name: 'Close' })
    const upgradeLink = view.getByRole('link', { name: 'Upgrade to Pro' })
    upgradeLink.focus()

    fireEvent.keyDown(document, { key: 'Tab' })

    expect(document.activeElement).toBe(closeButton)
  })

  it('restores focus to the opener after explicit dismissal', () => {
    const view = render(<ModalHarness />)
    const opener = view.getByRole('button', { name: 'Private generation' })
    opener.focus()
    fireEvent.click(opener)

    const closeButton = view.getByRole('button', { name: 'Close' })
    closeButton.focus()
    fireEvent.click(closeButton)

    expect(document.activeElement).toBe(opener)
  })
})
