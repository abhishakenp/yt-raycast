import type { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import {
  type GeneratedCommerceProduct,
  normalizeGeneratedCommerceProductInput,
} from '../services/generated-commerce-products'
import {
  getMedusaAdminApiToken,
  getMedusaAdminEmail,
  getMedusaAdminPassword,
  type MedusaEnv,
} from './medusa-store-env'
import { syncGeneratedProductsToMedusa } from './medusa-product-sync'
import {
  type MedusaCommerceProduct,
  medusaStoreProductFields,
  normalizeMedusaStoreProduct,
} from './medusa-store-product'

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

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

function createClient(clientOverride?: CommerceApiClient): CommerceApiClient {
  return clientOverride ?? createRuntimeConvexHttpClient()
}

function trim(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
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

function interpolateTenantTemplate(
  template: string,
  deploymentSlug: string,
): string {
  const encodedSlug = encodeURIComponent(deploymentSlug)
  return template
    .replaceAll('{deploymentSlug}', encodedSlug)
    .replaceAll('{slug}', encodedSlug)
    .replaceAll('{tenantId}', encodedSlug)
}

function readTenantEnvValue(
  env: MedusaEnv,
  deploymentSlug: string,
  templateKey: string,
  valueKey: string,
): string | undefined {
  const template = trim(env[templateKey])
  if (template !== undefined) {
    return interpolateTenantTemplate(template, deploymentSlug)
  }
  return trim(env[valueKey])
}

function errorCodeValue(error: unknown): string | undefined {
  if (!isRecord(error) || !isRecord(error.data)) return undefined
  return stringValue(error.data.code)
}

function isAccessDeniedError(error: unknown): boolean {
  const code = errorCodeValue(error)
  return code === 'AUTH_REQUIRED' || code === 'FORBIDDEN'
}

function isNotFoundError(error: unknown): boolean {
  return errorCodeValue(error) === 'NOT_FOUND'
}

async function readJsonBody(
  request: Request,
): Promise<Record<string, unknown>> {
  const text = await request.text()
  if (!text.trim()) return {}
  const parsed = JSON.parse(text) as unknown
  return isRecord(parsed) ? parsed : {}
}

function createWebhookSecret(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `medusa-webhook-${Date.now()}-${Math.random().toString(16).slice(2)}`
  )
}

function generatedProductValue(
  value: unknown,
): GeneratedCommerceProduct | undefined {
  return normalizeGeneratedCommerceProductInput(value)
}

function readGeneratedProducts(
  body: Record<string, unknown>,
): Array<GeneratedCommerceProduct> {
  const products = body.products
  if (!Array.isArray(products)) return []
  return products
    .map(generatedProductValue)
    .filter((product) => product !== undefined)
    .slice(0, 25)
}

function publicTenantConfig(
  tenant: CommerceTenantConfig,
): CommerceTenantConfig {
  return {
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
  }
}

async function loadTenantConfig(
  deploymentSlug: string,
  clientOverride?: CommerceApiClient,
): Promise<CommerceTenantConfig | null> {
  return (await createClient(clientOverride).query(
    api.sessions.getCommerceTenantByDeploymentSlug,
    { deploymentSlug },
  )) as CommerceTenantConfig | null
}

async function loadOwnedTenantConfig(
  deploymentSlug: string,
  anonymousOwnerSecret: string | undefined,
  clientOverride?: CommerceApiClient,
): Promise<CommerceTenantConfig | null> {
  return (await createClient(clientOverride).query(
    api.sessions.getOwnedCommerceTenantByDeploymentSlug,
    { anonymousOwnerSecret, deploymentSlug },
  )) as CommerceTenantConfig | null
}

async function loadWebhookTenantConfig(
  deploymentSlug: string,
  webhookSecret: string | undefined,
  clientOverride?: CommerceApiClient,
): Promise<CommerceTenantConfig | null> {
  return (await createClient(clientOverride).query(
    api.sessions.getCommerceTenantByDeploymentSlugForWebhook,
    { deploymentSlug, webhookSecret },
  )) as CommerceTenantConfig | null
}

async function loadPullTenantConfig(
  deploymentSlug: string,
  options: PullOptions,
  clientOverride?: CommerceApiClient,
): Promise<CommerceTenantConfig | null> {
  return options.source === 'manual'
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
}

function accessDeniedStatusFor(source: PullSource): number {
  return source === 'webhook' ? 401 : 403
}

function createAccessDeniedPullResponse(
  deploymentSlug: string,
  source: PullSource,
) {
  return json(
    {
      deploymentSlug,
      error: 'Commerce tenant access denied.',
      source,
    },
    { status: accessDeniedStatusFor(source) },
  )
}

function createAccessDeniedProvisionResponse(deploymentSlug: string) {
  return json(
    {
      deploymentSlug,
      error: 'Commerce tenant access denied.',
    },
    { status: 403 },
  )
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

async function readTenantProducts({
  fetchImpl,
  tenant,
}: {
  fetchImpl: FetchLike
  tenant: CommerceTenantConfig
}): Promise<Array<MedusaCommerceProduct>> {
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
      medusaStoreProductFields,
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
    .map((product) =>
      normalizeMedusaStoreProduct(tenant.deploymentSlug, product),
    )
    .filter((product) => product !== undefined)
}

function externalProvisionResultValue(
  value: unknown,
  deploymentSlug: string,
): MedusaTenantProvisionResult | undefined {
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

async function provisionExternalMedusaTenant({
  deploymentSlug,
  fetchImpl,
  provisionToken,
  provisionUrl,
}: {
  deploymentSlug: string
  fetchImpl: FetchLike
  provisionToken?: string
  provisionUrl: string
}): Promise<MedusaTenantProvisionResult> {
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

export function createConfiguredMedusaTenantProvisioner(
  env: MedusaEnv = {},
): MedusaTenantProvisioner {
  return {
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
  }
}

export async function createDeploymentMedusaConfigResponse(
  deploymentSlug: string,
  clientOverride?: CommerceApiClient,
): Promise<Response> {
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

export async function createDeploymentMedusaProvisionResponse(
  deploymentSlug: string,
  request: Request,
  clientOverride?: CommerceApiClient,
  provisioner: MedusaTenantProvisioner = createConfiguredMedusaTenantProvisioner(
    process.env,
  ),
): Promise<Response> {
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

export async function createDeploymentMedusaProductsResponse(
  deploymentSlug: string,
  options: { fetch?: FetchLike } = {},
  clientOverride?: CommerceApiClient,
): Promise<Response> {
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

export async function createDeploymentMedusaPullResponse(
  deploymentSlug: string,
  options: PullOptions,
  clientOverride?: CommerceApiClient,
): Promise<Response> {
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

export async function createDeploymentMedusaWebhookResponse(
  deploymentSlug: string,
  request: Request,
  clientOverride?: CommerceApiClient,
  options: WebhookOptions = {},
): Promise<Response> {
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
