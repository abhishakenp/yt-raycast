import { afterEach, describe, expect, it, vi } from 'vitest'

import { windsurfChat } from './windsurf.ts'

const encodeVarint = (value: number) => {
  const out = []
  let next = value

  while (true) {
    const byte = next & 0x7f
    next = Math.floor(next / 128)
    if (next) {
      out.push(byte | 0x80)
    } else {
      out.push(byte)
      return out
    }
  }
}

const textField = (field: number, value: string) => {
  const bytes = new TextEncoder().encode(value)
  return new Uint8Array([
    ...encodeVarint((field << 3) | 2),
    ...encodeVarint(bytes.length),
    ...bytes,
  ])
}

const connectFrame = (payload: Uint8Array) => {
  const frame = new Uint8Array(5 + payload.length)
  frame[0] = 0
  new DataView(frame.buffer).setUint32(1, payload.length, false)
  frame.set(payload, 5)
  return frame
}

describe('windsurf provider', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.WINDSURF_SESSION_TOKEN
  })

  it('posts a Connect request with the selected model and streams text deltas', async () => {
    process.env.WINDSURF_SESSION_TOKEN = 'runtime-session-token'
    const delta = 'Generated homepage source'
    const fetchMock = vi.fn(async (_url, init) => {
      const body = Buffer.from(init?.body)
      const bodyText = body.toString('utf8')

      expect(init?.method).toBe('POST')
      expect(init?.headers).toMatchObject({
        authorization: 'Basic runtime-session-token',
        'content-type': 'application/connect+proto',
        'connect-protocol-version': '1',
      })
      expect(body[0]).toBe(0)
      expect(
        new DataView(body.buffer, body.byteOffset).getUint32(1, false),
      ).toBe(body.length - 5)
      expect(bodyText).toContain('system prompt from caller')
      expect(bodyText).toContain('user prompt from caller')
      expect(bodyText).toContain('glm-5-2')
      expect(bodyText).toContain('runtime-session-token')

      return new Response(connectFrame(textField(3, delta)))
    })
    vi.stubGlobal('fetch', fetchMock)

    const chunks = []
    for await (const chunk of windsurfChat(
      'glm-5-2',
      'system prompt from caller',
      'user prompt from caller',
      new AbortController().signal,
    )) {
      chunks.push(chunk)
    }

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(chunks).toEqual([{ type: 'TEXT_MESSAGE_CONTENT', delta }])
  })
})
