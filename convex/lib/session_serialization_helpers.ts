import type { Doc } from '../_generated/dataModel'

export type EngineTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'FAILED'

export type SessionTaskStatus = 'pending' | 'running' | 'succeeded' | 'failed'

/**
 * A session may be left in a stale `streaming` state in the DB even though the
 * generation engine already recorded a terminal error (errorCode/errorMessage).
 * Without normalization the UI would spin forever waiting for a preview that
 * will never arrive, so we collapse any stale streaming status carrying an
 * errorCode into a `failed` status so the dashboard can render the error.
 */
export function normalizeSessionStatus(
  session: Doc<'sessions'>,
): Doc<'sessions'>['status'] {
  const fallbackStatus =
    session.status ??
    (session.genuiStatus === 'done' ? 'preview_ready' : 'queued')
  if (fallbackStatus === 'streaming' && session.errorCode !== undefined) {
    return 'failed'
  }
  return fallbackStatus
}

export function serializeSession(session: Doc<'sessions'>) {
  return {
    sessionId: session._id,
    userId: session.userId,
    canClaimAnonymous:
      session.userId === undefined && session.anonOwnerSecretHash !== undefined,
    prompt: session.prompt,
    workspace: session.workspace,
    status: normalizeSessionStatus(session),
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
    themeMode:
      session.themeMode === 'light' || session.themeMode === 'dark'
        ? session.themeMode
        : null,
    selectedBrandLogo: session.selectedBrandLogo ?? null,
  }
}

export function toTaskStatus(status: EngineTaskStatus): SessionTaskStatus {
  return {
    PENDING: 'pending',
    IN_PROGRESS: 'running',
    DONE: 'succeeded',
    FAILED: 'failed',
  }[status] as SessionTaskStatus
}

export function toTaskKey(engineTaskId: string): string {
  return engineTaskId === 'home.openui' ? 'homepage' : engineTaskId
}
