/**
 * Convex-side Slack business notifications — re-exports shared functionality
 * from slack_notifications_shared.ts for backward compatibility.
 *
 * This file now serves as a thin compatibility layer. New code should import
 * directly from slack_notifications_shared.ts.
 */

export {
  sendSharedNotification as sendConvexBusinessNotification,
  formatUser,
  paywallTriggeredEvent,
  inviteSentEvent,
  inviteeJoinedEvent,
  userRegisteredEvent,
  paymentDoneEvent,
  generationDoneEvent,
  generationFailedEvent,
  subscriptionCancelledEvent,
  referralRewardUnlockedEvent,
  exportCompletedEvent,
  SLACK_COLORS,
  type NotificationEnv,
  type FetchLike,
  type SharedNotificationEvent as ConvexNotificationEvent,
  type NotificationSendResult,
} from './slack_notifications_shared'
