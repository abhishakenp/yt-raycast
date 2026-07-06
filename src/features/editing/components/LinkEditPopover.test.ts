// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LinkEditPopover } from './LinkEditPopover'

const onApply =
  vi.fn<
    (p: {
      oldHref: string
      newHref: string
      oldText: string
      newText: string
      target: string | null
      rel: string
      occurrenceIndex: number
    }) => void
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
    const inputs = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[type="text"]'),
    )
    expect(inputs.length).toBe(2)
    expect(inputs[0].value).toBe('/old-path')
    expect(inputs[1].value).toBe('Click Here')
  })

  it('exposes URL and link text inputs by accessible name', () => {
    renderPopover(activeElement)

    expect(
      (screen.getByRole('textbox', { name: 'URL' }) as HTMLInputElement).value,
    ).toBe('/old-path')
    expect(
      (screen.getByRole('textbox', { name: 'Link Text' }) as HTMLInputElement)
        .value,
    ).toBe('Click Here')
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
    expect(payload.oldText).toBe('Click Here')
    expect(payload.newText).toBe('Click Here')
    expect(payload.target).toBeNull()
    expect(payload.rel).toBe('')
    expect(payload.occurrenceIndex).toBe(0)
  })

  it('apply sends changed link text and attributes so they can persist', () => {
    renderPopover(activeElement)
    const inputs = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[type="text"]'),
    )
    fireEvent.change(inputs[1], { target: { value: 'Read the docs' } })
    fireEvent.click(screen.getByRole('switch', { name: 'Open in new tab' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Noindex' }))

    fireEvent.click(screen.getByRole('button', { name: /apply/i }))

    expect(onApply).toHaveBeenCalledTimes(1)
    expect(onApply.mock.calls[0][0]).toMatchObject({
      oldHref: '/old-path',
      newHref: '/old-path',
      oldText: 'Click Here',
      newText: 'Read the docs',
      target: '_blank',
      occurrenceIndex: 0,
    })
    const rel = onApply.mock.calls[0][0].rel
    expect(rel.split(/\s+/)).toEqual(
      expect.arrayContaining(['noopener', 'noreferrer', 'nofollow']),
    )
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

  it('close reverts live-previewed target and rel changes instead of leaving cancelled link attrs in the preview', () => {
    activeElement.setAttribute('rel', 'sponsored')
    renderPopover(activeElement)

    fireEvent.click(screen.getByRole('switch', { name: 'Open in new tab' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Noindex' }))
    expect(activeElement.getAttribute('target')).toBe('_blank')
    expect(activeElement.getAttribute('rel') ?? '').toContain('nofollow')

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(activeElement.getAttribute('target')).toBeNull()
    expect(activeElement.getAttribute('rel')).toBe('sponsored')
    expect(onApply).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('unmount reverts live-previewed target and rel changes when the parent toolbar closes', () => {
    activeElement.setAttribute('rel', 'sponsored')
    const { unmount } = renderPopover(activeElement)

    fireEvent.click(screen.getByRole('switch', { name: 'Open in new tab' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Noindex' }))
    expect(activeElement.getAttribute('target')).toBe('_blank')
    expect(activeElement.getAttribute('rel') ?? '').toContain('nofollow')

    unmount()

    expect(activeElement.getAttribute('target')).toBeNull()
    expect(activeElement.getAttribute('rel')).toBe('sponsored')
    expect(onApply).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('unmount after apply keeps committed target and rel changes in the preview', () => {
    const { unmount } = renderPopover(activeElement)

    fireEvent.click(screen.getByRole('switch', { name: 'Open in new tab' }))
    fireEvent.click(screen.getByRole('button', { name: /apply/i }))
    unmount()

    expect(onApply).toHaveBeenCalledTimes(1)
    expect(activeElement.getAttribute('target')).toBe('_blank')
    const rel = activeElement.getAttribute('rel') ?? ''
    expect(rel.split(/\s+/)).toEqual(
      expect.arrayContaining(['noopener', 'noreferrer']),
    )
  })

  it('open-in-new-tab toggle adds target=_blank and rel attributes', () => {
    renderPopover(activeElement)
    const toggle = document.querySelector(
      'button[aria-label="Open in new tab"]',
    ) as HTMLButtonElement
    expect(toggle).toBeTruthy()
    fireEvent.click(toggle)
    expect(activeElement.getAttribute('target')).toBe('_blank')
    const rel = activeElement.getAttribute('rel') ?? ''
    expect(rel.split(/\s+/)).toContain('noopener')
    expect(rel.split(/\s+/)).toContain('noreferrer')
  })

  it('toggle off removes target and rel attributes', () => {
    activeElement.setAttribute('target', '_blank')
    activeElement.setAttribute('rel', 'noopener noreferrer')
    renderPopover(activeElement)
    const toggle = document.querySelector(
      'button[aria-label="Open in new tab"]',
    ) as HTMLButtonElement
    // First click turns it off
    fireEvent.click(toggle)
    expect(activeElement.getAttribute('target')).toBeNull()
    expect(activeElement.getAttribute('rel')).toBeNull()
  })

  it('noindex toggle appends nofollow to existing rel', () => {
    activeElement.setAttribute('rel', 'noopener noreferrer')
    renderPopover(activeElement)
    const toggle = document.querySelector(
      'button[aria-label="Noindex"]',
    ) as HTMLButtonElement
    fireEvent.click(toggle)
    const rel = activeElement.getAttribute('rel') ?? ''
    expect(rel.split(/\s+/)).toContain('nofollow')
    expect(rel.split(/\s+/)).toContain('noopener')
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

  it('computes occurrenceIndex for hrefs that contain CSS selector punctuation', () => {
    activeElement.setAttribute('href', '/search?q="polished glass"&tag=[hero]')
    const link2 = document.createElement('a')
    link2.setAttribute('href', '/search?q="polished glass"&tag=[hero]')
    link2.textContent = 'Second matching link'
    document.body.appendChild(link2)

    renderPopover(link2)
    fireEvent.change(screen.getByRole('textbox', { name: 'URL' }), {
      target: { value: '/search?q=updated&tag=[hero]' },
    })
    fireEvent.click(screen.getByRole('button', { name: /apply/i }))

    expect(onApply).toHaveBeenCalledTimes(1)
    expect(onApply.mock.calls[0][0]).toMatchObject({
      oldHref: '/search?q="polished glass"&tag=[hero]',
      newHref: '/search?q=updated&tag=[hero]',
      occurrenceIndex: 1,
    })

    link2.remove()
  })
})
