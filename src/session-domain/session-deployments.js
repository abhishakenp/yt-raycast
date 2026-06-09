import { join } from 'node:path'
import { initDeployments } from '../server/deployments.js'
import {
  getSession,
  initSessionDir,
} from '../server/sessions.js'
import {
  provisionDeploymentIfNeeded,
  readSessionDeployment,
} from '../server/session-deployments.js'
import { assertStartSessionAccess } from './start-auth.js'

const DEFAULT_SESSIONS_DIR = join(process.cwd(), 'sessions')

function createAccessError(message, statusCode) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function readSession(sessionId, { sessionsDir = DEFAULT_SESSIONS_DIR } = {}) {
  initSessionDir(sessionsDir)
  initDeployments(sessionsDir)
  const session = getSession(String(sessionId || '').trim())
  if (!session) throw createAccessError('Session not found.', 404)
  return session
}

export function readStartDeploymentState(sessionId, options = {}) {
  const session = readSession(sessionId, options)
  const deployment = readSessionDeployment(session)
  return {
    sessionId: session.id,
    deployed: Boolean(deployment),
    deployment,
    owner: session.userId ? { type: 'user', id: session.userId } : { type: 'anonymous' },
    ownerSecretRequired: !session.userId,
    authenticatedDeployRequired: false,
    authenticationRequired: Boolean(session.userId),
  }
}

export async function provisionStartDeployment(sessionId, options = {}) {
  const session = readSession(sessionId, options)
  assertStartSessionAccess(session, {
    action: 'deploy',
    authUser: options.authUser,
    ownerSecret: options.ownerSecret,
  })
  const deployment = await provisionDeploymentIfNeeded(session, {
    generateSlug: options.generateSlug,
  })
  return {
    ...readStartDeploymentState(session.id, options),
    deployment,
    deployed: true,
  }
}
