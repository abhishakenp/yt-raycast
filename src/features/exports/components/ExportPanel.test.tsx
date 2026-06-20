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
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  useOptionalAuth: () => authState,
}))

vi.mock('@/features/exports/hooks/use-export-targets', () => ({
  useExportTargets: () => ({
    data: exportTargetsState.value,
    error: undefined,
    isLoading: false,
    refetch: vi.fn(),
  }),
}))

const setExportTargets = (targets: MockExportTarget[]) => {
  exportTargetsState.value = { targets }
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
    localStorage.clear()
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

  it('downloads after a clicked building artifact becomes ready', async () => {
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
    const fetchMock = vi.fn(async () => new Response('zip-bytes'))
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
    expect(view.getByText('72%')).toBeTruthy()
    expect(button?.style.backgroundImage).toContain('110deg')

    await new Promise((resolve) => window.setTimeout(resolve, 650))

    expect(exportTargetsState.ensureExportArtifact).toHaveBeenCalledWith({
      lookup: 'session_123',
      target: 'html',
      anonymousOwnerSecret: undefined,
    })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(authState.getToken).not.toHaveBeenCalled()
    expect(
      view.container.querySelector('[data-export-action="html"] .animate-spin'),
    ).toBeTruthy()

    setExportTargets([
      {
        target: 'html',
        label: 'HTML',
        ready: true,
        status: 'ready',
        requiresPayment: false,
        fileCount: 4,
        artifactReady: true,
        artifactStatus: 'ready',
        downloadUrl: '/api/sessions/session_123/download/html',
      },
    ])
    view.rerender(<ExportPanel sessionId="session_123" />)

    await waitFor(() => {
      expect(
        view.container.querySelector(
          '[data-export-action="html"] .animate-spin',
        ),
      ).toBeNull()
    })
    expect(view.queryByText('72%')).toBeNull()
    expect(clickMock).toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/sessions/session_123/download/html',
      { headers: { Authorization: 'Bearer app-token' } },
    )
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
    expect(exportTargetsState.ensureExportArtifact).toHaveBeenCalledWith({
      lookup: 'session_123',
      target: 'html',
      anonymousOwnerSecret: undefined,
    })
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
    const fetchMock = vi.fn(async () =>
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
})
