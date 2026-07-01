import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createGitHubConnectCallbackResponse,
  createGitHubConnectStartResponse,
} from './github-oauth-response'

const env = {
  GITHUB_CLIENT_ID: 'client-id',
  GITHUB_CLIENT_SECRET: 'client-secret',
  GITHUB_OAUTH_AUTHORIZE_URL: 'https://github.test/login/oauth/authorize',
  GITHUB_OAUTH_TOKEN_URL: 'https://github.test/login/oauth/access_token',
  SHIP_FAST_GITHUB_API_BASE: 'https://github-api.test',
}

const client = {
  mutation: vi.fn(),
  setAuth: vi.fn(),
}

describe('GitHub OAuth response handlers', () => {
  beforeEach(() => {
    client.mutation.mockReset()
    client.setAuth.mockReset()
  })

  it('starts GitHub OAuth with repo scope and a stored current-user state', async () => {
    client.mutation.mockResolvedValueOnce(null)

    const response = await createGitHubConnectStartResponse(
      new Request('https://ship-fast.test/api/github/connect/start', {
        method: 'POST',
        headers: { authorization: 'Bearer app-token' },
        body: JSON.stringify({
          sessionId: 'session_123',
          target: 'lakebed',
          returnTo: 'https://ship-fast.test/generate/session_123?tab=github',
        }),
      }),
      env,
      client,
    )

    expect(response.status).toBe(200)
    expect(client.setAuth).toHaveBeenCalledWith('app-token')
    const mutationArgs = client.mutation.mock.calls[0]?.[1]
    expect(mutationArgs).toMatchObject({
      returnTo: '/generate/session_123?tab=github',
      sessionId: 'session_123',
      target: 'lakebed',
    })
    expect(typeof mutationArgs.state).toBe('string')
    expect(typeof mutationArgs.expiresAt).toBe('number')

    const body = await response.json()
    const authorizeUrl = new URL(body.url)
    expect(authorizeUrl.origin + authorizeUrl.pathname).toBe(
      'https://github.test/login/oauth/authorize',
    )
    expect(authorizeUrl.searchParams.get('client_id')).toBe('client-id')
    expect(authorizeUrl.searchParams.get('scope')).toBe('repo')
    expect(authorizeUrl.searchParams.get('state')).toBe(mutationArgs.state)
    expect(authorizeUrl.searchParams.get('redirect_uri')).toBe(
      'https://ship-fast.test/api/github/connect/callback',
    )
  })

  it('stores only safe same-origin return URLs and recognized export targets', async () => {
    client.mutation.mockResolvedValueOnce(null)

    const response = await createGitHubConnectStartResponse(
      new Request('https://ship-fast.test/api/github/connect/start', {
        body: JSON.stringify({
          sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
          target: 'desktop-app',
          returnTo:
            'https://evil.test/steal?session=k574ms14ma9f94keq30r7dq24x89n1k2',
        }),
        headers: { authorization: 'Bearer app-token' },
        method: 'POST',
      }),
      env,
      client,
    )

    expect(response.status).toBe(200)
    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      state: expect.any(String),
      returnTo: '/',
      sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
      target: undefined,
      expiresAt: expect.any(Number),
    })
    const body = await response.json()
    expect(new URL(body.url).searchParams.get('state')).toBe(
      client.mutation.mock.calls[0]?.[1].state,
    )
  })

  it('returns JSON auth/setup errors before storing OAuth state', async () => {
    const missingConfig = await createGitHubConnectStartResponse(
      new Request('https://ship-fast.test/api/github/connect/start', {
        body: JSON.stringify({ target: 'html' }),
        headers: { authorization: 'Bearer app-token' },
        method: 'POST',
      }),
      { ...env, GITHUB_CLIENT_ID: '' },
      client,
    )

    expect(missingConfig.status).toBe(500)
    await expect(missingConfig.json()).resolves.toEqual({
      error: 'GitHub OAuth is not configured.',
    })

    const unauthenticated = await createGitHubConnectStartResponse(
      new Request('https://ship-fast.test/api/github/connect/start', {
        body: JSON.stringify({ target: 'html' }),
        method: 'POST',
      }),
      env,
      client,
    )

    expect(unauthenticated.status).toBe(401)
    await expect(unauthenticated.json()).resolves.toEqual({
      error: 'Sign in before connecting GitHub.',
    })
    expect(client.mutation).not.toHaveBeenCalled()
  })

  it('exchanges the callback code, stores the GitHub token, and redirects back', async () => {
    client.mutation.mockResolvedValueOnce({
      returnTo: '/generate/session_123',
      sessionId: 'session_123',
      target: 'next',
      githubLogin: 'octo-user',
      scopes: ['repo'],
    })
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const path = String(url)

      if (path === 'https://github.test/login/oauth/access_token') {
        expect(init?.method).toBe('POST')
        expect(String(init?.body)).toContain('client_id=client-id')
        expect(String(init?.body)).toContain('client_secret=client-secret')
        expect(String(init?.body)).toContain('code=callback-code')
        return Response.json({
          access_token: 'gho_connected',
          scope: 'repo,read:user',
          token_type: 'bearer',
        })
      }

      if (path === 'https://github-api.test/user') {
        expect(init?.headers).toMatchObject({
          Authorization: 'Bearer gho_connected',
        })
        return Response.json({ id: 42, login: 'octo-user' })
      }

      return Response.json({ error: `Unexpected ${path}` }, { status: 500 })
    })

    const response = await createGitHubConnectCallbackResponse(
      new Request(
        'https://ship-fast.test/api/github/connect/callback?code=callback-code&state=state_123',
      ),
      env,
      client,
      fetchMock as typeof fetch,
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe(
      '/generate/session_123?github=connected',
    )
    expect(client.setAuth).not.toHaveBeenCalled()
    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      state: 'state_123',
      githubUserId: 42,
      githubLogin: 'octo-user',
      accessToken: 'gho_connected',
      scopes: ['repo', 'read:user'],
    })
  })

  it('cancels OAuth state and redirects to the stored safe return path', async () => {
    client.mutation.mockResolvedValueOnce({
      returnTo: '/generate/k574ms14ma9f94keq30r7dq24x89n1k2?tab=github',
    })

    const response = await createGitHubConnectCallbackResponse(
      new Request(
        'https://ship-fast.test/api/github/connect/callback?error=access_denied&state=state_cancelled',
      ),
      env,
      client,
      vi.fn() as unknown as typeof fetch,
    )

    expect(response.status).toBe(302)
    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      state: 'state_cancelled',
    })
    expect(response.headers.get('Location')).toBe(
      '/generate/k574ms14ma9f94keq30r7dq24x89n1k2?tab=github&github=cancelled',
    )
  })

  it('rejects malformed callback URLs and redirects provider failures to an error status', async () => {
    const missingState = await createGitHubConnectCallbackResponse(
      new Request(
        'https://ship-fast.test/api/github/connect/callback?code=callback-code',
      ),
      env,
      client,
      vi.fn() as unknown as typeof fetch,
    )
    expect(missingState.status).toBe(400)
    await expect(missingState.text()).resolves.toBe(
      'Missing GitHub OAuth state.',
    )

    const missingCode = await createGitHubConnectCallbackResponse(
      new Request(
        'https://ship-fast.test/api/github/connect/callback?state=state_123',
      ),
      env,
      client,
      vi.fn() as unknown as typeof fetch,
    )
    expect(missingCode.status).toBe(400)
    await expect(missingCode.text()).resolves.toBe('Missing GitHub OAuth code.')

    const fetchMock = vi.fn(async (url: string | URL) => {
      if (String(url) === 'https://github.test/login/oauth/access_token') {
        return Response.json({
          error: 'bad_verification_code',
          error_description: 'The code passed is incorrect or expired.',
        })
      }
      return Response.json({ error: `Unexpected ${String(url)}` })
    })
    const providerFailure = await createGitHubConnectCallbackResponse(
      new Request(
        'https://ship-fast.test/api/github/connect/callback?code=expired-code&state=state_123',
      ),
      env,
      client,
      fetchMock as typeof fetch,
    )

    expect(providerFailure.status).toBe(302)
    expect(providerFailure.headers.get('Location')).toBe('/?github=error')
    expect(client.mutation).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ accessToken: expect.any(String) }),
    )
  })
})
