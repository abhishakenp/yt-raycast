import { beforeEach, describe, expect, it } from 'vitest'

import { previewHtmlHits } from '@/lib/rate-limit'
import {
  createInlineStyleEditResponse,
  createInlineTextEditResponse,
  createPreviewHtmlSaveResponse,
  createPreviewRestoreResponse,
} from './session-preview-edit-response'

function jsonRequest(body: unknown, headers?: HeadersInit) {
  return new Request('https://ship-fast.ai/api/preview-edit', {
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', ...headers },
    method: 'POST',
  })
}

describe('preview edit response failure modes', () => {
  beforeEach(() => {
    previewHtmlHits.clear()
  })

  it('ignores a blank body owner secret and falls back to the authenticated header secret', async () => {
    const calls: unknown[] = []
    const response = await createInlineTextEditResponse(
      'session_123',
      jsonRequest(
        {
          afterText: 'New headline',
          anonymousOwnerSecret: '   ',
          beforeText: 'Old headline',
        },
        { 'x-ship-fast-owner-secret': 'header-secret' },
      ),
      {
        query: async () => null,
        mutation: async (_reference, args) => {
          calls.push(args)
          return { saved: true }
        },
      },
    )

    expect(response.status).toBe(200)
    expect(calls).toEqual([
      expect.objectContaining({ anonymousOwnerSecret: 'header-secret' }),
    ])
  })

  it('normalizes surrounding whitespace in body owner secrets', async () => {
    const calls: unknown[] = []
    await createInlineTextEditResponse(
      'session_123',
      jsonRequest({
        afterText: 'New headline',
        anonymousOwnerSecret: '  body-secret  ',
        beforeText: 'Old headline',
      }),
      {
        query: async () => null,
        mutation: async (_reference, args) => {
          calls.push(args)
          return { saved: true }
        },
      },
    )

    expect(calls).toEqual([
      expect.objectContaining({ anonymousOwnerSecret: 'body-secret' }),
    ])
  })

  it('rejects preview versions outside the safe integer range before mutation', async () => {
    let mutationCalled = false
    const response = await createPreviewRestoreResponse(
      'session_123',
      '9007199254740992',
      jsonRequest({ anonymousOwnerSecret: 'secret' }),
      {
        query: async () => null,
        mutation: async () => {
          mutationCalled = true
          return { previewVersion: 2 }
        },
      },
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid preview version',
    })
    expect(mutationCalled).toBe(false)
  })

  it('rejects an empty source text instead of applying an ambiguous global edit', async () => {
    let mutationCalled = false
    const response = await createInlineTextEditResponse(
      'session_123',
      jsonRequest({ afterText: 'New headline', beforeText: '' }),
      {
        query: async () => null,
        mutation: async () => {
          mutationCalled = true
          return { saved: true }
        },
      },
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'beforeText must not be empty',
    })
    expect(mutationCalled).toBe(false)
  })

  it('rejects executable inline style fragments before they enter public preview history', async () => {
    let mutationCalled = false
    const response = await createInlineStyleEditResponse(
      'session_123',
      jsonRequest({
        afterHtml: '<section>Safe</section><script>alert(1)</script>',
      }),
      {
        query: async () => null,
        mutation: async () => {
          mutationCalled = true
          return { saved: true }
        },
      },
    )

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toEqual({
      error: 'Executable preview fragments are not allowed',
    })
    expect(mutationCalled).toBe(false)
  })

  it('treats JSON null as an empty object and returns validation JSON', async () => {
    let mutationCalled = false
    const response = await createPreviewHtmlSaveResponse(
      'session_123',
      jsonRequest(null),
      {
        query: async () => null,
        mutation: async () => {
          mutationCalled = true
          return null
        },
      },
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Preview HTML is required',
    })
    expect(mutationCalled).toBe(false)
  })

  it('maps invalid Convex session ids to a stable not-found response', async () => {
    const response = await createInlineTextEditResponse(
      'not-a-convex-id',
      jsonRequest({ afterText: 'New', beforeText: 'Old' }),
      {
        query: async () => null,
        mutation: async () => {
          throw new Error(
            'ArgumentValidationError: Value does not match validator. Validator: v.id("sessions")',
          )
        },
      },
    )

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      error: 'Session not found',
    })
  })

  it('redacts internal Convex failures from preview edit responses', async () => {
    const response = await createInlineTextEditResponse(
      'session_123',
      jsonRequest({ afterText: 'New', beforeText: 'Old' }),
      {
        query: async () => null,
        mutation: async () => {
          throw new Error('database shard secret: session payload leaked')
        },
      },
    )
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ error: 'Preview edit request failed' })
    expect(JSON.stringify(body)).not.toContain('database shard secret')
  })
})
