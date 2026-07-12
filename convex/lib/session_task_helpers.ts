import type { Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import {
  type EngineTaskStatus,
  toTaskKey,
  toTaskStatus,
} from './session_serialization_helpers'

export type EngineTaskInput = {
  id: string
  label: string
  status: EngineTaskStatus
}

export async function upsertTask(
  ctx: Pick<MutationCtx, 'db'>,
  sessionId: Id<'sessions'>,
  task: EngineTaskInput,
  order: number,
  now: number,
) {
  const taskKey = toTaskKey(task.id)
  const existingTask = await ctx.db
    .query('tasks')
    .withIndex('by_sessionId_taskKey', (index) =>
      index.eq('sessionId', sessionId).eq('taskKey', taskKey),
    )
    .first()

  existingTask === null
    ? await ctx.db.insert('tasks', {
        sessionId,
        taskKey,
        title: task.label,
        status: toTaskStatus(task.status),
        order,
        createdAt: now,
        updatedAt: now,
      })
    : await ctx.db.patch(existingTask._id, {
        title: task.label,
        status: toTaskStatus(task.status),
        order,
        updatedAt: now,
      })
}
