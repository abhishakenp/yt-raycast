import { createHmac } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'

import { createGitHubWebhookResponse } from './github-webhook-response'

const activeSecret = 'github-active-secret'
const mutationSecret = 'github-mutation-secret'

const signedRequest = (
  body: string,
  secret = activeSecret,
  delivery = 'delivery-1',
) =>
  new Request('https://ship-fast.test/api/github/webhook', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-github-delivery': delivery,
      'x-hub-signature-256': `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`,
    },
    body,
  })

const configuredEnv = () => ({
  GITHUB_WEBHOOK_SECRET: activeSecret,
  GITHUB_WEBHOOK_MUTATION_SECRET: mutationSecret,
})

describe('createGitHubWebhookResponse', () => {
  it('verifies a raw SHA-256 signature and records GitHub delivery IDs', async () => {
    const mutation = vi.fn().mockResolvedValue({ inserted: true })
    const response = await createGitHubWebhookResponse(
      signedRequest('{"action":"opened"}'),
      { env: configuredEnv(), client: { mutation } },
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ received: true, duplicate: false })
    expect(mutation).toHaveBeenCalledWith(expect.anything(), {
      secret: mutationSecret,
      deliveryId: 'delivery-1',
    })
  })

  it('rejects missing delivery IDs and tampered signatures before Convex', async () => {
    const mutation = vi.fn()
    const missingDelivery = new Request(
      'https://ship-fast.test/api/github/webhook',
      {
        method: 'POST',
        headers: { 'x-hub-signature-256': 'sha256=bad' },
        body: '{}',
      },
    )
    expect(
      (
        await createGitHubWebhookResponse(missingDelivery, {
          env: configuredEnv(),
          client: { mutation },
        })
      ).status,
    ).toBe(400)
    const signatureForOriginal = createHmac('sha256', activeSecret)
      .update('{"unchanged":true}')
      .digest('hex')
    const tampered = new Request('https://ship-fast.test/api/github/webhook', {
      method: 'POST',
      headers: {
        'x-github-delivery': 'delivery-tampered',
        'x-hub-signature-256': `sha256=${signatureForOriginal}`,
      },
      body: '{"changed":true}',
    })
    expect(
      (
        await createGitHubWebhookResponse(tampered, {
          env: configuredEnv(),
          client: { mutation },
        })
      ).status,
    ).toBe(401)
    expect(mutation).not.toHaveBeenCalled()
  })

  it('accepts only a non-expired previous secret and acknowledges duplicate deliveries', async () => {
    const mutation = vi.fn().mockResolvedValue({ inserted: false })
    const response = await createGitHubWebhookResponse(
      signedRequest('{"zen":"Keep it logically awesome."}', 'previous-secret'),
      {
        env: {
          ...configuredEnv(),
          GITHUB_WEBHOOK_SECRET_PREVIOUS: 'previous-secret',
          GITHUB_WEBHOOK_SECRET_PREVIOUS_EXPIRES_AT: String(
            Date.now() + 60_000,
          ),
        },
        client: { mutation },
      },
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ received: true, duplicate: true })
  })
})
