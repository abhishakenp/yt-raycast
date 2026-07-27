import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { ActionCtx } from '../_generated/server'
import type { EngineTaskInput } from './session_task_helpers'

type RunQueryReference = Parameters<ActionCtx['runQuery']>[0]
type RunMutationReference = Parameters<ActionCtx['runMutation']>[0]

export type CompleteGenerationActionInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  siteSpecJson?: string
  openUiSource?: string
  tasks: EngineTaskInput[]
  elapsed?: number
  cost?: number
  provider?: string
}

export type CompleteGenerationActionReferences = {
  getGenerationSession: RunQueryReference
  completeGenerationInternal: RunMutationReference
}

export type CompleteGenerationActionResult = {
  sessionId: Id<'sessions'>
  previewVersion: number
  skipped?: boolean
  reason?: 'preview_already_exists'
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

  await ctx.runMutation(references.completeGenerationInternal, {
    sessionId: args.sessionId,
    anonymousOwnerSecret: args.anonymousOwnerSecret,
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
