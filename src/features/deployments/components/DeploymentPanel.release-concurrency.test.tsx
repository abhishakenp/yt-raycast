// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

interface DeferredEnsureResult {
  promise: Promise<EnsureResult>
  resolve: (result: EnsureResult) => void
}

interface EnsureResult {
  previewVersion: number
  status: string
  target: 'lakebed'
}

interface ConvexState {
  deploymentStatus: null
  ensureExportArtifact: ReturnType<typeof vi.fn>
  exportTargets: {
    isPrivate: boolean
    targets: Array<{
      artifactReady: boolean
      artifactStatus: string
      deployedUrl?: null
      target: 'html' | 'lakebed'
    }>
  }
  lakebedEntitlement: { requiresPayment: boolean }
  publishPreview: ReturnType<typeof vi.fn>
  refs: {
    deploymentStatus: object
    ensureArtifact: object
    exportTargets: object
    lakebedEntitlement: object
    publishPreview: object
    commerceConfig: object
  }
}

const convexState = vi.hoisted<ConvexState>(function createConvexState() {
  return {
    deploymentStatus: null,
    ensureExportArtifact: vi.fn(),
    exportTargets: {
      isPrivate: false,
      targets: [],
    },
    lakebedEntitlement: { requiresPayment: false },
    publishPreview: vi.fn(),
    refs: {
      deploymentStatus: {},
      ensureArtifact: {},
      exportTargets: {},
      lakebedEntitlement: {},
      publishPreview: {},
      commerceConfig: {},
    },
  }
})

vi.mock('../../../../convex/_generated/api', function mockConvexApi() {
  return {
    api: {
      sessions: {
        ensureExportArtifactByLookup: convexState.refs.ensureArtifact,
        getDeploymentStatusByLookup: convexState.refs.deploymentStatus,
        getExportTargets: convexState.refs.exportTargets,
        getLakebedDeploymentEntitlementByLookup:
          convexState.refs.lakebedEntitlement,
        publishPreviewByLookup: convexState.refs.publishPreview,
        getCommerceConfig: convexState.refs.commerceConfig,
      },
    },
  }
})

vi.mock('convex/react', function mockConvexReact() {
  function useMutation(reference: unknown) {
    if (reference === convexState.refs.ensureArtifact) {
      return convexState.ensureExportArtifact
    }
    if (reference === convexState.refs.publishPreview) {
      return convexState.publishPreview
    }
    throw new Error('Unknown mutation reference')
  }

  function useQuery(reference: unknown) {
    if (reference === convexState.refs.exportTargets) {
      return convexState.exportTargets
    }
    if (reference === convexState.refs.deploymentStatus) {
      return convexState.deploymentStatus
    }
    if (reference === convexState.refs.lakebedEntitlement) {
      return convexState.lakebedEntitlement
    }
    if (reference === convexState.refs.commerceConfig) return null
    throw new Error('Unknown query reference')
  }

  return {
    useMutation,
    useQuery,
  }
})

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

import { DeploymentPanel } from './DeploymentPanel'

function createDeferredEnsureResult(): DeferredEnsureResult {
  function unresolvedEnsure(_result: EnsureResult) {}
  let resolvePromise = unresolvedEnsure
  const promise = new Promise<EnsureResult>(function captureResolve(resolve) {
    resolvePromise = resolve
  })
  return { promise, resolve: resolvePromise }
}

function queuedResult(): EnsureResult {
  return { previewVersion: 2, status: 'queued', target: 'lakebed' }
}

describe('DeploymentPanel release concurrency', () => {
  beforeEach(() => {
    convexState.deploymentStatus = null
    convexState.exportTargets = {
      isPrivate: false,
      targets: [
        {
          artifactReady: true,
          artifactStatus: 'ready',
          target: 'html',
        },
        {
          artifactReady: false,
          artifactStatus: 'building',
          deployedUrl: null,
          target: 'lakebed',
        },
      ],
    }
    convexState.ensureExportArtifact.mockReset()
    convexState.publishPreview.mockReset()
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('disables Lakebed publishing while artifact preparation is in flight', async () => {
    const pendingEnsure = createDeferredEnsureResult()
    convexState.ensureExportArtifact.mockImplementation(
      function ensureExportArtifact() {
        return pendingEnsure.promise
      },
    )
    const view = render(<DeploymentPanel sessionId="release-session" />)
    const publishButton = view.getByRole('button', {
      name: /Publish Lakebed/,
    })

    fireEvent.click(publishButton)
    const wasDisabledDuringPreparation = publishButton.hasAttribute('disabled')
    pendingEnsure.resolve(queuedResult())
    await waitFor(function waitForPreparation() {
      expect(convexState.ensureExportArtifact).toHaveBeenCalledTimes(1)
    })

    expect(wasDisabledDuringPreparation).toBe(true)
  })

  it('coalesces repeated Lakebed preparation clicks into one mutation', async () => {
    const pendingEnsure = createDeferredEnsureResult()
    convexState.ensureExportArtifact.mockImplementation(
      function ensureExportArtifact() {
        return pendingEnsure.promise
      },
    )
    const view = render(<DeploymentPanel sessionId="release-session" />)
    const publishButton = view.getByRole('button', {
      name: /Publish Lakebed/,
    })

    fireEvent.click(publishButton)
    fireEvent.click(publishButton)
    pendingEnsure.resolve(queuedResult())
    await waitFor(function waitForPreparation() {
      expect(convexState.ensureExportArtifact).toHaveBeenCalled()
    })

    expect(convexState.ensureExportArtifact).toHaveBeenCalledTimes(1)
  })

  it('announces asynchronous ShipFast publishing failures', async () => {
    convexState.publishPreview.mockRejectedValue(
      new Error('Deployment provider unavailable'),
    )
    const view = render(<DeploymentPanel sessionId="release-session" />)

    fireEvent.click(view.getByRole('button', { name: /Publish ShipFast/ }))
    await waitFor(function waitForErrorMessage() {
      expect(view.getByText('Deployment provider unavailable')).toBeTruthy()
    })

    expect(view.getByRole('alert').textContent).toContain(
      'Deployment provider unavailable',
    )
  })
})
