import { describe, expect, it } from 'vitest'

import {
  createInlineStyleEditResponse,
  createInlineTextEditResponse,
  createPreviewHistoryResponse,
  createPreviewHtmlSaveResponse,
  createPreviewRestoreResponse,
} from './session-preview-edit-response'

const jsonRequest = (body: unknown, headers?: HeadersInit) =>
  new Request('http://localhost/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })

describe('session preview edit responses', () => {
  it('lists preview history from Convex', async () => {
    const calls: unknown[] = []
    const response = await createPreviewHistoryResponse('session_123', {
      query: async (_ref, args) => {
        calls.push(args)
        return [{ version: 2, source: 'edit', createdAt: 200 }]
      },
      mutation: async () => {
        throw new Error('unexpected mutation')
      },
    })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      history: [{ version: 2, source: 'edit', createdAt: 200 }],
    })
    expect(calls).toEqual([{ sessionId: 'session_123' }])
  })

  it('returns not found when preview history receives an invalid session id', async () => {
    const response = await createPreviewHistoryResponse('fake', {
      query: async () => {
        throw new Error(
          'ArgumentValidationError: Value does not match validator.\nPath: .sessionId\nValue: "fake"\nValidator: v.id("sessions")',
        )
      },
      mutation: async () => {
        throw new Error('unexpected mutation')
      },
    })

    expect(response.status).toBe(404)
    expect(await response.json()).toMatchObject({
      error: expect.stringContaining('ArgumentValidationError'),
    })
  })

  it('restores a requested preview version with anonymous ownership', async () => {
    const calls: unknown[] = []
    const response = await createPreviewRestoreResponse(
      'session_123',
      '3',
      jsonRequest({ anonymousOwnerSecret: 'secret' }),
      {
        query: async () => null,
        mutation: async (_ref, args) => {
          calls.push(args)
          return { sessionId: 'session_123', previewVersion: 4 }
        },
      },
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      sessionId: 'session_123',
      previewVersion: 4,
    })
    expect(calls).toEqual([
      {
        sessionId: 'session_123',
        version: 3,
        anonymousOwnerSecret: 'secret',
      },
    ])
  })

  it('saves full preview HTML as a durable preview edit', async () => {
    const calls: unknown[] = []
    const response = await createPreviewHtmlSaveResponse(
      'session_123',
      jsonRequest({ html: '<main>Saved</main>', instruction: 'manual save' }),
      {
        query: async () => null,
        mutation: async (_ref, args) => {
          calls.push(args)
          return { saved: true, previewVersion: 2 }
        },
      },
    )

    expect(response.status).toBe(200)
    expect(calls).toEqual([
      {
        sessionId: 'session_123',
        editType: 'style',
        targetLabel: 'Preview HTML',
        afterHtml: '<main>Saved</main>',
        instruction: 'manual save',
        anonymousOwnerSecret: undefined,
      },
    ])
  })

  it('maps inline text edit payloads to the Convex edit mutation', async () => {
    const calls: unknown[] = []
    const response = await createInlineTextEditResponse(
      'session_123',
      jsonRequest(
        { oldText: 'Old', newText: 'New', targetLabel: 'Hero' },
        { 'x-ship-fast-owner-secret': 'header-secret' },
      ),
      {
        query: async () => null,
        mutation: async (_ref, args) => {
          calls.push(args)
          return { saved: true, previewVersion: 2 }
        },
      },
    )

    expect(response.status).toBe(200)
    expect(calls).toEqual([
      {
        sessionId: 'session_123',
        editType: 'text',
        targetLabel: 'Hero',
        beforeText: 'Old',
        afterText: 'New',
        instruction: undefined,
        anonymousOwnerSecret: 'header-secret',
      },
    ])
  })

  it('maps inline style payloads to an HTML replacement edit', async () => {
    const calls: unknown[] = []
    const response = await createInlineStyleEditResponse(
      'session_123',
      jsonRequest({ fragmentHtml: '<section class="fresh"></section>' }),
      {
        query: async () => null,
        mutation: async (_ref, args) => {
          calls.push(args)
          return { saved: true, previewVersion: 5 }
        },
      },
    )

    expect(response.status).toBe(200)
    expect(calls).toEqual([
      {
        sessionId: 'session_123',
        editType: 'style',
        targetLabel: undefined,
        afterHtml: '<section class="fresh"></section>',
        instruction: undefined,
        anonymousOwnerSecret: undefined,
      },
    ])
  })
})
