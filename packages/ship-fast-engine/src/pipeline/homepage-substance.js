function extractBodyInnerHtml(html) {
  const m = String(html || '').match(/<body[^>]*>([\s\S]*)<\/body>/i)
  return m ? m[1] : String(html || '')
}

function visibleTextFromHtmlFragment(fragment) {
  return fragment
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function looksLikeThreeJsGame(html) {
  return (
    /three(?:\.min)?\.js/i.test(html) ||
    /\bTHREE\.(?:Scene|WebGLRenderer)\b/.test(html) ||
    /<canvas\b/i.test(html)
  )
}

function looksLikeDeclaredAppUi(html) {
  const h = String(html || '')
  return (
    /\bdata-mobile-nav-toggle\b/.test(h) ||
    (/\bdata-tab-group\b/.test(h) && /\bdata-tab-panel\b/.test(h)) ||
    (/<aside[^>]{0,200}\bw-64\b/i.test(h) &&
      /<main[^>]{0,120}\bflex-1\b/i.test(h)) ||
    (/<aside\b/i.test(h) && /<main\b/i.test(h)) ||
    (/\bclass="[^"]*\b(?:sidebar|app-shell|app-layout|dash-board|dash-layout|rail-nav|nav-rail)\b/i.test(
      h,
    ) &&
      /<main\b/i.test(h)) ||
    (/<nav\b/i.test(h) &&
      /<main\b/i.test(h) &&
      /\b(?:sidebar|drawer|panel|rail)\b/i.test(h))
  )
}

function hasMarketingStructure(bodyHtml) {
  const b = String(bodyHtml || '')
  const wc = visibleTextFromHtmlFragment(b).split(/\s+/).filter(Boolean).length
  if (/<(section|article)\b/i.test(b)) return true
  if (/<header\b/i.test(b) && /<footer\b/i.test(b)) return true
  if (/<(header|nav)\b/i.test(b) && /<main\b/i.test(b)) return true
  if (
    /\bclass="[^"]*\b(?:hero|masthead|pricing|features?|testimonial|cta|product|collection|catalog|shop-all|site-footer|navbar|logo-cloud|faq|newsletter)\b/i.test(
      b,
    )
  )
    return true
  if (/<main\b/i.test(b) && wc >= 40) return true
  if (/class="[^"]*\b(grid|grid-cols|md:grid)\b/i.test(b)) return true
  if (/class="[^"]*bento/i.test(b)) return true
  if (wc >= 48 && /<(div|ul|ol)\b/i.test(b) && /\b(?:button|href=)\b/i.test(b))
    return true
  return false
}

const siteSpecLooksEcommerce = (siteSpec) =>
  String(
    siteSpec?.siteType || siteSpec?.metadata?.siteType || '',
  ).toLowerCase() === 'ecommerce'

function hasEcommerceSignals(bodyHtml) {
  const textSignals =
    /\b(add to cart|add to bag|buy now|shop now|free shipping|checkout|your cart)\b/i.test(
      bodyHtml,
    ) || /\$\s*\d[\d,.]*/.test(bodyHtml)
  const retailMarkup =
    /class="[^"]*\b(product-card|product-grid|product-carousel|featured-products|shop-grid|pdp|price-row)\b/i.test(
      bodyHtml,
    ) ||
    /<(?:section|article|main)\b[^>]*class="[^"]*\b(?:products?|catalog|collection|shop-all)\b/i.test(
      bodyHtml,
    )
  return Boolean(textSignals || retailMarkup)
}

function looksLikeSubstantialEcommerceHomepage(html) {
  const body = extractBodyInnerHtml(html)
  const words = visibleTextFromHtmlFragment(body).split(/\s+/).filter(Boolean)
  const wc = words.length
  if (wc >= 95) return true
  if (wc >= 55 && hasEcommerceSignals(body) && hasMarketingStructure(body))
    return true
  return false
}

function looksLikeHybridLlmHomepage(html) {
  const h = String(html || '')
  if (!/(?:cdn\.tailwindcss\.com|\/scripts\/tailwind-browser\.js)/i.test(h))
    return false
  if (h.length < 12000) return false
  return /<(section|nav|footer)\b/i.test(h)
}

export function shouldReplaceLlmHomepageWithRenderer(html, siteSpec) {
  if (!html || typeof html !== 'string') return true
  if (!siteSpec?.pages?.length) return false
  if (looksLikeHybridLlmHomepage(html)) return false
  if (
    siteSpecLooksEcommerce(siteSpec) &&
    looksLikeSubstantialEcommerceHomepage(html)
  )
    return false

  if (looksLikeThreeJsGame(html)) return false
  if (looksLikeDeclaredAppUi(html)) return false

  const body = extractBodyInnerHtml(html)
  const words = visibleTextFromHtmlFragment(body).split(/\s+/).filter(Boolean)
  const wc = words.length
  const rawLen = String(html).length

  if (
    rawLen >= 14000 &&
    wc >= 42 &&
    /<(header|main|footer|nav|section|article)\b/i.test(body)
  )
    return false
  if (rawLen >= 9000 && wc >= 50) return false

  if (wc >= 58) return false

  if (wc < 32) return true

  if (!hasMarketingStructure(body) && wc < 58) return true

  return false
}

export function htmlDocumentPassesPreviewQuality(html, siteSpec) {
  return Boolean(
    html &&
    typeof html === 'string' &&
    !shouldReplaceLlmHomepageWithRenderer(html, siteSpec),
  )
}
