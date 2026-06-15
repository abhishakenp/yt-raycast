import { Show, SignInButton, UserButton } from '@clerk/tanstack-react-start'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'

import { LaunchBackdrop } from '@/components/launch-backdrop'
import { HomeGallerySection } from '@/features/gallery/components/PublicGallery'
import { usePromptHomeController } from '@/features/home/hooks/usePromptHomeController'
import { GLASS_LENS_FILTER_ID } from '@/lib/glass-pill-html'
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
  detectSnippetLanguageBcp47,
  getGenerateCtaLabel,
  getLanguageDisplayName,
  getLogoTaglineText,
  normalizeLanguageCode,
} from '@/lib/home/prompt-language-core'
import { cn } from '@/lib/utils'

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
  ['Hindi gym site', 'Mere local gym ke liye ek powerful modern website banao with membership plans'],
] as const

const SAMPLE_PLACEHOLDERS = [
  'A cinematic travel landing page for curated weekend escapes with reviews and fast booking.',
  'A polished SaaS homepage for an AI sales copilot with pipeline analytics and clear pricing.',
  'A premium architecture studio site with immersive case studies, awards, and inquiry scheduling.',
  'A bold ecommerce homepage for handcrafted coffee gear with bundles and subscriptions.',
] as const

const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? import.meta.env.CLERK_PUBLISHABLE_KEY
const isClerkConfigured = typeof clerkPublishableKey === 'string' && clerkPublishableKey.trim().length > 0

type PillButtonProps = {
  children: ReactNode
  className?: string
  disabled?: boolean
  id?: string
  type?: 'button' | 'submit'
  ariaLabel?: string
  onClick?: () => void
}

export const GlassDefs = () => (
  <svg className="absolute -m-px size-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <filter
        id={GLASS_LENS_FILTER_ID}
        x="-50%"
        y="-50%"
        width="200%"
        height="200%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.0082 0.0058"
          numOctaves="3"
          seed="41"
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="2" result="smooth" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="smooth"
          scale="24"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
)

const PillDecorations = () => (
  <>
    <span className={`pointer-events-none absolute inset-0 z-0 rounded-[inherit] backdrop-blur-[32px] backdrop-saturate-[2.1] backdrop-brightness-[1.03] backdrop-contrast-[1.04] [filter:url(#${GLASS_LENS_FILTER_ID})]`} aria-hidden="true" />
    <span className="pointer-events-none absolute inset-0 z-[1] translate-x-px -translate-y-[0.4px] rounded-[inherit] bg-[rgba(255,210,198,0.07)] opacity-30 mix-blend-screen backdrop-blur-[28px] backdrop-saturate-[2.2] backdrop-contrast-[1.04]" aria-hidden="true" />
    <span className="pointer-events-none absolute inset-0 z-[2] -translate-x-px translate-y-[0.4px] rounded-[inherit] bg-[rgba(175,205,228,0.07)] opacity-30 mix-blend-screen backdrop-blur-[28px] backdrop-saturate-[2.2] backdrop-contrast-[1.04]" aria-hidden="true" />
    <span className="pointer-events-none absolute inset-0 z-[3] rounded-[inherit] bg-[linear-gradient(180deg,rgba(8,10,18,0.22)_0%,rgba(255,255,255,0.04)_48%,rgba(218,224,232,0.1)_100%),radial-gradient(ellipse_100%_70%_at_88%_12%,rgba(255,255,255,0.06)_0%,transparent_45%)] opacity-55" aria-hidden="true" />
    <span className="pointer-events-none absolute inset-0 z-[4] rounded-[inherit] bg-[conic-gradient(from_200deg_at_35%_25%,rgba(235,238,242,0.07),rgba(210,216,224,0.08),rgba(225,228,234,0.07),rgba(205,212,222,0.08),rgba(235,238,242,0.07))] opacity-25 mix-blend-soft-light" aria-hidden="true" />
    <span className="pointer-events-none absolute inset-0 z-[5] rounded-[inherit] bg-[linear-gradient(172deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0)_42%),linear-gradient(358deg,rgba(255,255,255,0)_54%,rgba(255,255,255,0.05)_100%)] opacity-55 mix-blend-soft-light" aria-hidden="true" />
    <span className="pointer-events-none absolute inset-0 z-[6] rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),inset_0_0_0_1px_rgba(255,255,255,0.16),inset_0_-12px_28px_rgba(0,6,30,0.28)]" aria-hidden="true" />
  </>
)

export const GlassPillButton = ({
  children,
  className = '',
  disabled,
  id,
  type = 'button',
  ariaLabel,
  onClick,
}: PillButtonProps) => (
  <button
    type={type}
    className={cn(
      'pill relative isolate inline-flex min-h-12 cursor-pointer items-center justify-center overflow-hidden rounded-full border-0 bg-transparent px-5 py-3 font-[inherit] font-semibold tracking-[-0.015em] text-inherit shadow-[0_14px_32px_rgba(0,0,0,0.38)] transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.25)] [-webkit-tap-highlight-color:transparent] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white',
      className,
    )}
    id={id}
    disabled={disabled}
    aria-label={ariaLabel}
    onClick={onClick}
  >
    <PillDecorations />
    <span className="pill__body relative z-[7] inline-flex items-center justify-center gap-2 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">{children}</span>
  </button>
)

export const GlassPillAnchor = ({
  children,
  className = '',
  href,
}: {
  children: ReactNode
  className?: string
  href: string
}) => (
  <a
    href={href}
    className={cn(
      'pill relative isolate inline-flex min-h-12 cursor-pointer items-center justify-center overflow-hidden rounded-full border-0 bg-transparent px-5 py-3 font-[inherit] font-semibold tracking-[-0.015em] text-inherit shadow-[0_14px_32px_rgba(0,0,0,0.38)] transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.25)] [-webkit-tap-highlight-color:transparent] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white',
      className,
    )}
  >
    <PillDecorations />
    <span className="pill__body relative z-[7] inline-flex items-center justify-center gap-2 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">{children}</span>
  </a>
)

const LogoMark = () => (
  <img
    src="/assets/logo-transparent.png"
    alt="Ship Fast Logo"
    className="w-full h-full object-contain"
    aria-hidden="true"
  />
)

const SearchIcon = () => (
  <svg
    className="size-4 shrink-0 text-white/35"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

const CloseIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const ZapIcon = () => (
  <svg
    className="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const ShareIcon = ({
  children,
  className,
  id,
  label,
  title,
  onClick,
}: {
  children: ReactNode
  className?: string
  id: string
  label: string
  title: string
  onClick?: () => void
}) => (
  <button
    type="button"
    className={cn(
      'grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-white/75 shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-y-px hover:bg-white/[0.1] hover:text-white',
      className,
    )}
    id={id}
    title={title}
    aria-label={label}
    onClick={onClick}
  >
    <svg className="size-[18px]" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      {children}
    </svg>
  </button>
)

const PrivateGenerationModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => (
  <div
    className={cn('fixed inset-0 z-[260] hidden items-center justify-center px-4', isOpen && 'flex')}
    id="private-gen-modal"
    aria-hidden={!isOpen}
  >
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" id="private-gen-modal-backdrop" onClick={onClose} />
    <div
      className="relative z-[1] grid w-[min(420px,100%)] gap-4 rounded-[28px] border border-white/12 bg-[#10131c]/95 p-6 text-center text-white shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-[24px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="private-gen-modal-title"
    >
      <button
        className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/[0.1] hover:text-white"
        id="private-gen-modal-close"
        aria-label="Close"
        onClick={onClose}
      >
        <span>Close</span>
      </button>
      <div className="mx-auto grid size-16 place-items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h2 className="m-0 font-sans text-2xl font-bold tracking-[-0.03em]" id="private-gen-modal-title">Private Generation</h2>
      <p className="m-0 text-sm leading-relaxed text-white/65">Your generated site won't be publicly listed - only you can access it.</p>
      <p className="m-0 text-sm leading-relaxed text-white/65">
        This is a <strong>Pro plan</strong> feature.
      </p>
      <a href="/pricing" className="mx-auto inline-flex min-h-11 items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-px">
        Upgrade to Pro
      </a>
    </div>
  </div>
)

const TopActions = () => (
  <nav className="pointer-events-none fixed inset-x-0 top-0 z-[210] flex items-center justify-start gap-2 bg-transparent px-6 py-4" aria-label="Primary">
    <div className="pointer-events-auto ml-auto flex items-center gap-2">
      <GlassPillAnchor className="pill--top-actions min-h-9 px-4 py-0 font-sans text-[13px] font-medium text-[#f0f0f5] [&>span:last-child]:gap-1.5" href="/pricing">
        Pricing
      </GlassPillAnchor>
      {isClerkConfigured ? (
        <>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <GlassPillButton className="pill--top-actions min-h-9 px-4 py-0 font-sans text-[13px] font-medium text-[#f0f0f5] [&>span:last-child]:gap-1.5">Sign in</GlassPillButton>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <div className="grid size-9 place-items-center">
              <UserButton afterSignOutUrl="/" />
            </div>
          </Show>
        </>
      ) : null}
    </div>
  </nav>
)

const getLanguageOptionName = (code: string) =>
  LANGUAGE_OPTIONS.find(([optionCode]) => optionCode === code)?.[1] ?? getLanguageDisplayName(code)

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

export const HomePage = () => {
  const {
    canSubmit,
    claimShareBonus,
    errorMessage,
    isSubmitting,
    prompt,
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
  const [languageOptions, setLanguageOptions] = useState<ReadonlyArray<readonly [string, string]>>(
    DEFAULT_LANGUAGE_OPTIONS,
  )
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
  const logoTagline = languageRowVisible ? getLogoTaglineText(preferredLanguage) : ''
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
      const timeout = window.setTimeout(() => setPlaceholderLength((length) => length + 1), 34)
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

    const onKeyDown = (event: KeyboardEvent) => {
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
    if (!promptFocused || partial.length < PROMPT_SUGGEST_MIN_CHARS) {
      promptSuggestTokenRef.current += 1
      setPromptSuggestions([])
      setPromptSuggestActive(0)
      return
    }

    const runToken = ++promptSuggestTokenRef.current
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
            setPromptSuggestions([])
            setPromptSuggestActive(0)
            return
          }
          const data = await response.json()
          if (runToken !== promptSuggestTokenRef.current) return
          const suggestions = Array.isArray(data?.suggestions)
            ? data.suggestions
                .filter((value: unknown): value is string => typeof value === 'string')
                .slice(0, PROMPT_SUGGEST_MAX_SHOW)
            : []
          setPromptSuggestions(suggestions)
          setPromptSuggestActive(0)
        } catch (error) {
          if ((error as { name?: string })?.name === 'AbortError') return
          if (runToken !== promptSuggestTokenRef.current) return
          setPromptSuggestions([])
          setPromptSuggestActive(0)
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
      setShowSharePanel(true)
    } else {
      setShowSharePanel(false)
    }
  }, [errorMessage, shareBonusClaimed])

  const handleShareClick = async (platform: string) => {
    await claimShareBonus()
    const siteUrl = 'https://ship-fast.io'
    const messages: Record<string, string> = {
      en: `I just built a site in minutes with Ship Fast — try it free: ${siteUrl}`,
      hi: `मैंने Ship Fast से मिनटों में साइट बनाई — आप भी बनाएं: ${siteUrl}`,
      ta: `Ship Fast மூலம் நிமிடங்களில் தளம் உருவாக்கினேன் — நீங்களும் முயற்சிக்கவும்: ${siteUrl}`,
      te: `Ship Fast తో నిమిషాల్లో సైట్ చేశాను — మీరూ ట్రై చేయండి: ${siteUrl}`,
      bn: `Ship Fast দিয়ে মিনিটে সাইট বানিয়েছি — আপনিও চেষ্টা করুন: ${siteUrl}`,
      mr: `Ship Fast ने मिनिटांत साइट बनवली — तुम्हीही बनवा: ${siteUrl}`,
      kn: `Ship Fast ನಿಂದ ನಿಮಿಷಗಳಲ್ಲಿ ಸೈಟ್ ಮಾಡಿದೆ — ನೀವೂ ಮಾಡಿ: ${siteUrl}`,
      ml: `Ship Fast ഉപയോഗിച്ച് മിനിറ്റുകളിൽ സൈറ്റ് ഉണ്ടാക്കി — നിങ്ങളും ചെയ്യൂ: ${siteUrl}`,
      pa: `Ship Fast ਨਾਲ ਮਿੰਟਾਂ 'ਚ ਸਾਈਟ ਬਣਾਈ — ਤੁਸੀਂ ਵੀ ਬਣਾਓ: ${siteUrl}`,
      gu: `Ship Fast વડે મિનિટોમાં સાઇટ બનાવી — તમે પણ બનાવો: ${siteUrl}`,
    }

    const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
    let locale = 'en'
    for (const L of langs) {
      const c = String(L || '').toLowerCase().split('-')[0]
      if (c && c !== 'en' && messages[c]) { locale = c; break }
    }
    const message = messages[locale] || messages.en
    const encodedUrl = encodeURIComponent(siteUrl)
    const encodedMessage = encodeURIComponent(message)

    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodedMessage}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      x: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    }

    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({ title: 'Ship Fast', text: message, url: siteUrl })
      } catch {
        // User cancelled or error
      }
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer')
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const designReferenceUrls = collectDesignReferenceUrls(formData)
    const designReferenceNotes = String(formData.get('design-ref-notes') ?? '').trim()
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

  const handlePromptKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (promptSuggestionsOpen) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setPromptSuggestActive((index) => (index + 1) % promptSuggestions.length)
        return
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setPromptSuggestActive((index) =>
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
    card.style.setProperty('--hero-glow-x', `${Math.max(0, Math.min(100, x)).toFixed(1)}%`)
    card.style.setProperty('--hero-glow-y', `${Math.max(0, Math.min(100, y)).toFixed(1)}%`)
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

      <PrivateGenerationModal isOpen={privateModalOpen} onClose={() => setPrivateModalOpen(false)} />
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
              <span className="bg-[linear-gradient(135deg,#ffffff_0%,#dffbff_46%,#23e5ff_100%)] bg-[length:180%_180%] bg-clip-text font-sans text-[clamp(42px,4.2vw,56px)] font-extrabold tracking-[-0.055em] text-transparent [-webkit-text-fill-color:transparent] max-[760px]:text-[clamp(32px,9vw,40px)] max-[760px]:tracking-[-0.035em]">SHIP FAST</span>
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

          <section className="relative grid min-h-[70svh] w-full grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start justify-center gap-[clamp(28px,2.6vw,44px)] overflow-visible rounded-none bg-transparent pt-[clamp(82px,7vw,102px)] pr-[clamp(42px,3.4vw,58px)] pb-[clamp(32px,5vw,62px)] pl-0 isolate max-[1100px]:grid-cols-1 max-[1100px]:pt-24 max-[1100px]:pr-0 max-[760px]:min-h-[600px] max-[760px]:rounded-[22px] max-[760px]:p-[22px]" aria-label="Print your mind in seconds">
            <div className="pointer-events-none fixed inset-0 z-0 h-screen w-screen overflow-visible" aria-hidden="true">
              <img
                className="absolute left-0 top-0 z-[-1] block h-screen max-h-screen w-screen max-w-screen select-none object-contain object-right opacity-100 drop-shadow-[20px_-10px_42px_rgba(223,53,255,0.18)]"
                src="/assets/rocket-transparent.png"
                alt=""
                loading="eager"
                decoding="async"
              />
            </div>

            <div className="relative z-[4] flex w-full flex-col items-start justify-start pt-[clamp(34px,3vw,44px)] text-left max-[1100px]:items-center max-[1100px]:pt-0 max-[1100px]:text-center max-[760px]:pt-[92px]">
              <p className="m-0 mb-[18px] font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#26e7ff] [text-shadow:0_0_18px_rgba(38,231,255,0.48)]">Prompt. Generate. Launch.</p>
              <h2 className="m-0 max-w-[640px] text-balance font-sans text-[clamp(22px,2.4vw,34px)] font-semibold leading-[1.12] tracking-[-0.02em] text-[rgba(221,236,255,0.92)] [text-shadow:0_1px_0_rgba(255,255,255,0.35),0_0_24px_rgba(255,255,255,0.1),0_12px_32px_rgba(0,0,0,0.38)] max-[760px]:text-[clamp(20px,5.5vw,28px)]">
                Print your mind
                <br />
                in seconds
              </h2>
            </div>

            <div className="relative z-[1] flex min-h-[clamp(360px,34vw,420px)] w-full flex-col items-stretch justify-start max-[1100px]:min-h-[720px]">
              <div className="relative z-[8] mx-auto flex w-full max-w-none flex-col gap-0 max-[1100px]:w-[min(100%,680px)]">
                <div
                  className="hero-card launch-prompt-card relative isolate w-full overflow-hidden rounded-[26px] bg-[linear-gradient(145deg,rgba(7,15,38,0.78),rgba(4,6,18,0.62)),radial-gradient(circle_at_50%_0%,rgba(38,231,255,0.2),transparent_32rem)] p-px shadow-[0_0_0_1px_rgba(38,231,255,0.26),0_0_0_5px_rgba(38,231,255,0.04),0_24px_70px_rgba(0,0,0,0.42),0_0_70px_rgba(32,136,255,0.18)] backdrop-blur-[22px] backdrop-saturate-[1.6] before:pointer-events-none before:absolute before:inset-[-1px] before:z-0 before:rounded-[inherit] before:bg-[radial-gradient(ellipse_82%_70%_at_50%_0%,rgba(38,231,255,0.24),transparent_58%),linear-gradient(120deg,rgba(38,231,255,0.28),transparent_24%,rgba(223,53,255,0.2)_76%,transparent)] before:opacity-70 after:pointer-events-none after:absolute after:bottom-0 after:left-[6%] after:right-[6%] after:z-[1] after:h-px after:bg-[linear-gradient(90deg,transparent,rgba(38,231,255,0.66),rgba(223,53,255,0.55),transparent)]"
                  id="hero-card"
                  onPointerMove={handleHeroCardPointerMove}
                  onPointerLeave={handleHeroCardPointerLeave}
                >
                  <div className="hero-card-inner relative z-[2] min-w-0 overflow-hidden rounded-[25px] bg-transparent p-[clamp(22px,2.1vw,30px)]">
                    <form id="prompt-form" className="flex w-full min-w-0 flex-col gap-[11px]" onSubmit={handleSubmit}>
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
                            promptSuggestionsOpen ? `prompt-suggest-${promptSuggestActive}` : undefined
                          }
                          aria-autocomplete="list"
                          aria-controls="prompt-suggestions-list"
                          onBlur={() => {
                            window.setTimeout(() => {
                              setPromptFocused(false)
                              closePromptSuggestions()
                            }, 120)
                          }}
                          onChange={(event) => setPrompt(event.currentTarget.value)}
                          onFocus={() => setPromptFocused(true)}
                          onKeyDown={handlePromptKeyDown}
                        />
                        <div className="pointer-events-none absolute bottom-[var(--prompt-inset-bottom)] left-[var(--prompt-inset-x)] right-[var(--prompt-inset-x)] top-[var(--prompt-inset-top)] flex flex-col items-start gap-[var(--prompt-caption-gap)] text-left transition-opacity duration-200" id="prompt-placeholder" aria-hidden="true">
                          <span className="block font-sans text-[11px] font-semibold uppercase leading-[1.25] tracking-[0.1em] text-[rgba(38,231,255,0.88)]">{promptCaption}</span>
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
                          className={cn('prompt-suggestions', promptSuggestionsOpen && 'is-open')}
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
                                  index === promptSuggestActive && 'is-active',
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
                                <span>{suggestion.slice(0, prompt.trim().length)}</span>
                                <mark>{suggestion.slice(prompt.trim().length)}</mark>
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
                          <label className="sr-only" htmlFor="prompt-language">
                            Preferred generation language
                          </label>
                          <select
                            className="prompt-language-select"
                            id="prompt-language"
                            name="prompt-language"
                            aria-label="Preferred generation language"
                            value={preferredLanguage}
                            onChange={(event) => handlePreferredLanguageChange(event.currentTarget.value)}
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
                        <div className="hidden items-center gap-3 rounded-xl border border-white/10 bg-black/25 p-2" id="design-ref-preview">
                          <img className="size-5 rounded" id="design-ref-preview-favicon" alt="" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm text-white" id="design-ref-preview-title" />
                            <div className="truncate text-xs text-white/45" id="design-ref-preview-url" />
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
                          Use a site you have rights to reference. Ship Fast creates an original layout.
                        </p>
                      </div>

                      <input type="hidden" id="design-ref-url-1" name="design-ref-url-1" value="" />
                      <input type="hidden" id="design-ref-url-2" name="design-ref-url-2" value="" />
                      <input type="hidden" id="design-ref-notes" name="design-ref-notes" value="" />

                      <div className="mt-1.5 flex w-full flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex shrink-0 items-center gap-2.5">
                            <input
                              type="checkbox"
                              className="relative h-5 w-9 shrink-0 cursor-pointer appearance-none rounded-full border border-white/20 bg-white/[0.08] outline-none transition-all duration-300 checked:border-cyan-300/50 checked:bg-cyan-300/25 before:absolute before:left-0.5 before:top-0.5 before:size-3.5 before:rounded-full before:bg-white/40 before:transition-all checked:before:translate-x-4 checked:before:bg-cyan-200"
                              id="design-ref-toggle"
                              checked={designRefOpen}
                              onChange={(event) => setDesignRefOpen(event.currentTarget.checked)}
                            />
                            <label className="text-sm text-[rgba(219,237,255,0.75)]" htmlFor="design-ref-toggle">
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
                              onChange={(event) => setEngineVersion(event.currentTarget.checked ? 'v2' : 'v1')}
                            />
                            <label className="text-sm text-[rgba(219,237,255,0.75)]" htmlFor="engine-v2-toggle">
                              Method 2 engine
                            </label>
                          </div>
                        </div>
                        <GlassPillButton
                          type="submit"
                          className={cn('submit-btn min-h-11 px-[22px] py-2.5 text-sm font-extrabold text-[#00121a] shadow-[0_0_0_1px_rgba(255,255,255,0.35)_inset,0_0_34px_rgba(38,231,255,0.22),0_16px_34px_rgba(0,0,0,0.34)] disabled:text-[rgba(230,248,255,0.46)] max-[760px]:w-[52px] max-[760px]:min-w-[52px] max-[760px]:px-0', canSubmit && 'bg-[linear-gradient(135deg,#6dfbff_0%,#25dff5_45%,#38a8ff_100%)]', isSubmitting && 'opacity-70', submitCtaShaking && 'submit-btn--cta-shake')}
                          id="submit-btn"
                          disabled={!canSubmit}
                          onAnimationEnd={() => setSubmitCtaShaking(false)}
                        >
                          <ZapIcon />
                          <span className="btn-label max-[760px]:hidden">{submitCtaLabel}</span>
                          <div className={cn('hidden size-4 animate-spin rounded-full border-2 border-white/20 border-t-white', isSubmitting && 'block')} />
                        </GlassPillButton>
                      </div>
                    </form>

                    <div
                      className={cn('mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300', !errorMessage && 'hidden')}
                      id="prompt-policy-block"
                      role="alert"
                      aria-live="assertive"
                      hidden={!errorMessage}
                    >
                      {errorMessage}
                    </div>
                    <div className="hidden" id="gen-counter" />

                    <div className={cn('hidden items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white/65', showSharePanel && 'flex')} id="share-bonus-panel">
                      <span>Share for +1 free preview</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <ShareIcon className="text-[#25d366]" id="bonus-share-wa" title="WhatsApp" label="Share on WhatsApp" onClick={() => handleShareClick('whatsapp')}>
                          <path
                            fill="currentColor"
                            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                          />
                        </ShareIcon>
                        <ShareIcon className="text-[#1877f2]" id="bonus-share-fb" title="Facebook" label="Share on Facebook" onClick={() => handleShareClick('facebook')}>
                          <path
                            fill="currentColor"
                            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                          />
                        </ShareIcon>
                        <ShareIcon className="text-white" id="bonus-share-tw" title="X" label="Share on X" onClick={() => handleShareClick('x')}>
                          <path
                            fill="currentColor"
                            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                          />
                        </ShareIcon>
                        <ShareIcon className="text-[#2aabee]" id="bonus-share-tg" title="Telegram" label="Share on Telegram" onClick={() => handleShareClick('telegram')}>
                          <path
                            fill="currentColor"
                            d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
                          />
                        </ShareIcon>
                        <ShareIcon className="text-[#0a66c2]" id="bonus-share-li" title="LinkedIn" label="Share on LinkedIn" onClick={() => handleShareClick('linkedin')}>
                          <path
                            fill="currentColor"
                            d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                          />
                        </ShareIcon>
                        <GlassPillButton className="size-8 min-h-8 min-w-8 p-0" id="bonus-share-native" onClick={() => handleShareClick('native')}>
                          <svg
                            className="size-[18px]"
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            aria-hidden="true"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" x2="12" y1="2" y2="15" />
                          </svg>
                        </GlassPillButton>
                      </div>
                    </div>

                    <div className="hidden" id="private-gen-row">
                      <label className="flex items-center gap-2 text-sm text-white/60" htmlFor="private-gen-checkbox">
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
                        <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.12em] text-cyan-200">PRO</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mx-auto mt-2 flex max-w-full flex-nowrap justify-center gap-0 rounded-[14px] border border-white/10 bg-[rgba(20,20,24,0.35)] px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-[12px] max-[760px]:flex-wrap max-[760px]:justify-start max-[760px]:gap-1" aria-label="Example prompts">
                    {EXAMPLE_CHIPS.map(([label, value], index) => (
                      <button
                        key={label}
                        type="button"
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-white/12 bg-white/[0.05] px-[7px] py-[5px] font-mono text-[11px] tracking-[0.02em] text-[rgba(237,237,239,0.88)] transition-all duration-150 hover:-translate-y-px hover:border-violet-600/55 hover:bg-violet-600/20 hover:text-white disabled:cursor-wait disabled:opacity-50"
                        data-prompt={value}
                        data-react-owned="true"
                        title={value}
                        onClick={() => handleExamplePrompt(value)}
                      >
                        <span className="inline-flex h-3.5 min-w-3.5 shrink-0 items-center justify-center rounded bg-violet-600/55 px-1 text-[10px] font-bold text-white">{index + 1}</span>
                        <span className="whitespace-nowrap">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <HomeGallerySection />
        </div>
      </div>

      <footer className="relative z-[1] mx-auto mb-8 flex w-[min(1160px,calc(100%_-_48px))] flex-wrap items-center justify-between gap-5 rounded-[20px] border border-white/6 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))] px-7 py-[22px] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_80px_rgba(0,0,0,0.2),0_0_60px_rgba(100,80,200,0.04)] backdrop-blur-[20px] max-[720px]:w-[min(100%,calc(100%_-_32px))] max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-4">
        <span className="font-mono text-[13px] tracking-[0.12em] text-[#97a0b0]">SHIP FAST © {footerYear}</span>
        <nav className="flex flex-wrap items-center gap-5 [&_a]:text-[13px] [&_a]:text-[#97a0b0] [&_a]:transition-colors hover:[&_a]:text-[#EDEDEF]" aria-label="Footer links">
          <a href="/">Home</a>
          <a href="/pricing">Pricing</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
      </footer>

      <noscript>
        <div className="fixed inset-x-4 bottom-4 z-[300] rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          JavaScript is required for generation, but the homepage metadata is still rendered on the server.
        </div>
      </noscript>
    </div>
  )
}
