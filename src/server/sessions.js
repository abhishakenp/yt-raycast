import { randomBytes } from 'node:crypto'
import { mkdirSync, existsSync, readFileSync, writeFileSync, rmSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const sessions = new Map()
let _sessionsDir = null

export function initSessionDir(dir) {
  _sessionsDir = dir
}

export function createSession(baseDir, prompt, userId) {
  const id = randomBytes(6).toString('hex')
  const workspace = join(baseDir, id)
  if (!existsSync(workspace)) mkdirSync(workspace, { recursive: true })

  // Persist userId to disk
  if (userId) {
    try {
      writeFileSync(join(workspace, 'user.txt'), userId)
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
  const session = {
    id,
    workspace,
    prompt,
    userId: userId ?? null,
    createdAt,
    tasks: [],
    homepageReady: false,
    elapsed: null,
    cost: null,
    alternativeDesign,
    lastStatus: null,
    wsClients: new Set(),
  }

  // Persist createdAt to disk for recovery after restarts
  try {
    writeFileSync(join(workspace, 'createdAt.txt'), String(createdAt))
  } catch { /* ignore */ }

  sessions.set(id, session)
  return session
}

export function getSession(id) {
  // Return from memory if exists
  if (sessions.has(id)) return sessions.get(id)

  // Try to load from disk
  if (!_sessionsDir) return null
  const workspace = join(_sessionsDir, id)
  if (!existsSync(workspace)) return null

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
  } catch { /* ignore */ }

  // Reconstruct session from disk
  const session = {
    id,
    workspace,
    prompt,
    userId,
    createdAt,
    tasks,
    homepageReady,
    elapsed,
    cost,
    alternativeDesign,
    lastStatus: null,
    wsClients: new Set(),
  }

  sessions.set(id, session)
  return session
}

export function getAllSessions(userId) {
  // Load any disk sessions not yet in memory
  if (_sessionsDir && existsSync(_sessionsDir)) {
    try {
      for (const name of readdirSync(_sessionsDir)) {
        if (!sessions.has(name)) getSession(name)
      }
    } catch {
      /* ignore */
    }
  }

  const validSessions = []
  for (const s of sessions.values()) {
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
        taskCount: s.tasks.length,
        done: s.tasks.filter((t) => t.status === 'DONE').length,
        homepageReady: s.homepageReady ?? false,
        elapsed: s.elapsed ?? null,
        cost: s.cost ?? null,
      })
    }
  }
  // Sort newest first
  validSessions.sort((a, b) => b.createdAt - a.createdAt)
  return validSessions
}

export function findSessionByPrompt(userId, promptText) {
  const needle = promptText.trim()

  // Check in-memory sessions first
  for (const s of sessions.values()) {
    if (s.userId === userId && s.prompt?.trim() === needle) return s
  }

  // Check disk sessions not yet loaded
  if (_sessionsDir && existsSync(_sessionsDir)) {
    try {
      for (const name of readdirSync(_sessionsDir)) {
        if (!sessions.has(name)) {
          const s = getSession(name)
          if (s && s.userId === userId && s.prompt?.trim() === needle) return s
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
    setElapsed,
    setCost,
    setAlternativeDesign,
    getState,
  }
}
