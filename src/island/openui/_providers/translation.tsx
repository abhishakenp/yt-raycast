import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import { translateOnDevice } from './chrome-translator'

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

const setCachedTranslation = (
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
  const networkTexts: string[] = []
  const networkIndexes: number[] = []
  const browserTranslationEntries: Array<{
    text: string
    translation: string
  }> = []

  for (let index = 0; index < texts.length; index += 1) {
    const text = texts[index]
    const cached = getCachedTranslation(locale, text)
    if (cached !== null) {
      translations[index] = cached
      continue
    }

    // Tier 1: on-device Chrome/Edge Translator (free, instant) for plain native
    // locales it supports. Run sequentially to avoid a burst of browser jobs.
    const onDevice = await translateOnDevice(text, locale)
    if (onDevice) {
      translations[index] = onDevice
      setCachedTranslation(locale, text, onDevice)
      browserTranslationEntries.push({ text, translation: onDevice })
      continue
    }

    networkIndexes.push(index)
    networkTexts.push(text)
  }

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
      setCachedTranslation(locale, texts[originalIndex], translated)
    }
  })
  await persistTranslationEntries(locale, browserTranslationEntries)
  return translations
}

// Inject shimmer keyframes once
if (
  typeof document !== 'undefined' &&
  !document.getElementById('sf-shimmer-style')
) {
  const style = document.createElement('style')
  style.id = 'sf-shimmer-style'
  style.textContent = `
    @keyframes sf-shimmer { from { background-position: 100% center; } to { background-position: 0% center; } }
    .sf-shimmer-loading {
      display: inline-block;
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      background-size: 250% 100%;
      background-repeat: no-repeat;
      animation: sf-shimmer 2s linear infinite;
    }
  `
  document.head.appendChild(style)
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
    parent.classList.remove('sf-shimmer-loading')
    parent.style.backgroundImage = ''
    parent.style.backgroundClip = ''
    parent.style.webkitBackgroundClip = ''
    parent.style.color = ''
  }
  if (data !== text) {
    node.textContent = data
  }
}

const addTranslationShimmer = (node: Text, text: string): void => {
  const parent = node.parentElement
  if (!parent) return
  parent.classList.add('sf-shimmer-loading')
  parent.style.backgroundImage = `linear-gradient(90deg, #0000 calc(50% - ${text.length * 2}px), currentColor 50%, #0000 calc(50% + ${text.length * 2}px)), linear-gradient(currentColor, currentColor)`
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
          parent.classList.remove('sf-shimmer-loading')
          parent.style.backgroundImage = ''
          parent.style.backgroundClip = ''
          parent.style.webkitBackgroundClip = ''
          parent.style.color = ''
        }
        if (sourceText && node.textContent?.trim() !== sourceText) {
          node.textContent = sourceText
        }
        if (sourceText) {
          textStateRef.current.set(node, { originalText: sourceText })
        }
      }
    }

    if (locale === 'en') {
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
        const translations = await fetchTranslationBatch(
          batch.map((item) => item.text),
          locale,
        )
        if (!cancelled) {
          batch.forEach((item, index) => {
            const translated = translations[index] ?? item.text
            if (isInsideActiveTextEdit(item.node)) {
              const parent = item.node.parentElement
              if (parent) {
                parent.classList.remove('sf-shimmer-loading')
                parent.style.backgroundImage = ''
                parent.style.backgroundClip = ''
                parent.style.webkitBackgroundClip = ''
                parent.style.color = ''
              }
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

      while (walker.nextNode()) {
        const node = walker.currentNode as Text
        if (isInsideActiveTextEdit(node)) continue
        const text = sourceTextForNode(node)
        if (!text || processedRef.current.has(node)) continue
        processedRef.current.add(node)
        addTranslationShimmer(node, text)
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
