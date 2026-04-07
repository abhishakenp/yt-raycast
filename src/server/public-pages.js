import {
  isSanityConfigured,
  PLAUSIBLE_DOMAIN,
  SITE_NAME,
  SITE_URL,
  SUPPORTED_INDIAN_LANGUAGES,
} from '../config.js'
import { escapeHtml } from '../renderers/shared.js'

const HOME_TITLE = `${SITE_NAME} - AI Website Generator`
const HOME_DESCRIPTION =
  'Generate a public homepage, review the preview, and export clean HTML, React, or Next.js output.'
const HOME_KEYWORDS = [
  'ai website generator',
  'ai homepage generator',
  'landing page generator',
  'saas website builder',
  'react website generator',
  'nextjs website generator',
].join(', ')
const OG_IMAGE_URL = `${SITE_URL}/og-image.png`

function renderStructuredData(descriptionOverride) {
  const desc = descriptionOverride ?? HOME_DESCRIPTION
  return JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      url: SITE_URL,
      operatingSystem: 'Web',
      applicationCategory: 'DeveloperApplication',
      description: desc,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      screenshot: OG_IMAGE_URL,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      description: desc,
    },
  ])
}

function renderLogo() {
  return `<div class="logo-block">
    <div class="logo">
      <div class="logo-icon">
        <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M26 4L8 20L14 22L26 10L38 22L44 20L26 4Z" fill="url(#g1)" opacity="0.9" />
          <path d="M14 22L14 40L22 36V24L14 22Z" fill="url(#g2)" opacity="0.8" />
          <path d="M38 22L38 40L30 36V24L38 22Z" fill="url(#g2)" opacity="0.8" />
          <path d="M22 24V36L26 38L30 36V24L26 20L22 24Z" fill="url(#g1)" />
          <path d="M22 38L26 48L30 38L26 40L22 38Z" fill="#a78bfa" opacity="0.7" />
          <circle cx="26" cy="16" r="2" fill="#c4b5fd" />
          <defs>
            <linearGradient id="g1" x1="8" y1="4" x2="44" y2="48" gradientUnits="userSpaceOnUse">
              <stop stop-color="#7c3aed" />
              <stop offset="1" stop-color="#a78bfa" />
            </linearGradient>
            <linearGradient id="g2" x1="14" y1="22" x2="38" y2="40" gradientUnits="userSpaceOnUse">
              <stop stop-color="#6d28d9" />
              <stop offset="1" stop-color="#7c3aed" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span class="logo-text">SHIP FAST</span>
    </div>
    <p class="logo-tagline" id="logo-tagline" aria-live="polite" aria-hidden="true"></p>
  </div>`
}

function renderLanguageOptions() {
  const options = [{ code: 'en', name: 'English' }, ...SUPPORTED_INDIAN_LANGUAGES]

  return options
    .map(({ code, name }) => `<option value="${escapeHtml(code)}">${escapeHtml(name)}</option>`)
    .join('')
}

function renderAuthOverlay() {
  return `<div id="auth-overlay" class="hidden">
    <div class="auth-box">
      <div class="auth-logo">SHIP FAST</div>
      <p class="auth-title">Sign in to continue</p>
      <button class="auth-btn" id="google-signin-btn" type="button">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Sign in with Google
      </button>
      <button class="auth-btn" id="github-signin-btn" type="button">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
        Sign in with GitHub
      </button>
      <div class="auth-divider">or</div>
      <input class="auth-input" type="email" id="auth-email" placeholder="Email" autocomplete="email" />
      <input class="auth-input" type="password" id="auth-password" placeholder="Password" autocomplete="current-password" />
      <div class="auth-email-row">
        <button class="auth-btn" id="email-signin-btn" type="button">Sign in</button>
        <button class="auth-btn" id="email-signup-btn" type="button">Create account</button>
      </div>
      <div class="auth-error" id="auth-error"></div>
    </div>
  </div>`
}

function renderTopActions() {
  const blogLink = isSanityConfigured()
    ? '<a class="top-action-link" href="/blog">Blog</a>'
    : ''
  return `<nav class="top-actions" aria-label="Primary">
    ${blogLink}
    <a class="top-action-link" href="/pricing">Pricing</a>
    <div class="top-actions-auth-slot">
      <button id="signin-btn" type="button">Sign in</button>
      <button id="signout-btn" type="button">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Sign out
      </button>
    </div>
  </nav>`
}

export function renderHomePage(siteSettings = null) {
  const pageTitle = siteSettings?.homeTitle?.trim() || HOME_TITLE
  const pageDescription = siteSettings?.homeDescription?.trim() || HOME_DESCRIPTION
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="sf-home" content="ssr" />
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(pageDescription)}" />
    <meta name="keywords" content="${escapeHtml(HOME_KEYWORDS)}" />
    <meta name="author" content="${escapeHtml(SITE_NAME)}" />
    <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
    <meta name="theme-color" content="#05030d" />
    <meta name="format-detection" content="telephone=no" />
    <link rel="canonical" href="${escapeHtml(SITE_URL)}" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://www.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap"
    />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(SITE_URL)}" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(pageDescription)}" />
    <meta property="og:image" content="${escapeHtml(OG_IMAGE_URL)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Ship Fast homepage preview" />
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(pageDescription)}" />
    <meta name="twitter:image" content="${escapeHtml(OG_IMAGE_URL)}" />
    <meta name="twitter:image:alt" content="Ship Fast homepage preview" />
    <script defer data-domain="${escapeHtml(PLAUSIBLE_DOMAIN)}" data-api="/api/event" src="/js/script.js"></script>
    <script type="application/ld+json">${renderStructuredData(pageDescription)}</script>
    <link rel="stylesheet" href="/styles/index.css" />
  </head>
  <body>
    <script>
      try {
        var __sfAnon = JSON.parse(localStorage.getItem('sf_anon_sessions') || '[]')
        if (__sfAnon.length) document.body.classList.add('has-sessions')
      } catch (e) {}
    </script>
    ${renderAuthOverlay()}

    <div class="private-gen-modal" id="private-gen-modal" aria-hidden="true">
      <div class="private-gen-modal-backdrop" id="private-gen-modal-backdrop"></div>
      <div class="private-gen-modal-card" role="dialog" aria-modal="true" aria-labelledby="private-gen-modal-title">
        <button class="private-gen-modal-close" id="private-gen-modal-close" type="button" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="private-gen-modal-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h2 id="private-gen-modal-title">Private Generation</h2>
        <p>Your generated site won't be publicly listed — only you can access it.</p>
        <p>This is a <strong>Pro plan</strong> feature.</p>
        <a href="/pricing" class="private-gen-modal-btn">Upgrade to Pro</a>
      </div>
    </div>

    ${renderTopActions()}

    <div class="wappalyzer-banner" id="wappalyzer-banner">Sorry, Wappalyzer won't help you this time</div>
    <div class="bg-glow"></div>

    <div class="container">
      <h1 class="sr-only">${escapeHtml(SITE_NAME)} AI website generator</h1>
      ${renderLogo()}
      <form id="prompt-form" class="input-group">
        <label class="sr-only" for="prompt-input">Describe the website you want to build</label>
        <div class="prompt-field">
          <textarea
            class="prompt-input"
            id="prompt-input"
            placeholder=""
            autofocus
            autocomplete="off"
            required
            rows="4"
            maxlength="5000"
          ></textarea>
          <div class="prompt-placeholder" id="prompt-placeholder" aria-hidden="true">
            <span class="prompt-placeholder-label">Try a prompt like</span>
            <span class="prompt-placeholder-body">
              <span class="prompt-placeholder-text" id="prompt-placeholder-text"></span>
              <span class="prompt-placeholder-caret"></span>
            </span>
          </div>
          <div class="prompt-language-row is-hidden" id="prompt-language-row">
            <label class="sr-only" for="prompt-language">Preferred generation language</label>
            <select
              class="prompt-language-select"
              id="prompt-language"
              name="prompt-language"
              aria-label="Preferred generation language"
            >
              ${renderLanguageOptions()}
            </select>
          </div>
        </div>
        <button type="submit" class="submit-btn" id="submit-btn" disabled>
          <svg
            class="zap-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span class="btn-label">Generate</span>
          <div class="spinner"></div>
        </button>
      </form>
      <div
        class="prompt-policy-violation"
        id="prompt-policy-block"
        role="alert"
        aria-live="assertive"
        hidden
      ></div>
      <div class="gen-counter" id="gen-counter" style="display:none"></div>
      <div class="share-bonus-panel" id="share-bonus-panel" style="display:none">
        <span class="share-bonus-label">Share for +1 free preview</span>
        <div class="share-bonus-icons">
          <a class="share-icon share-icon-wa" id="bonus-share-wa" href="#" target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="Share on WhatsApp"><svg class="share-icon-svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
          <a class="share-icon share-icon-fb" id="bonus-share-fb" href="#" target="_blank" rel="noopener noreferrer" title="Facebook" aria-label="Share on Facebook"><svg class="share-icon-svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
          <a class="share-icon share-icon-x" id="bonus-share-tw" href="#" target="_blank" rel="noopener noreferrer" title="X" aria-label="Share on X"><svg class="share-icon-svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
          <a class="share-icon share-icon-tg" id="bonus-share-tg" href="#" target="_blank" rel="noopener noreferrer" title="Telegram" aria-label="Share on Telegram"><svg class="share-icon-svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg></a>
          <a class="share-icon share-icon-li" id="bonus-share-li" href="#" target="_blank" rel="noopener noreferrer" title="LinkedIn" aria-label="Share on LinkedIn"><svg class="share-icon-svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
          <button type="button" class="share-icon share-icon-native" id="bonus-share-native" title="Share" aria-label="Share" hidden><svg class="share-icon-svg share-icon-svg-stroke" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg></button>
        </div>
        <span class="share-bonus-or">or <a href="#" id="share-bonus-signup-link">sign up</a></span>
      </div>
      <div class="private-gen-row" id="private-gen-row" style="display:none">
        <label class="private-gen-label" for="private-gen-checkbox">
          <input type="checkbox" id="private-gen-checkbox" />
          <span>Private generation</span>
          <span class="pro-badge">PRO</span>
        </label>
      </div>
    </div>

    <section class="sessions" id="sessions-section" style="display: none" aria-live="polite">
      <h2>See what other speedsters generated</h2>
      <ul class="session-list" id="session-list"></ul>
      <nav class="session-pagination" id="session-pagination" aria-label="Gallery pages" hidden>
        <p class="session-page-status" id="session-page-status" aria-live="polite"></p>
        <div class="session-pagination-actions" id="session-pagination-actions">
          <button type="button" class="session-page-btn" id="session-page-prev">Previous</button>
          <button type="button" class="session-page-btn" id="session-page-next">Next</button>
        </div>
      </nav>
    </section>

    <footer class="homepage-footer">
      <nav class="homepage-footer-legal" aria-label="Legal">
        <a href="/pricing">Pricing</a>
        <a href="/privacy">Privacy</a>
      </nav>
      <div class="homepage-footer-social">
        <a href="https://liviogama.com" target="_blank" rel="noopener" aria-label="Website">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        </a>
        <a href="https://www.linkedin.com/in/livio-gamassia/" target="_blank" rel="noopener" aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </a>
        <a href="https://x.com/LivioGama" target="_blank" rel="noopener" aria-label="X">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
      </div>
    </footer>

    <noscript>
      <div class="noscript-banner">
        JavaScript is required for sign-in and generation, but the homepage metadata is still rendered on the server.
      </div>
    </noscript>

    <script type="module" src="/scripts/homepage.js"></script>
  </body>
</html>`
}

export function renderRobotsTxt() {
  return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /session/
Disallow: /preview/

Sitemap: ${SITE_URL}/sitemap.xml
`
}

export function renderSitemapXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeHtml(SITE_URL)}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${escapeHtml(SITE_URL)}/pricing</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${escapeHtml(SITE_URL)}/blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${escapeHtml(SITE_URL)}/privacy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
`
}
