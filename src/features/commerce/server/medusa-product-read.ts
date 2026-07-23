import {
  getMedusaAdminApiToken,
  getMedusaAdminEmail,
  getMedusaAdminPassword,
  getMedusaBackendUrl,
  getMedusaPublishableKey,
  type MedusaEnv,
} from './medusa-store-env'
import { findRunningSessionContainer } from './medusa-container-provisioner'
import type { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import {
  type MedusaCommerceProduct,
  medusaStoreProductFields,
  normalizeMedusaStoreProduct,
} from './medusa-store-product'

type FetchLike = typeof fetch
type CommerceApiClient = Pick<ConvexHttpClient, 'query' | 'mutation'>
type ContainerInfo = { backendUrl: string }
type SessionLookupResponse = {
  sessionId?: unknown
  id?: unknown
}

type MedusaProductReadOptions = {
  env?: MedusaEnv
  fetch?: FetchLike
  metaEnv?: MedusaEnv
  // Injectable container finder for tests to bypass Docker. When omitted,
  // the real findRunningSessionContainer is used.
  containerFinder?: (sessionId: string) => Promise<ContainerInfo | undefined>
}

export type SessionMedusaProduct = MedusaCommerceProduct

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

function normalizeBackendUrl(backendUrl: string): string {
  return backendUrl.replace(/\/+$/, '')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function createClient(clientOverride?: CommerceApiClient): CommerceApiClient {
  return clientOverride ?? createRuntimeConvexHttpClient()
}

async function resolveProductReadSessionId(
  client: CommerceApiClient,
  lookup: string,
): Promise<string> {
  try {
    const response = (await client.query(api.sessions.getSessionApiResponse, {
      lookup,
    })) as SessionLookupResponse | null
    const resolved = response?.sessionId ?? response?.id
    return typeof resolved === 'string' && resolved.trim() ? resolved : lookup
  } catch {
    return lookup
  }
}

function createTenantName(sessionId: string): string {
  return `Ship Fast ${sessionId}`
}

type TenantConfig = {
  backendUrl?: string
  publishableKey?: string
}

async function readTenantConfig(
  sessionId: string,
  clientOverride?: CommerceApiClient,
): Promise<TenantConfig> {
  try {
    const config = await createClient(clientOverride).query(
      api.sessions.getCommerceConfig,
      { sessionId: sessionId as Id<'sessions'> },
    )
    if (
      !config ||
      typeof config.configJson !== 'string' ||
      !config.configJson.trim()
    ) {
      return {}
    }

    const parsed = JSON.parse(config.configJson) as unknown
    if (!isRecord(parsed)) return {}

    const tenant = isRecord(parsed.medusaTenant) ? parsed.medusaTenant : {}
    return {
      ...(typeof config.backendUrl === 'string' && config.backendUrl.trim()
        ? { backendUrl: config.backendUrl.trim() }
        : {}),
      ...(typeof tenant.publishableKey === 'string' &&
      tenant.publishableKey.trim()
        ? { publishableKey: tenant.publishableKey.trim() }
        : {}),
    }
  } catch {
    return {}
  }
}

function createAdminHeaders(token: string): Record<string, string> {
  return {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  }
}

async function authenticateAdmin({
  backendUrl,
  fetchImpl,
  options,
}: {
  backendUrl: string
  fetchImpl: FetchLike
  options: MedusaProductReadOptions
}): Promise<string | undefined> {
  const email = getMedusaAdminEmail(options.env, options.metaEnv)
  const password = getMedusaAdminPassword(options.env, options.metaEnv)
  const configuredToken = getMedusaAdminApiToken(options.env, options.metaEnv)
  if (!email?.trim() || !password?.trim()) {
    return configuredToken?.trim() ? configuredToken.trim() : undefined
  }

  const response = await fetchImpl(`${backendUrl}/auth/user/emailpass`, {
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  })
  if (!response.ok) return undefined

  const payload = (await response.json()) as { token?: unknown }
  return stringValue(payload.token)
}

async function discoverTenantPublishableKey({
  backendUrl,
  fetchImpl,
  options,
  sessionId,
}: {
  backendUrl: string
  fetchImpl: FetchLike
  options: MedusaProductReadOptions
  sessionId: string
}): Promise<string | undefined> {
  const token = await authenticateAdmin({ backendUrl, fetchImpl, options })
  if (token === undefined) return undefined

  const response = await fetchImpl(`${backendUrl}/admin/api-keys?limit=100`, {
    headers: createAdminHeaders(token),
  })
  if (!response.ok) return undefined

  const payload = (await response.json()) as {
    api_keys?: Array<{ title?: unknown; token?: unknown; type?: unknown }>
  }
  const tenantName = createTenantName(sessionId)
  const key = payload.api_keys?.find(
    (item) => item.title === tenantName && item.type === 'publishable',
  )

  return stringValue(key?.token)
}

async function readDefaultRegionId({
  backendUrl,
  fetchImpl,
  publishableKey,
}: {
  backendUrl: string
  fetchImpl: FetchLike
  publishableKey: string
}): Promise<string | undefined> {
  const response = await fetchImpl(`${backendUrl}/store/regions`, {
    headers: { 'x-publishable-api-key': publishableKey },
  })
  if (!response.ok) return undefined

  const payload = (await response.json()) as { regions?: unknown }
  if (!Array.isArray(payload.regions)) return undefined
  const region = payload.regions.find(
    (item): item is { id: string } =>
      isRecord(item) && typeof item.id === 'string',
  )
  return region?.id
}

export async function createSessionMedusaProductsResponse(
  sessionId: string,
  options: MedusaProductReadOptions = {},
  clientOverride?: CommerceApiClient,
): Promise<Response> {
  const fetchImpl = options.fetch ?? fetch
  const client =
    clientOverride === undefined ? undefined : createClient(clientOverride)
  const resolvedSessionId =
    client === undefined
      ? sessionId
      : await resolveProductReadSessionId(client, sessionId)

  // Resolve the per-session container URL. Priority:
  //   1. backendUrl stored in commerce config (set during provisioning)
  //   2. running container discovered via docker inspect (or injected mock)
  //   3. MEDUSA_BACKEND_URL from env (fallback, shared backend)
  const tenantConfig = await readTenantConfig(resolvedSessionId, client)
  const containerFinder = options.containerFinder ?? findRunningSessionContainer
  const runningContainer = await containerFinder(resolvedSessionId)
  const backendUrl = normalizeBackendUrl(
    tenantConfig.backendUrl ??
      runningContainer?.backendUrl ??
      getMedusaBackendUrl(options.env, options.metaEnv),
  )

  let publishableKey: string
  try {
    publishableKey =
      tenantConfig.publishableKey ??
      (await discoverTenantPublishableKey({
        backendUrl,
        fetchImpl,
        options,
        sessionId: resolvedSessionId,
      })) ??
      getMedusaPublishableKey(options.env, options.metaEnv)
  } catch {
    return json(
      {
        products: [],
        sessionId: resolvedSessionId,
        warning: 'Medusa Store API product read failed.',
      },
      { status: 200 },
    )
  }
  if (!publishableKey.trim()) {
    return json({
      products: [],
      sessionId: resolvedSessionId,
      warning: 'Medusa Store API not configured.',
    })
  }

  try {
    const regionId = await readDefaultRegionId({
      backendUrl,
      fetchImpl,
      publishableKey: publishableKey.trim(),
    })
    const regionQuery =
      regionId === undefined ? '' : `&region_id=${encodeURIComponent(regionId)}`
    let response = await fetchImpl(
      `${backendUrl}/store/products?limit=100${regionQuery}&fields=${encodeURIComponent(
        medusaStoreProductFields,
      )}`,
      {
        headers: { 'x-publishable-api-key': publishableKey.trim() },
      },
    )
    if (regionId === undefined && response.status === 400) {
      response = await fetchImpl(`${backendUrl}/store/products?limit=100`, {
        headers: { 'x-publishable-api-key': publishableKey.trim() },
      })
    }

    if (!response.ok) {
      return json(
        {
          products: [],
          sessionId: resolvedSessionId,
          warning: `Medusa Store API product read failed (${response.status}).`,
        },
        { status: 200 },
      )
    }

    const payload = (await response.json()) as { products?: unknown }
    if (!Array.isArray(payload.products)) {
      return json(
        {
          products: [],
          sessionId: resolvedSessionId,
          warning: 'Medusa Store API product read failed.',
        },
        { status: 200 },
      )
    }
    const products = payload.products
      .map((product) => normalizeMedusaStoreProduct(resolvedSessionId, product))
      .filter((product) => product !== undefined)

    return json({ products, sessionId: resolvedSessionId })
  } catch {
    return json(
      {
        products: [],
        sessionId: resolvedSessionId,
        warning: 'Medusa Store API product read failed.',
      },
      { status: 200 },
    )
  }
}
