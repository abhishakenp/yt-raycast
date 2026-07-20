// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const controller = vi.hoisted(() => ({
  canSubmit: false,
  claimShareBonus: vi.fn(),
  errorMessage: undefined as string | undefined,
  isSubmitting: false,
  prompt: '',
  refreshShareBonusStatus: vi.fn(),
  selectExamplePrompt: vi.fn(),
  setPrompt: vi.fn(),
  shareBonusClaimed: false,
  submitPrompt: vi.fn(),
}))
const partnerConfig = vi.hoisted(() => ({ enabled: false }))

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    preload: _preload,
    params: _params,
    to,
    ...props
  }: {
    children: ReactNode
    params?: unknown
    preload?: false | 'intent'
    to: string
    [key: string]: unknown
  }) => createElement('a', { href: to, ...props }, children),
  useNavigate: () => vi.fn(),
}))

vi.mock('@clerk/tanstack-react-start', () => ({
  Waitlist: () => createElement('div', { 'data-testid': 'waitlist' }),
}))

vi.mock('convex/react', () => ({
  useMutation: () => vi.fn(),
}))

vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      create: 'sessions.create',
      deleteMine: 'sessions.deleteMine',
    },
  },
}))

vi.mock('@/shared/auth/clerk-runtime', () => ({
  isClerkClientEnabled: () => false,
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  useOptionalAuth: () => ({
    getToken: async () => null,
    isLoaded: true,
    isSignedIn: true,
  }),
}))

vi.mock('@/features/partners/lib/partner-config', () => ({
  isPartnerProgramClientEnabled: () => partnerConfig.enabled,
}))

vi.mock('@/lib/home/prompt-language-core', () => ({
  detectSnippetLanguageBcp47: vi.fn(async () => null),
}))

vi.mock('@/features/home/hooks/usePromptHomeController', () => ({
  usePromptHomeController: () => ({ ...controller }),
}))

vi.mock('@/features/gallery/hooks/useGalleryController', () => ({
  useGalleryController: () => ({
    gallery: {
      items: [
        {
          sessionId: 'home_static_gallery_session',
          prompt: 'Static home gallery preview',
          categories: ['website'],
          elapsed: 1200,
        },
      ],
      page: 1,
      limit: 12,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
      availableCategories: [{ value: 'website', label: 'website', count: 1 }],
    },
    sessions: [],
  }),
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: undefined, isPending: true }),
}))

vi.mock('@/features/gallery/server/gallery-preview-server-fn', () => ({
  fetchGalleryPreviewHtml: vi.fn(async () => null),
}))

import { HomePage } from './HomePage'

const originalFetch = globalThis.fetch

describe('HomePage rendered entry surface', () => {
  beforeEach(() => {
    controller.canSubmit = false
    controller.errorMessage = undefined
    controller.isSubmitting = false
    controller.prompt = ''
    controller.shareBonusClaimed = false
    controller.claimShareBonus.mockReset()
    controller.refreshShareBonusStatus.mockReset()
    controller.selectExamplePrompt.mockReset()
    controller.setPrompt.mockReset()
    controller.submitPrompt.mockReset()
    partnerConfig.enabled = false

    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ suggestions: [] }),
    })) as unknown as typeof fetch
    window.localStorage.clear()

    window.matchMedia ??= ((query: string) => ({
      addEventListener: () => {},
      addListener: () => {},
      dispatchEvent: () => false,
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: () => {},
      removeListener: () => {},
    })) as unknown as typeof window.matchMedia
  })

  afterEach(() => {
    cleanup()
    globalThis.fetch = originalFetch
  })

  it('renders the usable generation form, examples, and footer navigation', () => {
    const { getAllByRole, getByLabelText, getByRole, getByText } = render(
      createElement(HomePage),
    )

    expect(getByRole('region', { name: 'Print your mind in seconds' })).toBe(
      document.querySelector('[aria-label="Print your mind in seconds"]'),
    )
    expect(
      getByLabelText('Describe the website you want to build').getAttribute(
        'id',
      ),
    ).toBe('prompt-input')
    expect(
      (getByRole('button', { name: /generate/i }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)
    expect(getByRole('group', { name: 'Engine version' })).toBeTruthy()
    expect(getByText('Pet wellness')).toBeTruthy()
    expect(
      getAllByRole('link', { name: 'Pricing' })[0]?.getAttribute('href'),
    ).toBe('/pricing')

    fireEvent.click(getByText('Pet wellness'))

    expect(controller.selectExamplePrompt).toHaveBeenCalledWith(
      'Build a bold landing page for a premium pet wellness app with a booking section and customer testimonials.',
    )
  })

  it('renders the static gallery section immediately on the homepage', () => {
    const { container, getByText } = render(createElement(HomePage))

    expect(getByText('See what other speedsters generated')).toBeTruthy()
    expect(getByText('Static home gallery preview')).toBeTruthy()
    expect(container.querySelector('.sf-gallery-grid')).not.toBeNull()
    expect(
      container.querySelector(
        '[data-gallery-session-id="home_static_gallery_session"]',
      ),
    ).not.toBeNull()
  })

  it('shows partner navigation only while the feature is enabled', () => {
    partnerConfig.enabled = true
    const { getAllByRole } = render(createElement(HomePage))

    expect(getAllByRole('link', { name: 'Partners' })).toHaveLength(2)
    expect(
      getAllByRole('link', { name: 'Partners' }).every(
        (link) => link.getAttribute('href') === '/partners',
      ),
    ).toBe(true)
  })
})
