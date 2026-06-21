import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const read = (relativePath: string): string =>
  readFileSync(join(process.cwd(), relativePath), 'utf8')

describe('referral program wiring (regression guards)', () => {
  it('schema declares the referral tables', () => {
    const schema = read('convex/schema.ts')
    expect(schema).toContain('referralCodes: defineTable')
    expect(schema).toContain('referrals: defineTable')
    expect(schema).toContain('referralRewards: defineTable')
  })

  it('billing webhook qualifies referrals on payment', () => {
    const billing = read('convex/billing.ts')
    expect(billing).toContain('qualifyReferralOnPayment')
    // Must return unlock info so the server can apply the discount.
    expect(billing).toContain('referralUnlock')
  })

  it('qualification ignores disposable emails and requires payment', () => {
    const qualification = read('convex/lib/referral_qualification.ts')
    expect(qualification).toContain('emailDisposable')
    expect(qualification).toContain("status: 'disqualified'")
    expect(qualification).toContain("status: 'qualified'")
  })

  it('reward unlock is permanent (monotonic)', () => {
    const helpers = read('convex/lib/referral_helpers.ts')
    expect(helpers).toContain('alreadyUnlocked')
    expect(helpers).toContain('REFERRAL_THRESHOLD = 2')
    expect(helpers).toContain('REFERRAL_DISCOUNT_PERCENT = 50')
  })

  it('discount applies a 50% forever coupon at the provider', () => {
    const discount = read('src/features/referrals/server/referral-discount.ts')
    expect(discount).toContain("duration: 'forever'")
    expect(discount).toContain('percent_off')
    expect(discount).toContain('discounts[0][coupon]')
  })

  it('webhook handler reconciles the referral discount', () => {
    const webhook = read('src/features/billing/server/webhook-api-response.ts')
    expect(webhook).toContain('applyReferralDiscountForUser')
    expect(webhook).toContain('referralUnlock')
  })

  it('checkout applies the discount for unlocked referrers', () => {
    const checkout = read(
      'src/features/billing/server/checkout-api-response.ts',
    )
    expect(checkout).toContain('isDiscountUnlockedForUser')
    expect(checkout).toContain('discounts[0][coupon]')
  })

  it('referral signup is captured app-wide and recorded server-side', () => {
    const root = read('src/routes/__root.tsx')
    expect(root).toContain('useReferralCapture')
    const capture = read('src/features/referrals/hooks/useReferralCapture.ts')
    expect(capture).toContain('postReferralRecord')
    const client = read('src/features/referrals/lib/referral-client.ts')
    expect(client).toContain('/api/referrals/record')
  })

  it('disposable blocklist covers the burners called out for launch', () => {
    const list = read('convex/lib/disposable_email.ts')
    for (const domain of [
      'mailinator.com',
      'yopmail.com',
      'guerrillamail.com',
      'temp-mail.org',
    ]) {
      expect(list).toContain(domain)
    }
  })
})
