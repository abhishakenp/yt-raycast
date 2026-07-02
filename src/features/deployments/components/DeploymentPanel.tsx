import { useMutation, useQuery } from 'convex/react'
import {
  ExternalLink,
  Globe2,
  LoaderCircle,
  Rocket,
  TriangleAlert,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'
import { readJsonOrThrow } from '@/lib/safe-fetch'

type DeploymentPanelProps = {
  sessionId: string
}

type DeploymentTarget = 'shipfast' | 'lakebed'

type PublishResult = {
  error?: string
  status?: string
  url?: string
}

type DeploymentExportTarget = {
  target: 'html' | 'react' | 'next' | 'lakebed'
  artifactReady?: boolean
  artifactStatus?: string
  artifactError?: string
  deployedUrl?: string | null
}

type DeploymentPanelError = {
  message: string
  target: DeploymentTarget
}

const publishLakebedViaApi = async (
  sessionId: string,
  anonymousOwnerSecret?: string,
): Promise<PublishResult> => {
  const response = await fetch(
    `/api/sessions/${encodeURIComponent(sessionId)}/deploy/lakebed`,
    {
      body: JSON.stringify({ anonymousOwnerSecret }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    },
  )
  const result = await readJsonOrThrow<PublishResult>(
    response,
    'Lakebed publish failed',
  )
  if (!isPublishResponse(result)) {
    throw new Error('Lakebed publish failed')
  }
  if (!response.ok) throw new Error(result.error ?? 'Lakebed publish failed')
  return result
}

const targetDetails: Record<
  DeploymentTarget,
  { label: string; description: string }
> = {
  shipfast: {
    label: 'Publish ShipFast',
    description: 'Use the existing ShipFast subdomain deployment.',
  },
  lakebed: {
    label: 'Publish Lakebed',
    description: 'Build and publish a native Lakebed app.',
  },
}

const isPublishResponse = (value: unknown): value is PublishResult =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  (!('error' in value) || typeof value.error === 'string') &&
  (!('status' in value) || typeof value.status === 'string') &&
  (!('url' in value) || typeof value.url === 'string')

const artifactProgressPercent = (target: DeploymentExportTarget | undefined) =>
  target?.artifactReady
    ? 100
    : target?.artifactStatus === 'building'
      ? 72
      : target?.artifactStatus === 'queued'
        ? 26
        : target?.artifactStatus === 'loading'
          ? 12
          : 0

export const DeploymentPanel = ({ sessionId }: DeploymentPanelProps) => {
  const publishPreview = useMutation(api.sessions.publishPreviewByLookup)
  const ensureExportArtifact = useMutation(
    api.sessions.ensureExportArtifactByLookup,
  )
  const exportTargets = useQuery(api.sessions.getExportTargets, {
    lookup: sessionId,
  })
  const deploymentStatus = useQuery(api.sessions.getDeploymentStatusByLookup, {
    lookup: sessionId,
  })
  const [activeTarget, setActiveTarget] = useState<DeploymentTarget>()
  const [waitingTarget, setWaitingTarget] = useState<DeploymentTarget>()
  const [pendingPublicTarget, setPendingPublicTarget] =
    useState<DeploymentTarget>()
  const [error, setError] = useState<DeploymentPanelError>()

  const visibleExportTargets = exportTargets?.targets ?? []
  const lakebedTarget = visibleExportTargets.find(
    (target) => target.target === 'lakebed',
  )
  const shipfastRefreshing =
    deploymentStatus?.status === 'updating' &&
    deploymentStatus.provider === 'ship-fast'
  const lakebedRefreshing =
    deploymentStatus?.status === 'updating' &&
    deploymentStatus.provider === 'lakebed'
  const isPrivate = exportTargets?.isPrivate === true
  const lakebedDeploymentUrl =
    lakebedTarget?.deployedUrl ??
    (deploymentStatus?.provider === 'lakebed' &&
    typeof deploymentStatus.url === 'string'
      ? deploymentStatus.url
      : undefined)
  const lakebedPreparing =
    lakebedTarget?.artifactReady !== true &&
    deploymentStatus?.provider !== 'lakebed'
  const lakebedArtifactError =
    lakebedDeploymentUrl === undefined &&
    lakebedTarget?.artifactStatus === 'failed'
      ? (lakebedTarget.artifactError ?? 'Lakebed export failed.')
      : undefined
  const lakebedProgressPercent = artifactProgressPercent(lakebedTarget)
  const showLakebedProgress = waitingTarget === 'lakebed' && lakebedPreparing
  const lakebedProgressBackground =
    showLakebedProgress && lakebedProgressPercent > 0
      ? `linear-gradient(110deg, rgba(34, 211, 238, 0.16) 0%, rgba(34, 211, 238, 0.08) ${lakebedProgressPercent}%, transparent ${lakebedProgressPercent}%, transparent 100%)`
      : undefined
  const visibleError =
    error && !(error.target === 'lakebed' && lakebedDeploymentUrl !== undefined)
      ? error.message
      : lakebedArtifactError

  const publishNow = async (target: DeploymentTarget) => {
    setError(undefined)

    if (target === 'lakebed' && lakebedDeploymentUrl) {
      window.open(lakebedDeploymentUrl, '_blank', 'noopener,noreferrer')
      return
    }

    if (target === 'lakebed' && lakebedPreparing) {
      setWaitingTarget(target)
      try {
        const anonymousOwnerSecret =
          typeof window === 'undefined'
            ? undefined
            : readAnonymousOwnerSecret(window.localStorage, sessionId)
        const result = await ensureExportArtifact({
          lookup: sessionId,
          target: 'lakebed',
          anonymousOwnerSecret,
        })
        if (!result || result.status !== 'ready') return
        setWaitingTarget(undefined)
      } catch (ensureError) {
        setWaitingTarget(undefined)
        setError({
          message:
            ensureError instanceof Error
              ? ensureError.message
              : 'Publish failed',
          target,
        })
        return
      }
    }

    setActiveTarget(target)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined'
          ? undefined
          : readAnonymousOwnerSecret(window.localStorage, sessionId)

      const result = await (target === 'shipfast'
        ? publishPreview({
            lookup: sessionId,
            anonymousOwnerSecret,
          })
        : publishLakebedViaApi(sessionId, anonymousOwnerSecret))

      if (target === 'lakebed' && !result.url) {
        setError({
          message:
            ('error' in result ? result.error : undefined) ??
            'Lakebed publish is still preparing.',
          target,
        })
        return
      }

      if (typeof window !== 'undefined' && result.url) {
        window.open(result.url, '_blank', 'noopener,noreferrer')
      }
    } catch (publishError) {
      setError({
        message:
          publishError instanceof Error
            ? publishError.message
            : 'Publish failed',
        target,
      })
    } finally {
      setActiveTarget(undefined)
      setPendingPublicTarget(undefined)
    }
  }

  const startPublish = (target: DeploymentTarget) => {
    if (isPrivate) {
      setError(undefined)
      setPendingPublicTarget(target)
      return
    }
    void publishNow(target)
  }

  useEffect(() => {
    if (waitingTarget !== 'lakebed') return
    if (lakebedArtifactError !== undefined) {
      setWaitingTarget(undefined)
      setError({ message: lakebedArtifactError, target: 'lakebed' })
      return
    }
    if (lakebedPreparing && !lakebedDeploymentUrl) return
    setWaitingTarget(undefined)
    void publishNow('lakebed')
  }, [
    lakebedArtifactError,
    lakebedDeploymentUrl,
    lakebedPreparing,
    waitingTarget,
  ])

  return (
    <div className="grid gap-3">
      <AlertDialog
        open={pendingPublicTarget !== undefined}
        onOpenChange={(open) => {
          if (!open) setPendingPublicTarget(undefined)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-amber-400/12 text-amber-200">
              <TriangleAlert className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Publish this private site?</AlertDialogTitle>
            <AlertDialogDescription>
              Hosting this site makes it public and it may appear in the
              ShipFast hall of fame.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingPublicTarget !== undefined) {
                  void publishNow(pendingPublicTarget)
                }
              }}
            >
              Publish Publicly
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Globe2 className="size-4 text-cyan-200" />
        <div>
          <h2 className="m-0 text-sm font-semibold uppercase tracking-[0.1em] text-white">
            Deployment
          </h2>
          <p className="m-0 mt-1 text-xs leading-5 text-white/48">
            Publish this preview to a hosted target.
          </p>
        </div>
      </div>

      <button
        className="grid min-h-16 grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left transition-colors hover:border-cyan-300/30 hover:bg-cyan-300/10 disabled:cursor-wait disabled:opacity-60"
        disabled={activeTarget !== undefined || shipfastRefreshing}
        onClick={() => startPublish('shipfast')}
        type="button"
      >
        <span className="grid size-9 place-items-center rounded-lg bg-cyan-300/12 text-cyan-100">
          <Rocket className="size-4" />
        </span>
        <span className="grid min-w-0 gap-1">
          <span className="truncate text-sm font-semibold text-white">
            {targetDetails.shipfast.label}
          </span>
          <span className="truncate text-xs text-white/48">
            {activeTarget === 'shipfast'
              ? 'Publishing...'
              : shipfastRefreshing
                ? 'Updating deployment...'
                : targetDetails.shipfast.description}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-white/48"
          data-deployment-action="shipfast"
        >
          {activeTarget === 'shipfast' || shipfastRefreshing ? (
            <LoaderCircle className="size-4 animate-spin" strokeWidth={1.8} />
          ) : (
            <ExternalLink className="size-4" strokeWidth={1.8} />
          )}
        </span>
      </button>

      <button
        className="grid min-h-16 grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left transition-colors hover:border-cyan-300/30 hover:bg-cyan-300/10 disabled:cursor-wait disabled:opacity-60"
        disabled={activeTarget !== undefined || lakebedRefreshing}
        onClick={() => startPublish('lakebed')}
        style={{ backgroundImage: lakebedProgressBackground }}
        type="button"
      >
        <span className="grid size-9 place-items-center rounded-lg bg-cyan-300/12 text-cyan-100">
          <Rocket className="size-4" />
        </span>
        <span className="grid min-w-0 gap-1">
          <span className="truncate text-sm font-semibold text-white">
            {lakebedDeploymentUrl
              ? 'Open Lakebed'
              : targetDetails.lakebed.label}
          </span>
          <span className="truncate text-xs text-white/48">
            {activeTarget === 'lakebed'
              ? 'Publishing...'
              : lakebedRefreshing
                ? 'Updating deployment...'
                : showLakebedProgress && lakebedProgressPercent > 0
                  ? `${lakebedProgressPercent}%`
                  : targetDetails.lakebed.description}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-white/48"
          data-deployment-action="lakebed"
        >
          {activeTarget === 'lakebed' ||
          waitingTarget === 'lakebed' ||
          lakebedRefreshing ? (
            <LoaderCircle className="size-4 animate-spin" strokeWidth={1.8} />
          ) : (
            <ExternalLink className="size-4" strokeWidth={1.8} />
          )}
        </span>
      </button>

      {visibleError && (
        <p className="m-0 rounded-xl border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-200">
          {visibleError}
        </p>
      )}
    </div>
  )
}
