"use node";

import { v } from 'convex/values'

import { internal } from './_generated/api'
import { internalAction } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import type { ActionCtx } from './_generated/server'
import { runHomepageOrchestrator } from '../packages/ship-fast-engine/src/genui/run.ts'
import { renderOpenUIToHTMLWithTheme } from '../packages/ship-fast-engine/src/openui-ssr.js'
import { buildPreviewSeoHead } from '../packages/ship-fast-aeo/src/metadata/build-preview-head.ts'
import type { GenUIEvent } from '../packages/ship-fast-engine/src/genui/orchestrator.ts'
import type { EngineWorkspaceTask } from '../src/features/generation/server/engine-workspace'

const internalFunctions = internal as any

const renderStaticPreviewHtml = (
  source: string,
  locale: string,
  siteSpec: Record<string, unknown>,
  brand: string,
  prompt: string,
): string => {
  const { html, cssVars } = renderOpenUIToHTMLWithTheme(source, null, locale, null)
  const seoHead = buildPreviewSeoHead(siteSpec, brand || 'Generated Site', prompt)

  return `<!doctype html>
<html lang="${locale}">
<head>
  ${seoHead}
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
  result: { brand: string; theme: string | null; locale: string; source: string },
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
    const startedAt = Date.now()
    const session: Doc<'sessions'> | null = await ctx.runQuery(internalFunctions.sessions.getGenerationSession, {
      sessionId: args.sessionId,
    })

    if (session === null) {
      return null
    }

    if ((session.previewVersion ?? 0) > 0) {
      return {
        status: 'skipped',
        reason: 'preview_already_exists',
      }
    }

    try {
      const startResult = await ctx.runMutation(internalFunctions.sessions.markGenerationStarted, {
        sessionId: args.sessionId,
      })

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
        prompt: buildGenerationPrompt(session),
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
      const siteSpec = buildGenerationSiteSpecMetadata(session, result)
      const staticPreviewHtml = renderStaticPreviewHtml(
        result.source,
        result.locale ?? session.preferredLanguage ?? 'en',
        siteSpec,
        result.brand,
        session.prompt,
      )
      const elapsed = Date.now() - startedAt
      await ctx.runMutation(internalFunctions.sessions.completeGeneration, {
        sessionId: args.sessionId,
        anonymousOwnerSecret: args.anonymousOwnerSecret,
        html: staticPreviewHtml,
        siteSpecJson: JSON.stringify(siteSpec),
        openUiSource: result.source,
        tasks: [completedTask],
        elapsed,
        provider: 'genui-orchestrator',
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
        elapsed: Date.now() - startedAt,
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
