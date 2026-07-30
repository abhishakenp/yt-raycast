/**
 * VPS-side generation handler — runs the Ship Fast engine in the warm VPS
 * Node process and writes results back to Convex via public mutations.
 *
 * The client subscribes to `getGenerationView` on Convex and separately
 * hits the VPS API route to start generation. All data flows VPS ↔ Convex
 * (server-to-server, fast network), not through the client.
 */
import type { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import type { Doc, Id } from '../../../../convex/_generated/dataModel'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import { getModelConfigurationFailure } from '../../../../convex/generationConfig'
import { runEngineGeneration } from './generation-runner'
import type { ShipFastEngineSessionEvent } from './ship-fast-engine-adapter'
import {
  sendBusinessNotification,
  generationDoneEvent,
  generationFailedEvent,
} from '@/features/notifications/slack-business'

function buildSessionUrls(sessionId: string): {
  publicUrl: string
  privateUrl: string
} {
  const baseUrl = (process.env.APP_BASE_URL ?? 'https://ship-fast.ai').replace(
    /\/+$/,
    '',
  )
  return {
    publicUrl: `${baseUrl}/preview/${sessionId}`,
    privateUrl: `${baseUrl}/generate/${sessionId}/`,
  }
}

function buildGenerationPrompt(session: Doc<'sessions'>): string {
  if (session.cloneBrief && session.cloneBrief.trim().length > 0) {
    return session.cloneBrief
  }

  const contextLines: string[] = []
  const designReferenceUrls = session.designReferenceUrls ?? []
  const designReferenceNotes = session.designReferenceNotes?.trim()

  if (designReferenceUrls.length > 0) {
    contextLines.push(
      `Design reference URLs: ${designReferenceUrls.join(', ')}`,
    )
  }

  if (session.cloneUrl !== undefined) {
    contextLines.push(`Clone/reference URL: ${session.cloneUrl}`)
  }

  if (designReferenceNotes !== undefined && designReferenceNotes.length > 0) {
    contextLines.push(`Design reference notes: ${designReferenceNotes}`)
  }

  if (contextLines.length === 0) return session.prompt

  return [
    session.prompt,
    '',
    'Generation context:',
    ...contextLines,
    'Use these references as aesthetic, content, and layout guidance. Preserve the user brief as the source of truth and do not copy protected text verbatim.',
  ].join('\n')
}

function engineAdapterEventMessage(
  event: ShipFastEngineSessionEvent,
): string | undefined {
  switch (event.type) {
    case 'status':
    case 'log':
      return event.message
    case 'task':
      return undefined
    case 'tasks':
      return `${event.tasks.length} engine tasks planned`
    case 'preview_ready':
      return 'Homepage preview ready'
    case 'openui_ready':
      return 'OpenUI source ready'
    case 'broadcast':
      return undefined
  }
}

function isBroadcastSourcePayload(
  payload: unknown,
): payload is { type: 'source'; text: string } {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'type' in payload &&
    payload.type === 'source' &&
    'text' in payload &&
    typeof payload.text === 'string' &&
    payload.text.trim().length > 0
  )
}

export type StartVpsGenerationInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  /** Bearer token for Convex auth (Clerk JWT) */
  bearerToken?: string | null
  /** Optional client override for testing */
  clientOverride?: ConvexHttpClient
}

export type StartVpsGenerationResult = {
  status: 'started' | 'skipped' | 'failed'
  reason?: string
  message?: string
}

export async function startVpsGeneration(
  input: StartVpsGenerationInput,
): Promise<StartVpsGenerationResult> {
  const startedAt = Date.now()
  const stepTimings: Record<string, number> = {}
  const client = input.clientOverride ?? createRuntimeConvexHttpClient(120_000)
  if (input.bearerToken) client.setAuth?.(input.bearerToken)

  let session: Doc<'sessions'> | null = null

  try {
    // 1. Load session from Convex
    const t_session_load = Date.now()
    session = await client.query(api.sessions.getGenerationSessionPublic, {
      sessionId: input.sessionId,
    })

    stepTimings.session_load = Date.now() - t_session_load
    console.log(`[vps-gen] session_load ${stepTimings.session_load}ms`)

    if (session === null || session.deletedAt !== undefined) {
      return { status: 'skipped', reason: 'session_not_found' }
    }

    if (session.cloneMode === true) {
      return { status: 'skipped', reason: 'clone_mode' }
    }

    if ((session.previewVersion ?? 0) > 0) {
      return { status: 'skipped', reason: 'preview_already_exists' }
    }

    // 2. Mark generation started
    const t_mark_started = Date.now()
    const startResult = await client.mutation(
      api.sessions.markGenerationStartedPublic,
      {
        sessionId: input.sessionId,
        anonymousOwnerSecret: input.anonymousOwnerSecret,
      },
    )
    stepTimings.mark_started = Date.now() - t_mark_started
    console.log(`[vps-gen] mark_started ${stepTimings.mark_started}ms`)

    if (startResult?.started === false) {
      return {
        status: 'skipped',
        reason: startResult.reason ?? 'generation_not_started',
      }
    }

    // 3. Check model config
    const modelConfigurationFailure = getModelConfigurationFailure()
    if (modelConfigurationFailure !== null) {
      throw new Error(modelConfigurationFailure)
    }

    // 4. Add status event
    await client.mutation(api.sessions.addGenerationEventPublic, {
      sessionId: input.sessionId,
      eventType: 'status',
      message: 'Running Ship Fast composition engine (VPS)',
      anonymousOwnerSecret: input.anonymousOwnerSecret,
    })

    // 5. Import engine (warm on VPS — near-zero after first call)
    const t_import = Date.now()
    const { runComposition } = await import('@ship-fast/engine')
    stepTimings.import = Date.now() - t_import
    console.log(`[vps-gen] import ${stepTimings.import}ms`)

    // 6. Run engine
    const t_engine = Date.now()
    const result = await runEngineGeneration({
      sessionId: input.sessionId,
      prompt: buildGenerationPrompt(session),
      preferredLanguage: session.preferredLanguage,
      anonymousOwnerSecret: input.anonymousOwnerSecret,
      workspaceRoot:
        process.env.SHIP_FAST_ENGINE_WORKSPACE_ROOT ||
        '/tmp/ship-fast-engine-workspaces',
      runAll: runComposition,
      persistence: {
        completeGeneration: async (completeInput) => {
          const completed = await client.mutation(
            api.sessions.completeGenerationPublic,
            {
              sessionId: input.sessionId,
              anonymousOwnerSecret: input.anonymousOwnerSecret,
              siteSpecJson: completeInput.siteSpecJson,
              openUiSource: completeInput.openUiSource,
              tasks: completeInput.tasks,
              elapsed: Date.now() - startedAt,
              provider: 'ship-fast-engine-v3-vps',
            },
          )
          return {
            previewVersion: completed.previewVersion ?? 1,
          }
        },
        failGeneration: async (failInput) => {
          await client.mutation(api.sessions.failGenerationPublic, {
            sessionId: input.sessionId,
            anonymousOwnerSecret: input.anonymousOwnerSecret,
            message: failInput.message,
            elapsed: Date.now() - startedAt,
          })
        },
      },
      cacheClient: {
        getBatch: async (batchInput: {
          locale: string
          texts: string[]
          sessionId?: string
        }) =>
          client.query(api.translationCache.getBatch, {
            locale: batchInput.locale,
            texts: batchInput.texts,
            sessionId: input.sessionId,
          }),
        setBatch: async (batchInput: {
          locale: string
          entries: Array<{ text: string; translation: string }>
        }) =>
          client.mutation(api.translationCache.setBatch, {
            locale: batchInput.locale,
            entries: batchInput.entries,
          }),
      },
      planCacheClient: {
        get: async (cacheInput: { promptCacheKey: string }) =>
          client.query(api.contentCache.getPublic, {
            promptCacheKey: cacheInput.promptCacheKey,
          }),
        set: async (cacheInput: { promptCacheKey: string; rawPlan: string }) =>
          client.mutation(api.contentCache.setPublic, {
            promptCacheKey: cacheInput.promptCacheKey,
            contentJson: cacheInput.rawPlan,
          }),
      },
      promptCacheKey: session.promptCacheKey ?? undefined,
      onEvent: (event) => {
        const message = engineAdapterEventMessage(event)
        if (message !== undefined) {
          void client.mutation(api.sessions.addGenerationEventPublic, {
            sessionId: input.sessionId,
            eventType: event.type,
            message,
            anonymousOwnerSecret: input.anonymousOwnerSecret,
          })
        }

        // Stream the OpenUI source to generatedModules as soon as the engine
        // emits it — the dashboard renders the preview client-side when it
        // sees homeModule.source non-empty with status: 'running'.
        if (
          event.type === 'broadcast' &&
          isBroadcastSourcePayload(event.payload)
        ) {
          void client.mutation(api.sessions.upsertGeneratedModulePublic, {
            sessionId: input.sessionId,
            moduleKey: 'home',
            source: event.payload.text,
            status: 'running',
            anonymousOwnerSecret: input.anonymousOwnerSecret,
          })
        }
      },
    })

    stepTimings.engine = Date.now() - t_engine
    console.log(`[vps-gen] engine_total ${stepTimings.engine}ms`)

    if (result.status === 'failed') {
      return {
        status: 'failed',
        message: result.message,
      }
    }

    // 7. Add completion event
    const t_complete = Date.now()
    await client.mutation(api.sessions.addGenerationEventPublic, {
      sessionId: input.sessionId,
      eventType: 'completed',
      message: 'Generation complete',
      anonymousOwnerSecret: input.anonymousOwnerSecret,
    })
    stepTimings.complete_event = Date.now() - t_complete
    stepTimings.total = Date.now() - startedAt
    console.log(
      `[vps-gen] TOTAL ${stepTimings.total}ms — ${JSON.stringify(stepTimings)}`,
    )

    // Best-effort Slack notification — never blocks.
    const urls = buildSessionUrls(input.sessionId)
    void sendBusinessNotification(
      generationDoneEvent({
        sessionId: input.sessionId,
        userId: session.userId,
        userEmail: session.ownerEmail,
        ipHash: session.anonymousClientIdHash,
        elapsedMs: stepTimings.total,
        provider: 'ship-fast-engine-v3-vps',
        prompt: session.prompt,
        publicUrl: urls.publicUrl,
        privateUrl: urls.privateUrl,
      }),
    ).catch(() => {})

    return { status: 'started' }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed'
    const elapsed = Date.now() - startedAt

    try {
      await client.mutation(api.sessions.failGenerationPublic, {
        sessionId: input.sessionId,
        anonymousOwnerSecret: input.anonymousOwnerSecret,
        message,
        elapsed,
      })
    } catch (failErr) {
      console.error('[vps-gen] failed to record failure', {
        error: failErr instanceof Error ? failErr.message : String(failErr),
      })
    }

    try {
      await client.mutation(api.sessions.addGenerationEventPublic, {
        sessionId: input.sessionId,
        eventType: 'failed',
        message,
        anonymousOwnerSecret: input.anonymousOwnerSecret,
      })
    } catch (eventErr) {
      console.error('[vps-gen] failed to record failure event', {
        error: eventErr instanceof Error ? eventErr.message : String(eventErr),
      })
    }

    console.error(`[vps-gen] FAILED after ${elapsed}ms: ${message}`)

    // Best-effort Slack notification for generation failure.
    const failUrls = buildSessionUrls(input.sessionId)
    void sendBusinessNotification(
      generationFailedEvent({
        sessionId: input.sessionId,
        userId: session?.userId,
        userEmail: session?.ownerEmail,
        ipHash: session?.anonymousClientIdHash,
        error: message,
        elapsedMs: elapsed,
        prompt: session?.prompt,
        publicUrl: failUrls.publicUrl,
        privateUrl: failUrls.privateUrl,
      }),
    ).catch(() => {})

    return { status: 'failed', message }
  }
}
