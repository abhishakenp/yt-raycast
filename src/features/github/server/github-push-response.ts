import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import {
  createHtmlExportFiles,
  createReactExportFiles,
  createNextExportFiles,
} from '@/features/exports/services/html-export-files'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type GitHubPushConvexClient = Pick<ConvexHttpClient, 'query' | 'setAuth'>
type GitHubPushEnv = NodeJS.ProcessEnv
type FetchFn = typeof fetch

type GitHubPushBody = {
  target?: unknown
  githubAccessToken?: unknown
  repoFullName?: unknown
  repoName?: unknown
  branch?: unknown
}

type GitHubExportTarget = 'html' | 'react' | 'next'

type GitHubRepo = {
  id?: number
  name: string
  full_name: string
  html_url: string
  default_branch?: string
  private?: boolean
}

type GitHubRef = {
  ref?: string
  object?: { sha?: string }
}

const DEFAULT_GITHUB_API_BASE = 'https://api.github.com'
const VALID_TARGETS = new Set<GitHubExportTarget>(['html', 'react', 'next'])
const REPO_FULL_NAME_RE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/
const BRANCH_RE = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,99}$/

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

const normalizeString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const getBearerToken = (request: Request): string | null => {
  const match = (request.headers.get('authorization') ?? '').match(
    /^Bearer\s+(.+)$/i,
  )
  return match?.[1]?.trim() || null
}

const getGithubApiBase = (env: GitHubPushEnv): string =>
  (env.SHIP_FAST_GITHUB_API_BASE || DEFAULT_GITHUB_API_BASE).replace(/\/+$/, '')

const sanitizeRepoName = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')
    .slice(0, 90)

const deriveRepoName = (
  body: GitHubPushBody,
  prompt: string,
  target: GitHubExportTarget,
): string => {
  const explicit = sanitizeRepoName(normalizeString(body.repoName))
  if (explicit) return explicit

  const fromPrompt = sanitizeRepoName(prompt).split('-').slice(0, 5).join('-')
  return fromPrompt ? `${fromPrompt}-${target}` : `ship-fast-export-${target}`
}

const normalizeBranch = (value: unknown, fallback: string): string => {
  const branch = normalizeString(value) || fallback
  if (
    !BRANCH_RE.test(branch) ||
    branch.includes('..') ||
    branch.endsWith('/')
  ) {
    throw new Error('Invalid GitHub branch name.')
  }
  return branch
}

async function githubRequest<T>(
  path: string,
  {
    env,
    fetchFn,
    token,
    method = 'GET',
    body,
    expectedStatus = [200],
  }: {
    env: GitHubPushEnv
    fetchFn: FetchFn
    token: string
    method?: string
    body?: unknown
    expectedStatus?: number[]
  },
): Promise<T | null> {
  const response = await fetchFn(`${getGithubApiBase(env)}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'ship-fast',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const raw = await response.text()
  const data = raw ? JSON.parse(raw) : null

  if (!expectedStatus.includes(response.status)) {
    const message =
      data?.errors
        ?.map((entry: { message?: string }) => entry.message)
        .filter(Boolean)
        .join(', ') ||
      data?.message ||
      response.statusText ||
      'GitHub request failed.'
    const error = new Error(message)
    ;(error as Error & { status?: number }).status = response.status
    throw error
  }

  return response.status === 404 ? null : (data as T)
}

const getRepository = async (
  env: GitHubPushEnv,
  fetchFn: FetchFn,
  token: string,
  repoFullName: string,
) =>
  await githubRequest<GitHubRepo>(`/repos/${repoFullName}`, {
    env,
    fetchFn,
    token,
    expectedStatus: [200, 404],
  })

const createRepository = async (
  env: GitHubPushEnv,
  fetchFn: FetchFn,
  token: string,
  name: string,
  target: GitHubExportTarget,
) =>
  await githubRequest<GitHubRepo>('/user/repos', {
    env,
    fetchFn,
    token,
    method: 'POST',
    expectedStatus: [201],
    body: {
      name,
      private: true,
      auto_init: true,
      description: `Generated with Ship Fast as a ${target} export.`,
    },
  })

const getBranchRef = async (
  env: GitHubPushEnv,
  fetchFn: FetchFn,
  token: string,
  repoFullName: string,
  branch: string,
) =>
  await githubRequest<GitHubRef>(
    `/repos/${repoFullName}/git/ref/heads/${encodeURIComponent(branch)}`,
    {
      env,
      fetchFn,
      token,
      expectedStatus: [200, 404],
    },
  )

const seedRepository = async (
  env: GitHubPushEnv,
  fetchFn: FetchFn,
  token: string,
  repoFullName: string,
  branch: string,
) =>
  await githubRequest(`/repos/${repoFullName}/contents/.shipfast-bootstrap`, {
    env,
    fetchFn,
    token,
    method: 'PUT',
    expectedStatus: [201],
    body: {
      message: 'Ship Fast bootstrap commit',
      branch,
      content: Buffer.from('Ship Fast repository bootstrap.\n').toString(
        'base64',
      ),
    },
  })

const createTree = async (
  env: GitHubPushEnv,
  fetchFn: FetchFn,
  token: string,
  repoFullName: string,
  files: Record<string, string>,
) =>
  await githubRequest<{ sha: string }>(`/repos/${repoFullName}/git/trees`, {
    env,
    fetchFn,
    token,
    method: 'POST',
    expectedStatus: [201],
    body: {
      tree: Object.entries(files)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([path, content]) => ({
          path,
          mode: '100644',
          type: 'blob',
          content,
        })),
    },
  })

const createCommit = async (
  env: GitHubPushEnv,
  fetchFn: FetchFn,
  token: string,
  repoFullName: string,
  treeSha: string,
  parentSha: string,
  target: GitHubExportTarget,
) =>
  await githubRequest<{ sha: string }>(`/repos/${repoFullName}/git/commits`, {
    env,
    fetchFn,
    token,
    method: 'POST',
    expectedStatus: [201],
    body: {
      message: `Ship Fast export (${target})`,
      tree: treeSha,
      parents: [parentSha],
    },
  })

const updateBranchRef = async (
  env: GitHubPushEnv,
  fetchFn: FetchFn,
  token: string,
  repoFullName: string,
  branch: string,
  commitSha: string,
) =>
  await githubRequest(
    `/repos/${repoFullName}/git/refs/heads/${encodeURIComponent(branch)}`,
    {
      env,
      fetchFn,
      token,
      method: 'PATCH',
      expectedStatus: [200],
      body: { sha: commitSha, force: false },
    },
  )

const ensureRepository = async (
  env: GitHubPushEnv,
  fetchFn: FetchFn,
  token: string,
  body: GitHubPushBody,
  prompt: string,
  target: GitHubExportTarget,
): Promise<{ repo: GitHubRepo; created: boolean }> => {
  const requestedRepo = normalizeString(body.repoFullName)
  if (requestedRepo) {
    if (!REPO_FULL_NAME_RE.test(requestedRepo)) {
      throw new Error('Invalid GitHub repository. Use owner/repo.')
    }
    const repo = await getRepository(env, fetchFn, token, requestedRepo)
    if (repo === null) throw new Error('GitHub repository not found.')
    return { repo, created: false }
  }

  const repo = await createRepository(
    env,
    fetchFn,
    token,
    deriveRepoName(body, prompt, target),
    target,
  )
  if (repo === null) throw new Error('Unable to create GitHub repository.')
  return { repo, created: true }
}

const convexStatus = (error: unknown): number => {
  const message = error instanceof Error ? error.message : String(error)
  if (/AUTH_REQUIRED|Sign in/i.test(message)) return 401
  if (/FORBIDDEN|own/i.test(message)) return 403
  if (/PAYMENT_REQUIRED|Subscribe|purchase/i.test(message)) return 402
  if (/NOT_FOUND/i.test(message)) return 404
  if (/NOT_READY/i.test(message)) return 409
  return 500
}

export async function createGitHubPushResponse(
  request: Request,
  sessionId: string,
  env: GitHubPushEnv = process.env,
  clientOverride?: GitHubPushConvexClient,
  fetchOverride?: FetchFn,
): Promise<Response> {
  const authToken = getBearerToken(request)
  if (authToken === null) {
    return json({ error: 'Sign in before pushing to GitHub.' }, { status: 401 })
  }

  let body: GitHubPushBody
  try {
    body = (await request.json()) as GitHubPushBody
  } catch {
    return json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const target = normalizeString(body.target) || 'html'
  if (!VALID_TARGETS.has(target as GitHubExportTarget)) {
    return json(
      { error: 'Only HTML, React, and Next.js GitHub push is supported.' },
      { status: 400 },
    )
  }
  const exportTarget = target as GitHubExportTarget

  const githubAccessToken = normalizeString(body.githubAccessToken)
  if (!githubAccessToken) {
    return json({ error: 'GitHub access token is required.' }, { status: 400 })
  }

  try {
    const client = clientOverride ?? createRuntimeConvexHttpClient()
    client.setAuth(authToken)
    const exportData = await client.query(
      api.sessions.getOwnedExportForGitHubPush,
      {
        sessionId: sessionId as any,
        target: exportTarget,
      },
    )
    const fetchFn = fetchOverride ?? fetch

    await githubRequest('/user', {
      env,
      fetchFn,
      token: githubAccessToken,
      expectedStatus: [200],
    })

    const { repo, created } = await ensureRepository(
      env,
      fetchFn,
      githubAccessToken,
      body,
      exportData.prompt,
      exportTarget,
    )
    const branch = normalizeBranch(body.branch, repo.default_branch || 'main')
    let ref = await getBranchRef(
      env,
      fetchFn,
      githubAccessToken,
      repo.full_name,
      branch,
    )

    if (ref?.object?.sha === undefined) {
      await seedRepository(
        env,
        fetchFn,
        githubAccessToken,
        repo.full_name,
        branch,
      )
      ref = await getBranchRef(
        env,
        fetchFn,
        githubAccessToken,
        repo.full_name,
        branch,
      )
    }

    if (ref?.object?.sha === undefined) {
      throw new Error('GitHub branch is not ready for commits.')
    }

    let files: Record<string, string>

    if (exportTarget === 'html') {
      files = createHtmlExportFiles(
        String(exportData.sessionId),
        'html',
        exportData.html,
        {
          includeBadge: exportData.includeBadge,
        },
      )
    } else if (exportTarget === 'react') {
      files = createReactExportFiles(
        String(exportData.sessionId),
        'react',
        exportData.html,
        {
          includeBadge: exportData.includeBadge,
        },
      )
    } else if (exportTarget === 'next') {
      files = createNextExportFiles(
        String(exportData.sessionId),
        'next',
        exportData.html,
        {
          includeBadge: exportData.includeBadge,
        },
      )
    } else {
      return json(
        { error: 'Unsupported export target for GitHub push.' },
        { status: 400 },
      )
    }

    const tree = await createTree(
      env,
      fetchFn,
      githubAccessToken,
      repo.full_name,
      files,
    )
    const commit = await createCommit(
      env,
      fetchFn,
      githubAccessToken,
      repo.full_name,
      tree?.sha ?? '',
      ref.object.sha,
      exportTarget,
    )

    if (!commit?.sha) throw new Error('GitHub commit failed.')

    await updateBranchRef(
      env,
      fetchFn,
      githubAccessToken,
      repo.full_name,
      branch,
      commit.sha,
    )

    return json({
      ok: true,
      target: exportTarget,
      repoFullName: repo.full_name,
      repoName: repo.name,
      repoUrl: repo.html_url,
      branch,
      commitSha: commit.sha,
      created,
      files: Object.keys(files).sort(),
      fileCount: Object.keys(files).length,
      previewVersion: exportData.previewVersion,
    })
  } catch (error) {
    const status =
      error instanceof Error && 'status' in error
        ? ((error as Error & { status?: number }).status ?? 400)
        : convexStatus(error)
    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to push export to GitHub.',
      },
      { status },
    )
  }
}
