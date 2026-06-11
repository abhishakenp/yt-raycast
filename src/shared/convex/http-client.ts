import { ConvexHttpClient } from 'convex/browser'

import { getRuntimeConvexUrl } from '../env/convex-runtime'

const DEFAULT_CONVEX_HTTP_TIMEOUT_MS = 5000

const createTimeoutFetch =
  (timeoutMs: number): typeof fetch =>
  async (input, init) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      return await fetch(input, { ...init, signal: controller.signal })
    } finally {
      clearTimeout(timeout)
    }
  }

export const createRuntimeConvexHttpClient = (
  timeoutMs = DEFAULT_CONVEX_HTTP_TIMEOUT_MS,
): ConvexHttpClient =>
  new ConvexHttpClient(getRuntimeConvexUrl(), {
    fetch: createTimeoutFetch(timeoutMs),
  })
