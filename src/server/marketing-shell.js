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

export const SPACE_BACKDROP_HTML = `
  <div class="stitch-grid" id="stitch-grid">
    <div class="stitch-grid__layer"></div>
    <div class="stitch-grid__layer stitch-grid__layer--lit" id="stitch-grid-lit"></div>
  </div>
  <div class="blackhole-vortex"></div>
  <div class="blackhole-ring"></div>
`

export const MARKETING_ROCKET_SVG = navLogo

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
      <div class="top-actions-auth-slot">
        ${sfGlassPillBody({ id: 'signin-btn', className: 'pill--top-actions', bodyHtml: 'Sign in' })}
        ${sfGlassPillBody({
          id: 'signout-btn',
          className: 'pill--top-actions',
          bodyHtml:
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Sign out',
        })}
      </div>
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

export const renderSiteFooter = () => `
  <footer class="site-footer">
    <p>© ${new Date().getFullYear()} SHIP FAST. All rights reserved.</p>
  </footer>
`

export const renderMarketingShell = ({ active = 'home', includeFooter = false } = {}) => {
  const shellParts = [SPACE_BACKDROP_HTML, renderMarketingNav(active)]
  if (includeFooter) shellParts.push(renderSiteFooter())
  return shellParts.join('')
}
