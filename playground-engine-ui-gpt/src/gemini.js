export async function completeGeminiTiny({
  prompt,
  model = process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  temperature = 0.45,
  maxOutputTokens = 900,
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
  const t0 = Date.now()
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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
}
