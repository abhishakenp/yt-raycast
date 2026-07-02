import type { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import type { GeneratedCommerceProduct } from '../services/generated-commerce-products'
import {
  getMedusaAdminApiToken,
  getMedusaAdminEmail,
  getMedusaAdminPassword,
  type MedusaEnv,
} from './medusa-store-env'
import { syncGeneratedProductsToMedusa } from './medusa-product-sync'

type FetchLike = typeof fetch
type CommerceApiClient = Pick<ConvexHttpClient, 'query' | 'mutation'>

export type MedusaTenantProvisionInput = {
  deploymentSlug: string
  fetch?: FetchLike
}

export type MedusaTenantProvisionResult = {
  provider: string
  providerTenantId?: string
  backendUrl: string
  adminUrl: string
  storefrontUrl: string
  publishableKey?: string
  databaseRef?: string
  secretRef?: string
  webhookSecret?: string
}

export type MedusaTenantProvisioner = {
  provision: (
    input: MedusaTenantProvisionInput,
  ) => Promise<MedusaTenantProvisionResult>
  syncInitialProducts?: (input: {
    deploymentSlug: string
    fetch: FetchLike
    products: Array<GeneratedCommerceProduct>
    tenant: MedusaTenantProvisionResult
  }) => Promise<{
    publishableKey?: string
    synced: number
  }>
}

type CommerceTenantConfig = {
  tenantId: string
  deploymentId: string
  deploymentSlug: string
  sessionId: string
  provider: string
  providerTenantId?: string
  status: string
  syncStatus: string
  backendUrl: string
  adminUrl: string
  storefrontUrl: string
  publishableKey?: string
  productCount?: number
  lastPullAt?: number
  lastWebhookAt?: number
  lastHealthCheckAt?: number
  errorMessage?: string
  createdAt: number
  updatedAt: number
}

type DeploymentProduct = {
  currencyCode?: string
  description?: string
  handle: string
  price?: number
  title: string
}

type PullSource = 'manual' | 'webhook'

type PullOptions = {
  anonymousOwnerSecret?: string
  fetch?: FetchLike
  source: PullSource
  webhookSecret?: string
}

type WebhookOptions = {
  env?: MedusaEnv
  fetch?: FetchLike
}

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

const createClient = (clientOverride?: CommerceApiClient): CommerceApiClient =>
  clientOverride ?? createRuntimeConvexHttpClient()

const trim = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

const normalizeBackendUrl = (backendUrl: string): string =>
  backendUrl.replace(/\/+$/, '')

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const stringValue = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined

const numberValue = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined

const interpolateTenantTemplate = (
  template: string,
  deploymentSlug: string,
): string => {
  const encodedSlug = encodeURIComponent(deploymentSlug)
  return template
    .replaceAll('{deploymentSlug}', encodedSlug)
    .replaceAll('{slug}', encodedSlug)
    .replaceAll('{tenantId}', encodedSlug)
}

const readTenantEnvValue = (
  env: MedusaEnv,
  deploymentSlug: string,
  templateKey: string,
  valueKey: string,
): string | undefined => {
  const template = trim(env[templateKey])
  if (template !== undefined) {
    return interpolateTenantTemplate(template, deploymentSlug)
  }
  return trim(env[valueKey])
}

const errorCodeValue = (error: unknown): string | undefined => {
  if (!isRecord(error) || !isRecord(error.data)) return undefined
  return stringValue(error.data.code)
}

const isAccessDeniedError = (error: unknown): boolean => {
  const code = errorCodeValue(error)
  return code === 'AUTH_REQUIRED' || code === 'FORBIDDEN'
}

const isNotFoundError = (error: unknown): boolean =>
  errorCodeValue(error) === 'NOT_FOUND'

const readJsonBody = async (
  request: Request,
): Promise<Record<string, unknown>> => {
  const text = await request.text()
  if (!text.trim()) return {}
  const parsed = JSON.parse(text) as unknown
  return isRecord(parsed) ? parsed : {}
}

const createWebhookSecret = (): string =>
  globalThis.crypto?.randomUUID?.() ??
  `medusa-webhook-${Date.now()}-${Math.random().toString(16).slice(2)}`

const generatedProductValue = (
  value: unknown,
): GeneratedCommerceProduct | undefined => {
  if (!isRecord(value)) return undefined

  const title = stringValue(value.title)
  const handle = stringValue(value.handle)
  const price = numberValue(value.price)
  const description = stringValue(value.description)

  if (!title || !handle || price === undefined) return undefined

  return {
    ...(description === undefined ? {} : { description }),
    handle,
    price,
    title,
  }
}

const readGeneratedProducts = (
  body: Record<string, unknown>,
): Array<GeneratedCommerceProduct> => {
  const products = body.products
  if (!Array.isArray(products)) return []
  return products
    .map(generatedProductValue)
    .filter((product) => product !== undefined)
    .slice(0, 25)
}

const publicTenantConfig = (
  tenant: CommerceTenantConfig,
): CommerceTenantConfig => ({
  tenantId: tenant.tenantId,
  deploymentId: tenant.deploymentId,
  deploymentSlug: tenant.deploymentSlug,
  sessionId: tenant.sessionId,
  provider: tenant.provider,
  providerTenantId: tenant.providerTenantId,
  status: tenant.status,
  syncStatus: tenant.syncStatus,
  backendUrl: tenant.backendUrl,
  adminUrl: tenant.adminUrl,
  storefrontUrl: tenant.storefrontUrl,
  publishableKey: tenant.publishableKey,
  productCount: tenant.productCount,
  lastPullAt: tenant.lastPullAt,
  lastWebhookAt: tenant.lastWebhookAt,
  lastHealthCheckAt: tenant.lastHealthCheckAt,
  errorMessage: tenant.errorMessage,
  createdAt: tenant.createdAt,
  updatedAt: tenant.updatedAt,
})

const loadTenantConfig = async (
  deploymentSlug: string,
  clientOverride?: CommerceApiClient,
): Promise<CommerceTenantConfig | null> =>
  (await createClient(clientOverride).query(
    api.sessions.getCommerceTenantByDeploymentSlug,
    { deploymentSlug },
  )) as CommerceTenantConfig | null

const loadOwnedTenantConfig = async (
  deploymentSlug: string,
  anonymousOwnerSecret: string | undefined,
  clientOverride?: CommerceApiClient,
): Promise<CommerceTenantConfig | null> =>
  (await createClient(clientOverride).query(
    api.sessions.getOwnedCommerceTenantByDeploymentSlug,
    { anonymousOwnerSecret, deploymentSlug },
  )) as CommerceTenantConfig | null

const loadWebhookTenantConfig = async (
  deploymentSlug: string,
  webhookSecret: string | undefined,
  clientOverride?: CommerceApiClient,
): Promise<CommerceTenantConfig | null> =>
  (await createClient(clientOverride).query(
    api.sessions.getCommerceTenantByDeploymentSlugForWebhook,
    { deploymentSlug, webhookSecret },
  )) as CommerceTenantConfig | null

const loadPullTenantConfig = async (
  deploymentSlug: string,
  options: PullOptions,
  clientOverride?: CommerceApiClient,
): Promise<CommerceTenantConfig | null> =>
  options.source === 'manual'
    ? await loadOwnedTenantConfig(
        deploymentSlug,
        options.anonymousOwnerSecret,
        clientOverride,
      )
    : await loadWebhookTenantConfig(
        deploymentSlug,
        options.webhookSecret,
        clientOverride,
      )

const accessDeniedStatusFor = (source: PullSource): number =>
  source === 'webhook' ? 401 : 403

const createAccessDeniedPullResponse = (
  deploymentSlug: string,
  source: PullSource,
) =>
  json(
    {
      deploymentSlug,
      error: 'Commerce tenant access denied.',
      source,
    },
    { status: accessDeniedStatusFor(source) },
  )

const createAccessDeniedProvisionResponse = (deploymentSlug: string) =>
  json(
    {
      deploymentSlug,
      error: 'Commerce tenant access denied.',
    },
    { status: 403 },
  )

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

const normalizeTenantProduct = (
  value: unknown,
): DeploymentProduct | undefined => {
  if (!isRecord(value)) return undefined

  const title = stringValue(value.title)
  const handle = stringValue(value.handle)
  if (!title || !handle) return undefined

  const description = stringValue(value.description)

  return {
    ...(description === undefined ? {} : { description }),
    ...readProductPrice(value),
    handle,
    title,
  }
}

const readTenantProducts = async ({
  fetchImpl,
  tenant,
}: {
  fetchImpl: FetchLike
  tenant: CommerceTenantConfig
}): Promise<Array<DeploymentProduct>> => {
  const publishableKey = trim(tenant.publishableKey)
  if (publishableKey === undefined) {
    throw new Error('Medusa tenant publishable key is not configured.')
  }

  const backendUrl = normalizeBackendUrl(tenant.backendUrl)
  const regionId = await readDefaultRegionId({
    backendUrl,
    fetchImpl,
    publishableKey,
  })
  const regionQuery =
    regionId === undefined ? '' : `&region_id=${encodeURIComponent(regionId)}`
  const response = await fetchImpl(
    `${backendUrl}/store/products?limit=100${regionQuery}&fields=${encodeURIComponent(
      '*variants.calculated_price',
    )}`,
    {
      headers: { 'x-publishable-api-key': publishableKey },
    },
  )

  if (!response.ok) {
    throw new Error(
      `Medusa Store API product read failed (${response.status}).`,
    )
  }

  const payload = (await response.json()) as { products?: unknown }
  if (!Array.isArray(payload.products)) {
    throw new Error('Medusa Store API product read failed.')
  }

  return payload.products
    .map(normalizeTenantProduct)
    .filter((product) => product !== undefined)
}

const externalProvisionResultValue = (
  value: unknown,
  deploymentSlug: string,
): MedusaTenantProvisionResult | undefined => {
  if (!isRecord(value)) return undefined

  const backendUrl = stringValue(value.backendUrl)
  const adminUrl = stringValue(value.adminUrl)
  const storefrontUrl = stringValue(value.storefrontUrl)
  if (!backendUrl || !adminUrl || !storefrontUrl) return undefined

  return {
    adminUrl,
    backendUrl,
    databaseRef: stringValue(value.databaseRef),
    provider: stringValue(value.provider) ?? 'external-medusa',
    providerTenantId: stringValue(value.providerTenantId) ?? deploymentSlug,
    publishableKey: stringValue(value.publishableKey),
    secretRef: stringValue(value.secretRef),
    storefrontUrl,
    webhookSecret: stringValue(value.webhookSecret),
  }
}

const provisionExternalMedusaTenant = async ({
  deploymentSlug,
  fetchImpl,
  provisionToken,
  provisionUrl,
}: {
  deploymentSlug: string
  fetchImpl: FetchLike
  provisionToken?: string
  provisionUrl: string
}): Promise<MedusaTenantProvisionResult> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (provisionToken !== undefined) {
    headers.Authorization = `Bearer ${provisionToken}`
  }

  const response = await fetchImpl(provisionUrl, {
    body: JSON.stringify({ deploymentSlug }),
    headers,
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Medusa tenant provisioner failed (${response.status}).`)
  }

  const result = externalProvisionResultValue(
    (await response.json()) as unknown,
    deploymentSlug,
  )
  if (result === undefined) {
    throw new Error('Medusa tenant provisioner returned an invalid payload.')
  }

  return result
}

export const createConfiguredMedusaTenantProvisioner = (
  env: MedusaEnv = {},
): MedusaTenantProvisioner => ({
  provision: async ({ deploymentSlug, fetch: fetchImpl }) => {
    const provisionUrl = trim(env.MEDUSA_TENANT_PROVISION_URL)
    if (provisionUrl !== undefined) {
      return await provisionExternalMedusaTenant({
        deploymentSlug,
        fetchImpl: fetchImpl ?? fetch,
        provisionToken: trim(env.MEDUSA_TENANT_PROVISION_TOKEN),
        provisionUrl,
      })
    }

    const backendUrl = readTenantEnvValue(
      env,
      deploymentSlug,
      'MEDUSA_TENANT_BACKEND_URL_TEMPLATE',
      'MEDUSA_TENANT_BACKEND_URL',
    )
    const adminUrl = readTenantEnvValue(
      env,
      deploymentSlug,
      'MEDUSA_TENANT_ADMIN_URL_TEMPLATE',
      'MEDUSA_TENANT_ADMIN_URL',
    )
    const storefrontUrl = readTenantEnvValue(
      env,
      deploymentSlug,
      'MEDUSA_TENANT_STOREFRONT_URL_TEMPLATE',
      'MEDUSA_TENANT_STOREFRONT_URL',
    )

    if (
      backendUrl === undefined ||
      adminUrl === undefined ||
      storefrontUrl === undefined
    ) {
      throw new Error('Configured Medusa tenant URLs are not available.')
    }

    return {
      adminUrl,
      backendUrl,
      databaseRef: trim(env.MEDUSA_TENANT_DATABASE_REF),
      provider: 'configured-medusa',
      providerTenantId: deploymentSlug,
      publishableKey: trim(env.MEDUSA_TENANT_PUBLISHABLE_KEY),
      secretRef: trim(env.MEDUSA_TENANT_SECRET_REF),
      storefrontUrl,
      webhookSecret: trim(env.MEDUSA_TENANT_WEBHOOK_SECRET),
    }
  },
  syncInitialProducts: async ({
    deploymentSlug,
    fetch: fetchImpl,
    products,
    tenant,
  }) => {
    if (products.length === 0) return { synced: 0 }
    const result = await syncGeneratedProductsToMedusa({
      adminApiToken: getMedusaAdminApiToken(env, {}),
      adminEmail: getMedusaAdminEmail(env, {}),
      adminPassword: getMedusaAdminPassword(env, {}),
      backendUrl: tenant.backendUrl,
      fetch: fetchImpl,
      products,
      sessionId: deploymentSlug,
    })

    return {
      publishableKey: result.tenant?.publishableKey,
      synced: result.synced,
    }
  },
})

export const createDeploymentMedusaConfigResponse = async (
  deploymentSlug: string,
  clientOverride?: CommerceApiClient,
): Promise<Response> => {
  try {
    const config = await loadTenantConfig(deploymentSlug, clientOverride)

    return json({
      enabled: config?.status === 'ready',
      deploymentSlug,
      config: config === null ? null : publicTenantConfig(config),
    })
  } catch {
    return json(
      { error: 'Commerce tenant configuration is unavailable.' },
      { status: 503 },
    )
  }
}

export const createDeploymentMedusaProvisionResponse = async (
  deploymentSlug: string,
  request: Request,
  clientOverride?: CommerceApiClient,
  provisioner: MedusaTenantProvisioner = createConfiguredMedusaTenantProvisioner(
    process.env,
  ),
): Promise<Response> => {
  try {
    const body = await readJsonBody(request)
    const anonymousOwnerSecret = stringValue(body.anonymousOwnerSecret)
    const generatedProducts = readGeneratedProducts(body)
    const client = createClient(clientOverride)

    await client.query(api.sessions.authorizeCommerceTenantProvision, {
      anonymousOwnerSecret,
      deploymentSlug,
    })

    const tenant = await provisioner.provision({ deploymentSlug, fetch })
    const productSync =
      generatedProducts.length > 0 && provisioner.syncInitialProducts
        ? await provisioner.syncInitialProducts({
            deploymentSlug,
            fetch,
            products: generatedProducts,
            tenant,
          })
        : { synced: 0 }
    const publishableKey = productSync.publishableKey ?? tenant.publishableKey
    const webhookSecret = tenant.webhookSecret ?? createWebhookSecret()

    const result = await client.mutation(api.sessions.upsertCommerceTenant, {
      anonymousOwnerSecret,
      adminUrl: tenant.adminUrl,
      backendUrl: tenant.backendUrl,
      databaseRef: tenant.databaseRef,
      deploymentSlug,
      provider: tenant.provider,
      providerTenantId: tenant.providerTenantId,
      productCount: productSync.synced,
      publishableKey,
      secretRef: tenant.secretRef,
      storefrontUrl: tenant.storefrontUrl,
      webhookSecret,
    })

    return json({
      ...result,
      deploymentSlug,
      status: 'ready',
      tenant: {
        adminUrl: tenant.adminUrl,
        backendUrl: tenant.backendUrl,
        provider: tenant.provider,
        providerTenantId: tenant.providerTenantId,
        publishableKey,
        storefrontUrl: tenant.storefrontUrl,
      },
      syncedProducts: productSync.synced,
      webhook: {
        secret: webhookSecret,
        url: `/api/deployments/${encodeURIComponent(deploymentSlug)}/medusa-webhook`,
      },
    })
  } catch (error) {
    if (isAccessDeniedError(error)) {
      return createAccessDeniedProvisionResponse(deploymentSlug)
    }
    if (isNotFoundError(error)) {
      return json({ error: 'Deployment not found.' }, { status: 404 })
    }

    return json(
      { error: 'Commerce tenant provisioning failed.' },
      { status: 503 },
    )
  }
}

export const createDeploymentMedusaProductsResponse = async (
  deploymentSlug: string,
  options: { fetch?: FetchLike } = {},
  clientOverride?: CommerceApiClient,
): Promise<Response> => {
  try {
    const tenant = await loadTenantConfig(deploymentSlug, clientOverride)
    if (tenant === null || tenant.status !== 'ready') {
      return json({
        deploymentSlug,
        products: [],
        warning: 'Commerce tenant is not configured.',
      })
    }

    const products = await readTenantProducts({
      fetchImpl: options.fetch ?? fetch,
      tenant,
    })

    return json({ deploymentSlug, products })
  } catch {
    return json(
      {
        deploymentSlug,
        products: [],
        warning: 'Medusa tenant product read failed.',
      },
      { status: 200 },
    )
  }
}

export const createDeploymentMedusaPullResponse = async (
  deploymentSlug: string,
  options: PullOptions,
  clientOverride?: CommerceApiClient,
): Promise<Response> => {
  let tenant: CommerceTenantConfig | null

  try {
    tenant = await loadPullTenantConfig(deploymentSlug, options, clientOverride)
  } catch (error) {
    if (isAccessDeniedError(error)) {
      return createAccessDeniedPullResponse(deploymentSlug, options.source)
    }

    return json(
      {
        deploymentSlug,
        error: 'Commerce tenant configuration is unavailable.',
        source: options.source,
      },
      { status: 503 },
    )
  }

  if (tenant === null || tenant.status !== 'ready') {
    return json(
      { error: 'Commerce tenant is not configured.' },
      { status: 404 },
    )
  }

  try {
    const products = await readTenantProducts({
      fetchImpl: options.fetch ?? fetch,
      tenant,
    })

    await createClient(clientOverride).mutation(
      api.sessions.recordCommerceTenantPull,
      {
        deploymentSlug,
        anonymousOwnerSecret: options.anonymousOwnerSecret,
        productCount: products.length,
        source: options.source,
        webhookSecret: options.webhookSecret,
      },
    )

    return json({
      deploymentSlug,
      productCount: products.length,
      products,
      source: options.source,
      status: 'ready',
    })
  } catch {
    await createClient(clientOverride)
      .mutation(api.sessions.recordCommerceTenantPull, {
        deploymentSlug,
        anonymousOwnerSecret: options.anonymousOwnerSecret,
        errorMessage: 'Medusa tenant product pull failed.',
        source: options.source,
        webhookSecret: options.webhookSecret,
      })
      .catch(() => null)

    return json(
      {
        deploymentSlug,
        error: 'Medusa tenant product pull failed.',
        source: options.source,
        status: 'degraded',
      },
      { status: 502 },
    )
  }
}

export const createDeploymentMedusaWebhookResponse = async (
  deploymentSlug: string,
  request: Request,
  clientOverride?: CommerceApiClient,
  options: WebhookOptions = {},
): Promise<Response> => {
  const expectedSecret = trim(options.env?.MEDUSA_WEBHOOK_SECRET)
  const receivedSecret = trim(
    request.headers.get('x-ship-fast-commerce-webhook-secret') ?? undefined,
  )

  if (expectedSecret !== undefined && receivedSecret !== expectedSecret) {
    return json({ error: 'Invalid commerce webhook secret.' }, { status: 401 })
  }

  return await createDeploymentMedusaPullResponse(
    deploymentSlug,
    {
      fetch: options.fetch,
      source: 'webhook',
      webhookSecret: receivedSecret,
    },
    clientOverride,
  )
}
