'use node'

import { v } from 'convex/values'

import { internal } from './_generated/api'
import { internalAction } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import type { ActionCtx } from './_generated/server'
import type { EngineWorkspaceTask } from '../src/features/generation/server/engine-workspace'

const internalFunctions = internal as any

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

const loadGenerationRuntime = async () => {
  const { runHomepageOrchestrator } =
    await import('../packages/ship-fast-engine/src/genui/run.ts')

  return { runHomepageOrchestrator }
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const buildOpenUiHandoffHtml = (
  source: string,
  locale: string,
  brand: string,
  prompt: string,
): string => `<!doctype html>
<html lang="${escapeHtml(locale)}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(brand || 'Generated Site')}</title>
  <script src="/scripts/tailwind-browser.js"></script>
</head>
<body class="min-h-screen bg-background text-foreground">
  <main id="openui-root" data-openui-ready="source" class="min-h-screen p-6">
    <section class="mx-auto max-w-4xl rounded-lg border border-border bg-card p-6 text-card-foreground">
      <p class="text-sm font-semibold text-muted-foreground">Generated OpenUI source is ready.</p>
      <h1 class="mt-3 text-3xl font-bold">${escapeHtml(brand || 'Generated Site')}</h1>
      <p class="mt-3 text-base text-muted-foreground">${escapeHtml(prompt)}</p>
    </section>
  </main>
  <script type="application/json" id="ship-fast-openui-source">${escapeHtml(JSON.stringify(source))}</script>
</body>
</html>`

const eventMessage = (event: GenUIEvent): string | undefined => {
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

const engineAdapterEventMessage = (event: {
  type: string
  message?: string
  phase?: string
  task?: EngineWorkspaceTask
  tasks?: EngineWorkspaceTask[]
}): string | undefined => {
  switch (event.type) {
    case 'status':
    case 'log':
      return event.message
    case 'task':
      return event.task === undefined
        ? undefined
        : `${event.task.label}: ${event.task.status}`
    case 'tasks':
      return event.tasks === undefined
        ? undefined
        : `${event.tasks.length} engine tasks planned`
    case 'preview_ready':
      return 'Homepage preview ready'
    case 'openui_ready':
      return 'OpenUI source ready'
    default:
      return undefined
  }
}

const buildGenerationPrompt = (session: Doc<'sessions'>): string => {
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

const buildGenerationSiteSpecMetadata = (
  session: Doc<'sessions'>,
  result: {
    brand: string
    theme: string | null
    locale: string
    source: string
  },
) => ({
  brand: result.brand,
  theme: result.theme ?? 'modern-minimal',
  locale: result.locale,
  designReferenceUrls: session.designReferenceUrls ?? [],
  designReferenceNotes: session.designReferenceNotes ?? '',
  cloneUrl: session.cloneUrl,
  designReferenceFingerprint: session.designReferenceFingerprint,
  modules: {
    home: result.source,
  },
})

const completeGenerationFromNode = async (
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
) => {
  const session: Doc<'sessions'> | null = await ctx.runQuery(
    internalFunctions.sessions.getGenerationSession,
    {
      sessionId: input.sessionId,
    },
  )

  if (session === null) {
    throw new Error('Session not found')
  }

  if ((session.previewVersion ?? 0) > 0) {
    return {
      sessionId: input.sessionId,
      previewVersion: session.previewVersion ?? 0,
      skipped: true,
      reason: 'preview_already_exists',
    }
  }

  await ctx.runMutation(internalFunctions.sessions.completeGenerationInternal, {
    sessionId: input.sessionId,
    anonymousOwnerSecret: input.anonymousOwnerSecret,
    html: input.html,
    siteSpecJson: input.siteSpecJson,
    openUiSource: input.openUiSource,
    tasks: input.tasks,
    elapsed: input.elapsed,
    cost: input.cost,
    provider: input.provider,
  })

  const previewVersion = (session.previewVersion ?? 0) + 1
  return { sessionId: input.sessionId, previewVersion }
}

const recordGenerationFailure = async (
  ctx: ActionCtx,
  args: { sessionId: Id<'sessions'>; anonymousOwnerSecret?: string },
  message: string,
  elapsed: number,
) => {
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
  handler: async (ctx, args) => {
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

      if (session === null) {
        return null
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

      let lastPersistedOpenUiSource: string | undefined
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

      const result = await generationRuntime.runHomepageOrchestrator({
        prompt: buildGenerationPrompt(session),
        preferredLanguage: session.preferredLanguage,
        signal: new AbortController().signal,
        onSource: (source) => {
          if (source !== lastPersistedOpenUiSource) {
            lastPersistedOpenUiSource = source
            pendingWrites.push(
              ctx.runMutation(
                internalFunctions.sessions.upsertGeneratedModule,
                {
                  sessionId: args.sessionId,
                  moduleKey: 'home',
                  source,
                  status: 'succeeded',
                },
              ),
            )
          }
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
      await Promise.all(pendingWrites)

      const completedTask: EngineWorkspaceTask = {
        id: 'homepage',
        label: 'Generate homepage',
        status: 'DONE',
      }
      const siteSpec = buildGenerationSiteSpecMetadata(session, result)
      const locale = result.locale ?? session.preferredLanguage ?? 'en'
      const staticPreviewHtml = buildOpenUiHandoffHtml(
        result.source,
        locale,
        result.brand,
        session.prompt,
      )

      await completeGenerationFromNode(ctx, {
        sessionId: args.sessionId,
        anonymousOwnerSecret: args.anonymousOwnerSecret,
        html: staticPreviewHtml,
        siteSpecJson: JSON.stringify(siteSpec),
        openUiSource: result.source,
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
