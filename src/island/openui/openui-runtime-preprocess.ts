function stripNullsFromArrays(code: string): string {
  return code
    .replace(/,\s*null\s*(?=[,\]])/g, '')
    .replace(/(?<=[,\[])\s*null\s*,/g, ',')
    .replace(/^\s*null\s*$/gm, '')
    .replace(/,\s*\{\s*\}\s*(?=[,\]])/g, '')
    .replace(/(?<=[,\[])\s*\{\s*\}\s*,/g, ',')
    .replace(/,\s*\[\s*\]\s*(?=[,\]])/g, '')
    .replace(/(?<=[,\[])\s*\[\s*\]\s*,/g, ',')
    .replace(/,\s*,/g, ',')
    .replace(/^\s*,\s*/gm, '')
    .replace(/,\s*$/gm, '')
}

function sanitizePartialImages(code: string): string {
  const replaced = code.replace(/Image\("https:\/\/[^"]*$/, 'null')
  return replaced === code ? code : stripNullsFromArrays(replaced)
}

function balanceSegment(segment: string): string {
  const trailingWhitespace = segment.match(/\s*$/)?.[0] || ''
  let source = segment.slice(0, segment.length - trailingWhitespace.length)
  let previous = ''

  while (source !== previous) {
    previous = source
    source = source.replace(/,\s*$/, '')
    source = source.replace(/,?\s*\{\s*[A-Za-z_$][\w]*\s*$/, '')
    source = source.replace(/[,(]\s*[A-Za-z_$][\w]*\s*$/, (match) => match[0])
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

function balanceStatements(code: string): string {
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

function balancePartial(code: string): string {
  let inString = false
  let stringChar = ''
  let escaped = false
  let parens = 0

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
    if (char === '(') parens++
    else if (char === ')') parens--
  }

  let result = code
  if (inString) result += stringChar
  if (parens > 0) {
    if (result.slice(result.length - 1).match(/[A-Za-z0-9_]/)) {
      result = result.replace(
        /[,(]\s*[A-Za-z_][A-Za-z0-9_]*\s*$/,
        (value) => value[0],
      )
    }
    result = result.replace(/,\s*$/, '')
  }
  for (let index = 0; index < parens; index++) result += ')'
  return result
}

export function preprocessOpenUIRuntimeResponse(source: string): string {
  const withoutFences = String(source || '')
    .replace(/^```[a-z-]*\n?/i, '')
    .replace(/\n?```\s*$/, '')
    .replace(/Action\([^)]*\)/g, 'null')

  return balancePartial(sanitizePartialImages(balanceStatements(withoutFences)))
}
