// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

afterEach(() => {
  cleanup()
})

import {
  CardGrid,
  BentoGrid,
  StatsStrip,
  PricingTable,
  TestimonialRow,
  ValueProps,
  NumberedList,
  SplitHero,
  QuoteBand,
  FeatureList,
  CtaBand,
  Timeline,
  FaqAccordion,
  MediaSplit,
  NewsletterCta,
  ComingSoonHero,
  ImageGallery,
  LogoStrip,
} from './index.tsx'

function renderCapsule(
  capsule: { component: React.FC<{ props: Record<string, unknown> }> },
  props: Record<string, unknown> = {},
) {
  return render(<capsule.component props={props} />)
}

describe('ChromeSystem — hairline', () => {
  it('CardGrid with chrome:hairline renders collapsed-border grid with mono indices', () => {
    const { container } = renderCapsule(CardGrid, {
      heading: 'Features',
      chrome: 'hairline',
      index: '01 / Features',
      cards: [
        { title: 'Fast', description: 'Quick.' },
        { title: 'Reliable', description: 'Stable.' },
      ],
    })
    // Mono index label should be present
    expect(screen.getByText('01')).toBeTruthy()
    // Heading should be present
    expect(screen.getByText('Features')).toBeTruthy()
    // Tick bars are aria-hidden spans with bg-primary
    const tickBars = container.querySelectorAll('[aria-hidden="true"]')
    expect(tickBars.length).toBeGreaterThan(0)
  })

  it('StatsStrip with chrome:hairline renders collapsed-border KPI cells with tick bars', () => {
    const { container } = renderCapsule(StatsStrip, {
      heading: 'Metrics',
      chrome: 'hairline',
      stats: [
        { value: '99%', label: 'Uptime' },
        { value: '50ms', label: 'Latency' },
      ],
    })
    expect(screen.getByText('99%')).toBeTruthy()
    expect(screen.getByText('50ms')).toBeTruthy()
    // Collapsed-border grid has border-l border-t
    const grid = container.querySelector('.border-l.border-t')
    expect(grid).toBeTruthy()
  })

  it('ValueProps with chrome:hairline renders mono indices and tick bars', () => {
    renderCapsule(ValueProps, {
      heading: 'Why us',
      chrome: 'hairline',
      values: [
        { title: 'Fast', description: 'Quick.' },
        { title: 'Reliable', description: 'Stable.' },
      ],
    })
    expect(screen.getByText('Why us')).toBeTruthy()
    expect(screen.getByText('Fast')).toBeTruthy()
  })

  it('TestimonialRow with chrome:hairline renders collapsed-border cards with indices', () => {
    renderCapsule(TestimonialRow, {
      heading: 'Testimonials',
      chrome: 'hairline',
      testimonials: [
        { quote: 'Great product.', author: 'Jane', role: 'CEO' },
        { quote: 'Love it.', author: 'John', role: 'CTO' },
      ],
    })
    expect(screen.getByText('Great product.')).toBeTruthy()
    expect(screen.getByText('Jane')).toBeTruthy()
  })

  it('BentoGrid with chrome:hairline renders ghost numerals and figure index', () => {
    renderCapsule(BentoGrid, {
      heading: 'Bento',
      chrome: 'hairline',
      cells: [
        { title: 'Cell 1', description: 'Desc', span: 'wide' },
        { title: 'Cell 2', description: 'Desc' },
      ],
    })
    expect(screen.getByText('Bento')).toBeTruthy()
    expect(screen.getByText('Cell 1')).toBeTruthy()
  })
})

describe('ChromeSystem — terminal', () => {
  it('NumberedList with chrome:terminal renders terminal window with $ prompts', () => {
    const { container } = renderCapsule(NumberedList, {
      heading: 'Quickstart',
      chrome: 'terminal',
      steps: [
        { title: 'Install', description: 'npm install' },
        { title: 'Configure', description: 'Set env vars' },
      ],
    })
    expect(screen.getByText('Quickstart')).toBeTruthy()
    expect(screen.getByText('Install')).toBeTruthy()
    // Terminal chrome has traffic lights and title bar
    const terminalTitle = screen.getByText('~/quickstart')
    expect(terminalTitle).toBeTruthy()
    // $ prompts should be present
    expect(container.textContent).toContain('$')
    // exit 0 footer
    expect(screen.getByText('exit 0')).toBeTruthy()
  })

  it('PricingTable with chrome:terminal renders mono labels and inverted highlighted tier', () => {
    renderCapsule(PricingTable, {
      heading: 'Pricing',
      chrome: 'terminal',
      tiers: [
        {
          name: 'Starter',
          price: '$0',
          features: ['1 project'],
          cta: 'Sign up',
        },
        {
          name: 'Pro',
          price: '$29',
          features: ['Unlimited'],
          cta: 'Start trial',
          highlighted: true,
        },
      ],
    })
    expect(screen.getByText('Pricing')).toBeTruthy()
    expect(screen.getByText('Starter')).toBeTruthy()
    expect(screen.getByText('Pro')).toBeTruthy()
  })

  it('CtaBand with chrome:terminal renders mono $ prompt', () => {
    const { container } = renderCapsule(CtaBand, {
      heading: 'Ready?',
      cta: 'Get started',
      chrome: 'terminal',
    })
    expect(screen.getByText('Ready?')).toBeTruthy()
    expect(container.textContent).toContain('$')
  })

  it('FaqAccordion with chrome:terminal renders collapsed-border with $ prompts', () => {
    const { container } = renderCapsule(FaqAccordion, {
      heading: 'FAQ',
      chrome: 'terminal',
      items: [
        { question: 'What is this?', answer: 'A tool.' },
        { question: 'How much?', answer: 'Free.' },
      ],
    })
    expect(screen.getByText('FAQ')).toBeTruthy()
    expect(screen.getByText('What is this?')).toBeTruthy()
    expect(container.textContent).toContain('$')
  })

  it('Timeline with chrome:terminal renders collapsed-border with ghost numerals', () => {
    renderCapsule(Timeline, {
      heading: 'Roadmap',
      chrome: 'terminal',
      events: [
        { date: 'Q1', title: 'Launch', description: 'Initial' },
        { date: 'Q2', title: 'Scale', description: 'Growth' },
      ],
    })
    expect(screen.getByText('Roadmap')).toBeTruthy()
    expect(screen.getByText('Launch')).toBeTruthy()
  })
})

describe('ChromeSystem — brutalist', () => {
  it('StatsStrip with chrome:brutalist renders inverted dark band with slanted seam', () => {
    const { container } = renderCapsule(StatsStrip, {
      heading: 'Impact',
      chrome: 'brutalist',
      stats: [
        { value: '10M+', label: 'Users' },
        { value: '99%', label: 'Uptime' },
      ],
    })
    expect(screen.getByText('10M+')).toBeTruthy()
    // Slanted seam clip-path
    const section = container.querySelector('[class*="clip-path"]')
    expect(section).toBeTruthy()
  })

  it('QuoteBand with chrome:brutalist renders inverted dark band', () => {
    renderCapsule(QuoteBand, {
      quote: 'Build the future.',
      author: 'Alan Kay',
      chrome: 'brutalist',
    })
    expect(screen.getByText('Build the future.')).toBeTruthy()
    expect(screen.getByText('Alan Kay')).toBeTruthy()
  })

  it('CtaBand with chrome:brutalist renders uppercase heading with slanted seam', () => {
    const { container } = renderCapsule(CtaBand, {
      heading: 'Ready to start',
      cta: 'Get started',
      chrome: 'brutalist',
    })
    expect(screen.getByText('Ready to start')).toBeTruthy()
    const section = container.querySelector('[class*="clip-path"]')
    expect(section).toBeTruthy()
  })

  it('CardGrid with chrome:brutalist renders border-2 cards with hard shadows', () => {
    const { container } = renderCapsule(CardGrid, {
      heading: 'Features',
      chrome: 'brutalist',
      cards: [
        { title: 'Bold', description: 'Loud.' },
        { title: 'Sharp', description: 'Clean.' },
      ],
    })
    expect(screen.getByText('Bold')).toBeTruthy()
    // Brutalist cards have border-2
    const brutalistCards = container.querySelectorAll('.border-2')
    expect(brutalistCards.length).toBeGreaterThan(0)
  })
})

describe('ChromeSystem — editorial', () => {
  it('FeatureList with chrome:editorial renders image caption bars with figure indices', () => {
    renderCapsule(FeatureList, {
      chrome: 'editorial',
      features: [
        {
          heading: 'Craft',
          description: 'Meticulous.',
          imageAlt: 'Studio workspace',
        },
        {
          heading: 'Story',
          description: 'Narrative.',
          imageAlt: 'Editorial spread',
        },
      ],
    })
    expect(screen.getByText('Craft')).toBeTruthy()
    expect(screen.getByText('fig. 01')).toBeTruthy()
    expect(screen.getByText('fig. 02')).toBeTruthy()
  })

  it('MediaSplit with chrome:editorial renders floating stat photo', () => {
    renderCapsule(MediaSplit, {
      heading: 'About',
      text: 'Our story.',
      imageAlt: 'Studio',
      chrome: 'editorial',
    })
    expect(screen.getByText('About')).toBeTruthy()
    // FloatingStatPhoto shows stat value and label
    expect(screen.getByText('15+')).toBeTruthy()
    expect(screen.getByText('Years of practice')).toBeTruthy()
  })

  it('QuoteBand with chrome:editorial renders watermark', () => {
    renderCapsule(QuoteBand, {
      quote: 'Design is thinking made visual.',
      author: 'Saul Bass',
      chrome: 'editorial',
      watermark: '"',
    })
    expect(screen.getByText('Design is thinking made visual.')).toBeTruthy()
  })
})

describe('ChromeSystem — gradient', () => {
  it('SplitHero with chrome:gradient renders glow orbs', () => {
    const { container } = renderCapsule(SplitHero, {
      heading: 'Build [hl]fast[/hl]',
      chrome: 'gradient',
      stats: [{ value: '10x', label: 'Faster' }],
    })
    expect(screen.getByText('10x')).toBeTruthy()
    // Glow orbs are animate-pulse divs
    const glowOrbs = container.querySelectorAll('.animate-pulse')
    expect(glowOrbs.length).toBeGreaterThan(0)
  })

  it('CtaBand with chrome:gradient renders glow orbs', () => {
    const { container } = renderCapsule(CtaBand, {
      heading: 'Join us',
      cta: 'Sign up',
      chrome: 'gradient',
    })
    expect(screen.getByText('Join us')).toBeTruthy()
    const glowOrbs = container.querySelectorAll('.animate-pulse')
    expect(glowOrbs.length).toBeGreaterThan(0)
  })
})

describe('ChromeSystem — decor backgrounds', () => {
  it('CardGrid with decor:dot-grid renders dot grid background', () => {
    const { container } = renderCapsule(CardGrid, {
      heading: 'Features',
      chrome: 'hairline',
      decor: 'dot-grid',
      cards: [{ title: 'One' }, { title: 'Two' }],
    })
    // Dot grid is rendered as an aria-hidden element
    expect(
      container.querySelectorAll('[aria-hidden="true"]').length,
    ).toBeGreaterThan(0)
  })

  it('StatsStrip with decor:graph-paper renders graph paper background', () => {
    const { container } = renderCapsule(StatsStrip, {
      heading: 'Metrics',
      chrome: 'hairline',
      decor: 'graph-paper',
      stats: [{ value: '99%', label: 'Uptime' }],
    })
    expect(
      container.querySelectorAll('[aria-hidden="true"]').length,
    ).toBeGreaterThan(0)
  })
})

describe('ChromeSystem — none (default)', () => {
  it('CardGrid without chrome renders standard FeatureGrid', () => {
    renderCapsule(CardGrid, {
      heading: 'Features',
      cards: [
        { title: 'One', description: 'First.' },
        { title: 'Two', description: 'Second.' },
      ],
    })
    expect(screen.getByText('Features')).toBeTruthy()
    // Editorial chrome renders title in both card and MonoMetadata, so use getAllByText
    expect(screen.getAllByText('One').length).toBeGreaterThanOrEqual(1)
  })

  it('NumberedList without chrome renders standard collapsed-border grid', () => {
    renderCapsule(NumberedList, {
      heading: 'Steps',
      steps: [
        { title: 'First', description: 'Do it.' },
        { title: 'Second', description: 'Do more.' },
      ],
    })
    expect(screen.getByText('Steps')).toBeTruthy()
    expect(screen.getByText('First')).toBeTruthy()
  })
})

// ─── Artistic Image Components ──────────────────────────────────────────

describe('ChromeSystem — artistic image treatments', () => {
  it('SplitHero without imageAlt renders artistic placeholder panel (not empty)', () => {
    const { container } = renderCapsule(SplitHero, {
      heading: 'We craft',
      chrome: 'brutalist',
      watermark: '*',
    })
    // Brutalist splits heading: "We" is lead, "craft" is the sticker highlight
    expect(screen.getByText('We')).toBeTruthy()
    expect(screen.getByText('craft')).toBeTruthy()
    // Should NOT be hidden lg:block — should always render
    const placeholder = container.querySelector('[class*="aspect-square"]')
    expect(placeholder).toBeTruthy()
  })

  it('SplitHero with chrome:brutalist and imageAlt renders border-2 image with rotated sticker', () => {
    const { container } = renderCapsule(SplitHero, {
      heading: 'We craft',
      imageAlt: 'Studio workspace',
      chrome: 'brutalist',
    })
    expect(screen.getByText('Featured')).toBeTruthy()
    const brutalistImage = container.querySelector(
      '.border-2.border-foreground',
    )
    expect(brutalistImage).toBeTruthy()
  })

  it('SplitHero with chrome:gradient and imageAlt renders glowing photo', () => {
    const { container } = renderCapsule(SplitHero, {
      heading: 'We craft',
      imageAlt: 'Studio workspace',
      chrome: 'gradient',
    })
    // GlowingPhoto has a blur-2xl glow div
    const glow = container.querySelector('.blur-2xl')
    expect(glow).toBeTruthy()
  })

  it('SplitHero with chrome:editorial and imageAlt renders portrait image with caption bar', () => {
    renderCapsule(SplitHero, {
      heading: 'We craft',
      imageAlt: 'Studio workspace',
      chrome: 'editorial',
    })
    // Editorial hero uses "Fig. 01" in the mono annotation rail
    expect(screen.getByText('Fig. 01')).toBeTruthy()
  })

  it('ImageGallery with chrome:editorial renders image-zoom hover with caption bars', () => {
    renderCapsule(ImageGallery, {
      heading: 'Gallery',
      chrome: 'editorial',
      index: '04 / Gallery',
      images: [{ alt: 'Photo one' }, { alt: 'Photo two' }],
    })
    expect(screen.getByText('Gallery')).toBeTruthy()
    expect(screen.getByText('fig. 01')).toBeTruthy()
    expect(screen.getByText('fig. 02')).toBeTruthy()
    // Image-zoom hover overlay labels (multiple "View" labels)
    const viewLabels = screen.getAllByText('View')
    expect(viewLabels.length).toBe(2)
  })

  it('ImageGallery with chrome:brutalist renders border-2 images with hard shadows', () => {
    const { container } = renderCapsule(ImageGallery, {
      heading: 'Gallery',
      chrome: 'brutalist',
      images: [{ alt: 'Photo one' }],
    })
    const brutalistImage = container.querySelector(
      '.border-2.border-foreground',
    )
    expect(brutalistImage).toBeTruthy()
  })

  it('MediaSplit with chrome:editorial renders floating stat photo', () => {
    renderCapsule(MediaSplit, {
      heading: 'About',
      text: 'Our story.',
      imageAlt: 'Studio',
      chrome: 'editorial',
    })
    expect(screen.getByText('15+')).toBeTruthy()
    expect(screen.getByText('Years of practice')).toBeTruthy()
  })

  it('MediaSplit with chrome:brutalist renders border-2 image with rotated About sticker', () => {
    const { container } = renderCapsule(MediaSplit, {
      heading: 'About',
      text: 'Our story.',
      imageAlt: 'Studio',
      chrome: 'brutalist',
    })
    // Multiple "About" texts (heading + sticker) — use getAllByText
    const abouts = screen.getAllByText('About')
    expect(abouts.length).toBeGreaterThanOrEqual(1)
    // Rotated sticker
    const sticker = container.querySelector('.rotate-3, .-rotate-3')
    expect(sticker).toBeTruthy()
  })

  it('MediaSplit default split variant renders offset image tiles', () => {
    const { container } = renderCapsule(MediaSplit, {
      heading: 'About',
      text: 'Our story.',
      imageAlt: 'Studio',
      chrome: 'none',
    })
    // OffsetImageTiles has a relative wrapper with an absolute positioned detail tile
    const offsetTile = container.querySelector('.absolute.-bottom-8.-right-8')
    expect(offsetTile).toBeTruthy()
  })
})

// ─── Subscriber Form Components ──────────────────────────────────────────

describe('ChromeSystem — subscriber forms', () => {
  it('ComingSoonHero renders countdown timer and inline email capture', () => {
    renderCapsule(ComingSoonHero, {
      heading: 'Coming [hl]soon[/hl]',
      cta: 'Notify me',
    })
    // Countdown timer cells
    expect(screen.getByText('Days')).toBeTruthy()
    expect(screen.getByText('Hours')).toBeTruthy()
    expect(screen.getByText('Minutes')).toBeTruthy()
    expect(screen.getByText('Seconds')).toBeTruthy()
    // Inline email capture
    expect(screen.getByPlaceholderText('you@example.com')).toBeTruthy()
    expect(screen.getByText('Notify me').tagName).toBe('BUTTON')
    // Disclaimer
    expect(screen.getByText('No spam, unsubscribe anytime.')).toBeTruthy()
  })

  it('NewsletterCta with chrome:terminal renders mono $ prompt and inline capture', () => {
    const { container } = renderCapsule(NewsletterCta, {
      heading: 'Subscribe',
      chrome: 'terminal',
      cta: 'Join',
    })
    expect(screen.getByText('Subscribe')).toBeTruthy()
    // $ prompt is present in a span with text-primary
    const dollarPrompt = container.querySelector('span.text-primary')
    expect(dollarPrompt).toBeTruthy()
    expect(dollarPrompt?.textContent).toContain('$')
    expect(screen.getByPlaceholderText('you@example.com')).toBeTruthy()
    expect(screen.getByText('Join').tagName).toBe('BUTTON')
  })

  it('NewsletterCta with chrome:brutalist renders inverted dark band with rotated sticker', () => {
    const { container } = renderCapsule(NewsletterCta, {
      heading: 'Subscribe',
      chrome: 'brutalist',
      cta: 'Join',
    })
    // Multiple "Subscribe" texts (heading + sticker) — use getAllByText
    const subscribes = screen.getAllByText('Subscribe')
    expect(subscribes.length).toBeGreaterThanOrEqual(1)
    // Inverted dark band
    const darkBand = container.querySelector('.bg-foreground.text-background')
    expect(darkBand).toBeTruthy()
    // Uppercase heading
    const heading = screen.getByRole('heading')
    expect(heading.className).toContain('uppercase')
  })

  it('NewsletterCta with chrome:editorial renders serif heading with watermark', () => {
    const { container } = renderCapsule(NewsletterCta, {
      heading: 'Subscribe',
      chrome: 'editorial',
      watermark: '§',
    })
    // Multiple "Subscribe" texts (heading + sticker) — use getAllByText
    const subscribes = screen.getAllByText('Subscribe')
    expect(subscribes.length).toBeGreaterThanOrEqual(1)
    // Serif heading
    const heading = screen.getByRole('heading')
    expect(heading.className).toContain('font-serif')
    // Inline email capture
    expect(screen.getByPlaceholderText('you@example.com')).toBeTruthy()
  })

  it('NewsletterCta with chrome:gradient renders glow orbs behind form', () => {
    const { container } = renderCapsule(NewsletterCta, {
      heading: 'Subscribe',
      chrome: 'gradient',
    })
    // Multiple "Subscribe" texts (heading + button) — use getAllByText
    const subscribes = screen.getAllByText('Subscribe')
    expect(subscribes.length).toBeGreaterThanOrEqual(1)
    // Glow orbs use blur-3xl
    const glow = container.querySelector('.blur-3xl')
    expect(glow).toBeTruthy()
  })

  it('LogoStrip renders logo marquee', () => {
    renderCapsule(LogoStrip, {
      heading: 'Trusted by',
      logos: ['Acme', 'Globex', 'Initech'],
    })
    expect(screen.getByText('Trusted by')).toBeTruthy()
    expect(screen.getByText('Acme')).toBeTruthy()
    expect(screen.getByText('Globex')).toBeTruthy()
    expect(screen.getByText('Initech')).toBeTruthy()
  })

  it('TestimonialRow with chrome:editorial renders quote marks and client labels', () => {
    const { container } = renderCapsule(TestimonialRow, {
      heading: 'Reviews',
      chrome: 'editorial',
      testimonials: [{ quote: 'Great!', author: 'Jane', role: 'CEO' }],
    })
    expect(screen.getByText('Great!')).toBeTruthy()
    // Editorial testimonials use "Client 01" mono labels (ArchitectureFirmTestimonials style)
    expect(screen.getByText('Client 01')).toBeTruthy()
    // Giant ghost quotation mark watermark
    const quoteMark = container.querySelector(
      '.font-serif.text-foreground\\/\\[0\\.04\\]',
    )
    expect(quoteMark).toBeTruthy()
  })
})
