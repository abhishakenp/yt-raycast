import type { Doc, Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import { isSessionOwner } from './session_access_helpers'
import { isUnsafePublicPreviewHtml } from './openui_error_html'
import { normalizeSessionStatus } from './session_serialization_helpers'

type SessionApiResponseCtx = Pick<QueryCtx, 'db' | 'auth'>

export type SessionApiResponseArtifacts = {
  tasks: Doc<'tasks'>[]
  exports: Doc<'exports'>[]
  deployment: Doc<'deployments'> | null
  homeModule?: Doc<'generatedModules'> | null
  latestPreview?: Doc<'previews'> | null
  siteSpec?: Doc<'siteSpecs'> | null
}

function isCompletedTask(task: Doc<'tasks'>): boolean {
  return task.status === 'succeeded' || task.status === 'failed'
}

function serializeDeployment(
  session: Doc<'sessions'>,
  deployment: Doc<'deployments'> | null,
) {
  return deployment === null
    ? session.deploymentSlug !== undefined &&
      session.deploymentUrl !== undefined
      ? {
          slug: session.deploymentSlug,
          url: session.deploymentUrl,
          status: 'ready',
        }
      : null
    : {
        slug: deployment.slug,
        url: deployment.url,
        status: deployment.status,
      }
}

export function serializeSessionApiResponse(
  session: Doc<'sessions'>,
  artifacts: SessionApiResponseArtifacts,
) {
  const sortedTasks = [...artifacts.tasks].sort(
    (left, right) => (left.order ?? 0) - (right.order ?? 0),
  )
  const done = sortedTasks.filter(isCompletedTask).length

  return {
    id: session._id,
    sessionId: session._id,
    prompt: session.prompt,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt ?? session.createdAt,
    status: normalizeSessionStatus(session),
    errorCode: session.errorCode,
    errorMessage: session.errorMessage,
    deployment: serializeDeployment(session, artifacts.deployment),
    homepageReady: session.homepageReady === true,
    siteSpecReady: session.siteSpecReady === true,
    preferredExportTarget: session.preferredExportTarget,
    preferredLanguage: session.preferredLanguage,
    exportTargets: artifacts.exports.map((exportRecord) => exportRecord.target),
    payment: null,
    themeOverride: session.themeOverride ?? null,
    selectedBrandLogo: session.selectedBrandLogo ?? null,
    previewVersion: session.previewVersion ?? 0,
    preview:
      artifacts.latestPreview === null || artifacts.latestPreview === undefined
        ? null
        : {
            version: artifacts.latestPreview.version,
            html: isUnsafePublicPreviewHtml(artifacts.latestPreview.html)
              ? ''
              : artifacts.latestPreview.html,
            openUiSource: artifacts.latestPreview.openUiSource,
            siteSpecJson: artifacts.latestPreview.siteSpecJson,
            createdAt: artifacts.latestPreview.createdAt,
          },
    homeModule:
      artifacts.homeModule === null || artifacts.homeModule === undefined
        ? null
        : {
            moduleKey: artifacts.homeModule.moduleKey,
            source: artifacts.homeModule.source,
            status: artifacts.homeModule.status,
            updatedAt: artifacts.homeModule.updatedAt,
          },
    siteSpec:
      artifacts.siteSpec === null || artifacts.siteSpec === undefined
        ? null
        : {
            specJson: artifacts.siteSpec.specJson ?? artifacts.siteSpec.spec,
            updatedAt:
              artifacts.siteSpec.updatedAt ?? artifacts.siteSpec.createdAt,
          },
    taskCount: sortedTasks.length,
    done,
    tasks: sortedTasks.map((task) => ({
      id: task._id,
      title: task.title,
      status: task.status,
      order: task.order ?? 0,
      errorMessage: task.errorMessage ?? null,
    })),
    elapsed: session.elapsed ?? null,
    cost: session.cost ?? null,
    isAnonymous: session.userId === undefined,
    ecommerce: session.medusaConfig !== undefined,
    openuiReady: session.openuiReady === true,
    integrations: {
      medusa:
        session.medusaConfig === undefined
          ? null
          : { enabled: true, config: session.medusaConfig },
    },
    medusaAdminEmbed: {
      show: false,
      url: null,
    },
  }
}

export async function loadSessionApiResponse(
  ctx: SessionApiResponseCtx,
  lookup: string,
) {
  const sessionId: Id<'sessions'> | null = ctx.db.normalizeId(
    'sessions',
    lookup,
  )
  if (sessionId === null) return null

  const session = await ctx.db.get(sessionId)
  if (session === null) return null

  // Enforce private-session ownership: unauthenticated or wrong-user callers
  // get null instead of the session payload.
  if (session.isPrivate === true) {
    const owner = await isSessionOwner(ctx, session, undefined)
    if (!owner) return null
  }

  const [
    tasks,
    exportRecords,
    deployment,
    homeModule,
    latestPreview,
    siteSpec,
  ] = await Promise.all([
    ctx.db
      .query('tasks')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .take(200),
    ctx.db
      .query('exports')
      .withIndex('by_sessionId_target', (index) =>
        index.eq('sessionId', sessionId),
      )
      .take(20),
    ctx.db
      .query('deployments')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .order('desc')
      .first(),
    ctx.db
      .query('generatedModules')
      .withIndex('by_sessionId_moduleKey', (index) =>
        index.eq('sessionId', sessionId).eq('moduleKey', 'home'),
      )
      .first(),
    ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index.eq('sessionId', sessionId),
      )
      .order('desc')
      .first(),
    ctx.db
      .query('siteSpecs')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .order('desc')
      .first(),
  ])

  return serializeSessionApiResponse(session, {
    tasks,
    exports: exportRecords,
    deployment,
    homeModule,
    latestPreview,
    siteSpec,
  })
}
