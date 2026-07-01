import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type GitHubOAuthEnv = NodeJS.ProcessEnv
type FetchFn = typeof fetch
type GitHubOAuthConvexClient = Pick<ConvexHttpClient, 'mutation' | 'setAuth'>
type GitHubConnectBody = {
  sessionId?: unknown
  target?: unknown
  returnTo?: unknown
}
type GitHubUser = {
  id: number
  login: string
}
type GitHubTokenPayload = {
  accessToken: string
  scopes: string[]
}

const DEFAULT_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize'
const DEFAULT_TOKEN_URL = 'https://github.com/login/oauth/access_token'
const DEFAULT_GITHUB_API_BASE = 'https://api.github.com'
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000
const GITHUB_REPO_SCOPE = 'repo'
const VALID_TARGETS = new Set(['html', 'react', 'next', 'lakebed'])

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const getGitHubClientId = (env: GitHubOAuthEnv): string =>
  normalizeString(env.GITHUB_CLIENT_ID)

const getGitHubClientSecret = (env: GitHubOAuthEnv): string =>
  normalizeString(env.GITHUB_CLIENT_SECRET)

const getGitHubAuthorizeUrl = (env: GitHubOAuthEnv): string =>
  normalizeString(env.GITHUB_OAUTH_AUTHORIZE_URL) || DEFAULT_AUTHORIZE_URL

const getGitHubTokenUrl = (env: GitHubOAuthEnv): string =>
  normalizeString(env.GITHUB_OAUTH_TOKEN_URL) || DEFAULT_TOKEN_URL

const getGitHubApiBase = (env: GitHubOAuthEnv): string =>
  (
    normalizeString(env.SHIP_FAST_GITHUB_API_BASE) || DEFAULT_GITHUB_API_BASE
  ).replace(/\/+$/, '')

const getCallbackUrl = (request: Request, env: GitHubOAuthEnv): string => {
  const configured = normalizeString(env.GITHUB_OAUTH_REDIRECT_URI)
  if (configured) return configured
  const url = new URL(request.url)
  return `${url.origin}/api/github/connect/callback`
}

const safeReturnTo = (value: unknown, requestUrl: string): string => {
  const fallback = '/'
  const raw = normalizeString(value)
  if (!raw) return fallback

  const requestOrigin = new URL(requestUrl).origin
  const parsed = new URL(raw, requestOrigin)
  if (parsed.origin !== requestOrigin) return fallback
  return `${parsed.pathname}${parsed.search}${parsed.hash}` || fallback
}

const appendGitHubStatus = (
  returnTo: string,
  requestUrl: string,
  status: 'connected' | 'cancelled' | 'error',
): string => {
  const requestOrigin = new URL(requestUrl).origin
  const parsed = new URL(returnTo, requestOrigin)
  if (parsed.origin !== requestOrigin) return '/'
  parsed.searchParams.set('github', status)
  return `${parsed.pathname}${parsed.search}${parsed.hash}`
}

const redirect = (location: string): Response =>
  new Response(null, {
    status: 302,
    headers: { Location: location },
  })

const createState = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const readJsonBody = async (request: Request): Promise<GitHubConnectBody> => {
  try {
    const body = (await request.json()) as unknown
    return isRecord(body) ? body : {}
  } catch {
    return {}
  }
}

const parseScopes = (value: unknown): string[] =>
  normalizeString(value)
    .split(',')
    .map((scope) => scope.trim().toLowerCase())
    .filter(Boolean)

const parseTokenResponse = (payload: unknown): GitHubTokenPayload => {
  if (!isRecord(payload)) {
    throw new Error('GitHub authorization did not return a token.')
  }

  if (typeof payload.error === 'string' && payload.error.trim()) {
    const description = normalizeString(payload.error_description)
    throw new Error(description || payload.error)
  }

  const accessToken = normalizeString(payload.access_token)
  if (!accessToken) {
    throw new Error('GitHub authorization did not return a token.')
  }

  return {
    accessToken,
    scopes: parseScopes(payload.scope),
  }
}

const parseGitHubUser = (payload: unknown): GitHubUser => {
  if (!isRecord(payload)) throw new Error('Unable to load GitHub user.')
  const id = payload.id
  const login = normalizeString(payload.login)
  if (typeof id !== 'number' || !login) {
    throw new Error('Unable to load GitHub user.')
  }
  return { id, login }
}

const exchangeCodeForToken = async (
  code: string,
  request: Request,
  env: GitHubOAuthEnv,
  fetchFn: FetchFn,
): Promise<GitHubTokenPayload> => {
  const clientId = getGitHubClientId(env)
  const clientSecret = getGitHubClientSecret(env)
  if (!clientId || !clientSecret) {
    throw new Error('GitHub OAuth is not configured.')
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: getCallbackUrl(request, env),
  })
  const response = await fetchFn(getGitHubTokenUrl(env), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'ship-fast',
    },
    body,
  })
  return parseTokenResponse(await response.json())
}

const fetchGitHubUser = async (
  token: string,
  env: GitHubOAuthEnv,
  fetchFn: FetchFn,
): Promise<GitHubUser> => {
  const response = await fetchFn(`${getGitHubApiBase(env)}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'ship-fast',
    },
  })
  return parseGitHubUser(await response.json())
}

export async function createGitHubConnectStartResponse(
  request: Request,
  env: GitHubOAuthEnv = process.env,
  clientOverride?: GitHubOAuthConvexClient,
): Promise<Response> {
  const clientId = getGitHubClientId(env)
  if (!clientId) {
    return json({ error: 'GitHub OAuth is not configured.' }, { status: 500 })
  }

  const authToken = getBearerToken(request)
  if (!authToken) {
    return json({ error: 'Sign in before connecting GitHub.' }, { status: 401 })
  }

  const body = await readJsonBody(request)
  const target = normalizeString(body.target)
  const state = createState()
  const callbackUrl = getCallbackUrl(request, env)
  const returnTo = safeReturnTo(body.returnTo, request.url)
  const client = clientOverride ?? createRuntimeConvexHttpClient()
  client.setAuth(authToken)
  try {
    await client.mutation(api.github.createOAuthState, {
      state,
      returnTo,
      sessionId: normalizeString(body.sessionId) || undefined,
      target: VALID_TARGETS.has(target)
        ? (target as 'html' | 'react' | 'next' | 'lakebed')
        : undefined,
      expiresAt: Date.now() + OAUTH_STATE_TTL_MS,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to start GitHub connection.'
    if (/AUTH_REQUIRED|Sign in/i.test(message)) {
      return json(
        { error: 'Sign in before connecting GitHub.' },
        { status: 401 },
      )
    }
    return json(
      { error: 'Unable to start GitHub connection.' },
      { status: 503 },
    )
  }

  const url = new URL(getGitHubAuthorizeUrl(env))
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', callbackUrl)
  url.searchParams.set('scope', GITHUB_REPO_SCOPE)
  url.searchParams.set('state', state)
  url.searchParams.set('allow_signup', 'true')

  return json({ url: url.href })
}

export async function createGitHubConnectCallbackResponse(
  request: Request,
  env: GitHubOAuthEnv = process.env,
  clientOverride?: GitHubOAuthConvexClient,
  fetchOverride?: FetchFn,
): Promise<Response> {
  const url = new URL(request.url)
  const code = normalizeString(url.searchParams.get('code'))
  const state = normalizeString(url.searchParams.get('state'))
  const oauthError = normalizeString(url.searchParams.get('error'))

  if (!state) {
    return new Response('Missing GitHub OAuth state.', { status: 400 })
  }

  const client = clientOverride ?? createRuntimeConvexHttpClient()

  if (oauthError) {
    const cancelled = await client.mutation(api.github.cancelOAuthState, {
      state,
    })
    return redirect(
      appendGitHubStatus(cancelled.returnTo, request.url, 'cancelled'),
    )
  }

  if (!code) {
    return new Response('Missing GitHub OAuth code.', { status: 400 })
  }

  try {
    const fetchFn = fetchOverride ?? fetch
    const token = await exchangeCodeForToken(code, request, env, fetchFn)
    const githubUser = await fetchGitHubUser(token.accessToken, env, fetchFn)
    const connection = await client.mutation(
      api.github.completeOAuthConnection,
      {
        state,
        githubUserId: githubUser.id,
        githubLogin: githubUser.login,
        accessToken: token.accessToken,
        scopes: token.scopes,
      },
    )

    return redirect(
      appendGitHubStatus(connection.returnTo, request.url, 'connected'),
    )
  } catch {
    return redirect(appendGitHubStatus('/', request.url, 'error'))
  }
}
