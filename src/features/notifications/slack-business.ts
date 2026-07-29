/**
 * Slack business event notifications — rich formatted messages with
 * colored attachments, emoji headers, and [DEV] prefix for non-prod.
 *
 * This module now re-exports shared functionality from convex/lib/slack_notifications_shared.ts
 * to eliminate code duplication. New code should import directly from the shared module.
 *
 * Template style adapted from the inmo/omni notification system:
 * - Emoji at start of message title
 * - Colored vertical attachment bar per event category
 * - Block Kit sections with mrkdwn
 * - Context footer with metadata
 */

import {
  sendSharedNotification,
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
  type SharedNotificationEvent,
  type NotificationSendResult,
} from '../../../convex/lib/slack_notifications_shared'

// Re-export for backward compatibility
export {
  sendSharedNotification as sendBusinessNotification,
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
  type SharedNotificationEvent as BusinessNotificationEvent,
  type NotificationSendResult,
}
