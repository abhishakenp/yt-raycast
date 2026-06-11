import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createGitHubPushResponse } from './github-push-response'

const env = {
  SHIP_FAST_GITHUB_API_BASE: 'https://github-api.test',
}

const client = {
  query: vi.fn(),
  setAuth: vi.fn(),
}

const exportData = {
  sessionId: 'session_123',
  prompt: 'A product website for Atlas Notes',
  target: 'html',
  previewVersion: 3,
  html: '<html><body><h1>Atlas Notes</h1></body></html>',
  includeBadge: false,
}

function createGitHubFetch() {
  const requests: Array<{ method: string; path: string; body: unknown }> = []
  const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
    const parsed = new URL(String(url))
    const body = init?.body ? JSON.parse(String(init.body)) : null
    const method = init?.method ?? 'GET'
    requests.push({ method, path: parsed.pathname, body })

    if (parsed.pathname === '/user') {
      return new Response(JSON.stringify({ login: 'shipfast-test-user' }))
    }

    if (method === 'POST' && parsed.pathname === '/user/repos') {
      return new Response(
        JSON.stringify({
          id: 42,
          name: body.name,
          full_name: `shipfast-test-user/${body.name}`,
          html_url: `https://github.com/shipfast-test-user/${body.name}`,
          default_branch: 'main',
          private: true,
        }),
        { status: 201 },
      )
    }

    if (
      method === 'GET' &&
      parsed.pathname ===
        '/repos/shipfast-test-user/a-product-website-for-atlas-html/git/ref/heads/main'
    ) {
      return new Response(
        JSON.stringify({ ref: 'refs/heads/main', object: { sha: 'base-sha' } }),
      )
    }

    if (
      method === 'POST' &&
      parsed.pathname ===
        '/repos/shipfast-test-user/a-product-website-for-atlas-html/git/trees'
    ) {
      return new Response(JSON.stringify({ sha: 'tree-sha' }), { status: 201 })
    }

    if (
      method === 'POST' &&
      parsed.pathname ===
        '/repos/shipfast-test-user/a-product-website-for-atlas-html/git/commits'
    ) {
      return new Response(JSON.stringify({ sha: 'commit-sha' }), {
        status: 201,
      })
    }

    if (
      method === 'PATCH' &&
      parsed.pathname ===
        '/repos/shipfast-test-user/a-product-website-for-atlas-html/git/refs/heads/main'
    ) {
      return new Response(
        JSON.stringify({
          ref: 'refs/heads/main',
          object: { sha: 'commit-sha' },
        }),
      )
    }

    return new Response(
      JSON.stringify({ message: `Unhandled ${method} ${parsed.pathname}` }),
      { status: 404 },
    )
  })

  return { fetchMock, requests }
}

describe('createGitHubPushResponse', () => {
  beforeEach(() => {
    client.query.mockReset().mockResolvedValue(exportData)
    client.setAuth.mockReset()
  })

  it('requires app authentication and a GitHub token', async () => {
    const unauthenticated = await createGitHubPushResponse(
      new Request(
        'https://ship-fast.test/api/sessions/session_123/github/push',
        {
          method: 'POST',
          body: JSON.stringify({ target: 'html' }),
        },
      ),
      'session_123',
      env,
      client,
    )
    expect(unauthenticated.status).toBe(401)

    const missingGitHubToken = await createGitHubPushResponse(
      new Request(
        'https://ship-fast.test/api/sessions/session_123/github/push',
        {
          method: 'POST',
          headers: { authorization: 'Bearer app-token' },
          body: JSON.stringify({ target: 'html' }),
        },
      ),
      'session_123',
      env,
      client,
    )
    expect(missingGitHubToken.status).toBe(400)
  })

  it('pushes owner export files to a private GitHub repository', async () => {
    const { fetchMock, requests } = createGitHubFetch()

    const response = await createGitHubPushResponse(
      new Request(
        'https://ship-fast.test/api/sessions/session_123/github/push',
        {
          method: 'POST',
          headers: { authorization: 'Bearer app-token' },
          body: JSON.stringify({
            target: 'html',
            githubAccessToken: 'ghp_test',
          }),
        },
      ),
      'session_123',
      env,
      client,
      fetchMock as never,
    )

    expect(response.status).toBe(200)
    expect(client.setAuth).toHaveBeenCalledWith('app-token')
    expect(await response.json()).toMatchObject({
      ok: true,
      repoFullName: 'shipfast-test-user/a-product-website-for-atlas-html',
      branch: 'main',
      commitSha: 'commit-sha',
      files: [
        'README.md',
        'index.html',
        'llms.txt',
        'robots.txt',
        'sitemap.xml',
      ],
      previewVersion: 3,
    })

    const treeRequest = requests.find((request) =>
      request.path.endsWith('/git/trees'),
    )
    const treeEntries = (treeRequest?.body as { tree: Array<{ path: string }> })
      .tree
    expect(treeEntries.map((entry) => entry.path).sort()).toEqual([
      'README.md',
      'index.html',
      'llms.txt',
      'robots.txt',
      'sitemap.xml',
    ])
    expect(JSON.stringify(treeRequest?.body)).toContain('Atlas Notes')
    expect(JSON.stringify(treeRequest?.body)).not.toContain(
      'data-ship-fast-export-badge="1"',
    )
    expect(
      requests.map((request) => `${request.method} ${request.path}`),
    ).toEqual([
      'GET /user',
      'POST /user/repos',
      'GET /repos/shipfast-test-user/a-product-website-for-atlas-html/git/ref/heads/main',
      'POST /repos/shipfast-test-user/a-product-website-for-atlas-html/git/trees',
      'POST /repos/shipfast-test-user/a-product-website-for-atlas-html/git/commits',
      'PATCH /repos/shipfast-test-user/a-product-website-for-atlas-html/git/refs/heads/main',
    ])
  })

  it('maps Convex ownership errors to forbidden responses', async () => {
    client.query.mockRejectedValueOnce(
      new Error('FORBIDDEN: You do not own this session'),
    )

    const response = await createGitHubPushResponse(
      new Request(
        'https://ship-fast.test/api/sessions/session_123/github/push',
        {
          method: 'POST',
          headers: { authorization: 'Bearer app-token' },
          body: JSON.stringify({
            target: 'html',
            githubAccessToken: 'ghp_test',
          }),
        },
      ),
      'session_123',
      env,
      client,
      vi.fn() as never,
    )

    expect(response.status).toBe(403)
  })
})
