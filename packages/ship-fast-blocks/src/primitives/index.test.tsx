// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

afterEach(() => {
  cleanup()
})

import {
  Container,
  Section,
  Heading,
  Button,
  Card,
  Grid,
  Stat,
  List,
  CtaBand,
  Divider,
  Accordion,
  Navbar,
  Footer,
  Form,
} from './index.tsx'
import { DesignSystemProvider } from './design-context.tsx'
import { DEFAULT_DESIGN, type DesignIntent } from './design-system.ts'

// Helper: render with a design intent
function renderWithDesign(intent: DesignIntent, ui: React.ReactElement) {
  return render(
    <DesignSystemProvider intent={intent}>{ui}</DesignSystemProvider>,
  )
}

const ROUNDED: DesignIntent = {
  ...DEFAULT_DESIGN,
  radius: 'rounded-xl',
  gradient: 'vibrant',
  shadow: 'shadow-lg',
  density: 'airy',
}

describe('Container', () => {
  it('renders contained layout with max-width', () => {
    const { container } = render(<Container size="md">content</Container>)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('max-w-5xl')
    expect(el.className).toContain('mx-auto')
  })

  it('renders full-bleed without max-width', () => {
    const { container } = render(
      <Container layout="full-bleed">content</Container>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.className).not.toContain('max-w-')
  })
})

describe('Heading', () => {
  it('renders display level as h1', () => {
    const { container } = render(<Heading level="display" text="Hello World" />)
    const el = container.querySelector('h1')
    expect(el).toBeTruthy()
    expect(el?.textContent).toBe('Hello World')
  })

  it('renders h2 level', () => {
    const { container } = render(<Heading level="h2" text="Section Title" />)
    expect(container.querySelector('h2')).toBeTruthy()
  })

  it('parses [hl]...[/hl] highlight syntax', () => {
    const { container } = render(
      <Heading
        level="display"
        text="We craft [hl]experiences[/hl] that define"
      />,
    )
    const hl = container.querySelector('.relative')
    expect(hl).toBeTruthy()
    expect(hl?.textContent).toBe('experiences')
  })

  it('renders gradient highlight span when @design gradient:vibrant', () => {
    const { container } = renderWithDesign(
      ROUNDED,
      <Heading level="display" text="We craft [hl]experiences[/hl]" />,
    )
    // CSS handles gradient via data-gradient attr; highlight span renders
    const hlSpan = container.querySelector('[data-d-role="highlight"]')
    expect(hlSpan).toBeTruthy()
    // The visible text is in the sibling span
    const visibleText = container.querySelector('.text-primary-foreground')
    expect(visibleText?.textContent).toBe('experiences')
  })

  it('sets data-typography attribute from @design', () => {
    const { container } = renderWithDesign(
      { ...DEFAULT_DESIGN, typography: 'display' },
      <Heading level="display" text="Bold" />,
    )
    // Provider sets data-typography on wrapper; CSS applies font-black
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.getAttribute('data-typography')).toBe('display')
  })
})

describe('Button', () => {
  it('renders primary variant with bg-primary', () => {
    const { container } = render(<Button label="Click me" />)
    const el = container.querySelector('button')
    expect(el).toBeTruthy()
    expect(el?.textContent).toBe('Click me')
    expect(el?.className).toContain('bg-primary')
  })

  it('renders as link when href provided', () => {
    const { container } = render(<Button label="Go" href="/about" />)
    expect(container.querySelector('a')).toBeTruthy()
  })

  it('sets --d-radius CSS var from @design', () => {
    const { container } = renderWithDesign(ROUNDED, <Button label="Rounded" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--d-radius')).toBe('0.75rem')
  })

  it('sets --d-radius=0px by default (rounded-none)', () => {
    const { container } = renderWithDesign(
      DEFAULT_DESIGN,
      <Button label="Sharp" />,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--d-radius')).toBe('0px')
  })

  it('sets --d-shadow CSS var from @design', () => {
    const { container } = renderWithDesign(ROUNDED, <Button label="Soft" />)
    container.firstChild as HTMLElement
    // shadow-lg is not in TAILWIND_CSS map, so it returns null → no CSS var
    // Use a known shadow class instead
    const { container: c2 } = renderWithDesign(
      { ...DEFAULT_DESIGN, shadow: 'shadow-[8px_8px_0_0]' },
      <Button label="Brutal" />,
    )
    const w2 = c2.firstChild as HTMLElement
    expect(w2.style.getPropertyValue('--d-shadow')).toBe('8px 8px 0 0')
  })

  it('sets --d-shadow from arbitrary bracket value', () => {
    const { container } = renderWithDesign(
      { ...DEFAULT_DESIGN, shadow: 'shadow-[8px_8px_0_0]' },
      <Button label="Brutal" />,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--d-shadow')).toBe('8px 8px 0 0')
  })
})

describe('Card', () => {
  it('renders title and description', () => {
    const { container } = render(
      <Card title="Feature One" description="Does the thing" />,
    )
    expect(container.querySelector('h3')?.textContent).toBe('Feature One')
    expect(screen.getByText('Does the thing')).toBeTruthy()
  })

  it('renders index with mono label', () => {
    render(<Card index="01" title="Feature" />)
    expect(screen.getByText('01')).toBeTruthy()
  })

  it('sets --d-radius CSS var from @design', () => {
    const { container } = renderWithDesign(ROUNDED, <Card title="X" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--d-radius')).toBe('0.75rem')
  })

  it('sets data-density attribute from @design', () => {
    const { container } = renderWithDesign(ROUNDED, <Card title="X" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.getAttribute('data-density')).toBe('airy')
  })
})

describe('Grid', () => {
  it('renders standard grid with cols', () => {
    const { container } = render(
      <Grid cols={4}>
        <span>1</span>
      </Grid>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.style.gridTemplateColumns).toContain('repeat(4')
  })

  it('renders collapsed-border variant with border-l border-t', () => {
    const { container } = render(
      <Grid variant="collapsed-border" cols={3}>
        <span>1</span>
      </Grid>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('border-l')
    expect(el.className).toContain('border-t')
  })
})

describe('Stat', () => {
  it('renders value and label', () => {
    render(<Stat value="15,000+" label="Active teams" />)
    expect(screen.getByText('15,000+')).toBeTruthy()
    expect(screen.getByText('Active teams')).toBeTruthy()
  })

  it('inverted mode adds bg-primary', () => {
    const { container } = render(<Stat value="99%" label="Uptime" inverted />)
    expect((container.firstChild as HTMLElement).className).toContain(
      'bg-primary',
    )
  })

  it('renders spark bars when provided', () => {
    const { container } = render(
      <Stat value="50k" label="Users" sparkBars={[30, 50, 90]} />,
    )
    const bars = container.querySelectorAll('[style*="height"]')
    expect(bars.length).toBe(3)
  })
})

describe('List', () => {
  it('renders flat list with items', () => {
    render(
      <List
        items={[
          { title: 'Espresso', description: 'Double shot', price: '$4' },
          { title: 'Latte', price: '$5' },
        ]}
      />,
    )
    expect(screen.getByText('Espresso')).toBeTruthy()
    expect(screen.getByText('$4')).toBeTruthy()
  })

  it('renders grouped list with group headers', () => {
    render(
      <List
        variant="grouped"
        groups={[
          {
            name: 'Starters',
            items: [{ title: 'Salad', price: '$12' }],
          },
          {
            name: 'Mains',
            items: [{ title: 'Steak', price: '$35' }],
          },
        ]}
      />,
    )
    expect(screen.getByText('Starters')).toBeTruthy()
    expect(screen.getByText('Mains')).toBeTruthy()
    expect(screen.getByText('Salad')).toBeTruthy()
  })
})

describe('CtaBand', () => {
  it('renders heading and CTA button', () => {
    render(<CtaBand heading="Ready to start?" ctaLabel="Get started" />)
    expect(screen.getByText('Ready to start?')).toBeTruthy()
    expect(screen.getByText('Get started').tagName).toBe('BUTTON')
  })

  it('renders subheading when provided', () => {
    render(
      <CtaBand
        heading="Subscribe"
        subheading="Weekly updates"
        ctaLabel="Join"
      />,
    )
    expect(screen.getByText('Weekly updates')).toBeTruthy()
  })
})

describe('Accordion', () => {
  it('renders FAQ items as details/summary', () => {
    render(
      <Accordion
        items={[
          { question: 'What is this?', answer: 'A thing' },
          { question: 'How much?', answer: '$10' },
        ]}
      />,
    )
    expect(screen.getByText('What is this?').tagName).toBe('SUMMARY')
    expect(screen.getByText('A thing')).toBeTruthy()
  })
})

describe('Navbar', () => {
  it('renders brand and nav links', () => {
    render(
      <Navbar
        brand="Acme"
        links={['Home', 'About', 'Contact']}
        ctaLabel="Sign up"
      />,
    )
    expect(screen.getByText('Acme')).toBeTruthy()
    expect(screen.getByText('Home')).toBeTruthy()
    expect(screen.getByText('Sign up').tagName).toBe('BUTTON')
  })
})

describe('Footer', () => {
  it('renders brand, columns, and social', () => {
    render(
      <Footer
        brand="Acme"
        columns={[
          { title: 'Pages', links: ['Home', 'About'] },
          { title: 'Legal', links: ['Privacy', 'Terms'] },
        ]}
        social={['Twitter', 'GitHub']}
      />,
    )
    expect(screen.getByText('Acme')).toBeTruthy()
    expect(screen.getByText('Pages')).toBeTruthy()
    expect(screen.getByText('Privacy')).toBeTruthy()
    expect(screen.getByText('Twitter')).toBeTruthy()
  })
})

describe('Form', () => {
  it('renders fields and submit button', () => {
    render(
      <Form
        fields={[
          { label: 'Name', type: 'text', placeholder: 'Your name' },
          { label: 'Message', type: 'textarea' },
        ]}
        submitLabel="Send"
      />,
    )
    expect(screen.getByText('Name')).toBeTruthy()
    expect(screen.getByPlaceholderText('Your name')).toBeTruthy()
    expect(screen.getByText('Send').tagName).toBe('BUTTON')
  })
})

describe('Divider', () => {
  it('renders rule variant with text', () => {
    render(<Divider variant="rule" text="Section" />)
    expect(screen.getByText('Section')).toBeTruthy()
  })

  it('renders marquee with exactly 2 copies for seamless loop', () => {
    render(<Divider variant="marquee" text="Available now" />)
    const texts = screen.getAllByText('Available now')
    expect(texts.length).toBe(2)
  })
})

describe('Section', () => {
  it('renders as section element with data-density attribute', () => {
    const { container } = renderWithDesign(
      { ...DEFAULT_DESIGN, density: 'airy' },
      <Section>content</Section>,
    )
    const el = container.querySelector('section')
    expect(el).toBeTruthy()
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.getAttribute('data-density')).toBe('airy')
  })

  it('sets data-density=compact from @design', () => {
    const { container } = renderWithDesign(
      { ...DEFAULT_DESIGN, density: 'compact' },
      <Section>content</Section>,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.getAttribute('data-density')).toBe('compact')
  })
})
