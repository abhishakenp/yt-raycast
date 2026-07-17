import { describe, expect, it } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { upsertTask } from './session_task_helpers'

type TaskRecord = Doc<'tasks'>

const sessionId = 'session_tasks' as Id<'sessions'>

function taskDoc(overrides: Partial<TaskRecord> = {}): TaskRecord {
  return {
    _id: 'task_existing' as Id<'tasks'>,
    _creationTime: 1,
    sessionId,
    taskKey: 'homepage',
    title: 'Existing homepage',
    status: 'pending',
    order: 0,
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  } as TaskRecord
}

function ctxFor(initialTasks: TaskRecord[] = []) {
  const tasks = [...initialTasks]
  let nextTask = tasks.length + 1

  const db = {
    query: (table: string) => ({
      withIndex: (
        indexName: string,
        applyIndex: (index: {
          eq: (field: string, value: unknown) => typeof index
        }) => void,
      ) => {
        expect(table).toBe('tasks')
        expect(indexName).toBe('by_sessionId_taskKey')

        const filters = new Map<string, unknown>()
        const index = {
          eq: (field: string, value: unknown) => {
            filters.set(field, value)
            return index
          },
        }

        applyIndex(index)

        return {
          first: async () =>
            tasks.find(
              (task) =>
                task.sessionId === filters.get('sessionId') &&
                task.taskKey === filters.get('taskKey'),
            ) ?? null,
        }
      },
    }),
    insert: async (table: string, value: Record<string, unknown>) => {
      expect(table).toBe('tasks')
      const id = `task_${nextTask++}` as Id<'tasks'>
      tasks.push({ _id: id, _creationTime: 1, ...value } as TaskRecord)
      return id
    },
    patch: async (id: string, value: Record<string, unknown>) => {
      const taskIndex = tasks.findIndex((task) => task._id === id)
      expect(taskIndex).toBeGreaterThanOrEqual(0)
      tasks[taskIndex] = { ...tasks[taskIndex], ...value } as TaskRecord
    },
  } as unknown as Pick<MutationCtx, 'db'>['db']

  return {
    ctx: { db } as Pick<MutationCtx, 'db'>,
    tasks,
  }
}

describe('session task helpers', () => {
  it('inserts a new normalized task row', async () => {
    const { ctx, tasks } = ctxFor()

    await upsertTask(
      ctx,
      sessionId,
      {
        id: 'home.openui',
        label: 'Generate homepage',
        status: 'IN_PROGRESS',
      },
      2,
      100,
    )

    expect(tasks).toMatchObject([
      {
        sessionId,
        taskKey: 'homepage',
        title: 'Generate homepage',
        status: 'running',
        order: 2,
        createdAt: 100,
        updatedAt: 100,
      },
    ])
  })

  it('updates an existing task without replacing immutable fields', async () => {
    const existingTask = taskDoc({
      _id: 'task_homepage' as Id<'tasks'>,
      createdAt: 10,
      updatedAt: 10,
    })
    const { ctx, tasks } = ctxFor([existingTask])

    await upsertTask(
      ctx,
      sessionId,
      {
        id: 'home.openui',
        label: 'Homepage complete',
        status: 'DONE',
      },
      4,
      200,
    )

    expect(tasks).toEqual([
      {
        ...existingTask,
        title: 'Homepage complete',
        status: 'succeeded',
        order: 4,
        updatedAt: 200,
      },
    ])
  })

  it('preserves non-home task keys and failed status mapping', async () => {
    const { ctx, tasks } = ctxFor()

    await upsertTask(
      ctx,
      sessionId,
      {
        id: 'export.react',
        label: 'Export React app',
        status: 'FAILED',
      },
      7,
      300,
    )

    expect(tasks[0]).toMatchObject({
      taskKey: 'export.react',
      status: 'failed',
      title: 'Export React app',
      order: 7,
      createdAt: 300,
      updatedAt: 300,
    })
  })
})
