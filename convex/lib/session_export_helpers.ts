import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import {
  assertCanMutateSession,
  assertCanReadOwnedSession,
  getUserId,
} from './session_access_helpers'

export type ExportTarget = 'html' | 'react' | 'next'

export type ExportEntitlement =
  | {
      status: 'ready'
      requiresPayment: false
      entitlement: 'subscription' | 'credits'
      remainingCredits?: number
    }
  | {
      status: 'payment_required'
      requiresPayment: true
      entitlement: 'anonymous' | 'payment_required'
      message: string
    }

export type CreateSessionExportInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  target: ExportTarget
}

export type OwnedExportDownloadInput = {
  sessionId: Id<'sessions'>
  target: ExportTarget
  anonymousOwnerSecret?: string
}

export type OwnedExportForGitHubPushInput = {
  sessionId: Id<'sessions'>
  target: ExportTarget
}

const activeExportSubscriptionStatuses = new Set([
  'active',
  'trialing',
  'authenticated',
])

export const exportTargetFileCount = (target: ExportTarget): number => {
  switch (target) {
    case 'html':
      return 5
    case 'react':
    case 'next':
      return 7
  }
}

export const loadExportRecord = async (
  ctx: Pick<QueryCtx, 'db'>,
  sessionId: Id<'sessions'>,
  target: ExportTarget,
) => {
  const exportRecord = await ctx.db
    .query('exports')
    .withIndex('by_sessionId_target', (index) =>
      index.eq('sessionId', sessionId).eq('target', target),
    )
    .first()

  return exportRecord === null
    ? null
    : {
        exportId: exportRecord._id,
        target: exportRecord.target,
        status: exportRecord.status,
        fileCount: exportRecord.fileCount,
        previewVersion: exportRecord.previewVersion,
        requiresPayment: exportRecord.requiresPayment,
        errorMessage: exportRecord.errorMessage,
        createdAt: exportRecord.createdAt,
        updatedAt: exportRecord.updatedAt,
      }
}

const toExportPayload = (exportRecord: Doc<'exports'>) => ({
  exportId: exportRecord._id,
  target: exportRecord.target,
  status: exportRecord.status,
  fileCount: exportRecord.fileCount,
  previewVersion: exportRecord.previewVersion,
  requiresPayment: exportRecord.requiresPayment,
  errorMessage: exportRecord.errorMessage,
  createdAt: exportRecord.createdAt,
  updatedAt: exportRecord.updatedAt,
})

export const getExportEntitlement = async (
  ctx: Pick<MutationCtx, 'db'>,
  userId: string | undefined,
  sessionId: Id<'sessions'>,
): Promise<ExportEntitlement> => {
  if (userId === undefined) {
    return {
      status: 'payment_required',
      requiresPayment: true,
      entitlement: 'anonymous',
      message:
        'Sign in and subscribe to Pro or purchase download credits to export ZIP files.',
    }
  }

  const subscriptions = await ctx.db
    .query('subscriptions')
    .withIndex('by_userId', (index) => index.eq('userId', userId))
    .take(20)
  const activeSubscription = subscriptions.find((subscription) =>
    activeExportSubscriptionStatuses.has(subscription.status),
  )

  if (activeSubscription !== undefined) {
    return {
      status: 'ready',
      requiresPayment: false,
      entitlement: 'subscription',
    }
  }

  const credits = await ctx.db
    .query('customerCredits')
    .withIndex('by_userId', (index) => index.eq('userId', userId))
    .first()

  if (credits !== null && credits.remaining > 0) {
    const now = Date.now()
    const remainingCredits = credits.remaining - 1
    await ctx.db.patch(credits._id, {
      remaining: remainingCredits,
      updatedAt: now,
    })
    await ctx.db.insert('creditLedger', {
      userId,
      sessionId,
      amount: -1,
      balanceAfter: remainingCredits,
      reason: 'export',
      createdAt: now,
    })

    return {
      status: 'ready',
      requiresPayment: false,
      entitlement: 'credits',
      remainingCredits,
    }
  }

  return {
    status: 'payment_required',
    requiresPayment: true,
    entitlement: 'payment_required',
    message:
      'Subscribe to Pro or purchase download credits to export ZIP files.',
  }
}

export const createSessionExport = async (
  ctx: MutationCtx,
  args: CreateSessionExportInput,
) => {
  const session = await ctx.db.get(args.sessionId)
  const now = Date.now()

  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

  session.status === 'preview_ready' ||
    (() => {
      throw new ConvexError({
        code: 'PREVIEW_NOT_READY',
        message: 'Preview is not ready to export',
      })
    })()

  const preview = await ctx.db
    .query('previews')
    .withIndex('by_sessionId_version', (index) =>
      index.eq('sessionId', args.sessionId),
    )
    .order('desc')
    .first()

  preview !== null ||
    (() => {
      throw new ConvexError({
        code: 'PREVIEW_NOT_READY',
        message: 'Preview is not ready to export',
      })
    })()

  const homeModule = await ctx.db
    .query('generatedModules')
    .withIndex('by_sessionId_moduleKey', (index) =>
      index.eq('sessionId', args.sessionId).eq('moduleKey', 'home'),
    )
    .first()

  homeModule?.source.trim().length ||
    (() => {
      throw new ConvexError({
        code: 'ARTIFACT_NOT_READY',
        message: 'Generated source is not ready to export',
      })
    })()

  const existingExport = await ctx.db
    .query('exports')
    .withIndex('by_sessionId_target', (index) =>
      index.eq('sessionId', args.sessionId).eq('target', args.target),
    )
    .first()

  const fileCount = exportTargetFileCount(args.target)
  const alreadyReadyForCurrentPreview =
    existingExport?.status === 'ready' &&
    existingExport.requiresPayment === false &&
    existingExport.previewVersion === preview.version
  const entitlement = alreadyReadyForCurrentPreview
    ? {
        status: 'ready' as const,
        requiresPayment: false as const,
        entitlement: 'existing' as const,
      }
    : await getExportEntitlement(ctx, session.userId, args.sessionId)

  const exportId =
    existingExport !== null
      ? existingExport._id
      : await ctx.db.insert('exports', {
          sessionId: args.sessionId,
          target: args.target,
          status: entitlement.status,
          artifactPath: `preview-${preview.version}.html`,
          previewVersion: preview.version,
          fileCount,
          requiresPayment: entitlement.requiresPayment,
          errorMessage:
            entitlement.status === 'payment_required'
              ? entitlement.message
              : undefined,
          createdAt: now,
          updatedAt: now,
        })

  if (existingExport !== null) {
    await ctx.db.patch(exportId, {
      status: entitlement.status,
      artifactPath: `preview-${preview.version}.html`,
      previewVersion: preview.version,
      fileCount,
      requiresPayment: entitlement.requiresPayment,
      errorMessage:
        entitlement.status === 'payment_required'
          ? entitlement.message
          : undefined,
      updatedAt: now,
    })
  }

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType:
      entitlement.status === 'ready'
        ? 'export_ready'
        : 'export_payment_required',
    message:
      entitlement.status === 'ready'
        ? `Export ready for ${args.target}`
        : entitlement.message,
    previewVersion: preview.version,
    createdAt: now,
  })

  return {
    exportId,
    target: args.target,
    status: entitlement.status,
    previewVersion: preview.version,
    fileCount,
    requiresPayment: entitlement.requiresPayment,
    entitlement: entitlement.entitlement,
    remainingCredits:
      entitlement.status === 'ready' && entitlement.entitlement === 'credits'
        ? entitlement.remainingCredits
        : undefined,
  }
}

export const loadOwnedExportDownload = async (
  ctx: QueryCtx,
  args: OwnedExportDownloadInput,
) => {
  const session = await ctx.db.get(args.sessionId)

  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  await assertCanReadOwnedSession(ctx, session, args.anonymousOwnerSecret)

  const exportRecord = await ctx.db
    .query('exports')
    .withIndex('by_sessionId_target', (index) =>
      index.eq('sessionId', args.sessionId).eq('target', args.target),
    )
    .first()

  if (exportRecord === null) return null

  const exportPayload = toExportPayload(exportRecord)

  if (
    exportRecord.status === 'payment_required' ||
    exportRecord.requiresPayment === true ||
    exportRecord.status !== 'ready'
  ) {
    return { export: exportPayload }
  }

  const latestPreview = await ctx.db
    .query('previews')
    .withIndex('by_sessionId_version', (index) =>
      index.eq('sessionId', args.sessionId),
    )
    .order('desc')
    .first()
  const homeModule = await ctx.db
    .query('generatedModules')
    .withIndex('by_sessionId_moduleKey', (index) =>
      index.eq('sessionId', args.sessionId).eq('moduleKey', 'home'),
    )
    .first()
  const siteSpec = await ctx.db
    .query('siteSpecs')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', args.sessionId))
    .first()

  return {
    export: exportPayload,
    source: homeModule?.source,
    siteSpecJson: siteSpec?.specJson,
    previewHtml: latestPreview?.html,
    latestPreviewVersion: latestPreview?.version,
  }
}

export const loadOwnedExportForGitHubPush = async (
  ctx: QueryCtx,
  args: OwnedExportForGitHubPushInput,
) => {
  const userId = await getUserId(ctx)

  userId !== undefined ||
    (() => {
      throw new ConvexError({
        code: 'AUTH_REQUIRED',
        message: 'Sign in before pushing to GitHub.',
      })
    })()

  const session = await ctx.db.get(args.sessionId)
  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  session.userId === userId ||
    (() => {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'You do not own this session',
      })
    })()

  const exportRecord = await ctx.db
    .query('exports')
    .withIndex('by_sessionId_target', (index) =>
      index.eq('sessionId', args.sessionId).eq('target', args.target),
    )
    .first()

  exportRecord !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Generate this export before pushing it to GitHub.',
      })
    })()

  exportRecord.status === 'ready' ||
    (() => {
      throw new ConvexError({
        code:
          exportRecord.status === 'payment_required'
            ? 'PAYMENT_REQUIRED'
            : 'NOT_READY',
        message:
          exportRecord.status === 'payment_required'
            ? (exportRecord.errorMessage ??
              'Subscribe to Pro or purchase download credits before pushing to GitHub.')
            : 'Export is not ready for GitHub push.',
      })
    })()

  exportRecord.requiresPayment !== true ||
    (() => {
      throw new ConvexError({
        code: 'PAYMENT_REQUIRED',
        message:
          exportRecord.errorMessage ??
          'Subscribe to Pro or purchase download credits before pushing to GitHub.',
      })
    })()

  const preview = await ctx.db
    .query('previews')
    .withIndex('by_sessionId_version', (index) =>
      index.eq('sessionId', args.sessionId),
    )
    .order('desc')
    .first()

  preview !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Preview not found',
      })
    })()

  const exportPreviewVersion = exportRecord.previewVersion
  if (
    exportPreviewVersion !== undefined &&
    exportPreviewVersion !== preview.version
  ) {
    throw new ConvexError({
      code: 'EXPORT_STALE',
      message: 'Regenerate this export before pushing it to GitHub.',
    })
  }

  return {
    sessionId: args.sessionId,
    prompt: session.prompt,
    target: exportRecord.target,
    previewVersion: preview.version,
    html: preview.html,
    includeBadge: exportRecord.requiresPayment !== false,
  }
}
