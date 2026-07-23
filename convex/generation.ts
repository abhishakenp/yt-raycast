'use node'

import { v } from 'convex/values'

import { internal, api } from './_generated/api'
import { internalAction } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import type { ActionCtx } from './_generated/server'
import type { EngineWorkspaceTask } from '../src/features/generation/server/engine-workspace'
import type { ComposedContent } from '../packages/ship-fast-engine/src/genui/run.ts'
import { getModelConfigurationFailure } from './generationConfig'
import {
  completeGenerationAction,
  type CompleteGenerationActionResult,
} from './lib/session_generation_action_helpers'

const internalFunctions: typeof internal = internal

export const DEFAULT_GENERATION_TIMEOUT_MS = 90_000

/**
 * Build a TranslationCacheClient backed by Convex queries/mutations.
 * This is the single source of truth for translations: generation-time
 * translations are saved here, and all export targets read from the same
 * `translationCache` + `sessionTranslationOverrides` tables.
 */
function createGenerationTranslationCacheClient(
  ctx: ActionCtx,
  sessionId: Id<'sessions'>,
): {
  getBatch: (input: {
    locale: string
    texts: string[]
    sessionId?: string
  }) => Promise<Array<string | null>>
  setBatch: (input: {
    locale: string
    entries: Array<{ text: string; translation: string }>
  }) => Promise<unknown>
} {
  return {
    getBatch: (input) =>
      ctx.runQuery(api.translationCache.getBatch, {
        locale: input.locale,
        texts: input.texts,
        sessionId,
      }),
    setBatch: (input) =>
      ctx.runMutation(api.translationCache.setBatch, {
        locale: input.locale,
        entries: input.entries,
      }),
  }
}

type GenUIEvent =
  | { type: 'status'; message: string }
  | { type: 'skeleton'; text: string }
  | { type: 'plan'; ids: string[] }
  | { type: 'theme'; name: string }
  | { type: 'locale'; code: string }
  | { type: 'module_start'; id: string }
  | { type: 'module_retry'; id: string; attempt: number }
  | { type: 'module'; id: string; text: string; failed?: boolean }
  | { type: 'source'; text: string }
  | { type: 'done'; modules: number; ms: number; source?: string }
  | { type: 'error'; message: string }

type GenUIArtifact = {
  key: string
  contentJson: string
}

function parseArtifactContent(artifact: GenUIArtifact): unknown {
  try {
    return JSON.parse(artifact.contentJson)
  } catch {
    return artifact.contentJson
  }
}

function artifactsByKey(
  artifacts: GenUIArtifact[] | undefined,
): Record<string, unknown> | undefined {
  if (!artifacts || artifacts.length === 0) return undefined
  return Object.fromEntries(
    artifacts.map((artifact) => [artifact.key, parseArtifactContent(artifact)]),
  )
}

const loadGenerationRuntime = async () => {
  const { runHomepageOrchestrator } =
    await import('../packages/ship-fast-engine/src/genui/run.ts')

  return { runHomepageOrchestrator }
}

const loadOpenUISSR = async () => {
  const { renderOpenUIToHTMLWithTheme } =
    await import('@ship-fast/engine/openui-ssr.js')
  return { renderOpenUIToHTMLWithTheme }
}

export const createGenerationTimeoutController = () => {
  const controller = new AbortController()
  const timeoutMs = Math.max(
    15_000,
    Number.parseInt(process.env.SHIP_FAST_GENERATION_TIMEOUT_MS ?? '', 10) ||
      DEFAULT_GENERATION_TIMEOUT_MS,
  )
  const timeout = setTimeout(() => {
    controller.abort(
      new Error(
        'Generation timed out. Please try again with a shorter prompt.',
      ),
    )
  }, timeoutMs)

  return {
    controller,
    clear: () => clearTimeout(timeout),
  }
}

function eventMessage(event: GenUIEvent): string | undefined {
  switch (event.type) {
    case 'status':
      return event.message
    case 'theme':
      return `Theme selected: ${event.name}`
    case 'locale':
      return `Locale selected: ${event.code}`
    case 'plan':
      return `Pages planned: ${event.ids.join(', ')}`
    case 'module_start':
      return `Generating page ${event.id}`
    case 'module_retry':
      return `Retrying page ${event.id}`
    case 'module':
      return `Generated page ${event.id}`
    case 'done':
      return `Generated ${event.modules} modules`
    case 'error':
      return event.message
    case 'skeleton':
    case 'source':
      return undefined
  }
}

function engineAdapterEventMessage(event: {
  type: string
  message?: string
  phase?: string
  task?: unknown
  tasks?: unknown[]
}): string | undefined {
  switch (event.type) {
    case 'status':
    case 'log':
      return event.message
    case 'task': {
      const task = event.task as { label?: string; status?: string } | undefined
      return task === undefined ? undefined : `${task.label}: ${task.status}`
    }
    case 'tasks': {
      const tasks = event.tasks as unknown[] | undefined
      return tasks === undefined
        ? undefined
        : `${tasks.length} engine tasks planned`
    }
    case 'preview_ready':
      return 'Homepage preview ready'
    case 'openui_ready':
      return 'OpenUI source ready'
    default:
      return undefined
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

function buildGenerationSiteSpecMetadata(
  session: Doc<'sessions'>,
  result: {
    brand: string
    title?: string
    theme: string | null
    locale: string
    source: string
    category?: string
    artifacts?: GenUIArtifact[]
  },
) {
  const generatedArtifacts = artifactsByKey(result.artifacts)

  return {
    brand: result.brand,
    projectName: result.title,
    theme: result.theme ?? 'modern-minimal',
    locale: result.locale,
    designReferenceUrls: session.designReferenceUrls ?? [],
    designReferenceNotes: session.designReferenceNotes ?? '',
    cloneUrl: session.cloneUrl,
    designReferenceFingerprint: session.designReferenceFingerprint,
    modules: {
      home: result.source,
    },
    genui:
      result.category !== undefined || generatedArtifacts !== undefined
        ? {
            version: 1,
            category: result.category ?? null,
            ownerEmail: session.ownerEmail ?? null,
            artifacts: generatedArtifacts ?? {},
            fullstackManifest: generatedArtifacts?.['fullstack-manifest'],
            openuiManifest: generatedArtifacts?.['openui-manifest'],
          }
        : undefined,
  }
}

async function completeGenerationFromNode(
  ctx: ActionCtx,
  input: {
    sessionId: Id<'sessions'>
    anonymousOwnerSecret?: string
    html: string
    siteSpecJson?: string
    openUiSource?: string
    tasks: EngineWorkspaceTask[]
    elapsed?: number
    cost?: number
    provider?: string
  },
): Promise<CompleteGenerationActionResult> {
  return await completeGenerationAction(ctx, input, {
    getGenerationSession: internalFunctions.sessions.getGenerationSession,
    completeGenerationInternal:
      internalFunctions.sessions.completeGenerationInternal,
    loadOpenUISSR,
  })
}

async function recordGenerationFailure(
  ctx: ActionCtx,
  args: { sessionId: Id<'sessions'>; anonymousOwnerSecret?: string },
  message: string,
  elapsed: number,
) {
  try {
    await ctx.runMutation(internalFunctions.sessions.failGeneration, {
      sessionId: args.sessionId,
      anonymousOwnerSecret: args.anonymousOwnerSecret,
      message,
      elapsed,
    })
  } catch (error) {
    console.error(
      '[generation:startGeneration] failed to mark session failed',
      {
        sessionId: args.sessionId,
        message: error instanceof Error ? error.message : String(error),
      },
    )
  }

  try {
    await ctx.runMutation(internalFunctions.sessions.addGenerationEvent, {
      sessionId: args.sessionId,
      eventType: 'failed',
      message,
    })
  } catch (error) {
    console.error(
      '[generation:startGeneration] failed to record failure event',
      {
        sessionId: args.sessionId,
        message: error instanceof Error ? error.message : String(error),
      },
    )
  }
}

export const startGeneration = internalAction({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    status: 'skipped' | 'failed' | 'completed'
    reason?: string
    message?: string
  } | null> => {
    const startedAt = Date.now()

    try {
      console.log('[generation:startGeneration] action entered', {
        sessionId: args.sessionId,
      })

      const session: Doc<'sessions'> | null = await ctx.runQuery(
        internalFunctions.sessions.getGenerationSession,
        {
          sessionId: args.sessionId,
        },
      )

      if (session === null || session.deletedAt !== undefined) {
        return null
      }

      if (session.cloneMode === true) {
        return {
          status: 'skipped',
          reason: 'clone_mode',
        }
      }

      if ((session.previewVersion ?? 0) > 0) {
        return {
          status: 'skipped',
          reason: 'preview_already_exists',
        }
      }

      const startResult = await ctx.runMutation(
        internalFunctions.sessions.markGenerationStarted,
        {
          sessionId: args.sessionId,
        },
      )

      if (startResult?.started === false) {
        return {
          status: 'skipped',
          reason: startResult.reason ?? 'generation_not_started',
        }
      }

      const modelConfigurationFailure = getModelConfigurationFailure()
      if (modelConfigurationFailure !== null) {
        throw new Error(modelConfigurationFailure)
      }

      await ctx.runMutation(internalFunctions.sessions.addGenerationEvent, {
        sessionId: args.sessionId,
        eventType: 'status',
        message: 'Running Ship Fast engine',
      })

      if (session.engineVersion === 'v2') {
        const [{ getSelectedEngine }, { runEngineGeneration }] =
          await Promise.all([
            import('../src/features/generation/server/engine-selector'),
            import('../src/features/generation/server/generation-runner'),
          ])

        await ctx.runMutation(internalFunctions.sessions.addGenerationEvent, {
          sessionId: args.sessionId,
          eventType: 'status',
          message: 'Running Ship Fast engine v2',
        })

        const result = await runEngineGeneration({
          sessionId: args.sessionId,
          prompt: buildGenerationPrompt(session),
          preferredLanguage: session.preferredLanguage,
          anonymousOwnerSecret: args.anonymousOwnerSecret,
          workspaceRoot:
            process.env.SHIP_FAST_ENGINE_WORKSPACE_ROOT ||
            '/tmp/ship-fast-engine-workspaces',
          runAll: getSelectedEngine('v2'),
          persistence: {
            completeGeneration: async (input) =>
              await completeGenerationFromNode(ctx, {
                sessionId: args.sessionId,
                anonymousOwnerSecret: args.anonymousOwnerSecret,
                html: input.html,
                siteSpecJson: input.siteSpecJson,
                openUiSource: input.openUiSource,
                tasks: input.tasks,
                elapsed: Date.now() - startedAt,
                provider: 'ship-fast-engine-v2',
              }),
            failGeneration: async (input) =>
              await recordGenerationFailure(
                ctx,
                args,
                input.message,
                Date.now() - startedAt,
              ),
          },
          cacheClient: createGenerationTranslationCacheClient(
            ctx,
            args.sessionId,
          ),
          onEvent: (event) => {
            const message = engineAdapterEventMessage(event)

            if (message !== undefined) {
              void ctx.runMutation(
                internalFunctions.sessions.addGenerationEvent,
                {
                  sessionId: args.sessionId,
                  eventType: event.type,
                  message,
                },
              )
            }
          },
        })

        if (result.status === 'failed') {
          return result
        }

        await ctx.runMutation(internalFunctions.sessions.addGenerationEvent, {
          sessionId: args.sessionId,
          eventType: 'completed',
          message: 'Generation complete',
        })

        return { status: 'completed' }
      }

      if (session.engineVersion === 'v3') {
        const [{ getSelectedEngine }, { runEngineGeneration }] =
          await Promise.all([
            import('../src/features/generation/server/engine-selector'),
            import('../src/features/generation/server/generation-runner'),
          ])

        await ctx.runMutation(internalFunctions.sessions.addGenerationEvent, {
          sessionId: args.sessionId,
          eventType: 'status',
          message: 'Running Ship Fast engine v3',
        })

        const result = await runEngineGeneration({
          sessionId: args.sessionId,
          prompt: buildGenerationPrompt(session),
          preferredLanguage: session.preferredLanguage,
          anonymousOwnerSecret: args.anonymousOwnerSecret,
          workspaceRoot:
            process.env.SHIP_FAST_ENGINE_WORKSPACE_ROOT ||
            '/tmp/ship-fast-engine-workspaces',
          runAll: getSelectedEngine('v3'),
          persistence: {
            completeGeneration: async (input) =>
              await completeGenerationFromNode(ctx, {
                sessionId: args.sessionId,
                anonymousOwnerSecret: args.anonymousOwnerSecret,
                html: input.html,
                siteSpecJson: input.siteSpecJson,
                openUiSource: input.openUiSource,
                tasks: input.tasks,
                elapsed: Date.now() - startedAt,
                provider: 'ship-fast-engine-v3',
              }),
            failGeneration: async (input) =>
              await recordGenerationFailure(
                ctx,
                args,
                input.message,
                Date.now() - startedAt,
              ),
          },
          cacheClient: createGenerationTranslationCacheClient(
            ctx,
            args.sessionId,
          ),
          onEvent: (event) => {
            const message = engineAdapterEventMessage(event)

            if (message !== undefined) {
              void ctx.runMutation(
                internalFunctions.sessions.addGenerationEvent,
                {
                  sessionId: args.sessionId,
                  eventType: event.type,
                  message,
                },
              )
            }
          },
        })

        if (result.status === 'failed') {
          return result
        }

        await ctx.runMutation(internalFunctions.sessions.addGenerationEvent, {
          sessionId: args.sessionId,
          eventType: 'completed',
          message: 'Generation complete',
        })

        return { status: 'completed' }
      }

      const generationRuntime = await loadGenerationRuntime()

      await ctx.runMutation(internalFunctions.sessions.addGenerationEvent, {
        sessionId: args.sessionId,
        eventType: 'status',
        message: 'Ship Fast OpenUI orchestrator loaded',
      })

      let latestOpenUiSource: string | undefined
      const pendingWrites: Array<Promise<unknown>> = []
      const runningTask: EngineWorkspaceTask = {
        id: 'homepage',
        label: 'Generate homepage',
        status: 'IN_PROGRESS',
      }
      await ctx.runMutation(internalFunctions.sessions.upsertGenerationTask, {
        sessionId: args.sessionId,
        task: runningTask,
        order: 0,
      })

      // Reuse the per-prompt AI content cache (the per-session seed still
      // re-randomizes the layout). Cache hit ⇒ no model calls.
      const promptCacheKey = session.promptCacheKey
      let cachedContent: ComposedContent | undefined
      if (promptCacheKey) {
        const cachedJson = await ctx.runQuery(
          internalFunctions.contentCache.get,
          { promptCacheKey },
        )
        if (cachedJson) {
          try {
            cachedContent = JSON.parse(cachedJson)
          } catch {
            cachedContent = undefined
          }
        }
      }

      const generationTimeout = createGenerationTimeoutController()
      const result = await generationRuntime
        .runHomepageOrchestrator({
          prompt: buildGenerationPrompt(session),
          preferredLanguage: session.preferredLanguage,
          sessionSeed: String(args.sessionId),
          ownerEmail: session.ownerEmail,
          signal: generationTimeout.controller.signal,
          cachedContent,
          onContent: (content) => {
            if (promptCacheKey) {
              pendingWrites.push(
                ctx.runMutation(internalFunctions.contentCache.set, {
                  promptCacheKey,
                  contentJson: JSON.stringify(content),
                }),
              )
            }
          },
          onSource: (source) => {
            latestOpenUiSource = source
            pendingWrites.push(
              ctx.runMutation(
                internalFunctions.sessions.upsertGeneratedModule,
                {
                  sessionId: args.sessionId,
                  moduleKey: 'home',
                  source,
                  status: 'running',
                },
              ),
            )
          },
          onEvent: (event) => {
            const message = eventMessage(event)

            if (message !== undefined) {
              pendingWrites.push(
                ctx.runMutation(internalFunctions.sessions.addGenerationEvent, {
                  sessionId: args.sessionId,
                  eventType: event.type,
                  message,
                }),
              )
            }
          },
        })
        .finally(() => {
          generationTimeout.clear()
        })
      await Promise.all(pendingWrites)

      const completedTask: EngineWorkspaceTask = {
        id: 'homepage',
        label: 'Generate homepage',
        status: 'DONE',
      }
      const finalOpenUiSource = result.source || latestOpenUiSource || ''
      if (!finalOpenUiSource.trim()) {
        throw new Error('Generation produced no OpenUI source to render')
      }
      const siteSpec = buildGenerationSiteSpecMetadata(session, {
        ...result,
        source: finalOpenUiSource,
      })

      await completeGenerationFromNode(ctx, {
        sessionId: args.sessionId,
        anonymousOwnerSecret: args.anonymousOwnerSecret,
        html: '',
        siteSpecJson: JSON.stringify(siteSpec),
        openUiSource: finalOpenUiSource,
        tasks: [completedTask],
        elapsed: Date.now() - startedAt,
        provider: 'genui-orchestrator',
      })

      await ctx.runMutation(internalFunctions.sessions.addGenerationEvent, {
        sessionId: args.sessionId,
        eventType: 'completed',
        message: 'Generation complete',
      })

      return { status: 'completed' }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Generation failed'
      await recordGenerationFailure(ctx, args, message, Date.now() - startedAt)
      return { status: 'failed', message }
    }
  },
})
