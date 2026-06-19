import {
  Code2,
  Github,
  LoaderCircle,
  Lock,
  PackageCheck,
  PanelsTopLeft,
  Server,
  TriangleAlert,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  useOptionalAuth,
  useOptionalClerk,
} from '@/shared/auth/use-optional-auth'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

type GitHubTarget = {
  target: 'html' | 'react' | 'next' | 'lakebed'
  label: string
  ready: boolean
  status: string
  requiresPayment: boolean
  fileCount: number | null
  previewVersion?: number | null
  currentPreviewVersion?: number | null
}

type ExportTargetResponse = GitHubTarget | { target: string }

type GitHubPanelProps = {
  sessionId: string
}

const GITHUB_PENDING_PUSH_KEY = 'ship-fast:github-pending-push'

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

const statusLabel = (target: GitHubTarget): string => {
  if (target.requiresPayment) return 'Payment required'
  if (target.status === 'stale') {
    return target.currentPreviewVersion === null ||
      target.currentPreviewVersion === undefined
      ? 'Regenerate export first'
      : `Regenerate for preview v${target.currentPreviewVersion}`
  }
  if (target.ready) return `${target.fileCount ?? 0} files ready`
  return target.status.replaceAll('_', ' ')
}

const githubTargets = ['html', 'react', 'next', 'lakebed'] as const

const isGitHubTarget = (target: ExportTargetResponse): target is GitHubTarget =>
  target.target === 'html' ||
  target.target === 'react' ||
  target.target === 'next' ||
  target.target === 'lakebed'

const readOwnerSecret = (sessionId: string): string | undefined =>
  typeof window === 'undefined'
    ? undefined
    : readAnonymousOwnerSecret(window.localStorage, sessionId)

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
    const parsed = JSON.parse(raw) as { sessionId?: unknown; target?: unknown }
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
  const [targets, setTargets] = useState<GitHubTarget[]>([])
  const [activeTarget, setActiveTarget] = useState<GitHubTarget['target']>()
  const [pendingRetryTarget, setPendingRetryTarget] = useState<
    GitHubTarget['target'] | null
  >(null)
  const [error, setError] = useState<string>()
  const [repoUrl, setRepoUrl] = useState<string>()

  const loadTargets = async () => {
    setError(undefined)
    const response = await fetch(`/api/sessions/${sessionId}/export-targets`)
    const data = await response.json()
    if (!response.ok) throw new Error(data?.error ?? 'Unable to load exports')
    setTargets((data.targets ?? []).filter(isGitHubTarget))
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

  useEffect(() => {
    setPendingRetryTarget(consumePendingPush(sessionId))
  }, [sessionId])

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
    await loadTargets()
  }

  const pushTarget = async (item: GitHubTarget) => {
    setError(undefined)
    setRepoUrl(undefined)

    if (!auth.isSignedIn) {
      void clerk.openSignIn?.()
      setError('Sign in before pushing to GitHub.')
      return
    }

    if (item.requiresPayment || item.status === 'payment_required') {
      setError('Subscribe to Pro or use a download credit before pushing.')
      return
    }

    setActiveTarget(item.target)
    try {
      const appToken = await auth.getToken({ template: 'convex' })
      if (!appToken) throw new Error('Sign in before pushing to GitHub.')
      const anonymousOwnerSecret = readOwnerSecret(sessionId)

      if (!item.ready) {
        await createExportForGitHub(item.target, appToken, anonymousOwnerSecret)
      }

      const pushExport = async () =>
        await fetch(`/api/sessions/${sessionId}/github/push`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${appToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            target: item.target,
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
        await startGitHubConnection(item.target, appToken)
        return
      }
      if (!response.ok) {
        throw new Error(data?.error ?? 'GitHub push failed')
      }
      setRepoUrl(data.repoUrl)
    } catch (pushError) {
      setError(
        pushError instanceof Error ? pushError.message : 'GitHub push failed',
      )
    } finally {
      setActiveTarget(undefined)
    }
  }

  useEffect(() => {
    if (
      !pendingRetryTarget ||
      activeTarget !== undefined ||
      targets.length === 0
    ) {
      return
    }

    const item = targets.find((target) => target.target === pendingRetryTarget)
    if (!item) return
    setPendingRetryTarget(null)
    void pushTarget(item)
  }, [activeTarget, pendingRetryTarget, targets])

  const visibleTargets =
    targets.length > 0
      ? targets
      : githubTargets.map((target) => ({
          target,
          label: targetLabel(target),
          ready: false,
          status: 'loading',
          requiresPayment: false,
          fileCount: null,
        }))

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
              ? Github
              : item.target === 'react'
                ? Code2
                : item.target === 'next'
                  ? PanelsTopLeft
                  : Server
          const isBusy = activeTarget === item.target
          const actionLabel = item.requiresPayment
            ? 'Check Access'
            : item.ready
              ? 'Push To GitHub'
              : 'Build Export'
          const statusText = isBusy
            ? 'Pushing Repository...'
            : statusLabel(item)

          return (
            <button
              className="group/github grid min-h-16 w-full grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-white/8 bg-white/[0.04] p-2.5 text-left transition-colors hover:border-white/14 hover:bg-white/[0.075] disabled:cursor-wait disabled:opacity-60"
              data-github-target={item.target}
              disabled={activeTarget !== undefined}
              key={item.target}
              onClick={() => void pushTarget(item)}
              type="button"
            >
              <span
                className="export-target-glyph grid size-[42px] shrink-0 place-items-center rounded-[10px] border border-white/10 bg-black/24 text-white/70 transition-colors group-hover/github:border-white/16 group-hover/github:bg-white/[0.06] group-hover/github:text-white"
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

      {repoUrl && (
        <a
          className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-3 text-sm text-emerald-100 no-underline"
          href={repoUrl}
          target="_blank"
          rel="noreferrer"
        >
          {repoUrl}
        </a>
      )}
      {error && (
        <p className="m-0 rounded-xl border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-200">
          {error}
        </p>
      )}
    </div>
  )
}
