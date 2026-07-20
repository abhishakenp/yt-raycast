import {
  type AddCommerceItemInput,
  type CommerceCartEnvelope,
  type CommerceCatalogEnvelope,
  type CreateCommerceCartInput,
  MedusaCommerceGateway,
  type UpdateCommerceItemInput,
} from './commerce-gateway'
import {
  CommerceFailure,
  commerceCorrelationId,
  commerceFailureResponse,
} from './commerce-error'
import {
  resolveCommerceTenant,
  type ResolvedCommerceTenant,
} from './commerce-tenant-resolver'

const MAX_COMMERCE_BODY_BYTES = 64_000

export type CommerceGatewayOperations = {
  addItem: (
    cartId: string,
    input: AddCommerceItemInput,
  ) => Promise<CommerceCartEnvelope>
  catalog: () => Promise<CommerceCatalogEnvelope>
  createCart: (input?: CreateCommerceCartInput) => Promise<CommerceCartEnvelope>
  getCart: (cartId: string) => Promise<CommerceCartEnvelope>
  removeItem: (cartId: string, lineId: string) => Promise<CommerceCartEnvelope>
  updateCart: (
    cartId: string,
    input: Record<string, unknown>,
  ) => Promise<CommerceCartEnvelope>
  updateItem: (
    cartId: string,
    lineId: string,
    input: UpdateCommerceItemInput,
  ) => Promise<CommerceCartEnvelope>
}

export type CommerceGatewayOperation =
  | { type: 'catalog' }
  | { type: 'create-cart' }
  | { cartId: string; type: 'get-cart' }
  | { cartId: string; type: 'update-cart' }
  | { cartId: string; type: 'add-item' }
  | { cartId: string; lineId: string; type: 'update-item' }
  | { cartId: string; lineId: string; type: 'remove-item' }

type CommerceGatewayRequest = {
  operation: CommerceGatewayOperation
  request: Request
  scope: string
  tenant: string
}

type CommerceGatewayResponseOptions = {
  createGateway?: (
    tenant: ResolvedCommerceTenant,
    correlationId: string,
  ) => CommerceGatewayOperations
  resolveTenant?: typeof resolveCommerceTenant
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function requestFailure(
  correlationId: string,
  status: 400 | 413,
): CommerceFailure {
  return new CommerceFailure({
    code:
      status === 413
        ? 'COMMERCE_REQUEST_TOO_LARGE'
        : 'INVALID_COMMERCE_REQUEST',
    correlationId,
    message:
      status === 413
        ? 'Commerce request is too large.'
        : 'Commerce request body is invalid.',
    retryable: false,
    status,
  })
}

async function readBody(
  request: Request,
  correlationId: string,
): Promise<Record<string, unknown>> {
  const text = await request.text()
  if (new TextEncoder().encode(text).byteLength > MAX_COMMERCE_BODY_BYTES) {
    throw requestFailure(correlationId, 413)
  }
  if (!text.trim()) return {}

  try {
    const value: unknown = JSON.parse(text)
    if (isRecord(value)) return value
  } catch {
    // Convert all parse failures to the same public request error.
  }
  throw requestFailure(correlationId, 400)
}

function optionalString(
  body: Record<string, unknown>,
  key: string,
  correlationId: string,
): string | undefined {
  const value = body[key]
  if (value === undefined) return undefined
  if (typeof value === 'string') return value
  throw requestFailure(correlationId, 400)
}

function requiredString(
  body: Record<string, unknown>,
  key: string,
  correlationId: string,
): string {
  const value = optionalString(body, key, correlationId)?.trim()
  if (value) return value
  throw requestFailure(correlationId, 400)
}

function requiredNumber(
  body: Record<string, unknown>,
  key: string,
  correlationId: string,
): number {
  const value = body[key]
  if (typeof value === 'number') return value
  throw requestFailure(correlationId, 400)
}

async function runOperation(
  gateway: CommerceGatewayOperations,
  operation: CommerceGatewayOperation,
  request: Request,
  correlationId: string,
): Promise<CommerceCartEnvelope | CommerceCatalogEnvelope> {
  switch (operation.type) {
    case 'catalog':
      return await gateway.catalog()
    case 'create-cart': {
      const body = await readBody(request, correlationId)
      const regionId = optionalString(body, 'regionId', correlationId)
      return await gateway.createCart(
        regionId === undefined ? {} : { regionId },
      )
    }
    case 'get-cart':
      return await gateway.getCart(operation.cartId)
    case 'update-cart':
      return await gateway.updateCart(
        operation.cartId,
        await readBody(request, correlationId),
      )
    case 'add-item': {
      const body = await readBody(request, correlationId)
      return await gateway.addItem(operation.cartId, {
        quantity: requiredNumber(body, 'quantity', correlationId),
        variantId: requiredString(body, 'variantId', correlationId),
      })
    }
    case 'update-item': {
      const body = await readBody(request, correlationId)
      return await gateway.updateItem(operation.cartId, operation.lineId, {
        quantity: requiredNumber(body, 'quantity', correlationId),
      })
    }
    case 'remove-item':
      return await gateway.removeItem(operation.cartId, operation.lineId)
  }
}

export async function handleCommerceGatewayRequest(
  input: CommerceGatewayRequest,
  options: CommerceGatewayResponseOptions = {},
): Promise<Response> {
  const correlationId = commerceCorrelationId(input.request)

  try {
    const tenant = await (options.resolveTenant ?? resolveCommerceTenant)(
      input.request,
      input.scope,
      input.tenant,
      { correlationId },
    )
    const gateway =
      options.createGateway?.(tenant, correlationId) ??
      new MedusaCommerceGateway(tenant, { correlationId })
    const result = await runOperation(
      gateway,
      input.operation,
      input.request,
      correlationId,
    )
    return Response.json(result, {
      headers: { 'x-correlation-id': correlationId },
    })
  } catch (error) {
    if (error instanceof CommerceFailure) {
      return commerceFailureResponse(error)
    }
    return commerceFailureResponse(
      new CommerceFailure(
        {
          code: 'COMMERCE_INTERNAL_ERROR',
          correlationId,
          message: 'Commerce request failed.',
          retryable: true,
          status: 500,
        },
        error,
      ),
    )
  }
}
