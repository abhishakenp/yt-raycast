import { createFileRoute } from '@tanstack/react-router'

const MAX_REWRITE_BODY_BYTES = 1_000_000
const REWRITE_TIMEOUT_MS = 30_000

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

const loadRewriteRuntime = async () => {
  const [{ generateText }, { DEFAULT_MODEL }] = await Promise.all([
    import('@ship-fast/engine'),
    import('@ship-fast/engine/model-list.js'),
  ])

  return { generateText, DEFAULT_MODEL }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

async function readRewriteBody(request: Request): Promise<string | null> {
  const contentLength = Number(request.headers.get('content-length'))
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_REWRITE_BODY_BYTES
  ) {
    return null
  }

  const reader = request.body?.getReader()
  if (!reader) return ''

  const decoder = new TextDecoder()
  let byteLength = 0
  let body = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      byteLength += value.byteLength
      if (byteLength > MAX_REWRITE_BODY_BYTES) {
        await reader.cancel()
        return null
      }
      body += decoder.decode(value, { stream: true })
    }
    return body + decoder.decode()
  } finally {
    reader.releaseLock()
  }
}

export const Route = createFileRoute('/api/rewrite')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await readRewriteBody(request)
        if (rawBody === null) {
          return json(
            { error: 'Rewrite request is too large' },
            { status: 413 },
          )
        }

        let parsedBody: unknown

        try {
          parsedBody = JSON.parse(rawBody)
        } catch {
          return json({ error: 'Invalid JSON' }, { status: 400 })
        }

        const body = isRecord(parsedBody) ? parsedBody : {}

        const text = typeof body.text === 'string' ? body.text.trim() : ''
        const instruction =
          typeof body.instruction === 'string' ? body.instruction.trim() : ''

        if (!text || !instruction) {
          return json(
            { error: 'Text and instruction are required' },
            { status: 422 },
          )
        }

        try {
          const system =
            'You are a skilled copywriter. Rewrite the user text according to the instruction. Output only the rewritten text, with no quotes, no markdown, and no explanation. Keep the same approximate length unless asked otherwise.'
          const user = `Original text: "${text}"\n\nInstruction: ${instruction}\n\nRewritten text:`
          const { generateText, DEFAULT_MODEL } = await loadRewriteRuntime()
          const abortController = new AbortController()
          let timeoutId: ReturnType<typeof setTimeout> | undefined
          const timeout = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => {
              abortController.abort()
              reject(new Error('Rewrite request timed out'))
            }, REWRITE_TIMEOUT_MS)
          })
          const result = await Promise.race([
            generateText(
              DEFAULT_MODEL,
              system,
              user,
              abortController.signal,
              2,
            ),
            timeout,
          ]).finally(() => clearTimeout(timeoutId))
          const rewritten = result.trim().replace(/^["“”]+|["“”]+$/g, '')
          if (!rewritten) throw new Error('Rewrite result is empty')
          return json({
            rewritten,
          })
        } catch {
          return json({ error: 'Rewrite failed.' }, { status: 502 })
        }
      },
    },
  },
})
