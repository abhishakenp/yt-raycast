// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GitHubPanel } from './GitHubPanel'
import { persistAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

const authState = vi.hoisted(() => ({
  getToken: vi.fn(async () => 'app-token'),
  openSignIn: vi.fn(),
}))

type MockGitHubTarget = {
  target: 'html' | 'react' | 'next' | 'lakebed'
  label: string
  ready: boolean
  status: string
  requiresPayment: boolean
  fileCount: number | null
  artifactReady?: boolean
  artifactStatus?: string
  artifactError?: string
  githubUrl?: string | null
  githubRepoUrl?: string | null
}

const exportTargetsState = vi.hoisted(() => ({
  value: {
    targets: Array<MockGitHubTarget>(),
  },
  ensureExportArtifact: vi.fn(async () => ({
    target: 'html',
    status: 'queued',
    previewVersion: 2,
  })),
}))

vi.mock('convex/react', () => ({
  useMutation: () => exportTargetsState.ensureExportArtifact,
  useQuery: () => exportTargetsState.value,
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

const setExportTargets = (targets: MockGitHubTarget[]) => {
  exportTargetsState.value = { targets }
}

const createStorage = () => {
  const values = new Map<string, string>()
  return {
    clear: vi.fn(() => values.clear()),
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    removeItem: vi.fn((key: string) => values.delete(key)),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value)
    }),
  }
}

const installBrowserStorage = () => {
  const local = createStorage()
  const session = createStorage()
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: local,
  })
  Object.defineProperty(window, 'sessionStorage', {
    configurable: true,
    value: session,
  })
  vi.stubGlobal('localStorage', local)
  vi.stubGlobal('sessionStorage', session)
}

describe('GitHubPanel', () => {
  beforeEach(() => {
    installBrowserStorage()
    authState.getToken.mockClear()
    authState.openSignIn.mockClear()
    exportTargetsState.ensureExportArtifact.mockClear()
    setExportTargets([])
    localStorage.clear()
    sessionStorage.clear()
    vi.spyOn(window, 'open').mockImplementation(() => null)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('pushes after a clicked building artifact becomes ready', async () => {
    setExportTargets([
      {
        target: 'html',
        label: 'HTML',
        ready: false,
        status: 'available',
        requiresPayment: false,
        fileCount: null,
        artifactReady: false,
        artifactStatus: 'building',
      },
    ])
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      void init
      const path = String(url)

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

    const view = render(<GitHubPanel sessionId="session_123" />)
    const { getByText } = view

    await waitFor(() => expect(getByText('HTML')).toBeTruthy())
    const button = getByText('HTML').closest('button')
    expect(button).toBeTruthy()
    expect(view.queryByText('72%')).toBeNull()
    if (button) fireEvent.click(button)

    await waitFor(() => {
      expect(
        document.querySelector('[data-github-action="html"] .animate-spin'),
      ).toBeTruthy()
    })
    expect(
      document.querySelector('.export-target-glyph .animate-spin'),
    ).toBeNull()
    expect(getByText('72%')).toBeTruthy()
    expect(button?.style.backgroundImage).toContain('110deg')

    await new Promise((resolve) => window.setTimeout(resolve, 650))

    expect(exportTargetsState.ensureExportArtifact).toHaveBeenCalledWith({
      lookup: 'session_123',
      target: 'html',
      anonymousOwnerSecret: 'owner-secret',
    })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(authState.getToken).not.toHaveBeenCalled()
    expect(getByText('72%')).toBeTruthy()
    expect(
      document.querySelector('[data-github-action="html"] .animate-spin'),
    ).toBeTruthy()
    expect(document.body.textContent).not.toContain('Push To GitHub')
    expect(document.body.textContent).not.toContain('Preparing')
    expect(document.body.textContent).not.toContain('building')

    setExportTargets([
      {
        target: 'html',
        label: 'HTML',
        ready: false,
        status: 'available',
        requiresPayment: false,
        fileCount: null,
        artifactReady: true,
        artifactStatus: 'ready',
      },
    ])
    view.rerender(<GitHubPanel sessionId="session_123" />)

    await waitFor(() => {
      expect(
        document.querySelector('[data-github-action="html"] .animate-spin'),
      ).toBeNull()
    })
    expect(view.queryByText('72%')).toBeNull()
    await waitFor(() =>
      expect(window.open).toHaveBeenCalledWith(
        'https://github.com/acme/site',
        '_blank',
        'noopener,noreferrer',
      ),
    )
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      '/api/sessions/session_123/export',
      '/api/sessions/session_123/github/push',
    ])
    expect(document.body.textContent).not.toContain(
      'https://github.com/acme/site',
    )
  })

  it('creates an entitlement before pushing once the artifact is ready', async () => {
    setExportTargets([
      {
        target: 'html',
        label: 'HTML',
        ready: false,
        status: 'available',
        requiresPayment: false,
        fileCount: null,
        artifactReady: true,
        artifactStatus: 'ready',
      },
    ])
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      void init
      const path = String(url)

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
    expect(document.body.textContent).not.toContain('5 files ready')
    const button = getByText('HTML').closest('button')
    expect(button).toBeTruthy()
    if (button) fireEvent.click(button)

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
    expect(window.open).toHaveBeenCalledWith(
      'https://github.com/acme/site',
      '_blank',
      'noopener,noreferrer',
    )

    fetchMock.mockClear()
    vi.mocked(window.open).mockClear()
    if (button) fireEvent.click(button)

    expect(fetchMock).not.toHaveBeenCalled()
    expect(window.open).toHaveBeenCalledWith(
      'https://github.com/acme/site',
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('shows an error when a clicked building artifact fails', async () => {
    setExportTargets([
      {
        target: 'lakebed',
        label: 'Lakebed',
        ready: false,
        status: 'available',
        requiresPayment: false,
        fileCount: null,
        artifactReady: false,
        artifactStatus: 'building',
      },
    ])
    vi.stubGlobal('fetch', vi.fn())

    const view = render(<GitHubPanel sessionId="session_123" />)

    await waitFor(() => expect(view.getByText('Lakebed')).toBeTruthy())
    const button = view.getByText('Lakebed').closest('button')
    expect(button).toBeTruthy()
    if (button) fireEvent.click(button)

    await waitFor(() => {
      expect(
        document.querySelector('[data-github-action="lakebed"] .animate-spin'),
      ).toBeTruthy()
    })

    setExportTargets([
      {
        target: 'lakebed',
        label: 'Lakebed',
        ready: false,
        status: 'available',
        requiresPayment: false,
        fileCount: null,
        artifactReady: false,
        artifactStatus: 'failed',
        artifactError: 'Lakebed export failed.',
      },
    ])
    view.rerender(<GitHubPanel sessionId="session_123" />)

    await waitFor(() =>
      expect(view.getAllByText('Lakebed export failed.')).toHaveLength(2),
    )
    expect(
      document.querySelector('[data-github-action="lakebed"] .animate-spin'),
    ).toBeNull()
  })

  it('opens a persisted GitHub repo URL after reload without pushing again', async () => {
    setExportTargets([
      {
        target: 'react',
        label: 'React',
        ready: true,
        status: 'ready',
        requiresPayment: false,
        fileCount: 7,
        artifactReady: true,
        artifactStatus: 'ready',
        githubUrl: 'https://github.com/acme/react-site',
      },
    ])
    const fetchMock = vi.fn(async () =>
      Response.json({ error: 'unexpected' }, { status: 500 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { getByText } = render(<GitHubPanel sessionId="session_123" />)

    await waitFor(() => expect(getByText('React')).toBeTruthy())
    const button = getByText('React').closest('button')
    expect(button).toBeTruthy()
    if (button) fireEvent.click(button)

    expect(fetchMock).not.toHaveBeenCalled()
    expect(authState.getToken).not.toHaveBeenCalled()
    expect(window.open).toHaveBeenCalledWith(
      'https://github.com/acme/react-site',
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('continues the same click when Convex reports a pending artifact is ready', async () => {
    setExportTargets([
      {
        target: 'html',
        label: 'HTML',
        ready: false,
        status: 'available',
        requiresPayment: false,
        fileCount: null,
        artifactReady: false,
        artifactStatus: 'building',
      },
    ])
    exportTargetsState.ensureExportArtifact.mockResolvedValueOnce({
      target: 'html',
      status: 'ready',
      previewVersion: 2,
    })
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      void init
      const path = String(url)

      if (path.endsWith('/export')) {
        return Response.json({ ok: true, downloadUrl: '/download/html' })
      }

      if (path.endsWith('/github/push')) {
        return Response.json({ repoUrl: 'https://github.com/acme/site' })
      }

      return Response.json({ error: `Unexpected ${path}` }, { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const { getByText } = render(<GitHubPanel sessionId="session_123" />)

    await waitFor(() => expect(getByText('HTML')).toBeTruthy())
    const button = getByText('HTML').closest('button')
    expect(button).toBeTruthy()
    if (button) fireEvent.click(button)

    await waitFor(() =>
      expect(window.open).toHaveBeenCalledWith(
        'https://github.com/acme/site',
        '_blank',
        'noopener,noreferrer',
      ),
    )
    expect(exportTargetsState.ensureExportArtifact).toHaveBeenCalledWith({
      lookup: 'session_123',
      target: 'html',
      anonymousOwnerSecret: undefined,
    })
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      '/api/sessions/session_123/export',
      '/api/sessions/session_123/github/push',
    ])
  })

  it('redirects to direct GitHub OAuth when the push route reports no connection', async () => {
    setExportTargets([
      {
        target: 'next',
        label: 'Next.js',
        ready: true,
        status: 'ready',
        requiresPayment: false,
        fileCount: 8,
        artifactReady: true,
        artifactStatus: 'ready',
      },
    ])
    const assignMock = vi.fn()
    vi.stubGlobal('location', {
      ...window.location,
      href: 'http://localhost:3000/generate/session_456',
      assign: assignMock,
    })
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const path = String(url)

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
    const button = getByText('Next.js').closest('button')
    expect(button).toBeTruthy()
    if (button) fireEvent.click(button)

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
    setExportTargets([
      {
        target: 'html',
        label: 'HTML',
        ready: true,
        status: 'ready',
        requiresPayment: false,
        fileCount: 5,
        artifactReady: true,
        artifactStatus: 'ready',
      },
    ])
    sessionStorage.setItem(
      'ship-fast:github-pending-push',
      JSON.stringify({ sessionId: 'session_999', target: 'html' }),
    )
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      void init
      const path = String(url)

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
