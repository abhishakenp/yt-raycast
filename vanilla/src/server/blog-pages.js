import { escapeHtml } from '@ship-fast/engine/renderers/shared.js'

export const applyPricingPageOverrides = (html, settings) => {
  if (!settings || typeof html !== 'string') return html
  let out = html
  if (settings.pricingPageTitle?.trim()) {
    const t = settings.pricingPageTitle.trim()
    out = out.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(t)}</title>`)
    out = out.replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:title" content="${escapeHtml(t)}" />`,
    )
  }
  if (settings.pricingPageDescription?.trim()) {
    const d = settings.pricingPageDescription.trim()
    out = out.replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta name="description" content="${escapeHtml(d)}" />`,
    )
    out = out.replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${escapeHtml(d)}" />`,
    )
  }
  if (settings.pricingHeroHeadline?.trim()) {
    const h = settings.pricingHeroHeadline.trim()
    out = out.replace(
      /<h1[^>]*id="pricing-heading"[^>]*>[\s\S]*?<\/h1>/,
      `<h1 id="pricing-heading">${escapeHtml(h)}</h1>`,
    )
  }
  return out
}
