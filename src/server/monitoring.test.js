import { describe, expect, it } from 'vitest'
import { buildHealthPayload, sendKumaHeartbeat, startKumaHeartbeat } from './monitoring.js'

describe('monitoring', () => {
  it('builds a stable health payload', () => {
    const payload = buildHealthPayload({
      startedAt: Date.parse('2026-06-05T00:00:00.000Z'),
      now: Date.parse('2026-06-05T00:00:42.000Z'),
      sessionsDir: '/tmp/sessions',
    })

    expect(payload).toMatchObject({
      ok: true,
      status: 'ok',
      service: 'ship-fast',
      timestamp: '2026-06-05T00:00:42.000Z',
      uptimeSeconds: 42,
      sessionsDir: '/tmp/sessions',
    })
  })

  it('formats an Uptime Kuma push heartbeat', async () => {
    const calls = []
    const result = await sendKumaHeartbeat({
      pushUrl: 'https://kuma.example/api/push/token',
      message: 'healthy',
      ping: 123,
      fetchImpl: async (url, init) => {
        calls.push({ url: String(url), init })
        return { ok: true, status: 200 }
      },
    })

    expect(result).toEqual({ ok: true, status: 200 })
    expect(calls[0].url).toBe('https://kuma.example/api/push/token?status=up&msg=healthy&ping=123')
    expect(calls[0].init.method).toBe('GET')
  })

  it('does not start heartbeat without a push URL', () => {
    const heartbeat = startKumaHeartbeat({ pushUrl: '' })
    expect(heartbeat.enabled).toBe(false)
    expect(() => heartbeat.stop()).not.toThrow()
  })
})
