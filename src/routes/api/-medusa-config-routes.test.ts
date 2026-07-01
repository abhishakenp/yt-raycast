import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (options: unknown) => ({ options, path }),
}))

type RouteWithHandlers = {
  path: string
  options: {
    server: {
      handlers: Record<string, () => Promise<Response>>
    }
  }
}

const importRoute = async (path: string): Promise<RouteWithHandlers> => {
  const mod = await import(path)
  return mod.Route as unknown as RouteWithHandlers
}

describe('Medusa config API routes', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.MEDUSA_ADMIN_API_TOKEN
    delete process.env.MEDUSA_ADMIN_EMAIL
    delete process.env.MEDUSA_ADMIN_PASSWORD
    delete process.env.MEDUSA_ADMIN_URL
    delete process.env.MEDUSA_BACKEND_URL
    delete process.env.MEDUSA_PUBLISHABLE_API_KEY
    delete process.env.MEDUSA_PUBLISHABLE_KEY
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.resetModules()
  })

  it('returns store readiness and backend URL without leaking publishable keys', async () => {
    process.env.MEDUSA_BACKEND_URL = 'https://backend.medusa.test'
    process.env.MEDUSA_PUBLISHABLE_API_KEY = 'pk_live_public_brewery'

    const Route = await importRoute('./medusa-store.config')
    const response = await Route.options.server.handlers.GET()

    expect(Route.path).toBe('/api/medusa-store/config')
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({
      enabled: true,
      backendUrl: 'https://backend.medusa.test',
    })
    expect(JSON.stringify(body)).not.toContain('pk_live_public_brewery')
  })

  it('returns admin readiness and URLs without leaking admin credentials', async () => {
    process.env.MEDUSA_ADMIN_URL = 'https://admin.medusa.test'
    process.env.MEDUSA_BACKEND_URL = 'https://backend.medusa.test'
    process.env.MEDUSA_ADMIN_EMAIL = 'owner@brewery.example'
    process.env.MEDUSA_ADMIN_PASSWORD = 'super-secret-password'
    process.env.MEDUSA_ADMIN_API_TOKEN = 'admin-token-secret'

    const Route = await importRoute('./medusa-admin.config')
    const response = await Route.options.server.handlers.GET()

    expect(Route.path).toBe('/api/medusa-admin/config')
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({
      enabled: true,
      adminUrl: 'https://admin.medusa.test',
      backendUrl: 'https://backend.medusa.test',
    })
    expect(JSON.stringify(body)).not.toContain('owner@brewery.example')
    expect(JSON.stringify(body)).not.toContain('super-secret-password')
    expect(JSON.stringify(body)).not.toContain('admin-token-secret')
  })
})
