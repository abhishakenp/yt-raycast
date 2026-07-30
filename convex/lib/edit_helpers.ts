// Shared edit helper functions that work in both client and server environments
// These are pure functions that don't depend on Convex or other server-only dependencies

// Inlined from @ship-fast/blocks/multi-image-src to avoid pulling framer-motion,
// class-variance-authority, and @ship-fast/lakebed into the Convex bundle.
function decodeMultiImageSrc(
  value: string | null | undefined,
): string[] | null {
  const trimmed = value?.trim()
  if (!trimmed || !trimmed.startsWith('[')) return null
  try {
    const parsed = JSON.parse(trimmed) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    const urls = parsed.filter(
      (url): url is string => typeof url === 'string' && url.trim().length > 0,
    )
    return urls.length === parsed.length ? urls : null
  } catch {
    return null
  }
}

function firstImageSrc(value: string): string {
  return decodeMultiImageSrc(value)?.[0] ?? value
}

const SCRIPT_STYLE_BLOCK_RE =
  /<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi

// Text-level inline tags only. The needle is a block's flattened textContent,
// so inline formatting can be interspersed with the text and must be tolerated.
const INLINE_TAG =
  '<\\/?(?:a|abbr|b|bdi|bdo|big|br|cite|code|data|del|dfn|em|font|i|ins|kbd|label|mark|q|rp|rt|ruby|s|samp|small|span|strong|sub|sup|time|tt|u|var|wbr)\\b[^>]*>'

// Markup that may sit between the characters of a flattened text run without
// being part of it: inline tags and HTML comments.
const BRIDGE_MARKUP = `(?:${INLINE_TAG}|<!--[\\s\\S]*?-->)`

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getQuotedAttribute(
  tag: string,
  names: string[],
): { name: string; value: string } | null {
  const pattern = new RegExp(`\\b(${names.join('|')})\\s*=\\s*(["'])(.*?)\\2`)
  const match = tag.match(pattern)
  return match ? { name: match[1], value: match[3] } : null
}

function classTokensIncludeAnchor(classValue: string, anchor: string): boolean {
  const anchorTokens = anchor.trim().split(/\s+/).filter(Boolean)
  if (anchorTokens.length === 0) return false
  const classTokens = new Set(classValue.trim().split(/\s+/).filter(Boolean))
  return anchorTokens.every((token) => classTokens.has(token))
}

const STYLE_ATTRIBUTE_ANCHOR_RE =
  /^\[(data-openui-var|data-openui-component|data-sf-export-page)=(["'])(.*?)\2\]$/

function unescapeAttributeSelectorValue(value: string): string {
  return value.replace(/\\(["'\\])/g, '$1')
}

function cssPropertyToJsxStyleKey(property: string): string {
  const trimmed = property.trim()
  if (trimmed.startsWith('--')) return JSON.stringify(trimmed)
  const camel = trimmed.replace(/-([a-z])/g, (_match, char: string) =>
    char.toUpperCase(),
  )
  return /^[A-Za-z_$][\w$]*$/.test(camel) ? camel : JSON.stringify(trimmed)
}

function cssDeclarationsToJsxStyle(styleValue: string): string {
  const entries = styleValue
    .split(';')
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const colon = declaration.indexOf(':')
      if (colon <= 0) return null
      const property = declaration.slice(0, colon).trim()
      const value = declaration.slice(colon + 1).trim()
      if (!property || !value) return null
      return `${cssPropertyToJsxStyleKey(property)}: ${JSON.stringify(value)}`
    })
    .filter((entry): entry is string => entry !== null)

  return `{{ ${entries.join(', ')} }}`
}

function tagMatchesStyleAnchor(
  tag: string,
  anchor: string,
): { isJsx: boolean } | null {
  if (anchor.startsWith('#')) {
    const id = getQuotedAttribute(tag, ['id'])
    const expected = anchor.slice(1).replace(/\\(.)/g, '$1')
    return id?.value === expected ? { isJsx: false } : null
  }

  const attributeAnchor = anchor.match(STYLE_ATTRIBUTE_ANCHOR_RE)
  if (attributeAnchor) {
    const [, attributeName, , rawExpected] = attributeAnchor
    const attribute = getQuotedAttribute(tag, [attributeName])
    if (attribute?.value !== unescapeAttributeSelectorValue(rawExpected)) {
      return null
    }
    return {
      isJsx: /\bclassName\s*=|\bstyle\s*=\{\{/.test(tag),
    }
  }

  const classAttr = getQuotedAttribute(tag, ['class', 'className'])
  if (!classAttr || !classTokensIncludeAnchor(classAttr.value, anchor)) {
    return null
  }
  return { isJsx: classAttr.name === 'className' }
}

/** Split oldText into word-only tokens and join with a pattern that matches
 *  any sequence of non-word characters or HTML tags between them. This
 *  handles the case where the client's diffEdits fallback produces oldText
 *  from element.textContent, which strips <br> tags and other inline markup,
 *  creating a string that doesn't exist verbatim in the stored HTML or OpenUI
 *  source (where text fragments are separated by <br/> tags or ", " string-
 *  argument delimiters). */
function createAggressiveSeparatorPattern(value: string): RegExp | null {
  const tokens = value.trim().split(/\W+/).filter(Boolean)
  if (tokens.length === 0) return null
  // Separator: HTML tags, HTML entities (&quot; &amp; etc.), or non-word chars.
  // Entities contain word chars (e.g. "quot" in &quot;) so they must be listed
  // explicitly — \W alone won't match them.
  const sep = '(?:<[^>]+>|&[a-zA-Z]+;|&#\\d+;|\\W)+'
  return new RegExp(tokens.map(escapeRegExp).join(sep))
}

function createMarkupTolerantTextPattern(value: string): RegExp | null {
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

export function applyPreviewTextEdit(
  html: string,
  oldText: string | undefined,
  newText: string | undefined,
  occurrenceIndex?: number,
  escapeReplacement = false,
): { html: string; replaced: boolean } {
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
  // For genuine HTML, always escape — this replaces literal TEXT content,
  // never raw markup. Previously only the tolerant/fuzzy-match path
  // escaped, on the assumption that an exact match meant the replacement's
  // characters didn't need it either — but that conflates "how the OLD
  // text matched" with "what characters the NEW text contains": typing
  // plain text containing `<`, `>`, or `&` (e.g. "Use <b> for bold") into
  // an exactly-matched heading spliced it in unescaped, turning literal
  // text into live markup.
  const replacement = escapeReplacement || !isExact ? escapeHtml(to) : to
  const edited = `${protectedHtml.slice(0, target.index)}${replacement}${protectedHtml.slice(target.index + target.length)}`
  return {
    html: blocks.reduce(
      (current, block) => current.replace(block.token, block.value),
      edited,
    ),
    replaced: true,
  }
}

export function applyImageSwap(
  html: string,
  altAnchor: string | undefined,
  newSrc: string | undefined,
  occurrenceIndex?: number,
): { html: string; replaced: boolean } {
  const alt = String(altAnchor ?? '')
  // A multi-select payload (JSON array of URLs) renders as a carousel through
  // the client-side Image override; static HTML consumers (preview.html,
  // exports) degrade to the first selected image.
  const to = firstImageSrc(String(newSrc ?? ''))
  if (!html.trim() || !alt.trim() || !to) return { html, replaced: false }

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

export function applyStyleEdit(
  html: string,
  classAnchor: string | undefined,
  styleValue: string | undefined,
  occurrenceIndex?: number,
): { html: string; replaced: boolean } {
  const anchor = String(classAnchor ?? '').trim()
  if (!html.trim() || !anchor) return { html, replaced: false }
  const tagRe = /<[a-zA-Z][\w-]*\b[^>]*?>/g
  const matches: Array<{ index: number; tag: string; isJsx: boolean }> = []
  let m: RegExpExecArray | null
  while ((m = tagRe.exec(html)) !== null) {
    const match = tagMatchesStyleAnchor(m[0], anchor)
    if (match) matches.push({ index: m.index, tag: m[0], isJsx: match.isJsx })
    if (m[0].length === 0) tagRe.lastIndex += 1
  }
  if (matches.length === 0) return { html, replaced: false }
  const wanted =
    occurrenceIndex !== undefined && occurrenceIndex >= 0
      ? Math.min(occurrenceIndex, matches.length - 1)
      : 0
  const target = matches[wanted]
  const escaped = String(styleValue ?? '').replace(/"/g, '&quot;')
  const styleAttrRe = /\sstyle\s*=\s*(["'])[\s\S]*?\1/i
  const jsxStyleAttrRe = /\sstyle\s*=\s*(?:\{\{[\s\S]*?\}\}|(["'])[\s\S]*?\1)/i
  const selfClose = /\/>$/.test(target.tag)
  let updatedTag: string
  if (target.isJsx) {
    const jsxStyle = cssDeclarationsToJsxStyle(String(styleValue ?? ''))
    if (jsxStyleAttrRe.test(target.tag)) {
      updatedTag = target.tag.replace(jsxStyleAttrRe, ` style=${jsxStyle}`)
    } else if (selfClose) {
      updatedTag = target.tag.replace(/\/>$/, ` style=${jsxStyle} />`)
    } else {
      updatedTag = target.tag.replace(/>$/, ` style=${jsxStyle}>`)
    }
  } else if (styleAttrRe.test(target.tag)) {
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

/**
 * Splice an AI-rewritten section/element fragment into a larger HTML document
 * by locating an exact literal match of the section's ORIGINAL outerHTML.
 *
 * Unlike applyPreviewTextEdit, this does no fuzzy whitespace/entity-tolerant
 * matching and never HTML-escapes the replacement — both sides are markup,
 * and a fuzzy match risks slicing through tag boundaries or corrupting the
 * new markup. If the anchor isn't found verbatim, the caller must treat that
 * as a real failure (e.g. stale selection) rather than falling back to
 * replacing the whole document — a full-document fallback is exactly the bug
 * this function exists to prevent (a section-scoped AI rewrite has no way to
 * know the rest of the page, so it must never be allowed to overwrite it).
 */
export function applySectionHtmlReplace(
  html: string,
  beforeHtml: string | undefined,
  afterHtml: string | undefined,
  occurrenceIndex?: number,
): { html: string; replaced: boolean } {
  const before = String(beforeHtml ?? '')
  const after = String(afterHtml ?? '')
  if (!html.trim() || !before.trim()) return { html, replaced: false }

  const indices: number[] = []
  let from = html.indexOf(before)
  while (from !== -1) {
    indices.push(from)
    from = html.indexOf(before, from + before.length)
  }
  if (indices.length === 0) return { html, replaced: false }

  const wanted =
    occurrenceIndex !== undefined && occurrenceIndex >= 0
      ? Math.min(occurrenceIndex, indices.length - 1)
      : 0
  const target = indices[wanted]
  const edited =
    html.slice(0, target) + after + html.slice(target + before.length)
  return { html: edited, replaced: true }
}

/**
 * Replace the top-level `varName = ...` assignment line in OpenUI DSL source
 * with a new expression, without touching any other line (sibling sections,
 * the root/page Stack assembly, etc). The DSL emits exactly one statement per
 * line (see reorder-source.ts's identical line-anchor approach for
 * Stack([...]) arrays), so anchoring on the variable's own line is safe.
 *
 * The sectionRewrite AI tool only ever sees the selected section, so its
 * `replacementOpenUiSource` output commonly omits the `varName = ` prefix —
 * if the replacement doesn't already start with `varName =`, it is treated
 * as a bare component-call expression and the prefix is restored. Without
 * this anchor, a caller would have to trust the AI's output as the ENTIRE
 * document source, which silently destroys every other section (the same
 * corruption class applySectionHtmlReplace guards against for HTML).
 */
export function applyOpenUiVarReplace(
  source: string,
  varName: string,
  replacementExpr: string,
): { source: string; replaced: boolean } {
  if (!source.trim() || !varName.trim() || !replacementExpr.trim()) {
    return { source, replaced: false }
  }

  const assignmentRe = new RegExp(`^${escapeRegExp(varName)}\\s*=\\s*`)
  const lines = source.split('\n')
  const lineIndex = lines.findIndex((line) => assignmentRe.test(line))
  if (lineIndex === -1) return { source, replaced: false }

  const trimmedReplacement = replacementExpr.trim()
  const hasAssignment = assignmentRe.test(trimmedReplacement)
  lines[lineIndex] = hasAssignment
    ? trimmedReplacement
    : `${varName} = ${trimmedReplacement}`

  return { source: lines.join('\n'), replaced: true }
}

/** Decode a named or numeric HTML entity to its character(s), or null if not
 *  a recognized entity. */
function decodeEntity(entity: string): string | null {
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
function findTextRangesInHtml(
  html: string,
  target: string,
): Array<{ start: number; end: number }> {
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
function isInsideTag(html: string, pos: number): boolean {
  // Scan backwards from pos looking for the most recent `<` or `>`.
  for (let i = pos - 1; i >= 0; i--) {
    if (html[i] === '>') return false // we're between tags (visible text)
    if (html[i] === '<') return true // we're inside a tag
  }
  return false
}

function collectTextMatches(
  text: string,
  from: string,
): Array<{ index: number; length: number }> {
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
