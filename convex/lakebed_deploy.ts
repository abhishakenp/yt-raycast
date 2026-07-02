'use node'

import { api, internal } from './_generated/api'
import { action } from './_generated/server'
import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'
import type { LakebedDeployResult } from '../src/features/deployments/server/lakebed-deploy-service'
import { publishPreviewArgs } from './lib/session_validators'

type PreparedLakebedDeployment = {
  sessionId: Id<'sessions'>
  prompt?: string
  source: string
  sourceKind?: 'html' | 'openui'
  siteSpecJson?: string
  previewHtml?: string
  previewVersion: number
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
}

type LakebedProjectFiles = {
  files: Record<string, string>
  fileCount: number
  projectName: string
}

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
  sessionId: prepared.sessionId,
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

const isPrebuiltLakebedArtifact = (
  value: unknown,
): value is {
  sessionId: Id<'sessions'>
  prompt: string
  previewVersion: number
  status: string
  filesUrl?: string | null
} =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  'sessionId' in value &&
  'prompt' in value &&
  'previewVersion' in value &&
  'status' in value &&
  typeof value.sessionId === 'string' &&
  typeof value.prompt === 'string' &&
  typeof value.previewVersion === 'number' &&
  typeof value.status === 'string' &&
  (!('filesUrl' in value) ||
    typeof value.filesUrl === 'string' ||
    value.filesUrl === null)

const readProjectFiles = async (
  url: string,
): Promise<Record<string, string> | null> => {
  const response = await fetch(url)
  if (!response.ok) return null
  const parsed = (await response.json()) as unknown
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null
  }
  const files: Record<string, string> = {}
  for (const [path, contents] of Object.entries(parsed)) {
    if (typeof contents !== 'string') return null
    files[path] = contents
  }
  return files
}

export const deploy = action({
  args: publishPreviewArgs,
  handler: async (ctx, args): Promise<unknown> => {
    const startedAt = Date.now()
    let prepared: PreparedLakebedDeployment | null = null
    try {
      logLakebedDeploy(args.sessionId, 'action:start', {
        requestedSlug: args.requestedSlug,
      })
      const artifactResult = await ctx.runQuery(
        api.sessions.getOwnedLakebedDeploymentArtifact,
        args,
      )
      const artifact = isPrebuiltLakebedArtifact(artifactResult)
        ? artifactResult
        : null
      if (artifact?.status === 'ready' && artifact.filesUrl) {
        const files = await readProjectFiles(artifact.filesUrl)
        if (files !== null) {
          prepared = {
            sessionId: artifact.sessionId,
            source: '',
            previewVersion: artifact.previewVersion,
            sourceKind: 'openui',
          }
          logLakebedDeploy(artifact.sessionId, 'prebuilt:loaded', {
            fileCount: Object.keys(files).length,
          })
          const { deployLakebedProjectFiles } =
            await import('../src/features/deployments/server/lakebed-deploy-service')
          const existingDeployment = (await ctx.runQuery(
            internal.sessions.getLakebedDeploymentUpdateTarget,
            { sessionId: artifact.sessionId },
          )) as { claimUrl: string; deployId: string; url: string } | null
          const deployed = await deployLakebedProjectFiles({
            existingDeployment: existingDeployment ?? undefined,
            files,
            log: (message, details) =>
              logLakebedDeploy(
                artifact.sessionId,
                `lakebed-api:${message}`,
                details,
              ),
          })
          const result: unknown = await ctx.runMutation(
            internal.sessions.recordLakebedDeploymentSuccess,
            successArgs(prepared, args.requestedSlug, deployed),
          )
          logLakebedDeploy(artifact.sessionId, 'prebuilt:deployed', {
            totalElapsedMs: Date.now() - startedAt,
          })
          return result
        }
      }

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
      let project: LakebedProjectFiles
      if (sourceKind === 'html') {
        throw new Error(
          'Lakebed deploys require generated fullstack source. Regenerate this site before publishing to Lakebed.',
        )
      } else {
        const { buildOpenUILakebedProjectFiles } =
          await import('../src/features/exports/services/openui-lakebed-export-builder')
        project = await buildOpenUILakebedProjectFiles({
          source: prepared.source,
          siteSpecJson: prepared.siteSpecJson,
          previewHtml: prepared.previewHtml,
          sessionId: prepared.sessionId,
          prompt: prepared.prompt,
          target: 'lakebed',
          themeName: prepared.themeName,
          isDark: prepared.isDark,
          locale: prepared.locale,
          selectedBrandLogo: prepared.selectedBrandLogo,
        })
      }
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
      logLakebedDeploy(prepared.sessionId, 'lakebed-api:module-import:start')
      const { deployLakebedProjectFiles } =
        await import('../src/features/deployments/server/lakebed-deploy-service')
      logLakebedDeploy(
        prepared.sessionId,
        'lakebed-api:module-import:complete',
        {
          elapsedMs: Date.now() - deployStartedAt,
        },
      )
      logLakebedDeploy(prepared.sessionId, 'lakebed-api:start', {
        fileCount: project.fileCount,
      })
      const existingDeployment = (await ctx.runQuery(
        internal.sessions.getLakebedDeploymentUpdateTarget,
        { sessionId: prepared.sessionId },
      )) as { claimUrl: string; deployId: string; url: string } | null
      const deployed = await deployLakebedProjectFiles({
        existingDeployment: existingDeployment ?? undefined,
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
      const result: unknown = await ctx.runMutation(
        internal.sessions.recordLakebedDeploymentSuccess,
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
      await ctx.runMutation(internal.sessions.recordLakebedDeploymentFailure, {
        sessionId: args.sessionId,
        requestedSlug: args.requestedSlug,
        errorMessage: errorMessage(error),
      })
      throw error
    }
  },
})

export const deployByLookup = action({
  args: {
    lookup: v.string(),
    anonymousOwnerSecret: v.optional(v.string()),
    requestedSlug: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<unknown> => {
    const artifactResult = await ctx.runQuery(
      api.sessions.getOwnedLakebedDeploymentArtifactByLookup,
      args,
    )
    const artifact = isPrebuiltLakebedArtifact(artifactResult)
      ? artifactResult
      : null
    if (artifact === null) {
      throw new Error('Session not found')
    }
    return await ctx.runAction(api.lakebed_deploy.deploy, {
      sessionId: artifact.sessionId,
      anonymousOwnerSecret: args.anonymousOwnerSecret,
      requestedSlug: args.requestedSlug,
    })
  },
})
