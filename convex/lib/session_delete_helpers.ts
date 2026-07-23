import type { Doc, Id, TableNames } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'

async function deleteRows<TableName extends TableNames>(
  ctx: MutationCtx,
  rows: AsyncIterable<Doc<TableName>>,
): Promise<void> {
  for await (const row of rows) {
    await ctx.db.delete(row._id)
  }
}

export async function deleteSessionGraph(
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
): Promise<void> {
  const storageIds = new Set<Id<'_storage'>>()

  for await (const page of ctx.db
    .query('clonePages')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))) {
    if (page.storageId !== undefined) storageIds.add(page.storageId)
    await ctx.db.delete(page._id)
  }

  for await (const artifact of ctx.db
    .query('exportArtifacts')
    .withIndex('by_sessionId_target', (index) =>
      index.eq('sessionId', sessionId),
    )) {
    if (artifact.storageId !== undefined) storageIds.add(artifact.storageId)
    if (artifact.filesStorageId !== undefined) {
      storageIds.add(artifact.filesStorageId)
    }
    await ctx.db.delete(artifact._id)
  }

  for await (const image of ctx.db
    .query('userImages')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))) {
    storageIds.add(image.storageId)
    await ctx.db.delete(image._id)
  }

  await deleteRows(
    ctx,
    ctx.db
      .query('tasks')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId)),
  )
  await deleteRows(
    ctx,
    ctx.db
      .query('generationEvents')
      .withIndex('by_sessionId_createdAt', (index) =>
        index.eq('sessionId', sessionId),
      ),
  )
  await deleteRows(
    ctx,
    ctx.db
      .query('usageMetrics')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId)),
  )
  await deleteRows(
    ctx,
    ctx.db
      .query('generatedModules')
      .withIndex('by_sessionId_moduleKey', (index) =>
        index.eq('sessionId', sessionId),
      ),
  )
  await deleteRows(
    ctx,
    ctx.db
      .query('siteSpecs')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId)),
  )
  await deleteRows(
    ctx,
    ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index.eq('sessionId', sessionId),
      ),
  )
  await deleteRows(
    ctx,
    ctx.db
      .query('edits')
      .withIndex('by_sessionId_createdAt', (index) =>
        index.eq('sessionId', sessionId),
      ),
  )
  await deleteRows(
    ctx,
    ctx.db
      .query('exports')
      .withIndex('by_sessionId_target', (index) =>
        index.eq('sessionId', sessionId),
      ),
  )
  await deleteRows(
    ctx,
    ctx.db
      .query('commerceTenants')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId)),
  )
  await deleteRows(
    ctx,
    ctx.db
      .query('deployments')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId)),
  )
  await deleteRows(
    ctx,
    ctx.db
      .query('commerceConfigs')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId)),
  )
  await deleteRows(
    ctx,
    ctx.db
      .query('genuiModules')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId)),
  )
  await deleteRows(
    ctx,
    ctx.db
      .query('previewHistory')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId)),
  )
  await deleteRows(
    ctx,
    ctx.db
      .query('sessionData')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId)),
  )
  await deleteRows(
    ctx,
    ctx.db
      .query('themeOverrides')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId)),
  )
  await deleteRows(
    ctx,
    ctx.db
      .query('aiCapsules')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId)),
  )

  for (const storageId of storageIds) {
    await ctx.storage.delete(storageId)
  }
  await ctx.db.patch(sessionId, { deletedAt: Date.now() })
}
