// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from './index.ts'

describe('LogoStrip', () => {
  it('renders as section with data-slot', () => {
    render(
      <LogoStrip data-testid="strip">
        <span>x</span>
      </LogoStrip>,
    )
    const el = screen.getByTestId('strip')
    expect(el.tagName).toBe('SECTION')
    expect(el.getAttribute('data-slot')).toBe('logo-strip')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLElement | null }
    render(<LogoStrip ref={ref} />)
    expect(ref.current?.tagName).toBe('SECTION')
  })

  it('merges className', () => {
    render(
      <LogoStrip
        className="border-y border-border bg-muted/30"
        data-testid="strip"
      />,
    )
    const cls = screen.getByTestId('strip').className
    expect(cls).toContain('border-y')
    expect(cls).toContain('bg-muted/30')
  })

  it('asChild renders as child tag', () => {
    const { container } = render(
      <LogoStrip asChild data-testid="strip">
        <div />
      </LogoStrip>,
    )
    const el = screen.getByTestId('strip')
    expect(el.tagName).toBe('DIV')
    expect(container.querySelector('section')).toBeNull()
  })
})

describe('LogoStripLabel', () => {
  it('renders as p with data-slot', () => {
    render(<LogoStripLabel>Trusted by</LogoStripLabel>)
    const el = screen.getByText('Trusted by')
    expect(el.tagName).toBe('P')
    expect(el.getAttribute('data-slot')).toBe('logo-strip-label')
  })

  it('has uppercase tracking base classes', () => {
    render(<LogoStripLabel>Trusted by</LogoStripLabel>)
    const cls = screen.getByText('Trusted by').className
    expect(cls).toContain('uppercase')
    expect(cls).toContain('tracking-wide')
  })

  it('merges className', () => {
    render(
      <LogoStripLabel className="tracking-[0.18em]">Trusted by</LogoStripLabel>,
    )
    expect(screen.getByText('Trusted by').className).toContain(
      'tracking-[0.18em]',
    )
  })

  it('asChild renders as child tag', () => {
    render(
      <LogoStripLabel asChild>
        <span>Trusted by</span>
      </LogoStripLabel>,
    )
    expect(screen.getByText('Trusted by').tagName).toBe('SPAN')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLParagraphElement | null }
    render(<LogoStripLabel ref={ref}>Trusted by</LogoStripLabel>)
    expect(ref.current?.tagName).toBe('P')
  })
})

describe('LogoStripItems', () => {
  it('renders as div with data-slot', () => {
    render(<LogoStripItems data-testid="items" />)
    const el = screen.getByTestId('items')
    expect(el.tagName).toBe('DIV')
    expect(el.getAttribute('data-slot')).toBe('logo-strip-items')
  })

  it('layout=flex uses flex-wrap classes', () => {
    render(<LogoStripItems layout="flex" data-testid="items" />)
    const cls = screen.getByTestId('items').className
    expect(cls).toContain('flex')
    expect(cls).toContain('flex-wrap')
  })

  it('layout=grid uses grid grid-cols-3', () => {
    render(<LogoStripItems layout="grid" data-testid="items" />)
    const cls = screen.getByTestId('items').className
    expect(cls).toContain('grid')
    expect(cls).toContain('grid-cols-3')
  })

  it('default layout is flex', () => {
    render(<LogoStripItems data-testid="items" />)
    expect(screen.getByTestId('items').className).toContain('flex-wrap')
  })

  it('merges className', () => {
    render(<LogoStripItems className="mt-8" data-testid="items" />)
    expect(screen.getByTestId('items').className).toContain('mt-8')
  })

  it('asChild renders as child tag', () => {
    render(
      <LogoStripItems asChild data-testid="items">
        <ul />
      </LogoStripItems>,
    )
    expect(screen.getByTestId('items').tagName).toBe('UL')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<LogoStripItems ref={ref} />)
    expect(ref.current?.tagName).toBe('DIV')
  })
})

describe('LogoStripItem', () => {
  it('renders as span with data-slot', () => {
    render(<LogoStripItem>Acme</LogoStripItem>)
    const el = screen.getByText('Acme')
    expect(el.tagName).toBe('SPAN')
    expect(el.getAttribute('data-slot')).toBe('logo-strip-item')
  })

  it('variant=text uses text-lg font-semibold', () => {
    render(<LogoStripItem variant="text">Acme</LogoStripItem>)
    const cls = screen.getByText('Acme').className
    expect(cls).toContain('text-lg')
    expect(cls).toContain('font-semibold')
  })

  it('variant=text-bold adds hover:text-foreground', () => {
    render(<LogoStripItem variant="text-bold">Acme</LogoStripItem>)
    expect(screen.getByText('Acme').className).toContain(
      'hover:text-foreground',
    )
  })

  it('variant=opacity-hover adds hover:text-foreground', () => {
    render(<LogoStripItem variant="opacity-hover">Acme</LogoStripItem>)
    expect(screen.getByText('Acme').className).toContain(
      'hover:text-foreground',
    )
  })

  it('default variant is text', () => {
    render(<LogoStripItem>Acme</LogoStripItem>)
    const cls = screen.getByText('Acme').className
    expect(cls).toContain('text-lg')
    expect(cls).not.toContain('hover:text-foreground')
  })

  it('merges className', () => {
    render(<LogoStripItem className="text-xl">Acme</LogoStripItem>)
    expect(screen.getByText('Acme').className).toContain('text-xl')
  })

  it('asChild renders as child tag (button)', () => {
    render(
      <LogoStripItem asChild>
        <button>Acme</button>
      </LogoStripItem>,
    )
    expect(screen.getByText('Acme').tagName).toBe('BUTTON')
  })

  it('asChild button keeps variant classes', () => {
    render(
      <LogoStripItem asChild variant="opacity-hover">
        <button>Acme</button>
      </LogoStripItem>,
    )
    const cls = screen.getByText('Acme').className
    expect(cls).toContain('hover:text-foreground')
  })

  it('forwards onClick', () => {
    const onClick = vi.fn()
    render(
      <LogoStripItem asChild>
        <button onClick={onClick}>Acme</button>
      </LogoStripItem>,
    )
    screen.getByText('Acme').click()
    expect(onClick).toHaveBeenCalled()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLSpanElement | null }
    render(<LogoStripItem ref={ref}>Acme</LogoStripItem>)
    expect(ref.current?.tagName).toBe('SPAN')
  })
})

describe('LogoStrip composition', () => {
  it('full composition renders label + items + items', () => {
    const { container } = render(
      <LogoStrip aria-label="Trusted companies" className="py-12">
        <LogoStripLabel className="tracking-wider">
          Trusted by engineering teams at
        </LogoStripLabel>
        <LogoStripItems layout="grid" className="mt-8">
          <LogoStripItem variant="opacity-hover">Stripe</LogoStripItem>
          <LogoStripItem variant="opacity-hover">Notion</LogoStripItem>
        </LogoStripItems>
      </LogoStrip>,
    )
    expect(screen.getByText('Trusted by engineering teams at').tagName).toBe(
      'P',
    )
    expect(screen.getByText('Stripe').tagName).toBe('SPAN')
    expect(screen.getByText('Notion').tagName).toBe('SPAN')
    const items = container.querySelector('[data-slot="logo-strip-items"]')
    expect(items?.className).toContain('grid-cols-3')
  })

  it('clickable composition with asChild buttons', () => {
    const go = vi.fn()
    render(
      <LogoStrip>
        <LogoStripItems layout="grid">
          <LogoStripItem asChild variant="opacity-hover">
            <button onClick={() => go('Stripe')}>Stripe</button>
          </LogoStripItem>
        </LogoStripItems>
      </LogoStrip>,
    )
    screen.getByText('Stripe').click()
    expect(go).toHaveBeenCalledWith('Stripe')
  })
})
