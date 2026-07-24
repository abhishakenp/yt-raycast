import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { containsOpenUiHandoffMarkers } from '../../../../convex/lib/openui_error_html'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import {
  validateRazorpayDeploymentCredentials,
  type RazorpayDeploymentCredentials,
} from '@/features/deployments/services/razorpay-deployment-credentials'

type LakebedPublishClient = Pick<
  ConvexHttpClient,
  'action' | 'mutation' | 'query'
> &
  Partial<Pick<ConvexHttpClient, 'setAuth'>>

type LakebedPublishBody = {
  anonymousOwnerSecret?: string
  razorpay?: RazorpayDeploymentCredentials
}

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init?.headers,
    },
  })
}

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get('authorization') ?? ''
  const match = auth.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || null
}

function isLakebedPublishBody(value: unknown): value is LakebedPublishBody {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    (!('anonymousOwnerSecret' in value) ||
      typeof value.anonymousOwnerSecret === 'string') &&
    (!('razorpay' in value) ||
      (value.razorpay !== null &&
        typeof value.razorpay === 'object' &&
        !Array.isArray(value.razorpay) &&
        'environment' in value.razorpay &&
        (value.razorpay.environment === 'test' ||
          value.razorpay.environment === 'live') &&
        'keyId' in value.razorpay &&
        typeof value.razorpay.keyId === 'string' &&
        'keySecret' in value.razorpay &&
        typeof value.razorpay.keySecret === 'string'))
  )
}

function isLakebedArtifactStatus(
  value: unknown,
): value is { status?: string; filesUrl?: string | null } {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    (!('status' in value) || typeof value.status === 'string') &&
    (!('filesUrl' in value) ||
      typeof value.filesUrl === 'string' ||
      value.filesUrl === null)
  )
}

function isPaymentRequiredError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /PAYMENT_REQUIRED|Subscribe|purchase/i.test(message)
}

export async function createLakebedPublishResponse(
  request: Request,
  sessionId: string,
  clientOverride?: LakebedPublishClient,
): Promise<Response> {
  let body: LakebedPublishBody = {}
  let invalidBody = false

  try {
    const parsed = await request.json()
    if (isLakebedPublishBody(parsed)) body = parsed
    else invalidBody = true
  } catch {
    body = {}
  }

  if (invalidBody) {
    return json({ error: 'Invalid Lakebed publish request.' }, { status: 400 })
  }

  if (body.razorpay !== undefined) {
    const credentialError = validateRazorpayDeploymentCredentials(body.razorpay)
    if (credentialError !== undefined) {
      return json({ error: credentialError }, { status: 400 })
    }
  }

  try {
    const client = clientOverride ?? createRuntimeConvexHttpClient(60_000)
    const token = getBearerToken(request)
    if (token !== null) client.setAuth?.(token)

    // Server-side payment gate — block non-entitled users before any deploy
    // compute starts. Mirrors the export entitlement check pattern.
    try {
      await client.mutation(
        api.sessions.assertLakebedDeploymentEntitlementByLookup,
        {
          lookup: sessionId,
          anonymousOwnerSecret: body.anonymousOwnerSecret,
        },
      )
    } catch (error) {
      if (isPaymentRequiredError(error)) {
        const message = error instanceof Error ? error.message : undefined
        return json(
          {
            error: /Subscribe to Pro|purchase download credits/i.test(
              message ?? '',
            )
              ? message
              : 'Subscribe to Pro or purchase download credits to deploy to Lakebed.',
          },
          { status: 402 },
        )
      }
      throw error
    }

    const existing = await client.query(
      api.sessions.getDeploymentStatusByLookup,
      {
        lookup: sessionId,
      },
    )
    if (existing?.provider === 'lakebed' && existing.status === 'failed') {
      return json(
        {
          status: existing.status,
          error: 'Lakebed deployment failed.',
        },
        { status: 500 },
      )
    }

    // Ensure the lakebed artifact build has been kicked off before checking
    // its status. Without this, a direct publish attempt (e.g. admin bypassing
    // the client-side prepare flow) would see a non-ready artifact and return
    // "still being prepared" without ever starting the build.
    try {
      await client.mutation(api.sessions.ensureExportArtifactByLookup, {
        lookup: sessionId,
        target: 'lakebed' as const,
        anonymousOwnerSecret: body.anonymousOwnerSecret,
      })
    } catch {
      // Build may already be in flight or the artifact is already ready —
      // proceed to check the artifact status below.
    }

    const artifactResult = await client.query(
      api.sessions.getOwnedLakebedDeploymentArtifactByLookup,
      {
        lookup: sessionId,
        anonymousOwnerSecret: body.anonymousOwnerSecret,
      },
    )
    const artifact = isLakebedArtifactStatus(artifactResult)
      ? artifactResult
      : { status: 'queued', filesUrl: null }
    if (artifact.status !== 'ready' || !artifact.filesUrl) {
      return json(
        {
          status: artifact.status ?? 'queued',
          error: 'Lakebed app is still being prepared.',
        },
        { status: 202 },
      )
    }

    try {
      const filesResponse = await fetch(artifact.filesUrl)
      if (filesResponse.ok) {
        const filesJson = (await filesResponse.json()) as {
          files?: Record<string, string>
        }
        const fileContents = Object.values(filesJson.files ?? {}).join('\n')
        if (containsOpenUiHandoffMarkers(fileContents)) {
          return json(
            { error: 'Export artifact is not a rendered static site.' },
            { status: 409 },
          )
        }
      }
    } catch {
      // Fetch failure is non-fatal; proceed to deploy.
    }

    const result = await client.action(api.lakebed_deploy.deployByLookup, {
      lookup: sessionId,
      anonymousOwnerSecret: body.anonymousOwnerSecret,
    })

    return json(result)
  } catch (error) {
    console.error('[lakebed_publish]', error)
    if (isPaymentRequiredError(error)) {
      const message = error instanceof Error ? error.message : undefined
      return json(
        {
          error: /Subscribe to Pro|purchase download credits/i.test(
            message ?? '',
          )
            ? message
            : 'Subscribe to Pro or purchase download credits to deploy to Lakebed.',
        },
        { status: 402 },
      )
    }
    return json({ error: 'Lakebed publish failed.' }, { status: 500 })
  }
}
