import { CommerceProvisionerError } from './service'
import type { CommerceProvisionerService } from './service'

function json(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
}

function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false
  let diff = 0
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return diff === 0
}

async function readJsonBody(
  request: Request,
): Promise<Record<string, unknown>> {
  try {
    const parsed: unknown = await request.json()
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

const INSTANCE_PATH = /^\/v1\/instances\/([^/]+)$/
const INSTANCE_STORE_PATH = /^\/v1\/instances\/([^/]+)\/stores\/([^/]+)$/
const INSTANCE_ACTION_PATH =
  /^\/v1\/instances\/([^/]+)\/(suspend|resume|upgrade)$/
const INSTANCE_HEALTH_PATH = /^\/v1\/instances\/([^/]+)\/health$/

export type CommerceProvisionerHttpDeps = {
  service: CommerceProvisionerService
  // Dedicated service credential (never a customer- or Ship-Fast-user-facing
  // secret). Only Ship Fast's backend holds this, per the plan's "Only the
  // provisioner receives Dokploy credentials" boundary in reverse: only Ship
  // Fast's backend may call the provisioner.
  serviceCredential: string
}

// Every mutating call requires both a valid service credential AND an
// idempotency key, per the plan's provisioning contract.
export function createCommerceProvisionerHttpHandler(
  deps: CommerceProvisionerHttpDeps,
): (request: Request) => Promise<Response> {
  return async (request) => {
    const authHeader = request.headers.get('authorization') ?? ''
    const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1] ?? ''
    if (token.length === 0 || !timingSafeEqual(token, deps.serviceCredential)) {
      return json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const url = new URL(request.url)
    const idempotencyKey = request.headers.get('idempotency-key') ?? ''

    try {
      const healthMatch = url.pathname.match(INSTANCE_HEALTH_PATH)
      if (healthMatch && request.method === 'GET') {
        return json(await deps.service.health(healthMatch[1]))
      }

      const storeMatch = url.pathname.match(INSTANCE_STORE_PATH)
      if (storeMatch && request.method === 'PUT') {
        const body = await readJsonBody(request)
        const store = await deps.service.createOrReconcileStore({
          instanceId: storeMatch[1],
          storeId: storeMatch[2],
          idempotencyKey,
          storeName: String(body.storeName ?? ''),
        })
        return json(store)
      }

      const instanceMatch = url.pathname.match(INSTANCE_PATH)
      if (instanceMatch && request.method === 'PUT') {
        const body = await readJsonBody(request)
        const stack = await deps.service.createOrReconcileInstance({
          instanceId: instanceMatch[1],
          idempotencyKey,
          imageDigest: String(body.imageDigest ?? ''),
          domainSuffix: String(body.domainSuffix ?? ''),
        })
        return json(stack)
      }
      if (instanceMatch && request.method === 'DELETE') {
        return json(
          await deps.service.delete(instanceMatch[1], idempotencyKey),
        )
      }

      const actionMatch = url.pathname.match(INSTANCE_ACTION_PATH)
      if (actionMatch && request.method === 'POST') {
        const [, instanceId, action] = actionMatch
        if (action === 'suspend') {
          return json(await deps.service.suspend(instanceId, idempotencyKey))
        }
        if (action === 'resume') {
          return json(await deps.service.resume(instanceId, idempotencyKey))
        }
        const body = await readJsonBody(request)
        return json(
          await deps.service.upgrade(
            instanceId,
            idempotencyKey,
            String(body.imageDigest ?? ''),
          ),
        )
      }

      return json({ error: 'Not found.' }, { status: 404 })
    } catch (error) {
      if (error instanceof CommerceProvisionerError) {
        const status = error.code === 'INSTANCE_NOT_FOUND' ? 404 : 400
        return json({ error: error.message, code: error.code }, { status })
      }
      return json({ error: 'Provisioner request failed.' }, { status: 502 })
    }
  }
}
