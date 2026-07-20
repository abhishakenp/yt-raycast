// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

afterEach(() => {
  cleanup()
})

import {
  OverviewSection,
  OverviewGrid,
  OverviewContent,
  OverviewEyebrow,
  OverviewBrand,
  OverviewHeading,
  OverviewSubheading,
  OverviewFeatures,
  OverviewFeature,
  OverviewCta,
  OverviewStats,
  OverviewStat,
  OverviewStatValue,
  OverviewStatLabel,
  OverviewMediaPanel,
} from './OverviewSection.tsx'
describe('OverviewSection', () => {
  it('renders as section with bg-background py-20', () => {
    render(
      <OverviewSection data-testid="sec">
        <span>child</span>
      </OverviewSection>,
    )
    const el = screen.getByTestId('sec')
    expect(el.tagName).toBe('SECTION')
    expect(el.className).toContain('bg-background')
    expect(el.className).toContain('py-20')
    expect(el.getAttribute('data-slot')).toBe('overview-section')
  })

  it('merges className', () => {
    render(
      <OverviewSection className="pt-32" data-testid="sec">
        <span>x</span>
      </OverviewSection>,
    )
    expect(screen.getByTestId('sec').className).toContain('pt-32')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLElement | null }
    render(<OverviewSection ref={ref} />)
    expect(ref.current?.tagName).toBe('SECTION')
  })
})

describe('OverviewGrid', () => {
  it('renders as div with grid max-w-7xl and 2-col layout', () => {
    render(
      <OverviewGrid data-testid="grid">
        <span>x</span>
      </OverviewGrid>,
    )
    const el = screen.getByTestId('grid')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('grid')
    expect(el.className).toContain('max-w-7xl')
    expect(el.className).toContain('lg:grid-cols-[1.05fr_0.95fr]')
    expect(el.getAttribute('data-slot')).toBe('overview-grid')
  })
})

describe('OverviewContent', () => {
  it('renders as div with flex flex-col', () => {
    render(
      <OverviewContent data-testid="content">
        <span>x</span>
      </OverviewContent>,
    )
    const el = screen.getByTestId('content')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('flex')
    expect(el.className).toContain('flex-col')
    expect(el.getAttribute('data-slot')).toBe('overview-content')
  })
})

describe('OverviewEyebrow', () => {
  it('renders as div with rounded-full border bg-muted pill', () => {
    render(<OverviewEyebrow data-testid="eyebrow">Eyebrow</OverviewEyebrow>)
    const el = screen.getByTestId('eyebrow')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('rounded-full')
    expect(el.className).toContain('border')
    expect(el.className).toContain('bg-muted')
    expect(el.className).toContain('text-muted-foreground')
    expect(el.getAttribute('data-slot')).toBe('overview-eyebrow')
  })
})

describe('OverviewBrand', () => {
  it('renders as p with uppercase tracking-wider text-primary', () => {
    render(<OverviewBrand data-testid="brand">Brand</OverviewBrand>)
    const el = screen.getByTestId('brand')
    expect(el.tagName).toBe('P')
    expect(el.className).toContain('uppercase')
    expect(el.className).toContain('tracking-wider')
    expect(el.className).toContain('text-primary')
    expect(el.getAttribute('data-slot')).toBe('overview-brand')
  })
})

describe('OverviewHeading', () => {
  it('renders as h2 with text-4xl font-bold', () => {
    render(<OverviewHeading data-testid="heading">Heading</OverviewHeading>)
    const el = screen.getByTestId('heading')
    expect(el.tagName).toBe('H2')
    expect(el.className).toContain('text-4xl')
    expect(el.className).toContain('font-bold')
    expect(el.getAttribute('data-slot')).toBe('overview-heading')
  })

  it('asChild renders as h1', () => {
    render(
      <OverviewHeading asChild data-testid="heading">
        <h1>Title</h1>
      </OverviewHeading>,
    )
    expect(screen.getByTestId('heading').tagName).toBe('H1')
  })
})

describe('OverviewSubheading', () => {
  it('renders as p with text-lg text-muted-foreground', () => {
    render(
      <OverviewSubheading data-testid="sub">Subheading</OverviewSubheading>,
    )
    const el = screen.getByTestId('sub')
    expect(el.tagName).toBe('P')
    expect(el.className).toContain('text-lg')
    expect(el.className).toContain('text-muted-foreground')
    expect(el.getAttribute('data-slot')).toBe('overview-subheading')
  })
})

describe('OverviewFeatures', () => {
  it('renders as div with flex flex-wrap gap-3', () => {
    render(
      <OverviewFeatures data-testid="features">
        <span>x</span>
      </OverviewFeatures>,
    )
    const el = screen.getByTestId('features')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('flex')
    expect(el.className).toContain('flex-wrap')
    expect(el.className).toContain('gap-3')
    expect(el.getAttribute('data-slot')).toBe('overview-features')
  })
})

describe('OverviewFeature', () => {
  it('renders as span with rounded-full border bg-card pill', () => {
    render(<OverviewFeature data-testid="feature">Feature</OverviewFeature>)
    const el = screen.getByTestId('feature')
    expect(el.tagName).toBe('SPAN')
    expect(el.className).toContain('rounded-full')
    expect(el.className).toContain('border')
    expect(el.className).toContain('bg-card')
    expect(el.className).toContain('text-card-foreground')
    expect(el.getAttribute('data-slot')).toBe('overview-feature')
  })
})

describe('OverviewCta', () => {
  it('renders as div with flex flex-col sm:flex-row', () => {
    render(
      <OverviewCta data-testid="cta">
        <button>Click</button>
      </OverviewCta>,
    )
    const el = screen.getByTestId('cta')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('flex')
    expect(el.className).toContain('flex-col')
    expect(el.className).toContain('sm:flex-row')
    expect(el.getAttribute('data-slot')).toBe('overview-cta')
  })
})

describe('OverviewStats', () => {
  it('renders as div with grid grid-cols-3 border-t', () => {
    render(
      <OverviewStats data-testid="stats">
        <span>x</span>
      </OverviewStats>,
    )
    const el = screen.getByTestId('stats')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('grid')
    expect(el.className).toContain('grid-cols-3')
    expect(el.className).toContain('border-t')
    expect(el.getAttribute('data-slot')).toBe('overview-stats')
  })
})

describe('OverviewStat', () => {
  it('renders as div with flex flex-col', () => {
    render(<OverviewStat data-testid="stat">x</OverviewStat>)
    const el = screen.getByTestId('stat')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('flex')
    expect(el.className).toContain('flex-col')
    expect(el.getAttribute('data-slot')).toBe('overview-stat')
  })
})

describe('OverviewStatValue', () => {
  it('renders as div with text-2xl font-bold text-foreground', () => {
    render(<OverviewStatValue data-testid="val">100%</OverviewStatValue>)
    const el = screen.getByTestId('val')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('text-2xl')
    expect(el.className).toContain('font-bold')
    expect(el.className).toContain('text-foreground')
    expect(el.getAttribute('data-slot')).toBe('overview-stat-value')
  })
})

describe('OverviewStatLabel', () => {
  it('renders as div with text-sm text-muted-foreground', () => {
    render(<OverviewStatLabel data-testid="label">Label</OverviewStatLabel>)
    const el = screen.getByTestId('label')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('text-sm')
    expect(el.className).toContain('text-muted-foreground')
    expect(el.getAttribute('data-slot')).toBe('overview-stat-label')
  })
})

describe('OverviewMediaPanel', () => {
  it('renders with blur glow and image card', () => {
    const { container } = render(
      <OverviewMediaPanel
        alt="Test image"
        brand="TestBrand"
        caption="A caption"
        data-testid="panel"
      />,
    )
    const el = screen.getByTestId('panel')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('relative')
    expect(el.getAttribute('data-slot')).toBe('overview-image-panel')
    // Blur glow
    const glow = el.querySelector('.blur-3xl')
    expect(glow).toBeTruthy()
    // Image
    const img = container.querySelector('img')
    expect(img).toBeTruthy()
    expect(img?.getAttribute('alt')).toBe('Test image')
    // Brand caption
    expect(screen.getByText('TestBrand')).toBeTruthy()
    expect(screen.getByText('A caption')).toBeTruthy()
  })

  it('hides caption footer when brand is omitted', () => {
    render(<OverviewMediaPanel alt="No brand" data-testid="panel" />)
    expect(screen.queryByText('TestBrand')).toBeNull()
  })
})

describe('OverviewSection compound composition', () => {
  it('composes full overview section with all sub-components', () => {
    render(
      <OverviewSection>
        <OverviewGrid>
          <OverviewContent>
            <OverviewEyebrow>Overview</OverviewEyebrow>
            <OverviewBrand>Brand</OverviewBrand>
            <OverviewHeading>Heading text</OverviewHeading>
            <OverviewSubheading>Subheading text</OverviewSubheading>
            <OverviewFeatures>
              <OverviewFeature>Feature 1</OverviewFeature>
              <OverviewFeature>Feature 2</OverviewFeature>
            </OverviewFeatures>
            <OverviewCta>
              <button>Primary</button>
              <button>Secondary</button>
            </OverviewCta>
            <OverviewStats>
              <OverviewStat>
                <OverviewStatValue>01</OverviewStatValue>
                <OverviewStatLabel>Label 1</OverviewStatLabel>
              </OverviewStat>
              <OverviewStat>
                <OverviewStatValue>100%</OverviewStatValue>
                <OverviewStatLabel>Label 2</OverviewStatLabel>
              </OverviewStat>
            </OverviewStats>
          </OverviewContent>
          <OverviewMediaPanel
            alt="Hero image"
            brand="Brand"
            caption="Caption text"
          />
        </OverviewGrid>
      </OverviewSection>,
    )
    expect(screen.getByText('Overview').tagName).toBe('DIV')
    expect(screen.getAllByText('Brand').length).toBe(2) // brand + image caption
    expect(screen.getByText('Heading text').tagName).toBe('H2')
    expect(screen.getByText('Subheading text').tagName).toBe('P')
    expect(screen.getAllByText(/Feature \d/).length).toBe(2)
    expect(screen.getByText('Primary').tagName).toBe('BUTTON')
    expect(screen.getByText('01').tagName).toBe('DIV')
    expect(screen.getByText('Label 1').tagName).toBe('DIV')
    expect(screen.getByText('Caption text')).toBeTruthy()
  })
})
