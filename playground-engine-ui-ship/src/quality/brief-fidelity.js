/**
 * Lightweight HTML signals for brief/title fidelity — fed to Kimi judge as hints only.
 */

function extractTitleTag(html) {
  const m = String(html ?? '').match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return m ? m[1].replace(/\s+/g, ' ').trim() : ''
}

function decodeText(value) {
  return String(value ?? '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .trim()
}

function extractVisibleBrand(html) {
  const navBrand = String(html ?? '').match(
    /<(?:a|span|div|h1)[^>]*class="[^"]*(?:logo|brand|font-heading|font-display)[^"]*"[^>]*>([^<]{2,80})</i,
  )
  if (navBrand) return decodeText(navBrand[1])
  const firstBold = String(html ?? '').match(
    /<a[^>]*class="[^"]*font-bold[^"]*"[^>]*>([^<]{2,60})</i,
  )
  return firstBold ? decodeText(firstBold[1]) : ''
}

function extractPageH1(html) {
  const m = String(html ?? '').match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (!m) return ''
  return m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function tokenize(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3)
}

function looksGenericBrand(brand, brief) {
  const b = String(brand ?? '').trim()
  if (!b) return false
  const lower = b.toLowerCase()
  const generic = /^(dog blog|pet blog|the blog|my blog|blog home|homepage|untitled)$/i.test(lower)
  if (generic) return true
  const brandTokens = tokenize(b)
  if (brandTokens.length <= 2 && brandTokens.some((t) => t === 'blog' || t === 'publication')) return true
  return false
}

export function analyzeBriefFidelity(html, brief) {
  const titleTag = extractTitleTag(html)
  const visibleBrand = extractVisibleBrand(html)
  const pageH1 = extractPageH1(html)
  const issues = []

  if (!titleTag) issues.push('Missing <title> tag')
  if (!pageH1 && !visibleBrand) issues.push('No visible page H1 or branded masthead title')

  if (titleTag && visibleBrand) {
    const normalizedTitle = decodeText(titleTag).toLowerCase()
    const titleCore = normalizedTitle.split(/[–—|-]/)[0]?.trim()
    const brandCore = decodeText(visibleBrand).toLowerCase()
    if (titleCore && brandCore && titleCore !== brandCore && !normalizedTitle.includes(brandCore)) {
      issues.push(`Browser title ("${decodeText(titleTag).slice(0, 80)}") does not match visible brand ("${visibleBrand}")`)
    }
  }

  if (titleTag && !pageH1) {
    const subtitle = titleTag.split(/[–—|-]/)[1]?.trim()
    if (subtitle && subtitle.length > 12) {
      issues.push(
        `Title promises "${subtitle.slice(0, 80)}" but page has no H1/masthead reflecting that scope`,
      )
    }
  }

  if (looksGenericBrand(visibleBrand, brief)) {
    issues.push(`Generic publication name "${visibleBrand}" — brief expects a distinctive, on-brief brand`)
  }

  const briefKeywords = ['training', 'breed', 'adoption', 'review', 'guide', 'tips', 'story']
  const briefLower = String(brief ?? '').toLowerCase()
  const bodyLower = String(html ?? '').toLowerCase()
  const expected = briefKeywords.filter((k) => briefLower.includes(k))
  const covered = expected.filter((k) => bodyLower.includes(k))
  if (expected.length >= 2 && covered.length < Math.ceil(expected.length * 0.5)) {
    issues.push('Brief themes barely appear in visible page copy')
  }

  return {
    titleTag,
    visibleBrand,
    pageH1,
    issues,
    genericBrand: looksGenericBrand(visibleBrand, brief),
  }
}

export function formatBriefFidelityBlock(fidelity) {
  if (!fidelity) return ''
  const lines = [
    `title tag: ${fidelity.titleTag || '(missing)'}`,
    `visible brand/logo: ${fidelity.visibleBrand || '(none detected)'}`,
    `page H1: ${fidelity.pageH1 || '(missing)'}`,
  ]
  if (fidelity.issues.length) {
    lines.push('brief-fidelity flags (treat as hard signals):')
    for (const i of fidelity.issues) lines.push(`- ${i}`)
  }
  return `\nBrief/title fidelity audit:\n${lines.join('\n')}\n`
}
