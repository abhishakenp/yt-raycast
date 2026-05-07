import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { isSanityChatWriteConfigured } from '../config.js'
import { deleteChatFromSanity, loadChatFromSanity, persistChatToSanity } from '../sanity/chat-sync.js'
import { loadSiteSpec } from '@ship-fast/engine/spec/index.js'

const CHAT_FILE = 'messages.json'
const STORE_VERSION = 1
const MAX_MESSAGE_CHARS = 8000
const MAX_SUMMARY_CHARS = 1500
const MAX_CHAT_CONTEXT_CHARS = 8000
const MAX_STORED_MESSAGES = 48
const MAX_PRIOR_LINES = 12

const defaultStore = () => ({
  version: STORE_VERSION,
  updatedAt: null,
  summary: '',
  messages: [],
})

const sliceStr = (s, max) => {
  const t = typeof s === 'string' ? s : ''
  return t.length <= max ? t : t.slice(0, max)
}

const normalizeStore = (raw) => {
  const base = defaultStore()
  if (!raw || typeof raw !== 'object') return base
  const messages = Array.isArray(raw.messages) ? raw.messages : []
  const cleaned = messages
    .filter((m) => m && typeof m === 'object' && (m.role === 'user' || m.role === 'assistant'))
    .map((m) => ({
      id: typeof m.id === 'string' ? m.id : randomUUID(),
      role: m.role,
      content: sliceStr(String(m.content ?? ''), MAX_MESSAGE_CHARS),
      createdAt: typeof m.createdAt === 'string' ? m.createdAt : new Date().toISOString(),
    }))
  return {
    version: STORE_VERSION,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : base.updatedAt,
    summary: sliceStr(String(raw.summary ?? ''), MAX_SUMMARY_CHARS),
    messages: cleaned.slice(-MAX_STORED_MESSAGES),
  }
}

export const readChatStore = (workspace) => {
  const filePath = join(workspace, CHAT_FILE)
  if (!existsSync(filePath)) return defaultStore()
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'))
    return normalizeStore(data)
  } catch {
    return defaultStore()
  }
}

export const readChatStoreAsync = async (workspace, sessionId) => {
  const local = readChatStore(workspace)
  if (!sessionId) return local
  const remote = await loadChatFromSanity(sessionId)
  if (!remote?.messages?.length) return local
  const normalizedRemote = normalizeStore(remote)
  if (!local.messages?.length) return normalizedRemote
  const tLocal = local.updatedAt ? new Date(local.updatedAt).getTime() : 0
  const tRemote = normalizedRemote.updatedAt
    ? new Date(normalizedRemote.updatedAt).getTime()
    : 0
  return tRemote >= tLocal ? normalizedRemote : local
}

export const writeChatStore = (workspace, store, sessionId = null) => {
  const normalized = normalizeStore(store)
  normalized.updatedAt = new Date().toISOString()
  writeFileSync(join(workspace, CHAT_FILE), JSON.stringify(normalized, null, 2), 'utf-8')
  if (sessionId && isSanityChatWriteConfigured()) {
    void persistChatToSanity(sessionId, normalized)
  }
  return normalized
}

export const canSessionRunEdit = (workspace) => {
  if (loadSiteSpec(workspace)) return true
  try {
    const tasksFile = join(workspace, 'tasks.json')
    const hasIndex = existsSync(join(workspace, 'index.html'))
    if (!hasIndex || !existsSync(tasksFile)) return false
    const data = JSON.parse(readFileSync(tasksFile, 'utf-8'))
    const tasks = data.tasks ?? []
    return tasks.length > 0 && tasks.every((t) => ['DONE', 'FAILED'].includes(t.status))
  } catch {
    return false
  }
}

export const buildComposedEditPrompt = (summary, priorMessages, newUserText, options = {}) => {
  const current = sliceStr(newUserText, MAX_MESSAGE_CHARS)
  let extra = ''
  const paths = Array.isArray(options.attachments)
    ? options.attachments.filter((p) => typeof p === 'string' && p.trim())
    : []
  if (paths.length) {
    const lines = paths.map((p) => `- ./${String(p).replace(/^\.\//, '')}`).join('\n')
    extra = `\n\nUser-provided images (already saved in the workspace; use these EXACT relative URLs in img src, CSS background-image url(), heroImage, imageUrl on section items, or seo.ogImage):\n${lines}\n\nReplace stock photos, hero images, gallery images, logos, and avatars as the user describes. Use descriptive alt text on every img.\n`
  }
  const tail = `Current request (apply this edit; the live site spec and files on disk are the source of truth):\n${current}${extra}`
  let head = ''
  const sum = sliceStr(summary || '', MAX_SUMMARY_CHARS)
  if (sum) head += `Earlier context (summary):\n${sum}\n\n`
  const recent = (priorMessages || []).slice(-MAX_PRIOR_LINES)
  if (recent.length) {
    head += 'Recent conversation:\n'
    for (const m of recent) {
      const label = m.role === 'user' ? 'User' : 'Assistant'
      head += `${label}: ${sliceStr(m.content, 2000)}\n`
    }
    head += '\n'
  }
  const budget = Math.max(0, MAX_CHAT_CONTEXT_CHARS - tail.length)
  head = sliceStr(head, budget)
  return head + tail
}

export const appendUserMessage = (workspace, store, text, sessionId = null) => {
  const content = sliceStr(text, MAX_MESSAGE_CHARS)
  const entry = {
    id: randomUUID(),
    role: 'user',
    content,
    createdAt: new Date().toISOString(),
  }
  const messages = [...store.messages, entry].slice(-MAX_STORED_MESSAGES)
  return writeChatStore(workspace, { ...store, messages }, sessionId)
}

export const appendAssistantMessage = (workspace, store, text, sessionId = null) => {
  const content = sliceStr(text, MAX_MESSAGE_CHARS)
  const entry = {
    id: randomUUID(),
    role: 'assistant',
    content,
    createdAt: new Date().toISOString(),
  }
  const messages = [...store.messages, entry].slice(-MAX_STORED_MESSAGES)
  return writeChatStore(workspace, { ...store, messages }, sessionId)
}

export const clearChatStore = (workspace, sessionId = null) => {
  writeChatStore(workspace, defaultStore(), null)
  if (sessionId && isSanityChatWriteConfigured()) {
    void deleteChatFromSanity(sessionId)
  }
}
