// Talaas (chatjimmy.ai) custom HTTP provider. It is NOT a TanStack adapter — it
// speaks a bespoke protocol: a plain-text streamed body followed by a trailing
// <|stats|>{…}<|/stats|> block. So generate.ts routes talaas models here directly
// instead of through chat(), and we yield the same minimal chunk shape that the
// generation loop already consumes ({ type: "TEXT_MESSAGE_CONTENT" | "RUN_ERROR" }).

const TALAAS_ENDPOINT = "https://chatjimmy.ai/api/chat"
const STATS_MARKER = "<|stats|>"

export interface TalaasChunk {
  type: "TEXT_MESSAGE_CONTENT" | "RUN_ERROR"
  delta?: string
  message?: string
}

export async function* talaasChat(
  model: string,
  system: string,
  user: string,
  signal: AbortSignal,
): AsyncGenerator<TalaasChunk> {
  let res: Response
  try {
    res = await fetch(TALAAS_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "*/*", Referer: "https://chatjimmy.ai/" },
      body: JSON.stringify({
        messages: [{ role: "user", content: user }],
        chatOptions: { selectedModel: model, systemPrompt: system, topK: 8 },
        attachment: null,
      }),
      signal,
    })
  } catch (e) {
    yield { type: "RUN_ERROR", message: e instanceof Error ? e.message : "talaas request failed" }
    return
  }

  if (!res.ok || !res.body) {
    yield { type: "RUN_ERROR", message: `talaas ${res.status} ${res.statusText}` }
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ""
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })

      const idx = buf.indexOf(STATS_MARKER)
      if (idx !== -1) {
        const text = buf.slice(0, idx)
        if (text) yield { type: "TEXT_MESSAGE_CONTENT", delta: text }
        return // everything after the stats marker is metadata, not content
      }

      // Hold back the tail in case the marker is split across reads.
      const safe = buf.length - STATS_MARKER.length
      if (safe > 0) {
        yield { type: "TEXT_MESSAGE_CONTENT", delta: buf.slice(0, safe) }
        buf = buf.slice(safe)
      }
    }
    if (buf) yield { type: "TEXT_MESSAGE_CONTENT", delta: buf }
  } catch (e) {
    yield { type: "RUN_ERROR", message: e instanceof Error ? e.message : "talaas stream error" }
  }
}
