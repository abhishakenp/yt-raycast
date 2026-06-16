import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import {
  getMedusaAdminEmail,
  getMedusaAdminPassword,
  getMedusaAdminUrl,
  getMedusaBackendUrl,
  getMedusaPublishableKey,
  getMedusaStorefrontUrl,
  hasConfiguredMedusaBackendUrl,
  type MedusaEnv,
} from './medusa-store-env'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type CommerceApiClient = Pick<ConvexHttpClient, 'query' | 'mutation'>
type FetchLike = typeof fetch
type MedusaProvisionOptions = {
  env?: MedusaEnv
  fetch?: FetchLike
  metaEnv?: MedusaEnv
}
type MedusaStoreApiAvailability = {
  liveStoreApiReady: boolean
  warning?: string
  status?: number
}
type MedusaHandoff = {
  adminEmail?: string
  adminPassword?: string
  adminUrl: string
  backendUrl: string
  storefrontUrl: string
  tenantId: string
}

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

const readJsonBody = async (
  request: Request,
): Promise<Record<string, unknown>> => {
  const text = await request.text()
  if (!text.trim()) return {}
  const parsed = JSON.parse(text) as unknown
  return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
    ? (parsed as Record<string, unknown>)
    : {}
}

const stringValue = (
  body: Record<string, unknown>,
  key: string,
): string | undefined => {
  const value = body[key]
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

const getOwnerSecret = (
  request: Request,
  body: Record<string, unknown>,
): string | undefined =>
  stringValue(body, 'anonymousOwnerSecret') ??
  stringValue(body, 'anonOwnerSecret') ??
  request.headers.get('x-ship-fast-owner-secret') ??
  undefined

const createClient = (clientOverride?: CommerceApiClient): CommerceApiClient =>
  clientOverride ?? createRuntimeConvexHttpClient()

const errorStatus = (error: unknown): number => {
  const message = error instanceof Error ? error.message : String(error)
  if (/FORBIDDEN|own/i.test(message)) return 403
  if (/NOT_FOUND|Validator: v\.id\("sessions"\)/i.test(message)) return 404
  return 500
}

const errorResponse = (error: unknown) =>
  json(
    {
      error: error instanceof Error ? error.message : 'Commerce request failed',
    },
    { status: errorStatus(error) },
  )

const validateMedusaStoreApi = async (
  backendUrl: string,
  publishableKey: string,
  fetchImpl: FetchLike,
): Promise<MedusaStoreApiAvailability> => {
  if (!publishableKey.trim()) {
    return {
      liveStoreApiReady: false,
      warning: 'Medusa Store API not configured.',
    }
  }

  try {
    const response = await fetchImpl(`${backendUrl}/store/regions`, {
      headers: {
        'x-publishable-api-key': publishableKey.trim(),
      },
    })

    if (!response.ok) {
      return {
        liveStoreApiReady: false,
        status: response.status,
        warning: 'Medusa Store API is unavailable.',
      }
    }

    return { liveStoreApiReady: true }
  } catch (error) {
    return {
      liveStoreApiReady: false,
      warning:
        error instanceof Error
          ? `Medusa Store API is unavailable: ${error.message}`
          : 'Medusa Store API is unavailable.',
    }
  }
}

const createDefaultMedusaConfigJson = (
  sessionId: string,
  availability: MedusaStoreApiAvailability,
): string =>
  JSON.stringify({
    provider: 'medusa',
    tenantMode: 'session',
    tenantId: sessionId,
    publishableKeyConfigured: availability.liveStoreApiReady,
    liveStoreApiReady: availability.liveStoreApiReady,
    ...(availability.warning === undefined
      ? {}
      : { warning: availability.warning }),
    ...(availability.status === undefined
      ? {}
      : { storeApiStatus: availability.status }),
  })

const createMedusaHandoff = (
  sessionId: string,
  backendUrl: string,
  adminUrl: string,
  storefrontUrl: string,
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): MedusaHandoff | undefined => {
  if (!hasConfiguredMedusaBackendUrl(env, metaEnv)) return undefined

  const adminEmail = getMedusaAdminEmail(env, metaEnv)
  const adminPassword = getMedusaAdminPassword(env, metaEnv)

  return {
    ...(adminEmail === undefined ? {} : { adminEmail }),
    ...(adminPassword === undefined ? {} : { adminPassword }),
    adminUrl,
    backendUrl,
    storefrontUrl,
    tenantId: sessionId,
  }
}

export const createSessionMedusaConfigResponse = async (
  sessionId: string,
  clientOverride?: CommerceApiClient,
): Promise<Response> => {
  try {
    const config = await createClient(clientOverride).query(
      api.sessions.getCommerceConfig,
      { sessionId: sessionId as any },
    )

    return json({
      enabled: config?.status === 'ready',
      sessionId,
      config,
    })
  } catch (error) {
    return errorResponse(error)
  }
}

export const createSessionMedusaProvisionResponse = async (
  sessionId: string,
  request: Request,
  clientOverride?: CommerceApiClient,
  options: MedusaProvisionOptions = {},
): Promise<Response> => {
  try {
    const body = await readJsonBody(request)
    const backendUrl = getMedusaBackendUrl(options.env, options.metaEnv)
    const adminUrl = getMedusaAdminUrl(options.env, options.metaEnv)
    const storefrontUrl = getMedusaStorefrontUrl(options.env, options.metaEnv)
    const publishableKey = getMedusaPublishableKey(options.env, options.metaEnv)
    const handoff = createMedusaHandoff(
      sessionId,
      backendUrl,
      adminUrl,
      storefrontUrl,
      options.env,
      options.metaEnv,
    )
    const availability = await validateMedusaStoreApi(
      backendUrl,
      publishableKey,
      options.fetch ?? fetch,
    )

    const result = await createClient(clientOverride).mutation(
      api.sessions.upsertCommerceConfig,
      {
        sessionId: sessionId as any,
        anonymousOwnerSecret: getOwnerSecret(request, body),
        backendUrl,
        adminUrl,
        storefrontUrl,
        errorMessage: availability.warning,
        configJson:
          body.config === undefined
            ? (stringValue(body, 'configJson') ??
              createDefaultMedusaConfigJson(sessionId, availability))
            : JSON.stringify(body.config),
      },
    )

    return json({
      ...result,
      handoff,
      liveStoreApiReady: availability.liveStoreApiReady,
      status: 'ready',
      ...(availability.warning === undefined
        ? {}
        : { warning: availability.warning }),
    })
  } catch (error) {
    return errorResponse(error)
  }
}
