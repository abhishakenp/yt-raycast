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
    expect(calls).toEqual([{ lookup: 'session_123' }])
  })

  it('queries preview history by lookup so placeholder routes can resolve empty', async () => {
    const calls: unknown[] = []
    const response = await createPreviewHistoryResponse('fake', {
      query: async (_ref, args) => {
        calls.push(args)
        return []
      },
      mutation: async () => {
        throw new Error('unexpected mutation')
      },
    })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ history: [] })
    expect(calls).toEqual([{ lookup: 'fake' }])
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

  it('returns a conflict when an inline text edit cannot find the selected text', async () => {
    const response = await createInlineTextEditResponse(
      'session_123',
      jsonRequest({ oldText: 'Missing', newText: 'Replacement' }),
      {
        query: async () => null,
        mutation: async () => {
          throw new Error(
            'Uncaught ConvexError: {"code":"TEXT_NOT_FOUND","message":"Selected text was not found"}',
          )
        },
      },
    )

    expect(response.status).toBe(409)
    expect(await response.json()).toMatchObject({
      error: expect.stringContaining('Selected text was not found'),
    })
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
