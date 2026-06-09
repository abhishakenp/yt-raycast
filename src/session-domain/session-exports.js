import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  generateSessionExport,
  getSessionExportBundle,
  getSessionExportTargets,
} from '../server/exports.js'
import {
  getSession,
  initSessionDir,
} from '../server/sessions.js'
import { assertStartSessionAccess } from './start-auth.js'

const DEFAULT_SESSIONS_DIR = join(process.cwd(), 'sessions')
const TARGET_RE = /^[a-z0-9_-]+$/i

function createAccessError(message, statusCode) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function normalizeTarget(target) {
  const value = String(target || '').trim().toLowerCase()
  if (!TARGET_RE.test(value)) {
    throw createAccessError('Invalid export target.', 400)
  }
  return value
}

function readSession(sessionId, { sessionsDir = DEFAULT_SESSIONS_DIR } = {}) {
  initSessionDir(sessionsDir)
  const session = getSession(String(sessionId || '').trim())
  if (!session) throw createAccessError('Session not found.', 404)
  return session
}

function decorateTargets(session, targets) {
  return targets.map((target) => ({
    ...target,
    startDownloadPath: target.ready
      ? `/api/start/sessions/${encodeURIComponent(session.id)}/download/${encodeURIComponent(target.target)}`
      : null,
  }))
}

export function readStartExportState(sessionId, options = {}) {
  const session = readSession(sessionId, options)
  const targets = getSessionExportTargets(session)
  return {
    sessionId: session.id,
    siteSpecReady: Boolean(session.siteSpecReady),
    owner: session.userId ? { type: 'user', id: session.userId } : { type: 'anonymous' },
    ownerSecretRequired: !session.userId,
    authenticatedDownloadRequired: false,
    authenticationRequired: Boolean(session.userId),
    targets: decorateTargets(session, targets),
  }
}

export function buildStartSessionExport(sessionId, target, options = {}) {
  const session = readSession(sessionId, options)
  const normalizedTarget = normalizeTarget(target)
  const result = generateSessionExport(session, normalizedTarget)
  return {
    ...readStartExportState(session.id, options),
    result,
  }
}

export function readStartExportBundle(sessionId, target, options = {}) {
  const session = readSession(sessionId, options)
  const normalizedTarget = normalizeTarget(target)
  assertStartSessionAccess(session, {
    action: 'download',
    authUser: options.authUser,
    ownerSecret: options.ownerSecret,
  })

  const bundle = getSessionExportBundle(session, normalizedTarget)
  if (!bundle) {
    throw createAccessError('Export bundle is not ready yet.', 404)
  }

  return {
    ...bundle,
    target: normalizedTarget,
    filename: `${session.id}-${normalizedTarget}.zip`,
    buffer: readFileSync(bundle.path),
  }
}
