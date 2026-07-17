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
const acquisitionSource = v.union(
  v.literal('native_referral'),
  v.literal('dub_partner'),
)
const dubOutboxStatus = v.union(
  v.literal('pending'),
  v.literal('processing'),
  v.literal('completed'),
  v.literal('dead_letter'),
)
const dubOutboxBase = {
  userId: v.string(),
  idempotencyKey: v.string(),
  status: dubOutboxStatus,
  attemptCount: v.number(),
  nextAttemptAt: v.number(),
  leaseExpiresAt: v.optional(v.number()),
  lastError: v.optional(v.string()),
  completedAt: v.optional(v.number()),
  invoiceId: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
}

const integrationStatus = v.union(
  v.literal('not_configured'),
  v.literal('idle'),
  v.literal('provisioning'),
  v.literal('ready'),
  v.literal('failed'),
)

const commerceTenantStatus = v.union(
  v.literal('not_enabled'),
  v.literal('provisioning'),
  v.literal('syncing_products'),
  v.literal('ready'),
  v.literal('degraded'),
  v.literal('failed'),
)

const commerceTenantSyncStatus = v.union(
  v.literal('idle'),
  v.literal('pulling_updates'),
  v.literal('ready'),
  v.literal('failed'),
)

export default defineSchema({
  sessions: defineTable({
    userId: v.optional(v.string()),
    ownerEmail: v.optional(v.string()),
    legacySessionId: v.optional(v.string()),
    anonOwnerSecret: v.optional(v.string()),
    anonOwnerSecretHash: v.optional(v.string()),
    anonymousClientIdHash: v.optional(v.string()),
    clientIpHash: v.optional(v.string()),
    workspace: v.optional(v.string()),
    prompt: v.string(),
    status: v.optional(generationStatus),
    genuiStatus: v.optional(v.string()),
    homepageReady: v.optional(v.boolean()),
    siteSpecReady: v.optional(v.boolean()),
    openuiReady: v.optional(v.boolean()),
    elapsed: v.optional(v.number()),
    cost: v.optional(v.number()),
    medusaConfig: v.optional(v.any()),
    alternativeDesign: v.optional(v.any()),
    themeOverride: v.optional(v.any()),
    themeMode: v.optional(v.union(v.literal('light'), v.literal('dark'))),
    selectedBrandLogo: v.optional(
      v.object({
        name: v.string(),
        domain: v.union(v.string(), v.null()),
        brandId: v.union(v.string(), v.null()),
        icon: v.union(v.string(), v.null()),
        logo: v.union(v.string(), v.null()),
      }),
    ),
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
    agentationEnabled: v.optional(v.boolean()),
    agentationEnabledAt: v.optional(v.number()),
    agentationSessionId: v.optional(v.string()),
  })
    .index('by_userId', ['userId'])
    .index('by_userId_createdAt', ['userId', 'createdAt'])
    .index('by_anonymousClientIdHash', ['anonymousClientIdHash'])
    .index('by_anonymousClientIdHash_createdAt', [
      'anonymousClientIdHash',
      'createdAt',
    ])
    .index('by_clientIpHash', ['clientIpHash'])
    .index('by_clientIpHash_createdAt', ['clientIpHash', 'createdAt'])
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
      v.literal('history_restore'),
      v.literal('cms'),
    ),
  }).index('by_sessionId_version', ['sessionId', 'version']),

  edits: defineTable({
    sessionId: v.id('sessions'),
    previewVersion: v.number(),
    editType: v.union(
      v.literal('text'),
      v.literal('ai_rewrite'),
      v.literal('style'),
      v.literal('image'),
      v.literal('delete'),
      // Legacy value from the pre-rewrite app; prod docs still carry it and
      // Convex schema validation rejects deploys without it.
      v.literal('chat'),
    ),
    targetLabel: v.optional(v.string()),
    beforeText: v.optional(v.string()),
    afterText: v.optional(v.string()),
    afterHtml: v.optional(v.string()),
    instruction: v.optional(v.string()),
    occurrenceIndex: v.optional(v.number()),
    locale: v.optional(v.string()),
    canonicalSourceText: v.optional(v.string()),
    createdAt: v.number(),
    userId: v.optional(v.string()),
  })
    .index('by_sessionId_createdAt', ['sessionId', 'createdAt'])
    .index('by_sessionId_locale_canonicalSourceText', [
      'sessionId',
      'locale',
      'canonicalSourceText',
    ]),

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
    locale: v.optional(v.string()),
    status: exportArtifactStatus,
    storageId: v.optional(v.id('_storage')),
    filesStorageId: v.optional(v.id('_storage')),
    filename: v.optional(v.string()),
    contentType: v.optional(v.string()),
    fileCount: v.optional(v.number()),
    byteLength: v.optional(v.number()),
    hash: v.optional(v.string()),
    generatorRevision: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    // Real, event-driven build (and, for lakebed, deploy) progress. Written
    // as each actual pipeline stage completes — never a simulated/timed
    // value. progressStartedAt anchors elapsed-time/ETA display on the
    // client and is set once when the build begins.
    progressStage: v.optional(v.string()),
    progressPercent: v.optional(v.number()),
    progressStartedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_sessionId_target', ['sessionId', 'target'])
    .index('by_sessionId_target_previewVersion', [
      'sessionId',
      'target',
      'previewVersion',
    ])
    .index('by_sessionId_target_previewVersion_locale', [
      'sessionId',
      'target',
      'previewVersion',
      'locale',
    ]),

  githubConnections: defineTable({
    clerkTokenIdentifier: v.optional(v.string()),
    clerkUserId: v.optional(v.string()),
    anonymousClientIdHash: v.optional(v.string()),
    githubUserId: v.number(),
    githubLogin: v.string(),
    accessToken: v.string(),
    scopes: v.array(v.string()),
    connectedAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_clerkTokenIdentifier', ['clerkTokenIdentifier'])
    .index('by_anonymousClientIdHash', ['anonymousClientIdHash'])
    .index('by_githubUserId', ['githubUserId']),

  githubOAuthStates: defineTable({
    state: v.string(),
    clerkTokenIdentifier: v.optional(v.string()),
    clerkUserId: v.optional(v.string()),
    anonymousClientIdHash: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    target: v.optional(exportTarget),
    returnTo: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index('by_state', ['state'])
    .index('by_clerkTokenIdentifier', ['clerkTokenIdentifier'])
    .index('by_anonymousClientIdHash', ['anonymousClientIdHash']),

  deployments: defineTable({
    sessionId: v.id('sessions'),
    slug: v.string(),
    url: v.string(),
    status: v.union(
      v.literal('ready'),
      v.literal('failed'),
      v.literal('updating'),
    ),
    provider: v.optional(v.union(v.literal('ship-fast'), v.literal('lakebed'))),
    previewVersion: v.optional(v.number()),
    pendingPreviewVersion: v.optional(v.number()),
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

  // Content-addressed cache of Prettier-formatted export file output. Keyed by
  // hash(parser + format options + raw file content) — formatting is a pure
  // deterministic transform, so identical raw content (e.g. unchanged
  // boilerplate/section-kit/theme files when only one thing — theme, logo,
  // language — changed elsewhere) skips reformatting, shared across builds and
  // sessions. A prettier option change alters the hash input and naturally
  // busts stale entries; no manual invalidation needed.
  exportRenderCache: defineTable({
    hash: v.string(),
    content: v.string(),
    updatedAt: v.number(),
  }).index('by_hash', ['hash']),

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

  commerceTenants: defineTable({
    deploymentId: v.id('deployments'),
    sessionId: v.id('sessions'),
    deploymentSlug: v.string(),
    provider: v.string(),
    providerTenantId: v.optional(v.string()),
    status: commerceTenantStatus,
    syncStatus: commerceTenantSyncStatus,
    backendUrl: v.string(),
    adminUrl: v.string(),
    storefrontUrl: v.string(),
    publishableKey: v.optional(v.string()),
    databaseRef: v.optional(v.string()),
    secretRef: v.optional(v.string()),
    webhookSecretHash: v.optional(v.string()),
    productCount: v.optional(v.number()),
    lastPullAt: v.optional(v.number()),
    lastWebhookAt: v.optional(v.number()),
    lastHealthCheckAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_deploymentId', ['deploymentId'])
    .index('by_deploymentSlug', ['deploymentSlug'])
    .index('by_sessionId', ['sessionId']),

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
    .index('by_userId_status', ['userId', 'status'])
    .index('by_providerSubscriptionId', ['providerSubscriptionId'])
    .index('by_provider_and_providerSubscriptionId', [
      'provider',
      'providerSubscriptionId',
    ]),

  webhookEvents: defineTable({
    provider,
    idempotencyKey: v.string(),
    processedAt: v.number(),
  }).index('by_provider_idempotencyKey', ['provider', 'idempotencyKey']),

  // ── Referral / sponsorship program ──────────────────────────────────────
  acquisitionAttributions: defineTable({
    userId: v.string(),
    source: acquisitionSource,
    sourceKey: v.string(),
    claimedAt: v.number(),
  }).index('by_userId', ['userId']),

  dubEventOutbox: defineTable(
    v.union(
      v.object({
        ...dubOutboxBase,
        kind: v.literal('lead'),
        clickId: v.string(),
        customerName: v.optional(v.string()),
        customerEmail: v.optional(v.string()),
        customerAvatar: v.optional(v.string()),
      }),
      v.object({
        ...dubOutboxBase,
        kind: v.literal('sale'),
        invoiceId: v.string(),
        amount: v.number(),
        currency: v.string(),
        provider: v.literal('razorpay'),
        providerSubscriptionId: v.string(),
        providerPaymentId: v.optional(v.string()),
        paymentProcessor: v.literal('custom'),
      }),
      v.object({
        ...dubOutboxBase,
        kind: v.literal('refund'),
        invoiceId: v.string(),
        refundId: v.string(),
        amount: v.number(),
        remainingAmount: v.number(),
        currency: v.string(),
        provider: v.literal('razorpay'),
        providerPaymentId: v.optional(v.string()),
      }),
    ),
  )
    .index('by_idempotencyKey', ['idempotencyKey'])
    .index('by_status_and_nextAttemptAt', ['status', 'nextAttemptAt'])
    .index('by_kind_and_invoiceId', ['kind', 'invoiceId'])
    .index('by_userId', ['userId']),

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

  aiCapsules: defineTable({
    sessionId: v.id('sessions'),
    capsuleName: v.string(),
    parentCapsule: v.string(),
    compiledJs: v.string(),
    description: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_sessionId', ['sessionId'])
    .index('by_sessionId_capsuleName', ['sessionId', 'capsuleName']),

  // User-uploaded images for inline image swaps. Stored in Convex file
  // storage (storageId → getUrl) and surfaced alongside stock search results
  // in the ImageSwapPopover.
  userImages: defineTable({
    sessionId: v.id('sessions'),
    storageId: v.id('_storage'),
    // Original filename for display (optional — browsers may not provide one)
    filename: v.optional(v.string()),
    // MIME type of the uploaded file (image/png, image/jpeg, …)
    contentType: v.string(),
    // File size in bytes (for quota / display)
    size: v.number(),
    createdAt: v.number(),
  }).index('by_sessionId', ['sessionId']),

  // AI-generated custom languages created from the dashboard language picker.
  // When a user types a language not in the static KNOWN_LANGUAGES list, the
  // AI generates a native-script name + font family and stores it here so all
  // future users can find it via full-text search (Roman + native script).
  customLanguages: defineTable({
    // Stable slug used as the preferredLanguage code on sessions, e.g. "klingon".
    code: v.string(),
    // English / Roman display name, e.g. "Klingon".
    name: v.string(),
    // Native-script transcript shown beneath the name, e.g. "tlhIngan Hol".
    nativeName: v.string(),
    // Font stack for the script (AI picks from Noto families or Latin fallback).
    fontFamily: v.string(),
    // Extra search aliases (Roman variants, alternate spellings).
    keywords: v.array(v.string()),
    // Concatenation of name + nativeName + keywords — the search index field.
    searchText: v.string(),
    createdAt: v.number(),
  })
    .index('by_code', ['code'])
    .searchIndex('search_all', { searchField: 'searchText' }),

  translationCache: defineTable({
    cacheKey: v.string(),
    locale: v.string(),
    sourceText: v.string(),
    translation: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_cacheKey', ['cacheKey'])
    .index('by_locale', ['locale'])
    .index('by_sourceText', ['sourceText']),

  translationCacheClaims: defineTable({
    cacheKey: v.string(),
    locale: v.string(),
    sourceText: v.string(),
    owner: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_cacheKey', ['cacheKey']),

  sessionTranslationOverrides: defineTable({
    sessionId: v.id('sessions'),
    locale: v.string(),
    sourceText: v.string(),
    translation: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_sessionId_locale_sourceText', [
      'sessionId',
      'locale',
      'sourceText',
    ])
    .index('by_sessionId', ['sessionId']),
})
