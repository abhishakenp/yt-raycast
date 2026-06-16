import { Github, Send } from 'lucide-react'
import { useState } from 'react'

import { useOptionalAuth } from '@/shared/auth/use-optional-auth'

type GitHubPanelProps = {
  sessionId: string
}

type ExportTarget = 'html' | 'react' | 'next'

export const GitHubPanel = ({ sessionId }: GitHubPanelProps) => {
  const { getToken, isSignedIn } = useOptionalAuth()
  const [githubAccessToken, setGithubAccessToken] = useState('')
  const [repoFullName, setRepoFullName] = useState('')
  const [repoName, setRepoName] = useState('')
  const [branch, setBranch] = useState('main')
  const [target, setTarget] = useState<ExportTarget>('html')
  const [isPushing, setIsPushing] = useState(false)
  const [error, setError] = useState<string>()
  const [repoUrl, setRepoUrl] = useState<string>()

  const pushToGitHub = async () => {
    setError(undefined)
    setRepoUrl(undefined)
    setIsPushing(true)

    try {
      const appToken = await getToken()
      if (!appToken || !isSignedIn) {
        throw new Error('Sign in before pushing to GitHub.')
      }

      const response = await fetch(`/api/sessions/${sessionId}/github/push`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${appToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target,
          githubAccessToken,
          repoFullName: repoFullName || undefined,
          repoName: repoName || undefined,
          branch: branch || undefined,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error ?? 'GitHub push failed')
      setRepoUrl(data.repoUrl)
    } catch (pushError) {
      setError(pushError instanceof Error ? pushError.message : 'GitHub push failed')
    } finally {
      setIsPushing(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Github className="size-4 text-cyan-200" />
        <div>
          <h2 className="m-0 text-sm font-semibold uppercase tracking-[0.1em] text-white">GitHub</h2>
          <p className="m-0 mt-1 text-xs leading-5 text-white/48">Push a generated export to a repository.</p>
        </div>
      </div>

      <div className="grid gap-3 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-white/10 [&_input]:bg-black/20 [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:text-white [&_input]:outline-none [&_label]:grid [&_label]:gap-2 [&_label]:text-xs [&_label]:font-semibold [&_label]:uppercase [&_label]:tracking-[0.08em] [&_label]:text-white/45 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-white/10 [&_select]:bg-black/20 [&_select]:px-3 [&_select]:py-2 [&_select]:text-sm [&_select]:text-white [&_select]:outline-none">
        <label>
          Target
          <select value={target} onChange={(event) => setTarget(event.target.value as ExportTarget)}>
            <option value="html">HTML</option>
            <option value="react">React</option>
            <option value="next">Next.js</option>
          </select>
        </label>
        <label>
          GitHub token
          <input
            autoComplete="off"
            onChange={(event) => setGithubAccessToken(event.target.value)}
            placeholder="ghp_..."
            type="password"
            value={githubAccessToken}
          />
        </label>
        <label>
          Existing repo
          <input
            onChange={(event) => setRepoFullName(event.target.value)}
            placeholder="owner/repo"
            type="text"
            value={repoFullName}
          />
        </label>
        <label>
          New repo name
          <input
            onChange={(event) => setRepoName(event.target.value)}
            placeholder="ship-fast-export"
            type="text"
            value={repoName}
          />
        </label>
        <label>
          Branch
          <input
            onChange={(event) => setBranch(event.target.value)}
            placeholder="main"
            type="text"
            value={branch}
          />
        </label>
      </div>

      <button
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45"
        disabled={isPushing || !githubAccessToken}
        onClick={() => void pushToGitHub()}
        type="button"
      >
        <Send className="size-4" />
        {isPushing ? 'Pushing...' : 'Push'}
      </button>

      {repoUrl && (
        <a className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-3 text-sm text-emerald-100 no-underline" href={repoUrl} target="_blank" rel="noreferrer">
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
