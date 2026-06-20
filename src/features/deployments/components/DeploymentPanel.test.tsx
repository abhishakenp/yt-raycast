// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DeploymentPanel } from './DeploymentPanel'

type MockDeploymentTarget = {
  target: 'html' | 'react' | 'next' | 'lakebed'
  artifactReady?: boolean
  artifactStatus?: string
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
  publishPreview: vi.fn(async () => ({ url: 'https://ship-fast.test/site' })),
  queryCallCount: 0,
}))

vi.mock('convex/react', () => ({
  useMutation: () => convexState.publishPreview,
  useQuery: () => convexState.deploymentStatuses.get('current') ?? null,
}))

vi.mock('@/features/exports/hooks/use-export-targets', () => ({
  useExportTargets: () => ({
    data: convexState.exportTargets,
    error: undefined,
    isLoading: false,
    refetch: vi.fn(),
  }),
}))

const setExportTargets = (targets: MockDeploymentTarget[]) => {
  convexState.exportTargets = {
    isPrivate: false,
    targets,
  }
}

const setDeploymentStatus = (status: MockDeploymentStatus | null) => {
  convexState.deploymentStatuses.clear()
  if (status) convexState.deploymentStatuses.set('current', status)
}

const installLocalStorage = () => {
  const values = new Map<string, string>()
  const storage = {
    clear: vi.fn(() => values.clear()),
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    removeItem: vi.fn((key: string) => values.delete(key)),
    setItem: vi.fn((key: string, value: string) => {
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
    setExportTargets([])
    setDeploymentStatus(null)
    vi.spyOn(window, 'open').mockImplementation(() => null)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('publishes Lakebed through the app route without a client artifact mutation', async () => {
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

    expect(view.getByText('Publish Lakebed')).toBeTruthy()
    expect(view.queryByText('72%')).toBeNull()
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
    expect(convexState.publishPreview).not.toHaveBeenCalled()
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

  it('continues the same click when Lakebed is pending', async () => {
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
    expect(convexState.publishPreview).not.toHaveBeenCalled()
  })
})
