import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

import { MapOverlay, MapPin } from './MapBlock.tsx'

afterEach(() => {
  cleanup()
})

describe('MapOverlay', () => {
  it('renders as a div with map-overlay data-slot', () => {
    render(<MapOverlay data-testid="overlay" />)
    const el = screen.getByTestId('overlay')
    expect(el.tagName).toBe('DIV')
    expect(el.getAttribute('data-slot')).toBe('map-overlay')
  })

  it('is aria-hidden by default', () => {
    render(<MapOverlay data-testid="overlay" />)
    expect(screen.getByTestId('overlay').getAttribute('aria-hidden')).toBe(
      'true',
    )
  })

  it('applies the default gradient classes', () => {
    render(<MapOverlay data-testid="overlay" />)
    const cls = screen.getByTestId('overlay').className
    expect(cls).toContain('pointer-events-none')
    expect(cls).toContain('absolute')
    expect(cls).toContain('bg-gradient-to-tr')
    expect(cls).toContain('from-background/70')
  })

  it('asChild renders as Slot child', () => {
    render(
      <MapOverlay asChild data-testid="overlay">
        <span />
      </MapOverlay>,
    )
    const el = screen.getByTestId('overlay')
    expect(el.tagName).toBe('SPAN')
    expect(el.getAttribute('data-slot')).toBe('map-overlay')
  })

  it('forwards ref', () => {
    let ref: HTMLDivElement | null = null
    render(
      <MapOverlay
        ref={
          ((r: unknown) => {
            ref = r as HTMLDivElement | null
          }) as never
        }
      />,
    )
    expect(ref).not.toBeNull()
    expect((ref as HTMLElement | null)?.tagName).toBe('DIV')
  })
})

describe('MapPin', () => {
  it('renders as a span with map-pin data-slot', () => {
    render(<MapPin data-testid="pin" />)
    const el = screen.getByTestId('pin')
    expect(el.tagName).toBe('SPAN')
    expect(el.getAttribute('data-slot')).toBe('map-pin')
  })

  it('is aria-hidden by default', () => {
    render(<MapPin data-testid="pin" />)
    expect(screen.getByTestId('pin').getAttribute('aria-hidden')).toBe('true')
  })

  it('renders the default pin svg with path + circle', () => {
    const { container } = render(<MapPin />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    const path = container.querySelector('svg path')
    const circle = container.querySelector('svg circle')
    expect(path?.getAttribute('d')).toBe(
      'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z',
    )
    expect(circle?.getAttribute('cx')).toBe('12')
  })

  it('respects size prop on the default svg', () => {
    const { container } = render(<MapPin size={24} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('24')
    expect(svg?.getAttribute('height')).toBe('24')
  })

  it('renders custom children when provided, overriding default svg', () => {
    const { container } = render(
      <MapPin>
        <svg data-testid="custom" />
      </MapPin>,
    )
    expect(screen.getByTestId('custom')).toBeTruthy()
    // default path absent
    expect(container.querySelector('path')).toBeNull()
  })

  it('applies the default position + tint classes', () => {
    render(<MapPin data-testid="pin" />)
    const cls = screen.getByTestId('pin').className
    expect(cls).toContain('absolute')
    expect(cls).toContain('bottom-4')
    expect(cls).toContain('left-4')
    expect(cls).toContain('bg-primary')
    expect(cls).toContain('text-primary-foreground')
  })

  it('asChild renders as Slot child', () => {
    render(
      <MapPin asChild data-testid="pin">
        <i />
      </MapPin>,
    )
    const el = screen.getByTestId('pin')
    expect(el.tagName).toBe('I')
    expect(el.getAttribute('data-slot')).toBe('map-pin')
  })

  it('forwards ref', () => {
    let ref: HTMLSpanElement | null = null
    render(
      <MapPin
        ref={
          ((r: unknown) => {
            ref = r as HTMLDivElement | null
          }) as never
        }
      />,
    )
    expect(ref).not.toBeNull()
    expect((ref as HTMLElement | null)?.tagName).toBe('SPAN')
  })
})
