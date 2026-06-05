import { createServer } from 'node:http'
import express from 'express'
import { describe, expect, it } from 'vitest'
import { getClientIp, resolveTrustProxySetting } from './client-ip.js'

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, () => {
      server.off('error', reject)
      resolve(server.address().port)
    })
  })
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()))
  })
}

describe('client IP security policy', () => {
  it('does not trust all proxy hops by default', () => {
    expect(resolveTrustProxySetting({})).toBe(false)
  })

  it('allows explicit proxy trust configuration', () => {
    expect(resolveTrustProxySetting({ TRUST_PROXY: '1' })).toBe('1')
    expect(resolveTrustProxySetting({ TRUST_PROXY: 'false' })).toBe(false)
  })

  it('uses Express resolved IP instead of raw forwarded headers', () => {
    expect(
      getClientIp({
        ip: '203.0.113.10',
        headers: { 'x-forwarded-for': '127.0.0.1' },
      }),
    ).toBe('203.0.113.10')
  })

  it('normalizes IPv4-mapped IPv6 socket addresses', () => {
    expect(getClientIp({ socket: { remoteAddress: '::ffff:198.51.100.8' } })).toBe(
      '198.51.100.8',
    )
  })

  it('ignores spoofed X-Forwarded-For on a direct Express request by default', async () => {
    const app = express()
    app.set('trust proxy', resolveTrustProxySetting({}))
    app.get('/ip', (req, res) => {
      res.json({ ip: getClientIp(req) })
    })
    const server = createServer(app)
    const port = await listen(server)
    try {
      const response = await fetch(`http://127.0.0.1:${port}/ip`, {
        headers: { 'X-Forwarded-For': '203.0.113.77' },
      })
      const body = await response.json()
      expect(body.ip).not.toBe('203.0.113.77')
      expect(body.ip).toMatch(/127\.0\.0\.1|::1/)
    } finally {
      await close(server)
    }
  })
})
