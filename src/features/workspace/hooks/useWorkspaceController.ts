import { useMutation, useQuery } from 'convex/react'
import { useMemo, useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import type { GenerationState } from '@/features/generation/services/generation-state'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

export const useWorkspaceController = (sessionId: string) => {
  const workspace = useQuery(api.sessions.getWorkspace, { sessionId: sessionId as Id<'sessions'> })
  const publishSession = useMutation(api.sessions.publishPreview)
  const createExport = useMutation(api.sessions.createExport)
  const htmlExport = useQuery(api.sessions.getExport, {
    sessionId: sessionId as Id<'sessions'>,
    target: 'html',
  })
  const [publishError, setPublishError] = useState<string>()
  const [isPublishing, setIsPublishing] = useState(false)
  const [exportError, setExportError] = useState<string>()
  const [isExporting, setIsExporting] = useState(false)

  const generationState = useMemo<GenerationState>(
    () =>
      workspace?.session
        ? {
            status: workspace.session.status,
            previewVersion: workspace.session.previewVersion,
            tasks: workspace.tasks.map((task) => ({
              taskKey: task.taskKey,
              title: task.title,
              status: task.status,
              order: task.order,
              errorMessage: task.errorMessage,
            })),
          }
        : {
            status: workspace === null ? 'failed' : 'queued',
            previewVersion: 0,
            tasks: [
              {
                taskKey: 'workspace',
                title: workspace === null ? 'Session not found' : 'Load session',
                status: workspace === null ? 'failed' : 'running',
                order: 0,
              },
            ],
          },
    [workspace],
  )

  const previewHtml =
    workspace?.preview?.html ??
    '<main style="font-family:Inter,system-ui,sans-serif;padding:48px"><h1>Generation queued</h1><p>The durable session exists in Convex. The generation worker will attach the first preview version here.</p></main>'
  const hasPreview = Boolean(workspace?.preview?.html) && workspace?.session.status === 'preview_ready'
  const taskCount = generationState.tasks.length
  const completedTaskCount = generationState.tasks.filter(
    (task) => task.status === 'completed' || task.status === 'succeeded',
  ).length
  const progress = taskCount === 0 ? 0 : completedTaskCount / taskCount
  const deploymentUrl = workspace?.deployment?.url
  const canPublish = workspace?.session.status === 'preview_ready' && !isPublishing && deploymentUrl === undefined
  const publishButtonLabel =
    deploymentUrl !== undefined ? 'Published' : isPublishing ? 'Publishing' : 'Publish preview'
  const canExport = workspace?.session.status === 'preview_ready' && !isExporting
  const exportDownloadUrl = htmlExport?.status === 'ready' ? `/export/${sessionId}/html` : undefined
  const exportButtonLabel = isExporting ? 'Exporting' : htmlExport?.status === 'ready' ? 'Download HTML' : 'Export HTML'

  const publishPreview = async () => {
    if (!canPublish) return

    setPublishError(undefined)
    setIsPublishing(true)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined' ? undefined : readAnonymousOwnerSecret(window.localStorage, sessionId)

      await publishSession({
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret,
      })
    } catch {
      setPublishError('Publishing failed. This browser may not own the anonymous session.')
    } finally {
      setIsPublishing(false)
    }
  }

  const exportHtml = async () => {
    if (!canExport) return

    setExportError(undefined)
    setIsExporting(true)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined' ? undefined : readAnonymousOwnerSecret(window.localStorage, sessionId)

      await createExport({
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret,
        target: 'html',
      })
    } catch {
      setExportError('Export failed. This browser may not own the anonymous session.')
    } finally {
      setIsExporting(false)
    }
  }

  return {
    canExport,
    canPublish,
    deploymentUrl,
    exportButtonLabel,
    exportDownloadUrl,
    exportError,
    generationState,
    hasPreview,
    logs:
      workspace?.events?.map((event) => ({
        eventType: event.eventType,
        message: event.message,
        createdAt: event.createdAt,
      })) ?? [],
    isExporting,
    isPublishing,
    prompt: workspace?.session.prompt,
    progress,
    publishButtonLabel,
    publishError,
    publishPreview,
    previewHtml,
    sessionId,
    exportHtml,
  }
}
