// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ShareBonusPanel, handleShareClick } from './ShareBonusPanel'

describe('ShareBonusPanel', () => {
  afterEach(cleanup)

  it('hides and shows the share bonus action strip without unmounting actions', () => {
    const onShareClick = vi.fn()
    const view = render(
      <ShareBonusPanel visible={false} onShareClick={onShareClick} />,
    )
    const panel = view.container.querySelector('#share-bonus-panel')

    expect(panel?.classList.contains('hidden')).toBe(true)
    expect(panel?.classList.contains('flex')).toBe(false)
    expect(view.getByRole('button', { name: 'Share on WhatsApp' })).toBeTruthy()

    view.rerender(<ShareBonusPanel visible onShareClick={onShareClick} />)

    expect(panel?.classList.contains('hidden')).toBe(false)
    expect(panel?.classList.contains('flex')).toBe(true)
  })

  it('reports each platform through the panel callback', () => {
    const onShareClick = vi.fn()
    const view = render(<ShareBonusPanel visible onShareClick={onShareClick} />)

    fireEvent.click(view.getByRole('button', { name: 'Share on WhatsApp' }))
    fireEvent.click(view.getByRole('button', { name: 'Share on Facebook' }))
    fireEvent.click(view.getByRole('button', { name: 'Share on X' }))
    fireEvent.click(view.getByRole('button', { name: 'Share on Telegram' }))
    fireEvent.click(view.getByRole('button', { name: 'Share on LinkedIn' }))
    fireEvent.click(view.container.querySelector('#bonus-share-native')!)

    expect(onShareClick.mock.calls.map(([platform]) => platform)).toEqual([
      'whatsapp',
      'facebook',
      'x',
      'telegram',
      'linkedin',
      'native',
    ])
  })
})

describe('handleShareClick', () => {
  const originalOpen = window.open
  const originalShare = navigator.share
  const originalLanguages = Object.getOwnPropertyDescriptor(
    navigator,
    'languages',
  )
  const originalLanguage = Object.getOwnPropertyDescriptor(
    navigator,
    'language',
  )

  beforeEach(() => {
    window.open = vi.fn()
  })

  afterEach(() => {
    window.open = originalOpen
    if (originalShare === undefined) {
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: undefined,
      })
    } else {
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: originalShare,
      })
    }
    if (originalLanguages) {
      Object.defineProperty(navigator, 'languages', originalLanguages)
    }
    if (originalLanguage) {
      Object.defineProperty(navigator, 'language', originalLanguage)
    }
    vi.restoreAllMocks()
  })

  it('claims the bonus before opening a localized platform share URL', async () => {
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      value: ['ta-IN', 'en-US'],
    })
    const claimShareBonus = vi.fn(async () => undefined)

    await handleShareClick('whatsapp', claimShareBonus)

    expect(claimShareBonus).toHaveBeenCalledTimes(1)
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/?text='),
      '_blank',
      'noopener,noreferrer',
    )
    const openedUrl = String(vi.mocked(window.open).mock.calls[0]?.[0])
    expect(decodeURIComponent(openedUrl)).toContain(
      'Ship Fast மூலம் விநாடிகளில் தளம் உருவாக்கினேன்',
    )
  })

  it('uses the native share sheet without opening a fallback window', async () => {
    const share = vi.fn(async () => undefined)
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: share,
    })
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      value: ['en-US'],
    })
    const claimShareBonus = vi.fn(async () => undefined)

    await handleShareClick('native', claimShareBonus)

    expect(claimShareBonus).toHaveBeenCalledTimes(1)
    expect(share).toHaveBeenCalledWith({
      title: 'Ship Fast',
      text: expect.stringContaining('I just built a site in seconds'),
      url: 'https://ship-fast.ai',
    })
    expect(window.open).not.toHaveBeenCalled()
  })

  it('appends ?ref=CODE to the shared URL when a referral code is provided', async () => {
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      value: ['en-US'],
    })
    const claimShareBonus = vi.fn(async () => undefined)

    await handleShareClick('whatsapp', claimShareBonus, 'ABC123')

    const openedUrl = String(vi.mocked(window.open).mock.calls[0]?.[0])
    expect(decodeURIComponent(openedUrl)).toContain('?ref=ABC123')
  })

  it('passes the referral URL to the native share sheet', async () => {
    const share = vi.fn(async () => undefined)
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: share,
    })
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      value: ['en-US'],
    })
    const claimShareBonus = vi.fn(async () => undefined)

    await handleShareClick('native', claimShareBonus, 'XYZ789')

    expect(share).toHaveBeenCalledWith({
      title: 'Ship Fast',
      text: expect.stringContaining('I just built a site in seconds'),
      url: 'https://ship-fast.ai/?ref=XYZ789',
    })
  })

  it('falls back to the bare URL when no referral code is provided', async () => {
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      value: ['en-US'],
    })
    const claimShareBonus = vi.fn(async () => undefined)

    await handleShareClick('facebook', claimShareBonus)

    const openedUrl = String(vi.mocked(window.open).mock.calls[0]?.[0])
    expect(openedUrl).not.toContain('?ref=')
  })
})
