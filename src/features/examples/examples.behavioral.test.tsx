// @vitest-environment jsdom
import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const routeParamMocks = vi.hoisted(() => ({
  category: 'saas',
  search: {
    theme: 'modern-minimal',
    mode: 'light' as 'light' | 'dark',
  },
}))

const navigationMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}))

class MockResizeObserver implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class RouteNotFoundError extends Error {
  code = 'ROUTE_NOT_FOUND'
}

type MockRoute = {
  options: {
    beforeLoad?: (args: { params: Record<string, string> }) => void
    component?: React.ComponentType
    validateSearch?: (search: Record<string, unknown>) => unknown
  }
  path: string
}

type CreateFileRouteResult = (options: MockRoute['options']) => MockRoute

vi.mock('@tanstack/react-router', () => ({
  createFileRoute(path: string): CreateFileRouteResult {
    return (options) => ({ options, path })
  },
  getRouteApi: () => ({
    useParams: () => ({ category: routeParamMocks.category }),
    useSearch: () => routeParamMocks.search,
  }),
  useNavigate: () => navigationMocks.navigate,
  lazyRouteComponent: (_importer: unknown, exportName: string) => {
    const LazyRouteComponent = () => (
      <div data-testid="lazy-route">{exportName}</div>
    )
    return LazyRouteComponent
  },
  Outlet: () => <div data-testid="examples-outlet" />,
  Link: ({
    children,
    className,
    params,
    to,
  }: {
    children: React.ReactNode
    className?: string
    params?: Record<string, string>
    to: string
  }) => {
    const href = params?.category
      ? to.replace('$category', params.category)
      : to
    return (
      <a className={className} href={href}>
        {children}
      </a>
    )
  },
  notFound: () => new RouteNotFoundError('not found'),
}))

vi.mock('@/features/dashboard/components/SessionGeneratedPreview', () => ({
  SessionGeneratedPreview: ({
    isDark,
    prompt,
    source,
    themeStyles,
  }: {
    isDark?: boolean
    prompt?: string
    source: string
    themeStyles?: { light?: { primary?: string } } | null
  }) => (
    <pre
      data-is-dark={String(isDark)}
      data-prompt={prompt}
      data-primary={themeStyles?.light?.primary}
      data-testid="generated-preview"
    >
      {source}
    </pre>
  ),
}))

vi.mock('@/genui/components/ThemePicker', () => ({
  default: ({
    isDark,
    onSelect,
    onToggleMode,
    value,
  }: {
    isDark: boolean
    onSelect: (name: string) => void
    onToggleMode: () => void
    value: string | null
  }) => (
    <div
      data-current-mode={isDark ? 'dark' : 'light'}
      data-testid="theme-picker"
    >
      <span>{value}</span>
      <button type="button" onClick={() => onSelect('vercel')}>
        Pick Vercel
      </button>
      <button type="button" onClick={onToggleMode}>
        Toggle Mode
      </button>
    </div>
  ),
}))

import { loadOpenUIRuntimeLibrary } from '@ship-fast/blocks/runtime'

import {
  getExampleCategories,
  hasExampleCategory,
} from './lib/examples-categories'
import { getExampleCapsules, getExampleCategorySite } from './lib/examples-data'
import { isExamplesEnabled } from './lib/examples-gate'
import {
  DEFAULT_EXAMPLES_THEME,
  parseExamplesThemeSearch,
} from './lib/examples-theme-search'
import { ExamplesCategoryPage } from './components/ExamplesCategoryPage'
import { ExamplesIndexPage } from './components/ExamplesIndexPage'

const isMockRoute = (value: unknown): value is MockRoute =>
  value !== null &&
  typeof value === 'object' &&
  'path' in value &&
  typeof value.path === 'string' &&
  'options' in value &&
  value.options !== null &&
  typeof value.options === 'object'

const routeFromModule = (module: unknown): MockRoute => {
  if (module === null || typeof module !== 'object' || !('Route' in module)) {
    throw new Error('Expected route module')
  }

  const route = module.Route
  if (!isMockRoute(route)) {
    throw new Error('Expected mocked route')
  }

  return route
}

const importExamplesRoute = async (): Promise<MockRoute> => {
  const module = await import('@/routes/examples')
  return routeFromModule(module)
}

const importExamplesCategoryRoute = async (): Promise<MockRoute> => {
  const module = await import('@/routes/examples.$category')
  return routeFromModule(module)
}

const importExamplesIndexRoute = async (): Promise<MockRoute> => {
  const module = await import('@/routes/examples.index')
  return routeFromModule(module)
}

describe('examples route behavior', () => {
  beforeEach(() => {
    routeParamMocks.category = 'saas'
    routeParamMocks.search = {
      theme: DEFAULT_EXAMPLES_THEME,
      mode: 'light',
    }
    navigationMocks.navigate.mockClear()
    vi.stubGlobal('ResizeObserver', MockResizeObserver)
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    })
    vi.stubEnv('VITE_DISABLE_CLERK', 'true')
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllEnvs()
  })

  it('enables examples only when VITE_DISABLE_CLERK is true', () => {
    vi.stubEnv('VITE_DISABLE_CLERK', 'true')
    expect(isExamplesEnabled()).toBe(true)

    vi.stubEnv('VITE_DISABLE_CLERK', 'false')
    expect(isExamplesEnabled()).toBe(false)

    vi.stubEnv('VITE_DISABLE_CLERK', '')
    expect(isExamplesEnabled()).toBe(false)
  })

  it('returns not found for /examples when Clerk is not disabled', async () => {
    vi.stubEnv('VITE_DISABLE_CLERK', 'false')
    const Route = await importExamplesRoute()

    expect(Route.path).toBe('/examples')
    expect(() => Route.options.beforeLoad?.({ params: {} })).toThrow(
      RouteNotFoundError,
    )
  })

  it('mounts the examples index as a child route', async () => {
    const Route = await importExamplesIndexRoute()
    const Component = Route.options.component

    expect(Route.path).toBe('/examples/')
    expect(Component).toBeTypeOf('function')

    render(Component ? <Component /> : null)

    expect(screen.getByTestId('lazy-route').textContent).toBe(
      'ExamplesIndexPage',
    )
  })

  it('returns not found for /examples/$category when Clerk is not disabled', async () => {
    vi.stubEnv('VITE_DISABLE_CLERK', 'false')
    const Route = await importExamplesCategoryRoute()

    expect(Route.path).toBe('/examples/$category')
    expect(() =>
      Route.options.beforeLoad?.({ params: { category: 'saas' } }),
    ).toThrow(RouteNotFoundError)
  })

  it('returns not found for unknown categories even when examples are enabled', async () => {
    const Route = await importExamplesCategoryRoute()

    expect(() =>
      Route.options.beforeLoad?.({ params: { category: 'not-a-category' } }),
    ).toThrow(RouteNotFoundError)
  })

  it('validates examples theme search params with zod defaults', async () => {
    const Route = await importExamplesCategoryRoute()

    expect(Route.options.validateSearch?.({})).toEqual({
      theme: DEFAULT_EXAMPLES_THEME,
      mode: 'light',
    })
    expect(
      Route.options.validateSearch?.({ theme: 'twitter', mode: 'dark' }),
    ).toEqual({
      theme: 'twitter',
      mode: 'dark',
    })
    expect(
      Route.options.validateSearch?.({
        theme: 'not-a-theme',
        mode: 'not-a-mode',
      }),
    ).toEqual({
      theme: DEFAULT_EXAMPLES_THEME,
      mode: 'light',
    })
    expect(parseExamplesThemeSearch({ theme: 'vercel' }).theme).toBe('vercel')
  })

  it('lists capsule categories on /examples', () => {
    render(<ExamplesIndexPage />)

    expect(screen.getByRole('heading', { name: 'Categories' })).toBeTruthy()
    expect(
      screen.getByRole('link', { name: /Saas/i }).getAttribute('href'),
    ).toBe('/examples/saas')
    expect(hasExampleCategory('saas')).toBe(true)
  })

  it('renders a selected category through the themed generated preview', () => {
    routeParamMocks.search = { theme: 'twitter', mode: 'dark' }

    render(<ExamplesCategoryPage />)

    const previews = screen.getAllByTestId('generated-preview')
    expect(previews).toHaveLength(1)
    expect(previews[0]?.textContent).toContain('root = PageSwitch')
    expect(previews[0]?.textContent).toContain('home = Stack')
    expect(previews[0]?.textContent).toContain('SectionAnchor(')
    expect(previews[0]?.textContent).toContain('SaasHero')
    expect(previews[0]?.getAttribute('data-prompt')).toBe(
      'Saas full site examples',
    )
    expect(previews[0]?.getAttribute('data-is-dark')).toBe('true')
    expect(previews[0]?.getAttribute('data-primary')).toBe('#1e9df1')
    expect(screen.queryByTestId('theme-picker')).toBeNull()
    expect(screen.queryByText('Categories')).toBeNull()
  })

  it('opens the hidden theme dialog after five space presses and updates search params', () => {
    routeParamMocks.search = { theme: 'twitter', mode: 'light' }

    render(<ExamplesCategoryPage />)

    expect(screen.queryByTestId('theme-picker')).toBeNull()

    for (let index = 0; index < 5; index += 1) {
      fireEvent.keyDown(window, { code: 'Space', key: ' ' })
    }

    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByPlaceholderText('Search categories...')).toBeTruthy()
    expect(
      screen.getByTestId('theme-picker').getAttribute('data-current-mode'),
    ).toBe('light')

    fireEvent.click(screen.getByText('Accounting Firm'))
    expect(navigationMocks.navigate).toHaveBeenCalledWith({
      to: '/examples/$category',
      params: { category: 'accounting-firm' },
      search: { theme: 'twitter', mode: 'light' },
      replace: true,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Pick Vercel' }))
    expect(navigationMocks.navigate).toHaveBeenCalledWith({
      to: '/examples/$category',
      params: { category: 'saas' },
      search: { theme: 'vercel', mode: 'light' },
      replace: true,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Toggle Mode' }))
    expect(navigationMocks.navigate).toHaveBeenLastCalledWith({
      to: '/examples/$category',
      params: { category: 'saas' },
      search: { theme: 'twitter', mode: 'dark' },
      replace: true,
    })
  })

  it('builds source from real capsule categories and loads it in the OpenUI runtime', async () => {
    const categories = getExampleCategories()
    const capsules = getExampleCapsules('saas')
    const sample = capsules.find(
      (capsule) => capsule.componentName === 'SaasHero',
    )

    expect(categories.length).toBeGreaterThan(50)
    expect(capsules.length).toBeGreaterThan(0)
    expect(sample?.source).toContain('SaasHero(')
    expect(sample?.source).toContain('"heading"')
    expect(sample?.source).toContain('root = Stack')

    const library = await loadOpenUIRuntimeLibrary(sample?.source ?? '')
    expect(library).toBeTruthy()
  })

  it('builds a no-chrome full-site category source with PageSwitch', async () => {
    const site = getExampleCategorySite('saas')

    expect(site?.source).toContain(
      'root = PageSwitch(["Home"], [home], "", {})',
    )
    expect(site?.source).toContain('SectionAnchor(')
    expect(site?.source).toContain('SaasHero(')
    expect(site?.source).toContain('SaasFooter(')

    const library = await loadOpenUIRuntimeLibrary(site?.source ?? '')
    expect(library).toBeTruthy()
  })
})
