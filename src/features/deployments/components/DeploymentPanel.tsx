import { useMutation, useQuery } from 'convex/react'
import { Globe2, Send } from 'lucide-react'
import { useEffect, useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

type DeploymentPanelProps = {
  sessionId: string
}

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)

export const DeploymentPanel = ({ sessionId }: DeploymentPanelProps) => {
  const deploymentStatus = useQuery(api.sessions.getDeploymentStatus, {
    sessionId: sessionId as Id<'sessions'>,
  })
  const publishPreview = useMutation(api.sessions.publishPreview)
  const [slug, setSlug] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    setSlug(deploymentStatus?.slug ?? '')
  }, [deploymentStatus?.slug])

  const publish = async () => {
    setError(undefined)
    setIsPublishing(true)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined'
          ? undefined
          : readAnonymousOwnerSecret(window.localStorage, sessionId)
      await publishPreview({
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret,
        requestedSlug: slugify(slug),
      })
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Publish failed')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Globe2 className="size-4 text-cyan-200" />
        <div>
          <h2 className="m-0 text-sm font-semibold uppercase tracking-[0.1em] text-white">Deployment</h2>
          <p className="m-0 mt-1 text-xs leading-5 text-white/48">Publish this preview with the current Convex deployment registry.</p>
        </div>
      </div>

      <section className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
          Public slug
          <input
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none"
            onChange={(event) => setSlug(slugify(event.target.value))}
            placeholder="my-generated-site"
            value={slug}
          />
        </label>
        {deploymentStatus?.url && (
          <a
            className="truncate rounded-xl border border-cyan-300/16 bg-cyan-300/10 px-3 py-2 font-mono text-xs text-cyan-100 no-underline"
            href={deploymentStatus.url}
          >
            {deploymentStatus.url}
          </a>
        )}
        <button
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full bg-cyan-300 px-3 py-2 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45"
          disabled={isPublishing || slugify(slug).length === 0}
          onClick={() => void publish()}
          type="button"
        >
          <Send className="size-4" />
          {isPublishing ? 'Publishing...' : deploymentStatus?.url ? 'Republish' : 'Publish'}
        </button>
      </section>

      {error && (
        <p className="m-0 rounded-xl border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-200">
          {error}
        </p>
      )}
    </div>
  )
}
