import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import { useQuery } from '@ship-fast/blocks/runtime'
import { translateOnDevice } from './chrome-translator'

type Locale = string

const I18nContext = createContext<{ locale: Locale } | null>(null)

export function I18nProvider({
  children,
  locale = 'en',
}: {
  children: ReactNode
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

async function fetchTranslation(text: string, locale: string): Promise<string> {
  // Tier 1: on-device Chrome/Edge Translator (free, instant) for plain native
  // locales it supports. Returns null → fall through to the LLM.
  const onDevice = await translateOnDevice(text, locale)
  if (onDevice) return onDevice

  // Tier 2: Groq 70B LLM — handles everything the browser can't: unsupported
  // languages (gu, ml, …), non-Chromium browsers, and romanized / code-mixed
  // variants (xx-latn, hinglish, xx-en).
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text, locale }),
  })
  return res.ok ? ((await res.json())?.translation ?? text) : text
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

// Single text node translator - uses React Query, updates DOM when done
function TranslatedTextNode({
  text,
  locale,
  node,
}: {
  text: string
  locale: string
  node: Text
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['translate', text, locale],
    queryFn: () => fetchTranslation(text, locale),
    staleTime: Infinity,
  })

  useEffect(() => {
    if (isLoading) {
      // Add shimmer to parent
      const parent = node.parentElement
      if (parent) {
        parent.classList.add('sf-shimmer-loading')
        parent.style.backgroundImage = `linear-gradient(90deg, #0000 calc(50% - ${text.length * 2}px), currentColor 50%, #0000 calc(50% + ${text.length * 2}px)), linear-gradient(currentColor, currentColor)`
      }
    } else if (data) {
      // Remove shimmer (always remove when we have data, even if unchanged)
      applyTranslationResult(node.parentElement, node, data, text)
    }
  }, [data, isLoading, text, node])

  return null // This component only handles side effects
}

// T uses MutationObserver to find text nodes, React Query to translate them
export function T({ children }: React.PropsWithChildren) {
  const ref = useRef<HTMLDivElement>(null)
  const { locale } = useI18n()
  const processedRef = useRef(new WeakSet<Node>())
  const [pendingNodes, setPendingNodes] = React.useState<
    Array<{ node: Text; text: string; id: number }>
  >([])
  const idCounter = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el || locale === 'en') return

    const collectTextNodes = () => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      const nodes: Array<{ node: Text; text: string; id: number }> = []

      while (walker.nextNode()) {
        const node = walker.currentNode as Text
        const text = node.textContent?.trim()
        if (!text || processedRef.current.has(node)) continue
        processedRef.current.add(node)
        nodes.push({ node, text, id: idCounter.current++ })
      }

      if (nodes.length) {
        setPendingNodes((prev) => [...prev, ...nodes])
      }
    }

    collectTextNodes()

    let timer: ReturnType<typeof setTimeout>
    const obs = new MutationObserver(() => {
      clearTimeout(timer)
      timer = setTimeout(collectTextNodes, 50)
    })
    obs.observe(el, { childList: true, subtree: true })

    return () => {
      clearTimeout(timer)
      obs.disconnect()
    }
  }, [locale])

  return (
    <div ref={ref} style={{ display: 'contents' }}>
      {children}
      {pendingNodes.map(({ node, text, id }) => (
        <TranslatedTextNode key={id} text={text} locale={locale} node={node} />
      ))}
    </div>
  )
}
