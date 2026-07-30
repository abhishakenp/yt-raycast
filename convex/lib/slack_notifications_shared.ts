/**
 * Shared Slack notification functionality — used by both Convex and src/
 *
 * This module contains the core notification building and sending logic
 * to avoid duplication between convex/lib and src/features/notifications.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

type SlackBlock = {
  type: string
  text?: { type: string; text: string }
  elements?: unknown[]
}

type SlackAttachment = {
  color: string
  blocks: SlackBlock[]
}

type SlackWebhookPayload = {
  text: string
  attachments: SlackAttachment[]
}

export type NotificationEnv = {
  SLACK_WEBHOOK_URL?: string
  NODE_ENV?: string
}

export type FetchLike = typeof fetch

export type SharedNotificationEvent = {
  emoji: string
  title: string
  color: string
  fields: { label: string; value: string }[]
  footer?: string
}

export type NotificationSendResult =
  | { sent: true }
  | { sent: false; reason: string }

// ─── Colors ─────────────────────────────────────────────────────────────────

export const SLACK_COLORS = {
  SUCCESS_GREEN: '#22C55E',
  BLOCKER_RED: '#EF4444',
  CONFIG_AMBER: '#F59E0B',
  EXECUTION_ORANGE: '#F97316',
  LIFECYCLE_PURPLE: '#8B5CF6',
  OMNI_BLUE: '#1D9BF0',
  COMPLETE_SLATE: '#64748B',
} as const

// ─── Helpers ────────────────────────────────────────────────────────────────

function isDevEnv(env: NotificationEnv): boolean {
  return env.NODE_ENV !== 'production'
}

function buildBlocks(event: SharedNotificationEvent): SlackBlock[] {
  const blocks: SlackBlock[] = []

  if (event.fields.length > 0) {
    const fieldLines = event.fields
      .map((f) => `*${f.label}:* ${f.value}`)
      .join('\n')
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: fieldLines },
    })
  }

  if (event.footer) {
    blocks.push({
      type: 'context',
      elements: [{ type: 'mrkdwn', text: event.footer }],
    })
  }

  return blocks
}

function buildPayload(
  event: SharedNotificationEvent,
  env: NotificationEnv,
): SlackWebhookPayload {
  const dev = isDevEnv(env)
  const title = dev
    ? `${event.emoji} [DEV] ${event.title}`
    : `${event.emoji} ${event.title}`
  return {
    text: title,
    attachments: [
      {
        color: event.color,
        blocks: buildBlocks(event),
      },
    ],
  }
}

// ─── Core send function ─────────────────────────────────────────────────────

export async function sendSharedNotification(
  event: SharedNotificationEvent,
  env: NotificationEnv = process.env,
  fetchImpl: FetchLike = fetch,
): Promise<NotificationSendResult> {
  const webhookUrl = env.SLACK_WEBHOOK_URL
  if (!webhookUrl || webhookUrl.trim().length === 0) {
    return { sent: false, reason: 'no_webhook_url' }
  }

  const payload = buildPayload(event, env)

  try {
    const response = await fetchImpl(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      return { sent: false, reason: `http_${response.status}` }
    }
    return { sent: true }
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? error.message : 'fetch_failed',
    }
  }
}

// ─── Shared helpers ─────────────────────────────────────────────────────────

/**
 * Format a user as "Name email (userId)".
 * Falls back to just userId if name/email are missing.
 */
export function formatUser(args: {
  userId?: string
  userName?: string
  userEmail?: string
}): string {
  const { userId, userName, userEmail } = args
  if (!userId && !userName && !userEmail) return '_Anonymous_'

  const parts: string[] = []
  if (userName && userName.trim()) parts.push(`*${userName}*`)
  if (userEmail && userEmail.trim()) parts.push(userEmail)
  if (userId && userId.trim()) parts.push(`(\`${userId}\`)`)
  return parts.length > 0 ? parts.join(' ') : '_Unknown_'
}

// ─── Event builders ─────────────────────────────────────────────────────────

export function paywallTriggeredEvent(args: {
  userId?: string
  userName?: string
  userEmail?: string
  sessionId: string
  entitlement: string
  reason: string
}): SharedNotificationEvent {
  return {
    emoji: '⚠️',
    title: 'Paywall Triggered',
    color: SLACK_COLORS.CONFIG_AMBER,
    fields: [
      { label: 'Session', value: `\`${args.sessionId}\`` },
      { label: 'Entitlement', value: `\`${args.entitlement}\`` },
      { label: 'User', value: formatUser(args) },
      { label: 'Reason', value: args.reason },
    ],
    footer: 'Ship Fast • Paywall',
  }
}

export function inviteSentEvent(args: {
  referrerUserId: string
  referrerUserName?: string
  referrerUserEmail?: string
  code: string
}): SharedNotificationEvent {
  return {
    emoji: '📨',
    title: 'Referral Invite Created',
    color: SLACK_COLORS.LIFECYCLE_PURPLE,
    fields: [
      {
        label: 'Referrer',
        value: formatUser({
          userId: args.referrerUserId,
          userName: args.referrerUserName,
          userEmail: args.referrerUserEmail,
        }),
      },
      { label: 'Code', value: `\`${args.code}\`` },
    ],
    footer: 'Ship Fast • Referrals',
  }
}

export function inviteeJoinedEvent(args: {
  referredUserId: string
  referredUserName?: string
  referredUserEmail?: string
  referrerUserId: string
  referrerUserName?: string
  referrerUserEmail?: string
  code: string
}): SharedNotificationEvent {
  return {
    emoji: '🤝',
    title: 'Referral Joined',
    color: SLACK_COLORS.SUCCESS_GREEN,
    fields: [
      {
        label: 'New User',
        value: formatUser({
          userId: args.referredUserId,
          userName: args.referredUserName,
          userEmail: args.referredUserEmail,
        }),
      },
      {
        label: 'Referrer',
        value: formatUser({
          userId: args.referrerUserId,
          userName: args.referrerUserName,
          userEmail: args.referrerUserEmail,
        }),
      },
      { label: 'Code', value: `\`${args.code}\`` },
    ],
    footer: 'Ship Fast • Referrals',
  }
}

export function userRegisteredEvent(args: {
  userId: string
  userName?: string
  userEmail?: string
  ipHash?: string
}): SharedNotificationEvent {
  return {
    emoji: '👋',
    title: 'New User Registered',
    color: SLACK_COLORS.SUCCESS_GREEN,
    fields: [
      { label: 'User', value: formatUser(args) },
      ...(args.ipHash
        ? [{ label: 'IP Hash', value: `\`${args.ipHash.slice(0, 16)}…\`` }]
        : []),
    ],
    footer: 'Ship Fast • User Registration',
  }
}

export function paymentDoneEvent(args: {
  provider: string
  userId: string
  userName?: string
  userEmail?: string
  type: 'subscription' | 'credit_pack'
  planId?: string
  credits?: number
  amount?: number
  currency?: string
}): SharedNotificationEvent {
  const amountStr =
    args.amount !== undefined && args.currency
      ? `${(args.amount / 100).toFixed(2)} ${args.currency.toUpperCase()}`
      : undefined
  return {
    emoji: '💰',
    title: 'Payment Completed',
    color: SLACK_COLORS.SUCCESS_GREEN,
    fields: [
      { label: 'Provider', value: `\`${args.provider}\`` },
      { label: 'User', value: formatUser(args) },
      { label: 'Type', value: `\`${args.type}\`` },
      ...(args.planId ? [{ label: 'Plan', value: `\`${args.planId}\`` }] : []),
      ...(args.credits
        ? [{ label: 'Credits', value: String(args.credits) }]
        : []),
      ...(amountStr ? [{ label: 'Amount', value: amountStr }] : []),
    ],
    footer: 'Ship Fast • Payment',
  }
}

export function generationDoneEvent(args: {
  sessionId: string
  userId?: string
  userName?: string
  userEmail?: string
  ipHash?: string
  elapsedMs?: number
  provider?: string
  prompt?: string
  publicUrl?: string
  privateUrl?: string
}): SharedNotificationEvent {
  const owner = args.userId
    ? formatUser(args)
    : args.ipHash
      ? `IP \`${args.ipHash.slice(0, 16)}…\``
      : '_Unknown_'
  const elapsedStr =
    args.elapsedMs !== undefined
      ? `${(args.elapsedMs / 1000).toFixed(1)}s`
      : undefined
  const promptStr = args.prompt
    ? args.prompt.length > 500
      ? `${args.prompt.slice(0, 500)}…`
      : args.prompt
    : undefined
  return {
    emoji: '🎉',
    title: 'Generation Completed',
    color: SLACK_COLORS.OMNI_BLUE,
    fields: [
      { label: 'Session', value: `\`${args.sessionId}\`` },
      { label: 'Owner', value: owner },
      ...(args.publicUrl
        ? [{ label: 'Public Link', value: args.publicUrl }]
        : []),
      ...(args.privateUrl
        ? [{ label: 'Private Link', value: args.privateUrl }]
        : []),
      ...(args.provider
        ? [{ label: 'Provider', value: `\`${args.provider}\`` }]
        : []),
      ...(elapsedStr ? [{ label: 'Elapsed', value: elapsedStr }] : []),
      ...(promptStr ? [{ label: 'Prompt', value: promptStr }] : []),
    ],
    footer: 'Ship Fast • Generation',
  }
}

export function generationFailedEvent(args: {
  sessionId: string
  userId?: string
  userName?: string
  userEmail?: string
  ipHash?: string
  error: string
  elapsedMs?: number
  prompt?: string
  publicUrl?: string
  privateUrl?: string
}): SharedNotificationEvent {
  const owner = args.userId
    ? formatUser(args)
    : args.ipHash
      ? `IP \`${args.ipHash.slice(0, 16)}…\``
      : '_Anonymous_'
  const elapsedStr =
    args.elapsedMs !== undefined
      ? `${(args.elapsedMs / 1000).toFixed(1)}s`
      : undefined
  const promptStr = args.prompt
    ? args.prompt.length > 500
      ? `${args.prompt.slice(0, 500)}…`
      : args.prompt
    : undefined
  return {
    emoji: '⛔',
    title: 'Generation Failed',
    color: SLACK_COLORS.BLOCKER_RED,
    fields: [
      { label: 'Session', value: `\`${args.sessionId}\`` },
      { label: 'Owner', value: owner },
      ...(args.publicUrl
        ? [{ label: 'Public Link', value: args.publicUrl }]
        : []),
      ...(args.privateUrl
        ? [{ label: 'Private Link', value: args.privateUrl }]
        : []),
      { label: 'Error', value: args.error },
      ...(elapsedStr ? [{ label: 'Elapsed', value: elapsedStr }] : []),
      ...(promptStr ? [{ label: 'Prompt', value: promptStr }] : []),
    ],
    footer: 'Ship Fast • Generation',
  }
}

export function subscriptionCancelledEvent(args: {
  userId: string
  userName?: string
  userEmail?: string
  provider: string
  planId?: string
}): SharedNotificationEvent {
  return {
    emoji: '❌',
    title: 'Subscription Cancelled',
    color: SLACK_COLORS.BLOCKER_RED,
    fields: [
      { label: 'User', value: formatUser(args) },
      { label: 'Provider', value: `\`${args.provider}\`` },
      ...(args.planId ? [{ label: 'Plan', value: `\`${args.planId}\`` }] : []),
    ],
    footer: 'Ship Fast • Billing',
  }
}

export function referralRewardUnlockedEvent(args: {
  userId: string
  userName?: string
  userEmail?: string
  qualifiedCount: number
  threshold: number
}): SharedNotificationEvent {
  return {
    emoji: '🎁',
    title: 'Referral Reward Unlocked!',
    color: SLACK_COLORS.LIFECYCLE_PURPLE,
    fields: [
      { label: 'User', value: formatUser(args) },
      { label: 'Qualified', value: String(args.qualifiedCount) },
      { label: 'Threshold', value: String(args.threshold) },
    ],
    footer: 'Ship Fast • Referrals',
  }
}

export function exportCompletedEvent(args: {
  userId?: string
  userName?: string
  userEmail?: string
  sessionId: string
  target: string
  ipHash?: string
}): SharedNotificationEvent {
  const owner = args.userId
    ? formatUser(args)
    : args.ipHash
      ? `IP \`${args.ipHash.slice(0, 16)}…\``
      : '_Anonymous_'
  return {
    emoji: '📦',
    title: 'Export Completed',
    color: SLACK_COLORS.COMPLETE_SLATE,
    fields: [
      { label: 'Session', value: `\`${args.sessionId}\`` },
      { label: 'Target', value: `\`${args.target}\`` },
      { label: 'Owner', value: owner },
    ],
    footer: 'Ship Fast • Exports',
  }
}
