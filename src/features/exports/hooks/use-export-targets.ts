import { useCallback, useEffect, useState } from 'react'

export type ExportTargetKind = 'html' | 'react' | 'next' | 'lakebed'

export type ExportTargetSummary = {
  target: ExportTargetKind
  label: string
  ready: boolean
  status: string
  requiresPayment: boolean
  fileCount: number | null
  artifactReady?: boolean
  artifactStatus?: string
  artifactError?: string
  previewVersion?: number | null
  currentPreviewVersion?: number | null
  downloadUrl?: string | null
  githubUrl?: string | null
  githubRepoUrl?: string | null
  deployedUrl?: string | null
}

export type ExportTargetsResponse = {
  sessionId?: string
  previewReady?: boolean
  isPrivate?: boolean | null
  targets: ExportTargetSummary[]
}

const isJsonObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const isExportTargetKind = (value: unknown): value is ExportTargetKind =>
  value === 'html' || value === 'react' || value === 'next' || value === 'lakebed'

const isExportTargetSummary = (
  value: unknown,
): value is ExportTargetSummary =>
  isJsonObject(value) &&
  isExportTargetKind(value.target) &&
  typeof value.label === 'string' &&
  typeof value.ready === 'boolean' &&
  typeof value.status === 'string' &&
  typeof value.requiresPayment === 'boolean'

const normalizeExportTargetsResponse = (
  value: unknown,
): ExportTargetsResponse => {
  if (!isJsonObject(value) || !Array.isArray(value.targets)) {
    return { targets: [] }
  }

  return {
    sessionId: typeof value.sessionId === 'string' ? value.sessionId : undefined,
    previewReady:
      typeof value.previewReady === 'boolean' ? value.previewReady : undefined,
    isPrivate:
      typeof value.isPrivate === 'boolean' || value.isPrivate === null
        ? value.isPrivate
        : undefined,
    targets: value.targets.filter(isExportTargetSummary),
  }
}

export const fetchExportTargets = async (
  sessionId: string,
): Promise<ExportTargetsResponse> => {
  const response = await fetch(
    `/api/sessions/${encodeURIComponent(sessionId)}/export-targets`,
  )
  const data: unknown = await response.json()
  if (!response.ok) {
    const message =
      isJsonObject(data) && typeof data.error === 'string'
        ? data.error
        : 'Unable to load exports'
    throw new Error(message)
  }
  return normalizeExportTargetsResponse(data)
}

export const useExportTargets = (
  sessionId: string,
  refreshIntervalMs = 2500,
) => {
  const [data, setData] = useState<ExportTargetsResponse>()
  const [error, setError] = useState<string>()
  const [isLoading, setIsLoading] = useState(true)

  const refetch = useCallback(async () => {
    setError(undefined)
    const nextData = await fetchExportTargets(sessionId)
    setData(nextData)
  }, [sessionId])

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setIsLoading(true)
      try {
        const nextData = await fetchExportTargets(sessionId)
        if (isMounted) {
          setData(nextData)
          setError(undefined)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load exports',
          )
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void load()
    const interval =
      refreshIntervalMs > 0
        ? window.setInterval(() => {
            void load()
          }, refreshIntervalMs)
        : undefined

    return () => {
      isMounted = false
      if (interval !== undefined) window.clearInterval(interval)
    }
  }, [refreshIntervalMs, sessionId])

  return { data, error, isLoading, refetch }
}
