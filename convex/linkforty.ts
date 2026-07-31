import { v } from 'convex/values'

import { internal } from './_generated/api'
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from './_generated/server'
import type { QueryCtx } from './_generated/server'
import { verifyServerSecret } from './lib/server_secret'
import { createLinkFortyShortLink } from '../src/features/linkforty/lib/linkforty-client'

/**
 * LinkForty integration — referral short links + click analytics.
 *
 * Flow:
 * 1. User creates a referral code (referrals.ts: ensureReferralCode).
 * 2. A scheduled internal action (provisionShortLink) calls LinkForty to
 *    create links.ship-fast.ai/CODE → ship-fast.ai/?ref=CODE.
 * 3. The linkfortyLinkId / linkfortyShortUrl are stored on referralCodes.
 * 4. When someone clicks the short link, LinkForty redirects to ?ref=CODE
 *    AND fires a click_event webhook to /api/linkforty/webhook.
 * 5. The webhook handler calls recordClickEvent (idempotent on clickId).
 * 6. getMyLinkFortyAnalytics returns aggregated click stats for the dashboard.
 */

/**
 * Record a LinkForty click event. Idempotent on clickId — duplicate webhook
 * deliveries (LinkForty retries) are safe. Called by the webhook handler
 * via ConvexHttpClient; gated by BILLING_WEBHOOK_MUTATION_SECRET.
 */
export const recordClickEvent = mutation({
  args: {
    secret: v.string(),
    clickId: v.string(),
    shortCode: v.string(),
    linkId: v.string(),
    clickedAt: v.number(),
    deviceType: v.optional(v.string()),
    platform: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    countryName: v.optional(v.string()),
    city: v.optional(v.string()),
    isBot: v.boolean(),
    botReason: v.optional(v.string()),
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
    referrer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    verifyServerSecret(
      'LINKFORTY_WEBHOOK_MUTATION_SECRET',
      args.secret,
      'Unauthorized.',
    )

    // Idempotency: skip if we already recorded this clickId.
    const existing = await ctx.db
      .query('linkfortyClickEvents')
      .withIndex('by_clickId', (index) => index.eq('clickId', args.clickId))
      .first()
    if (existing !== null) return { recorded: false, reason: 'duplicate' }

    await ctx.db.insert('linkfortyClickEvents', {
      clickId: args.clickId,
      shortCode: args.shortCode,
      linkId: args.linkId,
      clickedAt: args.clickedAt,
      deviceType: args.deviceType,
      platform: args.platform,
      countryCode: args.countryCode,
      countryName: args.countryName,
      city: args.city,
      isBot: args.isBot,
      botReason: args.botReason,
      utmSource: args.utmSource,
      utmMedium: args.utmMedium,
      utmCampaign: args.utmCampaign,
      referrer: args.referrer,
    })
    return { recorded: true, reason: 'created' }
  },
})

/**
 * Provision a LinkForty short link for a referral code.
 * Scheduled by ensureReferralCode after inserting the referralCodes row.
 * Idempotent: if the code already has a linkfortyLinkId, returns early.
 */
export const provisionShortLink = internalAction({
  args: { code: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    // Check if already provisioned (idempotency).
    const codeRow = await ctx.runQuery(internal.linkforty.getReferralCodeRow, {
      code: args.code,
    })
    if (codeRow === null)
      return { provisioned: false, reason: 'code_not_found' }
    if (codeRow.linkfortyLinkId) {
      return { provisioned: false, reason: 'already_provisioned' }
    }

    const apiUrl = process.env.LINKFORTY_API_URL
    const serviceUserId = process.env.LINKFORTY_SERVICE_USER_ID
    const siteUrl = process.env.APP_BASE_URL ?? 'https://ship-fast.ai'
    if (!apiUrl || !serviceUserId) {
      return { provisioned: false, reason: 'not_configured' }
    }

    try {
      const link = await createLinkFortyShortLink({
        apiUrl,
        serviceUserId,
        code: args.code,
        originalUrl: `${siteUrl}/?ref=${args.code}`,
        title: `Referral link — ${args.code}`,
      })
      await ctx.runMutation(internal.linkforty.markShortLinkProvisioned, {
        code: args.code,
        linkId: link.id,
        shortUrl: `${apiUrl.replace(/\/$/, '')}/${args.code}`,
      })
      return { provisioned: true, reason: 'created', linkId: link.id }
    } catch (error) {
      // Best-effort: a cron can re-provision later. Don't throw — the
      // referral code itself is already usable via ?ref=CODE.
      const message = error instanceof Error ? error.message : 'Unknown error'
      return { provisioned: false, reason: 'linkforty_error', error: message }
    }
  },
})

/** Internal query used by provisionShortLink to read the referralCodes row. */
export const getReferralCodeRow = internalQuery({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('referralCodes')
      .withIndex('by_code', (index) => index.eq('code', args.code))
      .first()
    if (row === null) return null
    return {
      code: row.code,
      linkfortyLinkId: row.linkfortyLinkId ?? null,
      linkfortyShortUrl: row.linkfortyShortUrl ?? null,
    }
  },
})

/** Internal mutation to stamp the linkforty fields on a referralCodes row. */
export const markShortLinkProvisioned = internalMutation({
  args: { code: v.string(), linkId: v.string(), shortUrl: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('referralCodes')
      .withIndex('by_code', (index) => index.eq('code', args.code))
      .first()
    if (row === null) return
    // Only set if not already set (idempotency).
    if (row.linkfortyLinkId) return
    await ctx.db.patch(row._id, {
      linkfortyLinkId: args.linkId,
      linkfortyShortUrl: args.shortUrl,
    })
  },
})

/**
 * Backfill missing LinkForty short links for existing referral codes.
 * Safe to run repeatedly — skips codes that already have linkfortyLinkId.
 * Intended to be called from a cron or admin trigger.
 */
export const backfillMissingShortLinks = internalAction({
  args: {},
  handler: async (
    ctx,
  ): Promise<{
    provisioned: number
    skipped: number
    failed: number
  }> => {
    if (
      process.env.LINKFORTY_ENABLED?.trim().toLowerCase() !== 'true' ||
      !process.env.LINKFORTY_API_URL ||
      !process.env.LINKFORTY_SERVICE_USER_ID
    ) {
      return { provisioned: 0, skipped: 0, failed: 0 }
    }

    const codes = await ctx.runQuery(
      internal.linkforty.listCodesWithoutShortLinks,
      {},
    )
    let provisioned = 0
    let failed = 0
    for (const code of codes) {
      const result = await ctx.runAction(
        internal.linkforty.provisionShortLink,
        {
          code: code.code,
          userId: code.userId,
        },
      )
      if (result.provisioned) provisioned += 1
      else if (result.reason === 'linkforty_error') failed += 1
    }
    return {
      provisioned,
      skipped: codes.length - provisioned - failed,
      failed,
    }
  },
})

/** Internal query: list referral codes that lack a linkfortyLinkId. */
export const listCodesWithoutShortLinks = internalQuery({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('referralCodes').collect()
    return all
      .filter((row) => !row.linkfortyLinkId)
      .map((row) => ({ code: row.code, userId: row.userId }))
  },
})

/**
 * Get aggregated click analytics for the current user's referral short link.
 * Excludes bot clicks. Used by the referral dashboard.
 */
export const getMyLinkFortyAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireQueryUserId(ctx)
    const codeRow = await ctx.db
      .query('referralCodes')
      .withIndex('by_userId', (index) => index.eq('userId', userId))
      .first()
    if (codeRow === null || !codeRow.linkfortyLinkId) {
      return {
        enabled: false,
        shortUrl: null,
        totalClicks: 0,
        uniqueClicks: 0,
        clicksByDevice: [],
        clicksByCountry: [],
        clicksByPlatform: [],
        clicksByDate: [],
      }
    }

    const clicks = await ctx.db
      .query('linkfortyClickEvents')
      .withIndex('by_shortCode', (index) => index.eq('shortCode', codeRow.code))
      .collect()

    const humanClicks = clicks.filter((c) => !c.isBot)

    // Aggregate by device.
    const deviceMap = new Map<string, number>()
    const countryMap = new Map<string, number>()
    const platformMap = new Map<string, number>()
    const dateMap = new Map<string, number>()

    for (const click of humanClicks) {
      const device = click.deviceType ?? 'unknown'
      deviceMap.set(device, (deviceMap.get(device) ?? 0) + 1)

      const country = click.countryName ?? click.countryCode ?? 'Unknown'
      countryMap.set(country, (countryMap.get(country) ?? 0) + 1)

      const platform = click.platform ?? 'unknown'
      platformMap.set(platform, (platformMap.get(platform) ?? 0) + 1)

      const date = new Date(click.clickedAt).toISOString().slice(0, 10)
      dateMap.set(date, (dateMap.get(date) ?? 0) + 1)
    }

    return {
      enabled: true,
      shortUrl: codeRow.linkfortyShortUrl ?? null,
      totalClicks: humanClicks.length,
      uniqueClicks: humanClicks.length, // LinkForty dedupes by fingerprint upstream
      clicksByDevice: toArray(deviceMap),
      clicksByCountry: toArray(countryMap),
      clicksByPlatform: toArray(platformMap),
      clicksByDate: toArray(dateMap).sort((a, b) => a.key.localeCompare(b.key)),
    }
  },
})

function toArray(
  map: Map<string, number>,
): Array<{ key: string; clicks: number }> {
  return Array.from(map.entries())
    .map(([key, clicks]) => ({ key, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
}

async function requireQueryUserId(ctx: QueryCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity()
  if (identity === null) {
    throw new Error('Not authenticated.')
  }
  return identity.tokenIdentifier
}

/**
 * Test helper: directly set the LinkForty link ID on a referral code.
 * In production, this is done by the scheduled `provisionShortLink` action
 * which calls the LinkForty API. Tests bypass the API and set it directly.
 */
export const setLinkfortyLinkIdForTest = mutation({
  args: { code: v.string(), linkId: v.string(), shortUrl: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('referralCodes')
      .withIndex('by_code', (index) => index.eq('code', args.code))
      .first()
    if (row === null) throw new Error('Code not found')
    await ctx.db.patch(row._id, {
      linkfortyLinkId: args.linkId,
      linkfortyShortUrl: args.shortUrl,
    })
    return { ok: true }
  },
})
