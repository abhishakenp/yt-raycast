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

function stripNullsFromArrays(code: string): string {
  // Aggressive null stripping for streaming: remove all null values from arrays
  // to prevent "Cannot read properties of null" errors when components map over
  // incomplete arrays during progressive rendering.
  // Also removes objects with only null/empty properties that came from incomplete Image() calls.
  let result = code

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
  let result = String(s || '')
    .replace(/^```[a-z-]*\n?/i, '')
    .replace(/\n?```\s*$/, '')
    .replace(/Action\([^)]*\)/g, 'null')

  // Repair truncated mid-program statements before any ref resolution so a
  // broken statement can't swallow the ones after it (which leak as raw text).
  result = balanceStatements(result)
  result = stripTopLevelSectionArgLabels(result)

  if (resolveRefs) result = resolveVariables(result)
  result = sanitizePartialImages(result)
  return balancePartial(result)
}
