import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

import {
  ProcessTimeline,
  ProcessTimelineHeader,
  ProcessGrid,
  ProcessBadge,
  ProcessStep,
  ProcessContent,
  ProcessConnector,
} from './ProcessTimeline.tsx'

afterEach(() => {
  cleanup()
})

describe('ProcessTimeline', () => {
  it('renders as a section with process-timeline data-slot', () => {
    render(<ProcessTimeline data-testid="tl">x</ProcessTimeline>)
    const el = screen.getByTestId('tl')
    expect(el.tagName).toBe('SECTION')
    expect(el.getAttribute('data-slot')).toBe('process-timeline')
  })

  it('applies variant classes', () => {
    render(
      <ProcessTimeline variant="muted" data-testid="tl">
        x
      </ProcessTimeline>,
    )
    expect(screen.getByTestId('tl').className).toContain('bg-muted')
  })

  it('asChild renders as Slot child', () => {
    render(
      <ProcessTimeline asChild data-testid="tl">
        <article />
      </ProcessTimeline>,
    )
    const el = screen.getByTestId('tl')
    expect(el.tagName).toBe('ARTICLE')
    expect(el.getAttribute('data-slot')).toBe('process-timeline')
  })

  it('forwards ref', () => {
    let ref: HTMLElement | null = null
    render(
      <ProcessTimeline
        ref={(r) => {
          ref = r
        }}
      >
        x
      </ProcessTimeline>,
    )
    expect(ref).not.toBeNull()
    expect(ref?.tagName).toBe('SECTION')
  })
})

describe('ProcessTimelineHeader', () => {
  it('renders as a div with process-timeline-header data-slot', () => {
    render(<ProcessTimelineHeader data-testid="h">x</ProcessTimelineHeader>)
    const el = screen.getByTestId('h')
    expect(el.tagName).toBe('DIV')
    expect(el.getAttribute('data-slot')).toBe('process-timeline-header')
  })
})

describe('ProcessGrid', () => {
  it('renders as a div with process-grid data-slot', () => {
    render(<ProcessGrid data-testid="g">x</ProcessGrid>)
    const el = screen.getByTestId('g')
    expect(el.tagName).toBe('DIV')
    expect(el.getAttribute('data-slot')).toBe('process-grid')
  })

  it('columns=3 applies md:grid-cols-3', () => {
    render(
      <ProcessGrid columns={3} data-testid="g">
        x
      </ProcessGrid>,
    )
    expect(screen.getByTestId('g').className).toContain('md:grid-cols-3')
  })

  it('columns=4 applies md:grid-cols-2 lg:grid-cols-4', () => {
    render(
      <ProcessGrid columns={4} data-testid="g">
        x
      </ProcessGrid>,
    )
    const cls = screen.getByTestId('g').className
    expect(cls).toContain('md:grid-cols-2')
    expect(cls).toContain('lg:grid-cols-4')
  })
})

describe('ProcessBadge', () => {
  it('renders as a div with process-badge data-slot', () => {
    render(<ProcessBadge index={0} data-testid="b" />)
    const el = screen.getByTestId('b')
    expect(el.tagName).toBe('DIV')
    expect(el.getAttribute('data-slot')).toBe('process-badge')
  })

  it('renders the 1-based index', () => {
    render(<ProcessBadge index={2} data-testid="b" />)
    expect(screen.getByTestId('b').textContent).toBe('3')
  })

  it('pad=true zero-pads the index', () => {
    render(<ProcessBadge index={0} pad data-testid="b" />)
    expect(screen.getByTestId('b').textContent).toBe('01')
  })

  it('faded-ordinal variant renders as a span', () => {
    render(<ProcessBadge index={0} variant="faded-ordinal" data-testid="b" />)
    const el = screen.getByTestId('b')
    expect(el.tagName).toBe('SPAN')
    expect(el.className).toContain('text-5xl')
  })

  it('filled-circle variant applies circle classes', () => {
    render(<ProcessBadge index={0} variant="filled-circle" data-testid="b" />)
    const cls = screen.getByTestId('b').className
    expect(cls).toContain('rounded-full')
    expect(cls).toContain('bg-primary')
  })
})

describe('ProcessStep', () => {
  it('renders as an li with process-step data-slot', () => {
    render(<ProcessStep data-testid="s">x</ProcessStep>)
    const el = screen.getByTestId('s')
    expect(el.tagName).toBe('LI')
    expect(el.getAttribute('data-slot')).toBe('process-step')
  })
})

describe('ProcessContent', () => {
  it('renders as a div with process-content data-slot', () => {
    render(<ProcessContent data-testid="c">x</ProcessContent>)
    const el = screen.getByTestId('c')
    expect(el.tagName).toBe('DIV')
    expect(el.getAttribute('data-slot')).toBe('process-content')
  })
})

describe('ProcessConnector', () => {
  it('renders as a div with process-connector data-slot', () => {
    render(<ProcessConnector data-testid="conn" />)
    const el = screen.getByTestId('conn')
    expect(el.tagName).toBe('DIV')
    expect(el.getAttribute('data-slot')).toBe('process-connector')
  })

  it('is aria-hidden by default', () => {
    render(<ProcessConnector data-testid="conn" />)
    expect(screen.getByTestId('conn').getAttribute('aria-hidden')).toBe('true')
  })
})
