import { AbstractAuthModuleProvider } from '@medusajs/framework/utils'
import type { Logger } from '@medusajs/framework/types'
import {
  importAdminSsoPublicKey,
  verifyAdminSsoToken,
  type AdminSsoNonceStore,
} from '../../lib/admin-sso-verify'

// Custom Medusa Admin auth provider for Ship Fast's Clerk-SSO "Open Admin"
// flow, per https://docs.medusajs.com/resources/app/how-to-tutorials/how-to/admin/auth
// and specs/architecture/customer-isolated-medusa-dokploy-swarm.md.
//
// UNVERIFIED: this follows Medusa's documented custom-auth-provider shape
// (AbstractAuthModuleProvider.authenticate, AuthIdentityProviderService
// retrieve/create) but the exact method names/types have not been confirmed
// against the pinned @medusajs/framework 2.18.0 types in a running instance —
// there is no Medusa test harness in this repo to verify against. Confirm
// against a real dev instance before relying on this in production.
export const ADMIN_SSO_AUTH_PROVIDER_ID = 'admin_sso'

export type AdminSsoAuthProviderOptions = {
  // Standard-base64 SPKI Ed25519 public key. Ship Fast holds the matching
  // private key; this stack never sees it.
  publicKeyBase64: string
  // This stack's own commerceInstanceId — tokens minted for any other
  // instance are rejected even when the email claim matches a real admin
  // here, per the plan's cross-instance isolation requirement.
  commerceInstanceId: string
  audience: string
}

type InjectedDependencies = {
  logger: Logger
}

function createRedisNonceStore(): AdminSsoNonceStore {
  // A real deployment should back this with this stack's own dedicated
  // Redis (already provisioned per customer instance) so single-use holds
  // across server restarts and multiple server replicas. Left as an
  // in-process fallback here since wiring the Redis client is part of the
  // same unverified-integration boundary as the rest of this module.
  const seen = new Set<string>()
  return {
    async recordIfNew(nonce) {
      if (seen.has(nonce)) return false
      seen.add(nonce)
      return true
    },
  }
}

export default class AdminSsoAuthProviderService extends AbstractAuthModuleProvider {
  static identifier = ADMIN_SSO_AUTH_PROVIDER_ID

  protected readonly logger_: Logger
  private readonly options: AdminSsoAuthProviderOptions
  private readonly nonceStore: AdminSsoNonceStore
  private publicKeyPromise: Promise<CryptoKey> | null = null

  constructor(
    { logger }: InjectedDependencies,
    options: AdminSsoAuthProviderOptions,
  ) {
    super()
    this.logger_ = logger
    this.options = options
    this.nonceStore = createRedisNonceStore()
  }

  private getPublicKey(): Promise<CryptoKey> {
    if (this.publicKeyPromise === null) {
      this.publicKeyPromise = importAdminSsoPublicKey(
        this.options.publicKeyBase64,
      )
    }
    return this.publicKeyPromise
  }

  // `userData` shape per Medusa's auth provider tutorial: for a bearer-style
  // provider this carries the raw request body/headers the admin app sent.
  // Ship Fast's "Open Admin" link is expected to POST { token } here.
  async authenticate(
    userData: { body?: { token?: unknown } },
    authIdentityProviderService: {
      retrieve: (selector: {
        entity_id: string
        provider: string
      }) => Promise<unknown>
      create: (input: {
        entity_id: string
        provider: string
        user_metadata?: Record<string, unknown>
      }) => Promise<unknown>
    },
  ): Promise<
    | { success: true; authIdentity: unknown }
    | { success: false; error: string }
  > {
    const token = userData.body?.token
    if (typeof token !== 'string' || token.length === 0) {
      return { success: false, error: 'Missing admin SSO token.' }
    }

    const publicKey = await this.getPublicKey()
    const verification = await verifyAdminSsoToken(
      publicKey,
      token,
      {
        audience: this.options.audience,
        commerceInstanceId: this.options.commerceInstanceId,
      },
      this.nonceStore,
    )

    if (!verification.ok) {
      this.logger_.warn(`Admin SSO token rejected: ${verification.error}`)
      return {
        success: false,
        error: `Admin SSO token rejected: ${verification.error}`,
      }
    }

    const { email, customerId } = verification.claims
    try {
      const authIdentity = await authIdentityProviderService.retrieve({
        entity_id: email,
        provider: ADMIN_SSO_AUTH_PROVIDER_ID,
      })
      return { success: true, authIdentity }
    } catch {
      const authIdentity = await authIdentityProviderService.create({
        entity_id: email,
        provider: ADMIN_SSO_AUTH_PROVIDER_ID,
        user_metadata: { shipFastCustomerId: customerId },
      })
      return { success: true, authIdentity }
    }
  }
}
