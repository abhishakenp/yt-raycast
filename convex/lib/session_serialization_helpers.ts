import type { Doc } from '../_generated/dataModel'

export type EngineTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'FAILED'

export type SessionTaskStatus = 'pending' | 'running' | 'succeeded' | 'failed'

export const serializeSession = (session: Doc<'sessions'>) => ({
  sessionId: session._id,
  userId: session.userId,
  canClaimAnonymous:
    session.userId === undefined && session.anonOwnerSecretHash !== undefined,
  prompt: session.prompt,
  workspace: session.workspace,
  status:
    session.status ??
    (session.genuiStatus === 'done' ? 'preview_ready' : 'queued'),
  preferredLanguage: session.preferredLanguage,
  preferredExportTarget: session.preferredExportTarget,
  isPrivate: session.isPrivate,
  previewVersion: session.previewVersion ?? 0,
  elapsed: session.elapsed ?? null,
  createdAt: session.createdAt,
  updatedAt: session.updatedAt ?? session.createdAt,
  errorCode: session.errorCode,
  errorMessage: session.errorMessage,
  deploymentSlug: session.deploymentSlug,
  designReferenceUrls: session.designReferenceUrls ?? [],
  designReferenceNotes: session.designReferenceNotes ?? '',
  cloneUrl: session.cloneUrl,
  designReferenceFingerprint: session.designReferenceFingerprint,
  engineVersion: session.engineVersion,
  themeOverride: (session.themeOverride as string | undefined) ?? null,
})

export const toTaskStatus = (status: EngineTaskStatus): SessionTaskStatus =>
  ({
    PENDING: 'pending',
    IN_PROGRESS: 'running',
    DONE: 'succeeded',
    FAILED: 'failed',
  })[status] as SessionTaskStatus

export const toTaskKey = (engineTaskId: string): string =>
  engineTaskId === 'home.openui' ? 'homepage' : engineTaskId
