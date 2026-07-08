// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

import {
  CommandSearch,
  CommandSearchTrigger,
  AccountDropdown,
  AccountDropdownTrigger,
  AccountDropdownContent,
  AccountDropdownLabel,
  AccountDropdownSignOut,
  AccountDropdownUnauthenticated,
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
  PersonCardAvatar,
  PersonCardContent,
  PersonCardName,
  PersonCardRole,
  PersonCardBio,
  ResponsiveGrid,
} from './index.ts'

describe('FilterChip', () => {
  it('renders as button with rounded-full', () => {
    render(<FilterChip>Tag</FilterChip>)
    const el = screen.getByText('Tag')
    expect(el.tagName).toBe('BUTTON')
    expect(el.className).toContain('rounded-full')
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<FilterChip onClick={onClick}>Click</FilterChip>)
    fireEvent.click(screen.getByText('Click'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('applies active variant with bg-primary', () => {
    render(
      <FilterChip active variant="muted">
        Active
      </FilterChip>,
    )
    const el = screen.getByText('Active')
    expect(el.className).toContain('bg-primary')
    expect(el.getAttribute('aria-pressed')).toBe('true')
  })

  it('applies muted variant when not active', () => {
    render(<FilterChip variant="muted">Inactive</FilterChip>)
    const el = screen.getByText('Inactive')
    expect(el.className).toContain('bg-muted')
    expect(el.getAttribute('aria-pressed')).toBe('false')
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
    expect(grid?.getAttribute('data-slot')).toBe('responsive-grid')
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

  it('applies gap="none" with gap-0', () => {
    render(
      <ResponsiveGrid gap="none">
        <div>C</div>
      </ResponsiveGrid>,
    )
    const grid = screen.getByText('C').parentElement
    expect(grid?.className).toContain('gap-0')
  })

  it('applies gap="2xl" with gap-12', () => {
    render(
      <ResponsiveGrid gap="2xl">
        <div>C2</div>
      </ResponsiveGrid>,
    )
    const grid = screen.getByText('C2').parentElement
    expect(grid?.className).toContain('gap-12')
  })

  it('applies 2-4-6 cols preset', () => {
    render(
      <ResponsiveGrid cols="2-4-6">
        <div>F</div>
      </ResponsiveGrid>,
    )
    const grid = screen.getByText('F').parentElement
    expect(grid?.className).toContain('grid-cols-2')
    expect(grid?.className).toContain('md:grid-cols-4')
    expect(grid?.className).toContain('lg:grid-cols-6')
  })

  it('applies 1-md-2-3 cols preset', () => {
    render(
      <ResponsiveGrid cols="1-md-2-3">
        <div>G</div>
      </ResponsiveGrid>,
    )
    const grid = screen.getByText('G').parentElement
    expect(grid?.className).toContain('md:grid-cols-2')
    expect(grid?.className).toContain('lg:grid-cols-3')
  })

  it('merges className', () => {
    render(
      <ResponsiveGrid className="mt-10">
        <div>D</div>
      </ResponsiveGrid>,
    )
    const grid = screen.getByText('D').parentElement
    expect(grid?.className).toContain('mt-10')
    expect(grid?.className).toContain('grid')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(
      <ResponsiveGrid ref={ref}>
        <div>E</div>
      </ResponsiveGrid>,
    )
    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName).toBe('DIV')
  })

  it('asChild renders as child element with merged classes', () => {
    render(
      <ResponsiveGrid asChild cols="2">
        <ul data-testid="grid-ul">
          <li>item</li>
        </ul>
      </ResponsiveGrid>,
    )
    const el = screen.getByTestId('grid-ul')
    expect(el.tagName).toBe('UL')
    expect(el.className).toContain('grid')
    expect(el.className).toContain('grid-cols-2')
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
  it('renders as article with border, bg-card, rounded-xl', () => {
    render(<PersonCard data-testid="pc" />)
    const el = screen.getByTestId('pc')
    expect(el.tagName).toBe('ARTICLE')
    expect(el.className).toContain('border')
    expect(el.className).toContain('bg-card')
    expect(el.className).toContain('rounded-xl')
    expect(el.getAttribute('data-slot')).toBe('person-card')
  })

  it('elevated variant is shadowed with no border', () => {
    render(<PersonCard variant="elevated" rounded="2xl" data-testid="pc" />)
    const el = screen.getByTestId('pc')
    expect(el.className).toContain('rounded-2xl')
    expect(el.className).toContain('shadow-sm')
    expect(el.className).toContain('bg-card')
    expect(el.className).not.toContain('border-border')
  })

  it('bare variant has no surface (no border, bg, or shadow)', () => {
    render(<PersonCard variant="bare" rounded="none" data-testid="pc" />)
    const el = screen.getByTestId('pc')
    expect(el.className).not.toContain('border-border')
    expect(el.className).not.toContain('bg-card')
    expect(el.className).not.toContain('shadow')
  })

  it('plain variant has bg-card fill but no border', () => {
    render(<PersonCard variant="plain" data-testid="pc" />)
    const el = screen.getByTestId('pc')
    expect(el.className).toContain('bg-card')
    expect(el.className).not.toContain('border-border')
  })

  it('composes avatar, content, name, role, bio', () => {
    render(
      <PersonCard>
        <PersonCardAvatar data-testid="avatar" />
        <PersonCardContent>
          <PersonCardName>Jane Doe</PersonCardName>
          <PersonCardRole>CEO</PersonCardRole>
          <PersonCardBio>Experienced leader</PersonCardBio>
        </PersonCardContent>
      </PersonCard>,
    )
    expect(screen.getByText('Jane Doe').tagName).toBe('H3')
    expect(screen.getByText('CEO').tagName).toBe('P')
    expect(screen.getByText('Experienced leader').tagName).toBe('P')
    expect(screen.getByTestId('avatar').className).toContain('aspect-square')
    expect(screen.getByTestId('avatar').getAttribute('data-slot')).toBe(
      'person-card-avatar',
    )
  })

  it('merges className on all sub-components', () => {
    render(
      <PersonCard className="custom-card" data-testid="pc">
        <PersonCardAvatar className="custom-avatar" data-testid="avatar" />
        <PersonCardContent className="custom-content" data-testid="content" />
        <PersonCardName className="custom-name" data-testid="name">
          N
        </PersonCardName>
        <PersonCardRole className="custom-role" data-testid="role">
          R
        </PersonCardRole>
        <PersonCardBio className="custom-bio" data-testid="bio">
          B
        </PersonCardBio>
      </PersonCard>,
    )
    expect(screen.getByTestId('pc').className).toContain('custom-card')
    expect(screen.getByTestId('avatar').className).toContain('custom-avatar')
    expect(screen.getByTestId('content').className).toContain('custom-content')
    expect(screen.getByTestId('name').className).toContain('custom-name')
    expect(screen.getByTestId('role').className).toContain('custom-role')
    expect(screen.getByTestId('bio').className).toContain('custom-bio')
  })

  it('asChild renders as child element with merged classes', () => {
    render(
      <PersonCard asChild rounded="2xl" data-testid="pc">
        <div>X</div>
      </PersonCard>,
    )
    const el = screen.getByTestId('pc')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('border')
    expect(el.className).toContain('rounded-2xl')
  })

  it('PersonCardName asChild renders as span', () => {
    render(
      <PersonCard>
        <PersonCardName asChild>
          <span>Custom Name</span>
        </PersonCardName>
      </PersonCard>,
    )
    const el = screen.getByText('Custom Name')
    expect(el.tagName).toBe('SPAN')
    expect(el.className).toContain('font-semibold')
  })

  it('forwards ref to article', () => {
    const ref = { current: null as HTMLElement | null }
    render(<PersonCard ref={ref} />)
    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName).toBe('ARTICLE')
  })
})

describe('CommandSearch', () => {
  it('renders trigger button with default search icon', () => {
    render(
      <CommandSearch
        search={{
          items: [],
          getKey: () => 'x',
          getValue: () => 'x',
          onSelect: () => {},
        }}
      >
        <CommandSearchTrigger aria-label="Search" />
      </CommandSearch>,
    )
    const btn = screen.getByRole('button', { name: 'Search' })
    expect(btn).toBeTruthy()
  })
})

const mockAuthed = {
  useAuth: () => ({
    user: {
      displayName: 'Jane Doe',
      email: 'jane@test.com',
      isGuest: false,
      picture: undefined,
      provider: 'google',
    },
    isAuthenticated: true,
    isLoading: false,
  }),
  signOut: () => {},
  signInWithGoogle: () => {},
}

const mockUnauthed = {
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),
  signOut: () => {},
  signInWithGoogle: () => {},
}

const mockGuest = {
  useAuth: () => ({
    user: {
      displayName: 'Guest',
      email: undefined,
      isGuest: true,
      picture: undefined,
      provider: 'guest',
    },
    isAuthenticated: true,
    isLoading: false,
  }),
  signOut: () => {},
  signInWithGoogle: () => {},
}

describe('AccountDropdown', () => {
  it('authenticated: trigger renders avatar with initials', () => {
    render(
      <AccountDropdown auth={mockAuthed}>
        <AccountDropdownTrigger aria-label="Account" data-testid="trigger" />
      </AccountDropdown>,
    )
    const trigger = screen.getByTestId('trigger')
    expect(trigger.tagName).toBe('BUTTON')
    expect(trigger.className).toContain('rounded-full')
    expect(trigger.textContent).toContain('JD')
  })

  it('authenticated: trigger with asChild renders custom child', () => {
    render(
      <AccountDropdown auth={mockAuthed}>
        <AccountDropdownTrigger asChild aria-label="Account">
          <button type="button" data-testid="custom">
            Custom
          </button>
        </AccountDropdownTrigger>
      </AccountDropdown>,
    )
    expect(screen.getByTestId('custom').textContent).toBe('Custom')
  })

  it('authenticated: label auto-shows displayName and email', async () => {
    render(
      <AccountDropdown auth={mockAuthed}>
        <AccountDropdownTrigger aria-label="Account" />
        <AccountDropdownContent>
          <AccountDropdownLabel data-testid="label" />
        </AccountDropdownContent>
      </AccountDropdown>,
    )
    const trigger = screen.getByRole('button', { name: 'Account' })
    await fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
    await fireEvent.pointerUp(trigger, { pointerType: 'mouse' })
    expect(screen.getByTestId('label').textContent).toContain('Jane Doe')
    expect(screen.getByTestId('label').textContent).toContain('jane@test.com')
  })

  it('authenticated: label with custom children overrides defaults', async () => {
    render(
      <AccountDropdown auth={mockAuthed}>
        <AccountDropdownTrigger aria-label="Account" />
        <AccountDropdownContent>
          <AccountDropdownLabel>
            <span>Custom Label</span>
          </AccountDropdownLabel>
        </AccountDropdownContent>
      </AccountDropdown>,
    )
    const trigger = screen.getByRole('button', { name: 'Account' })
    await fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
    await fireEvent.pointerUp(trigger, { pointerType: 'mouse' })
    expect(screen.getByText('Custom Label')).toBeTruthy()
  })

  it('authenticated: content renders with w-56 default', async () => {
    render(
      <AccountDropdown auth={mockAuthed}>
        <AccountDropdownTrigger aria-label="Account" />
        <AccountDropdownContent data-testid="content">
          <AccountDropdownLabel />
        </AccountDropdownContent>
      </AccountDropdown>,
    )
    const trigger = screen.getByRole('button', { name: 'Account' })
    await fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
    await fireEvent.pointerUp(trigger, { pointerType: 'mouse' })
    expect(screen.getByTestId('content').className).toContain('w-56')
  })

  it('authenticated: SignOut renders as dropdown item with destructive styling', async () => {
    render(
      <AccountDropdown auth={mockAuthed}>
        <AccountDropdownTrigger aria-label="Account" />
        <AccountDropdownContent>
          <AccountDropdownSignOut data-testid="signout" />
        </AccountDropdownContent>
      </AccountDropdown>,
    )
    const trigger = screen.getByRole('button', { name: 'Account' })
    await fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
    await fireEvent.pointerUp(trigger, { pointerType: 'mouse' })
    const signout = screen.getByTestId('signout')
    expect(signout.textContent).toContain('Sign out')
    expect(signout.className).toContain('text-destructive')
  })

  it('authenticated: Unauthenticated returns null', () => {
    render(
      <AccountDropdown auth={mockAuthed}>
        <AccountDropdownUnauthenticated data-testid="unauth">
          Should not render
        </AccountDropdownUnauthenticated>
      </AccountDropdown>,
    )
    expect(screen.queryByTestId('unauth')).toBeNull()
  })

  it('unauthenticated: trigger renders nothing', () => {
    render(
      <AccountDropdown auth={mockUnauthed}>
        <AccountDropdownTrigger aria-label="Account" data-testid="trigger" />
      </AccountDropdown>,
    )
    expect(screen.queryByTestId('trigger')).toBeNull()
  })

  it('unauthenticated: content returns null', () => {
    render(
      <AccountDropdown auth={mockUnauthed}>
        <AccountDropdownContent data-testid="content">
          <AccountDropdownLabel />
        </AccountDropdownContent>
      </AccountDropdown>,
    )
    expect(screen.queryByTestId('content')).toBeNull()
  })

  it('unauthenticated: Unauthenticated renders default sign-in button', () => {
    render(
      <AccountDropdown auth={mockUnauthed}>
        <AccountDropdownUnauthenticated data-testid="unauth" />
      </AccountDropdown>,
    )
    const unauth = screen.getByTestId('unauth')
    expect(unauth.tagName).toBe('BUTTON')
    expect(unauth.textContent).toContain('Sign in')
  })

  it('unauthenticated: Unauthenticated with custom children', () => {
    render(
      <AccountDropdown auth={mockUnauthed}>
        <AccountDropdownUnauthenticated>
          Login with Google
        </AccountDropdownUnauthenticated>
      </AccountDropdown>,
    )
    expect(screen.getByText('Login with Google')).toBeTruthy()
  })

  it('guest: treated as unauthenticated (trigger renders nothing)', () => {
    render(
      <AccountDropdown auth={mockGuest}>
        <AccountDropdownTrigger aria-label="Account" data-testid="trigger" />
      </AccountDropdown>,
    )
    expect(screen.queryByTestId('trigger')).toBeNull()
  })

  it('merges className on trigger when authenticated', () => {
    render(
      <AccountDropdown auth={mockAuthed}>
        <AccountDropdownTrigger
          className="custom-trigger"
          aria-label="Account"
          data-testid="trigger"
        />
      </AccountDropdown>,
    )
    expect(screen.getByTestId('trigger').className).toContain('custom-trigger')
  })

  it('merges className on content', async () => {
    render(
      <AccountDropdown auth={mockAuthed}>
        <AccountDropdownTrigger aria-label="Account" />
        <AccountDropdownContent
          className="custom-content"
          data-testid="content"
        >
          <AccountDropdownLabel />
        </AccountDropdownContent>
      </AccountDropdown>,
    )
    const trigger = screen.getByRole('button', { name: 'Account' })
    await fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
    await fireEvent.pointerUp(trigger, { pointerType: 'mouse' })
    expect(screen.getByTestId('content').className).toContain('custom-content')
  })
})
