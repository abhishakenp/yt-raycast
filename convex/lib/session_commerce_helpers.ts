import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { assertCanMutateSession } from './session_access_helpers'

type CommerceMutationCtx = MutationCtx
type CommerceQueryCtx = Pick<QueryCtx, 'db'>

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

export const serializeCommerceConfig = (config: Doc<'commerceConfigs'>) => ({
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
})

const loadCommerceConfigDoc = async (
  ctx: CommerceQueryCtx,
  sessionId: Id<'sessions'>,
) =>
  await ctx.db
    .query('commerceConfigs')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
    .first()

export const upsertSessionCommerceConfig = async (
  ctx: CommerceMutationCtx,
  args: UpsertSessionCommerceConfigInput,
) => {
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
      backendUrl: args.backendUrl,
      adminUrl: args.adminUrl,
      storefrontUrl: args.storefrontUrl,
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
      backendUrl: args.backendUrl,
      adminUrl: args.adminUrl,
      storefrontUrl: args.storefrontUrl,
      configJson: args.configJson,
      errorMessage: args.errorMessage,
      productCount: args.productCount,
      createdAt: now,
      updatedAt: now,
    })
  }

  return { sessionId: args.sessionId }
}

export const loadSessionCommerceConfig = async (
  ctx: CommerceQueryCtx,
  sessionId: Id<'sessions'>,
) => {
  const config = await loadCommerceConfigDoc(ctx, sessionId)
  return config === null ? null : serializeCommerceConfig(config)
}

export const provisionSessionMedusaTenant = async (
  ctx: CommerceMutationCtx,
  args: ProvisionMedusaTenantInput,
) => {
  const now = Date.now()
  const existingConfig = await loadCommerceConfigDoc(ctx, args.sessionId)

  if (existingConfig !== null) {
    await ctx.db.patch(existingConfig._id, {
      backendUrl: args.backendUrl,
      adminUrl: args.adminUrl,
      storefrontUrl: args.storefrontUrl,
      updatedAt: now,
    })
  } else {
    await ctx.db.insert('commerceConfigs', {
      sessionId: args.sessionId,
      status: 'ready',
      backendUrl: args.backendUrl,
      adminUrl: args.adminUrl,
      storefrontUrl: args.storefrontUrl,
      productCount: 0,
      createdAt: now,
      updatedAt: now,
    })
  }

  return { success: true }
}

export const syncSessionMedusaProducts = async (
  ctx: CommerceMutationCtx,
  args: SyncMedusaProductsInput,
) => {
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
