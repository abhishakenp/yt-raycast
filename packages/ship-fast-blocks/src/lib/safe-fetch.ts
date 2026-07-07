/**
 * Read a fetch Response body as JSON, throwing a stable fallback error when
 * the response is HTML or otherwise not valid JSON.
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
