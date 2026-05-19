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

const chatDocId = (sessionId) =>
  `shipFastChat.${String(sessionId || '').replace(/[^a-zA-Z0-9._-]/g, '')}`

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

const resolveSanityClientConfig = (sanityConfig = {}, fallbackToken = '', preferKey = '') => {
  const projectId = String(sanityConfig.projectId ?? SANITY_PROJECT_ID ?? '').trim()
  const dataset = String(sanityConfig.dataset ?? SANITY_DATASET ?? '').trim()
  const apiVersion =
    String(sanityConfig.apiVersion ?? SANITY_API_VERSION ?? '').trim() || SANITY_API_VERSION
  const preferredTenantToken = preferKey ? sanityConfig[preferKey] : ''
  const token = String(preferredTenantToken ?? sanityConfig.token ?? fallbackToken ?? '').trim()
  if (!projectId || !dataset) return null
  return {
    projectId,
    dataset,
    apiVersion,
    ...(token ? { token } : {}),
  }
}

const hasTenantOverride = (config) =>
  Boolean(
    config &&
    (config.projectId ||
      config.dataset ||
      config.token ||
      config.readToken ||
      config.writeToken ||
      config.apiVersion),
  )

const createSanityFetchClient = (sanityConfig = {}) => {
  if (!hasTenantOverride(sanityConfig) && !isSanityConfigured()) return null
  const resolved = resolveSanityClientConfig(
    sanityConfig,
    SANITY_READ_TOKEN || SANITY_WRITE_TOKEN,
    'readToken',
  )
  if (!resolved) return null
  return createClient({
    ...resolved,
    useCdn: false,
  })
}

const createSanityWriteClientForConfig = (sanityConfig = {}) => {
  if (!hasTenantOverride(sanityConfig) && !isSanityConfigured()) return null
  const resolved = resolveSanityClientConfig(sanityConfig, SANITY_WRITE_TOKEN, 'writeToken')
  if (!resolved) return null
  return createClient({
    ...resolved,
    useCdn: false,
  })
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

export async function loadChatFromSanity(sessionId, sanityConfig) {
  const client = sanityConfig ? createSanityFetchClient(sanityConfig) : getSanityFetchClient()
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

export async function saveChatToSanity(sessionId, store, sanityConfig) {
  const client = sanityConfig
    ? createSanityWriteClientForConfig(sanityConfig)
    : getSanityWriteClient()
  if (!client || !sessionId || !store) return
  const _id = chatDocId(sessionId)
  const doc = {
    _id,
    _type: 'sessionChat',
    sessionId: String(sessionId),
    version: store.version ?? 1,
    summary: store.summary ?? '',
    messages: (store.messages || []).map((m, i) => ({
      _key:
        typeof m.id === 'string' && m.id
          ? m.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 32) || `m${i}`
          : `m${i}`,
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

export async function removeChatFromSanity(sessionId, sanityConfig) {
  const client = sanityConfig
    ? createSanityWriteClientForConfig(sanityConfig)
    : getSanityWriteClient()
  if (!client || !sessionId) return
  const _id = chatDocId(sessionId)
  try {
    await client.delete(_id)
  } catch {
    void 0
  }
}

export const persistChatToSanity = saveChatToSanity
export const deleteChatFromSanity = removeChatFromSanity
