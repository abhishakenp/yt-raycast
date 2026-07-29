// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

afterEach(() => {
  cleanup()
})

import {
  FaqAccordion,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
  FaqAnswer,
} from './FaqAccordion.tsx'
describe('FaqAccordion', () => {
  it('renders as div with space-y-4 by default', () => {
    render(
      <FaqAccordion data-testid="acc">
        <span>item</span>
      </FaqAccordion>,
    )
    const el = screen.getByTestId('acc')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('space-y-4')
    expect(el.getAttribute('data-slot')).toBe('faq-accordion')
  })

  it('applies compact variant with space-y-3', () => {
    render(
      <FaqAccordion variant="compact" data-testid="acc">
        <span>x</span>
      </FaqAccordion>,
    )
    expect(screen.getByTestId('acc').className).toContain('space-y-3')
  })

  it('applies wide variant with space-y-6', () => {
    render(
      <FaqAccordion variant="wide" data-testid="acc">
        <span>x</span>
      </FaqAccordion>,
    )
    expect(screen.getByTestId('acc').className).toContain('space-y-6')
  })

  it('applies divided variant with divide-y and border-y', () => {
    render(
      <FaqAccordion variant="divided" data-testid="acc">
        <span>x</span>
      </FaqAccordion>,
    )
    const el = screen.getByTestId('acc')
    expect(el.className).toContain('divide-y')
    expect(el.className).toContain('border-y')
  })

  it('merges className', () => {
    render(
      <FaqAccordion className="mt-10" data-testid="acc">
        <span>x</span>
      </FaqAccordion>,
    )
    expect(screen.getByTestId('acc').className).toContain('mt-10')
  })

  it('asChild renders as dl with merged classes', () => {
    render(
      <FaqAccordion asChild data-testid="acc">
        <dl>def-list</dl>
      </FaqAccordion>,
    )
    const el = screen.getByTestId('acc')
    expect(el.tagName).toBe('DL')
    expect(el.className).toContain('space-y-4')
  })

  it('forwards ref to div', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<FaqAccordion ref={ref} />)
    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName).toBe('DIV')
  })
})

describe('FaqItem', () => {
  it('renders as details with bordered variant by default', () => {
    render(<FaqItem data-testid="item" />)
    const el = screen.getByTestId('item')
    expect(el.tagName).toBe('DETAILS')
    expect(el.className).toContain('group')
    expect(el.className).toContain('border')
    expect(el.className).toContain('border-border')
    expect(el.className).toContain('bg-card')
    expect(el.className).toContain('rounded-xl')
    expect(el.getAttribute('data-slot')).toBe('faq-item')
  })

  it('muted variant has bg-muted/50 no border', () => {
    render(<FaqItem variant="muted" data-testid="item" />)
    const el = screen.getByTestId('item')
    expect(el.className).toContain('bg-muted/50')
    expect(el.className).not.toContain('border-border')
  })

  it('bordered-lg variant has rounded-lg', () => {
    render(<FaqItem variant="bordered-lg" data-testid="item" />)
    expect(screen.getByTestId('item').className).toContain('rounded-lg')
  })

  it('minimal variant has bg-background no border', () => {
    render(<FaqItem variant="minimal" data-testid="item" />)
    const el = screen.getByTestId('item')
    expect(el.className).toContain('bg-background')
    expect(el.className).not.toContain('border-border')
  })

  it('divided variant has py-5 no border/bg', () => {
    render(<FaqItem variant="divided" data-testid="item" />)
    const el = screen.getByTestId('item')
    expect(el.className).toContain('py-5')
    expect(el.className).not.toContain('border-border')
    expect(el.className).not.toContain('bg-card')
  })

  it('open-raised variant has open: bg-card and shadow-sm', () => {
    render(<FaqItem variant="open-raised" data-testid="item" />)
    const el = screen.getByTestId('item')
    expect(el.className).toContain('open:bg-card')
    expect(el.className).toContain('open:shadow-sm')
    expect(el.className).toContain('bg-muted/40')
  })

  it('merges className', () => {
    render(<FaqItem className="px-6 py-1" data-testid="item" />)
    const el = screen.getByTestId('item')
    expect(el.className).toContain('px-6')
    expect(el.className).toContain('py-1')
  })

  it('asChild renders as div with merged classes', () => {
    render(
      <FaqItem asChild variant="minimal" data-testid="item">
        <div>card</div>
      </FaqItem>,
    )
    const el = screen.getByTestId('item')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('bg-background')
  })

  it('forwards ref to details', () => {
    const ref = { current: null as HTMLDetailsElement | null }
    render(<FaqItem ref={ref} />)
    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName).toBe('DETAILS')
  })
})

describe('FaqQuestion', () => {
  it('renders as summary with flex list-none and marker hidden', () => {
    render(<FaqQuestion data-testid="q">Question?</FaqQuestion>)
    const el = screen.getByTestId('q')
    expect(el.tagName).toBe('SUMMARY')
    expect(el.className).toContain('flex')
    expect(el.className).toContain('cursor-pointer')
    expect(el.className).toContain('list-none')
    expect(el.className).toContain('[&::-webkit-details-marker]:hidden')
    expect(el.getAttribute('data-slot')).toBe('faq-question')
  })

  it('merges className', () => {
    render(
      <FaqQuestion className="p-5" data-testid="q">
        Q
      </FaqQuestion>,
    )
    expect(screen.getByTestId('q').className).toContain('p-5')
  })

  it('asChild renders as dt with merged classes', () => {
    render(
      <FaqQuestion asChild data-testid="q">
        <dt>Term</dt>
      </FaqQuestion>,
    )
    const el = screen.getByTestId('q')
    expect(el.tagName).toBe('DT')
    expect(el.className).toContain('flex')
  })

  it('forwards ref to summary', () => {
    const ref = { current: null as HTMLElement | null }
    render(<FaqQuestion ref={ref}>Q</FaqQuestion>)
    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName).toBe('SUMMARY')
  })
})

describe('FaqQuestionIcon', () => {
  it('renders as span with chevron variant by default', () => {
    render(<FaqQuestionIcon data-testid="icon" />)
    const el = screen.getByTestId('icon')
    expect(el.tagName).toBe('SPAN')
    expect(el.className).toContain('group-open:rotate-180')
    expect(el.className).toContain('shrink-0')
    expect(el.getAttribute('data-slot')).toBe('faq-question-icon')
  })

  it('plus variant has group-open:rotate-45', () => {
    render(<FaqQuestionIcon variant="plus" data-testid="icon" />)
    expect(screen.getByTestId('icon').className).toContain(
      'group-open:rotate-45',
    )
  })

  it('chevron-badge variant has size-8 rounded-full border', () => {
    render(<FaqQuestionIcon variant="chevron-badge" data-testid="icon" />)
    const el = screen.getByTestId('icon')
    expect(el.className).toContain('size-8')
    expect(el.className).toContain('rounded-full')
    expect(el.className).toContain('border')
  })

  it('renders chevron SVG by default', () => {
    const { container } = render(<FaqQuestionIcon />)
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
    expect(svg?.querySelector('path')?.getAttribute('d')).toBe('M6 9l6 6 6-6')
  })

  it('renders plus SVG for plus variant', () => {
    const { container } = render(<FaqQuestionIcon variant="plus" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
    const lines = svg?.querySelectorAll('line')
    expect(lines?.length).toBe(2)
  })

  it('renders smaller chevron SVG for chevron-badge variant', () => {
    const { container } = render(<FaqQuestionIcon variant="chevron-badge" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
    expect(svg?.getAttribute('width')).toBe('16')
    expect(svg?.querySelector('polyline')).toBeTruthy()
  })

  it('uses children when provided instead of default icon', () => {
    render(
      <FaqQuestionIcon data-testid="icon">
        <span data-testid="custom">+</span>
      </FaqQuestionIcon>,
    )
    expect(screen.getByTestId('custom')).toBeTruthy()
    expect(screen.queryByTestId('icon')?.querySelector('svg')).toBeNull()
  })

  it('merges className', () => {
    render(<FaqQuestionIcon className="size-4" data-testid="icon" />)
    expect(screen.getByTestId('icon').className).toContain('size-4')
  })

  it('asChild renders as child element', () => {
    render(
      <FaqQuestionIcon asChild data-testid="icon">
        <span>+</span>
      </FaqQuestionIcon>,
    )
    const el = screen.getByTestId('icon')
    expect(el.tagName).toBe('SPAN')
    expect(el.className).toContain('group-open:rotate-180')
  })
})

describe('FaqAnswer', () => {
  it('renders as p with text-muted-foreground and leading-relaxed', () => {
    render(<FaqAnswer data-testid="a">Answer text</FaqAnswer>)
    const el = screen.getByTestId('a')
    expect(el.tagName).toBe('P')
    expect(el.className).toContain('text-muted-foreground')
    expect(el.className).toContain('leading-relaxed')
    expect(el.getAttribute('data-slot')).toBe('faq-answer')
  })

  it('merges className', () => {
    render(
      <FaqAnswer className="px-5 pb-5 text-sm" data-testid="a">
        A
      </FaqAnswer>,
    )
    const el = screen.getByTestId('a')
    expect(el.className).toContain('px-5')
    expect(el.className).toContain('pb-5')
    expect(el.className).toContain('text-sm')
  })

  it('asChild renders as div with merged classes', () => {
    render(
      <FaqAnswer asChild data-testid="a">
        <div>multi-para</div>
      </FaqAnswer>,
    )
    const el = screen.getByTestId('a')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('text-muted-foreground')
  })

  it('forwards ref to p', () => {
    const ref = { current: null as HTMLParagraphElement | null }
    render(<FaqAnswer ref={ref}>A</FaqAnswer>)
    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName).toBe('P')
  })
})

describe('FaqAccordion compound composition', () => {
  it('composes full accordion with all sub-components', () => {
    render(
      <FaqAccordion>
        <FaqItem>
          <FaqQuestion>
            What is this?
            <FaqQuestionIcon variant="chevron" />
          </FaqQuestion>
          <FaqAnswer>A thing.</FaqAnswer>
        </FaqItem>
      </FaqAccordion>,
    )
    expect(screen.getByText('What is this?').tagName).toBe('SUMMARY')
    expect(screen.getByText('A thing.').tagName).toBe('P')
    const details = screen.getByText('What is this?').closest('details')
    expect(details?.tagName).toBe('DETAILS')
    expect(details?.getAttribute('data-slot')).toBe('faq-item')
  })

  it('composes definition-list variant via asChild', () => {
    render(
      <FaqAccordion asChild>
        <dl data-testid="dl">
          <FaqItem asChild variant="minimal">
            <div data-testid="card">
              <FaqQuestion asChild>
                <dt data-testid="dt">Term</dt>
              </FaqQuestion>
              <FaqAnswer asChild>
                <dd data-testid="dd">Definition</dd>
              </FaqAnswer>
            </div>
          </FaqItem>
        </dl>
      </FaqAccordion>,
    )
    expect(screen.getByTestId('dl').tagName).toBe('DL')
    expect(screen.getByTestId('card').tagName).toBe('DIV')
    expect(screen.getByTestId('dt').tagName).toBe('DT')
    expect(screen.getByTestId('dd').tagName).toBe('DD')
    expect(screen.getByTestId('dt').className).toContain('flex')
    expect(screen.getByTestId('dd').className).toContain(
      'text-muted-foreground',
    )
  })

  it('FaqQuestion has padding so items are not cramped', () => {
    render(
      <FaqItem data-testid="item">
        <FaqQuestion data-testid="q">Is this padded?</FaqQuestion>
        <FaqAnswer>Yes</FaqAnswer>
      </FaqItem>,
    )
    expect(screen.getByTestId('q').className).toContain('px-5')
    expect(screen.getByTestId('q').className).toContain('py-4')
  })

  it('FaqAnswer has bottom padding so text is not cramped', () => {
    render(
      <FaqItem>
        <FaqQuestion>Is this padded?</FaqQuestion>
        <FaqAnswer data-testid="a">Yes, padded</FaqAnswer>
      </FaqItem>,
    )
    expect(screen.getByTestId('a').className).toContain('px-5')
    expect(screen.getByTestId('a').className).toContain('pb-5')
  })
})
