import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  sessions: defineTable({
    userId: v.optional(v.string()),
    legacySessionId: v.optional(v.string()),
    anonOwnerSecret: v.optional(v.string()),
    prompt: v.string(),
    createdAt: v.number(),
    workspace: v.string(),
    homepageReady: v.boolean(),
    siteSpecReady: v.boolean(),
    openuiReady: v.boolean(),
    elapsed: v.optional(v.number()),
    cost: v.optional(v.number()),
    preferredExportTarget: v.string(),
    preferredLanguage: v.string(),
    isPrivate: v.boolean(),
    sanityConfig: v.optional(v.any()),
    medusaConfig: v.optional(v.any()),
    deploymentSlug: v.optional(v.string()),
    deploymentUrl: v.optional(v.string()),
    deployedAt: v.optional(v.number()),
    agentationEnabled: v.optional(v.boolean()),
    agentationSessionId: v.optional(v.string()),
    agentationEnabledAt: v.optional(v.number()),
    programOverride: v.optional(v.string()),
    genuiStatus: v.optional(v.string()),
    genuiSkeleton: v.optional(v.string()),
    genuiTheme: v.optional(v.string()),
    genuiError: v.optional(v.string()),
  })
    .index('by_userId', ['userId'])
    .index('by_legacySessionId', ['legacySessionId'])
    .index('by_createdAt', ['createdAt']),

  tasks: defineTable({
    sessionId: v.id('sessions'),
    taskId: v.string(),
    title: v.string(),
    status: v.string(),
    filename: v.optional(v.string()),
    description: v.optional(v.string()),
    dependsOn: v.optional(v.array(v.string())),
    files: v.optional(v.array(v.string())),
    actions: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index('by_sessionId', ['sessionId']),

  agentationAnnotations: defineTable({
    sessionId: v.id('sessions'),
    annotationId: v.string(),
    agentationSessionId: v.optional(v.string()),
    comment: v.string(),
    element: v.string(),
    elementPath: v.string(),
    url: v.optional(v.string()),
    payload: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_sessionId', ['sessionId'])
    .index('by_sessionId_annotationId', ['sessionId', 'annotationId']),

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

  siteSpecs: defineTable({
    sessionId: v.id('sessions'),
    spec: v.string(),
    createdAt: v.number(),
  })
    .index('by_sessionId', ['sessionId']),

  exports: defineTable({
    sessionId: v.id('sessions'),
    target: v.string(),
    status: v.string(),
    url: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_sessionId', ['sessionId']),

  previewHistory: defineTable({
    sessionId: v.id('sessions'),
    html: v.string(),
    timestamp: v.number(),
  })
    .index('by_sessionId', ['sessionId']),

  cmsConfigs: defineTable({
    sessionId: v.id('sessions'),
    cmsType: v.string(),
    config: v.any(),
    createdAt: v.number(),
  })
    .index('by_sessionId', ['sessionId']),

  themeOverrides: defineTable({
    sessionId: v.id('sessions'),
    themeName: v.string(),
    styles: v.any(),
    createdAt: v.number(),
  })
    .index('by_sessionId', ['sessionId']),

  chatMessages: defineTable({
    sessionId: v.id('sessions'),
    role: v.string(),
    content: v.string(),
    createdAt: v.number(),
  })
    .index('by_sessionId', ['sessionId']),

  chatSummaries: defineTable({
    sessionId: v.id('sessions'),
    summary: v.string(),
    createdAt: v.number(),
  })
    .index('by_sessionId', ['sessionId']),
})
