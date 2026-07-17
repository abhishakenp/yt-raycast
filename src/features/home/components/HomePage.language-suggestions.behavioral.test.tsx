// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  PROMPT_LANG_DETECT_DEBOUNCE_MS,
  PROMPT_LANG_DETECT_MIN_CHARS,
} from '@/lib/home/constants'

import { HomePage } from './HomePage'

/**
 * Behavioral tests for the HomePage language dropdown + prompt suggestions flow.
 *
 * Only external deps are mocked (Convex, fetch, router, Clerk, auth). The real
 * HomePage component is rendered so its internal state transitions
 * (languageRowVisible, promptSuggestionsOpen, promptSuggestActive, etc.) are
 * exercised for real. usePromptHomeController is mocked with a backing
 * React useState so setPrompt updates drive real re-renders and the derived
 * `languageRowVisible` boolean recomputes inside HomePage.
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
  ConvexReactClient: class {
    constructor() {}
  },
}))

vi.mock('@/features/gallery/components/PublicGallery', () => ({
  HomeGallerySection: () => null,
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

const getSuggestionsContainer = () =>
  document.getElementById('prompt-suggestions') as HTMLDivElement

const getSuggestionItems = () =>
  Array.from(
    document.querySelectorAll<HTMLLIElement>(
      '#prompt-suggestions-list li[role="option"]',
    ),
  )

const getActiveSuggestionIndex = () => {
  const items = getSuggestionItems()
  return items.findIndex((item) => item.classList.contains('is-active'))
}

const getSubmitButton = () =>
  document.getElementById('submit-btn') as HTMLButtonElement

const getPromptForm = () =>
  document.getElementById('prompt-form') as HTMLFormElement

/**
 * A prompt long enough to cross PROMPT_LANG_DETECT_MIN_CHARS so the language
 * row becomes visible via the real derived `languageRowVisible` boolean.
 */
const LONG_PROMPT =
  'Build a polished SaaS marketing dashboard for a remote team productivity platform with charts and cards.'

const SHORT_PROMPT = 'Build a blog'

describe('HomePage — language dropdown + prompt suggestions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch
    fetchMock.mockClear()
    mocks.submitPrompt.mockReset()
    mocks.selectExamplePromptSpy.mockReset()
    mocks.detectSnippetLanguageBcp47.mockReset().mockResolvedValue(null)
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

  it('language dropdown is hidden when prompt is empty', () => {
    render(<HomePage />)
    const row = getLanguageRow()
    expect(row).toBeTruthy()
    expect(row.classList.contains('is-hidden')).toBe(true)
  })

  it('language dropdown is visible when prompt has enough chars (>= PROMPT_LANG_DETECT_MIN_CHARS)', () => {
    render(<HomePage />)
    const input = getPromptInput()
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: LONG_PROMPT } })

    const row = getLanguageRow()
    expect(row.classList.contains('is-hidden')).toBe(false)
    expect(LONG_PROMPT.trim().length).toBeGreaterThanOrEqual(
      PROMPT_LANG_DETECT_MIN_CHARS,
    )
  })

  it('language dropdown is visible when a prompt suggestion is accepted (typing path AND suggestion-acceptance path both work)', () => {
    render(<HomePage />)
    const input = getPromptInput()

    // Typing a short partial shows the row (any content makes it visible).
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: SHORT_PROMPT } })
    expect(getLanguageRow().classList.contains('is-hidden')).toBe(false)

    // Suggestions appear from the local builder (synchronous in effect).
    const items = getSuggestionItems()
    expect(items.length).toBeGreaterThan(0)

    // Accepting a suggestion sets the full (long) suggestion text as the
    // prompt, which must keep languageRowVisible true.
    fireEvent.mouseDown(items[0])

    const acceptedPrompt = (input.value ?? '').trim()
    expect(acceptedPrompt.length).toBeGreaterThan(0)
    expect(getLanguageRow().classList.contains('is-hidden')).toBe(false)
  })

  it('prompt suggestions list appears when typing + focused, disappears on blur', () => {
    render(<HomePage />)
    const input = getPromptInput()
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: SHORT_PROMPT } })

    const container = getSuggestionsContainer()
    expect(container.hasAttribute('hidden')).toBe(false)
    expect(container.classList.contains('is-open')).toBe(true)
    expect(getSuggestionItems().length).toBeGreaterThan(0)

    // Blur schedules a 120ms timeout before closing. Use the native blur()
    // method so jsdom updates document.activeElement (fireEvent.blur only
    // dispatches the event without moving focus, which would let the
    // suggestions effect's active-element fallback reopen the list).
    act(() => {
      input.blur()
    })
    act(() => {
      vi.advanceTimersByTime(130)
    })

    expect(getSuggestionsContainer().hasAttribute('hidden')).toBe(true)
    expect(getSuggestionItems().length).toBe(0)
  })

  it('prompt suggestions close on Escape key', () => {
    render(<HomePage />)
    const input = getPromptInput()
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: SHORT_PROMPT } })
    expect(getSuggestionsContainer().hasAttribute('hidden')).toBe(false)

    fireEvent.keyDown(input, { key: 'Escape' })

    expect(getSuggestionsContainer().hasAttribute('hidden')).toBe(true)
    expect(getSuggestionItems().length).toBe(0)
  })

  it('ArrowDown/ArrowUp cycles the active suggestion', () => {
    render(<HomePage />)
    const input = getPromptInput()
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: SHORT_PROMPT } })

    const count = getSuggestionItems().length
    expect(count).toBeGreaterThan(1)
    expect(getActiveSuggestionIndex()).toBe(0)

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(getActiveSuggestionIndex()).toBe(1)

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(getActiveSuggestionIndex()).toBe(2)

    // ArrowUp moves back up.
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(getActiveSuggestionIndex()).toBe(1)

    // ArrowUp back to index 0.
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(getActiveSuggestionIndex()).toBe(0)

    // ArrowUp at index 0 wraps to the last suggestion.
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(getActiveSuggestionIndex()).toBe(count - 1)

    // ArrowDown at the last index wraps back to 0.
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(getActiveSuggestionIndex()).toBe(0)
  })

  it('Enter accepts the active suggestion and closes the list', () => {
    render(<HomePage />)
    const input = getPromptInput()
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: SHORT_PROMPT } })

    const items = getSuggestionItems()
    expect(items.length).toBeGreaterThan(1)

    // Move to the second suggestion, then accept with Enter.
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(getActiveSuggestionIndex()).toBe(1)
    const accepted = items[1].textContent ?? ''

    fireEvent.keyDown(input, { key: 'Enter' })

    // Acceptance: the prompt value is set to the active suggestion.
    expect(input.value).toBe(accepted)
    // Intended contract: accepting a suggestion closes the list. The
    // component calls closePromptSuggestions() inside applyPromptSuggestion,
    // so this encodes the expected UX. If this assertion fails, the
    // suggestions effect is reopening the list after the setPrompt that
    // follows an explicit accept — a product regression to fix (the
    // closePromptSuggestions() intent is being defeated).
    expect(getSuggestionsContainer().hasAttribute('hidden')).toBe(true)
    expect(getSuggestionItems().length).toBe(0)
  })

  it('Tab accepts the active suggestion and closes the list', () => {
    render(<HomePage />)
    const input = getPromptInput()
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: SHORT_PROMPT } })

    const items = getSuggestionItems()
    expect(items.length).toBeGreaterThan(0)
    const accepted = items[0].textContent ?? ''

    fireEvent.keyDown(input, { key: 'Tab' })

    // Acceptance: the prompt value is set to the active suggestion.
    expect(input.value).toBe(accepted)
    // Intended contract: accepting a suggestion closes the list (see the
    // Enter test note — a failure here indicates the suggestions effect
    // reopens the list after an explicit accept).
    expect(getSuggestionsContainer().hasAttribute('hidden')).toBe(true)
  })

  it('suggestion acceptance sets the prompt value in the textarea', () => {
    render(<HomePage />)
    const input = getPromptInput()
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: SHORT_PROMPT } })

    const items = getSuggestionItems()
    expect(items.length).toBeGreaterThan(0)
    const expected = items[0].textContent ?? ''

    fireEvent.mouseDown(items[0])

    expect(input.value).toBe(expected)
  })

  it('submit button is disabled when prompt is empty, enabled when prompt has content', () => {
    render(<HomePage />)
    const submit = getSubmitButton()
    expect(submit.disabled).toBe(true)

    const input = getPromptInput()
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'A short but real prompt' } })

    expect(getSubmitButton().disabled).toBe(false)
  })

  it('example chip click sets the prompt and triggers submit', () => {
    render(<HomePage />)
    const chips = screen
      .getAllByRole('button')
      .filter((btn) => btn.hasAttribute('data-prompt'))
    expect(chips.length).toBeGreaterThan(0)

    const chip = chips[0]
    const expectedPrompt = chip.getAttribute('data-prompt') ?? ''

    fireEvent.click(chip)

    expect(mocks.selectExamplePromptSpy).toHaveBeenCalledWith(expectedPrompt)
    expect(mocks.submitPrompt).toHaveBeenCalledTimes(1)
    const callArg = mocks.submitPrompt.mock.calls[0]?.[0] as {
      prompt?: string
      engineVersion?: string
    }
    expect(callArg.prompt).toBe(expectedPrompt)
    expect(getPromptInput().value).toBe(expectedPrompt)
  })

  it('Enter without suggestions open submits the form', () => {
    render(<HomePage />)
    const input = getPromptInput()
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: LONG_PROMPT } })

    // No suggestions open (long prompt still produces local suggestions, but
    // pressing Enter while the list is open accepts a suggestion instead).
    // Close the list first so Enter triggers form submit.
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(getSuggestionsContainer().hasAttribute('hidden')).toBe(true)

    const form = document.getElementById('prompt-form') as HTMLFormElement
    const submitSpy = vi.fn()
    form.requestSubmit = submitSpy

    fireEvent.keyDown(input, { key: 'Enter' })
    expect(submitSpy).toHaveBeenCalled()
  })

  it('submits the rendered form with language, engine, and filtered design references', async () => {
    mocks.detectSnippetLanguageBcp47.mockResolvedValue('es')
    render(<HomePage />)

    const input = getPromptInput()
    fireEvent.focus(input)
    fireEvent.change(input, {
      target: {
        value:
          'Build a Mexican restaurant website with online ordering and event catering',
      },
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(PROMPT_LANG_DETECT_DEBOUNCE_MS + 50)
    })

    const select = document.getElementById(
      'prompt-language',
    ) as HTMLSelectElement
    expect(select.value).toBe('es')

    const engineGroup = document.querySelector(
      '[role="group"][aria-label="Engine version"]',
    ) as HTMLElement
    fireEvent.click(engineGroup.querySelectorAll('button')[2])

    fireEvent.click(document.getElementById('design-ref-toggle')!)
    fireEvent.change(document.getElementById('design-ref-search')!, {
      target: { value: 'https://example.com/menu' },
    })
    ;(document.getElementById('design-ref-url-1') as HTMLInputElement).value =
      'http://insecure.example.com'
    ;(document.getElementById('design-ref-url-2') as HTMLInputElement).value =
      'https://example.com/menu'
    ;(document.getElementById('design-ref-notes') as HTMLInputElement).value =
      ' Use the menu density, not the branding. '

    fireEvent.submit(getPromptForm())

    expect(mocks.submitPrompt).toHaveBeenCalledTimes(1)
    expect(mocks.submitPrompt).toHaveBeenCalledWith({
      prompt:
        'Build a Mexican restaurant website with online ordering and event catering',
      preferredLanguage: 'es',
      isPrivate: false,
      designReferenceUrls: ['https://example.com/menu'],
      designReferenceNotes: 'Use the menu density, not the branding.',
      cloneUrl: 'https://example.com/menu',
      engineVersion: 'v3',
    })
  })

  it('fetches remote prompt suggestions after the debounce window', async () => {
    render(<HomePage />)
    const input = getPromptInput()
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: SHORT_PROMPT } })

    fetchMock.mockClear()

    // Advance past PROMPT_SUGGEST_DEBOUNCE_MS so the debounced fetch fires.
    // The fetch call itself happens synchronously inside the timer callback
    // (before the first await), so it is observable immediately after
    // advancing. async act flushes the surrounding microtasks.
    await act(async () => {
      vi.advanceTimersByTime(400)
      await Promise.resolve()
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ]
    expect(url).toBe('/api/prompt-suggestions')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string).partial).toBe(SHORT_PROMPT)
  })
})
