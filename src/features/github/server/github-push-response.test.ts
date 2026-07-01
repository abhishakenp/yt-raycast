import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createGitHubPushResponse } from './github-push-response'

const env = {
  SHIP_FAST_GITHUB_API_BASE: 'https://github-api.test',
}

const client = {
  mutation: vi.fn(),
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
  artifact: {
    status: 'ready',
  },
  filesUrl: 'https://storage.test/html-files.json',
}

const htmlPrebuiltFiles = {
  'README.md':
    '# Atlas Notes\n\nGenerated with [ShipFast](https://ship-fast.io) 🚀.\n',
  'index.html': '<main>Atlas Notes</main>',
  'llms.txt': 'Atlas Notes',
  'robots.txt': 'User-agent: *',
  'sitemap.xml': '<urlset />',
}

const reactPrebuiltFiles = {
  ...htmlPrebuiltFiles,
  'package.json': '{"scripts":{"dev":"vite"}}',
  'vite.config.js': 'export default {}',
}

const lakebedPrebuiltFiles = {
  'README.md': '# Lakebed',
  'client/index.tsx': 'export const App = () => null',
  'server/index.ts': 'export default {}',
}

const filesUrlForTarget = (target: unknown): string =>
  target === 'react'
    ? 'https://storage.test/react-files.json'
    : target === 'lakebed'
      ? 'https://storage.test/lakebed-files.json'
      : 'https://storage.test/html-files.json'

const jwtFor = (sub = 'user_123') =>
  [
    Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url'),
    Buffer.from(JSON.stringify({ sub })).toString('base64url'),
    'signature',
  ].join('.')

function createGitHubFetch({ login = 'shipfast-test-user' } = {}) {
  const requests: Array<{ method: string; path: string; body: unknown }> = []
  const fetchMock: typeof fetch = async (url, init) => {
    const parsed = new URL(String(url))
    const body = init?.body ? JSON.parse(String(init.body)) : null
    const method = init?.method ?? 'GET'
    requests.push({ method, path: parsed.pathname, body })

    if (parsed.pathname === '/user') {
      return new Response(JSON.stringify({ login }))
    }

    if (method === 'POST' && parsed.pathname === '/user/repos') {
      return new Response(
        JSON.stringify({
          id: 42,
          name: body.name,
          full_name: `${login}/${body.name}`,
          html_url: `https://github.com/${login}/${body.name}`,
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
  }

  return { fetchMock, requests }
}

const unusedFetch: typeof fetch = async () =>
  new Response('Unexpected fetch', { status: 500 })

describe('createGitHubPushResponse', () => {
  beforeEach(() => {
    globalThis.fetch = unusedFetch
    globalThis.fetch = vi.fn(async (url: string | URL) => {
      const href = String(url)
      if (href === 'https://storage.test/html-files.json') {
        return Response.json(htmlPrebuiltFiles)
      }
      if (href === 'https://storage.test/react-files.json') {
        return Response.json(reactPrebuiltFiles)
      }
      if (href === 'https://storage.test/lakebed-files.json') {
        return Response.json(lakebedPrebuiltFiles)
      }
      return new Response('Unhandled storage fetch', { status: 404 })
    }) as typeof fetch
    client.query.mockReset().mockImplementation(async (_ref, args) => {
      if (args && 'lookup' in args) {
        return {
          ...exportData,
          target: args.target,
          filesUrl: filesUrlForTarget(args.target),
        }
      }
      return null
    })
    client.mutation.mockReset().mockResolvedValue({})
    client.setAuth.mockReset()
    tokenResolver
      .mockReset()
      .mockResolvedValue([{ token: 'ghp_test', scopes: ['repo'] }])
  })

  it('resolves GitHub tokens from the Convex GitHub connection by default', async () => {
    const { fetchMock } = createGitHubFetch()
    client.query.mockImplementation(async (_ref, args) => {
      if (args && 'lookup' in args) return exportData
      return { accessToken: 'ghp_from_convex', scopes: ['repo'] }
    })

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
      fetchMock,
    )

    expect(response.status).toBe(200)
    expect(client.query).toHaveBeenCalledWith(expect.anything(), {})
  })

  it('pushes with a real Convex GitHub connection shape without exposing token metadata', async () => {
    const { fetchMock } = createGitHubFetch({ login: 'abhishakenp' })
    const realConvexConnectionShape = {
      accessToken: 'gho_redacted_live_shape',
      clerkTokenIdentifier:
        'https://sweeping-leech-2.clerk.accounts.dev|user_3FfuCxvVvTRfufF3XVox7unK8w8',
      clerkUserId: 'user_3FfuCxvVvTRfufF3XVox7unK8w8',
      connectedAt: 1782485567549,
      githubLogin: 'abhishakenp',
      githubUserId: 290690087,
      scopes: ['repo'],
      updatedAt: 1782485567549,
    }
    client.query.mockImplementation(async (_ref, args) => {
      if (args && 'lookup' in args) return exportData
      return realConvexConnectionShape
    })

    const response = await createGitHubPushResponse(
      new Request(
        'https://ship-fast.test/api/sessions/session_123/github/push',
        {
          body: JSON.stringify({ target: 'html' }),
          headers: { authorization: `Bearer ${jwtFor()}` },
          method: 'POST',
        },
      ),
      'session_123',
      env,
      client,
      fetchMock,
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      ok: true,
      repoFullName: 'abhishakenp/a-product-website-for-atlas-html',
      target: 'html',
    })
    expect(JSON.stringify(body)).not.toContain('gho_redacted_live_shape')
    expect(JSON.stringify(body)).not.toContain('clerkTokenIdentifier')
    expect(JSON.stringify(body)).not.toContain('accessToken')
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
      fetchMock,
      tokenResolver,
    )

    expect(response.status).toBe(200)
    expect(client.setAuth).toHaveBeenCalledWith(jwtFor())
    expect(client.query).toHaveBeenCalledWith(expect.anything(), {
      lookup: 'session_123',
      target: 'html',
      anonymousOwnerSecret: 'owner-secret',
    })
    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      lookup: 'session_123',
      target: 'html',
      anonymousOwnerSecret: 'owner-secret',
      repoUrl:
        'https://github.com/shipfast-test-user/a-product-website-for-atlas-html',
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

  it('does not touch GitHub until prebuilt export files are ready', async () => {
    const { fetchMock, requests } = createGitHubFetch()
    client.query.mockResolvedValueOnce({
      ...exportData,
      artifact: { status: 'building' },
      filesUrl: null,
    })

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
      fetchMock,
      tokenResolver,
    )

    expect(response.status).toBe(202)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Export is still being prepared.',
      status: 'building',
    })
    expect(requests).toEqual([])
    expect(tokenResolver).not.toHaveBeenCalled()
    expect(client.mutation).not.toHaveBeenCalled()
  })

  it('surfaces failed prebuilt export artifacts before touching GitHub', async () => {
    const { fetchMock, requests } = createGitHubFetch()
    client.query.mockResolvedValueOnce({
      ...exportData,
      artifact: {
        errorMessage: 'Lakebed export failed.',
        status: 'failed',
      },
      filesUrl: null,
    })

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
      fetchMock,
      tokenResolver,
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Lakebed export failed.',
      status: 'failed',
    })
    expect(requests).toEqual([])
    expect(tokenResolver).not.toHaveBeenCalled()
    expect(client.mutation).not.toHaveBeenCalled()
  })

  it('pushes React target files when requested', async () => {
    const { fetchMock, requests } = createGitHubFetch()

    client.query.mockResolvedValueOnce({
      ...exportData,
      target: 'react',
      includeBadge: true,
      filesUrl: 'https://storage.test/react-files.json',
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
      fetchMock,
      tokenResolver,
    )

    expect(response.status).toBe(200)
    expect(client.query).toHaveBeenCalledWith(expect.anything(), {
      lookup: 'session_123',
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

  it('pushes Lakebed project files from the prebuilt artifact', async () => {
    const { fetchMock, requests } = createGitHubFetch()
    const lakebedExport = {
      ...exportData,
      target: 'lakebed',
      source: 'root = SaasHero()',
      siteSpecJson: '{"projectName":"Atlas Notes"}',
      previewHtml: '<main>Atlas Notes</main>',
      themeName: 'graphite',
      isDark: true,
      filesUrl: 'https://storage.test/lakebed-files.json',
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
      fetchMock,
      tokenResolver,
    )

    expect(response.status).toBe(200)
    expect(client.query).toHaveBeenCalledWith(expect.anything(), {
      lookup: 'session_123',
      target: 'lakebed',
      anonymousOwnerSecret: undefined,
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
      unusedFetch,
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
      unusedFetch,
    )

    expect(response.status).toBe(402)
    expect(await response.json()).toMatchObject({
      error: 'PAYMENT_REQUIRED: Subscribe before exporting',
    })
  })
})
