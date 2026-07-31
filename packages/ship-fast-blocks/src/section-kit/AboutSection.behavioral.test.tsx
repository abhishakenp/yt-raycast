import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

import {
  AboutSection,
  AboutGrid,
  AboutMedia,
  AboutContent,
  AboutEyebrow,
  AboutHeading,
  AboutImageTile,
  AboutBody,
  AboutFooter,
} from './AboutSection.tsx'

afterEach(() => {
  cleanup()
})

describe('AboutSection', () => {
  it('renders as a section with about-section data-slot', () => {
    render(<AboutSection data-testid="s">x</AboutSection>)
    const el = screen.getByTestId('s')
    expect(el.tagName).toBe('SECTION')
    expect(el.getAttribute('data-slot')).toBe('about-section')
  })

  it('applies variant classes', () => {
    render(
      <AboutSection variant="muted" data-testid="s">
        x
      </AboutSection>,
    )
    expect(screen.getByTestId('s').className).toContain('bg-muted')
  })

  it('asChild renders as Slot child', () => {
    render(
      <AboutSection asChild data-testid="s">
        <article />
      </AboutSection>,
    )
    const el = screen.getByTestId('s')
    expect(el.tagName).toBe('ARTICLE')
    expect(el.getAttribute('data-slot')).toBe('about-section')
  })

  it('forwards ref', () => {
    let ref: HTMLElement | null = null
    render(
      <AboutSection
        ref={
          ((r: unknown) => {
            ref = r as HTMLElement | null
          }) as never
        }
      >
        x
      </AboutSection>,
    )
    expect(ref).not.toBeNull()
    expect((ref as HTMLElement | null)?.tagName).toBe('SECTION')
  })
})

describe('AboutGrid', () => {
  it('renders as a div with about-grid data-slot', () => {
    render(<AboutGrid data-testid="g">x</AboutGrid>)
    const el = screen.getByTestId('g')
    expect(el.tagName).toBe('DIV')
    expect(el.getAttribute('data-slot')).toBe('about-grid')
  })

  it('has lg:grid-cols-2 by default', () => {
    render(<AboutGrid data-testid="g">x</AboutGrid>)
    expect(screen.getByTestId('g').className).toContain('lg:grid-cols-2')
  })
})

describe('AboutMedia', () => {
  it('renders as a div with about-media data-slot', () => {
    render(<AboutMedia data-testid="m">x</AboutMedia>)
    const el = screen.getByTestId('m')
    expect(el.tagName).toBe('DIV')
    expect(el.getAttribute('data-slot')).toBe('about-media')
  })
})

describe('AboutContent', () => {
  it('renders as a div with about-content data-slot', () => {
    render(<AboutContent data-testid="c">x</AboutContent>)
    const el = screen.getByTestId('c')
    expect(el.tagName).toBe('DIV')
    expect(el.getAttribute('data-slot')).toBe('about-content')
  })
})

describe('AboutEyebrow', () => {
  it('renders as a p with about-eyebrow data-slot', () => {
    render(<AboutEyebrow data-testid="e">x</AboutEyebrow>)
    const el = screen.getByTestId('e')
    expect(el.tagName).toBe('P')
    expect(el.getAttribute('data-slot')).toBe('about-eyebrow')
  })
})

describe('AboutHeading', () => {
  it('renders as an h2 with about-heading data-slot', () => {
    render(<AboutHeading data-testid="h">x</AboutHeading>)
    const el = screen.getByTestId('h')
    expect(el.tagName).toBe('H2')
    expect(el.getAttribute('data-slot')).toBe('about-heading')
  })
})

describe('AboutImageTile', () => {
  it('renders as a div with about-image-tile data-slot', () => {
    render(<AboutImageTile data-testid="t">x</AboutImageTile>)
    const el = screen.getByTestId('t')
    expect(el.tagName).toBe('DIV')
    expect(el.getAttribute('data-slot')).toBe('about-image-tile')
  })

  it('offset=true adds mt-8', () => {
    render(
      <AboutImageTile offset data-testid="t">
        x
      </AboutImageTile>,
    )
    expect(screen.getByTestId('t').className).toContain('mt-8')
  })
})

describe('AboutBody', () => {
  it('renders as a div with about-body data-slot', () => {
    render(<AboutBody data-testid="b">x</AboutBody>)
    const el = screen.getByTestId('b')
    expect(el.tagName).toBe('DIV')
    expect(el.getAttribute('data-slot')).toBe('about-body')
  })
})

describe('AboutFooter', () => {
  it('renders as a div with about-footer data-slot', () => {
    render(<AboutFooter data-testid="f">x</AboutFooter>)
    const el = screen.getByTestId('f')
    expect(el.tagName).toBe('DIV')
    expect(el.getAttribute('data-slot')).toBe('about-footer')
  })
})
