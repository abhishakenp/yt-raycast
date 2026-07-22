// @vitest-environment jsdom
import type { ReactNode } from 'react'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { HomePage } from './HomePage'

/**
 * Behavioral tests for HomePage secondary features.
 *
 * The real HomePage component is rendered so its internal state transitions
 * (designRefOpen, engineVersion, privateModalOpen, placeholder cycling,
 * language-row visibility, share-panel visibility, etc.) are exercised for
 * real. usePromptHomeController is mocked with a hoisted mutable object so
 * tests can control prompt, errorMessage, isSubmitting, canSubmit, and
 * shareBonusClaimed between renders (via `rerender`).
 */

const controller = vi.hoisted(() => ({
  prompt: '',
  errorMessage: undefined as string | undefined,
  isSubmitting: false,
  canSubmit: false,
  shareBonusClaimed: false,
  claimShareBonus: vi.fn(),
  refreshShareBonusStatus: vi.fn(),
  scheduleSpeculativeGeneration: vi.fn(),
  submitPrompt: vi.fn(),
  selectExamplePrompt: vi.fn(),
  setPrompt: vi.fn(),
}))

const mocks = vi.hoisted(() => ({
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
  Link: ({ children, to }: { children?: ReactNode; to?: string }) => (
    <a href={typeof to === 'string' ? to : '#'}>{children}</a>
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

vi.mock('@/features/home/hooks/usePromptHomeController', () => ({
  usePromptHomeController: () => ({ ...controller }),
}))

const ORIGINAL_FETCH = globalThis.fetch

const fetchMock = vi.fn(
  async () =>
    new Response(JSON.stringify({ claimed: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
)

/**
 * Captured before any fake timers are installed so the footer-year assertion
 * compares against the real current year, not the mocked clock.
 */
const REAL_YEAR = new Date().getFullYear()

/**
 * A prompt >= PROMPT_LANG_DETECT_MIN_CHARS (65) containing the "hinglish"
 * keyword so the (mocked) language detector can resolve to "hinglish", which
 * drives a non-default submit CTA label and logo tagline.
 */
const HINGLISH_PROMPT =
  'Build a hinglish website for my local gym with membership plans and class schedules for fitness enthusiasts'

describe('HomePage — secondary features', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch
    fetchMock.mockClear()

    controller.prompt = ''
    controller.errorMessage = undefined
    controller.isSubmitting = false
    controller.canSubmit = false
    controller.shareBonusClaimed = false
    controller.claimShareBonus.mockReset()
    controller.refreshShareBonusStatus.mockReset()
    controller.submitPrompt.mockReset()
    controller.selectExamplePrompt.mockReset()
    controller.setPrompt.mockReset()
    mocks.detectSnippetLanguageBcp47.mockReset().mockResolvedValue(null)

    // jsdom lacks requestAnimationFrame / matchMedia; provide no-op shims.
    if (typeof window.requestAnimationFrame !== 'function') {
      window.requestAnimationFrame = ((cb: (time: number) => void) =>
        window.setTimeout(
          () => cb(Date.now()),
          0,
        )) as unknown as typeof window.requestAnimationFrame
      window.cancelAnimationFrame = ((handle) =>
        window.clearTimeout(handle)) as typeof window.cancelAnimationFrame
    }
    if (!window.matchMedia) {
      window.matchMedia = ((query: unknown) => ({
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

  it('design reference toggle shows #design-ref-panel when checked, hides when unchecked', () => {
    render(<HomePage />)
    const toggle = document.getElementById(
      'design-ref-toggle',
    ) as HTMLInputElement
    const panel = document.getElementById('design-ref-panel') as HTMLDivElement

    expect(panel.classList.contains('hidden')).toBe(true)
    expect(toggle.checked).toBe(false)

    fireEvent.click(toggle)
    expect(toggle.checked).toBe(true)
    expect(panel.classList.contains('hidden')).toBe(false)
    expect(panel.classList.contains('grid')).toBe(true)

    fireEvent.click(toggle)
    expect(toggle.checked).toBe(false)
    expect(panel.classList.contains('hidden')).toBe(true)
  })

  it('engine toggle group switches between v1/v2/v3 (aria-pressed flips)', () => {
    render(<HomePage />)
    const group = document.querySelector(
      '[role="group"][aria-label="Engine version"]',
    ) as HTMLElement
    const buttons = Array.from(
      group.querySelectorAll('button'),
    ) as HTMLButtonElement[]

    // 3 buttons: v1, v2, v3
    expect(buttons).toHaveLength(3)

    // v1 is active by default
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true')
    expect(buttons[1].getAttribute('aria-pressed')).toBe('false')
    expect(buttons[2].getAttribute('aria-pressed')).toBe('false')

    // Click v2
    fireEvent.click(buttons[1])
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true')
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false')

    // Click v3
    fireEvent.click(buttons[2])
    expect(buttons[2].getAttribute('aria-pressed')).toBe('true')
    expect(buttons[1].getAttribute('aria-pressed')).toBe('false')

    // Click v1 again
    fireEvent.click(buttons[0])
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true')
    expect(buttons[2].getAttribute('aria-pressed')).toBe('false')
  })

  it('private generation checkbox opens PrivateGenerationModal, Escape closes it', () => {
    render(<HomePage />)
    const checkbox = document.getElementById(
      'private-gen-checkbox',
    ) as HTMLInputElement
    const modal = document.getElementById('private-gen-modal') as HTMLDivElement

    // Modal is hidden initially (only the base "hidden" class, no "flex").
    expect(modal.classList.contains('flex')).toBe(false)
    expect(modal.getAttribute('aria-hidden')).toBe('true')

    // Clicking the checkbox opens the modal (and resets the checkbox).
    fireEvent.click(checkbox)
    const modalOpen = document.getElementById(
      'private-gen-modal',
    ) as HTMLDivElement
    expect(modalOpen.classList.contains('flex')).toBe(true)
    expect(modalOpen.getAttribute('aria-hidden')).toBe('false')

    // Escape closes the modal via the window keydown listener.
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    const modalClosed = document.getElementById(
      'private-gen-modal',
    ) as HTMLDivElement
    expect(modalClosed.classList.contains('flex')).toBe(false)
    expect(modalClosed.getAttribute('aria-hidden')).toBe('true')
  })

  it('share bonus panel visible when errorMessage includes "quota exhausted", hidden when no error', () => {
    controller.errorMessage = 'Your quota exhausted for today'
    controller.shareBonusClaimed = false
    const { rerender } = render(<HomePage />)

    const panel = document.getElementById('share-bonus-panel') as HTMLDivElement
    expect(panel.classList.contains('flex')).toBe(true)
    expect(panel.classList.contains('hidden')).toBe(false)
    expect(controller.refreshShareBonusStatus).toHaveBeenCalled()

    // Clearing the error message hides the panel.
    controller.errorMessage = undefined
    rerender(<HomePage />)

    const panelHidden = document.getElementById(
      'share-bonus-panel',
    ) as HTMLDivElement
    expect(panelHidden.classList.contains('flex')).toBe(false)
    expect(panelHidden.classList.contains('hidden')).toBe(true)
  })

  it('#prompt-policy-block is hidden when no errorMessage, visible with text when set', () => {
    controller.errorMessage = undefined
    const { rerender } = render(<HomePage />)

    const block = document.getElementById(
      'prompt-policy-block',
    ) as HTMLDivElement
    expect(block.classList.contains('hidden')).toBe(true)
    expect(block.hasAttribute('hidden')).toBe(true)

    controller.errorMessage = 'Something went wrong'
    rerender(<HomePage />)

    const blockVisible = document.getElementById(
      'prompt-policy-block',
    ) as HTMLDivElement
    expect(blockVisible.classList.contains('hidden')).toBe(false)
    expect(blockVisible.hasAttribute('hidden')).toBe(false)
    expect(blockVisible.textContent).toContain('Something went wrong')
  })

  it('submit button is disabled when canSubmit=false and shows spinner when isSubmitting=true', () => {
    controller.canSubmit = false
    controller.isSubmitting = false
    const { rerender } = render(<HomePage />)

    const submit = document.getElementById('submit-btn') as HTMLButtonElement
    expect(submit.disabled).toBe(true)
    const spinner = submit.querySelector('.animate-spin') as HTMLDivElement
    expect(spinner.classList.contains('block')).toBe(false)

    // Enable submission + submitting state: button enabled, spinner visible.
    controller.canSubmit = true
    controller.isSubmitting = true
    rerender(<HomePage />)

    const submitAfter = document.getElementById(
      'submit-btn',
    ) as HTMLButtonElement
    expect(submitAfter.disabled).toBe(false)
    const spinnerAfter = submitAfter.querySelector(
      '.animate-spin',
    ) as HTMLDivElement
    expect(spinnerAfter.classList.contains('block')).toBe(true)
  })

  it('submit CTA label changes when language row is visible vs hidden', async () => {
    // Hidden language row → default label.
    controller.prompt = ''
    const { rerender } = render(<HomePage />)
    const label = document.querySelector('.btn-label') as HTMLSpanElement
    expect(label.textContent).toBe('Generate')

    // Long Hinglish prompt → language row visible → detection resolves
    // "hinglish" → CTA label becomes the localized verb.
    controller.prompt = HINGLISH_PROMPT
    mocks.detectSnippetLanguageBcp47.mockResolvedValue('hinglish')
    rerender(<HomePage />)

    // Before the debounce fires, preferredLanguage is still "en".
    const labelPreDetect = document.querySelector(
      '.btn-label',
    ) as HTMLSpanElement
    expect(labelPreDetect.textContent).toBe('Generate')

    // Advance past PROMPT_LANG_DETECT_DEBOUNCE_MS so detection runs.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })

    const labelAfter = document.querySelector('.btn-label') as HTMLSpanElement
    expect(labelAfter.textContent).toBe('बनाओ')
  })

  it('logo tagline appears when language row is visible, empty when not', async () => {
    controller.prompt = ''
    const { rerender } = render(<HomePage />)
    const tagline = document.getElementById(
      'logo-tagline',
    ) as HTMLParagraphElement
    expect(tagline.textContent).toBe('')

    controller.prompt = HINGLISH_PROMPT
    mocks.detectSnippetLanguageBcp47.mockResolvedValue('hinglish')
    rerender(<HomePage />)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })

    const taglineAfter = document.getElementById(
      'logo-tagline',
    ) as HTMLParagraphElement
    expect(taglineAfter.textContent).toBe('तेज़ शिप')
  })

  it('placeholder text cycles through sample placeholders when prompt is empty (fake timers)', () => {
    controller.prompt = ''
    render(<HomePage />)

    const getPlaceholderText = () =>
      document.getElementById('prompt-placeholder-text') as HTMLSpanElement

    // Initially the visible placeholder is empty (length 0).
    expect(getPlaceholderText().textContent).toBe('')

    // Helper: advance one 34ms typing tick and flush React so the chained
    // effect re-runs and schedules the next timeout.
    const tick = (ms: number) =>
      act(() => {
        vi.advanceTimersByTime(ms)
      })

    // After one tick, the first character of placeholder 0 is typed.
    tick(34)
    expect(getPlaceholderText().textContent).toBe('A')

    // Typing continues into placeholder 0 ("A cinematic travel …").
    for (let i = 0; i < 11; i++) tick(34)
    expect(getPlaceholderText().textContent).toMatch(/^A cinematic/)

    // Type the remainder of placeholder 0 (90 chars total) with a few extra
    // no-op ticks while the 1800ms pause timer is still pending.
    for (let i = 0; i < 85; i++) tick(34)

    // Fire the 1800ms pause timer → cycle to placeholder 1 (length resets).
    tick(1800)

    // Type the start of placeholder 1 ("A polished SaaS homepage …").
    for (let i = 0; i < 12; i++) tick(34)
    expect(getPlaceholderText().textContent).toMatch(/^A polished/)
  })

  it('footer year matches the current year', () => {
    render(<HomePage />)
    const footer = document.querySelector('footer')
    expect(footer).toBeTruthy()
    expect(footer!.textContent).toContain(`SHIP FAST © ${REAL_YEAR}`)
  })
})
