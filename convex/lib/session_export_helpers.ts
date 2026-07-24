import { ConvexError } from 'convex/values'

import { exportGeneratorRevision } from '../../src/features/exports/services/export-generator-revision'
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import {
  assertCanMutateSession,
  assertCanReadOwnedSession,
  getUserId,
  isUserAdmin,
} from './session_access_helpers'
import {
  applyPreviewTextEdit,
  applyImageSwap,
  applyStyleEdit,
} from './session_edit_helpers'
import {
  applyCachedTranslationsToSource,
  loadCachedTranslationsForSource,
} from './session_translation_cache_helpers'
import { isUnsafePublicPreviewHtml } from './openui_error_html'
import { resolveDeploymentBadgeEntitlement } from './deployment_badge_helpers'
import { progressForStage } from './export_progress_stages'

export type ExportTarget = 'html' | 'react' | 'next' | 'lakebed'
export type ExportArtifactStatus = 'queued' | 'building' | 'ready' | 'failed'
const exportTargets: ExportTarget[] = ['html', 'react', 'next', 'lakebed']
const exportArtifactBuildStallMs = 15 * 60 * 1000
const stalledExportArtifactMessage =
  'Export build stalled before completion. Click to retry.'

export { exportGeneratorRevision }

function readAppliedThemeName(session: Doc<'sessions'>): string | undefined {
  return typeof session.themeOverride === 'string'
    ? session.themeOverride
    : session.genuiTheme
}

function readAppliedIsDark(session: Doc<'sessions'>): boolean {
  return session.themeMode !== 'light'
}

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

export function areExportPaywallsDisabled(
  env: ExportPaywallEnv = process.env,
): boolean {
  return (env.DISABLE_PAYWALL ?? '').trim().toLowerCase() === 'true'
}

type AuthDisabledEnv = {
  VITE_DISABLE_CLERK?: string
}

/**
 * When `VITE_DISABLE_CLERK=true` is set on the Convex deployment, all
 * authenticated ownership checks are bypassed so anonymous users can use every
 * feature (exports, GitHub push, session mutation) without signing in.
 * Mirrors the client-side `isClerkDisabled` check in `clerk-runtime.ts`.
 */
export function isAuthDisabled(env: AuthDisabledEnv = process.env): boolean {
  return (env.VITE_DISABLE_CLERK ?? '').trim().toLowerCase() === 'true'
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
  generatorRevision?: string
}

export type ExportArtifactBuildInput = {
  sessionId: Id<'sessions'>
  target: ExportTarget
  previewVersion: number
  locale?: string
  autoDeployPublic?: boolean
  generatorRevision?: string
}

export type ExportArtifactStalledInput = {
  sessionId: Id<'sessions'>
  target: ExportTarget
  previewVersion: number
  locale?: string
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

export type ExportArtifactBuildReference = Parameters<
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

export function exportTargetFileCount(target: ExportTarget): number {
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

function exportArtifactPath(target: ExportTarget, previewVersion: number) {
  return target === 'html'
    ? `preview-${previewVersion}.html`
    : `preview-${previewVersion}.${target}.zip`
}

export function exportDownloadUrl(
  sessionId: Id<'sessions'>,
  target: ExportTarget,
) {
  return `/api/sessions/${sessionId}/download/${target}`
}

function isLikelyOpenUISource(source: string | undefined): boolean {
  if (source === undefined) return false
  const trimmed = source.trim()
  if (!trimmed) return false
  if (/^<!doctype\s+html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)) {
    return true
  }
  return /(?:^|\n)\s*root\s*=/.test(trimmed)
}

function isHtmlDocumentSource(source: string): boolean {
  const trimmed = source.trim()
  return /^<!doctype\s+html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)
}

function readOpenUISourceFromSiteSpec(
  siteSpec: Doc<'siteSpecs'> | null,
): string | undefined {
  const candidates = [siteSpec?.specJson, siteSpec?.spec]

  for (const candidate of candidates) {
    if (typeof candidate !== 'string' || !candidate.trim()) continue

    try {
      const parsed: unknown = JSON.parse(candidate)
      if (
        parsed !== null &&
        typeof parsed === 'object' &&
        'pages' in parsed &&
        parsed.pages !== null &&
        typeof parsed.pages === 'object' &&
        'home' in parsed.pages
      ) {
        const home = parsed.pages.home
        if (typeof home === 'string' && isLikelyOpenUISource(home)) return home
      }
    } catch {
      if (isLikelyOpenUISource(candidate)) return candidate
    }
  }

  return undefined
}

function resolveExportOpenUISource(
  preview: Doc<'previews'> | null,
  homeModule: Doc<'generatedModules'> | null,
  siteSpec: Doc<'siteSpecs'> | null,
): string {
  return (
    (homeModule && homeModule.source && isLikelyOpenUISource(homeModule.source)
      ? homeModule.source
      : undefined) ??
    readOpenUISourceFromSiteSpec(siteSpec) ??
    (preview &&
    preview.openUiSource &&
    isLikelyOpenUISource(preview.openUiSource)
      ? preview.openUiSource
      : undefined) ??
    preview?.html ??
    ''
  )
}

function isTextEditAlreadyMaterialized(
  source: string,
  beforeText: string,
  afterText: string,
  occurrenceIndex: number | undefined,
): boolean {
  if (!beforeText || !afterText.includes(beforeText)) return false

  const beforeOffsets: number[] = []
  let beforeOffset = source.indexOf(beforeText)
  while (beforeOffset >= 0) {
    beforeOffsets.push(beforeOffset)
    beforeOffset = source.indexOf(beforeText, beforeOffset + beforeText.length)
  }
  if (beforeOffsets.length === 0) return false

  const wanted =
    occurrenceIndex !== undefined && occurrenceIndex >= 0
      ? Math.min(occurrenceIndex, beforeOffsets.length - 1)
      : 0
  const targetStart = beforeOffsets[wanted]
  const targetEnd = targetStart + beforeText.length

  let afterOffset = source.indexOf(afterText)
  while (afterOffset >= 0) {
    if (
      afterOffset <= targetStart &&
      targetEnd <= afterOffset + afterText.length
    ) {
      return true
    }
    afterOffset = source.indexOf(afterText, afterOffset + afterText.length)
  }

  return false
}

/** Apply edit overrides to source before export. */
export function applyEditsToSource(
  source: string,
  edits:
    | Array<{
        editType: string
        beforeText?: string
        afterText?: string
        occurrenceIndex?: number
        locale?: string
        canonicalSourceText?: string
      }>
    | undefined,
  locale?: string,
): string {
  if (!edits || edits.length === 0) return source

  let result = source
  // Apply edits in reverse order (oldest first) so newer edits take precedence
  for (const edit of [...edits].reverse()) {
    const localizedEditMatches =
      edit.locale !== undefined &&
      normalizeExportLocale(edit.locale) === normalizeExportLocale(locale)
    const textEditSource =
      edit.locale === undefined
        ? edit.beforeText
        : localizedEditMatches
          ? edit.beforeText && result.includes(edit.beforeText)
            ? edit.beforeText
            : edit.canonicalSourceText
          : undefined
    if (edit.editType === 'text' && textEditSource && edit.afterText) {
      if (
        isTextEditAlreadyMaterialized(
          result,
          textEditSource,
          edit.afterText,
          edit.occurrenceIndex,
        )
      ) {
        continue
      }
      const textResult = applyPreviewTextEdit(
        result,
        textEditSource,
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

export async function loadExportRecord(
  ctx: Pick<QueryCtx, 'db'>,
  sessionId: Id<'sessions'>,
  target: ExportTarget,
  isAdmin = false,
) {
  const exportRecord = await ctx.db
    .query('exports')
    .withIndex('by_sessionId_target', (index) =>
      index.eq('sessionId', sessionId).eq('target', target),
    )
    .first()

  return exportRecord === null ? null : toExportPayload(exportRecord, isAdmin)
}

function toExportPayload(exportRecord: Doc<'exports'>, isAdmin = false) {
  const paymentBypassed =
    (areExportPaywallsDisabled() || isAdmin) &&
    (exportRecord.status === 'payment_required' ||
      exportRecord.requiresPayment === true)

  return {
    exportId: exportRecord._id,
    target: exportRecord.target,
    status: paymentBypassed ? 'ready' : exportRecord.status,
    fileCount: exportRecord.fileCount,
    previewVersion: exportRecord.previewVersion,
    requiresPayment: paymentBypassed ? false : exportRecord.requiresPayment,
    errorMessage: paymentBypassed ? undefined : exportRecord.errorMessage,
    createdAt: exportRecord.createdAt,
    updatedAt: exportRecord.updatedAt,
  }
}

function isStalledExportArtifact(artifact: Doc<'exportArtifacts'>) {
  return (
    artifact.status === 'building' &&
    Date.now() - artifact.updatedAt > exportArtifactBuildStallMs
  )
}

function toArtifactPayload(artifact: Doc<'exportArtifacts'> | null) {
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
    generatorRevision: artifact.generatorRevision,
    errorMessage: stalled
      ? stalledExportArtifactMessage
      : artifact.errorMessage,
    progressStage: artifact.progressStage,
    progressPercent: artifact.progressPercent,
    progressStartedAt: artifact.progressStartedAt,
    progressUpdatedAt: artifact.progressUpdatedAt,
    progressSampleCount: artifact.progressSampleCount,
    createdAt: artifact.createdAt,
    updatedAt: artifact.updatedAt,
  }
}

async function loadExportArtifactRecord(
  ctx: Pick<QueryCtx, 'db'>,
  sessionId: Id<'sessions'>,
  target: ExportTarget,
  previewVersion?: number,
) {
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

  return previewVersion === undefined
    ? await query.order('desc').first()
    : await query.first()
}

function normalizeExportLocale(locale: string | undefined): string {
  return locale?.trim().toLowerCase() || 'en'
}

async function resolveExportArtifactLocale(
  ctx: Pick<QueryCtx, 'db'>,
  sessionId: Id<'sessions'>,
  requestedLocale?: string,
): Promise<string> {
  if (requestedLocale !== undefined) {
    return normalizeExportLocale(requestedLocale)
  }

  const session = await ctx.db.get(sessionId)
  return normalizeExportLocale(session?.preferredLanguage)
}

export async function loadLocaleScopedExportArtifactRecord(
  ctx: Pick<QueryCtx, 'db'>,
  sessionId: Id<'sessions'>,
  target: ExportTarget,
  previewVersion: number,
  locale: string,
) {
  const normalizedLocale = normalizeExportLocale(locale)
  const scoped = await ctx.db
    .query('exportArtifacts')
    .withIndex('by_sessionId_target_previewVersion_locale', (index) =>
      index
        .eq('sessionId', sessionId)
        .eq('target', target)
        .eq('previewVersion', previewVersion)
        .eq('locale', normalizedLocale),
    )
    .first()

  if (scoped !== null || normalizedLocale !== 'en') return scoped

  const legacy = await loadExportArtifactRecord(
    ctx,
    sessionId,
    target,
    previewVersion,
  )
  return legacy?.locale === undefined ? legacy : null
}

/**
 * Record that a real pipeline stage just completed, deriving the display
 * label + percent from convex/lib/export_progress_stages.ts. Scoped by the
 * exact (sessionId, target, previewVersion, locale) of the build in flight,
 * so this can never touch a different build's row — including the
 * `willDeploy` deploy sub-stages, which fire after this exact row already
 * flipped from 'building' to 'ready' (recordExportArtifactReady runs before
 * the lakebed deploy step). A no-op only when the row is gone entirely.
 */
export async function updateExportArtifactBuildProgress(
  ctx: MutationCtx,
  args: {
    sessionId: Id<'sessions'>
    target: ExportTarget
    previewVersion: number
    locale?: string
    stageKey: string
    willDeploy: boolean
  },
) {
  const locale = await resolveExportArtifactLocale(
    ctx,
    args.sessionId,
    args.locale,
  )
  const existing = await loadLocaleScopedExportArtifactRecord(
    ctx,
    args.sessionId,
    args.target,
    args.previewVersion,
    locale,
  )
  if (existing === null) return
  if (existing.status !== 'building' && existing.status !== 'ready') return

  const { stage, percent } = progressForStage(args.stageKey, {
    willDeploy: args.willDeploy,
  })
  if (
    existing.progressPercent !== undefined &&
    percent < existing.progressPercent
  ) {
    return
  }
  const now = Date.now()
  const previousPercent = existing.progressPercent
  const percentAdvanced =
    previousPercent === undefined || percent > previousPercent
  const progressSampleCount =
    (existing.progressSampleCount ??
      (existing.progressPercent === undefined ? 0 : 1)) +
    (percentAdvanced ? 1 : 0)
  await ctx.db.patch(existing._id, {
    progressStage: stage,
    progressPercent: percent,
    progressUpdatedAt: now,
    progressSampleCount,
    updatedAt: now,
  })
}

export async function loadSessionExportTargets(
  ctx: QueryCtx,
  sessionId: Id<'sessions'>,
) {
  const session = await ctx.db.get(sessionId)
  const previewReady = session?.status === 'preview_ready'
  const currentPreviewVersion = session?.previewVersion
  const currentLocale = normalizeExportLocale(session?.preferredLanguage)
  const isAdmin = await isUserAdmin(ctx)

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
          : loadLocaleScopedExportArtifactRecord(
              ctx,
              sessionId,
              target,
              currentPreviewVersion,
              currentLocale,
            ),
      ])
      const isStale =
        record?.previewVersion !== undefined &&
        currentPreviewVersion !== undefined &&
        record.previewVersion !== currentPreviewVersion
      const paywallBypassed = areExportPaywallsDisabled() || isAdmin
      const ready = (record?.status === 'ready' || paywallBypassed) && !isStale
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
          : paywallBypassed && record?.status === 'payment_required'
            ? 'ready'
            : (record?.status ?? (previewReady ? 'available' : 'not_ready')),
        requiresPayment: paywallBypassed
          ? false
          : (record?.requiresPayment ?? false),
        fileCount: record?.fileCount ?? artifactPayload?.fileCount ?? null,
        previewVersion: record?.previewVersion ?? null,
        currentPreviewVersion: currentPreviewVersion ?? null,
        downloadUrl:
          ready && artifactPayload?.status === 'ready'
            ? (record?.downloadUrl ?? exportDownloadUrl(sessionId, target))
            : null,
        githubUrl: record?.githubUrl ?? record?.url ?? null,
        githubRepoUrl: record?.githubUrl ?? record?.url ?? null,
        deployedUrl: record?.deployedUrl ?? null,
        artifact: artifactPayload,
        artifactReady: artifactPayload?.status === 'ready',
        artifactStatus:
          artifactPayload?.status ?? (previewReady ? 'queued' : 'not_ready'),
        artifactError: artifactPayload?.errorMessage,
        artifactProgressStage: artifactPayload?.progressStage,
        artifactProgressPercent: artifactPayload?.progressPercent,
        artifactProgressStartedAt: artifactPayload?.progressStartedAt,
        artifactProgressUpdatedAt: artifactPayload?.progressUpdatedAt,
        artifactProgressSampleCount: artifactPayload?.progressSampleCount,
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

export async function queueSessionExportArtifactBuilds(
  ctx: Pick<MutationCtx, 'db' | 'scheduler'>,
  args: {
    sessionId: Id<'sessions'>
    previewVersion: number
    isPrivate: boolean
    now: number
    buildExportArtifact: ExportArtifactBuildReference
    delayMs?: number
    locale?: string
  },
) {
  const delayMs = args.delayMs ?? 0
  const locale = await resolveExportArtifactLocale(
    ctx,
    args.sessionId,
    args.locale,
  )

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
        locale,
        force: true,
      }),
    ),
  )
}

export async function queueSessionExportArtifactBuild(
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
    generatorRevision?: string
    locale?: string
  },
) {
  const generatorRevision = args.generatorRevision?.trim() || undefined
  const locale = await resolveExportArtifactLocale(
    ctx,
    args.sessionId,
    args.locale,
  )
  const existing = await loadLocaleScopedExportArtifactRecord(
    ctx,
    args.sessionId,
    args.target,
    args.previewVersion,
    locale,
  )

  if (
    existing?.status === 'ready' &&
    args.force !== true &&
    (generatorRevision === undefined ||
      existing.generatorRevision === generatorRevision)
  ) {
    return toArtifactPayload(existing)
  }

  existing === null
    ? await ctx.db.insert('exportArtifacts', {
        sessionId: args.sessionId,
        target: args.target,
        previewVersion: args.previewVersion,
        locale,
        status: 'queued',
        ...(generatorRevision === undefined ? {} : { generatorRevision }),
        progressStage: 'Queued',
        progressPercent: 0,
        progressStartedAt: args.now,
        progressUpdatedAt: args.now,
        progressSampleCount: 0,
        createdAt: args.now,
        updatedAt: args.now,
      })
    : await ctx.db.patch(existing._id, {
        status: 'queued',
        ...(generatorRevision === undefined ? {} : { generatorRevision }),
        errorMessage: undefined,
        progressStage: 'Queued',
        progressPercent: 0,
        progressStartedAt: args.now,
        progressUpdatedAt: args.now,
        progressSampleCount: 0,
        updatedAt: args.now,
      })

  const autoDeployPublic = args.target === 'lakebed' && args.isPrivate === false
  await ctx.scheduler.runAfter(args.delayMs ?? 0, args.buildExportArtifact, {
    sessionId: args.sessionId,
    target: args.target,
    previewVersion: args.previewVersion,
    ...(args.force === true || autoDeployPublic ? { autoDeployPublic } : {}),
    ...(generatorRevision === undefined ? {} : { generatorRevision }),
  })

  return {
    target: args.target,
    status: 'queued',
    previewVersion: args.previewVersion,
    ...(generatorRevision === undefined ? {} : { generatorRevision }),
    updatedAt: args.now,
  }
}

export async function markExportArtifactBuilding(
  ctx: MutationCtx,
  args: ExportArtifactBuildInput & {
    stallExportArtifactBuild?: ExportArtifactStalledReference
  },
) {
  const now = Date.now()
  const locale = await resolveExportArtifactLocale(
    ctx,
    args.sessionId,
    args.locale,
  )
  const existing = await loadLocaleScopedExportArtifactRecord(
    ctx,
    args.sessionId,
    args.target,
    args.previewVersion,
    locale,
  )

  if (existing?.status === 'ready') return toArtifactPayload(existing)

  const status = 'building'
  const startProgress = progressForStage('starting', {
    willDeploy: args.autoDeployPublic === true,
  })
  const patch = {
    sessionId: args.sessionId,
    target: args.target,
    previewVersion: args.previewVersion,
    locale,
    status,
    ...(args.generatorRevision === undefined
      ? {}
      : { generatorRevision: args.generatorRevision }),
    errorMessage: undefined,
    progressStage: startProgress.stage,
    progressPercent: startProgress.percent,
    progressStartedAt: now,
    progressUpdatedAt: now,
    progressSampleCount: 1,
    updatedAt: now,
  } satisfies Omit<
    Doc<'exportArtifacts'>,
    '_id' | '_creationTime' | 'createdAt'
  >

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

export async function recordExportArtifactStalled(
  ctx: MutationCtx,
  args: ExportArtifactStalledInput,
) {
  const locale =
    args.locale === undefined ? undefined : normalizeExportLocale(args.locale)
  const artifactAttempts =
    locale === undefined
      ? await ctx.db
          .query('exportArtifacts')
          .withIndex('by_sessionId_target_previewVersion', (index) =>
            index
              .eq('sessionId', args.sessionId)
              .eq('target', args.target)
              .eq('previewVersion', args.previewVersion),
          )
          .take(20)
      : []
  const existing =
    locale === undefined
      ? (artifactAttempts.find(
          (artifact) => artifact.updatedAt === args.buildStartedAt,
        ) ??
        artifactAttempts[0] ??
        null)
      : await loadLocaleScopedExportArtifactRecord(
          ctx,
          args.sessionId,
          args.target,
          args.previewVersion,
          locale,
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
    ...(locale === undefined ? {} : { locale }),
    errorMessage: stalledExportArtifactMessage,
  })
}

export async function recordExportArtifactReady(
  ctx: MutationCtx,
  args: ExportArtifactReadyInput,
) {
  const now = Date.now()
  const locale = await resolveExportArtifactLocale(
    ctx,
    args.sessionId,
    args.locale,
  )
  const existing = await loadLocaleScopedExportArtifactRecord(
    ctx,
    args.sessionId,
    args.target,
    args.previewVersion,
    locale,
  )
  const status = 'ready'
  const patch = {
    sessionId: args.sessionId,
    target: args.target,
    previewVersion: args.previewVersion,
    locale,
    status,
    storageId: args.storageId,
    filesStorageId: args.filesStorageId,
    filename: args.filename,
    contentType: args.contentType,
    fileCount: args.fileCount,
    byteLength: args.byteLength,
    hash: args.hash,
    ...(args.generatorRevision === undefined
      ? {}
      : { generatorRevision: args.generatorRevision }),
    errorMessage: undefined,
    updatedAt: now,
  } satisfies Omit<
    Doc<'exportArtifacts'>,
    '_id' | '_creationTime' | 'createdAt'
  >

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

export async function recordExportArtifactFailure(
  ctx: MutationCtx,
  args: ExportArtifactFailureInput,
) {
  const now = Date.now()
  const locale = await resolveExportArtifactLocale(
    ctx,
    args.sessionId,
    args.locale,
  )
  const existing = await loadLocaleScopedExportArtifactRecord(
    ctx,
    args.sessionId,
    args.target,
    args.previewVersion,
    locale,
  )
  const status = 'failed'
  const patch = {
    sessionId: args.sessionId,
    target: args.target,
    previewVersion: args.previewVersion,
    locale,
    status,
    ...(args.generatorRevision === undefined
      ? {}
      : { generatorRevision: args.generatorRevision }),
    errorMessage: args.errorMessage,
    updatedAt: now,
  } satisfies Omit<
    Doc<'exportArtifacts'>,
    '_id' | '_creationTime' | 'createdAt'
  >

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

export async function getExportEntitlement(
  ctx: Pick<MutationCtx, 'db'>,
  userId: string | undefined,
  sessionId: Id<'sessions'>,
  isAdmin = false,
): Promise<ExportEntitlement> {
  if (areExportPaywallsDisabled() || isAdmin) {
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

/**
 * Read-only entitlement check — mirrors `getExportEntitlement` but does NOT
 * consume credits. Used by lakebed deploy (and other non-download actions) to
 * gate access without spending a credit. Returns the same `ExportEntitlement`
 * shape so callers can reuse the same `payment_required` / `ready` branching.
 */
export async function checkExportEntitlementReadOnly(
  ctx: Pick<QueryCtx, 'db'>,
  userId: string | undefined,
  isAdmin = false,
): Promise<ExportEntitlement> {
  if (areExportPaywallsDisabled() || isAdmin) {
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
        'Sign in and subscribe to Pro or purchase download credits to deploy to Lakebed.',
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
    return {
      status: 'ready',
      requiresPayment: false,
      entitlement: 'credits',
      remainingCredits: credits.remaining,
    }
  }

  return {
    status: 'payment_required',
    requiresPayment: true,
    entitlement: 'payment_required',
    message:
      'Subscribe to Pro or purchase download credits to deploy to Lakebed.',
  }
}

export async function createSessionExport(
  ctx: MutationCtx,
  args: CreateSessionExportInput,
) {
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

  const isAdmin = await isUserAdmin(ctx)

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

  // A stale handoff/error preview must not block exporting: builders render
  // from the module source and only use preview HTML when it is usable.
  if (preview.html.trim().length === 0) {
    throw new ConvexError({
      code: 'PREVIEW_NOT_READY',
      message: 'Preview is not ready to export',
    })
  }

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
  const existingExportStatus = 'ready'
  const existingExportRequiresPayment = false
  const existingExportEntitlement = 'existing'
  const entitlement: ExportEntitlement = alreadyReadyForCurrentPreview
    ? {
        status: existingExportStatus,
        requiresPayment: existingExportRequiresPayment,
        entitlement: existingExportEntitlement,
      }
    : await getExportEntitlement(ctx, session.userId, args.sessionId, isAdmin)

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

export async function recordGitHubExportRepository(
  ctx: MutationCtx,
  args: RecordGitHubExportRepositoryInput,
) {
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

export async function ensureExportArtifactBuild(
  ctx: MutationCtx,
  args: EnsureExportArtifactBuildInput,
) {
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

  // A stale handoff/error preview must not block exporting: builders render
  // from the module source and only use preview HTML when it is usable.
  if (preview.html.trim().length === 0) {
    throw new ConvexError({
      code: 'PREVIEW_NOT_READY',
      message: 'Preview is not ready to export',
    })
  }

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
    generatorRevision: args.generatorRevision,
    locale: normalizeExportLocale(session.preferredLanguage),
  })
}

export async function prepareExportArtifactBuild(
  ctx: QueryCtx,
  args: ExportArtifactBuildInput,
) {
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

  const locale = normalizeExportLocale(session.preferredLanguage)
  if (
    args.locale !== undefined &&
    normalizeExportLocale(args.locale) !== locale
  ) {
    return null
  }

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
  const editedSource = applyEditsToSource(canonicalSource, edits, locale)
  const source = applyCachedTranslationsToSource(
    editedSource,
    await loadCachedTranslationsForSource(
      ctx,
      session.preferredLanguage,
      editedSource,
      args.sessionId,
    ),
  )

  // Only the module source gates the build — artifacts render from source,
  // so a stale handoff/error preview (e.g. stored by a skewed deploy) must
  // not permanently block re-export of an otherwise healthy session.
  if (isUnsafePublicPreviewHtml(source)) {
    throw new ConvexError({
      code: 'ARTIFACT_NOT_READY',
      message: 'Generated source is not ready to export',
    })
  }

  source.trim().length > 0 ||
    (() => {
      throw new ConvexError({
        code: 'ARTIFACT_NOT_READY',
        message: 'Generated source is not ready to export',
      })
    })()

  const siteSpecJson =
    preview.siteSpecJson ?? siteSpec?.specJson ?? siteSpec?.spec
  const themeName = readAppliedThemeName(session)
  const isDark = readAppliedIsDark(session)
  const html = isHtmlDocumentSource(source) ? source : ''
  const previewHtml = isUnsafePublicPreviewHtml(preview.html)
    ? undefined
    : preview.html
  const prepared = {
    sessionId: args.sessionId,
    prompt: session.prompt,
    target: args.target,
    previewVersion: preview.version,
    source,
    html,
    ...(siteSpecJson === undefined ? {} : { siteSpecJson }),
    ...(previewHtml === undefined ? {} : { previewHtml }),
    ...(themeName === undefined ? {} : { themeName }),
    isDark,
    locale,
    selectedBrandLogo: session.selectedBrandLogo ?? null,
    isPrivate: session.isPrivate === true,
    includeBadge: await resolveDeploymentBadgeEntitlement(ctx, session.userId),
  }

  return prepared
}

export async function loadOwnedExportBuildInput(
  ctx: QueryCtx,
  args: OwnedExportDownloadInput,
) {
  const session = await ctx.db.get(args.sessionId)

  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  const isAdmin = await isUserAdmin(ctx)
  if (!areExportPaywallsDisabled() && !isAdmin) {
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

export async function loadOwnedExportArtifactDownload(
  ctx: QueryCtx,
  args: OwnedExportDownloadInput,
) {
  const session = await ctx.db.get(args.sessionId)

  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  const isAdmin = await isUserAdmin(ctx)
  if (!areExportPaywallsDisabled() && !isAdmin) {
    await assertCanReadOwnedSession(ctx, session, args.anonymousOwnerSecret)
  }

  const exportRecord = await ctx.db
    .query('exports')
    .withIndex('by_sessionId_target', (index) =>
      index.eq('sessionId', args.sessionId).eq('target', args.target),
    )
    .first()

  if (exportRecord === null) return null

  const exportPayload = toExportPayload(exportRecord, isAdmin)
  const latestPreview = await ctx.db
    .query('previews')
    .withIndex('by_sessionId_version', (index) =>
      index.eq('sessionId', args.sessionId),
    )
    .order('desc')
    .first()
  const latestPreviewVersion = latestPreview?.version

  const locale = normalizeExportLocale(session.preferredLanguage)
  const artifact =
    latestPreviewVersion === undefined
      ? null
      : await loadLocaleScopedExportArtifactRecord(
          ctx,
          args.sessionId,
          args.target,
          latestPreviewVersion,
          locale,
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

export async function loadOwnedExportForGitHubPush(
  ctx: QueryCtx,
  args: OwnedExportForGitHubPushInput,
) {
  if (!isAuthDisabled()) {
    const userId = await getUserId(ctx)

    userId !== undefined ||
      (() => {
        throw new ConvexError({
          code: 'AUTH_REQUIRED',
          message: 'Sign in before pushing to GitHub.',
        })
      })()
  }

  const session = await ctx.db.get(args.sessionId)
  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  const isAdmin = await isUserAdmin(ctx)
  if (!areExportPaywallsDisabled() && !isAdmin) {
    await assertCanReadOwnedSession(ctx, session, args.anonymousOwnerSecret)
  }

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

  const exportPayload = toExportPayload(exportRecord, isAdmin)

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
  const edits = await ctx.db
    .query('edits')
    .withIndex('by_sessionId_createdAt', (index) =>
      index.eq('sessionId', args.sessionId),
    )
    .collect()
  const locale = normalizeExportLocale(session.preferredLanguage)
  const editedSource = applyEditsToSource(
    resolveExportOpenUISource(preview, homeModule, siteSpec),
    edits,
    locale,
  )
  const source = applyCachedTranslationsToSource(
    editedSource,
    await loadCachedTranslationsForSource(
      ctx,
      session.preferredLanguage,
      editedSource,
      args.sessionId,
    ),
  )
  // Only the module source gates the build — artifacts render from source,
  // so a stale handoff/error preview (e.g. stored by a skewed deploy) must
  // not permanently block re-export of an otherwise healthy session.
  if (isUnsafePublicPreviewHtml(source)) {
    throw new ConvexError({
      code: 'ARTIFACT_NOT_READY',
      message: 'Generated source is not ready to export',
    })
  }
  const themeName = readAppliedThemeName(session)
  const isDark = readAppliedIsDark(session)
  const html = isHtmlDocumentSource(source) ? source : ''

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

  const artifact = await loadLocaleScopedExportArtifactRecord(
    ctx,
    args.sessionId,
    args.target,
    preview.version,
    locale,
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
    html,
    source,
    siteSpecJson: preview.siteSpecJson ?? siteSpec?.specJson ?? siteSpec?.spec,
    previewHtml: html,
    themeName,
    isDark,
    locale,
    selectedBrandLogo: session.selectedBrandLogo ?? null,
    includeBadge: exportRecord.requiresPayment !== false,
    artifact: toArtifactPayload(artifact),
    filesUrl,
  }
}
