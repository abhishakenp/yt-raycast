import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  PROMPT_LANG_DETECT_DEBOUNCE_MS,
  PROMPT_LANG_DETECT_SNIPPET_MAX,
  PREFERRED_LANGUAGE_KEY,
} from '@/lib/home/constants'
import {
  getLanguageDisplayName,
  normalizeLanguageCode,
} from '@/lib/home/prompt-language-labels'

export const HOME_LANGUAGE_OPTIONS = [
  ['en', 'English'],
  ['hinglish', 'Hinglish'],
  ['hi-latn', 'Hindi (Roman)'],
  ['ta-en', 'Tamil + English'],
  ['hi', 'हिंदी'],
  ['bn', 'বাংলা'],
  ['mr', 'मराठी'],
  ['ta', 'தமிழ்'],
  ['te', 'తెలుగు'],
  ['gu', 'ગુજરાતી'],
  ['kn', 'ಕನ್ನಡ'],
  ['ml', 'മലയാളം'],
  ['pa', 'ਪੰਜਾਬੀ'],
] as const

type LanguageOption = readonly [string, string]

const languageOptionName = (code: string): string =>
  HOME_LANGUAGE_OPTIONS.find(([optionCode]) => optionCode === code)?.[1] ??
  getLanguageDisplayName(code)

const persistPreferredLanguage = (language: string): void => {
  if (typeof window === 'undefined') return
  const normalized = normalizeLanguageCode(language)
  if (!normalized) return
  window.localStorage.setItem(PREFERRED_LANGUAGE_KEY, normalized)
}

/**
 * Options shown in the language dropdown.
 *
 * Always offers English plus the auto-detected language and the current
 * selection, so the user can freely toggle between them. Keeping the detected
 * language present (even after a manual pick) means a user who picked English
 * can still switch back to what we detected — and vice versa — without the list
 * collapsing to a single dead choice.
 */
const buildLanguageOptions = (
  detected: string,
  preferred: string,
): LanguageOption[] => {
  const seen = new Set<string>()
  const options: LanguageOption[] = []
  for (const raw of ['en', detected, preferred]) {
    const code = normalizeLanguageCode(raw) || 'en'
    if (seen.has(code)) continue
    seen.add(code)
    options.push([code, languageOptionName(code)])
  }
  return options
}

export interface UsePromptLanguageResult {
  preferredLanguage: string
  languageOptions: LanguageOption[]
  languageRowVisible: boolean
  /** True once auto-detect produced a language change worth acknowledging. */
  languageChangeTick: number
  selectLanguage: (value: string) => void
}

/**
 * Owns the homepage prompt-language model.
 *
 * Rules:
 *  - Empty prompt → reset to English, auto-detect re-enabled.
 *  - While the user has NOT manually chosen, a debounced auto-detect sets the
 *    preferred language from the prompt text.
 *  - The moment the user picks from the dropdown, that choice is STICKY: later
 *    keystrokes keep re-detecting (so the option list stays useful) but never
 *    override the manual selection. Clearing the prompt resets the override.
 */
export const usePromptLanguage = (prompt: string): UsePromptLanguageResult => {
  const trimmed = prompt.trim()
  const languageRowVisible = trimmed.length > 0

  const [detectedLanguage, setDetectedLanguage] = useState('en')
  const [preferredLanguage, setPreferredLanguage] = useState('en')
  const [languageChangeTick, setLanguageChangeTick] = useState(0)

  const manuallyChosenRef = useRef(false)
  const detectTokenRef = useRef(0)

  // Reset everything when the prompt is cleared back to empty.
  useEffect(() => {
    if (languageRowVisible) return
    detectTokenRef.current += 1
    manuallyChosenRef.current = false
    setDetectedLanguage('en')
    setPreferredLanguage((current) => {
      if (current !== 'en') persistPreferredLanguage('en')
      return 'en'
    })
  }, [languageRowVisible])

  // Debounced auto-detect from the prompt text.
  useEffect(() => {
    if (!languageRowVisible) return
    const runToken = ++detectTokenRef.current
    const timeout = window.setTimeout(() => {
      void (async () => {
        const text = prompt.trim()
        if (!text) return
        const { detectSnippetLanguageBcp47 } =
          await import('@/lib/home/prompt-language-core')
        const detected = await detectSnippetLanguageBcp47(
          text.slice(0, PROMPT_LANG_DETECT_SNIPPET_MAX),
        )
        if (runToken !== detectTokenRef.current) return
        if (!prompt.trim()) return
        const language = detected || 'en'
        setDetectedLanguage(language)
        // Auto-detect only drives the selection until the user overrides it.
        if (manuallyChosenRef.current) return
        setPreferredLanguage((current) => {
          if (current !== language) {
            persistPreferredLanguage(language)
            setLanguageChangeTick((tick) => tick + 1)
          }
          return language
        })
      })()
    }, PROMPT_LANG_DETECT_DEBOUNCE_MS)
    return () => window.clearTimeout(timeout)
  }, [prompt, languageRowVisible])

  const selectLanguage = useCallback((value: string) => {
    const normalized = normalizeLanguageCode(value) || 'en'
    // Invalidate any in-flight auto-detect so it can't clobber the manual pick.
    detectTokenRef.current += 1
    manuallyChosenRef.current = true
    setPreferredLanguage((current) => {
      if (current !== normalized) {
        persistPreferredLanguage(normalized)
        setLanguageChangeTick((tick) => tick + 1)
      }
      return normalized
    })
  }, [])

  const languageOptions = useMemo(
    () => buildLanguageOptions(detectedLanguage, preferredLanguage),
    [detectedLanguage, preferredLanguage],
  )

  return {
    preferredLanguage,
    languageOptions,
    languageRowVisible,
    languageChangeTick,
    selectLanguage,
  }
}
