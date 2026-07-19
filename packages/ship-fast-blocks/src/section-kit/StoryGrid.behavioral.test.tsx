import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

import { StoryGrid } from './StoryGrid.tsx'

afterEach(() => {
  cleanup()
})

describe('StoryGrid', () => {
  it('renders as a section with story-grid-section data-slot', () => {
    render(<StoryGrid data-testid="s">x</StoryGrid>)
    const el = screen.getByTestId('s')
    expect(el.tagName).toBe('SECTION')
    expect(el.getAttribute('data-slot')).toBe('story-grid-section')
  })

  it('applies variant classes', () => {
    render(
      <StoryGrid variant="muted" data-testid="s">
        x
      </StoryGrid>,
    )
    expect(screen.getByTestId('s').className).toContain('bg-muted')
  })

  it('default variant has no bg-muted', () => {
    render(<StoryGrid data-testid="s">x</StoryGrid>)
    expect(screen.getByTestId('s').className).not.toContain('bg-muted')
  })

  it('asChild renders as Slot child', () => {
    render(
      <StoryGrid asChild data-testid="s">
        <article />
      </StoryGrid>,
    )
    const el = screen.getByTestId('s')
    expect(el.tagName).toBe('ARTICLE')
    expect(el.getAttribute('data-slot')).toBe('story-grid-section')
  })

  it('forwards ref', () => {
    let ref: HTMLElement | null = null
    render(
      <StoryGrid
        ref={(r) => {
          ref = r
        }}
      >
        x
      </StoryGrid>,
    )
    expect(ref).not.toBeNull()
    expect(ref?.tagName).toBe('SECTION')
  })

  it('preserves aria-labelledby', () => {
    render(
      <StoryGrid aria-labelledby="heading" data-testid="s">
        x
      </StoryGrid>,
    )
    expect(screen.getByTestId('s').getAttribute('aria-labelledby')).toBe(
      'heading',
    )
  })
})
