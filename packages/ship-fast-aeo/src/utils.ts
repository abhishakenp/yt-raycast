export function uniqueStrings(values: string[] = []): string[] {
  return [
    ...new Set(
      values.map((value) => String(value || '').trim()).filter(Boolean),
    ),
  ]
}

export function cleanObject<T>(value: T): T | undefined {
  if (Array.isArray(value)) {
    const cleaned = value
      .map(cleanObject)
      .filter((entry) => entry !== undefined)
    return (cleaned.length ? cleaned : undefined) as T | undefined
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, entry]) => [key, cleanObject(entry)])
      .filter(([, entry]) => entry !== undefined)
    return (entries.length ? Object.fromEntries(entries) : undefined) as
      | T
      | undefined
  }

  if (value === '' || value == null) return undefined
  return value
}

export function normalizePath(value = '/'): string {
  const raw = String(value || '').trim()
  if (!raw || raw === '/') return '/'
  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw)
      return `${parsed.pathname || '/'}${parsed.search || ''}${parsed.hash || ''}`
    } catch {
      return '/'
    }
  }
  return raw.startsWith('/') ? raw : `/${raw}`
}

export function joinUrl(baseUrl: string, path = '/'): string {
  if (!baseUrl) return ''
  try {
    return new URL(normalizePath(path), `${baseUrl}/`).toString()
  } catch {
    return ''
  }
}

export function escapeHtml(value = ''): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function serializeStructuredData(data: unknown[]): string {
  return JSON.stringify(data.length === 1 ? data[0] : data).replace(
    /</g,
    '\\u003c',
  )
}
