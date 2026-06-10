"use node";

import { v } from 'convex/values'

import { internal } from './_generated/api'
import { internalAction } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import type { ActionCtx } from './_generated/server'
import { runHomepageOrchestrator } from '../packages/ship-fast-engine/src/genui/run.ts'
import { renderOpenUIToHTMLWithTheme } from '../packages/ship-fast-engine/src/openui-ssr.js'
import type { GenUIEvent } from '../packages/ship-fast-engine/src/genui/orchestrator.ts'
import type { EngineWorkspaceTask } from '../src/features/generation/server/engine-workspace'

const internalFunctions = internal as any

const renderStaticPreviewHtml = (source: string, locale: string): string => {
  const { html, cssVars } = renderOpenUIToHTMLWithTheme(source, null, locale, null)

  return `<!doctype html>
<html lang="${locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="/scripts/tailwind-browser.js"></script>
  <style>
    #openui-root {
      ${cssVars || ''}
    }
  </style>
</head>
<body class="min-h-screen bg-background text-foreground">
  <div id="openui-root">${html}</div>
</body>
</html>`
}

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

const persistTask = async (
  ctx: ActionCtx,
  sessionId: Id<'sessions'>,
  task: EngineWorkspaceTask,
  order: number,
) => {
  await ctx.runMutation(internal.sessions.upsertGenerationTask, {
    sessionId,
    task,
    order,
  })
}

export const startGeneration = internalAction({
  args: {
    sessionId: v.id('sessions'),
    anonymousOwnerSecret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session: Doc<'sessions'> | null = await ctx.runQuery(internalFunctions.sessions.getGenerationSession, {
      sessionId: args.sessionId,
    })

    if (session === null) {
      return null
    }

    try {
      await ctx.runMutation(internalFunctions.sessions.markGenerationStarted, {
        sessionId: args.sessionId,
      })

      await ctx.runMutation(internalFunctions.sessions.addGenerationEvent, {
        sessionId: args.sessionId,
        eventType: 'status',
        message: 'Running Ship Fast engine',
      })

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
      await persistTask(ctx, args.sessionId, runningTask, 0)

      const result = await runHomepageOrchestrator({
        prompt: session.prompt,
        preferredLanguage: session.preferredLanguage,
        signal: new AbortController().signal,
        onSource: (source) => {
          if (source !== lastPersistedOpenUiSource) {
            lastPersistedOpenUiSource = source
            pendingWrites.push(
              ctx.runMutation(internalFunctions.sessions.upsertGeneratedModule, {
                sessionId: args.sessionId,
                moduleKey: 'home',
                source,
                status: 'succeeded',
              }),
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
      const siteSpec = {
        brand: result.brand,
        theme: result.theme ?? 'modern-minimal',
        locale: result.locale,
        modules: {
          home: result.source,
        },
      }
      const staticPreviewHtml = renderStaticPreviewHtml(result.source, result.locale ?? session.preferredLanguage ?? 'en')
      await ctx.runMutation(internalFunctions.sessions.completeGeneration, {
        sessionId: args.sessionId,
        anonymousOwnerSecret: args.anonymousOwnerSecret,
        html: staticPreviewHtml,
        siteSpecJson: JSON.stringify(siteSpec),
        openUiSource: result.source,
        tasks: [completedTask],
      })

      await ctx.runMutation(internalFunctions.sessions.addGenerationEvent, {
        sessionId: args.sessionId,
        eventType: 'completed',
        message: 'Generation complete',
      })

      return { status: 'completed' }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed'
      await ctx.runMutation(internalFunctions.sessions.failGeneration, {
        sessionId: args.sessionId,
        anonymousOwnerSecret: args.anonymousOwnerSecret,
        message,
      })
      await ctx.runMutation(internalFunctions.sessions.addGenerationEvent, {
        sessionId: args.sessionId,
        eventType: 'failed',
        message,
      })
      return { status: 'failed', message }
    }
  },
})
