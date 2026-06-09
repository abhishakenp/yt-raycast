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
})
