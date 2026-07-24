import { ConvexHttpClient } from 'convex/browser'
import type { FunctionReference } from 'convex/server'

import { api } from '../../../../convex/_generated/api'
import {
  getConfiguredMedusaAdminUrl,
  getConfiguredMedusaBackendUrl,
  getConfiguredMedusaStorefrontUrl,
  getMedusaAdminApiToken,
  getMedusaAdminEmail,
  getMedusaAdminPassword,
  getMedusaPublishableKey,
  hasConfiguredMedusaBackendUrl,
  readMedusaEnv,
  type MedusaEnv,
} from './medusa-store-env'
import {
  ensureMedusaSessionTenant,
  syncGeneratedProductsToMedusa,
} from './medusa-product-sync'
import {
  findRunningSessionContainer,
  provisionSessionMedusaContainer,
} from './medusa-container-provisioner'
import {
  type GeneratedCommerceProduct,
  extractGeneratedCommerceProducts,
  normalizeGeneratedCommerceProductInput,
} from '../services/generated-commerce-products'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type PublicQueryReference = FunctionReference<'query'>
type PublicMutationReference = FunctionReference<'mutation'>
type CommerceApiClient = {
  query: (
    query: PublicQueryReference,
    args: Record<string, unknown>,
  ) => Promise<unknown>
  mutation: (
    mutation: PublicMutationReference,
    args: Record<string, unknown>,
  ) => Promise<unknown>
  setAuth: ConvexHttpClient['setAuth']
}
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
      razorpayKeyId?: string
      razorpayKeySecret?: string
      razorpayWebhookSecret?: string
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
  adminUrl: string
  backendUrl: string
  storefrontUrl: string
  tenantId: string
}
type MedusaProvisionTarget = {
  adminUrl?: string
  backendUrl?: string
  storefrontUrl?: string
}
type CommerceConfigMutationArgs = {
  sessionId: string
  anonymousOwnerSecret?: string
  backendUrl?: string
  adminUrl?: string
  storefrontUrl?: string
  errorMessage?: string
  productCount: number
  configJson: string
}

type SessionLookupResponse = {
  sessionId?: unknown
  id?: unknown
}

const medusaStoreApiUnavailableWarning = 'Medusa Store API is unavailable.'

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

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
  const parsed: unknown = JSON.parse(text)
  return isRecord(parsed) ? parsed : {}
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

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get('authorization') ?? ''
  const match = auth.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || null
}

function generatedProductValue(
  value: unknown,
): GeneratedCommerceProduct | undefined {
  return normalizeGeneratedCommerceProductInput(value)
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

function extractGeneratedProductsFromSessionView(
  value: unknown,
): Array<GeneratedCommerceProduct> {
  if (!isRecord(value)) return []

  const latestPreview = isRecord(value.latestPreview)
    ? value.latestPreview
    : undefined
  const homeModule = isRecord(value.homeModule) ? value.homeModule : undefined
  const siteSpec = isRecord(value.siteSpec) ? value.siteSpec : undefined

  return extractGeneratedCommerceProducts({
    source:
      (latestPreview === undefined
        ? undefined
        : stringValue(latestPreview, 'openUiSource')) ??
      (homeModule === undefined
        ? undefined
        : stringValue(homeModule, 'source')),
    siteSpecJson:
      (siteSpec === undefined
        ? undefined
        : stringValue(siteSpec, 'specJson')) ??
      (latestPreview === undefined
        ? undefined
        : stringValue(latestPreview, 'siteSpecJson')),
  }).slice(0, 25)
}

async function resolveGeneratedProducts(
  client: CommerceApiClient,
  sessionId: string,
  body: Record<string, unknown>,
): Promise<Array<GeneratedCommerceProduct>> {
  const requestProducts = getGeneratedProducts(body)
  if (requestProducts.length > 0) return requestProducts

  try {
    const generationView = await client.query(api.sessions.getGenerationView, {
      lookup: sessionId,
    })
    return extractGeneratedProductsFromSessionView(generationView)
  } catch {
    return []
  }
}

async function resolveProvisionSessionId(
  client: CommerceApiClient,
  lookup: string,
): Promise<string> {
  try {
    const response = await client.query(api.sessions.getSessionApiResponse, {
      lookup,
    })
    const lookupResponse = sessionLookupResponse(response)
    const resolved = lookupResponse?.sessionId ?? lookupResponse?.id
    return typeof resolved === 'string' && resolved.trim() ? resolved : lookup
  } catch {
    return lookup
  }
}

function sessionLookupResponse(value: unknown): SessionLookupResponse | null {
  if (!isRecord(value)) return null
  return {
    id: value.id,
    sessionId: value.sessionId,
  }
}

function firstRegionCurrencyCode(payload: unknown): string | undefined {
  if (!isRecord(payload) || !Array.isArray(payload.regions)) return undefined
  const region = payload.regions.find(
    (item) => isRecord(item) && typeof item.currency_code === 'string',
  )
  return isRecord(region) && typeof region.currency_code === 'string'
    ? region.currency_code
    : undefined
}

function medusaContainerInfo(
  provision: Awaited<ReturnType<typeof provisionSessionMedusaContainer>>,
): MedusaContainerInfo {
  return {
    adminUrl: provision.adminUrl,
    backendUrl: provision.backendUrl,
    storefrontUrl: provision.storefrontUrl,
  }
}

function createClient(clientOverride?: CommerceApiClient): CommerceApiClient {
  return clientOverride ?? createRuntimeConvexHttpClient()
}

function isUnsupportedProductCountError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /extra field [`"]?productCount|productCount.*validator/i.test(message)
}

function isMissingProvisionAuthorizationQuery(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /Could not find public function for ['"]sessions:authorizeSessionCommerceProvision['"]/i.test(
    message,
  )
}

function errorStatus(error: unknown): number {
  const message = error instanceof Error ? error.message : String(error)
  if (/FORBIDDEN/i.test(message)) return 403
  if (/NOT_FOUND|Validator: v\.id\("sessions"\)/i.test(message)) return 404
  return 500
}

function commerceProvisionErrorCode(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  if (/FORBIDDEN/i.test(message)) return 'FORBIDDEN'
  if (/NOT_FOUND|Validator: v\.id\("sessions"\)/i.test(message)) {
    return 'NOT_FOUND'
  }
  if (/Could not find public function/i.test(message)) {
    return 'CONVEX_FUNCTION_MISSING'
  }
  if (/Medusa admin (email|password) is required to provision/i.test(message)) {
    return 'MEDUSA_ADMIN_CREDENTIALS_MISSING'
  }
  return 'COMMERCE_PROVISION_FAILED'
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

    const payload: unknown = await response.json().catch(() => ({}))
    const currencyCode = firstRegionCurrencyCode(payload)

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
  publishableKey: string,
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
  const effectivePublishableKey =
    productSync?.medusaTenant?.publishableKey ?? publishableKey.trim()

  return JSON.stringify({
    provider: 'medusa',
    tenantMode: 'session',
    tenantId: sessionId,
    ...(effectivePublishableKey
      ? { publishableKey: effectivePublishableKey }
      : {}),
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

function normalizeUrlForComparison(value: string | undefined): string {
  return value?.trim().replace(/\/+$/, '') ?? ''
}

function createGeneratedStorefrontUrl(
  sessionId: string,
  request: Request,
): string {
  return new URL(
    `/generate/${encodeURIComponent(sessionId)}`,
    request.url,
  ).toString()
}

function resolveStorefrontUrl(
  sessionId: string,
  request: Request,
  backendUrl: string | undefined,
  storefrontUrl: string | undefined,
): string | undefined {
  if (storefrontUrl === undefined) return undefined
  return normalizeUrlForComparison(backendUrl) ===
    normalizeUrlForComparison(storefrontUrl)
    ? createGeneratedStorefrontUrl(sessionId, request)
    : storefrontUrl
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

  return {
    adminUrl,
    backendUrl,
    storefrontUrl,
    tenantId: sessionId,
  }
}

async function resolveMedusaProvisionTarget({
  adminEmail,
  adminPassword,
  containerProvider,
  env,
  fetchImpl,
  metaEnv,
  sessionId,
}: {
  adminEmail?: string
  adminPassword?: string
  containerProvider: MedusaContainerProvider
  env?: MedusaEnv
  fetchImpl: FetchLike
  metaEnv?: MedusaEnv
  sessionId: string
}): Promise<MedusaProvisionTarget> {
  const configuredBackendUrl = getConfiguredMedusaBackendUrl(env, metaEnv)
  if (configuredBackendUrl !== undefined) {
    return {
      adminUrl: getConfiguredMedusaAdminUrl(env, metaEnv),
      backendUrl: configuredBackendUrl,
      storefrontUrl:
        getConfiguredMedusaStorefrontUrl(env, metaEnv) ?? configuredBackendUrl,
    }
  }

  const runningContainer = await containerProvider.findRunning(sessionId)
  const container =
    runningContainer ??
    (await containerProvider.provision(sessionId, {
      adminEmail,
      adminPassword,
      fetch: fetchImpl,
      razorpayKeyId: readMedusaEnv(
        ['RAZORPAY_ID', 'RAZORPAY_KEY_ID'],
        env,
        metaEnv,
      ),
      razorpayKeySecret: readMedusaEnv(
        ['RAZORPAY_SECRET', 'RAZORPAY_KEY_SECRET'],
        env,
        metaEnv,
      ),
      razorpayWebhookSecret: readMedusaEnv(
        ['RAZORPAY_WEBHOOK_SECRET'],
        env,
        metaEnv,
      ),
    }))

  return {
    adminUrl: container.adminUrl,
    backendUrl: container.backendUrl,
    storefrontUrl: container.storefrontUrl,
  }
}

export async function createSessionMedusaConfigResponse(
  sessionId: string,
  clientOverride?: CommerceApiClient,
): Promise<Response> {
  try {
    const client = createClient(clientOverride)
    const provisionSessionId = await resolveProvisionSessionId(
      client,
      sessionId,
    )
    const config = await client.query(api.sessions.getCommerceConfig, {
      sessionId: provisionSessionId,
    })

    return json({
      enabled: isRecord(config) && config.status === 'ready',
      sessionId: provisionSessionId,
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
    const anonymousOwnerSecret = getOwnerSecret(request, body)
    const client = createClient(clientOverride)
    const authToken = getBearerToken(request)
    if (authToken !== null) client.setAuth(authToken)
    const provisionSessionId = await resolveProvisionSessionId(
      client,
      sessionId,
    )
    try {
      await client.query(api.sessions.authorizeSessionCommerceProvision, {
        sessionId: provisionSessionId,
        anonymousOwnerSecret,
      })
    } catch (error) {
      if (!isMissingProvisionAuthorizationQuery(error)) throw error
    }

    const generatedProducts = await resolveGeneratedProducts(
      client,
      provisionSessionId,
      body,
    )
    const fetchImpl = options.fetch ?? fetch
    const configuredAdminApiToken = getMedusaAdminApiToken(
      options.env,
      options.metaEnv,
    )
    const hasConfiguredBackend = hasConfiguredMedusaBackendUrl(
      options.env,
      options.metaEnv,
    )
    const configuredAdminEmail = getMedusaAdminEmail(
      options.env,
      options.metaEnv,
    )
    const configuredAdminPassword = getMedusaAdminPassword(
      options.env,
      options.metaEnv,
    )
    const hasConfiguredAdminCredentials =
      configuredAdminEmail !== undefined &&
      configuredAdminPassword !== undefined
    const shouldUseRequestAdminCredentials =
      !hasConfiguredAdminCredentials &&
      !(hasConfiguredBackend && configuredAdminApiToken !== undefined)
    const adminEmail = hasConfiguredAdminCredentials
      ? configuredAdminEmail
      : shouldUseRequestAdminCredentials
        ? stringValue(body, 'adminEmail')
        : undefined
    const adminPassword = hasConfiguredAdminCredentials
      ? configuredAdminPassword
      : shouldUseRequestAdminCredentials
        ? stringValue(body, 'adminPassword')
        : undefined
    const containerProvider = options.containerProvider ?? {
      findRunning: findRunningSessionContainer,
      provision: async (sid, opts) =>
        medusaContainerInfo(await provisionSessionMedusaContainer(sid, opts)),
    }
    const target = await resolveMedusaProvisionTarget({
      adminEmail,
      adminPassword,
      containerProvider,
      env: options.env,
      fetchImpl,
      metaEnv: options.metaEnv,
      sessionId: provisionSessionId,
    })

    const backendUrl = target.backendUrl
    const adminUrl = target.adminUrl
    const storefrontUrl = resolveStorefrontUrl(
      provisionSessionId,
      request,
      backendUrl,
      target.storefrontUrl,
    )
    const handoff = createMedusaHandoff(
      provisionSessionId,
      backendUrl,
      adminUrl,
      storefrontUrl,
      options.env,
      options.metaEnv,
    )
    const productSync =
      generatedProducts.length > 0 && backendUrl !== undefined
        ? await syncGeneratedProductsToMedusa({
            adminApiToken: configuredAdminApiToken,
            adminEmail,
            adminPassword,
            backendUrl,
            fetch: fetchImpl,
            products: generatedProducts,
            sessionId: provisionSessionId,
          })
        : { synced: 0 }
    const tenantSetup =
      backendUrl === undefined ||
      productSync.tenant !== undefined ||
      generatedProducts.length > 0
        ? {}
        : await ensureMedusaSessionTenant({
            adminApiToken: configuredAdminApiToken,
            adminEmail,
            adminPassword,
            backendUrl,
            fetch: fetchImpl,
            sessionId: provisionSessionId,
          })
    const publishableKey =
      productSync.tenant?.publishableKey ??
      tenantSetup.tenant?.publishableKey ??
      getMedusaPublishableKey(options.env, options.metaEnv)
    const availability =
      backendUrl === undefined
        ? {
            liveStoreApiReady: false,
            publishableKeyConfigured: false,
            warning: 'Medusa Store API not configured.',
          }
        : await validateMedusaStoreApi(backendUrl, publishableKey, fetchImpl)
    const warning = normalizeMedusaStoreApiWarning(
      availability.warning ?? productSync.warning ?? tenantSetup.warning,
    )

    const mutationArgs: CommerceConfigMutationArgs = {
      sessionId: provisionSessionId,
      ...(anonymousOwnerSecret === undefined ? {} : { anonymousOwnerSecret }),
      ...(backendUrl === undefined ? {} : { backendUrl }),
      ...(adminUrl === undefined ? {} : { adminUrl }),
      ...(storefrontUrl === undefined ? {} : { storefrontUrl }),
      ...(warning === undefined ? {} : { errorMessage: warning }),
      productCount: generatedProducts.length,
      configJson:
        body.config === undefined
          ? (stringValue(body, 'configJson') ??
            createDefaultMedusaConfigJson(
              provisionSessionId,
              availability,
              publishableKey,
              {
                ...(productSync.tenant === undefined
                  ? {}
                  : { medusaTenant: productSync.tenant }),
                ...(productSync.tenant !== undefined ||
                tenantSetup.tenant === undefined
                  ? {}
                  : { medusaTenant: tenantSetup.tenant }),
                requested: generatedProducts.length,
                synced: productSync.synced,
              },
            ))
          : JSON.stringify(body.config),
    }
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
        throw error
      })

    return json({
      ...(isRecord(result) ? result : {}),
      handoff,
      liveStoreApiReady: availability.liveStoreApiReady,
      syncedProducts: productSync.synced,
      status: 'ready',
      ...(warning === undefined ? {} : { warning }),
    })
  } catch (error) {
    const status = errorStatus(error)
    return json(
      {
        error: 'Commerce provisioning failed.',
        code: commerceProvisionErrorCode(error),
      },
      { status: status === 500 ? 503 : status },
    )
  }
}
