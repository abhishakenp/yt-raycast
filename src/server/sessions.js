// @ts-check
import { randomBytes } from 'node:crypto'
import {
  mkdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
  rmSync,
  readdirSync,
  statSync,
  unlinkSync,
} from 'node:fs'
import { join } from 'node:path'
import { BASE_DOMAIN } from '../config.js'
import { readSessionThemeOverride, persistSessionThemeOverride } from './theme.js'
import { SUPPORTED_EXPORT_TARGETS } from '../spec/index.js'
import { getDeploymentBySessionId, removeDeploymentBySessionId } from './deployments.js'
import { normalizeSession, validateSession } from '../contracts/contracts.js'
import { readDesignReferenceFingerprintFromWorkspace } from '../pipeline/ecommerce-design-references.js'
import { invalidatePublicGallery } from './public-gallery-cache.js'

const sessions = new Map()
let _sessionsDir = null
const SESSION_META_FILE = '.session.json'
const ANON_OWNER_FILE = '.anon-owner'
const DEFAULT_PREFERRED_EXPORT_TARGET = 'html'
const DEFAULT_PREFERRED_LANGUAGE = 'en'

export function readAnonOwnerSecret(workspace) {
  if (!workspace) return ''
  try {
    const filePath = join(workspace, ANON_OWNER_FILE)
    if (!existsSync(filePath)) return ''
    return readFileSync(filePath, 'utf8').trim()
  } catch {
    return ''
  }
}

function normalizePreferredLanguage(value) {
  const requested = String(value || '')
    .trim()
    .toLowerCase()
  if (!requested || requested === 'en') return DEFAULT_PREFERRED_LANGUAGE
  if (requested === 'hinglish') return 'hinglish'
  if (/^[a-z]{2,8}-en$/.test(requested)) return requested
  return /^[a-z]{2,8}$/.test(requested) ? requested : DEFAULT_PREFERRED_LANGUAGE
}

export function normalizePreferredExportTarget(value) {
  const target = String(value || '')
    .trim()
    .toLowerCase()
  return SUPPORTED_EXPORT_TARGETS.includes(target) ? target : DEFAULT_PREFERRED_EXPORT_TARGET
}

function readSessionMeta(workspace) {
  const metaPath = join(workspace, SESSION_META_FILE)
  if (!existsSync(metaPath)) {
    return {
      preferredExportTarget: DEFAULT_PREFERRED_EXPORT_TARGET,
      preferredLanguage: DEFAULT_PREFERRED_LANGUAGE,
      isPrivate: false,
    }
  }

  try {
    const data = JSON.parse(readFileSync(metaPath, 'utf-8'))
    return {
      preferredExportTarget: normalizePreferredExportTarget(data?.preferredExportTarget),
      preferredLanguage: normalizePreferredLanguage(data?.preferredLanguage),
      isPrivate: false,
    }
  } catch {
    return {
      preferredExportTarget: DEFAULT_PREFERRED_EXPORT_TARGET,
      preferredLanguage: DEFAULT_PREFERRED_LANGUAGE,
      isPrivate: false,
    }
  }
}

function writeSessionMeta(workspace, metaPatch = {}) {
  const metaPath = join(workspace, SESSION_META_FILE)
  let raw = {}
  try {
    if (existsSync(metaPath)) raw = JSON.parse(readFileSync(metaPath, 'utf-8'))
  } catch {
    raw = {}
  }
  const next = {
    ...raw,
    preferredExportTarget: normalizePreferredExportTarget(
      metaPatch.preferredExportTarget !== undefined
        ? metaPatch.preferredExportTarget
        : raw.preferredExportTarget,
    ),
    preferredLanguage: normalizePreferredLanguage(
      metaPatch.preferredLanguage !== undefined
        ? metaPatch.preferredLanguage
        : raw.preferredLanguage,
    ),
    isPrivate: false,
  }
  writeFileSync(metaPath, JSON.stringify(next, null, 2))
  return {
    preferredExportTarget: next.preferredExportTarget,
    preferredLanguage: next.preferredLanguage,
    isPrivate: false,
  }
}

export function getWorkspacePreferredLanguage(workspace) {
  if (!workspace) return DEFAULT_PREFERRED_LANGUAGE
  return readSessionMeta(workspace).preferredLanguage
}

function isSessionWorkspaceEntry(name) {
  const entry = String(name || '')
  if (!entry || entry.startsWith('.') || entry.startsWith('_') || !_sessionsDir) return false

  try {
    return statSync(join(_sessionsDir, entry)).isDirectory()
  } catch {
    return false
  }
}

export function initSessionDir(dir) {
  _sessionsDir = dir
}

export function createSession(baseDir, prompt, userId, options = {}) {
  const id = randomBytes(6).toString('hex')
  const workspace = join(baseDir, id)
  if (!existsSync(workspace)) mkdirSync(workspace, { recursive: true })
  const sessionMeta = writeSessionMeta(workspace, {
    preferredExportTarget: options?.preferredExportTarget,
    preferredLanguage: options?.preferredLanguage,
  })

  // Persist userId to disk
  if (userId) {
    try {
      writeFileSync(join(workspace, 'user.txt'), userId)
    } catch {
      /* ignore */
    }
  } else {
    try {
      writeFileSync(join(workspace, ANON_OWNER_FILE), randomBytes(24).toString('base64url'), 'utf8')
    } catch {
      /* ignore */
    }
  }

  // Load alternativeDesign if it exists
  let alternativeDesign = null
  try {
    const designPath = join(workspace, '.design.json')
    if (existsSync(designPath)) {
      alternativeDesign = JSON.parse(readFileSync(designPath, 'utf-8'))
    }
  } catch {
    /* design file may not exist or be invalid */
  }

  const createdAt = Date.now()
  const baseSession = {
    id,
    workspace,
    prompt,
    userId: userId ?? null,
    createdAt,
    tasks: [],
    homepageReady: false,
    siteSpecReady: false,
    elapsed: null,
    cost: null,
    alternativeDesign,
    preferredExportTarget: sessionMeta.preferredExportTarget,
    preferredLanguage: sessionMeta.preferredLanguage,
    isPrivate: sessionMeta.isPrivate,
    themeOverride: readSessionThemeOverride(workspace),
    lastStatus: null,
    wsClients: new Set(),
  }
  const session = normalizeSession(baseSession, { now: createdAt })
  if (!validateSession(session).valid) {
    throw new Error('Invalid session payload while creating session.')
  }

  // Persist createdAt to disk for recovery after restarts
  try {
    writeFileSync(join(workspace, 'createdAt.txt'), String(createdAt))
  } catch {
    /* ignore */
  }

  sessions.set(id, session)
  return session
}

function syncSessionFlagsFromDisk(session) {
  if (!session?.workspace) return
  session.homepageReady = existsSync(join(session.workspace, 'index.html'))
  session.siteSpecReady = existsSync(join(session.workspace, 'site-spec.json'))
  session.isPrivate = readSessionMeta(session.workspace).isPrivate
}

export function getSession(id) {
  if (sessions.has(id)) {
    const cached = sessions.get(id)
    syncSessionFlagsFromDisk(cached)
    return cached
  }

  // Try to load from disk
  if (!_sessionsDir) return null
  const workspace = join(_sessionsDir, id)
  if (!existsSync(workspace)) return null
  try {
    if (!statSync(workspace).isDirectory()) return null
  } catch {
    return null
  }

  // Load alternativeDesign from file
  let alternativeDesign = null
  try {
    const designPath = join(workspace, '.design.json')
    if (existsSync(designPath)) {
      alternativeDesign = JSON.parse(readFileSync(designPath, 'utf-8'))
    }
  } catch {
    /* design file may not exist or be invalid */
  }

  // Load userId from disk
  let userId = null
  try {
    const userPath = join(workspace, 'user.txt')
    if (existsSync(userPath)) userId = readFileSync(userPath, 'utf-8').trim() || null
  } catch {
    /* user file may not exist */
  }

  // Load prompt from disk
  let prompt = ''
  try {
    const promptPath = join(workspace, 'prompt.txt')
    if (existsSync(promptPath)) prompt = readFileSync(promptPath, 'utf-8').trim()
  } catch {
    /* prompt file may not exist */
  }

  // Auto-delete session if prompt is empty
  if (!prompt) {
    try {
      rmSync(workspace, { recursive: true, force: true })
      sessions.delete(id)
    } catch (err) {
      console.error(`Failed to delete empty session ${id}:`, err?.message)
    }
    return null
  }

  // Load tasks from disk
  let tasks = []
  try {
    const tasksPath = join(workspace, 'tasks.json')
    if (existsSync(tasksPath)) {
      const data = JSON.parse(readFileSync(tasksPath, 'utf-8'))
      tasks = data.tasks ?? []
    }
  } catch {
    /* tasks file may not exist */
  }

  // Check if homepage exists
  const homepageReady = existsSync(join(workspace, 'index.html'))
  const siteSpecReady = existsSync(join(workspace, 'site-spec.json'))

  // Load elapsed time from disk
  let elapsed = null
  try {
    const elapsedPath = join(workspace, 'elapsed.txt')
    if (existsSync(elapsedPath)) elapsed = parseFloat(readFileSync(elapsedPath, 'utf-8').trim())
  } catch {
    /* elapsed file may not exist */
  }

  // Load cost from disk
  let cost = null
  try {
    const costPath = join(workspace, 'cost.txt')
    if (existsSync(costPath)) cost = parseFloat(readFileSync(costPath, 'utf-8').trim())
  } catch {
    /* cost file may not exist */
  }

  // Load createdAt from disk (fall back to prompt.txt mtime, then now)
  let createdAt = Date.now()
  try {
    const createdAtPath = join(workspace, 'createdAt.txt')
    if (existsSync(createdAtPath)) {
      createdAt = parseInt(readFileSync(createdAtPath, 'utf-8').trim(), 10)
    } else {
      // Fall back to prompt.txt mtime for old sessions without createdAt
      const promptStat = statSync(join(workspace, 'prompt.txt'))
      createdAt = promptStat.mtimeMs
    }
  } catch {
    /* ignore */
  }

  const sessionMeta = readSessionMeta(workspace)

  // Reconstruct session from disk
  const baseSession = {
    id,
    workspace,
    prompt,
    userId,
    createdAt,
    tasks,
    homepageReady,
    siteSpecReady,
    elapsed,
    cost,
    alternativeDesign,
    preferredExportTarget: sessionMeta.preferredExportTarget,
    preferredLanguage: sessionMeta.preferredLanguage,
    isPrivate: sessionMeta.isPrivate,
    themeOverride: readSessionThemeOverride(workspace),
    deployment: null,
    lastStatus: null,
    wsClients: new Set(),
  }

  const session = normalizeSession(baseSession, { now: Date.now() })
  const normalized = validateSession(session)
  if (!normalized.valid) {
    return null
  }

  try {
    const deploymentPath = join(workspace, 'deploy.json')
    if (existsSync(deploymentPath)) {
      const deployData = JSON.parse(readFileSync(deploymentPath, 'utf-8'))
      const deployedAt = Number(deployData?.deployedAt)
      if (deployData?.slug && deployData?.url && Number.isFinite(deployedAt)) {
        session.deployment = {
          slug: String(deployData.slug),
          url: String(deployData.url),
          deployedAt,
        }
      }
    }
  } catch {
    void 0
  }
  if (!session.deployment) {
    const mappedDeployment = getDeploymentBySessionId(id)
    if (mappedDeployment) {
      session.deployment = {
        slug: mappedDeployment.slug,
        url: `https://${mappedDeployment.slug}.${BASE_DOMAIN}`,
        deployedAt: mappedDeployment.deployedAt,
      }
    }
  }

  sessions.set(id, session)
  return session
}

export function getAllSessions(userId) {
  // Load any disk sessions not yet in memory
  if (_sessionsDir && existsSync(_sessionsDir)) {
    try {
      for (const name of readdirSync(_sessionsDir)) {
        if (isSessionWorkspaceEntry(name) && !sessions.has(name)) getSession(name)
      }
    } catch {
      /* ignore */
    }
  }

  const validSessions = []
  for (const s of sessions.values()) {
    syncSessionFlagsFromDisk(s)
    if (!s.prompt || s.prompt.trim() === '') {
      // Delete empty session
      try {
        rmSync(s.workspace, { recursive: true, force: true })
        sessions.delete(s.id)
      } catch (err) {
        console.error(`Failed to delete empty session ${s.id}:`, err?.message)
      }
    } else {
      // Lazy-load elapsed from disk if not in memory
      if (s.elapsed == null) {
        try {
          const elapsedPath = join(s.workspace, 'elapsed.txt')
          if (existsSync(elapsedPath))
            s.elapsed = parseFloat(readFileSync(elapsedPath, 'utf-8').trim())
        } catch {
          /* ignore */
        }
      }
      // Lazy-load cost from disk if not in memory
      if (s.cost == null) {
        try {
          const costPath = join(s.workspace, 'cost.txt')
          if (existsSync(costPath)) s.cost = parseFloat(readFileSync(costPath, 'utf-8').trim())
        } catch {
          /* ignore */
        }
      }
      // Filter by userId if provided
      if (userId && s.userId !== userId) continue
      validSessions.push({
        id: s.id,
        prompt: s.prompt,
        createdAt: s.createdAt,
        deployment: s.deployment || null,
        taskCount: s.tasks.length,
        done: s.tasks.filter((t) => t.status === 'DONE').length,
        homepageReady: s.homepageReady ?? false,
        siteSpecReady: s.siteSpecReady ?? false,
        elapsed: s.elapsed ?? null,
        cost: s.cost ?? null,
        preferredExportTarget: s.preferredExportTarget ?? DEFAULT_PREFERRED_EXPORT_TARGET,
        preferredLanguage: s.preferredLanguage ?? DEFAULT_PREFERRED_LANGUAGE,
        isPrivate: s.isPrivate ?? false,
      })
    }
  }
  // Sort newest first
  validSessions.sort((a, b) => b.createdAt - a.createdAt)
  return validSessions
}

export function findSessionByPrompt(
  userId,
  promptText,
  preferredLanguage = DEFAULT_PREFERRED_LANGUAGE,
  incomingDesignRefFingerprint = '{"u":[],"n":""}',
) {
  const needle = promptText.trim()
  const normalizedPreferredLanguage = normalizePreferredLanguage(preferredLanguage)

  const matchesRefs = (workspace) =>
    readDesignReferenceFingerprintFromWorkspace(workspace) === incomingDesignRefFingerprint

  // Check in-memory sessions first
  for (const s of sessions.values()) {
    if (
      s.userId === userId &&
      s.prompt?.trim() === needle &&
      normalizePreferredLanguage(s.preferredLanguage) === normalizedPreferredLanguage &&
      matchesRefs(s.workspace)
    ) {
      return s
    }
  }

  // Check disk sessions not yet loaded
  if (_sessionsDir && existsSync(_sessionsDir)) {
    try {
      for (const name of readdirSync(_sessionsDir)) {
        if (isSessionWorkspaceEntry(name) && !sessions.has(name)) {
          const s = getSession(name)
          if (
            s &&
            s.userId === userId &&
            s.prompt?.trim() === needle &&
            normalizePreferredLanguage(s.preferredLanguage) === normalizedPreferredLanguage &&
            matchesRefs(s.workspace)
          ) {
            return s
          }
        }
      }
    } catch {
      /* ignore */
    }
  }

  return null
}

export function deleteSession(id) {
  const session = sessions.get(id)
  if (session?.workspace) {
    try {
      rmSync(session.workspace, { recursive: true, force: true })
    } catch {
      /* ignore */
    }
  }
  removeDeploymentBySessionId(id)
  sessions.delete(id)
  invalidatePublicGallery()
}

export function setSessionPreferredExportTarget(session, preferredExportTarget) {
  if (!session?.workspace) return DEFAULT_PREFERRED_EXPORT_TARGET
  const nextMeta = writeSessionMeta(session.workspace, { preferredExportTarget })
  session.preferredExportTarget = nextMeta.preferredExportTarget
  return session.preferredExportTarget
}

export function setSessionPreferredLanguage(session, preferredLanguage) {
  if (!session?.workspace) return DEFAULT_PREFERRED_LANGUAGE
  const nextMeta = writeSessionMeta(session.workspace, { preferredLanguage })
  session.preferredLanguage = nextMeta.preferredLanguage
  return session.preferredLanguage
}

export function claimSession(sessionId, newUserId) {
  const session = getSession(sessionId)
  if (!session) throw new Error('Session not found')
  if (session.userId !== null && session.userId !== undefined) {
    throw new Error('Session already has an owner')
  }
  // Write the new owner to user.txt
  writeFileSync(join(session.workspace, 'user.txt'), newUserId)
  session.userId = newUserId
  try {
    const p = join(session.workspace, ANON_OWNER_FILE)
    if (existsSync(p)) unlinkSync(p)
  } catch {
    /* ignore */
  }
  return session
}

export function claimSessionsByIds(sessionIds, newUserId) {
  const claimed = []
  const failed = []
  for (const id of sessionIds) {
    try {
      claimSession(id, newUserId)
      claimed.push(id)
    } catch {
      failed.push(id)
    }
  }
  return { claimed, failed }
}

export function setSessionStatus(sessionId, status) {
  const session = getSession(sessionId)
  if (!session) return
  const metaFile = join(session.workspace, SESSION_META_FILE)
  let meta = {}
  try {
    if (existsSync(metaFile)) meta = JSON.parse(readFileSync(metaFile, 'utf-8'))
  } catch {
    /* */
  }
  meta.generationStatus = status
  writeFileSync(metaFile, JSON.stringify(meta, null, 2))
}

export function getInterruptedSessions() {
  const interrupted = []
  if (!_sessionsDir || !existsSync(_sessionsDir)) return interrupted
  try {
    for (const name of readdirSync(_sessionsDir)) {
      if (!isSessionWorkspaceEntry(name)) continue
      const workspace = join(_sessionsDir, name)
      const metaFile = join(workspace, SESSION_META_FILE)
      try {
        if (existsSync(metaFile)) {
          const meta = JSON.parse(readFileSync(metaFile, 'utf-8'))
          if (meta.generationStatus === 'generating') {
            const session = getSession(name)
            if (session) interrupted.push(session)
          }
        }
      } catch {
        /* skip invalid */
      }
    }
  } catch {
    /* ignore */
  }
  return interrupted
}

/** Broadcast a message to all WS clients in a session */
export function sessionBroadcast(session, msg) {
  if (msg.type === 'status') session.lastStatus = msg
  const data = JSON.stringify(msg)
  for (const ws of session.wsClients) {
    if (ws.readyState === 1) ws.send(data)
  }
}

export function broadcastToAllSessions(msg) {
  for (const session of sessions.values()) {
    sessionBroadcast(session, msg)
  }
}

/** Build session-scoped state helpers for the pipeline */
export function makeSessionState(session) {
  const broadcast = (msg) => sessionBroadcast(session, msg)

  const setPrompt = (prompt) => {
    session.prompt = prompt
  }

  const setTasks = (tasks) => {
    session.tasks = tasks
    broadcast({ type: 'tasks_loaded', tasks })
  }

  const setSiteSpec = (siteSpec) => {
    session.siteSpecReady = Boolean(siteSpec)
    broadcast({ type: 'site_spec_ready', ready: session.siteSpecReady })
  }

  const updateTask = (task) => {
    const idx = session.tasks.findIndex((t) => t.id === task.id)
    if (idx >= 0) session.tasks[idx] = { ...session.tasks[idx], ...task }
    else session.tasks.push(task)
    const updated = session.tasks[idx >= 0 ? idx : session.tasks.length - 1]
    broadcast({
      type: 'task_updated',
      task: updated,
    })
  }

  const signalHomepageReady = () => {
    session.homepageReady = true
    invalidatePublicGallery()
    broadcast({ type: 'homepage_ready' })
  }

  const setElapsed = (seconds) => {
    session.elapsed = seconds
    try {
      writeFileSync(join(session.workspace, 'elapsed.txt'), String(seconds))
    } catch {
      /* ignore */
    }
  }

  const setCost = (dollars) => {
    session.cost = dollars
    try {
      writeFileSync(join(session.workspace, 'cost.txt'), String(dollars))
    } catch {
      /* ignore */
    }
  }

  const setAlternativeDesign = (design) => {
    session.alternativeDesign = design
    // Persist design to file
    try {
      const designPath = join(session.workspace, '.design.json')
      writeFileSync(designPath, JSON.stringify(design, null, 2))
    } catch (err) {
      console.error('Failed to save alternative design to file:', err?.message)
    }

    broadcast({ type: 'alternative_design_ready', design })
  }

  const setThemeOverride = (theme) => {
    const normalizedTheme = persistSessionThemeOverride(session, theme)
    session.themeOverride = normalizedTheme
    broadcast({ type: 'theme_override_updated', theme: normalizedTheme })
  }

  const getState = () => ({
    tasks: session.tasks,
    homepageReady: session.homepageReady,
    siteSpecReady: session.siteSpecReady,
    alternativeDesign: session.alternativeDesign,
    themeOverride: session.themeOverride,
    prompt: session.prompt,
    lastStatus: session.lastStatus,
  })

  return {
    broadcast,
    setPrompt,
    setTasks,
    setSiteSpec,
    updateTask,
    signalHomepageReady,
    setElapsed,
    setCost,
    setAlternativeDesign,
    setThemeOverride,
    getState,
  }
}
