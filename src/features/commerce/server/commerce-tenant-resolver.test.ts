import { describe, expect, it, vi } from 'vitest'

import {
  resolveCommerceTenant,
  type CommerceTenantResolverClient,
} from './commerce-tenant-resolver'

const sessionId = 'k574ms14ma9f94keq30r7dq24x89n1k2'

const resolverClient = (
  result: unknown,
): {
  client: CommerceTenantResolverClient
  query: ReturnType<typeof vi.fn>
  setAuth: ReturnType<typeof vi.fn>
} => {
  const query = vi.fn().mockResolvedValue(result)
  const setAuth = vi.fn()
  return {
    client: { query, setAuth } as unknown as CommerceTenantResolverClient,
    query,
    setAuth,
  }
}

describe('commerce tenant resolver', () => {
  it('rejects invalid scope and tenant identifiers before querying Convex', async () => {
    const { client, query } = resolverClient(null)
    const request = new Request('https://ship-fast.test')

    await expect(
      resolveCommerceTenant(request, 'stores', 'tenant-a', {
        client,
        correlationId: 'scope-correlation',
      }),
    ).rejects.toMatchObject({
      commerceError: { code: 'INVALID_COMMERCE_SCOPE' },
      status: 400,
    })
    await expect(
      resolveCommerceTenant(request, 'sessions', '../session', {
        client,
        correlationId: 'tenant-correlation',
      }),
    ).rejects.toMatchObject({
      commerceError: { code: 'INVALID_COMMERCE_TENANT' },
      status: 400,
    })
    await expect(
      resolveCommerceTenant(request, 'deployments', 'store/a', {
        client,
        correlationId: 'tenant-correlation',
      }),
    ).rejects.toMatchObject({
      commerceError: { code: 'INVALID_COMMERCE_TENANT' },
      status: 400,
    })
    expect(query).not.toHaveBeenCalled()
  })

  it('authenticates session access with a bearer JWT', async () => {
    const gateway = {
      backendUrl: 'https://session-a.medusa.test',
      publishableKey: 'pk_session_a',
      scope: 'sessions',
      tenant: sessionId,
    }
    const { client, query, setAuth } = resolverClient(gateway)
    const request = new Request('https://ship-fast.test', {
      headers: { Authorization: 'Bearer session-jwt' },
    })

    await expect(
      resolveCommerceTenant(request, 'sessions', sessionId, {
        client,
        correlationId: 'session-correlation',
      }),
    ).resolves.toEqual(gateway)
    expect(setAuth).toHaveBeenCalledWith('session-jwt')
    expect(query).toHaveBeenCalledWith(expect.anything(), {
      anonymousOwnerSecret: undefined,
      sessionId,
    })
  })

  it('authenticates session access with the anonymous owner secret', async () => {
    const gateway = {
      backendUrl: 'https://session-a.medusa.test',
      publishableKey: 'pk_session_a',
      scope: 'sessions',
      tenant: sessionId,
    }
    const { client, query, setAuth } = resolverClient(gateway)
    const request = new Request('https://ship-fast.test', {
      headers: { 'x-ship-fast-owner-secret': 'owner-secret' },
    })

    await expect(
      resolveCommerceTenant(request, 'sessions', sessionId, {
        client,
        correlationId: 'session-correlation',
      }),
    ).resolves.toEqual(gateway)
    expect(setAuth).not.toHaveBeenCalled()
    expect(query).toHaveBeenCalledWith(expect.anything(), {
      anonymousOwnerSecret: 'owner-secret',
      sessionId,
    })
  })

  it('requires session ownership and maps Convex ownership denial without leaking secrets', async () => {
    const missing = resolverClient(null)
    const request = new Request('https://ship-fast.test')

    await expect(
      resolveCommerceTenant(request, 'sessions', sessionId, {
        client: missing.client,
        correlationId: 'missing-auth-correlation',
      }),
    ).rejects.toMatchObject({
      commerceError: {
        code: 'COMMERCE_AUTH_REQUIRED',
        correlationId: 'missing-auth-correlation',
      },
      status: 401,
    })
    expect(missing.query).not.toHaveBeenCalled()

    const denied = resolverClient(null)
    denied.query.mockRejectedValueOnce(
      Object.assign(new Error('owner-secret admin-token'), {
        data: { code: 'FORBIDDEN' },
      }),
    )
    await expect(
      resolveCommerceTenant(
        new Request('https://ship-fast.test', {
          headers: { 'x-ship-fast-owner-secret': 'wrong-secret' },
        }),
        'sessions',
        sessionId,
        {
          client: denied.client,
          correlationId: 'denied-correlation',
        },
      ),
    ).rejects.toMatchObject({
      commerceError: {
        code: 'COMMERCE_ACCESS_DENIED',
        message: 'Commerce tenant access denied.',
      },
      status: 403,
    })
  })

  it('allows only public active deployment tenants', async () => {
    const gateway = {
      backendUrl: 'https://tenant-a.medusa.test',
      publishableKey: 'pk_tenant_a',
      scope: 'deployments',
      tenant: 'tenant-a',
    }
    const active = resolverClient(gateway)

    await expect(
      resolveCommerceTenant(
        new Request('https://ship-fast.test'),
        'deployments',
        'tenant-a',
        {
          client: active.client,
          correlationId: 'deployment-correlation',
        },
      ),
    ).resolves.toEqual(gateway)
    expect(active.query).toHaveBeenCalledWith(expect.anything(), {
      deploymentSlug: 'tenant-a',
    })

    const inaccessible = resolverClient(null)
    await expect(
      resolveCommerceTenant(
        new Request('https://ship-fast.test'),
        'deployments',
        'private-or-inactive',
        {
          client: inaccessible.client,
          correlationId: 'deployment-correlation',
        },
      ),
    ).rejects.toMatchObject({
      commerceError: { code: 'COMMERCE_TENANT_NOT_FOUND' },
      status: 404,
    })
  })
})
