/**
 * Shared OpenUI Lang normalization for pipeline + preview parity.
 * Mirrors client OpenUIViewer preprocessing (fences, variables, streaming fixes).
 */
import componentSpec from '../genui/generated/component-spec.json'

type ComponentSpec = {
  components?: Record<string, { signature?: string }>
}

const SPEC = componentSpec as ComponentSpec

function componentSectionKeys(name: string): string[] {
  const sig = SPEC.components?.[name]?.signature
  if (!sig) return []
  const open = sig.indexOf('(')
  const close = sig.lastIndexOf(')')
  if (open < 0 || close <= open) return []
  const inner = sig.slice(open + 1, close)
  const keys: string[] = []
  let depth = 0
  let token = ''
  for (const ch of inner) {
    if (ch === '{' || ch === '[') depth++
    else if (ch === '}' || ch === ']') depth--
    if (ch === ',' && depth === 0) {
      keys.push(token)
      token = ''
    } else {
      token += ch
    }
  }
  if (token.trim()) keys.push(token)
  return keys
    .map((t) => t.trim().split('?')[0].split(':')[0].trim())
    .filter(
      (k) => k && !['brand', 'nav', 'className', 'class', 'style'].includes(k),
    )
}

function stripTopLevelSectionArgLabelsForBlock(
  statement: string,
  block: string,
): string {
  const sectionKeys = new Set(componentSectionKeys(block))
  if (sectionKeys.size === 0) return statement

  let out = ''
  let parenDepth = 0
  let braceDepth = 0
  let bracketDepth = 0
  let inString = false
  let quote = ''
  let escaped = false

  for (let i = 0; i < statement.length; i++) {
    const ch = statement[i]
    out += ch

    if (inString) {
      if (escaped) {
        escaped = false
      } else if (ch === '\\') {
        escaped = true
      } else if (ch === quote) {
        inString = false
        quote = ''
      }
      continue
    }

    if (ch === '"' || ch === "'") {
      inString = true
      quote = ch
      continue
    }

    if (ch === '(') parenDepth++
    else if (ch === ')') parenDepth = Math.max(0, parenDepth - 1)
    else if (ch === '{') braceDepth++
    else if (ch === '}') braceDepth = Math.max(0, braceDepth - 1)
    else if (ch === '[') bracketDepth++
    else if (ch === ']') bracketDepth = Math.max(0, bracketDepth - 1)

    if (
      ch !== ',' ||
      parenDepth !== 1 ||
      braceDepth !== 0 ||
      bracketDepth !== 0
    ) {
      continue
    }

    const rest = statement.slice(i + 1)
    const match = rest.match(/^(\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/)
    if (match && sectionKeys.has(match[2])) {
      out += match[1]
      i += match[0].length
    }
  }

  return out
}

function stripTopLevelSectionArgLabels(code: string): string {
  return code
    .split('\n')
    .map((line) => {
      const match = line.match(
        /^\s*[$A-Za-z_][\w]*\s*=\s*([A-Z][A-Za-z0-9_]*)\(/,
      )
      return match
        ? stripTopLevelSectionArgLabelsForBlock(line, match[1])
        : line
    })
    .join('\n')
}

function repairMalformedQuotedObjectKeys(code: string): string {
  let result = ''
  const stack: string[] = []
  let inString = false
  let quote = ''
  let escaped = false
  // Last non-whitespace char emitted — used to tell a KEY position (`{`/`,`
  // before the quote) from a VALUE position (`:` before the quote). Without this
  // a string VALUE like "https://x" or "time:3pm" gets its opening quote stripped
  // because `https:` / `time:` look like a quoted key.
  let prevSig = ''
  const emit = (ch: string): void => {
    result += ch
    if (!/\s/.test(ch)) prevSig = ch
  }

  for (let index = 0; index < code.length; index++) {
    const char = code[index]

    if (inString) {
      emit(char)
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === quote) {
        inString = false
        quote = ''
      }
      continue
    }

    if (
      char === '"' &&
      stack[stack.length - 1] === '{' &&
      (prevSig === '{' || prevSig === ',')
    ) {
      const rest = code.slice(index + 1)
      const malformedKey = rest.match(/^([A-Za-z_$][\w$]*):/)
      // Guard: do not strip the quote if the `:` is followed by `//` — that's a
      // URL scheme (e.g. "https://..."), not a malformed key-value separator.
      // The prevSig check above cannot distinguish a comma before an array
      // value (where the next token is a URL string) from a comma before an
      // object property (where the next token could be a key).
      if (
        malformedKey &&
        !rest.slice(malformedKey[0].length).startsWith('//')
      ) {
        result += `${malformedKey[1]}:`
        prevSig = ':'
        index += malformedKey[0].length
        continue
      }
    }

    emit(char)

    if (char === '"' || char === "'") {
      inString = true
      quote = char
    } else if (char === '(' || char === '[' || char === '{') {
      stack.push(char)
    } else if (char === ')' || char === ']' || char === '}') {
      stack.pop()
    }
  }

  return result
}

function repairObjectNullArgumentBoundaries(code: string): string {
  let result = ''
  const stack: string[] = []
  let inString = false
  let quote = ''
  let escaped = false

  for (let index = 0; index < code.length; index++) {
    const char = code[index]

    if (inString) {
      result += char
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === quote) {
        inString = false
        quote = ''
      }
      continue
    }

    if (char === ',' && stack[stack.length - 1] === '{') {
      const nullArgument = code.slice(index).match(/^,\s*null(?=\s*\))/)
      if (nullArgument) {
        result += '}, null'
        stack.pop()
        index += nullArgument[0].length - 1
        continue
      }
    }

    result += char

    if (char === '"' || char === "'") {
      inString = true
      quote = char
    } else if (char === '(' || char === '[' || char === '{') {
      stack.push(char)
    } else if (char === ')' || char === ']' || char === '}') {
      stack.pop()
    }
  }

  return result
}

function extractExpr(str: string, start: number): string {
  let i = start
  while (i < str.length && (str[i] === ' ' || str[i] === '\t')) i++
  let parens = 0
  let brackets = 0
  let braces = 0
  let j = i
  let inString = false
  let stringChar = ''
  let escape = false
  while (j < str.length) {
    const ch = str[j]
    if (escape) {
      escape = false
      j++
      continue
    }
    if (inString) {
      if (ch === '\\') escape = true
      else if (ch === stringChar) inString = false
      j++
      continue
    }
    if (ch === '"' || ch === "'") {
      inString = true
      stringChar = ch
      j++
      continue
    }
    if (ch === '(') parens++
    else if (ch === ')') parens = Math.max(0, parens - 1)
    else if (ch === '[') brackets++
    else if (ch === ']') brackets = Math.max(0, brackets - 1)
    else if (ch === '{') braces++
    else if (ch === '}') braces = Math.max(0, braces - 1)

    if (ch === '\n' && parens === 0 && brackets === 0 && braces === 0) {
      break
    }
    j++
  }
  return str.slice(i, j).trim()
}

function resolveVariables(code: string): string {
  const varPattern = /^([a-zA-Z][a-zA-Z0-9_]*)\s*=/gm
  const varNames = [...code.matchAll(varPattern)]
    .map((m) => m[1])
    .filter((n) => n !== 'root')
  if (varNames.length === 0) return code

  const vars: Record<string, string> = {}
  for (const name of varNames) {
    const regex = new RegExp(`^${name}\\s*=\\s*`, 'm')
    const match = regex.exec(code)
    if (match) {
      vars[name] = extractExpr(code, match.index + match[0].length)
    }
  }

  const rootMatch = /^root\s*=\s*/m.exec(code)
  if (!rootMatch) return code

  let result = extractExpr(code, rootMatch.index + rootMatch[0].length)
  for (let pass = 0; pass < 20; pass++) {
    const prev = result
    for (const [name, val] of Object.entries(vars)) {
      result = result.replace(new RegExp(`\\b${name}\\b`, 'g'), val)
    }
    if (result === prev) break
  }
  return `root = ${result}`
}

function sanitizePartialImages(code: string): string {
  const replaced = code.replace(/Image\("https:\/\/[^"]*$/, 'null')
  if (replaced === code) return code
  // Strip null elements from array literals so components iterating with
  // .map() don't crash on null items during streaming.
  return stripNullsFromArrays(replaced)
}

function transformOutsideQuotedStrings(
  source: string,
  transform: (segment: string) => string,
): string {
  const quotedSegments: string[] = []
  const tokenFor = (index: number) => `\uE000${index}\uE001`
  let masked = ''
  let index = 0

  while (index < source.length) {
    const quote = source[index]
    if (quote !== '"' && quote !== "'") {
      masked += quote
      index += 1
      continue
    }

    const start = index
    let escaped = false
    index += 1
    while (index < source.length) {
      const char = source[index]
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === quote) {
        index += 1
        break
      } else if (
        char === '\n' &&
        /^\s*[$A-Za-z_][\w$]*\s*=/.test(source.slice(index + 1))
      ) {
        break
      }
      index += 1
    }

    const token = tokenFor(quotedSegments.length)
    quotedSegments.push(source.slice(start, index))
    masked += token
  }

  return quotedSegments.reduce(
    (result, segment, segmentIndex) =>
      result.replaceAll(tokenFor(segmentIndex), segment),
    transform(masked),
  )
}

function stripActionCalls(source: string): string {
  return transformOutsideQuotedStrings(source, (masked) => {
    const actionPattern = /\bAction\s*\(/g
    let result = ''
    let cursor = 0

    while (cursor < masked.length) {
      actionPattern.lastIndex = cursor
      const match = actionPattern.exec(masked)
      if (!match) return result + masked.slice(cursor)

      result += masked.slice(cursor, match.index) + 'null'
      const openParenthesis = match.index + match[0].lastIndexOf('(')
      let depth = 0
      let end = openParenthesis
      for (; end < masked.length; end += 1) {
        if (masked[end] === '(') {
          depth += 1
        } else if (masked[end] === ')') {
          depth -= 1
          if (depth === 0) {
            end += 1
            break
          }
        }
      }
      cursor = end
    }

    return result
  })
}

function stripNullsFromArrays(code: string): string {
  // Aggressive null stripping for streaming: remove all null values from arrays
  // to prevent "Cannot read properties of null" errors when components map over
  // incomplete arrays during progressive rendering.
  // Also removes objects with only null/empty properties that came from incomplete Image() calls.
  return transformOutsideQuotedStrings(code, (source) => {
    let result = source

    // First pass: simple null removal in arrays
    result = result
      .replace(/,\s*null\s*(?=[,\]])/g, '') // null followed by comma or ]
      .replace(/(?<=[,\[])\s*null\s*,/g, ',') // null preceded by comma or [
      .replace(/^\s*null\s*$/gm, '') // standalone null on a line

    // Second pass: remove empty objects and arrays that might have resulted from null replacements
    result = result.replace(/,\s*\{\s*\}\s*(?=[,\]])/g, '') // empty {}
    result = result.replace(/(?<=[,\[])\s*\{\s*\}\s*,/g, ',') // empty {} with comma
    result = result.replace(/,\s*\[\s*\]\s*(?=[,\]])/g, '') // empty []
    result = result.replace(/(?<=[,\[])\s*\[\s*\]\s*,/g, ',') // empty [] with comma

    // Third pass: clean up resulting double commas and edge cases
    result = result
      .replace(/,\s*,/g, ',') // Fix double commas
      .replace(/^\s*,\s*/gm, '') // Remove leading comma
      .replace(/,\s*$/gm, '') // Remove trailing comma

    return result
  })
}

function nextNonWhitespaceChar(code: string, start: number): string {
  for (let index = start; index < code.length; index++) {
    const char = code[index]
    if (char !== ' ' && char !== '\t' && char !== '\n' && char !== '\r') {
      return char
    }
  }
  return ''
}

function repairObjectParenthesisArgumentBoundaries(code: string): string {
  let result = ''
  const stack: string[] = []
  let inString = false
  let quote = ''
  let escaped = false
  const matchingOpeners: Record<string, string> = {
    ')': '(',
    ']': '[',
    '}': '{',
  }

  for (let index = 0; index < code.length; index++) {
    const char = code[index]

    if (inString) {
      result += char
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === quote) {
        inString = false
        quote = ''
      }
      continue
    }

    if (char === '"' || char === "'") {
      result += char
      inString = true
      quote = char
      continue
    }

    if (
      char === ')' &&
      stack[stack.length - 1] === '{' &&
      nextNonWhitespaceChar(code, index + 1) === ','
    ) {
      result += '}'
      stack.pop()
      continue
    }

    result += char

    if (char === '(' || char === '[' || char === '{') {
      stack.push(char)
      continue
    }

    const expected = matchingOpeners[char]
    if (expected === undefined) continue
    if (stack[stack.length - 1] === expected) {
      stack.pop()
    }
  }

  return result
}

/**
 * Repair a single top-level statement segment whose delimiters never closed
 * (truncated mid-program LLM output, e.g. `p3 = Faq(... , {tag` followed by a
 * fresh `p1 = ...` line). Strips the dangling partial token, then closes any
 * still-open ( [ { in correct nesting order so the broken statement can't
 * swallow the statements that follow it (which would otherwise leak as raw
 * text in the rendered output).
 */
function balanceSegment(seg: string): string {
  const trail = seg.match(/\s*$/)?.[0] || ''
  let s = seg.slice(0, seg.length - trail.length)

  // Strip trailing incomplete tokens (order matters; loop until stable).
  let prev = ''
  while (s !== prev) {
    prev = s
    s = s.replace(/,\s*$/, '') // dangling comma
    s = s.replace(/,?\s*\{\s*[A-Za-z_$][\w]*\s*$/, '') // dangling "{tag" (open obj + bare key)
    s = s.replace(/[,(]\s*[A-Za-z_$][\w]*\s*$/, (m) => m[0]) // partial ident arg → keep delimiter
  }

  // Walk delimiters with a stack so we close in the right order.
  const stack: string[] = []
  let inString = false
  let stringChar = ''
  let escape = false
  for (const c of s) {
    if (escape) {
      escape = false
      continue
    }
    if (inString) {
      if (c === '\\') escape = true
      else if (c === stringChar) inString = false
      continue
    }
    if (c === '"' || c === "'") {
      inString = true
      stringChar = c
      continue
    }
    if (c === '(' || c === '[' || c === '{') stack.push(c)
    else if (c === ')' || c === ']' || c === '}') {
      if (stack.length) stack.pop()
    }
  }
  if (inString) s += stringChar
  const closer: Record<string, string> = { '(': ')', '[': ']', '{': '}' }
  for (let i = stack.length - 1; i >= 0; i--) s += closer[stack[i]]

  return s + (trail.includes('\n') ? '\n' : '')
}

/**
 * Segment the program at top-level `name =` boundaries and balance each segment
 * independently. This prevents one truncated statement from consuming later
 * statements (a mid-program truncation that balancePartial — which only repairs
 * the tail of the whole string — cannot fix). No-op for well-formed input.
 */
function balanceStatements(code: string): string {
  const re = /^[$A-Za-z_][\w]*\s*=/gm
  const starts: number[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(code))) starts.push(m.index)
  if (starts.length <= 1) return code

  const segments: string[] = []
  if (starts[0] > 0) segments.push(code.slice(0, starts[0]))
  for (let i = 0; i < starts.length; i++) {
    const end = i + 1 < starts.length ? starts[i + 1] : code.length
    segments.push(balanceSegment(code.slice(starts[i], end)))
  }
  return segments.join('')
}

function balancePartial(code: string): string {
  let inString = false
  let stringChar = ''
  let escape = false
  let parens = 0

  for (const c of code) {
    if (escape) {
      escape = false
      continue
    }
    if (inString) {
      if (c === '\\') {
        escape = true
        continue
      }
      if (c === stringChar) {
        inString = false
      }
      continue
    }
    if (c === '"' || c === "'") {
      inString = true
      stringChar = c
      continue
    }
    if (c === '(') {
      parens++
    } else if (c === ')') {
      parens--
    }
  }

  let result = code
  if (inString) {
    result += stringChar
  }
  if (parens > 0) {
    const tail = result.slice(result.length - 1).match(/[A-Za-z0-9_]/)
    if (tail) {
      const trimmed = result.replace(
        /[,(]\s*[A-Za-z_][A-Za-z0-9_]*\s*$/,
        (match) => match[0],
      )
      result = trimmed
    }
    result = result.replace(/,\s*$/, '')
  }
  for (let i = 0; i < parens; i++) {
    result += ')'
  }
  return result
}

/**
 * Full-bleed section bands own their vertical padding, so the page-root Stack
 * that stacks them must not add gap between bands — the Stack default (gap-4 =
 * 16px) leaves the transparent page background showing as black slivers between
 * every band. Force gap="none" on that stack ONLY.
 *
 * Detected structurally (generic, not per-site): a `X = Stack([a, b, ...])`
 * statement with no explicit args whose children are ALL vars assigned via
 * `= SectionAnchor(...)`. Inner content stacks and freeform-app stacks (whose
 * children are content elements, not section anchors, or that pass an explicit
 * gap) are untouched, so their intended default spacing is preserved.
 *
 * Applied at render time on the named form (before ref resolution), so every
 * existing persisted program is fixed on its next render without regeneration.
 */
function forceGaplessSectionBandStack(code: string): string {
  const anchors = new Set(
    [...code.matchAll(/^\s*([A-Za-z_$][\w$]*)\s*=\s*SectionAnchor\s*\(/gm)].map(
      (m) => m[1],
    ),
  )
  if (anchors.size === 0) return code
  // Array-only Stack (no trailing args): `X = Stack([ ...idents... ])`.
  return code.replace(
    /^(\s*[A-Za-z_$][\w$]*\s*=\s*)Stack\(\s*\[([^[\]]*)\]\s*\)(\s*)$/gm,
    (match, prefix, inner, tail) => {
      const children = inner
        .split(',')
        .map((c: string) => c.trim())
        .filter(Boolean)
      if (children.length === 0) return match
      if (!children.every((c: string) => anchors.has(c))) return match
      return `${prefix}Stack([${children.join(', ')}], "col", "none")${tail}`
    },
  )
}

/**
 * Patch Navbar `links` props to match the PageSwitch `routes` array, and
 * strip the targetMap from PageSwitch calls.
 *
 * The routes array IS the source of truth for navigation — display labels
 * are route names, URL slugs are derived via slugifyRoute, pages are
 * positional. The targetMap was a redundant compile-time lookup table that
 * mapped display labels to page variable names, which broke navigation when
 * they didn't match. This strips it from older sessions.
 *
 * Navbar links are patched to match the routes array so that
 * resolveRouteTarget can find them via exact match.
 */
export function fixNavbarLinksToMatchRoutes(code: string): string {
  // Extract the PageSwitch routes array: root = PageSwitch(["Home",...], ...)
  const pageSwitchMatch = code.match(/root\s*=\s*PageSwitch\(\s*\[([^\]]*)\]/)
  if (!pageSwitchMatch) return code
  const routesStr = '[' + pageSwitchMatch[1] + ']'
  let routes: string[]
  try {
    routes = JSON.parse(routesStr)
  } catch {
    return code
  }
  if (!Array.isArray(routes) || routes.length === 0) return code

  const canonicalLinks = JSON.stringify(routes)

  // Replace Navbar links (flat array): Navbar("Brand", [...], ...)
  let result = code.replace(
    /Navbar\(\s*("(?:[^"\\]|\\.)*"|null)\s*,\s*\[[^\]]*\]/g,
    (match) => match.replace(/\[[^\]]*\]/, canonicalLinks),
  )

  // Strip the targetMap (4th argument) from PageSwitch calls.
  // PageSwitch(["Home",...], [home, ...], "", {"Home":"home",...})
  // → PageSwitch(["Home",...], [home, ...], "")
  result = result.replace(
    /root\s*=\s*PageSwitch\(\s*(\[[^\]]*\])\s*,\s*(\[[^\]]*\])\s*,\s*("[^"]*"|'[^']*')\s*,\s*\{[^}]*\}\s*\)/g,
    'root = PageSwitch($1, $2, $3)',
  )

  return result
}

/**
 * Replace hero sections on sub-pages with matching content sections from the
 * home page. Sub-page heroes are often generic placeholders; this swaps them
 * for the home page's actual content sections (e.g. a "Projects" hero on the
 * projects page gets replaced with the home page's project showcase section).
 */
export function fixSubPageHeroStacks(code: string): string {
  // Parse all variable assignments: `varName = ComponentName(...)`
  const assignments = new Map<string, string>()
  for (const m of code.matchAll(
    /^\s*([A-Za-z_$][\w$]*)\s*=\s*([A-Za-z_$][\w$]*)\s*\(/gm,
  )) {
    assignments.set(m[1], m[2])
  }

  // Parse SectionAnchor wrappers: `ref_anchor = SectionAnchor("id", ref, ...)`
  // The first arg is a string id, the second is the inner ref variable.
  const anchorToInner = new Map<string, string>()
  for (const m of code.matchAll(
    /^\s*([A-Za-z_$][\w$]*)\s*=\s*SectionAnchor\s*\(\s*"[^"]*"\s*,\s*([A-Za-z_$][\w$]*)/gm,
  )) {
    anchorToInner.set(m[1], m[2])
  }

  // Resolve a ref to its actual component type, following SectionAnchor wrappers
  function resolveComponentType(ref: string): string | undefined {
    // Direct assignment
    const direct = assignments.get(ref)
    if (direct && direct !== 'SectionAnchor') return direct
    // SectionAnchor wrapper → resolve inner ref
    const inner = anchorToInner.get(ref)
    if (inner) return assignments.get(inner)
    return direct
  }

  // Parse all Stack page assignments: `pageId = Stack([ref1, ref2, ...])`
  const stackPages = new Map<string, string[]>()
  for (const m of code.matchAll(
    /^\s*([A-Za-z_$][\w$]*)\s*=\s*Stack\(\s*\[([^[\]]*)\]\s*(?:,\s*"col"\s*,\s*"[^"]*")?\s*\)/gm,
  )) {
    const pageId = m[1]
    const refs = m[2]
      .split(',')
      .map((c: string) => c.trim())
      .filter(Boolean)
    stackPages.set(pageId, refs)
  }

  if (stackPages.size <= 1) return code

  // Identify the home page (first Stack, usually "home")
  const pageIds = [...stackPages.keys()]
  const homePageId = pageIds.find((p) => p === 'home') ?? pageIds[0]
  const homeRefs = stackPages.get(homePageId) ?? []

  // Collect home page's non-hero, non-navbar, non-footer sections by component type
  const HERO_COMPONENTS = new Set([
    'SplitHero',
    'CenteredHero',
    'PosterHero',
    'ComingSoonHero',
  ])
  const SKIP_COMPONENTS = new Set(['Navbar', 'Footer', 'SiteNav'])

  // Map component type → ref name for home page sections (resolving through anchors)
  // Also extract heading text from the component call for better matching
  const homeContentByType = new Map<string, string>()
  const homeContentHeadings = new Map<string, string>() // ref → heading text
  for (const ref of homeRefs) {
    const comp = resolveComponentType(ref)
    if (!comp) continue
    if (SKIP_COMPONENTS.has(comp)) continue
    if (HERO_COMPONENTS.has(comp)) continue
    if (!homeContentByType.has(comp)) {
      homeContentByType.set(comp, ref)
      // Extract heading text from the component call for matching
      const innerRef = anchorToInner.get(ref) ?? ref
      const callLine = code.match(
        new RegExp(
          `^\\s*${innerRef.replace(/[.*+?^()[\]{}|]/g, '\\$&')}\\s*=\\s*[^\\n]+`,
          'm',
        ),
      )
      if (callLine) {
        // Extract all quoted strings from the call — the heading is usually
        // one of the first few string arguments
        const strings = [...callLine[0].matchAll(/"([^"]{3,})"/g)]
          .map((m) => m[1])
          .filter(
            (s) =>
              !/^(https?:\/\/|scroll-|font-|text-|border-|bg-|flex|grid|gap|p-|m-|w-|h-|text\[|leading|tracking|uppercase|lowercase|capitalize|none|auto|hidden|block|inline|absolute|relative|fixed|sticky)/.test(
                s,
              ),
          )
        homeContentHeadings.set(ref, strings.join(' ').toLowerCase())
      }
    }
  }

  // For each non-home page, replace hero refs with matching content
  let result = code
  for (const [pageId, refs] of stackPages) {
    if (pageId === homePageId) continue

    const hasHero = refs.some((r) => {
      const comp = resolveComponentType(r)
      return comp && HERO_COMPONENTS.has(comp)
    })
    if (!hasHero) continue

    // Build replacement refs: swap heroes for home page content sections
    const newRefs = refs.map((ref) => {
      const comp = resolveComponentType(ref)
      if (!comp || !HERO_COMPONENTS.has(comp)) return ref

      // Try to find a content section on home page that matches the page name
      const pageName = pageId.toLowerCase().replace(/_?page$/, '')

      // Strategy 1: Match by heading text (most accurate)
      // The heading text is extracted from the component call's string arguments
      let bestMatch: string | null = null
      let bestScore = 0
      for (const [, homeRef] of homeContentByType) {
        const heading = homeContentHeadings.get(homeRef) ?? ''
        if (!heading) continue
        // Check if the page name appears in the heading text
        if (heading.includes(pageName)) {
          // Score by how early in the heading the match is (earlier = better)
          const score = 100 - heading.indexOf(pageName)
          if (score > bestScore) {
            bestScore = score
            bestMatch = homeRef
          }
        }
        // Also try singular form (projects → project)
        const singular = pageName.replace(/s$/, '')
        if (singular.length > 2 && heading.includes(singular)) {
          const score = 50 - heading.indexOf(singular)
          if (score > bestScore) {
            bestScore = score
            bestMatch = homeRef
          }
        }
      }
      if (bestMatch) return bestMatch

      // Strategy 2: Match by component type or ref name
      for (const [compType, homeRef] of homeContentByType) {
        const innerRef = anchorToInner.get(homeRef) ?? homeRef
        const innerLower = innerRef.toLowerCase()
        const compLower = compType.toLowerCase()
        if (
          innerLower.includes(pageName) ||
          compLower.includes(pageName) ||
          innerLower.includes(pageName.replace(/s$/, ''))
        ) {
          return homeRef
        }
      }

      // Fallback: use the first non-skip content section from home
      for (const [, homeRef] of homeContentByType) {
        return homeRef
      }
      return ref
    })

    // Replace the Stack line
    const stackPattern = new RegExp(
      `^(\\s*${pageId.replace(/[.$*+?^()[\]{}|]/g, '\\$&')}\\s*=\\s*Stack\\(\\s*\\[)[^\\]]*\\]\\s*(?:,\\s*"col"\\s*,\\s*"[^"]*")?\\s*\\)`,
      'm',
    )
    result = result.replace(stackPattern, `$1${newRefs.join(', ')}])`)
  }

  return result
}

export function preprocessOpenUIResponse(
  s: string,
  options: { resolveRefs?: boolean } = {},
): string {
  // resolveRefs inlines named assignments into one root expression. The client
  // streaming preview needs this (progressive render of a partial program), but
  // the server pipeline must NOT inline: the lang-core validator parser miscounts
  // arguments on deeply-nested inline calls (e.g. "EditorialHero takes 10 args,
  // got 66"), so well-formed named-reference output is rejected. Keep the named
  // form server-side — it both validates and renders correctly.
  const { resolveRefs = true } = options
  let result = stripActionCalls(
    String(s || '')
      .replace(/^```[a-z-]*\n?/i, '')
      .replace(/\n?```\s*$/, ''),
  )

  // Repair truncated mid-program statements before any ref resolution so a
  // broken statement can't swallow the ones after it (which leak as raw text).
  result = repairMalformedQuotedObjectKeys(result)
  result = repairObjectNullArgumentBoundaries(result)
  result = repairObjectParenthesisArgumentBoundaries(result)
  result = balanceStatements(result)
  result = stripTopLevelSectionArgLabels(result)
  result = forceGaplessSectionBandStack(result)
  // Match the dashboard's preprocessing: fix nav links to match PageSwitch
  // routes and replace sub-page heroes with home-page content sections.
  // Without these, SSR renders different HTML than the dashboard (e.g.
  // <button> instead of <a> for nav, blur circles instead of graph paper).
  result = fixNavbarLinksToMatchRoutes(result)
  result = fixSubPageHeroStacks(result)

  if (resolveRefs) result = resolveVariables(result)
  result = sanitizePartialImages(result)
  return balancePartial(result)
}
