import type { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import { CommerceFailure } from './commerce-error'

const SESSION_ID_PATTERN = /^[a-z0-9]{32}$/
const DEPLOYMENT_SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/
const MAX_OWNER_SECRET_LENGTH = 1024
const MAX_BEARER_LENGTH = 8192

export type CommerceScope = 'sessions' | 'deployments'

export type ResolvedCommerceTenant = {
  backendUrl: string
  publishableKey: string
  scope: CommerceScope
  tenant: string
}

export type CommerceTenantResolverClient = Pick<
  ConvexHttpClient,
  'query' | 'setAuth'
>

type ResolveCommerceTenantOptions = {
  client?: CommerceTenantResolverClient
  correlationId: string
}

function failure(
  correlationId: string,
  input: {
    code: string
    message: string
    retryable?: boolean
    status: number
  },
  cause?: unknown,
): CommerceFailure {
  return new CommerceFailure(
    {
      code: input.code,
      correlationId,
      message: input.message,
      retryable: input.retryable ?? false,
      status: input.status,
    },
    cause,
  )
}

function parseScope(value: string, correlationId: string): CommerceScope {
  if (value === 'sessions' || value === 'deployments') return value
  throw failure(correlationId, {
    code: 'INVALID_COMMERCE_SCOPE',
    message: 'Commerce scope must be sessions or deployments.',
    status: 400,
  })
}

function parseTenant(
  scope: CommerceScope,
  value: string,
  correlationId: string,
): string {
  const normalized = value.trim()
  const valid =
    scope === 'sessions'
      ? SESSION_ID_PATTERN.test(normalized)
      : DEPLOYMENT_SLUG_PATTERN.test(normalized)
  if (valid) return normalized
  throw failure(correlationId, {
    code: 'INVALID_COMMERCE_TENANT',
    message: 'Commerce tenant identifier is invalid.',
    status: 400,
  })
}

function bearerToken(request: Request): string | undefined {
  const match = request.headers.get('authorization')?.match(/^Bearer\s+(\S+)$/i)
  const token = match?.[1]?.trim()
  return token !== undefined && token.length <= MAX_BEARER_LENGTH
    ? token
    : undefined
}

function anonymousOwnerSecret(request: Request): string | undefined {
  const value = request.headers.get('x-ship-fast-owner-secret')?.trim()
  return value !== undefined &&
    value.length > 0 &&
    value.length <= MAX_OWNER_SECRET_LENGTH
    ? value
    : undefined
}

function convexErrorCode(error: unknown): string | undefined {
  if (error === null || typeof error !== 'object' || !('data' in error)) {
    return undefined
  }
  const data = error.data
  return data !== null &&
    typeof data === 'object' &&
    'code' in data &&
    typeof data.code === 'string'
    ? data.code
    : undefined
}

function normalizeResolvedTenant(
  value: unknown,
  scope: CommerceScope,
  tenant: string,
  correlationId: string,
): ResolvedCommerceTenant {
  if (value === null) {
    throw failure(correlationId, {
      code: 'COMMERCE_TENANT_NOT_FOUND',
      message: 'Commerce tenant is unavailable.',
      status: 404,
    })
  }
  if (
    typeof value !== 'object' ||
    !('backendUrl' in value) ||
    !('publishableKey' in value) ||
    typeof value.backendUrl !== 'string' ||
    typeof value.publishableKey !== 'string'
  ) {
    throw failure(correlationId, {
      code: 'COMMERCE_CONFIG_UNAVAILABLE',
      message: 'Commerce tenant configuration is unavailable.',
      retryable: true,
      status: 503,
    })
  }

  const backendUrl = value.backendUrl.trim().replace(/\/+$/, '')
  const publishableKey = value.publishableKey.trim()
  let parsedBackendUrl: URL
  try {
    parsedBackendUrl = new URL(backendUrl)
  } catch {
    throw failure(correlationId, {
      code: 'COMMERCE_CONFIG_UNAVAILABLE',
      message: 'Commerce tenant configuration is unavailable.',
      retryable: true,
      status: 503,
    })
  }
  if (
    (parsedBackendUrl.protocol !== 'http:' &&
      parsedBackendUrl.protocol !== 'https:') ||
    parsedBackendUrl.username.length > 0 ||
    parsedBackendUrl.password.length > 0 ||
    publishableKey.length === 0 ||
    publishableKey.length > 512
  ) {
    throw failure(correlationId, {
      code: 'COMMERCE_CONFIG_UNAVAILABLE',
      message: 'Commerce tenant configuration is unavailable.',
      retryable: true,
      status: 503,
    })
  }

  return { backendUrl, publishableKey, scope, tenant }
}

export async function resolveCommerceTenant(
  request: Request,
  scopeValue: string,
  tenantValue: string,
  options: ResolveCommerceTenantOptions,
): Promise<ResolvedCommerceTenant> {
  const { correlationId } = options
  const scope = parseScope(scopeValue, correlationId)
  const tenant = parseTenant(scope, tenantValue, correlationId)
  const client = options.client ?? createRuntimeConvexHttpClient()

  try {
    if (scope === 'sessions') {
      const token = bearerToken(request)
      const ownerSecret = anonymousOwnerSecret(request)
      if (token === undefined && ownerSecret === undefined) {
        throw failure(correlationId, {
          code: 'COMMERCE_AUTH_REQUIRED',
          message: 'Session commerce ownership is required.',
          status: 401,
        })
      }
      if (token !== undefined) client.setAuth(token)
      const result = await client.query(
        api.sessions.resolveCommerceSessionGateway,
        {
          anonymousOwnerSecret: ownerSecret,
          sessionId: tenant as Id<'sessions'>,
        },
      )
      return normalizeResolvedTenant(result, scope, tenant, correlationId)
    }

    const result = await client.query(
      api.sessions.resolveCommerceDeploymentGateway,
      { deploymentSlug: tenant },
    )
    return normalizeResolvedTenant(result, scope, tenant, correlationId)
  } catch (error) {
    if (error instanceof CommerceFailure) throw error
    const code = convexErrorCode(error)
    if (code === 'FORBIDDEN') {
      throw failure(
        correlationId,
        {
          code: 'COMMERCE_ACCESS_DENIED',
          message: 'Commerce tenant access denied.',
          status: 403,
        },
        error,
      )
    }
    if (code === 'NOT_FOUND') {
      throw failure(
        correlationId,
        {
          code: 'COMMERCE_TENANT_NOT_FOUND',
          message: 'Commerce tenant is unavailable.',
          status: 404,
        },
        error,
      )
    }
    throw failure(
      correlationId,
      {
        code: 'COMMERCE_CONFIG_UNAVAILABLE',
        message: 'Commerce tenant configuration is unavailable.',
        retryable: true,
        status: 503,
      },
      error,
    )
  }
}
