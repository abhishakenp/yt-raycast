import type {
  CreateOrReconcileInstanceRequest,
  CreateOrReconcileStoreRequest,
  CustomerStackReference,
  CustomerStackSecrets,
  CustomerStoreReference,
  InstanceHealth,
  SwarmInfraProvider,
} from './types'

export class DokployIntegrationUnverifiedError extends Error {
  constructor(operation: string, baseUrl: string) {
    super(
      `DokployInfraProvider.${operation} (target: ${baseUrl}) is unverified ` +
        'against the real Dokploy API/CLI and must not run against production ' +
        'infrastructure yet. Confirm the exact API/CLI surface for creating, ' +
        'suspending, resuming, upgrading, and deleting a per-customer compose ' +
        'stack on the "exodus" Dokploy host (see CLAUDE.md: `dokploy ...`, ' +
        '~/.dokploy/config.json) before implementing this method for real, ' +
        "per the plan's Phase 7 requirement of explicit user confirmation " +
        'before touching shared infra.',
    )
  }
}

export type DokployInfraProviderConfig = {
  baseUrl: string
  apiKey: string
}

// SwarmInfraProvider implementation for launch (Dokploy/Swarm). The
// business logic in service.ts and stack-template.ts is fully implemented
// and unit-tested against a fake provider; this adapter is the only piece
// that needs real Dokploy credentials and a verified API/CLI contract, so it
// is intentionally left unimplemented rather than guessing at endpoint
// shapes that could silently do the wrong thing against production.
//
// A future k3s implementation only needs to satisfy the same
// SwarmInfraProvider interface — nothing in service.ts, http.ts, or
// stack-template.ts is Dokploy-specific.
export class DokployInfraProvider implements SwarmInfraProvider {
  constructor(private readonly config: DokployInfraProviderConfig) {}

  async getStack(_instanceId: string): Promise<CustomerStackReference | null> {
    throw new DokployIntegrationUnverifiedError('getStack', this.config.baseUrl)
  }

  async createStack(
    _request: CreateOrReconcileInstanceRequest,
    _secrets: CustomerStackSecrets,
  ): Promise<CustomerStackReference> {
    throw new DokployIntegrationUnverifiedError('createStack', this.config.baseUrl)
  }

  async createStore(
    _request: CreateOrReconcileStoreRequest,
  ): Promise<CustomerStoreReference> {
    throw new DokployIntegrationUnverifiedError('createStore', this.config.baseUrl)
  }

  async suspendStack(_instanceId: string): Promise<void> {
    throw new DokployIntegrationUnverifiedError('suspendStack', this.config.baseUrl)
  }

  async resumeStack(_instanceId: string): Promise<void> {
    throw new DokployIntegrationUnverifiedError('resumeStack', this.config.baseUrl)
  }

  async upgradeStack(_instanceId: string, _imageDigest: string): Promise<void> {
    throw new DokployIntegrationUnverifiedError('upgradeStack', this.config.baseUrl)
  }

  async deleteStack(_instanceId: string): Promise<void> {
    throw new DokployIntegrationUnverifiedError('deleteStack', this.config.baseUrl)
  }

  async checkHealth(_instanceId: string): Promise<InstanceHealth> {
    throw new DokployIntegrationUnverifiedError('checkHealth', this.config.baseUrl)
  }
}
