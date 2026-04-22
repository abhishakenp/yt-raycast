import { NextResponse } from 'next/server'

const getMedusaConfig = (request: Request) => {
  const url = new URL(request.url)
  const publishableKey = String(url.searchParams.get('publishableKey') || '').trim()
  const sessionId = String(url.searchParams.get('sessionId') || '').trim()
  const backendUrl = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
  const fallbackKey = String(
    process.env.MEDUSA_PUBLISHABLE_API_KEY || process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
  ).trim()

  return {
    backendUrl,
    publishableKey: publishableKey || fallbackKey,
    sessionId,
  }
}

export async function GET(request: Request) {
  const medusa = getMedusaConfig(request)
  return NextResponse.json({
    enabled: Boolean(medusa.publishableKey),
    backendUrl: medusa.backendUrl,
    publishableKey: medusa.publishableKey,
  })
}
