import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

import {
  StorySection,
  StorySplitGrid,
  StoryMedia,
  StoryContent,
  StoryEyebrow,
  StoryHeading,
  StoryBody,
  StoryFooter,
  StoryFeatures,
  StoryImageTile,
} from './StorySection.tsx'

afterEach(() => {
  cleanup()
})

describe('StorySection', () => {
  it('renders as a section with story-section data-slot', () => {
    render(<StorySection data-testid="s">x</StorySection>)
    const el = screen.getByTestId('s')
    expect(el.tagName).toBe('SECTION')
    expect(el.getAttribute('data-slot')).toBe('story-section')
  })

  it('applies variant classes', () => {
    render(
      <StorySection variant="muted" data-testid="s">
        x
      </StorySection>,
    )
    expect(screen.getByTestId('s').className).toContain('bg-muted')
  })

  it('asChild renders as Slot child', () => {
    render(
      <StorySection asChild data-testid="s">
        <article />
      </StorySection>,
    )
    const el = screen.getByTestId('s')
    expect(el.tagName).toBe('ARTICLE')
    expect(el.getAttribute('data-slot')).toBe('story-section')
  })

  it('forwards ref', () => {
    let ref: HTMLElement | null = null
    render(
      <StorySection
        ref={
          ((r: unknown) => {
            ref = r as HTMLElement | null
          }) as never
        }
      >
        x
      </StorySection>,
    )
    expect(ref).not.toBeNull()
    expect((ref as HTMLElement | null)?.tagName).toBe('SECTION')
  })
})

describe('StorySplitGrid', () => {
  it('renders as a div with story-grid data-slot', () => {
    render(<StorySplitGrid data-testid="g">x</StorySplitGrid>)
    const el = screen.getByTestId('g')
    expect(el.tagName).toBe('DIV')
    expect(el.getAttribute('data-slot')).toBe('story-grid')
  })

  it('has lg:grid-cols-2 by default', () => {
    render(<StorySplitGrid data-testid="g">x</StorySplitGrid>)
    expect(screen.getByTestId('g').className).toContain('lg:grid-cols-2')
  })
})

describe('StoryMedia', () => {
  it('renders as a div with story-media data-slot', () => {
    render(<StoryMedia data-testid="m">x</StoryMedia>)
    expect(screen.getByTestId('m').getAttribute('data-slot')).toBe(
      'story-media',
    )
  })
})

describe('StoryContent', () => {
  it('renders as a div with story-content data-slot', () => {
    render(<StoryContent data-testid="c">x</StoryContent>)
    expect(screen.getByTestId('c').getAttribute('data-slot')).toBe(
      'story-content',
    )
  })
})

describe('StoryEyebrow', () => {
  it('renders as a p with story-eyebrow data-slot', () => {
    render(<StoryEyebrow data-testid="e">x</StoryEyebrow>)
    const el = screen.getByTestId('e')
    expect(el.tagName).toBe('P')
    expect(el.getAttribute('data-slot')).toBe('story-eyebrow')
  })
})

describe('StoryHeading', () => {
  it('renders as an h2 with story-heading data-slot', () => {
    render(<StoryHeading data-testid="h">x</StoryHeading>)
    const el = screen.getByTestId('h')
    expect(el.tagName).toBe('H2')
    expect(el.getAttribute('data-slot')).toBe('story-heading')
  })
})

describe('StoryBody', () => {
  it('renders as a div with story-body data-slot', () => {
    render(<StoryBody data-testid="b">x</StoryBody>)
    expect(screen.getByTestId('b').getAttribute('data-slot')).toBe('story-body')
  })
})

describe('StoryFooter', () => {
  it('renders as a div with story-footer data-slot', () => {
    render(<StoryFooter data-testid="f">x</StoryFooter>)
    expect(screen.getByTestId('f').getAttribute('data-slot')).toBe(
      'story-footer',
    )
  })
})

describe('StoryFeatures', () => {
  it('renders as a ul with story-features data-slot', () => {
    render(<StoryFeatures data-testid="fe">x</StoryFeatures>)
    const el = screen.getByTestId('fe')
    expect(el.tagName).toBe('UL')
    expect(el.getAttribute('data-slot')).toBe('story-features')
  })
})

describe('StoryImageTile', () => {
  it('renders as a div with story-image-tile data-slot', () => {
    render(<StoryImageTile data-testid="t">x</StoryImageTile>)
    expect(screen.getByTestId('t').getAttribute('data-slot')).toBe(
      'story-image-tile',
    )
  })

  it('offset=true adds mt-8', () => {
    render(
      <StoryImageTile offset data-testid="t">
        x
      </StoryImageTile>,
    )
    expect(screen.getByTestId('t').className).toContain('mt-8')
  })
})

describe('StoryFooter — no footer role on sub-components', () => {
  it('StoryFooter does not carry data-d-role="footer"', () => {
    render(<StoryFooter data-testid="f">x</StoryFooter>)
    const el = screen.getByTestId('f')
    expect(el.getAttribute('data-d-role')).not.toBe('footer')
  })
})
