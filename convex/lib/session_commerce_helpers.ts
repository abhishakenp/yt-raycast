import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import {
  assertCanMutateSession,
  canReadPrivateSession,
  hashOwnerSecret,
} from './session_access_helpers'

type CommerceMutationCtx = MutationCtx
type CommerceQueryCtx = Pick<QueryCtx, 'auth' | 'db'>

function assertNonNegativeInteger(
  value: number | undefined,
  field: string,
): void {
  if (value === undefined) return

  if (!Number.isSafeInteger(value) || value < 0) {
    throw new ConvexError({
      code: 'INVALID_ARGUMENT',
      message: `${field} must be a non-negative integer`,
    })
  }
}

function normalizeWebUrl(value: string, field: string): string {
  const normalized = value.trim()

  try {
    const url = new URL(normalized)
    if (
      (url.protocol !== 'http:' && url.protocol !== 'https:') ||
      url.hostname.length === 0 ||
      url.username.length > 0 ||
      url.password.length > 0
    ) {
      throw new Error('Unsupported URL')
    }
  } catch {
    throw new ConvexError({
      code: 'INVALID_ARGUMENT',
      message: `${field} must be a valid HTTP(S) URL without credentials`,
    })
  }

  return normalized
}

function normalizeOptionalWebUrl(
  value: string | undefined,
  field: string,
): string | undefined {
  return value === undefined ? undefined : normalizeWebUrl(value, field)
}

export type UpsertSessionCommerceConfigInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  backendUrl?: string
  adminUrl?: string
  storefrontUrl?: string
  configJson?: string
  errorMessage?: string
  productCount?: number
}

export type ProvisionMedusaTenantInput = {
  sessionId: Id<'sessions'>
  backendUrl: string
  adminUrl: string
  storefrontUrl: string
}

export type UpsertDeploymentCommerceTenantInput = {
  deploymentSlug: string
  anonymousOwnerSecret?: string
  provider: string
  providerTenantId?: string
  backendUrl: string
  adminUrl: string
  storefrontUrl: string
  publishableKey?: string
  databaseRef?: string
  secretRef?: string
  webhookSecret?: string
  productCount?: number
}

export type RecordDeploymentCommerceTenantPullInput = {
  deploymentSlug: string
  anonymousOwnerSecret?: string
  source: 'manual' | 'webhook'
  webhookSecret?: string
  productCount?: number
  errorMessage?: string
}

export type OwnedDeploymentCommerceTenantInput = {
  deploymentSlug: string
  anonymousOwnerSecret?: string
}

export type WebhookDeploymentCommerceTenantInput = {
  deploymentSlug: string
  webhookSecret?: string
}

export type AuthorizedDeploymentCommerceTenantProvision = {
  deploymentId: Id<'deployments'>
  deploymentSlug: string
  sessionId: Id<'sessions'>
}

export type SyncMedusaProductsInput = {
  sessionId: Id<'sessions'>
  products: Array<{
    id: string
    title: string
    handle: string
    price: number
    description?: string
  }>
}

export function serializeCommerceConfig(config: Doc<'commerceConfigs'>) {
  return {
    configId: config._id,
    status: config.status,
    backendUrl: config.backendUrl,
    adminUrl: config.adminUrl,
    storefrontUrl: config.storefrontUrl,
    productCount: config.productCount,
    configJson: config.configJson,
    errorMessage: config.errorMessage,
    createdAt: config.createdAt,
    updatedAt: config.updatedAt,
  }
}

export function serializeCommerceTenant(tenant: Doc<'commerceTenants'>) {
  return {
    tenantId: tenant._id,
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

async function loadCommerceConfigDoc(
  ctx: CommerceQueryCtx,
  sessionId: Id<'sessions'>,
) {
  return await ctx.db
    .query('commerceConfigs')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
    .first()
}

async function loadDeploymentDocBySlug(
  ctx: CommerceQueryCtx,
  deploymentSlug: string,
) {
  return await ctx.db
    .query('deployments')
    .withIndex('by_slug', (index) => index.eq('slug', deploymentSlug))
    .first()
}

async function loadCommerceTenantByDeploymentId(
  ctx: CommerceQueryCtx,
  deploymentId: Id<'deployments'>,
) {
  return await ctx.db
    .query('commerceTenants')
    .withIndex('by_deploymentId', (index) =>
      index.eq('deploymentId', deploymentId),
    )
    .first()
}

async function loadDeploymentTenantPair(
  ctx: CommerceQueryCtx,
  deploymentSlug: string,
) {
  const deployment = await loadDeploymentDocBySlug(ctx, deploymentSlug)
  if (deployment === null) return { deployment: null, tenant: null }
  const tenant = await loadCommerceTenantByDeploymentId(ctx, deployment._id)
  return { deployment, tenant }
}

export async function upsertSessionCommerceConfig(
  ctx: CommerceMutationCtx,
  args: UpsertSessionCommerceConfigInput,
) {
  assertNonNegativeInteger(args.productCount, 'productCount')
  const backendUrl = normalizeOptionalWebUrl(args.backendUrl, 'backendUrl')
  const adminUrl = normalizeOptionalWebUrl(args.adminUrl, 'adminUrl')
  const storefrontUrl = normalizeOptionalWebUrl(
    args.storefrontUrl,
    'storefrontUrl',
  )
  const session = await ctx.db.get(args.sessionId)
  const now = Date.now()

  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

  const existing = await loadCommerceConfigDoc(ctx, args.sessionId)

  if (existing !== null) {
    await ctx.db.patch(existing._id, {
      backendUrl,
      adminUrl,
      storefrontUrl,
      configJson: args.configJson,
      errorMessage: args.errorMessage,
      productCount: args.productCount,
      status: 'ready',
      updatedAt: now,
    })
  } else {
    await ctx.db.insert('commerceConfigs', {
      sessionId: args.sessionId,
      status: 'ready',
      backendUrl,
      adminUrl,
      storefrontUrl,
      configJson: args.configJson,
      errorMessage: args.errorMessage,
      productCount: args.productCount,
      createdAt: now,
      updatedAt: now,
    })
  }

  return { sessionId: args.sessionId }
}

export async function loadSessionCommerceConfig(
  ctx: CommerceQueryCtx,
  sessionId: Id<'sessions'>,
) {
  const session = await ctx.db.get(sessionId)
  if (
    session === null ||
    session.deletedAt !== undefined ||
    (session.isPrivate === true && !(await canReadPrivateSession(ctx, session)))
  ) {
    return null
  }

  const config = await loadCommerceConfigDoc(ctx, sessionId)
  return config === null ? null : serializeCommerceConfig(config)
}

export async function loadDeploymentCommerceTenantBySlug(
  ctx: CommerceQueryCtx,
  deploymentSlug: string,
) {
  const { tenant } = await loadDeploymentTenantPair(ctx, deploymentSlug)
  return tenant === null ? null : serializeCommerceTenant(tenant)
}

export async function authorizeDeploymentCommerceTenantProvision(
  ctx: CommerceQueryCtx,
  args: OwnedDeploymentCommerceTenantInput,
): Promise<AuthorizedDeploymentCommerceTenantProvision> {
  const deployment = await loadDeploymentDocBySlug(ctx, args.deploymentSlug)
  deployment !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Deployment not found',
      })
    })()

  const session = await ctx.db.get(deployment.sessionId)
  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

  return {
    deploymentId: deployment._id,
    deploymentSlug: deployment.slug,
    sessionId: deployment.sessionId,
  }
}

async function assertDeploymentCommerceTenantWebhookSecret(
  tenant: Doc<'commerceTenants'>,
  webhookSecret: string | undefined,
) {
  const webhookSecretHash =
    webhookSecret === undefined
      ? undefined
      : await hashOwnerSecret(webhookSecret)

  if (
    tenant.webhookSecretHash === undefined ||
    webhookSecretHash !== tenant.webhookSecretHash
  ) {
    throw new ConvexError({
      code: 'FORBIDDEN',
      message: 'Invalid commerce webhook secret',
    })
  }
}

export async function loadOwnedDeploymentCommerceTenantBySlug(
  ctx: CommerceQueryCtx,
  args: OwnedDeploymentCommerceTenantInput,
) {
  const { deployment, tenant } = await loadDeploymentTenantPair(
    ctx,
    args.deploymentSlug,
  )

  if (deployment === null || tenant === null) return null

  const session = await ctx.db.get(deployment.sessionId)
  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

  return serializeCommerceTenant(tenant)
}

export async function loadDeploymentCommerceTenantBySlugForWebhook(
  ctx: CommerceQueryCtx,
  args: WebhookDeploymentCommerceTenantInput,
) {
  const { deployment, tenant } = await loadDeploymentTenantPair(
    ctx,
    args.deploymentSlug,
  )

  if (deployment === null || tenant === null) return null

  await assertDeploymentCommerceTenantWebhookSecret(tenant, args.webhookSecret)

  return serializeCommerceTenant(tenant)
}

export async function upsertDeploymentCommerceTenant(
  ctx: CommerceMutationCtx,
  args: UpsertDeploymentCommerceTenantInput,
) {
  assertNonNegativeInteger(args.productCount, 'productCount')
  const provider = args.provider.trim()
  if (provider.length === 0) {
    throw new ConvexError({
      code: 'INVALID_ARGUMENT',
      message: 'provider must not be blank',
    })
  }
  const backendUrl = normalizeWebUrl(args.backendUrl, 'backendUrl')
  const adminUrl = normalizeWebUrl(args.adminUrl, 'adminUrl')
  const storefrontUrl = normalizeWebUrl(args.storefrontUrl, 'storefrontUrl')
  const deployment = await loadDeploymentDocBySlug(ctx, args.deploymentSlug)
  const now = Date.now()

  deployment !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Deployment not found',
      })
    })()

  const session = await ctx.db.get(deployment.sessionId)
  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

  const existing = await loadCommerceTenantByDeploymentId(ctx, deployment._id)
  const webhookSecretHash =
    args.webhookSecret === undefined
      ? existing?.webhookSecretHash
      : await hashOwnerSecret(args.webhookSecret)
  const readyStatus: Doc<'commerceTenants'>['status'] = 'ready'
  const initialSyncStatus: Doc<'commerceTenants'>['syncStatus'] =
    existing?.syncStatus ?? 'idle'
  const patch = {
    deploymentId: deployment._id,
    sessionId: deployment.sessionId,
    deploymentSlug: deployment.slug,
    provider,
    providerTenantId: args.providerTenantId,
    status: readyStatus,
    syncStatus: initialSyncStatus,
    backendUrl,
    adminUrl,
    storefrontUrl,
    publishableKey: args.publishableKey,
    databaseRef: args.databaseRef,
    secretRef: args.secretRef,
    webhookSecretHash,
    productCount: args.productCount ?? existing?.productCount ?? 0,
    errorMessage: undefined,
    updatedAt: now,
  }

  existing === null
    ? await ctx.db.insert('commerceTenants', {
        ...patch,
        createdAt: now,
      })
    : await ctx.db.patch(existing._id, patch)

  return {
    deploymentId: deployment._id,
    deploymentSlug: deployment.slug,
    sessionId: deployment.sessionId,
    status: readyStatus,
  }
}

export async function recordDeploymentCommerceTenantPull(
  ctx: CommerceMutationCtx,
  args: RecordDeploymentCommerceTenantPullInput,
) {
  assertNonNegativeInteger(args.productCount, 'productCount')
  const { deployment, tenant } = await loadDeploymentTenantPair(
    ctx,
    args.deploymentSlug,
  )
  const now = Date.now()

  deployment !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Deployment not found',
      })
    })()
  tenant !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_CONFIGURED',
        message: 'Deployment commerce tenant not found',
      })
    })()

  if (args.source === 'manual') {
    const session = await ctx.db.get(deployment.sessionId)
    session !== null ||
      (() => {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      })()
    await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)
  } else {
    await assertDeploymentCommerceTenantWebhookSecret(
      tenant,
      args.webhookSecret,
    )
  }

  const failed = args.errorMessage !== undefined
  const pullStatus: Doc<'commerceTenants'>['status'] = failed
    ? 'degraded'
    : 'ready'
  await ctx.db.patch(tenant._id, {
    ...(args.productCount === undefined
      ? {}
      : { productCount: args.productCount }),
    ...(args.source === 'manual'
      ? { lastPullAt: now }
      : { lastWebhookAt: now }),
    errorMessage: args.errorMessage,
    status: pullStatus,
    syncStatus: failed ? 'failed' : 'ready',
    updatedAt: now,
  })

  return {
    deploymentSlug: deployment.slug,
    productCount: args.productCount,
    source: args.source,
    status: pullStatus,
  }
}

export async function provisionSessionMedusaTenant(
  ctx: CommerceMutationCtx,
  args: ProvisionMedusaTenantInput,
) {
  const backendUrl = normalizeWebUrl(args.backendUrl, 'backendUrl')
  const adminUrl = normalizeWebUrl(args.adminUrl, 'adminUrl')
  const storefrontUrl = normalizeWebUrl(args.storefrontUrl, 'storefrontUrl')
  const now = Date.now()
  const existingConfig = await loadCommerceConfigDoc(ctx, args.sessionId)

  if (existingConfig !== null) {
    await ctx.db.patch(existingConfig._id, {
      backendUrl,
      adminUrl,
      storefrontUrl,
      updatedAt: now,
    })
  } else {
    await ctx.db.insert('commerceConfigs', {
      sessionId: args.sessionId,
      status: 'ready',
      backendUrl,
      adminUrl,
      storefrontUrl,
      productCount: 0,
      createdAt: now,
      updatedAt: now,
    })
  }

  return { success: true }
}

export async function syncSessionMedusaProducts(
  ctx: CommerceMutationCtx,
  args: SyncMedusaProductsInput,
) {
  const config = await loadCommerceConfigDoc(ctx, args.sessionId)

  if (config === null) {
    throw new ConvexError({
      code: 'NOT_CONFIGURED',
      message: 'Medusa commerce config not found',
    })
  }

  const now = Date.now()
  await ctx.db.patch(config._id, {
    productCount: args.products.length,
    updatedAt: now,
  })

  return { synced: args.products.length }
}
