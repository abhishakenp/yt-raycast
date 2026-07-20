import { CommerceFailure } from './commerce-error'
import { MedusaCommerceGateway } from './commerce-gateway'
import {
  getMedusaBackendUrl,
  getMedusaPublishableKey,
} from './medusa-store-env'

const LEGACY_TENANT = 'legacy'

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status })
}

function gateway(): MedusaCommerceGateway | undefined {
  const publishableKey = getMedusaPublishableKey().trim()
  if (!publishableKey) return undefined

  return new MedusaCommerceGateway(
    {
      backendUrl: getMedusaBackendUrl().replace(/\/+$/, ''),
      publishableKey,
      scope: 'deployments',
      tenant: LEGACY_TENANT,
    },
    {
      allowPrivateBackendFromTrustedConfiguration: true,
      bindCarts: false,
      correlationId: crypto.randomUUID(),
      validateCartBeforeMutation: false,
    },
  )
}

function failureCode(error: unknown): string | undefined {
  return error instanceof CommerceFailure ? error.commerceError.code : undefined
}

function upstreamStatus(error: unknown): number | undefined {
  return error instanceof CommerceFailure &&
    (error.commerceError.code === 'COMMERCE_PROVIDER_ERROR' ||
      error.commerceError.code === 'COMMERCE_REGION_ERROR')
    ? error.status
    : undefined
}

export async function createLegacyMedusaCartResponse(): Promise<Response> {
  const commerce = gateway()
  if (commerce === undefined) {
    return json(
      {
        error:
          'Medusa Store API not configured (set MEDUSA_PUBLISHABLE_API_KEY or NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY)',
      },
      503,
    )
  }

  try {
    return json(await commerce.createCart())
  } catch (error) {
    if (failureCode(error) === 'COMMERCE_REGION_ERROR') {
      return json({ error: 'regions fetch failed' }, upstreamStatus(error))
    }
    if (failureCode(error) === 'COMMERCE_REGION_UNAVAILABLE') {
      return json({ error: 'No sales region in Medusa' }, 500)
    }
    return json({ error: 'cart create failed' }, upstreamStatus(error) ?? 500)
  }
}

export async function getLegacyMedusaCartResponse(
  cartId: string,
): Promise<Response> {
  const commerce = gateway()
  if (commerce === undefined) {
    return json({ error: 'Medusa Store API not configured' }, 503)
  }

  try {
    return json(await commerce.getCart(cartId))
  } catch (error) {
    if (failureCode(error) === 'INVALID_CART_ID') {
      return json({ error: 'Invalid cart id' }, 400)
    }
    return json({ error: 'cart retrieve failed' }, upstreamStatus(error) ?? 500)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export async function createLegacyMedusaLineItemResponse(
  request: Request,
): Promise<Response> {
  const commerce = gateway()
  if (commerce === undefined) {
    return json({ error: 'Medusa Store API not configured' }, 503)
  }

  let body: Record<string, unknown>
  try {
    const value: unknown = await request.json()
    if (!isRecord(value)) throw new Error('Invalid body')
    body = value
  } catch {
    return json({ error: 'Invalid line item request body' }, 400)
  }

  const cartId = String(body.cart_id || '').trim()
  const variantId = String(body.variant_id || '').trim()
  const quantity = Math.max(
    1,
    Number.parseInt(String(body.quantity || '1'), 10) || 1,
  )
  if (!cartId || !variantId) {
    return json({ error: 'cart_id and variant_id required' }, 400)
  }

  try {
    return json(
      await commerce.addItem(cartId, {
        quantity,
        variantId,
      }),
    )
  } catch (error) {
    if (failureCode(error) === 'INVALID_CART_ID') {
      return json({ error: 'Invalid cart id' }, 400)
    }
    return json({ error: 'line item failed' }, upstreamStatus(error) ?? 500)
  }
}
