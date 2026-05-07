// @ts-check
/**
 * Wraps an async LLM call with exponential backoff retry.
 * Retries on network errors and transient model errors (rate limit, timeout, overloaded).
 *
 * @param {() => Promise<{content: string, error?: string}>} fn
 * @param {{ attempts?: number, baseDelayMs?: number }} [opts]
 * @returns {Promise<{content: string, error?: string}>}
 */
export async function withLLMRetry(fn, opts = {}) {
  const attempts = opts.attempts ?? 3
  const baseDelayMs = opts.baseDelayMs ?? 1000

  let lastError
  for (let i = 0; i < attempts; i++) {
    try {
      const result = await fn()
      // Only retry on transient model-level errors; permanent errors return immediately
      if (result?.error && isTransientError(result.error)) {
        lastError = new Error(result.error)
        if (i < attempts - 1) await delay(baseDelayMs * Math.pow(2, i))
        continue
      }
      return result
    } catch (err) {
      lastError = err
      if (i < attempts - 1) await delay(baseDelayMs * Math.pow(2, i))
    }
  }
  throw lastError
}

/**
 * @param {string} message
 * @returns {boolean}
 */
function isTransientError(message) {
  const msg = String(message).toLowerCase()
  return (
    msg.includes('rate limit') ||
    msg.includes('rate_limit') ||
    msg.includes('timeout') ||
    msg.includes('overloaded') ||
    msg.includes('service unavailable') ||
    msg.includes('bad gateway') ||
    msg.includes('connection') ||
    /\b503\b/.test(msg) ||
    /\b502\b/.test(msg)
  )
}

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
