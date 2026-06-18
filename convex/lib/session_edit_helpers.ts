import { escapeHtml, escapeRegExp } from './cms_helpers'

const SCRIPT_STYLE_BLOCK_RE =
  /<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi

// Text-level inline tags only. The needle is a block's flattened textContent,
// so inline formatting can be interspersed with the text and must be tolerated.
const INLINE_TAG =
  '<\\/?(?:a|abbr|b|bdi|bdo|big|br|cite|code|data|del|dfn|em|font|i|ins|kbd|label|mark|q|rp|rt|ruby|s|samp|small|span|strong|sub|sup|time|tt|u|var|wbr)\\b[^>]*>'

// Markup that may sit between the characters of a flattened text run without
// being part of it: inline tags and HTML comments.
const BRIDGE_MARKUP = `(?:${INLINE_TAG}|<!--[\\s\\S]*?-->)`

const createMarkupTolerantTextPattern = (value: string): RegExp | null => {
  const trimmed = value.trim()
  if (!trimmed) return null

  // Guard against pathological backtracking.
  if (trimmed.length > 500) return null

  const entityAlternations: Record<string, string> = {
    '&': '(?:&amp;|&)',
    '<': '(?:&lt;|<)',
    '>': '(?:&gt;|>)',
    '"': '(?:&quot;|&#34;|")',
    "'": '(?:&#39;|&apos;|\\u0027)',
    '\u2018': '(?:&#8216;|&lsquo;|\u2018)',
    '\u2019': '(?:&#8217;|&rsquo;|\u2019)',
    '\u201C': '(?:&#8220;|&ldquo;|\u201C)',
    '\u201D': '(?:&#8221;|&rdquo;|\u201D)',
    '\u2014': '(?:&mdash;|&#8212;|\u2014)',
    '\u2013': '(?:&ndash;|&#8211;|\u2013)',
    '\u2026': '(?:&hellip;|&#8230;|\u2026)',
  }

  let pattern = ''
  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i]

    if (/\s/.test(char)) {
      pattern += `(?:${INLINE_TAG}|<!--[\\s\\S]*?-->|\\s|&nbsp;|&#160;)+`
      continue
    }

    const entityAlt = entityAlternations[char]
    pattern += entityAlt ?? escapeRegExp(char)

    if (i < trimmed.length - 1) {
      pattern += `(?:${BRIDGE_MARKUP})*`
    }
  }

  return new RegExp(`(?:${BRIDGE_MARKUP})*${pattern}(?:${BRIDGE_MARKUP})*`)
}

export const applyImageSwap = (
  html: string,
  altAnchor: string | undefined,
  newSrc: string | undefined,
  occurrenceIndex?: number,
): { html: string; replaced: boolean } => {
  const alt = String(altAnchor ?? '')
  const to = String(newSrc ?? '')
  if (!html.trim() || !alt.trim()) return { html, replaced: false }

  const imgPattern = /<img\b[^>]*>/gi
  const matches: Array<{ index: number; tag: string }> = []
  let match: RegExpExecArray | null
  while ((match = imgPattern.exec(html)) !== null) {
    const tag = match[0]
    const altMatch = tag.match(/\salt\s*=\s*(["'])(.*?)\1/i)
    if (altMatch?.[2] === alt) {
      matches.push({ index: match.index, tag })
    }
    if (tag.length === 0) imgPattern.lastIndex += 1
  }
  if (matches.length === 0) return { html, replaced: false }

  const wanted =
    occurrenceIndex !== undefined && occurrenceIndex >= 0
      ? Math.min(occurrenceIndex, matches.length - 1)
      : 0
  const target = matches[wanted]
  const escaped = to.replace(/"/g, '&quot;')
  const srcAttrRe = /\ssrc\s*=\s*(["']).*?\1/i
  const updatedTag = srcAttrRe.test(target.tag)
    ? target.tag.replace(srcAttrRe, ` src="${escaped}"`)
    : target.tag.replace(/>$/, ` src="${escaped}">`)
  const edited =
    html.slice(0, target.index) +
    updatedTag +
    html.slice(target.index + target.tag.length)

  return { html: edited, replaced: edited !== html }
}

export const applyStyleEdit = (
  html: string,
  classAnchor: string | undefined,
  styleValue: string | undefined,
  occurrenceIndex?: number,
): { html: string; replaced: boolean } => {
  const cls = String(classAnchor ?? '').trim()
  if (!html.trim() || !cls) return { html, replaced: false }
  const tagRe = new RegExp(
    `<[a-zA-Z][\\w-]*\\b[^>]*\\bclass="${escapeRegExp(cls)}"[^>]*?>`,
    'g',
  )
  const matches: Array<{ index: number; tag: string }> = []
  let m: RegExpExecArray | null
  while ((m = tagRe.exec(html)) !== null) {
    matches.push({ index: m.index, tag: m[0] })
    if (m[0].length === 0) tagRe.lastIndex += 1
  }
  if (matches.length === 0) return { html, replaced: false }
  const wanted =
    occurrenceIndex !== undefined && occurrenceIndex >= 0
      ? Math.min(occurrenceIndex, matches.length - 1)
      : 0
  const target = matches[wanted]
  const escaped = String(styleValue ?? '').replace(/"/g, '&quot;')
  const styleAttrRe = /\sstyle\s*=\s*"[^"]*"/i
  const selfClose = /\/>$/.test(target.tag)
  let updatedTag: string
  if (styleAttrRe.test(target.tag)) {
    updatedTag = target.tag.replace(styleAttrRe, ` style="${escaped}"`)
  } else if (selfClose) {
    updatedTag = target.tag.replace(/\/>$/, ` style="${escaped}" />`)
  } else {
    updatedTag = target.tag.replace(/>$/, ` style="${escaped}">`)
  }
  const edited =
    html.slice(0, target.index) +
    updatedTag +
    html.slice(target.index + target.tag.length)
  return { html: edited, replaced: true }
}

const collectTextMatches = (
  text: string,
  from: string,
): Array<{ index: number; length: number }> => {
  const exact: Array<{ index: number; length: number }> = []
  let cursor = text.indexOf(from)
  while (cursor >= 0) {
    exact.push({ index: cursor, length: from.length })
    cursor = text.indexOf(from, cursor + Math.max(1, from.length))
  }
  if (exact.length > 0) return exact

  const pattern = createMarkupTolerantTextPattern(from)
  if (pattern === null) return []
  const globalPattern = new RegExp(pattern.source, 'g')
  const tolerant: Array<{ index: number; length: number }> = []
  let match: RegExpExecArray | null
  while ((match = globalPattern.exec(text)) !== null) {
    if (match[0].length === 0) {
      globalPattern.lastIndex += 1
      continue
    }
    tolerant.push({ index: match.index, length: match[0].length })
    globalPattern.lastIndex = match.index + match[0].length
  }
  return tolerant
}

export const applyPreviewTextEdit = (
  html: string,
  oldText: string | undefined,
  newText: string | undefined,
  occurrenceIndex?: number,
): { html: string; replaced: boolean } => {
  const from = String(oldText ?? '')
  const to = String(newText ?? '')
  if (!html.trim() || !from.trim()) return { html, replaced: false }
  const blocks: Array<{ token: string; value: string }> = []
  const protectedHtml = html.replace(SCRIPT_STYLE_BLOCK_RE, (value) => {
    const token = `__SHIP_FAST_PROTECTED_${blocks.length}__`
    blocks.push({ token, value })
    return token
  })

  const matches = collectTextMatches(protectedHtml, from)
  if (matches.length === 0) return { html, replaced: false }

  const wanted =
    occurrenceIndex !== undefined && occurrenceIndex >= 0
      ? Math.min(occurrenceIndex, matches.length - 1)
      : 0
  const target = matches[wanted]
  const isExact =
    target.length === from.length &&
    protectedHtml.startsWith(from, target.index)
  const replacement = isExact ? to : escapeHtml(to)
  const edited = `${protectedHtml.slice(0, target.index)}${replacement}${protectedHtml.slice(target.index + target.length)}`
  return {
    html: blocks.reduce(
      (current, block) => current.replace(block.token, block.value),
      edited,
    ),
    replaced: true,
  }
}
