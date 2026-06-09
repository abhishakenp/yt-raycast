import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  buildAgentationSessionKey,
  normalizeAgentationAnnotation,
} from '../agentation/agentation-session.js'

const DEFAULT_SESSIONS_DIR = join(process.cwd(), 'sessions')
const SESSION_ID_PATTERN = /^[a-zA-Z0-9_-]+$/
const AGENTATION_DIR = '.agentation'
const STATE_FILE = 'session.json'
const ANNOTATIONS_FILE = 'annotations.json'

function assertSessionId(sessionId) {
  const id = String(sessionId || '').trim()
  if (!SESSION_ID_PATTERN.test(id)) throw new Error('Invalid session id')
  return id
}

function getAgentationPaths(sessionId, sessionsDir) {
  const id = assertSessionId(sessionId)
  const sessionDir = join(sessionsDir, id)
  return {
    id,
    sessionDir,
    agentationDir: join(sessionDir, AGENTATION_DIR),
    statePath: join(sessionDir, AGENTATION_DIR, STATE_FILE),
    annotationsPath: join(sessionDir, AGENTATION_DIR, ANNOTATIONS_FILE),
  }
}

function readJson(path, fallback) {
  try {
    if (!existsSync(path)) return fallback
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return fallback
  }
}

function writeJson(path, value) {
  writeFileSync(path, JSON.stringify(value, null, 2))
}

export function readAgentationState(sessionId, { sessionsDir = DEFAULT_SESSIONS_DIR } = {}) {
  const paths = getAgentationPaths(sessionId, sessionsDir)
  const state = readJson(paths.statePath, {})
  const annotations = readJson(paths.annotationsPath, [])

  return {
    enabled: state.enabled === true,
    agentationSessionId: state.agentationSessionId || buildAgentationSessionKey(paths.id),
    enabledAt: state.enabledAt ?? null,
    annotations: Array.isArray(annotations) ? annotations : [],
  }
}

export function setAgentationEnabled(
  sessionId,
  { enabled, agentationSessionId = buildAgentationSessionKey(sessionId), now = Date.now() } = {},
  { sessionsDir = DEFAULT_SESSIONS_DIR } = {},
) {
  const paths = getAgentationPaths(sessionId, sessionsDir)
  mkdirSync(paths.agentationDir, { recursive: true })
  const next = {
    enabled: enabled === true,
    agentationSessionId,
    enabledAt: enabled === true ? now : null,
  }
  writeJson(paths.statePath, next)
  return readAgentationState(paths.id, { sessionsDir })
}

export function upsertAgentationAnnotation(
  sessionId,
  annotation,
  { sessionsDir = DEFAULT_SESSIONS_DIR, now = Date.now() } = {},
) {
  const paths = getAgentationPaths(sessionId, sessionsDir)
  mkdirSync(paths.agentationDir, { recursive: true })
  const current = readAgentationState(paths.id, { sessionsDir })
  const normalized = normalizeAgentationAnnotation({
    sessionId: paths.id,
    annotation: {
      ...annotation,
      sessionId: annotation?.sessionId || current.agentationSessionId,
    },
    now,
  })
  const annotations = current.annotations.filter(
    (entry) => entry.annotationId !== normalized.annotationId,
  )
  const existing = current.annotations.find((entry) => entry.annotationId === normalized.annotationId)
  annotations.push({
    ...normalized,
    createdAt: existing?.createdAt ?? now,
  })
  writeJson(paths.annotationsPath, annotations)
  return readAgentationState(paths.id, { sessionsDir })
}

export function deleteAgentationAnnotation(
  sessionId,
  annotationId,
  { sessionsDir = DEFAULT_SESSIONS_DIR } = {},
) {
  const paths = getAgentationPaths(sessionId, sessionsDir)
  const current = readAgentationState(paths.id, { sessionsDir })
  const annotations = current.annotations.filter((entry) => entry.annotationId !== annotationId)
  mkdirSync(paths.agentationDir, { recursive: true })
  writeJson(paths.annotationsPath, annotations)
  return readAgentationState(paths.id, { sessionsDir })
}

export function clearAgentationAnnotations(
  sessionId,
  { sessionsDir = DEFAULT_SESSIONS_DIR } = {},
) {
  const paths = getAgentationPaths(sessionId, sessionsDir)
  mkdirSync(paths.agentationDir, { recursive: true })
  writeJson(paths.annotationsPath, [])
  return readAgentationState(paths.id, { sessionsDir })
}
