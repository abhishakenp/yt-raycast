// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ShareBonusPanel } from './ShareBonusPanel'

describe('ShareBonusPanel release accessibility', () => {
  it('gives every visible share action a unique accessible name', () => {
    const view = render(<ShareBonusPanel visible onShareClick={vi.fn()} />)

    expect(view.getByRole('button', { name: 'Share on WhatsApp' })).toBeTruthy()
    expect(view.getByRole('button', { name: 'Share on Facebook' })).toBeTruthy()
    expect(view.getByRole('button', { name: 'Share on X' })).toBeTruthy()
    expect(view.getByRole('button', { name: 'Share on Telegram' })).toBeTruthy()
    expect(view.getByRole('button', { name: 'Share on LinkedIn' })).toBeTruthy()
    expect(view.getByRole('button', { name: 'Share' })).toBeTruthy()
  })
})
