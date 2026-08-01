import { ConvexError, v } from 'convex/values'

import { mutation, query } from './_generated/server'
import { isUserAdmin } from './lib/session_access_helpers'

const MAINTENANCE_KEY = 'maintenance'

export const getStatus = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query('appSettings')
      .withIndex('by_key', (index) => index.eq('key', MAINTENANCE_KEY))
      .unique()

    return { enabled: setting?.enabled ?? false }
  },
})

export const setEnabled = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, args) => {
    if (!(await isUserAdmin(ctx))) {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Only administrators can change maintenance mode.',
      })
    }

    const setting = await ctx.db
      .query('appSettings')
      .withIndex('by_key', (index) => index.eq('key', MAINTENANCE_KEY))
      .unique()
    const updatedAt = Date.now()

    if (setting === null) {
      await ctx.db.insert('appSettings', {
        key: MAINTENANCE_KEY,
        enabled: args.enabled,
        updatedAt,
      })
    } else {
      await ctx.db.patch(setting._id, { enabled: args.enabled, updatedAt })
    }

    return { enabled: args.enabled }
  },
})
