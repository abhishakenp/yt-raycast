const SCRIPT_STYLE_BLOCK_RE =
  /<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi

type ProtectedBlock = { token: string; value: string }

function protectBlocks(html: string) {
  const blocks: ProtectedBlock[] = []
  const protectedHtml = html.replace(SCRIPT_STYLE_BLOCK_RE, (value) => {
    const token = `__SHIP_FAST_PROTECTED_${blocks.length}__`
    blocks.push({ token, value })
    return token
  })
  return { protectedHtml, blocks }
}

function restoreBlocks(html: string, blocks: ProtectedBlock[]) {
  return blocks.reduce(
    (current, block) => current.replace(block.token, block.value),
    html,
  )
}

// An occurrence is "inside a tag" (i.e. within an attribute value or tag name)
// when the nearest `<` before it comes after the nearest `>`. Visible text lives
// between a closing `>` and the next opening `<`, so lastClose > lastOpen there.
function isInsideTag(html: string, index: number): boolean {
  const lastOpen = html.lastIndexOf('<', index)
  const lastClose = html.lastIndexOf('>', index)
  return lastOpen > lastClose
}

export function applyPreviewTextEdit(
  html: string,
  { oldText, newText }: { oldText?: string; newText?: string },
): { html: string; replaced: boolean } {
  const source = html
  const from = String(oldText ?? '')
  const to = String(newText ?? '')
  if (!source.trim() || !from.trim()) return { html: source, replaced: false }

  const { protectedHtml, blocks } = protectBlocks(source)

  let searchFrom = 0
  let index = -1
  while ((index = protectedHtml.indexOf(from, searchFrom)) >= 0) {
    if (!isInsideTag(protectedHtml, index)) break
    searchFrom = index + from.length
  }
  if (index < 0) return { html: source, replaced: false }

  const edited = `${protectedHtml.slice(0, index)}${to}${protectedHtml.slice(index + from.length)}`
  return { html: restoreBlocks(edited, blocks), replaced: true }
}
