import Medusa from '@medusajs/js-sdk'
import { NextResponse } from 'next/server'

const getMedusaClient = () => {
  const publishableKey = String(
    process.env.MEDUSA_PUBLISHABLE_API_KEY || process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
  ).trim()
  if (!publishableKey) return null
  const backendUrl = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
  return { client: new Medusa({ baseUrl: backendUrl, publishableKey }), backendUrl }
}

export async function GET() {
  const medusa = getMedusaClient()
  if (!medusa) {
    return NextResponse.json(
      {
        error:
          'Medusa Store API not configured (set MEDUSA_PUBLISHABLE_API_KEY or NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY)',
      },
      { status: 503 },
    )
  }
  return NextResponse.json({ enabled: true, backendUrl: medusa.backendUrl })
}
