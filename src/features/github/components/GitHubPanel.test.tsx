// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GitHubPanel } from './GitHubPanel'
import { persistAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

const authState = vi.hoisted(() => ({
  getToken: vi.fn(async () => 'app-token'),
  openSignIn: vi.fn(),
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  useOptionalAuth: () => ({
    getToken: authState.getToken,
    isSignedIn: true,
  }),
  useOptionalClerk: () => ({
    openSignIn: authState.openSignIn,
    session: null,
    user: null,
  }),
}))

const readGitHubPanelSource = () =>
  readFileSync(
    join(process.cwd(), 'src/features/github/components/GitHubPanel.tsx'),
    'utf8',
  )

describe('GitHubPanel source invariants', () => {
  beforeEach(() => {
    authState.getToken.mockClear()
    authState.openSignIn.mockClear()
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('uses direct GitHub OAuth integration instead of Clerk account linking', () => {
    const source = readGitHubPanelSource()

    expect(source).toContain(
      "const githubTargets = ['html', 'react', 'next', 'lakebed'] as const",
    )
    expect(source).toContain("target === 'lakebed'")
    expect(source).toContain(
      'Push the full generated project to your private GitHub repo.',
    )
    expect(source).toContain("fetch('/api/github/connect/start'")
    expect(source).toContain("data?.code === 'GITHUB_NOT_CONNECTED'")
    expect(source).toContain("data?.code === 'GITHUB_REPO_SCOPE_REQUIRED'")
    expect(source).toContain('window.location.assign(data.url)')
    expect(source).not.toContain('createExternalAccount')
    expect(source).not.toContain('reauthorize')
    expect(source).not.toContain('useReverification')
    expect(source).not.toContain("strategy: 'oauth_github'")
    expect(source).not.toContain('approvedScopes')
    expect(source).not.toContain('openUserProfile')
    expect(source).not.toContain('firebase')
    expect(source).not.toContain('repoName')
    expect(source).not.toContain('branchName')
    expect(source).not.toContain('<input')
    expect(source).not.toContain('<select')
  })

  it('keeps signed-in and Clerk token checks before pushing', () => {
    const source = readGitHubPanelSource()
    const pushTargetBlock = source.slice(
      source.indexOf('const pushTarget = async'),
      source.indexOf('const visibleTargets ='),
    )

    expect(pushTargetBlock).toContain('if (!auth.isSignedIn)')
    expect(pushTargetBlock).toContain(
      "setError('Sign in before pushing to GitHub.')",
    )
    expect(pushTargetBlock).toContain(
      "const appToken = await auth.getToken({ template: 'convex' })",
    )
    expect(pushTargetBlock).toContain(
      "if (!appToken) throw new Error('Sign in before pushing to GitHub.')",
    )
    expect(pushTargetBlock).toContain('Authorization: `Bearer ${appToken}`')
  })

  it('builds a missing or stale export before pushing to GitHub', () => {
    const source = readGitHubPanelSource()
    const createExportBlock = source.slice(
      source.indexOf('const createExportForGitHub = async'),
      source.indexOf('const pushTarget = async'),
    )
    const pushTargetBlock = source.slice(
      source.indexOf('const pushTarget = async'),
      source.indexOf('const visibleTargets ='),
    )

    expect(source).not.toContain('Generate this export before pushing')
    expect(createExportBlock).toContain(
      'fetch(`/api/sessions/${sessionId}/export`',
    )
    expect(createExportBlock).toContain('Authorization: `Bearer ${appToken}`')
    expect(createExportBlock).toContain(
      'body: JSON.stringify({ target, anonymousOwnerSecret })',
    )
    expect(createExportBlock).toContain('await loadTargets()')
    expect(pushTargetBlock).toContain(
      'const anonymousOwnerSecret = readOwnerSecret(sessionId)',
    )
    expect(pushTargetBlock).toContain('if (!item.ready)')
    expect(pushTargetBlock).toContain('anonymousOwnerSecret')
    expect(pushTargetBlock.indexOf('await createExportForGitHub')).toBeLessThan(
      pushTargetBlock.indexOf('fetch(`/api/sessions/${sessionId}/github/push`'),
    )
  })

  it('auto-builds a missing export before pushing the target', async () => {
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      void init
      const path = String(url)

      if (path.endsWith('/export-targets')) {
        return Response.json({
          targets: [
            {
              target: 'html',
              label: 'HTML',
              ready: false,
              status: 'available',
              requiresPayment: false,
              fileCount: null,
            },
          ],
        })
      }

      if (path.endsWith('/export')) {
        return Response.json({ ok: true, downloadUrl: '/download/html' })
      }

      if (path.endsWith('/github/push')) {
        return Response.json({ repoUrl: 'https://github.com/acme/site' })
      }

      return Response.json({ error: `Unexpected ${path}` }, { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)
    persistAnonymousOwnerSecret(
      window.localStorage,
      'session_123',
      'owner-secret',
    )

    const { getByText } = render(<GitHubPanel sessionId="session_123" />)

    await waitFor(() => expect(getByText('HTML')).toBeTruthy())
    fireEvent.click(getByText('HTML').closest('button') as HTMLButtonElement)

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sessions/session_123/github/push',
        expect.anything(),
      ),
    )

    const exportCallIndex = fetchMock.mock.calls.findIndex(([url]) =>
      String(url).endsWith('/export'),
    )
    const pushCallIndex = fetchMock.mock.calls.findIndex(([url]) =>
      String(url).endsWith('/github/push'),
    )
    expect(exportCallIndex).toBeGreaterThan(-1)
    expect(pushCallIndex).toBeGreaterThan(exportCallIndex)
    expect(fetchMock.mock.calls[exportCallIndex]?.[1]).toMatchObject({
      method: 'POST',
      headers: {
        Authorization: 'Bearer app-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: 'html',
        anonymousOwnerSecret: 'owner-secret',
      }),
    })
    expect(fetchMock.mock.calls[pushCallIndex]?.[1]).toMatchObject({
      method: 'POST',
      headers: {
        Authorization: 'Bearer app-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: 'html',
        anonymousOwnerSecret: 'owner-secret',
      }),
    })
    expect(authState.getToken).toHaveBeenCalledWith({ template: 'convex' })
  })

  it('redirects to direct GitHub OAuth when the push route reports no connection', async () => {
    const assignMock = vi.fn()
    vi.stubGlobal('location', {
      ...window.location,
      href: 'http://localhost:3000/generate/session_456',
      assign: assignMock,
    })
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const path = String(url)

      if (path.endsWith('/export-targets')) {
        return Response.json({
          targets: [
            {
              target: 'next',
              label: 'Next.js',
              ready: true,
              status: 'ready',
              requiresPayment: false,
              fileCount: 8,
            },
          ],
        })
      }

      if (path.endsWith('/github/push')) {
        return Response.json(
          {
            code: 'GITHUB_NOT_CONNECTED',
            error: 'Connect GitHub before pushing.',
          },
          { status: 409 },
        )
      }

      if (path === '/api/github/connect/start') {
        expect(init).toMatchObject({
          method: 'POST',
          headers: {
            Authorization: 'Bearer app-token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: 'session_456',
            target: 'next',
            returnTo: 'http://localhost:3000/generate/session_456',
          }),
        })
        return Response.json({
          url: 'https://github.com/login/oauth/authorize?client_id=test&scope=repo',
        })
      }

      return Response.json({ error: `Unexpected ${path}` }, { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const { getByText } = render(<GitHubPanel sessionId="session_456" />)

    await waitFor(() => expect(getByText('Next.js')).toBeTruthy())
    fireEvent.click(getByText('Next.js').closest('button') as HTMLButtonElement)

    await waitFor(() =>
      expect(assignMock).toHaveBeenCalledWith(
        'https://github.com/login/oauth/authorize?client_id=test&scope=repo',
      ),
    )
    expect(sessionStorage.getItem('ship-fast:github-pending-push')).toBe(
      JSON.stringify({ sessionId: 'session_456', target: 'next' }),
    )
  })

  it('auto-retries the pending GitHub push after returning from OAuth', async () => {
    sessionStorage.setItem(
      'ship-fast:github-pending-push',
      JSON.stringify({ sessionId: 'session_999', target: 'html' }),
    )
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      void init
      const path = String(url)

      if (path.endsWith('/export-targets')) {
        return Response.json({
          targets: [
            {
              target: 'html',
              label: 'HTML',
              ready: true,
              status: 'ready',
              requiresPayment: false,
              fileCount: 5,
            },
          ],
        })
      }

      if (path.endsWith('/github/push')) {
        return Response.json({ repoUrl: 'https://github.com/acme/site' })
      }

      return Response.json({ error: `Unexpected ${path}` }, { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const { getByText } = render(<GitHubPanel sessionId="session_999" />)

    await waitFor(() => expect(getByText('HTML')).toBeTruthy())
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sessions/session_999/github/push',
        expect.anything(),
      ),
    )
    expect(sessionStorage.getItem('ship-fast:github-pending-push')).toBeNull()
  })
})
