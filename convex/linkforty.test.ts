import { convexTest } from 'convex-test'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const ISS = 'https://enabled-warthog-25.clerk.accounts.dev'
const SECRET = 'test-linkforty-secret'

describe('linkforty analytics', () => {
  beforeEach(() => {
    vi.stubEnv('LINKFORTY_WEBHOOK_MUTATION_SECRET', SECRET)
  })

  it('getMyLinkFortyAnalytics uses tokenIdentifier (not subject) to look up referral codes', async () => {
    const t = convexTest(schema, modules)

    // Create a referral code as the user — this stores tokenIdentifier as userId
    const { code } = await t
      .withIdentity({ issuer: ISS, subject: 'user_alice' })
      .mutation(api.referrals.getOrCreateMyReferralCode, {})

    // Set a linkforty link ID on the code
    await t.mutation(api.linkforty.setLinkfortyLinkIdForTest, {
      code,
      linkId: 'link_1',
      shortUrl: 'https://links.ship-fast.ai/' + code,
    })

    // Record a click event
    await t.mutation(api.linkforty.recordClickEvent, {
      secret: SECRET,
      clickId: 'click_1',
      shortCode: code,
      linkId: 'link_1',
      clickedAt: Date.now(),
      deviceType: 'desktop',
      platform: 'Mac OS',
      countryCode: 'IN',
      countryName: 'India',
      city: 'Mumbai',
      isBot: false,
    })

    // Query analytics as the same user — must find the code by tokenIdentifier
    const analytics = await t
      .withIdentity({ issuer: ISS, subject: 'user_alice' })
      .query(api.linkforty.getMyLinkFortyAnalytics, {})

    expect(analytics.enabled).toBe(true)
    expect(analytics.shortUrl).toBe('https://links.ship-fast.ai/' + code)
    expect(analytics.totalClicks).toBe(1)
    expect(analytics.clicksByCountry).toContainEqual({
      key: 'India',
      clicks: 1,
    })
  })

  it('returns enabled=false when no linkforty link is provisioned', async () => {
    const t = convexTest(schema, modules)

    await t
      .withIdentity({ issuer: ISS, subject: 'user_bob' })
      .mutation(api.referrals.getOrCreateMyReferralCode, {})

    const analytics = await t
      .withIdentity({ issuer: ISS, subject: 'user_bob' })
      .query(api.linkforty.getMyLinkFortyAnalytics, {})

    expect(analytics.enabled).toBe(false)
    expect(analytics.totalClicks).toBe(0)
  })
})
