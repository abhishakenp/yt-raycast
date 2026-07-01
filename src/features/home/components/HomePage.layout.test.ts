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

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) =>
    createElement('a', { href: to }, children),
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

vi.mock('@/lib/home/prompt-language-core', () => ({
  detectSnippetLanguageBcp47: vi.fn(async () => null),
}))

vi.mock('@/features/home/hooks/usePromptHomeController', () => ({
  usePromptHomeController: () => ({ ...controller }),
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
})
