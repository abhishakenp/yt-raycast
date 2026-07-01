/**
 * Read a fetch Response body as JSON, throwing a stable fallback error when
 * the response is HTML or otherwise not valid JSON.
 *
 * Reverse proxies, gateways, and CAPTCHA pages sometimes return HTML error
 * pages (e.g. `<!doctype html>...`) with a 200/502/503 status instead of the
 * expected JSON. Calling `response.json()` directly on such a body throws a
 * cryptic `SyntaxError: Unexpected token '<'` which leaks raw parser text into
 * the UI. This helper detects HTML/non-JSON bodies (via content-type or a
 * leading `<`) and throws the supplied `fallbackMessage` instead, so callers
 * can show a stable, user-facing error.
 *
 * @example
 * const data = await readJsonOrThrow(response, 'Unable to load billing')
 * if (!response.ok) throw new Error(data?.error ?? 'Unable to load billing')
 */
export async function readJsonOrThrow<T = unknown>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  const contentType = response.headers?.get('content-type') ?? ''
  if (contentType.includes('text/html')) {
    throw new Error(fallbackMessage)
  }

  let text: string
  try {
    text = await response.text()
  } catch {
    // Some environments (e.g. test mocks) only implement json().
    try {
      return (await response.json()) as T
    } catch {
      throw new Error(fallbackMessage)
    }
  }

  const trimmed = text.trimStart()
  if (trimmed.startsWith('<')) {
    throw new Error(fallbackMessage)
  }

  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(fallbackMessage)
  }
}
