const LOCALE_COOKIE = 'sf_locale'

const parseCookies = (cookieHeader = '') => {
  const cookies = {}
  for (const part of String(cookieHeader).split(';')) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const i = trimmed.indexOf('=')
    if (i === -1) continue
    const key = trimmed.slice(0, i).trim()
    const value = trimmed.slice(i + 1).trim()
    try {
      cookies[key] = decodeURIComponent(value)
    } catch {
      cookies[key] = value
    }
  }
  return cookies
}

const isSecureRequest = (req) =>
  req.secure === true ||
  String(req.headers?.['x-forwarded-proto'] ?? '')
    .split(',')[0]
    .trim() === 'https'

export const applyPublicLocaleResponseHeaders = (res) => {
  res.set('Cache-Control', 'private, no-store, must-revalidate')
  res.set('Vary', 'Cookie, Accept-Language')
}

const localeFromAcceptLanguage = (header) => {
  if (!header || typeof header !== 'string') return null
  const parts = header.split(',').map((p) => p.split(';')[0].trim().toLowerCase())
  for (const p of parts) {
    const base = p.split('-')[0]
    if (base === 'hi') return 'hi'
    if (base === 'en') return 'en'
  }
  return null
}

export const getPublicLocaleCookieName = () => LOCALE_COOKIE

export const normalizePublicLocale = (raw) => {
  const base = String(raw || 'en')
    .trim()
    .toLowerCase()
    .split('-')[0]
  return base === 'hi' ? 'hi' : 'en'
}

export const pickLocalized = (obj, locale) => {
  if (obj == null) return ''
  if (typeof obj === 'string') return obj.trim()
  if (typeof obj !== 'object') return ''
  const key = normalizePublicLocale(locale)
  const direct = obj[key]
  if (typeof direct === 'string' && direct.trim()) return direct.trim()
  if (typeof obj.en === 'string' && obj.en.trim()) return obj.en.trim()
  for (const k of Object.keys(obj)) {
    if (k.startsWith('_')) continue
    const v = obj[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

const firstQueryValue = (v) => {
  if (v == null) return ''
  if (Array.isArray(v)) return String(v[0] ?? '').trim()
  return String(v).trim()
}

const langParamFromRequestUrl = (req) => {
  const raw = String(req.originalUrl || req.url || '')
  const m = /[?&]lang=([^&]+)/.exec(raw)
  if (!m) return ''
  try {
    return decodeURIComponent(m[1]).trim()
  } catch {
    return String(m[1] ?? '').trim()
  }
}

export const getLocaleFromRequest = (req, res) => {
  const q = firstQueryValue(req.query?.lang) || langParamFromRequestUrl(req)
  if (q !== '') {
    const loc = normalizePublicLocale(q)
    res.cookie(LOCALE_COOKIE, loc, {
      maxAge: 31536000 * 1000,
      path: '/',
      sameSite: 'lax',
      secure: isSecureRequest(req),
      httpOnly: false,
    })
    return loc
  }
  const cookies = parseCookies(req.headers?.cookie || '')
  const c = cookies[LOCALE_COOKIE]
  if (c) {
    const loc = normalizePublicLocale(c)
    return loc
  }
  const fromAccept = localeFromAcceptLanguage(req.headers?.['accept-language'])
  if (fromAccept) return fromAccept
  return 'en'
}

export const langQuery = (locale) => {
  const loc = normalizePublicLocale(locale)
  return `?lang=${encodeURIComponent(loc)}`
}

export const noticesListPath = (kind, locale) => {
  const p = new URLSearchParams()
  if (kind) p.set('kind', kind)
  p.set('lang', normalizePublicLocale(locale))
  return `/notices?${p.toString()}`
}
