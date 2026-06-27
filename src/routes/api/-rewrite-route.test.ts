import { describe, expect, it, vi } from 'vitest'

const generateTextMock = vi.hoisted(() => vi.fn())

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (options: unknown) => ({ options, path }),
}))

vi.mock('@ship-fast/engine', () => ({
  generateText: generateTextMock,
}))

vi.mock('@ship-fast/engine/model-list.js', () => ({
  DEFAULT_MODEL: 'test-model',
}))

type RouteWithHandlers = {
  path: string
  options: {
    server: {
      handlers: Record<
        string,
        (args: { request: Request }) => Promise<Response>
      >
    }
  }
}

const importRoute = async (): Promise<RouteWithHandlers> => {
  const { Route } = await import('./rewrite')
  return Route as unknown as RouteWithHandlers
}

describe('rewrite API route', () => {
  it('registers a POST handler at /api/rewrite', async () => {
    const Route = await importRoute()
    expect(Route.path).toBe('/api/rewrite')
    expect(typeof Route.options.server.handlers.POST).toBe('function')
  })

  it('does not eagerly load the engine at module import time', async () => {
    generateTextMock.mockClear()
    await importRoute()
    expect(generateTextMock).not.toHaveBeenCalled()
  })

  it('rejects invalid JSON with a 400', async () => {
    const Route = await importRoute()
    const res = await Route.options.server.handlers.POST({
      request: new Request('https://ship-fast.test/api/rewrite', {
        method: 'POST',
        body: 'not-json',
      }),
    })
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Invalid JSON' })
    expect(generateTextMock).not.toHaveBeenCalled()
  })

  it('rejects missing text/instruction with a 422 without loading the engine', async () => {
    const Route = await importRoute()
    const res = await Route.options.server.handlers.POST({
      request: new Request('https://ship-fast.test/api/rewrite', {
        method: 'POST',
        body: JSON.stringify({ text: 'hi' }),
      }),
    })
    expect(res.status).toBe(422)
    expect(generateTextMock).not.toHaveBeenCalled()
  })

  it('lazily imports the engine only on a valid request and returns rewritten text', async () => {
    generateTextMock.mockResolvedValue('  "rewritten"  ')
    const Route = await importRoute()

    const res = await Route.options.server.handlers.POST({
      request: new Request('https://ship-fast.test/api/rewrite', {
        method: 'POST',
        body: JSON.stringify({ text: 'original', instruction: 'shorten' }),
      }),
    })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ rewritten: 'rewritten' })
    expect(generateTextMock).toHaveBeenCalledWith(
      'test-model',
      expect.any(String),
      expect.any(String),
      expect.any(AbortSignal),
      2,
    )
  })
})
