'use node'

import { createHash } from 'node:crypto'
import { zipSync, strToU8 } from 'fflate'

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
  html?: string
  siteSpecJson?: string
  previewHtml?: string
  themeName?: string
  isDark?: boolean
  isPrivate: boolean
}

const textEncoder = new TextEncoder()

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

const logBuildStage = (
  stage: string,
  details: {
    target: ExportTarget
    sessionId: Id<'sessions'>
    previewVersion: number
    elapsedMs?: number
    fileCount?: number
    byteLength?: number
    sourceLength?: number
    siteSpecLength?: number
    previewHtmlLength?: number
    autoDeployPublic?: boolean
  },
) => {
  console.log('[export_artifacts:build] stage', {
    stage,
    ...details,
  })
}

const bodyBytes = (body: string | Uint8Array): Uint8Array =>
  typeof body === 'string' ? textEncoder.encode(body) : body

const hashBytes = (bytes: Uint8Array): string =>
  createHash('sha256').update(bytes).digest('hex')

const zipFiles = (files: Record<string, string>): Uint8Array =>
  zipSync(
    Object.fromEntries(
      Object.entries(files).map(([path, source]) => [path, strToU8(source)]),
    ),
  )

const downloadSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'ship-fast-export'

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
): Promise<Record<string, string>> => {
  const startedAt = Date.now()
  try {
    if (prepared.target === 'lakebed') {
      console.log('[export_artifacts:buildGitHubFiles] lakebed:start', {
        target: prepared.target,
        sessionId: prepared.sessionId,
        previewVersion: prepared.previewVersion,
        sourceLength: prepared.source.length,
        siteSpecLength: prepared.siteSpecJson?.length ?? 0,
        previewHtmlLength: prepared.previewHtml?.length ?? 0,
        themeName: prepared.themeName ?? null,
        isDark: prepared.isDark ?? null,
      })
      const { buildOpenUILakebedProjectFiles } =
        await import('../src/features/exports/services/openui-lakebed-export-builder')
      const result = (
        await buildOpenUILakebedProjectFiles({
          source: prepared.source,
          siteSpecJson: prepared.siteSpecJson,
          previewHtml: prepared.previewHtml,
          sessionId: prepared.sessionId,
          target: 'lakebed',
          includeBadge: false,
          themeName: prepared.themeName,
          isDark: prepared.isDark,
        })
      ).files
      console.log('[export_artifacts:buildGitHubFiles] lakebed:done', {
        target: prepared.target,
        sessionId: prepared.sessionId,
        previewVersion: prepared.previewVersion,
        fileCount: Object.keys(result).length,
        elapsedMs: Date.now() - startedAt,
      })
      return result
    }

    const {
      createHtmlExportFiles,
      createReactExportFiles,
      createNextExportFiles,
    } = await import('../src/features/exports/services/html-export-files')
    const options = { includeBadge: false }

    return prepared.target === 'html'
      ? createHtmlExportFiles(
          prepared.sessionId,
          'html',
          prepared.html,
          options,
        )
      : prepared.target === 'react'
        ? createReactExportFiles(
            prepared.sessionId,
            'react',
            prepared.html,
            options,
          )
        : createNextExportFiles(
            prepared.sessionId,
            'next',
            prepared.html,
            options,
          )
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
  files: Record<string, string>,
): Promise<BuiltExport> => {
  if (prepared.target === 'html') {
    return {
      body: files['index.html'] ?? prepared.html,
      contentType: 'text/html; charset=utf-8',
      filename: 'index.html',
      fileCount: 1,
    }
  }

  if (prepared.html === undefined) {
    throw new Error(`Missing HTML for ${prepared.target} export`)
  }

  const { extractExportMetadata } =
    await import('../src/features/exports/services/html-export-files')
  const slug =
    prepared.target === 'lakebed'
      ? `ship-fast-${prepared.sessionId}`
      : downloadSlug(extractExportMetadata(prepared.html).title)

  return {
    body: zipFiles(files),
    contentType: 'application/zip',
    filename: `${slug}-${prepared.target}.zip`,
    fileCount: Object.keys(files).length,
  }
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
    const startedAt = Date.now()
    console.log('[export_artifacts:deployLakebedIfRequested] start', {
      target: prepared.target,
      sessionId: prepared.sessionId,
      previewVersion: prepared.previewVersion,
      fileCount: Object.keys(files).length,
    })
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
    console.log('[export_artifacts:deployLakebedIfRequested] done', {
      target: prepared.target,
      sessionId: prepared.sessionId,
      previewVersion: prepared.previewVersion,
      url: deployed.url,
      elapsedMs: Date.now() - startedAt,
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
    const startedAt = Date.now()
    try {
      logBuildStage(stage, {
        target: args.target,
        sessionId: args.sessionId,
        previewVersion: args.previewVersion,
        autoDeployPublic: args.autoDeployPublic,
      })
      await ctx.runMutation(
        internal.sessions.markExportArtifactBuildStarted,
        args,
      )
      stage = 'prepare-input'
      logBuildStage(stage, {
        target: args.target,
        sessionId: args.sessionId,
        previewVersion: args.previewVersion,
        elapsedMs: Date.now() - startedAt,
      })
      const prepared = await ctx.runQuery(
        internal.sessions.prepareExportArtifactBuildInput,
        args,
      )
      if (prepared === null) {
        logBuildStage('stale', {
          target: args.target,
          sessionId: args.sessionId,
          previewVersion: args.previewVersion,
          elapsedMs: Date.now() - startedAt,
        })
        return { target: args.target, status: 'stale' as const }
      }
      stage = 'build-files'
      logBuildStage(stage, {
        target: args.target,
        sessionId: args.sessionId,
        previewVersion: args.previewVersion,
        elapsedMs: Date.now() - startedAt,
        sourceLength: prepared.source.length,
        siteSpecLength: prepared.siteSpecJson?.length ?? 0,
        previewHtmlLength: prepared.previewHtml?.length ?? 0,
      })
      const files = await buildGitHubFiles(prepared)
      stage = 'build-download'
      logBuildStage(stage, {
        target: args.target,
        sessionId: args.sessionId,
        previewVersion: args.previewVersion,
        elapsedMs: Date.now() - startedAt,
        fileCount: Object.keys(files).length,
      })
      const download = await buildDownload(prepared, files)
      stage = 'encode-download'
      logBuildStage(stage, {
        target: args.target,
        sessionId: args.sessionId,
        previewVersion: args.previewVersion,
        elapsedMs: Date.now() - startedAt,
      })
      const bytes = bodyBytes(download.body)
      stage = 'store-artifacts'
      logBuildStage(stage, {
        target: args.target,
        sessionId: args.sessionId,
        previewVersion: args.previewVersion,
        elapsedMs: Date.now() - startedAt,
        byteLength: bytes.byteLength,
        fileCount: download.fileCount,
      })
      const [storageId, filesStorageId] = await Promise.all([
        storeBytes(ctx, bytes, download.contentType),
        storeText(
          ctx,
          JSON.stringify(files),
          'application/json; charset=utf-8',
        ),
      ])

      stage = 'record-ready'
      logBuildStage(stage, {
        target: args.target,
        sessionId: args.sessionId,
        previewVersion: args.previewVersion,
        elapsedMs: Date.now() - startedAt,
        byteLength: bytes.byteLength,
        fileCount: download.fileCount,
      })
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
        logBuildStage(stage, {
          target: args.target,
          sessionId: args.sessionId,
          previewVersion: args.previewVersion,
          elapsedMs: Date.now() - startedAt,
          fileCount: Object.keys(files).length,
        })
        await deployLakebedIfRequested(ctx, prepared, files)
      }

      logBuildStage('ready', {
        target: args.target,
        sessionId: args.sessionId,
        previewVersion: args.previewVersion,
        elapsedMs: Date.now() - startedAt,
        byteLength: bytes.byteLength,
        fileCount: download.fileCount,
      })
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
