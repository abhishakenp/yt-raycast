import { internal } from '../_generated/api'
import type { ActionCtx, MutationCtx } from '../_generated/server'

type ScheduledFunctionReference = Parameters<
  MutationCtx['scheduler']['runAfter']
>[1]
type RunActionReference = Parameters<ActionCtx['runAction']>[0]
type RunQueryReference = Parameters<ActionCtx['runQuery']>[0]
type RunMutationReference = Parameters<ActionCtx['runMutation']>[0]

type InternalSessionReferences = {
  export_artifacts: {
    build: ScheduledFunctionReference
  }
  session_completion: {
    completeGeneration: RunActionReference
  }
  sessions: {
    sendOperationalNotification: ScheduledFunctionReference
    markExportArtifactBuildStalled: ScheduledFunctionReference
    getGenerationSession: RunQueryReference
    completeGenerationInternal: RunMutationReference
  }
}

type SessionInternalReferences = InternalSessionReferences['sessions'] & {
  completeGenerationNode: RunActionReference
  buildExportArtifact: ScheduledFunctionReference
  stallExportArtifactBuild: ScheduledFunctionReference
}

const internalReferences = internal as unknown as InternalSessionReferences

export const sessionInternalReferences = {
  buildExportArtifact: internalReferences.export_artifacts.build,
  stallExportArtifactBuild:
    internalReferences.sessions.markExportArtifactBuildStalled,
  sendOperationalNotification:
    internalReferences.sessions.sendOperationalNotification,
  getGenerationSession: internalReferences.sessions.getGenerationSession,
  completeGenerationInternal:
    internalReferences.sessions.completeGenerationInternal,
  completeGenerationNode:
    internalReferences.session_completion.completeGeneration,
} as unknown as SessionInternalReferences
