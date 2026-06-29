// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  PROMPT_LANG_DETECT_DEBOUNCE_MS,
  PROMPT_LANG_DETECT_MIN_CHARS,
} from '@/lib/home/constants'

import { HomePage } from './HomePage'

/**
 * Behavioral tests exposing two bugs in the HomePage language dropdown +
 * auto-detection flow:
 *
 * BUG 1: The language dropdown is hidden when the prompt is shorter than
 * PROMPT_LANG_DETECT_MIN_CHARS (65), even when the prompt contains an
 * explicit language keyword like "in hindi". The dropdown should be visible
 * whenever there is any prompt content (>= 1 char), not gated behind the
 * 65-char min.
 *
 * BUG 2: Language auto-detection does not run for short prompts with explicit
 * language keywords. The detection effect returns early because
 * `currentPrompt.length < PROMPT_LANG_DETECT_MIN_CHARS`. The explicit keyword
 * detection (`detectExplicitLanguageKeyword`) works at any length, so the
 * min-char gate should not block it.
 *
 * Mock setup mirrors HomePage.language-suggestions.behavioral.test.tsx.
 * `detectSnippetLanguageBcp47` is mocked to return 'hi' for any input
 * containing "hindi".
 */

const mocks = vi.hoisted(() => ({
  submitPrompt: vi.fn(),
  selectExamplePromptSpy: vi.fn(),
  refreshShareBonusStatus: vi.fn(),
  claimShareBonus: vi.fn(),
  detectSnippetLanguageBcp47: vi.fn().mockResolvedValue(null),
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

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    ...rest
  }: {
    children: React.ReactNode
    to: string
    [key: string]: unknown
  }) => (
    <a href={typeof to === 'string' ? to : '#'} {...rest}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
}))

vi.mock('@clerk/tanstack-react-start', () => ({
  Waitlist: () => <div data-testid="clerk-waitlist">Join the waitlist</div>,
}))

vi.mock('@/shared/auth/clerk-runtime', () => ({
  isClerkClientEnabled: () => false,
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  useOptionalAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    getToken: async () => null,
  }),
}))

vi.mock('@/lib/home/prompt-language-core', () => ({
  detectSnippetLanguageBcp47: mocks.detectSnippetLanguageBcp47,
}))

vi.mock('@/features/home/hooks/usePromptHomeController', () => {
  const React = require('react')
  return {
    usePromptHomeController: () => {
      const [prompt, setPrompt] = React.useState('')
      const [isSubmitting] = React.useState(false)
      return {
        prompt,
        canSubmit: prompt.trim().length > 0 && !isSubmitting,
        isSubmitting,
        errorMessage: undefined as string | undefined,
        shareBonusClaimed: false,
        claimShareBonus: mocks.claimShareBonus,
        refreshShareBonusStatus: mocks.refreshShareBonusStatus,
        selectExamplePrompt: (value: string) => {
          mocks.selectExamplePromptSpy(value)
          setPrompt(value)
        },
        setPrompt,
        submitPrompt: mocks.submitPrompt,
        examplePrompts: [] as unknown[],
        submitButtonLabel: 'Start generating',
      }
    },
  }
})

const ORIGINAL_FETCH = globalThis.fetch

const fetchMock = vi.fn(
  async () =>
    new Response(JSON.stringify({ suggestions: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
)

const getPromptInput = () =>
  document.getElementById('prompt-input') as HTMLTextAreaElement

const getLanguageRow = () =>
  document.getElementById('prompt-language-row') as HTMLDivElement

const getLanguageSelect = () =>
  document.getElementById('prompt-language') as HTMLSelectElement

describe('HomePage — language detection for short explicit-keyword prompts', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch
    fetchMock.mockClear()
    mocks.submitPrompt.mockReset()
    mocks.selectExamplePromptSpy.mockReset()
    // Mock detector: return 'hi' for any input containing "hindi", else null.
    mocks.detectSnippetLanguageBcp47
      .mockReset()
      .mockImplementation(async (snippet: string) => {
        if (
          typeof snippet === 'string' &&
          snippet.toLowerCase().includes('hindi')
        ) {
          return 'hi'
        }
        return null
      })
    // jsdom lacks requestAnimationFrame / matchMedia; provide no-op shims.
    if (typeof window.requestAnimationFrame !== 'function') {
      window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
        return window.setTimeout(() => cb(Date.now()), 0) as unknown as number
      }) as typeof window.requestAnimationFrame
      window.cancelAnimationFrame = ((handle: number) =>
        window.clearTimeout(handle)) as typeof window.cancelAnimationFrame
    }
    if (!window.matchMedia) {
      window.matchMedia = ((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      })) as unknown as typeof window.matchMedia
    }
  })

  afterEach(() => {
    vi.useRealTimers()
    globalThis.fetch = ORIGINAL_FETCH
    cleanup()
  })

  it('language dropdown is visible when prompt has any content (even < 65 chars)', () => {
    // "gov site in hindi" is 17 chars, well below PROMPT_LANG_DETECT_MIN_CHARS (65),
    // but contains an explicit language keyword. The dropdown should be visible.
    const SHORT_EXPLICIT_PROMPT = 'gov site in hindi'
    expect(SHORT_EXPLICIT_PROMPT.length).toBeLessThan(
      PROMPT_LANG_DETECT_MIN_CHARS,
    )

    render(<HomePage />)
    const input = getPromptInput()
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: SHORT_EXPLICIT_PROMPT } })

    const row = getLanguageRow()
    expect(row).toBeTruthy()
    // BUG 1: languageRowVisible = trimmedPromptLength >= 65, so 17 chars -> hidden.
    expect(row.classList.contains('is-hidden')).toBe(false)
  })

  it('language auto-detection runs for short prompts with explicit language keyword', async () => {
    const SHORT_EXPLICIT_PROMPT = 'gov site in hindi'
    expect(SHORT_EXPLICIT_PROMPT.length).toBeLessThan(
      PROMPT_LANG_DETECT_MIN_CHARS,
    )

    render(<HomePage />)
    const input = getPromptInput()
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: SHORT_EXPLICIT_PROMPT } })

    // Advance past the debounce window so the detection effect fires.
    await act(async () => {
      vi.advanceTimersByTime(PROMPT_LANG_DETECT_DEBOUNCE_MS + 50)
      await Promise.resolve()
    })

    const select = getLanguageSelect()
    expect(select).toBeTruthy()
    const optionValues = Array.from(select.options).map((opt) => opt.value)
    // BUG 2: detection effect returns early because currentPrompt.length < 65,
    // so Hindi never gets added to the dropdown options.
    expect(optionValues).toContain('hi')
  })

  it('language dropdown shows detected language immediately for explicit keyword prompts', async () => {
    const SHORT_EXPLICIT_PROMPT = 'build a gov site in hindi'
    expect(SHORT_EXPLICIT_PROMPT.length).toBeLessThan(
      PROMPT_LANG_DETECT_MIN_CHARS,
    )

    render(<HomePage />)
    const input = getPromptInput()
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: SHORT_EXPLICIT_PROMPT } })

    await act(async () => {
      vi.advanceTimersByTime(PROMPT_LANG_DETECT_DEBOUNCE_MS + 50)
      await Promise.resolve()
    })

    const select = getLanguageSelect()
    expect(select).toBeTruthy()
    // BUG 2 (same root cause): the min-chars gate blocks detection, so
    // preferredLanguage stays 'en' instead of being set to 'hi'.
    expect(select.value).toBe('hi')
  })

  it('language dropdown is hidden when prompt is empty', () => {
    render(<HomePage />)
    const row = getLanguageRow()
    expect(row).toBeTruthy()
    // Correct current behavior — this test should PASS.
    expect(row.classList.contains('is-hidden')).toBe(true)
  })

  it('language dropdown hides when prompt is cleared back to empty', () => {
    render(<HomePage />)
    const input = getPromptInput()
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'build a site' } })

    const row = getLanguageRow()
    expect(row.classList.contains('is-hidden')).toBe(false)

    // Clear the input back to empty — dropdown should hide again.
    fireEvent.change(input, { target: { value: '' } })
    expect(row.classList.contains('is-hidden')).toBe(true)
  })

  it('whitespace-only prompt keeps dropdown hidden', () => {
    render(<HomePage />)
    const input = getPromptInput()
    fireEvent.focus(input)
    // Whitespace-only prompt: trimmedPromptLength is 0, so dropdown stays hidden.
    fireEvent.change(input, { target: { value: '   ' } })

    const row = getLanguageRow()
    expect(row).toBeTruthy()
    expect(row.classList.contains('is-hidden')).toBe(true)
  })

  it('detection result is applied to the select element', async () => {
    render(<HomePage />)
    const input = getPromptInput()
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'build site in hindi' } })

    // Advance past the debounce window so the detection effect fires.
    await act(async () => {
      vi.advanceTimersByTime(PROMPT_LANG_DETECT_DEBOUNCE_MS + 50)
      await Promise.resolve()
    })

    const select = getLanguageSelect()
    expect(select).toBeTruthy()
    // Mock detector returns 'hi' for inputs containing "hindi"; the preferred
    // language should be applied to the select element's value.
    expect(select.value).toBe('hi')
  })
})
