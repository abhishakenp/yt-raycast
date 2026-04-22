// @ts-check
import { parse as parseCookies } from 'cookie'

export const AUTH_COOKIE_NAME = 'sf_auth_token'

/**
 * Extracts the auth token from Authorization header or cookie.
 * @param {import('express').Request} req
 * @returns {{ token: string|null, source: 'header'|'cookie'|null }}
 */
export function getRequestAuthToken(req) {
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) {
    return { token: auth.slice(7), source: 'header' }
  }

  const cookies = parseCookies(req.headers.cookie ?? '')
  const token = cookies[AUTH_COOKIE_NAME]
  if (token) {
    return { token, source: 'cookie' }
  }

  return { token: null, source: null }
}
