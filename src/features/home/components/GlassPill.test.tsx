// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { GlassDefs, GlassPillAnchor, GlassPillButton } from './GlassPill'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode
    to: string
    [key: string]: unknown
  }) => (
    <a href={to} data-router-link="true" {...props}>
      {children}
    </a>
  ),
}))

describe('GlassPill controls', () => {
  afterEach(cleanup)

  it('renders the SVG defs used by decorated pills', () => {
    const { container } = render(<GlassDefs />)

    expect(container.querySelector('filter#sf-glass-lens')).not.toBeNull()
    expect(container.querySelector('feDisplacementMap')).not.toBeNull()
  })

  it('renders a clickable button with decorative layers outside the label', () => {
    const onClick = vi.fn()
    render(<GlassPillButton onClick={onClick}>Launch</GlassPillButton>)

    const button = screen.getByRole('button', { name: 'Launch' })
    fireEvent.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(
      button.querySelectorAll('[aria-hidden="true"]').length,
    ).toBeGreaterThan(0)
  })

  it('routes internal links through the app router link contract', () => {
    render(<GlassPillAnchor href="/pricing">Pricing</GlassPillAnchor>)

    const link = screen.getByRole('link', { name: 'Pricing' })
    expect(link.getAttribute('href')).toBe('/pricing')
    expect(link.getAttribute('data-router-link')).toBe('true')
  })

  it('leaves external links as plain anchors', () => {
    render(
      <GlassPillAnchor href="https://example.com/docs">Docs</GlassPillAnchor>,
    )

    const link = screen.getByRole('link', { name: 'Docs' })
    expect(link.getAttribute('href')).toBe('https://example.com/docs')
    expect(link.hasAttribute('data-router-link')).toBe(false)
  })
})
