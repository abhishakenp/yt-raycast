import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { getSessionExportTargets } from '../server/exports.js'
import {
  getSession,
  initSessionDir,
} from '../server/sessions.js'
import { pushSessionToGitHub } from '../server/github.js'
import { assertStartSessionAccess } from './start-auth.js'

const DEFAULT_SESSIONS_DIR = join(process.cwd(), 'sessions')
const TARGET_RE = /^[a-z0-9_-]+$/i
const GITHUB_EXPORT_META_FILE = '.github-export.json'

function createAccessError(message, statusCode) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function normalizeTarget(target) {
  const value = String(target || '').trim().toLowerCase()
  if (!TARGET_RE.test(value)) {
    throw createAccessError('Invalid GitHub export target.', 400)
  }
  return value
}

function readSession(sessionId, { sessionsDir = DEFAULT_SESSIONS_DIR } = {}) {
  initSessionDir(sessionsDir)
  const session = getSession(String(sessionId || '').trim())
  if (!session) throw createAccessError('Session not found.', 404)
  return session
}

function readGitHubMetadata(workspace) {
  const metadataPath = join(workspace, GITHUB_EXPORT_META_FILE)
  if (!existsSync(metadataPath)) return { targets: {} }
  try {
    const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'))
    return {
      ...metadata,
      targets: metadata?.targets && typeof metadata.targets === 'object'
        ? metadata.targets
        : {},
    }
  } catch {
    return { targets: {} }
  }
}

function decorateTargets(session) {
  const metadata = readGitHubMetadata(session.workspace)
  return getSessionExportTargets(session).map((target) => {
    const github = metadata.targets?.[target.target] || null
    return {
      ...target,
      github: github
        ? {
            repoFullName: github.repoFullName || null,
            repoName: github.repoName || null,
            repoUrl: github.repoUrl || null,
            branch: github.branch || null,
            commitSha: github.commitSha || null,
            lastPushedAt: github.lastPushedAt || null,
            targetLabel: github.targetLabel || null,
          }
        : null,
    }
  })
}

export function readStartGitHubState(sessionId, options = {}) {
  const session = readSession(sessionId, options)
  return {
    sessionId: session.id,
    siteSpecReady: Boolean(session.siteSpecReady),
    owner: session.userId ? { type: 'user', id: session.userId } : { type: 'anonymous' },
    ownerSecretRequired: !session.userId,
    authenticatedPushRequired: false,
    authenticationRequired: Boolean(session.userId),
    targets: decorateTargets(session),
  }
}

export async function pushStartSessionToGitHub(sessionId, options = {}) {
  const session = readSession(sessionId, options)
  const normalizedTarget = normalizeTarget(options.target)
  const githubAccessToken = String(options.githubAccessToken || '').trim()
  if (!githubAccessToken) {
    throw createAccessError('GitHub access token is required for this push.', 400)
  }

  assertStartSessionAccess(session, {
    action: 'GitHub push',
    authUser: options.authUser,
    ownerSecret: options.ownerSecret,
  })

  const pushSession = options.pushSessionToGitHub || pushSessionToGitHub
  const result = await pushSession(session, {
    target: normalizedTarget,
    githubAccessToken,
  })

  return {
    ...readStartGitHubState(session.id, options),
    pushed: true,
    result,
  }
}
