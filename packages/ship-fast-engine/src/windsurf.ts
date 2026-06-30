// Windsurf/Codeium backend provider (Connect-RPC over HTTP, protobuf).
// Uses the swe-1-6 model via the same backend Devin CLI uses. This is a custom
// provider outside @tanstack/ai — it speaks Connect-RPC streaming protobuf,
// so generate.ts routes windsurf models here directly (like talaas.ts).
//
// HOW IT WORKS:
// 1. A captured GetChatMessageRequest template (windsurf-template.bin) holds all
//    the required auth/session/metadata fields we don't want to reverse-engineer.
// 2. At runtime we parse the protobuf, swap field 2 (system), the last field 3
//    (user message text), and field 21 (model), then re-encode with fresh lengths.
// 3. We POST it with Connect-RPC headers and parse the streaming response frames,
//    extracting field 3 (text deltas) from each ChatMessageResponse.
//
// TOKEN EXPIRY: The session token is embedded in the template. When it expires,
// re-capture via mitmproxy (see devin-say-hi.sh workflow) and replace
// windsurf-template.bin. Override the token at runtime with WINDSURF_SESSION_TOKEN.

import { readFileSync } from 'node:fs'
import { Buffer } from 'node:buffer'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ENDPOINT =
  'https://server.codeium.com/exa.api_server_pb.ApiServerService/GetChatMessage'
const TEMPLATE_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  'windsurf-template.bin',
)

// Extract the session token from the template's metadata field (1.3) once.
const TEMPLATE = readFileSync(TEMPLATE_PATH)
const TEMPLATE_TOKEN = extractToken(TEMPLATE.slice(5)) // skip 5-byte Connect envelope

export interface WindsurfChunk {
  type: 'TEXT_MESSAGE_CONTENT' | 'RUN_ERROR'
  delta?: string
  message?: string
}

export async function* windsurfChat(
  model: string,
  system: string,
  user: string,
  signal: AbortSignal,
): AsyncGenerator<WindsurfChunk> {
  const token = process.env.WINDSURF_SESSION_TOKEN ?? TEMPLATE_TOKEN
  const body = buildRequest(system, user, model, token)

  let res: Response
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        authorization: `Basic ${token}`,
        'content-type': 'application/connect+proto',
        'connect-protocol-version': '1',
        accept: '*/*',
      },
      body: body as BodyInit,
      signal,
    })
  } catch (e) {
    yield {
      type: 'RUN_ERROR',
      message: e instanceof Error ? e.message : 'windsurf request failed',
    }
    return
  }

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '')
    yield {
      type: 'RUN_ERROR',
      message: `windsurf ${res.status} ${res.statusText} ${text.slice(0, 200)}`,
    }
    return
  }

  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) chunks.push(value)
    }
  } catch (e) {
    yield {
      type: 'RUN_ERROR',
      message: e instanceof Error ? e.message : 'windsurf stream error',
    }
    return
  }

  // Concatenate all chunks and parse Connect-RPC frames
  const total = chunks.reduce((n, c) => n + c.length, 0)
  const blob = new Uint8Array(total)
  let off = 0
  for (const c of chunks) {
    blob.set(c, off)
    off += c.length
  }

  for (const { flags, payload } of parseFrames(blob)) {
    if (flags & 2) {
      // End-stream trailer — check for error
      const txt = new TextDecoder().decode(payload)
      if (txt.includes('"error"')) {
        yield {
          type: 'RUN_ERROR',
          message: `windsurf trailer: ${txt.slice(0, 300)}`,
        }
      }
      continue
    }
    for (const text of extractTextDeltas(payload)) {
      if (text && !text.startsWith('bot-')) {
        yield { type: 'TEXT_MESSAGE_CONTENT', delta: text }
      }
    }
  }
}

// --- Protobuf helpers ---

function readVarint(buf: Uint8Array, i: number): [number, number] {
  let shift = 0,
    result = 0
  while (i < buf.length) {
    const b = buf[i++]
    result |= (b & 0x7f) << shift
    if (!(b & 0x80)) return [result, i]
    shift += 7
  }
  return [result, i]
}

function encVarint(n: number): number[] {
  const out: number[] = []
  while (true) {
    const b = n & 0x7f
    n = Math.floor(n / 128) // unsigned div for >32bit safety
    if (n) out.push(b | 0x80)
    else {
      out.push(b)
      return out
    }
  }
}

function tag(field: number, wire: number): number[] {
  return encVarint((field << 3) | wire)
}

function encStr(field: number, s: string): number[] {
  const b = new TextEncoder().encode(s)
  return [...tag(field, 2), ...encVarint(b.length), ...b]
}

function encBytes(field: number, b: Uint8Array): number[] {
  return [...tag(field, 2), ...encVarint(b.length), ...b]
}

function encVarintField(field: number, n: number): number[] {
  return [...tag(field, 0), ...encVarint(n)]
}

interface ParsedField {
  field: number
  wire: number
  value: number | Uint8Array
}

function parseFields(buf: Uint8Array): ParsedField[] {
  const fields: ParsedField[] = []
  let i = 0
  while (i < buf.length) {
    const [t, ni] = readVarint(buf, i)
    i = ni
    const wire = t & 7
    const field = t >>> 3
    if (wire === 2) {
      const [ln, ni2] = readVarint(buf, i)
      i = ni2
      fields.push({ field, wire, value: buf.slice(i, i + ln) })
      i += ln
    } else if (wire === 0) {
      const [v, ni2] = readVarint(buf, i)
      i = ni2
      fields.push({ field, wire, value: v })
    } else if (wire === 1) {
      fields.push({ field, wire, value: buf.slice(i, i + 8) })
      i += 8
    } else if (wire === 5) {
      fields.push({ field, wire, value: buf.slice(i, i + 4) })
      i += 4
    } else break
  }
  return fields
}

function extractToken(payload: Uint8Array): string {
  for (const f of parseFields(payload)) {
    if (f.field === 1 && f.wire === 2 && f.value instanceof Uint8Array) {
      for (const sf of parseFields(f.value)) {
        if (sf.field === 3 && sf.wire === 2 && sf.value instanceof Uint8Array) {
          return new TextDecoder().decode(sf.value)
        }
      }
    }
  }
  return ''
}

function buildRequest(
  system: string,
  user: string,
  model: string,
  token: string,
): Buffer {
  const payload = TEMPLATE.slice(5) // skip Connect envelope
  const fields = parseFields(payload)

  // Find last field 3 (the user message)
  let lastF3Idx = -1
  for (let i = 0; i < fields.length; i++) {
    if (fields[i].field === 3) lastF3Idx = i
  }

  const out: number[] = []
  for (let idx = 0; idx < fields.length; idx++) {
    const f = fields[idx]
    if (f.field === 2 && f.wire === 2) {
      // Replace system prompt
      out.push(...encStr(2, system))
    } else if (
      idx === lastF3Idx &&
      f.field === 3 &&
      f.wire === 2 &&
      f.value instanceof Uint8Array
    ) {
      // Replace user message: keep structure but swap field 3 text + fresh uuid (field 1)
      const sub = parseFields(f.value)
      const subOut: number[] = []
      for (const sf of sub) {
        if (sf.field === 3 && sf.wire === 2) {
          subOut.push(...encStr(3, user))
        } else if (sf.field === 1 && sf.wire === 2) {
          subOut.push(...encStr(1, crypto.randomUUID()))
        } else if (sf.wire === 2 && sf.value instanceof Uint8Array) {
          subOut.push(...encBytes(sf.field, sf.value))
        } else if (sf.wire === 0) {
          subOut.push(...encVarintField(sf.field, sf.value as number))
        } else if (sf.wire === 1 && sf.value instanceof Uint8Array) {
          subOut.push(...tag(sf.field, 1), ...sf.value)
        } else if (sf.wire === 5 && sf.value instanceof Uint8Array) {
          subOut.push(...tag(sf.field, 5), ...sf.value)
        }
      }
      out.push(...encBytes(3, new Uint8Array(subOut)))
    } else if (f.field === 21 && f.wire === 2) {
      // Replace model
      out.push(...encStr(21, model))
    } else if (f.field === 1 && f.wire === 2 && f.value instanceof Uint8Array) {
      // Update token in metadata
      const meta = parseFields(f.value)
      const metaOut: number[] = []
      for (const mf of meta) {
        if (mf.field === 3 && mf.wire === 2) {
          metaOut.push(...encStr(3, token))
        } else if (mf.wire === 2 && mf.value instanceof Uint8Array) {
          metaOut.push(...encBytes(mf.field, mf.value))
        } else if (mf.wire === 0) {
          metaOut.push(...encVarintField(mf.field, mf.value as number))
        } else if (mf.wire === 1 && mf.value instanceof Uint8Array) {
          metaOut.push(...tag(mf.field, 1), ...mf.value)
        } else if (mf.wire === 5 && mf.value instanceof Uint8Array) {
          metaOut.push(...tag(mf.field, 5), ...mf.value)
        }
      }
      out.push(...encBytes(1, new Uint8Array(metaOut)))
    } else if (f.wire === 2 && f.value instanceof Uint8Array) {
      out.push(...encBytes(f.field, f.value))
    } else if (f.wire === 0) {
      out.push(...encVarintField(f.field, f.value as number))
    } else if (f.wire === 1 && f.value instanceof Uint8Array) {
      out.push(...tag(f.field, 1), ...f.value)
    } else if (f.wire === 5 && f.value instanceof Uint8Array) {
      out.push(...tag(f.field, 5), ...f.value)
    }
  }

  // Wrap in Connect envelope: 1 byte flags (0) + 4 byte BE length + payload
  const payloadBytes = new Uint8Array(out)
  const header = new Uint8Array(5)
  header[0] = 0
  new DataView(header.buffer).setUint32(1, payloadBytes.length, false)
  const result = new Uint8Array(5 + payloadBytes.length)
  result.set(header, 0)
  result.set(payloadBytes, 5)
  return Buffer.from(result)
}

interface Frame {
  flags: number
  payload: Uint8Array
}

function parseFrames(blob: Uint8Array): Frame[] {
  const frames: Frame[] = []
  const view = new DataView(blob.buffer, blob.byteOffset, blob.byteLength)
  let i = 0
  while (i + 5 <= blob.length) {
    const flags = blob[i]
    const ln = view.getUint32(i + 1, false) // big-endian
    i += 5
    if (i + ln > blob.length) break
    frames.push({ flags, payload: blob.slice(i, i + ln) })
    i += ln
  }
  return frames
}

// Known metadata strings from the stats frame — filter these out.
const META_STRINGS = new Set([
  'Response Statistics',
  'Agent messages',
  'Model',
  'Token Usage',
  'output_tokens',
  'Output tokens',
  'cached_input_tokens',
  'Cached input tokens',
  'input_tokens',
  'Input tokens',
  'message',
  'messages',
  'token',
  'tokens',
  'content',
  'role',
  'assistant',
  'stop',
  'finish_reason',
])

function extractTextDeltas(payload: Uint8Array): string[] {
  const texts: string[] = []
  for (const f of parseFields(payload)) {
    // Only top-level field 3 holds the streamed text delta.
    // Nested field 3s inside stats/metadata frames (field 28 etc.) are noise.
    if (f.field === 3 && f.wire === 2 && f.value instanceof Uint8Array) {
      try {
        const s = new TextDecoder().decode(f.value)
        if (s && !META_STRINGS.has(s) && !s.startsWith('bot-')) {
          texts.push(s)
        }
      } catch {
        /* not valid utf-8 */
      }
    }
  }
  return texts
}
