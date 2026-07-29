import { ConvexError } from 'convex/values'
import {
  importAdminSsoPrivateKey,
  signAdminSsoToken,
} from '../../src/features/commerce/server/admin-sso-token'
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { getCommerceEntitlementForUser } from './commerce_entitlement'
import {
  ensureCommerceInstanceForOwner,
  ensureCommerceStoreForSession,
  resolveCommerceStoreGatewayBySession,
} from './commerce_instance_helpers'
import { isAuthDisabled } from './session_export_helpers'

type AccessCtx = Pick<QueryCtx | MutationCtx, 'auth' | 'db'>

type OwnerContext = {
  ownerUserId: string
  email: string | undefined
  // Admins (and local dev with Clerk disabled) bypass both the paid
  // entitlement check and per-session ownership check, mirroring the
  // existing superadmin ecommerce-gateway bypass elsewhere in this codebase.
  isPrivileged: boolean
}

async function resolveOwnerContext(
  ctx: AccessCtx,
): Promise<OwnerContext | null> {
  if (isAuthDisabled()) {
    return {
      ownerUserId: 'dev-bypass-user',
      email: 'dev@ship-fast.local',
      isPrivileged: true,
    }
  }

  const identity = await ctx.auth.getUserIdentity()
  if (identity === null) return null

  const ownerUserId = identity.tokenIdentifier ?? identity.subject
  if (ownerUserId === undefined) return null

  const role = identity.system_role ?? identity.systemRole
  const email = identity.email?.trim().toLowerCase()

  return {
    ownerUserId,
    email: email && email.includes('@') ? email : undefined,
    isPrivileged: role === 'admin',
  }
}

async function requireOwnedSession(
  ctx: AccessCtx,
  sessionId: Id<'sessions'>,
  owner: OwnerContext,
): Promise<Doc<'sessions'>> {
  const session = await ctx.db.get(sessionId)
  if (session === null) {
    throw new ConvexError({ code: 'NOT_FOUND', message: 'Session not found.' })
  }
  if (!owner.isPrivileged && session.userId !== owner.ownerUserId) {
    throw new ConvexError({
      code: 'FORBIDDEN',
      message: 'You do not own this session.',
    })
  }
  return session
}

export type CommerceAccessState =
  | { authState: 'signed-out' }
  | { authState: 'unpaid' }
  | {
      authState: 'paid'
      enabled: boolean
      instanceStatus: Doc<'commerceInstances'>['status'] | null
      storeStatus: Doc<'commerceStores'>['status'] | null
      backendUrl?: string
      adminUrl?: string
      storefrontUrl?: string
      publishableKey?: string
      productCount?: number
    }

// Deterministic, side-effect-free — safe to expose as a `query`. Never
// resolves a store/instance across customer boundaries: the gateway lookup
// is scoped to this exact sessionId, and instances are only ever created
// under the caller's own ownerUserId (see enableCommerceForSession).
export async function getCommerceAccessForSession(
  ctx: AccessCtx,
  sessionId: Id<'sessions'>,
): Promise<CommerceAccessState> {
  const owner = await resolveOwnerContext(ctx)
  if (owner === null) return { authState: 'signed-out' }

  await requireOwnedSession(ctx, sessionId, owner)

  if (!owner.isPrivileged) {
    const entitlement = await getCommerceEntitlementForUser(
      ctx,
      owner.ownerUserId,
    )
    if (!entitlement.entitled) return { authState: 'unpaid' }
  }

  const gateway = await resolveCommerceStoreGatewayBySession(ctx, sessionId)
  if (gateway === null) {
    return {
      authState: 'paid',
      enabled: false,
      instanceStatus: null,
      storeStatus: null,
    }
  }

  return {
    authState: 'paid',
    enabled: true,
    instanceStatus: gateway.instance.status,
    storeStatus: gateway.store.status,
    backendUrl: gateway.instance.backendUrl,
    adminUrl: gateway.instance.adminUrl,
    storefrontUrl: gateway.store.storefrontUrl,
    publishableKey: gateway.store.publishableKey,
    productCount: gateway.store.productCount,
  }
}

export type EnableCommerceResult = {
  commerceInstanceId: Id<'commerceInstances'>
  commerceStoreId: Id<'commerceStores'>
  instanceCreated: boolean
  storeCreated: boolean
}

// First call for a customer creates their instance + first store; later
// calls (this session again, or a new session for the same signed-in
// customer) reuse the existing instance and create at most one new store
// binding per session — the plan's multi-store reuse requirement.
//
// This only writes Convex state. Actually provisioning the Swarm stack is a
// separate asynchronous step (calling packages/commerce-provisioner) that
// must run outside this mutation — Convex mutations cannot make outbound
// HTTP calls to the provisioner directly.
export async function enableCommerceForSession(
  ctx: Pick<MutationCtx, 'auth' | 'db'>,
  sessionId: Id<'sessions'>,
): Promise<EnableCommerceResult> {
  const owner = await resolveOwnerContext(ctx)
  if (owner === null) {
    throw new ConvexError({
      code: 'AUTH_REQUIRED',
      message: 'Sign in to enable commerce.',
    })
  }

  const session = await requireOwnedSession(ctx, sessionId, owner)
  const instanceOwnerUserId = session.userId ?? owner.ownerUserId
  const entitlement = await getCommerceEntitlementForUser(
    ctx,
    instanceOwnerUserId,
  )

  if (!owner.isPrivileged && !entitlement.entitled) {
    throw new ConvexError({
      code: 'PAYMENT_REQUIRED',
      message: 'A paid subscription is required to enable commerce.',
    })
  }

  const { instanceId, created: instanceCreated } =
    await ensureCommerceInstanceForOwner(ctx, {
      ownerUserId: instanceOwnerUserId,
      provider: 'medusa',
    })
  // Seeds entitlementExpiry on first creation so the lifecycle sweep has an
  // initial deadline to display/reason about; the sweep itself always
  // re-verifies live entitlement rather than trusting this cached value.
  if (instanceCreated && entitlement.subscription?.currentPeriodEnd !== undefined) {
    await ctx.db.patch(instanceId, {
      entitlementExpiry: entitlement.subscription.currentPeriodEnd,
    })
  }
  const { storeId, created: storeCreated } = await ensureCommerceStoreForSession(
    ctx,
    { sessionId, commerceInstanceId: instanceId },
  )

  return {
    commerceInstanceId: instanceId,
    commerceStoreId: storeId,
    instanceCreated,
    storeCreated,
  }
}

// UNVERIFIED handshake: this returns adminUrl + a short-lived ssoToken query
// param. Getting the browser tab from "open this URL" to "logged into
// Medusa's stock admin dashboard" requires either a Medusa admin UI
// extension that consumes ?ssoToken=... on load, or confirming Medusa's
// default admin app already supports token-based auto-login — neither is
// confirmed against a running instance in this repo yet.
export async function requestAdminSsoUrl(
  ctx: Pick<MutationCtx, 'auth' | 'db'>,
  sessionId: Id<'sessions'>,
  env: { ADMIN_SSO_PRIVATE_KEY?: string } = process.env,
): Promise<{ url: string }> {
  const owner = await resolveOwnerContext(ctx)
  if (owner === null) {
    throw new ConvexError({
      code: 'AUTH_REQUIRED',
      message: 'Sign in to open the admin.',
    })
  }

  await requireOwnedSession(ctx, sessionId, owner)

  const gateway = await resolveCommerceStoreGatewayBySession(ctx, sessionId)
  if (gateway === null || gateway.instance.adminUrl === undefined) {
    throw new ConvexError({
      code: 'COMMERCE_NOT_READY',
      message: 'Commerce is not ready yet.',
    })
  }

  const privateKeyBase64 = env.ADMIN_SSO_PRIVATE_KEY
  if (privateKeyBase64 === undefined) {
    throw new ConvexError({
      code: 'ADMIN_SSO_NOT_CONFIGURED',
      message: 'Admin SSO signing key is not configured.',
    })
  }

  const email = owner.email
  if (email === undefined) {
    throw new ConvexError({
      code: 'ADMIN_SSO_EMAIL_REQUIRED',
      message: 'Your account has no verified email.',
    })
  }

  const privateKey = await importAdminSsoPrivateKey(privateKeyBase64)
  const token = await signAdminSsoToken(privateKey, {
    customerId: gateway.instance.ownerUserId,
    email,
    commerceInstanceId: gateway.instance._id,
    audience: gateway.instance.adminUrl,
  })

  const url = new URL(gateway.instance.adminUrl)
  url.searchParams.set('ssoToken', token)
  return { url: url.toString() }
}
