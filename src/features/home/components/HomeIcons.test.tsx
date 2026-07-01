// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  CloseIcon,
  LogoMark,
  SearchIcon,
  ShareIcon,
  ZapIcon,
} from './HomeIcons'

describe('HomeIcons', () => {
  afterEach(() => cleanup())

  it('renders the logo asset as decorative image content', () => {
    render(<LogoMark />)

    const logo = screen.getByAltText('Ship Fast Logo')
    expect(logo.getAttribute('src')).toBe('/assets/logo-transparent.png')
    expect(logo.getAttribute('aria-hidden')).toBe('true')
  })

  it.each([
    ['search-icon', SearchIcon],
    ['close-icon', CloseIcon],
    ['zap-icon', ZapIcon],
  ] as const)('renders %s as an svg glyph', (testId, Icon) => {
    render(
      <span data-testid={testId}>
        <Icon />
      </span>,
    )

    expect(screen.getByTestId(testId).querySelector('svg')).toBeTruthy()
  })

  it('renders share actions as labelled buttons and forwards clicks', () => {
    const onClick = vi.fn()

    render(
      <ShareIcon
        id="share-twitter"
        label="Share on Twitter"
        title="Share generated site"
        onClick={onClick}
      >
        <path d="M4 4h16v16H4z" />
      </ShareIcon>,
    )

    const button = screen.getByRole('button', { name: 'Share on Twitter' })
    expect(button.getAttribute('id')).toBe('share-twitter')
    expect(button.getAttribute('title')).toBe('Share generated site')

    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
