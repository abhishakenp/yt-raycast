export function normalizedPromptForReuse(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N} ]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function promptTokensForReuse(value: string): string[] {
  return normalizedPromptForReuse(value).split(' ').filter(Boolean)
}

export function isGibberishPromptClient(text: string): boolean {
  const compact = String(text || '').replace(/\s/g, '')
  if (compact.length >= 70 && new Set(compact).size < 10) return true
  const words = String(text || '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
  if (words.length >= 5) {
    const unique = new Set(words)
    if (unique.size <= 2) return true
  }
  return false
}

export function canReusePrefetchedPrompt(
  prefetchedPrompt: string,
  submittedPrompt: string,
): boolean {
  const base = promptTokensForReuse(prefetchedPrompt)
  const next = promptTokensForReuse(submittedPrompt)
  if (base.length < 4 || next.length < 4) return false
  const baseText = base.join(' ')
  const nextText = next.join(' ')
  if (baseText === nextText) return true
  const trailingOpenEnded = /^(about|for|with|of|in|on|to)$/.test(
    base[base.length - 1] || '',
  )
  if (
    !trailingOpenEnded &&
    nextText.startsWith(`${baseText} `) &&
    next.length - base.length <= 2
  ) {
    return true
  }
  const baseSet = new Set(base)
  const nextSet = new Set(next)
  const overlap = next.filter((token) => baseSet.has(token)).length
  const union = new Set([...baseSet, ...nextSet]).size
  return (
    union > 0 &&
    overlap / union >= 0.88 &&
    Math.abs(next.length - base.length) <= 2
  )
}

export function generationPayloadFingerprint(
  payload: Record<string, unknown>,
): string {
  const { prompt: _prompt, ...stablePayload } = payload
  return JSON.stringify(stablePayload)
}
