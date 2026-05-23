const DEFAULT_GEMINI_TIMEOUT_MS = () =>
  parseInt(process.env.SHIP_GEMINI_TIMEOUT_MS || process.env.SHIP_GEMINI_HERO_TIMEOUT_MS || '17000', 10)

export async function completeGemini({
  prompt,
  model = process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  temperature = 0.6,
  maxOutputTokens = 3400,
  timeoutMs = DEFAULT_GEMINI_TIMEOUT_MS(),
} = {}) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY / GOOGLE_API_KEY not set')
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      maxOutputTokens,
      thinkingConfig: { thinkingBudget: 0 },
    },
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const t0 = Date.now()
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const ms = Date.now() - t0
    const raw = await res.text()
    if (!res.ok) throw new Error(`gemini ${res.status}: ${raw.slice(0, 240)}`)
    const data = JSON.parse(raw)
    const content = data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join('') || ''
    return {
      content,
      model,
      ms,
      outputTokens: data?.usageMetadata?.candidatesTokenCount || 0,
      raw: data,
    }
  } catch (err) {
    const ms = Date.now() - t0
    if (err?.name === 'AbortError') {
      const timeoutErr = new Error(`gemini timeout after ${timeoutMs}ms`)
      timeoutErr.code = 'GEMINI_TIMEOUT'
      timeoutErr.ms = ms
      throw timeoutErr
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}
