import { describe, expect, it, vi } from 'vitest'

import {
  createExportTargetsResponse,
  createSessionExportResponse,
} from './export-api-response'

describe('createSessionExportResponse', () => {
  it('loads export targets through existing deployed Convex functions', async () => {
    const client = {
      mutation: vi.fn(),
      query: vi
        .fn()
        .mockResolvedValueOnce({
          session: {
            _id: 'session_123',
            status: 'preview_ready',
            previewVersion: 3,
            isPrivate: true,
          },
        })
        .mockResolvedValueOnce({
          status: 'ready',
          requiresPayment: false,
          fileCount: 8,
          previewVersion: 3,
          githubUrl: 'https://github.com/acme/site',
          artifact: { status: 'ready', fileCount: 8 },
        })
        .mockResolvedValue(null),
      setAuth: vi.fn(),
    }

    const response = await createExportTargetsResponse('session_123', client)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(client.query).toHaveBeenNthCalledWith(1, expect.anything(), {
      lookup: 'session_123',
    })
    expect(client.query).toHaveBeenNthCalledWith(2, expect.anything(), {
      sessionId: 'session_123',
      target: 'html',
    })
    expect(body).toMatchObject({
      sessionId: 'session_123',
      previewReady: true,
      isPrivate: true,
    })
    expect(body.targets).toHaveLength(4)
    expect(body.targets[0]).toMatchObject({
      target: 'html',
      label: 'HTML',
      ready: true,
      status: 'ready',
      fileCount: 8,
      artifactReady: true,
      artifactStatus: 'ready',
      githubUrl: 'https://github.com/acme/site',
      downloadUrl: '/api/sessions/session_123/download/html',
    })
    expect(body.targets[1]).toMatchObject({
      target: 'react',
      label: 'React',
      ready: false,
      status: 'available',
      artifactReady: false,
      artifactStatus: 'queued',
    })
  })

  it('keeps supported targets when an older backend rejects one target', async () => {
    const unsupportedTargetError = new Error(
      'ArgumentValidationError: Value does not match validator.\nPath: .target\nValidator: v.union(v.literal("html"), v.literal("react"), v.literal("next"))',
    )
    const client = {
      mutation: vi.fn(),
      query: vi.fn(async (_reference: unknown, args: Record<string, unknown>) => {
        if ('lookup' in args) {
          return {
            session: {
              _id: 'session_123',
              status: 'preview_ready',
              previewVersion: 3,
              isPrivate: false,
            },
          }
        }
        if (args.target === 'lakebed') throw unsupportedTargetError
        return null
      }),
      setAuth: vi.fn(),
    }

    const response = await createExportTargetsResponse('session_123', client)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.targets).toHaveLength(4)
    expect(body.targets[3]).toMatchObject({
      target: 'lakebed',
      ready: false,
      status: 'available',
      artifactStatus: 'queued',
    })
  })

  it('forwards bearer auth before creating an export', async () => {
    const client = {
      mutation: vi.fn().mockResolvedValue({
        status: 'ready',
        target: 'html',
      }),
      query: vi.fn(),
      setAuth: vi.fn(),
    }

    const response = await createSessionExportResponse(
      'session_123',
      new Request('https://ship-fast.test/api/sessions/session_123/export', {
        method: 'POST',
        headers: {
          authorization: 'Bearer token_123',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ target: 'html' }),
      }),
      client,
    )

    expect(response.status).toBe(200)
    expect(client.setAuth).toHaveBeenCalledWith('token_123')
    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      lookup: 'session_123',
      target: 'html',
      anonymousOwnerSecret: undefined,
    })
    expect(await response.json()).toMatchObject({
      status: 'ready',
      downloadUrl: '/api/sessions/session_123/download/html',
    })
  })

  it('forwards anonymous owner secrets for anonymous exports', async () => {
    const client = {
      mutation: vi.fn().mockResolvedValue({
        status: 'payment_required',
        target: 'react',
      }),
      query: vi.fn(),
      setAuth: vi.fn(),
    }

    await createSessionExportResponse(
      'session_123',
      new Request('https://ship-fast.test/api/sessions/session_123/export', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          target: 'react',
          anonymousOwnerSecret: 'owner-secret',
        }),
      }),
      client,
    )

    expect(client.setAuth).not.toHaveBeenCalled()
    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      lookup: 'session_123',
      target: 'react',
      anonymousOwnerSecret: 'owner-secret',
    })
  })
})
