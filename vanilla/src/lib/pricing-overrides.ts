import { escapeHtml } from "./escape-html"
import type { SiteSettings } from "./sanity-site-settings"

export const applyPricingMainHtmlOverrides = (html: string, settings: SiteSettings) => {
  if (!settings || typeof html !== "string") return html
  let out = html
  if (settings.pricingHeroHeadline?.trim()) {
    const h = settings.pricingHeroHeadline.trim()
    out = out.replace(
      /<h1[^>]*id="pricing-heading"[^>]*>[\s\S]*?<\/h1>/,
      `<h1 id="pricing-heading">${escapeHtml(h)}</h1>`,
    )
  }
  return out
}
