import { describe, expect, it } from 'vitest'

import { createLinkFortyWebhookResponse } from '@/features/linkforty/server/linkforty-webhook-response'
import { verifyLinkFortyWebhookSignature } from '@/features/linkforty/lib/linkforty-client'

const SECRET = 'test-webhook-secret'

function signPayload(payload: string, secret: string): string {
  // Use Node's crypto to generate HMAC-SHA256 (matches LinkForty's signing)
  const crypto = require('crypto')
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  return `sha256=${signature}`
}

function createWebhookRequest(body: string, signature: string): Request {
  return new Request('https://ship-fast.ai/api/linkforty/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-LinkForty-Signature': signature,
    },
    body,
  })
}

function createClickPayload(overrides: Record<string, unknown> = {}): string {
  const payload = {
    event: 'click_event',
    event_id: 'evt-001',
    timestamp: new Date().toISOString(),
    data: {
      id: 'click-001',
      linkId: 'link-001',
      shortCode: 'ABC123',
      originalUrl: 'https://ship-fast.ai/?ref=ABC123',
      clickedAt: new Date().toISOString(),
      deviceType: 'web',
      platform: 'macos',
      countryCode: 'US',
      countryName: 'United States',
      city: 'New York',
      isBot: false,
      botReason: null,
      utmSource: 'twitter',
      utmMedium: 'social',
      utmCampaign: 'launch',
      referrer: 'https://twitter.com',
      ...overrides,
    },
  }
  return JSON.stringify(payload)
}

describe('linkforty-webhook-response', () => {
  describe('verifyLinkFortyWebhookSignature', () => {
    it('verifies a valid signature', async () => {
      const body = '{"test":true}'
      const signature = signPayload(body, SECRET)
      await expect(
        verifyLinkFortyWebhookSignature(body, signature, SECRET),
      ).resolves.toBe(true)
    })

    it('rejects an invalid signature', async () => {
      const body = '{"test":true}'
      const signature = 'sha256=invalidhex'
      await expect(
        verifyLinkFortyWebhookSignature(body, signature, SECRET),
      ).resolves.toBe(false)
    })

    it('rejects when signature header is missing the sha256= prefix', async () => {
      const body = '{"test":true}'
      await expect(
        verifyLinkFortyWebhookSignature(body, 'justhex', SECRET),
      ).resolves.toBe(false)
    })

    it('rejects when secret is wrong', async () => {
      const body = '{"test":true}'
      const signature = signPayload(body, 'wrong-secret')
      await expect(
        verifyLinkFortyWebhookSignature(body, signature, SECRET),
      ).resolves.toBe(false)
    })

    it('rejects when body was tampered', async () => {
      const originalBody = '{"test":true}'
      const signature = signPayload(originalBody, SECRET)
      const tamperedBody = '{"test":false}'
      await expect(
        verifyLinkFortyWebhookSignature(tamperedBody, signature, SECRET),
      ).resolves.toBe(false)
    })
  })

  describe('createLinkFortyWebhookResponse', () => {
    it('returns 404 when LinkForty is not enabled', async () => {
      const request = createWebhookRequest(createClickPayload(), 'sha256=abc')
      const response = await createLinkFortyWebhookResponse(request, {
        env: { LINKFORTY_ENABLED: 'false', LINKFORTY_WEBHOOK_SECRET: SECRET },
      })
      expect(response.status).toBe(404)
    })

    it('returns 503 when webhook secret is not configured', async () => {
      const request = createWebhookRequest(createClickPayload(), 'sha256=abc')
      const response = await createLinkFortyWebhookResponse(request, {
        env: { LINKFORTY_ENABLED: 'true' },
      })
      expect(response.status).toBe(503)
    })

    it('returns 401 when signature is invalid', async () => {
      const body = createClickPayload()
      const request = createWebhookRequest(body, 'sha256=invalid')
      const response = await createLinkFortyWebhookResponse(request, {
        env: {
          LINKFORTY_ENABLED: 'true',
          LINKFORTY_WEBHOOK_SECRET: SECRET,
        },
      })
      expect(response.status).toBe(401)
    })

    it('returns 400 when body is empty', async () => {
      const request = new Request(
        'https://ship-fast.ai/api/linkforty/webhook',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-LinkForty-Signature': 'sha256=abc',
          },
          body: '',
        },
      )
      const response = await createLinkFortyWebhookResponse(request, {
        env: {
          LINKFORTY_ENABLED: 'true',
          LINKFORTY_WEBHOOK_SECRET: SECRET,
        },
      })
      expect(response.status).toBe(400)
    })

    it('returns 400 when payload is not a valid click event', async () => {
      const body = JSON.stringify({ event: 'click_event', data: {} })
      const signature = signPayload(body, SECRET)
      const request = createWebhookRequest(body, signature)
      const response = await createLinkFortyWebhookResponse(request, {
        env: {
          LINKFORTY_ENABLED: 'true',
          LINKFORTY_WEBHOOK_SECRET: SECRET,
        },
      })
      expect(response.status).toBe(400)
    })

    it('acknowledges non-click events without calling Convex', async () => {
      const body = JSON.stringify({
        event: 'install_event',
        event_id: 'evt-002',
        timestamp: new Date().toISOString(),
        data: {
          id: 'install-001',
          linkId: 'link-001',
          shortCode: 'ABC123',
          originalUrl: 'https://ship-fast.ai/?ref=ABC123',
          clickedAt: new Date().toISOString(),
        },
      })
      const signature = signPayload(body, SECRET)
      const request = createWebhookRequest(body, signature)
      const response = await createLinkFortyWebhookResponse(request, {
        env: {
          LINKFORTY_ENABLED: 'true',
          LINKFORTY_WEBHOOK_SECRET: SECRET,
        },
      })
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual({ received: true, ignored: true })
    })

    it('records a valid click event via Convex mutation', async () => {
      const body = createClickPayload()
      const signature = signPayload(body, SECRET)
      const request = createWebhookRequest(body, signature)

      const mutationCalls: Array<Record<string, unknown>> = []
      const mockClient = {
        mutation: async (
          ref: unknown,
          args: Record<string, unknown>,
        ): Promise<{ recorded: boolean; reason: string }> => {
          mutationCalls.push({ ref, args })
          return { recorded: true, reason: 'created' }
        },
      }

      const response = await createLinkFortyWebhookResponse(request, {
        convexClient: mockClient,
        env: {
          LINKFORTY_ENABLED: 'true',
          LINKFORTY_WEBHOOK_SECRET: SECRET,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual({ received: true })
      expect(mutationCalls).toHaveLength(1)
      expect(mutationCalls[0].args).toMatchObject({
        clickId: 'click-001',
        shortCode: 'ABC123',
        linkId: 'link-001',
        isBot: false,
        utmSource: 'twitter',
      })
    })

    it('returns 502 when Convex mutation fails', async () => {
      const body = createClickPayload()
      const signature = signPayload(body, SECRET)
      const request = createWebhookRequest(body, signature)

      const mockClient = {
        mutation: async (): Promise<never> => {
          throw new Error('Convex is down')
        },
      }

      const response = await createLinkFortyWebhookResponse(request, {
        convexClient: mockClient,
        env: {
          LINKFORTY_ENABLED: 'true',
          LINKFORTY_WEBHOOK_SECRET: SECRET,
        },
      })

      expect(response.status).toBe(502)
    })

    it('passes isBot=true for bot clicks', async () => {
      const body = createClickPayload({ isBot: true, botReason: 'ua' })
      const signature = signPayload(body, SECRET)
      const request = createWebhookRequest(body, signature)

      const mutationCalls: Array<Record<string, unknown>> = []
      const mockClient = {
        mutation: async (
          _ref: unknown,
          args: Record<string, unknown>,
        ): Promise<{ recorded: boolean; reason: string }> => {
          mutationCalls.push({ args })
          return { recorded: true, reason: 'created' }
        },
      }

      await createLinkFortyWebhookResponse(request, {
        convexClient: mockClient,
        env: {
          LINKFORTY_ENABLED: 'true',
          LINKFORTY_WEBHOOK_SECRET: SECRET,
        },
      })

      expect(mutationCalls[0].args).toMatchObject({
        isBot: true,
        botReason: 'ua',
      })
    })
  })
})
