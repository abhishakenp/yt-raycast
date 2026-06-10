import { Show, SignInButton, UserButton } from '@clerk/tanstack-react-start'
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'

import { LaunchBackdrop } from '@/components/launch-backdrop'
import { usePromptHomeController } from '@/features/home/hooks/usePromptHomeController'
import { GLASS_LENS_FILTER_ID } from '@/lib/glass-pill-html'
import { cn } from '@/lib/utils'

const LANGUAGE_OPTIONS = [
  ['en', 'English'],
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

const EXAMPLE_CHIPS = [
  [
    'Image studio',
    'This app is going to be an image generation studio using various AI models to turn a prompt into images. Design a mocked version (no backend). It should be dark mode. Focus on making it beautiful.',
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

const GlassDefs = () => (
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

const GlassPillButton = ({
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
      'relative isolate inline-flex min-h-12 cursor-pointer items-center justify-center overflow-hidden rounded-full border-0 bg-transparent px-5 py-3 font-[inherit] font-semibold tracking-[-0.015em] text-inherit shadow-[0_14px_32px_rgba(0,0,0,0.38)] transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.25)] [-webkit-tap-highlight-color:transparent] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white',
      className,
    )}
    id={id}
    disabled={disabled}
    aria-label={ariaLabel}
    onClick={onClick}
  >
    <PillDecorations />
    <span className="relative z-[7] inline-flex items-center justify-center gap-2 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">{children}</span>
  </button>
)

const GlassPillAnchor = ({
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
      'relative isolate inline-flex min-h-12 cursor-pointer items-center justify-center overflow-hidden rounded-full border-0 bg-transparent px-5 py-3 font-[inherit] font-semibold tracking-[-0.015em] text-inherit shadow-[0_14px_32px_rgba(0,0,0,0.38)] transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.25)] [-webkit-tap-highlight-color:transparent] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white',
      className,
    )}
  >
    <PillDecorations />
    <span className="relative z-[7] inline-flex items-center justify-center gap-2 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">{children}</span>
  </a>
)

const LogoMark = () => (
  <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M30.9 3.5 9.8 28.6h14.3l-4.2 19.9 22.3-27H27.7L30.9 3.5Z"
      fill="url(#sfHomeBoltG1)"
    />
    <path
      d="M30.9 3.5 9.8 28.6h14.3l-4.2 19.9 22.3-27H27.7L30.9 3.5Z"
      stroke="url(#sfHomeBoltG2)"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="sfHomeBoltG1" x1="11" y1="5" x2="42" y2="47" gradientUnits="userSpaceOnUse">
        <stop stopColor="#69f8ff" />
        <stop offset="0.54" stopColor="#1ab8ff" />
        <stop offset="1" stopColor="#6b3cff" />
      </linearGradient>
      <linearGradient id="sfHomeBoltG2" x1="8" y1="3" x2="44" y2="49" gradientUnits="userSpaceOnUse">
        <stop stopColor="#dffcff" />
        <stop offset="1" stopColor="#31dfff" stopOpacity="0.15" />
      </linearGradient>
    </defs>
  </svg>
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
}: {
  children: ReactNode
  className?: string
  id: string
  label: string
  title: string
}) => (
  <a
    className={cn(
      'grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-white/75 shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-y-px hover:bg-white/[0.1] hover:text-white',
      className,
    )}
    id={id}
    href="#"
    target="_blank"
    rel="noopener noreferrer"
    title={title}
    aria-label={label}
  >
    <svg className="size-[18px]" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      {children}
    </svg>
  </a>
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
  <nav className="pointer-events-none fixed inset-x-0 top-0 z-[210] flex items-center justify-start gap-2 bg-transparent px-[var(--top-actions-inset-inline)] py-[var(--top-actions-inset-block)]" aria-label="Primary">
    <div className="pointer-events-auto ml-auto flex items-center gap-2">
      <GlassPillAnchor className="min-h-9 px-4 py-0 font-sans text-[13px] font-medium text-[var(--text-primary,#f0f0f5)] [&>span:last-child]:gap-1.5" href="/pricing">
        Pricing
      </GlassPillAnchor>
      {isClerkConfigured ? (
        <>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <GlassPillButton className="min-h-9 px-4 py-0 font-sans text-[13px] font-medium text-[var(--text-primary,#f0f0f5)] [&>span:last-child]:gap-1.5">Sign in</GlassPillButton>
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

const LanguageOptions = () => (
  <>
    {LANGUAGE_OPTIONS.map(([code, name]) => (
      <option key={code} value={code}>
        {name}
      </option>
    ))}
  </>
)

export const HomePage = () => {
  const {
    canSubmit,
    errorMessage,
    isSubmitting,
    prompt,
    selectExamplePrompt,
    setPrompt,
    submitPrompt,
  } = usePromptHomeController()
  const [designRefOpen, setDesignRefOpen] = useState(false)
  const [privateModalOpen, setPrivateModalOpen] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [placeholderLength, setPlaceholderLength] = useState(0)

  const placeholderText = SAMPLE_PLACEHOLDERS[placeholderIndex]
  const visiblePlaceholder = useMemo(
    () => placeholderText.slice(0, placeholderLength),
    [placeholderLength, placeholderText],
  )

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    void submitPrompt({
      prompt: String(formData.get('prompt') ?? prompt),
      preferredLanguage: String(formData.get('prompt-language') ?? 'en'),
      isPrivate: formData.get('private-generation') === 'on',
    })
  }

  const handleExamplePrompt = (value: string) => {
    selectExamplePrompt(value)
    void submitPrompt({ prompt: value })
  }

  const footerYear = new Date().getFullYear()

  return (
    <div className="min-h-screen w-full overflow-x-hidden text-[var(--text-primary)]">
      <GlassDefs />
      <LaunchBackdrop />

      <PrivateGenerationModal isOpen={privateModalOpen} onClose={() => setPrivateModalOpen(false)} />
      <TopActions />

      <div className="hidden" id="wappalyzer-banner">
        Sorry, Wappalyzer won't help you this time
      </div>

      <div className="flex w-full flex-col items-center">
        <div className="relative z-[4] flex w-full max-w-[640px] min-w-0 flex-col items-center px-6 pt-[120px] pb-[60px] max-[760px]:px-6 max-[760px]:pt-[112px] max-[760px]:pb-10">
          <h1 className="sr-only">Ship Fast - AI website generator</h1>
          <div className="mb-10 flex w-full flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <div className="size-12 text-cyan-300 drop-shadow-[0_0_18px_rgba(38,231,255,0.58)] [&_svg]:size-full">
                <LogoMark />
              </div>
              <span className="bg-[linear-gradient(135deg,#ffffff_0%,#dffbff_46%,#23e5ff_100%)] bg-[length:180%_180%] bg-clip-text font-sans text-[34px] font-extrabold tracking-[-0.055em] text-transparent [-webkit-text-fill-color:transparent]">SHIP FAST</span>
            </div>
            <p className="m-0 text-center font-mono text-xs uppercase tracking-[0.18em] text-white/45" id="logo-tagline" aria-live="polite" aria-hidden="true" />
          </div>

          <section className="relative flex w-full flex-col items-center gap-6" aria-label="Print your mind in seconds">
            <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-80" aria-hidden="true">
              <img
                className="w-[min(88vw,560px)] max-w-full translate-y-10 opacity-65 drop-shadow-[0_0_80px_rgba(38,231,255,0.22)]"
                src="/assets/rocket-transparent.png"
                alt=""
                loading="eager"
                decoding="async"
              />
            </div>

            <div className="relative z-[2] w-full text-center">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-cyan-200/75">Prompt. Generate. Launch.</p>
              <h2 className="font-[var(--font-display)] text-[clamp(2.5rem,8vw,4.6rem)] leading-[0.92] tracking-[-0.055em] text-white">
                Print your mind
                <br />
                in seconds
              </h2>
            </div>

            <div className="relative z-[3] w-full">
              <div className="grid w-full gap-4">
                <div className="rounded-[28px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-2 shadow-[var(--glass-shadow)] backdrop-blur-[20px]" id="hero-card">
                  <div className="rounded-[22px] border border-white/10 bg-black/25 p-5">
                    <form id="prompt-form" className="grid gap-4" onSubmit={handleSubmit}>
                      <label className="sr-only" htmlFor="prompt-input">
                        Describe the website you want to build
                      </label>
                      <div className="relative">
                        <textarea
                          className="min-h-32 w-full resize-none rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-input)] px-5 py-4 font-sans text-base leading-relaxed text-[var(--text-primary)] outline-none transition-all duration-300 placeholder:text-transparent focus:border-[var(--border-accent)] focus:shadow-[0_0_0_3px_rgba(138,180,255,0.08),0_0_20px_rgba(138,180,255,0.06)]"
                          id="prompt-input"
                          name="prompt"
                          placeholder=""
                          autoFocus
                          autoComplete="off"
                          required
                          rows={3}
                          maxLength={5000}
                          value={prompt}
                          onChange={(event) => setPrompt(event.currentTarget.value)}
                        />
                        <div className={cn('pointer-events-none absolute inset-x-5 top-4 text-left', prompt && 'hidden')} id="prompt-placeholder" aria-hidden="true">
                          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">Try a prompt like</span>
                          <span className="block text-base leading-relaxed text-white/45">
                            <span id="prompt-placeholder-text">
                              {prompt ? '' : visiblePlaceholder}
                            </span>
                            <span className="ml-0.5 inline-block h-5 w-px animate-pulse bg-cyan-200/60 align-middle" />
                          </span>
                        </div>
                        <div className="mt-2 hidden rounded-xl border border-white/10 bg-black/50 p-2" id="prompt-suggestions" hidden>
                          <ul
                            className="grid gap-1"
                            id="prompt-suggestions-list"
                            role="listbox"
                            aria-label="Prompt ideas"
                          />
                        </div>
                        <div className="hidden" id="prompt-language-row">
                          <label className="sr-only" htmlFor="prompt-language">
                            Preferred generation language
                          </label>
                          <select
                            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                            id="prompt-language"
                            name="prompt-language"
                            aria-label="Preferred generation language"
                          >
                            <LanguageOptions />
                          </select>
                        </div>
                      </div>

                      <div
                        className={cn('hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3', designRefOpen && 'grid gap-3')}
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

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="size-4 accent-cyan-300"
                            id="design-ref-toggle"
                            checked={designRefOpen}
                            onChange={(event) => setDesignRefOpen(event.currentTarget.checked)}
                          />
                          <label className="text-sm text-white/60" htmlFor="design-ref-toggle">
                            Layout inspiration
                          </label>
                        </div>
                        <GlassPillButton
                          type="submit"
                          className={cn('min-h-12 px-5 py-0 text-sm text-white', isSubmitting && 'opacity-70')}
                          id="submit-btn"
                          disabled={!canSubmit}
                        >
                          <ZapIcon />
                          <span>Generate</span>
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

                    <div className="hidden items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white/65" id="share-bonus-panel">
                      <span>Share for +1 free preview</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <ShareIcon className="text-[#25d366]" id="bonus-share-wa" title="WhatsApp" label="Share on WhatsApp">
                          <path
                            fill="currentColor"
                            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                          />
                        </ShareIcon>
                        <ShareIcon className="text-[#1877f2]" id="bonus-share-fb" title="Facebook" label="Share on Facebook">
                          <path
                            fill="currentColor"
                            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                          />
                        </ShareIcon>
                        <ShareIcon className="text-white" id="bonus-share-tw" title="X" label="Share on X">
                          <path
                            fill="currentColor"
                            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                          />
                        </ShareIcon>
                        <ShareIcon className="text-[#2aabee]" id="bonus-share-tg" title="Telegram" label="Share on Telegram">
                          <path
                            fill="currentColor"
                            d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
                          />
                        </ShareIcon>
                        <ShareIcon className="text-[#0a66c2]" id="bonus-share-li" title="LinkedIn" label="Share on LinkedIn">
                          <path
                            fill="currentColor"
                            d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                          />
                        </ShareIcon>
                        <GlassPillButton className="size-8 min-h-8 min-w-8 p-0" id="bonus-share-native">
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
                  <div className="grid grid-cols-2 gap-3 max-[460px]:grid-cols-2" aria-label="Example prompts">
                    {EXAMPLE_CHIPS.map(([label, value], index) => (
                      <button
                        key={label}
                        type="button"
                        className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-left text-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-[14px] transition-all duration-300 hover:-translate-y-px hover:border-white/20 hover:bg-white/[0.07]"
                        data-prompt={value}
                        data-react-owned="true"
                        title={value}
                        onClick={() => handleExamplePrompt(value)}
                      >
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-cyan-300/10 font-mono text-xs text-cyan-200">{index + 1}</span>
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="hidden" id="sessions-section" aria-live="polite">
            <h2>See what other speedsters generated</h2>
            <ul className="grid gap-4" id="session-list" />
            <nav className="mt-5 flex items-center justify-between gap-3" id="session-pagination" aria-label="Gallery pages" hidden>
              <p className="m-0 text-sm text-white/50" id="session-page-status" aria-live="polite" />
              <div className="flex items-center gap-2" id="session-pagination-actions">
                <GlassPillButton className="min-h-9 px-5 py-0 font-sans text-[13px] font-medium text-[var(--text-primary,#f0f0f5)]" id="session-page-prev">
                  Previous
                </GlassPillButton>
                <GlassPillButton className="min-h-9 px-5 py-0 font-sans text-[13px] font-medium text-[var(--text-primary,#f0f0f5)]" id="session-page-next">
                  Next
                </GlassPillButton>
              </div>
            </nav>
          </section>
        </div>
      </div>

      <footer className="relative z-[1] mx-auto mb-8 flex w-[min(1160px,calc(100%-48px))] flex-wrap items-center justify-between gap-5 rounded-[20px] border border-[var(--glass-border)] bg-[var(--glass-bg)] px-7 py-[22px] shadow-[var(--glass-shadow),0_0_60px_rgba(100,80,200,0.04)] backdrop-blur-[20px] max-[720px]:w-[min(100%,calc(100%-32px))] max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-4">
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
