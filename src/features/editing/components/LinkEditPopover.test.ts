// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LinkEditPopover } from './LinkEditPopover'

const onApply =
  vi.fn<
    (p: { oldHref: string; newHref: string; occurrenceIndex: number }) => void
  >()
const onClose = vi.fn()

const renderPopover = (activeElement: HTMLAnchorElement | null) =>
  render(createElement(LinkEditPopover, { activeElement, onApply, onClose }))

describe('LinkEditPopover', () => {
  let activeElement: HTMLAnchorElement

  beforeEach(() => {
    onApply.mockReset()
    onClose.mockReset()
    activeElement = document.createElement('a')
    activeElement.setAttribute('href', '/old-path')
    activeElement.textContent = 'Click Here'
    document.body.appendChild(activeElement)
  })

  afterEach(() => {
    activeElement.remove()
    cleanup()
  })

  it('renders with URL and text inputs', () => {
    renderPopover(activeElement)
    const inputs = Array.from(document.querySelectorAll('input[type="text"]'))
    expect(inputs.length).toBe(2)
    expect(inputs[0].value).toBe('/old-path')
    expect(inputs[1].value).toBe('Click Here')
  })

  it('returns null when activeElement is null', () => {
    const { container } = renderPopover(null)
    expect(container.querySelector('input')).toBeNull()
  })

  it('apply calls onApply with old and new href', () => {
    renderPopover(activeElement)
    const urlInput = Array.from(
      document.querySelectorAll('input[type="text"]'),
    )[0]
    fireEvent.change(urlInput, { target: { value: '/new-path' } })
    const applyBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Apply'),
    )!
    fireEvent.click(applyBtn)
    expect(onApply).toHaveBeenCalledTimes(1)
    const payload = onApply.mock.calls[0][0]
    expect(payload.oldHref).toBe('/old-path')
    expect(payload.newHref).toBe('/new-path')
    expect(payload.occurrenceIndex).toBe(0)
  })

  it('apply without changes just closes', () => {
    renderPopover(activeElement)
    const applyBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Apply'),
    )!
    fireEvent.click(applyBtn)
    expect(onApply).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('close calls onClose', () => {
    renderPopover(activeElement)
    const closeBtn = document.querySelector('button[aria-label="Close"]')!
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('occurrenceIndex is correct for multiple same-href links', () => {
    const link2 = document.createElement('a')
    link2.setAttribute('href', '/old-path')
    link2.textContent = 'Another Link'
    document.body.appendChild(link2)

    renderPopover(link2)
    const applyBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Apply'),
    )!
    fireEvent.click(applyBtn)
    // link2 is the second occurrence
    expect(onApply).not.toHaveBeenCalled() // href unchanged
    // Change href and apply
    const urlInput = Array.from(
      document.querySelectorAll('input[type="text"]'),
    )[0]
    fireEvent.change(urlInput, { target: { value: '/new' } })
    fireEvent.click(applyBtn)
    const payload = onApply.mock.calls[0][0]
    expect(payload.occurrenceIndex).toBe(1)

    link2.remove()
  })
})
