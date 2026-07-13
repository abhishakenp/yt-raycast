import { ConvexHttpClient } from 'convex/browser'

import { getRuntimeConvexUrl } from '../env/convex-runtime'

const DEFAULT_CONVEX_HTTP_TIMEOUT_MS = 5000

function createTimeoutFetch(timeoutMs: number): typeof fetch {
  return async (input, init) => {
    const timeoutController = new AbortController()
    const timeout = setTimeout(() => timeoutController.abort(), timeoutMs)
    const signal = init?.signal
      ? AbortSignal.any([init.signal, timeoutController.signal])
      : timeoutController.signal

    try {
      return await fetch(input, { ...init, signal })
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
