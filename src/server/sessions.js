import { randomBytes } from 'node:crypto'
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

let kv = null
const sessions = new Map()
let _sessionsDir = null

export async function initSessionDir(dir) {
  _sessionsDir = dir
  // Try to import Vercel KV if available
  try {
    const { kv: kvClient } = await import('@vercel/kv')
    kv = kvClient
  } catch {
    // KV not available, will use in-memory + filesystem
  }
}

export function createSession(baseDir, prompt) {
  const id = randomBytes(6).toString('hex')
  const workspace = join(baseDir, id)
  if (!existsSync(workspace)) mkdirSync(workspace, { recursive: true })

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

  const session = {
    id,
    workspace,
    prompt,
    createdAt: Date.now(),
    tasks: [],
    homepageReady: false,
    alternativeDesign,
    lastStatus: null,
    wsClients: new Set(),
  }

  sessions.set(id, session)
  return session
}

export async function getSession(id) {
  // Return from memory if exists
  if (sessions.has(id)) return sessions.get(id)

  // Try to load from disk
  if (!_sessionsDir) return null
  const workspace = join(_sessionsDir, id)
  if (!existsSync(workspace)) return null

  // Load alternativeDesign from file or KV
  let alternativeDesign = null
  try {
    const designPath = join(workspace, '.design.json')
    if (existsSync(designPath)) {
      alternativeDesign = JSON.parse(readFileSync(designPath, 'utf-8'))
    }
  } catch {
    /* design file may not exist or be invalid */
  }

  // Try to load from KV if not found in file
  if (!alternativeDesign && kv) {
    try {
      const designJson = await kv.get(`design:${id}`)
      if (designJson) {
        alternativeDesign = JSON.parse(designJson)
      }
    } catch {
      /* KV not available or design not found */
    }
  }

  // Reconstruct session from disk
  const session = {
    id,
    workspace,
    prompt: '',
    createdAt: Date.now(),
    tasks: [],
    homepageReady: false,
    alternativeDesign,
    lastStatus: null,
    wsClients: new Set(),
  }

  sessions.set(id, session)
  return session
}

export function getAllSessions() {
  return [...sessions.values()].map((s) => ({
    id: s.id,
    prompt: s.prompt,
    createdAt: s.createdAt,
    taskCount: s.tasks.length,
    done: s.tasks.filter((t) => t.status === 'DONE').length,
  }))
}

export function deleteSession(id) {
  sessions.delete(id)
}

/** Broadcast a message to all WS clients in a session */
export function sessionBroadcast(session, msg) {
  if (msg.type === 'status') session.lastStatus = msg
  const data = JSON.stringify(msg)
  for (const ws of session.wsClients) {
    if (ws.readyState === 1) ws.send(data)
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

  const updateTask = (task) => {
    const idx = session.tasks.findIndex((t) => t.id === task.id)
    if (idx >= 0) session.tasks[idx] = { ...session.tasks[idx], ...task }
    else session.tasks.push(task)
    broadcast({
      type: 'task_updated',
      task: session.tasks[idx >= 0 ? idx : session.tasks.length - 1],
    })
  }

  const signalHomepageReady = () => {
    session.homepageReady = true
    broadcast({ type: 'homepage_ready' })
  }

  const setAlternativeDesign = (design) => {
    session.alternativeDesign = design
    // Persist design to file (local) and KV (cloud)
    try {
      const designPath = join(session.workspace, '.design.json')
      writeFileSync(designPath, JSON.stringify(design, null, 2))
    } catch (err) {
      console.error('Failed to save alternative design to file:', err?.message)
    }

    // Save to Vercel KV if available
    if (kv) {
      kv.set(`design:${session.id}`, JSON.stringify(design)).catch((err) => {
        console.error('Failed to save design to KV:', err?.message)
      })
    }
    broadcast({ type: 'alternative_design_ready', design })
  }

  const getState = () => ({
    tasks: session.tasks,
    homepageReady: session.homepageReady,
    alternativeDesign: session.alternativeDesign,
    prompt: session.prompt,
    lastStatus: session.lastStatus,
  })

  return {
    broadcast,
    setPrompt,
    setTasks,
    updateTask,
    signalHomepageReady,
    setAlternativeDesign,
    getState,
  }
}
