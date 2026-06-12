import { describe, expect, it, vi } from 'vitest'

import {
  createAgentationAnnotationResponse,
  createAgentationHealthResponse,
  createAgentationSessionResponse,
  getAgentationSessionResponse,
} from './agentation-sync-response'

const jsonRequest = (url: string, body: unknown) =>
  new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

describe('agentation sync responses', () => {
  it('reports the local sync bridge as healthy', async () => {
    const response = createAgentationHealthResponse()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
  })

  it('creates a deterministic session from a generate URL', async () => {
    const response = await createAgentationSessionResponse(
      jsonRequest('https://ship-fast.test/api/agentation-sync/sessions', {
        url: 'https://ship-fast.test/generate/session_123',
      }),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      id: 'ship-fast:generate:session_123',
      annotations: [],
    })
  })

  it('loads annotations for an Agentation session key', async () => {
    const client = {
      query: vi.fn().mockResolvedValue([
        {
          annotationId: 'ann_1',
          agentationSessionKey: 'ship-fast:generate:session_123',
          comment: 'Change this hero',
          elementLabel: 'Hero heading',
          elementPath: 'main > h1',
          payloadJson: JSON.stringify({
            id: 'ann_1',
            x: 10,
            y: 20,
            comment: 'Change this hero',
            element: 'Hero heading',
            elementPath: 'main > h1',
            timestamp: 100,
          }),
        },
      ]),
      mutation: vi.fn(),
    }

    const response = await getAgentationSessionResponse(
      'ship-fast:generate:session_123',
      client,
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      id: 'ship-fast:generate:session_123',
      annotations: [
        {
          id: 'ann_1',
          comment: 'Change this hero',
          element: 'Hero heading',
          elementPath: 'main > h1',
        },
      ],
    })
    expect(client.query).toHaveBeenCalledWith(expect.anything(), {
      sessionId: 'session_123',
    })
  })

  it('persists synced annotations through Convex by session key', async () => {
    const client = {
      query: vi.fn(),
      mutation: vi.fn().mockResolvedValue({ annotationId: 'ann_1' }),
    }

    const response = await createAgentationAnnotationResponse(
      'ship-fast:generate:session_123',
      jsonRequest(
        'https://ship-fast.test/api/agentation-sync/sessions/ship-fast:generate:session_123/annotations',
        {
          id: 'ann_1',
          comment: 'Make the CTA clearer',
          element: 'CTA button',
          elementPath: 'main > button',
          url: 'https://ship-fast.test/generate/session_123',
          x: 1,
          y: 2,
          timestamp: 123,
        },
      ),
      client,
    )

    expect(response.status).toBe(200)
    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      agentationSessionKey: 'ship-fast:generate:session_123',
      annotationId: 'ann_1',
      comment: 'Make the CTA clearer',
      elementLabel: 'CTA button',
      elementPath: 'main > button',
      url: 'https://ship-fast.test/generate/session_123',
      payloadJson: expect.stringContaining('"id":"ann_1"'),
    })
  })
})
