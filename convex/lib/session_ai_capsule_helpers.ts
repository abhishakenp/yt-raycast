import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

export type AiCapsuleRow = Doc<'aiCapsules'>

export type UpsertAiCapsuleInput = {
  sessionId: Id<'sessions'>
  capsuleName: string
  parentCapsule: string
  compiledJs: string
  description: string
}

/**
 * List all AI-generated capsules for a session. Used by the OpenUIViewer to
 * dynamically register AI capsules in the library before rendering.
 */
export const listSessionAiCapsules = async (
  ctx: QueryCtx,
  sessionId: Id<'sessions'>,
): Promise<AiCapsuleRow[]> => {
  const rows = await ctx.db
    .query('aiCapsules')
    .withIndex('by_sessionId', (q) => q.eq('sessionId', sessionId))
    .collect()
  return rows
}

/**
 * Insert or update an AI-generated capsule for a session. If a capsule with
 * the same sessionId + capsuleName already exists (re-edit), update it in
 * place. Otherwise insert a new row.
 */
export const upsertSessionAiCapsule = async (
  ctx: MutationCtx,
  input: UpsertAiCapsuleInput,
): Promise<Id<'aiCapsules'>> => {
  const now = Date.now()
  const existing = await ctx.db
    .query('aiCapsules')
    .withIndex('by_sessionId_capsuleName', (q) =>
      q.eq('sessionId', input.sessionId).eq('capsuleName', input.capsuleName),
    )
    .unique()

  if (existing) {
    await ctx.db.patch(existing._id, {
      compiledJs: input.compiledJs,
      description: input.description,
      updatedAt: now,
    })
    return existing._id
  }

  return await ctx.db.insert('aiCapsules', {
    sessionId: input.sessionId,
    capsuleName: input.capsuleName,
    parentCapsule: input.parentCapsule,
    compiledJs: input.compiledJs,
    description: input.description,
    createdAt: now,
    updatedAt: now,
  })
}
