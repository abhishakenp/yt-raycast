import { join } from 'node:path'
import {
  getSession,
  initSessionDir,
  setMedusaConfig,
  setSanityConfig,
} from '../server/sessions.js'
import {
  getInFlightSanityProvision,
  isSanityProvisionable,
  provisionSanityForSession,
} from '../server/sanity-provision.js'
import {
  isMedusaProvisionable,
  provisionMedusaForSession,
} from '../server/medusa-provision.js'
import { extractSessionProducts } from '../server/extract-session-products.js'
import { syncProductsToMedusa } from '../server/sync-medusa-catalog.js'
import { assertStartSessionAccess } from './start-auth.js'

const DEFAULT_SESSIONS_DIR = join(process.cwd(), 'sessions')

function createAccessError(message, statusCode, extras = {}) {
  const error = new Error(message)
  error.statusCode = statusCode
  Object.assign(error, extras)
  return error
}

function readSession(sessionId, { sessionsDir = DEFAULT_SESSIONS_DIR } = {}) {
  initSessionDir(sessionsDir)
  const session = getSession(String(sessionId || '').trim())
  if (!session) throw createAccessError('Session not found.', 404)
  return session
}

function safeSanityConfig(config) {
  if (!config) return null
  return {
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    provisionedAt: config.provisionedAt,
  }
}

function safeMedusaConfig(config) {
  if (!config) return null
  return {
    ...config,
  }
}

export function readStartCmsState(sessionId, options = {}) {
  const session = readSession(sessionId, options)
  return {
    sessionId: session.id,
    siteSpecReady: Boolean(session.siteSpecReady),
    owner: session.userId ? { type: 'user', id: session.userId } : { type: 'anonymous' },
    ownerSecretRequired: !session.userId,
    authenticatedProvisionRequired: false,
    authenticationRequired: Boolean(session.userId),
    sanity: {
      configured: Boolean(session.sanityConfig),
      provisionable: isSanityProvisionable(),
      config: safeSanityConfig(session.sanityConfig),
    },
    medusa: {
      configured: Boolean(session.medusaConfig),
      provisionable: isMedusaProvisionable(),
      config: safeMedusaConfig(session.medusaConfig),
    },
  }
}

export async function provisionStartSanity(sessionId, options = {}) {
  let session = readSession(sessionId, options)
  assertStartSessionAccess(session, {
    action: 'Sanity provision',
    authUser: options.authUser,
    ownerSecret: options.ownerSecret,
  })

  const inflight = (options.getInFlightSanityProvision || getInFlightSanityProvision)(
    session.id,
  )
  if (inflight) {
    try {
      await inflight
    } catch {
      void 0
    }
    session = readSession(session.id, options)
  }

  if (session.sanityConfig) {
    return {
      ...readStartCmsState(session.id, options),
      success: true,
      config: safeSanityConfig(session.sanityConfig),
      alreadyProvisioned: true,
    }
  }

  const canProvision = (options.isSanityProvisionable || isSanityProvisionable)()
  if (!canProvision) {
    throw createAccessError(
      'Sanity provisioning not configured (missing SANITY_PROJECT_ID or SANITY_MANAGEMENT_TOKEN)',
      503,
    )
  }

  const provision = options.provisionSanityForSession || provisionSanityForSession
  const config = await provision(session.id)
  await (options.setSanityConfig || setSanityConfig)(session.id, config)

  return {
    ...readStartCmsState(session.id, options),
    success: true,
    config: safeSanityConfig(config),
  }
}

async function maybeSyncSessionProductsToTenant(sessionId, config, options = {}) {
  if (!config?.adminBaseUrl || !config?.adminEmail || !config?.adminPassword) return null
  const session = readSession(sessionId, options)
  if (!session.siteSpecReady) return null

  const extractProducts = options.extractSessionProducts || extractSessionProducts
  const products = extractProducts(session, options.sessionsDir || DEFAULT_SESSIONS_DIR)
  if (!products.length) return null

  try {
    const syncProducts = options.syncProductsToMedusa || syncProductsToMedusa
    const result = await syncProducts(products, {
      backendUrl: config.adminBaseUrl,
      email: config.adminEmail,
      password: config.adminPassword,
      workspace: session.workspace,
    })
    const next = {
      ...config,
      productsSyncedAt: new Date().toISOString(),
      productsSyncedCount: result.synced,
    }
    await (options.setMedusaConfig || setMedusaConfig)(session.id, next)
    return { ok: true, ...result, config: next }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}

export async function provisionStartMedusa(sessionId, options = {}) {
  const session = readSession(sessionId, options)
  assertStartSessionAccess(session, {
    action: 'Medusa provision',
    authUser: options.authUser,
    ownerSecret: options.ownerSecret,
  })

  if (session.medusaConfig) {
    let config = session.medusaConfig
    let sync = null
    if (!config.productsSyncedAt) {
      const result = await maybeSyncSessionProductsToTenant(session.id, config, options)
      if (result?.ok) {
        config = result.config
        sync = { synced: result.synced, errors: result.errors }
      }
    }
    return {
      ...readStartCmsState(session.id, options),
      success: true,
      config: safeMedusaConfig(config),
      alreadyProvisioned: true,
      sync,
    }
  }

  const canProvision = (options.isMedusaProvisionable || isMedusaProvisionable)()
  if (!canProvision) {
    throw createAccessError('Medusa provisioning not configured', 503)
  }

  try {
    const provision = options.provisionMedusaForSession || provisionMedusaForSession
    const provisioned = await provision(session.id, session.prompt?.slice(0, 50))
    await (options.setMedusaConfig || setMedusaConfig)(session.id, provisioned)
    const syncResult = await maybeSyncSessionProductsToTenant(session.id, provisioned, options)
    const config = syncResult?.ok ? syncResult.config : provisioned
    return {
      ...readStartCmsState(session.id, options),
      success: true,
      config: safeMedusaConfig(config),
      sync: syncResult?.ok ? { synced: syncResult.synced, errors: syncResult.errors } : null,
    }
  } catch (error) {
    throw createAccessError(error.message || 'Provisioning failed', 500, {
      detail: error.detail,
    })
  }
}
