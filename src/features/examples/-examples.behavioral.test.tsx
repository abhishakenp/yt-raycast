// @vitest-environment jsdom
import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const routeParamMocks = vi.hoisted(() => ({
  category: 'saas',
  search: {
    theme: 'modern-minimal',
    mode: 'light',
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
  useMatch: ({
    from,
    shouldThrow,
  }: {
    from: string
    shouldThrow?: boolean
  }) => {
    if (from === '/examples/$category' || from === '/examples/$category/$') {
      return {
        params: { category: routeParamMocks.category },
        search: routeParamMocks.search,
      }
    }
    if (shouldThrow === false) return undefined
    throw new RouteNotFoundError(`No mocked match for ${from}`)
  },
  useNavigate: () => navigationMocks.navigate,
  useRouterState: <TSelected,>({
    select,
  }: {
    select: (state: { location: { pathname: string } }) => TSelected
  }) =>
    select({
      location: { pathname: `/examples/${routeParamMocks.category}` },
    }),
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

const importExamplesCategoryWildcardRoute = async (): Promise<MockRoute> => {
  const module = await import('@/routes/examples.$category.$')
  return routeFromModule(module)
}

const importExamplesIndexRoute = async (): Promise<MockRoute> => {
  const module = await import('@/routes/examples.index')
  return routeFromModule(module)
}

const parseExamplePageSwitch = (
  source: string,
): { routes: string[]; targetMap: Record<string, string> } => {
  const line = source
    .split('\n')
    .find((candidate) => candidate.startsWith('root = PageSwitch('))
  const match =
    /^root = PageSwitch\((\[.*\]), \[[^\]]*\], "", (\{.*\})\)$/.exec(line ?? '')
  if (!match?.[1] || !match[2])
    throw new Error('Expected PageSwitch target map')

  const routes: unknown = JSON.parse(match[1])
  if (
    !Array.isArray(routes) ||
    !routes.every((route): route is string => typeof route === 'string')
  ) {
    throw new Error('Expected PageSwitch routes')
  }

  const parsed: unknown = JSON.parse(match[2])
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Expected target map object')
  }

  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value !== 'string') {
      throw new Error(`Expected string target for ${key}`)
    }
    result[key] = value
  }
  return { routes, targetMap: result }
}

const expectMappedAnchor = (
  source: string,
  routes: string[],
  targetMap: Record<string, string>,
  label: string,
) => {
  const target = targetMap[label] ?? targetMap[label.toLowerCase()]
  expect(target).toMatch(/^[^#]+#[a-z0-9_-]+$/)
  const [pageLabel, anchorId] = target?.split('#') ?? []
  expect(routes).toContain(pageLabel)
  expect(source).toContain(`SectionAnchor("${anchorId}",`)
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

  it('mounts wildcard example category pages for internal preview navigation', async () => {
    const Route = await importExamplesCategoryWildcardRoute()

    expect(Route.path).toBe('/examples/$category/$')
    expect(() =>
      Route.options.beforeLoad?.({ params: { category: 'accounting-firm' } }),
    ).not.toThrow()
    expect(Route.options.validateSearch?.({ theme: 'twitter' })).toEqual({
      theme: 'twitter',
      mode: 'light',
    })
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
    expect(sample?.source).toContain(
      'Launch faster with a clearer product story',
    )
    expect(sample?.source).toContain('root = Stack')

    const library = await loadOpenUIRuntimeLibrary(sample?.source ?? '')
    expect(library).toBeTruthy()
  })

  it('uses professional category copy instead of prop-name placeholders', () => {
    const analyticsSite = getExampleCategorySite('analytics')
    const aeoSite = getExampleCategorySite('aeo')
    const winerySite = getExampleCategorySite('winery-brewery')

    expect(analyticsSite?.source).not.toContain('Analytics Analytics Header')
    expect(analyticsSite?.source).not.toContain('Analytics Analytics Footer')
    expect(aeoSite?.source).not.toContain('Aeo Aeo Footer')
    expect(winerySite?.source).not.toContain(
      'Winery Brewery Menu for Winery Brewery',
    )
    expect(winerySite?.source).not.toContain(
      'Deterministic example copy for reviewing Winery Brewery Menu',
    )
    expect(analyticsSite?.source).toContain(
      'Launch faster with a clearer product story',
    )
    expect(aeoSite?.source).toContain('Product resources')
    expect(winerySite?.source).toContain('Seasonal pours and cellar bites')
    expect(winerySite?.source).toContain(
      'Explore tasting flights, reserve bottles, crisp lagers, and shareable boards selected for the current release list.',
    )
  })

  it('builds cafe zero-argument capsules without hanging', () => {
    const cafeGallery = getExampleCapsules('cafe').find(
      (capsule) => capsule.componentName === 'CafeGallery',
    )
    const cafeSite = getExampleCategorySite('cafe')

    expect(cafeGallery?.source).toContain('CafeGallery()')
    expect(cafeGallery?.source).toContain('root = Stack([cafe_gallery])')
    expect(cafeSite?.source).toContain('CafeGallery()')
    expect(cafeSite?.source).toContain('root = PageSwitch')
  })

  it('keeps generated split headings and auth labels compact', () => {
    const musicFestivalSite = getExampleCategorySite('music-festival')
    const onlineCourseSite = getExampleCategorySite('online-course')
    const cafeSite = getExampleCategorySite('cafe')

    expect(musicFestivalSite?.source).toContain(
      'MusicFestivalHero("Built for momentum", "A sharper music", "festival"',
    )
    expect(musicFestivalSite?.source).not.toContain(
      'MusicFestivalHero("Built for momentum", "A sharper music festival experience", "A sharper music festival experience"',
    )
    expect(onlineCourseSite?.source).toContain(
      'OnlineCourseNavbar("Online Course Institute", ["Home","Pricing"], "Sign in"',
    )
    expect(onlineCourseSite?.source).not.toContain(
      'OnlineCourseNavbar("Online Course Institute", ["Home","Pricing"], "Explain programs',
    )
    expect(cafeSite?.source).toContain(
      'CafeHero("Fresh service, local flavor", "Book a table", "tonight", ""',
    )
    expect(cafeSite?.source).toContain(
      'CafeNavbar("Cafe House", ["Home","Menu","Gallery","Newsletter"], "Home", "Menu", "Menu", "3")',
    )
  })

  it('does not leak internal demo or layout-review copy into category sources', () => {
    const bannedCopy = [
      'Deterministic example copy',
      'local demo content',
      'weak blocks',
      'Reusable blocks',
      'Local previews',
      'preview copy',
    ]

    for (const category of [
      'winery-brewery',
      'restaurant',
      'analytics',
      'aeo',
      'fitness',
      'accounting-firm',
    ]) {
      const source = getExampleCategorySite(category)?.source ?? ''
      for (const banned of bannedCopy) {
        expect(source, `${category} leaked "${banned}"`).not.toContain(banned)
      }
    }
  })

  it('builds a no-chrome full-site category source with PageSwitch', async () => {
    const site = getExampleCategorySite('saas')
    const pageSwitch = parseExamplePageSwitch(site?.source ?? '')

    expect(pageSwitch.routes).toContain('Home')
    expect(pageSwitch.routes).toContain('Pricing')
    expect(site?.source).toContain('SectionAnchor(')
    expect(site?.source).toContain('SaasHero(')
    expect(site?.source).toContain('SaasFooter(')
    expectMappedAnchor(
      site?.source ?? '',
      pageSwitch.routes,
      pageSwitch.targetMap,
      'Pricing',
    )

    const library = await loadOpenUIRuntimeLibrary(site?.source ?? '')
    expect(library).toBeTruthy()
  })

  it('loads the target category sources in the OpenUI runtime', async () => {
    for (const category of ['music-festival', 'online-course', 'cafe']) {
      const site = getExampleCategorySite(category)
      const library = await loadOpenUIRuntimeLibrary(site?.source ?? '')

      expect(library, category).toBeTruthy()
    }
  })

  it('uses the engine route plan for category nav instead of inventing missing pages', () => {
    const site = getExampleCategorySite('accounting-firm')
    const pageSwitch = parseExamplePageSwitch(site?.source ?? '')

    expect(pageSwitch.routes).toContain('Home')
    expect(pageSwitch.routes).toContain('Services')
    expect(pageSwitch.routes).toContain('About')
    expect(pageSwitch.routes).toContain('Team')
    expect(pageSwitch.routes).not.toContain('Pricing')
    expect(pageSwitch.routes).not.toContain('FAQ')
    expect(site?.source).toContain(
      'AccountingFirmNavbar("Accounting Firm Partners", ["Home","Team","Services","About"], "Team")',
    )
    expect(site?.source).not.toContain('"Pricing"')
    expect(site?.source).not.toContain('"FAQ"')
  })

  it('maps planned category routes to real section anchors for every category', () => {
    for (const category of getExampleCategories()) {
      const site = getExampleCategorySite(category.category)
      expect(site).toBeTruthy()
      const source = site?.source ?? ''
      const pageSwitch = parseExamplePageSwitch(source)
      for (const route of pageSwitch.routes.slice(1)) {
        const target =
          pageSwitch.targetMap[route] ??
          pageSwitch.targetMap[route.toLowerCase()]
        expect(target).toBeTruthy()
        if (target?.includes('#')) {
          const [pageLabel, anchorId] = target.split('#')
          expect(pageSwitch.routes).toContain(pageLabel)
          expect(source).toContain(`SectionAnchor("${anchorId}",`)
        } else {
          expect(pageSwitch.routes).toContain(target)
        }
      }
    }
  })
})
