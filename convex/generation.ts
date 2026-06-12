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

type GenerationRuntime = Awaited<ReturnType<typeof loadGenerationRuntime>>

const FAST_PREVIEW_NAV = ['Home', 'Features', 'Pricing', 'Contact']
const RUNTIME_LOAD_TIMEOUT_MS = 10_000
const REFINEMENT_TIMEOUT_MS = 45_000

const loadGenerationRuntime = async () => {
  const [
    { runHomepageOrchestrator },
    { renderOpenUIToHTMLWithTheme },
    { buildPreviewSeoHead },
  ] = await Promise.all([
    import('../packages/ship-fast-engine/src/genui/run.ts'),
    import('../packages/ship-fast-engine/src/openui-ssr.js'),
    import('../packages/ship-fast-aeo/src/metadata/build-preview-head.ts'),
  ])

  return {
    runHomepageOrchestrator,
    renderOpenUIToHTMLWithTheme,
    buildPreviewSeoHead,
  }
}

const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> =>
  await Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs)
    }),
  ])

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const toTitleCase = (value: string): string =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ')

const inferFastBrand = (prompt: string): string => {
  const quoted = prompt.match(/["'“”]([^"'“”]{2,48})["'“”]/)?.[1]?.trim()
  if (quoted !== undefined && quoted.length > 0) return quoted

  const forMatch = prompt.match(/\bfor\s+([A-Z][A-Za-z0-9& -]{1,48})/)?.[1]
  if (forMatch !== undefined && forMatch.trim().length > 0) {
    return forMatch.trim().replace(/[,.!?;:].*$/, '')
  }

  const words = prompt
    .replace(/[^A-Za-z0-9 &-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2)
  return toTitleCase(words.slice(0, 2).join(' ')) || 'Generated Site'
}

const summarizePrompt = (prompt: string): string => {
  const clean = prompt.replace(/\s+/g, ' ').trim()
  if (clean.length <= 140) return clean
  return `${clean.slice(0, 137).trim()}...`
}

const buildFastPreviewHtml = (
  brand: string,
  summary: string,
  locale: string,
): string => {
  const safeBrand = escapeHtml(brand)
  const safeSummary = escapeHtml(summary)

  return `<!doctype html>
<html lang="${escapeHtml(locale)}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeBrand}</title>
  <script src="/scripts/tailwind-browser.js"></script>
</head>
<body class="min-h-screen bg-[#f7f4ec] text-[#111827]">
  <main class="min-h-screen">
    <section class="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 md:px-10">
      <nav class="flex items-center justify-between border-b border-black/10 pb-4">
        <div class="text-sm font-black uppercase tracking-[0.18em]">${safeBrand}</div>
        <div class="hidden gap-6 text-sm font-semibold text-black/60 md:flex">
          <span>Features</span><span>Pricing</span><span>Contact</span>
        </div>
      </nav>
      <div class="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.04fr_0.96fr]">
        <div class="max-w-3xl">
          <p class="mb-5 inline-flex rounded-full border border-black/15 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-black/60">Preview ready</p>
          <h1 class="text-5xl font-black leading-[0.94] text-black md:text-7xl">${safeBrand}</h1>
          <p class="mt-6 max-w-2xl text-lg leading-8 text-black/68 md:text-xl">${safeSummary}</p>
          <div class="mt-8 flex flex-wrap gap-3">
            <span class="rounded-full bg-black px-5 py-3 text-sm font-bold text-white">Launch preview</span>
            <span class="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-bold text-black/70">Refining details</span>
          </div>
        </div>
        <div class="grid gap-4">
          <div class="rounded-[8px] border border-black/10 bg-white p-5 shadow-[0_24px_80px_rgba(17,24,39,0.12)]">
            <div class="mb-4 flex items-center justify-between">
              <span class="text-sm font-black">Generation</span>
              <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Live</span>
            </div>
            <div class="space-y-3">
              <div class="h-3 w-11/12 rounded-full bg-black/80"></div>
              <div class="h-3 w-8/12 rounded-full bg-black/20"></div>
              <div class="h-3 w-10/12 rounded-full bg-black/20"></div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="rounded-[8px] bg-[#111827] p-5 text-white">
              <div class="text-3xl font-black">4s</div>
              <div class="mt-2 text-sm text-white/65">Preview target</div>
            </div>
            <div class="rounded-[8px] border border-black/10 bg-white p-5">
              <div class="text-3xl font-black">AI</div>
              <div class="mt-2 text-sm text-black/55">Refinement queued</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</body>
</html>`
}

const buildFastPreviewArtifacts = (session: Doc<'sessions'>) => {
  const brand = inferFastBrand(session.prompt)
  const locale = session.preferredLanguage ?? 'en'
  const promptSummary = summarizePrompt(session.prompt)
  const openUiSource = `root = SaasKimiPage(${JSON.stringify(brand)}, ${JSON.stringify(FAST_PREVIEW_NAV)})`
  const siteSpec = {
    brand,
    theme: 'fast-preview',
    locale,
    designReferenceUrls: session.designReferenceUrls ?? [],
    designReferenceNotes: session.designReferenceNotes ?? '',
    cloneUrl: session.cloneUrl,
    designReferenceFingerprint: session.designReferenceFingerprint,
    modules: {
      home: openUiSource,
    },
    fastPreview: true,
    promptSummary,
  }

  return {
    brand,
    html: buildFastPreviewHtml(brand, promptSummary, locale),
    openUiSource,
    siteSpec,
  }
}

const renderStaticPreviewHtml = (
  runtime: GenerationRuntime,
  source: string,
  locale: string,
  siteSpec: Record<string, unknown>,
  brand: string,
  prompt: string,
): string => {
  const { html, cssVars } = runtime.renderOpenUIToHTMLWithTheme(
    source,
    null,
    locale,
    null,
  )
  const seoHead = runtime.buildPreviewSeoHead(
    siteSpec,
    brand || 'Generated Site',
    prompt,
  )

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
        message: 'Preparing fast preview',
      })

      const completedTask: EngineWorkspaceTask = {
        id: 'homepage',
        label: 'Generate homepage',
        status: 'DONE',
      }
      const fastPreview = buildFastPreviewArtifacts(session)
      await ctx.runMutation(internalFunctions.sessions.completeGeneration, {
        sessionId: args.sessionId,
        anonymousOwnerSecret: args.anonymousOwnerSecret,
        html: fastPreview.html,
        siteSpecJson: JSON.stringify(fastPreview.siteSpec),
        openUiSource: fastPreview.openUiSource,
        tasks: [completedTask],
        elapsed: Date.now() - startedAt,
        provider: 'fast-preview',
      })

      await ctx.runMutation(internalFunctions.sessions.addGenerationEvent, {
        sessionId: args.sessionId,
        eventType: 'completed',
        message: 'Fast preview ready',
      })

      try {
        await ctx.runMutation(internalFunctions.sessions.addGenerationEvent, {
          sessionId: args.sessionId,
          eventType: 'status',
          message: 'Refining preview with Ship Fast engine',
        })

        const generationRuntime = await withTimeout(
          loadGenerationRuntime(),
          RUNTIME_LOAD_TIMEOUT_MS,
          'Ship Fast engine runtime load timed out after fast preview',
        )

        await ctx.runMutation(internalFunctions.sessions.addGenerationEvent, {
          sessionId: args.sessionId,
          eventType: 'status',
          message: 'Ship Fast OpenUI orchestrator loaded',
        })

        let lastPersistedOpenUiSource = fastPreview.openUiSource
        const pendingWrites: Array<Promise<unknown>> = []
        const result = await withTimeout(
          generationRuntime.runHomepageOrchestrator({
            prompt: buildGenerationPrompt(session),
            preferredLanguage: session.preferredLanguage,
            completeWhen: 'home',
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
                  ctx.runMutation(
                    internalFunctions.sessions.addGenerationEvent,
                    {
                      sessionId: args.sessionId,
                      eventType: event.type,
                      message,
                    },
                  ),
                )
              }
            },
          }),
          REFINEMENT_TIMEOUT_MS,
          'Ship Fast engine refinement timed out after fast preview',
        )
        await Promise.all(pendingWrites)

        const siteSpec = buildGenerationSiteSpecMetadata(session, result)
        const staticPreviewHtml = renderStaticPreviewHtml(
          generationRuntime,
          result.source,
          result.locale ?? session.preferredLanguage ?? 'en',
          siteSpec,
          result.brand,
          session.prompt,
        )
        await ctx.runMutation(
          internalFunctions.sessions.replaceGeneratedPreview,
          {
            sessionId: args.sessionId,
            html: staticPreviewHtml,
            siteSpecJson: JSON.stringify(siteSpec),
            openUiSource: result.source,
            tasks: [completedTask],
            elapsed: Date.now() - startedAt,
            provider: 'genui-orchestrator',
          },
        )

        await ctx.runMutation(internalFunctions.sessions.addGenerationEvent, {
          sessionId: args.sessionId,
          eventType: 'completed',
          message: 'Generation refinement complete',
        })

        return { status: 'completed', refined: true }
      } catch (refinementError) {
        const message =
          refinementError instanceof Error
            ? refinementError.message
            : 'Generation refinement failed'
        await ctx.runMutation(internalFunctions.sessions.addGenerationEvent, {
          sessionId: args.sessionId,
          eventType: 'refinement_failed',
          message,
        })

        return { status: 'completed', refined: false, message }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Generation failed'
      await recordGenerationFailure(ctx, args, message, Date.now() - startedAt)
      return { status: 'failed', message }
    }
  },
})
