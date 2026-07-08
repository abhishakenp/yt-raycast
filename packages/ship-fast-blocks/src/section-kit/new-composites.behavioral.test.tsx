// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

afterEach(() => {
  cleanup()
})

import {
  Card,
  CommandSearch,
  AccountDropdown,
  FilterChip,
  ProductCard,
  ProductCardImage,
  ProductCardBadge,
  ProductCardActions,
  ProductCardContent,
  ProductCardTitle,
  ProductCardSubtitle,
  ProductCardPrice,
  PersonCard,
  Eyebrow,
  ResponsiveGrid,
  surfaceCard,
} from './index.ts'

describe('Card', () => {
  it('renders children with default variants', () => {
    render(<Card>Content</Card>)
    const el = screen.getByText('Content')
    expect(el.className).toContain('border')
    expect(el.className).toContain('bg-card')
    expect(el.className).toContain('rounded-xl')
    expect(el.className).toContain('p-6')
  })

  it('applies rounded, padding, shadow variants', () => {
    render(
      <Card rounded="2xl" padding="lg" shadow="lg">
        X
      </Card>,
    )
    const el = screen.getByText('X')
    expect(el.className).toContain('rounded-2xl')
    expect(el.className).toContain('p-8')
    expect(el.className).toContain('shadow-lg')
  })

  it('merges className', () => {
    render(<Card className="custom-class">Y</Card>)
    expect(screen.getByText('Y').className).toContain('custom-class')
  })
})

describe('surfaceCard', () => {
  it('returns base classes with defaults', () => {
    const cls = surfaceCard()
    expect(cls).toContain('border')
    expect(cls).toContain('bg-card')
    expect(cls).toContain('rounded-xl')
  })
})

describe('FilterChip', () => {
  it('renders as span when no onClick', () => {
    render(<FilterChip>Tag</FilterChip>)
    const el = screen.getByText('Tag')
    expect(el.tagName).toBe('SPAN')
    expect(el.className).toContain('rounded-full')
  })

  it('renders as button when onClick provided', () => {
    render(<FilterChip onClick={() => {}}>Click</FilterChip>)
    const el = screen.getByText('Click')
    expect(el.tagName).toBe('BUTTON')
    expect(el.className).toContain('rounded-full')
  })

  it('applies active variant', () => {
    render(
      <FilterChip active variant="muted">
        Active
      </FilterChip>,
    )
    const el = screen.getByText('Active')
    expect(el.className).toContain('bg-primary')
  })
})

describe('Eyebrow', () => {
  it('renders eyebrow text', () => {
    render(<Eyebrow>Section Label</Eyebrow>)
    const el = screen.getByText('Section Label')
    expect(el.tagName).toBe('SPAN')
    expect(el.className).toContain('rounded-full')
    expect(el.className).toContain('uppercase')
  })
})

describe('ResponsiveGrid', () => {
  it('renders grid with default cols and gap', () => {
    render(
      <ResponsiveGrid>
        <div>A</div>
      </ResponsiveGrid>,
    )
    const grid = screen.getByText('A').parentElement
    expect(grid?.className).toContain('grid')
    expect(grid?.className).toContain('lg:grid-cols-3')
    expect(grid?.className).toContain('gap-8')
  })

  it('applies custom cols preset', () => {
    render(
      <ResponsiveGrid cols="1-2-4" gap="md">
        <div>B</div>
      </ResponsiveGrid>,
    )
    const grid = screen.getByText('B').parentElement
    expect(grid?.className).toContain('lg:grid-cols-4')
    expect(grid?.className).toContain('gap-6')
  })
})

describe('ProductCard', () => {
  it('renders as article with outlined surface by default', () => {
    render(<ProductCard data-testid="pc" />)
    const el = screen.getByTestId('pc')
    expect(el.tagName).toBe('ARTICLE')
    expect(el.className).toContain('border')
    expect(el.className).toContain('border-border')
    expect(el.className).toContain('bg-card')
    expect(el.className).toContain('group')
    expect(el.className).toContain('overflow-hidden')
  })

  it('variant="none" has no border, bg, or overflow', () => {
    render(<ProductCard variant="none" data-testid="pc" />)
    const el = screen.getByTestId('pc')
    expect(el.className).not.toContain('border')
    expect(el.className).not.toContain('bg-card')
    expect(el.className).not.toContain('overflow-hidden')
  })

  it('variant="elevated" has bg-card, rounded-xl, no border', () => {
    render(<ProductCard variant="elevated" data-testid="pc" />)
    const el = screen.getByTestId('pc')
    expect(el.className).toContain('bg-card')
    expect(el.className).toContain('overflow-hidden')
    expect(el.className).toContain('rounded-xl')
    expect(el.className).not.toContain('border-border')
  })

  it('composes image, badge, actions, content, title, subtitle, price', () => {
    render(
      <ProductCard>
        <ProductCardImage>
          <ProductCardBadge>Sale</ProductCardBadge>
          <ProductCardActions>
            <button>Add</button>
          </ProductCardActions>
        </ProductCardImage>
        <ProductCardContent>
          <ProductCardTitle>Chair</ProductCardTitle>
          <ProductCardSubtitle>Oak</ProductCardSubtitle>
          <ProductCardPrice>$99</ProductCardPrice>
        </ProductCardContent>
      </ProductCard>,
    )
    expect(screen.getByText('Chair').tagName).toBe('H3')
    expect(screen.getByText('Oak').tagName).toBe('P')
    expect(screen.getByText('$99').tagName).toBe('P')
    expect(screen.getByText('Sale').tagName).toBe('SPAN')
    expect(screen.getByText('Sale').className).toContain('absolute')
    expect(screen.getByText('Sale').className).toContain('left-3')
    expect(screen.getByText('Sale').className).toContain('top-3')
  })

  it('image container has aspect-square and bg-muted', () => {
    render(
      <ProductCard>
        <ProductCardImage data-testid="img" />
      </ProductCard>,
    )
    const img = screen.getByTestId('img')
    expect(img.className).toContain('aspect-square')
    expect(img.className).toContain('bg-muted')
  })

  it('content has flex flex-col p-5', () => {
    render(
      <ProductCard>
        <ProductCardContent data-testid="content" />
      </ProductCard>,
    )
    const content = screen.getByTestId('content')
    expect(content.className).toContain('flex')
    expect(content.className).toContain('flex-col')
    expect(content.className).toContain('p-5')
  })

  it('merges className on all sub-components', () => {
    render(
      <ProductCard className="custom-card" data-testid="pc">
        <ProductCardImage className="custom-img" data-testid="img" />
        <ProductCardBadge className="custom-badge" data-testid="badge">
          B
        </ProductCardBadge>
        <ProductCardActions className="custom-actions" data-testid="actions" />
        <ProductCardContent className="custom-content" data-testid="content" />
        <ProductCardTitle className="custom-title" data-testid="title">
          T
        </ProductCardTitle>
        <ProductCardSubtitle className="custom-sub" data-testid="sub">
          S
        </ProductCardSubtitle>
        <ProductCardPrice className="custom-price" data-testid="price">
          P
        </ProductCardPrice>
      </ProductCard>,
    )
    expect(screen.getByTestId('pc').className).toContain('custom-card')
    expect(screen.getByTestId('img').className).toContain('custom-img')
    expect(screen.getByTestId('badge').className).toContain('custom-badge')
    expect(screen.getByTestId('actions').className).toContain('custom-actions')
    expect(screen.getByTestId('content').className).toContain('custom-content')
    expect(screen.getByTestId('title').className).toContain('custom-title')
    expect(screen.getByTestId('sub').className).toContain('custom-sub')
    expect(screen.getByTestId('price').className).toContain('custom-price')
  })

  it('asChild renders as child element with merged classes', () => {
    render(
      <ProductCard asChild variant="elevated" data-testid="pc">
        <button type="button">Click</button>
      </ProductCard>,
    )
    const el = screen.getByTestId('pc')
    expect(el.tagName).toBe('BUTTON')
    expect(el.className).toContain('bg-card')
    expect(el.className).toContain('group')
    expect(el.textContent).toBe('Click')
  })

  it('ProductCardTitle asChild renders as button', () => {
    render(
      <ProductCard>
        <ProductCardTitle asChild>
          <button type="button">Title</button>
        </ProductCardTitle>
      </ProductCard>,
    )
    const el = screen.getByText('Title')
    expect(el.tagName).toBe('BUTTON')
    expect(el.className).toContain('font-medium')
  })
})

describe('PersonCard', () => {
  it('renders name, role, bio', () => {
    render(
      <PersonCard
        avatar={<img alt="avatar" />}
        name="Jane Doe"
        role="CEO"
        bio="Experienced leader"
      />,
    )
    expect(screen.getByText('Jane Doe')).toBeTruthy()
    expect(screen.getByText('CEO')).toBeTruthy()
    expect(screen.getByText('Experienced leader')).toBeTruthy()
  })
})

describe('CommandSearch', () => {
  it('renders trigger button with default search icon', () => {
    render(
      <CommandSearch
        title="Search"
        description="Search items"
        placeholder="Search..."
        items={[]}
        getKey={() => 'x'}
        getValue={() => 'x'}
        renderRow={() => null}
        onSelect={() => {}}
      />,
    )
    const btn = screen.getByRole('button', { name: 'Search' })
    expect(btn).toBeTruthy()
  })
})

describe('AccountDropdown', () => {
  it('renders trigger button', () => {
    render(
      <AccountDropdown
        displayName="Jane"
        email="jane@test.com"
        isAuthenticated
        onSignOut={() => {}}
        onSignIn={() => {}}
      />,
    )
    const btn = screen.getByRole('button', { name: 'Account' })
    expect(btn).toBeTruthy()
  })
})
