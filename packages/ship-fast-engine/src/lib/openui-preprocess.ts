/**
 * Shared OpenUI Lang normalization for pipeline + preview parity.
 * Mirrors client OpenUIViewer preprocessing (fences, variables, streaming fixes).
 */

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
  const varNames = [...code.matchAll(varPattern)].map((m) => m[1]).filter((n) => n !== 'root')
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
  const idx = code.lastIndexOf('null')
  if (idx === -1) return code
  // Only care about the tail null we just introduced
  if (idx < code.length - 200) return code

  // Find the enclosing '[' (scan backwards, tracking bracket depth)
  let depth = 0
  let bracketStart = -1
  for (let i = idx - 1; i >= Math.max(0, idx - 500); i--) {
    const ch = code[i]
    if (ch === ']') depth++
    else if (ch === '[') {
      if (depth === 0) { bracketStart = i; break }
      depth--
    }
  }
  if (bracketStart === -1) return code

  const arrayContent = code.slice(bracketStart + 1, idx + 4 + 1) // through 'null' (slice end is exclusive)

  let cleaned = arrayContent
  // ", null" at end
  cleaned = cleaned.replace(/,\s*null\s*$/, '')
  // "null ," at start
  cleaned = cleaned.replace(/^\s*null\s*,\s*/, '')
  // ", null," in middle → ","
  cleaned = cleaned.replace(/,(\s*)null\s*,/, ',$1')
  // "[null]" → "[]"
  cleaned = cleaned.replace(/^\s*null\s*$/, '')

  return code.slice(0, bracketStart + 1) + cleaned + code.slice(bracketStart + 1 + arrayContent.length)
}

function balancePartial(code: string): string {
  let inString = false
  let stringChar = ''
  let escape = false
  let parens = 0

  for (let i = 0; i < code.length; i++) {
    const c = code[i]
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
      const trimmed = result.replace(/[,(]\s*[A-Za-z_][A-Za-z0-9_]*\s*$/, (match) => match[0])
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

  if (resolveRefs) result = resolveVariables(result)
  result = sanitizePartialImages(result)
  return balancePartial(result)
}
