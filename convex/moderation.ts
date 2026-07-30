import { makeFunctionReference } from 'convex/server'
import { ConvexError, v } from 'convex/values'

import type { Id } from './_generated/dataModel'
import { internalAction, mutation } from './_generated/server'
import type {
  ModerationCategory,
  ModerationField,
  ModerationSurface,
} from './lib/content_moderation_policy'
import { hashOwnerSecret } from './lib/session_access_helpers'
import {
  contentModerationBlockedEvent,
  sendSharedNotification,
} from './lib/slack_notifications_shared'

const moderationCategory = v.union(
  v.literal('sexual_minors'),
  v.literal('explicit_sexual_content'),
  v.literal('non_consensual_exploitative'),
  v.literal('hate_extremism'),
  v.literal('graphic_violence'),
  v.literal('self_harm'),
  v.literal('fraud_malware'),
  v.literal('illegal_dangerous_activity'),
  v.literal('other_policy_violation'),
)

const moderationSurface = v.union(
  v.literal('session_create'),
  v.literal('design_reference_notes'),
  v.literal('clone_brief'),
  v.literal('clone_regeneration'),
  v.literal('section_edit'),
  v.literal('rewrite_instruction'),
  v.literal('rewrite_text'),
  v.literal('translation_source'),
  v.literal('custom_language'),
)

const moderationField = v.union(
  v.literal('prompt'),
  v.literal('designReferenceNotes'),
  v.literal('cloneBrief'),
  v.literal('cloneRegeneration'),
  v.literal('sectionEdit'),
  v.literal('rewriteInstruction'),
  v.literal('rewriteText'),
  v.literal('translationSource'),
  v.literal('customLanguage'),
)

const decisionSource = v.union(
  v.literal('deterministic'),
  v.literal('semantic'),
)

const notificationArgs = {
  flagId: v.string(),
  category: moderationCategory,
  surface: moderationSurface,
  matchedField: moderationField,
  ruleId: v.string(),
  decisionSource,
  classifierModel: v.optional(v.string()),
  userId: v.optional(v.string()),
  userName: v.optional(v.string()),
  userEmail: v.optional(v.string()),
  anonymousClientIdHash: v.optional(v.string()),
  clientIpHash: v.optional(v.string()),
  sessionId: v.optional(v.id('sessions')),
  prompt: v.string(),
}

export type BlockedAttemptNotificationArgs = {
  flagId: string
  category: ModerationCategory
  surface: ModerationSurface
  matchedField: ModerationField
  ruleId: string
  decisionSource: 'deterministic' | 'semantic'
  classifierModel?: string
  userId?: string
  userName?: string
  userEmail?: string
  anonymousClientIdHash?: string
  clientIpHash?: string
  sessionId?: Id<'sessions'>
  prompt: string
}

export type RecordBlockedAttemptArgs = {
  secret: string
  prompt: string
  surface: ModerationSurface
  matchedField: ModerationField
  category: ModerationCategory
  ruleId: string
  decisionSource: 'deterministic' | 'semantic'
  classifierModel?: string
  anonymousClientId?: string
  clientIpHash?: string
  sessionId?: Id<'sessions'>
}

// Codegen needs a configured deployment, which is not present in isolated
// worktrees. This remains fully typed while resolving the new internal action.
const notifySlackOfBlockedAttemptReference = makeFunctionReference<
  'action',
  BlockedAttemptNotificationArgs,
  null
>('moderation:notifySlackOfBlockedAttempt')

export const notifySlackOfBlockedAttempt = internalAction({
  args: notificationArgs,
  handler: async (_ctx, args) => {
    await sendSharedNotification(
      contentModerationBlockedEvent({
        ...args,
        sessionId: args.sessionId,
      }),
    )
    return null
  },
})

export const recordBlockedAttempt = mutation({
  args: {
    secret: v.string(),
    prompt: v.string(),
    surface: moderationSurface,
    matchedField: moderationField,
    category: moderationCategory,
    ruleId: v.string(),
    decisionSource,
    classifierModel: v.optional(v.string()),
    anonymousClientId: v.optional(v.string()),
    clientIpHash: v.optional(v.string()),
    sessionId: v.optional(v.id('sessions')),
  },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.CONTENT_MODERATION_MUTATION_SECRET
    if (!expectedSecret || args.secret !== expectedSecret) {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Invalid content moderation mutation secret.',
      })
    }

    const identity = await ctx.auth.getUserIdentity()
    const userId = identity?.tokenIdentifier ?? identity?.subject
    const anonymousClientIdHash =
      args.anonymousClientId && args.anonymousClientId.length > 0
        ? await hashOwnerSecret(args.anonymousClientId)
        : undefined
    const createdAt = Date.now()
    const flag = {
      prompt: args.prompt,
      surface: args.surface,
      matchedField: args.matchedField,
      category: args.category,
      ruleId: args.ruleId,
      decisionSource: args.decisionSource,
      classifierModel: args.classifierModel,
      userId,
      userName: identity?.name,
      userEmail: identity?.email,
      anonymousClientIdHash,
      clientIpHash: args.clientIpHash,
      sessionId: args.sessionId,
      createdAt,
    }

    const flagId = await ctx.db.insert('contentModerationFlags', flag)
    await ctx.scheduler.runAfter(0, notifySlackOfBlockedAttemptReference, {
      ...flag,
      flagId,
    })

    return { flagId }
  },
})
