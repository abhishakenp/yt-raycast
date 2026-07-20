import { Dub } from 'dub'
import { v } from 'convex/values'

import { internal } from './_generated/api'
import type { Doc } from './_generated/dataModel'
import { internalAction } from './_generated/server'
import {
  deliverDubOutboxEvent,
  DubTerminalDeliveryError,
} from './lib/dub_outbox'
import {
  sendSlackOperationalMessage,
  sendTelegramOperationalMessage,
} from './lib/session_operational_notifications'

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown Dub delivery error'
}

export const processOutboxEvent = internalAction({
  args: {
    eventId: v.id('dubEventOutbox'),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const event: Doc<'dubEventOutbox'> | null = await ctx.runMutation(
      internal.partners.claimOutboxEvent,
      {
        eventId: args.eventId,
        now,
      },
    )
    if (!event) return { processed: false }

    try {
      if (
        process.env.DUB_PARTNERS_ENABLED?.trim().toLowerCase() !== 'true' ||
        !process.env.DUB_API_KEY
      ) {
        throw new Error('Dub partner delivery is not configured')
      }
      await deliverDubOutboxEvent(
        event,
        new Dub({
          token: process.env.DUB_API_KEY,
          ...(process.env.DUB_API_URL
            ? { serverURL: process.env.DUB_API_URL }
            : {}),
        }),
      )
      await ctx.runMutation(internal.partners.completeOutboxEvent, {
        eventId: event._id,
        now: Date.now(),
      })
      return { processed: true }
    } catch (error) {
      const message = errorMessage(error)
      const failure: {
        deadLetter: boolean
        nextAttemptAt: number | null
      } = await ctx.runMutation(internal.partners.failOutboxEvent, {
        error: message,
        eventId: event._id,
        now: Date.now(),
        terminal: error instanceof DubTerminalDeliveryError,
      })

      if (failure.nextAttemptAt !== null) {
        await ctx.scheduler.runAt(
          failure.nextAttemptAt,
          internal.partners_worker.processOutboxEvent,
          { eventId: event._id },
        )
      } else if (failure.deadLetter) {
        await ctx.runAction(internal.partners_worker.sendPartnerOutboxAlert, {
          error: message,
          eventId: event._id,
          idempotencyKey: event.idempotencyKey,
          kind: event.kind,
        })
      }
      return { processed: false }
    }
  },
})

export const sendPartnerOutboxAlert = internalAction({
  args: {
    error: v.string(),
    eventId: v.id('dubEventOutbox'),
    idempotencyKey: v.string(),
    kind: v.union(v.literal('lead'), v.literal('sale'), v.literal('refund')),
  },
  handler: async (_ctx, args) => {
    const message = [
      'Ship Fast partner event requires attention',
      `event=${args.eventId}`,
      `kind=${args.kind}`,
      `idempotencyKey=${args.idempotencyKey}`,
      `error=${args.error}`,
    ].join('\n')
    const [slack, telegram] = await Promise.all([
      sendSlackOperationalMessage({ message }),
      sendTelegramOperationalMessage({ message }),
    ])
    return {
      sent: slack.sent || telegram.sent,
      slack,
      telegram,
    }
  },
})
