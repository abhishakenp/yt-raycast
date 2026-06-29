// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DeploymentPanel } from './DeploymentPanel'

type MockDeploymentTarget = {
  target: 'html' | 'react' | 'next' | 'lakebed'
  artifactReady?: boolean
  artifactStatus?: string
  artifactError?: string
  deployedUrl?: string | null
}

type MockDeploymentStatus = {
  provider: 'lakebed'
  url: string
}

type MockExportTargets = {
  isPrivate: boolean
  targets: MockDeploymentTarget[]
}

// Sentinel api references + mock state, all hoisted so vi.mock factories
// (which are hoisted above imports) can reference them safely.
const convexState = vi.hoisted(() => ({
  refs: {
    publishPreview: { ref: 'publishPreviewByLookup' },
    ensureArtifact: { ref: 'ensureExportArtifactByLookup' },
    getExportTargets: { ref: 'getExportTargets' },
    getDeploymentStatus: { ref: 'getDeploymentStatusByLookup' },
  },
  exportTargets: {
    isPrivate: false,
    targets: Array<MockDeploymentTarget>(),
  } as MockExportTargets,
  deploymentStatus: null as MockDeploymentStatus | null,
  publishPreview: vi.fn(async () => ({ url: 'https://ship-fast.test/site' })),
  ensureExportArtifact: vi.fn(async () => ({
    target: 'lakebed',
    status: 'queued',
    previewVersion: 2,
  })),
}))

vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      publishPreviewByLookup: convexState.refs.publishPreview,
      ensureExportArtifactByLookup: convexState.refs.ensureArtifact,
      getExportTargets: convexState.refs.getExportTargets,
      getDeploymentStatusByLookup: convexState.refs.getDeploymentStatus,
    },
  },
}))

vi.mock('convex/react', () => ({
  useMutation: (ref: unknown) => {
    if (ref === convexState.refs.publishPreview)
      return convexState.publishPreview
    if (ref === convexState.refs.ensureArtifact)
      return convexState.ensureExportArtifact
    throw new Error(`useMutation: unknown ref ${String(ref)}`)
  },
  useQuery: (ref: unknown) => {
    if (ref === convexState.refs.getExportTargets)
      return convexState.exportTargets
    if (ref === convexState.refs.getDeploymentStatus)
      return convexState.deploymentStatus
    throw new Error(`useQuery: unknown ref ${String(ref)}`)
  },
}))

const setExportTargets = (
  targets: MockDeploymentTarget[],
  isPrivate = false,
) => {
  convexState.exportTargets = { isPrivate, targets }
}

const setDeploymentStatus = (status: MockDeploymentStatus | null) => {
  convexState.deploymentStatus = status
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

const lakebedJsonResponse = (url: string) =>
  vi.fn(async () => Response.json({ url }))

describe('DeploymentPanel (behavioral)', () => {
  beforeEach(() => {
    installLocalStorage()
    convexState.publishPreview.mockReset()
    convexState.publishPreview.mockResolvedValue({
      url: 'https://ship-fast.test/site',
    })
    convexState.ensureExportArtifact.mockReset()
    convexState.ensureExportArtifact.mockResolvedValue({
      target: 'lakebed',
      status: 'queued',
      previewVersion: 2,
    })
    setExportTargets([])
    setDeploymentStatus(null)
    vi.spyOn(window, 'open').mockImplementation(() => null)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('1. deployment targets render', () => {
    it('shows both ShipFast and Lakebed deployment targets', () => {
      const view = render(<DeploymentPanel sessionId="session_123" />)

      expect(view.getByText('Publish ShipFast')).toBeTruthy()
      expect(view.getByText('Publish Lakebed')).toBeTruthy()
    })
  })

  describe('2. status display', () => {
    it('idle: shows publish buttons for both targets', () => {
      const view = render(<DeploymentPanel sessionId="session_123" />)

      expect(view.getByText('Publish ShipFast')).toBeTruthy()
      expect(view.getByText('Publish Lakebed')).toBeTruthy()
      expect(view.queryByText('Open Lakebed')).toBeNull()
    })

    it('building: shows progress percentage for Lakebed while preparing', async () => {
      setExportTargets([
        { target: 'lakebed', artifactReady: false, artifactStatus: 'building' },
      ])
      const view = render(<DeploymentPanel sessionId="session_123" />)

      const button = view.getByText('Publish Lakebed').closest('button')!
      fireEvent.click(button)

      await waitFor(() => expect(view.getByText('72%')).toBeTruthy())
      expect(
        view.container.querySelector(
          '[data-deployment-action="lakebed"] .animate-spin',
        ),
      ).toBeTruthy()
    })

    it('ready: shows published URL label (Open Lakebed) for a deployed target', () => {
      setExportTargets([
        {
          target: 'lakebed',
          artifactReady: true,
          artifactStatus: 'ready',
          deployedUrl: 'https://lakebed-launch.lakebed.app',
        },
      ])
      const view = render(<DeploymentPanel sessionId="session_123" />)

      expect(view.getByText('Open Lakebed')).toBeTruthy()
      expect(view.queryByText('Publish Lakebed')).toBeNull()
    })

    it('failed: shows error message for a failed Lakebed artifact', () => {
      setExportTargets([
        {
          target: 'lakebed',
          artifactReady: false,
          artifactStatus: 'failed',
          artifactError: 'Lakebed export failed.',
        },
      ])
      const view = render(<DeploymentPanel sessionId="session_123" />)

      expect(view.getByText('Lakebed export failed.')).toBeTruthy()
    })
  })

  describe('3. publish ShipFast flow', () => {
    it('clicking Publish ShipFast triggers the publishPreview mutation', async () => {
      const view = render(<DeploymentPanel sessionId="session_123" />)

      const button = view.getByText('Publish ShipFast').closest('button')!
      fireEvent.click(button)

      await waitFor(() =>
        expect(convexState.publishPreview).toHaveBeenCalledWith({
          lookup: 'session_123',
          anonymousOwnerSecret: undefined,
        }),
      )
    })

    it('opens the returned ShipFast URL in a new tab', async () => {
      const view = render(<DeploymentPanel sessionId="session_123" />)

      const button = view.getByText('Publish ShipFast').closest('button')!
      fireEvent.click(button)

      await waitFor(() =>
        expect(window.open).toHaveBeenCalledWith(
          'https://ship-fast.test/site',
          '_blank',
          'noopener,noreferrer',
        ),
      )
    })
  })

  describe('4. publish Lakebed flow', () => {
    it('clicking Publish Lakebed (ready artifact) triggers the lakebed deploy API', async () => {
      setExportTargets([
        { target: 'lakebed', artifactReady: true, artifactStatus: 'ready' },
      ])
      const fetchMock = lakebedJsonResponse(
        'https://lakebed-launch.lakebed.app',
      )
      vi.stubGlobal('fetch', fetchMock)

      const view = render(<DeploymentPanel sessionId="session_123" />)
      const button = view.getByText('Publish Lakebed').closest('button')!
      fireEvent.click(button)

      await waitFor(() =>
        expect(fetchMock).toHaveBeenCalledWith(
          '/api/sessions/session_123/deploy/lakebed',
          expect.objectContaining({ method: 'POST' }),
        ),
      )
      expect(convexState.publishPreview).not.toHaveBeenCalled()
    })

    it('opens the returned Lakebed URL in a new tab', async () => {
      setExportTargets([
        { target: 'lakebed', artifactReady: true, artifactStatus: 'ready' },
      ])
      vi.stubGlobal(
        'fetch',
        lakebedJsonResponse('https://lakebed-launch.lakebed.app'),
      )

      const view = render(<DeploymentPanel sessionId="session_123" />)
      const button = view.getByText('Publish Lakebed').closest('button')!
      fireEvent.click(button)

      await waitFor(() =>
        expect(window.open).toHaveBeenCalledWith(
          'https://lakebed-launch.lakebed.app',
          '_blank',
          'noopener,noreferrer',
        ),
      )
    })
  })

  describe('5. private site confirmation dialog', () => {
    it('shows a confirmation dialog before proceeding when the site is private', () => {
      setExportTargets([], true)

      const view = render(<DeploymentPanel sessionId="session_123" />)
      const button = view.getByText('Publish ShipFast').closest('button')!
      fireEvent.click(button)

      expect(
        document.body.querySelector('[data-slot="alert-dialog-content"]'),
      ).toBeTruthy()
      expect(
        document.body.textContent?.includes('Publish this private site?'),
      ).toBe(true)
      // The publish mutation must NOT have run yet.
      expect(convexState.publishPreview).not.toHaveBeenCalled()
    })

    it('does not show the dialog for a public site', () => {
      setExportTargets([], false)

      const view = render(<DeploymentPanel sessionId="session_123" />)
      const button = view.getByText('Publish ShipFast').closest('button')!
      fireEvent.click(button)

      expect(
        document.body.querySelector('[data-slot="alert-dialog-content"]'),
      ).toBeNull()
    })
  })

  describe('6. confirmation dialog actions', () => {
    it('confirm proceeds with the publish flow', async () => {
      setExportTargets([], true)

      const view = render(<DeploymentPanel sessionId="session_123" />)
      fireEvent.click(view.getByText('Publish ShipFast').closest('button')!)

      const confirmButton = document.body.querySelector(
        '[data-slot="alert-dialog-action"]',
      ) as HTMLButtonElement
      expect(confirmButton).toBeTruthy()
      fireEvent.click(confirmButton)

      await waitFor(() =>
        expect(convexState.publishPreview).toHaveBeenCalledWith({
          lookup: 'session_123',
          anonymousOwnerSecret: undefined,
        }),
      )
    })

    it('cancel aborts the publish flow and closes the dialog', () => {
      setExportTargets([], true)

      const view = render(<DeploymentPanel sessionId="session_123" />)
      fireEvent.click(view.getByText('Publish ShipFast').closest('button')!)

      const cancelButton = document.body.querySelector(
        '[data-slot="alert-dialog-cancel"]',
      ) as HTMLButtonElement
      expect(cancelButton).toBeTruthy()
      fireEvent.click(cancelButton)

      expect(convexState.publishPreview).not.toHaveBeenCalled()
      // Dialog should close after cancel.
      return waitFor(() =>
        expect(
          document.body.querySelector('[data-slot="alert-dialog-content"]'),
        ).toBeNull(),
      )
    })
  })

  describe('7. published URL displays after successful deployment', () => {
    it('renders the Open Lakebed label once a deployed URL is present', () => {
      setExportTargets([
        {
          target: 'lakebed',
          artifactReady: true,
          artifactStatus: 'ready',
          deployedUrl: 'https://lakebed-launch.lakebed.app',
        },
      ])

      const view = render(<DeploymentPanel sessionId="session_123" />)

      expect(view.getByText('Open Lakebed')).toBeTruthy()
      expect(view.queryByText('Publish Lakebed')).toBeNull()
    })

    it('renders Open Lakebed when deployment status reports a lakebed URL', () => {
      setExportTargets([
        { target: 'lakebed', artifactReady: true, artifactStatus: 'ready' },
      ])
      setDeploymentStatus({
        provider: 'lakebed',
        url: 'https://lakebed-launch.lakebed.app',
      })

      const view = render(<DeploymentPanel sessionId="session_123" />)

      expect(view.getByText('Open Lakebed')).toBeTruthy()
    })
  })

  describe('8. published URL is clickable (opens in new tab)', () => {
    it('clicking Open Lakebed opens the deployed URL in a new tab without re-publishing', () => {
      const deployedUrl = 'https://lakebed-launch.lakebed.app'
      setExportTargets([
        {
          target: 'lakebed',
          artifactReady: true,
          artifactStatus: 'ready',
          deployedUrl,
        },
      ])
      const fetchMock = lakebedJsonResponse('https://unexpected.test')
      vi.stubGlobal('fetch', fetchMock)

      const view = render(<DeploymentPanel sessionId="session_123" />)
      const button = view.getByText('Open Lakebed').closest('button')!
      fireEvent.click(button)

      expect(window.open).toHaveBeenCalledWith(
        deployedUrl,
        '_blank',
        'noopener,noreferrer',
      )
      expect(fetchMock).not.toHaveBeenCalled()
      expect(convexState.publishPreview).not.toHaveBeenCalled()
    })

    it('clicking Publish ShipFast opens the ShipFast URL in a new tab', async () => {
      const view = render(<DeploymentPanel sessionId="session_123" />)
      fireEvent.click(view.getByText('Publish ShipFast').closest('button')!)

      await waitFor(() =>
        expect(window.open).toHaveBeenCalledWith(
          'https://ship-fast.test/site',
          '_blank',
          'noopener,noreferrer',
        ),
      )
    })
  })

  describe('9. progress percentage during deployment', () => {
    it('shows 72% while a Lakebed artifact is building and waiting', async () => {
      setExportTargets([
        { target: 'lakebed', artifactReady: false, artifactStatus: 'building' },
      ])
      const view = render(<DeploymentPanel sessionId="session_123" />)

      fireEvent.click(view.getByText('Publish Lakebed').closest('button')!)

      await waitFor(() => expect(view.getByText('72%')).toBeTruthy())
      expect(
        view.container.querySelector(
          '[data-deployment-action="lakebed"] .animate-spin',
        ),
      ).toBeTruthy()
    })

    it('shows a progress background gradient while building', async () => {
      setExportTargets([
        { target: 'lakebed', artifactReady: false, artifactStatus: 'building' },
      ])
      const view = render(<DeploymentPanel sessionId="session_123" />)
      const button = view.getByText('Publish Lakebed').closest('button')!

      fireEvent.click(button)

      await waitFor(() => expect(view.getByText('72%')).toBeTruthy())
      expect(button.style.backgroundImage).toContain('110deg')
    })

    it('clears the percentage once the artifact is ready', async () => {
      setExportTargets([
        { target: 'lakebed', artifactReady: false, artifactStatus: 'building' },
      ])
      const view = render(<DeploymentPanel sessionId="session_123" />)
      fireEvent.click(view.getByText('Publish Lakebed').closest('button')!)

      await waitFor(() => expect(view.getByText('72%')).toBeTruthy())

      setExportTargets([
        { target: 'lakebed', artifactReady: true, artifactStatus: 'ready' },
      ])
      view.rerender(<DeploymentPanel sessionId="session_123" />)

      await waitFor(() => expect(view.queryByText('72%')).toBeNull())
    })
  })

  describe('10. error state with retry option', () => {
    it('shows an error message when the Lakebed deploy route returns no URL', async () => {
      setExportTargets([
        { target: 'lakebed', artifactReady: true, artifactStatus: 'ready' },
      ])
      vi.stubGlobal(
        'fetch',
        vi.fn(async () =>
          Response.json(
            {
              status: 'building',
              error: 'Lakebed app is still being prepared.',
            },
            { status: 202 },
          ),
        ),
      )

      const view = render(<DeploymentPanel sessionId="session_123" />)
      fireEvent.click(view.getByText('Publish Lakebed').closest('button')!)

      await waitFor(() =>
        expect(
          view.getByText('Lakebed app is still being prepared.'),
        ).toBeTruthy(),
      )
    })

    it('shows an error message when the publish mutation throws', async () => {
      convexState.publishPreview.mockRejectedValueOnce(
        new Error('ShipFast publish exploded'),
      )

      const view = render(<DeploymentPanel sessionId="session_123" />)
      fireEvent.click(view.getByText('Publish ShipFast').closest('button')!)

      await waitFor(() =>
        expect(view.getByText('ShipFast publish exploded')).toBeTruthy(),
      )
    })

    it('offers a retry by keeping the publish button enabled after an error', async () => {
      convexState.publishPreview.mockRejectedValueOnce(
        new Error('ShipFast publish exploded'),
      )

      const view = render(<DeploymentPanel sessionId="session_123" />)
      const button = view.getByText('Publish ShipFast').closest('button')!
      fireEvent.click(button)

      await waitFor(() =>
        expect(view.getByText('ShipFast publish exploded')).toBeTruthy(),
      )

      // Button must be re-enabled (not disabled) so the user can retry.
      await waitFor(() => expect(button.disabled).toBe(false))

      convexState.publishPreview.mockResolvedValueOnce({
        url: 'https://ship-fast.test/site',
      })
      fireEvent.click(button)

      await waitFor(() =>
        expect(window.open).toHaveBeenCalledWith(
          'https://ship-fast.test/site',
          '_blank',
          'noopener,noreferrer',
        ),
      )
    })

    it('shows a failed artifact error message with the publish button still enabled', () => {
      setExportTargets([
        {
          target: 'lakebed',
          artifactReady: false,
          artifactStatus: 'failed',
          artifactError: 'OpenUI source is incomplete',
        },
      ])

      const view = render(<DeploymentPanel sessionId="session_123" />)
      expect(view.getByText('OpenUI source is incomplete')).toBeTruthy()

      const button = view.getByText('Publish Lakebed').closest('button')!
      expect(button.disabled).toBe(false)
    })
  })

  describe('11. artifact preparation state', () => {
    it('shows a preparing spinner before the Lakebed deploy when the artifact is not ready', async () => {
      setExportTargets([
        { target: 'lakebed', artifactReady: false, artifactStatus: 'building' },
      ])
      const view = render(<DeploymentPanel sessionId="session_123" />)

      fireEvent.click(view.getByText('Publish Lakebed').closest('button')!)

      // The lakebed action icon shows a spinner while preparing.
      await waitFor(() =>
        expect(
          view.container.querySelector(
            '[data-deployment-action="lakebed"] .animate-spin',
          ),
        ).toBeTruthy(),
      )
      // ensureExportArtifact is invoked to prepare the artifact.
      await waitFor(() =>
        expect(convexState.ensureExportArtifact).toHaveBeenCalledWith({
          lookup: 'session_123',
          target: 'lakebed',
          anonymousOwnerSecret: undefined,
        }),
      )
      // The lakebed fetch must NOT have happened yet (still preparing).
      expect(convexState.publishPreview).not.toHaveBeenCalled()
    })

    it('does not show a preparing spinner when the artifact is already ready', () => {
      setExportTargets([
        { target: 'lakebed', artifactReady: true, artifactStatus: 'ready' },
      ])
      const view = render(<DeploymentPanel sessionId="session_123" />)

      expect(
        view.container.querySelector(
          '[data-deployment-action="lakebed"] .animate-spin',
        ),
      ).toBeNull()
    })

    it('proceeds to publish once a preparing artifact becomes ready', async () => {
      setExportTargets([
        { target: 'lakebed', artifactReady: false, artifactStatus: 'building' },
      ])
      convexState.ensureExportArtifact.mockResolvedValueOnce({
        target: 'lakebed',
        status: 'ready',
        previewVersion: 2,
      })
      const fetchMock = lakebedJsonResponse(
        'https://lakebed-launch.lakebed.app',
      )
      vi.stubGlobal('fetch', fetchMock)

      const view = render(<DeploymentPanel sessionId="session_123" />)
      fireEvent.click(view.getByText('Publish Lakebed').closest('button')!)

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
  })
})
