import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import {
  assertCanMutateSession,
  assertCanReadOwnedSession,
  getUserId,
} from './session_access_helpers'
import {
  applyPreviewTextEdit,
  applyImageSwap,
  applyStyleEdit,
} from './session_edit_helpers'

export type ExportTarget = 'html' | 'react' | 'next' | 'lakebed'
export type ExportArtifactStatus = 'queued' | 'building' | 'ready' | 'failed'
const exportTargets: ExportTarget[] = ['html', 'react', 'next', 'lakebed']
const exportArtifactBuildStallMs = 2 * 60 * 1000
const stalledExportArtifactMessage =
  'Export build stalled before completion. Click to retry.'

export type ExportEntitlement =
  | {
      status: 'ready'
      requiresPayment: false
      entitlement: 'disabled_paywall' | 'subscription' | 'credits' | 'existing'
      remainingCredits?: number
    }
  | {
      status: 'payment_required'
      requiresPayment: true
      entitlement: 'anonymous' | 'payment_required'
      message: string
    }

type ExportPaywallEnv = {
  DISABLE_PAYWALL?: string
}

export const areExportPaywallsDisabled = (
  env: ExportPaywallEnv = process.env,
): boolean => (env.DISABLE_PAYWALL ?? '').trim().toLowerCase() === 'true'

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
  anonymousOwnerSecret?: string
}

export type RecordGitHubExportRepositoryInput = {
  sessionId: Id<'sessions'>
  target: ExportTarget
  anonymousOwnerSecret?: string
  repoUrl: string
}

export type EnsureExportArtifactBuildInput = {
  sessionId: Id<'sessions'>
  target: ExportTarget
  anonymousOwnerSecret?: string
  buildExportArtifact: ExportArtifactBuildReference
}

export type ExportArtifactBuildInput = {
  sessionId: Id<'sessions'>
  target: ExportTarget
  previewVersion: number
  autoDeployPublic?: boolean
}

export type ExportArtifactStalledInput = {
  sessionId: Id<'sessions'>
  target: ExportTarget
  previewVersion: number
  buildStartedAt: number
}

export type ExportArtifactReadyInput = ExportArtifactBuildInput & {
  storageId: Id<'_storage'>
  filesStorageId?: Id<'_storage'>
  filename: string
  contentType: string
  fileCount: number
  byteLength: number
  hash: string
}

export type ExportArtifactFailureInput = ExportArtifactBuildInput & {
  errorMessage: string
}

type ExportArtifactBuildReference = Parameters<
  MutationCtx['scheduler']['runAfter']
>[1]
type ExportArtifactStalledReference = Parameters<
  MutationCtx['scheduler']['runAfter']
>[1]

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
    case 'lakebed':
      return 12
  }
}

const exportArtifactPath = (target: ExportTarget, previewVersion: number) =>
  target === 'html'
    ? `preview-${previewVersion}.html`
    : `preview-${previewVersion}.${target}.zip`

export const exportDownloadUrl = (
  sessionId: Id<'sessions'>,
  target: ExportTarget,
) => `/api/sessions/${sessionId}/download/${target}`

const isLikelyOpenUISource = (source: string | undefined): boolean => {
  if (source === undefined) return false
  const trimmed = source.trim()
  if (!trimmed) return false
  if (/^<!doctype\s+html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)) {
    return true
  }
  return /(?:^|\n)\s*root\s*=/.test(trimmed)
}

const readOpenUISourceFromSiteSpec = (
  siteSpec: Doc<'siteSpecs'> | null,
): string | undefined => {
  const candidates = [siteSpec?.specJson, siteSpec?.spec]

  for (const candidate of candidates) {
    if (typeof candidate !== 'string' || !candidate.trim()) continue

    try {
      const parsed = JSON.parse(candidate) as unknown
      if (
        parsed !== null &&
        typeof parsed === 'object' &&
        'pages' in parsed &&
        parsed.pages !== null &&
        typeof parsed.pages === 'object'
      ) {
        const home = (parsed.pages as Record<string, unknown>).home
        if (typeof home === 'string' && isLikelyOpenUISource(home)) return home
      }
    } catch {
      if (isLikelyOpenUISource(candidate)) return candidate
    }
  }

  return undefined
}

const resolveExportOpenUISource = (
  preview: Doc<'previews'> | null,
  homeModule: Doc<'generatedModules'> | null,
  siteSpec: Doc<'siteSpecs'> | null,
): string =>
  preview && preview.openUiSource && isLikelyOpenUISource(preview.openUiSource)
    ? preview.openUiSource
    : (readOpenUISourceFromSiteSpec(siteSpec) ??
      (homeModule &&
      homeModule.source &&
      isLikelyOpenUISource(homeModule.source)
        ? homeModule.source
        : undefined) ??
      preview?.html ??
      '')

/** Apply edit overrides to source before export. */
const applyEditsToSource = (
  source: string,
  edits:
    | Array<{
        editType: string
        beforeText?: string
        afterText?: string
        occurrenceIndex?: number
      }>
    | undefined,
): string => {
  if (!edits || edits.length === 0) return source

  let result = source
  // Apply edits in reverse order (oldest first) so newer edits take precedence
  for (const edit of [...edits].reverse()) {
    if (edit.editType === 'text' && edit.beforeText && edit.afterText) {
      const textResult = applyPreviewTextEdit(
        result,
        edit.beforeText,
        edit.afterText,
        edit.occurrenceIndex,
      )
      if (textResult.replaced) {
        result = textResult.html
      }
    } else if (edit.editType === 'image' && edit.beforeText && edit.afterText) {
      const imageResult = applyImageSwap(
        result,
        edit.beforeText,
        edit.afterText,
        edit.occurrenceIndex,
      )
      if (imageResult.replaced) {
        result = imageResult.html
      }
    } else if (edit.editType === 'style' && edit.beforeText && edit.afterText) {
      const styleResult = applyStyleEdit(
        result,
        edit.beforeText,
        edit.afterText,
        edit.occurrenceIndex,
      )
      if (styleResult.replaced) {
        result = styleResult.html
      }
    }
  }
  return result
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

  return exportRecord === null ? null : toExportPayload(exportRecord)
}

const toExportPayload = (exportRecord: Doc<'exports'>) => {
  const paymentBypassed =
    areExportPaywallsDisabled() &&
    (exportRecord.status === 'payment_required' ||
      exportRecord.requiresPayment === true)

  return {
    exportId: exportRecord._id,
    target: exportRecord.target,
    status: paymentBypassed ? ('ready' as const) : exportRecord.status,
    fileCount: exportRecord.fileCount,
    previewVersion: exportRecord.previewVersion,
    requiresPayment: paymentBypassed ? false : exportRecord.requiresPayment,
    errorMessage: paymentBypassed ? undefined : exportRecord.errorMessage,
    createdAt: exportRecord.createdAt,
    updatedAt: exportRecord.updatedAt,
  }
}

const isStalledExportArtifact = (artifact: Doc<'exportArtifacts'>) =>
  artifact.status === 'building' &&
  Date.now() - artifact.updatedAt > exportArtifactBuildStallMs

const toArtifactPayload = (artifact: Doc<'exportArtifacts'> | null) => {
  if (artifact === null) return null
  const stalled = isStalledExportArtifact(artifact)
  return {
    artifactId: artifact._id,
    target: artifact.target,
    status: stalled ? 'failed' : artifact.status,
    previewVersion: artifact.previewVersion,
    filename: artifact.filename,
    contentType: artifact.contentType,
    fileCount: artifact.fileCount,
    byteLength: artifact.byteLength,
    hash: artifact.hash,
    errorMessage: stalled
      ? stalledExportArtifactMessage
      : artifact.errorMessage,
    createdAt: artifact.createdAt,
    updatedAt: artifact.updatedAt,
  }
}

const loadExportArtifactRecord = async (
  ctx: Pick<QueryCtx, 'db'>,
  sessionId: Id<'sessions'>,
  target: ExportTarget,
  previewVersion?: number,
) => {
  const query =
    previewVersion === undefined
      ? ctx.db
          .query('exportArtifacts')
          .withIndex('by_sessionId_target', (index) =>
            index.eq('sessionId', sessionId).eq('target', target),
          )
      : ctx.db
          .query('exportArtifacts')
          .withIndex('by_sessionId_target_previewVersion', (index) =>
            index
              .eq('sessionId', sessionId)
              .eq('target', target)
              .eq('previewVersion', previewVersion),
          )

  return await query.order('desc').first()
}

export const loadSessionExportTargets = async (
  ctx: QueryCtx,
  sessionId: Id<'sessions'>,
) => {
  const session = await ctx.db.get(sessionId)
  const previewReady = session?.status === 'preview_ready'
  const currentPreviewVersion = session?.previewVersion

  const targets = await Promise.all(
    exportTargets.map(async (target) => {
      const [record, artifact] = await Promise.all([
        ctx.db
          .query('exports')
          .withIndex('by_sessionId_target', (index) =>
            index.eq('sessionId', sessionId).eq('target', target),
          )
          .first(),
        currentPreviewVersion === undefined
          ? Promise.resolve(null)
          : loadExportArtifactRecord(
              ctx,
              sessionId,
              target,
              currentPreviewVersion,
            ),
      ])
      const isStale =
        record?.previewVersion !== undefined &&
        currentPreviewVersion !== undefined &&
        record.previewVersion !== currentPreviewVersion
      const ready = record?.status === 'ready' && !isStale
      const artifactPayload = toArtifactPayload(artifact)

      return {
        target,
        label:
          target === 'html'
            ? 'HTML'
            : target === 'react'
              ? 'React'
              : target === 'next'
                ? 'Next.js'
                : 'Lakebed',
        ready,
        status: isStale
          ? 'stale'
          : (record?.status ?? (previewReady ? 'available' : 'not_ready')),
        requiresPayment: record?.requiresPayment ?? false,
        fileCount: record?.fileCount ?? artifactPayload?.fileCount ?? null,
        previewVersion: record?.previewVersion ?? null,
        currentPreviewVersion: currentPreviewVersion ?? null,
        downloadUrl:
          ready && artifactPayload?.status === 'ready'
            ? (record.downloadUrl ?? exportDownloadUrl(sessionId, target))
            : null,
        githubUrl: record?.githubUrl ?? record?.url ?? null,
        githubRepoUrl: record?.githubUrl ?? record?.url ?? null,
        deployedUrl: record?.deployedUrl ?? null,
        artifact: artifactPayload,
        artifactReady: artifactPayload?.status === 'ready',
        artifactStatus:
          artifactPayload?.status ?? (previewReady ? 'queued' : 'not_ready'),
        artifactError: artifactPayload?.errorMessage,
      }
    }),
  )

  return {
    sessionId,
    previewReady,
    isPrivate: session?.isPrivate ?? null,
    targets,
  }
}

export const queueSessionExportArtifactBuilds = async (
  ctx: Pick<MutationCtx, 'db' | 'scheduler'>,
  args: {
    sessionId: Id<'sessions'>
    previewVersion: number
    isPrivate: boolean
    now: number
    buildExportArtifact: ExportArtifactBuildReference
    delayMs?: number
  },
) => {
  const delayMs = args.delayMs ?? 0

  await Promise.all(
    exportTargets.map((target) =>
      queueSessionExportArtifactBuild(ctx, {
        sessionId: args.sessionId,
        target,
        previewVersion: args.previewVersion,
        isPrivate: args.isPrivate,
        now: args.now,
        buildExportArtifact: args.buildExportArtifact,
        delayMs,
        force: true,
      }),
    ),
  )
}

export const queueSessionExportArtifactBuild = async (
  ctx: Pick<MutationCtx, 'db' | 'scheduler'>,
  args: {
    sessionId: Id<'sessions'>
    target: ExportTarget
    previewVersion: number
    isPrivate: boolean
    now: number
    buildExportArtifact: ExportArtifactBuildReference
    delayMs?: number
    force?: boolean
  },
) => {
  const existing = await ctx.db
    .query('exportArtifacts')
    .withIndex('by_sessionId_target_previewVersion', (index) =>
      index
        .eq('sessionId', args.sessionId)
        .eq('target', args.target)
        .eq('previewVersion', args.previewVersion),
    )
    .first()

  if (existing?.status === 'ready' && args.force !== true) {
    return toArtifactPayload(existing)
  }

  existing === null
    ? await ctx.db.insert('exportArtifacts', {
        sessionId: args.sessionId,
        target: args.target,
        previewVersion: args.previewVersion,
        status: 'queued',
        createdAt: args.now,
        updatedAt: args.now,
      })
    : await ctx.db.patch(existing._id, {
        status: 'queued',
        errorMessage: undefined,
        updatedAt: args.now,
      })

  await ctx.scheduler.runAfter(args.delayMs ?? 0, args.buildExportArtifact, {
    sessionId: args.sessionId,
    target: args.target,
    previewVersion: args.previewVersion,
    autoDeployPublic: args.target === 'lakebed' && args.isPrivate === false,
  })

  return {
    target: args.target,
    status: 'queued',
    previewVersion: args.previewVersion,
    updatedAt: args.now,
  }
}

export const markExportArtifactBuilding = async (
  ctx: MutationCtx,
  args: ExportArtifactBuildInput & {
    stallExportArtifactBuild?: ExportArtifactStalledReference
  },
) => {
  const now = Date.now()
  const existing = await loadExportArtifactRecord(
    ctx,
    args.sessionId,
    args.target,
    args.previewVersion,
  )

  if (existing?.status === 'ready') return toArtifactPayload(existing)

  const status = 'building' as const
  const patch = {
    sessionId: args.sessionId,
    target: args.target,
    previewVersion: args.previewVersion,
    status,
    errorMessage: undefined,
    updatedAt: now,
  }

  const artifactId =
    existing === null
      ? await ctx.db.insert('exportArtifacts', {
          ...patch,
          createdAt: now,
        })
      : (await ctx.db.patch(existing._id, patch), existing._id)

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'export_artifact_building',
    message: `Preparing ${args.target} export`,
    previewVersion: args.previewVersion,
    createdAt: now,
  })

  if (args.stallExportArtifactBuild !== undefined) {
    await ctx.scheduler.runAfter(
      exportArtifactBuildStallMs,
      args.stallExportArtifactBuild,
      {
        sessionId: args.sessionId,
        target: args.target,
        previewVersion: args.previewVersion,
        buildStartedAt: now,
      },
    )
  }

  return {
    artifactId,
    target: args.target,
    status,
    previewVersion: args.previewVersion,
    updatedAt: now,
  }
}

export const recordExportArtifactStalled = async (
  ctx: MutationCtx,
  args: ExportArtifactStalledInput,
) => {
  const existing = await loadExportArtifactRecord(
    ctx,
    args.sessionId,
    args.target,
    args.previewVersion,
  )

  if (
    existing === null ||
    existing.status !== 'building' ||
    existing.updatedAt !== args.buildStartedAt
  ) {
    return toArtifactPayload(existing)
  }

  return await recordExportArtifactFailure(ctx, {
    sessionId: args.sessionId,
    target: args.target,
    previewVersion: args.previewVersion,
    errorMessage: stalledExportArtifactMessage,
  })
}

export const recordExportArtifactReady = async (
  ctx: MutationCtx,
  args: ExportArtifactReadyInput,
) => {
  const now = Date.now()
  const existing = await loadExportArtifactRecord(
    ctx,
    args.sessionId,
    args.target,
    args.previewVersion,
  )
  const status = 'ready' as const
  const patch = {
    sessionId: args.sessionId,
    target: args.target,
    previewVersion: args.previewVersion,
    status,
    storageId: args.storageId,
    filesStorageId: args.filesStorageId,
    filename: args.filename,
    contentType: args.contentType,
    fileCount: args.fileCount,
    byteLength: args.byteLength,
    hash: args.hash,
    errorMessage: undefined,
    updatedAt: now,
  }

  const artifactId =
    existing === null
      ? await ctx.db.insert('exportArtifacts', {
          ...patch,
          createdAt: now,
        })
      : (await ctx.db.patch(existing._id, patch), existing._id)

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'export_artifact_ready',
    message: `${args.target} export prepared`,
    previewVersion: args.previewVersion,
    createdAt: now,
  })

  return { artifactId, target: args.target, status }
}

export const recordExportArtifactFailure = async (
  ctx: MutationCtx,
  args: ExportArtifactFailureInput,
) => {
  const now = Date.now()
  const existing = await loadExportArtifactRecord(
    ctx,
    args.sessionId,
    args.target,
    args.previewVersion,
  )
  const status = 'failed' as const
  const patch = {
    sessionId: args.sessionId,
    target: args.target,
    previewVersion: args.previewVersion,
    status,
    errorMessage: args.errorMessage,
    updatedAt: now,
  }

  existing === null
    ? await ctx.db.insert('exportArtifacts', {
        ...patch,
        createdAt: now,
      })
    : await ctx.db.patch(existing._id, patch)

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'export_artifact_failed',
    message: `${args.target} export failed: ${args.errorMessage}`,
    previewVersion: args.previewVersion,
    createdAt: now,
  })

  return { target: args.target, status }
}

export const getExportEntitlement = async (
  ctx: Pick<MutationCtx, 'db'>,
  userId: string | undefined,
  sessionId: Id<'sessions'>,
): Promise<ExportEntitlement> => {
  if (areExportPaywallsDisabled()) {
    return {
      status: 'ready',
      requiresPayment: false,
      entitlement: 'disabled_paywall',
    }
  }

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
  const downloadUrl = exportDownloadUrl(args.sessionId, args.target)
  const alreadyReadyForCurrentPreview =
    existingExport?.status === 'ready' &&
    existingExport.requiresPayment === false &&
    existingExport.previewVersion === preview.version
  const existingExportStatus = 'ready' as const
  const existingExportRequiresPayment = false as const
  const existingExportEntitlement = 'existing' as const
  const entitlement = alreadyReadyForCurrentPreview
    ? {
        status: existingExportStatus,
        requiresPayment: existingExportRequiresPayment,
        entitlement: existingExportEntitlement,
      }
    : await getExportEntitlement(ctx, session.userId, args.sessionId)

  const exportId =
    existingExport !== null
      ? existingExport._id
      : await ctx.db.insert('exports', {
          sessionId: args.sessionId,
          target: args.target,
          status: entitlement.status,
          artifactPath: exportArtifactPath(args.target, preview.version),
          previewVersion: preview.version,
          downloadUrl: entitlement.status === 'ready' ? downloadUrl : undefined,
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
      artifactPath: exportArtifactPath(args.target, preview.version),
      previewVersion: preview.version,
      downloadUrl: entitlement.status === 'ready' ? downloadUrl : undefined,
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
    downloadUrl: entitlement.status === 'ready' ? downloadUrl : undefined,
    fileCount,
    requiresPayment: entitlement.requiresPayment,
    entitlement: entitlement.entitlement,
    remainingCredits:
      entitlement.status === 'ready' && entitlement.entitlement === 'credits'
        ? entitlement.remainingCredits
        : undefined,
  }
}

export const recordGitHubExportRepository = async (
  ctx: MutationCtx,
  args: RecordGitHubExportRepositoryInput,
) => {
  const session = await ctx.db.get(args.sessionId)
  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

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
        message: 'Export not found',
      })
    })()

  const now = Date.now()
  await ctx.db.patch(exportRecord._id, {
    githubUrl: args.repoUrl,
    url: args.repoUrl,
    updatedAt: now,
  })

  return {
    target: args.target,
    githubUrl: args.repoUrl,
    updatedAt: now,
  }
}

export const ensureExportArtifactBuild = async (
  ctx: MutationCtx,
  args: EnsureExportArtifactBuildInput,
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

  return await queueSessionExportArtifactBuild(ctx, {
    sessionId: args.sessionId,
    target: args.target,
    previewVersion: preview.version,
    isPrivate: session.isPrivate === true,
    now,
    buildExportArtifact: args.buildExportArtifact,
    force: false,
  })
}

export const prepareExportArtifactBuild = async (
  ctx: QueryCtx,
  args: ExportArtifactBuildInput,
) => {
  const session = await ctx.db.get(args.sessionId)

  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

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

  if (preview === null) {
    throw new ConvexError({
      code: 'PREVIEW_NOT_READY',
      message: 'Preview is not ready to export',
    })
  }

  if (preview.version !== args.previewVersion) return null

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

  const edits = await ctx.db
    .query('edits')
    .withIndex('by_sessionId_createdAt', (index) =>
      index.eq('sessionId', args.sessionId),
    )
    .collect()

  const canonicalSource = resolveExportOpenUISource(
    preview,
    homeModule,
    siteSpec,
  )
  const source = applyEditsToSource(canonicalSource, edits)

  source.trim().length > 0 ||
    (() => {
      throw new ConvexError({
        code: 'ARTIFACT_NOT_READY',
        message: 'Generated source is not ready to export',
      })
    })()

  const siteSpecJson =
    preview.siteSpecJson ?? siteSpec?.specJson ?? siteSpec?.spec
  const themeName = session.genuiTheme
  const prepared = {
    sessionId: args.sessionId,
    prompt: session.prompt,
    target: args.target,
    previewVersion: preview.version,
    source,
    html: preview.html,
    ...(siteSpecJson === undefined ? {} : { siteSpecJson }),
    ...(themeName === undefined ? {} : { themeName }),
    isDark: true,
    isPrivate: session.isPrivate === true,
  }

  return prepared
}

export const loadOwnedExportBuildInput = async (
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

  if (!areExportPaywallsDisabled()) {
    await assertCanReadOwnedSession(ctx, session, args.anonymousOwnerSecret)
  }

  const latestPreview = await ctx.db
    .query('previews')
    .withIndex('by_sessionId_version', (index) =>
      index.eq('sessionId', args.sessionId),
    )
    .order('desc')
    .first()

  latestPreview !== null ||
    (() => {
      throw new ConvexError({
        code: 'PREVIEW_NOT_READY',
        message: 'Preview is not ready to export',
      })
    })()

  return await prepareExportArtifactBuild(ctx, {
    sessionId: args.sessionId,
    target: args.target,
    previewVersion: latestPreview.version,
  })
}

export const loadOwnedExportArtifactDownload = async (
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

  if (!areExportPaywallsDisabled()) {
    await assertCanReadOwnedSession(ctx, session, args.anonymousOwnerSecret)
  }

  const exportRecord = await ctx.db
    .query('exports')
    .withIndex('by_sessionId_target', (index) =>
      index.eq('sessionId', args.sessionId).eq('target', args.target),
    )
    .first()

  if (exportRecord === null) return null

  const exportPayload = toExportPayload(exportRecord)
  const latestPreview = await ctx.db
    .query('previews')
    .withIndex('by_sessionId_version', (index) =>
      index.eq('sessionId', args.sessionId),
    )
    .order('desc')
    .first()
  const latestPreviewVersion = latestPreview?.version

  const artifact =
    latestPreviewVersion === undefined
      ? null
      : await loadExportArtifactRecord(
          ctx,
          args.sessionId,
          args.target,
          latestPreviewVersion,
        )
  const artifactPayload = toArtifactPayload(artifact)
  const storageUrl =
    artifact?.status === 'ready' && artifact.storageId !== undefined
      ? await ctx.storage.getUrl(artifact.storageId)
      : null
  const filesUrl =
    artifact?.status === 'ready' && artifact.filesStorageId !== undefined
      ? await ctx.storage.getUrl(artifact.filesStorageId)
      : null

  return {
    export: exportPayload,
    artifact: artifactPayload,
    storageUrl,
    filesUrl,
    latestPreviewVersion,
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

  await assertCanReadOwnedSession(ctx, session, args.anonymousOwnerSecret)

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

  const exportPayload = toExportPayload(exportRecord)

  exportPayload.status === 'ready' ||
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

  exportPayload.requiresPayment !== true ||
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

  const artifact = await loadExportArtifactRecord(
    ctx,
    args.sessionId,
    args.target,
    preview.version,
  )
  const filesUrl =
    artifact?.status === 'ready' && artifact.filesStorageId !== undefined
      ? await ctx.storage.getUrl(artifact.filesStorageId)
      : null

  return {
    sessionId: args.sessionId,
    prompt: session.prompt,
    target: exportPayload.target,
    previewVersion: preview.version,
    html: preview.html,
    source: resolveExportOpenUISource(preview, homeModule, siteSpec),
    siteSpecJson: preview.siteSpecJson ?? siteSpec?.specJson ?? siteSpec?.spec,
    previewHtml: preview.html,
    themeName: session.genuiTheme,
    isDark: true,
    includeBadge: exportRecord.requiresPayment !== false,
    artifact: toArtifactPayload(artifact),
    filesUrl,
  }
}
