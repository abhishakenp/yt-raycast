import { createFileRoute } from '@tanstack/react-router'
import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { getRuntimeConvexUrl } from '@/shared/env/convex-runtime'

type WorkspaceTask = {
  taskKey: string
  title: string
  status: string
}

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
})

const sseMessage = (payload: unknown) => `data: ${JSON.stringify(payload)}\n\n`

export const Route = createFileRoute('/api/sessions/$sessionId/stream')({
  server: {
    handlers: {
      GET: ({ params }) => {
        const encoder = new TextEncoder()
        const client = new ConvexHttpClient(getRuntimeConvexUrl())
        let closed = false
        let sentReady = false

        const stream = new ReadableStream({
          start(controller) {
            const send = (payload: unknown) => {
              if (!closed) controller.enqueue(encoder.encode(sseMessage(payload)))
            }

            const tick = async () => {
              if (closed) return
              try {
                const workspace = await client.query(api.sessions.getWorkspace, {
                  sessionId: params.sessionId as Id<'sessions'>,
                })
                if (workspace === null) {
                  send({ type: 'error', message: 'Session not found' })
                  return
                }

                const tasks = workspace.tasks.map(toOldTask)
                const done = workspace.tasks.filter((task) => task.status === 'succeeded').length
                send({ type: 'tasks_loaded', tasks })

                if (workspace.session.status === 'preview_ready' && !sentReady) {
                  sentReady = true
                  send({ type: 'homepage_ready' })
                  send({ type: 'site_spec_ready', ready: true, session: { siteSpecReady: true } })
                  send({
                    type: 'run_completed',
                    elapsed: 0,
                    completed: done,
                  })
                }
              } catch (error) {
                send({ type: 'error', message: error instanceof Error ? error.message : 'Stream failed' })
              }
            }

            void tick()
            const interval = setInterval(() => void tick(), 2000)

            return () => {
              closed = true
              clearInterval(interval)
            }
          },
          cancel() {
            closed = true
          },
        })

        return new Response(stream, {
          headers: {
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
            'Content-Type': 'text/event-stream',
          },
        })
      },
    },
  },
})
