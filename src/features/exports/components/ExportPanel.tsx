import { Download, LoaderCircle, Lock, TriangleAlert } from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'
import { useEffect, useRef, useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import { useIsAdmin, useOptionalAuth } from '@/shared/auth/use-optional-auth'

import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'
import { readJsonOrThrow } from '@/lib/safe-fetch'
import { useProgressTick } from '../hooks/use-progress-tick'
import {
  estimateObservedRemainingMs,
  formatDurationShort,
} from '../services/format-progress-duration'
import { HtmlIcon, ReactIcon, NextIcon, LakebedIcon } from './ExportIcons'

type ExportTarget = {
  target: 'html' | 'react' | 'next' | 'lakebed'
  label: string
  ready: boolean
  status: string
  requiresPayment: boolean
  fileCount: number | null
  artifactReady?: boolean
  artifactStatus?: string
  artifactError?: string
  // Real, event-driven progress pushed by the build action as each actual
  // pipeline stage completes — never a simulated/timed value.
  artifactProgressStage?: string
  artifactProgressPercent?: number
  artifactProgressStartedAt?: number
  artifactProgressUpdatedAt?: number
  artifactProgressSampleCount?: number
  previewVersion?: number | null
  currentPreviewVersion?: number | null
  downloadUrl: string | null
}

type ExportPanelProps = {
  sessionId: string
}

function targetLabel(target: ExportTarget['target']): string {
  return target === 'html'
    ? 'HTML'
    : target === 'react'
      ? 'React'
      : target === 'next'
        ? 'Next.js'
        : 'Lakebed'
}

function targetSummary(target: ExportTarget['target']): string {
  return target === 'html'
    ? 'Static preview (no live data)'
    : target === 'react'
      ? 'React client-only app'
      : target === 'next'
        ? 'Next.js full-stack project'
        : 'Lakebed project bundle'
}

const exportTargetNames: Array<ExportTarget['target']> = [
  'html',
  'react',
  'next',
  'lakebed',
]

const loadingTargets: ExportTarget[] = exportTargetNames.map((target) => ({
  target,
  label: targetLabel(target),
  ready: false,
  status: 'loading',
  requiresPayment: false,
  fileCount: null,
  artifactReady: false,
  artifactStatus: 'loading',
  downloadUrl: null,
}))

function statusLabel(target: ExportTarget): string {
  if (target.requiresPayment) return 'Payment required'
  if (target.status === 'stale') {
    return target.currentPreviewVersion === null ||
      target.currentPreviewVersion === undefined
      ? 'Regenerate for latest preview'
      : `Regenerate for preview v${target.currentPreviewVersion}`
  }
  if (target.ready) return ''
  return target.status.replaceAll('_', ' ')
}

export function artifactProgressPercent(target: ExportTarget) {
  // artifactStatus (exportArtifacts table) is the live source of truth for
  // an in-flight build. target.ready comes from the separate legacy
  // `exports` table, which can still say "ready" from the LAST successful
  // build while a fresh same-previewVersion rebuild is genuinely underway —
  // never let that stale flag force 100% over a real in-progress percent.
  if (
    target.artifactStatus === 'building' ||
    target.artifactStatus === 'queued'
  ) {
    return target.artifactProgressPercent ?? 0
  }
  if (target.artifactReady || target.ready) return 100
  return target.artifactProgressPercent ?? 0
}

function readOwnerSecret(sessionId: string): string | undefined {
  return typeof window === 'undefined'
    ? undefined
    : readAnonymousOwnerSecret(window.localStorage, sessionId)
}

function readDownloadFilename(response: Response, fallback: string): string {
  const disposition = response.headers.get('content-disposition') ?? ''
  const match = disposition.match(/filename="([^"]+)"/i)
  return match?.[1] ?? fallback
}

function isDownloadResult(value: unknown): value is { downloadUrl?: unknown } {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isArtifactInFlight(target: ExportTarget): boolean {
  return (
    !target.artifactReady &&
    (target.artifactStatus === 'queued' || target.artifactStatus === 'building')
  )
}

function exportProgressText(target: ExportTarget, now: number): string {
  const progressPercent = artifactProgressPercent(target)
  const remainingMs = estimateObservedRemainingMs({
    now,
    percent: progressPercent,
    progressSampleCount: target.artifactProgressSampleCount,
    progressStartedAt: target.artifactProgressStartedAt,
    progressUpdatedAt: target.artifactProgressUpdatedAt,
  })
  return `${target.artifactProgressStage ?? 'Working'} · ${progressPercent}%${
    remainingMs !== null ? ` · ~${formatDurationShort(remainingMs)} left` : ''
  }`
}

export function ExportPanel({ sessionId }: ExportPanelProps) {
  const { getToken, isSignedIn } = useOptionalAuth()
  const isAdmin = useIsAdmin()
  const exportTargets = useQuery(api.sessions.getExportTargets, {
    lookup: sessionId,
  })
  const ensureExportArtifact = useMutation(
    api.sessions.ensureExportArtifactByLookup,
  )
  const [error, setError] = useState<string>()
  const [activeTarget, setActiveTarget] = useState<ExportTarget['target']>()
  const [waitingTarget, setWaitingTarget] = useState<ExportTarget['target']>()
  const [downloadingTarget, setDownloadingTarget] =
    useState<ExportTarget['target']>()
  const actionInFlightRef = useRef(false)

  const createAuthHeaders = async () => {
    const headers: Record<string, string> = {}
    const ownerSecret = readOwnerSecret(sessionId)
    if (ownerSecret) headers['x-ship-fast-owner-secret'] = ownerSecret

    if (isSignedIn) {
      const token = await getToken({ template: 'convex' })
      if (token) headers.Authorization = `Bearer ${token}`
    }

    return headers
  }

  const downloadFromUrl = async (
    downloadUrl: string,
    target: ExportTarget['target'],
  ) => {
    setDownloadingTarget(target)
    try {
      const response = await fetch(downloadUrl, {
        headers: await createAuthHeaders(),
      })
      const contentType = response.headers.get('content-type') ?? ''
      const disposition = response.headers.get('content-disposition') ?? ''
      // A real export download always carries `content-disposition: attachment`.
      // The HTML/JSON guards below exist to surface rendered error pages (which
      // never set an attachment disposition) as a stable "Download failed"
      // message instead of dumping the error body into a file. The HTML export
      // target legitimately returns `content-type: text/html`, so we must key
      // the error-page detection on the disposition header, not the content
      // type.
      const isAttachmentDownload = /attachment/i.test(disposition)
      if (!isAttachmentDownload && contentType.includes('json')) {
        const data = await readJsonOrThrow<Record<string, unknown>>(
          response,
          'Download failed',
        )
        throw new Error(
          typeof data.error === 'string'
            ? data.error
            : response.status === 202
              ? 'Export is still building.'
              : 'Download failed',
        )
      }
      if (!isAttachmentDownload && contentType.includes('text/html')) {
        throw new Error('Download failed')
      }
      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = readDownloadFilename(
        response,
        `ship-fast-${sessionId}-${target}.zip`,
      )
      document.body.append(anchor)
      try {
        anchor.click()
      } finally {
        anchor.remove()
        window.URL.revokeObjectURL(url)
      }
    } finally {
      setDownloadingTarget(undefined)
    }
  }

  const createExport = async (target: ExportTarget['target']) => {
    setError(undefined)
    setActiveTarget(target)
    try {
      const response = await fetch(`/api/sessions/${sessionId}/export`, {
        method: 'POST',
        headers: {
          ...(await createAuthHeaders()),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target,
          anonymousOwnerSecret: readOwnerSecret(sessionId),
        }),
      })
      const data = await readJsonOrThrow<Record<string, unknown>>(
        response,
        'Export failed',
      )
      if (!response.ok)
        throw new Error(
          typeof data?.error === 'string' ? data.error : 'Export failed',
        )
      return isDownloadResult(data) ? data : {}
    } catch (exportError) {
      setError(
        exportError instanceof Error ? exportError.message : 'Export failed',
      )
      return {}
    } finally {
      setActiveTarget(undefined)
    }
  }

  const downloadExport = async (targetConfig: ExportTarget) => {
    if (!targetConfig.downloadUrl || (targetConfig.requiresPayment && !isAdmin))
      return

    setError(undefined)
    try {
      await downloadFromUrl(targetConfig.downloadUrl, targetConfig.target)
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : 'Download failed',
      )
    }
  }

  const runTargetAction = async (targetConfig: ExportTarget) => {
    if (actionInFlightRef.current) return
    actionInFlightRef.current = true
    try {
      if (!targetConfig.artifactReady) {
        setWaitingTarget(targetConfig.target)
        setError(undefined)
        try {
          const result = await ensureExportArtifact({
            lookup: sessionId,
            target: targetConfig.target,
            anonymousOwnerSecret: readOwnerSecret(sessionId),
          })
          if (result?.status !== 'ready') return
          setWaitingTarget(undefined)
        } catch (ensureError) {
          setWaitingTarget(undefined)
          setError(
            ensureError instanceof Error
              ? ensureError.message
              : 'Export failed',
          )
          return
        }
      }
      if (targetConfig.requiresPayment && !isAdmin) {
        await createExport(targetConfig.target)
        return
      }
      if (targetConfig.ready && targetConfig.downloadUrl) {
        await downloadExport(targetConfig)
        return
      }
      const result = await createExport(targetConfig.target)
      if (typeof result.downloadUrl === 'string') {
        await downloadFromUrl(result.downloadUrl, targetConfig.target)
      }
    } finally {
      actionInFlightRef.current = false
    }
  }

  const hasResolvedTargets =
    exportTargets?.targets && exportTargets.targets.length > 0
  const visibleTargets = hasResolvedTargets
    ? exportTargets.targets
    : loadingTargets
  const hasActiveBuild = visibleTargets.some((item) => isArtifactInFlight(item))
  const now = useProgressTick(hasActiveBuild)

  useEffect(() => {
    if (waitingTarget === undefined) return
    const item = visibleTargets.find(
      (target) => target.target === waitingTarget,
    )
    if (item === undefined) {
      setWaitingTarget(undefined)
      return
    }
    if (item.artifactReady) {
      setWaitingTarget(undefined)
      void runTargetAction(item)
      return
    }
    if (item.artifactStatus === 'failed' || item.status === 'stale') {
      setWaitingTarget(undefined)
    }
  }, [visibleTargets, waitingTarget])

  return (
    <div className="grid gap-3">
      <div className="grid gap-1 px-1">
        <div className="flex items-center gap-2">
          <Download className="size-4 text-cyan-200" />
          <h2 className="m-0 text-sm font-semibold text-white">
            Project Export
          </h2>
        </div>
        <p className="m-0 text-xs leading-5 text-white/52">
          Ship this exact UI in the stack you need.
        </p>
      </div>

      <div className="grid gap-1.5">
        {visibleTargets.map((item) => {
          const Icon =
            item.target === 'html'
              ? HtmlIcon
              : item.target === 'react'
                ? ReactIcon
                : item.target === 'next'
                  ? NextIcon
                  : LakebedIcon
          const isBusy =
            activeTarget === item.target ||
            waitingTarget === item.target ||
            downloadingTarget === item.target
          const isBuildPending =
            !item.artifactReady &&
            (item.artifactStatus === 'queued' ||
              item.artifactStatus === 'building' ||
              item.artifactStatus === 'loading' ||
              item.artifactStatus === 'not_ready')
          const artifactInFlight = isArtifactInFlight(item)
          const progressPercent = artifactProgressPercent(item)
          const showProgress =
            artifactInFlight ||
            waitingTarget === item.target ||
            (activeTarget === item.target && isBuildPending)
          const progressBackground =
            showProgress && progressPercent > 0
              ? `linear-gradient(110deg, rgba(34, 211, 238, 0.16) 0%, rgba(34, 211, 238, 0.08) ${progressPercent}%, transparent ${progressPercent}%, transparent 100%)`
              : undefined
          const statusText = showProgress
            ? exportProgressText(item, now)
            : activeTarget === item.target ||
                downloadingTarget === item.target ||
                waitingTarget === item.target
              ? 'Working...'
              : item.artifactStatus === 'failed'
                ? (item.artifactError ?? 'Export failed')
                : isBuildPending
                  ? ''
                  : statusLabel(item)

          return (
            <button
              className="group/export grid min-h-16 w-full grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-white/8 bg-white/[0.04] p-2.5 text-left transition-colors hover:border-white/14 hover:bg-white/[0.075] disabled:cursor-wait disabled:opacity-60"
              data-export-target={item.target}
              disabled={
                !hasResolvedTargets ||
                activeTarget !== undefined ||
                downloadingTarget !== undefined ||
                waitingTarget !== undefined
              }
              key={item.target}
              onClick={() => void runTargetAction(item)}
              style={{ backgroundImage: progressBackground }}
              type="button"
            >
              <span
                className="export-target-glyph grid size-[42px] shrink-0 place-items-center rounded-[10px] transition-colors group-hover/export:text-white"
                aria-hidden="true"
              >
                <Icon className="size-8" />
              </span>
              <span className="grid min-w-0 gap-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-white">
                    {item.label}
                  </span>
                  {item.target === 'html' && (
                    <span className="shrink-0 rounded bg-white/10 px-1 py-px text-[9px] font-semibold uppercase tracking-wider text-white/52">
                      Static
                    </span>
                  )}
                </span>
                <span className="truncate text-xs text-white/46">
                  {targetSummary(item.target)}
                </span>
                <span className="truncate font-mono text-[10px] uppercase tracking-[0.08em] text-white/36">
                  {statusText}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="export-target-action grid size-9 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-white/48 transition-colors group-hover/export:border-cyan-200/30 group-hover/export:bg-cyan-200/10 group-hover/export:text-cyan-100"
                data-export-action={item.target}
              >
                {isBusy || artifactInFlight ? (
                  <LoaderCircle
                    className="size-4 animate-spin"
                    strokeWidth={1.8}
                  />
                ) : item.requiresPayment && !isAdmin ? (
                  <Lock className="size-4 text-amber-300" strokeWidth={1.8} />
                ) : item.status === 'stale' ? (
                  <TriangleAlert
                    className="size-4 text-amber-200"
                    strokeWidth={1.8}
                  />
                ) : (
                  <Download className="size-4" strokeWidth={1.8} />
                )}
              </span>
            </button>
          )
        })}
      </div>

      {error && (
        <p
          className="m-0 rounded-xl border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-200"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
