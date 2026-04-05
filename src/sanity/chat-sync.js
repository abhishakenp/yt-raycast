import { createClient } from '@sanity/client'
import {
  isSanityConfigured,
  SANITY_API_VERSION,
  SANITY_DATASET,
  SANITY_PROJECT_ID,
  SANITY_READ_TOKEN,
  SANITY_WRITE_TOKEN,
} from '../config.js'

let _readishClient = null
let _writeClient = null

const chatDocId = (sessionId) => `shipFastChat.${String(sessionId || '').replace(/[^a-zA-Z0-9._-]/g, '')}`

const getSanityFetchClient = () => {
  if (!isSanityConfigured()) return null
  const token = SANITY_READ_TOKEN || SANITY_WRITE_TOKEN
  if (!token) return null
  if (!_readishClient) {
    _readishClient = createClient({
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      apiVersion: SANITY_API_VERSION,
      useCdn: false,
      token,
    })
  }
  return _readishClient
}

export const getSanityWriteClient = () => {
  if (!isSanityConfigured() || !SANITY_WRITE_TOKEN) return null
  if (!_writeClient) {
    _writeClient = createClient({
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      apiVersion: SANITY_API_VERSION,
      useCdn: false,
      token: SANITY_WRITE_TOKEN,
    })
  }
  return _writeClient
}

export async function loadChatFromSanity(sessionId) {
  const client = getSanityFetchClient()
  if (!client || !sessionId) return null
  const _id = chatDocId(sessionId)
  try {
    const doc = await client.getDocument(_id)
    if (!doc || doc._type !== 'sessionChat') return null
    return {
      version: typeof doc.version === 'number' ? doc.version : 1,
      updatedAt: doc.updatedAt || doc._updatedAt || null,
      summary: typeof doc.summary === 'string' ? doc.summary : '',
      messages: Array.isArray(doc.messages) ? doc.messages : [],
    }
  } catch {
    return null
  }
}

export async function persistChatToSanity(sessionId, store) {
  const client = getSanityWriteClient()
  if (!client || !sessionId || !store) return
  const _id = chatDocId(sessionId)
  const doc = {
    _id,
    _type: 'sessionChat',
    sessionId: String(sessionId),
    version: store.version ?? 1,
    summary: store.summary ?? '',
    messages: (store.messages || []).map((m, i) => ({
      _key: typeof m.id === 'string' && m.id ? m.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 32) || `m${i}` : `m${i}`,
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
    updatedAt: store.updatedAt || new Date().toISOString(),
  }
  try {
    await client.createOrReplace(doc)
  } catch {
    void 0
  }
}

export async function deleteChatFromSanity(sessionId) {
  const client = getSanityWriteClient()
  if (!client || !sessionId) return
  const _id = chatDocId(sessionId)
  try {
    await client.delete(_id)
  } catch {
    void 0
  }
}
