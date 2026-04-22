// @ts-check
import { verifyIdToken } from '../../auth/firebase-admin.js'

/**
 * Requires a valid Firebase Bearer token.
 * Sets req.user = { uid, email } on success.
 * Returns 401 if missing or invalid.
 */
export async function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const decoded = await verifyIdToken(auth.slice(7))
    req.user = { uid: decoded.uid, email: decoded.email }
    next()
  } catch (err) {
    console.error('[auth] token verification failed:', err?.message ?? err)
    res.status(401).json({ error: 'Unauthorized' })
  }
}

/**
 * Optionally decodes a Firebase Bearer token if present.
 * Sets req.user if valid, continues without error if missing/invalid.
 */
export async function optionalAuth(req, res, next) {
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) {
    try {
      const decoded = await verifyIdToken(auth.slice(7))
      req.user = { uid: decoded.uid, email: decoded.email }
    } catch (err) {
      console.error('[auth] optional token verification failed:', err?.message ?? err)
    }
  }
  next()
}
