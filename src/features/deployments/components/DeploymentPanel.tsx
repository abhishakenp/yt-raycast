import { useMutation, useQuery } from 'convex/react'
import {
  ExternalLink,
  Globe2,
  LoaderCircle,
  Rocket,
  TriangleAlert,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
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
import { useProgressTick } from '@/features/exports/hooks/use-progress-tick'
import {
  estimateObservedRemainingMs,
  formatDurationShort,
} from '@/features/exports/services/format-progress-duration'
import {
  requiresRazorpayDeploymentCredentials,
  validateRazorpayDeploymentCredentials,
  type RazorpayDeploymentCredentials,
} from '@/features/deployments/services/razorpay-deployment-credentials'

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
  // Real, event-driven progress pushed by the build/deploy action as each
  // actual pipeline stage completes — never a simulated/timed value.
  artifactProgressStage?: string
  artifactProgressPercent?: number
  artifactProgressStartedAt?: number
  artifactProgressUpdatedAt?: number
  artifactProgressSampleCount?: number
  deployedUrl?: string | null
}

type DeploymentPanelError = {
  message: string
  target: DeploymentTarget
}

async function publishLakebedViaApi(
  sessionId: string,
  anonymousOwnerSecret?: string,
  razorpay?: RazorpayDeploymentCredentials,
): Promise<PublishResult> {
  const response = await fetch(
    `/api/sessions/${encodeURIComponent(sessionId)}/deploy/lakebed`,
    {
      body: JSON.stringify({ anonymousOwnerSecret, razorpay }),
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

function isPublishResponse(value: unknown): value is PublishResult {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    (!('error' in value) || typeof value.error === 'string') &&
    (!('status' in value) || typeof value.status === 'string') &&
    (!('url' in value) || typeof value.url === 'string')
  )
}

function artifactProgressPercent(
  target: DeploymentExportTarget | undefined,
  isRefreshing = false,
) {
  if (
    target?.artifactStatus === 'building' ||
    target?.artifactStatus === 'queued'
  ) {
    return target.artifactProgressPercent ?? 0
  }
  if (isRefreshing) return 0
  if (target?.artifactReady) return 100
  return target?.artifactProgressPercent ?? 0
}

export function DeploymentPanel({ sessionId }: DeploymentPanelProps) {
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
  const commerceConfig = useQuery(api.sessions.getCommerceConfig, {
    sessionId: sessionId as Id<'sessions'>,
  })
  const [activeTarget, setActiveTarget] = useState<DeploymentTarget>()
  const [waitingTarget, setWaitingTarget] = useState<DeploymentTarget>()
  const [pendingPublicTarget, setPendingPublicTarget] =
    useState<DeploymentTarget>()
  const [error, setError] = useState<DeploymentPanelError>()
  const [credentialTarget, setCredentialTarget] = useState<DeploymentTarget>()
  const [credentialError, setCredentialError] = useState<string>()
  const [razorpay, setRazorpay] = useState<RazorpayDeploymentCredentials>({
    environment: 'test',
    keyId: '',
    keySecret: '',
  })
  const actionInFlightRef = useRef(false)
  const razorpayRef = useRef<RazorpayDeploymentCredentials>()

  const visibleExportTargets = exportTargets?.targets ?? []
  const lakebedTarget = visibleExportTargets.find(
    (target: DeploymentExportTarget) => target.target === 'lakebed',
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
  const lakebedProgressPercent = artifactProgressPercent(
    lakebedTarget,
    lakebedRefreshing,
  )
  const lakebedArtifactInFlight =
    lakebedTarget?.artifactReady !== true &&
    (lakebedTarget?.artifactStatus === 'queued' ||
      lakebedTarget?.artifactStatus === 'building')
  const showLakebedProgress =
    waitingTarget === 'lakebed' || lakebedRefreshing || lakebedArtifactInFlight
  const lakebedProgressBackground =
    showLakebedProgress && lakebedProgressPercent > 0
      ? `linear-gradient(110deg, rgba(34, 211, 238, 0.16) 0%, rgba(34, 211, 238, 0.08) ${lakebedProgressPercent}%, transparent ${lakebedProgressPercent}%, transparent 100%)`
      : undefined
  const now = useProgressTick(showLakebedProgress)
  const lakebedRemainingMs = showLakebedProgress
    ? estimateObservedRemainingMs({
        now,
        percent: lakebedProgressPercent,
        progressSampleCount: lakebedTarget?.artifactProgressSampleCount,
        progressStartedAt: lakebedTarget?.artifactProgressStartedAt,
        progressUpdatedAt: lakebedTarget?.artifactProgressUpdatedAt,
      })
    : null
  const lakebedStageLabel =
    lakebedTarget?.artifactProgressStage ??
    (lakebedRefreshing ? 'Updating deployment' : 'Preparing deployment')
  const lakebedProgressText =
    showLakebedProgress && lakebedProgressPercent > 0
      ? `${lakebedProgressPercent}%${
          lakebedRemainingMs !== null
            ? ` · ~${formatDurationShort(lakebedRemainingMs)} left`
            : ''
        }`
      : lakebedStageLabel
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
        : publishLakebedViaApi(
            sessionId,
            anonymousOwnerSecret,
            razorpayRef.current,
          ))

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
      razorpayRef.current = undefined
    }
  }

  const beginPublish = (
    target: DeploymentTarget,
    credentials?: RazorpayDeploymentCredentials,
  ) => {
    razorpayRef.current = credentials
    if (isPrivate) {
      setError(undefined)
      setPendingPublicTarget(target)
      return
    }
    if (actionInFlightRef.current) return
    actionInFlightRef.current = true
    void publishNow(target).finally(() => {
      actionInFlightRef.current = false
    })
  }

  const startPublish = (target: DeploymentTarget) => {
    if (target === 'lakebed' && lakebedDeploymentUrl !== undefined) {
      beginPublish(target)
      return
    }
    if (requiresRazorpayDeploymentCredentials(commerceConfig)) {
      setCredentialError(undefined)
      setCredentialTarget(target)
      return
    }
    beginPublish(target)
  }

  const submitRazorpayCredentials = () => {
    if (credentialTarget === undefined) return
    const credentialValidationError =
      validateRazorpayDeploymentCredentials(razorpay)
    if (credentialValidationError !== undefined) {
      setCredentialError(credentialValidationError)
      return
    }

    const target = credentialTarget
    const credentials = {
      ...razorpay,
      keyId: razorpay.keyId.trim(),
      keySecret: razorpay.keySecret.trim(),
    }
    setCredentialError(undefined)
    setCredentialTarget(undefined)
    setRazorpay((current) => ({ ...current, keyId: '', keySecret: '' }))
    beginPublish(target, credentials)
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

      <AlertDialog
        open={credentialTarget !== undefined}
        onOpenChange={(open) => {
          if (!open) {
            setCredentialTarget(undefined)
            setCredentialError(undefined)
            setRazorpay((current) => ({
              ...current,
              keyId: '',
              keySecret: '',
            }))
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Connect Razorpay before deployment
            </AlertDialogTitle>
            <AlertDialogDescription>
              Start with Razorpay test credentials. These values stay in this
              deployment request and are not saved to ShipFast.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm text-white/70">
              Mode
              <select
                aria-label="Razorpay mode"
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                onChange={(event) =>
                  setRazorpay((current) => ({
                    ...current,
                    environment:
                      event.target.value === 'live' ? 'live' : 'test',
                  }))
                }
                value={razorpay.environment}
              >
                <option value="test">Test</option>
                <option value="live">Live</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm text-white/70">
              Razorpay key ID
              <input
                aria-label="Razorpay key ID"
                autoComplete="off"
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                onChange={(event) =>
                  setRazorpay((current) => ({
                    ...current,
                    keyId: event.target.value,
                  }))
                }
                placeholder="rzp_test_..."
                value={razorpay.keyId}
              />
            </label>
            <label className="grid gap-1 text-sm text-white/70">
              Razorpay key secret
              <input
                aria-label="Razorpay key secret"
                autoComplete="new-password"
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                onChange={(event) =>
                  setRazorpay((current) => ({
                    ...current,
                    keySecret: event.target.value,
                  }))
                }
                type="password"
                value={razorpay.keySecret}
              />
            </label>
            {credentialError !== undefined && (
              <p className="m-0 text-sm text-rose-200" role="alert">
                {credentialError}
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                submitRazorpayCredentials()
              }}
            >
              Continue deployment
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
        disabled={
          activeTarget !== undefined ||
          waitingTarget !== undefined ||
          shipfastRefreshing
        }
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
        disabled={
          activeTarget !== undefined ||
          waitingTarget !== undefined ||
          lakebedRefreshing
        }
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
                ? showLakebedProgress && lakebedProgressPercent > 0
                  ? lakebedProgressText
                  : 'Updating deployment...'
                : showLakebedProgress && lakebedProgressPercent > 0
                  ? lakebedProgressText
                  : showLakebedProgress
                    ? lakebedStageLabel
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
          lakebedArtifactInFlight ||
          lakebedRefreshing ? (
            <LoaderCircle className="size-4 animate-spin" strokeWidth={1.8} />
          ) : (
            <ExternalLink className="size-4" strokeWidth={1.8} />
          )}
        </span>
      </button>

      {visibleError && (
        <p
          className="m-0 rounded-xl border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-200"
          role="alert"
        >
          {visibleError}
        </p>
      )}
    </div>
  )
}
