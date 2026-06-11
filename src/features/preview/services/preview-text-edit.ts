const SCRIPT_STYLE_BLOCK_RE =
  /<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi

type ProtectedBlock = { token: string; value: string }

const protectBlocks = (html: string) => {
  const blocks: ProtectedBlock[] = []
  const protectedHtml = html.replace(SCRIPT_STYLE_BLOCK_RE, (value) => {
    const token = `__SHIP_FAST_PROTECTED_${blocks.length}__`
    blocks.push({ token, value })
    return token
  })
  return { protectedHtml, blocks }
}

const restoreBlocks = (html: string, blocks: ProtectedBlock[]) =>
  blocks.reduce(
    (current, block) => current.replace(block.token, block.value),
    html,
  )

export const applyPreviewTextEdit = (
  html: string,
  { oldText, newText }: { oldText?: string; newText?: string },
): { html: string; replaced: boolean } => {
  const source = String(html ?? '')
  const from = String(oldText ?? '')
  const to = String(newText ?? '')
  if (!source.trim() || !from.trim()) return { html: source, replaced: false }

  const { protectedHtml, blocks } = protectBlocks(source)
  const index = protectedHtml.indexOf(from)
  if (index < 0) return { html: source, replaced: false }

  const edited = `${protectedHtml.slice(0, index)}${to}${protectedHtml.slice(index + from.length)}`
  return { html: restoreBlocks(edited, blocks), replaced: true }
}
