export function stableHash(input) {
  const text = String(input ?? '')
  let hash = 2166136261
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function seedKey(...parts) {
  return parts.filter((part) => part !== undefined && part !== null).join('::')
}

export function seededIndex(length, seed, salt = '') {
  if (!length) return -1
  return stableHash(seedKey(seed, salt)) % length
}

export function pickSeeded(items, seed, salt = '') {
  if (!Array.isArray(items) || items.length === 0) return null
  return items[seededIndex(items.length, seed, salt)]
}

export function slugify(value) {
  return String(value ?? 'homepage')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'homepage'
}

export function normalizeSeed(seed) {
  return seed === undefined || seed === null || seed === ''
    ? `run-${Date.now()}`
    : String(seed)
}
