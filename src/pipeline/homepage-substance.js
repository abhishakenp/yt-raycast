function extractBodyInnerHtml(html) {
  const m = String(html || '').match(/<body[^>]*>([\s\S]*)<\/body>/i)
  return m ? m[1] : String(html || '')
}

function visibleTextFromHtmlFragment(fragment) {
  return fragment
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
  return (
    /\bdata-mobile-nav-toggle\b/.test(html) ||
    (/\bdata-tab-group\b/.test(html) && /\bdata-tab-panel\b/.test(html)) ||
    (/<aside[^>]{0,200}\bw-64\b/i.test(html) && /<main[^>]{0,120}\bflex-1\b/i.test(html))
  )
}

function hasMarketingStructure(bodyHtml) {
  return (
    /<(section|article)\b/i.test(bodyHtml) ||
    (/<main\b/i.test(bodyHtml) && visibleTextFromHtmlFragment(bodyHtml).split(/\s+/).filter(Boolean).length >= 40) ||
    /class="[^"]*\b(grid|grid-cols|md:grid)\b/i.test(bodyHtml) ||
    /class="[^"]*bento/i.test(bodyHtml)
  )
}

export function shouldReplaceLlmHomepageWithRenderer(html, siteSpec) {
  if (!html || typeof html !== 'string') return true
  if (!siteSpec?.pages?.length) return false

  if (looksLikeThreeJsGame(html)) return false
  if (looksLikeDeclaredAppUi(html)) return false

  const body = extractBodyInnerHtml(html)
  const words = visibleTextFromHtmlFragment(body).split(/\s+/).filter(Boolean)
  const wc = words.length

  if (wc >= 58) return false

  if (wc < 32) return true

  if (!hasMarketingStructure(body) && wc < 58) return true

  return false
}
