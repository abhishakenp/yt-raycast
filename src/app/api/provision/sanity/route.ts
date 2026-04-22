import { NextResponse } from 'next/server'

import { requireAuthUser } from '@/lib/auth/server'

type SanityProvisionResponse = {
  success?: boolean
  config?: {
    projectId?: string
    dataset?: string
    apiVersion?: string
    provisionedAt?: string
    writeToken?: string
    readToken?: string
    [key: string]: unknown
  }
  error?: string
  [key: string]: unknown
}

function sanitizeSanityConfig(config: SanityProvisionResponse['config']) {
  if (!config) return undefined
  return {
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    provisionedAt: config.provisionedAt,
  }
}

export async function POST(req: Request) {
  try {
    await requireAuthUser(req)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let sessionId = ''
  try {
    const body = (await req.json()) as { sessionId?: string }
    sessionId = String(body?.sessionId ?? '').trim()
  } catch {
    sessionId = ''
  }

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
  }

  const internalSecret = process.env.INTERNAL_API_SECRET
  if (!internalSecret) {
    return NextResponse.json({ error: 'Provisioning unavailable' }, { status: 503 })
  }

  const port = process.env.PORT || '7420'
  const url = `http://localhost:${port}/api/sessions/${encodeURIComponent(sessionId)}/provision/sanity`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: req.headers.get('authorization') || '',
        'x-internal-secret': internalSecret,
      },
    })

    const data = (await response.json().catch(() => null)) as SanityProvisionResponse | null

    if (!response.ok) {
      if (response.status === 503) {
        return NextResponse.json(
          { error: data?.error || 'Provisioning unavailable' },
          { status: 503 },
        )
      }
      return NextResponse.json({ error: data?.error || 'Provisioning failed' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      config: sanitizeSanityConfig(data?.config),
    })
  } catch {
    return NextResponse.json({ error: 'Provisioning failed' }, { status: 500 })
  }
}
