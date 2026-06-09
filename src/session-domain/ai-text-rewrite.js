const DEFAULT_REWRITE_MODEL = process.env.AI_REWRITE_MODEL || 'llama-3.1-8b-instant'
const DEFAULT_REWRITE_TIMEOUT_MS = 25_000

export function buildRewritePrompts({ text, instruction }) {
  return {
    system:
      'You are a skilled website copywriter. Rewrite selected website copy according to the instruction. Output only the rewritten text, with no quotes, markdown, commentary, labels, or alternatives. Keep roughly the same meaning unless the instruction asks otherwise.',
    user: `Original text:\n${String(text || '').trim()}\n\nInstruction:\n${String(instruction || '').trim()}\n\nRewritten text:`,
  }
}

export function normalizeRewrittenText(value) {
  return String(value || '')
    .trim()
    .replace(/^```(?:text)?/i, '')
    .replace(/```$/i, '')
    .trim()
    .replace(/^["“”]+|["“”]+$/g, '')
    .trim()
}

export async function rewriteSelectedText({
  text,
  instruction,
  model = DEFAULT_REWRITE_MODEL,
  generate,
  signal,
  timeoutMs = DEFAULT_REWRITE_TIMEOUT_MS,
}) {
  const original = String(text || '').trim()
  const rewriteInstruction = String(instruction || '').trim()
  if (!original) throw new Error('Text is required')
  if (!rewriteInstruction) throw new Error('Instruction is required')

  const generateText =
    generate ||
    (await import('@ship-fast/engine')).generateText
  const prompts = buildRewritePrompts({ text: original, instruction: rewriteInstruction })
  const timeoutController = new AbortController()
  const timeout = setTimeout(() => timeoutController.abort(), timeoutMs)
  const onAbort = () => timeoutController.abort()
  signal?.addEventListener('abort', onAbort, { once: true })
  try {
    const result = await generateText(model, prompts.system, prompts.user, timeoutController.signal, 1)
    const rewritten = normalizeRewrittenText(result)
    if (!rewritten) throw new Error('AI rewrite returned empty text')
    return { rewritten }
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', onAbort)
  }
}
