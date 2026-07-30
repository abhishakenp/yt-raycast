import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

import {
  ServicesGrid,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
} from './ServicesGrid.tsx'

afterEach(() => {
  cleanup()
})

describe('ServicesGrid', () => {
  it('renders as a section with services-grid data-slot', () => {
    render(<ServicesGrid data-testid="grid">x</ServicesGrid>)
    const el = screen.getByTestId('grid')
    expect(el.tagName).toBe('SECTION')
    expect(el.getAttribute('data-slot')).toBe('services-grid')
  })

  it('renders heading via SectionHeading when provided', () => {
    render(
      <ServicesGrid heading="What we do" subheading="sub">
        <ServiceCard>
          <ServiceTitle>T</ServiceTitle>
        </ServiceCard>
      </ServicesGrid>,
    )
    expect(screen.getByText('What we do')).toBeTruthy()
    expect(screen.getByText('sub')).toBeTruthy()
  })

  it('omits heading block when heading not provided', () => {
    render(
      <ServicesGrid data-testid="grid">
        <ServiceCard>
          <ServiceTitle>Only card</ServiceTitle>
        </ServiceCard>
      </ServicesGrid>,
    )
    expect(screen.getByTestId('grid').querySelector('h2')).toBeNull()
  })

  it('columns=3 applies md:grid-cols-3', () => {
    render(
      <ServicesGrid columns={3} data-testid="grid">
        x
      </ServicesGrid>,
    )
    // grid wrapper is the inner div
    const grid = screen.getByTestId('grid').querySelector('div.grid')
    expect(grid).not.toBeNull()
    expect(grid?.className).toContain('md:grid-cols-3')
  })

  it('columns=2 applies md:grid-cols-2', () => {
    render(
      <ServicesGrid columns={2} data-testid="grid">
        x
      </ServicesGrid>,
    )
    const grid = screen.getByTestId('grid').querySelector('div.grid')
    expect(grid?.className).toContain('md:grid-cols-2')
  })

  it('columns=4 applies md:grid-cols-2 lg:grid-cols-4', () => {
    render(
      <ServicesGrid columns={4} data-testid="grid">
        x
      </ServicesGrid>,
    )
    const grid = screen.getByTestId('grid').querySelector('div.grid')
    expect(grid?.className).toContain('md:grid-cols-2')
    expect(grid?.className).toContain('lg:grid-cols-4')
  })

  it('forwards className and merges', () => {
    render(
      <ServicesGrid data-testid="grid" className="gap-12">
        x
      </ServicesGrid>,
    )
    expect(screen.getByTestId('grid').className).toContain('gap-12')
  })

  it('forwards ref', () => {
    let ref: HTMLElement | null = null
    render(
      <ServicesGrid
        ref={(r) => {
          ref = r
        }}
      >
        x
      </ServicesGrid>,
    )
    expect(ref).not.toBeNull()
    expect(ref?.tagName).toBe('SECTION')
  })
})

describe('ServiceCard', () => {
  it('renders as a div with service-card data-slot', () => {
    render(<ServiceCard data-testid="card">x</ServiceCard>)
    const el = screen.getByTestId('card')
    expect(el.tagName).toBe('DIV')
    expect(el.getAttribute('data-slot')).toBe('service-card')
  })

  it('applies default card classes', () => {
    render(<ServiceCard data-testid="card">x</ServiceCard>)
    const el = screen.getByTestId('card')
    expect(el.getAttribute('data-d-role')).toBe('card')
    expect(el.className).toContain('border')
    expect(el.className).toContain('bg-card')
  })

  it('asChild renders as Slot child', () => {
    render(
      <ServiceCard asChild data-testid="card">
        <li />
      </ServiceCard>,
    )
    expect(screen.getByTestId('card').tagName).toBe('LI')
  })
})

describe('ServiceIcon', () => {
  it('renders as a div with service-icon data-slot', () => {
    render(<ServiceIcon data-testid="icon">x</ServiceIcon>)
    const el = screen.getByTestId('icon')
    expect(el.tagName).toBe('DIV')
    expect(el.getAttribute('data-slot')).toBe('service-icon')
  })

  it('applies default icon tile classes', () => {
    render(<ServiceIcon data-testid="icon">x</ServiceIcon>)
    const cls = screen.getByTestId('icon').className
    expect(cls).toContain('bg-primary/10')
    expect(cls).toContain('text-primary')
  })
})

describe('ServiceTitle', () => {
  it('renders as an h3 with service-title data-slot', () => {
    render(<ServiceTitle data-testid="title">x</ServiceTitle>)
    const el = screen.getByTestId('title')
    expect(el.tagName).toBe('H3')
    expect(el.getAttribute('data-slot')).toBe('service-title')
  })
})

describe('ServiceDescription', () => {
  it('renders as a p with service-description data-slot', () => {
    render(<ServiceDescription data-testid="desc">x</ServiceDescription>)
    const el = screen.getByTestId('desc')
    expect(el.tagName).toBe('P')
    expect(el.getAttribute('data-slot')).toBe('service-description')
  })
})
