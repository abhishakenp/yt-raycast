import { ConvexError } from 'convex/values'

import type { Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import {
  assertCanMutateSession,
  assertCanReadOwnedSession,
} from './session_access_helpers'

type DeploymentReadCtx = Pick<QueryCtx, 'db'>

export type PublishSessionPreviewInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  requestedSlug?: string
}

export type LakebedDeploymentSuccessInput = {
  sessionId: Id<'sessions'>
  requestedSlug?: string
  previewVersion: number
  url: string
  deployId: string
  claimUrl?: string
  artifactHash: string
  clientBundleHash: string
  clientBundleBytes: number
  requestBodyBytes: number
  serverBundleBytes: number
  sourceFileCount: number
  expiresAt?: string
  inspectPolicy?: string
}

export type LakebedDeploymentFailureInput = {
  sessionId: Id<'sessions'>
  requestedSlug?: string
  errorMessage: string
}

export type LakebedDeploymentPayloadChunkRef = {
  batchId: string
  chunkCount: number
  payload: string
}

export type LakebedPreparedSourceKind = 'html' | 'openui'

const lakebedPayloadChunkSize = 200_000

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

const readLakebedThemeName = (
  siteSpecJson: string | undefined,
  fallback: string | undefined,
): string | undefined => {
  if (fallback !== undefined && fallback.trim().length > 0) return fallback
  if (siteSpecJson === undefined) return undefined
  try {
    const parsed = JSON.parse(siteSpecJson) as {
      genuiTheme?: unknown
      theme?: unknown
      themeName?: unknown
    }
    const theme = parsed.themeName ?? parsed.genuiTheme ?? parsed.theme
    return typeof theme === 'string' && theme.trim().length > 0
      ? theme
      : undefined
  } catch {
    return undefined
  }
}

const lakebedDeploymentMetadata = (deployment: {
  provider?: 'ship-fast' | 'lakebed'
  lakebedDeployId?: string
  lakebedClaimUrl?: string
  lakebedArtifactHash?: string
  lakebedClientBundleHash?: string
  lakebedClientBundleBytes?: number
  lakebedRequestBodyBytes?: number
  lakebedServerBundleBytes?: number
  lakebedSourceFileCount?: number
  lakebedExpiresAt?: string
  lakebedInspectPolicy?: string
  errorMessage?: string
}) =>
  deployment.provider === 'lakebed'
    ? {
        provider: deployment.provider,
        lakebedDeployId: deployment.lakebedDeployId,
        lakebedClaimUrl: deployment.lakebedClaimUrl,
        lakebedArtifactHash: deployment.lakebedArtifactHash,
        lakebedClientBundleHash: deployment.lakebedClientBundleHash,
        lakebedClientBundleBytes: deployment.lakebedClientBundleBytes,
        lakebedRequestBodyBytes: deployment.lakebedRequestBodyBytes,
        lakebedServerBundleBytes: deployment.lakebedServerBundleBytes,
        lakebedSourceFileCount: deployment.lakebedSourceFileCount,
        lakebedExpiresAt: deployment.lakebedExpiresAt,
        lakebedInspectPolicy: deployment.lakebedInspectPolicy,
        errorMessage: deployment.errorMessage,
      }
    : deployment.provider === undefined
      ? {}
      : { provider: deployment.provider, errorMessage: deployment.errorMessage }

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
    ...lakebedDeploymentMetadata(deployment),
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
        ...lakebedDeploymentMetadata(deployment),
      }
}

export const prepareLakebedSessionDeployment = async (
  ctx: QueryCtx,
  args: PublishSessionPreviewInput,
) => {
  console.log(
    '[lakebed_deploy:prepare] start',
    JSON.stringify({ sessionId: args.sessionId }),
  )
  const session = await ctx.db.get(args.sessionId)
  console.log(
    '[lakebed_deploy:prepare] session:loaded',
    JSON.stringify({
      sessionId: args.sessionId,
      found: session !== null,
      status: session?.status,
    }),
  )

  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  await assertCanReadOwnedSession(ctx, session, args.anonymousOwnerSecret)

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

  const [preview, homeModule] = await Promise.all([
    ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index.eq('sessionId', args.sessionId),
      )
      .order('desc')
      .first(),
    ctx.db
      .query('generatedModules')
      .withIndex('by_sessionId_moduleKey', (index) =>
        index.eq('sessionId', args.sessionId).eq('moduleKey', 'home'),
      )
      .first(),
  ])
  console.log(
    '[lakebed_deploy:prepare] artifacts:loaded',
    JSON.stringify({
      sessionId: args.sessionId,
      hasPreview: preview !== null,
      hasHomeModule: Boolean(homeModule?.source.trim().length),
      previewVersion: preview?.version,
    }),
  )

  preview !== null ||
    (() => {
      throw new ConvexError({
        code: 'PREVIEW_NOT_READY',
        message: 'Preview is not ready to publish',
      })
    })()

  const openUiSource =
    typeof preview.openUiSource === 'string' && preview.openUiSource.trim()
      ? preview.openUiSource
      : homeModule?.source
  const shouldUseOpenUiSource =
    session.openuiReady === true || session.preferredExportTarget !== 'html'
  if (shouldUseOpenUiSource && !openUiSource?.trim()) {
    throw new ConvexError({
      code: 'ARTIFACT_NOT_READY',
      message: 'Generated source is not ready to deploy',
    })
  }
  const sourceKind: LakebedPreparedSourceKind = shouldUseOpenUiSource
    ? 'openui'
    : 'html'
  const source = shouldUseOpenUiSource ? openUiSource! : preview.html

  console.log(
    '[lakebed_deploy:prepare] return',
    JSON.stringify({
      sessionId: args.sessionId,
      sourceBytes: source.length,
      sourceKind,
      previewHtmlBytes: preview.html.length,
      previewVersion: preview.version,
    }),
  )

  return {
    sessionId: args.sessionId,
    source,
    sourceKind,
    siteSpecJson: preview.siteSpecJson,
    previewHtml: preview.html,
    previewVersion: preview.version,
    projectName: session.prompt,
    themeName: readLakebedThemeName(preview.siteSpecJson, session.genuiTheme),
    isDark: true,
  }
}

export const storePreparedLakebedSessionDeployment = async (
  ctx: MutationCtx,
  args: PublishSessionPreviewInput,
): Promise<LakebedDeploymentPayloadChunkRef> => {
  const prepared = await prepareLakebedSessionDeployment(
    ctx as unknown as QueryCtx,
    args,
  )
  console.log(
    '[lakebed_deploy:prepare] serialize:start',
    JSON.stringify({
      sessionId: args.sessionId,
      sourceBytes: prepared.source.length,
      previewHtmlBytes: prepared.previewHtml?.length ?? 0,
      previewVersion: prepared.previewVersion,
    }),
  )
  const payload = JSON.stringify(prepared)
  const batchId = `${args.sessionId}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`
  const chunkCount = Math.ceil(payload.length / lakebedPayloadChunkSize)
  console.log(
    '[lakebed_deploy:prepare] serialize:complete',
    JSON.stringify({
      sessionId: args.sessionId,
      payloadBytes: payload.length,
      chunkCount,
    }),
  )

  return { batchId, chunkCount, payload }
}

export const readPreparedLakebedDeploymentChunk = async (
  ctx: QueryCtx,
  args: { batchId: string; index: number },
) => {
  const chunk = await ctx.db
    .query('lakebedDeploymentPayloadChunks')
    .withIndex('by_batchId_index', (index) =>
      index.eq('batchId', args.batchId).eq('index', args.index),
    )
    .first()

  return chunk?.chunk ?? null
}

export const deletePreparedLakebedDeploymentChunks = async (
  ctx: MutationCtx,
  args: { batchId: string },
) => {
  const chunks = await ctx.db
    .query('lakebedDeploymentPayloadChunks')
    .withIndex('by_batchId_index', (index) => index.eq('batchId', args.batchId))
    .collect()

  await Promise.all(chunks.map((chunk) => ctx.db.delete(chunk._id)))
  return { deleted: chunks.length }
}

const deploymentSlugForRecord = async (
  ctx: Pick<MutationCtx, 'db'>,
  sessionId: Id<'sessions'>,
  prompt: string,
  requestedSlug?: string,
) => {
  const existingDeployment = await ctx.db
    .query('deployments')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
    .first()
  const slug =
    existingDeployment !== null && requestedSlug === undefined
      ? existingDeployment.slug
      : normalizeDeploymentSlug(
          requestedSlug ?? createDefaultDeploymentSlug(prompt, sessionId),
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
    existingBySlug.sessionId === sessionId ||
    (() => {
      throw new ConvexError({
        code: 'SLUG_TAKEN',
        message: 'Deployment slug is already taken',
      })
    })()

  return { existingDeployment, slug }
}

export const recordLakebedSessionDeploymentSuccess = async (
  ctx: MutationCtx,
  args: LakebedDeploymentSuccessInput,
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

  const { existingDeployment, slug } = await deploymentSlugForRecord(
    ctx,
    args.sessionId,
    session.prompt,
    args.requestedSlug,
  )

  const deploymentPatch = {
    sessionId: args.sessionId,
    slug,
    url: args.url,
    status: 'ready' as const,
    provider: 'lakebed' as const,
    previewVersion: args.previewVersion,
    lakebedDeployId: args.deployId,
    lakebedClaimUrl: args.claimUrl,
    lakebedArtifactHash: args.artifactHash,
    lakebedClientBundleHash: args.clientBundleHash,
    lakebedClientBundleBytes: args.clientBundleBytes,
    lakebedRequestBodyBytes: args.requestBodyBytes,
    lakebedServerBundleBytes: args.serverBundleBytes,
    lakebedSourceFileCount: args.sourceFileCount,
    lakebedExpiresAt: args.expiresAt,
    lakebedInspectPolicy: args.inspectPolicy,
    errorMessage: undefined,
    updatedAt: now,
  }

  existingDeployment === null
    ? await ctx.db.insert('deployments', {
        ...deploymentPatch,
        createdAt: now,
      })
    : await ctx.db.patch(existingDeployment._id, deploymentPatch)

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'published',
    message: `Published Lakebed app to ${args.url}`,
    previewVersion: args.previewVersion,
    createdAt: now,
  })

  return {
    sessionId: args.sessionId,
    slug,
    url: args.url,
    status: 'ready' as const,
    provider: 'lakebed' as const,
    deployId: args.deployId,
  }
}

export const recordLakebedSessionDeploymentFailure = async (
  ctx: MutationCtx,
  args: LakebedDeploymentFailureInput,
) => {
  const session = await ctx.db.get(args.sessionId)
  const now = Date.now()

  if (session === null) return null

  const { existingDeployment, slug } = await deploymentSlugForRecord(
    ctx,
    args.sessionId,
    session.prompt,
    args.requestedSlug,
  )
  const url = existingDeployment?.url ?? createDeploymentUrl(slug)

  existingDeployment === null
    ? await ctx.db.insert('deployments', {
        sessionId: args.sessionId,
        slug,
        url,
        status: 'failed',
        provider: 'lakebed',
        errorMessage: args.errorMessage,
        createdAt: now,
        updatedAt: now,
      })
    : await ctx.db.patch(existingDeployment._id, {
        slug,
        status: 'failed',
        provider: 'lakebed',
        errorMessage: args.errorMessage,
        updatedAt: now,
      })

  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'publish_failed',
    message: `Lakebed deploy failed: ${args.errorMessage}`,
    createdAt: now,
  })

  return { sessionId: args.sessionId, slug, status: 'failed' as const }
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
        provider: 'ship-fast',
        previewVersion: preview.version,
        createdAt: now,
        updatedAt: now,
      })
    : await ctx.db.patch(existingDeployment._id, {
        slug,
        url,
        status: 'ready',
        provider: 'ship-fast',
        previewVersion: preview.version,
        errorMessage: undefined,
        lakebedDeployId: undefined,
        lakebedClaimUrl: undefined,
        lakebedArtifactHash: undefined,
        lakebedClientBundleHash: undefined,
        lakebedClientBundleBytes: undefined,
        lakebedRequestBodyBytes: undefined,
        lakebedServerBundleBytes: undefined,
        lakebedSourceFileCount: undefined,
        lakebedExpiresAt: undefined,
        lakebedInspectPolicy: undefined,
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
