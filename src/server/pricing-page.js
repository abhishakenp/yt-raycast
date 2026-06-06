import { PRICING_PAGE_MAIN_HTML } from '../lib/pricing-main-html.ts'
import { PLAUSIBLE_DOMAIN, SITE_URL } from '../config.js'
import { sfGlassPillSvgDefs } from './liquid-glass-button.js'
import {
  GLOBAL_LAUNCH_BACKDROP_HTML,
  renderLaunchBackdropScript,
  renderMarketingFonts,
  renderMarketingLogoBlock,
  renderMarketingTopBarScript,
  renderTopActions,
} from './marketing-shell.js'

export const renderPricingPage = () => {
  const canonicalUrl = `${SITE_URL.replace(/\/$/, '')}/pricing`

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="sf-pricing" content="ssr" />
    <title>Ship Fast — Pricing</title>
    <meta name="description" content="Simple pricing for Ship Fast. Start free, lock the early adopter rate forever at ₹199/month before slots run out." />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <meta name="theme-color" content="#020413" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="Ship Fast — Pricing" />
    <meta property="og:description" content="Start free. Lock the early adopter rate at ₹199/month forever." />
    <meta property="og:image" content="${SITE_URL.replace(/\/$/, '')}/og-image.png" />
    ${renderMarketingFonts()}
    <script defer data-domain="${PLAUSIBLE_DOMAIN}" data-api="/api/event" src="/js/script.js"></script>
    <link rel="stylesheet" href="/styles/pricing.css" />
  </head>
  <body>
    ${sfGlassPillSvgDefs()}
    ${GLOBAL_LAUNCH_BACKDROP_HTML}
    ${renderTopActions()}
    ${renderMarketingLogoBlock()}
    ${PRICING_PAGE_MAIN_HTML}
    ${renderMarketingTopBarScript()}
    ${renderLaunchBackdropScript()}
  </body>
</html>`
}
