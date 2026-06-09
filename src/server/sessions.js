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
import { readDesignReferenceFingerprintFromWorkspace } from '@ship-fast/engine/pipeline/ecommerce-design-references.js'
import { invalidatePublicGallery } from './public-gallery-cache.js'
import { queueGalleryThumbCapture } from './session-gallery-thumbnail.js'
import { readOpenUIFileForRoute } from '../pipeline/openui-artifacts.js'

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
  if (/^[a-z]{2,8}-latn$/.test(requested)) return requested
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
      isPrivate: data?.isPrivate === true,
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
    isPrivate:
      metaPatch.isPrivate !== undefined ? metaPatch.isPrivate === true : raw.isPrivate === true,
  }
  writeFileSync(metaPath, JSON.stringify(next, null, 2))
  return {
    preferredExportTarget: next.preferredExportTarget,
    preferredLanguage: next.preferredLanguage,
    isPrivate: next.isPrivate,
  }
}

function readJsonFileIfPresent(filePath) {
  try {
    if (!existsSync(filePath)) return null
    return JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch {
    return null
  }
}

function recoverSessionPromptFromDisk(workspace) {
  try {
    const promptPath = join(workspace, 'prompt.txt')
    if (existsSync(promptPath)) return readFileSync(promptPath, 'utf-8').trim()
  } catch {
    /* prompt file may not exist */
  }

  const meta = readJsonFileIfPresent(join(workspace, SESSION_META_FILE))
  const metaPrompt = String(meta?.prompt || meta?.userPrompt || meta?.brief || '').trim()
  if (metaPrompt) return metaPrompt

  const spec = readJsonFileIfPresent(join(workspace, 'site-spec.json'))
  const specPrompt = String(spec?.prompt || spec?.userPrompt || spec?.brief || '').trim()
  if (specPrompt) return specPrompt

  const brand = String(spec?.brand || spec?.projectName || spec?.title || '').trim()
  const tagline = String(spec?.tagline || spec?.description || '').trim()
  if (brand && tagline) return `${brand} - ${tagline}`
  if (brand) return brand

  return ''
}

function sessionWorkspaceHasRecoverableArtifact(workspace) {
  return ['site-spec.json', 'index.html', 'home.openui', 'tasks.json'].some((name) =>
    existsSync(join(workspace, name)),
  )
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
    isPrivate: options?.isPrivate,
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
    openuiStreams: {},
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

  const prompt = recoverSessionPromptFromDisk(workspace)

  // Auto-delete only truly empty workspaces. Older valid sessions may miss prompt.txt.
  if (!prompt && !sessionWorkspaceHasRecoverableArtifact(workspace)) {
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
  const openuiReady = existsSync(join(workspace, 'home.openui'))
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

  let sessionConfig = {}
  try {
    const metaPath = join(workspace, SESSION_META_FILE)
    if (existsSync(metaPath)) {
      sessionConfig = JSON.parse(readFileSync(metaPath, 'utf-8'))
    }
  } catch {
    sessionConfig = {}
  }

  // Reconstruct session from disk
  const baseSession = {
    id,
    workspace,
    prompt,
    userId,
    createdAt,
    tasks,
    homepageReady,
    openuiReady,
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
    openuiStreams: {},
    wsClients: new Set(),
    sanityConfig: sessionConfig.sanityConfig || null,
    medusaConfig: sessionConfig.medusaConfig || null,
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
      const recoveredPrompt = recoverSessionPromptFromDisk(s.workspace)
      if (recoveredPrompt || sessionWorkspaceHasRecoverableArtifact(s.workspace)) {
        s.prompt = recoveredPrompt || s.id
      } else {
        // Delete empty session
        try {
          rmSync(s.workspace, { recursive: true, force: true })
          sessions.delete(s.id)
        } catch (err) {
          console.error(`Failed to delete empty session ${s.id}:`, err?.message)
        }
        continue
      }
    }
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

export async function deleteSession(id) {
  const session = sessions.get(id) || (await getSession(id))
  if (session?.medusaConfig?.containerId) {
    try {
      const { deprovisionMedusaForSession } = await import('./medusa-provision.js')
      await deprovisionMedusaForSession(id, session.medusaConfig)
    } catch (e) {
      console.warn(`[sessions] Failed to deprovision Medusa for ${id}:`, e.message)
    }
  }
  if (session?.sanityConfig?.projectId) {
    try {
      const { deprovisionSanityForSession } = await import('./sanity-provision.js')
      await deprovisionSanityForSession(id, session.sanityConfig)
    } catch (e) {
      console.warn(`[sessions] Failed to deprovision Sanity for ${id}:`, e.message)
    }
  }
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

export async function setSanityConfig(sessionId, config) {
  const session = getSession(sessionId)
  if (!session?.workspace) return null
  session.sanityConfig = config || null

  const metaFile = join(session.workspace, SESSION_META_FILE)
  let meta = {}
  try {
    if (existsSync(metaFile)) meta = JSON.parse(readFileSync(metaFile, 'utf-8'))
  } catch {
    /* */
  }
  meta.sanityConfig = session.sanityConfig
  writeFileSync(metaFile, JSON.stringify(meta, null, 2))
  return session
}

export async function setMedusaConfig(sessionId, config) {
  const session = getSession(sessionId)
  if (!session?.workspace) return null
  session.medusaConfig = config || null

  const metaFile = join(session.workspace, SESSION_META_FILE)
  let meta = {}
  try {
    if (existsSync(metaFile)) meta = JSON.parse(readFileSync(metaFile, 'utf-8'))
  } catch {
    /* */
  }
  meta.medusaConfig = session.medusaConfig
  writeFileSync(metaFile, JSON.stringify(meta, null, 2))
  return session
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

function normalizeSessionClaim(entry) {
  if (typeof entry === 'string') return { id: entry, secret: '' }
  if (!entry || typeof entry !== 'object') return { id: '', secret: '' }
  return {
    id: String(entry.id || entry.sessionId || ''),
    secret: String(entry.secret || entry.ownerSecret || ''),
  }
}

export function claimSessionsByIds(sessionIds, newUserId) {
  const claimed = []
  const failed = []
  for (const entry of sessionIds) {
    const { id, secret } = normalizeSessionClaim(entry)
    try {
      const session = getSession(id)
      if (!session) throw new Error('Session not found')
      const expectedSecret = readAnonOwnerSecret(session.workspace)
      if (expectedSecret && secret !== expectedSecret) {
        throw new Error('Anonymous owner secret is required')
      }
      claimSession(id, newUserId)
      claimed.push(id)
    } catch {
      if (id) failed.push(id)
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
  rememberOpenUIStreamMessage(session, msg)
  const data = JSON.stringify(msg)
  if (String(msg.type || '').startsWith('openui_') || msg.type === 'openui-error') {
    const route = typeof msg.route === 'string' ? msg.route : '/'
    const sourcePreview = typeof msg.source === 'string' ? msg.source.length : null
    const tokenPreview = typeof msg.token === 'string' ? msg.token.length : null
    console.log('[SessionBroadcast] openui', {
      sessionId: session.id,
      type: msg.type,
      route,
      sourceLen: sourcePreview,
      tokenLen: tokenPreview,
      recipients: session.wsClients?.size || 0,
    })
  }
  for (const ws of session.wsClients) {
    if (ws.readyState !== 1) {
      session.wsClients.delete(ws)
      continue
    }
    try {
      ws.send(data)
    } catch (error) {
      console.warn('[SessionBroadcast] failed to send websocket message', {
        sessionId: session.id,
        type: msg.type,
        message: error?.message || String(error),
      })
      session.wsClients.delete(ws)
      try {
        ws.terminate?.()
      } catch {}
    }
  }
}

/** Broadcast a message to all SSE clients in a session */
export async function sessionBroadcastSSE(session, msg) {
  if (msg.type === 'status') session.lastStatus = msg
  rememberOpenUIStreamMessage(session, msg)
  if (String(msg.type || '').startsWith('openui_') || msg.type === 'openui-error') {
    const route = typeof msg.route === 'string' ? msg.route : '/'
    const sourcePreview = typeof msg.source === 'string' ? msg.source.length : null
    const tokenPreview = typeof msg.token === 'string' ? msg.token.length : null
    console.log('[SessionBroadcastSSE] openui', {
      sessionId: session.id,
      type: msg.type,
      route,
      sourceLen: sourcePreview,
      tokenLen: tokenPreview,
    })
  }
  // Import SSE utilities dynamically to avoid circular dependency
  const { sseClients } = await import('./sse.js')
  sseClients.broadcast(session.id, msg.type, msg)
}

function normalizeOpenUIStreamRoute(route) {
  const value = typeof route === 'string' && route.trim() ? route.trim() : '/'
  return value.startsWith('/') ? value : `/${value}`
}

function getOrCreateOpenUIStream(session, route) {
  if (!session.openuiStreams || typeof session.openuiStreams !== 'object') {
    session.openuiStreams = {}
  }
  const key = normalizeOpenUIStreamRoute(route)
  if (!session.openuiStreams[key]) {
    session.openuiStreams[key] = {
      route: key,
      source: '',
      active: false,
      done: false,
      error: null,
    }
  }
  return session.openuiStreams[key]
}

function rememberOpenUIStreamMessage(session, msg) {
  if (!session || !msg || typeof msg !== 'object') return
  const type = String(msg.type || '')
  if (!type.startsWith('openui_') && type !== 'openui-error') return
  const stream = getOrCreateOpenUIStream(session, msg.route)
  if (msg.type === 'openui_stream_start') {
    stream.source = ''
    stream.active = true
    stream.done = false
    stream.error = null
    return
  }
  if (msg.type === 'openui_stream_chunk') {
    const source = typeof msg.source === 'string' ? msg.source : ''
    const token = typeof msg.token === 'string' ? msg.token : ''
    if (source) stream.source = source
    else if (token) stream.source += token
    stream.active = true
    stream.done = false
    stream.error = null
    return
  }
  if (msg.type === 'openui_stream_done') {
    const source = typeof msg.source === 'string' ? msg.source : ''
    if (source) stream.source = source
    stream.active = false
    stream.done = true
    stream.error = null
    return
  }
  if (msg.type === 'openui-error') {
    stream.active = false
    stream.done = false
    stream.error = typeof msg.error === 'string' ? msg.error : 'OpenUI generation failed'
  }
}

export function getOpenUIStreamReplayMessages(session, route = '/') {
  const key = normalizeOpenUIStreamRoute(route)
  const stream = session?.openuiStreams?.[key]

  // Read fresh OpenUI from disk instead of using cached stream.source
  // Fall back to cached if workspace is not available or file doesn't exist
  let freshSource = null
  if (session?.workspace) {
    freshSource = readOpenUIFileForRoute(session.workspace, route)
  }

  if (freshSource) {
    console.log('[SessionBroadcast] replay_openui (fresh from disk)', {
      sessionId: session.id,
      route: key,
      sourceLen: freshSource.length,
    })
  }

  if (!stream || (!stream.active && !stream.done && !stream.error)) {
    // If stream doesn't exist but we have fresh source, still send it
    if (freshSource) {
      return [
        { type: 'openui_stream_start', route: key },
        { type: 'openui_stream_chunk', route: key, source: freshSource },
        { type: 'openui_stream_done', route: key, source: freshSource },
      ]
    }
    return []
  }

  if (stream.error) {
    return [{ type: 'openui-error', route: key, error: stream.error }]
  }

  const messages = [{ type: 'openui_stream_start', route: key }]
  // Use fresh source from disk if available, otherwise fall back to cached
  const sourceToUse = freshSource || stream.source
  if (sourceToUse) messages.push({ type: 'openui_stream_chunk', route: key, source: sourceToUse })
  if (stream.done)
    messages.push({ type: 'openui_stream_done', route: key, source: sourceToUse || '' })
  return messages
}

export function broadcastToAllSessions(msg) {
  for (const session of sessions.values()) {
    sessionBroadcast(session, msg)
  }
}

/** Build session-scoped state helpers for the pipeline */
export function makeSessionState(session) {
  const broadcast = (msg) => {
    sessionBroadcast(session, msg)
    // Also broadcast to SSE clients (fire and forget)
    sessionBroadcastSSE(session, msg).catch(() => {})
  }

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
    if (session.homepageReady) return
    session.homepageReady = true
    invalidatePublicGallery()
    broadcast({ type: 'homepage_ready' })
    queueGalleryThumbCapture(session.id, session.workspace)
  }

  const signalOpenuiReady = () => {
    session.openuiReady = true
    invalidatePublicGallery()
    broadcast({ type: 'openui_ready' })
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
    openuiReady: session.openuiReady,
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
    signalOpenuiReady,
    setElapsed,
    setCost,
    setAlternativeDesign,
    setThemeOverride,
    getState,
  }
}
