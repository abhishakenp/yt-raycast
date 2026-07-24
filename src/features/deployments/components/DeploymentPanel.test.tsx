// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DeploymentPanel } from './DeploymentPanel'

type MockDeploymentTarget = {
  target: 'html' | 'react' | 'next' | 'lakebed'
  artifactReady?: boolean
  artifactStatus?: string
  artifactError?: string
  artifactProgressStage?: string
  artifactProgressPercent?: number
  artifactProgressStartedAt?: number
  artifactProgressUpdatedAt?: number
  artifactProgressSampleCount?: number
  deployedUrl?: string | null
}

type MockDeploymentStatus = {
  provider: 'lakebed'
  url: string
}

const convexState = vi.hoisted(() => ({
  exportTargets: {
    isPrivate: false,
    targets: Array<MockDeploymentTarget>(),
  },
  deploymentStatuses: new Map<string, MockDeploymentStatus>(),
  lakebedEntitlement: { requiresPayment: false },
  publishPreview: vi.fn(async () => ({ url: 'https://ship-fast.test/site' })),
  ensureExportArtifact: vi.fn(async () => ({
    target: 'lakebed',
    status: 'queued',
    previewVersion: 2,
  })),
  mutationCallCount: 0,
  queryCallCount: 0,
}))

vi.mock('convex/react', () => ({
  useMutation: () => {
    convexState.mutationCallCount += 1
    return convexState.mutationCallCount % 2 === 1
      ? convexState.publishPreview
      : convexState.ensureExportArtifact
  },
  useQuery: () => {
    convexState.queryCallCount += 1
    const callIndex = convexState.queryCallCount
    // Call order: getExportTargets, getDeploymentStatus, getLakebedEntitlement, getCommerceConfig
    if (callIndex % 4 === 1) return convexState.exportTargets
    if (callIndex % 4 === 2)
      return convexState.deploymentStatuses.get('current') ?? null
    if (callIndex % 4 === 3) return convexState.lakebedEntitlement
    return null
  },
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  useIsAdmin: () => false,
  useOptionalAuth: () => ({
    getToken: vi.fn(async () => null),
    isSignedIn: false,
  }),
}))

vi.mock('@/shared/auth/SignInGate', () => ({
  useSignInGate: () => ({
    isGated: false,
    openSignIn: vi.fn(),
    requireSignIn: () => true,
  }),
}))

function setExportTargets(targets: MockDeploymentTarget[]) {
  convexState.exportTargets = {
    isPrivate: false,
    targets,
  }
  convexState.queryCallCount = 0
}

function setDeploymentStatus(status: MockDeploymentStatus | null) {
  convexState.deploymentStatuses.clear()
  if (status) convexState.deploymentStatuses.set('current', status)
  convexState.queryCallCount = 0
}

const installLocalStorage = () => {
  const values = new Map<string, string>()
  const storage = {
    clear: vi.fn(() => values.clear()),
    getItem: vi.fn((key) => values.get(key) ?? null),
    removeItem: vi.fn((key) => values.delete(key)),
    setItem: vi.fn((key, value) => {
      values.set(key, value)
    }),
  }
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: storage,
  })
  vi.stubGlobal('localStorage', storage)
}

describe('DeploymentPanel', () => {
  beforeEach(() => {
    installLocalStorage()
    convexState.publishPreview.mockClear()
    convexState.ensureExportArtifact.mockClear()
    convexState.mutationCallCount = 0
    setExportTargets([
      { target: 'html', artifactReady: true, artifactStatus: 'ready' },
    ])
    setDeploymentStatus(null)
    vi.spyOn(window, 'open').mockImplementation(() => null)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('publishes Lakebed after a clicked building artifact becomes ready', async () => {
    setExportTargets([
      {
        target: 'lakebed',
        artifactReady: false,
        artifactStatus: 'building',
        artifactProgressStage: 'Generating components',
        artifactProgressPercent: 76,
      },
    ])
    const fetchMock = vi.fn(async () =>
      Response.json({ url: 'https://lakebed-launch.lakebed.app' }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const view = render(<DeploymentPanel sessionId="session_123" />)

    expect(view.getByText('Publish Lakebed')).toBeTruthy()
    expect(view.getByText(/76%/)).toBeTruthy()
    expect(view.queryByText(/Generating components/)).toBeNull()
    expect(view.queryByText('Preparing')).toBeNull()

    const button = view.getByText('Publish Lakebed').closest('button')
    expect(button).toBeTruthy()
    if (button) fireEvent.click(button)

    await waitFor(() => {
      expect(
        view.container.querySelector(
          '[data-deployment-action="lakebed"] .animate-spin',
        ),
      ).toBeTruthy()
    })
    expect(view.getByText(/76%/)).toBeTruthy()
    expect(button?.style.backgroundImage).toContain('110deg')

    await new Promise((resolve) => window.setTimeout(resolve, 650))

    expect(convexState.ensureExportArtifact).toHaveBeenCalledWith({
      lookup: 'session_123',
      target: 'lakebed',
      anonymousOwnerSecret: undefined,
    })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(convexState.publishPreview).not.toHaveBeenCalled()
    expect(window.open).not.toHaveBeenCalled()
    expect(
      view.container.querySelector(
        '[data-deployment-action="lakebed"] .animate-spin',
      ),
    ).toBeTruthy()

    setExportTargets([
      {
        target: 'lakebed',
        artifactReady: true,
        artifactStatus: 'ready',
      },
    ])
    view.rerender(<DeploymentPanel sessionId="session_123" />)

    await waitFor(() => {
      expect(
        view.container.querySelector(
          '[data-deployment-action="lakebed"] .animate-spin',
        ),
      ).toBeNull()
    })
    expect(view.queryByText(/72%/)).toBeNull()
    await waitFor(() =>
      expect(window.open).toHaveBeenCalledWith(
        'https://lakebed-launch.lakebed.app',
        '_blank',
        'noopener,noreferrer',
      ),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/sessions/session_123/deploy/lakebed',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('opens an existing Lakebed deployment without publishing again', async () => {
    setExportTargets([
      {
        target: 'lakebed',
        artifactReady: true,
        artifactStatus: 'ready',
        deployedUrl: 'https://lakebed-launch.lakebed.app',
      },
    ])
    const fetchMock = vi.fn(async () => Response.json({ url: 'unexpected' }))
    vi.stubGlobal('fetch', fetchMock)

    const view = render(<DeploymentPanel sessionId="session_123" />)

    await waitFor(() => expect(view.getByText('Open Lakebed')).toBeTruthy())
    const button = view.getByText('Open Lakebed').closest('button')
    expect(button).toBeTruthy()
    if (button) fireEvent.click(button)

    expect(window.open).toHaveBeenCalledWith(
      'https://lakebed-launch.lakebed.app',
      '_blank',
      'noopener,noreferrer',
    )
    expect(fetchMock).not.toHaveBeenCalled()
    expect(convexState.publishPreview).not.toHaveBeenCalled()
  })

  it('does not show stale artifact errors after Lakebed deployment succeeds', async () => {
    setExportTargets([
      {
        target: 'lakebed',
        artifactReady: false,
        artifactStatus: 'failed',
        artifactError:
          'Export build stalled before completion. Click to retry.',
      },
    ])
    setDeploymentStatus({
      provider: 'lakebed',
      url: 'https://lakebed-launch.lakebed.app',
    })

    const view = render(<DeploymentPanel sessionId="session_123" />)

    expect(view.getByText('Open Lakebed')).toBeTruthy()
    expect(
      view.queryByText(
        'Export build stalled before completion. Click to retry.',
      ),
    ).toBeNull()
  })

  it('continues the same click when a pending Lakebed artifact is ready', async () => {
    setExportTargets([
      {
        target: 'lakebed',
        artifactReady: false,
        artifactStatus: 'building',
      },
    ])
    convexState.ensureExportArtifact.mockResolvedValueOnce({
      target: 'lakebed',
      status: 'ready',
      previewVersion: 2,
    })
    const fetchMock = vi.fn(async () =>
      Response.json({ url: 'https://lakebed-launch.lakebed.app' }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const view = render(<DeploymentPanel sessionId="session_123" />)
    const button = view.getByText('Publish Lakebed').closest('button')
    expect(button).toBeTruthy()
    if (button) fireEvent.click(button)

    await waitFor(() =>
      expect(window.open).toHaveBeenCalledWith(
        'https://lakebed-launch.lakebed.app',
        '_blank',
        'noopener,noreferrer',
      ),
    )
    expect(convexState.ensureExportArtifact).toHaveBeenCalledWith({
      lookup: 'session_123',
      target: 'lakebed',
      anonymousOwnerSecret: undefined,
    })
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/sessions/session_123/deploy/lakebed',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(convexState.publishPreview).not.toHaveBeenCalled()
  })

  it('shows a Lakebed publish error when the deploy route returns no URL', async () => {
    setExportTargets([
      {
        target: 'lakebed',
        artifactReady: true,
        artifactStatus: 'ready',
      },
    ])
    const fetchMock = vi.fn(async () =>
      Response.json(
        {
          status: 'building',
          error: 'Lakebed app is still being prepared.',
        },
        { status: 202 },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    const view = render(<DeploymentPanel sessionId="session_123" />)
    const button = view.getByText('Publish Lakebed').closest('button')
    expect(button).toBeTruthy()
    if (button) fireEvent.click(button)

    await waitFor(() => expect(view.getByText('Publishing...')).toBeTruthy())
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/sessions/session_123/deploy/lakebed',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(convexState.ensureExportArtifact).not.toHaveBeenCalled()
    expect(window.open).not.toHaveBeenCalled()
  })

  it('surfaces failed Lakebed artifact builds instead of resetting silently', async () => {
    setExportTargets([
      {
        target: 'lakebed',
        artifactReady: false,
        artifactStatus: 'building',
      },
    ])
    const fetchMock = vi.fn(async () =>
      Response.json({ url: 'https://lakebed-launch.lakebed.app' }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const view = render(<DeploymentPanel sessionId="session_123" />)
    const button = view.getByText('Publish Lakebed').closest('button')
    expect(button).toBeTruthy()
    if (button) fireEvent.click(button)

    await waitFor(() =>
      expect(
        view.container.querySelector(
          '[data-deployment-action="lakebed"] .animate-spin',
        ),
      ).toBeTruthy(),
    )

    setExportTargets([
      {
        target: 'lakebed',
        artifactReady: false,
        artifactStatus: 'failed',
        artifactError: 'OpenUI source is incomplete',
      },
    ])
    view.rerender(<DeploymentPanel sessionId="session_123" />)

    await waitFor(() =>
      expect(view.getByText('OpenUI source is incomplete')).toBeTruthy(),
    )
    expect(
      view.container.querySelector(
        '[data-deployment-action="lakebed"] .animate-spin',
      ),
    ).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(window.open).not.toHaveBeenCalled()

    setDeploymentStatus({
      provider: 'lakebed',
      url: 'https://lakebed-launch.lakebed.app',
    })
    view.rerender(<DeploymentPanel sessionId="session_123" />)

    expect(view.getByText('Open Lakebed')).toBeTruthy()
    expect(view.queryByText('OpenUI source is incomplete')).toBeNull()
  })
})
