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

const exportTarget = v.union(
  v.literal('html'),
  v.literal('react'),
  v.literal('next'),
  v.literal('lakebed'),
)

const exportArtifactStatus = v.union(
  v.literal('queued'),
  v.literal('building'),
  v.literal('ready'),
  v.literal('failed'),
)

const provider = v.union(v.literal('stripe'), v.literal('razorpay'))

const integrationStatus = v.union(
  v.literal('not_configured'),
  v.literal('idle'),
  v.literal('provisioning'),
  v.literal('ready'),
  v.literal('failed'),
)

const cmsCollectionKey = v.union(v.literal('blogPosts'))

const cmsCollectionItemStatus = v.union(
  v.literal('draft'),
  v.literal('published'),
)

export default defineSchema({
  sessions: defineTable({
    userId: v.optional(v.string()),
    ownerEmail: v.optional(v.string()),
    legacySessionId: v.optional(v.string()),
    anonOwnerSecret: v.optional(v.string()),
    anonOwnerSecretHash: v.optional(v.string()),
    anonymousClientIdHash: v.optional(v.string()),
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
    themeMode: v.optional(v.union(v.literal('light'), v.literal('dark'))),
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
    designReferenceUrls: v.optional(v.array(v.string())),
    designReferenceNotes: v.optional(v.string()),
    cloneUrl: v.optional(v.string()),
    cloneBrief: v.optional(v.string()),
    designReferenceFingerprint: v.optional(v.string()),
    promptCacheKey: v.optional(v.string()),
    engineVersion: v.optional(v.string()),
    isPrivate: v.boolean(),
    previewVersion: v.optional(v.number()),
    cloneMode: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    errorCode: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  })
    .index('by_userId', ['userId'])
    .index('by_anonymousClientIdHash', ['anonymousClientIdHash'])
    .index('by_workspace', ['workspace'])
    .index('by_promptCacheKey', ['promptCacheKey'])
    .index('by_public_createdAt', ['isPrivate', 'createdAt'])
    .index('by_deploymentSlug', ['deploymentSlug']),

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
    elapsedMs: v.optional(v.number()),
    cost: v.optional(v.number()),
    provider: v.optional(v.string()),
    error: v.optional(v.string()),
    quotaHit: v.optional(v.boolean()),
    cacheHit: v.optional(v.boolean()),
  }).index('by_sessionId_createdAt', ['sessionId', 'createdAt']),
  usageMetrics: defineTable({
    sessionId: v.id('sessions'),
    eventType: v.string(),
    timestamp: v.number(),
    elapsedMs: v.number(),
    cost: v.number(),
    provider: v.string(),
    userId: v.optional(v.string()),
    anonymousClientIdHash: v.optional(v.string()),
  })
    .index('by_sessionId', ['sessionId'])
    .index('by_timestamp', ['timestamp'])
    .index('by_userId', ['userId']),

  generatedModules: defineTable({
    sessionId: v.id('sessions'),
    moduleKey: v.string(),
    source: v.string(),
    status: taskStatus,
    createdAt: v.number(),
    updatedAt: v.number(),
    errorMessage: v.optional(v.string()),
  }).index('by_sessionId_moduleKey', ['sessionId', 'moduleKey']),

  clonePages: defineTable({
    sessionId: v.id('sessions'),
    pathname: v.string(),
    title: v.optional(v.string()),
    // Small docs (≤ ~900KB) keep the inline html string + iframe srcDoc path.
    // Large verbatim clones exceed Convex's 1 MiB per-document limit, so they go
    // to file storage instead and the row carries a storageId (html stays unset).
    html: v.optional(v.string()),
    storageId: v.optional(v.id('_storage')),
    isHome: v.boolean(),
    failed: v.boolean(),
    order: v.number(),
    byteLength: v.number(),
    truncated: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_sessionId', ['sessionId'])
    .index('by_sessionId_pathname', ['sessionId', 'pathname']),

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
    openUiSource: v.optional(v.string()),
    siteSpecJson: v.optional(v.string()),
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
    editType: v.union(
      v.literal('text'),
      v.literal('ai_rewrite'),
      v.literal('chat'),
      v.literal('style'),
      v.literal('image'),
    ),
    targetLabel: v.optional(v.string()),
    beforeText: v.optional(v.string()),
    afterText: v.optional(v.string()),
    afterHtml: v.optional(v.string()),
    instruction: v.optional(v.string()),
    occurrenceIndex: v.optional(v.number()),
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
  })
    .index('by_sessionId_annotationId', ['sessionId', 'annotationId'])
    .index('by_annotationId', ['annotationId']),

  exports: defineTable({
    sessionId: v.id('sessions'),
    target: exportTarget,
    status: v.string(),
    artifactPath: v.optional(v.string()),
    previewVersion: v.optional(v.number()),
    url: v.optional(v.string()),
    downloadUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    deployedUrl: v.optional(v.string()),
    fileCount: v.optional(v.number()),
    requiresPayment: v.optional(v.boolean()),
    error: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_sessionId_target', ['sessionId', 'target']),

  exportArtifacts: defineTable({
    sessionId: v.id('sessions'),
    target: exportTarget,
    previewVersion: v.number(),
    status: exportArtifactStatus,
    storageId: v.optional(v.id('_storage')),
    filesStorageId: v.optional(v.id('_storage')),
    filename: v.optional(v.string()),
    contentType: v.optional(v.string()),
    fileCount: v.optional(v.number()),
    byteLength: v.optional(v.number()),
    hash: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_sessionId_target', ['sessionId', 'target'])
    .index('by_sessionId_target_previewVersion', [
      'sessionId',
      'target',
      'previewVersion',
    ]),

  githubConnections: defineTable({
    clerkTokenIdentifier: v.string(),
    clerkUserId: v.string(),
    githubUserId: v.number(),
    githubLogin: v.string(),
    accessToken: v.string(),
    scopes: v.array(v.string()),
    connectedAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_clerkTokenIdentifier', ['clerkTokenIdentifier'])
    .index('by_githubUserId', ['githubUserId']),

  githubOAuthStates: defineTable({
    state: v.string(),
    clerkTokenIdentifier: v.string(),
    clerkUserId: v.string(),
    sessionId: v.optional(v.string()),
    target: v.optional(exportTarget),
    returnTo: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index('by_state', ['state'])
    .index('by_clerkTokenIdentifier', ['clerkTokenIdentifier']),

  deployments: defineTable({
    sessionId: v.id('sessions'),
    slug: v.string(),
    url: v.string(),
    status: v.union(v.literal('ready'), v.literal('failed')),
    provider: v.optional(v.union(v.literal('ship-fast'), v.literal('lakebed'))),
    previewVersion: v.optional(v.number()),
    lakebedDeployId: v.optional(v.string()),
    lakebedClaimUrl: v.optional(v.string()),
    lakebedArtifactHash: v.optional(v.string()),
    lakebedClientBundleHash: v.optional(v.string()),
    lakebedClientBundleBytes: v.optional(v.number()),
    lakebedRequestBodyBytes: v.optional(v.number()),
    lakebedServerBundleBytes: v.optional(v.number()),
    lakebedSourceFileCount: v.optional(v.number()),
    lakebedExpiresAt: v.optional(v.string()),
    lakebedInspectPolicy: v.optional(v.string()),
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

  // Cache of the AI-authored composition content (family + per-page section
  // props) keyed by the normalized prompt. Sessions reuse this content and a
  // per-session seed re-randomizes the COMPOSITION (which sections/order/theme/
  // pages), so the same prompt yields a different layout every time at zero
  // extra model cost. Replaces cloning a finished session verbatim.
  sectionContentCache: defineTable({
    promptCacheKey: v.string(),
    contentJson: v.string(),
    createdAt: v.number(),
  }).index('by_promptCacheKey', ['promptCacheKey']),

  cmsBindings: defineTable({
    sessionId: v.id('sessions'),
    selector: v.string(),
    type: v.union(
      v.literal('text'),
      v.literal('richtext'),
      v.literal('image'),
      v.literal('link'),
    ),
    field: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_sessionId', ['sessionId'])
    .index('by_sessionId_selector', ['sessionId', 'selector']),

  cmsEntries: defineTable({
    sessionId: v.id('sessions'),
    bindingId: v.id('cmsBindings'),
    content: v.string(),
    contentType: v.optional(v.string()),
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  })
    .index('by_sessionId', ['sessionId'])
    .index('by_bindingId', ['bindingId']),

  cmsRevisions: defineTable({
    entryId: v.id('cmsEntries'),
    content: v.string(),
    contentType: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_entryId', ['entryId'])
    .index('by_entryId_createdAt', ['entryId', 'createdAt']),

  cmsCollections: defineTable({
    sessionId: v.id('sessions'),
    key: cmsCollectionKey,
    label: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_sessionId', ['sessionId'])
    .index('by_sessionId_key', ['sessionId', 'key']),

  cmsCollectionItems: defineTable({
    sessionId: v.id('sessions'),
    collectionId: v.id('cmsCollections'),
    collectionKey: cmsCollectionKey,
    slug: v.string(),
    title: v.string(),
    excerpt: v.string(),
    author: v.string(),
    category: v.string(),
    coverImageUrl: v.optional(v.string()),
    body: v.string(),
    status: cmsCollectionItemStatus,
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  })
    .index('by_sessionId', ['sessionId'])
    .index('by_collectionId', ['collectionId'])
    .index('by_sessionId_collectionKey', ['sessionId', 'collectionKey'])
    .index('by_sessionId_collectionKey_slug', [
      'sessionId',
      'collectionKey',
      'slug',
    ])
    .index('by_sessionId_collectionKey_status', [
      'sessionId',
      'collectionKey',
      'status',
    ]),

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

  sessionData: defineTable({
    sessionId: v.id('sessions'),
    capsule: v.string(),
    ownerKey: v.optional(v.string()),
    userId: v.optional(v.string()),
    anonymousOwnerSecretHash: v.optional(v.string()),
    data: v.record(v.string(), v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_sessionId', ['sessionId'])
    .index('by_sessionId_ownerKey', ['sessionId', 'ownerKey'])
    .index('by_sessionId_capsule', ['sessionId', 'capsule'])
    .index('by_sessionId_capsule_ownerKey', [
      'sessionId',
      'capsule',
      'ownerKey',
    ])
    .index('by_userId', ['userId']),

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

  creditLedger: defineTable({
    userId: v.string(),
    sessionId: v.optional(v.id('sessions')),
    amount: v.number(),
    balanceAfter: v.number(),
    reason: v.string(),
    createdAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_userId_createdAt', ['userId', 'createdAt']),

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
    // Referral reward audit trail: when a referrer's 50%-for-life discount has
    // been applied to this subscription at the payment provider.
    referralDiscountPercent: v.optional(v.number()),
    referralDiscountAppliedAt: v.optional(v.number()),
    referralDiscountProviderId: v.optional(v.string()),
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

  // ── Referral / sponsorship program ──────────────────────────────────────
  // Each user owns one stable referral code. Sharing /?ref=CODE attributes new
  // signups to the owner.
  referralCodes: defineTable({
    userId: v.string(),
    code: v.string(),
    createdAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_code', ['code']),

  // One row per referred user. status transitions:
  //   pending      → signed up via a ref link, not yet a paying customer
  //   qualified    → referred user paid AND used a non-disposable email
  //   disqualified → referred user used a disposable email (never counts)
  referrals: defineTable({
    referrerUserId: v.string(),
    referredUserId: v.string(),
    code: v.string(),
    referredEmail: v.optional(v.string()),
    emailDisposable: v.optional(v.boolean()),
    emailSource: v.optional(v.string()),
    status: v.union(
      v.literal('pending'),
      v.literal('qualified'),
      v.literal('disqualified'),
    ),
    paidAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_referrer', ['referrerUserId'])
    .index('by_referrer_status', ['referrerUserId', 'status'])
    .index('by_referred', ['referredUserId']),

  // The unlocked reward state for a referrer. Once `unlocked` flips true (2
  // qualified referrals) it is PERMANENT — referred-user churn never revokes it.
  // The discount only stops applying if the referrer cancels their own sub.
  referralRewards: defineTable({
    userId: v.string(),
    unlocked: v.boolean(),
    unlockedAt: v.optional(v.number()),
    qualifiedCount: v.number(),
    discountPercent: v.number(),
    // Set once we have attached the provider coupon to the referrer's live sub.
    discountAppliedAt: v.optional(v.number()),
    discountProvider: v.optional(provider),
    discountProviderId: v.optional(v.string()),
    discountSubscriptionId: v.optional(v.string()),
    updatedAt: v.number(),
  }).index('by_userId', ['userId']),
})
