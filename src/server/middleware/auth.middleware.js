// @ts-check
import { resolveStartClerkUser } from '../../session-domain/start-auth.js'

async function resolveBearerUser(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) return null

  const clerkUser = await resolveStartClerkUser({ authorization: authHeader })
  if (clerkUser?.uid) {
    return { uid: clerkUser.uid, email: clerkUser.email, provider: 'clerk' }
  }

  return null
}

/**
 * Requires a valid Clerk Bearer token.
 * Sets req.user = { uid, email } on success.
 * Returns 401 if missing or invalid.
 */
export async function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const user = await resolveBearerUser(auth)
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    req.user = user
    next()
  } catch (err) {
    console.error('[auth] token verification failed:', err?.message ?? err)
    res.status(401).json({ error: 'Unauthorized' })
  }
}

/**
 * Optionally decodes a Clerk Bearer token if present.
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
 * Requires either a valid Clerk Bearer token or the internal provision secret.
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
      const user = await resolveBearerUser(authHeader)
      if (user) {
        req.user = user
        return next()
      }
    } catch (err) {
      console.error('[auth] provision token verification failed:', err?.message ?? err)
    }
  }

  res.status(401).json({ error: 'Unauthorized' })
}
