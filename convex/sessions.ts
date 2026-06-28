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
} from './_generated/server'
import { listSessionChatMessages } from './lib/chat_refinement_helpers'
import {
  claimAnonymousSession,
  deleteOwnedSessions,
  setSessionThemeOverride,
} from './lib/session_access_helpers'
import {
  clearSessionAnnotations,
  createSessionAnnotation,
  deleteAgentationSyncSessionAnnotation,
  deleteSessionAnnotation,
  deleteSessionAnnotationByAgentationId,
  listSessionAnnotations,
  saveSessionAgentationSession,
  updateAgentationSyncSessionAnnotation,
  upsertAgentationSyncSessionAnnotation,
  upsertSessionAnnotation,
} from './lib/session_agentation_helpers'
import { loadSessionApiResponse } from './lib/session_api_response_helpers'
import {
  insertSessionCmsBinding,
  listCmsRevisionsForEntry,
  loadSessionCmsConfig,
  listSessionCmsContent,
  listSessionCmsEntries,
  listSessionCmsEntryRevisions,
  restoreSessionCmsRevision,
  restoreSessionCmsContentRevision,
  seedCmsBindingsForGeneratedArtifacts,
  updateSessionCmsEntry,
  upsertSessionCmsConfig,
  upsertSessionCmsContentEntry,
} from './lib/session_cms_binding_helpers'
import {
  deleteSessionCmsCollectionItem,
  listSessionCmsCollectionItems,
  listSessionCmsCollections,
  upsertSessionCmsCollectionItem,
} from './lib/session_cms_collection_helpers'
import {
  loadSessionCommerceConfig,
  provisionSessionMedusaTenant,
  syncSessionMedusaProducts,
  upsertSessionCommerceConfig,
} from './lib/session_commerce_helpers'
import { sendSessionChatMessage } from './lib/session_chat_helpers'
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
  loadOwnedLakebedDeploymentArtifact,
  prepareLakebedSessionDeployment,
  publishSessionPreview,
  recordLakebedSessionDeploymentFailure,
  recordLakebedSessionDeploymentSuccess,
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
  agentationSyncAnnotationArgs,
  annotationIdArgs,
  applyCloneBriefArgs,
  addGenerationEventArgs,
  claimAnonymousArgs,
  completeGenerationArgs,
  createGenerationSessionArgs,
  createEditArgs,
  deleteCmsCollectionItemArgs,
  deleteOwnedAnnotationArgs,
  deleteOwnedAnnotationByAgentationIdArgs,
  deleteMineArgs,
  cmsCollectionItemsArgs,
  cmsEntryRevisionsArgs,
  deploymentSlugArgs,
  editedSessionExportRebuildArgs,
  eventStreamArgs,
  extractCmsBindingsArgs,
  exportRecordArgs,
  exportArtifactBuildArgs,
  exportArtifactFailureArgs,
  exportArtifactReadyArgs,
  exportArtifactStalledArgs,
  failGenerationArgs,
  forkSessionArgs,
  generationViewArgs,
  githubExportRepositoryLookupArgs,
  insertCmsBindingArgs,
  listCmsRevisionsArgs,
  lakebedDeploymentFailureArgs,
  lakebedDeploymentSuccessArgs,
  clonePageLookupArgs,
  lookupArgs,
  operationalNotificationArgs,
  ownedAnnotationArgs,
  ownedExportArgs,
  ownedExportLookupArgs,
  ownedSessionArgs,
  provisionMedusaTenantArgs,
  publicGallerySessionArgs,
  publicGallerySessionsArgs,
  publishPreviewArgs,
  publishPreviewLookupArgs,
  recordOperationalEventArgs,
  recordUsageMetricArgs,
  restoreCmsContentRevisionArgs,
  restoreCmsRevisionArgs,
  restorePreviewVersionArgs,
  saveAgentationSessionArgs,
  sendChatMessageArgs,
  sessionIdArgs,
  setThemeOverrideArgs,
  slackNotificationArgs,
  syncMedusaProductsArgs,
  telegramNotificationArgs,
  upsertAiCapsuleArgs,
  applySectionEditArgs,
  updateCmsEntryArgs,
  updateAgentationSyncAnnotationArgs,
  upsertCmsCollectionItemArgs,
  upsertGeneratedModuleArgs,
  upsertGenerationTaskArgs,
  upsertCmsConfigArgs,
  upsertCmsContentEntryArgs,
  upsertCommerceConfigArgs,
  userUsageMetricsArgs,
  writeClonePageArgs,
} from './lib/session_validators'
import { loadSessionWorkspace } from './lib/session_workspace_helpers'

const debouncerComponent =
  components.debouncer as unknown as DebouncerComponentApi

const editedSessionExportDebouncer = new Debouncer(debouncerComponent, {
  delay: 10_000,
  mode: 'sliding',
})

const scheduleEditedSessionExportAutomation = async (
  ctx: MutationCtx,
  args: {
    sessionId: Id<'sessions'>
    previewVersion: number
  },
) =>
  await editedSessionExportDebouncer.schedule(
    ctx,
    'edited-session-export-rebuild',
    args.sessionId,
    internal.sessions.rebuildEditedSessionExports,
    args,
  )

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
  args: lookupArgs,
  handler: async (ctx, args) => loadSessionReadiness(ctx, args.lookup),
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

    return { status: 'queued' }
  },
})

export const createEdit = mutation({
  args: createEditArgs,
  handler: async (ctx, args) => {
    const result = await createSessionEdit(ctx, args)
    await scheduleEditedSessionExportAutomation(ctx, result)
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
  args: sessionIdArgs,
  handler: async (ctx, args) => listSessionEdits(ctx, args.sessionId),
})

export const listPreviewHistory = query({
  args: sessionIdArgs,
  handler: async (ctx, args) => listSessionPreviewHistory(ctx, args.sessionId),
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
  args: sessionIdArgs,
  handler: (ctx, args) => listSessionClonePages(ctx, args.sessionId),
})

export const sendChatMessage = mutation({
  args: sendChatMessageArgs,
  handler: (ctx, args) => sendSessionChatMessage(ctx, args),
})

export const listChatMessages = query({
  args: sessionIdArgs,
  handler: async (ctx, args) => listSessionChatMessages(ctx, args.sessionId),
})

export const setThemeOverride = mutation({
  args: setThemeOverrideArgs,
  handler: (ctx, args) => setSessionThemeOverride(ctx, args),
})

export const createAnnotation = mutation({
  args: ownedAnnotationArgs,
  handler: (ctx, args) => createSessionAnnotation(ctx, args),
})

export const upsertAnnotation = mutation({
  args: ownedAnnotationArgs,
  handler: (ctx, args) => upsertSessionAnnotation(ctx, args),
})

export const listAnnotations = query({
  args: sessionIdArgs,
  handler: async (ctx, args) => listSessionAnnotations(ctx, args.sessionId),
})

export const saveAgentationSession = mutation({
  args: saveAgentationSessionArgs,
  handler: (ctx, args) => saveSessionAgentationSession(ctx, args),
})

export const upsertAgentationSyncAnnotation = mutation({
  args: agentationSyncAnnotationArgs,
  handler: (ctx, args) => upsertAgentationSyncSessionAnnotation(ctx, args),
})

export const updateAgentationSyncAnnotation = mutation({
  args: updateAgentationSyncAnnotationArgs,
  handler: (ctx, args) => updateAgentationSyncSessionAnnotation(ctx, args),
})

export const deleteAgentationSyncAnnotation = mutation({
  args: annotationIdArgs,
  handler: (ctx, args) => deleteAgentationSyncSessionAnnotation(ctx, args),
})

export const deleteAnnotation = mutation({
  args: deleteOwnedAnnotationArgs,
  handler: (ctx, args) => deleteSessionAnnotation(ctx, args),
})

export const deleteAnnotationByAgentationId = mutation({
  args: deleteOwnedAnnotationByAgentationIdArgs,
  handler: (ctx, args) => deleteSessionAnnotationByAgentationId(ctx, args),
})

export const clearAnnotations = mutation({
  args: ownedSessionArgs,
  handler: (ctx, args) => clearSessionAnnotations(ctx, args),
})

export const upsertCmsConfig = mutation({
  args: upsertCmsConfigArgs,
  handler: (ctx, args) => upsertSessionCmsConfig(ctx, args),
})

export const getCmsConfig = query({
  args: sessionIdArgs,
  handler: (ctx, args) => loadSessionCmsConfig(ctx, args.sessionId),
})

export const upsertCommerceConfig = mutation({
  args: upsertCommerceConfigArgs,
  handler: (ctx, args) => upsertSessionCommerceConfig(ctx, args),
})

export const getCommerceConfig = query({
  args: sessionIdArgs,
  handler: (ctx, args) => loadSessionCommerceConfig(ctx, args.sessionId),
})

export const listPublicSessions = query({
  args: publicGallerySessionsArgs,
  handler: (ctx, args) => listPublicGallerySessions(ctx, args),
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

export const extractCmsBindings = internalMutation({
  args: extractCmsBindingsArgs,
  handler: async (ctx, args) => {
    const extracted = await seedCmsBindingsForGeneratedArtifacts(
      ctx,
      args.sessionId,
      { html: args.html },
      Date.now(),
    )

    return { extracted }
  },
})

export const updateCmsEntry = internalMutation({
  args: updateCmsEntryArgs,
  handler: (ctx, args) => updateSessionCmsEntry(ctx, args),
})

export const restoreCmsRevision = internalMutation({
  args: restoreCmsRevisionArgs,
  handler: (ctx, args) => restoreSessionCmsRevision(ctx, args),
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

export const listCmsEntries = query({
  args: sessionIdArgs,
  handler: (ctx, args) => listSessionCmsEntries(ctx, args.sessionId),
})

export const listCmsContent = query({
  args: sessionIdArgs,
  handler: (ctx, args) => listSessionCmsContent(ctx, args.sessionId),
})

export const listCmsEntryRevisions = query({
  args: cmsEntryRevisionsArgs,
  handler: (ctx, args) => listSessionCmsEntryRevisions(ctx, args),
})

export const upsertCmsContentEntry = mutation({
  args: upsertCmsContentEntryArgs,
  handler: (ctx, args) => upsertSessionCmsContentEntry(ctx, args),
})

export const restoreCmsContentRevision = mutation({
  args: restoreCmsContentRevisionArgs,
  handler: (ctx, args) => restoreSessionCmsContentRevision(ctx, args),
})

export const listCmsCollections = query({
  args: sessionIdArgs,
  handler: (ctx, args) => listSessionCmsCollections(ctx, args.sessionId),
})

export const listCmsCollectionItems = query({
  args: cmsCollectionItemsArgs,
  handler: (ctx, args) => listSessionCmsCollectionItems(ctx, args),
})

export const upsertCmsCollectionItem = mutation({
  args: upsertCmsCollectionItemArgs,
  handler: (ctx, args) => upsertSessionCmsCollectionItem(ctx, args),
})

export const deleteCmsCollectionItem = mutation({
  args: deleteCmsCollectionItemArgs,
  handler: (ctx, args) => deleteSessionCmsCollectionItem(ctx, args),
})

export const insertCmsBinding = internalMutation({
  args: insertCmsBindingArgs,
  handler: (ctx, args) => insertSessionCmsBinding(ctx, args),
})

export const listCmsRevisions = internalQuery({
  args: listCmsRevisionsArgs,
  handler: (ctx, args) => listCmsRevisionsForEntry(ctx, args.entryId),
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
  handler: (ctx, args) => listSessionAiCapsules(ctx, args.sessionId),
})

export const upsertAiCapsule = internalMutation({
  args: upsertAiCapsuleArgs,
  handler: (ctx, args) => upsertSessionAiCapsule(ctx, args),
})

export const applySectionEdit = mutation({
  args: applySectionEditArgs,
  handler: (ctx, args) => applySectionEditToArtifacts(ctx, args),
})
