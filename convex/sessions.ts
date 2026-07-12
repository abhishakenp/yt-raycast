import {
  Debouncer,
  type DebouncerComponentApi,
} from '@ikhrustalev/convex-debouncer'
import { v } from 'convex/values'
import { components, internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from './_generated/server'
import {
  canReadPrivateSession,
  claimAnonymousSession,
  claimAnonymousSessionsByClientId,
  deleteOwnedSessions,
  setSessionBrandLogo,
  setSessionPreferredLanguage,
  setSessionThemeOverride,
} from './lib/session_access_helpers'
import { loadSessionApiResponse } from './lib/session_api_response_helpers'
import {
  authorizeDeploymentCommerceTenantProvision,
  loadDeploymentCommerceTenantBySlugForWebhook,
  loadDeploymentCommerceTenantBySlug,
  loadOwnedDeploymentCommerceTenantBySlug,
  loadSessionCommerceConfig,
  recordDeploymentCommerceTenantPull,
  provisionSessionMedusaTenant,
  syncSessionMedusaProducts,
  upsertDeploymentCommerceTenant,
  upsertSessionCommerceConfig,
} from './lib/session_commerce_helpers'
import {
  listSessionAiCapsules,
  upsertSessionAiCapsule,
} from './lib/session_ai_capsule_helpers'
import { applySectionEditToArtifacts } from './lib/session_section_edit_helpers'
import {
  applyCloneBriefAndGenerate as applyCloneBriefAndGenerateHelper,
  finalizeSessionClonePreview,
  generateCloneUploadUrl as generateCloneUploadUrlHelper,
  listSessionClonePages,
  loadClonePagePreview,
  writeSessionClonePage,
} from './lib/session_clone_helpers'
import {
  createGenerationSession,
  type CreateGenerationSessionResult,
} from './lib/session_creation_helpers'
import {
  generateUserImageUploadUrl,
  listUserImages as listUserImagesHelper,
  saveUserImage as saveUserImageHelper,
} from './lib/session_user_image_helpers'
import { createSessionEdit } from './lib/session_edit_mutation_helpers'
import { forkSessionForOwner } from './lib/session_fork_helpers'
import {
  recordOperationalGenerationEvent,
  sendOperationalNotificationAdapters,
  sendSlackOperationalMessage,
  sendTelegramOperationalMessage,
} from './lib/session_operational_notifications'
import {
  loadDeploymentBySlug,
  loadDeploymentStatus,
  loadLakebedDeploymentUpdateTarget,
  loadOwnedLakebedDeploymentArtifact,
  markSessionDeploymentUpdating,
  prepareLakebedSessionDeployment,
  publishSessionPreview,
  recordLakebedSessionDeploymentFailure,
  recordLakebedSessionDeploymentSuccess,
  refreshShipFastDeploymentIfPresent,
} from './lib/session_deployment_helpers'
import {
  createSessionExport,
  ensureExportArtifactBuild,
  loadOwnedExportArtifactDownload,
  loadOwnedExportBuildInput,
  loadOwnedExportForGitHubPush,
  loadExportRecord,
  loadSessionExportTargets,
  markExportArtifactBuilding,
  prepareExportArtifactBuild,
  queueSessionExportArtifactBuilds,
  recordExportArtifactFailure,
  recordExportArtifactReady,
  recordExportArtifactStalled,
  recordGitHubExportRepository,
} from './lib/session_export_helpers'
import { loadSessionEventStream } from './lib/session_event_stream_helpers'
import {
  listOwnedGallerySessions,
  listPublicGallerySessions,
  loadPublicGallerySession,
} from './lib/session_gallery_helpers'
import {
  completeGeneratedSession,
  failGeneratedSession,
} from './lib/session_generation_state_helpers'
import { type CompleteGenerationActionResult } from './lib/session_generation_action_helpers'
import {
  addGenerationProgressEvent,
  markSessionGenerationStarted,
  upsertGeneratedModuleRecord,
} from './lib/session_generation_progress_helpers'
import { loadGenerationView } from './lib/session_generation_view_helpers'
import { loadPublicPreview } from './lib/session_public_preview_helpers'
import { sessionInternalReferences } from './lib/session_internal_references'
import {
  listSessionPreviewHistory,
  listSessionEdits,
  restoreOwnedPreviewVersion,
} from './lib/session_preview_history_helpers'
import { loadSessionReadiness } from './lib/session_readiness_helpers'
import { upsertTask } from './lib/session_task_helpers'
import {
  loadSessionUsageMetrics,
  loadUserUsageMetrics,
  recordSessionUsageMetric,
} from './lib/session_usage_metrics_helpers'
import {
  applyCloneBriefArgs,
  addGenerationEventArgs,
  claimAnonymousArgs,
  claimAnonymousByClientIdArgs,
  completeGenerationArgs,
  commerceTenantDeploymentSlugArgs,
  createGenerationSessionArgs,
  createEditArgs,
  deleteMineArgs,
  deploymentSlugArgs,
  editedSessionExportRebuildArgs,
  eventStreamArgs,
  exportRecordArgs,
  exportArtifactBuildArgs,
  exportArtifactFailureArgs,
  exportArtifactReadyArgs,
  exportArtifactStalledArgs,
  failGenerationArgs,
  forkSessionArgs,
  generationViewArgs,
  githubExportRepositoryLookupArgs,
  lakebedDeploymentFailureArgs,
  lakebedDeploymentSuccessArgs,
  clonePageLookupArgs,
  lookupArgs,
  operationalNotificationArgs,
  ownedExportArgs,
  ownedCommerceTenantDeploymentSlugArgs,
  ownedGallerySessionsArgs,
  ownedExportLookupArgs,
  ownedSessionArgs,
  provisionMedusaTenantArgs,
  publicGallerySessionArgs,
  publicGallerySessionsArgs,
  publishPreviewArgs,
  publishPreviewLookupArgs,
  recordCommerceTenantPullArgs,
  recordOperationalEventArgs,
  recordUsageMetricArgs,
  restorePreviewVersionArgs,
  sessionIdArgs,
  sessionReadinessArgs,
  setPreferredLanguageArgs,
  setBrandLogoArgs,
  setThemeOverrideArgs,
  slackNotificationArgs,
  syncMedusaProductsArgs,
  telegramNotificationArgs,
  upsertAiCapsuleArgs,
  applySectionEditArgs,
  upsertCommerceTenantArgs,
  upsertGeneratedModuleArgs,
  upsertGenerationTaskArgs,
  upsertCommerceConfigArgs,
  userUsageMetricsArgs,
  webhookCommerceTenantDeploymentSlugArgs,
  writeClonePageArgs,
} from './lib/session_validators'
import { loadSessionWorkspace } from './lib/session_workspace_helpers'

const debouncerComponent =
  components.debouncer as unknown as DebouncerComponentApi

const editedSessionExportDebouncer = new Debouncer(debouncerComponent, {
  delay: 10_000,
  mode: 'sliding',
})

const canReadSessionById = async (
  ctx: Pick<QueryCtx, 'auth' | 'db'>,
  sessionId: Id<'sessions'>,
): Promise<boolean> => {
  const session = await ctx.db.get(sessionId)
  return session !== null && (await canReadPrivateSession(ctx, session))
}

const scheduleEditedSessionExportAutomation = async (
  ctx: MutationCtx,
  args: {
    sessionId: Id<'sessions'>
    previewVersion: number
  },
) => {
  const rebuildArgs = {
    sessionId: args.sessionId,
    previewVersion: args.previewVersion,
  }

  await markSessionDeploymentUpdating(ctx, rebuildArgs)
  await editedSessionExportDebouncer.schedule(
    ctx,
    'edited-session-export-rebuild',
    rebuildArgs.sessionId,
    internal.sessions.rebuildEditedSessionExports,
    rebuildArgs,
  )
}

const scheduleCurrentSessionExportAutomation = async (
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
) => {
  const session = await ctx.db.get(sessionId)
  if (
    session === null ||
    session.status !== 'preview_ready' ||
    typeof session.previewVersion !== 'number'
  ) {
    return
  }

  await scheduleEditedSessionExportAutomation(ctx, {
    sessionId,
    previewVersion: session.previewVersion,
  })
}

// Gallery Easter egg: delete the hovered generation, scoped by authenticated
// userId or stable anonymousClientId.
export const deleteMine = mutation({
  args: deleteMineArgs,
  handler: (ctx, args) => deleteOwnedSessions(ctx, args),
})

export const create = mutation({
  args: createGenerationSessionArgs,
  handler: async (ctx, args): Promise<CreateGenerationSessionResult> =>
    await createGenerationSession(ctx, args, {
      startGeneration: internal.generation.startGeneration,
      sendOperationalNotification:
        sessionInternalReferences.sendOperationalNotification,
    }),
})

export const getGenerationSession = internalQuery({
  args: sessionIdArgs,
  handler: async (ctx, args) => await ctx.db.get(args.sessionId),
})

export const markGenerationStarted = internalMutation({
  args: sessionIdArgs,
  handler: async (ctx, args) => {
    return markSessionGenerationStarted(ctx, args.sessionId, Date.now())
  },
})

export const upsertGenerationTask = internalMutation({
  args: upsertGenerationTaskArgs,
  handler: async (ctx, args) => {
    await upsertTask(ctx, args.sessionId, args.task, args.order, Date.now())
  },
})

export const upsertGeneratedModule = internalMutation({
  args: upsertGeneratedModuleArgs,
  handler: async (ctx, args) => {
    await upsertGeneratedModuleRecord(ctx, {
      sessionId: args.sessionId,
      moduleKey: args.moduleKey,
      source: args.source,
      status: args.status,
      now: Date.now(),
    })
  },
})

export const addGenerationEvent = internalMutation({
  args: addGenerationEventArgs,
  handler: async (ctx, args) => {
    await addGenerationProgressEvent(ctx, {
      sessionId: args.sessionId,
      eventType: args.eventType,
      message: args.message,
      previewVersion: args.previewVersion,
      now: Date.now(),
    })
  },
})

export const setPreferredLanguageInternal = internalMutation({
  args: {
    sessionId: v.id('sessions'),
    preferredLanguage: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    if (session === null) return
    if (
      typeof session.preferredLanguage === 'string' &&
      session.preferredLanguage === args.preferredLanguage
    ) {
      return
    }
    await ctx.db.patch(args.sessionId, {
      preferredLanguage: args.preferredLanguage,
      updatedAt: Date.now(),
    })
  },
})

export const getGenerationView = query({
  args: generationViewArgs,
  handler: async (ctx, args) => loadGenerationView(ctx, args),
})

export const getEventStream = query({
  args: eventStreamArgs,
  handler: async (ctx, args) => loadSessionEventStream(ctx, args),
})

export const getSessionApiResponse = query({
  args: lookupArgs,
  handler: async (ctx, args) => loadSessionApiResponse(ctx, args.lookup),
})

export const getWorkspace = query({
  args: sessionIdArgs,
  handler: async (ctx, args) => loadSessionWorkspace(ctx, args.sessionId),
})

export const getSessionReadiness = query({
  args: sessionReadinessArgs,
  handler: async (ctx, args) => {
    const lookup = args.lookup ?? args.sessionId
    if (lookup === undefined) return null
    return loadSessionReadiness(ctx, lookup)
  },
})

export const getPublicPreview = query({
  args: lookupArgs,
  handler: async (ctx, args) => loadPublicPreview(ctx, args.lookup),
})

export const publishPreview = mutation({
  args: publishPreviewArgs,
  handler: (ctx, args) => publishSessionPreview(ctx, args),
})

export const prepareLakebedDeploymentForPublish = query({
  args: publishPreviewArgs,
  handler: (ctx, args) => prepareLakebedSessionDeployment(ctx, args),
})

export const recordLakebedDeploymentSuccess = internalMutation({
  args: lakebedDeploymentSuccessArgs,
  handler: (ctx, args) => recordLakebedSessionDeploymentSuccess(ctx, args),
})

export const recordLakebedDeploymentFailure = internalMutation({
  args: lakebedDeploymentFailureArgs,
  handler: (ctx, args) => recordLakebedSessionDeploymentFailure(ctx, args),
})

export const getLakebedDeploymentUpdateTarget = internalQuery({
  args: sessionIdArgs,
  handler: (ctx, args) =>
    loadLakebedDeploymentUpdateTarget(ctx, args.sessionId),
})

export const completeGeneration = internalAction({
  args: completeGenerationArgs,
  handler: async (ctx, args): Promise<CompleteGenerationActionResult> =>
    (await ctx.runAction(
      sessionInternalReferences.completeGenerationNode,
      args,
    )) as CompleteGenerationActionResult,
})

export const completeGenerationInternal = internalMutation({
  args: completeGenerationArgs,
  handler: async (ctx, args) => {
    const now = Date.now()

    return completeGeneratedSession(ctx, {
      sessionId: args.sessionId,
      html: args.html,
      siteSpecJson: args.siteSpecJson,
      openUiSource: args.openUiSource,
      tasks: args.tasks,
      elapsed: args.elapsed,
      cost: args.cost,
      provider: args.provider,
      now,
      sendOperationalNotification:
        sessionInternalReferences.sendOperationalNotification,
      buildExportArtifact: sessionInternalReferences.buildExportArtifact,
    })
  },
})

export const failGeneration = internalMutation({
  args: failGenerationArgs,
  handler: async (ctx, args) => {
    return failGeneratedSession(ctx, {
      sessionId: args.sessionId,
      message: args.message,
      elapsed: args.elapsed,
      now: Date.now(),
      sendOperationalNotification:
        sessionInternalReferences.sendOperationalNotification,
    })
  },
})

export const claimAnonymous = mutation({
  args: claimAnonymousArgs,
  handler: (ctx, args) => claimAnonymousSession(ctx, args),
})

// Link all of a caller's anonymous sessions (by anonymousClientIdHash) to their
// signed-in userId. Called once on sign-in so /mine and ownership follow the
// user across the anon→authenticated transition. Idempotent.
export const claimAnonymousSessionsByClientIdMutation = mutation({
  args: claimAnonymousByClientIdArgs,
  handler: (ctx, args) => claimAnonymousSessionsByClientId(ctx, args),
})

export const createExport = mutation({
  args: ownedExportArgs,
  handler: (ctx, args) => createSessionExport(ctx, args),
})

export const createExportByLookup = mutation({
  args: ownedExportLookupArgs,
  handler: (ctx, args) => {
    const sessionId = ctx.db.normalizeId('sessions', args.lookup)
    if (sessionId === null) {
      throw new Error('Session not found')
    }
    return createSessionExport(ctx, {
      sessionId,
      target: args.target,
      anonymousOwnerSecret: args.anonymousOwnerSecret,
    })
  },
})

export const ensureExportArtifactByLookup = mutation({
  args: ownedExportLookupArgs,
  handler: (ctx, args) => {
    const sessionId = ctx.db.normalizeId('sessions', args.lookup)
    if (sessionId === null) {
      throw new Error('Session not found')
    }
    return ensureExportArtifactBuild(ctx, {
      sessionId,
      target: args.target,
      anonymousOwnerSecret: args.anonymousOwnerSecret,
      buildExportArtifact: sessionInternalReferences.buildExportArtifact,
    })
  },
})

export const recordGitHubExportRepositoryByLookup = mutation({
  args: githubExportRepositoryLookupArgs,
  handler: (ctx, args) => {
    const sessionId = ctx.db.normalizeId('sessions', args.lookup)
    if (sessionId === null) {
      throw new Error('Session not found')
    }
    return recordGitHubExportRepository(ctx, {
      sessionId,
      target: args.target,
      anonymousOwnerSecret: args.anonymousOwnerSecret,
      repoUrl: args.repoUrl,
    })
  },
})

export const getExport = query({
  args: exportRecordArgs,
  handler: async (ctx, args) =>
    loadExportRecord(ctx, args.sessionId, args.target),
})

export const getExportTargets = query({
  args: lookupArgs,
  handler: (ctx, args) => {
    const sessionId = ctx.db.normalizeId('sessions', args.lookup)
    return sessionId === null
      ? {
          sessionId: args.lookup,
          previewReady: false,
          isPrivate: null,
          targets: [],
        }
      : loadSessionExportTargets(ctx, sessionId)
  },
})

export const getDeploymentStatusByLookup = query({
  args: lookupArgs,
  handler: (ctx, args) => {
    const sessionId = ctx.db.normalizeId('sessions', args.lookup)
    return sessionId === null ? null : loadDeploymentStatus(ctx, sessionId)
  },
})

export const publishPreviewByLookup = mutation({
  args: publishPreviewLookupArgs,
  handler: (ctx, args) => {
    const sessionId = ctx.db.normalizeId('sessions', args.lookup)
    if (sessionId === null) {
      throw new Error('Session not found')
    }
    return publishSessionPreview(ctx, {
      sessionId,
      anonymousOwnerSecret: args.anonymousOwnerSecret,
      requestedSlug: args.requestedSlug,
    })
  },
})

export const getOwnedExportArtifactDownload = query({
  args: ownedExportArgs,
  handler: (ctx, args) => loadOwnedExportArtifactDownload(ctx, args),
})

export const getOwnedExportArtifactDownloadByLookup = query({
  args: ownedExportLookupArgs,
  handler: (ctx, args) => {
    const sessionId = ctx.db.normalizeId('sessions', args.lookup)
    if (sessionId === null) return null
    return loadOwnedExportArtifactDownload(ctx, {
      sessionId,
      target: args.target,
      anonymousOwnerSecret: args.anonymousOwnerSecret,
    })
  },
})

export const getOwnedExportBuildInputByLookup = query({
  args: ownedExportLookupArgs,
  handler: (ctx, args) => {
    const sessionId = ctx.db.normalizeId('sessions', args.lookup)
    if (sessionId === null) {
      throw new Error('Session not found')
    }
    return loadOwnedExportBuildInput(ctx, {
      sessionId,
      target: args.target,
      anonymousOwnerSecret: args.anonymousOwnerSecret,
    })
  },
})

export const getOwnedExportForGitHubPush = query({
  args: ownedExportArgs,
  handler: (ctx, args) => loadOwnedExportForGitHubPush(ctx, args),
})

export const getOwnedExportForGitHubPushByLookup = query({
  args: ownedExportLookupArgs,
  handler: (ctx, args) => {
    const sessionId = ctx.db.normalizeId('sessions', args.lookup)
    if (sessionId === null) {
      throw new Error('Session not found')
    }
    return loadOwnedExportForGitHubPush(ctx, {
      sessionId,
      target: args.target,
      anonymousOwnerSecret: args.anonymousOwnerSecret,
    })
  },
})

export const prepareExportArtifactBuildInput = internalQuery({
  args: exportArtifactBuildArgs,
  handler: (ctx, args) => prepareExportArtifactBuild(ctx, args),
})

export const markExportArtifactBuildStarted = internalMutation({
  args: exportArtifactBuildArgs,
  handler: (ctx, args) =>
    markExportArtifactBuilding(ctx, {
      ...args,
      stallExportArtifactBuild:
        sessionInternalReferences.stallExportArtifactBuild,
    }),
})

export const recordExportArtifactBuildReady = internalMutation({
  args: exportArtifactReadyArgs,
  handler: (ctx, args) => recordExportArtifactReady(ctx, args),
})

export const recordExportArtifactBuildFailure = internalMutation({
  args: exportArtifactFailureArgs,
  handler: (ctx, args) => recordExportArtifactFailure(ctx, args),
})

export const markExportArtifactBuildStalled = internalMutation({
  args: exportArtifactStalledArgs,
  handler: (ctx, args) => recordExportArtifactStalled(ctx, args),
})

export const rebuildEditedSessionExports = internalMutation({
  args: editedSessionExportRebuildArgs,
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)

    if (session === null || session.previewVersion !== args.previewVersion) {
      return { status: 'stale' }
    }

    await queueSessionExportArtifactBuilds(ctx, {
      sessionId: args.sessionId,
      previewVersion: args.previewVersion,
      isPrivate: session.isPrivate,
      now: Date.now(),
      buildExportArtifact: sessionInternalReferences.buildExportArtifact,
    })

    await refreshShipFastDeploymentIfPresent(ctx, args)

    return { status: 'queued' }
  },
})

export const createEdit = mutation({
  args: createEditArgs,
  handler: async (ctx, args) => {
    const result = await createSessionEdit(ctx, args)
    await scheduleEditedSessionExportAutomation(ctx, {
      sessionId: result.sessionId,
      previewVersion: result.previewVersion,
    })
    return result
  },
})

// Fork a session the caller does not own into a fresh copy they DO own, then
// optionally re-apply the edit that triggered the fork. Used by the inline
// editor: when createEdit throws FORBIDDEN, the client forks here and lands the
// user on their own editable copy with the change already applied.
export const forkSession = mutation({
  args: forkSessionArgs,
  handler: async (ctx, args) => {
    const result = await forkSessionForOwner(
      ctx,
      args,
      sessionInternalReferences.sendOperationalNotification,
    )
    if (result.editPreviewVersion !== undefined) {
      await scheduleEditedSessionExportAutomation(ctx, {
        sessionId: result.sessionId,
        previewVersion: result.editPreviewVersion,
      })
    }
    return result
  },
})

export const listEdits = query({
  args: lookupArgs,
  handler: async (ctx, args) => {
    const sessionId = ctx.db.normalizeId('sessions', args.lookup)
    return sessionId !== null && (await canReadSessionById(ctx, sessionId))
      ? listSessionEdits(ctx, sessionId)
      : []
  },
})

export const listPreviewHistory = query({
  args: lookupArgs,
  handler: async (ctx, args) => {
    const sessionId = ctx.db.normalizeId('sessions', args.lookup)
    return sessionId !== null && (await canReadSessionById(ctx, sessionId))
      ? listSessionPreviewHistory(ctx, sessionId)
      : []
  },
})

export const restorePreviewVersion = mutation({
  args: restorePreviewVersionArgs,
  handler: (ctx, args) => restoreOwnedPreviewVersion(ctx, args),
})

export const writeClonePageDoc = mutation({
  args: writeClonePageArgs,
  handler: (ctx, args) => writeSessionClonePage(ctx, args),
})

// Large verbatim clone docs exceed Convex's 1 MiB per-document limit, so the
// clone job uploads them to file storage. This hands the job a signed upload url
// after the same owned-session check writeClonePageDoc enforces.
export const generateCloneUploadUrl = mutation({
  args: ownedSessionArgs,
  handler: (ctx, args) => generateCloneUploadUrlHelper(ctx, args),
})

// ── User image uploads (inline image swap picker) ─────────────────────────
// Same ownership check as clone uploads. The client POSTs the file to the
// signed URL, gets a storageId back, then calls saveUserImage to record
// metadata. listUserImages resolves storage URLs for display in the picker.
export const generateImageUploadUrl = mutation({
  args: ownedSessionArgs,
  handler: (ctx, args) => generateUserImageUploadUrl(ctx, args),
})

export const saveUserImage = mutation({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
    storageId: v.id('_storage'),
    filename: v.optional(v.string()),
    contentType: v.string(),
    size: v.number(),
  },
  handler: (ctx, args) => saveUserImageHelper(ctx, args),
})

export const listUserImages = query({
  args: { sessionId: v.id('sessions') },
  handler: (ctx, args) => listUserImagesHelper(ctx, args),
})

// Renderable home clone content: `url` (file-storage iframe src) when the doc is
// large, else `html` (inline iframe srcDoc). The client chooses url-over-html.
export const getCloneHomePreview = query({
  args: clonePageLookupArgs,
  handler: (ctx, args) => loadClonePagePreview(ctx, args.lookup, args.pathname),
})

export const applyCloneBriefAndGenerate = mutation({
  args: applyCloneBriefArgs,
  handler: (ctx, args) => applyCloneBriefAndGenerateHelper(ctx, args),
})

export const finalizeClonePreview = mutation({
  args: ownedSessionArgs,
  handler: (ctx, args) =>
    finalizeSessionClonePreview(ctx, {
      ...args,
      sendOperationalNotification:
        sessionInternalReferences.sendOperationalNotification,
    }),
})

export const listClonePages = query({
  args: lookupArgs,
  handler: (ctx, args) => {
    const sessionId = ctx.db.normalizeId('sessions', args.lookup)
    return sessionId === null ? [] : listSessionClonePages(ctx, sessionId)
  },
})

export const setThemeOverride = mutation({
  args: setThemeOverrideArgs,
  handler: async (ctx, args) => {
    await setSessionThemeOverride(ctx, args)
    await scheduleCurrentSessionExportAutomation(ctx, args.sessionId)
  },
})

export const setPreferredLanguage = mutation({
  args: setPreferredLanguageArgs,
  handler: async (ctx, args) => {
    await setSessionPreferredLanguage(ctx, args)
    await scheduleCurrentSessionExportAutomation(ctx, args.sessionId)
  },
})

export const setBrandLogo = mutation({
  args: setBrandLogoArgs,
  handler: async (ctx, args) => {
    await setSessionBrandLogo(ctx, args)
    await scheduleCurrentSessionExportAutomation(ctx, args.sessionId)
  },
})

export const upsertCommerceConfig = mutation({
  args: upsertCommerceConfigArgs,
  handler: (ctx, args) => upsertSessionCommerceConfig(ctx, args),
})

export const getCommerceConfig = query({
  args: sessionIdArgs,
  handler: (ctx, args) => loadSessionCommerceConfig(ctx, args.sessionId),
})

export const upsertCommerceTenant = mutation({
  args: upsertCommerceTenantArgs,
  handler: (ctx, args) => upsertDeploymentCommerceTenant(ctx, args),
})

export const getCommerceTenantByDeploymentSlug = query({
  args: commerceTenantDeploymentSlugArgs,
  handler: (ctx, args) =>
    loadDeploymentCommerceTenantBySlug(ctx, args.deploymentSlug),
})

export const authorizeCommerceTenantProvision = query({
  args: ownedCommerceTenantDeploymentSlugArgs,
  handler: (ctx, args) => authorizeDeploymentCommerceTenantProvision(ctx, args),
})

export const getOwnedCommerceTenantByDeploymentSlug = query({
  args: ownedCommerceTenantDeploymentSlugArgs,
  handler: (ctx, args) => loadOwnedDeploymentCommerceTenantBySlug(ctx, args),
})

export const getCommerceTenantByDeploymentSlugForWebhook = query({
  args: webhookCommerceTenantDeploymentSlugArgs,
  handler: (ctx, args) =>
    loadDeploymentCommerceTenantBySlugForWebhook(ctx, args),
})

export const recordCommerceTenantPull = mutation({
  args: recordCommerceTenantPullArgs,
  handler: (ctx, args) => recordDeploymentCommerceTenantPull(ctx, args),
})

export const listPublicSessions = query({
  args: publicGallerySessionsArgs,
  handler: (ctx, args) => listPublicGallerySessions(ctx, args),
})

// "My generations" — sessions owned by the caller (signed-in userId via Convex
// auth, or anonymousClientId), including PRIVATE sessions the caller owns.
export const listOwnedSessions = query({
  args: ownedGallerySessionsArgs,
  handler: (ctx, args) => listOwnedGallerySessions(ctx, args),
})

export const getPublicGallerySession = query({
  args: publicGallerySessionArgs,
  handler: (ctx, args) => loadPublicGallerySession(ctx, args.sessionId),
})

export const getDeploymentBySlug = query({
  args: deploymentSlugArgs,
  handler: async (ctx, args) => loadDeploymentBySlug(ctx, args.slug),
})

export const getDeploymentStatus = query({
  args: sessionIdArgs,
  handler: async (ctx, args) => loadDeploymentStatus(ctx, args.sessionId),
})

export const getOwnedLakebedDeploymentArtifact = query({
  args: publishPreviewArgs,
  handler: async (ctx, args) => loadOwnedLakebedDeploymentArtifact(ctx, args),
})

export const getOwnedLakebedDeploymentArtifactByLookup = query({
  args: publishPreviewLookupArgs,
  handler: (ctx, args) => {
    const sessionId = ctx.db.normalizeId('sessions', args.lookup)
    if (sessionId === null) {
      throw new Error('Session not found')
    }
    return loadOwnedLakebedDeploymentArtifact(ctx, {
      sessionId,
      anonymousOwnerSecret: args.anonymousOwnerSecret,
      requestedSlug: args.requestedSlug,
    })
  },
})

export const provisionMedusaTenant = internalMutation({
  args: provisionMedusaTenantArgs,
  handler: (ctx, args) => provisionSessionMedusaTenant(ctx, args),
})

export const syncMedusaProducts = internalMutation({
  args: syncMedusaProductsArgs,
  handler: (ctx, args) => syncSessionMedusaProducts(ctx, args),
})

export const recordUsageMetric = internalMutation({
  args: recordUsageMetricArgs,
  handler: (ctx, args) => recordSessionUsageMetric(ctx, args),
})

export const recordOperationalEvent = internalMutation({
  args: recordOperationalEventArgs,
  handler: async (ctx, args) => {
    return await recordOperationalGenerationEvent(
      ctx,
      args,
      sessionInternalReferences.sendOperationalNotification,
    )
  },
})

export const getUsageMetrics = query({
  args: sessionIdArgs,
  handler: (ctx, args) => loadSessionUsageMetrics(ctx, args.sessionId),
})

export const getUserUsageMetrics = query({
  args: userUsageMetricsArgs,
  handler: (ctx, args) => loadUserUsageMetrics(ctx, args),
})

export const sendOperationalNotification = internalAction({
  args: operationalNotificationArgs,
  handler: async (_ctx, args) => {
    return sendOperationalNotificationAdapters(args)
  },
})

export const sendSlackNotification = internalAction({
  args: slackNotificationArgs,
  handler: async (_ctx, args) => {
    return sendSlackOperationalMessage(args)
  },
})

export const sendTelegramNotification = internalAction({
  args: telegramNotificationArgs,
  handler: async (_ctx, args) => {
    return sendTelegramOperationalMessage(args)
  },
})

export const listAiCapsules = query({
  args: sessionIdArgs,
  handler: async (ctx, args) =>
    (await canReadSessionById(ctx, args.sessionId))
      ? listSessionAiCapsules(ctx, args.sessionId)
      : [],
})

export const upsertAiCapsule = internalMutation({
  args: upsertAiCapsuleArgs,
  handler: (ctx, args) => upsertSessionAiCapsule(ctx, args),
})

export const applySectionEdit = mutation({
  args: applySectionEditArgs,
  handler: (ctx, args) => applySectionEditToArtifacts(ctx, args),
})
