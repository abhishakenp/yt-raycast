import { createFileRoute } from '@tanstack/react-router'

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

const loadRewriteRuntime = async () => {
  const [{ generateText }, { DEFAULT_MODEL }] = await Promise.all([
    import('@ship-fast/engine'),
    import('@ship-fast/engine/model-list.js'),
  ])

  return { generateText, DEFAULT_MODEL }
}

export const Route = createFileRoute('/api/rewrite')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { text?: unknown; instruction?: unknown } = {}

        try {
          body = await request.json()
        } catch {
          return json({ error: 'Invalid JSON' }, { status: 400 })
        }

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
          const result = await generateText(
            DEFAULT_MODEL,
            system,
            user,
            new AbortController().signal,
            2,
          )
          return json({
            rewritten: result.trim().replace(/^["“”]+|["“”]+$/g, ''),
          })
        } catch (error) {
          return json(
            {
              error: error instanceof Error ? error.message : 'Rewrite failed',
            },
            { status: 500 },
          )
        }
      },
    },
  },
})
