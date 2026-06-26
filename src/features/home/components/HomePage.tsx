import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent,
} from 'react'

import { LaunchBackdrop } from '@/components/launch-backdrop'
import { usePromptHomeController } from '@/features/home/hooks/usePromptHomeController'
import {
  buildLocalPromptSuggestions,
  getPromptSuggestionCacheKey,
  sanitizePromptSuggestions,
} from '@/features/home/services/prompt-suggestions'
import {
  PROMPT_LANG_DETECT_DEBOUNCE_MS,
  PROMPT_LANG_DETECT_MIN_CHARS,
  PROMPT_LANG_DETECT_SNIPPET_MAX,
  PROMPT_SUGGEST_DEBOUNCE_MS,
  PROMPT_SUGGEST_MAX_SHOW,
  PROMPT_SUGGEST_MIN_CHARS,
  PREFERRED_LANGUAGE_KEY,
  SUBMIT_BTN_DEFAULT_LABEL,
} from '@/lib/home/constants'
import {
  getGenerateCtaLabel,
  getLanguageDisplayName,
  getLogoTaglineText,
  normalizeLanguageCode,
} from '@/lib/home/prompt-language-labels'
import { cn } from '@/lib/utils'
import { isClerkClientEnabled } from '@/shared/auth/clerk-runtime'
import { GlassDefs, GlassPillAnchor, GlassPillButton } from './GlassPill'
import { CloseIcon, LogoMark, SearchIcon, ZapIcon } from './HomeIcons'
import { PrivateGenerationModal } from './PrivateGenerationModal'
import { handleShareClick, ShareBonusPanel } from './ShareBonusPanel'
import { WaitlistGate } from './WaitlistGate'

const LANGUAGE_OPTIONS = [
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

const DEFAULT_LANGUAGE_OPTION = LANGUAGE_OPTIONS[0]
const DEFAULT_LANGUAGE_OPTIONS = [DEFAULT_LANGUAGE_OPTION]

const EXAMPLE_CHIPS = [
  [
    'Image studio',
    'This app is going to be an image generation studio using various AI models to turn a prompt into images. Design a polished interactive product experience. It should be dark mode. Focus on making it beautiful.',
  ],
  [
    'Pet wellness',
    'Build a bold landing page for a premium pet wellness app with a booking section and customer testimonials.',
  ],
  [
    'SaaS dashboard',
    'Create a clean SaaS marketing dashboard for a remote team productivity platform with charts and responsive cards.',
  ],
  [
    'Hindi gym site',
    'Mere local gym ke liye ek powerful modern website banao with membership plans',
  ],
] as const

const SAMPLE_PLACEHOLDERS = [
  'A cinematic travel landing page for curated weekend escapes with reviews and fast booking.',
  'A polished SaaS homepage for an AI sales copilot with pipeline analytics and clear pricing.',
  'A premium architecture studio site with immersive case studies, awards, and inquiry scheduling.',
  'A bold ecommerce homepage for handcrafted coffee gear with bundles and subscriptions.',
] as const

const isClerkConfigured = isClerkClientEnabled()
const HOME_GALLERY_IDLE_DELAY_MS = 1800
const HOME_GALLERY_IDLE_TIMEOUT_MS = 2500

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout?: number },
  ) => number
  cancelIdleCallback?: (handle: number) => void
}

const LazyHomeGallerySection = lazy(() =>
  import('@/features/gallery/components/PublicGallery').then((module) => ({
    default: module.HomeGallerySection,
  })),
)
const LazyHomepageAuthControls = lazy(() =>
  import('@/components/HomepageAuthControls').then((module) => ({
    default: module.HomepageAuthControls,
  })),
)

export { GlassDefs, GlassPillAnchor, GlassPillButton } from './GlassPill'

const TopActions = () => {
  const [authRequested, setAuthRequested] = useState(false)

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 top-0 z-[210] flex items-center justify-start gap-2 bg-transparent px-6 py-4"
      aria-label="Primary"
    >
      <div className="pointer-events-auto ml-auto flex items-center gap-2">
        <GlassPillAnchor
          className="pill--top-actions min-h-9 px-4 py-0 font-sans text-[13px] font-medium text-[#f0f0f5] [&>span:last-child]:gap-1.5"
          href="/pricing"
        >
          Pricing
        </GlassPillAnchor>
        {isClerkConfigured ? (
          <Suspense
            fallback={
              <GlassPillButton
                className="pill--top-actions min-h-9 px-4 py-0 font-sans text-[13px] font-medium text-[#f0f0f5] [&>span:last-child]:gap-1.5"
                onClick={() => setAuthRequested(true)}
              >
                Sign in
              </GlassPillButton>
            }
          >
            <LazyHomepageAuthControls autoOpen={authRequested} />
          </Suspense>
        ) : null}
      </div>
    </nav>
  )
}

const getLanguageOptionName = (code: string) =>
  LANGUAGE_OPTIONS.find(([optionCode]) => optionCode === code)?.[1] ??
  getLanguageDisplayName(code)

const buildFocusedLanguageOptions = (selectedLanguage: string) => {
  const normalized = normalizeLanguageCode(selectedLanguage) || 'en'
  if (!normalized || normalized === 'en') return DEFAULT_LANGUAGE_OPTIONS
  const selected = [normalized, getLanguageOptionName(normalized)] as const
  return [DEFAULT_LANGUAGE_OPTION, selected]
}

const persistPreferredLanguage = (language: string) => {
  if (typeof window === 'undefined') return
  const normalized = normalizeLanguageCode(language)
  if (!normalized) return
  window.localStorage.setItem(PREFERRED_LANGUAGE_KEY, normalized)
}

const collectDesignReferenceUrls = (formData: FormData): string[] => {
  const candidates = [
    formData.get('design-ref-url-1'),
    formData.get('design-ref-url-2'),
    formData.get('design-ref-search'),
  ]

  return Array.from(
    new Set(
      candidates
        .map((value) => String(value ?? '').trim())
        .filter((value) => {
          try {
            return new URL(value).protocol === 'https:'
          } catch {
            return false
          }
        }),
    ),
  ).slice(0, 4)
}

const DeferredHomeGallerySection = () => {
  const [isGalleryReady, setIsGalleryReady] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isGalleryReady || typeof window === 'undefined') return

    const idleWindow = window as IdleWindow
    let cancelled = false
    let observer: IntersectionObserver | undefined
    let delayHandle: number | undefined
    let idleHandle: number | undefined
    let idleHandleUsesIdleCallback = false

    const activateGallery = () => {
      if (cancelled) return
      setIsGalleryReady(true)
    }

    const isPromptActive = () =>
      document.activeElement instanceof HTMLElement &&
      document.activeElement.id === 'prompt-input'

    const scheduleDelayedIdleActivation = () => {
      if (cancelled) return
      delayHandle = window.setTimeout(
        scheduleIdleActivation,
        HOME_GALLERY_IDLE_DELAY_MS,
      )
    }

    const activateGalleryFromIdle = () => {
      if (isPromptActive()) {
        scheduleDelayedIdleActivation()
        return
      }

      activateGallery()
    }

    const scheduleIdleActivation = () => {
      if (cancelled) return
      if (idleWindow.requestIdleCallback) {
        idleHandleUsesIdleCallback = true
        idleHandle = idleWindow.requestIdleCallback(activateGalleryFromIdle, {
          timeout: HOME_GALLERY_IDLE_TIMEOUT_MS,
        })
        return
      }

      idleHandleUsesIdleCallback = false
      idleHandle = window.setTimeout(
        activateGalleryFromIdle,
        HOME_GALLERY_IDLE_TIMEOUT_MS,
      )
    }

    const activateIfNearGallery = () => {
      if (!sentinelRef.current) return
      const top = sentinelRef.current.getBoundingClientRect().top
      if (top <= window.innerHeight + 320) activateGallery()
    }

    const handleScroll = () => {
      activateIfNearGallery()
    }

    scheduleDelayedIdleActivation()
    activateIfNearGallery()
    window.addEventListener('scroll', handleScroll, { passive: true })

    if ('IntersectionObserver' in window && sentinelRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            activateGallery()
          }
        },
        { rootMargin: '320px 0px' },
      )
      observer.observe(sentinelRef.current)
    }

    return () => {
      cancelled = true
      observer?.disconnect()
      window.removeEventListener('scroll', handleScroll)
      if (delayHandle !== undefined) window.clearTimeout(delayHandle)
      if (idleHandle === undefined) return
      if (idleHandleUsesIdleCallback && idleWindow.cancelIdleCallback) {
        idleWindow.cancelIdleCallback(idleHandle)
      } else {
        window.clearTimeout(idleHandle)
      }
    }
  }, [isGalleryReady])

  return (
    <div id="home-gallery-mount" ref={sentinelRef} className="min-h-[280px]">
      <style>
        {'#home-gallery-mount .sf-home-gallery-section{margin-top:1rem}'}
      </style>
      {isGalleryReady ? (
        <Suspense fallback={<HomeGalleryPlaceholder />}>
          <LazyHomeGallerySection />
        </Suspense>
      ) : (
        <HomeGalleryPlaceholder />
      )}
    </div>
  )
}

const HomeGalleryPlaceholder = () => (
  <div
    className="mb-10 mt-4 min-h-[280px] rounded-[20px] border border-white/6 bg-white/[0.025]"
    aria-hidden="true"
  />
)

export const HomePage = () => {
  const {
    canSubmit,
    claimShareBonus,
    errorMessage,
    isSubmitting,
    prompt,
    refreshShareBonusStatus,
    selectExamplePrompt,
    setPrompt,
    shareBonusClaimed,
    submitPrompt,
  } = usePromptHomeController()
  const [designRefOpen, setDesignRefOpen] = useState(false)
  const [engineVersion, setEngineVersion] = useState<'v1' | 'v2'>('v1')
  const [privateModalOpen, setPrivateModalOpen] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [placeholderLength, setPlaceholderLength] = useState(0)
  const [languageOptions, setLanguageOptions] = useState<
    ReadonlyArray<readonly [string, string]>
  >(DEFAULT_LANGUAGE_OPTIONS)
  const [languageRowUnlocked, setLanguageRowUnlocked] = useState(false)
  const [preferredLanguage, setPreferredLanguage] = useState('en')
  const [promptFocused, setPromptFocused] = useState(false)
  const [promptSuggestActive, setPromptSuggestActive] = useState(0)
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([])
  const [submitCtaShaking, setSubmitCtaShaking] = useState(false)
  const [showSharePanel, setShowSharePanel] = useState(false)
  const promptLanguageDetectTokenRef = useRef(0)
  const promptSuggestAbortRef = useRef<AbortController | null>(null)
  const promptSuggestTokenRef = useRef(0)

  const placeholderText = SAMPLE_PLACEHOLDERS[placeholderIndex]
  const visiblePlaceholder = useMemo(
    () => placeholderText.slice(0, placeholderLength),
    [placeholderLength, placeholderText],
  )
  const trimmedPromptLength = prompt.trim().length
  const languageRowVisible = trimmedPromptLength >= PROMPT_LANG_DETECT_MIN_CHARS
  const submitCtaLabel = languageRowVisible
    ? getGenerateCtaLabel(preferredLanguage)
    : SUBMIT_BTN_DEFAULT_LABEL
  const logoTagline = languageRowVisible
    ? getLogoTaglineText(preferredLanguage)
    : ''
  const promptSuggestionsOpen = promptFocused && promptSuggestions.length > 0
  const promptCaption = prompt.length > 0 ? 'My prompt' : 'Try a prompt like'

  useEffect(() => {
    if (typeof window === 'undefined') return
    document.body.classList.add('sf-launch-homepage')

    return () => {
      document.body.classList.remove('sf-launch-homepage')
    }
  }, [])

  useEffect(() => {
    if (prompt) return

    const fullText = SAMPLE_PLACEHOLDERS[placeholderIndex]
    if (placeholderLength < fullText.length) {
      const timeout = window.setTimeout(
        () => setPlaceholderLength((length) => length + 1),
        34,
      )
      return () => window.clearTimeout(timeout)
    }

    const timeout = window.setTimeout(() => {
      setPlaceholderIndex((index) => (index + 1) % SAMPLE_PLACEHOLDERS.length)
      setPlaceholderLength(0)
    }, 1800)
    return () => window.clearTimeout(timeout)
  }, [placeholderIndex, placeholderLength, prompt])

  useEffect(() => {
    if (!privateModalOpen) return

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setPrivateModalOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [privateModalOpen])

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!languageRowVisible) {
      promptLanguageDetectTokenRef.current += 1
      setLanguageOptions(DEFAULT_LANGUAGE_OPTIONS)
      setPreferredLanguage('en')
      setLanguageRowUnlocked(false)
      setSubmitCtaShaking(false)
      if (languageRowUnlocked) persistPreferredLanguage('en')
      return
    }

    if (!languageRowUnlocked) {
      setLanguageOptions(DEFAULT_LANGUAGE_OPTIONS)
      setPreferredLanguage('en')
      setLanguageRowUnlocked(true)
    }

    const runToken = ++promptLanguageDetectTokenRef.current
    const timeout = window.setTimeout(() => {
      void (async () => {
        const currentPrompt = prompt.trim()
        if (currentPrompt.length < PROMPT_LANG_DETECT_MIN_CHARS) return
        const { detectSnippetLanguageBcp47 } =
          await import('@/lib/home/prompt-language-core')
        const detectedLanguage = await detectSnippetLanguageBcp47(
          currentPrompt.slice(0, PROMPT_LANG_DETECT_SNIPPET_MAX),
        )
        if (!detectedLanguage) return
        if (runToken !== promptLanguageDetectTokenRef.current) return
        if (prompt.trim().length < PROMPT_LANG_DETECT_MIN_CHARS) return

        setLanguageOptions(buildFocusedLanguageOptions(detectedLanguage))
        setPreferredLanguage(detectedLanguage)
        persistPreferredLanguage(detectedLanguage)
        setSubmitCtaShaking(false)
        window.requestAnimationFrame(() => setSubmitCtaShaking(true))
      })()
    }, PROMPT_LANG_DETECT_DEBOUNCE_MS)

    return () => window.clearTimeout(timeout)
  }, [languageRowUnlocked, languageRowVisible, prompt])

  useEffect(() => {
    if (typeof window === 'undefined') return

    promptSuggestAbortRef.current?.abort()
    promptSuggestAbortRef.current = null

    const partial = prompt.trim()
    const promptElementActive = document.activeElement?.id === 'prompt-input'
    if (!promptFocused && promptElementActive) {
      setPromptFocused(true)
    }
    if (
      (!promptFocused && !promptElementActive) ||
      partial.length < PROMPT_SUGGEST_MIN_CHARS
    ) {
      promptSuggestTokenRef.current += 1
      setPromptSuggestions([])
      setPromptSuggestActive(0)
      return
    }

    const runToken = ++promptSuggestTokenRef.current
    const cacheKey = getPromptSuggestionCacheKey(partial, preferredLanguage)
    const localSuggestions = buildLocalPromptSuggestions(
      partial,
      preferredLanguage,
      PROMPT_SUGGEST_MAX_SHOW,
    )
    let immediateSuggestions = localSuggestions
    try {
      const cached = window.sessionStorage.getItem(cacheKey)
      const cachedSuggestions = sanitizePromptSuggestions(
        cached ? JSON.parse(cached) : [],
        partial,
        PROMPT_SUGGEST_MAX_SHOW,
      )
      if (cachedSuggestions.length > 0) {
        immediateSuggestions = cachedSuggestions
      }
    } catch {
      window.sessionStorage.removeItem(cacheKey)
    }
    setPromptSuggestions(immediateSuggestions)
    setPromptSuggestActive(0)

    const controller = new AbortController()
    promptSuggestAbortRef.current = controller
    const timeout = window.setTimeout(() => {
      void (async () => {
        try {
          const response = await fetch('/api/prompt-suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ partial, language: preferredLanguage }),
            signal: controller.signal,
          })
          if (runToken !== promptSuggestTokenRef.current) return
          if (!response.ok) {
            setPromptSuggestions((current) =>
              current.length > 0 ? current : immediateSuggestions,
            )
            return
          }
          const data = await response.json()
          if (runToken !== promptSuggestTokenRef.current) return
          const suggestions = sanitizePromptSuggestions(
            data?.suggestions,
            partial,
            PROMPT_SUGGEST_MAX_SHOW,
          )
          if (suggestions.length > 0) {
            window.sessionStorage.setItem(cacheKey, JSON.stringify(suggestions))
          }
          setPromptSuggestions(
            suggestions.length > 0 ? suggestions : immediateSuggestions,
          )
          setPromptSuggestActive(0)
        } catch (error) {
          if ((error as { name?: string })?.name === 'AbortError') return
          if (runToken !== promptSuggestTokenRef.current) return
          setPromptSuggestions((current) =>
            current.length > 0 ? current : immediateSuggestions,
          )
        }
      })()
    }, PROMPT_SUGGEST_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [preferredLanguage, prompt, promptFocused])

  // Show share panel when quota is exceeded and bonus not claimed
  useEffect(() => {
    if (errorMessage?.includes('quota exhausted') && !shareBonusClaimed) {
      void refreshShareBonusStatus()
      setShowSharePanel(true)
    } else {
      setShowSharePanel(false)
    }
  }, [errorMessage, refreshShareBonusStatus, shareBonusClaimed])

  const onShareClick = (platform: string) => {
    void handleShareClick(platform, claimShareBonus)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const designReferenceUrls = collectDesignReferenceUrls(formData)
    const designReferenceNotes = String(
      formData.get('design-ref-notes') ?? '',
    ).trim()
    void submitPrompt({
      prompt: String(formData.get('prompt') ?? prompt),
      preferredLanguage: String(formData.get('prompt-language') ?? 'en'),
      isPrivate: formData.get('private-generation') === 'on',
      designReferenceUrls,
      designReferenceNotes,
      cloneUrl: designReferenceUrls[0],
      engineVersion,
    })
  }

  const handleExamplePrompt = (value: string) => {
    selectExamplePrompt(value)
    void submitPrompt({ prompt: value, engineVersion })
  }

  const handlePreferredLanguageChange = (value: string) => {
    const normalized = normalizeLanguageCode(value) || 'en'
    setLanguageOptions(buildFocusedLanguageOptions(normalized))
    setPreferredLanguage(normalized)
    persistPreferredLanguage(normalized)
    setSubmitCtaShaking(false)
    window.requestAnimationFrame(() => setSubmitCtaShaking(true))
  }

  const closePromptSuggestions = () => {
    promptSuggestAbortRef.current?.abort()
    promptSuggestAbortRef.current = null
    promptSuggestTokenRef.current += 1
    setPromptSuggestions([])
    setPromptSuggestActive(0)
  }

  const applyPromptSuggestion = (value: string | undefined) => {
    if (!value) return
    closePromptSuggestions()
    setPrompt(value)
  }

  const handlePromptKeyDown = (
    event: ReactKeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (promptSuggestionsOpen) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setPromptSuggestActive(
          (index) => (index + 1) % promptSuggestions.length,
        )
        return
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setPromptSuggestActive(
          (index) =>
            (index - 1 + promptSuggestions.length) % promptSuggestions.length,
        )
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        closePromptSuggestions()
        return
      }
      if (event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault()
        applyPromptSuggestion(promptSuggestions[promptSuggestActive])
        return
      }
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        applyPromptSuggestion(promptSuggestions[promptSuggestActive])
        return
      }
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  const handleHeroCardPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const card = event.currentTarget
    const rect = card.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    card.style.setProperty(
      '--hero-glow-x',
      `${Math.max(0, Math.min(100, x)).toFixed(1)}%`,
    )
    card.style.setProperty(
      '--hero-glow-y',
      `${Math.max(0, Math.min(100, y)).toFixed(1)}%`,
    )
  }

  const handleHeroCardPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--hero-glow-x', '30%')
    event.currentTarget.style.setProperty('--hero-glow-y', '20%')
  }

  const footerYear = new Date().getFullYear()

  return (
    <div className="min-h-screen w-full overflow-x-hidden text-[#f0f0f5]">
      <GlassDefs />
      <LaunchBackdrop />

      <PrivateGenerationModal
        isOpen={privateModalOpen}
        onClose={() => setPrivateModalOpen(false)}
      />
      <TopActions />

      <div className="hidden" id="wappalyzer-banner">
        Sorry, Wappalyzer won't help you this time
      </div>

      <div className="w-full">
        <div className="relative z-[4] mx-auto flex w-[min(1200px,calc(100%_-_48px))] max-w-[1200px] min-w-0 flex-col items-stretch p-0 max-[1100px]:w-[min(760px,calc(100%_-_48px))] max-[760px]:w-[calc(100%_-_24px)]">
          <h1 className="sr-only">Ship Fast - AI website generator</h1>
          <div className="absolute left-0 top-[34px] z-[14] mb-0 flex w-auto flex-col items-start gap-2">
            <div className="flex items-center gap-[13px] max-[760px]:gap-2">
              <div className="h-[clamp(31px,2.7vw,39px)] w-[clamp(76px,6.6vw,96px)] text-cyan-300 drop-shadow-[0_0_18px_rgba(38,231,255,0.58)] max-[760px]:h-[23px] max-[760px]:w-[57px]">
                <LogoMark />
              </div>
              <span className="bg-[linear-gradient(135deg,#ffffff_0%,#dffbff_46%,#23e5ff_100%)] bg-[length:180%_180%] bg-clip-text font-sans text-[clamp(42px,4.2vw,56px)] font-extrabold tracking-[-0.055em] text-transparent [-webkit-text-fill-color:transparent] max-[760px]:text-[clamp(32px,9vw,40px)] max-[760px]:tracking-[-0.035em]">
                SHIP FAST
              </span>
            </div>
            <p
              className={cn(
                'logo-tagline m-0 text-center font-mono text-xs uppercase tracking-[0.18em] text-white/45',
                logoTagline && 'logo-tagline--in',
              )}
              id="logo-tagline"
              aria-live="polite"
              aria-hidden={!logoTagline}
            >
              {logoTagline}
            </p>
          </div>

          <section
            className="relative grid min-h-0 w-full grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start justify-center gap-[clamp(28px,2.6vw,44px)] overflow-visible rounded-none bg-transparent pt-[clamp(82px,7vw,102px)] pr-[clamp(42px,3.4vw,58px)] pb-[clamp(18px,2vw,28px)] pl-0 isolate max-[1100px]:grid-cols-1 max-[1100px]:pt-24 max-[1100px]:pr-0 max-[760px]:rounded-[22px] max-[760px]:p-[22px]"
            aria-label="Print your mind in seconds"
          >
            <div
              className="pointer-events-none fixed inset-0 z-0 h-screen w-screen overflow-visible"
              aria-hidden="true"
            >
              <img
                className="absolute left-0 top-0 z-[-1] block h-screen max-h-screen w-screen max-w-screen select-none object-contain object-right opacity-100 drop-shadow-[20px_-10px_42px_rgba(223,53,255,0.18)]"
                src="/assets/rocket-transparent.png"
                alt=""
                loading="eager"
                decoding="async"
              />
            </div>

            <div className="relative z-[4] flex w-full flex-col items-start justify-start pt-[clamp(34px,3vw,44px)] text-left max-[1100px]:items-center max-[1100px]:pt-0 max-[1100px]:text-center max-[760px]:pt-[92px]">
              <p className="m-0 mb-[18px] font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#26e7ff] [text-shadow:0_0_18px_rgba(38,231,255,0.48)]">
                Prompt. Generate. Launch.
              </p>
              <h2 className="m-0 max-w-[640px] text-balance font-sans text-[clamp(22px,2.4vw,34px)] font-semibold leading-[1.12] tracking-[-0.02em] text-[rgba(221,236,255,0.92)] [text-shadow:0_1px_0_rgba(255,255,255,0.35),0_0_24px_rgba(255,255,255,0.1),0_12px_32px_rgba(0,0,0,0.38)] max-[760px]:text-[clamp(20px,5.5vw,28px)]">
                Print your mind
                <br />
                in seconds
              </h2>
            </div>

            <div className="relative z-[1] flex min-h-0 w-full flex-col items-stretch justify-start">
              <div className="relative z-[8] mx-auto flex w-full max-w-none flex-col gap-0 max-[1100px]:w-[min(100%,680px)]">
                <WaitlistGate>
                  <div
                    className="hero-card launch-prompt-card relative isolate w-full overflow-hidden rounded-[26px] bg-[linear-gradient(145deg,rgba(7,15,38,0.78),rgba(4,6,18,0.62)),radial-gradient(circle_at_50%_0%,rgba(38,231,255,0.2),transparent_32rem)] p-px shadow-[0_0_0_1px_rgba(38,231,255,0.26),0_0_0_5px_rgba(38,231,255,0.04),0_24px_70px_rgba(0,0,0,0.42),0_0_70px_rgba(32,136,255,0.18)] backdrop-blur-[22px] backdrop-saturate-[1.6] before:pointer-events-none before:absolute before:inset-[-1px] before:z-0 before:rounded-[inherit] before:bg-[radial-gradient(ellipse_82%_70%_at_50%_0%,rgba(38,231,255,0.24),transparent_58%),linear-gradient(120deg,rgba(38,231,255,0.28),transparent_24%,rgba(223,53,255,0.2)_76%,transparent)] before:opacity-70 after:pointer-events-none after:absolute after:bottom-0 after:left-[6%] after:right-[6%] after:z-[1] after:h-px after:bg-[linear-gradient(90deg,transparent,rgba(38,231,255,0.66),rgba(223,53,255,0.55),transparent)]"
                    id="hero-card"
                    onPointerMove={handleHeroCardPointerMove}
                    onPointerLeave={handleHeroCardPointerLeave}
                  >
                    <div className="hero-card-inner relative z-[2] min-w-0 overflow-hidden rounded-[25px] bg-transparent p-[clamp(22px,2.1vw,30px)]">
                      <form
                        id="prompt-form"
                        className="flex w-full min-w-0 flex-col gap-[11px]"
                        onSubmit={handleSubmit}
                      >
                        <label className="sr-only" htmlFor="prompt-input">
                          Describe the website you want to build
                        </label>
                        <div className="relative w-full [--prompt-caption-block:calc(11px*1.25)] [--prompt-caption-gap:8px] [--prompt-inset-bottom:48px] [--prompt-inset-top:16px] [--prompt-inset-x:16px] [--prompt-text-start:calc(var(--prompt-inset-top)+var(--prompt-caption-block)+var(--prompt-caption-gap))]">
                          <textarea
                            className="min-h-[clamp(142px,14vw,166px)] w-full resize-y rounded-[var(--radius-lg)] border border-[rgba(38,231,255,0.2)] bg-[rgba(0,8,22,0.72)] px-[var(--prompt-inset-x)] pt-[var(--prompt-text-start)] pb-[var(--prompt-inset-bottom)] font-sans text-[15px] leading-[1.6] text-[#f6fdff] caret-[var(--accent-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-22px_70px_rgba(32,136,255,0.08)] outline-none transition-all duration-300 placeholder:text-transparent hover:border-[rgba(38,231,255,0.62)] focus:border-[rgba(38,231,255,0.62)] focus:shadow-[0_0_0_3px_rgba(38,231,255,0.11),0_0_35px_rgba(38,231,255,0.13),inset_0_-22px_70px_rgba(32,136,255,0.1)]"
                            id="prompt-input"
                            name="prompt"
                            placeholder=""
                            autoFocus
                            autoComplete="off"
                            required
                            rows={3}
                            maxLength={5000}
                            value={prompt}
                            aria-activedescendant={
                              promptSuggestionsOpen
                                ? `prompt-suggest-${promptSuggestActive}`
                                : undefined
                            }
                            aria-autocomplete="list"
                            aria-controls="prompt-suggestions-list"
                            onBlur={() => {
                              window.setTimeout(() => {
                                setPromptFocused(false)
                                closePromptSuggestions()
                              }, 120)
                            }}
                            onChange={(event) => {
                              setPromptFocused(true)
                              setPrompt(event.currentTarget.value)
                            }}
                            onClick={() => setPromptFocused(true)}
                            onFocus={() => setPromptFocused(true)}
                            onInput={() => setPromptFocused(true)}
                            onPointerDown={() => setPromptFocused(true)}
                            onKeyDown={handlePromptKeyDown}
                          />
                          <div
                            className="pointer-events-none absolute bottom-[var(--prompt-inset-bottom)] left-[var(--prompt-inset-x)] right-[var(--prompt-inset-x)] top-[var(--prompt-inset-top)] flex flex-col items-start gap-[var(--prompt-caption-gap)] text-left transition-opacity duration-200"
                            id="prompt-placeholder"
                            aria-hidden="true"
                          >
                            <span className="block font-sans text-[11px] font-semibold uppercase leading-[1.25] tracking-[0.1em] text-[rgba(38,231,255,0.88)]">
                              {promptCaption}
                            </span>
                            {!prompt ? (
                              <span className="block max-h-[calc(1.6em*3)] max-w-full overflow-hidden text-[15px] leading-[1.6] text-[rgba(219,237,255,0.48)] [mask-image:linear-gradient(180deg,#000_70%,transparent)]">
                                <span id="prompt-placeholder-text">
                                  {visiblePlaceholder}
                                </span>
                                <span className="ml-0.5 inline-block h-5 w-px animate-pulse bg-cyan-200/60 align-middle" />
                              </span>
                            ) : null}
                          </div>
                          <div
                            className={cn(
                              'prompt-suggestions',
                              promptSuggestionsOpen && 'is-open',
                            )}
                            id="prompt-suggestions"
                            hidden={!promptSuggestionsOpen}
                          >
                            <ul
                              className="prompt-suggestions-list"
                              id="prompt-suggestions-list"
                              role="listbox"
                              aria-label="Prompt ideas"
                            >
                              {promptSuggestions.map((suggestion, index) => (
                                <li
                                  className={cn(
                                    'prompt-suggestions-item',
                                    index === promptSuggestActive &&
                                      'is-active',
                                  )}
                                  id={`prompt-suggest-${index}`}
                                  key={suggestion}
                                  role="option"
                                  aria-selected={index === promptSuggestActive}
                                  onMouseDown={(event) => {
                                    event.preventDefault()
                                    applyPromptSuggestion(suggestion)
                                  }}
                                >
                                  <span>
                                    {suggestion.slice(0, prompt.trim().length)}
                                  </span>
                                  <mark>
                                    {suggestion.slice(prompt.trim().length)}
                                  </mark>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div
                            className={cn(
                              'prompt-language-row',
                              !languageRowVisible && 'is-hidden',
                            )}
                            id="prompt-language-row"
                          >
                            <label
                              className="sr-only"
                              htmlFor="prompt-language"
                            >
                              Preferred generation language
                            </label>
                            <select
                              className="prompt-language-select"
                              id="prompt-language"
                              name="prompt-language"
                              aria-label="Preferred generation language"
                              value={preferredLanguage}
                              onChange={(event) =>
                                handlePreferredLanguageChange(
                                  event.currentTarget.value,
                                )
                              }
                            >
                              {languageOptions.map(([code, name]) => (
                                <option key={code} value={code}>
                                  {name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div
                          className={cn(
                            'rounded-2xl border border-white/10 bg-white/[0.03] p-3',
                            designRefOpen ? 'grid gap-3' : 'hidden',
                          )}
                          id="design-ref-panel"
                        >
                          <div className="relative flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                            <SearchIcon />
                            <input
                              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                              type="text"
                              id="design-ref-search"
                              name="design-ref-search"
                              autoComplete="off"
                              placeholder="Search a site or paste an HTTPS URL"
                            />
                          </div>
                          <div
                            className="hidden items-center gap-3 rounded-xl border border-white/10 bg-black/25 p-2"
                            id="design-ref-preview"
                          >
                            <img
                              className="size-5 rounded"
                              id="design-ref-preview-favicon"
                              alt=""
                            />
                            <div className="min-w-0 flex-1">
                              <div
                                className="truncate text-sm text-white"
                                id="design-ref-preview-title"
                              />
                              <div
                                className="truncate text-xs text-white/45"
                                id="design-ref-preview-url"
                              />
                            </div>
                            <GlassPillButton
                              className="size-7 min-h-7 min-w-7 p-0"
                              id="design-ref-preview-remove"
                              ariaLabel="Remove"
                            >
                              <CloseIcon />
                            </GlassPillButton>
                          </div>

                          <p className="m-0 text-xs leading-relaxed text-white/40">
                            Use a site you have rights to reference. Ship Fast
                            creates an original layout.
                          </p>
                        </div>

                        <input
                          type="hidden"
                          id="design-ref-url-1"
                          name="design-ref-url-1"
                          value=""
                        />
                        <input
                          type="hidden"
                          id="design-ref-url-2"
                          name="design-ref-url-2"
                          value=""
                        />
                        <input
                          type="hidden"
                          id="design-ref-notes"
                          name="design-ref-notes"
                          value=""
                        />

                        <div className="mt-1.5 flex w-full flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex shrink-0 items-center gap-2.5">
                              <input
                                type="checkbox"
                                className="relative h-5 w-9 shrink-0 cursor-pointer appearance-none rounded-full border border-white/20 bg-white/[0.08] outline-none transition-all duration-300 checked:border-cyan-300/50 checked:bg-cyan-300/25 before:absolute before:left-0.5 before:top-0.5 before:size-3.5 before:rounded-full before:bg-white/40 before:transition-all checked:before:translate-x-4 checked:before:bg-cyan-200"
                                id="design-ref-toggle"
                                checked={designRefOpen}
                                onChange={(event) =>
                                  setDesignRefOpen(event.currentTarget.checked)
                                }
                              />
                              <label
                                className="text-sm text-[rgba(219,237,255,0.75)]"
                                htmlFor="design-ref-toggle"
                              >
                                Layout inspiration
                              </label>
                            </div>
                            <div className="flex shrink-0 items-center gap-2.5">
                              <input
                                type="checkbox"
                                className="relative h-5 w-9 shrink-0 cursor-pointer appearance-none rounded-full border border-white/20 bg-white/[0.08] outline-none transition-all duration-300 checked:border-violet-300/55 checked:bg-violet-300/25 before:absolute before:left-0.5 before:top-0.5 before:size-3.5 before:rounded-full before:bg-white/40 before:transition-all checked:before:translate-x-4 checked:before:bg-violet-200"
                                id="engine-v2-toggle"
                                name="engine-version-v2"
                                checked={engineVersion === 'v2'}
                                onChange={(event) =>
                                  setEngineVersion(
                                    event.currentTarget.checked ? 'v2' : 'v1',
                                  )
                                }
                              />
                              <label
                                className="text-sm text-[rgba(219,237,255,0.75)]"
                                htmlFor="engine-v2-toggle"
                              >
                                Method 2 engine
                              </label>
                            </div>
                          </div>
                          <GlassPillButton
                            type="submit"
                            className={cn(
                              'submit-btn min-h-11 px-[22px] py-2.5 text-sm font-extrabold text-[#00121a] shadow-[0_0_0_1px_rgba(255,255,255,0.35)_inset,0_0_34px_rgba(38,231,255,0.22),0_16px_34px_rgba(0,0,0,0.34)] disabled:text-[rgba(230,248,255,0.46)] max-[760px]:w-[52px] max-[760px]:min-w-[52px] max-[760px]:px-0',
                              canSubmit &&
                                'bg-[linear-gradient(135deg,#6dfbff_0%,#25dff5_45%,#38a8ff_100%)]',
                              isSubmitting && 'opacity-70',
                              submitCtaShaking && 'submit-btn--cta-shake',
                            )}
                            id="submit-btn"
                            disabled={!canSubmit}
                            onAnimationEnd={() => setSubmitCtaShaking(false)}
                          >
                            <ZapIcon />
                            <span className="btn-label max-[760px]:hidden">
                              {submitCtaLabel}
                            </span>
                            <div
                              className={cn(
                                'hidden size-4 animate-spin rounded-full border-2 border-white/20 border-t-white',
                                isSubmitting && 'block',
                              )}
                            />
                          </GlassPillButton>
                        </div>
                      </form>

                      <div
                        className={cn(
                          'mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300',
                          !errorMessage && 'hidden',
                        )}
                        id="prompt-policy-block"
                        role="alert"
                        aria-live="assertive"
                        hidden={!errorMessage}
                      >
                        {errorMessage}
                      </div>
                      <div className="hidden" id="gen-counter" />

                      <ShareBonusPanel
                        visible={showSharePanel}
                        onShareClick={onShareClick}
                      />

                      <div className="hidden" id="private-gen-row">
                        <label
                          className="flex items-center gap-2 text-sm text-white/60"
                          htmlFor="private-gen-checkbox"
                        >
                          <input
                            type="checkbox"
                            id="private-gen-checkbox"
                            name="private-generation"
                            onChange={(event) => {
                              if (event.currentTarget.checked) {
                                event.currentTarget.checked = false
                                setPrivateModalOpen(true)
                              }
                            }}
                          />
                          <span>Private generation</span>
                          <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.12em] text-cyan-200">
                            PRO
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div
                      className="mx-auto mt-2 flex max-w-full flex-nowrap justify-center gap-0 rounded-[14px] border border-white/10 bg-[rgba(20,20,24,0.35)] px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-[12px] max-[760px]:flex-wrap max-[760px]:justify-start max-[760px]:gap-1"
                      aria-label="Example prompts"
                    >
                      {EXAMPLE_CHIPS.map(([label, value], index) => (
                        <button
                          key={label}
                          type="button"
                          className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-white/12 bg-white/[0.05] px-[7px] py-[5px] font-mono text-[11px] tracking-[0.02em] text-[rgba(237,237,239,0.88)] transition-all duration-150 hover:-translate-y-px hover:border-violet-600/55 hover:bg-violet-600/20 hover:text-white disabled:cursor-wait disabled:opacity-50"
                          data-prompt={value}
                          data-react-owned="true"
                          onClick={() => handleExamplePrompt(value)}
                        >
                          <span className="inline-flex h-3.5 min-w-3.5 shrink-0 items-center justify-center rounded bg-violet-600/55 px-1 text-[10px] font-bold text-white">
                            {index + 1}
                          </span>
                          <span className="whitespace-nowrap">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </WaitlistGate>
              </div>
            </div>
          </section>

          <DeferredHomeGallerySection />
        </div>
      </div>

      <footer className="relative z-[1] mx-auto mb-8 flex w-[min(1160px,calc(100%_-_48px))] flex-wrap items-center justify-between gap-5 rounded-[20px] border border-white/6 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))] px-7 py-[22px] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_80px_rgba(0,0,0,0.2),0_0_60px_rgba(100,80,200,0.04)] backdrop-blur-[20px] max-[720px]:w-[min(100%,calc(100%_-_32px))] max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-4">
        <span className="font-mono text-[13px] tracking-[0.12em] text-[#97a0b0]">
          SHIP FAST © {footerYear}
        </span>
        <nav
          className="flex flex-wrap items-center gap-5 [&_a]:text-[13px] [&_a]:text-[#97a0b0] [&_a]:transition-colors hover:[&_a]:text-[#EDEDEF]"
          aria-label="Footer links"
        >
          <a href="/">Home</a>
          <a href="/pricing">Pricing</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
      </footer>

      <noscript>
        <div className="fixed inset-x-4 bottom-4 z-[300] rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          JavaScript is required for generation, but the homepage metadata is
          still rendered on the server.
        </div>
      </noscript>
    </div>
  )
}
