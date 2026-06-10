import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const generationStatus = v.union(
  v.literal('created'),
  v.literal('queued'),
  v.literal('validating'),
  v.literal('streaming'),
  v.literal('homepage_ready'),
  v.literal('site_spec_ready'),
  v.literal('preview_ready'),
  v.literal('failed'),
)

const taskStatus = v.union(
  v.literal('pending'),
  v.literal('running'),
  v.literal('succeeded'),
  v.literal('failed'),
)

const exportTarget = v.union(v.literal('html'), v.literal('react'), v.literal('next'))

const provider = v.union(v.literal('stripe'), v.literal('razorpay'))

const integrationStatus = v.union(
  v.literal('not_configured'),
  v.literal('idle'),
  v.literal('provisioning'),
  v.literal('ready'),
  v.literal('failed'),
)

export default defineSchema({
  sessions: defineTable({
    userId: v.optional(v.string()),
    legacySessionId: v.optional(v.string()),
    anonOwnerSecret: v.optional(v.string()),
    anonOwnerSecretHash: v.optional(v.string()),
    workspace: v.optional(v.string()),
    prompt: v.string(),
    status: v.optional(generationStatus),
    genuiStatus: v.optional(v.string()),
    homepageReady: v.optional(v.boolean()),
    siteSpecReady: v.optional(v.boolean()),
    openuiReady: v.optional(v.boolean()),
    elapsed: v.optional(v.number()),
    cost: v.optional(v.number()),
    agentationEnabled: v.optional(v.boolean()),
    agentationEnabledAt: v.optional(v.number()),
    agentationSessionId: v.optional(v.string()),
    sanityConfig: v.optional(v.any()),
    medusaConfig: v.optional(v.any()),
    alternativeDesign: v.optional(v.any()),
    themeOverride: v.optional(v.any()),
    deploymentSlug: v.optional(v.string()),
    deploymentUrl: v.optional(v.string()),
    deployedAt: v.optional(v.number()),
    programOverride: v.optional(v.string()),
    genuiProgramOverride: v.optional(v.string()),
    genuiSkeleton: v.optional(v.string()),
    genuiTheme: v.optional(v.string()),
    genuiError: v.optional(v.string()),
    preferredLanguage: v.string(),
    preferredExportTarget: v.string(),
    isPrivate: v.boolean(),
    previewVersion: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    errorCode: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  })
    .index('by_userId', ['userId'])
    .index('by_public_createdAt', ['isPrivate', 'createdAt']),

  tasks: defineTable({
    sessionId: v.id('sessions'),
    taskKey: v.optional(v.string()),
    taskId: v.optional(v.string()),
    title: v.string(),
    status: v.string(),
    order: v.optional(v.number()),
    filename: v.optional(v.string()),
    description: v.optional(v.string()),
    dependsOn: v.optional(v.array(v.string())),
    files: v.optional(v.array(v.string())),
    actions: v.optional(v.array(v.string())),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_sessionId', ['sessionId'])
    .index('by_sessionId_taskKey', ['sessionId', 'taskKey']),

  generationEvents: defineTable({
    sessionId: v.id('sessions'),
    eventType: v.string(),
    message: v.optional(v.string()),
    previewVersion: v.optional(v.number()),
    createdAt: v.number(),
  }).index('by_sessionId_createdAt', ['sessionId', 'createdAt']),

  generatedModules: defineTable({
    sessionId: v.id('sessions'),
    moduleKey: v.string(),
    source: v.string(),
    status: taskStatus,
    createdAt: v.number(),
    updatedAt: v.number(),
    errorMessage: v.optional(v.string()),
  }).index('by_sessionId_moduleKey', ['sessionId', 'moduleKey']),

  siteSpecs: defineTable({
    sessionId: v.id('sessions'),
    specJson: v.optional(v.string()),
    spec: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index('by_sessionId', ['sessionId']),

  previews: defineTable({
    sessionId: v.id('sessions'),
    version: v.number(),
    html: v.string(),
    createdAt: v.number(),
    source: v.union(
      v.literal('generation'),
      v.literal('edit'),
      v.literal('rewrite'),
      v.literal('cms'),
      v.literal('history_restore'),
    ),
  }).index('by_sessionId_version', ['sessionId', 'version']),

  edits: defineTable({
    sessionId: v.id('sessions'),
    previewVersion: v.number(),
    editType: v.union(v.literal('text'), v.literal('ai_rewrite'), v.literal('chat')),
    targetLabel: v.optional(v.string()),
    beforeText: v.optional(v.string()),
    afterText: v.optional(v.string()),
    instruction: v.optional(v.string()),
    createdAt: v.number(),
    userId: v.optional(v.string()),
  }).index('by_sessionId_createdAt', ['sessionId', 'createdAt']),

  agentationAnnotations: defineTable({
    sessionId: v.id('sessions'),
    annotationId: v.string(),
    agentationSessionKey: v.optional(v.string()),
    agentationSessionId: v.optional(v.string()),
    comment: v.string(),
    element: v.optional(v.string()),
    elementLabel: v.optional(v.string()),
    elementPath: v.optional(v.string()),
    url: v.optional(v.string()),
    payload: v.optional(v.any()),
    payloadJson: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_sessionId_annotationId', ['sessionId', 'annotationId']),

  exports: defineTable({
    sessionId: v.id('sessions'),
    target: v.string(),
    status: v.string(),
    artifactPath: v.optional(v.string()),
    url: v.optional(v.string()),
    fileCount: v.optional(v.number()),
    requiresPayment: v.optional(v.boolean()),
    error: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_sessionId_target', ['sessionId', 'target']),

  deployments: defineTable({
    sessionId: v.id('sessions'),
    slug: v.string(),
    url: v.string(),
    status: v.union(v.literal('ready'), v.literal('failed')),
    createdAt: v.number(),
    updatedAt: v.number(),
    errorMessage: v.optional(v.string()),
  })
    .index('by_sessionId', ['sessionId'])
    .index('by_slug', ['slug']),

  cmsConfigs: defineTable({
    sessionId: v.id('sessions'),
    status: v.optional(integrationStatus),
    cmsType: v.optional(v.string()),
    config: v.optional(v.any()),
    projectId: v.optional(v.string()),
    dataset: v.optional(v.string()),
    configJson: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_sessionId', ['sessionId']),

  commerceConfigs: defineTable({
    sessionId: v.id('sessions'),
    status: integrationStatus,
    backendUrl: v.optional(v.string()),
    adminUrl: v.optional(v.string()),
    storefrontUrl: v.optional(v.string()),
    productCount: v.optional(v.number()),
    configJson: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_sessionId', ['sessionId']),

  chatMessages: defineTable({
    sessionId: v.id('sessions'),
    role: v.string(),
    content: v.string(),
    createdAt: v.number(),
  }).index('by_sessionId_createdAt', ['sessionId', 'createdAt']),

  genuiModules: defineTable({
    sessionId: v.id('sessions'),
    moduleId: v.string(),
    text: v.string(),
    failed: v.boolean(),
    startedAt: v.number(),
    completedAt: v.number(),
  })
    .index('by_sessionId', ['sessionId'])
    .index('by_sessionId_moduleId', ['sessionId', 'moduleId']),

  previewHistory: defineTable({
    sessionId: v.id('sessions'),
    html: v.string(),
    timestamp: v.number(),
  }).index('by_sessionId', ['sessionId']),

  themeOverrides: defineTable({
    sessionId: v.id('sessions'),
    themeName: v.string(),
    styles: v.any(),
    createdAt: v.number(),
  }).index('by_sessionId', ['sessionId']),

  chatSummaries: defineTable({
    sessionId: v.id('sessions'),
    summary: v.string(),
    createdAt: v.number(),
  }).index('by_sessionId', ['sessionId']),

  customerCredits: defineTable({
    userId: v.string(),
    remaining: v.number(),
    updatedAt: v.number(),
  }).index('by_userId', ['userId']),

  subscriptions: defineTable({
    userId: v.string(),
    provider,
    status: v.union(
      v.literal('active'),
      v.literal('trialing'),
      v.literal('authenticated'),
      v.literal('past_due'),
      v.literal('cancelled'),
    ),
    planId: v.string(),
    providerSubscriptionId: v.optional(v.string()),
    providerCheckoutId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    canceledAt: v.optional(v.number()),
  })
    .index('by_userId', ['userId'])
    .index('by_providerSubscriptionId', ['providerSubscriptionId']),

  webhookEvents: defineTable({
    provider,
    idempotencyKey: v.string(),
    processedAt: v.number(),
  }).index('by_provider_idempotencyKey', ['provider', 'idempotencyKey']),
})
