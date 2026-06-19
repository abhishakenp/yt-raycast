import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { beforeEach, describe, expect, it, vi } from 'vitest'

const buildOpenUILakebedProjectFilesMock = vi.hoisted(() => vi.fn())

vi.mock('@/features/exports/services/openui-lakebed-export-builder', () => ({
  buildOpenUILakebedProjectFiles: buildOpenUILakebedProjectFilesMock,
}))

import { createGitHubPushResponse } from './github-push-response'

const env = {
  SHIP_FAST_GITHUB_API_BASE: 'https://github-api.test',
}

const client = {
  query: vi.fn(),
  setAuth: vi.fn(),
}

const tokenResolver = vi.fn(async () => [
  { token: 'ghp_test', scopes: ['repo'] },
])

const exportData = {
  sessionId: 'session_123',
  prompt: 'A product website for Atlas Notes',
  target: 'html',
  previewVersion: 3,
  html: '<html><body><h1>Atlas Notes</h1></body></html>',
  includeBadge: false,
}

const jwtFor = (sub = 'user_123') =>
  [
    Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url'),
    Buffer.from(JSON.stringify({ sub })).toString('base64url'),
    'signature',
  ].join('.')

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

    if (method === 'GET' && /\/git\/ref\/heads\/main$/.test(parsed.pathname)) {
      return new Response(
        JSON.stringify({ ref: 'refs/heads/main', object: { sha: 'base-sha' } }),
      )
    }

    if (method === 'POST' && /\/git\/trees$/.test(parsed.pathname)) {
      return new Response(JSON.stringify({ sha: 'tree-sha' }), { status: 201 })
    }

    if (method === 'POST' && /\/git\/commits$/.test(parsed.pathname)) {
      return new Response(JSON.stringify({ sha: 'commit-sha' }), {
        status: 201,
      })
    }

    if (
      method === 'PATCH' &&
      /\/git\/refs\/heads\/main$/.test(parsed.pathname)
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
    client.query.mockReset().mockImplementation(async (_ref, args) => {
      if (args && 'sessionId' in args) return exportData
      return null
    })
    client.setAuth.mockReset()
    tokenResolver
      .mockReset()
      .mockResolvedValue([{ token: 'ghp_test', scopes: ['repo'] }])
    buildOpenUILakebedProjectFilesMock.mockReset().mockResolvedValue({
      files: {
        'README.md': '# Lakebed',
        'client/index.tsx': 'export const App = () => null',
        'server/index.ts': 'export default {}',
      },
      fileCount: 3,
      filename: 'atlas-notes-lakebed.zip',
      projectName: 'Atlas Notes',
    })
  })

  it('resolves GitHub tokens from Convex integration state, not Clerk', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/features/github/server/github-push-response.ts'),
      'utf8',
    )

    expect(source).toContain('api.github.getConnectionForCurrentUser')
    expect(source).not.toContain('createClerkClient')
    expect(source).not.toContain('getUserOauthAccessToken')
    expect(source).not.toContain('decodeClerkUserId')
    expect(source).not.toContain('CLERK_SECRET_REQUIRED')
  })

  it('requires app authentication and connected GitHub', async () => {
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

    tokenResolver.mockResolvedValueOnce([])
    const missingConnection = await createGitHubPushResponse(
      new Request(
        'https://ship-fast.test/api/sessions/session_123/github/push',
        {
          method: 'POST',
          headers: { authorization: `Bearer ${jwtFor()}` },
          body: JSON.stringify({
            target: 'html',
            anonymousOwnerSecret: 'owner-secret',
          }),
        },
      ),
      'session_123',
      env,
      client,
      undefined,
      tokenResolver,
    )
    expect(missingConnection.status).toBe(409)
    expect(await missingConnection.json()).toMatchObject({
      code: 'GITHUB_NOT_CONNECTED',
      error: 'Connect GitHub before pushing.',
    })
    expect(tokenResolver).toHaveBeenCalledWith(jwtFor(), env, client)
  })

  it('requires GitHub repo scope before pushing', async () => {
    tokenResolver.mockResolvedValueOnce([
      { token: 'ghp_readonly', scopes: ['read:user'] },
    ])

    const response = await createGitHubPushResponse(
      new Request(
        'https://ship-fast.test/api/sessions/session_123/github/push',
        {
          method: 'POST',
          headers: { authorization: `Bearer ${jwtFor()}` },
          body: JSON.stringify({
            target: 'html',
            anonymousOwnerSecret: 'owner-secret',
          }),
        },
      ),
      'session_123',
      env,
      client,
      undefined,
      tokenResolver,
    )

    expect(response.status).toBe(409)
    expect(await response.json()).toMatchObject({
      code: 'GITHUB_REPO_SCOPE_REQUIRED',
      error: 'Connect GitHub with repo access before pushing.',
    })
  })

  it('pushes owner export files to a private GitHub repository', async () => {
    const { fetchMock, requests } = createGitHubFetch()

    const response = await createGitHubPushResponse(
      new Request(
        'https://ship-fast.test/api/sessions/session_123/github/push',
        {
          method: 'POST',
          headers: { authorization: `Bearer ${jwtFor()}` },
          body: JSON.stringify({
            target: 'html',
            anonymousOwnerSecret: 'owner-secret',
          }),
        },
      ),
      'session_123',
      env,
      client,
      fetchMock as never,
      tokenResolver,
    )

    expect(response.status).toBe(200)
    expect(client.setAuth).toHaveBeenCalledWith(jwtFor())
    expect(client.query).toHaveBeenCalledWith(expect.anything(), {
      sessionId: 'session_123',
      target: 'html',
      anonymousOwnerSecret: 'owner-secret',
    })
    expect(tokenResolver).toHaveBeenCalledWith(jwtFor(), env, client)
    expect(await response.json()).toMatchObject({
      ok: true,
      target: 'html',
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

  it('pushes React target files when requested', async () => {
    const { fetchMock, requests } = createGitHubFetch()

    client.query.mockResolvedValueOnce({
      ...exportData,
      target: 'react',
      includeBadge: true,
    })

    const response = await createGitHubPushResponse(
      new Request(
        'https://ship-fast.test/api/sessions/session_123/github/push',
        {
          method: 'POST',
          headers: { authorization: `Bearer ${jwtFor()}` },
          body: JSON.stringify({ target: 'react' }),
        },
      ),
      'session_123',
      env,
      client,
      fetchMock as never,
      tokenResolver,
    )

    expect(response.status).toBe(200)
    expect(client.query).toHaveBeenCalledWith(expect.anything(), {
      sessionId: 'session_123',
      target: 'react',
      anonymousOwnerSecret: undefined,
    })
    expect(await response.json()).toMatchObject({
      ok: true,
      target: 'react',
      repoFullName: 'shipfast-test-user/a-product-website-for-atlas-react',
      files: [
        'README.md',
        'index.html',
        'llms.txt',
        'package.json',
        'robots.txt',
        'sitemap.xml',
        'vite.config.js',
      ],
    })

    const createRepoRequest = requests.find(
      (request) => request.method === 'POST' && request.path === '/user/repos',
    )
    expect(createRepoRequest?.body).toMatchObject({
      name: 'a-product-website-for-atlas-react',
      description: 'Generated with Ship Fast as a react export.',
    })

    const commitRequest = requests.find((request) =>
      request.path.endsWith('/git/commits'),
    )
    expect(commitRequest?.body).toMatchObject({
      message: 'Ship Fast export (react)',
    })
  })

  it('pushes Lakebed project files from the in-memory Lakebed builder', async () => {
    const { fetchMock, requests } = createGitHubFetch()
    const lakebedExport = {
      ...exportData,
      target: 'lakebed',
      source: 'root = SaasKimiPage("Atlas Notes")',
      siteSpecJson: '{"projectName":"Atlas Notes"}',
      previewHtml: '<main>Atlas Notes</main>',
      themeName: 'graphite',
      isDark: true,
    }

    client.query.mockResolvedValueOnce(lakebedExport)

    const response = await createGitHubPushResponse(
      new Request(
        'https://ship-fast.test/api/sessions/session_123/github/push',
        {
          method: 'POST',
          headers: { authorization: `Bearer ${jwtFor()}` },
          body: JSON.stringify({ target: 'lakebed' }),
        },
      ),
      'session_123',
      env,
      client,
      fetchMock as never,
      tokenResolver,
    )

    expect(response.status).toBe(200)
    expect(client.query).toHaveBeenCalledWith(expect.anything(), {
      sessionId: 'session_123',
      target: 'lakebed',
      anonymousOwnerSecret: undefined,
    })
    expect(buildOpenUILakebedProjectFilesMock).toHaveBeenCalledWith({
      source: lakebedExport.source,
      siteSpecJson: lakebedExport.siteSpecJson,
      previewHtml: lakebedExport.previewHtml,
      sessionId: 'session_123',
      target: 'lakebed',
      includeBadge: false,
      themeName: 'graphite',
      isDark: true,
    })
    expect(await response.json()).toMatchObject({
      ok: true,
      target: 'lakebed',
      repoFullName: 'shipfast-test-user/a-product-website-for-atlas-lakebed',
      files: ['README.md', 'client/index.tsx', 'server/index.ts'],
      fileCount: 3,
    })

    const treeRequest = requests.find((request) =>
      request.path.endsWith('/git/trees'),
    )
    const treeEntries = (treeRequest?.body as { tree: Array<{ path: string }> })
      .tree
    expect(treeEntries.map((entry) => entry.path).sort()).toEqual([
      'README.md',
      'client/index.tsx',
      'server/index.ts',
    ])

    const commitRequest = requests.find((request) =>
      request.path.endsWith('/git/commits'),
    )
    expect(commitRequest?.body).toMatchObject({
      message: 'Ship Fast export (lakebed)',
    })
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
          headers: { authorization: `Bearer ${jwtFor()}` },
          body: JSON.stringify({ target: 'html' }),
        },
      ),
      'session_123',
      env,
      client,
      vi.fn() as never,
    )

    expect(response.status).toBe(403)
  })

  it('maps missing paid export access to an actionable payment response', async () => {
    client.query.mockRejectedValueOnce(
      new Error('PAYMENT_REQUIRED: Subscribe before exporting'),
    )

    const response = await createGitHubPushResponse(
      new Request(
        'https://ship-fast.test/api/sessions/session_123/github/push',
        {
          method: 'POST',
          headers: { authorization: `Bearer ${jwtFor()}` },
          body: JSON.stringify({ target: 'html' }),
        },
      ),
      'session_123',
      env,
      client,
      vi.fn() as never,
    )

    expect(response.status).toBe(402)
    expect(await response.json()).toMatchObject({
      error: 'PAYMENT_REQUIRED: Subscribe before exporting',
    })
  })
})
