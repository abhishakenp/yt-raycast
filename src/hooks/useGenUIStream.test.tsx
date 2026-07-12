// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@openuidev/lang-core', () => ({
  mergeStatements: (prev, patch) => [prev, patch].filter(Boolean).join('\n'),
}))

import { useGenUIStream } from './useGenUIStream'

function sseResponse(events: unknown[]) {
  const encoder = new TextEncoder()
  return new Response(
    new ReadableStream({
      start(controller) {
        for (const event of events) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
          )
        }
        controller.close()
      },
    }),
    { status: 200 },
  )
}

function rawSseResponse(chunks: string[]) {
  const encoder = new TextEncoder()
  return new Response(
    new ReadableStream({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk))
        }
        controller.close()
      },
    }),
    { status: 200 },
  )
}

describe('useGenUIStream', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('posts the prompt and reduces streamed GenUI events into hook state', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      sseResponse([
        { type: 'theme', name: 'midnight' },
        { type: 'status', message: 'Planning' },
        { type: 'skeleton', text: 'root = PageSwitch({})' },
        { type: 'plan', ids: ['hero', 'pricing'] },
        { type: 'module_start', id: 'hero' },
        { type: 'module_retry', id: 'hero', attempt: 2 },
        { type: 'module', id: 'hero', text: 'hero = SaasHero({})' },
        { type: 'module', id: 'pricing', text: 'pricing = Pricing({})' },
        { type: 'done', modules: 2, ms: 1234 },
      ]),
    )
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useGenUIStream())

    await act(async () => {
      await result.current.start('Build a SaaS page', 'fast-model')
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/genui',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Build a SaaS page',
          model: 'fast-model',
        }),
      }),
    )
    expect(result.current).toMatchObject({
      theme: 'midnight',
      status: 'Done',
      done: true,
      isStreaming: false,
      modules: 2,
      ms: 1234,
      error: null,
    })
    expect(result.current.buffer).toContain('root = PageSwitch({})')
    expect(result.current.buffer).toContain('hero = SaasHero({})')
    expect(result.current.sections).toEqual([
      { id: 'hero', status: 'done', attempt: 2 },
      { id: 'pricing', status: 'done', attempt: 0 },
    ])
  })

  it('surfaces failed requests as hook errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('', { status: 503 })),
    )
    const { result } = renderHook(() => useGenUIStream())

    await act(async () => {
      await result.current.start('Build a page')
    })

    expect(result.current.isStreaming).toBe(false)
    expect(result.current.error).toBe('request failed (503)')
  })

  it('ignores malformed SSE frames and keeps reducing later valid stream events', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          rawSseResponse([
            'data: {"type":"skeleton","text":"root = PageSwitch({})"}\n\n',
            'data: <!doctype html><title>gateway error</title>\n\n',
            'data: {"type":"module","id":"hero","text":"hero = SaasHero({})"}\n\n',
            'data: {"type":"done","modules":1,"ms":42}\n\n',
          ]),
        ),
    )
    const { result } = renderHook(() => useGenUIStream())

    await act(async () => {
      await result.current.start('Build a page')
    })

    expect(result.current).toMatchObject({
      done: true,
      error: null,
      isStreaming: false,
      modules: 1,
      ms: 42,
      status: 'Done',
    })
    expect(result.current.buffer).toContain('root = PageSwitch({})')
    expect(result.current.buffer).toContain('hero = SaasHero({})')
  })

  it('aborts in-flight streams when stopped', async () => {
    const holder: { signal: AbortSignal | null } = { signal: null }
    vi.stubGlobal(
      'fetch',
      vi.fn((_url, init) => {
        holder.signal = init.signal ?? null
        return new Promise<Response>(() => {})
      }),
    )
    const { result } = renderHook(() => useGenUIStream())

    act(() => {
      void result.current.start('Build a page')
    })

    await waitFor(() => {
      expect(holder.signal).not.toBeNull()
      expect(result.current.isStreaming).toBe(true)
    })

    act(() => {
      result.current.stop()
    })

    expect(holder.signal?.aborted).toBe(true)
    expect(result.current.isStreaming).toBe(false)
  })
})
