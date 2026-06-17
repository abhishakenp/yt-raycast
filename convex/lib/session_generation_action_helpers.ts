import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { ActionCtx } from '../_generated/server'
import type { EngineTaskInput } from './session_task_helpers'

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
  renderOpenUIToHTMLWithTheme: (
    source: string,
    theme?: object,
    language?: string,
    integrations?: object,
    imageContext?: object,
  ) => object
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

const shouldRenderOpenUISource = (
  html: string,
  openUiSource: string | undefined,
): openUiSource is string =>
  !/\sdata-cms\s*=/.test(html) &&
  openUiSource !== undefined &&
  openUiSource.trim().length > 0

export const completeGenerationAction = async (
  ctx: Pick<ActionCtx, 'runMutation' | 'runQuery'>,
  args: CompleteGenerationActionInput,
  references: CompleteGenerationActionReferences,
): Promise<CompleteGenerationActionResult> => {
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
  if (shouldRenderOpenUISource(args.html, args.openUiSource)) {
    try {
      const { renderOpenUIToHTMLWithTheme } = await references.loadOpenUISSR()
      const { html } = renderOpenUIToHTMLWithTheme(
        args.openUiSource,
        undefined,
        session.preferredLanguage ?? 'en',
        undefined,
      ) as { html: string; cssVars?: string }
      if (html.includes('openui-error')) {
        throw new Error('OpenUI renderer returned error HTML')
      }
      renderedHtml = html
    } catch (error) {
      console.error('[completeGeneration] Failed to render OpenUI to HTML', {
        sessionId: args.sessionId,
        error: error instanceof Error ? error.message : String(error),
      })
    }
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
