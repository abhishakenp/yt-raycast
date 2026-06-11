import {
  Download,
  Lock,
  PackageCheck,
  RefreshCw,
  TriangleAlert,
} from 'lucide-react'
import { useAuth } from '@clerk/tanstack-react-start'
import { useEffect, useState } from 'react'

import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

type ExportTarget = {
  target: 'html' | 'react' | 'next'
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
  target === 'html' ? 'HTML' : target === 'react' ? 'React' : 'Next.js'

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
  const { getToken, isSignedIn } = useAuth()
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
      const token = await getToken()
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
    } catch (exportError) {
      setError(
        exportError instanceof Error ? exportError.message : 'Export failed',
      )
    } finally {
      setIsLoading(false)
      setActiveTarget(undefined)
    }
  }

  const downloadExport = async (item: ExportTarget) => {
    if (!item.downloadUrl || item.requiresPayment) return

    setError(undefined)
    setDownloadingTarget(item.target)

    try {
      const response = await fetch(item.downloadUrl, {
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
        `ship-fast-${sessionId}-${item.target}.zip`,
      )
      document.body.append(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : 'Download failed',
      )
    } finally {
      setDownloadingTarget(undefined)
    }
  }

  const visibleTargets =
    targets.length > 0
      ? targets
      : (['html', 'react', 'next'] as const).map((target) => ({
          target,
          label: targetLabel(target),
          ready: false,
          status: 'loading',
          requiresPayment: false,
          fileCount: null,
          downloadUrl: null,
        }))

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Download className="size-4 text-cyan-200" />
          <div>
            <h2 className="m-0 text-sm font-semibold uppercase tracking-[0.1em] text-white">
              Export
            </h2>
            <p className="m-0 mt-1 text-xs leading-5 text-white/48">
              Generate downloadable ZIP bundles from this preview.
            </p>
          </div>
        </div>
        <button
          className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/62 hover:bg-white/[0.08] hover:text-white"
          onClick={() => void loadTargets()}
          type="button"
          aria-label="Refresh export targets"
        >
          <RefreshCw className="size-4" />
        </button>
      </div>

      <div className="grid gap-3">
        {visibleTargets.map((item) => (
          <section
            className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3"
            key={item.target}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="m-0 text-sm font-semibold text-white">
                  {item.label}
                </h3>
                <p className="m-0 mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-white/42">
                  {statusLabel(item)}
                </p>
              </div>
              {item.requiresPayment ? (
                <Lock className="size-5 text-amber-300" />
              ) : item.status === 'stale' ? (
                <TriangleAlert className="size-5 text-amber-200" />
              ) : (
                <PackageCheck
                  className={
                    item.ready
                      ? 'size-5 text-emerald-300'
                      : 'size-5 text-white/28'
                  }
                />
              )}
            </div>
            {item.requiresPayment && (
              <p className="m-0 rounded-xl border border-amber-300/18 bg-amber-300/10 px-3 py-2 text-xs leading-5 text-amber-100/82">
                Subscribe to Pro or use a download credit to unlock a badge-free
                ZIP.
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                className="min-h-9 rounded-full bg-cyan-300 px-3 py-2 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45"
                disabled={isLoading}
                onClick={() => void createExport(item.target)}
                type="button"
              >
                {isLoading && activeTarget === item.target
                  ? 'Generating...'
                  : item.requiresPayment
                    ? 'Check access'
                    : item.ready
                      ? 'Regenerate'
                      : 'Generate'}
              </button>
              <button
                className="grid min-h-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white/70 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={
                  !item.downloadUrl ||
                  item.requiresPayment ||
                  downloadingTarget === item.target
                }
                onClick={() => void downloadExport(item)}
                type="button"
              >
                {downloadingTarget === item.target
                  ? 'Downloading...'
                  : 'Download'}
              </button>
            </div>
          </section>
        ))}
      </div>

      {error && (
        <p className="m-0 rounded-xl border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-200">
          {error}
        </p>
      )}
    </div>
  )
}
