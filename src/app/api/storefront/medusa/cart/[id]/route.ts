import Medusa from '@medusajs/js-sdk'
import { NextResponse } from 'next/server'

const getMedusaClient = () => {
  const publishableKey = String(
    process.env.MEDUSA_PUBLISHABLE_API_KEY || process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
  ).trim()
  if (!publishableKey) return null
  return new Medusa({
    baseUrl: process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000',
    publishableKey,
  })
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const client = getMedusaClient()
  if (!client) {
    return NextResponse.json(
      {
        error:
          'Medusa Store API not configured (set MEDUSA_PUBLISHABLE_API_KEY or NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY)',
      },
      { status: 503 },
    )
  }

  try {
    const { id } = await params
    const { cart } = await client.store.cart.retrieve(id)
    return NextResponse.json({ cart })
  } catch (err) {
    console.error('[medusa/cart/[id]]', err)
    return NextResponse.json({ error: 'Unable to retrieve cart' }, { status: 500 })
  }
}
