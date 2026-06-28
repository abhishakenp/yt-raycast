import { v } from 'convex/values'

export const exportTarget = v.union(
  v.literal('html'),
  v.literal('react'),
  v.literal('next'),
  v.literal('lakebed'),
)

export const engineTaskStatus = v.union(
  v.literal('PENDING'),
  v.literal('IN_PROGRESS'),
  v.literal('DONE'),
  v.literal('FAILED'),
)

export const taskStatus = v.union(
  v.literal('pending'),
  v.literal('running'),
  v.literal('succeeded'),
  v.literal('failed'),
)

export const engineTask = v.object({
  id: v.string(),
  label: v.string(),
  status: engineTaskStatus,
  filename: v.optional(v.string()),
  files: v.optional(v.array(v.string())),
})

export const editType = v.union(
  v.literal('text'),
  v.literal('ai_rewrite'),
  v.literal('style'),
  v.literal('image'),
  v.literal('delete'),
)

export const medusaProduct = v.object({
  id: v.string(),
  title: v.string(),
  handle: v.string(),
  price: v.number(),
  description: v.optional(v.string()),
})

export const sessionIdArgs = {
  sessionId: v.id('sessions'),
}

export const lookupArgs = {
  lookup: v.string(),
}

export const clonePageLookupArgs = {
  lookup: v.string(),
  pathname: v.optional(v.string()),
}

export const generationViewArgs = {
  sessionId: v.optional(v.id('sessions')),
  lookup: v.optional(v.string()),
}

export const eventStreamArgs = {
  sessionId: v.optional(v.id('sessions')),
  lookup: v.optional(v.string()),
  since: v.optional(v.number()),
  limit: v.optional(v.number()),
  anonymousOwnerSecret: v.optional(v.string()),
}

export const deleteMineArgs = {
  anonymousClientId: v.optional(v.string()),
  sessionId: v.optional(v.id('sessions')),
}

export const createGenerationSessionArgs = {
  prompt: v.string(),
  preferredLanguage: v.string(),
  preferredExportTarget: exportTarget,
  isPrivate: v.boolean(),
  workspace: v.string(),
  anonymousOwnerSecret: v.optional(v.string()),
  anonymousClientId: v.optional(v.string()),
  designReferenceUrls: v.optional(v.array(v.string())),
  designReferenceNotes: v.optional(v.string()),
  cloneUrl: v.optional(v.string()),
  engineVersion: v.optional(v.string()),
}

export const ownedSessionArgs = {
  sessionId: v.id('sessions'),
  anonymousOwnerSecret: v.optional(v.string()),
}

export const claimAnonymousArgs = {
  sessionId: v.id('sessions'),
  anonymousOwnerSecret: v.string(),
}

export const publishPreviewArgs = {
  ...ownedSessionArgs,
  requestedSlug: v.optional(v.string()),
}

export const lakebedDeploymentSuccessArgs = {
  sessionId: v.id('sessions'),
  requestedSlug: v.optional(v.string()),
  previewVersion: v.number(),
  url: v.string(),
  deployId: v.string(),
  claimUrl: v.optional(v.string()),
  artifactHash: v.string(),
  clientBundleHash: v.string(),
  clientBundleBytes: v.number(),
  requestBodyBytes: v.number(),
  serverBundleBytes: v.number(),
  sourceFileCount: v.number(),
  expiresAt: v.optional(v.string()),
  inspectPolicy: v.optional(v.string()),
}

export const lakebedDeploymentFailureArgs = {
  sessionId: v.id('sessions'),
  requestedSlug: v.optional(v.string()),
  errorMessage: v.string(),
}

export const exportRecordArgs = {
  sessionId: v.id('sessions'),
  target: exportTarget,
}

export const ownedExportArgs = {
  ...ownedSessionArgs,
  target: exportTarget,
}

export const ownedExportLookupArgs = {
  lookup: v.string(),
  target: exportTarget,
  anonymousOwnerSecret: v.optional(v.string()),
}

export const githubExportRepositoryLookupArgs = {
  ...ownedExportLookupArgs,
  repoUrl: v.string(),
}

export const publishPreviewLookupArgs = {
  lookup: v.string(),
  anonymousOwnerSecret: v.optional(v.string()),
  requestedSlug: v.optional(v.string()),
}

export const exportArtifactBuildArgs = {
  sessionId: v.id('sessions'),
  target: exportTarget,
  previewVersion: v.number(),
  autoDeployPublic: v.optional(v.boolean()),
}

export const exportArtifactStalledArgs = {
  sessionId: v.id('sessions'),
  target: exportTarget,
  previewVersion: v.number(),
  buildStartedAt: v.number(),
}

export const editedSessionExportRebuildArgs = {
  sessionId: v.id('sessions'),
  previewVersion: v.number(),
}

export const exportArtifactReadyArgs = {
  ...exportArtifactBuildArgs,
  storageId: v.id('_storage'),
  filesStorageId: v.optional(v.id('_storage')),
  filename: v.string(),
  contentType: v.string(),
  fileCount: v.number(),
  byteLength: v.number(),
  hash: v.string(),
}

export const exportArtifactFailureArgs = {
  ...exportArtifactBuildArgs,
  errorMessage: v.string(),
}

export const sessionEditFields = {
  editType,
  targetLabel: v.optional(v.string()),
  beforeText: v.optional(v.string()),
  afterText: v.optional(v.string()),
  afterHtml: v.optional(v.string()),
  instruction: v.optional(v.string()),
  occurrenceIndex: v.optional(v.number()),
}

export const createEditArgs = {
  ...ownedSessionArgs,
  ...sessionEditFields,
}

export const forkSessionArgs = {
  sourceSessionId: v.id('sessions'),
  anonymousOwnerSecret: v.optional(v.string()),
  edit: v.optional(v.object(sessionEditFields)),
}

export const restorePreviewVersionArgs = {
  ...ownedSessionArgs,
  version: v.number(),
}

export const setThemeOverrideArgs = {
  ...ownedSessionArgs,
  themeOverride: v.optional(v.union(v.string(), v.null())),
  themeMode: v.optional(
    v.union(v.literal('light'), v.literal('dark'), v.null()),
  ),
}

export const upsertGenerationTaskArgs = {
  sessionId: v.id('sessions'),
  task: engineTask,
  order: v.number(),
}

export const upsertGeneratedModuleArgs = {
  sessionId: v.id('sessions'),
  moduleKey: v.string(),
  source: v.string(),
  status: v.optional(taskStatus),
}

export const applyCloneBriefArgs = {
  ...ownedSessionArgs,
  cloneBrief: v.string(),
  themeOverride: v.optional(v.any()),
}

export const writeClonePageArgs = {
  ...ownedSessionArgs,
  pathname: v.string(),
  title: v.optional(v.string()),
  // Provide html (inline, small docs) OR storageId (file storage, large docs).
  html: v.optional(v.string()),
  storageId: v.optional(v.id('_storage')),
  isHome: v.boolean(),
  failed: v.boolean(),
  order: v.number(),
  byteLength: v.number(),
  truncated: v.optional(v.boolean()),
}

export const addGenerationEventArgs = {
  sessionId: v.id('sessions'),
  eventType: v.string(),
  message: v.optional(v.string()),
  previewVersion: v.optional(v.number()),
}

export const completeGenerationArgs = {
  sessionId: v.id('sessions'),
  anonymousOwnerSecret: v.optional(v.string()),
  html: v.string(),
  siteSpecJson: v.optional(v.string()),
  openUiSource: v.optional(v.string()),
  tasks: v.array(engineTask),
  elapsed: v.optional(v.number()),
  cost: v.optional(v.number()),
  provider: v.optional(v.string()),
}

export const failGenerationArgs = {
  sessionId: v.id('sessions'),
  anonymousOwnerSecret: v.optional(v.string()),
  message: v.string(),
  elapsed: v.optional(v.number()),
}

export const upsertCommerceConfigArgs = {
  ...ownedSessionArgs,
  backendUrl: v.optional(v.string()),
  adminUrl: v.optional(v.string()),
  storefrontUrl: v.optional(v.string()),
  configJson: v.optional(v.string()),
  errorMessage: v.optional(v.string()),
  productCount: v.optional(v.number()),
}

export const publicGallerySessionsArgs = {
  limit: v.optional(v.number()),
  page: v.optional(v.number()),
  search: v.optional(v.string()),
  category: v.optional(v.string()),
}

export const publicGallerySessionArgs = {
  sessionId: v.string(),
}

export const deploymentSlugArgs = {
  slug: v.string(),
}

export const provisionMedusaTenantArgs = {
  sessionId: v.id('sessions'),
  backendUrl: v.string(),
  adminUrl: v.string(),
  storefrontUrl: v.string(),
}

export const syncMedusaProductsArgs = {
  sessionId: v.id('sessions'),
  products: v.array(medusaProduct),
}

export const recordUsageMetricArgs = {
  sessionId: v.id('sessions'),
  eventType: v.string(),
  elapsedMs: v.number(),
  cost: v.number(),
  provider: v.string(),
  userId: v.optional(v.string()),
  anonymousClientIdHash: v.optional(v.string()),
}

export const userUsageMetricsArgs = {
  userId: v.string(),
  since: v.optional(v.number()),
}

export const operationalNotificationArgs = {
  sessionId: v.id('sessions'),
  eventType: v.string(),
  message: v.optional(v.string()),
  elapsedMs: v.optional(v.number()),
  cost: v.optional(v.number()),
  provider: v.optional(v.string()),
  error: v.optional(v.string()),
  quotaHit: v.optional(v.boolean()),
  cacheHit: v.optional(v.boolean()),
}

export const recordOperationalEventArgs = {
  ...operationalNotificationArgs,
  userId: v.optional(v.string()),
  anonymousClientIdHash: v.optional(v.string()),
}

export const slackNotificationArgs = {
  message: v.string(),
  webhookUrl: v.optional(v.string()),
}

export const telegramNotificationArgs = {
  message: v.string(),
  botToken: v.optional(v.string()),
  chatId: v.optional(v.string()),
}

export const upsertAiCapsuleArgs = {
  sessionId: v.id('sessions'),
  capsuleName: v.string(),
  parentCapsule: v.string(),
  compiledJs: v.string(),
  description: v.string(),
}

export const applySectionEditArgs = {
  sessionId: v.id('sessions'),
  anonymousOwnerSecret: v.optional(v.string()),
  replacementHtml: v.optional(v.string()),
  replacementOpenUiSource: v.optional(v.string()),
  aiCapsule: v.optional(
    v.object({
      capsuleName: v.string(),
      parentCapsule: v.string(),
      compiledJs: v.string(),
      description: v.string(),
    }),
  ),
  instruction: v.string(),
}
