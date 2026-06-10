import { createFileRoute } from '@tanstack/react-router'
import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { getRuntimeConvexUrl } from '@/shared/env/convex-runtime'

type WorkspaceTask = {
  taskKey: string
  title: string
  status: string
  order: number
  errorMessage?: string
}

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

const toOldTaskStatus = (status: string) =>
  ({
    pending: 'PENDING',
    running: 'IN_PROGRESS',
    succeeded: 'DONE',
    failed: 'FAILED',
  })[status] ?? 'PENDING'

const toOldTask = (task: WorkspaceTask) => ({
  id: task.taskKey === 'homepage' ? 'home.openui' : task.taskKey,
  label: task.title,
  status: toOldTaskStatus(task.status),
  error: task.errorMessage,
})

const readSessionPayload = async (sessionId: string) => {
  const client = new ConvexHttpClient(getRuntimeConvexUrl())
  const workspace = await client.query(api.sessions.getWorkspace, {
    sessionId: sessionId as Id<'sessions'>,
  })

  if (workspace === null) return null

  const done = workspace.tasks.filter((task) => task.status === 'succeeded').length
  const isReady = workspace.session.status === 'preview_ready'
  const tasks = workspace.tasks.map(toOldTask)

  return {
    id: workspace.session.sessionId,
    sessionId: workspace.session.sessionId,
    prompt: workspace.session.prompt,
    tasks,
    done,
    taskCount: tasks.length,
    homepageReady: isReady,
    siteSpecReady: isReady,
    openuiReady: isReady,
    elapsed: null,
    cost: null,
    preferredLanguage: workspace.session.preferredLanguage,
    preferredExportTarget: workspace.session.preferredExportTarget,
    exportTargets: ['html'],
    isAnonymous: workspace.session.canClaimAnonymous,
    isPrivate: workspace.session.isPrivate,
    deployment: workspace.deployment ?? null,
    themeOverride: null,
    payment: null,
    medusaAdminEmbed: null,
  }
}

export const Route = createFileRoute('/api/sessions/$sessionId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const payload = await readSessionPayload(params.sessionId)
          return payload === null ? json({ error: 'Session not found' }, { status: 404 }) : json(payload)
        } catch (error) {
          return json(
            { error: error instanceof Error ? error.message : 'Failed to read session' },
            { status: 500 },
          )
        }
      },
    },
  },
})
