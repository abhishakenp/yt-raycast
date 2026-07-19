import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

import { KpisGrid, KpiTrendArrow } from './KpisGrid.tsx'

afterEach(() => {
  cleanup()
})

describe('KpisGrid', () => {
  it('renders as a div with kpis-grid data-slot', () => {
    render(<KpisGrid data-testid="grid">x</KpisGrid>)
    const el = screen.getByTestId('grid')
    expect(el.tagName).toBe('DIV')
    expect(el.getAttribute('data-slot')).toBe('kpis-grid')
  })

  it('forwards className and merges', () => {
    render(
      <KpisGrid data-testid="grid" className="gap-4">
        x
      </KpisGrid>,
    )
    expect(screen.getByTestId('grid').className).toContain('gap-4')
  })

  it('asChild renders as Slot child', () => {
    render(
      <KpisGrid asChild data-testid="grid">
        <ul />
      </KpisGrid>,
    )
    const el = screen.getByTestId('grid')
    expect(el.tagName).toBe('UL')
    expect(el.getAttribute('data-slot')).toBe('kpis-grid')
  })

  it('forwards ref to the grid node', () => {
    let ref: HTMLDivElement | null = null
    render(
      <KpisGrid
        ref={(r) => {
          ref = r
        }}
      >
        x
      </KpisGrid>,
    )
    expect(ref).not.toBeNull()
    expect(ref?.tagName).toBe('DIV')
  })
})

describe('KpiTrendArrow', () => {
  it('renders as a span with kpi-trend-arrow data-slot', () => {
    render(<KpiTrendArrow trend="up" data-testid="arrow" />)
    const el = screen.getByTestId('arrow')
    expect(el.tagName).toBe('SPAN')
    expect(el.getAttribute('data-slot')).toBe('kpi-trend-arrow')
  })

  it('renders an inline svg by default', () => {
    const { container } = render(<KpiTrendArrow trend="up" />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
  })

  it('up arrow renders the up path', () => {
    const { container } = render(<KpiTrendArrow trend="up" />)
    const path = container.querySelector('svg path')
    expect(path?.getAttribute('d')).toBe('M7 17l9.2-9.2M17 17V7H7')
  })

  it('down arrow renders the down path', () => {
    const { container } = render(<KpiTrendArrow trend="down" />)
    const path = container.querySelector('svg path')
    expect(path?.getAttribute('d')).toBe('M17 7l-9.2 9.2M7 7v10h10')
  })

  it('respects size prop on the default svg', () => {
    const { container } = render(<KpiTrendArrow trend="up" size={24} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('24')
    expect(svg?.getAttribute('height')).toBe('24')
  })

  it('renders custom children when provided, overriding default svg', () => {
    const { container } = render(
      <KpiTrendArrow trend="up">
        <svg data-testid="custom" />
      </KpiTrendArrow>,
    )
    // custom svg present, default svg (with path) absent
    expect(screen.getByTestId('custom')).toBeTruthy()
    expect(container.querySelector('path')).toBeNull()
  })

  it('asChild renders as Slot child', () => {
    render(
      <KpiTrendArrow trend="up" asChild data-testid="arrow">
        <i />
      </KpiTrendArrow>,
    )
    const el = screen.getByTestId('arrow')
    expect(el.tagName).toBe('I')
    expect(el.getAttribute('data-slot')).toBe('kpi-trend-arrow')
  })

  it('forwards ref', () => {
    let ref: HTMLSpanElement | null = null
    render(
      <KpiTrendArrow
        trend="up"
        ref={(r) => {
          ref = r
        }}
      />,
    )
    expect(ref).not.toBeNull()
    expect(ref?.tagName).toBe('SPAN')
  })
})
