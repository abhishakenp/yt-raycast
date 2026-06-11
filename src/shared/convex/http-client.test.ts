import { describe, expect, it } from 'vitest'

import { createRuntimeConvexHttpClient } from './http-client'

describe('createRuntimeConvexHttpClient', () => {
  it('creates a Convex HTTP client from the runtime URL', () => {
    const previousUrl = process.env.VITE_CONVEX_URL
    process.env.VITE_CONVEX_URL = 'http://127.0.0.1:3210'

    try {
      const client = createRuntimeConvexHttpClient(1000)

      expect(client.backendUrl()).toBe('http://127.0.0.1:3210/api')
    } finally {
      process.env.VITE_CONVEX_URL = previousUrl
    }
  })
})
