import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import {
  getMedusaAdminApiToken,
  getMedusaAdminEmail,
  getMedusaAdminPassword,
  getMedusaPublishableKey,
  hasConfiguredMedusaBackendUrl,
  type MedusaEnv,
} from './medusa-store-env'
import { syncGeneratedProductsToMedusa } from './medusa-product-sync'
import {
  findRunningSessionContainer,
  provisionSessionMedusaContainer,
} from './medusa-container-provisioner'
import type { GeneratedCommerceProduct } from '../services/generated-commerce-products'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type CommerceApiClient = Pick<ConvexHttpClient, 'query' | 'mutation'>
type FetchLike = typeof fetch
type MedusaContainerInfo = {
  backendUrl: string
  adminUrl: string
  storefrontUrl: string
}
type MedusaContainerProvider = {
  findRunning: (sessionId: string) => Promise<MedusaContainerInfo | undefined>
  provision: (
    sessionId: string,
    options: {
      adminEmail?: string
      adminPassword?: string
      fetch?: FetchLike
    },
  ) => Promise<MedusaContainerInfo>
}
type MedusaProvisionOptions = {
  env?: MedusaEnv
  fetch?: FetchLike
  metaEnv?: MedusaEnv
  containerProvider?: MedusaContainerProvider
}
type MedusaStoreApiAvailability = {
  currencyCode?: string
  liveStoreApiReady: boolean
  publishableKeyConfigured: boolean
  warning?: string
  status?: number
}
type MedusaHandoff = {
  adminEmail?: string
  adminPassword?: string
  adminUrl: string
  backendUrl: string
  storefrontUrl: string
  tenantId: string
}

const medusaStoreApiUnavailableWarning = 'Medusa Store API is unavailable.'

function normalizeMedusaStoreApiWarning(
  warning: string | undefined,
): string | undefined {
  const normalized = warning?.trim()
  if (!normalized) return undefined
  return /^Medusa Store API is unavailable:/i.test(normalized)
    ? medusaStoreApiUnavailableWarning
    : normalized
}

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

async function readJsonBody(
  request: Request,
): Promise<Record<string, unknown>> {
  const text = await request.text()
  if (!text.trim()) return {}
  const parsed = JSON.parse(text) as unknown
  return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
    ? (parsed as Record<string, unknown>)
    : {}
}

function stringValue(
  body: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = body[key]
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function getOwnerSecret(
  request: Request,
  body: Record<string, unknown>,
): string | undefined {
  return (
    stringValue(body, 'anonymousOwnerSecret') ??
    stringValue(body, 'anonOwnerSecret') ??
    request.headers.get('x-ship-fast-owner-secret') ??
    undefined
  )
}

function generatedProductValue(
  value: unknown,
): GeneratedCommerceProduct | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined
  }

  const product = value as Record<string, unknown>
  const title = typeof product.title === 'string' ? product.title.trim() : ''
  const handle = typeof product.handle === 'string' ? product.handle.trim() : ''
  const price = typeof product.price === 'number' ? product.price : undefined
  const description =
    typeof product.description === 'string' && product.description.trim()
      ? product.description.trim()
      : undefined

  if (!title || !handle || price === undefined || !Number.isFinite(price)) {
    return undefined
  }

  return {
    ...(description === undefined ? {} : { description }),
    handle,
    price,
    title,
  }
}

function getGeneratedProducts(
  body: Record<string, unknown>,
): Array<GeneratedCommerceProduct> {
  const products = body.products
  if (!Array.isArray(products)) return []
  return products
    .map(generatedProductValue)
    .filter((product) => product !== undefined)
    .slice(0, 25)
}

function createClient(clientOverride?: CommerceApiClient): CommerceApiClient {
  return clientOverride ?? createRuntimeConvexHttpClient()
}

function isUnsupportedProductCountError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /extra field [`"]?productCount|productCount.*validator/i.test(message)
}

function errorStatus(error: unknown): number {
  const message = error instanceof Error ? error.message : String(error)
  if (/FORBIDDEN/i.test(message)) return 403
  if (/NOT_FOUND|Validator: v\.id\("sessions"\)/i.test(message)) return 404
  return 500
}

async function validateMedusaStoreApi(
  backendUrl: string,
  publishableKey: string,
  fetchImpl: FetchLike,
): Promise<MedusaStoreApiAvailability> {
  const normalizedPublishableKey = publishableKey.trim()

  if (!normalizedPublishableKey) {
    return {
      liveStoreApiReady: false,
      publishableKeyConfigured: false,
      warning: 'Medusa Store API not configured.',
    }
  }

  try {
    const response = await fetchImpl(`${backendUrl}/store/regions`, {
      headers: {
        'x-publishable-api-key': normalizedPublishableKey,
      },
    })

    if (!response.ok) {
      return {
        liveStoreApiReady: false,
        publishableKeyConfigured: true,
        status: response.status,
        warning: medusaStoreApiUnavailableWarning,
      }
    }

    const payload = (await response.json().catch(() => ({}))) as {
      regions?: Array<{ currency_code?: unknown }>
    }
    const currencyCode = payload.regions?.find(
      (region) => typeof region.currency_code === 'string',
    )?.currency_code

    return {
      ...(typeof currencyCode === 'string' ? { currencyCode } : {}),
      liveStoreApiReady: true,
      publishableKeyConfigured: true,
    }
  } catch (error) {
    return {
      liveStoreApiReady: false,
      publishableKeyConfigured: true,
      warning: medusaStoreApiUnavailableWarning,
    }
  }
}

function createDefaultMedusaConfigJson(
  sessionId: string,
  availability: MedusaStoreApiAvailability,
  productSync?: {
    medusaTenant?: {
      apiKeyId: string
      publishableKey: string
      salesChannelId: string
    }
    requested: number
    synced: number
  },
): string {
  return JSON.stringify({
    provider: 'medusa',
    tenantMode: 'session',
    tenantId: sessionId,
    publishableKeyConfigured: availability.publishableKeyConfigured,
    liveStoreApiReady: availability.liveStoreApiReady,
    ...(productSync === undefined
      ? {}
      : {
          productSync: {
            requested: productSync.requested,
            synced: productSync.synced,
          },
        }),
    ...(productSync?.medusaTenant === undefined
      ? {}
      : { medusaTenant: productSync.medusaTenant }),
    ...(availability.warning === undefined
      ? {}
      : { warning: availability.warning }),
    ...(availability.status === undefined
      ? {}
      : { storeApiStatus: availability.status }),
  })
}

function createMedusaHandoff(
  sessionId: string,
  backendUrl: string | undefined,
  adminUrl: string | undefined,
  storefrontUrl: string | undefined,
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): MedusaHandoff | undefined {
  if (
    !hasConfiguredMedusaBackendUrl(env, metaEnv) ||
    backendUrl === undefined ||
    adminUrl === undefined ||
    storefrontUrl === undefined
  ) {
    return undefined
  }

  const adminEmail = getMedusaAdminEmail(env, metaEnv)
  const adminPassword = getMedusaAdminPassword(env, metaEnv)

  return {
    ...(adminEmail === undefined ? {} : { adminEmail }),
    ...(adminPassword === undefined ? {} : { adminPassword }),
    adminUrl,
    backendUrl,
    storefrontUrl,
    tenantId: sessionId,
  }
}

export async function createSessionMedusaConfigResponse(
  sessionId: string,
  clientOverride?: CommerceApiClient,
): Promise<Response> {
  try {
    const config = await createClient(clientOverride).query(
      api.sessions.getCommerceConfig,
      { sessionId: sessionId },
    )

    return json({
      enabled: config?.status === 'ready',
      sessionId,
      config,
    })
  } catch {
    return json(
      { error: 'Commerce configuration is unavailable.' },
      { status: 503 },
    )
  }
}

export async function createSessionMedusaProvisionResponse(
  sessionId: string,
  request: Request,
  clientOverride?: CommerceApiClient,
  options: MedusaProvisionOptions = {},
): Promise<Response> {
  try {
    const body = await readJsonBody(request)
    const generatedProducts = getGeneratedProducts(body)
    const fetchImpl = options.fetch ?? fetch
    const adminEmail = getMedusaAdminEmail(options.env, options.metaEnv)
    const adminPassword = getMedusaAdminPassword(options.env, options.metaEnv)

    // Container-per-tenant: each session gets its own isolated Medusa
    // instance with its own database, admin UI, and products. Reuse an
    // already-running container if the session re-provisions. Tests can
    // inject a mock containerProvider to bypass Docker.
    const containerProvider = options.containerProvider ?? {
      findRunning: findRunningSessionContainer,
      provision: (sid, opts) =>
        provisionSessionMedusaContainer(
          sid,
          opts,
        ) as Promise<MedusaContainerInfo>,
    }
    let container = await containerProvider.findRunning(sessionId)
    if (container === undefined) {
      container = await containerProvider.provision(sessionId, {
        adminEmail,
        adminPassword,
        fetch: fetchImpl,
      })
    }

    const backendUrl = container.backendUrl
    const adminUrl = container.adminUrl
    const storefrontUrl = container.storefrontUrl
    const publishableKey = getMedusaPublishableKey(options.env, options.metaEnv)
    const handoff = createMedusaHandoff(
      sessionId,
      backendUrl,
      adminUrl,
      storefrontUrl,
      options.env,
      options.metaEnv,
    )
    let availability = await validateMedusaStoreApi(
      backendUrl,
      publishableKey,
      fetchImpl,
    )
    const productSync =
      generatedProducts.length > 0
        ? await syncGeneratedProductsToMedusa({
            adminApiToken: getMedusaAdminApiToken(options.env, options.metaEnv),
            adminEmail,
            adminPassword,
            backendUrl,
            currencyCode: availability.currencyCode,
            fetch: fetchImpl,
            products: generatedProducts,
            sessionId,
          })
        : { synced: 0 }
    if (productSync.tenant !== undefined && !availability.liveStoreApiReady) {
      availability = await validateMedusaStoreApi(
        backendUrl,
        productSync.tenant.publishableKey,
        fetchImpl,
      )
    }
    const warning = normalizeMedusaStoreApiWarning(
      availability.warning ?? productSync.warning,
    )

    const client = createClient(clientOverride)
    const mutationArgs = {
      sessionId: sessionId,
      anonymousOwnerSecret: getOwnerSecret(request, body),
      backendUrl,
      adminUrl,
      storefrontUrl,
      errorMessage: warning,
      productCount: generatedProducts.length,
      configJson:
        body.config === undefined
          ? (stringValue(body, 'configJson') ??
            createDefaultMedusaConfigJson(sessionId, availability, {
              ...(productSync.tenant === undefined
                ? {}
                : { medusaTenant: productSync.tenant }),
              requested: generatedProducts.length,
              synced: productSync.synced,
            }))
          : JSON.stringify(body.config),
    }
    let persisted = true
    const result = await client
      .mutation(api.sessions.upsertCommerceConfig, mutationArgs)
      .catch(async (error) => {
        if (isUnsupportedProductCountError(error)) {
          const { productCount: _productCount, ...compatibleArgs } =
            mutationArgs
          return await client.mutation(
            api.sessions.upsertCommerceConfig,
            compatibleArgs,
          )
        }
        if (errorStatus(error) === 403 && generatedProducts.length > 0) {
          persisted = false
          return { sessionId }
        }
        throw error
      })

    return json({
      ...result,
      handoff,
      liveStoreApiReady: availability.liveStoreApiReady,
      persisted,
      syncedProducts: productSync.synced,
      status: 'ready',
      ...(warning === undefined ? {} : { warning }),
    })
  } catch {
    return json({ error: 'Commerce provisioning failed.' }, { status: 503 })
  }
}
