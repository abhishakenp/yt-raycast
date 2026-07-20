import { describe, expect, it, vi } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { hashOwnerSecret } from './session_access_helpers'
import {
  authorizeDeploymentCommerceTenantProvision,
  authorizeSessionCommerceProvision,
  loadDeploymentCommerceTenantBySlugForWebhook,
  loadDeploymentCommerceTenantBySlug,
  loadOwnedDeploymentCommerceTenantBySlug,
  loadSessionCommerceConfig,
  recordDeploymentCommerceTenantPull,
  resolveDeploymentCommerceGatewayConfig,
  resolveSessionCommerceGatewayConfig,
  upsertDeploymentCommerceTenant,
  provisionSessionMedusaTenant,
  syncSessionMedusaProducts,
  upsertSessionCommerceConfig,
} from './session_commerce_helpers'

type MutationHandler<Args> = (ctx: MutationCtx, args: Args) => Promise<unknown>
type QueryHandler<Args> = (ctx: QueryCtx, args: Args) => Promise<unknown>

type UpsertCommerceConfigArgs = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  backendUrl?: string
  adminUrl?: string
  storefrontUrl?: string
  configJson?: string
  errorMessage?: string
  productCount?: number
}

type SessionIdArgs = {
  sessionId: Id<'sessions'>
}

type OwnedSessionArgs = SessionIdArgs & {
  anonymousOwnerSecret?: string
}

type ProvisionMedusaTenantArgs = {
  sessionId: Id<'sessions'>
  backendUrl: string
  adminUrl: string
  storefrontUrl: string
}

type MedusaProduct = {
  id: string
  title: string
  handle: string
  price: number
  description?: string
}

type SyncMedusaProductsArgs = {
  sessionId: Id<'sessions'>
  products: MedusaProduct[]
}

type CommerceConfigDoc = Doc<'commerceConfigs'>
type CommerceTenantDoc = Doc<'commerceTenants'>
type DeploymentDoc = Doc<'deployments'>

const sessionId = 'session_commerce' as Id<'sessions'>
const deploymentId = 'deployment_commerce' as Id<'deployments'>
const deploymentSlug = 'deployed-store'

const sessionDoc = async (ownerSecret = 'owner-secret') =>
  ({
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Build a store',
    workspace: 'workspace_commerce',
    createdAt: 1,
    anonOwnerSecretHash: await hashOwnerSecret(ownerSecret),
  }) as Doc<'sessions'>

function commerceDoc(
  overrides: Partial<CommerceConfigDoc> = {},
): CommerceConfigDoc {
  return {
    _id: 'commerce_config' as Id<'commerceConfigs'>,
    _creationTime: 1,
    sessionId,
    status: 'ready',
    backendUrl: 'https://backend.old.test',
    adminUrl: 'https://admin.old.test',
    storefrontUrl: 'https://store.old.test',
    productCount: 0,
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  } as CommerceConfigDoc
}

function deploymentDoc(overrides: Partial<DeploymentDoc> = {}): DeploymentDoc {
  return {
    _id: deploymentId,
    _creationTime: 1,
    sessionId,
    slug: deploymentSlug,
    url: 'https://deployed-store.ship-fast.io',
    status: 'ready',
    provider: 'lakebed',
    previewVersion: 1,
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  } as DeploymentDoc
}

function commerceTenantDoc(
  overrides: Partial<CommerceTenantDoc> = {},
): CommerceTenantDoc {
  return {
    _id: 'commerce_tenant' as Id<'commerceTenants'>,
    _creationTime: 1,
    deploymentId,
    sessionId,
    deploymentSlug,
    provider: 'manual',
    status: 'ready',
    syncStatus: 'idle',
    backendUrl: 'https://backend.tenant.test',
    adminUrl: 'https://admin.tenant.test',
    storefrontUrl: 'https://storefront.tenant.test',
    publishableKey: 'pk_tenant',
    productCount: 0,
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  } as CommerceTenantDoc
}

async function ctxFor(
  options: {
    session?: Doc<'sessions'> | null
    identity?: { tokenIdentifier: string } | null
    configs?: CommerceConfigDoc[]
    deployments?: DeploymentDoc[]
    tenants?: CommerceTenantDoc[]
  } = {},
) {
  const session =
    options.session === undefined ? await sessionDoc() : options.session
  const configs = [...(options.configs ?? [])]
  const deployments = [...(options.deployments ?? [])]
  const tenants = [...(options.tenants ?? [])]

  const queryFirst = async (table: string, field: string, value: string) => {
    if (table === 'commerceConfigs') {
      return configs.find((config) => config.sessionId === value) ?? null
    }
    if (table === 'deployments') {
      if (field === 'slug') {
        return (
          deployments.find((deployment) => deployment.slug === value) ?? null
        )
      }
      if (field === 'sessionId') {
        return (
          deployments.find((deployment) => deployment.sessionId === value) ??
          null
        )
      }
    }
    if (table === 'commerceTenants') {
      if (field === 'deploymentId') {
        return tenants.find((tenant) => tenant.deploymentId === value) ?? null
      }
      if (field === 'deploymentSlug') {
        return tenants.find((tenant) => tenant.deploymentSlug === value) ?? null
      }
    }
    return null
  }

  const ctx = {
    auth: {
      getUserIdentity: async () => options.identity ?? null,
    },
    db: {
      get: async (id: string) => {
        if (id === sessionId) return session
        const deployment = deployments.find((item) => item._id === id)
        if (deployment !== undefined) return deployment
        const tenant = tenants.find((item) => item._id === id)
        if (tenant !== undefined) return tenant
        return configs.find((config) => config._id === id) ?? null
      },
      query: (table: string) => {
        return {
          withIndex: (
            indexName: string,
            applyIndex: (index: {
              eq: (
                fieldName: string,
                fieldValue: string,
              ) => { field: string; value: string }
            }) => { field: string; value: string },
          ) => {
            const { field, value } = applyIndex({
              eq: (fieldName: string, fieldValue: string) => ({
                field: fieldName,
                value: fieldValue,
              }),
            })
            expect(indexName).toBe(`by_${field}`)
            return {
              first: async () => await queryFirst(table, field, value),
            }
          },
        }
      },
      insert: async (table: string, value: Record<string, unknown>) => {
        if (table === 'commerceConfigs') {
          const config = {
            _id: `commerce_config_${configs.length + 1}` as Id<'commerceConfigs'>,
            _creationTime: 1,
            ...value,
          } as CommerceConfigDoc
          configs.push(config)
          return config._id
        }
        expect(table).toBe('commerceTenants')
        const tenant = {
          _id: `commerce_tenant_${tenants.length + 1}` as Id<'commerceTenants'>,
          _creationTime: 1,
          ...value,
        } as CommerceTenantDoc
        tenants.push(tenant)
        return tenant._id
      },
      patch: async (id: string, patch: Record<string, unknown>) => {
        const index = configs.findIndex((config) => config._id === id)
        if (index >= 0) {
          configs[index] = {
            ...configs[index],
            ...patch,
          } as CommerceConfigDoc
          return
        }
        const tenantIndex = tenants.findIndex((tenant) => tenant._id === id)
        expect(tenantIndex).toBeGreaterThanOrEqual(0)
        tenants[tenantIndex] = {
          ...tenants[tenantIndex],
          ...patch,
        } as CommerceTenantDoc
      },
    },
  } as unknown as MutationCtx

  return { ctx, configs, deployments, tenants }
}

describe('session commerce helpers', () => {
  it('authorizes session commerce provisioning with the matching anonymous owner secret', async () => {
    const { ctx } = await ctxFor()

    await expect(
      authorizeSessionCommerceProvision(ctx, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
      }),
    ).resolves.toEqual({ sessionId })
  })

  it('authorizes session commerce provisioning for the authenticated owner', async () => {
    const ownerId = 'https://auth.test|owner'
    const session = {
      ...(await sessionDoc()),
      userId: ownerId,
    }
    const { ctx } = await ctxFor({
      identity: { tokenIdentifier: ownerId },
      session,
    })

    await expect(
      authorizeSessionCommerceProvision(ctx, { sessionId }),
    ).resolves.toEqual({ sessionId })
  })

  it('rejects session commerce provisioning for an invalid owner', async () => {
    const { ctx } = await ctxFor()

    await expect(
      authorizeSessionCommerceProvision(ctx, {
        sessionId,
        anonymousOwnerSecret: 'wrong-secret',
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'FORBIDDEN',
      },
    })
  })

  it('rejects session commerce provisioning when the session is missing', async () => {
    const { ctx } = await ctxFor({ session: null })

    await expect(
      authorizeSessionCommerceProvision(ctx, { sessionId }),
    ).rejects.toMatchObject({
      data: {
        code: 'NOT_FOUND',
      },
    })
  })

  it('creates an owned commerce config', async () => {
    const { ctx, configs } = await ctxFor()

    await expect(
      upsertSessionCommerceConfig(ctx, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        backendUrl: 'https://backend.medusa.test',
        adminUrl: 'https://admin.medusa.test',
        storefrontUrl: 'https://store.medusa.test',
        configJson: '{"provider":"medusa"}',
      }),
    ).resolves.toEqual({ sessionId })

    expect(configs).toHaveLength(1)
    expect(configs[0]).toMatchObject({
      sessionId,
      status: 'ready',
      backendUrl: 'https://backend.medusa.test',
      adminUrl: 'https://admin.medusa.test',
      storefrontUrl: 'https://store.medusa.test',
      configJson: '{"provider":"medusa"}',
    })
  })

  it('updates an existing owned commerce config', async () => {
    const existing = commerceDoc()
    const { ctx, configs } = await ctxFor({ configs: [existing] })

    await upsertSessionCommerceConfig(ctx, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      backendUrl: 'https://backend.new.test',
      adminUrl: 'https://admin.new.test',
      storefrontUrl: 'https://store.new.test',
      errorMessage: 'warning',
    })

    expect(configs).toHaveLength(1)
    expect(configs[0]).toMatchObject({
      _id: existing._id,
      backendUrl: 'https://backend.new.test',
      adminUrl: 'https://admin.new.test',
      storefrontUrl: 'https://store.new.test',
      errorMessage: 'warning',
      status: 'ready',
    })
  })

  it('rejects commerce config writes without session ownership', async () => {
    const { ctx } = await ctxFor()

    await expect(
      upsertSessionCommerceConfig(ctx, {
        sessionId,
        anonymousOwnerSecret: 'wrong-secret',
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'FORBIDDEN',
      },
    })
  })

  it('serializes commerce config for public reads', async () => {
    const { ctx } = await ctxFor({
      configs: [
        commerceDoc({
          productCount: 3,
          configJson: '{"ready":true}',
          errorMessage: 'partial',
        }),
      ],
    })

    await expect(loadSessionCommerceConfig(ctx, sessionId)).resolves.toEqual({
      configId: 'commerce_config',
      status: 'ready',
      backendUrl: 'https://backend.old.test',
      adminUrl: 'https://admin.old.test',
      storefrontUrl: 'https://store.old.test',
      productCount: 3,
      configJson: '{"ready":true}',
      errorMessage: 'partial',
      createdAt: 100,
      updatedAt: 100,
    })
  })

  it('resolves a session gateway only for the authenticated or anonymous owner without leaking secrets', async () => {
    const ownerId = 'https://auth.test|owner'
    const session = {
      ...(await sessionDoc()),
      userId: ownerId,
    }
    const configJson = JSON.stringify({
      adminPassword: 'admin-password',
      adminToken: 'admin-token',
      medusaTenant: {
        publishableKey: 'pk_session',
        webhookSecret: 'webhook-secret',
      },
    })
    const { ctx } = await ctxFor({
      configs: [commerceDoc({ configJson })],
      identity: { tokenIdentifier: ownerId },
      session,
    })

    await expect(
      resolveSessionCommerceGatewayConfig(ctx, { sessionId }),
    ).resolves.toEqual({
      backendUrl: 'https://backend.old.test',
      publishableKey: 'pk_session',
      scope: 'sessions',
      tenant: sessionId,
    })
    await expect(
      resolveSessionCommerceGatewayConfig(ctx, {
        anonymousOwnerSecret: 'owner-secret',
        sessionId,
      }),
    ).resolves.toEqual({
      backendUrl: 'https://backend.old.test',
      publishableKey: 'pk_session',
      scope: 'sessions',
      tenant: sessionId,
    })

    const serialized = JSON.stringify(
      await resolveSessionCommerceGatewayConfig(ctx, { sessionId }),
    )
    expect(serialized).not.toContain('admin-password')
    expect(serialized).not.toContain('admin-token')
    expect(serialized).not.toContain('webhook-secret')
  })

  it('rejects a session gateway request without matching ownership', async () => {
    const { ctx } = await ctxFor({
      configs: [
        commerceDoc({
          configJson: JSON.stringify({
            medusaTenant: { publishableKey: 'pk_session' },
          }),
        }),
      ],
    })

    await expect(
      resolveSessionCommerceGatewayConfig(ctx, {
        anonymousOwnerSecret: 'wrong-secret',
        sessionId,
      }),
    ).rejects.toMatchObject({
      data: { code: 'FORBIDDEN' },
    })
  })

  it('provisions a Medusa tenant config with zero products by default', async () => {
    const { ctx, configs } = await ctxFor()

    await expect(
      provisionSessionMedusaTenant(ctx, {
        sessionId,
        backendUrl: 'https://backend.medusa.test',
        adminUrl: 'https://admin.medusa.test',
        storefrontUrl: 'https://store.medusa.test',
      }),
    ).resolves.toEqual({ success: true })

    expect(configs[0]).toMatchObject({
      sessionId,
      status: 'ready',
      productCount: 0,
      backendUrl: 'https://backend.medusa.test',
      adminUrl: 'https://admin.medusa.test',
      storefrontUrl: 'https://store.medusa.test',
    })
  })

  it('updates product count during Medusa sync', async () => {
    const { ctx, configs } = await ctxFor({ configs: [commerceDoc()] })

    await expect(
      syncSessionMedusaProducts(ctx, {
        sessionId,
        products: [
          {
            id: 'prod_1',
            title: 'First',
            handle: 'first',
            price: 12,
          },
          {
            id: 'prod_2',
            title: 'Second',
            handle: 'second',
            price: 24,
            description: 'Second product',
          },
        ],
      }),
    ).resolves.toEqual({ synced: 2 })

    expect(configs[0]?.productCount).toBe(2)
  })

  it('rejects Medusa sync before commerce is configured', async () => {
    const { ctx } = await ctxFor()

    await expect(
      syncSessionMedusaProducts(ctx, {
        sessionId,
        products: [],
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'NOT_CONFIGURED',
        message: 'Medusa commerce config not found',
      },
    })
  })

  it('creates a deployment-scoped commerce tenant for an owned deployed store', async () => {
    const { ctx, tenants } = await ctxFor({
      deployments: [deploymentDoc()],
    })

    await expect(
      upsertDeploymentCommerceTenant(ctx, {
        deploymentSlug,
        anonymousOwnerSecret: 'owner-secret',
        provider: 'manual',
        providerTenantId: 'medusa-store-1',
        backendUrl: 'https://backend.tenant.test',
        adminUrl: 'https://admin.tenant.test',
        storefrontUrl: 'https://storefront.tenant.test',
        publishableKey: 'pk_tenant',
        databaseRef: 'db_tenant',
        secretRef: 'secret_tenant',
        webhookSecret: 'tenant-webhook-secret',
      }),
    ).resolves.toEqual({
      deploymentId,
      deploymentSlug,
      sessionId,
      status: 'ready',
    })

    expect(tenants).toHaveLength(1)
    expect(tenants[0]).toMatchObject({
      deploymentId,
      deploymentSlug,
      sessionId,
      provider: 'manual',
      providerTenantId: 'medusa-store-1',
      status: 'ready',
      syncStatus: 'idle',
      backendUrl: 'https://backend.tenant.test',
      adminUrl: 'https://admin.tenant.test',
      storefrontUrl: 'https://storefront.tenant.test',
      publishableKey: 'pk_tenant',
      databaseRef: 'db_tenant',
      secretRef: 'secret_tenant',
      productCount: 0,
    })
    expect(tenants[0]?.webhookSecretHash).toBe(
      await hashOwnerSecret('tenant-webhook-secret'),
    )
  })

  it('authorizes deployment commerce tenant provisioning before provider side effects', async () => {
    const { ctx } = await ctxFor({
      deployments: [deploymentDoc()],
    })

    await expect(
      authorizeDeploymentCommerceTenantProvision(ctx, {
        deploymentSlug,
        anonymousOwnerSecret: 'owner-secret',
      }),
    ).resolves.toEqual({
      deploymentId,
      deploymentSlug,
      sessionId,
    })

    await expect(
      authorizeDeploymentCommerceTenantProvision(ctx, {
        deploymentSlug,
        anonymousOwnerSecret: 'wrong-secret',
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'FORBIDDEN',
      },
    })
  })

  it('serializes a deployment-scoped commerce tenant for storefront config', async () => {
    const tenant = commerceTenantDoc({
      databaseRef: 'db_private',
      lastPullAt: 120,
      lastWebhookAt: 130,
      productCount: 4,
      secretRef: 'secret_private',
      syncStatus: 'ready',
      webhookSecretHash: await hashOwnerSecret('webhook-secret'),
    })
    const { ctx } = await ctxFor({
      deployments: [deploymentDoc()],
      tenants: [tenant],
    })

    await expect(
      loadDeploymentCommerceTenantBySlug(ctx, deploymentSlug),
    ).resolves.toEqual({
      tenantId: 'commerce_tenant',
      deploymentId,
      deploymentSlug,
      sessionId,
      provider: 'manual',
      providerTenantId: undefined,
      status: 'ready',
      syncStatus: 'ready',
      backendUrl: 'https://backend.tenant.test',
      adminUrl: 'https://admin.tenant.test',
      storefrontUrl: 'https://storefront.tenant.test',
      publishableKey: 'pk_tenant',
      productCount: 4,
      lastPullAt: 120,
      lastWebhookAt: 130,
      lastHealthCheckAt: undefined,
      errorMessage: undefined,
      createdAt: 100,
      updatedAt: 100,
    })
    const serialized = await loadDeploymentCommerceTenantBySlug(
      ctx,
      deploymentSlug,
    )
    expect(serialized).not.toHaveProperty('databaseRef')
    expect(serialized).not.toHaveProperty('secretRef')
    expect(serialized).not.toHaveProperty('webhookSecretHash')
  })

  it('resolves only ready public deployment gateways without leaking tenant secrets', async () => {
    const tenant = commerceTenantDoc({
      databaseRef: 'db_private',
      secretRef: 'secret_private',
      webhookSecretHash: await hashOwnerSecret('webhook-secret'),
    })
    const { ctx } = await ctxFor({
      deployments: [deploymentDoc()],
      tenants: [tenant],
    })

    await expect(
      resolveDeploymentCommerceGatewayConfig(ctx, deploymentSlug),
    ).resolves.toEqual({
      backendUrl: 'https://backend.tenant.test',
      publishableKey: 'pk_tenant',
      scope: 'deployments',
      tenant: deploymentSlug,
    })

    const serialized = JSON.stringify(
      await resolveDeploymentCommerceGatewayConfig(ctx, deploymentSlug),
    )
    expect(serialized).not.toContain('db_private')
    expect(serialized).not.toContain('secret_private')
    expect(serialized).not.toContain('webhook-secret')
  })

  it('rejects inactive, private, and degraded deployment gateways', async () => {
    const privateSession = {
      ...(await sessionDoc()),
      isPrivate: true,
    }
    const inactive = await ctxFor({
      deployments: [deploymentDoc({ status: 'updating' })],
      tenants: [commerceTenantDoc()],
    })
    const privateDeployment = await ctxFor({
      deployments: [deploymentDoc()],
      session: privateSession,
      tenants: [commerceTenantDoc()],
    })
    const degraded = await ctxFor({
      deployments: [deploymentDoc()],
      tenants: [commerceTenantDoc({ status: 'degraded' })],
    })

    await expect(
      resolveDeploymentCommerceGatewayConfig(inactive.ctx, deploymentSlug),
    ).resolves.toBeNull()
    await expect(
      resolveDeploymentCommerceGatewayConfig(
        privateDeployment.ctx,
        deploymentSlug,
      ),
    ).resolves.toBeNull()
    await expect(
      resolveDeploymentCommerceGatewayConfig(degraded.ctx, deploymentSlug),
    ).resolves.toBeNull()
  })

  it('loads an owned deployment commerce tenant only for the deployment owner', async () => {
    const { ctx } = await ctxFor({
      deployments: [deploymentDoc()],
      tenants: [commerceTenantDoc()],
    })

    await expect(
      loadOwnedDeploymentCommerceTenantBySlug(ctx, {
        deploymentSlug,
        anonymousOwnerSecret: 'owner-secret',
      }),
    ).resolves.toMatchObject({
      deploymentSlug,
      publishableKey: 'pk_tenant',
    })

    await expect(
      loadOwnedDeploymentCommerceTenantBySlug(ctx, {
        deploymentSlug,
        anonymousOwnerSecret: 'wrong-secret',
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'FORBIDDEN',
      },
    })
  })

  it('loads a deployment commerce tenant for webhooks only with the tenant webhook secret', async () => {
    const { ctx } = await ctxFor({
      deployments: [deploymentDoc()],
      tenants: [
        commerceTenantDoc({
          webhookSecretHash: await hashOwnerSecret('tenant-webhook-secret'),
        }),
      ],
    })

    await expect(
      loadDeploymentCommerceTenantBySlugForWebhook(ctx, {
        deploymentSlug,
        webhookSecret: 'tenant-webhook-secret',
      }),
    ).resolves.toMatchObject({
      deploymentSlug,
      publishableKey: 'pk_tenant',
    })

    await expect(
      loadDeploymentCommerceTenantBySlugForWebhook(ctx, {
        deploymentSlug,
        webhookSecret: 'wrong-secret',
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'FORBIDDEN',
      },
    })
  })

  it('records a manual Medusa Admin pull for a deployed-store tenant', async () => {
    const { ctx, tenants } = await ctxFor({
      deployments: [deploymentDoc()],
      tenants: [commerceTenantDoc({ syncStatus: 'idle' })],
    })

    await expect(
      recordDeploymentCommerceTenantPull(ctx, {
        deploymentSlug,
        anonymousOwnerSecret: 'owner-secret',
        source: 'manual',
        productCount: 4,
      }),
    ).resolves.toEqual({
      deploymentSlug,
      productCount: 4,
      source: 'manual',
      status: 'ready',
    })

    expect(tenants[0]).toMatchObject({
      productCount: 4,
      syncStatus: 'ready',
      errorMessage: undefined,
    })
    expect(tenants[0]?.lastPullAt).toEqual(expect.any(Number))
    expect(tenants[0]?.lastWebhookAt).toBeUndefined()
  })

  it('rejects manual Medusa Admin pulls without deployment ownership', async () => {
    const { ctx } = await ctxFor({
      deployments: [deploymentDoc()],
      tenants: [commerceTenantDoc({ syncStatus: 'idle' })],
    })

    await expect(
      recordDeploymentCommerceTenantPull(ctx, {
        deploymentSlug,
        anonymousOwnerSecret: 'wrong-secret',
        source: 'manual',
        productCount: 4,
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'FORBIDDEN',
      },
    })
  })

  it('records webhook-driven Medusa Admin pulls separately from manual pulls', async () => {
    const webhookSecret = 'webhook-secret'
    const { ctx, tenants } = await ctxFor({
      deployments: [deploymentDoc()],
      tenants: [
        commerceTenantDoc({
          lastPullAt: 120,
          syncStatus: 'idle',
          webhookSecretHash: await hashOwnerSecret(webhookSecret),
        }),
      ],
    })

    await recordDeploymentCommerceTenantPull(ctx, {
      deploymentSlug,
      source: 'webhook',
      webhookSecret,
      productCount: 5,
    })

    expect(tenants[0]).toMatchObject({
      lastPullAt: 120,
      productCount: 5,
      syncStatus: 'ready',
    })
    expect(tenants[0]?.lastWebhookAt).toEqual(expect.any(Number))
  })

  it('rejects webhook-driven Medusa pulls without the tenant webhook secret', async () => {
    const { ctx } = await ctxFor({
      deployments: [deploymentDoc()],
      tenants: [
        commerceTenantDoc({
          webhookSecretHash: await hashOwnerSecret('webhook-secret'),
        }),
      ],
    })

    await expect(
      recordDeploymentCommerceTenantPull(ctx, {
        deploymentSlug,
        source: 'webhook',
        webhookSecret: 'wrong-secret',
        productCount: 5,
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'FORBIDDEN',
      },
    })
  })

  it('session commerce and Medusa handlers delegate to commerce helpers', async () => {
    vi.resetModules()
    vi.doMock('./session_commerce_helpers', () => ({
      authorizeSessionCommerceProvision: vi.fn(async () => null),
      upsertSessionCommerceConfig: vi.fn(async () => null),
      loadSessionCommerceConfig: vi.fn(async () => null),
      provisionSessionMedusaTenant: vi.fn(async () => null),
      syncSessionMedusaProducts: vi.fn(async () => null),
      authorizeDeploymentCommerceTenantProvision: vi.fn(async () => null),
      upsertDeploymentCommerceTenant: vi.fn(async () => null),
      loadDeploymentCommerceTenantBySlug: vi.fn(async () => null),
      loadOwnedDeploymentCommerceTenantBySlug: vi.fn(async () => null),
      loadDeploymentCommerceTenantBySlugForWebhook: vi.fn(async () => null),
      resolveDeploymentCommerceGatewayConfig: vi.fn(async () => null),
      resolveSessionCommerceGatewayConfig: vi.fn(async () => null),
      recordDeploymentCommerceTenantPull: vi.fn(async () => null),
    }))
    try {
      const {
        authorizeSessionCommerceProvision:
          authorizeSessionCommerceProvisionQuery,
        upsertCommerceConfig,
        getCommerceConfig,
        provisionMedusaTenant,
        syncMedusaProducts,
        authorizeCommerceTenantProvision,
        upsertCommerceTenant,
        getCommerceTenantByDeploymentSlug,
        getOwnedCommerceTenantByDeploymentSlug,
        getCommerceTenantByDeploymentSlugForWebhook,
        resolveCommerceDeploymentGateway,
        resolveCommerceSessionGateway,
        recordCommerceTenantPull,
      } = await import('../sessions')
      const mockedModule = await import('./session_commerce_helpers')
      const mockedAuthorizeSessionCommerceProvision = vi.mocked(
        mockedModule.authorizeSessionCommerceProvision,
      )
      const mockedUpsertSessionCommerceConfig = vi.mocked(
        mockedModule.upsertSessionCommerceConfig,
      )
      const mockedLoadSessionCommerceConfig = vi.mocked(
        mockedModule.loadSessionCommerceConfig,
      )
      const mockedProvisionSessionMedusaTenant = vi.mocked(
        mockedModule.provisionSessionMedusaTenant,
      )
      const mockedSyncSessionMedusaProducts = vi.mocked(
        mockedModule.syncSessionMedusaProducts,
      )
      const mockedAuthorizeDeploymentCommerceTenantProvision = vi.mocked(
        mockedModule.authorizeDeploymentCommerceTenantProvision,
      )
      const mockedUpsertDeploymentCommerceTenant = vi.mocked(
        mockedModule.upsertDeploymentCommerceTenant,
      )
      const mockedLoadDeploymentCommerceTenantBySlug = vi.mocked(
        mockedModule.loadDeploymentCommerceTenantBySlug,
      )
      const mockedLoadOwnedDeploymentCommerceTenantBySlug = vi.mocked(
        mockedModule.loadOwnedDeploymentCommerceTenantBySlug,
      )
      const mockedLoadDeploymentCommerceTenantBySlugForWebhook = vi.mocked(
        mockedModule.loadDeploymentCommerceTenantBySlugForWebhook,
      )
      const mockedRecordDeploymentCommerceTenantPull = vi.mocked(
        mockedModule.recordDeploymentCommerceTenantPull,
      )
      const mockedResolveDeploymentCommerceGatewayConfig = vi.mocked(
        mockedModule.resolveDeploymentCommerceGatewayConfig,
      )
      const mockedResolveSessionCommerceGatewayConfig = vi.mocked(
        mockedModule.resolveSessionCommerceGatewayConfig,
      )
      const ctx = { db: {} } as unknown as MutationCtx
      const queryCtx = { db: {} } as unknown as QueryCtx

      const sessionAuthorizationArgs: OwnedSessionArgs = {
        sessionId: 's1' as Id<'sessions'>,
        anonymousOwnerSecret: 'owner-secret',
      }
      const sessionAuthorizationHandler =
        authorizeSessionCommerceProvisionQuery as unknown as QueryHandler<OwnedSessionArgs>
      await sessionAuthorizationHandler(queryCtx, sessionAuthorizationArgs)
      expect(mockedAuthorizeSessionCommerceProvision).toHaveBeenCalledWith(
        queryCtx,
        sessionAuthorizationArgs,
      )

      const upsertArgs: UpsertCommerceConfigArgs = {
        sessionId: 's1' as Id<'sessions'>,
        backendUrl: 'https://b.test',
      }
      const upsertHandler =
        upsertCommerceConfig as unknown as MutationHandler<UpsertCommerceConfigArgs>
      await upsertHandler(ctx, upsertArgs)
      expect(mockedUpsertSessionCommerceConfig).toHaveBeenCalledWith(
        ctx,
        upsertArgs,
      )

      const getArgs: SessionIdArgs = {
        sessionId: 's1' as Id<'sessions'>,
      }
      const getHandler =
        getCommerceConfig as unknown as QueryHandler<SessionIdArgs>
      await getHandler(queryCtx, getArgs)
      expect(mockedLoadSessionCommerceConfig).toHaveBeenCalledWith(
        queryCtx,
        getArgs.sessionId,
      )

      const sessionGatewayHandler =
        resolveCommerceSessionGateway as unknown as QueryHandler<OwnedSessionArgs>
      await sessionGatewayHandler(queryCtx, sessionAuthorizationArgs)
      expect(mockedResolveSessionCommerceGatewayConfig).toHaveBeenCalledWith(
        queryCtx,
        sessionAuthorizationArgs,
      )

      const provisionArgs: ProvisionMedusaTenantArgs = {
        sessionId: 's1' as Id<'sessions'>,
        backendUrl: 'https://b.test',
        adminUrl: 'https://a.test',
        storefrontUrl: 'https://s.test',
      }
      const provisionHandler =
        provisionMedusaTenant as unknown as MutationHandler<ProvisionMedusaTenantArgs>
      await provisionHandler(ctx, provisionArgs)
      expect(mockedProvisionSessionMedusaTenant).toHaveBeenCalledWith(
        ctx,
        provisionArgs,
      )

      const syncArgs: SyncMedusaProductsArgs = {
        sessionId: 's1' as Id<'sessions'>,
        products: [],
      }
      const syncHandler =
        syncMedusaProducts as unknown as MutationHandler<SyncMedusaProductsArgs>
      await syncHandler(ctx, syncArgs)
      expect(mockedSyncSessionMedusaProducts).toHaveBeenCalledWith(
        ctx,
        syncArgs,
      )

      const authorizeArgs = {
        deploymentSlug,
        anonymousOwnerSecret: 'owner-secret',
      }
      const authorizeHandler =
        authorizeCommerceTenantProvision as unknown as QueryHandler<
          typeof authorizeArgs
        >
      await authorizeHandler(queryCtx, authorizeArgs)
      expect(
        mockedAuthorizeDeploymentCommerceTenantProvision,
      ).toHaveBeenCalledWith(queryCtx, authorizeArgs)

      const tenantArgs = {
        deploymentSlug,
        anonymousOwnerSecret: 'owner-secret',
        provider: 'manual',
        backendUrl: 'https://b.test',
        adminUrl: 'https://a.test',
        storefrontUrl: 'https://s.test',
      }
      const tenantHandler = upsertCommerceTenant as unknown as MutationHandler<
        typeof tenantArgs
      >
      await tenantHandler(ctx, tenantArgs)
      expect(mockedUpsertDeploymentCommerceTenant).toHaveBeenCalledWith(
        ctx,
        tenantArgs,
      )

      const tenantQueryHandler =
        getCommerceTenantByDeploymentSlug as unknown as QueryHandler<{
          deploymentSlug: string
        }>
      await tenantQueryHandler(queryCtx, { deploymentSlug })
      expect(mockedLoadDeploymentCommerceTenantBySlug).toHaveBeenCalledWith(
        queryCtx,
        deploymentSlug,
      )

      const deploymentGatewayHandler =
        resolveCommerceDeploymentGateway as unknown as QueryHandler<{
          deploymentSlug: string
        }>
      await deploymentGatewayHandler(queryCtx, { deploymentSlug })
      expect(mockedResolveDeploymentCommerceGatewayConfig).toHaveBeenCalledWith(
        queryCtx,
        deploymentSlug,
      )

      const ownedTenantQueryHandler =
        getOwnedCommerceTenantByDeploymentSlug as unknown as QueryHandler<{
          deploymentSlug: string
          anonymousOwnerSecret?: string
        }>
      const ownedTenantArgs = {
        deploymentSlug,
        anonymousOwnerSecret: 'owner-secret',
      }
      await ownedTenantQueryHandler(queryCtx, ownedTenantArgs)
      expect(
        mockedLoadOwnedDeploymentCommerceTenantBySlug,
      ).toHaveBeenCalledWith(queryCtx, ownedTenantArgs)

      const webhookTenantQueryHandler =
        getCommerceTenantByDeploymentSlugForWebhook as unknown as QueryHandler<{
          deploymentSlug: string
          webhookSecret?: string
        }>
      const webhookTenantArgs = {
        deploymentSlug,
        webhookSecret: 'tenant-webhook-secret',
      }
      await webhookTenantQueryHandler(queryCtx, webhookTenantArgs)
      expect(
        mockedLoadDeploymentCommerceTenantBySlugForWebhook,
      ).toHaveBeenCalledWith(queryCtx, webhookTenantArgs)

      const pullArgs = {
        deploymentSlug,
        source: 'manual' as const,
        productCount: 2,
      }
      const pullHandler =
        recordCommerceTenantPull as unknown as MutationHandler<typeof pullArgs>
      await pullHandler(ctx, pullArgs)
      expect(mockedRecordDeploymentCommerceTenantPull).toHaveBeenCalledWith(
        ctx,
        pullArgs,
      )
    } finally {
      vi.doUnmock('./session_commerce_helpers')
      vi.resetModules()
    }
  })
})
