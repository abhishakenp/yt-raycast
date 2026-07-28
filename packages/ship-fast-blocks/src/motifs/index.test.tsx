// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

afterEach(() => {
  cleanup()
})

import {
  SplitHero,
  CenteredHero,
  PosterHero,
  ComingSoonHero,
  CardGrid,
  BentoGrid,
  ImageGallery,
  LogoStrip,
  TestimonialRow,
  PersonGrid,
  PricingTable,
  StatsStrip,
  FeatureList,
  GroupedList,
  NumberedList,
  SimpleList,
  FaqAccordion,
  Timeline,
  CtaBand,
  NewsletterCta,
  ContactForm,
  BookingForm,
  Navbar,
  Footer,
  MediaSplit,
  MapBlock,
  ArticlePreview,
  CategoryNav,
  ComparisonTable,
  StepProcess,
  ValueProps,
  QuoteBand,
  LogosMarquee,
  ContentTabs,
  SearchBar,
  EventSchedule,
  ProductGrid,
  TeamShowcase,
  ProjectGallery,
  DonationBand,
} from './index.tsx'

// Helper: render a capsule with props
function renderCapsule(
  capsule: { component: React.FC<{ props: Record<string, unknown> }> },
  props: Record<string, unknown> = {},
) {
  return render(<capsule.component props={props} />)
}

describe('SplitHero', () => {
  it('renders heading and CTAs', () => {
    renderCapsule(SplitHero, {
      heading: 'We craft [hl]experiences[/hl]',
      primaryCta: 'Start',
      secondaryCta: 'See',
    })
    // Editorial chrome (default) renders CTAs as spans, not <a> tags
    expect(screen.getByText('Start')).toBeTruthy()
    expect(screen.getByText('See')).toBeTruthy()
  })

  it('renders stats strip', () => {
    renderCapsule(SplitHero, { stats: [{ value: '99%', label: 'Uptime' }] })
    expect(screen.getByText('99%')).toBeTruthy()
  })
})

describe('CenteredHero', () => {
  it('renders centered heading and CTA', () => {
    renderCapsule(CenteredHero, {
      heading: 'Build [hl]faster[/hl]',
      primaryCta: 'Go',
    })
    expect(screen.getByText('Go').tagName).toBe('A')
  })
})

describe('CardGrid', () => {
  it('renders heading and cards', () => {
    renderCapsule(CardGrid, {
      heading: 'Features',
      cards: [{ title: 'Card 1' }, { title: 'Card 2' }],
    })
    expect(screen.getByText('Features')).toBeTruthy()
    expect(screen.getByText('Card 1')).toBeTruthy()
    expect(screen.getByText('Card 2')).toBeTruthy()
  })
})

describe('GroupedList', () => {
  it('renders group headers and items', () => {
    renderCapsule(GroupedList, {
      heading: 'Menu',
      groups: [{ name: 'Starters', items: [{ title: 'Salad', price: '$12' }] }],
    })
    expect(screen.getByText('Menu')).toBeTruthy()
    expect(screen.getByText('Starters')).toBeTruthy()
    expect(screen.getByText('Salad')).toBeTruthy()
    expect(screen.getByText('$12')).toBeTruthy()
  })
})

describe('FaqAccordion', () => {
  it('renders FAQ items as details/summary', () => {
    renderCapsule(FaqAccordion, {
      items: [{ question: 'What?', answer: 'A thing' }],
    })
    expect(screen.getByText('What?').tagName).toBe('SUMMARY')
  })
})

describe('PricingTable', () => {
  it('renders tiers with prices and features', () => {
    renderCapsule(PricingTable, {
      tiers: [
        { name: 'Pro', price: '$29', features: ['Unlimited'], cta: 'Start' },
      ],
    })
    expect(screen.getByText('Pro')).toBeTruthy()
    expect(screen.getByText('$29')).toBeTruthy()
    expect(screen.getByText('Unlimited')).toBeTruthy()
  })
})

describe('Navbar', () => {
  it('renders brand and links', () => {
    renderCapsule(Navbar, {
      brand: 'Acme',
      links: ['Home', 'About'],
      cta: 'Sign up',
    })
    expect(screen.getByText('Acme')).toBeTruthy()
    expect(screen.getByText('Home')).toBeTruthy()
    expect(screen.getByText('Sign up')).toBeTruthy()
  })
})

describe('Footer', () => {
  it('renders brand and columns', () => {
    renderCapsule(Footer, {
      brand: 'Acme',
      columns: [{ title: 'Pages', links: ['Home'] }],
    })
    expect(screen.getByText('Acme')).toBeTruthy()
    expect(screen.getByText('Pages')).toBeTruthy()
  })
})

describe('Timeline', () => {
  it('renders events with dates', () => {
    renderCapsule(Timeline, {
      events: [{ date: 'Q1', title: 'Launch' }],
    })
    expect(screen.getByText('Q1')).toBeTruthy()
    expect(screen.getByText('Launch')).toBeTruthy()
  })
})

describe('CtaBand', () => {
  it('renders heading and CTA', () => {
    renderCapsule(CtaBand, { heading: 'Ready?', cta: 'Start' })
    expect(screen.getByText('Ready?')).toBeTruthy()
    expect(screen.getByText('Start').tagName).toBe('BUTTON')
  })
})

describe('ContactForm', () => {
  it('renders form fields', () => {
    renderCapsule(ContactForm, { heading: 'Contact' })
    expect(screen.getByText('Contact')).toBeTruthy()
    expect(screen.getByText('Name')).toBeTruthy()
    expect(screen.getByText('Email')).toBeTruthy()
  })
})

describe('TestimonialRow', () => {
  it('renders testimonials with quotes', () => {
    renderCapsule(TestimonialRow, {
      testimonials: [{ quote: 'Great!', author: 'Jane' }],
    })
    // Editorial chrome renders quote in a <p> with drop-cap, not <blockquote>
    expect(screen.getByText('Great!')).toBeTruthy()
    expect(screen.getByText('Jane')).toBeTruthy()
  })
})

describe('PersonGrid', () => {
  it('renders people with names and roles', () => {
    renderCapsule(PersonGrid, {
      people: [{ name: 'Jane', role: 'CEO' }],
    })
    expect(screen.getByText('Jane')).toBeTruthy()
    expect(screen.getByText('CEO')).toBeTruthy()
  })
})

describe('StatsStrip', () => {
  it('renders stats with values and labels', () => {
    renderCapsule(StatsStrip, {
      stats: [{ value: '99%', label: 'Uptime' }],
    })
    expect(screen.getByText('99%')).toBeTruthy()
    expect(screen.getByText('Uptime')).toBeTruthy()
  })
})

describe('NumberedList', () => {
  it('renders numbered steps', () => {
    renderCapsule(NumberedList, {
      steps: [{ title: 'Step One', description: 'Do it' }],
    })
    expect(screen.getByText('Step One')).toBeTruthy()
    expect(screen.getByText('Do it')).toBeTruthy()
  })
})

describe('SimpleList', () => {
  it('renders list items', () => {
    renderCapsule(SimpleList, {
      items: [{ title: 'Item A', price: '$10' }],
    })
    expect(screen.getByText('Item A')).toBeTruthy()
    expect(screen.getByText('$10')).toBeTruthy()
  })
})

describe('ProductGrid', () => {
  it('renders products with prices', () => {
    renderCapsule(ProductGrid, {
      products: [{ name: 'Widget', price: '$29' }],
    })
    expect(screen.getByText('Widget')).toBeTruthy()
    expect(screen.getByText('$29')).toBeTruthy()
  })
})

describe('ComparisonTable', () => {
  it('renders table with columns and rows', () => {
    const { container } = renderCapsule(ComparisonTable, {
      columns: ['Feature', 'Basic', 'Pro'],
      rows: [{ feature: 'Users', values: ['1', '10'] }],
    })
    expect(container.querySelector('table')).toBeTruthy()
    expect(screen.getByText('Users')).toBeTruthy()
  })
})

describe('DonationBand', () => {
  it('renders donation amounts', () => {
    renderCapsule(DonationBand, { amounts: ['$10', '$50'] })
    expect(screen.getByText('$10').tagName).toBe('BUTTON')
    expect(screen.getByText('$50').tagName).toBe('BUTTON')
  })
})

describe('EventSchedule', () => {
  it('renders events with times', () => {
    renderCapsule(EventSchedule, {
      events: [{ time: '09:00', title: 'Opening' }],
    })
    expect(screen.getByText('09:00')).toBeTruthy()
    expect(screen.getByText('Opening')).toBeTruthy()
  })
})

describe('QuoteBand', () => {
  it('renders quote and author', () => {
    renderCapsule(QuoteBand, { quote: 'Hello world', author: 'Me' })
    expect(screen.getByText('Hello world')).toBeTruthy()
    expect(screen.getByText('Me')).toBeTruthy()
  })
})

describe('StepProcess', () => {
  it('renders steps with numbers', () => {
    renderCapsule(StepProcess, {
      steps: [{ title: 'Discover' }, { title: 'Design' }],
    })
    expect(screen.getByText('Discover')).toBeTruthy()
    expect(screen.getByText('Design')).toBeTruthy()
  })
})

describe('ContentTabs', () => {
  it('renders tab labels', () => {
    renderCapsule(ContentTabs, {
      tabs: [{ label: 'Overview', content: 'Content' }],
    })
    expect(screen.getByText('Overview')).toBeTruthy()
  })
})

describe('SearchBar', () => {
  it('renders search input and filters', () => {
    renderCapsule(SearchBar, { filters: ['All', 'Recent'] })
    expect(screen.getByText('All').tagName).toBe('BUTTON')
    expect(screen.getByText('Recent').tagName).toBe('BUTTON')
  })
})

describe('LogosMarquee', () => {
  it('renders marquee with logos', () => {
    renderCapsule(LogosMarquee, { logos: ['Brand1', 'Brand2'] })
    const texts = screen.getAllByText(/Brand1 ✦ Brand2/)
    expect(texts.length).toBeGreaterThan(0)
  })
})

describe('LogoStrip', () => {
  it('renders logos', () => {
    renderCapsule(LogoStrip, { logos: ['Acme', 'Beta'] })
    expect(screen.getByText('Acme')).toBeTruthy()
    expect(screen.getByText('Beta')).toBeTruthy()
  })
})

describe('ValueProps', () => {
  it('renders value propositions', () => {
    renderCapsule(ValueProps, {
      values: [{ title: 'Fast', description: 'Quick' }],
    })
    expect(screen.getByText('Fast')).toBeTruthy()
    expect(screen.getByText('Quick')).toBeTruthy()
  })
})

describe('ArticlePreview', () => {
  it('renders featured and articles', () => {
    renderCapsule(ArticlePreview, {
      featured: { title: 'Featured' },
      articles: [{ title: 'Article 1' }],
    })
    expect(screen.getAllByText('Featured').length).toBeGreaterThan(0)
    expect(screen.getByText('Article 1')).toBeTruthy()
  })
})

describe('CategoryNav', () => {
  it('renders categories', () => {
    renderCapsule(CategoryNav, {
      categories: [{ name: 'Cat 1' }, { name: 'Cat 2' }],
    })
    expect(screen.getByText('Cat 1')).toBeTruthy()
    expect(screen.getByText('Cat 2')).toBeTruthy()
  })
})

describe('ComingSoonHero', () => {
  it('renders heading and email form', () => {
    renderCapsule(ComingSoonHero, {
      heading: 'Coming [hl]soon[/hl]',
      cta: 'Notify',
    })
    expect(screen.getByText('Notify').tagName).toBe('BUTTON')
    expect(screen.getByPlaceholderText('you@example.com')).toBeTruthy()
  })
})

describe('NewsletterCta', () => {
  it('renders email form', () => {
    renderCapsule(NewsletterCta, { cta: 'Subscribe' })
    const subs = screen.getAllByText('Subscribe')
    expect(subs.some((el) => el.tagName === 'BUTTON')).toBe(true)
    // Editorial chrome uses InlineEmailCapture with placeholder, not 'Email' label
    expect(screen.getByPlaceholderText('you@example.com')).toBeTruthy()
  })
})

describe('BookingForm', () => {
  it('renders booking fields', () => {
    renderCapsule(BookingForm, { heading: 'Book' })
    const books = screen.getAllByText('Book')
    expect(books.length).toBeGreaterThan(0)
    expect(screen.getByText('Date')).toBeTruthy()
    expect(screen.getByText('Time')).toBeTruthy()
  })
})

describe('MapBlock', () => {
  it('renders heading and address', () => {
    renderCapsule(MapBlock, { heading: 'Find us', address: '123 Main St' })
    expect(screen.getByText('Find us')).toBeTruthy()
    expect(screen.getByText('123 Main St')).toBeTruthy()
  })
})

describe('MediaSplit', () => {
  it('renders heading and text', () => {
    renderCapsule(MediaSplit, { heading: 'About', text: 'Our story' })
    expect(screen.getByText('About')).toBeTruthy()
    expect(screen.getByText('Our story')).toBeTruthy()
  })
})

describe('BentoGrid', () => {
  it('renders bento cells', () => {
    renderCapsule(BentoGrid, {
      cells: [{ title: 'Cell 1', span: 'wide' }, { title: 'Cell 2' }],
    })
    expect(screen.getByText('Cell 1')).toBeTruthy()
    expect(screen.getByText('Cell 2')).toBeTruthy()
  })
})

describe('ImageGallery', () => {
  it('renders gallery heading', () => {
    renderCapsule(ImageGallery, { heading: 'Gallery' })
    expect(screen.getByText('Gallery')).toBeTruthy()
  })
})

describe('FeatureList', () => {
  it('renders feature rows', () => {
    renderCapsule(FeatureList, {
      features: [{ heading: 'Feature 1', description: 'Desc 1' }],
    })
    // Editorial chrome renders heading in both card and caption bar
    const features = screen.getAllByText('Feature 1')
    expect(features.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Desc 1')).toBeTruthy()
  })
})

describe('TeamShowcase', () => {
  it('renders team members with bios', () => {
    renderCapsule(TeamShowcase, {
      people: [{ name: 'Jane', role: 'CEO', bio: '10 years' }],
    })
    expect(screen.getByText('Jane')).toBeTruthy()
    expect(screen.getByText('10 years')).toBeTruthy()
  })
})

describe('ProjectGallery', () => {
  it('renders projects with categories', () => {
    renderCapsule(ProjectGallery, {
      projects: [{ title: 'Project 1', category: 'Web' }],
    })
    // Editorial chrome renders title in h3 below the plate
    expect(screen.getByText('Project 1')).toBeTruthy()
    // Category appears in both the Proj index row and the caption metadata
    expect(screen.getAllByText('Web').length).toBeGreaterThanOrEqual(1)
  })
})

describe('PosterHero', () => {
  it('renders heading and CTA', () => {
    renderCapsule(PosterHero, {
      heading: 'Visual [hl]stories[/hl]',
      cta: 'Explore',
    })
    expect(screen.getByText('Explore').tagName).toBe('A')
  })
})
