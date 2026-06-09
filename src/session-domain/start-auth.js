import { readAnonOwnerSecret } from '../server/sessions.js'

function createAccessError(message, statusCode) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function readBearerToken({ authorization = '', authToken = '' } = {}) {
  const explicitToken = String(authToken || '').trim()
  if (explicitToken) return explicitToken

  const header = String(authorization || '').trim()
  if (!header.toLowerCase().startsWith('bearer ')) return ''
  return header.slice(7).trim()
}

async function verifyClerkSessionToken(token) {
  const secretKey = String(process.env.CLERK_SECRET_KEY || '').trim()
  if (!secretKey) {
    throw createAccessError('Clerk server auth is not configured.', 503)
  }

  const { verifyToken } = await import('@clerk/backend')
  return verifyToken(token, { secretKey })
}

function normalizeClerkPayload(payload) {
  const subject = String(payload?.sub || payload?.subject || payload?.userId || '').trim()
  if (!subject) return null
  return {
    uid: subject,
    clerkUserId: subject,
    email: payload?.email || payload?.emailAddress,
  }
}

export async function resolveStartClerkUser(credentials = {}, options = {}) {
  const token = readBearerToken(credentials)
  if (!token) return null

  try {
    const verifyClerkToken = options.verifyClerkToken || verifyClerkSessionToken
    return normalizeClerkPayload(await verifyClerkToken(token))
  } catch {
    return null
  }
}

export function assertStartSessionAccess(session, options = {}) {
  const action = options.action || 'action'

  if (session.userId) {
    const authUser = options.authUser || null
    if (!authUser?.uid) {
      throw createAccessError(`Sign in with Clerk is required for this ${action}.`, 401)
    }
    if (String(authUser.uid) !== String(session.userId)) {
      throw createAccessError('This project belongs to another user.', 403)
    }
    return
  }

  const expectedSecret = readAnonOwnerSecret(session.workspace)
  const providedSecret = String(options.ownerSecret || '').trim()
  if (!expectedSecret || providedSecret !== expectedSecret) {
    throw createAccessError(`Anonymous owner secret is required for this ${action}.`, 403)
  }
}
