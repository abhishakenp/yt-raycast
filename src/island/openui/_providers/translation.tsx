import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import { isTranslatableLocale } from '@/config/languages'
import { shouldPreserveNativeLocaleText } from '@/features/localization/native-script'
import { translateOnDeviceBatch } from './chrome-translator'

type Locale = string

const I18nContext = createContext<{ locale: Locale } | null>(null)

export function I18nProvider({
  children,
  locale = 'en',
}: {
  children?: ReactNode
  locale?: Locale
}) {
  return (
    <I18nContext.Provider value={{ locale }}>{children}</I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider')
  return ctx
}

const memoryTranslationCache = new Map<string, string>()
const MAX_BROWSER_TRANSLATION_BATCH_TEXTS = 20
const MAX_BROWSER_TRANSLATION_BATCH_CHARS = 1800
const MAX_SIMULTANEOUS_SHIMMER_NODES = 24

const translationCacheKey = (locale: string, text: string): string =>
  `${locale.trim().toLowerCase()}\n${text.trim()}`

const getCachedTranslation = (locale: string, text: string): string | null => {
  const key = translationCacheKey(locale, text)
  const memory = memoryTranslationCache.get(key)
  if (memory !== undefined) return memory
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(`sf-translation:${key}`)
    if (stored !== null) {
      memoryTranslationCache.set(key, stored)
      return stored
    }
  } catch {
    return null
  }
  return null
}

export const setCachedTranslation = (
  locale: string,
  text: string,
  translation: string,
): void => {
  const key = translationCacheKey(locale, text)
  memoryTranslationCache.set(key, translation)
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(`sf-translation:${key}`, translation)
  } catch {
    // Best-effort browser cache; server-side Convex cache remains authoritative.
  }
}

const persistTranslationEntries = async (
  locale: string,
  entries: Array<{ text: string; translation: string }>,
): Promise<void> => {
  const changedEntries = entries.filter(
    (entry) =>
      entry.text.trim() &&
      entry.translation.trim() &&
      entry.text !== entry.translation,
  )
  if (changedEntries.length === 0) return
  await fetch('/api/translate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ locale, entries: changedEntries }),
  }).catch(() => undefined)
}

export async function fetchTranslationBatch(
  texts: string[],
  locale: string,
): Promise<string[]> {
  const translations = [...texts]
  const browserTexts: string[] = []
  const browserIndexes: number[] = []
  const browserTranslationEntries: Array<{
    text: string
    translation: string
  }> = []

  for (let index = 0; index < texts.length; index += 1) {
    const text = texts[index]
    if (shouldPreserveNativeLocaleText(text, locale)) {
      translations[index] = text
      continue
    }

    const cached = getCachedTranslation(locale, text)
    if (cached !== null) {
      translations[index] = cached
      continue
    }

    browserIndexes.push(index)
    browserTexts.push(text)
  }

  if (browserTexts.length > 0) {
    const browserBatch =
      browserTexts.length <= MAX_BROWSER_TRANSLATION_BATCH_TEXTS &&
      browserTexts.reduce((total, text) => total + text.length, 0) <=
        MAX_BROWSER_TRANSLATION_BATCH_CHARS
        ? await translateOnDeviceBatch(browserTexts, locale)
        : null
    browserIndexes.forEach((originalIndex, offset) => {
      const translated = browserBatch?.[offset]
      if (typeof translated === 'string' && translated.trim()) {
        translations[originalIndex] = translated
        // A no-op result (identical to the source) is not proof of a
        // successful translation — it may be a degraded/fallback response.
        // Caching it would permanently block retries for this text+locale.
        if (translated !== texts[originalIndex]) {
          setCachedTranslation(locale, texts[originalIndex], translated)
        }
        browserTranslationEntries.push({
          text: texts[originalIndex],
          translation: translated,
        })
      }
    })
  }

  const networkIndexes = browserIndexes.filter(
    (originalIndex) => translations[originalIndex] === texts[originalIndex],
  )
  const networkTexts = networkIndexes.map(
    (originalIndex) => texts[originalIndex],
  )

  if (networkTexts.length === 0) {
    await persistTranslationEntries(locale, browserTranslationEntries)
    return translations
  }

  // Tier 2: one batched Groq-backed request. The server checks Convex cache
  // first and only calls the model once for uncached misses.
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ texts: networkTexts, locale }),
  })
  if (!res.ok) return translations

  const data = (await res.json()) as { translations?: unknown }
  const batch = Array.isArray(data.translations) ? data.translations : []
  networkIndexes.forEach((originalIndex, offset) => {
    const translated = batch[offset]
    if (typeof translated === 'string' && translated.trim()) {
      translations[originalIndex] = translated
      // Same no-op guard as the on-device path above: a degraded response
      // that echoes the source text must not poison the cache permanently.
      if (translated !== texts[originalIndex]) {
        setCachedTranslation(locale, texts[originalIndex], translated)
      }
    }
  })
  await persistTranslationEntries(locale, browserTranslationEntries)
  return translations
}

// Inject the shadcn shimmer utility once for preview frames that do not inherit
// the app-level Tailwind bundle.
if (
  typeof document !== 'undefined' &&
  !document.getElementById('sf-shimmer-style')
) {
  const style = document.createElement('style')
  style.id = 'sf-shimmer-style'
  style.textContent = `
    @property --shimmer-angle {
      syntax: "<angle>";
      inherits: true;
      initial-value: 20deg;
    }
    @property --shimmer-image {
      syntax: "*";
      inherits: false;
    }
    @property --shimmer-text-fill {
      syntax: "*";
      inherits: false;
    }

    @keyframes tw-shimmer {
      from {
        background-position: 100% 0;
      }
      to {
        background-position: 0 0;
      }
    }

    .shimmer {
      --_spread: var(--shimmer-spread, calc(3ch + 40px));
      --_base: currentColor;
      --_highlight: var(
        --shimmer-color,
        oklch(from currentColor l c h / calc(alpha* 0.2))
      );

      background-image: var(
        --shimmer-image,
        linear-gradient(
          calc(90deg + var(--shimmer-angle)),
          var(--_base) calc(50% - var(--_spread)),
          color-mix(in oklch, var(--_highlight), var(--_base) 50%)
            calc(50% - var(--_spread) * 0.5),
          var(--_highlight) 50%,
          color-mix(in oklch, var(--_highlight), var(--_base) 50%)
            calc(50% + var(--_spread) * 0.5),
          var(--_base) calc(50% + var(--_spread))
        )
      );
      background-repeat: no-repeat;
      background-size: calc(200% + var(--_spread) * 2) 100%;
      background-position: 0 0;
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: var(--shimmer-text-fill, transparent);
      animation: tw-shimmer var(--shimmer-duration, 2s) linear infinite;
    }

    .dark .shimmer {
      --_highlight: var(
        --shimmer-color,
        oklch(from currentColor max(0.8, calc(l + 0.4)) c h / calc(alpha + 0.4))
      );
    }

    .shimmer:where([dir="rtl"], [dir="rtl"] *) {
      animation-direction: reverse;
    }

    .shimmer-none {
      --shimmer-image: none;
      --shimmer-text-fill: currentColor;
    }

    @media (prefers-reduced-motion: reduce) {
      .shimmer {
        animation: none;
        background-image: none;
        -webkit-text-fill-color: currentColor;
      }
    }
  `
  document.head.appendChild(style)
}

const shimmerTemporaryClasses = new WeakMap<HTMLElement, string[]>()

const addTemporaryShimmerClass = (
  element: HTMLElement,
  className: string,
): void => {
  if (element.classList.contains(className)) return
  element.classList.add(className)
  const current = shimmerTemporaryClasses.get(element) ?? []
  current.push(className)
  shimmerTemporaryClasses.set(element, current)
}

/**
 * Apply a completed translation to its text node: always clear the shimmer
 * styling (even when the translation equals the original text — the original
 * bug kept shimmer active in that case, hiding the text), and only overwrite
 * `textContent` when the translation actually changed. Exported for behavioral
 * testing of the shimmer-removal contract.
 */
export function applyTranslationResult(
  parent: HTMLElement | null,
  node: Text,
  data: string,
  text: string,
): void {
  if (parent) {
    const temporaryClasses = shimmerTemporaryClasses.get(parent) ?? []
    for (const className of temporaryClasses) {
      parent.classList.remove(className)
    }
    shimmerTemporaryClasses.delete(parent)
    parent.style.backgroundImage = ''
    parent.style.backgroundClip = ''
    parent.style.webkitBackgroundClip = ''
    parent.style.color = ''
  }
  if (data !== text) {
    node.textContent = data
  }
}

const addTranslationShimmer = (node: Text): void => {
  const parent = node.parentElement
  if (!parent) return
  addTemporaryShimmerClass(parent, 'shimmer')
  addTemporaryShimmerClass(parent, 'text-muted-foreground')
  parent.style.color = ''
  parent.style.backgroundClip = ''
  parent.style.webkitBackgroundClip = ''
  parent.style.backgroundImage = ''
}

type TextTranslationState = {
  originalText: string
  translatedLocale?: string
  translatedText?: string
}

const ACTIVE_TEXT_EDIT_SELECTOR =
  '[data-ship-fast-inline-editing="true"], [contenteditable="true"], [contenteditable="plaintext-only"]'

const isInsideActiveTextEdit = (node: Node): boolean => {
  const parent =
    node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement
  return Boolean(parent?.closest(ACTIVE_TEXT_EDIT_SELECTOR))
}

// T uses MutationObserver to find text nodes, then translates them in one
// serialized batch per collection window.
export function T({ children }: React.PropsWithChildren) {
  const ref = useRef<HTMLDivElement>(null)
  const { locale } = useI18n()
  const processedRef = useRef(new WeakSet<Node>())
  const textStateRef = useRef(new WeakMap<Text, TextTranslationState>())
  const queueRef = useRef<Array<{ node: Text; text: string }>>([])
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inFlightRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    processedRef.current = new WeakSet<Node>()
    queueRef.current = []

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const sourceTextForNode = (node: Text): string => {
      const current = node.textContent?.trim() ?? ''
      const state = textStateRef.current.get(node)
      if (state?.translatedText && current === state.translatedText) {
        return state.originalText
      }
      if (current) {
        textStateRef.current.set(node, { originalText: current })
      }
      return current
    }

    const restoreOriginalTextNodes = () => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      while (walker.nextNode()) {
        const node = walker.currentNode as Text
        const sourceText = sourceTextForNode(node)
        const parent = node.parentElement
        if (parent) {
          applyTranslationResult(parent, node, sourceText, sourceText)
        }
        if (sourceText && node.textContent?.trim() !== sourceText) {
          node.textContent = sourceText
        }
        if (sourceText) {
          textStateRef.current.set(node, { originalText: sourceText })
        }
      }
    }

    // Mirrors the server-side gate in isTranslatableLocale — locales like
    // "english" (an AI-resolved custom-language code for users who typed
    // "English") must skip the whole translate pipeline the same as the
    // literal "en" sentinel, not just fail fast once the request lands.
    if (!isTranslatableLocale(locale)) {
      restoreOriginalTextNodes()
      return
    }

    const scheduleFlush = () => {
      if (flushTimerRef.current !== null) return
      flushTimerRef.current = setTimeout(() => {
        flushTimerRef.current = null
        void flushTranslations()
      }, 0)
    }

    const flushTranslations = async () => {
      if (inFlightRef.current || cancelled) return
      const batch = queueRef.current.splice(0)
      if (batch.length === 0) return

      inFlightRef.current = true
      try {
        let translations: string[]
        try {
          translations = await fetchTranslationBatch(
            batch.map((item) => item.text),
            locale,
          )
        } catch {
          translations = batch.map((item) => item.text)
        }
        if (!cancelled) {
          batch.forEach((item, index) => {
            const translated = translations[index] ?? item.text
            if (isInsideActiveTextEdit(item.node)) {
              applyTranslationResult(
                item.node.parentElement,
                item.node,
                item.node.textContent ?? item.text,
                item.node.textContent ?? item.text,
              )
              textStateRef.current.set(item.node, {
                originalText: item.node.textContent?.trim() || item.text,
              })
              return
            }
            applyTranslationResult(
              item.node.parentElement,
              item.node,
              translated,
              item.text,
            )
            textStateRef.current.set(item.node, {
              originalText: item.text,
              translatedLocale: locale,
              translatedText: translated,
            })
          })
        }
      } finally {
        inFlightRef.current = false
        if (!cancelled && queueRef.current.length > 0) scheduleFlush()
      }
    }

    const collectTextNodes = () => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      const nodes: Array<{ node: Text; text: string }> = []
      let shimmeredNodes = 0

      while (walker.nextNode()) {
        const node = walker.currentNode as Text
        if (isInsideActiveTextEdit(node)) continue
        const text = sourceTextForNode(node)
        if (!text || processedRef.current.has(node)) continue
        processedRef.current.add(node)
        if (shimmeredNodes < MAX_SIMULTANEOUS_SHIMMER_NODES) {
          addTranslationShimmer(node)
          shimmeredNodes += 1
        }
        nodes.push({ node, text })
      }

      if (nodes.length) {
        queueRef.current.push(...nodes)
        scheduleFlush()
      }
    }

    collectTextNodes()

    const obs = new MutationObserver(() => {
      if (timer !== undefined) clearTimeout(timer)
      timer = setTimeout(collectTextNodes, 50)
    })
    obs.observe(el, { childList: true, subtree: true })

    return () => {
      cancelled = true
      if (timer !== undefined) clearTimeout(timer)
      if (flushTimerRef.current !== null) {
        clearTimeout(flushTimerRef.current)
        flushTimerRef.current = null
      }
      obs.disconnect()
    }
  }, [locale])

  return (
    <div ref={ref} style={{ display: 'contents' }}>
      {children}
    </div>
  )
}
