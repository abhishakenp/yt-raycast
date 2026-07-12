import { ConvexHttpClient } from 'convex/browser'

import { getRuntimeConvexUrl } from '../env/convex-runtime'

const DEFAULT_CONVEX_HTTP_TIMEOUT_MS = 5000

function createTimeoutFetch(timeoutMs: number): typeof fetch {
  return async (input, init) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      return await fetch(input, { ...init, signal: controller.signal })
    } finally {
      clearTimeout(timeout)
    }
  }
}

export function createRuntimeConvexHttpClient(
  timeoutMs = DEFAULT_CONVEX_HTTP_TIMEOUT_MS,
): ConvexHttpClient {
  return new ConvexHttpClient(getRuntimeConvexUrl(), {
    fetch: createTimeoutFetch(timeoutMs),
  })
}
