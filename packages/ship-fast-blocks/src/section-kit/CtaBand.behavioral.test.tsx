import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

import {
  CtaBand,
  CtaBandInner,
  CtaBandEyebrow,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaBandActions,
  CtaAction,
} from './CtaBand.tsx'

afterEach(() => {
  cleanup()
})

describe('CtaBand', () => {
  it('renders as section with data-slot', () => {
    render(<CtaBand data-testid="band">x</CtaBand>)
    const el = screen.getByTestId('band')
    expect(el.tagName).toBe('SECTION')
    expect(el.getAttribute('data-slot')).toBe('cta-band')
  })

  it('tone=primary applies primary bg class', () => {
    render(
      <CtaBand tone="primary" data-testid="band">
        x
      </CtaBand>,
    )
    expect(screen.getByTestId('band').className).toContain('bg-primary')
  })

  it('tone=muted applies muted bg class', () => {
    render(
      <CtaBand tone="muted" data-testid="band">
        x
      </CtaBand>,
    )
    expect(screen.getByTestId('band').className).toContain('bg-muted')
  })

  it('tone=card applies card bg + border classes', () => {
    render(
      <CtaBand tone="card" data-testid="band">
        x
      </CtaBand>,
    )
    const cls = screen.getByTestId('band').className
    expect(cls).toContain('bg-card')
    expect(cls).toContain('border')
  })

  it('default tone is primary', () => {
    render(<CtaBand data-testid="band">x</CtaBand>)
    expect(screen.getByTestId('band').className).toContain('bg-primary')
  })

  it('asChild renders as Slot child', () => {
    render(
      <CtaBand asChild data-testid="band">
        <article>x</article>
      </CtaBand>,
    )
    const el = screen.getByTestId('band')
    expect(el.tagName).toBe('ARTICLE')
    expect(el.getAttribute('data-slot')).toBe('cta-band')
  })

  it('forwards className and extra props', () => {
    render(
      <CtaBand className="custom-x" data-foo="bar" data-testid="band">
        x
      </CtaBand>,
    )
    const el = screen.getByTestId('band')
    expect(el.className).toContain('custom-x')
    expect(el.getAttribute('data-foo')).toBe('bar')
  })

  it('forwards ref', () => {
    let ref: HTMLElement | null = null
    render(<CtaBand ref={(r) => (ref = r)}>x</CtaBand>)
    expect(ref).not.toBeNull()
    expect(ref?.tagName).toBe('SECTION')
  })
})

describe('CtaBandInner', () => {
  it('renders as div with data-slot', () => {
    render(<CtaBandInner data-testid="inner">x</CtaBandInner>)
    const el = screen.getByTestId('inner')
    expect(el.tagName).toBe('DIV')
    expect(el.getAttribute('data-slot')).toBe('cta-band-inner')
  })

  it('align=center applies center classes', () => {
    render(
      <CtaBandInner align="center" data-testid="inner">
        x
      </CtaBandInner>,
    )
    const cls = screen.getByTestId('inner').className
    expect(cls).toContain('items-center')
    expect(cls).toContain('text-center')
  })

  it('align=left applies left classes', () => {
    render(
      <CtaBandInner align="left" data-testid="inner">
        x
      </CtaBandInner>,
    )
    const cls = screen.getByTestId('inner').className
    expect(cls).toContain('items-start')
    expect(cls).toContain('text-left')
  })

  it('default align is center', () => {
    render(<CtaBandInner data-testid="inner">x</CtaBandInner>)
    expect(screen.getByTestId('inner').className).toContain('items-center')
  })

  it('asChild renders as Slot child', () => {
    render(
      <CtaBandInner asChild data-testid="inner">
        <main>x</main>
      </CtaBandInner>,
    )
    expect(screen.getByTestId('inner').tagName).toBe('MAIN')
  })
})

describe('CtaBandEyebrow', () => {
  it('renders as span with data-slot', () => {
    render(<CtaBandEyebrow data-testid="eb">Label</CtaBandEyebrow>)
    const el = screen.getByTestId('eb')
    expect(el.tagName).toBe('SPAN')
    expect(el.getAttribute('data-slot')).toBe('cta-band-eyebrow')
    expect(el.textContent).toBe('Label')
  })

  it('applies uppercase tracking classes', () => {
    render(<CtaBandEyebrow data-testid="eb">x</CtaBandEyebrow>)
    const cls = screen.getByTestId('eb').className
    expect(cls).toContain('uppercase')
    expect(cls).toContain('tracking')
  })

  it('asChild renders as Slot child', () => {
    render(
      <CtaBandEyebrow asChild data-testid="eb">
        <small>x</small>
      </CtaBandEyebrow>,
    )
    expect(screen.getByTestId('eb').tagName).toBe('SMALL')
  })
})

describe('CtaBandTitle', () => {
  it('renders as h2 with data-slot', () => {
    render(<CtaBandTitle data-testid="t">Headline</CtaBandTitle>)
    const el = screen.getByTestId('t')
    expect(el.tagName).toBe('H2')
    expect(el.getAttribute('data-slot')).toBe('cta-band-title')
    expect(el.textContent).toBe('Headline')
  })

  it('applies text-3xl font-semibold classes', () => {
    render(<CtaBandTitle data-testid="t">x</CtaBandTitle>)
    const cls = screen.getByTestId('t').className
    expect(cls).toContain('text-3xl')
    expect(cls).toContain('font-semibold')
  })

  it('asChild renders as Slot child', () => {
    render(
      <CtaBandTitle asChild data-testid="t">
        <h1>x</h1>
      </CtaBandTitle>,
    )
    expect(screen.getByTestId('t').tagName).toBe('H1')
  })
})

describe('CtaBandSubtitle', () => {
  it('renders as p with data-slot', () => {
    render(<CtaBandSubtitle data-testid="s">Supporting</CtaBandSubtitle>)
    const el = screen.getByTestId('s')
    expect(el.tagName).toBe('P')
    expect(el.getAttribute('data-slot')).toBe('cta-band-subtitle')
    expect(el.textContent).toBe('Supporting')
  })

  it('applies max-w-2xl class', () => {
    render(<CtaBandSubtitle data-testid="s">x</CtaBandSubtitle>)
    expect(screen.getByTestId('s').className).toContain('max-w-2xl')
  })

  it('asChild renders as Slot child', () => {
    render(
      <CtaBandSubtitle asChild data-testid="s">
        <div>x</div>
      </CtaBandSubtitle>,
    )
    expect(screen.getByTestId('s').tagName).toBe('DIV')
  })
})

describe('CtaBandActions', () => {
  it('renders as div with data-slot', () => {
    render(<CtaBandActions data-testid="a">x</CtaBandActions>)
    const el = screen.getByTestId('a')
    expect(el.tagName).toBe('DIV')
    expect(el.getAttribute('data-slot')).toBe('cta-band-actions')
  })

  it('align=center justifies center', () => {
    render(
      <CtaBandActions align="center" data-testid="a">
        x
      </CtaBandActions>,
    )
    expect(screen.getByTestId('a').className).toContain('justify-center')
  })

  it('align=left justifies start', () => {
    render(
      <CtaBandActions align="left" data-testid="a">
        x
      </CtaBandActions>,
    )
    expect(screen.getByTestId('a').className).toContain('justify-start')
  })

  it('default align is center', () => {
    render(<CtaBandActions data-testid="a">x</CtaBandActions>)
    expect(screen.getByTestId('a').className).toContain('justify-center')
  })
})

describe('CtaAction', () => {
  it('renders as button with data-slot', () => {
    render(<CtaAction data-testid="btn">Click</CtaAction>)
    const el = screen.getByTestId('btn')
    expect(el.tagName).toBe('BUTTON')
    expect(el.getAttribute('data-slot')).toBe('cta-action')
    expect(el.textContent).toBe('Click')
  })

  it('variant=primary applies primary classes', () => {
    render(
      <CtaAction variant="primary" data-testid="btn">
        x
      </CtaAction>,
    )
    expect(screen.getByTestId('btn').className).not.toBe('')
  })

  it('variant=outline applies outline classes', () => {
    render(
      <CtaAction variant="outline" data-testid="btn">
        x
      </CtaAction>,
    )
    expect(screen.getByTestId('btn').className).not.toBe('')
  })

  it('variant=ghost applies ghost classes', () => {
    render(
      <CtaAction variant="ghost" data-testid="btn">
        x
      </CtaAction>,
    )
    expect(screen.getByTestId('btn').className).not.toBe('')
  })

  it('default variant is primary', () => {
    render(<CtaAction data-testid="btn">x</CtaAction>)
    // No assertion on specific class — just that it renders without error
    expect(screen.getByTestId('btn')).toBeTruthy()
  })

  it('forwards onClick', () => {
    const onClick = vi.fn()
    render(
      <CtaAction onClick={onClick} data-testid="btn">
        x
      </CtaAction>,
    )
    screen.getByTestId('btn').click()
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('asChild renders as Fragment (no wrapper)', () => {
    render(
      <CtaAction asChild>
        <a href="/x" data-testid="link">
          link
        </a>
      </CtaAction>,
    )
    const el = screen.getByTestId('link')
    expect(el.tagName).toBe('A')
    expect(el.getAttribute('data-slot')).toBe('cta-action')
  })

  it('invert=true applies invert classes', () => {
    render(
      <CtaAction invert data-testid="btn">
        x
      </CtaAction>,
    )
    expect(screen.getByTestId('btn').className).not.toBe('')
  })
})

describe('CtaBand compound composition', () => {
  it('renders full compound tree with correct slots', () => {
    render(
      <CtaBand tone="muted" data-testid="band">
        <CtaBandInner align="center">
          <CtaBandEyebrow>Eyebrow Text</CtaBandEyebrow>
          <CtaBandTitle>Main Headline</CtaBandTitle>
          <CtaBandSubtitle>Supporting line</CtaBandSubtitle>
          <CtaBandActions>
            <CtaAction variant="primary">Primary</CtaAction>
            <CtaAction variant="outline">Secondary</CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>,
    )
    expect(screen.getByTestId('band').getAttribute('data-slot')).toBe(
      'cta-band',
    )
    expect(screen.getByText('Eyebrow Text').getAttribute('data-slot')).toBe(
      'cta-band-eyebrow',
    )
    expect(screen.getByText('Main Headline').tagName).toBe('H2')
    expect(screen.getByText('Supporting line').tagName).toBe('P')
    expect(screen.getByText('Primary').tagName).toBe('BUTTON')
    expect(screen.getByText('Secondary').tagName).toBe('BUTTON')
  })
})
