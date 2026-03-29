export const AUTH_COOKIE_NAME = 'sf_auth_token'

export function getRequestAuthToken(req) {
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) {
    return { token: auth.slice(7), source: 'header' }
  }

  const cookies = parseCookies(req.headers.cookie)
  const token = cookies[AUTH_COOKIE_NAME]
  if (token) {
    return { token, source: 'cookie' }
  }

  return { token: null, source: null }
}

function parseCookies(cookieHeader = '') {
  const cookies = {}

  for (const part of cookieHeader.split(';')) {
    const trimmed = part.trim()
    if (!trimmed) continue

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim()
    cookies[key] = decodeURIComponent(value)
  }

  return cookies
}
