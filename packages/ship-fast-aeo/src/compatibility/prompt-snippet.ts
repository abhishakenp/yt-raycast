export function promptSnippet(prompt = '', max = 80, fallback = ''): string {
  const text = String(prompt || '').replace(/\s+/g, ' ').trim()
  if (!text) return fallback
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trim()}…`
}
