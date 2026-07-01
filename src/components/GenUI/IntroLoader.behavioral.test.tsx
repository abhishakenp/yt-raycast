// @vitest-environment jsdom
//
// Behavioral tests for the GenUI intro loader and its sub-components. These
// tests assert the EXPECTED, CORRECT observable behavior: phase status lines,
// progress wiring, logo animation staging, status cycling, audio playback,
// reduced-motion handling, the exit transition, and that each sub-component
// renders its expected visual structure. If any behavior regresses, the test
// MUST fail — these tests never pin buggy behavior.
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// cleanup() is called manually in afterEach because vitest globals are not
// enabled, so @testing-library/react's auto-cleanup hook does not register.

import { IntroLoader } from './IntroLoader'
import { IntroBeams } from './IntroBeams'
import { IntroPreviewFrame } from './IntroPreviewFrame'
import { IntroLogo } from './IntroLogo'
import { IntroTyping } from './IntroTyping'
import { IntroMediaChips } from './IntroMediaChips'

// ─── helpers ───────────────────────────────────────────────────────────────
const installMatchMedia = (matches: boolean) => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }),
  )
}

const installAudioMock = () => {
  const instances: Array<{
    src: string
    volume: number
    play: ReturnType<typeof vi.fn>
  }> = []
  // A real class is required because the component calls `new Audio(...)`;
  // an arrow-function mock implementation is not a valid constructor.
  class FakeAudio {
    src: string
    volume = 1
    play = vi.fn().mockResolvedValue(undefined)
    pause = vi.fn()
    load = vi.fn()
    constructor(src: string) {
      this.src = src
      instances.push(this)
    }
  }
  const AudioCtor = vi.fn()
  const AudioProxy = function Audio(this: unknown, src: string) {
    AudioCtor(src)
    return new FakeAudio(src)
  } as unknown as typeof Audio
  vi.stubGlobal('Audio', AudioProxy)
  return { AudioCtor, instances }
}

const STATUS_LINES = [
  'COMPOSING INTERFACE',
  'STREAMING LAYOUT',
  'ALIGNING VISUAL TOKENS',
  'MATERIALIZING COMPONENTS',
] as const

const logoContainer = (): HTMLElement => {
  const img = document.querySelector(
    'img[alt="Ship Fast Logo"]',
  ) as HTMLImageElement | null
  if (!img) throw new Error('logo image not found')
  return img.parentElement?.parentElement as HTMLElement
}

const overlayEl = (): HTMLElement => {
  const el = screen.getByRole('status')
  if (!el) throw new Error('intro overlay not found')
  return el as HTMLElement
}

const statusLineText = (): string | null => {
  const overlay = overlayEl()
  const candidates = Array.from(overlay.querySelectorAll('div'))
  const line = candidates.find((div) => {
    const t = div.textContent ?? ''
    return (STATUS_LINES as readonly string[]).includes(t) || t === '\u00a0'
  })
  return line ? line.textContent : null
}

// ─── tests ─────────────────────────────────────────────────────────────────
describe('IntroLoader behavioral', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Freeze Date so the autoProgress interval (which derives elapsed from
    // Date.now()) stays deterministic across timer advances.
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000)
    installMatchMedia(false)
    installAudioMock()
    // jsdom has no canvas 2d context; stub to avoid "Not implemented" noise.
    HTMLCanvasElement.prototype.getContext = vi
      .fn()
      .mockReturnValue(
        null,
      ) as unknown as typeof HTMLCanvasElement.prototype.getContext
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  // 13. Compose phase → "COMPOSING INTERFACE" visible
  it('shows the COMPOSING INTERFACE status line during the compose phase', async () => {
    render(<IntroLoader phase="compose" playSound={false} />)

    // Expected: phaseVisible flips true at the logo settle timeout (1800ms)
    // and the first status line ("COMPOSING INTERFACE") is shown.
    await vi.advanceTimersByTimeAsync(1800)
    expect(statusLineText()).toBe('COMPOSING INTERFACE')
  })

  // 14. Restore phase → different status visible
  it('shows a different status line during the restore phase after cycling', async () => {
    render(<IntroLoader phase="restore" playSound={false} />)

    // Expected: after phaseVisible (1800ms) + one 2800ms status-cycle tick,
    // the status advances to the second line ("STREAMING LAYOUT"), which is
    // distinct from the compose-phase first line.
    await vi.advanceTimersByTimeAsync(1800)
    await vi.advanceTimersByTimeAsync(2800)
    expect(statusLineText()).toBe('STREAMING LAYOUT')
    expect(statusLineText()).not.toBe('COMPOSING INTERFACE')
  })

  // 15. Progress → progress bar updates
  it('reflects manual progress in the --intro-progress style variable', () => {
    render(<IntroLoader progress={0.5} playSound={false} />)

    // Expected: effectiveProgress = max(progress, autoProgress); with a frozen
    // autoProgress of 0.16, a manual 0.5 wins and is exposed via the CSS var
    // that drives the progress bar / frame transform.
    expect(overlayEl().style.getPropertyValue('--intro-progress')).toBe('0.5')
  })

  // 16. Logo animation: hidden → visible → shaking → settled
  it('animates the logo through hidden, visible, shaking and settled states', async () => {
    render(<IntroLoader playSound={false} />)

    // Expected: after the mount effect the logo starts hidden (no opacity-100).
    expect(logoContainer().className).not.toContain('opacity-100')

    // A 0ms advance after each threshold flushes the React state update
    // scheduled by the timer callback (vitest faked timers + React 19 need an
    // extra microtask tick to commit the re-render to the DOM).
    await vi.advanceTimersByTimeAsync(200) // → visible
    await vi.advanceTimersByTimeAsync(0)
    expect(logoContainer().className).toContain('opacity-100')
    expect(logoContainer().className).not.toContain('animate-pulse')

    await vi.advanceTimersByTimeAsync(601) // → shaking (801ms total)
    await vi.advanceTimersByTimeAsync(0)
    expect(logoContainer().className).toContain('animate-pulse')

    await vi.advanceTimersByTimeAsync(1000) // → settled (1801ms total)
    await vi.advanceTimersByTimeAsync(0)
    expect(logoContainer().className).toContain('scale-[1.1]')
  })

  // 17. Status lines cycle over time
  it('cycles through multiple status lines over time', async () => {
    render(<IntroLoader playSound={false} />)

    // Expected: status lines cycle every 2800ms once phaseVisible is true.
    await vi.advanceTimersByTimeAsync(1800)
    expect(statusLineText()).toBe('COMPOSING INTERFACE')

    await vi.advanceTimersByTimeAsync(2800)
    expect(statusLineText()).toBe('STREAMING LAYOUT')

    await vi.advanceTimersByTimeAsync(2800)
    expect(statusLineText()).toBe('ALIGNING VISUAL TOKENS')
  })

  // 18. Audio: launch.mp3 played
  it('plays the launch.mp3 sound on mount', () => {
    const { AudioCtor, instances } = installAudioMock()
    render(<IntroLoader playSound={true} />)

    // Expected: on mount the loader constructs an Audio element pointing at
    // /assets/launch.mp3 and calls play().
    expect(AudioCtor).toHaveBeenCalledWith('/assets/launch.mp3')
    expect(instances.length).toBeGreaterThanOrEqual(1)
    expect(instances[0].play).toHaveBeenCalled()
  })

  // 19. Reduced motion → animations skipped
  it('skips the staged logo animation when prefers-reduced-motion is set', () => {
    installMatchMedia(true)
    render(<IntroLoader playSound={false} />)

    // Expected: with reduced motion the logo jumps straight to 'visible' with
    // no shaking/settling stages, and the status line is visible immediately.
    const logo = logoContainer()
    expect(logo.className).toContain('opacity-100')
    expect(logo.className).not.toContain('animate-pulse')
    expect(logo.className).not.toContain('scale-[1.1]')
    expect(statusLineText()).toBe('COMPOSING INTERFACE')
  })

  // 20. Exit transition on completion
  it('triggers the exit transition when progress reaches completion', () => {
    render(<IntroLoader progress={1} playSound={false} />)

    // Expected: when effectiveProgress reaches 1 the overlay gains the
    // is-exiting + opacity-0 classes and aria-busy flips to false.
    const overlay = overlayEl()
    expect(overlay.className).toContain('is-exiting')
    expect(overlay.className).toContain('opacity-0')
    expect(overlay.getAttribute('aria-busy')).toBe('false')
  })

  // 21. IntroBeams render
  it('renders three pulsing gradient beams', () => {
    const { container } = render(<IntroBeams />)
    // Expected: IntroBeams renders exactly three absolutely-positioned spans
    // with a pulse animation and a gradient background.
    const beams = container.querySelectorAll('span.animate-pulse')
    expect(beams.length).toBe(3)
    beams.forEach((beam) => {
      expect(beam.className).toContain('linear-gradient')
      expect(beam.className).toContain('animate-pulse')
    })
  })

  // 22. IntroPreviewFrame renders
  it('renders a skeleton preview frame with a gradient surface', () => {
    const { container } = render(<IntroPreviewFrame />)
    // Expected: IntroPreviewFrame renders a rounded skeleton frame whose
    // surface uses a gradient background.
    const frame = container.querySelector('.rounded-\\[26px\\]')
    expect(frame).not.toBeNull()
    expect((frame as HTMLElement).className).toContain('linear-gradient')
  })

  // 23. IntroLogo renders with animation
  it('renders the logo image and SHIP FAST text with opacity transition', () => {
    render(<IntroLogo logoClass="visible" />)
    // Expected: IntroLogo renders the logo image plus the "SHIP FAST" wordmark,
    // and the visible state applies opacity-100 with a transition hook.
    const img = screen.getByAltText('Ship Fast Logo')
    expect(img).toBeTruthy()
    const span = screen.getByText('SHIP FAST')
    const container = span.parentElement as HTMLElement
    expect(container.className).toContain('opacity-100')
    expect(container.className).toContain('transition')
  })

  // 24. IntroTyping cycles messages
  it('types out messages and cycles to the next message over time', async () => {
    const { container } = render(<IntroTyping />)

    // Expected: IntroTyping renders a blinking cursor (animate-pulse span)
    // whose parent holds the typed text + cursor.
    const cursor = container.querySelector('span.animate-pulse')
    expect(cursor).not.toBeNull()
    const typedSpan = (cursor as HTMLElement).parentElement as HTMLElement
    expect(typedSpan.textContent).toMatch(/\|$/)

    // IntroTyping chains setTimeout(type, 50) where each tick depends on the
    // previous state update + effect re-run. Step 50ms at a time with a 0ms
    // flush so each char commits to the DOM (faked-timer + React 19 quirk).
    const typeOneChar = async () => {
      await vi.advanceTimersByTimeAsync(50)
      await vi.advanceTimersByTimeAsync(0)
    }

    // Expected: the first typed characters spell the start of message 0.
    await typeOneChar()
    expect(typedSpan.textContent).toBe('I|')

    await typeOneChar()
    await typeOneChar()
    await typeOneChar()
    expect(typedSpan.textContent).toBe('Igni|')

    // Expected: after typing + deleting message 0, the animation cycles to
    // message 1 ("Calibrating warp drive..."). Each char needs its own 50ms
    // step + flush, so loop until message 1 appears (bounded to avoid an
    // infinite loop if the animation were broken).
    let text = typedSpan.textContent ?? ''
    for (let i = 0; i < 300 && !text.includes('Calibrating'); i++) {
      await typeOneChar()
      text = typedSpan.textContent ?? ''
    }
    expect(text).toContain('Calibrating')
  })

  // 25. IntroMediaChips render
  it('renders four floating media chips with positioned style variables', () => {
    const { container } = render(<IntroMediaChips />)
    // Expected: IntroMediaChips renders exactly four floating chips, each with
    // positioned --chip-x/--chip-y CSS variables and a "Pexels" label.
    const chips = container.querySelectorAll('div.animate-pulse')
    expect(chips.length).toBe(4)
    chips.forEach((chip) => {
      const el = chip as HTMLElement
      expect(el.style.getPropertyValue('--chip-x')).not.toBe('')
      expect(el.style.getPropertyValue('--chip-y')).not.toBe('')
      expect(el.textContent).toContain('Pexels')
    })
  })
})
