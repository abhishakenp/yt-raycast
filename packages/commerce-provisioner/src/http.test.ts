import { describe, expect, it } from 'vitest'
import { createCommerceProvisionerHttpHandler } from './http'
import { CommerceProvisionerService, createInMemoryIdempotencyStore } from './service'
import type {
  CreateOrReconcileInstanceRequest,
  CreateOrReconcileStoreRequest,
  CustomerStackReference,
  CustomerStackSecrets,
  CustomerStoreReference,
  InstanceHealth,
  SwarmInfraProvider,
} from './types'

const SERVICE_CREDENTIAL = 'test-service-credential'

function createHandler() {
  const stacks = new Map<string, CustomerStackReference>()
  const infra: SwarmInfraProvider = {
    async getStack(instanceId) {
      return stacks.get(instanceId) ?? null
    },
    async createStack(
      request: CreateOrReconcileInstanceRequest,
      _secrets: CustomerStackSecrets,
    ) {
      const stack: CustomerStackReference = {
        instanceId: request.instanceId,
        status: 'ready',
        providerReference: `stack-${request.instanceId}`,
        backendUrl: `https://${request.instanceId}.example`,
        adminUrl: `https://${request.instanceId}.example/app`,
        secretRef: `secret-${request.instanceId}`,
      }
      stacks.set(request.instanceId, stack)
      return stack
    },
    async createStore(
      request: CreateOrReconcileStoreRequest,
    ): Promise<CustomerStoreReference> {
      return {
        storeId: request.storeId,
        providerStoreId: `provider-${request.storeId}`,
        salesChannelId: `sales-${request.storeId}`,
        publishableKey: `pk_${request.storeId}`,
      }
    },
    async suspendStack(instanceId) {
      const stack = stacks.get(instanceId)
      if (stack) stacks.set(instanceId, { ...stack, status: 'suspended' })
    },
    async resumeStack(instanceId) {
      const stack = stacks.get(instanceId)
      if (stack) stacks.set(instanceId, { ...stack, status: 'ready' })
    },
    async upgradeStack() {},
    async deleteStack(instanceId) {
      stacks.delete(instanceId)
    },
    async checkHealth(instanceId): Promise<InstanceHealth> {
      return {
        instanceId,
        status: stacks.get(instanceId)?.status ?? 'deleted',
        backendReachable: stacks.has(instanceId),
        checkedAt: 0,
      }
    },
  }

  const service = new CommerceProvisionerService(
    infra,
    createInMemoryIdempotencyStore(),
  )
  return createCommerceProvisionerHttpHandler({
    service,
    serviceCredential: SERVICE_CREDENTIAL,
  })
}

function authedRequest(
  input: string,
  init: RequestInit & { idempotencyKey?: string } = {},
): Request {
  const { idempotencyKey, headers, ...rest } = init
  return new Request(`https://provisioner.internal${input}`, {
    ...rest,
    headers: {
      authorization: `Bearer ${SERVICE_CREDENTIAL}`,
      'content-type': 'application/json',
      ...(idempotencyKey ? { 'idempotency-key': idempotencyKey } : {}),
      ...headers,
    },
  })
}

describe('createCommerceProvisionerHttpHandler', () => {
  it('rejects requests without a valid service credential', async () => {
    const handler = createHandler()
    const response = await handler(
      new Request('https://provisioner.internal/v1/instances/instance-1', {
        method: 'PUT',
        headers: { authorization: 'Bearer wrong-credential' },
        body: '{}',
      }),
    )
    expect(response.status).toBe(401)
  })

  it('creates an instance via PUT and returns public URLs and a secretRef, never raw secrets', async () => {
    const handler = createHandler()
    const response = await handler(
      authedRequest('/v1/instances/instance-1', {
        method: 'PUT',
        idempotencyKey: 'idem-1',
        body: JSON.stringify({
          imageDigest: 'ghcr.io/org/medusa@sha256:' + 'a'.repeat(64),
          domainSuffix: 'commerce.ship-fast.ai',
        }),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      instanceId: 'instance-1',
      status: 'ready',
      backendUrl: expect.any(String),
      adminUrl: expect.any(String),
      secretRef: expect.any(String),
    })
    expect(JSON.stringify(body)).not.toMatch(/jwt|cookie|password/i)
  })

  it('creates a store under an existing instance and 404s for a missing instance', async () => {
    const handler = createHandler()
    await handler(
      authedRequest('/v1/instances/instance-1', {
        method: 'PUT',
        idempotencyKey: 'idem-1',
        body: JSON.stringify({
          imageDigest: 'ghcr.io/org/medusa@sha256:' + 'a'.repeat(64),
          domainSuffix: 'commerce.ship-fast.ai',
        }),
      }),
    )

    const storeResponse = await handler(
      authedRequest('/v1/instances/instance-1/stores/store-1', {
        method: 'PUT',
        idempotencyKey: 'idem-store-1',
        body: JSON.stringify({ storeName: 'Storefront A' }),
      }),
    )
    expect(storeResponse.status).toBe(200)
    await expect(storeResponse.json()).resolves.toMatchObject({
      storeId: 'store-1',
      publishableKey: 'pk_store-1',
    })

    const missingResponse = await handler(
      authedRequest('/v1/instances/missing/stores/store-1', {
        method: 'PUT',
        idempotencyKey: 'idem-store-2',
        body: JSON.stringify({ storeName: 'Storefront B' }),
      }),
    )
    expect(missingResponse.status).toBe(404)
  })

  it('suspends, resumes, and reports health through the lifecycle actions', async () => {
    const handler = createHandler()
    await handler(
      authedRequest('/v1/instances/instance-1', {
        method: 'PUT',
        idempotencyKey: 'idem-1',
        body: JSON.stringify({
          imageDigest: 'ghcr.io/org/medusa@sha256:' + 'a'.repeat(64),
          domainSuffix: 'commerce.ship-fast.ai',
        }),
      }),
    )

    const suspendResponse = await handler(
      authedRequest('/v1/instances/instance-1/suspend', {
        method: 'POST',
        idempotencyKey: 'idem-suspend-1',
      }),
    )
    await expect(suspendResponse.json()).resolves.toMatchObject({
      status: 'suspended',
    })

    const resumeResponse = await handler(
      authedRequest('/v1/instances/instance-1/resume', {
        method: 'POST',
        idempotencyKey: 'idem-resume-1',
      }),
    )
    await expect(resumeResponse.json()).resolves.toMatchObject({
      status: 'ready',
    })

    const healthResponse = await handler(
      authedRequest('/v1/instances/instance-1/health', { method: 'GET' }),
    )
    await expect(healthResponse.json()).resolves.toMatchObject({
      backendReachable: true,
    })
  })

  it('deletes an instance via DELETE', async () => {
    const handler = createHandler()
    await handler(
      authedRequest('/v1/instances/instance-1', {
        method: 'PUT',
        idempotencyKey: 'idem-1',
        body: JSON.stringify({
          imageDigest: 'ghcr.io/org/medusa@sha256:' + 'a'.repeat(64),
          domainSuffix: 'commerce.ship-fast.ai',
        }),
      }),
    )
    const deleteResponse = await handler(
      authedRequest('/v1/instances/instance-1', {
        method: 'DELETE',
        idempotencyKey: 'idem-delete-1',
      }),
    )
    await expect(deleteResponse.json()).resolves.toEqual({ deleted: true })

    const healthResponse = await handler(
      authedRequest('/v1/instances/instance-1/health', { method: 'GET' }),
    )
    await expect(healthResponse.json()).resolves.toMatchObject({
      backendReachable: false,
    })
  })

  it('returns 404 for unknown routes', async () => {
    const handler = createHandler()
    const response = await handler(
      authedRequest('/v1/unknown-route', { method: 'GET' }),
    )
    expect(response.status).toBe(404)
  })
})
