import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

import { StoryGrid } from './StoryGrid.tsx'
import {
  StoryCard,
  StoryCardImage,
  StoryCardImageContainer,
  StoryCardFigure,
  StoryCardMeta,
  StoryCardTitle,
  StoryCardExcerpt,
  StoryCardFooter,
  StoryCardBody,
} from './StoryCard.tsx'

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
        ref={
          ((r: unknown) => {
            ref = r as HTMLElement | null
          }) as never
        }
      >
        x
      </StoryGrid>,
    )
    expect(ref).not.toBeNull()
    expect((ref as HTMLElement | null)?.tagName).toBe('SECTION')
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

describe('StoryCard — correct data-d-role on each sub-component', () => {
  it('StoryCard root has data-d-role="card"', () => {
    render(<StoryCard data-testid="c">x</StoryCard>)
    expect(screen.getByTestId('c').getAttribute('data-d-role')).toBe('card')
  })

  it('StoryCardImage has data-d-role="image" not "card"', () => {
    render(<StoryCardImage data-testid="img" src="/x.png" alt="test" />)
    expect(screen.getByTestId('img').getAttribute('data-d-role')).toBe('image')
  })

  it('StoryCardTitle has data-d-role="heading" not "card"', () => {
    render(<StoryCardTitle data-testid="t">Title</StoryCardTitle>)
    expect(screen.getByTestId('t').getAttribute('data-d-role')).toBe('heading')
  })

  it('StoryCardExcerpt has data-d-role="body" not "card"', () => {
    render(<StoryCardExcerpt data-testid="e">Excerpt</StoryCardExcerpt>)
    expect(screen.getByTestId('e').getAttribute('data-d-role')).toBe('body')
  })

  it('StoryCardImageContainer, Figure, Meta, Body, Footer have no data-d-role', () => {
    render(
      <StoryCardImageContainer data-testid="ic">x</StoryCardImageContainer>,
    )
    render(<StoryCardFigure data-testid="fig">x</StoryCardFigure>)
    render(<StoryCardMeta data-testid="m">x</StoryCardMeta>)
    render(<StoryCardBody data-testid="b">x</StoryCardBody>)
    render(<StoryCardFooter data-testid="f">x</StoryCardFooter>)
    for (const id of ['ic', 'fig', 'm', 'b', 'f']) {
      expect(screen.getByTestId(id).getAttribute('data-d-role')).toBeNull()
    }
  })
})
