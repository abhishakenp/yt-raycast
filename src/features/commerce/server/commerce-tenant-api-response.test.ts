import { describe, expect, it, vi } from 'vitest'

import {
  createConfiguredMedusaTenantProvisioner,
  createDeploymentMedusaConfigResponse,
  createDeploymentMedusaProductsResponse,
  createDeploymentMedusaProvisionResponse,
  createDeploymentMedusaPullResponse,
  createDeploymentMedusaWebhookResponse,
} from './commerce-tenant-api-response'

const tenantConfig = {
  tenantId: 'commerce_tenant',
  deploymentId: 'deployment_123',
  deploymentSlug: 'deployed-store',
  sessionId: 'session_123',
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
}

const createClient = (tenant: unknown = tenantConfig) => ({
  mutation: vi.fn().mockResolvedValue({ deploymentSlug: 'deployed-store' }),
  query: vi.fn().mockResolvedValue(tenant),
})

const productsPayload = {
  products: [
    {
      title: 'Admin Updated Truffle Box',
      handle: 'admin-truffle-box',
      description: 'Updated in Medusa Admin',
      variants: [
        {
          calculated_price: {
            calculated_amount: 9900,
            currency_code: 'usd',
          },
        },
      ],
    },
  ],
}

describe('deployment Medusa tenant API responses', () => {
  it('returns deployed-store commerce config from Convex tenant state', async () => {
    const client = createClient()

    const response = await createDeploymentMedusaConfigResponse(
      'deployed-store',
      client,
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      config: tenantConfig,
      deploymentSlug: 'deployed-store',
      enabled: true,
    })
    expect(client.query).toHaveBeenCalledWith(expect.anything(), {
      deploymentSlug: 'deployed-store',
    })
  })

  it('provisions an isolated Medusa tenant through a provider adapter', async () => {
    const client = createClient()
    const provisioner = {
      provision: vi.fn().mockResolvedValue({
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
      syncInitialProducts: vi.fn().mockResolvedValue({
        publishableKey: 'pk_seeded',
        synced: 1,
      }),
    }

    const response = await createDeploymentMedusaProvisionResponse(
      'deployed-store',
      new Request(
        'https://ship-fast.test/api/deployments/deployed-store/provision/medusa',
        {
          body: JSON.stringify({
            anonymousOwnerSecret: 'owner-secret',
            products: [
              { handle: 'truffle-box', price: 79, title: 'Truffle Box' },
            ],
          }),
          method: 'POST',
        },
      ),
      client,
      provisioner,
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      deploymentSlug: 'deployed-store',
      status: 'ready',
      tenant: {
        adminUrl: 'https://admin.tenant.test',
        backendUrl: 'https://backend.tenant.test',
        provider: 'manual',
        providerTenantId: 'medusa-store-1',
        publishableKey: 'pk_seeded',
        storefrontUrl: 'https://storefront.tenant.test',
      },
      webhook: {
        secret: 'tenant-webhook-secret',
        url: '/api/deployments/deployed-store/medusa-webhook',
      },
      syncedProducts: 1,
    })
    expect(provisioner.provision).toHaveBeenCalledWith({
      deploymentSlug: 'deployed-store',
      fetch,
    })
    expect(provisioner.syncInitialProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        deploymentSlug: 'deployed-store',
        products: [{ handle: 'truffle-box', price: 79, title: 'Truffle Box' }],
        tenant: expect.objectContaining({
          backendUrl: 'https://backend.tenant.test',
        }),
      }),
    )
    expect(client.mutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        anonymousOwnerSecret: 'owner-secret',
        backendUrl: 'https://backend.tenant.test',
        deploymentSlug: 'deployed-store',
        provider: 'manual',
        productCount: 1,
        publishableKey: 'pk_seeded',
        webhookSecret: 'tenant-webhook-secret',
      }),
    )
  })

  it('rejects invalid owners before provisioning a Medusa tenant', async () => {
    const mutation = vi.fn()
    const query = vi.fn(async (_reference: unknown, args: unknown) => {
      if (
        typeof args === 'object' &&
        args !== null &&
        'anonymousOwnerSecret' in args &&
        args.anonymousOwnerSecret === 'owner-secret'
      ) {
        return { deploymentSlug: 'deployed-store' }
      }
      throw Object.assign(new Error('forbidden'), {
        data: { code: 'FORBIDDEN' },
      })
    })
    const client = { mutation, query }
    const provisioner = {
      provision: vi.fn().mockResolvedValue({
        provider: 'manual',
        backendUrl: 'https://backend.tenant.test',
        adminUrl: 'https://admin.tenant.test',
        storefrontUrl: 'https://storefront.tenant.test',
      }),
      syncInitialProducts: vi.fn().mockResolvedValue({ synced: 0 }),
    }

    const response = await createDeploymentMedusaProvisionResponse(
      'deployed-store',
      new Request(
        'https://ship-fast.test/api/deployments/deployed-store/provision/medusa',
        {
          body: JSON.stringify({ anonymousOwnerSecret: 'wrong-secret' }),
          method: 'POST',
        },
      ),
      client as unknown as Parameters<
        typeof createDeploymentMedusaProvisionResponse
      >[2],
      provisioner,
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      deploymentSlug: 'deployed-store',
      error: 'Commerce tenant access denied.',
    })
    expect(provisioner.provision).not.toHaveBeenCalled()
    expect(provisioner.syncInitialProducts).not.toHaveBeenCalled()
    expect(mutation).not.toHaveBeenCalled()
  })

  it('reads all products from the isolated Medusa Store API without generated metadata filters', async () => {
    const client = createClient()
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ regions: [{ id: 'reg_1' }] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(productsPayload), { status: 200 }),
      )

    const response = await createDeploymentMedusaProductsResponse(
      'deployed-store',
      { fetch: fetchImpl },
      client,
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      deploymentSlug: 'deployed-store',
      products: [
        {
          currencyCode: 'usd',
          description: 'Updated in Medusa Admin',
          handle: 'admin-truffle-box',
          price: 9900,
          title: 'Admin Updated Truffle Box',
        },
      ],
    })
    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining('/store/products?limit=100'),
      {
        headers: { 'x-publishable-api-key': 'pk_tenant' },
      },
    )
  })

  it('manual pull fetches Medusa Admin updates and records the product count', async () => {
    const client = createClient()
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ regions: [{ id: 'reg_1' }] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(productsPayload), { status: 200 }),
      )

    const response = await createDeploymentMedusaPullResponse(
      'deployed-store',
      {
        anonymousOwnerSecret: 'owner-secret',
        fetch: fetchImpl,
        source: 'manual',
      },
      client,
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      deploymentSlug: 'deployed-store',
      productCount: 1,
      products: [
        {
          handle: 'admin-truffle-box',
          title: 'Admin Updated Truffle Box',
        },
      ],
      source: 'manual',
      status: 'ready',
    })
    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      anonymousOwnerSecret: 'owner-secret',
      deploymentSlug: 'deployed-store',
      productCount: 1,
      source: 'manual',
    })
  })

  it('manual pull rejects invalid owners before reading Medusa products', async () => {
    const fetchImpl = vi.fn()
    const mutation = vi.fn()
    const query = vi.fn(async (_reference: unknown, args: unknown) => {
      if (
        typeof args === 'object' &&
        args !== null &&
        'anonymousOwnerSecret' in args &&
        args.anonymousOwnerSecret === 'owner-secret'
      ) {
        return tenantConfig
      }
      throw Object.assign(new Error('forbidden'), {
        data: { code: 'FORBIDDEN' },
      })
    })
    const client = {
      mutation,
      query,
    }

    const response = await createDeploymentMedusaPullResponse(
      'deployed-store',
      {
        anonymousOwnerSecret: 'wrong-secret',
        fetch: fetchImpl,
        source: 'manual',
      },
      client as unknown as Parameters<
        typeof createDeploymentMedusaPullResponse
      >[2],
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      deploymentSlug: 'deployed-store',
      error: 'Commerce tenant access denied.',
      source: 'manual',
    })
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(mutation).not.toHaveBeenCalled()
  })

  it('webhook pull rejects invalid shared webhook secrets', async () => {
    const response = await createDeploymentMedusaWebhookResponse(
      'deployed-store',
      new Request(
        'https://ship-fast.test/api/deployments/deployed-store/medusa-webhook',
        {
          headers: { 'x-ship-fast-commerce-webhook-secret': 'wrong' },
          method: 'POST',
        },
      ),
      createClient(),
      {
        env: { MEDUSA_WEBHOOK_SECRET: 'expected' },
        fetch: vi.fn(),
      },
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid commerce webhook secret.',
    })
  })

  it('webhook pull records webhook source when the shared secret is valid', async () => {
    const client = createClient()
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ regions: [{ id: 'reg_1' }] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(productsPayload), { status: 200 }),
      )

    const response = await createDeploymentMedusaWebhookResponse(
      'deployed-store',
      new Request(
        'https://ship-fast.test/api/deployments/deployed-store/medusa-webhook',
        {
          headers: { 'x-ship-fast-commerce-webhook-secret': 'expected' },
          method: 'POST',
        },
      ),
      client,
      {
        env: { MEDUSA_WEBHOOK_SECRET: 'expected' },
        fetch: fetchImpl,
      },
    )

    expect(response.status).toBe(200)
    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      deploymentSlug: 'deployed-store',
      productCount: 1,
      source: 'webhook',
      webhookSecret: 'expected',
    })
  })

  it('webhook pull rejects invalid tenant webhook secrets before reading Medusa products', async () => {
    const fetchImpl = vi.fn()
    const mutation = vi.fn()
    const query = vi.fn(async (_reference: unknown, args: unknown) => {
      if (
        typeof args === 'object' &&
        args !== null &&
        'webhookSecret' in args &&
        args.webhookSecret === 'tenant-secret'
      ) {
        return tenantConfig
      }
      throw Object.assign(new Error('forbidden'), {
        data: { code: 'FORBIDDEN' },
      })
    })
    const client = {
      mutation,
      query,
    }

    const response = await createDeploymentMedusaWebhookResponse(
      'deployed-store',
      new Request(
        'https://ship-fast.test/api/deployments/deployed-store/medusa-webhook',
        {
          headers: {
            'x-ship-fast-commerce-webhook-secret': 'wrong-tenant-secret',
          },
          method: 'POST',
        },
      ),
      client as unknown as Parameters<
        typeof createDeploymentMedusaWebhookResponse
      >[2],
      { fetch: fetchImpl },
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      deploymentSlug: 'deployed-store',
      error: 'Commerce tenant access denied.',
      source: 'webhook',
    })
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(mutation).not.toHaveBeenCalled()
  })

  it('configured provisioner reads per-store Medusa URLs from env', async () => {
    const provisioner = createConfiguredMedusaTenantProvisioner({
      MEDUSA_TENANT_ADMIN_URL: 'https://admin.tenant.test',
      MEDUSA_TENANT_BACKEND_URL: 'https://backend.tenant.test',
      MEDUSA_TENANT_DATABASE_REF: 'db_tenant',
      MEDUSA_TENANT_PUBLISHABLE_KEY: 'pk_tenant',
      MEDUSA_TENANT_SECRET_REF: 'secret_tenant',
      MEDUSA_TENANT_STOREFRONT_URL: 'https://storefront.tenant.test',
    })

    await expect(
      provisioner.provision({ deploymentSlug: 'deployed-store' }),
    ).resolves.toEqual({
      adminUrl: 'https://admin.tenant.test',
      backendUrl: 'https://backend.tenant.test',
      databaseRef: 'db_tenant',
      provider: 'configured-medusa',
      providerTenantId: 'deployed-store',
      publishableKey: 'pk_tenant',
      secretRef: 'secret_tenant',
      storefrontUrl: 'https://storefront.tenant.test',
    })
  })

  it('configured provisioner can derive per-deployment tenant URLs from templates', async () => {
    const provisioner = createConfiguredMedusaTenantProvisioner({
      MEDUSA_TENANT_ADMIN_URL_TEMPLATE:
        'https://admin-{deploymentSlug}.tenant.test',
      MEDUSA_TENANT_BACKEND_URL_TEMPLATE:
        'https://backend-{deploymentSlug}.tenant.test',
      MEDUSA_TENANT_STOREFRONT_URL_TEMPLATE:
        'https://storefront-{deploymentSlug}.tenant.test',
      MEDUSA_TENANT_PUBLISHABLE_KEY: 'pk_tenant',
    })

    await expect(
      provisioner.provision({ deploymentSlug: 'deployed-store' }),
    ).resolves.toMatchObject({
      adminUrl: 'https://admin-deployed-store.tenant.test',
      backendUrl: 'https://backend-deployed-store.tenant.test',
      provider: 'configured-medusa',
      providerTenantId: 'deployed-store',
      publishableKey: 'pk_tenant',
      storefrontUrl: 'https://storefront-deployed-store.tenant.test',
    })
  })

  it('configured provisioner can delegate tenant creation to an external provision service', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          provider: 'railway-medusa',
          providerTenantId: 'tenant_123',
          backendUrl: 'https://backend.tenant.test',
          adminUrl: 'https://admin.tenant.test',
          storefrontUrl: 'https://storefront.tenant.test',
          publishableKey: 'pk_external',
          databaseRef: 'db_external',
          secretRef: 'secret_external',
          webhookSecret: 'webhook_external',
        }),
        { status: 200 },
      ),
    )
    const provisioner = createConfiguredMedusaTenantProvisioner({
      MEDUSA_TENANT_PROVISION_TOKEN: 'provision-token',
      MEDUSA_TENANT_PROVISION_URL: 'https://provisioner.test/tenants',
    })
    const input = {
      deploymentSlug: 'deployed-store',
      fetch: fetchImpl as typeof fetch,
    }

    await expect(provisioner.provision(input)).resolves.toEqual({
      adminUrl: 'https://admin.tenant.test',
      backendUrl: 'https://backend.tenant.test',
      databaseRef: 'db_external',
      provider: 'railway-medusa',
      providerTenantId: 'tenant_123',
      publishableKey: 'pk_external',
      secretRef: 'secret_external',
      storefrontUrl: 'https://storefront.tenant.test',
      webhookSecret: 'webhook_external',
    })
    expect(fetchImpl).toHaveBeenCalledWith('https://provisioner.test/tenants', {
      body: JSON.stringify({ deploymentSlug: 'deployed-store' }),
      headers: {
        Authorization: 'Bearer provision-token',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
  })
})
