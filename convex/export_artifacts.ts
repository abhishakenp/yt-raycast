'use node'

import { createHash } from 'node:crypto'

import { internal } from './_generated/api'
import { internalAction } from './_generated/server'
import type { ActionCtx } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { exportArtifactBuildArgs } from './lib/session_validators'
import type {
  BuiltExport,
  ExportTarget,
} from '../src/features/exports/services/openui-export-types'

type PreparedExportArtifact = {
  sessionId: Id<'sessions'>
  prompt: string
  target: ExportTarget
  previewVersion: number
  source: string
  html: string
  siteSpecJson?: string
  previewHtml?: string
  themeName?: string
  isDark?: boolean
  locale?: string
  selectedBrandLogo?: {
    name: string
    domain: string | null
    brandId: string | null
    icon: string | null
    logo: string | null
  } | null
  isPrivate: boolean
}

const textEncoder = new TextEncoder()

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

const bodyBytes = (body: string | Uint8Array): Uint8Array =>
  typeof body === 'string' ? textEncoder.encode(body) : body

const hashBytes = (bytes: Uint8Array): string =>
  createHash('sha256').update(bytes).digest('hex')

const storeText = async (ctx: ActionCtx, text: string, contentType: string) =>
  await ctx.storage.store(new Blob([text], { type: contentType }))

const storeBytes = async (
  ctx: ActionCtx,
  bytes: Uint8Array,
  contentType: string,
) => {
  const arrayBuffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(arrayBuffer).set(bytes)
  return await ctx.storage.store(new Blob([arrayBuffer], { type: contentType }))
}

const buildGitHubFiles = async (
  prepared: PreparedExportArtifact,
): Promise<{
  files: Record<string, string>
  download?: BuiltExport
}> => {
  try {
    const { buildOpenUIArtifactFiles } =
      await import('../src/features/exports/services/openui-artifact-files')
    return await buildOpenUIArtifactFiles({
      source: prepared.source,
      siteSpecJson: prepared.siteSpecJson,
      previewHtml: prepared.previewHtml ?? prepared.html,
      sessionId: prepared.sessionId,
      target: prepared.target,
      includeBadge: false,
      themeName: prepared.themeName,
      isDark: prepared.isDark,
      locale: prepared.locale,
      selectedBrandLogo: prepared.selectedBrandLogo,
    })
  } catch (error) {
    console.error('[export_artifacts:buildGitHubFiles] failed', {
      target: prepared.target,
      sessionId: prepared.sessionId,
      previewVersion: prepared.previewVersion,
      sourceLength: prepared.source.length,
      siteSpecLength: prepared.siteSpecJson?.length ?? 0,
      previewHtmlLength: prepared.previewHtml?.length ?? 0,
      error: errorMessage(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw error
  }
}

const buildDownload = async (
  prepared: PreparedExportArtifact,
  artifact: {
    files: Record<string, string>
    download?: BuiltExport
  },
): Promise<BuiltExport> => {
  const { buildDownloadFromArtifactFiles } =
    await import('../src/features/exports/services/openui-artifact-files')
  return await buildDownloadFromArtifactFiles(
    {
      source: prepared.source,
      siteSpecJson: prepared.siteSpecJson,
      previewHtml: prepared.previewHtml ?? prepared.html,
      sessionId: prepared.sessionId,
      target: prepared.target,
      includeBadge: false,
      themeName: prepared.themeName,
      isDark: prepared.isDark,
      locale: prepared.locale,
      selectedBrandLogo: prepared.selectedBrandLogo,
    },
    artifact.files,
    artifact.download,
  )
}

const deployLakebedIfRequested = async (
  ctx: ActionCtx,
  prepared: PreparedExportArtifact,
  files: Record<string, string>,
) => {
  if (prepared.target !== 'lakebed' || prepared.isPrivate) {
    return
  }

  try {
    const { deployLakebedProjectFiles } =
      await import('../src/features/deployments/server/lakebed-deploy-service')
    const deployed = await deployLakebedProjectFiles({ files })
    await ctx.runMutation(internal.sessions.recordLakebedDeploymentSuccess, {
      sessionId: prepared.sessionId,
      previewVersion: prepared.previewVersion,
      url: deployed.url,
      deployId: deployed.deployId,
      claimUrl: deployed.claimUrl,
      artifactHash: deployed.artifactHash,
      clientBundleHash: deployed.clientBundleHash,
      clientBundleBytes: deployed.clientBundleBytes,
      requestBodyBytes: deployed.requestBodyBytes,
      serverBundleBytes: deployed.serverBundleBytes,
      sourceFileCount: deployed.sourceFileCount,
      expiresAt: deployed.expiresAt,
      inspectPolicy: deployed.inspectPolicy,
    })
  } catch (error) {
    console.error('[export_artifacts:deployLakebedIfRequested] failed', {
      target: prepared.target,
      sessionId: prepared.sessionId,
      previewVersion: prepared.previewVersion,
      fileCount: Object.keys(files).length,
      error: errorMessage(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    await ctx.runMutation(internal.sessions.recordLakebedDeploymentFailure, {
      sessionId: prepared.sessionId,
      errorMessage: errorMessage(error),
    })
  }
}

export const build = internalAction({
  args: exportArtifactBuildArgs,
  handler: async (ctx, args) => {
    let stage = 'mark-started'
    try {
      await ctx.runMutation(
        internal.sessions.markExportArtifactBuildStarted,
        args,
      )
      stage = 'prepare-input'
      const prepared = await ctx.runQuery(
        internal.sessions.prepareExportArtifactBuildInput,
        args,
      )
      if (prepared === null) {
        return { target: args.target, status: 'stale' as const }
      }
      stage = 'build-files'
      const artifact = await buildGitHubFiles(prepared)
      stage = 'build-download'
      const download = await buildDownload(prepared, artifact)
      stage = 'encode-download'
      const bytes = bodyBytes(download.body)
      stage = 'store-artifacts'
      const [storageId, filesStorageId] = await Promise.all([
        storeBytes(ctx, bytes, download.contentType),
        storeText(
          ctx,
          JSON.stringify(artifact.files),
          'application/json; charset=utf-8',
        ),
      ])

      stage = 'record-ready'
      await ctx.runMutation(internal.sessions.recordExportArtifactBuildReady, {
        ...args,
        storageId,
        filesStorageId,
        filename: download.filename,
        contentType: download.contentType,
        fileCount: download.fileCount,
        byteLength: bytes.byteLength,
        hash: hashBytes(bytes),
      })

      if (args.autoDeployPublic === true) {
        stage = 'auto-deploy-lakebed'
        await deployLakebedIfRequested(ctx, prepared, artifact.files)
      }

      return { target: args.target, status: 'ready' as const }
    } catch (error) {
      console.error('[export_artifacts:build] failed', {
        stage,
        target: args.target,
        sessionId: args.sessionId,
        previewVersion: args.previewVersion,
        error: errorMessage(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
      await ctx.runMutation(
        internal.sessions.recordExportArtifactBuildFailure,
        {
          ...args,
          errorMessage: errorMessage(error),
        },
      )
      throw error
    }
  },
})
