import { sfGlassPillAnchor, sfGlassPillBody } from './liquid-glass-button.js'

const NAV_LINKS = [
  { href: '/', label: 'Home', key: 'home' },
  { href: '/pricing', label: 'Pricing', key: 'pricing' },
  { href: '/privacy', label: 'Privacy', key: 'privacy' },
  { href: '/terms', label: 'Terms', key: 'terms' },
]

const navLogo = `
<a href="/" class="nav-brand" aria-label="SHIP FAST home">
  <svg width="18" height="18" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M26 4L8 20L14 22L26 10L38 22L44 20L26 4Z" fill="url(#sfMarketingRocketG1)" opacity="0.9" />
    <path d="M14 22L14 40L22 36V24L14 22Z" fill="url(#sfMarketingRocketG1)" opacity="0.8" />
    <path d="M38 22L38 40L30 36V24L38 22Z" fill="url(#sfMarketingRocketG1)" opacity="0.8" />
    <path d="M22 24V36L26 38L30 36V24L26 20L22 24Z" fill="url(#sfMarketingRocketG2)" />
    <path d="M22 38L26 48L30 38L26 40L22 38Z" fill="#a78bfa" opacity="0.7" />
    <circle cx="26" cy="16" r="2" fill="#c4b5fd" />
    <defs>
      <linearGradient id="sfMarketingRocketG1" x1="8" y1="4" x2="44" y2="48" gradientUnits="userSpaceOnUse">
        <stop stop-color="#7c3aed" />
        <stop offset="1" stop-color="#a78bfa" />
      </linearGradient>
      <linearGradient id="sfMarketingRocketG2" x1="14" y1="22" x2="38" y2="40" gradientUnits="userSpaceOnUse">
        <stop stop-color="#6d28d9" />
        <stop offset="1" stop-color="#7c3aed" />
      </linearGradient>
    </defs>
  </svg>
  <span class="nav-logo-text">SHIP FAST</span>
</a>
`

export const GLOBAL_LAUNCH_BACKDROP_HTML = `
  <div class="global-launch-backdrop" aria-hidden="true">
    <canvas class="global-launch-backdrop__canvas"></canvas>
  </div>
`

export const SPACE_BACKDROP_HTML = `
  <div class="stitch-grid" id="stitch-grid">
    <div class="stitch-grid__layer"></div>
    <div class="stitch-grid__layer stitch-grid__layer--lit" id="stitch-grid-lit"></div>
  </div>
  <div class="blackhole-vortex"></div>
  <div class="blackhole-ring"></div>
`

export const renderLaunchBackdropScript = () =>
  `<script type="module" src="/scripts/launch-backdrop.js${process.env.NODE_ENV === 'production' ? '' : `?v=${Date.now()}`}"></script>`

export const renderMarketingTopBarScript = () => ''

export const renderMarketingFonts = () => `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=JetBrains+Mono:wght@400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&display=swap"
    />`

export const MARKETING_ROCKET_SVG = navLogo

export const HOME_BOLT_LOGO_SVG = `
<svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M30.9 3.5 9.8 28.6h14.3l-4.2 19.9 22.3-27H27.7L30.9 3.5Z" fill="url(#sfMarketingHomeBoltG1)" />
  <path d="M30.9 3.5 9.8 28.6h14.3l-4.2 19.9 22.3-27H27.7L30.9 3.5Z" stroke="url(#sfMarketingHomeBoltG2)" stroke-width="2.2" stroke-linejoin="round" />
  <defs>
    <linearGradient id="sfMarketingHomeBoltG1" x1="11" y1="5" x2="42" y2="47" gradientUnits="userSpaceOnUse">
      <stop stop-color="#69f8ff" />
      <stop offset="0.54" stop-color="#1ab8ff" />
      <stop offset="1" stop-color="#6b3cff" />
    </linearGradient>
    <linearGradient id="sfMarketingHomeBoltG2" x1="8" y1="3" x2="44" y2="49" gradientUnits="userSpaceOnUse">
      <stop stop-color="#dffcff" />
      <stop offset="1" stop-color="#31dfff" stop-opacity="0.15" />
    </linearGradient>
  </defs>
</svg>`

export const renderMarketingLogoBlock = () => `<div class="logo-block marketing-logo-block">
  <a href="/" class="logo" aria-label="SHIP FAST home">
    <div class="logo-icon">${HOME_BOLT_LOGO_SVG}</div>
    <span class="logo-text">SHIP FAST</span>
  </a>
</div>`

export const BOLT_LOGO_SVG = `
<svg width="18" height="18" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M30.9 3.5 9.8 28.6h14.3l-4.2 19.9 22.3-27H27.7L30.9 3.5Z" fill="url(#sfBoltG1)" />
  <path d="M30.9 3.5 9.8 28.6h14.3l-4.2 19.9 22.3-27H27.7L30.9 3.5Z" stroke="url(#sfBoltG2)" stroke-width="2.2" stroke-linejoin="round" />
  <defs>
    <linearGradient id="sfBoltG1" x1="11" y1="5" x2="42" y2="47" gradientUnits="userSpaceOnUse">
      <stop stop-color="#69f8ff" />
      <stop offset="0.54" stop-color="#1ab8ff" />
      <stop offset="1" stop-color="#6b3cff" />
    </linearGradient>
    <linearGradient id="sfBoltG2" x1="8" y1="3" x2="44" y2="49" gradientUnits="userSpaceOnUse">
      <stop stop-color="#dffcff" />
      <stop offset="1" stop-color="#31dfff" stop-opacity="0.15" />
    </linearGradient>
  </defs>
</svg>`

const topBarBrand = `
<a href="/" class="top-actions-brand" aria-label="SHIP FAST home">
  <svg width="18" height="18" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M26 4L8 20L14 22L26 10L38 22L44 20L26 4Z" fill="url(#sfTopBarG1)" opacity="0.9" />
    <path d="M14 22L14 40L22 36V24L14 22Z" fill="url(#sfTopBarG1)" opacity="0.8" />
    <path d="M38 22L38 40L30 36V24L38 22Z" fill="url(#sfTopBarG1)" opacity="0.8" />
    <path d="M22 24V36L26 38L30 36V24L26 20L22 24Z" fill="url(#sfTopBarG2)" />
    <path d="M22 38L26 48L30 38L26 40L22 38Z" fill="#a78bfa" opacity="0.7" />
    <circle cx="26" cy="16" r="2" fill="#c4b5fd" />
    <defs>
      <linearGradient id="sfTopBarG1" x1="8" y1="4" x2="44" y2="48" gradientUnits="userSpaceOnUse">
        <stop stop-color="#7c3aed" />
        <stop offset="1" stop-color="#a78bfa" />
      </linearGradient>
      <linearGradient id="sfTopBarG2" x1="14" y1="22" x2="38" y2="40" gradientUnits="userSpaceOnUse">
        <stop stop-color="#6d28d9" />
        <stop offset="1" stop-color="#7c3aed" />
      </linearGradient>
    </defs>
  </svg>
  <span class="top-actions-brand-text">SHIP FAST</span>
</a>
`

export const renderTopActions = ({ showBrand = false } = {}) => {
  const brand = showBrand ? topBarBrand : ''
  return `<nav class="top-actions" aria-label="Primary">
    ${brand}
    <div class="top-actions-right">
      ${sfGlassPillAnchor({ className: 'pill--top-actions', href: '/pricing', text: 'Pricing' })}
    </div>
  </nav>`
}

const navLinksHtml = (activeKey) =>
  NAV_LINKS.map(
    ({ href, label, key }) =>
      `<a href="${href}"${activeKey === key ? ' class="active" aria-current="page"' : ''}>${label}</a>`,
  ).join('')

export const renderMarketingNav = (active = 'home') => `
<nav class="site-nav" aria-label="Main navigation">
  <div class="nav-inner">
    ${navLogo}
    <div class="nav-links">
      ${navLinksHtml(active)}
    </div>
    <a href="/" class="nav-cta">Get started</a>
  </div>
</nav>
`

export const renderSiteFooterContent = () => `
  <span class="footer-brand">SHIP FAST © ${new Date().getFullYear()}</span>
  <nav class="footer-nav" aria-label="Footer links">
    <a href="/">Home</a>
    <a href="/pricing">Pricing</a>
    <a href="/privacy">Privacy</a>
    <a href="/terms">Terms</a>
  </nav>
`

export const renderSiteFooter = () => `
  <footer class="site-footer">
    ${renderSiteFooterContent()}
  </footer>
`

export const renderMarketingShell = ({ active = 'home', includeFooter = false } = {}) => {
  const shellParts = [SPACE_BACKDROP_HTML, renderMarketingNav(active)]
  if (includeFooter) shellParts.push(renderSiteFooter())
  return shellParts.join('')
}
