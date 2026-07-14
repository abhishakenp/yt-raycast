// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

interface DeferredResponse {
  promise: Promise<Response>
  resolve: (response: Response) => void
}

interface ExportTarget {
  target: 'html' | 'react' | 'next' | 'lakebed'
  label: string
  ready: boolean
  status: string
  requiresPayment: boolean
  fileCount: number | null
  artifactReady: boolean
  artifactStatus: string
  downloadUrl: string | null
}

interface ExportTargetsState {
  queryResult: { targets: ExportTarget[] }
}

const exportTargetsState = vi.hoisted<ExportTargetsState>(
  function createExportTargetsState() {
    return { queryResult: { targets: [] } }
  },
)

vi.mock('convex/react', function mockConvexReact() {
  return {
    useQuery: function useQuery() {
      return exportTargetsState.queryResult
    },
  }
})

vi.mock('../../../../convex/_generated/api', function mockConvexApi() {
  return {
    api: { sessions: { getExportTargets: 'getExportTargets' } },
  }
})

vi.mock('@/shared/auth/use-optional-auth', function mockOptionalAuth() {
  return {
    useOptionalAuth: function useOptionalAuth() {
      return {
        getToken: vi.fn(async function getToken() {
          return null
        }),
        isSignedIn: false,
      }
    },
  }
})

import { ExportPanel } from './ExportPanel'

function createTarget(): ExportTarget {
  return {
    artifactReady: false,
    artifactStatus: 'not_ready',
    downloadUrl: null,
    fileCount: null,
    label: 'HTML',
    ready: false,
    requiresPayment: false,
    status: 'available',
    target: 'html',
  }
}

function createReadyTarget(): ExportTarget {
  return {
    ...createTarget(),
    artifactReady: true,
    artifactStatus: 'ready',
    downloadUrl: '/api/exports/release-session/html',
    fileCount: 1,
    ready: true,
  }
}

function createJsonResponse(
  body: Record<string, unknown>,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status,
  })
}

function createDeferredResponse(): DeferredResponse {
  function unresolvedResponse(_response: Response) {}
  let resolvePromise = unresolvedResponse
  const promise = new Promise<Response>(function captureResolve(resolve) {
    resolvePromise = resolve
  })
  return { promise, resolve: resolvePromise }
}

describe('ExportPanel release concurrency', () => {
  beforeEach(() => {
    exportTargetsState.queryResult = { targets: [createTarget()] }
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('disables export actions while creation is in flight', async () => {
    const pendingResponse = createDeferredResponse()
    const fetchExport = vi.fn(function fetchExport() {
      return pendingResponse.promise
    })
    vi.stubGlobal('fetch', fetchExport)
    const view = render(<ExportPanel sessionId="release-session" />)
    const exportButton = view.getByRole('button', { name: /HTML/ })

    fireEvent.click(exportButton)
    const wasDisabledDuringRequest = exportButton.hasAttribute('disabled')
    pendingResponse.resolve(createJsonResponse({}))
    await waitFor(function waitForRequestCompletion() {
      expect(fetchExport).toHaveBeenCalledTimes(1)
    })

    expect(wasDisabledDuringRequest).toBe(true)
  })

  it('coalesces rapid repeated clicks into one export request', async () => {
    const fetchExport = vi.fn(async function fetchExport() {
      return createJsonResponse({})
    })
    vi.stubGlobal('fetch', fetchExport)
    const view = render(<ExportPanel sessionId="release-session" />)
    const exportButton = view.getByRole('button', { name: /HTML/ })

    fireEvent.click(exportButton)
    fireEvent.click(exportButton)

    await waitFor(function waitForRequests() {
      expect(fetchExport).toHaveBeenCalled()
    })
    expect(fetchExport).toHaveBeenCalledTimes(1)
  })

  it('announces asynchronous export failures to assistive technology', async () => {
    const fetchExport = vi.fn(async function fetchExport() {
      return createJsonResponse({ error: 'Exporter unavailable' }, 503)
    })
    vi.stubGlobal('fetch', fetchExport)
    const view = render(<ExportPanel sessionId="release-session" />)

    fireEvent.click(view.getByRole('button', { name: /HTML/ }))
    await waitFor(function waitForErrorMessage() {
      expect(view.getByText('Exporter unavailable')).toBeTruthy()
    })

    expect(view.getByRole('alert').textContent).toContain(
      'Exporter unavailable',
    )
  })

  it('cleans up browser download resources when the click is blocked', async () => {
    exportTargetsState.queryResult = { targets: [createReadyTarget()] }
    vi.stubGlobal(
      'fetch',
      vi.fn(async function fetchDownload() {
        return new Response(new Uint8Array([80, 75, 3, 4]), {
          headers: { 'content-type': 'application/zip' },
          status: 200,
        })
      }),
    )
    const createObjectUrl = vi
      .spyOn(window.URL, 'createObjectURL')
      .mockReturnValue('blob:release-download')
    const revokeObjectUrl = vi.spyOn(window.URL, 'revokeObjectURL')
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      function blockDownload() {
        throw new Error('Browser blocked download')
      },
    )
    const view = render(<ExportPanel sessionId="release-session" />)

    fireEvent.click(view.getByRole('button', { name: /HTML/ }))
    await waitFor(function waitForBrowserError() {
      expect(view.getByText('Browser blocked download')).toBeTruthy()
    })

    expect(createObjectUrl).toHaveBeenCalledTimes(1)
    expect.soft(document.querySelector('a[download]')).toBeNull()
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:release-download')
  })
})
