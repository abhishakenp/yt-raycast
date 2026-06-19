import {
  Code2,
  Download,
  FileArchive,
  LoaderCircle,
  Lock,
  PackageCheck,
  PanelsTopLeft,
  Server,
  TriangleAlert,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { useOptionalAuth } from '@/shared/auth/use-optional-auth'

import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

type ExportTarget = {
  target: 'html' | 'react' | 'next' | 'lakebed'
  label: string
  ready: boolean
  status: string
  requiresPayment: boolean
  fileCount: number | null
  previewVersion?: number | null
  currentPreviewVersion?: number | null
  downloadUrl: string | null
}

type ExportPanelProps = {
  sessionId: string
}

const targetLabel = (target: ExportTarget['target']): string =>
  target === 'html'
    ? 'HTML'
    : target === 'react'
      ? 'React'
      : target === 'next'
        ? 'Next.js'
        : 'Lakebed'

const targetSummary = (target: ExportTarget['target']): string =>
  target === 'html'
    ? 'Static site bundle'
    : target === 'react'
      ? 'React client-only app'
      : target === 'next'
        ? 'Next.js full-stack project'
        : 'Lakebed project bundle'

const statusLabel = (target: ExportTarget): string => {
  if (target.requiresPayment) return 'Payment required'
  if (target.status === 'stale') {
    return target.currentPreviewVersion === null ||
      target.currentPreviewVersion === undefined
      ? 'Regenerate for latest preview'
      : `Regenerate for preview v${target.currentPreviewVersion}`
  }
  if (target.ready) return `${target.fileCount ?? 0} files ready`
  return target.status.replaceAll('_', ' ')
}

const readOwnerSecret = (sessionId: string): string | undefined =>
  typeof window === 'undefined'
    ? undefined
    : readAnonymousOwnerSecret(window.localStorage, sessionId)

const readDownloadFilename = (response: Response, fallback: string): string => {
  const disposition = response.headers.get('content-disposition') ?? ''
  const match = disposition.match(/filename="([^"]+)"/i)
  return match?.[1] ?? fallback
}

export const ExportPanel = ({ sessionId }: ExportPanelProps) => {
  const { getToken, isSignedIn } = useOptionalAuth()
  const [targets, setTargets] = useState<ExportTarget[]>([])
  const [error, setError] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTarget, setActiveTarget] = useState<ExportTarget['target']>()
  const [downloadingTarget, setDownloadingTarget] =
    useState<ExportTarget['target']>()

  const createAuthHeaders = async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {}
    const ownerSecret = readOwnerSecret(sessionId)
    if (ownerSecret) headers['x-ship-fast-owner-secret'] = ownerSecret

    if (isSignedIn) {
      const token = await getToken({ template: 'convex' })
      if (token) headers.Authorization = `Bearer ${token}`
    }

    return headers
  }

  const loadTargets = async () => {
    setError(undefined)
    const response = await fetch(`/api/sessions/${sessionId}/export-targets`)
    const data = await response.json()
    if (!response.ok) throw new Error(data?.error ?? 'Unable to load exports')
    setTargets(data.targets ?? [])
  }

  useEffect(() => {
    void loadTargets().catch((loadError) => {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load exports',
      )
    })
  }, [sessionId])

  const downloadFromUrl = async (
    downloadUrl: string,
    target: ExportTarget['target'],
  ) => {
    setDownloadingTarget(target)
    try {
      const response = await fetch(downloadUrl, {
        headers: await createAuthHeaders(),
      })
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
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
    } finally {
      setDownloadingTarget(undefined)
    }
  }

  const createExport = async (target: ExportTarget['target']) => {
    setError(undefined)
    setIsLoading(true)
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
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error ?? 'Export failed')
      await loadTargets()
      return data as { downloadUrl?: unknown }
    } catch (exportError) {
      setError(
        exportError instanceof Error ? exportError.message : 'Export failed',
      )
      return {}
    } finally {
      setIsLoading(false)
      setActiveTarget(undefined)
    }
  }

  const downloadExport = async (item: ExportTarget) => {
    if (!item.downloadUrl || item.requiresPayment) return

    setError(undefined)
    try {
      await downloadFromUrl(item.downloadUrl, item.target)
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : 'Download failed',
      )
    }
  }

  const runTargetAction = async (item: ExportTarget) => {
    if (item.requiresPayment) {
      await createExport(item.target)
      return
    }
    if (item.ready && item.downloadUrl) {
      await downloadExport(item)
      return
    }
    const result = await createExport(item.target)
    if (typeof result.downloadUrl === 'string') {
      await downloadFromUrl(result.downloadUrl, item.target)
    }
  }

  const visibleTargets =
    targets.length > 0
      ? targets
      : (['html', 'react', 'next', 'lakebed'] as const).map((target) => ({
          target,
          label: targetLabel(target),
          ready: false,
          status: 'loading',
          requiresPayment: false,
          fileCount: null,
          downloadUrl: null,
        }))

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
              ? FileArchive
              : item.target === 'react'
                ? Code2
                : item.target === 'next'
                  ? PanelsTopLeft
                  : Server
          const isBusy =
            (isLoading && activeTarget === item.target) ||
            downloadingTarget === item.target
          const actionLabel = item.requiresPayment
            ? 'Check Access'
            : item.ready
              ? 'Ready To Download'
              : 'Build Export'
          const statusText = isBusy
            ? 'Building Downloads...'
            : statusLabel(item)

          return (
            <button
              className="group/export grid min-h-16 w-full grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-white/8 bg-white/[0.04] p-2.5 text-left transition-colors hover:border-white/14 hover:bg-white/[0.075] disabled:cursor-wait disabled:opacity-60"
              data-export-target={item.target}
              disabled={isLoading || downloadingTarget !== undefined}
              key={item.target}
              onClick={() => void runTargetAction(item)}
              type="button"
            >
              <span
                className="export-target-glyph grid size-[42px] shrink-0 place-items-center rounded-[10px] border border-white/10 bg-black/24 text-white/70 transition-colors group-hover/export:border-white/16 group-hover/export:bg-white/[0.06] group-hover/export:text-white"
                aria-hidden="true"
              >
                {isBusy ? (
                  <LoaderCircle
                    className="size-4 animate-spin"
                    strokeWidth={1.8}
                  />
                ) : (
                  <Icon className="size-4" strokeWidth={1.8} />
                )}
              </span>
              <span className="grid min-w-0 gap-0.5">
                <span className="truncate text-sm font-semibold text-white">
                  {item.label}
                </span>
                <span className="truncate text-xs text-white/46">
                  {targetSummary(item.target)}
                </span>
                <span className="truncate font-mono text-[10px] uppercase tracking-[0.08em] text-white/36">
                  {statusText}
                </span>
              </span>
              <span className="export-target-state flex items-center gap-2">
                {item.requiresPayment ? (
                  <Lock className="size-4 text-amber-300" />
                ) : item.status === 'stale' ? (
                  <TriangleAlert className="size-4 text-amber-200" />
                ) : (
                  <PackageCheck
                    className={
                      item.ready
                        ? 'size-4 text-emerald-300'
                        : 'size-4 text-white/28'
                    }
                  />
                )}
                <span className="hidden rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white/46 sm:inline">
                  {actionLabel}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {error && (
        <p className="m-0 rounded-xl border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-200">
          {error}
        </p>
      )}
    </div>
  )
}
