import { ConvexError } from 'convex/values'

import type { Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'

export type OperationalNotificationPayload = {
  sessionId: Id<'sessions'>
  eventType: string
  message?: string
  elapsedMs?: number
  cost?: number
  provider?: string
  error?: string
  quotaHit?: boolean
  cacheHit?: boolean
}

export type RecordOperationalGenerationEventInput =
  OperationalNotificationPayload & {
    userId?: string
    anonymousClientIdHash?: string
    createdAt?: number
  }

type OperationalNotificationReference = Parameters<
  MutationCtx['scheduler']['runAfter']
>[1]

type OperationalNotificationCtx = Pick<MutationCtx, 'db' | 'scheduler'>
type NotificationEnv = {
  SLACK_WEBHOOK_URL?: string
  TELEGRAM_BOT_TOKEN?: string
  TELEGRAM_CHAT_ID?: string
}
type FetchLike = typeof fetch

export type NotificationSendResult =
  | { sent: true }
  | { sent: false; reason: string }

export type OperationalNotificationSendResult =
  | { sent: false; reason: 'not_alertable' }
  | {
      sent: boolean
      slack: NotificationSendResult
      telegram: NotificationSendResult
    }

const fetchFailedReason = (error: unknown): string =>
  error instanceof Error ? error.message : 'fetch_failed'

const postJson = async (
  fetchImpl: FetchLike,
  url: string,
  payload: Record<string, unknown>,
): Promise<NotificationSendResult> => {
  try {
    await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return { sent: true }
  } catch (error) {
    return {
      sent: false,
      reason: fetchFailedReason(error),
    }
  }
}

export const shouldNotifyOperationalEvent = (
  event: Pick<
    OperationalNotificationPayload,
    'cacheHit' | 'cost' | 'error' | 'eventType' | 'quotaHit'
  >,
): boolean =>
  event.error !== undefined ||
  event.eventType === 'generation_failed' ||
  event.quotaHit === true ||
  event.cacheHit === true ||
  (event.cost ?? 0) > 0

export const formatOperationalNotification = (
  event: OperationalNotificationPayload,
): string => {
  const details = [
    `event=${event.eventType}`,
    `session=${event.sessionId}`,
    event.provider === undefined ? undefined : `provider=${event.provider}`,
    event.elapsedMs === undefined ? undefined : `elapsedMs=${event.elapsedMs}`,
    event.cost === undefined ? undefined : `cost=${event.cost}`,
    event.quotaHit === true ? 'quotaHit=true' : undefined,
    event.cacheHit === true ? 'cacheHit=true' : undefined,
    event.error === undefined ? undefined : `error=${event.error}`,
  ].filter((item): item is string => item !== undefined)

  return [`Ship Fast operational event`, ...details, event.message]
    .filter(Boolean)
    .join('\n')
}

export const sendSlackOperationalMessage = async (
  args: {
    message: string
    webhookUrl?: string
  },
  env: NotificationEnv = process.env,
  fetchImpl: FetchLike = fetch,
): Promise<NotificationSendResult> => {
  const webhookUrl = args.webhookUrl || env.SLACK_WEBHOOK_URL

  if (webhookUrl === undefined || webhookUrl.trim().length === 0) {
    return { sent: false, reason: 'no_webhook_url' }
  }

  return postJson(fetchImpl, webhookUrl, { text: args.message })
}

export const sendTelegramOperationalMessage = async (
  args: {
    message: string
    botToken?: string
    chatId?: string
  },
  env: NotificationEnv = process.env,
  fetchImpl: FetchLike = fetch,
): Promise<NotificationSendResult> => {
  const botToken = args.botToken || env.TELEGRAM_BOT_TOKEN
  const chatId = args.chatId || env.TELEGRAM_CHAT_ID

  if (
    botToken === undefined ||
    botToken.trim().length === 0 ||
    chatId === undefined ||
    chatId.trim().length === 0
  ) {
    return { sent: false, reason: 'missing_credentials' }
  }

  return postJson(
    fetchImpl,
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      chat_id: chatId,
      text: args.message,
    },
  )
}

export const sendOperationalNotificationAdapters = async (
  args: OperationalNotificationPayload,
  env: NotificationEnv = process.env,
  fetchImpl: FetchLike = fetch,
): Promise<OperationalNotificationSendResult> => {
  if (!shouldNotifyOperationalEvent(args)) {
    return {
      sent: false,
      reason: 'not_alertable',
    }
  }

  const notification = formatOperationalNotification(args)
  const slack = await sendSlackOperationalMessage(
    {
      message: notification,
      webhookUrl: env.SLACK_WEBHOOK_URL,
    },
    env,
    fetchImpl,
  )
  const telegram = await sendTelegramOperationalMessage(
    {
      message: notification,
      botToken: env.TELEGRAM_BOT_TOKEN,
      chatId: env.TELEGRAM_CHAT_ID,
    },
    env,
    fetchImpl,
  )

  return {
    sent: slack.sent || telegram.sent,
    slack,
    telegram,
  }
}

export const scheduleOperationalNotification = async (
  ctx: Pick<MutationCtx, 'scheduler'>,
  event: OperationalNotificationPayload,
  sendOperationalNotification: OperationalNotificationReference,
): Promise<void> => {
  if (!shouldNotifyOperationalEvent(event)) return

  await ctx.scheduler.runAfter(0, sendOperationalNotification, event)
}

export const recordOperationalGenerationEvent = async (
  ctx: OperationalNotificationCtx,
  args: RecordOperationalGenerationEventInput,
  sendOperationalNotification: OperationalNotificationReference,
) => {
  const session = await ctx.db.get(args.sessionId)
  const now = args.createdAt ?? Date.now()

  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: args.eventType,
    message: args.message,
    createdAt: now,
    elapsedMs: args.elapsedMs,
    cost: args.cost,
    provider: args.provider,
    error: args.error,
    quotaHit: args.quotaHit,
    cacheHit: args.cacheHit,
  })

  const shouldRecordUsage =
    args.elapsedMs !== undefined ||
    args.cost !== undefined ||
    args.provider !== undefined ||
    args.userId !== undefined ||
    args.anonymousClientIdHash !== undefined

  if (shouldRecordUsage) {
    await ctx.db.insert('usageMetrics', {
      sessionId: args.sessionId,
      eventType: args.eventType,
      timestamp: now,
      elapsedMs: args.elapsedMs ?? 0,
      cost: args.cost ?? 0,
      provider: args.provider ?? 'unknown',
      userId: args.userId ?? session.userId,
      anonymousClientIdHash:
        args.anonymousClientIdHash ?? session.anonymousClientIdHash,
    })
  }

  await scheduleOperationalNotification(
    ctx,
    {
      sessionId: args.sessionId,
      eventType: args.eventType,
      message: args.message,
      elapsedMs: args.elapsedMs,
      cost: args.cost,
      provider: args.provider,
      error: args.error,
      quotaHit: args.quotaHit,
      cacheHit: args.cacheHit,
    },
    sendOperationalNotification,
  )

  return {
    recorded: true,
    usageRecorded: shouldRecordUsage,
    alertable: shouldNotifyOperationalEvent(args),
  }
}
