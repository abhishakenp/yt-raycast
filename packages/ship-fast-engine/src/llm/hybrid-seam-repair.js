/** Detect and repair hybrid Gemini-top + Groq-tail stitch breakage. */

export function isTruncatedFragment(html) {
  const s = String(html ?? '').trim()
  if (!s || s.length < 80) return true
  if (/<\/html>/i.test(s) && (s.match(/<section\b/gi) || []).length >= 2) {
    const sections = countTag(s, 'section')
    if (sections.opens <= sections.closes + 1) {
      const div = countTag(s, 'div')
      if (div.net >= -4 && div.net <= 8) {
        if (!/\bclass\s*=\s*"[^"]*$/m.test(s) && !/<[a-z][^>]*$/i.test(s.slice(-120))) return false
      }
    }
  }
  if (/\bclass\s*=\s*"[^"]*$/m.test(s)) return true
  if (/\bclass\s*=\s*'[^']*$/m.test(s)) return true
  if (/<[a-z][^>]*$/i.test(s)) return true
  if (/<section\b[^>]*>[\s\S]*$/i.test(s) && !/<\/section>/i.test(s)) return true
  if ((s.match(/<div\b/gi) || []).length > (s.match(/<\/div>/gi) || []).length + 2) return true
  if (/>\s*<\/div>(?:\s*<\/div>){3,}/i.test(s)) return true
  return false
}

export function stripOrphanCloseBurst(html) {
  return String(html ?? '')
    .replace(/\n<\/div>(?:\s*<\/div>){2,}\s*(?=<section\b|<footer\b)/gi, '\n')
    .replace(/(<[a-z][^>]*["'][^"']*)\n<\/div>(?:\s*<\/div>){2,}/gi, '$1\n')
    .replace(/>\s*(?:<\/div>\s*){4,}(?=<section\b|<footer\b)/gi, '>\n')
    .replace(/(?:<\/div>\s*){4,}(?=<section\b|<footer\b)/gi, '\n')
}

export function countTag(html, tag) {
  const re =
    tag === 'div'
      ? { open: /<div\b/gi, close: /<\/div>/gi }
      : { open: new RegExp(`<${tag}\\b`, 'gi'), close: new RegExp(`</${tag}>`, 'gi') }
  const opens = (String(html).match(re.open) || []).length
  const closes = (String(html).match(re.close) || []).length
  return { opens, closes, net: opens - closes }
}

export function closeTopSegmentSafely(topHtml, { maxClose = 8 } = {}) {
  const opens = (topHtml.match(/<div\b/gi) || []).length
  const closes = (topHtml.match(/<\/div>/gi) || []).length
  const deficit = Math.min(maxClose, Math.max(0, opens - closes))
  if (!deficit) return topHtml
  return `${topHtml}\n${'</div>'.repeat(deficit)}`
}

export function sealTopBeforeTail(topHtml, tailHtml) {
  let top = String(topHtml ?? '').trim()
  const tail = String(tailHtml ?? '').trim()
  if (!tail || !/^<(?:section|footer)\b/i.test(tail)) return top

  const candidates = []
  for (const m of top.matchAll(/<\/(section|header|nav)>/gi)) {
    const end = m.index + m[0].length
    if (countTag(top.slice(0, end), 'div').net <= 0) candidates.push(end)
  }

  const lastOpenIdx = top.lastIndexOf('<section')
  if (candidates.length) {
    const cut = candidates[candidates.length - 1]
    if (cut >= lastOpenIdx || lastOpenIdx < 0) {
      if (cut < top.length - 40) top = top.slice(0, cut).trim()
      return top
    }
  }

  const div = countTag(top, 'div')
  const sec = countTag(top, 'section')
  if (div.net > 0) top = closeTopSegmentSafely(top, { maxClose: Math.min(6, div.net) })
  if (sec.net > 0) top += `\n${'</section>'.repeat(Math.min(2, sec.net))}`
  const headers = (top.match(/<header\b/gi) || []).length - (top.match(/<\/header>/gi) || []).length
  if (headers > 0) top += '\n</header>'
  return top.trim()
}

export function trimIncompleteSuffix(html) {
  let s = String(html ?? '').trim()
  if (!s || !isTruncatedFragment(s)) return s
  const brokenClassOpeners = [...s.matchAll(/<[^<>\n]*\bclass\s*=\s*"[^">\n]*(?=\n|$)/gi)]
  const brokenClass = brokenClassOpeners[brokenClassOpeners.length - 1]
  if (brokenClass?.index > 80) return s.slice(0, brokenClass.index).trim()
  const lastSection = s.lastIndexOf('</section>')
  if (lastSection > 80) return s.slice(0, lastSection + '</section>'.length).trim()
  const lastClose = Math.max(s.lastIndexOf('</div>'), s.lastIndexOf('</p>'), s.lastIndexOf('</h4>'))
  if (lastClose > 80) return s.slice(0, lastClose + 6).trim()
  return s
}

export function validateStitchedHtml(html) {
  const issues = []
  const source = String(html ?? '')
  if (isTruncatedFragment(source)) issues.push('truncated-or-unclosed-fragment')
  if (/>\s*<\/div>(?:\s*<\/div>){5,}\s*(?=<section\b|<footer\b)/i.test(source)) {
    issues.push('orphan-close-burst')
  }
  const div = countTag(source, 'div')
  if (div.net > 12) issues.push(`div-net-unclosed-${div.net}`)
  if (div.net < -8) issues.push(`div-net-overclosed-${Math.abs(div.net)}`)
  const sections = countTag(source, 'section')
  if (sections.opens > sections.closes) issues.push('unclosed-sections')
  return { ok: issues.length === 0, issues }
}

export function stitchHybridHtml(topHtml, tailHtml) {
  let top = trimIncompleteSuffix(String(topHtml ?? '').trim())
  let tail = String(tailHtml ?? '').trim()
  top = sealTopBeforeTail(top, tail)
  let html = `${top}\n${tail}`
  html = stripOrphanCloseBurst(html)
  return { html, validation: validateStitchedHtml(html) }
}
