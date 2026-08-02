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
 * `detectSnippetLanguageBcp47` is mocked to return 'hi' for any input
 * containing "hindi".
 */

const mocks = vi.hoisted(() => ({
  submitPrompt: vi.fn(),
  selectExamplePromptSpy: vi.fn(),
  refreshShareBonusStatus: vi.fn(),
  claimShareBonus: vi.fn(),
  detectSnippetLanguageBcp47: vi.fn().mockResolvedValue(null),
  scheduleSpeculativeGeneration: vi.fn(),
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
  useIsAdmin: () => false,
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
        scheduleSpeculativeGeneration: mocks.scheduleSpeculativeGeneration,
        examplePrompts: [] as unknown[],
        submitButtonLabel: 'Start generating',
      }
    },
  }
})

const ORIGINAL_FETCH = globalThis.fetch

const getPromptInput = () =>
  document.getElementById('prompt-input') as HTMLTextAreaElement

const getLanguageRow = () =>
  document.getElementById('prompt-language-row') as HTMLDivElement

// The language control is a custom dropdown (button + listbox), not a native
// <select>. The current value is carried by a hidden input (#prompt-language)
// for form submission; the choices render as listbox options once opened.
const getLanguageValue = () =>
  (document.getElementById('prompt-language') as HTMLInputElement).value

const getLanguageTrigger = () =>
  document.querySelector('.prompt-language-select') as HTMLButtonElement

const openLanguageMenu = () => {
  const trigger = getLanguageTrigger()
  if (trigger.getAttribute('aria-expanded') !== 'true') {
    fireEvent.click(trigger)
  }
}

const getLanguageOptionCodes = () => {
  openLanguageMenu()
  return Array.from(document.querySelectorAll('.prompt-language-option')).map(
    (el) => el.getAttribute('data-language-code'),
  )
}

const selectLanguageOption = (code: string) => {
  openLanguageMenu()
  const option = document.querySelector(
    `.prompt-language-option[data-language-code="${code}"]`,
  ) as HTMLButtonElement | null
  if (!option) throw new Error(`No language option for "${code}"`)
  fireEvent.click(option)
}

describe('HomePage — language detection for short explicit-keyword prompts', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mocks.submitPrompt.mockReset()
    mocks.selectExamplePromptSpy.mockReset()
    mocks.scheduleSpeculativeGeneration.mockReset()
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

  it('does not fire speculative generation (disabled — too expensive)', () => {
    render(<HomePage />)
    const input = getPromptInput()

    fireEvent.change(input, {
      target: { value: 'Build a fast customer onboarding website' },
    })

    // Speculative generation is intentionally disabled at the HomePage call
    // site. The hook implementation remains intact for future re-enablement.
    expect(mocks.scheduleSpeculativeGeneration).not.toHaveBeenCalled()
  })

  it('does not render or request typeahead completions while typing', () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ claimed: false }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    )
    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch

    render(<HomePage />)
    const input = getPromptInput()
    fireEvent.focus(input)
    fireEvent.change(input, {
      target: { value: 'Build a polished AI studio homepage' },
    })

    act(() => {
      vi.advanceTimersByTime(1_000)
    })

    expect(document.querySelector('[role="listbox"]')).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
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

    const optionValues = getLanguageOptionCodes()
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

    // BUG 2 (same root cause): the min-chars gate blocks detection, so
    // preferredLanguage stays 'en' instead of being set to 'hi'.
    expect(getLanguageValue()).toBe('hi')
  })

  it('user can switch the language when the dropdown has more than one choice', async () => {
    // The exact reported bug: auto-detect picks a non-English language, giving
    // two choices, and the user cannot switch back to English. With the custom
    // dropdown the pick must apply and stick.
    render(<HomePage />)
    const input = getPromptInput()
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'build a gov site in hindi' } })
    await act(async () => {
      vi.advanceTimersByTime(PROMPT_LANG_DETECT_DEBOUNCE_MS + 50)
      await Promise.resolve()
    })

    // Detection settled on Hindi -> two choices are available.
    expect(getLanguageValue()).toBe('hi')
    expect(getLanguageOptionCodes()).toEqual(
      expect.arrayContaining(['en', 'hi']),
    )

    // User picks English from the open menu.
    selectLanguageOption('en')
    expect(getLanguageValue()).toBe('en')
  })

  it('manual language selection is not overwritten by a pending auto-detect', async () => {
    // Repro: user types, auto-detect settles on a language, user then keeps
    // typing (queuing a fresh detect) and manually picks English from the
    // dropdown. The in-flight detect must NOT clobber the manual choice.
    render(<HomePage />)
    const input = getPromptInput()
    fireEvent.focus(input)

    // Phase A: settle detection on Hindi so the dropdown exposes both options.
    fireEvent.change(input, { target: { value: 'build a gov site in hindi' } })
    await act(async () => {
      vi.advanceTimersByTime(PROMPT_LANG_DETECT_DEBOUNCE_MS + 50)
      await Promise.resolve()
    })
    expect(getLanguageValue()).toBe('hi')

    // Phase B: keep typing -> a new detect is scheduled. Make it deferred so
    // it is still in flight when the user changes the dropdown.
    let resolveDetect: (value: string | null) => void = () => {}
    mocks.detectSnippetLanguageBcp47.mockImplementationOnce(
      () =>
        new Promise<string | null>((resolve) => {
          resolveDetect = resolve
        }),
    )
    fireEvent.change(input, {
      target: { value: 'build a gov site in hindi please' },
    })
    await act(async () => {
      vi.advanceTimersByTime(PROMPT_LANG_DETECT_DEBOUNCE_MS + 50)
      await Promise.resolve()
    })

    // User manually switches to English while detection is pending.
    selectLanguageOption('en')
    expect(getLanguageValue()).toBe('en')

    // The stale in-flight detection now resolves to Hindi — it must be ignored.
    await act(async () => {
      resolveDetect('hi')
      await Promise.resolve()
    })
    expect(getLanguageValue()).toBe('en')
  })

  it('keeps a manual language choice when the user types more (sticky override)', async () => {
    // The reported bug: pick English, type anything, and it snaps back to the
    // detected language. A manual choice must survive later keystrokes.
    render(<HomePage />)
    const input = getPromptInput()
    fireEvent.focus(input)

    fireEvent.change(input, { target: { value: 'build a gov site in hindi' } })
    await act(async () => {
      vi.advanceTimersByTime(PROMPT_LANG_DETECT_DEBOUNCE_MS + 50)
      await Promise.resolve()
    })
    expect(getLanguageValue()).toBe('hi')

    // User overrides to English.
    selectLanguageOption('en')
    expect(getLanguageValue()).toBe('en')

    // User keeps typing — the prompt still detects Hindi, but the manual
    // English choice must stick.
    fireEvent.change(input, {
      target: { value: 'build a bigger gov site in hindi with a contact form' },
    })
    await act(async () => {
      vi.advanceTimersByTime(PROMPT_LANG_DETECT_DEBOUNCE_MS + 50)
      await Promise.resolve()
    })
    expect(getLanguageValue()).toBe('en')

    // Hindi is still offered so the user can switch back if they want.
    expect(getLanguageOptionCodes()).toEqual(
      expect.arrayContaining(['en', 'hi']),
    )
  })

  it('resumes auto-detect after the prompt is cleared', async () => {
    render(<HomePage />)
    const input = getPromptInput()
    fireEvent.focus(input)

    fireEvent.change(input, { target: { value: 'build a gov site in hindi' } })
    await act(async () => {
      vi.advanceTimersByTime(PROMPT_LANG_DETECT_DEBOUNCE_MS + 50)
      await Promise.resolve()
    })
    selectLanguageOption('en')
    expect(getLanguageValue()).toBe('en')

    // Clear the prompt — the manual override resets.
    fireEvent.change(input, { target: { value: '' } })
    // Type a fresh Hindi prompt — auto-detect should apply again.
    fireEvent.change(input, { target: { value: 'ek naya hindi site banao' } })
    await act(async () => {
      vi.advanceTimersByTime(PROMPT_LANG_DETECT_DEBOUNCE_MS + 50)
      await Promise.resolve()
    })
    expect(getLanguageValue()).toBe('hi')
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

    // Mock detector returns 'hi' for inputs containing "hindi"; the preferred
    // language should be applied to the control's value.
    expect(getLanguageValue()).toBe('hi')
  })
})
