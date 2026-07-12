import type { QueryCtx } from '../_generated/server'
import { isUnsafePublicPreviewHtml } from './openui_error_html'

type SessionPublicPreviewCtx = Pick<QueryCtx, 'db'>

export async function loadPublicPreview(
  ctx: SessionPublicPreviewCtx,
  lookup: string,
) {
  const sessionId = ctx.db.normalizeId('sessions', lookup)
  const directSession = sessionId === null ? null : await ctx.db.get(sessionId)
  const deployment =
    directSession === null
      ? await ctx.db
          .query('deployments')
          .withIndex('by_slug', (index) => index.eq('slug', lookup))
          .first()
      : null
  const session =
    directSession ??
    (deployment === null ? null : await ctx.db.get(deployment.sessionId))

  if (session === null || session.isPrivate) return null

  const previewVersion = deployment?.previewVersion
  const preview =
    previewVersion === undefined
      ? await ctx.db
          .query('previews')
          .withIndex('by_sessionId_version', (index) =>
            index.eq('sessionId', session._id),
          )
          .order('desc')
          .first()
      : await ctx.db
          .query('previews')
          .withIndex('by_sessionId_version', (index) =>
            index.eq('sessionId', session._id).eq('version', previewVersion),
          )
          .first()

  return preview === null
    ? {
        sessionId: session._id,
        slug: deployment?.slug,
        status: session.status,
        previewVersion: session.previewVersion,
        html: undefined,
      }
    : {
        sessionId: session._id,
        slug: deployment?.slug,
        status: session.status,
        previewVersion: preview.version,
        html: isUnsafePublicPreviewHtml(preview.html) ? '' : preview.html,
      }
}
