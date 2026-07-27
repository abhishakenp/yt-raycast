import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { isUnsafePublicPreviewHtml } from './openui_error_html'
import {
  assertCanMutateSession,
  assertCanReadOwnedSession,
  isSessionOwner,
  isUserAdmin,
} from './session_access_helpers'
import {
  applyEditsToSource,
  checkExportEntitlementReadOnly,
  exportDownloadUrl,
  exportGeneratorRevision,
  exportTargetFileCount,
  isAuthDisabled,
  loadLocaleScopedExportArtifactRecord,
  queueSessionExportArtifactBuild,
  type ExportArtifactBuildReference,
} from './session_export_helpers'
// isSessionOwner, isAuthDisabled, isUserAdmin are used in loadLakebedDeploymentEntitlement below.
import { resolveDeploymentBadgeEntitlement } from './deployment_badge_helpers'
import {
  applyCachedTranslationsToSource,
  loadCachedTranslationsForSource,
} from './session_translation_cache_helpers'

type DeploymentReadCtx = Pick<QueryCtx, 'db'>

export type PublishSessionPreviewInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  requestedSlug?: string
  buildExportArtifact?: ExportArtifactBuildReference
}

export type LakebedDeploymentSuccessInput = {
  sessionId: Id<'sessions'>
  requestedSlug?: string
  previewVersion: number
  url: string
  deployId: string
  claimUrl?: string
  artifactHash: string
  clientBundleHash: string
  clientBundleBytes: number
  requestBodyBytes: number
  serverBundleBytes: number
  sourceFileCount: number
  expiresAt?: string
  inspectPolicy?: string
}

export type LakebedDeploymentFailureInput = {
  sessionId: Id<'sessions'>
  requestedSlug?: string
  errorMessage: string
}

export type LakebedPreparedSourceKind = 'html' | 'openui'

function requireNonBlank(value: string | undefined, field: string): string {
  if (value === undefined || !value.trim()) {
    throw new ConvexError({
      code: 'INVALID_LAKEBED_DEPLOYMENT',
      message: `${field} must not be blank`,
    })
  }
  return value.trim()
}

function requireWebUrl(value: string | undefined, field: string): void {
  const normalized = requireNonBlank(value, field)
  try {
    const parsed = new URL(normalized)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error('unsupported protocol')
    }
  } catch {
    throw new ConvexError({
      code: 'INVALID_LAKEBED_DEPLOYMENT',
      message: `${field} must be a valid web URL`,
    })
  }
}

function requireMeasurement(value: number, field: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new ConvexError({
      code: 'INVALID_LAKEBED_DEPLOYMENT',
      message: `${field} must be a non-negative whole number`,
    })
  }
}

function validateLakebedDeploymentSuccess(
  args: LakebedDeploymentSuccessInput,
): void {
  requireWebUrl(args.url, 'url')
  requireNonBlank(args.deployId, 'deployId')
  if (args.claimUrl !== undefined) requireWebUrl(args.claimUrl, 'claimUrl')
  requireNonBlank(args.artifactHash, 'artifactHash')
  requireNonBlank(args.clientBundleHash, 'clientBundleHash')
  requireMeasurement(args.previewVersion, 'previewVersion')
  requireMeasurement(args.clientBundleBytes, 'clientBundleBytes')
  requireMeasurement(args.requestBodyBytes, 'requestBodyBytes')
  requireMeasurement(args.serverBundleBytes, 'serverBundleBytes')
  requireMeasurement(args.sourceFileCount, 'sourceFileCount')
}

function readyStatus(): 'ready' {
  return 'ready'
}

function failedStatus(): 'failed' {
  return 'failed'
}

function noneStatus(): 'none' {
  return 'none'
}

function updatingStatus(): 'updating' {
  return 'updating'
}

function skippedStatus(): 'skipped' {
  return 'skipped'
}

function lakebedProvider(): 'lakebed' {
  return 'lakebed'
}

function isUnknownRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function normalizeDeploymentSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 63)
}

export function createDefaultDeploymentSlug(
  prompt: string,
  sessionId: string,
): string {
  const fromPrompt = normalizeDeploymentSlug(prompt)
    .split('-')
    .slice(0, 4)
    .join('-')
  const fallback = normalizeDeploymentSlug(sessionId).slice(0, 20)

  return fromPrompt || fallback || 'generated-site'
}

export async function reserveDefaultDeploymentSlug(
  ctx: MutationCtx,
  prompt: string,
  sessionId: Id<'sessions'>,
): Promise<string> {
  const baseSlug = createDefaultDeploymentSlug(prompt, sessionId)
  let finalSlug = baseSlug
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    const existing = await ctx.db
      .query('sessions')
      .withIndex('by_deploymentSlug', (index) =>
        index.eq('deploymentSlug', finalSlug),
      )
      .first()

    if (
      !existing ||
      existing._id === sessionId ||
      existing.deletedAt !== undefined
    )
      break

    const randomSuffix = Math.random().toString(16).slice(2, 6)
    finalSlug = `${baseSlug}-${randomSuffix}`
    attempts++
  }

  await ctx.db.patch(sessionId, {
    deploymentSlug: finalSlug,
    updatedAt: Date.now(),
  })
  return finalSlug
}

export function createDeploymentUrl(slug: string): string {
  const baseDomain = (
    process.env.DEPLOYMENT_BASE_DOMAIN ?? 'ship-fast.ai'
  ).trim()
  return `https://${slug}.${baseDomain}`
}

function readLakebedThemeName(
  siteSpecJson: string | undefined,
  fallback: unknown,
): string | undefined {
  if (typeof fallback === 'string' && fallback.trim().length > 0) {
    return fallback
  }
  if (siteSpecJson === undefined) return undefined
  try {
    const parsed: unknown = JSON.parse(siteSpecJson)
    if (!isUnknownRecord(parsed)) return undefined
    const theme = parsed.themeName ?? parsed.genuiTheme ?? parsed.theme
    return typeof theme === 'string' && theme.trim().length > 0
      ? theme
      : undefined
  } catch {
    return undefined
  }
}

function readLakebedIsDark(session: { themeMode?: unknown }): boolean {
  return session.themeMode !== 'light'
}

function readOpenUiSourceFromSiteSpec(
  siteSpec: { specJson?: string; spec?: string } | null,
): string | undefined {
  const candidates = [siteSpec?.specJson, siteSpec?.spec]
  for (const candidate of candidates) {
    if (typeof candidate !== 'string' || !candidate.trim()) continue
    try {
      const parsed: unknown = JSON.parse(candidate)
      if (isUnknownRecord(parsed) && isUnknownRecord(parsed.pages)) {
        const home = parsed.pages.home
        if (typeof home === 'string' && isLikelyOpenUiSource(home)) return home
      }
    } catch {
      if (isLikelyOpenUiSource(candidate)) return candidate
    }
  }
  return undefined
}

function isLikelyOpenUiSource(source: string | undefined): source is string {
  const trimmed = source?.trim()
  if (!trimmed) return false
  if (/^<!doctype\s+html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)) {
    return false
  }
  return /(?:^|\n)\s*root\s*=/.test(trimmed)
}

function containsOpenUiErrorMarker(html: string | undefined): boolean {
  return (
    typeof html === 'string' &&
    (/class=["'][^"']*\bopenui-error\b/i.test(html) ||
      /Failed to render:/i.test(html))
  )
}

function lakebedDeploymentMetadata(deployment: {
  provider?: 'ship-fast' | 'lakebed'
  lakebedDeployId?: string
  lakebedClaimUrl?: string
  lakebedArtifactHash?: string
  lakebedClientBundleHash?: string
  lakebedClientBundleBytes?: number
  lakebedRequestBodyBytes?: number
  lakebedServerBundleBytes?: number
  lakebedSourceFileCount?: number
  lakebedExpiresAt?: string
  lakebedInspectPolicy?: string
  errorMessage?: string
}) {
  return deployment.provider === 'lakebed'
    ? {
        provider: deployment.provider,
        lakebedDeployId: deployment.lakebedDeployId,
        lakebedClaimUrl: deployment.lakebedClaimUrl,
        lakebedArtifactHash: deployment.lakebedArtifactHash,
        lakebedClientBundleHash: deployment.lakebedClientBundleHash,
        lakebedClientBundleBytes: deployment.lakebedClientBundleBytes,
        lakebedRequestBodyBytes: deployment.lakebedRequestBodyBytes,
        lakebedServerBundleBytes: deployment.lakebedServerBundleBytes,
        lakebedSourceFileCount: deployment.lakebedSourceFileCount,
        lakebedExpiresAt: deployment.lakebedExpiresAt,
        lakebedInspectPolicy: deployment.lakebedInspectPolicy,
        errorMessage: deployment.errorMessage,
      }
    : deployment.provider === undefined
      ? {}
      : { provider: deployment.provider, errorMessage: deployment.errorMessage }
}

export async function loadLakebedDeploymentUpdateTarget(
  ctx: DeploymentReadCtx,
  sessionId: Id<'sessions'>,
) {
  const deployment = await ctx.db
    .query('deployments')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
    .first()

  if (
    deployment?.provider !== 'lakebed' ||
    !deployment.lakebedDeployId ||
    !deployment.lakebedClaimUrl
  ) {
    return null
  }

  return {
    deployId: deployment.lakebedDeployId,
    claimUrl: deployment.lakebedClaimUrl,
    url: deployment.url,
  }
}

export async function loadDeploymentBySlug(
  ctx: DeploymentReadCtx,
  slug: string,
) {
  const deployment = await ctx.db
    .query('deployments')
    .withIndex('by_slug', (index) => index.eq('slug', slug))
    .first()

  if (deployment === null) return null

  const session = await ctx.db.get(deployment.sessionId)
  if (session === null || session.deletedAt !== undefined) return null

  const includeBadge = await resolveDeploymentBadgeEntitlement(
    ctx,
    session.userId,
  )

  return {
    slug: deployment.slug,
    url: deployment.url,
    status: deployment.status,
    previewVersion: deployment.previewVersion,
    sessionId: deployment.sessionId,
    includeBadge,
    ...lakebedDeploymentMetadata(deployment),
    session: {
      id: session._id,
      prompt: session.prompt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt ?? session.createdAt,
      status: session.status ?? null,
    },
  }
}

export async function loadDeploymentHtmlArtifactBySlug(
  ctx: QueryCtx,
  slug: string,
) {
  const deployment = await ctx.db
    .query('deployments')
    .withIndex('by_slug', (index) => index.eq('slug', slug))
    .first()

  if (deployment === null || deployment.status !== 'ready') return null

  const session = await ctx.db.get(deployment.sessionId)
  if (session === null || session.deletedAt !== undefined) return null

  const previewVersion = deployment.previewVersion
  if (typeof previewVersion !== 'number') return null

  const locale = session.preferredLanguage?.trim().toLowerCase() || 'en'
  const artifact = await loadLocaleScopedExportArtifactRecord(
    ctx,
    deployment.sessionId,
    'html',
    previewVersion,
    locale,
  )

  const expectedRevision = exportGeneratorRevision('html')
  const revisionIsCurrent = artifact?.generatorRevision === expectedRevision

  const storageUrl =
    artifact?.status === 'ready' &&
    revisionIsCurrent &&
    artifact.storageId !== undefined
      ? await ctx.storage.getUrl(artifact.storageId)
      : null

  return {
    slug: deployment.slug,
    url: deployment.url,
    status: deployment.status,
    previewVersion,
    sessionId: deployment.sessionId,
    artifact:
      artifact === null
        ? null
        : {
            status: revisionIsCurrent ? artifact.status : 'stale',
            generatorRevision: artifact.generatorRevision,
            errorMessage: artifact.errorMessage,
            contentType: artifact.contentType,
            storageUrl,
          },
  }
}

export async function loadDeploymentStatus(
  ctx: DeploymentReadCtx,
  sessionId: Id<'sessions'>,
) {
  const deployment = await ctx.db
    .query('deployments')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
    .first()

  return deployment === null
    ? null
    : {
        slug: deployment.slug,
        url: deployment.url,
        // The shipfast subdomain URL is always derivable from the slug via
        // DEPLOYMENT_BASE_DOMAIN, regardless of which provider the latest
        // deploy used. The `url` field above reflects the latest provider
        // (which may be a lakebed URL), so we expose `shipfastUrl` separately
        // for surfaces that must always show the shipfast subdomain (e.g. the
        // dashboard URL pill).
        shipfastUrl: createDeploymentUrl(deployment.slug),
        status: deployment.status,
        previewVersion: deployment.previewVersion,
        pendingPreviewVersion: deployment.pendingPreviewVersion,
        createdAt: deployment.createdAt,
        updatedAt: deployment.updatedAt,
        ...lakebedDeploymentMetadata(deployment),
      }
}

/**
 * Server-side payment gate for lakebed deploys — mirrors the export
 * entitlement check but is read-only (does NOT consume credits). Throws a
 * `PAYMENT_REQUIRED` ConvexError when the caller is not entitled, so the
 * deploy action never starts and no compute is wasted building/deploying.
 */
export async function assertLakebedDeploymentEntitlement(
  ctx: Pick<QueryCtx, 'db' | 'auth'>,
  session: Doc<'sessions'>,
) {
  const isAdmin = await isUserAdmin(ctx)
  const userId = session.userId ?? undefined
  const entitlement = await checkExportEntitlementReadOnly(ctx, userId, isAdmin)
  if (entitlement.requiresPayment) {
    throw new ConvexError({
      code: 'PAYMENT_REQUIRED',
      message:
        entitlement.message ??
        'Subscribe to Pro or purchase download credits to deploy to Lakebed.',
    })
  }
}

/**
 * Read-only entitlement status for lakebed deploy — returns whether the
 * caller is entitled without throwing. Used by the DeploymentPanel to show
 * a lock icon (like the ExportPanel) instead of attempting the deploy.
 *
 * Non-owners receive a locked default (`requiresPayment: true`) instead of
 * a `FORBIDDEN` error. This query runs unconditionally when the deployment
 * popover opens, and the positional `useQuery` re-throws server errors to
 * the nearest error boundary — there is none around `DeploymentPanel`, so a
 * thrown error would crash the entire side rail. Returning a locked default
 * keeps the panel rendering and only locks the Lakebed button, matching the
 * sibling queries (`getExportTargets` / `getDeploymentStatusByLookup`) which
 * also return safe defaults for non-readable sessions.
 */
export async function loadLakebedDeploymentEntitlement(
  ctx: QueryCtx,
  args: PublishSessionPreviewInput,
) {
  const session = await ctx.db.get(args.sessionId)
  if (session === null) {
    throw new ConvexError({
      code: 'NOT_FOUND',
      message: 'Session not found',
    })
  }
  const canReadOwned =
    isAuthDisabled() ||
    (await isUserAdmin(ctx)) ||
    (await isSessionOwner(ctx, session, args.anonymousOwnerSecret))
  if (!canReadOwned) {
    return {
      requiresPayment: true,
      entitlement: 'payment_required',
      message: undefined,
    }
  }
  const isAdmin = await isUserAdmin(ctx)
  const userId = session.userId ?? undefined
  const entitlement = await checkExportEntitlementReadOnly(ctx, userId, isAdmin)
  return {
    requiresPayment: entitlement.requiresPayment,
    entitlement: entitlement.entitlement,
    message: entitlement.requiresPayment ? entitlement.message : undefined,
  }
}

export async function loadOwnedLakebedDeploymentArtifact(
  ctx: QueryCtx,
  args: PublishSessionPreviewInput,
) {
  const session = await ctx.db.get(args.sessionId)

  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  await assertCanReadOwnedSession(ctx, session, args.anonymousOwnerSecret)

  const locale = session.preferredLanguage?.trim().toLowerCase() || 'en'
  const scopedArtifact = await ctx.db
    .query('exportArtifacts')
    .withIndex('by_sessionId_target_previewVersion_locale', (index) =>
      index
        .eq('sessionId', args.sessionId)
        .eq('target', 'lakebed')
        .eq('previewVersion', session.previewVersion ?? 0)
        .eq('locale', locale),
    )
    .first()
  const legacyArtifact =
    scopedArtifact === null && locale === 'en'
      ? await ctx.db
          .query('exportArtifacts')
          .withIndex('by_sessionId_target_previewVersion', (index) =>
            index
              .eq('sessionId', args.sessionId)
              .eq('target', 'lakebed')
              .eq('previewVersion', session.previewVersion ?? 0),
          )
          .first()
      : null
  const artifact =
    scopedArtifact ??
    (legacyArtifact?.locale === undefined ? legacyArtifact : null)
  const artifactIsCurrent =
    artifact?.generatorRevision === exportGeneratorRevision('lakebed')
  const filesUrl =
    artifactIsCurrent &&
    artifact.status === 'ready' &&
    artifact.filesStorageId !== undefined
      ? await ctx.storage.getUrl(artifact.filesStorageId)
      : null

  return {
    sessionId: args.sessionId,
    prompt: session.prompt,
    previewVersion: session.previewVersion ?? 0,
    status: artifactIsCurrent ? artifact.status : 'queued',
    filesUrl,
    isPrivate: session.isPrivate,
  }
}

export async function prepareLakebedSessionDeployment(
  ctx: QueryCtx,
  args: PublishSessionPreviewInput,
) {
  console.log(
    '[lakebed_deploy:prepare] start',
    JSON.stringify({ sessionId: args.sessionId }),
  )
  const session = await ctx.db.get(args.sessionId)
  console.log(
    '[lakebed_deploy:prepare] session:loaded',
    JSON.stringify({
      sessionId: args.sessionId,
      found: session !== null,
      status: session?.status,
    }),
  )

  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  await assertCanReadOwnedSession(ctx, session, args.anonymousOwnerSecret)

  session.status === 'preview_ready' ||
    (() => {
      throw new ConvexError({
        code: 'PREVIEW_NOT_READY',
        message: 'Preview is not ready to publish',
      })
    })()

  const [preview, homeModule, siteSpec, edits] = await Promise.all([
    ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .order('desc')
      .first(),
    ctx.db
      .query('generatedModules')
      .withIndex('by_sessionId_moduleKey', (index) =>
        index.eq('sessionId', args.sessionId).eq('moduleKey', 'home'),
      )
      .first(),
    ctx.db
      .query('siteSpecs')
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .first(),
    ctx.db
      .query('edits')
      .withIndex('by_sessionId_createdAt', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .collect(),
  ])
  console.log(
    '[lakebed_deploy:prepare] artifacts:loaded',
    JSON.stringify({
      sessionId: args.sessionId,
      hasPreview: preview !== null,
      hasHomeModule: Boolean(homeModule?.source.trim().length),
      previewVersion: preview?.version,
    }),
  )

  preview !== null ||
    (() => {
      throw new ConvexError({
        code: 'PREVIEW_NOT_READY',
        message: 'Preview is not ready to publish',
      })
    })()

  const previewOpenUiSource =
    typeof preview.openUiSource === 'string' && preview.openUiSource.trim()
      ? preview.openUiSource
      : undefined
  const homeModuleOpenUiSource = isLikelyOpenUiSource(homeModule?.source)
    ? homeModule.source
    : undefined
  const siteSpecOpenUiSource = readOpenUiSourceFromSiteSpec(siteSpec)
  const previewHasOpenUiError = containsOpenUiErrorMarker(
    previewOpenUiSource ?? '',
  )
  const openUiSource =
    previewOpenUiSource ??
    siteSpecOpenUiSource ??
    homeModuleOpenUiSource ??
    homeModule?.source
  const shouldUseOpenUiSource =
    previewOpenUiSource !== undefined ||
    homeModuleOpenUiSource !== undefined ||
    siteSpecOpenUiSource !== undefined ||
    session.openuiReady === true ||
    session.preferredExportTarget !== 'html'
  if (!shouldUseOpenUiSource) {
    throw new ConvexError({
      code: 'FULLSTACK_SOURCE_NOT_READY',
      message:
        'Lakebed deploys require generated fullstack source. Regenerate this site before publishing to Lakebed.',
    })
  }
  if (typeof openUiSource !== 'string' || !openUiSource.trim()) {
    throw new ConvexError({
      code: 'ARTIFACT_NOT_READY',
      message: 'Generated source is not ready to deploy',
    })
  }
  const sourceKind: LakebedPreparedSourceKind = 'openui'
  const editedSource = applyEditsToSource(
    openUiSource,
    edits,
    session.preferredLanguage,
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
  const siteSpecJson =
    preview.siteSpecJson ?? siteSpec?.specJson ?? siteSpec?.spec

  console.log(
    '[lakebed_deploy:prepare] return',
    JSON.stringify({
      sessionId: args.sessionId,
      sourceBytes: source.length,
      sourceKind,
      hasPreviewOpenUiSource: previewOpenUiSource !== undefined,
      hasHomeModuleOpenUiSource: homeModuleOpenUiSource !== undefined,
      previewHasOpenUiError,
      previewVersion: preview.version,
    }),
  )

  const includeBadge = await resolveDeploymentBadgeEntitlement(
    ctx,
    session.userId,
  )

  return {
    sessionId: args.sessionId,
    prompt: session.prompt,
    source,
    sourceKind,
    siteSpecJson,
    previewVersion: preview.version,
    projectName: session.prompt,
    themeName: readLakebedThemeName(
      siteSpecJson,
      session.themeOverride ?? session.genuiTheme,
    ),
    isDark: readLakebedIsDark(session),
    locale: session.preferredLanguage || 'en',
    includeBadge,
    selectedBrandLogo: session.selectedBrandLogo ?? null,
  }
}

async function deploymentSlugForRecord(
  ctx: Pick<MutationCtx, 'db'>,
  sessionId: Id<'sessions'>,
  session: { prompt: string; deploymentSlug?: string },
  requestedSlug?: string,
) {
  const existingDeployment = await ctx.db
    .query('deployments')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
    .first()
  const reservedSlug =
    typeof session.deploymentSlug === 'string' && session.deploymentSlug.trim()
      ? normalizeDeploymentSlug(session.deploymentSlug)
      : undefined
  const slug =
    existingDeployment !== null && requestedSlug === undefined
      ? existingDeployment.slug
      : normalizeDeploymentSlug(
          requestedSlug ??
            reservedSlug ??
            createDefaultDeploymentSlug(session.prompt, sessionId),
        )

  slug.length > 0 ||
    (() => {
      throw new ConvexError({
        code: 'INVALID_SLUG',
        message: 'Deployment slug is required',
      })
    })()

  const existingBySlug = await ctx.db
    .query('deployments')
    .withIndex('by_slug', (index) => index.eq('slug', slug))
    .first()

  existingBySlug === null ||
    existingBySlug.sessionId === sessionId ||
    (() => {
      throw new ConvexError({
        code: 'SLUG_TAKEN',
        message: 'Deployment slug is already taken',
      })
    })()

  return { existingDeployment, slug }
}

export async function recordLakebedSessionDeploymentSuccess(
  ctx: MutationCtx,
  args: LakebedDeploymentSuccessInput,
) {
  validateLakebedDeploymentSuccess(args)
  const session = await ctx.db.get(args.sessionId)
  const now = Date.now()

  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  const { existingDeployment, slug } = await deploymentSlugForRecord(
    ctx,
    args.sessionId,
    session,
    args.requestedSlug,
  )
  if (existingDeployment !== null) {
    const persistedVersion = existingDeployment.previewVersion ?? -1
    const pendingVersion = existingDeployment.pendingPreviewVersion ?? -1
    const newestVersion = Math.max(persistedVersion, pendingVersion)
    const isStaleCompletion = args.previewVersion < newestVersion
    const isReadyReplay =
      existingDeployment.status === 'ready' &&
      args.previewVersion <= persistedVersion

    // Only short-circuit when the existing deployment is also lakebed — a
    // ship-fast deployment must not block recording a new lakebed deploy.
    if (
      existingDeployment.provider === 'lakebed' &&
      (isStaleCompletion || isReadyReplay)
    ) {
      return {
        sessionId: args.sessionId,
        slug: existingDeployment.slug,
        url: existingDeployment.url,
        status: existingDeployment.status,
        provider: existingDeployment.provider,
        deployId: existingDeployment.lakebedDeployId ?? args.deployId,
      }
    }
  }
  const stableUrl =
    existingDeployment?.provider === 'lakebed' && existingDeployment.url
      ? existingDeployment.url
      : args.url

  const deploymentPatch = {
    sessionId: args.sessionId,
    slug,
    url: stableUrl,
    status: readyStatus(),
    provider: lakebedProvider(),
    previewVersion: args.previewVersion,
    pendingPreviewVersion: undefined,
    lakebedDeployId: args.deployId,
    lakebedClaimUrl: args.claimUrl,
    lakebedArtifactHash: args.artifactHash,
    lakebedClientBundleHash: args.clientBundleHash,
    lakebedClientBundleBytes: args.clientBundleBytes,
    lakebedRequestBodyBytes: args.requestBodyBytes,
    lakebedServerBundleBytes: args.serverBundleBytes,
    lakebedSourceFileCount: args.sourceFileCount,
    lakebedExpiresAt: args.expiresAt,
    lakebedInspectPolicy: args.inspectPolicy,
    errorMessage: undefined,
    updatedAt: now,
  }

  existingDeployment === null
    ? await ctx.db.insert('deployments', {
        ...deploymentPatch,
        createdAt: now,
      })
    : await ctx.db.patch(existingDeployment._id, deploymentPatch)

  const exportRecord = await ctx.db
    .query('exports')
    .withIndex('by_sessionId_target', (index) =>
      index.eq('sessionId', args.sessionId).eq('target', 'lakebed'),
    )
    .first()
  const exportPatch = {
    previewVersion: args.previewVersion,
    downloadUrl: exportDownloadUrl(args.sessionId, 'lakebed'),
    deployedUrl: stableUrl,
    fileCount: exportTargetFileCount('lakebed'),
    errorMessage: undefined,
    updatedAt: now,
  }

  exportRecord === null
    ? await ctx.db.insert('exports', {
        sessionId: args.sessionId,
        target: 'lakebed',
        status: 'ready',
        requiresPayment: false,
        ...exportPatch,
        createdAt: now,
      })
    : await ctx.db.patch(exportRecord._id, exportPatch)

  if (session.isPrivate) {
    await ctx.db.patch(args.sessionId, {
      isPrivate: false,
      updatedAt: now,
    })
  }

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'published',
    message: `Published Lakebed app to ${stableUrl}`,
    previewVersion: args.previewVersion,
    createdAt: now,
  })

  return {
    sessionId: args.sessionId,
    slug,
    url: stableUrl,
    status: readyStatus(),
    provider: lakebedProvider(),
    deployId: args.deployId,
  }
}

export async function recordLakebedSessionDeploymentFailure(
  ctx: MutationCtx,
  args: LakebedDeploymentFailureInput,
) {
  requireNonBlank(args.errorMessage, 'errorMessage')
  const session = await ctx.db.get(args.sessionId)
  const now = Date.now()

  if (session === null) return null

  const { existingDeployment, slug } = await deploymentSlugForRecord(
    ctx,
    args.sessionId,
    session,
    args.requestedSlug,
  )
  const url = existingDeployment?.url ?? createDeploymentUrl(slug)

  if (
    existingDeployment?.status === 'ready' &&
    existingDeployment.pendingPreviewVersion === undefined
  ) {
    return {
      sessionId: args.sessionId,
      slug: existingDeployment.slug,
      status: readyStatus(),
    }
  }
  if (
    existingDeployment?.status === 'failed' &&
    existingDeployment.errorMessage === args.errorMessage
  ) {
    return { sessionId: args.sessionId, slug, status: failedStatus() }
  }

  existingDeployment === null
    ? await ctx.db.insert('deployments', {
        sessionId: args.sessionId,
        slug,
        url,
        status: 'failed',
        provider: 'lakebed',
        pendingPreviewVersion: undefined,
        errorMessage: args.errorMessage,
        createdAt: now,
        updatedAt: now,
      })
    : await ctx.db.patch(existingDeployment._id, {
        slug,
        status: 'failed',
        provider: 'lakebed',
        pendingPreviewVersion: undefined,
        errorMessage: args.errorMessage,
        updatedAt: now,
      })

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'publish_failed',
    message: `Lakebed deploy failed: ${args.errorMessage}`,
    createdAt: now,
  })

  return { sessionId: args.sessionId, slug, status: failedStatus() }
}

export async function publishSessionPreview(
  ctx: MutationCtx,
  args: PublishSessionPreviewInput,
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

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'log',
    message: 'Persisting generated homepage',
    createdAt: now,
  })

  session.status === 'preview_ready' ||
    (() => {
      throw new ConvexError({
        code: 'PREVIEW_NOT_READY',
        message: 'Preview is not ready to publish',
      })
    })()

  const [preview, homeModule, existingDeployment] = await Promise.all([
    ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .order('desc')
      .first(),
    ctx.db
      .query('generatedModules')
      .withIndex('by_sessionId_moduleKey', (index) =>
        index.eq('sessionId', args.sessionId).eq('moduleKey', 'home'),
      )
      .first(),
    ctx.db
      .query('deployments')
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .first(),
  ])

  preview !== null ||
    (() => {
      throw new ConvexError({
        code: 'PREVIEW_NOT_READY',
        message: 'Preview is not ready to publish',
      })
    })()

  const hasRenderableSource =
    (preview.openUiSource ?? '').trim().length > 0 ||
    (homeModule?.source ?? '').trim().length > 0
  if (!hasRenderableSource || isUnsafePublicPreviewHtml(preview.openUiSource)) {
    throw new ConvexError({
      code: 'PREVIEW_NOT_READY',
      message: 'Preview is not ready to publish',
    })
  }

  const reservedSlug =
    typeof session.deploymentSlug === 'string' && session.deploymentSlug.trim()
      ? normalizeDeploymentSlug(session.deploymentSlug)
      : undefined
  const slug =
    existingDeployment !== null && args.requestedSlug === undefined
      ? existingDeployment.slug
      : normalizeDeploymentSlug(
          args.requestedSlug ??
            reservedSlug ??
            createDefaultDeploymentSlug(session.prompt, args.sessionId),
        )

  slug.length > 0 ||
    (() => {
      throw new ConvexError({
        code: 'INVALID_SLUG',
        message: 'Deployment slug is required',
      })
    })()

  const existingBySlug = await ctx.db
    .query('deployments')
    .withIndex('by_slug', (index) => index.eq('slug', slug))
    .first()

  existingBySlug === null ||
    existingBySlug.sessionId === args.sessionId ||
    (() => {
      throw new ConvexError({
        code: 'SLUG_TAKEN',
        message: 'Deployment slug is already taken',
      })
    })()

  const url = createDeploymentUrl(slug)

  existingDeployment === null
    ? await ctx.db.insert('deployments', {
        sessionId: args.sessionId,
        slug,
        url,
        status: 'ready',
        provider: 'ship-fast',
        previewVersion: preview.version,
        pendingPreviewVersion: undefined,
        createdAt: now,
        updatedAt: now,
      })
    : await ctx.db.patch(existingDeployment._id, {
        slug,
        url,
        status: 'ready',
        provider: 'ship-fast',
        previewVersion: preview.version,
        pendingPreviewVersion: undefined,
        errorMessage: undefined,
        lakebedDeployId: undefined,
        lakebedClaimUrl: undefined,
        lakebedArtifactHash: undefined,
        lakebedClientBundleHash: undefined,
        lakebedClientBundleBytes: undefined,
        lakebedRequestBodyBytes: undefined,
        lakebedServerBundleBytes: undefined,
        lakebedSourceFileCount: undefined,
        lakebedExpiresAt: undefined,
        lakebedInspectPolicy: undefined,
        updatedAt: now,
      })

  if (session.isPrivate) {
    await ctx.db.patch(args.sessionId, {
      isPrivate: false,
      updatedAt: now,
    })
  }

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'published',
    message: `Published preview to ${url}`,
    previewVersion: preview.version,
    createdAt: now,
  })

  if (args.buildExportArtifact !== undefined) {
    await queueSessionExportArtifactBuild(ctx, {
      sessionId: args.sessionId,
      target: 'html',
      previewVersion: preview.version,
      isPrivate: false,
      now,
      buildExportArtifact: args.buildExportArtifact,
      force: true,
    })
  }

  return {
    sessionId: args.sessionId,
    slug,
    url,
    status: readyStatus(),
  }
}

export async function markSessionDeploymentUpdating(
  ctx: MutationCtx,
  args: {
    sessionId: Id<'sessions'>
    previewVersion: number
  },
) {
  const deployment = await ctx.db
    .query('deployments')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', args.sessionId))
    .first()

  if (deployment === null) return { status: noneStatus() }

  await ctx.db.patch(deployment._id, {
    status: 'updating',
    pendingPreviewVersion: args.previewVersion,
    errorMessage: undefined,
    updatedAt: Date.now(),
  })

  return { status: updatingStatus() }
}

export async function refreshShipFastDeploymentIfPresent(
  ctx: MutationCtx,
  args: {
    sessionId: Id<'sessions'>
    previewVersion: number
  },
) {
  const [session, deployment, preview] = await Promise.all([
    ctx.db.get(args.sessionId),
    ctx.db
      .query('deployments')
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .first(),
    ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index
          .eq('sessionId', args.sessionId)
          .eq('version', args.previewVersion),
      )
      .first(),
  ])

  if (
    session === null ||
    deployment === null ||
    deployment.provider !== 'ship-fast' ||
    preview === null ||
    session.status !== 'preview_ready'
  ) {
    return { status: skippedStatus() }
  }

  if ((preview.openUiSource ?? '').trim().length === 0) {
    return { status: skippedStatus() }
  }

  const now = Date.now()
  await ctx.db.patch(deployment._id, {
    status: 'ready',
    previewVersion: args.previewVersion,
    pendingPreviewVersion: undefined,
    errorMessage: undefined,
    updatedAt: now,
  })

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'published',
    message: `Updated deployed preview at ${deployment.url}`,
    previewVersion: args.previewVersion,
    createdAt: now,
  })

  return { status: readyStatus() }
}
