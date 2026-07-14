import { describe, expect, it } from 'vitest'

import { getRouter } from '@/router'

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function duplicateValues(values: string[]) {
  return values.filter((value, index) => values.indexOf(value) !== index)
}

function handlerMethods(route: unknown) {
  if (!isRecord(route) || !isRecord(route.options)) return []
  const server = route.options.server
  if (!isRecord(server) || !isRecord(server.handlers)) return []
  return Object.keys(server.handlers).sort()
}

describe('generated route manifest release operations', () => {
  it('contains no duplicate route ids, paths, or HTTP operations', () => {
    const routes = Object.values(getRouter().routesById)
    const publicRoutes = routes.filter((route) => route.id !== '__root__')
    const ids = publicRoutes.map((route) => route.id)
    const paths = publicRoutes.map((route) => route.fullPath)
    const operations = publicRoutes.flatMap((route) =>
      handlerMethods(route).map((method) => `${method} ${route.fullPath}`),
    )

    expect(publicRoutes.length).toBeGreaterThan(60)
    expect(duplicateValues(ids)).toEqual([])
    expect(duplicateValues(paths)).toEqual([])
    expect(duplicateValues(operations)).toEqual([])
  })

  it('does not register unsupported methods on critical API routes', () => {
    const routes = Object.values(getRouter().routesById)
    const methodsByPath = new Map(
      routes.map((route) => [route.fullPath, handlerMethods(route)]),
    )

    expect(methodsByPath.get('/api/health')).toEqual(['GET'])
    expect(methodsByPath.get('/api/sessions/create')).toEqual(['POST'])
    expect(methodsByPath.get('/api/checkout/start')).toEqual(['POST'])
    expect(methodsByPath.get('/api/payments/stripe/webhook')).toEqual(['POST'])
    expect(methodsByPath.get('/api/payments/razorpay/webhook')).toEqual([
      'POST',
    ])
  })
})
