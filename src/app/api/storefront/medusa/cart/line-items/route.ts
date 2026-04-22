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

export async function POST(request: Request) {
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
    const body = (await request.json()) as Record<string, unknown>
    const cartId = String(body?.cart_id || '').trim()
    const variantId = String(body?.variant_id || '').trim()
    const quantity = Math.max(1, Number.parseInt(String(body?.quantity || '1'), 10) || 1)
    if (!cartId || !variantId) {
      return NextResponse.json({ error: 'cart_id and variant_id required' }, { status: 400 })
    }

    const { cart } = await client.store.cart.createLineItem(cartId, {
      variant_id: variantId,
      quantity,
    })
    return NextResponse.json({ cart })
  } catch (err) {
    console.error('[medusa/cart/line-items]', err)
    return NextResponse.json({ error: 'Unable to add line item' }, { status: 500 })
  }
}
