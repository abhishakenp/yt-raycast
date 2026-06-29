// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GitHubPanel } from './GitHubPanel'
import { persistAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

/**
 * Behavioral tests for GitHubPanel that mount the real component, drive it
 * with mocked Convex queries/mutations + fetch, and assert observable UI.
 */

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
  previewVersion?: number | null
  currentPreviewVersion?: number | null
}

const exportTargetsState = vi.hoisted(() => ({
  value: undefined as { targets: MockGitHubTarget[] } | undefined,
  ensureExportArtifact: vi.fn(async () => ({
    target: 'html' as const,
    status: 'ready',
    previewVersion: 2,
  })),
}))

vi.mock('convex/react', () => ({
  useMutation: () => exportTargetsState.ensureExportArtifact,
  useQuery: () => exportTargetsState.value,
}))

vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      getExportTargets: 'sessions.getExportTargets',
      ensureExportArtifactByLookup: 'sessions.ensureExportArtifactByLookup',
    },
  },
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

const setLoading = () => {
  exportTargetsState.value = undefined
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

const readyTarget = (
  overrides: Partial<MockGitHubTarget> = {},
): MockGitHubTarget => ({
  target: 'html',
  label: 'HTML',
  ready: true,
  status: 'ready',
  requiresPayment: false,
  fileCount: 5,
  artifactReady: true,
  artifactStatus: 'ready',
  ...overrides,
})

const pushOkResponse = () =>
  Response.json({ repoUrl: 'https://github.com/acme/site' })

const pushFlowFetch = (overrides?: {
  push?: (init?: RequestInit) => Response
  export?: (init?: RequestInit) => Response
}) =>
  vi.fn(async (url: string | URL, init?: RequestInit) => {
    const path = String(url)
    if (path.endsWith('/export')) {
      return overrides?.export
        ? overrides.export(init)
        : Response.json({ ok: true, downloadUrl: '/download/html' })
    }
    if (path.endsWith('/github/push')) {
      return overrides?.push ? overrides.push(init) : pushOkResponse()
    }
    return Response.json({ error: `Unexpected ${path}` }, { status: 500 })
  })

describe('GitHubPanel (behavioral)', () => {
  beforeEach(() => {
    installBrowserStorage()
    authState.getToken.mockClear()
    authState.openSignIn.mockClear()
    exportTargetsState.ensureExportArtifact.mockReset()
    exportTargetsState.ensureExportArtifact.mockResolvedValue({
      target: 'html',
      status: 'ready',
      previewVersion: 2,
    })
    setLoading()
    localStorage.clear()
    sessionStorage.clear()
    vi.spyOn(window, 'open').mockImplementation(() => null)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('1. shows all four GitHub targets (HTML, React, Next.js, Lakebed) with icons', () => {
    setExportTargets([
      readyTarget({ target: 'html', label: 'HTML' }),
      readyTarget({ target: 'react', label: 'React' }),
      readyTarget({ target: 'next', label: 'Next.js' }),
      readyTarget({ target: 'lakebed', label: 'Lakebed' }),
    ])

    const { getByText } = render(<GitHubPanel sessionId="session_1" />)

    expect(getByText('HTML')).toBeTruthy()
    expect(getByText('React')).toBeTruthy()
    expect(getByText('Next.js')).toBeTruthy()
    expect(getByText('Lakebed')).toBeTruthy()

    const targets = document.querySelectorAll('[data-github-target]')
    expect(targets).toHaveLength(4)
    expect(targets[0].getAttribute('data-github-target')).toBe('html')
    expect(targets[1].getAttribute('data-github-target')).toBe('react')
    expect(targets[2].getAttribute('data-github-target')).toBe('next')
    expect(targets[3].getAttribute('data-github-target')).toBe('lakebed')

    // Each row renders an icon glyph inside the export-target-glyph span.
    const glyphs = document.querySelectorAll('.export-target-glyph svg')
    expect(glyphs).toHaveLength(4)
  })

  it('2. shows a push (GitHub) action button when a target has not been pushed yet', () => {
    setExportTargets([
      readyTarget({ target: 'html', label: 'HTML', githubUrl: null }),
    ])

    render(<GitHubPanel sessionId="session_1" />)

    const button = document.querySelector(
      '[data-github-target="html"]',
    ) as HTMLButtonElement
    expect(button).toBeTruthy()
    expect(button.disabled).toBe(false)

    // No repo URL yet -> the action icon is the GitHub mark, not an external link.
    const action = document.querySelector(
      '[data-github-action="html"]',
    ) as HTMLElement
    expect(action.querySelector('.lucide-github')).toBeTruthy()
    expect(action.querySelector('.lucide-external-link')).toBeNull()
  })

  it('3. clicking the push button triggers the push flow (calls the push endpoint)', async () => {
    setExportTargets([
      readyTarget({ target: 'html', label: 'HTML', githubUrl: null }),
    ])
    const fetchMock = pushFlowFetch()
    vi.stubGlobal('fetch', fetchMock)
    persistAnonymousOwnerSecret(
      window.localStorage,
      'session_1',
      'owner-secret',
    )

    const { getByText } = render(<GitHubPanel sessionId="session_1" />)
    await waitFor(() => expect(getByText('HTML')).toBeTruthy())

    const button = getByText('HTML').closest('button')
    expect(button).toBeTruthy()
    if (button) fireEvent.click(button)

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sessions/session_1/github/push',
        expect.anything(),
      ),
    )
    // The mutation is wired through useMutation and available for the build path.
    expect(exportTargetsState.ensureExportArtifact).not.toHaveBeenCalled()
  })

  it('4. after a successful push, shows the GitHub repo URL as a clickable action', async () => {
    setExportTargets([
      readyTarget({ target: 'html', label: 'HTML', githubUrl: null }),
    ])
    const fetchMock = pushFlowFetch()
    vi.stubGlobal('fetch', fetchMock)

    const { getByText } = render(<GitHubPanel sessionId="session_1" />)
    await waitFor(() => expect(getByText('HTML')).toBeTruthy())

    const button = getByText('HTML').closest('button')!
    fireEvent.click(button)

    await waitFor(() =>
      expect(window.open).toHaveBeenCalledWith(
        'https://github.com/acme/site',
        '_blank',
        'noopener,noreferrer',
      ),
    )

    // After the push resolves, the action icon switches to an external link,
    // indicating the repo URL is now available and clickable.
    await waitFor(() => {
      const action = document.querySelector(
        '[data-github-action="html"]',
      ) as HTMLElement
      expect(action.querySelector('.lucide-external-link')).toBeTruthy()
    })

    // Clicking again re-opens the same repo URL without re-pushing.
    vi.mocked(window.open).mockClear()
    fetchMock.mockClear()
    fireEvent.click(button)
    expect(fetchMock).not.toHaveBeenCalled()
    await waitFor(() =>
      expect(window.open).toHaveBeenCalledWith(
        'https://github.com/acme/site',
        '_blank',
        'noopener,noreferrer',
      ),
    )
  })

  it('5. pending push state shows a "Pushing Repository..." indicator with a spinner', async () => {
    setExportTargets([
      readyTarget({ target: 'html', label: 'HTML', githubUrl: null }),
    ])
    // A fetch that stays pending until we resolve it, so we can observe the
    // intermediate "pushing" state.
    let resolvePush!: (value: Response) => void
    const pushPromise = new Promise<Response>((resolve) => {
      resolvePush = resolve
    })
    const fetchMock = vi.fn(async (url: string | URL) => {
      const path = String(url)
      if (path.endsWith('/github/push')) return pushPromise
      return Response.json({ ok: true })
    })
    vi.stubGlobal('fetch', fetchMock)

    const { getByText } = render(<GitHubPanel sessionId="session_1" />)
    await waitFor(() => expect(getByText('HTML')).toBeTruthy())

    const button = getByText('HTML').closest('button')!
    fireEvent.click(button)

    await waitFor(() => {
      expect(getByText('Pushing Repository...')).toBeTruthy()
    })
    const action = document.querySelector(
      '[data-github-action="html"]',
    ) as HTMLElement
    expect(action.querySelector('.lucide-loader-circle')).toBeTruthy()
    expect(action.querySelector('.animate-spin')).toBeTruthy()

    // Release the pending push so the component can settle.
    resolvePush(pushOkResponse())
    await waitFor(() =>
      expect(window.open).toHaveBeenCalledWith(
        'https://github.com/acme/site',
        '_blank',
        'noopener,noreferrer',
      ),
    )
  })

  it('6. payment required shows an upgrade prompt instead of a push button', async () => {
    setExportTargets([
      readyTarget({
        target: 'react',
        label: 'React',
        requiresPayment: true,
        status: 'payment_required',
      }),
    ])
    vi.stubGlobal('fetch', vi.fn())

    const { getByText } = render(<GitHubPanel sessionId="session_1" />)
    await waitFor(() => expect(getByText('React')).toBeTruthy())

    // Status copy advertises payment required.
    expect(getByText('Payment required')).toBeTruthy()

    // The action icon is a lock, not the GitHub push mark.
    const action = document.querySelector(
      '[data-github-action="react"]',
    ) as HTMLElement
    expect(action.querySelector('.lucide-lock')).toBeTruthy()
    expect(action.querySelector('.lucide-github')).toBeNull()

    // Clicking surfaces the upgrade prompt (error banner).
    const button = getByText('React').closest('button')!
    fireEvent.click(button)

    await waitFor(() =>
      expect(
        getByText('Subscribe to Pro or use a download credit before pushing.'),
      ).toBeTruthy(),
    )
  })

  it('7. stale export shows a regenerate prompt', () => {
    setExportTargets([
      readyTarget({
        target: 'next',
        label: 'Next.js',
        status: 'stale',
        currentPreviewVersion: 3,
        artifactReady: true,
        artifactStatus: 'ready',
      }),
    ])

    const { getByText } = render(<GitHubPanel sessionId="session_1" />)

    expect(getByText(/Regenerate/)).toBeTruthy()
    const action = document.querySelector(
      '[data-github-action="next"]',
    ) as HTMLElement
    expect(action.querySelector('.lucide-triangle-alert')).toBeTruthy()
  })

  it('8. artifact not ready triggers a build (ensureExportArtifact mutation) before pushing', async () => {
    setExportTargets([
      readyTarget({
        target: 'html',
        label: 'HTML',
        ready: false,
        status: 'available',
        artifactReady: false,
        artifactStatus: 'not_ready',
      }),
    ])
    vi.stubGlobal('fetch', vi.fn())
    persistAnonymousOwnerSecret(
      window.localStorage,
      'session_1',
      'owner-secret',
    )

    const { getByText } = render(<GitHubPanel sessionId="session_1" />)
    await waitFor(() => expect(getByText('HTML')).toBeTruthy())

    const button = getByText('HTML').closest('button')!
    fireEvent.click(button)

    await waitFor(() =>
      expect(exportTargetsState.ensureExportArtifact).toHaveBeenCalledWith({
        lookup: 'session_1',
        target: 'html',
        anonymousOwnerSecret: 'owner-secret',
      }),
    )
  })

  it('9. error state shows the error message to the user', async () => {
    setExportTargets([
      readyTarget({ target: 'html', label: 'HTML', githubUrl: null }),
    ])
    const fetchMock = pushFlowFetch({
      push: () =>
        Response.json(
          { error: 'GitHub push failed: repo quota exceeded' },
          { status: 500 },
        ),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { getByText } = render(<GitHubPanel sessionId="session_1" />)
    await waitFor(() => expect(getByText('HTML')).toBeTruthy())

    const button = getByText('HTML').closest('button')!
    fireEvent.click(button)

    await waitFor(() =>
      expect(getByText('GitHub push failed: repo quota exceeded')).toBeTruthy(),
    )
    // The error renders inside the rose error banner.
    const banner = document.querySelector(
      '.border-rose-500\\/30',
    ) as HTMLElement
    expect(banner).toBeTruthy()
    expect(banner.textContent).toContain(
      'GitHub push failed: repo quota exceeded',
    )
  })

  it('10. loading state (query pending) renders all four target placeholders', () => {
    setLoading()
    render(<GitHubPanel sessionId="session_1" />)

    const targets = document.querySelectorAll('[data-github-target]')
    expect(targets).toHaveLength(4)
    const labels = Array.from(targets).map(
      (el) => el.querySelector('.text-sm.font-semibold')?.textContent,
    )
    expect(labels).toEqual(['HTML', 'React', 'Next.js', 'Lakebed'])
  })
})
