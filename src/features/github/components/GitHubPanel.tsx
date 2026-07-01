import {
  ExternalLink,
  Github,
  LoaderCircle,
  Lock,
  TriangleAlert,
} from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'
import { useEffect, useMemo, useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import {
  useOptionalAuth,
  useOptionalClerk,
} from '@/shared/auth/use-optional-auth'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'
import {
  HtmlIcon,
  ReactIcon,
  NextIcon,
  LakebedIcon,
} from '@/features/exports/components/ExportIcons'

type GitHubTarget = {
  target: 'html' | 'react' | 'next' | 'lakebed'
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
  githubUrl?: string | null
  githubRepoUrl?: string | null
}

type ExportTargetResponse = GitHubTarget | { target: string }

type GitHubPanelProps = {
  sessionId: string
}

const GITHUB_PENDING_PUSH_KEY = 'ship-fast:github-pending-push'
const githubTargets: Array<GitHubTarget['target']> = [
  'html',
  'react',
  'next',
  'lakebed',
]

const targetLabel = (target: GitHubTarget['target']): string =>
  target === 'html'
    ? 'HTML'
    : target === 'react'
      ? 'React'
      : target === 'next'
        ? 'Next.js'
        : 'Lakebed'

const targetSummary = (target: GitHubTarget['target']): string =>
  target === 'html'
    ? 'Static site project'
    : target === 'react'
      ? 'React client project'
      : target === 'next'
        ? 'Next.js full-stack project'
        : 'Lakebed full-stack repository'

const loadingTargets: GitHubTarget[] = githubTargets.map((target) => ({
  target,
  label: targetLabel(target),
  ready: false,
  status: 'loading',
  requiresPayment: false,
  fileCount: null,
  artifactReady: false,
  artifactStatus: 'loading',
}))

const statusLabel = (target: GitHubTarget): string => {
  if (target.requiresPayment) return 'Payment required'
  if (target.status === 'stale') {
    return target.currentPreviewVersion === null ||
      target.currentPreviewVersion === undefined
      ? 'Regenerate export first'
      : `Regenerate for preview v${target.currentPreviewVersion}`
  }
  if (target.ready) return ''
  return target.status.replaceAll('_', ' ')
}

const artifactProgressPercent = (target: GitHubTarget) =>
  target.artifactReady
    ? 100
    : target.artifactStatus === 'building'
      ? 72
      : target.artifactStatus === 'queued'
        ? 26
        : target.artifactStatus === 'loading'
          ? 12
          : target.ready
            ? 100
            : 0

const isGitHubTarget = (target: ExportTargetResponse): target is GitHubTarget =>
  target.target === 'html' ||
  target.target === 'react' ||
  target.target === 'next' ||
  target.target === 'lakebed'

const readOwnerSecret = (sessionId: string): string | undefined =>
  typeof window === 'undefined'
    ? undefined
    : readAnonymousOwnerSecret(window.localStorage, sessionId)

const isPendingPushRecord = (
  value: unknown,
): value is { sessionId?: unknown; target?: unknown } =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const pendingPushPayload = (
  sessionId: string,
  target: GitHubTarget['target'],
): string => JSON.stringify({ sessionId, target })

const storePendingPush = (
  sessionId: string,
  target: GitHubTarget['target'],
): void => {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(
    GITHUB_PENDING_PUSH_KEY,
    pendingPushPayload(sessionId, target),
  )
}

const consumePendingPush = (
  sessionId: string,
): GitHubTarget['target'] | null => {
  if (typeof window === 'undefined') return null
  const raw = window.sessionStorage.getItem(GITHUB_PENDING_PUSH_KEY)
  if (!raw) return null
  window.sessionStorage.removeItem(GITHUB_PENDING_PUSH_KEY)

  try {
    const parsed = JSON.parse(raw)
    if (!isPendingPushRecord(parsed)) return null
    if (
      parsed.sessionId === sessionId &&
      (parsed.target === 'html' ||
        parsed.target === 'react' ||
        parsed.target === 'next' ||
        parsed.target === 'lakebed')
    ) {
      return parsed.target
    }
  } catch {
    return null
  }

  return null
}

export const GitHubPanel = ({ sessionId }: GitHubPanelProps) => {
  const auth = useOptionalAuth()
  const clerk = useOptionalClerk()
  const exportTargets = useQuery(api.sessions.getExportTargets, {
    lookup: sessionId,
  })
  const ensureExportArtifact = useMutation(
    api.sessions.ensureExportArtifactByLookup,
  )
  const [activeTarget, setActiveTarget] = useState<GitHubTarget['target']>()
  const [pendingRetryTarget, setPendingRetryTarget] = useState<
    GitHubTarget['target'] | null
  >(null)
  const [error, setError] = useState<string>()
  const [waitingTarget, setWaitingTarget] = useState<GitHubTarget['target']>()
  const [repoUrlsByTarget, setRepoUrlsByTarget] = useState(() => ({
    html: '',
    react: '',
    next: '',
    lakebed: '',
  }))

  useEffect(() => {
    setPendingRetryTarget(consumePendingPush(sessionId))
  }, [sessionId])

  const visibleTargets = useMemo(
    () =>
      exportTargets?.targets && exportTargets.targets.length > 0
        ? exportTargets.targets.filter(isGitHubTarget)
        : loadingTargets,
    [exportTargets?.targets],
  )

  const startGitHubConnection = async (
    target: GitHubTarget['target'],
    appToken?: string,
  ) => {
    if (!auth.isSignedIn) {
      void clerk.openSignIn?.()
      return
    }

    const token = appToken ?? (await auth.getToken({ template: 'convex' }))
    if (!token) throw new Error('Sign in before connecting GitHub.')

    const response = await fetch('/api/github/connect/start', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        target,
        returnTo: typeof window === 'undefined' ? '/' : window.location.href,
      }),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data?.error ?? 'Unable to start GitHub connection.')
    }
    if (typeof data?.url !== 'string' || !data.url.trim()) {
      throw new Error('Unable to start GitHub connection.')
    }

    storePendingPush(sessionId, target)
    window.location.assign(data.url)
  }

  const createExportForGitHub = async (
    target: GitHubTarget['target'],
    appToken: string,
    anonymousOwnerSecret: string | undefined,
  ) => {
    const response = await fetch(`/api/sessions/${sessionId}/export`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${appToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ target, anonymousOwnerSecret }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data?.error ?? 'Export failed')
  }

  const pushTarget = async (targetConfig: GitHubTarget) => {
    setError(undefined)

    const existingRepoUrl =
      targetConfig.githubUrl ??
      targetConfig.githubRepoUrl ??
      repoUrlsByTarget[targetConfig.target]
    if (existingRepoUrl) {
      window.open(existingRepoUrl, '_blank', 'noopener,noreferrer')
      return
    }

    if (!auth.isSignedIn) {
      void clerk.openSignIn?.()
      setError('Sign in before pushing to GitHub.')
      return
    }

    if (!targetConfig.artifactReady) {
      setWaitingTarget(targetConfig.target)
      try {
        const result = await ensureExportArtifact({
          lookup: sessionId,
          target: targetConfig.target,
          anonymousOwnerSecret: readOwnerSecret(sessionId),
        })
        if (!result || result.status !== 'ready') return
        setWaitingTarget(undefined)
      } catch (ensureError) {
        setWaitingTarget(undefined)
        setError(
          ensureError instanceof Error
            ? ensureError.message
            : 'GitHub push failed',
        )
        return
      }
    }

    if (
      targetConfig.requiresPayment ||
      targetConfig.status === 'payment_required'
    ) {
      setError('Subscribe to Pro or use a download credit before pushing.')
      return
    }

    setActiveTarget(targetConfig.target)
    try {
      const appToken = await auth.getToken({ template: 'convex' })
      if (!appToken) throw new Error('Sign in before pushing to GitHub.')
      const anonymousOwnerSecret = readOwnerSecret(sessionId)

      if (!targetConfig.ready) {
        await createExportForGitHub(
          targetConfig.target,
          appToken,
          anonymousOwnerSecret,
        )
      }

      const pushExport = async () =>
        await fetch(`/api/sessions/${sessionId}/github/push`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${appToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            target: targetConfig.target,
            anonymousOwnerSecret,
          }),
        })

      const response = await pushExport()
      const data = await response.json()
      if (
        !response.ok &&
        response.status === 409 &&
        (data?.code === 'GITHUB_NOT_CONNECTED' ||
          data?.code === 'GITHUB_REPO_SCOPE_REQUIRED')
      ) {
        await startGitHubConnection(targetConfig.target, appToken)
        return
      }
      if (!response.ok) {
        throw new Error(data?.error ?? 'GitHub push failed')
      }
      if (typeof data.repoUrl === 'string' && data.repoUrl.trim()) {
        const nextRepoUrl = data.repoUrl
        setRepoUrlsByTarget((current) => ({
          ...current,
          [targetConfig.target]: nextRepoUrl,
        }))
        window.open(nextRepoUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (pushError) {
      setError(
        pushError instanceof Error ? pushError.message : 'GitHub push failed',
      )
    } finally {
      setActiveTarget(undefined)
    }
  }

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
      void pushTarget(item)
      return
    }
    if (item.artifactStatus === 'failed' || item.status === 'stale') {
      setWaitingTarget(undefined)
      setError(item.artifactError ?? 'Export failed. Click to retry.')
    }
  }, [visibleTargets, waitingTarget])

  useEffect(() => {
    if (
      !pendingRetryTarget ||
      activeTarget !== undefined ||
      visibleTargets.length === 0
    ) {
      return
    }

    const item = visibleTargets.find(
      (target) => target.target === pendingRetryTarget,
    )
    if (!item) return
    setPendingRetryTarget(null)
    void pushTarget(item)
  }, [activeTarget, pendingRetryTarget, visibleTargets])

  return (
    <div className="grid gap-3">
      <div className="grid gap-1 px-1">
        <div className="flex items-center gap-2">
          <Github className="size-4 text-cyan-200" />
          <h2 className="m-0 text-sm font-semibold text-white">GitHub Push</h2>
        </div>
        <p className="m-0 text-xs leading-5 text-white/52">
          Push the full generated project to your private GitHub repo.
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
            activeTarget === item.target || waitingTarget === item.target
          const isBuildPending =
            !item.artifactReady &&
            (item.artifactStatus === 'queued' ||
              item.artifactStatus === 'building' ||
              item.artifactStatus === 'loading' ||
              item.artifactStatus === 'not_ready')
          const progressPercent = artifactProgressPercent(item)
          const showProgress = waitingTarget === item.target && isBuildPending
          const progressBackground =
            showProgress && progressPercent > 0
              ? `linear-gradient(110deg, rgba(34, 211, 238, 0.16) 0%, rgba(34, 211, 238, 0.08) ${progressPercent}%, transparent ${progressPercent}%, transparent 100%)`
              : undefined
          const existingRepoUrl =
            item.githubUrl ??
            item.githubRepoUrl ??
            repoUrlsByTarget[item.target]
          const statusText = showProgress
            ? `${progressPercent}%`
            : activeTarget === item.target
              ? 'Pushing Repository...'
              : item.artifactStatus === 'failed'
                ? (item.artifactError ?? 'Export failed')
                : isBuildPending
                  ? ''
                  : statusLabel(item)

          return (
            <button
              className="group/github grid min-h-16 w-full grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-white/8 bg-white/[0.04] p-2.5 text-left transition-colors hover:border-white/14 hover:bg-white/[0.075] disabled:cursor-wait disabled:opacity-60"
              data-github-target={item.target}
              disabled={activeTarget !== undefined}
              key={item.target}
              onClick={() => void pushTarget(item)}
              style={{ backgroundImage: progressBackground }}
              type="button"
            >
              <span
                className="export-target-glyph grid size-[42px] shrink-0 place-items-center rounded-[10px] transition-colors group-hover/github:text-white"
                aria-hidden="true"
              >
                <Icon className="size-8" />
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
              <span
                aria-hidden="true"
                className="export-target-action grid size-9 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-white/48 transition-colors group-hover/github:border-cyan-200/30 group-hover/github:bg-cyan-200/10 group-hover/github:text-cyan-100"
                data-github-action={item.target}
              >
                {isBusy ? (
                  <LoaderCircle
                    className="size-4 animate-spin"
                    strokeWidth={1.8}
                  />
                ) : item.requiresPayment ? (
                  <Lock className="size-4 text-amber-300" strokeWidth={1.8} />
                ) : item.status === 'stale' ? (
                  <TriangleAlert
                    className="size-4 text-amber-200"
                    strokeWidth={1.8}
                  />
                ) : existingRepoUrl ? (
                  <ExternalLink className="size-4" strokeWidth={1.8} />
                ) : (
                  <Github className="size-4" strokeWidth={1.8} />
                )}
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
