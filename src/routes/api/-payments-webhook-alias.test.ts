import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const read = (p: string): string => readFileSync(join(process.cwd(), p), 'utf8')

// The Razorpay dashboard webhook URL is `/api/payments/razorpay/webhook`, which
// differs from the canonical `/api/razorpay/webhook`. These alias routes ensure
// dashboard-registered events reach the handler instead of 404ing.
describe('payments webhook alias routes', () => {
  it('razorpay alias maps the dashboard URL to the razorpay handler', () => {
    const src = read('src/routes/api/payments.razorpay.webhook.ts')
    expect(src).toContain("createFileRoute('/api/payments/razorpay/webhook')")
    expect(src).toContain("createWebhookApiResponse(request, 'razorpay')")
  })

  it('stripe alias maps the dashboard URL to the stripe handler', () => {
    const src = read('src/routes/api/payments.stripe.webhook.ts')
    expect(src).toContain("createFileRoute('/api/payments/stripe/webhook')")
    expect(src).toContain("createWebhookApiResponse(request, 'stripe')")
  })

  it('canonical routes still exist', () => {
    expect(read('src/routes/api/razorpay.webhook.ts')).toContain(
      "createFileRoute('/api/razorpay/webhook')",
    )
    expect(read('src/routes/api/stripe.webhook.ts')).toContain(
      "createFileRoute('/api/stripe/webhook')",
    )
  })
})
