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
})
