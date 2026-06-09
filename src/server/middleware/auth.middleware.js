// @ts-check
import { verifyIdToken } from '../../auth/firebase-admin.js'
import { resolveStartClerkUser } from '../../session-domain/start-auth.js'

async function resolveBearerUser(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) return null

  const clerkUser = await resolveStartClerkUser({ authorization: authHeader })
  if (clerkUser?.uid) {
    return { uid: clerkUser.uid, email: clerkUser.email, provider: 'clerk' }
  }

  const decoded = await verifyIdToken(authHeader.slice(7))
  return { uid: decoded.uid, email: decoded.email, provider: 'firebase' }
}

/**
 * Requires a valid Clerk Bearer token. Firebase remains as legacy fallback.
 * Sets req.user = { uid, email } on success.
 * Returns 401 if missing or invalid.
 */
export async function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  try {
    req.user = await resolveBearerUser(auth)
    next()
  } catch (err) {
    console.error('[auth] token verification failed:', err?.message ?? err)
    res.status(401).json({ error: 'Unauthorized' })
  }
}

/**
 * Optionally decodes a Clerk Bearer token if present. Firebase remains as legacy fallback.
 * Sets req.user if valid, continues without error if missing/invalid.
 */
export async function optionalAuth(req, res, next) {
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) {
    try {
      req.user = await resolveBearerUser(auth)
    } catch (err) {
      console.error('[auth] optional token verification failed:', err?.message ?? err)
    }
  }
  next()
}

/**
 * Requires either a valid Clerk/Firebase Bearer token or the internal provision secret.
 * Used by server-to-server provision routes that may also be called from the browser.
 */
export async function requireProvisionAuth(req, res, next) {
  const internalSecret = process.env.INTERNAL_API_SECRET
  const authHeader = req.headers.authorization
  const internalHeader = req.headers['x-internal-secret']

  if (internalSecret && internalHeader === internalSecret) {
    return next()
  }

  if (authHeader?.startsWith('Bearer ')) {
    try {
      req.user = await resolveBearerUser(authHeader)
      return next()
    } catch (err) {
      console.error('[auth] provision token verification failed:', err?.message ?? err)
    }
  }

  res.status(401).json({ error: 'Unauthorized' })
}
