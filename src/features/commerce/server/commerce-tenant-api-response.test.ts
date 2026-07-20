import { describe, expect, it, vi } from 'vitest'

import {
  createConfiguredMedusaTenantProvisioner,
  createDeploymentMedusaConfigResponse,
  createDeploymentMedusaProductsResponse,
  createDeploymentMedusaProvisionResponse,
  createDeploymentMedusaPullResponse,
  createDeploymentMedusaWebhookResponse,
} from './commerce-tenant-api-response'
import { createSessionMedusaProductsResponse } from './medusa-product-read'

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

function createClient(tenant: unknown = tenantConfig) {
  return {
    mutation: vi.fn().mockResolvedValue({ deploymentSlug: 'deployed-store' }),
    query: vi.fn().mockResolvedValue(tenant),
  }
}

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
    await expect(response.json()).resolves.toEqual({
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
        products: [
          {
            collections: [],
            handle: 'truffle-box',
            images: [],
            options: [],
            price: 79,
            sourceId: 'product:truffle-box',
            tags: [],
            title: 'Truffle Box',
            variants: [
              {
                manageInventory: false,
                optionValues: {},
                prices: [{ amount: 79, currencyCode: 'usd' }],
                sourceId: 'variant:truffle-box:default',
                title: 'Default',
              },
            ],
          },
        ],
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

  it('preserves rich generated products at the deployment provisioning boundary', async () => {
    const client = createClient()
    const provisioner = {
      provision: vi.fn().mockResolvedValue({
        adminUrl: 'https://admin.tenant.test',
        backendUrl: 'https://backend.tenant.test',
        provider: 'manual',
        storefrontUrl: 'https://storefront.tenant.test',
      }),
      syncInitialProducts: vi.fn().mockResolvedValue({ synced: 1 }),
    }
    const richProduct = {
      collections: [
        {
          handle: 'summer-edit',
          sourceId: 'collection_summer',
          title: 'Summer Edit',
        },
      ],
      description: 'A breathable everyday tee',
      handle: 'linen-tee',
      images: [
        {
          alt: 'Linen tee front',
          sourceId: 'image_front',
          url: 'https://cdn.example.com/linen-front.jpg',
        },
        { url: 'https://cdn.example.com/linen-back.jpg' },
      ],
      options: [{ title: 'Size', values: ['Small', 'Large'] }],
      price: 29,
      sourceId: 'product_linen_tee',
      tags: [{ value: 'Linen' }],
      thumbnail: 'https://cdn.example.com/linen-thumb.jpg',
      title: 'Linen Tee',
      variants: [
        {
          inventoryQuantity: 7,
          manageInventory: true,
          optionValues: { Size: 'Small' },
          prices: [
            { amount: 29, currencyCode: 'USD' },
            { amount: 27, currencyCode: 'eur' },
          ],
          sku: 'LINEN-S',
          sourceId: 'variant_small',
          title: 'Small',
        },
        {
          inventoryQuantity: 0,
          manageInventory: true,
          optionValues: { Size: 'Large' },
          prices: [{ amount: 32, currencyCode: 'GBP' }],
          sku: 'LINEN-L',
          sourceId: 'variant_large',
          title: 'Large',
        },
      ],
    }

    const response = await createDeploymentMedusaProvisionResponse(
      'deployed-store',
      new Request(
        'https://ship-fast.test/api/deployments/deployed-store/provision/medusa',
        {
          body: JSON.stringify({
            anonymousOwnerSecret: 'owner-secret',
            products: [richProduct],
          }),
          method: 'POST',
        },
      ),
      client,
      provisioner,
    )

    expect(response.status).toBe(200)
    expect(provisioner.syncInitialProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        products: [
          {
            ...richProduct,
            variants: [
              {
                ...richProduct.variants[0],
                prices: [
                  { amount: 29, currencyCode: 'usd' },
                  { amount: 27, currencyCode: 'eur' },
                ],
              },
              {
                ...richProduct.variants[1],
                prices: [{ amount: 32, currencyCode: 'gbp' }],
              },
            ],
          },
        ],
      }),
    )
  })

  it('rejects invalid owners before provisioning a Medusa tenant', async () => {
    const mutation = vi.fn()
    const query = vi.fn(async (_reference, args) => {
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
    await expect(response.json()).resolves.toMatchObject({
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
    await expect(response.json()).resolves.toMatchObject({
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

  it('keeps deployment and session Store readback on the same rich normalization contract', async () => {
    const richPayload = {
      products: [
        {
          handle: 'admin-linen-tee',
          id: 'prod_linen',
          images: [{ id: 'pimg_front', url: 'https://cdn.test/front.jpg' }],
          metadata: {},
          title: 'Admin Linen Tee',
          variants: [
            {
              calculated_price: {
                calculated_amount: 29,
                currency_code: 'USD',
                original_amount: 35,
              },
              id: 'variant_small',
              inventory_quantity: 4,
              manage_inventory: true,
              prices: [{ amount: 29, currency_code: 'USD' }],
              sku: 'LINEN-S',
              title: 'Small',
            },
            {
              calculated_price: {
                calculated_amount: 32,
                currency_code: 'EUR',
                original_amount: 32,
              },
              id: 'variant_large',
              inventory_quantity: 0,
              manage_inventory: false,
              prices: [{ amount: 32, currency_code: 'EUR' }],
              sku: 'LINEN-L',
              title: 'Large',
            },
          ],
        },
      ],
    }
    const createFetch = () =>
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ regions: [{ id: 'reg_1' }] }), {
            status: 200,
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(richPayload), { status: 200 }),
        )
    const deploymentFetch = createFetch()
    const sessionFetch = createFetch()

    const deploymentResponse = await createDeploymentMedusaProductsResponse(
      'deployed-store',
      { fetch: deploymentFetch },
      createClient(),
    )
    const sessionResponse = await createSessionMedusaProductsResponse(
      'deployed-store',
      {
        containerFinder: () => Promise.resolve(undefined),
        env: {
          MEDUSA_BACKEND_URL: 'https://backend.tenant.test',
          MEDUSA_PUBLISHABLE_API_KEY: 'pk_tenant',
        },
        fetch: sessionFetch,
        metaEnv: {},
      },
      {
        mutation: vi.fn(),
        query: vi.fn().mockResolvedValue(null),
      },
    )
    const deploymentBody = await deploymentResponse.json()
    const sessionBody = await sessionResponse.json()

    expect(deploymentBody.products).toEqual(sessionBody.products)
    expect(deploymentBody.products[0]).toMatchObject({
      id: 'prod_linen',
      images: [{ sourceId: 'pimg_front', url: 'https://cdn.test/front.jpg' }],
      sourceHandle: 'admin-linen-tee',
      sourceId: 'prod_linen',
      variants: [
        {
          id: 'variant_small',
          inventoryQuantity: 4,
          sourceId: 'variant_small',
        },
        {
          available: true,
          id: 'variant_large',
          sourceId: 'variant_large',
        },
      ],
    })
    expect(
      new URL(String(deploymentFetch.mock.calls[1]?.[0])).searchParams.get(
        'fields',
      ),
    ).toBe(
      new URL(String(sessionFetch.mock.calls[1]?.[0])).searchParams.get(
        'fields',
      ),
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
    const query = vi.fn(async (_reference, args) => {
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
    const query = vi.fn(async (_reference, args) => {
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
