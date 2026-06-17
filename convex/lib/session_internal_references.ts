import { internal } from '../_generated/api'
import type { ActionCtx, MutationCtx } from '../_generated/server'

type ScheduledFunctionReference = Parameters<
  MutationCtx['scheduler']['runAfter']
>[1]
type RunActionReference = Parameters<ActionCtx['runAction']>[0]
type RunQueryReference = Parameters<ActionCtx['runQuery']>[0]
type RunMutationReference = Parameters<ActionCtx['runMutation']>[0]

type InternalSessionReferences = {
  session_completion: {
    completeGeneration: RunActionReference
  }
  sessions: {
    sendOperationalNotification: ScheduledFunctionReference
    getGenerationSession: RunQueryReference
    completeGenerationInternal: RunMutationReference
  }
}

type SessionInternalReferences = InternalSessionReferences['sessions'] & {
  completeGenerationNode: RunActionReference
}

const internalReferences = internal as unknown as InternalSessionReferences

export const sessionInternalReferences: SessionInternalReferences = {
  sendOperationalNotification:
    internalReferences.sessions.sendOperationalNotification,
  getGenerationSession: internalReferences.sessions.getGenerationSession,
  completeGenerationInternal:
    internalReferences.sessions.completeGenerationInternal,
  completeGenerationNode:
    internalReferences.session_completion.completeGeneration,
}
