// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ExportPanel } from './ExportPanel'

type MockExportTarget = {
  target: 'html' | 'react' | 'next' | 'lakebed'
  label: string
  ready: boolean
  status: string
  requiresPayment: boolean
  fileCount: number | null
  artifactReady?: boolean
  artifactStatus?: string
  downloadUrl: string | null
}

const authState = vi.hoisted(() => ({
  getToken: vi.fn(async () => 'app-token'),
  isSignedIn: true,
}))

const exportTargetsState = vi.hoisted(() => ({
  value: {
    targets: Array<MockExportTarget>(),
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
  useOptionalAuth: () => authState,
}))

const setExportTargets = (targets: MockExportTarget[]) => {
  exportTargetsState.value = { targets }
}

const realCraftBeerLakebedExportTarget: MockExportTarget = {
  target: 'lakebed',
  label: 'Lakebed',
  ready: true,
  status: 'ready',
  requiresPayment: false,
  fileCount: 12,
  artifactReady: true,
  artifactStatus: 'ready',
  downloadUrl:
    '/api/sessions/k574ms14ma9f94keq30r7dq24x89n1k2/download/lakebed',
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

describe('ExportPanel', () => {
  beforeEach(() => {
    installLocalStorage()
    authState.getToken.mockClear()
    authState.isSignedIn = true
    exportTargetsState.ensureExportArtifact.mockClear()
    setExportTargets([])
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders reactive Convex export target state', () => {
    setExportTargets([
      {
        target: 'lakebed',
        label: 'Lakebed',
        ready: false,
        status: 'queued',
        requiresPayment: false,
        fileCount: null,
        artifactReady: false,
        artifactStatus: 'building',
        downloadUrl: null,
      },
    ])

    const view = render(<ExportPanel sessionId="session_123" />)

    expect(view.getByText('Project Export')).toBeTruthy()
    expect(view.getByText('Lakebed')).toBeTruthy()
    expect(view.getByText('Lakebed project bundle')).toBeTruthy()
    expect(view.queryByText('72%')).toBeNull()
    expect(view.queryByText('Download')).toBeNull()
    expect(
      view.container.querySelector('[data-export-action="lakebed"]'),
    ).toBeTruthy()
    expect(view.queryByText('Preparing in background')).toBeNull()
    expect(view.queryByText('building')).toBeNull()
    expect(view.queryByText('queued')).toBeNull()
  })

  it('downloads through the API when a clicked artifact is still building', async () => {
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
        downloadUrl: null,
      },
    ])
    const clickMock = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    Object.defineProperty(window.URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:export'),
    })
    Object.defineProperty(window.URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    })
    const fetchMock = vi.fn(async (url: string | URL) => {
      const path = String(url)
      if (path.endsWith('/export')) {
        return Response.json({
          ok: true,
          downloadUrl: '/api/sessions/session_123/download/html',
        })
      }
      if (path.endsWith('/download/html')) {
        return new Response('zip-bytes')
      }
      return Response.json({ error: `Unexpected ${path}` }, { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const view = render(<ExportPanel sessionId="session_123" />)
    const button = view.getByText('HTML').closest('button')
    expect(button).toBeTruthy()
    expect(view.queryByText('72%')).toBeNull()
    if (button) fireEvent.click(button)

    await waitFor(() => {
      expect(
        view.container.querySelector(
          '[data-export-action="html"] .animate-spin',
        ),
      ).toBeTruthy()
    })
    expect(
      view.container.querySelector('.export-target-glyph .animate-spin'),
    ).toBeNull()
    await waitFor(() => expect(clickMock).toHaveBeenCalled())
    expect(exportTargetsState.ensureExportArtifact).not.toHaveBeenCalled()
    expect(view.queryByText('72%')).toBeNull()
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      '/api/sessions/session_123/export',
      '/api/sessions/session_123/download/html',
    ])
  })

  it('continues the same click when a pending artifact is already ready', async () => {
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
        downloadUrl: null,
      },
    ])
    exportTargetsState.ensureExportArtifact.mockResolvedValueOnce({
      target: 'html',
      status: 'ready',
      previewVersion: 2,
    })
    const clickMock = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    Object.defineProperty(window.URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:export'),
    })
    Object.defineProperty(window.URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    })
    const fetchMock = vi.fn(async (url: string | URL) => {
      const path = String(url)
      if (path.endsWith('/export')) {
        return Response.json({ ok: true, downloadUrl: '/download/html' })
      }
      if (path === '/download/html') {
        return new Response('zip-bytes')
      }
      return Response.json({ error: `Unexpected ${path}` }, { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const view = render(<ExportPanel sessionId="session_123" />)
    expect(view.queryByText('5 files ready')).toBeNull()
    const button = view.getByText('HTML').closest('button')
    expect(button).toBeTruthy()
    if (button) fireEvent.click(button)

    await waitFor(() => expect(clickMock).toHaveBeenCalled())
    expect(exportTargetsState.ensureExportArtifact).not.toHaveBeenCalled()
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      '/api/sessions/session_123/export',
      '/download/html',
    ])
  })

  it('downloads immediately from a ready artifact URL', async () => {
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
        downloadUrl: '/api/sessions/session_123/download/html',
      },
    ])
    const clickMock = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    const createObjectUrl = vi.fn(() => 'blob:export')
    const revokeObjectUrl = vi.fn()
    Object.defineProperty(window.URL, 'createObjectURL', {
      configurable: true,
      value: createObjectUrl,
    })
    Object.defineProperty(window.URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectUrl,
    })
    const fetchMock = vi.fn(
      async () =>
        new Response('zip-bytes', {
          headers: {
            'content-disposition': 'attachment; filename="site.zip"',
          },
        }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const view = render(<ExportPanel sessionId="session_123" />)
    const button = view.getByText('HTML').closest('button')
    expect(button).toBeTruthy()
    if (button) fireEvent.click(button)

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sessions/session_123/download/html',
        { headers: { Authorization: 'Bearer app-token' } },
      ),
    )
    expect(createObjectUrl).toHaveBeenCalled()
    expect(clickMock).toHaveBeenCalled()
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:export')
  })

  it('downloads a real Convex-shaped Lakebed export target through the session API', async () => {
    setExportTargets([realCraftBeerLakebedExportTarget])
    const clickMock = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    const createObjectUrl = vi.fn((_blob: Blob) => 'blob:craft-beer-lakebed')
    const revokeObjectUrl = vi.fn()
    Object.defineProperty(window.URL, 'createObjectURL', {
      configurable: true,
      value: createObjectUrl,
    })
    Object.defineProperty(window.URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectUrl,
    })
    const fetchMock = vi.fn(
      async () =>
        new Response('real-lakebed-zip-bytes', {
          headers: {
            'content-disposition':
              'attachment; filename="ship-fast-k574ms14ma9f94keq30r7dq24x89n1k2-lakebed.zip"',
          },
        }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const view = render(
      <ExportPanel sessionId="k574ms14ma9f94keq30r7dq24x89n1k2" />,
    )
    const button = view.getByText('Lakebed').closest('button')
    expect(button).toBeTruthy()
    expect(
      view.container.querySelector('[data-export-action="lakebed"]'),
    ).toBeTruthy()
    if (button) fireEvent.click(button)

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sessions/k574ms14ma9f94keq30r7dq24x89n1k2/download/lakebed',
        { headers: { Authorization: 'Bearer app-token' } },
      ),
    )
    expect(clickMock).toHaveBeenCalled()
    expect(createObjectUrl.mock.calls[0]?.[0]).toMatchObject({
      size: 'real-lakebed-zip-bytes'.length,
      type: 'text/plain;charset=utf-8',
    })
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:craft-beer-lakebed')
  })
})
