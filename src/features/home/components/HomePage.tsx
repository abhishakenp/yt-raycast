import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'

import { LaunchBackdrop } from '@/components/launch-backdrop'
import { usePromptHomeController } from '@/features/home/hooks/usePromptHomeController'
import { GLASS_LENS_FILTER_ID } from '@/lib/glass-pill-html'
import '@/styles/index.css'

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
  <svg className="sf-glass-sr-only" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
    <span className="pill__lens" aria-hidden="true" />
    <span className="pill__fringe pill__fringe--r" aria-hidden="true" />
    <span className="pill__fringe pill__fringe--b" aria-hidden="true" />
    <span className="pill__mist" aria-hidden="true" />
    <span className="pill__iris" aria-hidden="true" />
    <span className="pill__sheen" aria-hidden="true" />
    <span className="pill__rim" aria-hidden="true" />
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
    className={`pill${className ? ` ${className}` : ''}`}
    id={id}
    disabled={disabled}
    aria-label={ariaLabel}
    onClick={onClick}
  >
    <PillDecorations />
    <span className="pill__body">{children}</span>
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
  <a href={href} className={`pill${className ? ` ${className}` : ''}`}>
    <PillDecorations />
    <span className="pill__body">{children}</span>
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
    className="design-ref-search-icon"
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
    className="zap-icon"
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
  className: string
  id: string
  label: string
  title: string
}) => (
  <a
    className={`share-icon ${className}`}
    id={id}
    href="#"
    target="_blank"
    rel="noopener noreferrer"
    title={title}
    aria-label={label}
  >
    <svg className="share-icon-svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
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
    className={`private-gen-modal${isOpen ? ' is-open' : ''}`}
    id="private-gen-modal"
    aria-hidden={!isOpen}
  >
    <div className="private-gen-modal-backdrop" id="private-gen-modal-backdrop" onClick={onClose} />
    <div
      className="private-gen-modal-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="private-gen-modal-title"
    >
      <button
        className="pill pill--modal-close"
        id="private-gen-modal-close"
        aria-label="Close"
        onClick={onClose}
      >
        <span className="pill__body">Close</span>
      </button>
      <div className="private-gen-modal-icon">
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
      <h2 id="private-gen-modal-title">Private Generation</h2>
      <p>Your generated site won't be publicly listed - only you can access it.</p>
      <p>
        This is a <strong>Pro plan</strong> feature.
      </p>
      <a href="/pricing" className="private-gen-modal-btn">
        Upgrade to Pro
      </a>
    </div>
  </div>
)

const TopActions = () => (
  <nav className="top-actions" aria-label="Primary">
    <div className="top-actions-right">
      <GlassPillAnchor className="pill--top-actions" href="/pricing">
        Pricing
      </GlassPillAnchor>
      <GlassPillButton className="pill--top-actions">Sign in</GlassPillButton>
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
    <div className="sf-homepage-root">
      <GlassDefs />
      <LaunchBackdrop />

      <PrivateGenerationModal isOpen={privateModalOpen} onClose={() => setPrivateModalOpen(false)} />
      <TopActions />

      <div className="wappalyzer-banner" id="wappalyzer-banner">
        Sorry, Wappalyzer won't help you this time
      </div>

      <div className="page-layout">
        <div className="container sidebar-panel">
          <h1 className="sr-only">Ship Fast - AI website generator</h1>
          <div className="logo-block">
            <div className="logo">
              <div className="logo-icon">
                <LogoMark />
              </div>
              <span className="logo-text">SHIP FAST</span>
            </div>
            <p className="logo-tagline" id="logo-tagline" aria-live="polite" aria-hidden="true" />
          </div>

          <section className="launch-hero" aria-label="Print your mind in seconds">
            <div className="launch-visual" aria-hidden="true">
              <img
                className="launch-rocket"
                src="/assets/rocket-transparent.png"
                alt=""
                loading="eager"
                decoding="async"
              />
            </div>

            <div className="launch-copy">
              <p className="launch-eyebrow">Prompt. Generate. Launch.</p>
              <h2 className="launch-title">
                Print your mind
                <br />
                in seconds
              </h2>
            </div>

            <div className="launch-stage">
              <div className="launch-prompt-stack">
                <div className="hero-card launch-prompt-card" id="hero-card">
                  <div className="hero-card-inner">
                    <form id="prompt-form" className="input-group" onSubmit={handleSubmit}>
                      <label className="sr-only" htmlFor="prompt-input">
                        Describe the website you want to build
                      </label>
                      <div className="prompt-field">
                        <textarea
                          className="prompt-input"
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
                        <div className="prompt-placeholder" id="prompt-placeholder" aria-hidden="true">
                          <span className="prompt-placeholder-label">Try a prompt like</span>
                          <span className="prompt-placeholder-body">
                            <span className="prompt-placeholder-text" id="prompt-placeholder-text">
                              {prompt ? '' : visiblePlaceholder}
                            </span>
                            <span className="prompt-placeholder-caret" />
                          </span>
                        </div>
                        <div className="prompt-suggestions" id="prompt-suggestions" hidden>
                          <ul
                            className="prompt-suggestions-list"
                            id="prompt-suggestions-list"
                            role="listbox"
                            aria-label="Prompt ideas"
                          />
                        </div>
                        <div className="prompt-language-row is-hidden" id="prompt-language-row">
                          <label className="sr-only" htmlFor="prompt-language">
                            Preferred generation language
                          </label>
                          <select
                            className="prompt-language-select"
                            id="prompt-language"
                            name="prompt-language"
                            aria-label="Preferred generation language"
                          >
                            <LanguageOptions />
                          </select>
                        </div>
                      </div>

                      <div
                        className={`design-ref-panel${designRefOpen ? ' is-visible' : ''}`}
                        id="design-ref-panel"
                      >
                        <div className="design-ref-search-wrap">
                          <SearchIcon />
                          <input
                            className="design-ref-search"
                            type="text"
                            id="design-ref-search"
                            name="design-ref-search"
                            autoComplete="off"
                            placeholder="Search a site or paste an HTTPS URL"
                          />
                        </div>
                        <div className="design-ref-preview" id="design-ref-preview">
                          <img className="design-ref-preview-favicon" id="design-ref-preview-favicon" alt="" />
                          <div className="design-ref-preview-info">
                            <div className="design-ref-preview-title" id="design-ref-preview-title" />
                            <div className="design-ref-preview-url" id="design-ref-preview-url" />
                          </div>
                          <GlassPillButton
                            className="design-ref-preview-remove pill--icon-ghost"
                            id="design-ref-preview-remove"
                            ariaLabel="Remove"
                          >
                            <CloseIcon />
                          </GlassPillButton>
                        </div>

                        <p className="design-ref-hint">
                          Use a site you have rights to reference. Ship Fast creates an original layout.
                        </p>
                      </div>

                      <input type="hidden" id="design-ref-url-1" name="design-ref-url-1" value="" />
                      <input type="hidden" id="design-ref-url-2" name="design-ref-url-2" value="" />
                      <input type="hidden" id="design-ref-notes" name="design-ref-notes" value="" />

                      <div className="prompt-form-footer">
                        <div className="design-ref-toggle-row">
                          <input
                            type="checkbox"
                            className="design-ref-toggle"
                            id="design-ref-toggle"
                            checked={designRefOpen}
                            onChange={(event) => setDesignRefOpen(event.currentTarget.checked)}
                          />
                          <label className="design-ref-toggle-label" htmlFor="design-ref-toggle">
                            Layout inspiration
                          </label>
                        </div>
                        <GlassPillButton
                          type="submit"
                          className={`submit-btn${isSubmitting ? ' loading' : ''}`}
                          id="submit-btn"
                          disabled={!canSubmit}
                        >
                          <ZapIcon />
                          <span className="btn-label">Generate</span>
                          <div className="spinner" />
                        </GlassPillButton>
                      </div>
                    </form>

                    <div
                      className={`prompt-policy-violation${errorMessage ? ' is-visible' : ''}`}
                      id="prompt-policy-block"
                      role="alert"
                      aria-live="assertive"
                      hidden={!errorMessage}
                    >
                      {errorMessage}
                    </div>
                    <div className="gen-counter" id="gen-counter" style={{ display: 'none' }} />

                    <div className="share-bonus-panel" id="share-bonus-panel" style={{ display: 'none' }}>
                      <span className="share-bonus-label">Share for +1 free preview</span>
                      <div className="share-bonus-icons">
                        <ShareIcon className="share-icon-wa" id="bonus-share-wa" title="WhatsApp" label="Share on WhatsApp">
                          <path
                            fill="currentColor"
                            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                          />
                        </ShareIcon>
                        <ShareIcon className="share-icon-fb" id="bonus-share-fb" title="Facebook" label="Share on Facebook">
                          <path
                            fill="currentColor"
                            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                          />
                        </ShareIcon>
                        <ShareIcon className="share-icon-x" id="bonus-share-tw" title="X" label="Share on X">
                          <path
                            fill="currentColor"
                            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                          />
                        </ShareIcon>
                        <ShareIcon className="share-icon-tg" id="bonus-share-tg" title="Telegram" label="Share on Telegram">
                          <path
                            fill="currentColor"
                            d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
                          />
                        </ShareIcon>
                        <ShareIcon className="share-icon-li" id="bonus-share-li" title="LinkedIn" label="Share on LinkedIn">
                          <path
                            fill="currentColor"
                            d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                          />
                        </ShareIcon>
                        <GlassPillButton className="share-icon share-icon-native pill--share-32" id="bonus-share-native">
                          <svg
                            className="share-icon-svg share-icon-svg-stroke"
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

                    <div className="private-gen-row" id="private-gen-row" style={{ display: 'none' }}>
                      <label className="private-gen-label" htmlFor="private-gen-checkbox">
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
                        <span className="pro-badge">PRO</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="launch-right-panel">
                  <div className="dev-prompt-chips dev-prompt-chips--glass" aria-label="Example prompts">
                    {EXAMPLE_CHIPS.map(([label, value], index) => (
                      <button
                        key={label}
                        type="button"
                        className="dev-prompt-chip"
                        data-prompt={value}
                        data-react-owned="true"
                        title={value}
                        onClick={() => handleExamplePrompt(value)}
                      >
                        <span className="dev-prompt-chip-num">{index + 1}</span>
                        <span className="dev-prompt-chip-label">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="sessions" id="sessions-section" style={{ display: 'none' }} aria-live="polite">
            <h2>See what other speedsters generated</h2>
            <ul className="session-list" id="session-list" />
            <nav className="session-pagination" id="session-pagination" aria-label="Gallery pages" hidden>
              <p className="session-page-status" id="session-page-status" aria-live="polite" />
              <div className="session-pagination-actions" id="session-pagination-actions">
                <GlassPillButton className="session-page-btn pill--session" id="session-page-prev">
                  Previous
                </GlassPillButton>
                <GlassPillButton className="session-page-btn pill--session" id="session-page-next">
                  Next
                </GlassPillButton>
              </div>
            </nav>
          </section>
        </div>
      </div>

      <footer className="site-footer homepage-footer">
        <span className="footer-brand">SHIP FAST © {footerYear}</span>
        <nav className="footer-nav" aria-label="Footer links">
          <a href="/">Home</a>
          <a href="/pricing">Pricing</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
      </footer>

      <noscript>
        <div className="noscript-banner">
          JavaScript is required for generation, but the homepage metadata is still rendered on the server.
        </div>
      </noscript>
    </div>
  )
}
