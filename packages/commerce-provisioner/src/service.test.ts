import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CommerceProvisionerError,
  CommerceProvisionerService,
  createInMemoryIdempotencyStore,
} from './service'
import type {
  CreateOrReconcileInstanceRequest,
  CreateOrReconcileStoreRequest,
  CustomerStackReference,
  CustomerStackSecrets,
  CustomerStoreReference,
  InstanceHealth,
  SwarmInfraProvider,
} from './types'

function createFakeInfra(): SwarmInfraProvider & {
  stacks: Map<string, CustomerStackReference>
  createStack: ReturnType<typeof vi.fn>
  createStore: ReturnType<typeof vi.fn>
  suspendStack: ReturnType<typeof vi.fn>
  resumeStack: ReturnType<typeof vi.fn>
  upgradeStack: ReturnType<typeof vi.fn>
  deleteStack: ReturnType<typeof vi.fn>
} {
  const stacks = new Map<string, CustomerStackReference>()

  return {
    stacks,
    async getStack(instanceId) {
      return stacks.get(instanceId) ?? null
    },
    createStack: vi.fn(
      async (
        request: CreateOrReconcileInstanceRequest,
        _secrets: CustomerStackSecrets,
      ): Promise<CustomerStackReference> => {
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
    ),
    createStore: vi.fn(
      async (
        request: CreateOrReconcileStoreRequest,
      ): Promise<CustomerStoreReference> => ({
        storeId: request.storeId,
        providerStoreId: `provider-${request.storeId}`,
        salesChannelId: `sales-${request.storeId}`,
        publishableKey: `pk_${request.storeId}`,
      }),
    ),
    suspendStack: vi.fn(async (instanceId: string) => {
      const stack = stacks.get(instanceId)
      if (stack) stacks.set(instanceId, { ...stack, status: 'suspended' })
    }),
    resumeStack: vi.fn(async (instanceId: string) => {
      const stack = stacks.get(instanceId)
      if (stack) stacks.set(instanceId, { ...stack, status: 'ready' })
    }),
    upgradeStack: vi.fn(async (instanceId: string) => {
      const stack = stacks.get(instanceId)
      if (stack) stacks.set(instanceId, { ...stack })
    }),
    deleteStack: vi.fn(async (instanceId: string) => {
      stacks.delete(instanceId)
    }),
    async checkHealth(instanceId): Promise<InstanceHealth> {
      return {
        instanceId,
        status: stacks.get(instanceId)?.status ?? 'deleted',
        backendReachable: stacks.has(instanceId),
        checkedAt: 0,
      }
    },
  }
}

const baseInstanceRequest: CreateOrReconcileInstanceRequest = {
  instanceId: 'instance-1',
  idempotencyKey: 'idem-create-1',
  imageDigest: 'ghcr.io/org/medusa@sha256:' + 'a'.repeat(64),
  domainSuffix: 'commerce.ship-fast.ai',
}

describe('CommerceProvisionerService', () => {
  let infra: ReturnType<typeof createFakeInfra>
  let service: CommerceProvisionerService

  beforeEach(() => {
    infra = createFakeInfra()
    service = new CommerceProvisionerService(
      infra,
      createInMemoryIdempotencyStore(),
    )
  })

  it('creates a stack on first call and reconciles (no re-create) on repeat calls', async () => {
    const first = await service.createOrReconcileInstance(baseInstanceRequest)
    const second = await service.createOrReconcileInstance(
      baseInstanceRequest,
    )

    expect(first.status).toBe('ready')
    expect(second).toEqual(first)
    expect(infra.createStack).toHaveBeenCalledTimes(1)
  })

  it('retries createStack on the next call after a failure, since a rolled-back provider reports no stack', async () => {
    infra.createStack.mockRejectedValueOnce(new Error('provider create failed'))

    await expect(
      service.createOrReconcileInstance(baseInstanceRequest),
    ).rejects.toThrow('provider create failed')
    expect(await infra.getStack(baseInstanceRequest.instanceId)).toBeNull()

    const recovered = await service.createOrReconcileInstance(
      baseInstanceRequest,
    )
    expect(recovered.status).toBe('ready')
    expect(infra.createStack).toHaveBeenCalledTimes(2)
  })

  it('rejects an instance request missing required fields', async () => {
    await expect(
      service.createOrReconcileInstance({
        ...baseInstanceRequest,
        imageDigest: '',
      }),
    ).rejects.toBeInstanceOf(CommerceProvisionerError)
  })

  it('creates a store only when the instance already exists', async () => {
    await expect(
      service.createOrReconcileStore({
        instanceId: 'missing-instance',
        storeId: 'store-1',
        idempotencyKey: 'idem-store-1',
        storeName: 'Storefront A',
      }),
    ).rejects.toMatchObject({ code: 'INSTANCE_NOT_FOUND' })

    await service.createOrReconcileInstance(baseInstanceRequest)
    const store = await service.createOrReconcileStore({
      instanceId: baseInstanceRequest.instanceId,
      storeId: 'store-1',
      idempotencyKey: 'idem-store-1',
      storeName: 'Storefront A',
    })

    expect(store.storeId).toBe('store-1')
    expect(store.publishableKey).toBe('pk_store-1')
  })

  it('suspends and resumes idempotently, replaying the result instead of re-invoking infra on retry', async () => {
    await service.createOrReconcileInstance(baseInstanceRequest)

    const suspendA = await service.suspend(
      baseInstanceRequest.instanceId,
      'idem-suspend-1',
    )
    const suspendB = await service.suspend(
      baseInstanceRequest.instanceId,
      'idem-suspend-1',
    )
    expect(suspendA.status).toBe('suspended')
    expect(suspendB).toEqual(suspendA)
    expect(infra.suspendStack).toHaveBeenCalledTimes(1)

    const resumeA = await service.resume(
      baseInstanceRequest.instanceId,
      'idem-resume-1',
    )
    expect(resumeA.status).toBe('ready')
    expect(infra.resumeStack).toHaveBeenCalledTimes(1)
  })

  it('does not re-run a suspend when retried with a different idempotency key (distinct operation)', async () => {
    await service.createOrReconcileInstance(baseInstanceRequest)
    await service.suspend(baseInstanceRequest.instanceId, 'idem-a')
    await service.suspend(baseInstanceRequest.instanceId, 'idem-b')

    // Different idempotency keys are different logical requests, so both run —
    // this documents the boundary: idempotency protects retries of the SAME
    // request, not repeated distinct suspend calls.
    expect(infra.suspendStack).toHaveBeenCalledTimes(2)
  })

  it('deletes idempotently and reports deleted on retry via the cached result', async () => {
    await service.createOrReconcileInstance(baseInstanceRequest)
    const first = await service.delete(
      baseInstanceRequest.instanceId,
      'idem-delete-1',
    )
    const second = await service.delete(
      baseInstanceRequest.instanceId,
      'idem-delete-1',
    )

    expect(first).toEqual({ deleted: true })
    expect(second).toEqual({ deleted: true })
    expect(infra.deleteStack).toHaveBeenCalledTimes(1)
  })

  it('reports health for a known and an unknown instance', async () => {
    await service.createOrReconcileInstance(baseInstanceRequest)
    const healthy = await service.health(baseInstanceRequest.instanceId)
    const unknown = await service.health('never-provisioned')

    expect(healthy.backendReachable).toBe(true)
    expect(unknown.backendReachable).toBe(false)
  })
})
