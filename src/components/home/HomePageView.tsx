import promptLanguageOptions from '@/lib/prompt-language-options.json'
import { resolveSiteImageUrl } from '@/lib/sanity-site-settings'
import type { SiteSettings } from '@/lib/sanity-site-settings'
import { SITE_NAME } from '@/lib/site-config'
import { AuthOverlay } from '@/components/marketing/AuthOverlay'
import { PrivateGenModal } from '@/components/marketing/PrivateGenModal'
import { HomePublicGalleryWarmup } from '@/components/home/HomePublicGalleryWarmup'
import {
  HomeGalleryImperativeSync,
  HomeSessionGalleryList,
} from '@/components/home/HomeSessionGalleryList'
import { TopActionsNavHome } from '@/components/home/TopActionsNavHome'
import { SfGlassPillButton } from '@/components/ui/sf-glass-pill-button'
import Link from 'next/link'

const LogoBlock = () => (
  <div className="logo-block">
    <div className="logo">
      <div className="logo-icon">
        <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M26 4L8 20L14 22L26 10L38 22L44 20L26 4Z"
            fill="url(#sfHomeRocketG1)"
            opacity="0.9"
          />
          <path d="M14 22L14 40L22 36V24L14 22Z" fill="url(#sfHomeRocketG2)" opacity="0.8" />
          <path d="M38 22L38 40L30 36V24L38 22Z" fill="url(#sfHomeRocketG2)" opacity="0.8" />
          <path d="M22 24V36L26 38L30 36V24L26 20L22 24Z" fill="url(#sfHomeRocketG1)" />
          <path d="M22 38L26 48L30 38L26 40L22 38Z" fill="#a78bfa" opacity="0.7" />
          <circle cx="26" cy="16" r="2" fill="#c4b5fd" />
          <defs>
            <linearGradient
              id="sfHomeRocketG1"
              x1="8"
              y1="4"
              x2="44"
              y2="48"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#7c3aed" />
              <stop offset="1" stopColor="#a78bfa" />
            </linearGradient>
            <linearGradient
              id="sfHomeRocketG2"
              x1="14"
              y1="22"
              x2="38"
              y2="40"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#6d28d9" />
              <stop offset="1" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span className="logo-text">SHIP FAST</span>
    </div>
    <p className="logo-tagline" id="logo-tagline" aria-live="polite" aria-hidden="true" />
  </div>
)

export const HomePageView = ({ siteSettings }: { siteSettings: SiteSettings }) => {
  const heroSrc = resolveSiteImageUrl(siteSettings?.homeHeroImageUrl)
  return (
    <>
      <AuthOverlay />
      <PrivateGenModal />
      <TopActionsNavHome />
      <div className="wappalyzer-banner" id="wappalyzer-banner">
        Sorry, Wappalyzer won&apos;t help you this time
      </div>
      <div className="page-layout">
        <div className="container sidebar-panel">
          <h1 className="sr-only">{SITE_NAME} AI website generator</h1>
          <LogoBlock />
          {heroSrc ? (
            <div className="cms-home-hero">
              <img src={heroSrc} alt="" loading="lazy" decoding="async" />
            </div>
          ) : null}
          <div className="hero-card" id="hero-card">
            <div className="hero-card-inner">
              <form id="prompt-form" className="input-group">
                <label className="sr-only" htmlFor="prompt-input">
                  Describe the website you want to build
                </label>
                <div className="prompt-field">
                  <textarea
                    className="prompt-input"
                    id="prompt-input"
                    placeholder=""
                    autoFocus
                    autoComplete="off"
                    required
                    rows={4}
                    maxLength={5000}
                  />
                  <div className="prompt-placeholder" id="prompt-placeholder" aria-hidden="true">
                    <span className="prompt-placeholder-label">Try a prompt like</span>
                    <span className="prompt-placeholder-body">
                      <span className="prompt-placeholder-text" id="prompt-placeholder-text" />
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
                      {promptLanguageOptions.map(({ code, name }) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="design-ref-toggle-row">
                  <input type="checkbox" className="design-ref-toggle" id="design-ref-toggle" />
                  <label className="design-ref-toggle-label" htmlFor="design-ref-toggle">
                    Layout inspiration
                  </label>
                </div>
                <div className="design-ref-panel" id="design-ref-panel">
                  <div className="design-ref-search-wrap">
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
                    <input
                      className="design-ref-search"
                      type="text"
                      id="design-ref-search"
                      name="design-ref-search"
                      autoComplete="off"
                      placeholder="Search a website or paste a URL…"
                    />
                  </div>
                  <div className="design-ref-preview" id="design-ref-preview">
                    <img
                      className="design-ref-preview-favicon"
                      id="design-ref-preview-favicon"
                      alt=""
                    />
                    <div className="design-ref-preview-info">
                      <div className="design-ref-preview-title" id="design-ref-preview-title" />
                      <div className="design-ref-preview-url" id="design-ref-preview-url" />
                    </div>
                    <SfGlassPillButton
                      type="button"
                      className="design-ref-preview-remove pill--icon-ghost"
                      id="design-ref-preview-remove"
                      aria-label="Remove"
                    >
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
                    </SfGlassPillButton>
                  </div>
                  <p className="design-ref-hint">
                    Type a keyword like &quot;stripe&quot; or &quot;linear&quot; to find a site, or
                    paste any URL directly.
                  </p>
                </div>
                <input type="hidden" id="design-ref-url-1" name="design-ref-url-1" value="" />
                <input type="hidden" id="design-ref-url-2" name="design-ref-url-2" value="" />
                <input type="hidden" id="design-ref-notes" name="design-ref-notes" value="" />
                <SfGlassPillButton type="submit" className="submit-btn" id="submit-btn" disabled>
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
                  <span className="btn-label">Generate</span>
                  <div className="spinner" />
                </SfGlassPillButton>
              </form>
              <div
                className="prompt-policy-violation"
                id="prompt-policy-block"
                role="alert"
                aria-live="assertive"
                hidden
              />
              <div className="gen-counter" id="gen-counter" style={{ display: 'none' }} />
              <div className="share-bonus-panel" id="share-bonus-panel" style={{ display: 'none' }}>
                <span className="share-bonus-label">Share for +1 free preview</span>
                <div className="share-bonus-icons">
                  <a
                    className="share-icon share-icon-wa"
                    id="bonus-share-wa"
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="WhatsApp"
                    aria-label="Share on WhatsApp"
                  >
                    <svg
                      className="share-icon-svg"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                      />
                    </svg>
                  </a>
                  <a
                    className="share-icon share-icon-fb"
                    id="bonus-share-fb"
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Facebook"
                    aria-label="Share on Facebook"
                  >
                    <svg
                      className="share-icon-svg"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      />
                    </svg>
                  </a>
                  <a
                    className="share-icon share-icon-x"
                    id="bonus-share-tw"
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="X"
                    aria-label="Share on X"
                  >
                    <svg
                      className="share-icon-svg"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                      />
                    </svg>
                  </a>
                  <a
                    className="share-icon share-icon-tg"
                    id="bonus-share-tg"
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Telegram"
                    aria-label="Share on Telegram"
                  >
                    <svg
                      className="share-icon-svg"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
                      />
                    </svg>
                  </a>
                  <a
                    className="share-icon share-icon-li"
                    id="bonus-share-li"
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="LinkedIn"
                    aria-label="Share on LinkedIn"
                  >
                    <svg
                      className="share-icon-svg"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                      />
                    </svg>
                  </a>
                  <SfGlassPillButton
                    type="button"
                    className="share-icon share-icon-native pill--share-32"
                    id="bonus-share-native"
                    title="Share"
                    aria-label="Share"
                    hidden
                  >
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
                  </SfGlassPillButton>
                </div>
                <span className="share-bonus-or">
                  or{' '}
                  <a href="#" id="share-bonus-signup-link">
                    sign up
                  </a>
                </span>
              </div>
              <div className="private-gen-row" id="private-gen-row" style={{ display: 'none' }}>
                <label className="private-gen-label" htmlFor="private-gen-checkbox">
                  <input type="checkbox" id="private-gen-checkbox" />
                  <span>Private generation</span>
                  <span className="pro-badge">PRO</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <section
          className="sessions"
          id="sessions-section"
          style={{ display: 'none' }}
          aria-live="polite"
        >
          <h2>See what other speedsters generated</h2>
          <HomeSessionGalleryList />
          <HomePublicGalleryWarmup />
          <HomeGalleryImperativeSync />
          <nav
            className="session-pagination"
            id="session-pagination"
            aria-label="Gallery pages"
            hidden
          >
            <p className="session-page-status" id="session-page-status" aria-live="polite" />
            <div className="session-pagination-actions" id="session-pagination-actions">
              <SfGlassPillButton
                type="button"
                className="session-page-btn pill--session"
                id="session-page-prev"
              >
                Previous
              </SfGlassPillButton>
              <SfGlassPillButton
                type="button"
                className="session-page-btn pill--session"
                id="session-page-next"
              >
                Next
              </SfGlassPillButton>
            </div>
          </nav>
        </section>
      </div>
      <footer className="homepage-footer">
        <nav className="homepage-footer-legal" aria-label="Legal">
          <Link href="/pricing">Pricing</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </footer>
      <noscript>
        <div className="noscript-banner">
          JavaScript is required for sign-in and generation, but the homepage metadata is still
          rendered on the server.
        </div>
      </noscript>
    </>
  )
}
