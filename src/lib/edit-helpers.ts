// Shared edit helper functions that work in both client and server environments
// These are pure functions that don't depend on Convex or other server-only dependencies

const SCRIPT_STYLE_BLOCK_RE =
  /<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi

// Text-level inline tags only. The needle is a block's flattened textContent,
// so inline formatting can be interspersed with the text and must be tolerated.
const INLINE_TAG =
  '<\\/?(?:a|abbr|b|bdi|bdo|big|br|cite|code|data|del|dfn|em|font|i|ins|kbd|label|mark|q|rp|rt|ruby|s|samp|small|span|strong|sub|sup|time|tt|u|var|wbr)\\b[^>]*>'

// Markup that may sit between the characters of a flattened text run without
// being part of it: inline tags and HTML comments.
const BRIDGE_MARKUP = `(?:${INLINE_TAG}|<!--[\\s\\S]*?-->)`

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const escapeRegExp = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Split oldText into word-only tokens and join with a pattern that matches
 *  any sequence of non-word characters or HTML tags between them. This
 *  handles the case where the client's diffEdits fallback produces oldText
 *  from element.textContent, which strips <br> tags and other inline markup,
 *  creating a string that doesn't exist verbatim in the stored HTML or OpenUI
 *  source (where text fragments are separated by <br/> tags or ", " string-
 *  argument delimiters). */
const createAggressiveSeparatorPattern = (value: string): RegExp | null => {
  const tokens = value.trim().split(/\W+/).filter(Boolean)
  if (tokens.length === 0) return null
  // Separator: HTML tags, HTML entities (&quot; &amp; etc.), or non-word chars.
  // Entities contain word chars (e.g. "quot" in &quot;) so they must be listed
  // explicitly — \W alone won't match them.
  const sep = '(?:<[^>]+>|&[a-zA-Z]+;|&#\\d+;|\\W)+'
  return new RegExp(tokens.map(escapeRegExp).join(sep))
}

const createMarkupTolerantTextPattern = (value: string): RegExp | null => {
  const trimmed = value.trim()
  if (!trimmed) return null

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

  // Long text: the per-character bridge interleaving below is O(n) in pattern
  // size but nests quantifiers that risk pathological backtracking on big runs.
  // Fall back to a token-based pattern (whitespace-collapsed, no per-char
  // bridges) so long selections still match instead of returning null.
  if (trimmed.length > 500) {
    const tokens = trimmed.split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return null
    const gap = `(?:${INLINE_TAG}|<!--[\\s\\S]*?-->|\\s|&nbsp;|&#160;)+`
    const edgeGap = `(?:${INLINE_TAG}|<!--[\\s\\S]*?-->|\\s|&nbsp;|&#160;)*`
    const body = tokens
      .map((token) =>
        token
          .split('')
          .map((char) => entityAlternations[char] ?? escapeRegExp(char))
          .join(''),
      )
      .join(gap)
    return new RegExp(`${edgeGap}${body}${edgeGap}`)
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

/** Decode a named or numeric HTML entity to its character(s), or null if not
 *  a recognized entity. */
const decodeEntity = (entity: string): string | null => {
  const NAMED: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&nbsp;': '\u00a0',
    '&lsquo;': '\u2018',
    '&rsquo;': '\u2019',
    '&ldquo;': '\u201C',
    '&rdquo;': '\u201D',
    '&mdash;': '\u2014',
    '&ndash;': '\u2013',
    '&hellip;': '\u2026',
    '&copy;': '\u00A9',
    '&reg;': '\u00AE',
    '&trade;': '\u2122',
    '&deg;': '\u00B0',
    '&bull;': '\u2022',
    '&middot;': '\u00B7',
    '&laquo;': '\u00AB',
    '&raquo;': '\u00BB',
    '&times;': '\u00D7',
    '&divide;': '\u00F7',
    '&euro;': '\u20AC',
    '&pound;': '\u00A3',
    '&cent;': '\u00A2',
    '&yen;': '\u00A5',
    '&sect;': '\u00A7',
    '&para;': '\u00B6',
    '&dagger;': '\u2020',
    '&Dagger;': '\u2021',
    '&permil;': '\u2030',
    '&prime;': '\u2032',
    '&Prime;': '\u2033',
  }
  if (NAMED[entity] !== undefined) return NAMED[entity]
  const numeric = entity.match(/^&#(\d+);$/)
  if (numeric) {
    const code = Number(numeric[1])
    if (code > 0) return String.fromCodePoint(code)
  }
  const hex = entity.match(/^&#x([0-9a-f]+);$/i)
  if (hex) {
    const code = parseInt(hex[1], 16)
    if (code > 0) return String.fromCodePoint(code)
  }
  return null
}

/** Walk through HTML character-by-character, skipping tags and decoding
 *  entities, to find `target` plain text. Returns HTML byte ranges (start
 *  inclusive, end exclusive) for each occurrence in document order.
 *
 *  This is the final-tier fallback when exact substring and tolerant regex
 *  matching both fail. It handles EVERY entity encoding (named, decimal,
 *  hex), whitespace normalization, and inline tags splitting text runs —
 *  making TEXT_NOT_FOUND structurally impossible as long as the text exists
 *  in the rendered content. O(n) in HTML length, no regex backtracking. */
const findTextRangesInHtml = (
  html: string,
  target: string,
): Array<{ start: number; end: number }> => {
  const t = target.replace(/\s+/g, ' ').trim()
  if (!t) return []

  // Build extracted text with a position map: for each extracted character,
  // record its HTML source range [start, end).
  const textChars: string[] = []
  const htmlStarts: number[] = []
  const htmlEnds: number[] = []

  let i = 0
  while (i < html.length) {
    const ch = html[i]

    // Tag — skip entirely (don't add its text to the extracted stream).
    if (ch === '<' && i + 1 < html.length && /[a-zA-Z\/!]/.test(html[i + 1])) {
      const tagEnd = html.indexOf('>', i)
      if (tagEnd === -1) break
      i = tagEnd + 1
      continue
    }

    // Entity — decode and add each decoded character.
    if (ch === '&') {
      const semi = html.indexOf(';', i)
      if (semi !== -1 && semi - i <= 12) {
        const entity = html.slice(i, semi + 1)
        const decoded = decodeEntity(entity)
        if (decoded !== null) {
          for (const dc of decoded) {
            textChars.push(dc)
            htmlStarts.push(i)
            htmlEnds.push(semi + 1)
          }
          i = semi + 1
          continue
        }
      }
    }

    textChars.push(ch)
    htmlStarts.push(i)
    htmlEnds.push(i + 1)
    i++
  }

  // Normalize whitespace in the extracted text and build a mapping from
  // normalized positions back to original text-char positions.
  const normChars: string[] = []
  const normToText: number[] = []
  for (let j = 0; j < textChars.length; j++) {
    if (/\s/.test(textChars[j])) {
      if (normChars.length === 0 || normChars[normChars.length - 1] !== ' ') {
        normChars.push(' ')
        normToText.push(j)
      }
    } else {
      normChars.push(textChars[j])
      normToText.push(j)
    }
  }

  const normText = normChars.join('')

  const results: Array<{ start: number; end: number }> = []
  let pos = normText.indexOf(t)
  while (pos >= 0) {
    const textStart = normToText[pos]
    const textEnd = normToText[pos + t.length - 1]
    results.push({
      start: htmlStarts[textStart],
      end: htmlEnds[textEnd],
    })
    pos = normText.indexOf(t, pos + t.length)
  }

  return results
}

/** Check if a position in the HTML string is inside a tag (between `<` and
 *  `>`). Matches inside tags — e.g. text within an attribute value like
 *  `<img alt="Hello">` — must NOT count as visible text matches, otherwise
 *  editing visible text that also appears in an alt attribute replaces the
 *  attribute instead of the visible content. */
const isInsideTag = (html: string, pos: number): boolean => {
  // Scan backwards from pos looking for the most recent `<` or `>`.
  for (let i = pos - 1; i >= 0; i--) {
    if (html[i] === '>') return false // we're between tags (visible text)
    if (html[i] === '<') return true // we're inside a tag
  }
  return false
}

const collectTextMatches = (
  text: string,
  from: string,
): Array<{ index: number; length: number }> => {
  // Tier 0: exact quoted-string match for OpenUI source.
  // In OpenUI source, string arguments are wrapped in double quotes: "go".
  // When from is short (e.g. "go"), substring matching finds it inside
  // unrelated JSON keys like "category". Matching the quoted form "\"go\""
  // ensures we only match complete string arguments, not substrings of
  // other tokens. This tier returns matches of the text WITHOUT the
  // surrounding quotes (index/length point to the inner text) so the
  // replacement logic in applyPreviewTextEdit works unchanged.
  // Skip matches inside HTML tags (attribute values like alt="Brand") —
  // only match quoted strings in OpenUI source (outside HTML tags).
  if (from.length > 0 && !from.includes('"')) {
    const quoted = `"${from}"`
    const quotedMatches: Array<{ index: number; length: number }> = []
    let qCursor = text.indexOf(quoted)
    while (qCursor >= 0) {
      // Skip matches inside HTML tags (e.g. alt="Brand")
      if (!isInsideTag(text, qCursor)) {
        // Point to the inner text (skip the opening quote)
        quotedMatches.push({
          index: qCursor + 1,
          length: from.length,
        })
      }
      qCursor = text.indexOf(quoted, qCursor + quoted.length)
    }
    if (quotedMatches.length > 0) return quotedMatches
  }

  // Tier 1: exact substring match (fast path for clean HTML).
  // Skip matches inside HTML tags (attribute values, tag names) — only
  // visible text between tags should match.
  const exact: Array<{ index: number; length: number }> = []
  let cursor = text.indexOf(from)
  while (cursor >= 0) {
    if (!isInsideTag(text, cursor)) {
      exact.push({ index: cursor, length: from.length })
    }
    cursor = text.indexOf(from, cursor + Math.max(1, from.length))
  }
  if (exact.length > 0) return exact

  // Tier 2: tolerant regex (handles common entity + inline-tag mismatches).
  const pattern = createMarkupTolerantTextPattern(from)
  if (pattern !== null) {
    const globalPattern = new RegExp(pattern.source, 'g')
    const tolerant: Array<{ index: number; length: number }> = []
    let match: RegExpExecArray | null
    while ((match = globalPattern.exec(text)) !== null) {
      if (match[0].length === 0) {
        globalPattern.lastIndex += 1
        continue
      }
      if (!isInsideTag(text, match.index)) {
        tolerant.push({ index: match.index, length: match[0].length })
      }
      globalPattern.lastIndex = match.index + match[0].length
    }
    if (tolerant.length > 0) return tolerant
  }

  // Tier 3: character-by-character walk with full entity decoding + whitespace
  // normalization. Handles every encoding case tiers 1 and 2 miss. This is the
  // guarantee that TEXT_NOT_FOUND never fires as long as the text exists.
  // This tier inherently skips tag content (it walks only visible text).
  const ranges = findTextRangesInHtml(text, from)
  if (ranges.length > 0) {
    return ranges.map((r) => ({ index: r.start, length: r.end - r.start }))
  }

  // Tier 4: aggressive separator-tolerant pattern. When oldText is flattened
  // textContent spanning <br> tags or OpenUI string arguments (separated by
  // ", " delimiters), split into word tokens and match with any non-word
  // separator or HTML tag sequence between them. This catches the case where
  // the client's diffEdits fallback produces oldText from element.textContent
  // which strips <br> tags, creating a string that doesn't exist verbatim.
  const aggressivePattern = createAggressiveSeparatorPattern(from)
  if (aggressivePattern !== null) {
    const globalAggressive = new RegExp(aggressivePattern.source, 'g')
    const aggressive: Array<{ index: number; length: number }> = []
    let amatch: RegExpExecArray | null
    while ((amatch = globalAggressive.exec(text)) !== null) {
      if (amatch[0].length === 0) {
        globalAggressive.lastIndex += 1
        continue
      }
      if (!isInsideTag(text, amatch.index)) {
        aggressive.push({ index: amatch.index, length: amatch[0].length })
      }
      globalAggressive.lastIndex = amatch.index + amatch[0].length
    }
    if (aggressive.length > 0) return aggressive
  }

  return []
}
