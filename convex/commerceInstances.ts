import { v } from 'convex/values'

import { internalMutation, mutation, query } from './_generated/server'
import {
  enableCommerceForSession,
  getCommerceAccessForSession,
  requestAdminSsoUrl,
} from './lib/commerce_access_helpers'
import { runCommerceLifecycleSweep } from './lib/commerce_lifecycle_helpers'

export const getCommerceAccess = query({
  args: { sessionId: v.id('sessions') },
  handler: async (ctx, args) =>
    getCommerceAccessForSession(ctx, args.sessionId),
})

export const enableCommerce = mutation({
  args: { sessionId: v.id('sessions') },
  handler: async (ctx, args) => enableCommerceForSession(ctx, args.sessionId),
})

export const requestAdminSso = mutation({
  args: { sessionId: v.id('sessions') },
  handler: async (ctx, args) => requestAdminSsoUrl(ctx, args.sessionId),
})

// Scheduled by convex/crons.ts. Suspends instances whose entitlement has
// expired and deletes instances past the 30-day suspended retention window —
// always re-checking live entitlement first (see commerce_lifecycle_helpers).
export const runLifecycleSweep = internalMutation({
  args: {},
  handler: async (ctx) => runCommerceLifecycleSweep(ctx),
})
