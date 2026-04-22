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

export async function POST() {
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
    const { regions } = await client.store.region.list()
    const regionId = regions?.[0]?.id
    if (!regionId) return NextResponse.json({ error: 'No sales region in Medusa' }, { status: 500 })
    const { cart } = await client.store.cart.create({ region_id: regionId })
    return NextResponse.json({ cart })
  } catch (err) {
    console.error('[medusa/cart]', err)
    return NextResponse.json({ error: 'Unable to create cart' }, { status: 500 })
  }
}
