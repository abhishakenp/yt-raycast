// Provider-neutral contract for the private commerce-provisioner service.
// See specs/architecture/customer-isolated-medusa-dokploy-swarm.md.
//
// Ship Fast (Convex) is the source of truth for customer identity, payment
// entitlement, and lifecycle state. This service only performs infrastructure
// operations against whichever SwarmInfraProvider is configured (Dokploy for
// launch; a k3s implementation can satisfy the same interface later without
// changing this contract or any Ship Fast-facing API shape).

export type CustomerStackStatus =
  | 'provisioning'
  | 'ready'
  | 'degraded'
  | 'suspending'
  | 'suspended'
  | 'resuming'
  | 'failed'
  | 'deleting'
  | 'deleted'

export type CustomerStackSecrets = {
  jwtSecret: string
  cookieSecret: string
  databasePassword: string
}

export type CustomerStackReference = {
  instanceId: string
  status: CustomerStackStatus
  providerReference: string
  backendUrl: string
  adminUrl: string
  secretRef: string
}

export type CreateOrReconcileInstanceRequest = {
  instanceId: string
  idempotencyKey: string
  // Digest-pinned image ref, e.g. "ghcr.io/org/medusa@sha256:...". Never a
  // mutable tag: every customer stack must run the exact same build.
  imageDigest: string
  domainSuffix: string // e.g. "commerce.ship-fast.ai" -> "<instanceId>.commerce.ship-fast.ai"
}

export type CreateOrReconcileStoreRequest = {
  instanceId: string
  storeId: string
  idempotencyKey: string
  storeName: string
}

export type CustomerStoreReference = {
  storeId: string
  providerStoreId: string
  salesChannelId: string
  publishableKey: string
}

export type InstanceHealth = {
  instanceId: string
  status: CustomerStackStatus
  backendReachable: boolean
  checkedAt: number
}

// The minimal set of infrastructure operations the provisioner needs from
// whatever swarm-style orchestrator is configured. Dokploy is the launch
// implementation (see dokploy-client.ts); a k3s implementation only needs to
// satisfy this same interface for the provisioner's HTTP contract, idempotency,
// and lifecycle logic to keep working unchanged.
export interface SwarmInfraProvider {
  getStack(instanceId: string): Promise<CustomerStackReference | null>
  // Must roll back any partially created resources (database, volumes,
  // network, services) before rejecting, so a failed create never leaves
  // orphaned infra for the service layer to retry against — the retry after
  // a rejection must see getStack(instanceId) === null, not a half-built stack.
  createStack(
    request: CreateOrReconcileInstanceRequest,
    secrets: CustomerStackSecrets,
  ): Promise<CustomerStackReference>
  createStore(
    request: CreateOrReconcileStoreRequest,
  ): Promise<CustomerStoreReference>
  suspendStack(instanceId: string): Promise<void>
  resumeStack(instanceId: string): Promise<void>
  upgradeStack(instanceId: string, imageDigest: string): Promise<void>
  deleteStack(instanceId: string): Promise<void>
  checkHealth(instanceId: string): Promise<InstanceHealth>
}

// Durable retry-safety for the non-idempotent-by-nature lifecycle verbs
// (suspend/resume/upgrade/delete are POST/DELETE, not naturally idempotent
// like the PUT create/reconcile endpoints). A real deployment backs this with
// Redis or a small table; tests use an in-memory implementation.
export interface IdempotencyStore {
  get(key: string): Promise<string | null> // returns stored resultJson, if any
  put(key: string, resultJson: string, ttlMs: number): Promise<void>
}
