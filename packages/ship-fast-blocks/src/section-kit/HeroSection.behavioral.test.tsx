// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

afterEach(() => {
  cleanup()
})

import {
  HeroSection,
  HeroBackgroundImage,
  HeroContent,
  HeroBadge,
  HeroHeading,
  HeroHighlight,
  HeroSubheading,
  HeroActions,
  HeroMediaPanel,
  HeroSocialProof,
  HeroSocialProofItem,
  HeroStats,
  HeroStat,
  HeroStatValue,
  HeroStatLabel,
} from './HeroSection.tsx'
import { DesignSystemProvider } from '#/primitives/design-context.tsx'
import type { DesignIntent } from '#/primitives/design-system.ts'

const ROUNDED_DESIGN: DesignIntent = {
  radius: 'rounded',
  shadow: 'soft',
  gradient: 'none',
  density: 'balanced',
  typography: 'editorial',
  motion: 'subtle',
}
describe('HeroSection', () => {
  it('renders as section with data-slot', () => {
    render(
      <HeroSection data-testid="sec">
        <span>x</span>
      </HeroSection>,
    )
    const el = screen.getByTestId('sec')
    expect(el.tagName).toBe('SECTION')
    expect(el.getAttribute('data-slot')).toBe('hero-section')
  })

  it('variant=full-bleed adds isolate overflow-hidden', () => {
    render(
      <HeroSection variant="full-bleed" data-testid="sec">
        <span>x</span>
      </HeroSection>,
    )
    expect(screen.getByTestId('sec').className).toContain('isolate')
    expect(screen.getByTestId('sec').className).toContain('overflow-hidden')
  })

  it('variant=gradient adds min-h-screen flex items-center', () => {
    render(
      <HeroSection variant="gradient" data-testid="sec">
        <span>x</span>
      </HeroSection>,
    )
    const cls = screen.getByTestId('sec').className
    expect(cls).toContain('min-h-screen')
    expect(cls).toContain('flex')
    expect(cls).toContain('items-center')
  })

  it('merges className', () => {
    render(
      <HeroSection className="bg-muted/40" data-testid="sec">
        <span>x</span>
      </HeroSection>,
    )
    expect(screen.getByTestId('sec').className).toContain('bg-muted/40')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLElement | null }
    render(<HeroSection ref={ref} />)
    expect(ref.current?.tagName).toBe('SECTION')
  })

  it('asChild renders as div', () => {
    render(
      <HeroSection asChild data-testid="sec">
        <div>x</div>
      </HeroSection>,
    )
    expect(screen.getByTestId('sec').tagName).toBe('DIV')
  })
})

describe('HeroBackgroundImage', () => {
  it('renders image with overlay and gradient', () => {
    const { container } = render(<HeroBackgroundImage alt="Hero bg" />)
    const img = container.querySelector('img')
    expect(img).toBeTruthy()
    expect(img?.getAttribute('alt')).toBe('Hero bg')
    // Should have 2 overlay divs
    const overlays = container.querySelectorAll('[aria-hidden="true"]')
    expect(overlays.length).toBeGreaterThanOrEqual(2)
  })
})

describe('HeroContent', () => {
  it('renders as div with relative z-10', () => {
    render(
      <HeroContent data-testid="content">
        <span>x</span>
      </HeroContent>,
    )
    const el = screen.getByTestId('content')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('relative')
    expect(el.className).toContain('z-10')
    expect(el.getAttribute('data-slot')).toBe('hero-content')
  })
})

describe('HeroBadge', () => {
  it('default variant renders with border bg-background', () => {
    render(<HeroBadge data-testid="badge">Badge</HeroBadge>)
    const el = screen.getByTestId('badge')
    expect(el.tagName).toBe('SPAN')
    expect(el.className).toContain('border')
    expect(el.className).toContain('bg-background')
    expect(el.getAttribute('data-slot')).toBe('hero-badge')
  })

  it('variant=pill renders with uppercase tracking', () => {
    render(
      <HeroBadge variant="pill" data-testid="badge">
        Eyebrow
      </HeroBadge>,
    )
    const cls = screen.getByTestId('badge').className
    expect(cls).toContain('uppercase')
    expect(cls).toContain('tracking-[0.2em]')
    expect(cls).toContain('text-background')
  })

  it('variant=solid renders with bg-primary/10 text-primary', () => {
    render(
      <HeroBadge variant="solid" data-testid="badge">
        Sale
      </HeroBadge>,
    )
    const cls = screen.getByTestId('badge').className
    expect(cls).toContain('bg-primary/10')
    expect(cls).toContain('text-primary')
  })

  it('variant=pulsing-dot renders with bg-accent/50', () => {
    render(
      <HeroBadge variant="pulsing-dot" data-testid="badge">
        Available
      </HeroBadge>,
    )
    expect(screen.getByTestId('badge').className).toContain('bg-accent/50')
  })

  it('asChild renders as div', () => {
    render(
      <HeroBadge asChild data-testid="badge">
        <div>Badge</div>
      </HeroBadge>,
    )
    expect(screen.getByTestId('badge').tagName).toBe('DIV')
  })
})

describe('HeroHeading', () => {
  it('default variant renders as h1 with text-4xl font-bold', () => {
    render(<HeroHeading data-testid="heading">Title</HeroHeading>)
    const el = screen.getByTestId('heading')
    expect(el.tagName).toBe('H1')
    expect(el.className).toContain('text-4xl')
    expect(el.className).toContain('font-bold')
    expect(el.getAttribute('data-slot')).toBe('hero-heading')
  })

  it('variant=serif renders with font-serif text-background', () => {
    render(
      <HeroHeading variant="serif" data-testid="heading">
        Title
      </HeroHeading>,
    )
    const cls = screen.getByTestId('heading').className
    expect(cls).toContain('font-serif')
    expect(cls).toContain('text-background')
  })

  it('variant=extra-bold renders with font-extrabold', () => {
    render(
      <HeroHeading variant="extra-bold" data-testid="heading">
        Title
      </HeroHeading>,
    )
    expect(screen.getByTestId('heading').className).toContain('font-extrabold')
  })

  it('variant=black renders with font-black text-5xl', () => {
    render(
      <HeroHeading variant="black" data-testid="heading">
        Title
      </HeroHeading>,
    )
    const cls = screen.getByTestId('heading').className
    expect(cls).toContain('font-black')
    expect(cls).toContain('text-5xl')
  })

  it('asChild renders as h2', () => {
    render(
      <HeroHeading asChild data-testid="heading">
        <h2>Title</h2>
      </HeroHeading>,
    )
    expect(screen.getByTestId('heading').tagName).toBe('H2')
  })
})

describe('HeroHighlight', () => {
  it('default variant=primary renders with text-primary', () => {
    render(<HeroHighlight data-testid="hl">accented</HeroHighlight>)
    expect(screen.getByTestId('hl').tagName).toBe('SPAN')
    expect(screen.getByTestId('hl').className).toContain('text-primary')
    expect(screen.getByTestId('hl').getAttribute('data-slot')).toBe(
      'hero-highlight',
    )
  })

  it('variant=gradient renders with bg-clip-text text-transparent', () => {
    render(
      <HeroHighlight variant="gradient" data-testid="hl">
        accented
      </HeroHighlight>,
    )
    const cls = screen.getByTestId('hl').className
    expect(cls).toContain('bg-clip-text')
    expect(cls).toContain('text-transparent')
  })
})

describe('HeroSubheading', () => {
  it('default variant renders as p with text-lg text-muted-foreground', () => {
    render(<HeroSubheading data-testid="sub">Subheading</HeroSubheading>)
    const el = screen.getByTestId('sub')
    expect(el.tagName).toBe('P')
    expect(el.className).toContain('text-lg')
    expect(el.className).toContain('text-muted-foreground')
    expect(el.getAttribute('data-slot')).toBe('hero-subheading')
  })

  it('variant=light renders with text-background/80', () => {
    render(
      <HeroSubheading variant="light" data-testid="sub">
        Sub
      </HeroSubheading>,
    )
    expect(screen.getByTestId('sub').className).toContain('text-background/80')
  })

  it('variant=large renders with sm:text-xl', () => {
    render(
      <HeroSubheading variant="large" data-testid="sub">
        Sub
      </HeroSubheading>,
    )
    expect(screen.getByTestId('sub').className).toContain('sm:text-xl')
  })
})

describe('HeroActions', () => {
  it('renders as div with flex flex-wrap gap-3.5', () => {
    render(
      <HeroActions data-testid="ctas">
        <button>Click</button>
      </HeroActions>,
    )
    const el = screen.getByTestId('ctas')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('flex')
    expect(el.className).toContain('flex-wrap')
    expect(el.className).toContain('gap-3.5')
    expect(el.getAttribute('data-slot')).toBe('hero-ctas')
  })
})

describe('HeroMediaPanel', () => {
  it('renders with image inside rounded container', () => {
    const { container } = render(
      <DesignSystemProvider intent={ROUNDED_DESIGN}>
        <HeroMediaPanel alt="Product" data-testid="img" />
      </DesignSystemProvider>,
    )
    const el = screen.getByTestId('img')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('overflow-hidden')
    expect(el.className).toContain('rounded-2xl')
    expect(el.getAttribute('data-slot')).toBe('hero-image')
    const img = container.querySelector('img')
    expect(img).toBeTruthy()
    expect(img?.getAttribute('alt')).toBe('Product')
  })

  it('rounded=3xl uses rounded-3xl', () => {
    render(
      <HeroMediaPanel
        alt="Product"
        className="rounded-3xl"
        data-testid="img"
      />,
    )
    expect(screen.getByTestId('img').className).toContain('rounded-3xl')
  })
})

describe('HeroSocialProof', () => {
  it('renders as ul with flex flex-wrap gap-x-6', () => {
    render(
      <HeroSocialProof data-testid="trust">
        <HeroSocialProofItem>Free shipping</HeroSocialProofItem>
      </HeroSocialProof>,
    )
    const el = screen.getByTestId('trust')
    expect(el.tagName).toBe('UL')
    expect(el.className).toContain('flex')
    expect(el.className).toContain('flex-wrap')
    expect(el.getAttribute('data-slot')).toBe('hero-trust-row')
  })
})

describe('HeroSocialProofItem', () => {
  it('renders as li with flex items-center gap-2', () => {
    render(
      <HeroSocialProofItem data-testid="item">
        Free shipping
      </HeroSocialProofItem>,
    )
    const el = screen.getByTestId('item')
    expect(el.tagName).toBe('LI')
    expect(el.className).toContain('flex')
    expect(el.className).toContain('items-center')
    expect(el.className).toContain('gap-2')
    expect(el.getAttribute('data-slot')).toBe('hero-trust-item')
  })
})

describe('HeroStats', () => {
  it('renders as div with grid grid-cols-2 border-t', () => {
    render(
      <HeroStats data-testid="stats">
        <span>x</span>
      </HeroStats>,
    )
    const el = screen.getByTestId('stats')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('grid')
    expect(el.className).toContain('grid-cols-2')
    expect(el.className).toContain('border-t')
    expect(el.getAttribute('data-slot')).toBe('hero-stats')
  })
})

describe('HeroStat', () => {
  it('renders as div with flex flex-col', () => {
    render(<HeroStat data-testid="stat">x</HeroStat>)
    const el = screen.getByTestId('stat')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('flex')
    expect(el.className).toContain('flex-col')
    expect(el.getAttribute('data-slot')).toBe('hero-stat')
  })
})

describe('HeroStatValue', () => {
  it('renders as div with text-3xl font-bold text-foreground', () => {
    render(<HeroStatValue data-testid="val">120+</HeroStatValue>)
    const el = screen.getByTestId('val')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('text-3xl')
    expect(el.className).toContain('font-bold')
    expect(el.className).toContain('text-foreground')
    expect(el.getAttribute('data-slot')).toBe('hero-stat-value')
  })
})

describe('HeroStatLabel', () => {
  it('renders as div with text-sm text-muted-foreground', () => {
    render(<HeroStatLabel data-testid="label">Projects</HeroStatLabel>)
    const el = screen.getByTestId('label')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('text-sm')
    expect(el.className).toContain('text-muted-foreground')
    expect(el.getAttribute('data-slot')).toBe('hero-stat-label')
  })
})

describe('HeroSection compound composition', () => {
  it('composes full centered-image hero', () => {
    render(
      <HeroSection variant="full-bleed">
        <HeroBackgroundImage alt="Hero bg" />
        <HeroContent className="mx-auto flex max-w-7xl flex-col items-center px-6 pb-28 pt-36 text-center">
          <HeroBadge variant="pill">Eyebrow</HeroBadge>
          <HeroHeading variant="serif">Heading text</HeroHeading>
          <HeroSubheading variant="light">Subheading text</HeroSubheading>
          <HeroActions className="mt-10 flex-col gap-4 sm:flex-row">
            <button>Primary</button>
            <button>Secondary</button>
          </HeroActions>
        </HeroContent>
      </HeroSection>,
    )
    expect(screen.getByText('Eyebrow').tagName).toBe('SPAN')
    expect(screen.getByText('Heading text').tagName).toBe('H1')
    expect(screen.getByText('Subheading text').tagName).toBe('P')
    expect(screen.getByText('Primary').tagName).toBe('BUTTON')
  })

  it('composes split hero with image and trust row', () => {
    render(
      <HeroSection className="bg-background">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div>
            <HeroBadge variant="solid">Sale</HeroBadge>
            <HeroHeading variant="extra-bold">
              Everything you love <HeroHighlight>now for less</HeroHighlight>
            </HeroHeading>
            <HeroSubheading>Supporting copy</HeroSubheading>
            <HeroActions>
              <button>Shop now</button>
              <button>Explore</button>
            </HeroActions>
            <HeroSocialProof>
              <HeroSocialProofItem>Free shipping</HeroSocialProofItem>
              <HeroSocialProofItem>Easy returns</HeroSocialProofItem>
            </HeroSocialProof>
          </div>
          <HeroMediaPanel alt="Product photo" />
        </div>
      </HeroSection>,
    )
    expect(screen.getByText('Sale').tagName).toBe('SPAN')
    expect(screen.getByText('now for less').tagName).toBe('SPAN')
    expect(screen.getByText('Shop now').tagName).toBe('BUTTON')
    expect(screen.getAllByText(/Free shipping|Easy returns/).length).toBe(2)
  })

  it('composes gradient hero with stats', () => {
    render(
      <HeroSection variant="gradient">
        <HeroContent className="mx-auto max-w-6xl px-6 text-center">
          <HeroBadge variant="pulsing-dot">Available</HeroBadge>
          <HeroHeading variant="black">
            We craft{' '}
            <HeroHighlight variant="gradient">experiences</HeroHighlight>
          </HeroHeading>
          <HeroSubheading variant="large">Supporting copy</HeroSubheading>
          <HeroActions className="flex-col items-center gap-4 sm:flex-row">
            <button>View work</button>
            <button>Start project</button>
          </HeroActions>
          <HeroStats>
            <HeroStat>
              <HeroStatValue>120+</HeroStatValue>
              <HeroStatLabel>Projects</HeroStatLabel>
            </HeroStat>
            <HeroStat>
              <HeroStatValue>45</HeroStatValue>
              <HeroStatLabel>Awards</HeroStatLabel>
            </HeroStat>
          </HeroStats>
        </HeroContent>
      </HeroSection>,
    )
    expect(screen.getByText('experiences').className).toContain(
      'text-transparent',
    )
    expect(screen.getByText('120+').tagName).toBe('DIV')
    expect(screen.getByText('Projects').tagName).toBe('DIV')
  })
})
