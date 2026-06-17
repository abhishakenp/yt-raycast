import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

describe('session validators boundary', () => {
  it('keeps shared Convex validators out of convex/sessions.ts', () => {
    const sessionsSource = readFileSync('convex/sessions.ts', 'utf8')
    const validatorsSource = readFileSync(
      'convex/lib/session_validators.ts',
      'utf8',
    )

    expect(sessionsSource).toContain("from './lib/session_validators'")
    expect(sessionsSource).toContain('args: generationViewArgs')
    expect(sessionsSource).toContain('args: eventStreamArgs')
    expect(sessionsSource).toContain('args: lookupArgs')
    expect(sessionsSource).toContain('args: sessionIdArgs')
    expect(sessionsSource).toContain('args: deleteMineArgs')
    expect(sessionsSource).toContain('args: createGenerationSessionArgs')
    expect(sessionsSource).toContain('args: upsertGenerationTaskArgs')
    expect(sessionsSource).toContain('args: upsertGeneratedModuleArgs')
    expect(sessionsSource).toContain('args: addGenerationEventArgs')
    expect(sessionsSource).toContain('args: completeGenerationArgs')
    expect(sessionsSource).toContain('args: failGenerationArgs')
    expect(sessionsSource).toContain('args: publishPreviewArgs')
    expect(sessionsSource).toContain('args: claimAnonymousArgs')
    expect(sessionsSource).toContain('args: ownedExportArgs')
    expect(sessionsSource).toContain('args: exportRecordArgs')
    expect(sessionsSource).toContain('args: createEditArgs')
    expect(sessionsSource).toContain('args: forkSessionArgs')
    expect(sessionsSource).toContain('args: restorePreviewVersionArgs')
    expect(sessionsSource).toContain('args: sendChatMessageArgs')
    expect(sessionsSource).toContain('args: setThemeOverrideArgs')
    expect(sessionsSource).toContain('args: ownedAnnotationArgs')
    expect(sessionsSource).toContain('args: saveAgentationSessionArgs')
    expect(sessionsSource).toContain('args: agentationSyncAnnotationArgs')
    expect(sessionsSource).toContain('args: updateAgentationSyncAnnotationArgs')
    expect(sessionsSource).toContain('args: annotationIdArgs')
    expect(sessionsSource).toContain('args: deleteOwnedAnnotationArgs')
    expect(sessionsSource).toContain(
      'args: deleteOwnedAnnotationByAgentationIdArgs',
    )
    expect(sessionsSource).toContain('args: ownedSessionArgs')
    expect(sessionsSource).toContain('args: upsertCmsConfigArgs')
    expect(sessionsSource).toContain('args: upsertCommerceConfigArgs')
    expect(sessionsSource).toContain('args: publicGallerySessionsArgs')
    expect(sessionsSource).toContain('args: publicGallerySessionArgs')
    expect(sessionsSource).toContain('args: deploymentSlugArgs')
    expect(sessionsSource).toContain('args: extractCmsBindingsArgs')
    expect(sessionsSource).toContain('args: updateCmsEntryArgs')
    expect(sessionsSource).toContain('args: restoreCmsRevisionArgs')
    expect(sessionsSource).toContain('args: provisionMedusaTenantArgs')
    expect(sessionsSource).toContain('args: syncMedusaProductsArgs')
    expect(sessionsSource).toContain('args: recordUsageMetricArgs')
    expect(sessionsSource).toContain('args: userUsageMetricsArgs')
    expect(sessionsSource).toContain('args: cmsEntryRevisionsArgs')
    expect(sessionsSource).toContain('args: upsertCmsContentEntryArgs')
    expect(sessionsSource).toContain('args: restoreCmsContentRevisionArgs')
    expect(sessionsSource).toContain('args: insertCmsBindingArgs')
    expect(sessionsSource).toContain('args: listCmsRevisionsArgs')
    expect(sessionsSource).not.toContain('const exportTarget = v.union')
    expect(sessionsSource).not.toContain("from 'convex/values'")
    expect(sessionsSource).not.toContain('const engineTaskStatus = v.union')
    expect(sessionsSource).not.toContain('const engineTask = v.object')
    expect(sessionsSource).not.toContain(
      "sessionId: v.optional(v.id('sessions'))",
    )
    expect(sessionsSource).not.toContain('lookup: v.string()')
    expect(sessionsSource).not.toContain('editType: v.union')
    expect(sessionsSource).not.toContain('type: v.union')
    expect(sessionsSource).not.toContain('products: v.array(\n      v.object')
    expect(sessionsSource).toContain('args: recordOperationalEventArgs')
    expect(sessionsSource).toContain('args: operationalNotificationArgs')
    expect(sessionsSource).toContain('args: slackNotificationArgs')
    expect(sessionsSource).toContain('args: telegramNotificationArgs')
    expect(sessionsSource).not.toContain('cacheHit: v.optional(v.boolean())')

    expect(validatorsSource).toContain('export const exportTarget = v.union')
    expect(validatorsSource).toContain('export const engineTask = v.object')
    expect(validatorsSource).toContain('export const editType = v.union')
    expect(validatorsSource).toContain('export const cmsContentType = v.union')
    expect(validatorsSource).toContain('export const medusaProduct = v.object')
    expect(validatorsSource).toContain('export const sessionIdArgs =')
    expect(validatorsSource).toContain('export const lookupArgs =')
    expect(validatorsSource).toContain('export const generationViewArgs =')
    expect(validatorsSource).toContain('export const eventStreamArgs =')
    expect(validatorsSource).toContain('export const deleteMineArgs =')
    expect(validatorsSource).toContain(
      'export const createGenerationSessionArgs =',
    )
    expect(validatorsSource).toContain(
      'export const upsertGenerationTaskArgs =',
    )
    expect(validatorsSource).toContain(
      'export const upsertGeneratedModuleArgs =',
    )
    expect(validatorsSource).toContain('export const addGenerationEventArgs =')
    expect(validatorsSource).toContain('export const completeGenerationArgs =')
    expect(validatorsSource).toContain('export const failGenerationArgs =')
    expect(validatorsSource).toContain('export const publishPreviewArgs =')
    expect(validatorsSource).toContain('export const claimAnonymousArgs =')
    expect(validatorsSource).toContain('export const ownedExportArgs =')
    expect(validatorsSource).toContain('export const exportRecordArgs =')
    expect(validatorsSource).toContain('export const sessionEditFields =')
    expect(validatorsSource).toContain('export const createEditArgs =')
    expect(validatorsSource).toContain('export const forkSessionArgs =')
    expect(validatorsSource).toContain(
      'export const restorePreviewVersionArgs =',
    )
    expect(validatorsSource).toContain('export const sendChatMessageArgs =')
    expect(validatorsSource).toContain('export const setThemeOverrideArgs =')
    expect(validatorsSource).toContain('export const annotationFields =')
    expect(validatorsSource).toContain('export const ownedAnnotationArgs =')
    expect(validatorsSource).toContain(
      'export const saveAgentationSessionArgs =',
    )
    expect(validatorsSource).toContain(
      'export const agentationSyncAnnotationArgs =',
    )
    expect(validatorsSource).toContain(
      'export const updateAgentationSyncAnnotationArgs =',
    )
    expect(validatorsSource).toContain('export const annotationIdArgs =')
    expect(validatorsSource).toContain(
      'export const deleteOwnedAnnotationArgs =',
    )
    expect(validatorsSource).toContain(
      'export const deleteOwnedAnnotationByAgentationIdArgs =',
    )
    expect(validatorsSource).toContain('export const upsertCmsConfigArgs =')
    expect(validatorsSource).toContain(
      'export const upsertCommerceConfigArgs =',
    )
    expect(validatorsSource).toContain(
      'export const publicGallerySessionsArgs =',
    )
    expect(validatorsSource).toContain(
      'export const publicGallerySessionArgs =',
    )
    expect(validatorsSource).toContain('export const deploymentSlugArgs =')
    expect(validatorsSource).toContain('export const extractCmsBindingsArgs =')
    expect(validatorsSource).toContain('export const updateCmsEntryArgs =')
    expect(validatorsSource).toContain('export const restoreCmsRevisionArgs =')
    expect(validatorsSource).toContain(
      'export const provisionMedusaTenantArgs =',
    )
    expect(validatorsSource).toContain('export const syncMedusaProductsArgs =')
    expect(validatorsSource).toContain('export const recordUsageMetricArgs =')
    expect(validatorsSource).toContain('export const userUsageMetricsArgs =')
    expect(validatorsSource).toContain('export const cmsEntryRevisionsArgs =')
    expect(validatorsSource).toContain(
      'export const upsertCmsContentEntryArgs =',
    )
    expect(validatorsSource).toContain(
      'export const restoreCmsContentRevisionArgs =',
    )
    expect(validatorsSource).toContain('export const insertCmsBindingArgs =')
    expect(validatorsSource).toContain('export const listCmsRevisionsArgs =')
    expect(validatorsSource).toContain(
      'export const operationalNotificationArgs =',
    )
    expect(validatorsSource).toContain(
      'export const recordOperationalEventArgs =',
    )
  })
})
