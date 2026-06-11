import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type CommerceApiClient = Pick<ConvexHttpClient, 'query' | 'mutation'>

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

const readJsonBody = async (request: Request): Promise<Record<string, unknown>> => {
  const text = await request.text()
  if (!text.trim()) return {}
  const parsed = JSON.parse(text) as unknown
  return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
    ? (parsed as Record<string, unknown>)
    : {}
}

const stringValue = (body: Record<string, unknown>, key: string): string | undefined => {
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
): Promise<Response> => {
  try {
    const body = await readJsonBody(request)
    const backendUrl = stringValue(body, 'backendUrl')
    const adminUrl = stringValue(body, 'adminUrl')
    const storefrontUrl = stringValue(body, 'storefrontUrl')

    if (backendUrl === undefined && adminUrl === undefined && storefrontUrl === undefined) {
      return json(
        { error: 'backendUrl, adminUrl, or storefrontUrl is required.' },
        { status: 400 },
      )
    }

    const result = await createClient(clientOverride).mutation(
      api.sessions.upsertCommerceConfig,
      {
        sessionId: sessionId as any,
        anonymousOwnerSecret: getOwnerSecret(request, body),
        backendUrl,
        adminUrl,
        storefrontUrl,
        configJson:
          body.config === undefined
            ? stringValue(body, 'configJson')
            : JSON.stringify(body.config),
      },
    )

    return json({
      ...result,
      status: 'ready',
    })
  } catch (error) {
    return errorResponse(error)
  }
}
