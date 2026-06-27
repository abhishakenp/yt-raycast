import { register as registerDebouncer } from '@ikhrustalev/convex-debouncer/test'
import { convexTest } from 'convex-test'
import type { FunctionArgs } from 'convex/server'
import { describe, expect, it } from 'vitest'

import { api } from '../_generated/api'
import schema from '../schema'

import {
  addGenerationEventArgs,
  agentationSyncAnnotationArgs,
  annotationFields,
  claimAnonymousArgs,
  completeGenerationArgs,
  createEditArgs,
  createGenerationSessionArgs,
  deleteMineArgs,
  deleteOwnedAnnotationArgs,
  deploymentSlugArgs,
  editType,
  engineTask,
  eventStreamArgs,
  exportRecordArgs,
  exportTarget,
  extractCmsBindingsArgs,
  failGenerationArgs,
  forkSessionArgs,
  generationViewArgs,
  insertCmsBindingArgs,
  listCmsRevisionsArgs,
  lookupArgs,
  medusaProduct,
  operationalNotificationArgs,
  ownedAnnotationArgs,
  ownedExportArgs,
  ownedSessionArgs,
  provisionMedusaTenantArgs,
  publicGallerySessionArgs,
  publicGallerySessionsArgs,
  publishPreviewArgs,
  recordOperationalEventArgs,
  recordUsageMetricArgs,
  restoreCmsRevisionArgs,
  restorePreviewVersionArgs,
  saveAgentationSessionArgs,
  sendChatMessageArgs,
  sessionIdArgs,
  sessionEditFields,
  setThemeOverrideArgs,
  slackNotificationArgs,
  syncMedusaProductsArgs,
  telegramNotificationArgs,
  updateAgentationSyncAnnotationArgs,
  updateCmsEntryArgs,
  upsertCmsCollectionItemArgs,
  upsertCmsConfigArgs,
  upsertCommerceConfigArgs,
  upsertGeneratedModuleArgs,
  upsertGenerationTaskArgs,
  userUsageMetricsArgs,
} from './session_validators'

const modules = import.meta.glob('../**/*.ts')

const sessionValidatorsConvexTest = () => {
  const t = convexTest(schema, modules)
  registerDebouncer(t)
  return t
}

describe('session validators boundary', () => {
  it('exports the shared validator objects with expected field shapes', () => {
    // Representative sample of the validator objects that sessions.ts imports.
    // Each must be a plain object whose keys map to Convex validators.
    expect(sessionIdArgs).toMatchObject({
      sessionId: expect.any(Object),
    })
    expect(lookupArgs).toMatchObject({
      lookup: expect.any(Object),
    })
    expect(generationViewArgs).toMatchObject({
      sessionId: expect.any(Object),
      lookup: expect.any(Object),
    })
    expect(eventStreamArgs).toMatchObject({
      sessionId: expect.any(Object),
      lookup: expect.any(Object),
      since: expect.any(Object),
      limit: expect.any(Object),
      anonymousOwnerSecret: expect.any(Object),
    })
    expect(deleteMineArgs).toMatchObject({
      anonymousClientId: expect.any(Object),
      sessionId: expect.any(Object),
    })
    expect(createGenerationSessionArgs).toMatchObject({
      prompt: expect.any(Object),
      preferredLanguage: expect.any(Object),
      preferredExportTarget: expect.any(Object),
      isPrivate: expect.any(Object),
      workspace: expect.any(Object),
    })
    expect(ownedSessionArgs).toMatchObject({
      sessionId: expect.any(Object),
      anonymousOwnerSecret: expect.any(Object),
    })
    expect(claimAnonymousArgs).toMatchObject({
      sessionId: expect.any(Object),
      anonymousOwnerSecret: expect.any(Object),
    })
    expect(publishPreviewArgs).toMatchObject({
      sessionId: expect.any(Object),
      anonymousOwnerSecret: expect.any(Object),
      requestedSlug: expect.any(Object),
    })
    expect(exportRecordArgs).toMatchObject({
      sessionId: expect.any(Object),
      target: expect.any(Object),
    })
    expect(ownedExportArgs).toMatchObject({
      sessionId: expect.any(Object),
      anonymousOwnerSecret: expect.any(Object),
      target: expect.any(Object),
    })
    expect(upsertGenerationTaskArgs).toMatchObject({
      sessionId: expect.any(Object),
      task: expect.any(Object),
      order: expect.any(Object),
    })
    expect(upsertGeneratedModuleArgs).toMatchObject({
      sessionId: expect.any(Object),
      moduleKey: expect.any(Object),
      source: expect.any(Object),
    })
    expect(addGenerationEventArgs).toMatchObject({
      sessionId: expect.any(Object),
      eventType: expect.any(Object),
    })
    expect(completeGenerationArgs).toMatchObject({
      sessionId: expect.any(Object),
      html: expect.any(Object),
      tasks: expect.any(Object),
    })
    expect(failGenerationArgs).toMatchObject({
      sessionId: expect.any(Object),
      message: expect.any(Object),
    })
    expect(sessionEditFields).toMatchObject({
      editType: expect.any(Object),
      targetLabel: expect.any(Object),
    })
    expect(createEditArgs).toMatchObject({
      sessionId: expect.any(Object),
      editType: expect.any(Object),
    })
    expect(forkSessionArgs).toMatchObject({
      sourceSessionId: expect.any(Object),
    })
    expect(restorePreviewVersionArgs).toMatchObject({
      sessionId: expect.any(Object),
      version: expect.any(Object),
    })
    expect(sendChatMessageArgs).toMatchObject({
      sessionId: expect.any(Object),
      content: expect.any(Object),
    })
    expect(setThemeOverrideArgs).toMatchObject({
      sessionId: expect.any(Object),
      themeOverride: expect.any(Object),
    })
    expect(annotationFields).toMatchObject({
      annotationId: expect.any(Object),
      agentationSessionKey: expect.any(Object),
      comment: expect.any(Object),
    })
    expect(ownedAnnotationArgs).toMatchObject({
      sessionId: expect.any(Object),
      annotationId: expect.any(Object),
    })
    expect(saveAgentationSessionArgs).toMatchObject({
      sessionId: expect.any(Object),
      agentationSessionId: expect.any(Object),
    })
    expect(agentationSyncAnnotationArgs).toMatchObject({
      annotationId: expect.any(Object),
    })
    expect(updateAgentationSyncAnnotationArgs).toMatchObject({
      annotationId: expect.any(Object),
    })
    expect(deleteOwnedAnnotationArgs).toMatchObject({
      sessionId: expect.any(Object),
      annotationId: expect.any(Object),
    })
    expect(upsertCmsConfigArgs).toMatchObject({
      sessionId: expect.any(Object),
    })
    expect(upsertCommerceConfigArgs).toMatchObject({
      sessionId: expect.any(Object),
    })
    expect(publicGallerySessionsArgs).toMatchObject({
      limit: expect.any(Object),
      page: expect.any(Object),
    })
    expect(publicGallerySessionArgs).toMatchObject({
      sessionId: expect.any(Object),
    })
    expect(deploymentSlugArgs).toMatchObject({
      slug: expect.any(Object),
    })
    expect(extractCmsBindingsArgs).toMatchObject({
      sessionId: expect.any(Object),
      html: expect.any(Object),
    })
    expect(updateCmsEntryArgs).toMatchObject({
      sessionId: expect.any(Object),
      bindingId: expect.any(Object),
      content: expect.any(Object),
    })
    expect(restoreCmsRevisionArgs).toMatchObject({
      sessionId: expect.any(Object),
      revisionId: expect.any(Object),
    })
    expect(provisionMedusaTenantArgs).toMatchObject({
      sessionId: expect.any(Object),
      backendUrl: expect.any(Object),
    })
    expect(syncMedusaProductsArgs).toMatchObject({
      sessionId: expect.any(Object),
      products: expect.any(Object),
    })
    expect(recordUsageMetricArgs).toMatchObject({
      sessionId: expect.any(Object),
      eventType: expect.any(Object),
      elapsedMs: expect.any(Object),
      cost: expect.any(Object),
      provider: expect.any(Object),
    })
    expect(userUsageMetricsArgs).toMatchObject({
      userId: expect.any(Object),
    })
    expect(upsertCmsCollectionItemArgs).toMatchObject({
      sessionId: expect.any(Object),
      collectionKey: expect.any(Object),
      fields: expect.any(Object),
    })
    expect(insertCmsBindingArgs).toMatchObject({
      sessionId: expect.any(Object),
      selector: expect.any(Object),
      type: expect.any(Object),
    })
    expect(listCmsRevisionsArgs).toMatchObject({
      entryId: expect.any(Object),
    })
    expect(operationalNotificationArgs).toMatchObject({
      sessionId: expect.any(Object),
      eventType: expect.any(Object),
    })
    expect(recordOperationalEventArgs).toMatchObject({
      sessionId: expect.any(Object),
      eventType: expect.any(Object),
    })
    expect(slackNotificationArgs).toMatchObject({
      message: expect.any(Object),
    })
    expect(telegramNotificationArgs).toMatchObject({
      message: expect.any(Object),
    })
  })

  it('exports the shared union/object validators used across sessions', () => {
    expect(exportTarget).toBeDefined()
    expect(engineTask).toBeDefined()
    expect(editType).toBeDefined()
    expect(medusaProduct).toBeDefined()
  })

  it('create accepts a valid generation session payload', async () => {
    const t = sessionValidatorsConvexTest()
    await expect(
      t.mutation(api.sessions.create, {
        prompt: 'A simple landing page',
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: false,
        workspace: 'workspace_validators_test',
        anonymousClientId: 'anon_validators_test',
        anonymousOwnerSecret: 'owner-secret',
      }),
    ).resolves.toMatchObject({ sessionId: expect.any(String) })
  })

  it('create rejects an invalid payload (missing required field)', async () => {
    const t = sessionValidatorsConvexTest()
    await expect(
      t.mutation(api.sessions.create, {
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: false,
        workspace: 'workspace_invalid',
      } as unknown as FunctionArgs<typeof api.sessions.create>),
    ).rejects.toThrow()
  })

  it('create rejects an invalid export target', async () => {
    const t = sessionValidatorsConvexTest()
    await expect(
      t.mutation(api.sessions.create, {
        prompt: 'Bad target',
        preferredLanguage: 'en',
        preferredExportTarget: 'not-a-real-target',
        isPrivate: false,
        workspace: 'workspace_bad_target',
        anonymousClientId: 'anon_bad_target',
        anonymousOwnerSecret: 'owner-secret',
      } as unknown as FunctionArgs<typeof api.sessions.create>),
    ).rejects.toThrow()
  })

  it('getGenerationView accepts valid optional args and returns null for unknown session', async () => {
    const t = sessionValidatorsConvexTest()
    await expect(
      t.query(api.sessions.getGenerationView, { lookup: 'does-not-exist' }),
    ).resolves.toBeNull()
  })

  it('getDeploymentBySlug accepts a valid slug string', async () => {
    const t = sessionValidatorsConvexTest()
    await expect(
      t.query(api.sessions.getDeploymentBySlug, { slug: 'no-such-slug' }),
    ).resolves.toBeNull()
  })

  it('getDeploymentBySlug rejects a non-string slug', async () => {
    const t = sessionValidatorsConvexTest()
    await expect(
      t.query(api.sessions.getDeploymentBySlug, {
        slug: 123,
      } as unknown as FunctionArgs<typeof api.sessions.getDeploymentBySlug>),
    ).rejects.toThrow()
  })

  it('listPublicSessions accepts valid optional pagination args', async () => {
    const t = sessionValidatorsConvexTest()
    await expect(
      t.query(api.sessions.listPublicSessions, {
        limit: 10,
        page: 1,
        search: 'test',
        category: 'blog',
      }),
    ).resolves.toMatchObject({ availableCategories: expect.any(Array) })
  })

  it('listPublicSessions rejects an invalid arg type', async () => {
    const t = sessionValidatorsConvexTest()
    await expect(
      t.query(api.sessions.listPublicSessions, {
        limit: 'not-a-number',
      } as unknown as FunctionArgs<typeof api.sessions.listPublicSessions>),
    ).rejects.toThrow()
  })
})
