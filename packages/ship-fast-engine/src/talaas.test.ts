import { afterEach, describe, expect, it, vi } from 'vitest'

import { talaasChat, type TalaasChunk } from './talaas'

const DB_OBSERVED_PROMPT =
  'a food site for dogs and other pets with a polished hero, clear navigation, trust signals, featured sections, and a direct conversion path.'
const DB_OBSERVED_SESSION_ID = 'k571fbfbggczv4pfz2evtrxdzx89qqbb'

function textStream(chunks: string[]) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder()
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk))
      }
      controller.close()
    },
  })
}

function throwingStream(error: Error) {
  return new ReadableStream<Uint8Array>({
    pull() {
      throw error
    },
  })
}

async function collect(
  user = DB_OBSERVED_PROMPT,
  signal = new AbortController().signal,
): Promise<TalaasChunk[]> {
  const chunks: TalaasChunk[] = []
  for await (const chunk of talaasChat(
    'llama3.1-8B',
    `Render public session ${DB_OBSERVED_SESSION_ID}`,
    user,
    signal,
  )) {
    chunks.push(chunk)
  }
  return chunks
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('talaasChat stream adapter', () => {
  it('posts the DB-observed prompt to Talaas and yields streamed content without trailing stats metadata', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          textStream([
            'Food site hero with trust signals.',
            '<|stats|>{"cost":0.01}<|/stats|>',
          ]),
          { status: 200, statusText: 'OK' },
        ),
    )
    vi.stubGlobal('fetch', fetchMock)

    const chunks = await collect()
    expect(chunks.map((chunk) => chunk.delta).join('')).toBe(
      'Food site hero with trust signals.',
    )
    expect(chunks.every((chunk) => chunk.type === 'TEXT_MESSAGE_CONTENT')).toBe(
      true,
    )
    expect(chunks.map((chunk) => chunk.delta).join('')).not.toContain(
      '<|stats|>',
    )

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ]
    expect(url).toBe('https://chatjimmy.ai/api/chat')
    expect(init).toMatchObject({
      method: 'POST',
      headers: expect.objectContaining({
        'content-type': 'application/json',
        accept: '*/*',
        Referer: 'https://chatjimmy.ai/',
      }),
    })
    expect(JSON.parse(String(init?.body))).toEqual({
      messages: [{ role: 'user', content: DB_OBSERVED_PROMPT }],
      chatOptions: {
        selectedModel: 'llama3.1-8B',
        systemPrompt: `Render public session ${DB_OBSERVED_SESSION_ID}`,
        topK: 8,
      },
      attachment: null,
    })
  })

  it('holds back marker-sized tails so a split stats marker is not leaked as generated content', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          textStream([
            'Featured pet sections with direct conversion<|sta',
            'ts|>{"latency":120}<|/stats|>',
          ]),
          { status: 200, statusText: 'OK' },
        ),
    )
    vi.stubGlobal('fetch', fetchMock)

    const chunks = await collect()
    expect(chunks.map((chunk) => chunk.delta).join('')).toBe(
      'Featured pet sections with direct conversion',
    )
    expect(chunks).not.toContainEqual(
      expect.objectContaining({ delta: expect.stringContaining('<|sta') }),
    )
    expect(chunks).not.toContainEqual(
      expect.objectContaining({ delta: expect.stringContaining('ts|>') }),
    )
  })

  it('returns a RUN_ERROR chunk when the Talaas request fails before a stream exists', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network unavailable')
      }),
    )

    await expect(collect()).resolves.toEqual([
      { type: 'RUN_ERROR', message: 'network unavailable' },
    ])
  })

  it('returns a RUN_ERROR chunk when Talaas responds without a readable success stream', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () => new Response(null, { status: 503, statusText: 'Busy' }),
      ),
    )

    await expect(collect()).resolves.toEqual([
      { type: 'RUN_ERROR', message: 'talaas 503 Busy' },
    ])
  })

  it('preserves already streamed text and then reports reader failures as RUN_ERROR', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(throwingStream(new Error('reader exploded')), {
            status: 200,
            statusText: 'OK',
          }),
      ),
    )

    await expect(collect()).resolves.toEqual([
      { type: 'RUN_ERROR', message: 'reader exploded' },
    ])
  })
})
