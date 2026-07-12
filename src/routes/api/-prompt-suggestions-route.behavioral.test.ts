import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path) => (options) => ({ options, path }),
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

async function importRoute(): Promise<RouteWithHandlers> {
  const mod = await import('./prompt-suggestions')
  return mod.Route as unknown as RouteWithHandlers
}

const realConvexPromptPartial =
  'a craft beer brewery with taproom tours and seasonal releases'

describe('prompt suggestions API route', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    process.env = { ...originalEnv, GROQ_API_KEY: '' }
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('returns 400 JSON for invalid request JSON without throwing', async () => {
    const Route = await importRoute()

    const response = await Route.options.server.handlers.POST({
      request: new Request('https://ship-fast.io/api/prompt-suggestions', {
        body: 'not-json',
        method: 'POST',
      }),
    })

    expect(Route.path).toBe('/api/prompt-suggestions')
    expect(response.status).toBe(400)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    await expect(response.json()).resolves.toEqual({ suggestions: [] })
  })

  it('returns prefix-preserving suggestions for a real Convex prompt partial without requiring AI', async () => {
    const Route = await importRoute()

    const response = await Route.options.server.handlers.POST({
      request: new Request('https://ship-fast.io/api/prompt-suggestions', {
        body: JSON.stringify({
          language: 'en',
          partial: realConvexPromptPartial,
        }),
        method: 'POST',
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.suggestions).toHaveLength(4)
    expect(
      body.suggestions.every((suggestion) =>
        suggestion.startsWith(realConvexPromptPartial),
      ),
    ).toBe(true)
    expect(body.suggestions.join('\n')).toContain('modern homepage')
  })
})
