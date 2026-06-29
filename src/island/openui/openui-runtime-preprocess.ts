export function stripNullsFromArrays(code: string): string {
  return code
    .replace(/,\s*null\s*(?=[,\]])/g, '')
    .replace(/(?<=\[)\s*null\s*,\s*/g, '')
    .replace(/^\s*null\s*$/gm, '')
    .replace(/,\s*\{\s*\}\s*(?=[,\]])/g, '')
    .replace(/(?<=[,\[])\s*\{\s*\}\s*,/g, ',')
    .replace(/,\s*\[\s*\]\s*(?=[,\]])/g, '')
    .replace(/(?<=[,\[])\s*\[\s*\]\s*,/g, ',')
    .replace(/,\s*,/g, ',')
    .replace(/^\s*,\s*/gm, '')
    .replace(/,\s*$/gm, '')
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

export function preprocessOpenUIRuntimeResponse(source: string): string {
  const withoutFences = String(source || '')
    .replace(/^```[a-z-]*\n?/i, '')
    .replace(/\n?```\s*$/, '')
    .replace(/Action\([^)]*\)/g, 'null')

  return balancePartial(
    sanitizePartialImages(
      balanceStatements(
        repairObjectNullArgumentBoundaries(
          repairMalformedQuotedObjectKeys(withoutFences),
        ),
      ),
    ),
  )
}
