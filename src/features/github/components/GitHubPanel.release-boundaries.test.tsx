// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

interface GitHubTarget {
  artifactError?: string
  artifactReady: boolean
  artifactStatus: string
  fileCount: number | null
  label: string
  ready: boolean
  requiresPayment: boolean
  status: string
  target: 'html' | 'react' | 'next' | 'lakebed'
}

interface GitHubTestState {
  ensureArtifact: ReturnType<typeof vi.fn>
  getToken: ReturnType<typeof vi.fn>
  openSignIn: ReturnType<typeof vi.fn>
  targets: GitHubTarget[]
}

const githubState = vi.hoisted<GitHubTestState>(() => ({
  ensureArtifact: vi.fn(),
  getToken: vi.fn(async () => null),
  openSignIn: vi.fn(),
  targets: [],
}))

vi.mock('convex/react', () => ({
  useMutation: () => githubState.ensureArtifact,
  useQuery: () => ({ targets: githubState.targets }),
}))

vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      ensureExportArtifactByLookup: 'ensureExportArtifactByLookup',
      getExportTargets: 'getExportTargets',
    },
  },
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  useIsAdmin: () => false,
  useOptionalAuth: () => ({
    getToken: githubState.getToken,
    isSignedIn: false,
  }),
  useOptionalClerk: () => ({ openSignIn: githubState.openSignIn }),
}))

vi.mock('@/shared/auth/clerk-runtime', () => ({
  isClerkDisabled: () => true,
}))

vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: () => undefined,
}))

vi.mock('@/features/session/services/session-create-payload', () => ({
  createAnonymousClientId: () => 'anon-github-release',
}))

import { GitHubPanel } from './GitHubPanel'

interface DeferredArtifact {
  promise: Promise<{ status: string }>
  resolve: (result: { status: string }) => void
}

function createTarget(artifactReady = false): GitHubTarget {
  return {
    artifactReady,
    artifactStatus: artifactReady ? 'ready' : 'not_ready',
    fileCount: artifactReady ? 8 : null,
    label: 'HTML',
    ready: artifactReady,
    requiresPayment: false,
    status: 'available',
    target: 'html',
  }
}

function deferredArtifact(): DeferredArtifact {
  function unresolvedArtifact(_result: { status: string }): void {}
  let resolvePromise = unresolvedArtifact
  const promise = new Promise<{ status: string }>((resolve) => {
    resolvePromise = resolve
  })
  return { promise, resolve: resolvePromise }
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status,
  })
}

describe('GitHubPanel release boundaries', () => {
  beforeEach(() => {
    githubState.ensureArtifact.mockReset()
    githubState.getToken.mockClear()
    githubState.openSignIn.mockClear()
    githubState.targets = [createTarget()]
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('locks a target while its export artifact is being prepared', async () => {
    const artifact = deferredArtifact()
    githubState.ensureArtifact.mockReturnValue(artifact.promise)
    const view = render(<GitHubPanel sessionId="github-release" />)
    const pushButton = view.getByRole('button', { name: /HTML/ })

    fireEvent.click(pushButton)
    const disabledDuringPreparation = pushButton.hasAttribute('disabled')
    artifact.resolve({ status: 'building' })
    await waitFor(() =>
      expect(githubState.ensureArtifact).toHaveBeenCalledTimes(1),
    )

    expect(disabledDuringPreparation).toBe(true)
  })

  it('coalesces rapid artifact-preparation clicks into one mutation', async () => {
    const artifact = deferredArtifact()
    githubState.ensureArtifact.mockReturnValue(artifact.promise)
    const view = render(<GitHubPanel sessionId="github-release" />)
    const pushButton = view.getByRole('button', { name: /HTML/ })

    fireEvent.click(pushButton)
    fireEvent.click(pushButton)
    artifact.resolve({ status: 'building' })
    await waitFor(() => expect(githubState.ensureArtifact).toHaveBeenCalled())

    expect(githubState.ensureArtifact).toHaveBeenCalledTimes(1)
  })

  it('announces GitHub push failures to assistive technology', async () => {
    githubState.targets = [createTarget(true)]
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({ error: 'Repository push unavailable' }, 503),
      ),
    )
    const view = render(<GitHubPanel sessionId="github-release" />)

    fireEvent.click(view.getByRole('button', { name: /HTML/ }))
    await waitFor(() =>
      expect(view.getByText('Repository push unavailable')).toBeTruthy(),
    )

    expect(view.getByRole('alert').textContent).toContain(
      'Repository push unavailable',
    )
  })

  it('preserves a pending OAuth push when another session panel mounts', async () => {
    const pendingPush = JSON.stringify({
      sessionId: 'original-session',
      target: 'html',
    })
    window.sessionStorage.setItem('ship-fast:github-pending-push', pendingPush)

    render(<GitHubPanel sessionId="different-session" />)
    await waitFor(() =>
      expect(githubState.ensureArtifact).not.toHaveBeenCalled(),
    )

    expect(window.sessionStorage.getItem('ship-fast:github-pending-push')).toBe(
      pendingPush,
    )
  })
})
