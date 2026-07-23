// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PROMPT_LANG_DETECT_DEBOUNCE_MS } from '@/lib/home/constants'

import { usePromptLanguage } from './usePromptLanguage'

// Mock the detector: 'hi' for anything containing "hindi", 'fr' for "french",
// otherwise 'en'. Keeps the hook's model under test independent of franc.
const detectMock = vi.hoisted(() => vi.fn())
vi.mock('@/lib/home/prompt-language-core', () => ({
  detectSnippetLanguageBcp47: detectMock,
}))

const flushDetect = async () => {
  await act(async () => {
    vi.advanceTimersByTime(PROMPT_LANG_DETECT_DEBOUNCE_MS + 50)
    await Promise.resolve()
    await Promise.resolve()
  })
}

const optionCodes = (result: { current: { languageOptions: unknown } }) =>
  (
    result.current.languageOptions as ReadonlyArray<readonly [string, string]>
  ).map(([code]) => code)

describe('usePromptLanguage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    detectMock.mockReset().mockImplementation(async (text: string) => {
      const lower = String(text).toLowerCase()
      if (lower.includes('hindi')) return 'hi'
      if (lower.includes('french') || lower.includes('francais')) return 'fr'
      return 'en'
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    window.localStorage.clear()
  })

  it('auto-detects the language from the prompt', async () => {
    const { result, rerender } = renderHook(
      (prompt: string) => usePromptLanguage(prompt),
      {
        initialProps: 'build a hindi site',
      },
    )
    await flushDetect()
    expect(result.current.preferredLanguage).toBe('hi')
    expect(optionCodes(result)).toEqual(expect.arrayContaining(['en', 'hi']))
    rerender('build a hindi site')
  })

  it('keeps a manual choice sticky across later prompt edits', async () => {
    const { result, rerender } = renderHook(
      (prompt: string) => usePromptLanguage(prompt),
      {
        initialProps: 'build a hindi site',
      },
    )
    await flushDetect()
    expect(result.current.preferredLanguage).toBe('hi')

    act(() => result.current.selectLanguage('en'))
    expect(result.current.preferredLanguage).toBe('en')

    // Keep typing — still detects Hindi, but the manual pick must hold.
    rerender('build a much bigger hindi site with a contact form')
    await flushDetect()
    expect(result.current.preferredLanguage).toBe('en')
    // Detected language is still offered as a switchable option.
    expect(optionCodes(result)).toEqual(expect.arrayContaining(['en', 'hi']))
  })

  it('does not let an in-flight detect overwrite a manual pick made mid-flight', async () => {
    let resolveDetect: (value: string | null) => void = () => {}
    const { result, rerender } = renderHook(
      (prompt: string) => usePromptLanguage(prompt),
      {
        initialProps: 'build a hindi site',
      },
    )
    await flushDetect()

    detectMock.mockImplementationOnce(
      () => new Promise((resolve) => (resolveDetect = resolve)),
    )
    rerender('build a hindi site now')
    await act(async () => {
      vi.advanceTimersByTime(PROMPT_LANG_DETECT_DEBOUNCE_MS + 50)
      await Promise.resolve()
    })

    act(() => result.current.selectLanguage('en'))
    expect(result.current.preferredLanguage).toBe('en')

    await act(async () => {
      resolveDetect('hi')
      await Promise.resolve()
    })
    expect(result.current.preferredLanguage).toBe('en')
  })

  it('resets the manual override and re-detects when the prompt is cleared', async () => {
    const { result, rerender } = renderHook(
      (prompt: string) => usePromptLanguage(prompt),
      {
        initialProps: 'build a hindi site',
      },
    )
    await flushDetect()
    act(() => result.current.selectLanguage('en'))
    expect(result.current.preferredLanguage).toBe('en')

    act(() => rerender(''))
    expect(result.current.languageRowVisible).toBe(false)
    expect(result.current.preferredLanguage).toBe('en')

    rerender('ek naya hindi site')
    await flushDetect()
    expect(result.current.preferredLanguage).toBe('hi')
  })

  it('re-detects a changed language while no manual override is set', async () => {
    const { result, rerender } = renderHook(
      (prompt: string) => usePromptLanguage(prompt),
      {
        initialProps: 'build a hindi site',
      },
    )
    await flushDetect()
    expect(result.current.preferredLanguage).toBe('hi')

    rerender('creer un site french')
    await flushDetect()
    expect(result.current.preferredLanguage).toBe('fr')
    expect(optionCodes(result)).toEqual(expect.arrayContaining(['en', 'fr']))
  })

  it('bumps languageChangeTick when the effective language changes', async () => {
    const { result, rerender } = renderHook(
      (prompt: string) => usePromptLanguage(prompt),
      {
        initialProps: 'build a hindi site',
      },
    )
    await flushDetect()
    const afterDetect = result.current.languageChangeTick
    expect(afterDetect).toBeGreaterThan(0)

    act(() => result.current.selectLanguage('en'))
    expect(result.current.languageChangeTick).toBeGreaterThan(afterDetect)
    rerender('build a hindi site')
  })
})
