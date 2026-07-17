// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

import { LogoStrip } from './index.ts'

describe('LogoStrip', () => {
  it('renders as section with data-slot', () => {
    render(
      <LogoStrip logos={['Acme', 'Globex']} data-testid="strip">
        <span>x</span>
      </LogoStrip>,
    )
    const el = screen.getByTestId('strip')
    expect(el.tagName).toBe('SECTION')
    expect(el.getAttribute('data-slot')).toBe('logo-strip')
  })

  it('renders lead text when provided', () => {
    render(<LogoStrip lead="Trusted by" logos={['Acme']} />)
    expect(screen.getByText('Trusted by').tagName).toBe('P')
  })

  it('does not render lead when omitted', () => {
    const { container } = render(<LogoStrip logos={['Acme']} />)
    const ps = container.querySelectorAll('p')
    expect(ps.length).toBe(0)
  })

  it('renders all logos as spans by default', () => {
    render(<LogoStrip logos={['Acme', 'Globex', 'Initech']} />)
    expect(screen.getByText('Acme').tagName).toBe('SPAN')
    expect(screen.getByText('Globex').tagName).toBe('SPAN')
    expect(screen.getByText('Initech').tagName).toBe('SPAN')
  })

  it('renders logos as buttons when onClickLogo provided', () => {
    const onClick = vi.fn()
    render(<LogoStrip logos={['Acme', 'Globex']} onClickLogo={onClick} />)
    expect(screen.getByText('Acme').tagName).toBe('BUTTON')
    expect(screen.getByText('Globex').tagName).toBe('BUTTON')
  })

  it('calls onClickLogo with logo name on click', () => {
    const onClick = vi.fn()
    render(<LogoStrip logos={['Acme']} onClickLogo={onClick} />)
    screen.getByText('Acme').click()
    expect(onClick).toHaveBeenCalledWith('Acme')
  })

  it('layout=flex uses flex-wrap classes', () => {
    const { container } = render(<LogoStrip layout="flex" logos={['Acme']} />)
    const wrapper = container.querySelector('.flex.flex-wrap')
    expect(wrapper).toBeTruthy()
  })

  it('layout=grid uses grid grid-cols-3', () => {
    const { container } = render(
      <LogoStrip layout="grid" logos={['Acme', 'B', 'C']} />,
    )
    const wrapper = container.querySelector('.grid.grid-cols-3')
    expect(wrapper).toBeTruthy()
  })

  it('logoStyle=text-bold adds hover:text-foreground', () => {
    render(<LogoStrip logoStyle="text-bold" logos={['Acme']} />)
    expect(screen.getByText('Acme').className).toContain(
      'hover:text-foreground',
    )
  })

  it('logoStyle=opacity-hover adds hover:text-foreground', () => {
    render(<LogoStrip logoStyle="opacity-hover" logos={['Acme']} />)
    expect(screen.getByText('Acme').className).toContain(
      'hover:text-foreground',
    )
  })

  it('merges className', () => {
    render(
      <LogoStrip
        logos={['Acme']}
        className="border-y border-border bg-muted/30"
        data-testid="strip"
      />,
    )
    const cls = screen.getByTestId('strip').className
    expect(cls).toContain('border-y')
    expect(cls).toContain('bg-muted/30')
  })

  it('merges leadClassName', () => {
    render(
      <LogoStrip
        lead="Trusted by"
        leadClassName="tracking-[0.18em]"
        logos={['Acme']}
      />,
    )
    expect(screen.getByText('Trusted by').className).toContain(
      'tracking-[0.18em]',
    )
  })

  it('merges logoClassName', () => {
    render(<LogoStrip logos={['Acme']} logoClassName="text-xl" />)
    expect(screen.getByText('Acme').className).toContain('text-xl')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLElement | null }
    render(<LogoStrip logos={['Acme']} ref={ref} />)
    expect(ref.current?.tagName).toBe('SECTION')
  })

  it('filters falsy logos', () => {
    render(<LogoStrip logos={['Acme', '', 'Globex']} />)
    expect(screen.getByText('Acme')).toBeTruthy()
    expect(screen.getByText('Globex')).toBeTruthy()
  })
})
