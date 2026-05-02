export function normalizePromptText(prompt) {
  return typeof prompt === 'string' ? prompt.trim() : ''
}

export function requirePromptText(prompt) {
  const normalizedPrompt = normalizePromptText(prompt)
  if (!normalizedPrompt) throw new Error('Prompt is required.')
  return normalizedPrompt
}

export function promptSnippet(prompt, maxLength = 80, fallback = '') {
  const normalizedPrompt = normalizePromptText(prompt)
  if (!normalizedPrompt) return fallback
  return normalizedPrompt.slice(0, maxLength)
}
