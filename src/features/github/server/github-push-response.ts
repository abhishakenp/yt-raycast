import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { isUnsafePublicPreviewHtml } from '../../../../convex/lib/openui_error_html'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type GitHubPushConvexClient = Pick<
  ConvexHttpClient,
  'mutation' | 'query' | 'setAuth'
>
type GitHubPushEnv = NodeJS.ProcessEnv
type FetchFn = typeof fetch
type GitHubTokenResolver = (
  appToken: string,
  env: GitHubPushEnv,
  client: GitHubPushConvexClient,
) => Promise<GitHubOAuthToken[]>

type GitHubPushBody = {
  target?: unknown
  anonymousOwnerSecret?: unknown
}

type GitHubExportTarget = 'html' | 'react' | 'next' | 'lakebed'

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

type GitHubOAuthToken = {
  token: string
  scopes?: string[]
}

type GitHubPushErrorCode =
  | 'AUTH_REQUIRED'
  | 'GITHUB_NOT_CONNECTED'
  | 'GITHUB_REPO_SCOPE_REQUIRED'

const DEFAULT_GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_REPO_SCOPE = 'repo'
const VALID_TARGETS = new Set<GitHubExportTarget>([
  'html',
  'react',
  'next',
  'lakebed',
])

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

const readUnknownJson = async (response: Response): Promise<unknown> =>
  await response.json()

const normalizeString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const isGitHubPushBody = (value: unknown): value is GitHubPushBody =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const normalizeTarget = (value: unknown): GitHubExportTarget | null => {
  switch (value) {
    case 'html':
    case 'react':
    case 'next':
    case 'lakebed':
      return value
    default:
      return null
  }
}

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

const deriveRepoName = (prompt: string, target: GitHubExportTarget): string => {
  const fromPrompt = sanitizeRepoName(prompt).split('-').slice(0, 5).join('-')
  return fromPrompt ? `${fromPrompt}-${target}` : `ship-fast-export-${target}`
}

const responseError = (
  code: GitHubPushErrorCode,
  message: string,
  status: number,
) => {
  const error = new Error(message) as Error & {
    status?: number
    code?: GitHubPushErrorCode
  }
  error.status = status
  error.code = code
  return error
}

const loadPrebuiltFiles = async (
  url: string | null | undefined,
): Promise<Record<string, string> | null> => {
  if (!url) return null
  const response = await fetch(url)
  if (!response.ok) return null
  let parsed: unknown
  try {
    parsed = await readUnknownJson(response)
  } catch {
    return null
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null
  }
  const files: Record<string, string> = {}
  for (const [path, contents] of Object.entries(parsed)) {
    if (typeof contents !== 'string') return null
    files[path] = contents
  }
  return files
}

const LAKEBED_REQUIRED_ENTRYPOINTS = ['client/index.tsx', 'server/index.ts']

const validateExportFiles = (
  target: GitHubExportTarget,
  files: Record<string, string>,
): string | null => {
  if (target === 'lakebed') {
    const missingEntry = LAKEBED_REQUIRED_ENTRYPOINTS.find(
      (entrypoint) => !files[entrypoint],
    )
    if (missingEntry) {
      return 'Lakebed export artifact is missing required project files.'
    }
    return null
  }

  const indexHtml = files['index.html']
  if (indexHtml === undefined) {
    return 'Export artifact is missing index.html.'
  }
  if (normalizeString(indexHtml) === '') {
    return 'Export artifact is missing rendered HTML.'
  }
  if (isUnsafePublicPreviewHtml(indexHtml)) {
    return 'Export artifact is not a rendered static site.'
  }
  return null
}

const defaultGitHubTokenResolver: GitHubTokenResolver = async (
  _appToken,
  _env,
  client,
) => {
  const connection = await client.query(
    api.github.getConnectionForCurrentUser,
    {},
  )
  return connection
    ? [{ token: connection.accessToken, scopes: connection.scopes }]
    : []
}

const resolveGitHubAccessToken = async (
  appToken: string,
  env: GitHubPushEnv,
  tokenResolver: GitHubTokenResolver,
  client: GitHubPushConvexClient,
): Promise<string> => {
  const tokens = await tokenResolver(appToken, env, client)
  if (tokens.length === 0) {
    throw responseError(
      'GITHUB_NOT_CONNECTED',
      'Connect GitHub before pushing.',
      409,
    )
  }

  const tokenWithRepoScope = tokens.find(
    (token) => token.token && token.scopes?.includes(GITHUB_REPO_SCOPE),
  )
  if (!tokenWithRepoScope) {
    throw responseError(
      'GITHUB_REPO_SCOPE_REQUIRED',
      'Connect GitHub with repo access before pushing.',
      409,
    )
  }

  return tokenWithRepoScope.token
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
  let response: Response
  try {
    response = await fetchFn(`${getGithubApiBase(env)}${path}`, {
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
  } catch {
    const error = new Error('GitHub request failed.')
    ;(error as Error & { status?: number }).status = 502
    throw error
  }

  const raw = await response.text()
  let data: Record<string, unknown> | null = null
  if (raw) {
    try {
      data = JSON.parse(raw) as Record<string, unknown>
    } catch {
      data = null
    }
  }

  if (!expectedStatus.includes(response.status)) {
    const errors = Array.isArray(data?.errors)
      ? (data?.errors as { message?: string }[])
      : undefined
    const message =
      errors
        ?.map((entry) => entry.message)
        .filter(Boolean)
        .join(', ') ||
      (typeof data?.message === 'string' ? data.message : undefined) ||
      response.statusText ||
      'GitHub request failed.'
    const error = new Error(message)
    ;(error as Error & { status?: number }).status = response.status
    throw error
  }

  return response.status === 404 ? null : (data as T)
}

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
  prompt: string,
  target: GitHubExportTarget,
  sessionId: string,
): Promise<{ repo: GitHubRepo; created: boolean }> => {
  const baseRepoName = deriveRepoName(prompt, target)
  const attempts = [
    baseRepoName,
    `${baseRepoName}-${sessionId}`,
    `${baseRepoName}-${sessionId.slice(0, 4)}`,
  ].map(sanitizeRepoName)
  const seen = new Set<string>()

  for (const repoName of attempts) {
    if (!repoName || seen.has(repoName)) continue
    seen.add(repoName)
    try {
      const repo = await createRepository(env, fetchFn, token, repoName, target)
      if (repo === null) break
      return { repo, created: true }
    } catch (error) {
      if ((error as Error & { status?: number }).status === 422) continue
      throw error
    }
  }

  throw new Error('Unable to create a GitHub repository for this export.')
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
  tokenResolver: GitHubTokenResolver = defaultGitHubTokenResolver,
): Promise<Response> {
  const authToken = getBearerToken(request)
  if (authToken === null) {
    return json({ error: 'Sign in before pushing to GitHub.' }, { status: 401 })
  }

  let body: GitHubPushBody
  try {
    const parsed = await request.json()
    body = isGitHubPushBody(parsed) ? parsed : {}
  } catch {
    return json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const exportTarget = normalizeTarget(body.target) ?? 'html'
  if (!VALID_TARGETS.has(exportTarget)) {
    return json(
      {
        error:
          'Only HTML, React, Next.js, and Lakebed GitHub push is supported.',
      },
      { status: 400 },
    )
  }
  const anonymousOwnerSecret = normalizeString(body.anonymousOwnerSecret)

  try {
    const client = clientOverride ?? createRuntimeConvexHttpClient()
    client.setAuth(authToken)
    const exportData = await client.query(
      api.sessions.getOwnedExportForGitHubPushByLookup,
      {
        lookup: sessionId,
        target: exportTarget,
        anonymousOwnerSecret: anonymousOwnerSecret || undefined,
      },
    )
    if (exportData.artifact?.status === 'failed') {
      return json(
        {
          error: exportData.artifact.errorMessage ?? 'Export failed.',
          status: 'failed',
        },
        { status: 409 },
      )
    }

    if (
      exportData.artifact?.status !== 'ready' ||
      typeof exportData.filesUrl !== 'string'
    ) {
      return json(
        { error: 'Export is still being prepared.', status: 'building' },
        { status: 202 },
      )
    }

    const files = await loadPrebuiltFiles(exportData.filesUrl)
    if (files === null) {
      return json(
        { error: 'Export is still being prepared.', status: 'building' },
        { status: 202 },
      )
    }

    const validationError = validateExportFiles(exportTarget, files)
    if (validationError) {
      return json({ error: validationError }, { status: 409 })
    }

    const fetchFn = fetchOverride ?? fetch
    const githubAccessToken = await resolveGitHubAccessToken(
      authToken,
      env,
      tokenResolver,
      client,
    )

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
      exportData.prompt,
      exportTarget,
      sessionId,
    )
    const branch = repo.default_branch || 'main'
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

    await client.mutation(api.sessions.recordGitHubExportRepositoryByLookup, {
      lookup: sessionId,
      target: exportTarget,
      anonymousOwnerSecret: anonymousOwnerSecret || undefined,
      repoUrl: repo.html_url,
    })

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
    const code =
      error instanceof Error && 'code' in error
        ? (error as Error & { code?: string }).code
        : undefined
    const status =
      error instanceof Error && 'status' in error
        ? ((error as Error & { status?: number }).status ?? 400)
        : convexStatus(error)
    const isForbidden = status === 403
    return json(
      {
        error: isForbidden
          ? 'You do not have access to this export.'
          : error instanceof Error
            ? error.message
            : 'Unable to push export to GitHub.',
        ...(code && !isForbidden ? { code } : {}),
      },
      { status },
    )
  }
}
