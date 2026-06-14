import { describe, expect, it } from 'vitest'

import { createRuntimeConvexHttpClient } from './http-client'

describe('createRuntimeConvexHttpClient', () => {
  it('creates a Convex HTTP client from the runtime URL', () => {
    const previousSelfHostedUrl = process.env.CONVEX_SELF_HOSTED_URL
    const previousConvexUrl = process.env.CONVEX_URL
    const previousViteSelfHostedUrl = process.env.VITE_CONVEX_SELF_HOSTED_URL
    const previousUrl = process.env.VITE_CONVEX_URL
    delete process.env.CONVEX_SELF_HOSTED_URL
    delete process.env.CONVEX_URL
    delete process.env.VITE_CONVEX_SELF_HOSTED_URL
    process.env.VITE_CONVEX_URL = 'http://127.0.0.1:3210'

    try {
      const client = createRuntimeConvexHttpClient(1000)

      expect(client.backendUrl()).toBe('http://127.0.0.1:3210/api')
    } finally {
      if (previousSelfHostedUrl === undefined) delete process.env.CONVEX_SELF_HOSTED_URL
      else process.env.CONVEX_SELF_HOSTED_URL = previousSelfHostedUrl
      if (previousConvexUrl === undefined) delete process.env.CONVEX_URL
      else process.env.CONVEX_URL = previousConvexUrl
      if (previousViteSelfHostedUrl === undefined) delete process.env.VITE_CONVEX_SELF_HOSTED_URL
      else process.env.VITE_CONVEX_SELF_HOSTED_URL = previousViteSelfHostedUrl
      if (previousUrl === undefined) delete process.env.VITE_CONVEX_URL
      else process.env.VITE_CONVEX_URL = previousUrl
    }
  })
})
