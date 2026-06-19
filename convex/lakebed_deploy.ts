'use node'

import { api, internal } from './_generated/api'
import { action } from './_generated/server'
import type { ActionCtx } from './_generated/server'
import type { LakebedDeployResult } from '../src/features/deployments/server/lakebed-deploy-service'
import { publishPreviewArgs } from './lib/session_validators'

type PreparedLakebedDeployment = {
  sessionId: string
  source: string
  sourceKind?: 'html' | 'openui'
  siteSpecJson?: string
  previewHtml?: string
  previewVersion: number
  themeName?: string
  isDark?: boolean
}

type InternalLakebedDeploymentReferences = {
  sessions: {
    recordLakebedDeploymentSuccess: Parameters<ActionCtx['runMutation']>[0]
    recordLakebedDeploymentFailure: Parameters<ActionCtx['runMutation']>[0]
  }
}

const internalReferences =
  internal as unknown as InternalLakebedDeploymentReferences

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

const logLakebedDeploy = (
  sessionId: string,
  message: string,
  details: Record<string, unknown> = {},
) => {
  console.log(
    `[lakebed_deploy:deploy] ${message}`,
    JSON.stringify({
      sessionId,
      ...details,
    }),
  )
}

const successArgs = (
  prepared: PreparedLakebedDeployment,
  requestedSlug: string | undefined,
  deployed: LakebedDeployResult,
) => ({
  sessionId: prepared.sessionId as any,
  requestedSlug,
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

export const deploy = action({
  args: publishPreviewArgs,
  handler: async (ctx, args) => {
    const startedAt = Date.now()
    let prepared: PreparedLakebedDeployment | null = null
    try {
      logLakebedDeploy(args.sessionId, 'action:start', {
        requestedSlug: args.requestedSlug,
      })
      logLakebedDeploy(args.sessionId, 'prepare:start')
      prepared = (await ctx.runQuery(
        api.sessions.prepareLakebedDeploymentForPublish,
        args,
      )) as PreparedLakebedDeployment
      const preparedPayloadBytes = JSON.stringify(prepared).length
      logLakebedDeploy(args.sessionId, 'prepare:stored', {
        batchId: 'in-memory',
        chunkCount: 1,
        payloadBytes: preparedPayloadBytes,
        elapsedMs: Date.now() - startedAt,
      })
      logLakebedDeploy(prepared.sessionId, 'prepare:complete', {
        previewVersion: prepared.previewVersion,
        sourceBytes: prepared.source.length,
        sourceKind: prepared.sourceKind ?? 'openui',
        previewHtmlBytes: prepared.previewHtml?.length ?? 0,
        themeName: prepared.themeName,
        isDark: prepared.isDark,
        elapsedMs: Date.now() - startedAt,
      })

      const buildStartedAt = Date.now()
      const sourceKind = prepared.sourceKind ?? 'openui'
      logLakebedDeploy(prepared.sessionId, 'project-build:start', {
        sourceKind,
      })
      const [{ deployLakebedProjectFiles }, staticBuilder, openUIBuilder] =
        await Promise.all([
          import('../src/features/deployments/server/lakebed-deploy-service'),
          import('../src/features/deployments/server/lakebed-static-project-builder'),
          import('../src/features/exports/services/openui-lakebed-export-builder'),
        ])
      const project =
        sourceKind === 'html'
          ? await staticBuilder.buildStaticLakebedProjectFiles({
              source: prepared.source,
              siteSpecJson: prepared.siteSpecJson,
              previewHtml: prepared.previewHtml,
            })
          : await openUIBuilder.buildOpenUILakebedProjectFiles({
              source: prepared.source,
              siteSpecJson: prepared.siteSpecJson,
              previewHtml: prepared.previewHtml,
              sessionId: prepared.sessionId,
              target: 'lakebed',
              themeName: prepared.themeName,
              isDark: prepared.isDark,
            })
      logLakebedDeploy(prepared.sessionId, 'project-build:complete', {
        fileCount: project.fileCount,
        projectName: project.projectName,
        totalBytes: Object.values(project.files).reduce(
          (sum, contents) => sum + (contents as string).length,
          0,
        ),
        elapsedMs: Date.now() - buildStartedAt,
      })

      const deployStartedAt = Date.now()
      logLakebedDeploy(prepared.sessionId, 'lakebed-api:start', {
        fileCount: project.fileCount,
      })
      const deployed = await deployLakebedProjectFiles({
        files: project.files,
        log: (message, details) =>
          logLakebedDeploy(
            prepared!.sessionId,
            `lakebed-api:${message}`,
            details,
          ),
      })
      logLakebedDeploy(prepared.sessionId, 'lakebed-api:complete', {
        clientBundleBytes: deployed.clientBundleBytes,
        deployId: deployed.deployId,
        requestBodyBytes: deployed.requestBodyBytes,
        serverBundleBytes: deployed.serverBundleBytes,
        sourceFileCount: deployed.sourceFileCount,
        url: deployed.url,
        elapsedMs: Date.now() - deployStartedAt,
      })

      const recordStartedAt = Date.now()
      logLakebedDeploy(prepared.sessionId, 'record:start')
      const result = await ctx.runMutation(
        internalReferences.sessions.recordLakebedDeploymentSuccess,
        successArgs(prepared, args.requestedSlug, deployed),
      )
      logLakebedDeploy(prepared.sessionId, 'record:complete', {
        elapsedMs: Date.now() - recordStartedAt,
        totalElapsedMs: Date.now() - startedAt,
      })

      return result
    } catch (error) {
      logLakebedDeploy(prepared?.sessionId ?? args.sessionId, 'failed', {
        error: errorMessage(error),
        stack: error instanceof Error ? error.stack : undefined,
        elapsedMs: Date.now() - startedAt,
      })
      await ctx.runMutation(
        internalReferences.sessions.recordLakebedDeploymentFailure,
        {
          sessionId: args.sessionId,
          requestedSlug: args.requestedSlug,
          errorMessage: errorMessage(error),
        },
      )
      throw error
    }
  },
})
