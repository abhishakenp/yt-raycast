import {
  getMedusaAdminApiToken,
  getMedusaAdminEmail,
  getMedusaAdminPassword,
  getMedusaBackendUrl,
  getMedusaPublishableKey,
  type MedusaEnv,
} from './medusa-store-env'
import type { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type FetchLike = typeof fetch
type CommerceApiClient = Pick<ConvexHttpClient, 'query' | 'mutation'>

type MedusaProductReadOptions = {
  env?: MedusaEnv
  fetch?: FetchLike
  metaEnv?: MedusaEnv
}

export type SessionMedusaProduct = {
  currencyCode?: string
  description?: string
  handle: string
  price?: number
  sourceHandle: string
  title: string
}

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

const normalizeBackendUrl = (backendUrl: string): string =>
  backendUrl.replace(/\/+$/, '')

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const stringValue = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined

const numberValue = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined

const createClient = (clientOverride?: CommerceApiClient): CommerceApiClient =>
  clientOverride ?? createRuntimeConvexHttpClient()

const createTenantName = (sessionId: string): string => `Ship Fast ${sessionId}`

const readTenantPublishableKey = async (
  sessionId: string,
  clientOverride?: CommerceApiClient,
): Promise<string | undefined> => {
  try {
    const config = await createClient(clientOverride).query(
      api.sessions.getCommerceConfig,
      { sessionId: sessionId as any },
    )
    if (
      !config ||
      typeof config.configJson !== 'string' ||
      !config.configJson.trim()
    ) {
      return undefined
    }

    const parsed = JSON.parse(config.configJson) as unknown
    if (!isRecord(parsed) || !isRecord(parsed.medusaTenant)) return undefined

    return stringValue(parsed.medusaTenant.publishableKey)
  } catch {
    return undefined
  }
}

const createAdminHeaders = (token: string): Record<string, string> => ({
  authorization: `Bearer ${token}`,
  'content-type': 'application/json',
})

const authenticateAdmin = async ({
  backendUrl,
  fetchImpl,
  options,
}: {
  backendUrl: string
  fetchImpl: FetchLike
  options: MedusaProductReadOptions
}): Promise<string | undefined> => {
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

const discoverTenantPublishableKey = async ({
  backendUrl,
  fetchImpl,
  options,
  sessionId,
}: {
  backendUrl: string
  fetchImpl: FetchLike
  options: MedusaProductReadOptions
  sessionId: string
}): Promise<string | undefined> => {
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

const readProductPrice = (
  product: Record<string, unknown>,
): { currencyCode?: string; price?: number } => {
  const variants = Array.isArray(product.variants) ? product.variants : []
  for (const variant of variants) {
    if (!isRecord(variant)) continue
    const calculatedPrice = isRecord(variant.calculated_price)
      ? variant.calculated_price
      : undefined
    const price = numberValue(calculatedPrice?.calculated_amount)
    const currencyCode = stringValue(calculatedPrice?.currency_code)
    if (price !== undefined) {
      return {
        ...(currencyCode === undefined ? {} : { currencyCode }),
        price,
      }
    }
  }
  return {}
}

const readDefaultRegionId = async ({
  backendUrl,
  fetchImpl,
  publishableKey,
}: {
  backendUrl: string
  fetchImpl: FetchLike
  publishableKey: string
}): Promise<string | undefined> => {
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

const normalizeProduct = (
  sessionId: string,
  value: unknown,
): SessionMedusaProduct | undefined => {
  if (!isRecord(value)) return undefined

  const metadata = isRecord(value.metadata) ? value.metadata : {}
  const taggedSessionId = stringValue(metadata.ship_fast_session_id)

  // Cross-tenant guard: exclude products explicitly tagged as belonging to a
  // different session. Products with no session tag (created directly in the
  // Medusa admin) are included — the publishable key already scopes the store
  // API to the session's sales channel, so untagged products are admin-created
  // items in this tenant that should flow back to the generated UI.
  if (taggedSessionId !== undefined && taggedSessionId !== sessionId) {
    return undefined
  }

  const title = stringValue(value.title)
  const handle = stringValue(value.handle)
  if (!title || !handle) return undefined

  // For ship-fast generated products, sourceHandle maps back to the original
  // generated product handle so the preview sync can find the DOM element.
  // For admin-created products (no ship-fast metadata), the product is its own
  // source — sourceHandle falls back to the Medusa product handle.
  const isShipFastGenerated = metadata.ship_fast_generated_product === true
  const sourceHandle = isShipFastGenerated
    ? (stringValue(metadata.ship_fast_generated_handle) ?? handle)
    : handle

  const description = stringValue(value.description)
  const price = readProductPrice(value)

  return {
    ...(description === undefined ? {} : { description }),
    ...price,
    handle,
    sourceHandle,
    title,
  }
}

export const createSessionMedusaProductsResponse = async (
  sessionId: string,
  options: MedusaProductReadOptions = {},
  clientOverride?: CommerceApiClient,
): Promise<Response> => {
  const backendUrl = normalizeBackendUrl(
    getMedusaBackendUrl(options.env, options.metaEnv),
  )
  const fetchImpl = options.fetch ?? fetch
  let publishableKey: string
  try {
    publishableKey =
      (await readTenantPublishableKey(sessionId, clientOverride)) ??
      (await discoverTenantPublishableKey({
        backendUrl,
        fetchImpl,
        options,
        sessionId,
      })) ??
      getMedusaPublishableKey(options.env, options.metaEnv)
  } catch {
    return json(
      {
        products: [],
        sessionId,
        warning: 'Medusa Store API product read failed.',
      },
      { status: 200 },
    )
  }
  if (!publishableKey.trim()) {
    return json({
      products: [],
      sessionId,
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
    const response = await fetchImpl(
      `${backendUrl}/store/products?limit=100${regionQuery}&fields=${encodeURIComponent(
        '+metadata,*variants.calculated_price',
      )}`,
      {
        headers: { 'x-publishable-api-key': publishableKey.trim() },
      },
    )

    if (!response.ok) {
      return json(
        {
          products: [],
          sessionId,
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
          sessionId,
          warning: 'Medusa Store API product read failed.',
        },
        { status: 200 },
      )
    }
    const products = payload.products
      .map((product) => normalizeProduct(sessionId, product))
      .filter((product) => product !== undefined)

    return json({ products, sessionId })
  } catch {
    return json(
      {
        products: [],
        sessionId,
        warning: 'Medusa Store API product read failed.',
      },
      { status: 200 },
    )
  }
}
