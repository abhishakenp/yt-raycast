import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { isOpenUiErrorHtml } from './openui_error_html'
import { recordOperationalGenerationEvent } from './session_operational_notifications'

type OperationalNotificationReference = Parameters<
  MutationCtx['scheduler']['runAfter']
>[1]

export const upsertSiteSpec = async (
  ctx: Pick<MutationCtx, 'db'>,
  sessionId: Id<'sessions'>,
  specJson: string | undefined,
  now: number,
) => {
  if (specJson === undefined) return

  const existingSpec = await ctx.db
    .query('siteSpecs')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
    .first()

  existingSpec === null
    ? await ctx.db.insert('siteSpecs', {
        sessionId,
        specJson,
        createdAt: now,
        updatedAt: now,
      })
    : await ctx.db.patch(existingSpec._id, {
        specJson,
        updatedAt: now,
      })
}

export const upsertHomeGeneratedModule = async (
  ctx: Pick<MutationCtx, 'db'>,
  sessionId: Id<'sessions'>,
  source: string | undefined,
  now: number,
) => {
  if (source === undefined) return

  const existingModule = await ctx.db
    .query('generatedModules')
    .withIndex('by_sessionId_moduleKey', (index) =>
      index.eq('sessionId', sessionId).eq('moduleKey', 'home'),
    )
    .first()

  existingModule === null
    ? await ctx.db.insert('generatedModules', {
        sessionId,
        moduleKey: 'home',
        source,
        status: 'succeeded',
        createdAt: now,
        updatedAt: now,
      })
    : await ctx.db.patch(existingModule._id, {
        source,
        status: 'succeeded',
        updatedAt: now,
      })
}

export const cloneCachedGeneratedArtifacts = async (
  ctx: Pick<MutationCtx, 'db' | 'scheduler'>,
  args: {
    cachedSession: Doc<'sessions'>
    targetSessionId: Id<'sessions'>
    userId?: string
    anonymousClientIdHash?: string
    now: number
    sendOperationalNotification: OperationalNotificationReference
  },
): Promise<boolean> => {
  const latestPreview = await ctx.db
    .query('previews')
    .withIndex('by_sessionId_version', (index) =>
      index.eq('sessionId', args.cachedSession._id),
    )
    .order('desc')
    .first()
  const homeModule = await ctx.db
    .query('generatedModules')
    .withIndex('by_sessionId_moduleKey', (index) =>
      index.eq('sessionId', args.cachedSession._id).eq('moduleKey', 'home'),
    )
    .first()
  const siteSpec = await ctx.db
    .query('siteSpecs')
    .withIndex('by_sessionId', (index) =>
      index.eq('sessionId', args.cachedSession._id),
    )
    .first()

  if (latestPreview === null || homeModule?.source === undefined) {
    return false
  }

  if (isOpenUiErrorHtml(latestPreview.html)) {
    return false
  }

  const openUiSource = latestPreview.openUiSource ?? homeModule.source
  const siteSpecJson =
    latestPreview.siteSpecJson ?? siteSpec?.specJson ?? siteSpec?.spec

  await ctx.db.insert('generatedModules', {
    sessionId: args.targetSessionId,
    moduleKey: 'home',
    source: homeModule.source,
    status: 'succeeded',
    createdAt: args.now,
    updatedAt: args.now,
  })

  if (siteSpecJson !== undefined) {
    await ctx.db.insert('siteSpecs', {
      sessionId: args.targetSessionId,
      specJson: siteSpecJson,
      createdAt: args.now,
      updatedAt: args.now,
    })
  }

  const cachedTasks = await ctx.db
    .query('tasks')
    .withIndex('by_sessionId', (index) =>
      index.eq('sessionId', args.cachedSession._id),
    )
    .take(25)
  const tasksToClone: Array<
    Partial<Doc<'tasks'>> & {
      taskKey?: string
      taskId?: string
      title: string
      status: string
      order?: number
    }
  > =
    cachedTasks.length > 0
      ? cachedTasks
      : [
          {
            taskKey: 'homepage',
            title: 'Generate homepage',
            status: 'succeeded',
            order: 0,
          },
        ]

  for (const [index, task] of tasksToClone.entries()) {
    const taskKey = task.taskKey ?? task.taskId ?? `task-${index}`
    const taskFields = {
      taskKey,
      taskId: task.taskId,
      title: task.title,
      status: task.status === 'failed' ? 'succeeded' : task.status,
      order: task.order ?? index,
      filename: task.filename,
      description: task.description,
      dependsOn: task.dependsOn,
      files: task.files,
      actions: task.actions,
      updatedAt: args.now,
    }
    const existingTask = await ctx.db
      .query('tasks')
      .withIndex('by_sessionId_taskKey', (taskIndex) =>
        taskIndex.eq('sessionId', args.targetSessionId).eq('taskKey', taskKey),
      )
      .first()

    existingTask === null
      ? await ctx.db.insert('tasks', {
          sessionId: args.targetSessionId,
          ...taskFields,
          createdAt: args.now,
        })
      : await ctx.db.patch(existingTask._id, taskFields)
  }

  await ctx.db.insert('previews', {
    sessionId: args.targetSessionId,
    version: 1,
    html: latestPreview.html,
    openUiSource,
    siteSpecJson,
    source: 'generation',
    createdAt: args.now,
  })

  await ctx.db.insert('generationEvents', {
    sessionId: args.targetSessionId,
    eventType: 'preview_ready',
    message: 'Generated preview restored from prompt cache',
    previewVersion: 1,
    createdAt: args.now,
  })

  await recordOperationalGenerationEvent(
    ctx,
    {
      sessionId: args.targetSessionId,
      eventType: 'cache_hit',
      message: 'Duplicate prompt cloned cached generated session',
      cacheHit: true,
      provider: 'prompt-cache-clone',
      elapsedMs: 0,
      cost: 0,
      userId: args.userId,
      anonymousClientIdHash: args.anonymousClientIdHash,
      createdAt: args.now,
    },
    args.sendOperationalNotification,
  )

  await ctx.db.patch(args.targetSessionId, {
    status: 'preview_ready',
    homepageReady: true,
    openuiReady: true,
    previewVersion: 1,
    elapsed: 0,
    cost: 0,
    updatedAt: args.now,
  })

  return true
}
