import { generateCustomerStackSecrets } from './secrets'
import type {
  CreateOrReconcileInstanceRequest,
  CreateOrReconcileStoreRequest,
  CustomerStackReference,
  CustomerStoreReference,
  IdempotencyStore,
  InstanceHealth,
  SwarmInfraProvider,
} from './types'

const DEFAULT_IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000

export class CommerceProvisionerError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

function requireField(
  value: string | undefined,
  field: string,
): asserts value is string {
  if (value === undefined || value.length === 0) {
    throw new CommerceProvisionerError(
      'INVALID_REQUEST',
      `${field} is required.`,
    )
  }
}

// Implements the six operations from the plan's provisioning contract
// (PUT instance, PUT store, POST suspend/resume/upgrade, DELETE, GET health)
// against an injected SwarmInfraProvider. This class contains no Dokploy- or
// k3s-specific logic — only the state machine and idempotency rules that must
// hold for any provider.
export class CommerceProvisionerService {
  constructor(
    private readonly infra: SwarmInfraProvider,
    private readonly idempotency: IdempotencyStore,
  ) {}

  // PUT semantics: idempotent by construction via reconcile-to-desired-state
  // rather than a stored idempotency key. A stack that already exists for
  // this instanceId is returned as-is.
  async createOrReconcileInstance(
    request: CreateOrReconcileInstanceRequest,
  ): Promise<CustomerStackReference> {
    requireField(request.instanceId, 'instanceId')
    requireField(request.idempotencyKey, 'idempotencyKey')
    requireField(request.imageDigest, 'imageDigest')
    requireField(request.domainSuffix, 'domainSuffix')

    const existing = await this.infra.getStack(request.instanceId)
    if (existing !== null) return existing

    const secrets = generateCustomerStackSecrets()
    return this.infra.createStack(request, secrets)
  }

  async createOrReconcileStore(
    request: CreateOrReconcileStoreRequest,
  ): Promise<CustomerStoreReference> {
    requireField(request.instanceId, 'instanceId')
    requireField(request.storeId, 'storeId')
    requireField(request.idempotencyKey, 'idempotencyKey')
    requireField(request.storeName, 'storeName')

    const instance = await this.infra.getStack(request.instanceId)
    if (instance === null) {
      throw new CommerceProvisionerError(
        'INSTANCE_NOT_FOUND',
        `No stack exists for instance ${request.instanceId}.`,
      )
    }

    return this.infra.createStore(request)
  }

  async suspend(
    instanceId: string,
    idempotencyKey: string,
  ): Promise<CustomerStackReference> {
    return this.runIdempotentLifecycleOp(
      'suspend',
      instanceId,
      idempotencyKey,
      async () => {
        await this.infra.suspendStack(instanceId)
        return this.requireStack(instanceId)
      },
    )
  }

  async resume(
    instanceId: string,
    idempotencyKey: string,
  ): Promise<CustomerStackReference> {
    return this.runIdempotentLifecycleOp(
      'resume',
      instanceId,
      idempotencyKey,
      async () => {
        await this.infra.resumeStack(instanceId)
        return this.requireStack(instanceId)
      },
    )
  }

  async upgrade(
    instanceId: string,
    idempotencyKey: string,
    imageDigest: string,
  ): Promise<CustomerStackReference> {
    requireField(imageDigest, 'imageDigest')
    return this.runIdempotentLifecycleOp(
      'upgrade',
      instanceId,
      idempotencyKey,
      async () => {
        await this.infra.upgradeStack(instanceId, imageDigest)
        return this.requireStack(instanceId)
      },
    )
  }

  async delete(
    instanceId: string,
    idempotencyKey: string,
  ): Promise<{ deleted: true }> {
    return this.runIdempotentLifecycleOp(
      'delete',
      instanceId,
      idempotencyKey,
      async () => {
        await this.infra.deleteStack(instanceId)
        return { deleted: true as const }
      },
    )
  }

  async health(instanceId: string): Promise<InstanceHealth> {
    requireField(instanceId, 'instanceId')
    return this.infra.checkHealth(instanceId)
  }

  private async requireStack(
    instanceId: string,
  ): Promise<CustomerStackReference> {
    const stack = await this.infra.getStack(instanceId)
    if (stack === null) {
      throw new CommerceProvisionerError(
        'INSTANCE_NOT_FOUND',
        `No stack exists for instance ${instanceId}.`,
      )
    }
    return stack
  }

  // suspend/resume/upgrade/delete are not naturally idempotent (unlike the
  // PUT reconcile endpoints), so retries are made safe by replaying the
  // stored result for a previously seen idempotency key instead of
  // re-running the infra operation.
  private async runIdempotentLifecycleOp<T>(
    kind: string,
    instanceId: string,
    idempotencyKey: string,
    execute: () => Promise<T>,
  ): Promise<T> {
    requireField(instanceId, 'instanceId')
    requireField(idempotencyKey, 'idempotencyKey')

    const key = `${kind}:${instanceId}:${idempotencyKey}`
    const cached = await this.idempotency.get(key)
    if (cached !== null) {
      return JSON.parse(cached) as T
    }

    const result = await execute()
    await this.idempotency.put(
      key,
      JSON.stringify(result),
      DEFAULT_IDEMPOTENCY_TTL_MS,
    )
    return result
  }
}

export function createInMemoryIdempotencyStore(): IdempotencyStore {
  const store = new Map<string, { resultJson: string; expiresAt: number }>()
  return {
    async get(key) {
      const entry = store.get(key)
      if (entry === undefined) return null
      if (entry.expiresAt <= Date.now()) {
        store.delete(key)
        return null
      }
      return entry.resultJson
    },
    async put(key, resultJson, ttlMs) {
      store.set(key, { resultJson, expiresAt: Date.now() + ttlMs })
    },
  }
}
