import { ConvexError } from 'convex/values'

import type { Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { assertCanMutateSession } from './session_access_helpers'

type DeploymentReadCtx = Pick<QueryCtx, 'db'>

export type PublishSessionPreviewInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  requestedSlug?: string
}

export const normalizeDeploymentSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 63)

export const createDefaultDeploymentSlug = (
  prompt: string,
  sessionId: string,
): string => {
  const fromPrompt = normalizeDeploymentSlug(prompt)
    .split('-')
    .slice(0, 4)
    .join('-')
  const fallback = normalizeDeploymentSlug(sessionId).slice(0, 20)

  return fromPrompt || fallback || 'generated-site'
}

export const reserveDefaultDeploymentSlug = async (
  ctx: MutationCtx,
  prompt: string,
  sessionId: Id<'sessions'>,
): Promise<string> => {
  const baseSlug = createDefaultDeploymentSlug(prompt, sessionId)
  let finalSlug = baseSlug
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    const existing = await ctx.db
      .query('sessions')
      .withIndex('by_deploymentSlug', (index) =>
        index.eq('deploymentSlug', finalSlug),
      )
      .first()

    if (!existing || existing._id === sessionId) break

    const randomSuffix = Math.random().toString(16).slice(2, 6)
    finalSlug = `${baseSlug}-${randomSuffix}`
    attempts++
  }

  await ctx.db.patch(sessionId, { deploymentSlug: finalSlug })
  return finalSlug
}

export const createDeploymentUrl = (slug: string): string =>
  `https://${slug}.ship-fast.io`

export const loadDeploymentBySlug = async (
  ctx: DeploymentReadCtx,
  slug: string,
) => {
  const deployment = await ctx.db
    .query('deployments')
    .withIndex('by_slug', (index) => index.eq('slug', slug))
    .first()

  if (deployment === null) return null

  const session = await ctx.db.get(deployment.sessionId)
  if (session === null) return null

  return {
    slug: deployment.slug,
    url: deployment.url,
    status: deployment.status,
    previewVersion: deployment.previewVersion,
    sessionId: deployment.sessionId,
    session: {
      id: session._id,
      prompt: session.prompt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt ?? session.createdAt,
      status: session.status ?? null,
    },
  }
}

export const loadDeploymentStatus = async (
  ctx: DeploymentReadCtx,
  sessionId: Id<'sessions'>,
) => {
  const deployment = await ctx.db
    .query('deployments')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
    .first()

  return deployment === null
    ? null
    : {
        slug: deployment.slug,
        url: deployment.url,
        status: deployment.status,
        previewVersion: deployment.previewVersion,
        createdAt: deployment.createdAt,
        updatedAt: deployment.updatedAt,
      }
}

export const publishSessionPreview = async (
  ctx: MutationCtx,
  args: PublishSessionPreviewInput,
) => {
  const session = await ctx.db.get(args.sessionId)
  const now = Date.now()

  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'log',
    message: 'Persisting generated homepage',
    createdAt: now,
  })

  session.isPrivate === false ||
    (() => {
      throw new ConvexError({
        code: 'PRIVATE_SESSION',
        message: 'Private sessions cannot be published',
      })
    })()

  session.status === 'preview_ready' ||
    (() => {
      throw new ConvexError({
        code: 'PREVIEW_NOT_READY',
        message: 'Preview is not ready to publish',
      })
    })()

  const [preview, existingDeployment] = await Promise.all([
    ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .order('desc')
      .first(),
    ctx.db
      .query('deployments')
      .withIndex('by_sessionId', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .first(),
  ])

  preview !== null ||
    (() => {
      throw new ConvexError({
        code: 'PREVIEW_NOT_READY',
        message: 'Preview is not ready to publish',
      })
    })()

  const slug =
    existingDeployment !== null && args.requestedSlug === undefined
      ? existingDeployment.slug
      : normalizeDeploymentSlug(
          args.requestedSlug ??
            createDefaultDeploymentSlug(session.prompt, args.sessionId),
        )

  slug.length > 0 ||
    (() => {
      throw new ConvexError({
        code: 'INVALID_SLUG',
        message: 'Deployment slug is required',
      })
    })()

  const existingBySlug = await ctx.db
    .query('deployments')
    .withIndex('by_slug', (index) => index.eq('slug', slug))
    .first()

  existingBySlug === null ||
    existingBySlug.sessionId === args.sessionId ||
    (() => {
      throw new ConvexError({
        code: 'SLUG_TAKEN',
        message: 'Deployment slug is already taken',
      })
    })()

  const url = createDeploymentUrl(slug)

  existingDeployment === null
    ? await ctx.db.insert('deployments', {
        sessionId: args.sessionId,
        slug,
        url,
        status: 'ready',
        previewVersion: preview.version,
        createdAt: now,
        updatedAt: now,
      })
    : await ctx.db.patch(existingDeployment._id, {
        slug,
        url,
        status: 'ready',
        previewVersion: preview.version,
        errorMessage: undefined,
        updatedAt: now,
      })

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'published',
    message: `Published preview to ${url}`,
    previewVersion: preview.version,
    createdAt: now,
  })

  return {
    sessionId: args.sessionId,
    slug,
    url,
    status: 'ready' as const,
  }
}
