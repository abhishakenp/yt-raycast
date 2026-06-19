import { useMutation } from 'convex/react'
import { ExternalLink, Globe2, Rocket } from 'lucide-react'
import { useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

type DeploymentPanelProps = {
  sessionId: string
}

type DeploymentTarget = 'shipfast' | 'lakebed'

type PublishResult = {
  url?: string
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
  const result = (await response.json()) as PublishResult & { error?: string }
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

export const DeploymentPanel = ({ sessionId }: DeploymentPanelProps) => {
  const publishPreview = useMutation(api.sessions.publishPreview)
  const [activeTarget, setActiveTarget] = useState<DeploymentTarget>()
  const [error, setError] = useState<string>()

  const publish = async (target: DeploymentTarget) => {
    setError(undefined)
    setActiveTarget(target)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined'
          ? undefined
          : readAnonymousOwnerSecret(window.localStorage, sessionId)

      const result = (await (target === 'shipfast'
        ? publishPreview({
            sessionId: sessionId as Id<'sessions'>,
            anonymousOwnerSecret,
          })
        : publishLakebedViaApi(sessionId, anonymousOwnerSecret))) as PublishResult

      if (typeof window !== 'undefined' && result.url) {
        window.open(result.url, '_blank', 'noopener,noreferrer')
      }
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Publish failed')
    } finally {
      setActiveTarget(undefined)
    }
  }

  return (
    <div className="grid gap-3">
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
        disabled={activeTarget !== undefined}
        onClick={() => void publish('shipfast')}
        type="button"
      >
        <span className="grid size-9 place-items-center rounded-lg bg-cyan-300/12 text-cyan-100">
          <Rocket className="size-4" />
        </span>
        <span className="grid min-w-0 gap-1">
          <span className="truncate text-sm font-semibold text-white">
            {activeTarget === 'shipfast'
              ? 'Publishing...'
              : targetDetails.shipfast.label}
          </span>
          <span className="truncate text-xs text-white/48">
            {targetDetails.shipfast.description}
          </span>
        </span>
        <ExternalLink className="size-4 text-white/38" />
      </button>

      <button
        className="grid min-h-16 grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left transition-colors hover:border-cyan-300/30 hover:bg-cyan-300/10 disabled:cursor-wait disabled:opacity-60"
        disabled={activeTarget !== undefined}
        onClick={() => void publish('lakebed')}
        type="button"
      >
        <span className="grid size-9 place-items-center rounded-lg bg-cyan-300/12 text-cyan-100">
          <Rocket className="size-4" />
        </span>
        <span className="grid min-w-0 gap-1">
          <span className="truncate text-sm font-semibold text-white">
            {activeTarget === 'lakebed'
              ? 'Publishing...'
              : targetDetails.lakebed.label}
          </span>
          <span className="truncate text-xs text-white/48">
            {targetDetails.lakebed.description}
          </span>
        </span>
        <ExternalLink className="size-4 text-white/38" />
      </button>

      {error && (
        <p className="m-0 rounded-xl border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-200">
          {error}
        </p>
      )}
    </div>
  )
}
