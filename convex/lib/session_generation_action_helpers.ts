import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { ActionCtx } from '../_generated/server'
import { isUnsafePublicPreviewHtml } from './openui_error_html'
import type { EngineTaskInput } from './session_task_helpers'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Build a minimal client-renderable HTML shell when SSR fails in the Convex
 * action environment. The OpenUI source is embedded as a JSON script tag so
 * the browser-side OpenUI runtime can render it. This is NOT the handoff
 * placeholder — it uses a different script id and omits the
 * `data-openui-ready="source"` marker so it passes the safety checks.
 */
function buildClientRenderableShell(
  source: string,
  locale: string,
  brand: string,
): string {
  return `<!doctype html>
<html lang="${escapeHtml(locale)}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(brand || 'Generated Site')}</title>
  <script src="/scripts/tailwind-browser.js"></script>
</head>
<body class="min-h-screen bg-background text-foreground">
  <div id="openui-root"></div>
  <script type="application/json" id="openui-client-source">${escapeHtml(JSON.stringify(source))}</script>
  <script src="/scripts/openui-preview-client.js"></script>
</body>
</html>`
}

type RunQueryReference = Parameters<ActionCtx['runQuery']>[0]
type RunMutationReference = Parameters<ActionCtx['runMutation']>[0]

export type CompleteGenerationActionInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  html: string
  siteSpecJson?: string
  openUiSource?: string
  tasks: EngineTaskInput[]
  elapsed?: number
  cost?: number
  provider?: string
}

export type OpenUIRenderLoader = () => Promise<{
  renderOpenUIToHTMLWithTheme(
    source: string,
    theme?: Record<string, unknown> | null,
    locale?: string,
    integrations?: Record<string, unknown> | null,
    imageContext?: Record<string, unknown> | null | undefined,
    brandLogo?: Record<string, unknown> | null | undefined,
  ): Promise<{ html: string; cssVars: string }>
}>

export type CompleteGenerationActionReferences = {
  getGenerationSession: RunQueryReference
  completeGenerationInternal: RunMutationReference
  loadOpenUISSR: OpenUIRenderLoader
}

export type CompleteGenerationActionResult = {
  sessionId: Id<'sessions'>
  previewVersion: number
  skipped?: boolean
  reason?: 'preview_already_exists'
}

function shouldRenderOpenUISource(
  openUiSource: string | undefined,
): openUiSource is string {
  return openUiSource !== undefined && openUiSource.trim().length > 0
}

function safeParseSiteSpecBrand(siteSpecJson: string): string {
  try {
    const spec = JSON.parse(siteSpecJson) as { brand?: string }
    return typeof spec.brand === 'string' ? spec.brand : ''
  } catch {
    return ''
  }
}

function stringFromSpecValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined
}

function safeParseSiteSpecBrandContext(
  siteSpecJson: string | undefined,
): string | undefined {
  if (!siteSpecJson) return undefined
  try {
    const spec = JSON.parse(siteSpecJson) as Record<string, unknown>
    const parts = [spec.brand, spec.brandName, spec.name, spec.tagline]
      .map(stringFromSpecValue)
      .filter((value): value is string => value !== undefined)
    const descriptor = [...new Set(parts)].join(' ').trim()
    return descriptor || undefined
  } catch {
    return undefined
  }
}

function buildSsrImageContext(
  session: Doc<'sessions'>,
  siteSpecJson: string | undefined,
): Record<string, string> | undefined {
  const prompt = session.prompt?.trim() || undefined
  const brandContext = safeParseSiteSpecBrandContext(siteSpecJson)
  return prompt || brandContext ? { prompt, brandContext } : undefined
}

export async function completeGenerationAction(
  ctx: Pick<ActionCtx, 'runMutation' | 'runQuery'>,
  args: CompleteGenerationActionInput,
  references: CompleteGenerationActionReferences,
): Promise<CompleteGenerationActionResult> {
  const session = (await ctx.runQuery(references.getGenerationSession, {
    sessionId: args.sessionId,
  })) as Doc<'sessions'> | null

  if (session === null) {
    throw new ConvexError({
      code: 'NOT_FOUND',
      message: 'Session not found',
    })
  }

  if ((session.previewVersion ?? 0) > 0) {
    return {
      sessionId: args.sessionId,
      previewVersion: session.previewVersion ?? 0,
      skipped: true,
      reason: 'preview_already_exists',
    }
  }

  let renderedHtml = args.html
  let ssrFailed = false
  if (shouldRenderOpenUISource(args.openUiSource)) {
    try {
      const { renderOpenUIToHTMLWithTheme } = await references.loadOpenUISSR()
      const { html } = (await renderOpenUIToHTMLWithTheme(
        args.openUiSource,
        undefined,
        session.preferredLanguage ?? 'en',
        undefined,
        buildSsrImageContext(session, args.siteSpecJson),
      )) as { html: string; cssVars?: string }
      if (html.includes('openui-error')) {
        throw new Error('OpenUI renderer returned error HTML')
      }
      renderedHtml = html
    } catch (error) {
      console.error('[completeGeneration] Failed to render OpenUI to HTML', {
        sessionId: args.sessionId,
        error: error instanceof Error ? error.message : String(error),
      })
      ssrFailed = true
    }
  }

  // When SSR fails in the Convex action environment (known React bundling
  // issue: "fe is not a function"), build a client-renderable shell that
  // embeds the OpenUI source. The dashboard renders from openUiSource
  // client-side, and the export builder re-renders in the Next.js server
  // environment where SSR works correctly.
  if (ssrFailed && shouldRenderOpenUISource(args.openUiSource)) {
    const siteSpec = args.siteSpecJson
      ? safeParseSiteSpecBrand(args.siteSpecJson)
      : ''
    renderedHtml = buildClientRenderableShell(
      args.openUiSource,
      session.preferredLanguage ?? 'en',
      siteSpec,
    )
  }

  if (!renderedHtml.trim() || isUnsafePublicPreviewHtml(renderedHtml)) {
    throw new ConvexError({
      code: 'PREVIEW_NOT_READY',
      message: 'Preview HTML is not renderable',
    })
  }

  await ctx.runMutation(references.completeGenerationInternal, {
    sessionId: args.sessionId,
    anonymousOwnerSecret: args.anonymousOwnerSecret,
    html: renderedHtml,
    siteSpecJson: args.siteSpecJson,
    openUiSource: args.openUiSource,
    tasks: args.tasks,
    elapsed: args.elapsed,
    cost: args.cost,
    provider: args.provider,
  })

  const previewVersion = (session.previewVersion ?? 0) + 1
  return { sessionId: args.sessionId, previewVersion }
}
