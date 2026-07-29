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
    (result, segment, idx) => result.replaceAll(tokenFor(idx), segment),
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

export function stripNullsFromArrays(code: string): string {
  return transformOutsideQuotedStrings(code, (segment) =>
    segment
      .replace(/,\s*null\s*(?=[,\]])/g, '')
      .replace(/(?<=\[)\s*null\s*,\s*/g, '')
      .replace(/^\s*null\s*$/gm, '')
      .replace(/,\s*\{\s*\}\s*(?=[,\]])/g, '')
      .replace(/(?<=[,\[])\s*\{\s*\}\s*,/g, ',')
      .replace(/,\s*\[\s*\]\s*(?=[,\]])/g, '')
      .replace(/(?<=[,\[])\s*\[\s*\]\s*,/g, ',')
      .replace(/,\s*,/g, ',')
      .replace(/^\s*,\s*/gm, '')
      .replace(/,\s*$/gm, ''),
  )
}

export function sanitizePartialImages(code: string): string {
  const replaced = code.replace(/Image\("https:\/\/[^"]*$/, 'null')
  return replaced === code ? code : stripNullsFromArrays(replaced)
}

export function repairMalformedQuotedObjectKeys(code: string) {
  let result = ''
  const stack: string[] = []
  let inString = false
  let stringChar = ''
  let escaped = false
  let expectKey = false

  for (let index = 0; index < code.length; index++) {
    const char = code[index]

    if (inString) {
      result += char
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === stringChar) {
        inString = false
        stringChar = ''
      }
      continue
    }

    if (expectKey) {
      if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
        result += char
        continue
      }
      // Quoted key (well-formed or stray-opening-quote): either a proper
      // "key": or a malformed "key: (no closing quote). Detect the identifier
      // that follows and (re)quote it properly.
      if (char === '"' || /[A-Za-z_$]/.test(char)) {
        const offset = char === '"' ? 1 : 0
        const rest = code.slice(index + offset)
        const keyMatch = rest.match(/^([A-Za-z_$][\w$]*)\s*:/)
        if (keyMatch) {
          result += `"${keyMatch[1]}":`
          index += offset + keyMatch[0].length - 1
          expectKey = false
          continue
        }
        // Already-quoted, well-formed key — hand off to normal string handling.
        if (char === '"') {
          expectKey = false
          inString = true
          stringChar = '"'
          result += char
          continue
        }
      }
      expectKey = false
    }

    result += char

    if (char === '"' || char === "'") {
      inString = true
      stringChar = char
    } else if (char === '{') {
      stack.push(char)
      expectKey = true
    } else if (char === '(' || char === '[') {
      stack.push(char)
      expectKey = false
    } else if ((char === ')' || char === ']' || char === '}') && stack.length) {
      stack.pop()
      expectKey = false
    } else if (char === ',' && stack[stack.length - 1] === '{') {
      expectKey = true
    } else if (char === ':') {
      expectKey = false
    }
  }

  return result
}

export function repairObjectNullArgumentBoundaries(code: string) {
  let result = ''
  const stack: string[] = []
  let inString = false
  let stringChar = ''
  let escaped = false

  for (let index = 0; index < code.length; index++) {
    const char = code[index]

    if (inString) {
      result += char
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === stringChar) {
        inString = false
        stringChar = ''
      }
      continue
    }

    if (char === ',') {
      if (stack[stack.length - 1] === '{') {
        const nullArgument = code.slice(index).match(/^,\s*null(?=\s*\))/)
        if (nullArgument) {
          result += '}, null'
          stack.pop()
          index += nullArgument[0].length - 1
          continue
        }
      } else if (stack[stack.length - 1] === '(') {
        // Remove redundant trailing null arguments — keep only one null,
        // drop extras (e.g. Foo(null, null) → Foo(null)).
        const nullArg = code.slice(index).match(/^,\s*null\s*(?=[,)])/)
        if (nullArg) {
          const trimmed = result.trimEnd()
          if (/(^|[(,\s])null$/.test(trimmed)) {
            index += nullArg[0].length - 1
            continue
          }
        }
      }
    }

    result += char

    if (char === '"' || char === "'") {
      inString = true
      stringChar = char
    } else if (char === '(' || char === '[' || char === '{') {
      stack.push(char)
    } else if ((char === ')' || char === ']' || char === '}') && stack.length) {
      stack.pop()
    }
  }

  return result
}

export function balanceSegment(segment: string): string {
  const trailingWhitespace = segment.match(/\s*$/)?.[0] || ''
  let source = segment.slice(0, segment.length - trailingWhitespace.length)
  let previous = ''

  while (source !== previous) {
    previous = source
    source = source.replace(/,\s*$/, '')
    source = source.replace(/,?\s*\{\s*[A-Za-z_$][\w]*\s*$/, '')
  }

  const stack: string[] = []
  let inString = false
  let stringChar = ''
  let escaped = false

  for (const char of source) {
    if (escaped) {
      escaped = false
      continue
    }
    if (inString) {
      if (char === '\\') escaped = true
      else if (char === stringChar) inString = false
      continue
    }
    if (char === '"' || char === "'") {
      inString = true
      stringChar = char
      continue
    }
    if (char === '(' || char === '[' || char === '{') stack.push(char)
    else if ((char === ')' || char === ']' || char === '}') && stack.length) {
      stack.pop()
    }
  }

  if (inString) source += stringChar
  const closers: Record<string, string> = { '(': ')', '[': ']', '{': '}' }
  for (let index = stack.length - 1; index >= 0; index--) {
    source += closers[stack[index]]
  }

  return source + (trailingWhitespace.includes('\n') ? '\n' : '')
}

export function balanceStatements(code: string): string {
  const pattern = /^[$A-Za-z_][\w]*\s*=/gm
  const starts: number[] = []
  let match: RegExpExecArray | null

  while ((match = pattern.exec(code))) starts.push(match.index)
  if (starts.length <= 1) return code

  const segments: string[] = []
  if (starts[0] > 0) segments.push(code.slice(0, starts[0]))

  for (let index = 0; index < starts.length; index++) {
    const end = index + 1 < starts.length ? starts[index + 1] : code.length
    segments.push(balanceSegment(code.slice(starts[index], end)))
  }

  return segments.join('')
}

export function balancePartial(code: string): string {
  const stack: string[] = []
  let inString = false
  let stringChar = ''
  let escaped = false

  for (const char of code) {
    if (escaped) {
      escaped = false
      continue
    }
    if (inString) {
      if (char === '\\') {
        escaped = true
      } else if (char === stringChar) {
        inString = false
      }
      continue
    }
    if (char === '"' || char === "'") {
      inString = true
      stringChar = char
      continue
    }
    if (char === '(' || char === '[' || char === '{') stack.push(char)
    else if ((char === ')' || char === ']' || char === '}') && stack.length) {
      stack.pop()
    }
  }

  let result = code
  if (inString) result += stringChar
  result = result.replace(/,\s*$/, '')
  const closers: Record<string, string> = { '(': ')', '[': ']', '{': '}' }
  for (let index = stack.length - 1; index >= 0; index--) {
    result += closers[stack[index]]
  }
  return result
}

/**
 * Full-bleed section bands own their vertical padding, so the page-root Stack
 * that stacks them must not add gap between bands — the Stack default (gap-4 =
 * 16px) shows the transparent page background as black slivers between every
 * band. Force gap="none" on that stack ONLY.
 *
 * Detected structurally (generic, not per-site): a `X = Stack([a, b, ...])`
 * statement with no explicit args whose children are ALL vars assigned via
 * `= SectionAnchor(...)`. Inner content / freeform-app stacks (non-anchor
 * children or an explicit gap arg) are left untouched, preserving their
 * intended default spacing. Mirrors the server preprocess so live preview,
 * SSR, and exports all render band pages identically. Runs on the named form,
 * so existing persisted programs are fixed on next render (no regeneration).
 */
function forceGaplessSectionBandStack(code: string): string {
  const anchors = new Set(
    [...code.matchAll(/^\s*([A-Za-z_$][\w$]*)\s*=\s*SectionAnchor\s*\(/gm)].map(
      (m) => m[1],
    ),
  )
  if (anchors.size === 0) return code
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
 * Fix sub-page Stacks that incorrectly contain hero components.
 *
 * When the composition compiler's `findFocusedSection` fallback picked the
 * first non-navbar/footer section (which was often the hero), sub-pages like
 * /projects and /newsletter would render the home page's hero instead of
 * relevant content. This scans the source for non-home page Stacks that
 * contain hero components (SplitHero, CenteredHero, PosterHero) and replaces
 * them with the matching content section from the home page.
 *
 * Detected structurally (generic, not per-site): parses all `X = Y(...)` and
 * `X = SectionAnchor(...)` assignments, identifies the home page's Stack
 * children, then for non-home pages, swaps hero refs for the best matching
 * content section from home. Runs on the named form so existing persisted
 * programs are fixed on next render (no regeneration needed).
 */
function fixSubPageHeroStacks(code: string): string {
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
function fixNavbarLinksToMatchRoutes(code: string): string {
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

export function preprocessOpenUIRuntimeResponse(source: string): string {
  const withoutFences = stripActionCalls(
    String(source || '')
      .replace(/^```[a-z-]*\n?/i, '')
      .replace(/\n?```\s*$/, ''),
  )

  return forceGaplessSectionBandStack(
    fixSubPageHeroStacks(
      fixNavbarLinksToMatchRoutes(
        balancePartial(
          sanitizePartialImages(
            balanceStatements(
              repairObjectNullArgumentBoundaries(
                repairMalformedQuotedObjectKeys(withoutFences),
              ),
            ),
          ),
        ),
      ),
    ),
  )
}
