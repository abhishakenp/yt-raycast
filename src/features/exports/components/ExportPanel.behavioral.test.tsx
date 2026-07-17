// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ExportPanel, artifactProgressPercent } from './ExportPanel'
import { persistAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

type ExportTargetTuple = {
  target: 'html' | 'react' | 'next' | 'lakebed'
  label: string
  ready: boolean
  status: string
  requiresPayment: boolean
  fileCount: number | null
  artifactReady?: boolean
  artifactStatus?: string
  artifactError?: string
  artifactProgressStage?: string
  artifactProgressPercent?: number
  artifactProgressStartedAt?: number
  previewVersion?: number | null
  currentPreviewVersion?: number | null
  downloadUrl: string | null
}

const authState = vi.hoisted(() => ({
  getToken: vi.fn(async () => 'app-token'),
  isSignedIn: true,
}))

const exportTargetsState = vi.hoisted(() => ({
  value: { targets: Array<ExportTargetTuple>() },
  // When set to undefined, useQuery reports the Convex load as still pending.
  queryResult: undefined as { targets: ExportTargetTuple[] } | undefined,
  ensureExportArtifact: vi.fn(async () => ({
    target: 'html',
    status: 'queued',
    previewVersion: 2,
  })),
}))

vi.mock('convex/react', () => ({
  useMutation: () => exportTargetsState.ensureExportArtifact,
  useQuery: () => exportTargetsState.queryResult,
}))

vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      getExportTargets: 'mocked-sessions-getExportTargets',
    },
  },
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  useOptionalAuth: () => authState,
}))

function setExportTargets(targets: ExportTargetTuple[]) {
  exportTargetsState.value = { targets }
  exportTargetsState.queryResult = { targets }
}

const setLoading = () => {
  exportTargetsState.queryResult = undefined
}

function target(
  overrides: Partial<ExportTargetTuple> & {
    target: ExportTargetTuple['target']
  },
): ExportTargetTuple {
  return {
    label:
      overrides.target === 'html'
        ? 'HTML'
        : overrides.target === 'react'
          ? 'React'
          : overrides.target === 'next'
            ? 'Next.js'
            : 'Lakebed',
    ready: false,
    status: 'available',
    requiresPayment: false,
    fileCount: null,
    artifactReady: false,
    artifactStatus: 'not_ready',
    downloadUrl: null,
    ...overrides,
  }
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

const installUrlMocks = () => {
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
  return { createObjectUrl, revokeObjectUrl }
}

const silenceAnchorClick = () =>
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

const deferred = () => {
  let resolve!: (value: Response) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<Response>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('ExportPanel behavioral', () => {
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

  it('shows all 4 export targets (HTML, React, Next.js, Lakebed) with icons', () => {
    setExportTargets([
      target({ target: 'html' }),
      target({ target: 'react' }),
      target({ target: 'next' }),
      target({ target: 'lakebed' }),
    ])

    const view = render(<ExportPanel sessionId="session_123" />)

    expect(view.getByText('HTML')).toBeTruthy()
    expect(view.getByText('React')).toBeTruthy()
    expect(view.getByText('Next.js')).toBeTruthy()
    expect(view.getByText('Lakebed')).toBeTruthy()

    // Each target renders its icon glyph container and action slot.
    for (const name of ['html', 'react', 'next', 'lakebed']) {
      expect(
        view.container.querySelector(
          `[data-export-target="${name}"] .export-target-glyph svg`,
        ),
      ).toBeTruthy()
      expect(
        view.container.querySelector(`[data-export-action="${name}"]`),
      ).toBeTruthy()
    }
  })

  it('status "ready" shows the download action icon', () => {
    setExportTargets([
      target({
        target: 'html',
        ready: true,
        status: 'ready',
        artifactReady: true,
        artifactStatus: 'ready',
        downloadUrl: '/api/sessions/session_123/download/html',
      }),
    ])

    const view = render(<ExportPanel sessionId="session_123" />)

    // Ready targets render an empty status label (statusLabel returns '' when ready).
    const statusLine = view.container.querySelector(
      '[data-export-target="html"] .font-mono',
    )
    expect(statusLine?.textContent ?? '').toBe('')
    // Download glyph is rendered in the action slot (lucide Download svg).
    const actionSlot = view.container.querySelector(
      '[data-export-action="html"]',
    )
    expect(actionSlot).toBeTruthy()
    expect(actionSlot?.querySelector('svg')).toBeTruthy()
    // No lock, no warning, no spinner for a ready target.
    expect(actionSlot?.querySelector('.animate-spin')).toBeNull()
  })

  it('status "building" shows the real server-pushed stage + percentage when activated', async () => {
    setExportTargets([
      target({
        target: 'html',
        ready: false,
        status: 'available',
        artifactReady: false,
        artifactStatus: 'building',
        artifactProgressStage: 'Generating components',
        artifactProgressPercent: 76,
        downloadUrl: null,
      }),
    ])
    const pending = deferred()
    const fetchMock = vi.fn(async (url) => {
      if (String(url).endsWith('/export')) return pending.promise
      return new Response('zip-bytes')
    })
    vi.stubGlobal('fetch', fetchMock)
    installUrlMocks()

    const view = render(<ExportPanel sessionId="session_123" />)
    const button = view.getByText('HTML').closest('button')
    expect(button).toBeTruthy()
    if (button) fireEvent.click(button)

    await waitFor(() =>
      expect(view.getByText('Generating components · 76%')).toBeTruthy(),
    )
    // Spinner shown while actively working.
    expect(
      view.container.querySelector('[data-export-action="html"] .animate-spin'),
    ).toBeTruthy()

    pending.resolve(Response.json({ ok: true }))
  })

  it('status "queued" shows the real early-stage progress when activated', async () => {
    setExportTargets([
      target({
        target: 'react',
        ready: false,
        status: 'available',
        artifactReady: false,
        artifactStatus: 'queued',
        artifactProgressStage: 'Starting build',
        artifactProgressPercent: 4,
        downloadUrl: null,
      }),
    ])
    const pending = deferred()
    const fetchMock = vi.fn(async (url) => {
      if (String(url).endsWith('/export')) return pending.promise
      return new Response('zip-bytes')
    })
    vi.stubGlobal('fetch', fetchMock)
    installUrlMocks()

    const view = render(<ExportPanel sessionId="session_123" />)
    const button = view.getByText('React').closest('button')
    expect(button).toBeTruthy()
    if (button) fireEvent.click(button)

    await waitFor(() =>
      expect(view.getByText('Starting build · 4%')).toBeTruthy(),
    )

    pending.resolve(Response.json({ ok: true }))
  })

  it('status "failed" shows the artifact error message', () => {
    setExportTargets([
      target({
        target: 'next',
        ready: false,
        status: 'available',
        artifactReady: false,
        artifactStatus: 'failed',
        artifactError: 'Build exploded',
        downloadUrl: null,
      }),
    ])

    const view = render(<ExportPanel sessionId="session_123" />)

    expect(view.getByText('Build exploded')).toBeTruthy()
  })

  it('status "stale" shows a regenerate prompt', () => {
    setExportTargets([
      target({
        target: 'lakebed',
        ready: false,
        status: 'stale',
        artifactReady: true,
        artifactStatus: 'ready',
        currentPreviewVersion: 4,
        downloadUrl: '/api/sessions/session_123/download/lakebed',
      }),
    ])

    const view = render(<ExportPanel sessionId="session_123" />)

    expect(view.getByText('Regenerate for preview v4')).toBeTruthy()
    // Stale targets surface a warning glyph instead of the plain download icon.
    const actionSlot = view.container.querySelector(
      '[data-export-action="lakebed"]',
    )
    expect(actionSlot?.querySelector('svg')).toBeTruthy()
    expect(actionSlot?.querySelector('.animate-spin')).toBeNull()
  })

  it('download button triggers the blob + anchor download flow when ready', async () => {
    setExportTargets([
      target({
        target: 'html',
        ready: true,
        status: 'ready',
        artifactReady: true,
        artifactStatus: 'ready',
        downloadUrl: '/api/sessions/session_123/download/html',
      }),
    ])
    const clickMock = silenceAnchorClick()
    const { createObjectUrl, revokeObjectUrl } = installUrlMocks()
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

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/sessions/session_123/download/html',
      { headers: { Authorization: 'Bearer app-token' } },
    )
    expect(createObjectUrl).toHaveBeenCalled()
    expect(clickMock).toHaveBeenCalled()
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:export')
  })

  it('shows a stable download error and does not create a browser download when the ready download route returns HTML', async () => {
    setExportTargets([
      target({
        target: 'html',
        ready: true,
        status: 'ready',
        artifactReady: true,
        artifactStatus: 'ready',
        downloadUrl: '/api/sessions/session_123/download/html',
      }),
    ])
    const clickMock = silenceAnchorClick()
    const { createObjectUrl, revokeObjectUrl } = installUrlMocks()
    const fetchMock = vi.fn(
      async () =>
        new Response('<!doctype html><h1>Function crashed</h1>', {
          headers: { 'content-type': 'text/html' },
          status: 500,
        }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const view = render(<ExportPanel sessionId="session_123" />)
    fireEvent.click(view.getByText('HTML').closest('button')!)

    await waitFor(() => expect(view.getByText('Download failed')).toBeTruthy())
    expect(view.container.textContent).not.toMatch(
      /doctype|function crashed|unexpected token|valid json/i,
    )
    expect(createObjectUrl).not.toHaveBeenCalled()
    expect(clickMock).not.toHaveBeenCalled()
    expect(revokeObjectUrl).not.toHaveBeenCalled()
  })

  it('does not download a 202 building JSON response as a file', async () => {
    setExportTargets([
      target({
        target: 'html',
        ready: true,
        status: 'ready',
        artifactReady: true,
        artifactStatus: 'ready',
        downloadUrl: '/api/sessions/session_123/download/html',
      }),
    ])
    const clickMock = silenceAnchorClick()
    const { createObjectUrl, revokeObjectUrl } = installUrlMocks()
    const fetchMock = vi.fn(async () =>
      Response.json(
        { error: 'Export is still building.', status: 'building' },
        { status: 202 },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    const view = render(<ExportPanel sessionId="session_123" />)
    fireEvent.click(view.getByText('HTML').closest('button')!)

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(createObjectUrl).not.toHaveBeenCalled()
    expect(clickMock).not.toHaveBeenCalled()
    expect(revokeObjectUrl).not.toHaveBeenCalled()
    expect(view.getByText(/export is still building/i)).toBeTruthy()
  })

  it('sends the persisted anonymous owner secret on ready downloads and new export creation', async () => {
    persistAnonymousOwnerSecret(
      window.localStorage,
      'k574ms14ma9f94keq30r7dq24x89n1k2',
      'owner-secret',
    )
    setExportTargets([
      target({
        target: 'html',
        ready: true,
        status: 'ready',
        artifactReady: true,
        artifactStatus: 'ready',
        downloadUrl:
          '/api/sessions/k574ms14ma9f94keq30r7dq24x89n1k2/download/html',
      }),
      target({
        target: 'react',
        ready: false,
        status: 'available',
        artifactReady: false,
        artifactStatus: 'not_ready',
        downloadUrl: null,
      }),
    ])
    silenceAnchorClick()
    installUrlMocks()
    const fetchMock = vi.fn(async (url, _init) => {
      const path = String(url)
      if (path.endsWith('/download/html')) {
        return new Response('zip-bytes', {
          headers: {
            'content-disposition': 'attachment; filename="brewery.zip"',
          },
        })
      }
      if (path.endsWith('/export')) {
        return Response.json({ ok: true })
      }
      return Response.json({ error: 'unexpected' }, { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const view = render(
      <ExportPanel sessionId="k574ms14ma9f94keq30r7dq24x89n1k2" />,
    )
    fireEvent.click(view.getByText('HTML').closest('button')!)
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sessions/k574ms14ma9f94keq30r7dq24x89n1k2/download/html',
        {
          headers: {
            Authorization: 'Bearer app-token',
            'x-ship-fast-owner-secret': 'owner-secret',
          },
        },
      ),
    )

    fireEvent.click(view.getByText('React').closest('button')!)
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sessions/k574ms14ma9f94keq30r7dq24x89n1k2/export',
        expect.objectContaining({
          body: JSON.stringify({
            target: 'react',
            anonymousOwnerSecret: 'owner-secret',
          }),
          headers: {
            Authorization: 'Bearer app-token',
            'Content-Type': 'application/json',
            'x-ship-fast-owner-secret': 'owner-secret',
          },
          method: 'POST',
        }),
      ),
    )
  })

  it('payment required shows the pay/upgrade action instead of download', async () => {
    setExportTargets([
      target({
        target: 'next',
        ready: false,
        status: 'available',
        requiresPayment: true,
        artifactReady: true,
        artifactStatus: 'ready',
        downloadUrl: null,
      }),
    ])
    const fetchMock = vi.fn(async (url) => {
      const path = String(url)
      if (path.endsWith('/export')) {
        return Response.json({ ok: true })
      }
      return Response.json({ error: 'unexpected download' }, { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)
    installUrlMocks()

    const view = render(<ExportPanel sessionId="session_123" />)

    // Payment-required status label is rendered.
    expect(view.getByText('Payment required')).toBeTruthy()
    // The action slot renders the lock glyph (svg present, no spinner, no download-only marker).
    const actionSlot = view.container.querySelector(
      '[data-export-action="next"]',
    )
    expect(actionSlot?.querySelector('svg')).toBeTruthy()
    expect(actionSlot?.querySelector('.animate-spin')).toBeNull()

    const button = view.getByText('Next.js').closest('button')
    expect(button).toBeTruthy()
    if (button) fireEvent.click(button)

    // Clicking a paywalled target triggers the export/create flow, never a download.
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sessions/session_123/export',
        expect.objectContaining({ method: 'POST' }),
      ),
    )
    const calledUrls = fetchMock.mock.calls.map(([url]) => String(url))
    expect(calledUrls).not.toContain('/api/sessions/session_123/download/next')
  })

  it('shows a stable export error when create-export returns malformed HTML instead of JSON', async () => {
    setExportTargets([
      target({
        target: 'react',
        ready: false,
        status: 'available',
        artifactReady: false,
        artifactStatus: 'not_ready',
        downloadUrl: null,
      }),
    ])
    const fetchMock = vi.fn(
      async () =>
        new Response('<!doctype html><h1>Gateway failure</h1>', {
          headers: { 'content-type': 'text/html' },
          status: 502,
        }),
    )
    vi.stubGlobal('fetch', fetchMock)
    installUrlMocks()

    const view = render(<ExportPanel sessionId="session_123" />)
    const button = view.getByText('React').closest('button')
    expect(button).toBeTruthy()
    if (button) fireEvent.click(button)

    await waitFor(() => expect(view.getByText(/export failed/i)).toBeTruthy())
    expect(view.container.textContent).not.toMatch(
      /unexpected token|valid json|doctype/i,
    )
    expect(view.container.querySelector('.border-rose-500\\/30')).toBeTruthy()
  })

  it('stale export shows regenerate prompt and does not run the download flow on click', async () => {
    setExportTargets([
      target({
        target: 'lakebed',
        ready: false,
        status: 'stale',
        artifactReady: true,
        artifactStatus: 'ready',
        currentPreviewVersion: null,
        downloadUrl: '/api/sessions/session_123/download/lakebed',
      }),
    ])
    const fetchMock = vi.fn(async (url) => {
      const path = String(url)
      if (path.endsWith('/export')) {
        return Response.json({ ok: true })
      }
      return Response.json({ error: 'unexpected download' }, { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)
    installUrlMocks()

    const view = render(<ExportPanel sessionId="session_123" />)

    // No current preview version → generic regenerate prompt.
    expect(view.getByText('Regenerate for latest preview')).toBeTruthy()

    const button = view.getByText('Lakebed').closest('button')
    expect(button).toBeTruthy()
    if (button) fireEvent.click(button)

    // Stale + not ready → createExport (regenerate), not the download URL.
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sessions/session_123/export',
        expect.objectContaining({ method: 'POST' }),
      ),
    )
    const calledUrls = fetchMock.mock.calls.map(([url]) => String(url))
    expect(calledUrls).not.toContain(
      '/api/sessions/session_123/download/lakebed',
    )
  })

  it('progress text tracks whatever real stage + percent the server last pushed', async () => {
    // These three snapshots mirror real backend stage checkpoints from
    // convex/lib/export_progress_stages.ts (loading-generator=26%,
    // parsing=38%, generating=76%) — the UI must render exactly what the
    // server computed, not a client-side status→percent guess.
    setExportTargets([
      target({
        target: 'html',
        ready: false,
        status: 'available',
        artifactReady: false,
        artifactStatus: 'building',
        artifactProgressStage: 'Loading generator',
        artifactProgressPercent: 26,
        downloadUrl: null,
      }),
    ])
    const pending = deferred()
    const fetchMock = vi.fn(async (url) => {
      if (String(url).endsWith('/export')) return pending.promise
      return new Response('zip-bytes')
    })
    vi.stubGlobal('fetch', fetchMock)
    installUrlMocks()

    const view = render(<ExportPanel sessionId="session_123" />)
    const button = view.getByText('HTML').closest('button')
    expect(button).toBeTruthy()
    if (button) fireEvent.click(button)

    await waitFor(() =>
      expect(view.getByText('Loading generator · 26%')).toBeTruthy(),
    )
    pending.resolve(Response.json({ ok: true }))

    // Wait for the active target to clear before re-rendering with next status.
    await waitFor(() =>
      expect(view.queryByText('Loading generator · 26%')).toBeNull(),
    )

    // parsing → 38%
    setExportTargets([
      target({
        target: 'html',
        ready: false,
        status: 'available',
        artifactReady: false,
        artifactStatus: 'building',
        artifactProgressStage: 'Parsing source',
        artifactProgressPercent: 38,
        downloadUrl: null,
      }),
    ])
    const pendingParsing = deferred()
    fetchMock.mockImplementation(async (url) => {
      if (String(url).endsWith('/export')) return pendingParsing.promise
      return new Response('zip-bytes')
    })
    const buttonParsing = view.getByText('HTML').closest('button')
    if (buttonParsing) fireEvent.click(buttonParsing)
    await waitFor(() =>
      expect(view.getByText('Parsing source · 38%')).toBeTruthy(),
    )
    pendingParsing.resolve(Response.json({ ok: true }))
    await waitFor(() =>
      expect(view.queryByText('Parsing source · 38%')).toBeNull(),
    )

    // generating → 76%
    setExportTargets([
      target({
        target: 'html',
        ready: false,
        status: 'available',
        artifactReady: false,
        artifactStatus: 'building',
        artifactProgressStage: 'Generating components',
        artifactProgressPercent: 76,
        downloadUrl: null,
      }),
    ])
    const pendingGenerating = deferred()
    fetchMock.mockImplementation(async (url) => {
      if (String(url).endsWith('/export')) return pendingGenerating.promise
      return new Response('zip-bytes')
    })
    const buttonGenerating = view.getByText('HTML').closest('button')
    if (buttonGenerating) fireEvent.click(buttonGenerating)
    await waitFor(() =>
      expect(view.getByText('Generating components · 76%')).toBeTruthy(),
    )
    pendingGenerating.resolve(Response.json({ ok: true }))
  })

  it('file count prop is accepted without breaking the target render', () => {
    // NOTE: The current ExportPanel source does not render fileCount in the UI.
    // This test asserts the prop is accepted and the target still renders its
    // label/summary, so adding file count data never breaks the panel.
    setExportTargets([
      target({
        target: 'html',
        ready: true,
        status: 'ready',
        artifactReady: true,
        artifactStatus: 'ready',
        fileCount: 42,
        downloadUrl: '/api/sessions/session_123/download/html',
      }),
    ])

    const view = render(<ExportPanel sessionId="session_123" />)

    expect(view.getByText('HTML')).toBeTruthy()
    expect(view.getByText('Static preview (no live data)')).toBeTruthy()
    expect(
      view.container.querySelector('[data-export-target="html"]'),
    ).toBeTruthy()
  })

  it('clicking download for one target does not affect the others', async () => {
    setExportTargets([
      target({
        target: 'html',
        ready: true,
        status: 'ready',
        artifactReady: true,
        artifactStatus: 'ready',
        downloadUrl: '/api/sessions/session_123/download/html',
      }),
      target({
        target: 'react',
        ready: true,
        status: 'ready',
        artifactReady: true,
        artifactStatus: 'ready',
        downloadUrl: '/api/sessions/session_123/download/react',
      }),
    ])
    const clickMock = silenceAnchorClick()
    installUrlMocks()
    const fetchedUrls: string[] = []
    const fetchMock = vi.fn(async (url) => {
      const path = String(url)
      fetchedUrls.push(path)
      return new Response('zip-bytes', {
        headers: {
          'content-disposition': `attachment; filename="${path}.zip"`,
        },
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const view = render(<ExportPanel sessionId="session_123" />)

    // Click HTML only.
    const htmlButton = view.getByText('HTML').closest('button')
    expect(htmlButton).toBeTruthy()
    if (htmlButton) fireEvent.click(htmlButton)

    await waitFor(() => expect(clickMock).toHaveBeenCalled())
    expect(fetchedUrls).toEqual(['/api/sessions/session_123/download/html'])
    // React target was never fetched.
    expect(fetchedUrls).not.toContain(
      '/api/sessions/session_123/download/react',
    )
    // React target still rendered and intact.
    expect(view.getByText('React')).toBeTruthy()
    expect(
      view.container.querySelector('[data-export-target="react"]'),
    ).toBeTruthy()
  })

  it('error state shows the error message in the panel', async () => {
    setExportTargets([
      target({
        target: 'html',
        ready: true,
        status: 'ready',
        artifactReady: true,
        artifactStatus: 'ready',
        downloadUrl: '/api/sessions/session_123/download/html',
      }),
    ])
    installUrlMocks()
    silenceAnchorClick()
    const fetchMock = vi.fn(
      async () => new Response('Download failed', { status: 500 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const view = render(<ExportPanel sessionId="session_123" />)
    const button = view.getByText('HTML').closest('button')
    expect(button).toBeTruthy()
    if (button) fireEvent.click(button)

    await waitFor(() => expect(view.getByText('Download failed')).toBeTruthy())
    // Error renders inside the rose error panel.
    expect(view.container.querySelector('.border-rose-500\\/30')).toBeTruthy()
  })

  it('shows a stable download error when a ready export download returns malformed HTML', async () => {
    setExportTargets([
      target({
        target: 'lakebed',
        ready: true,
        status: 'ready',
        artifactReady: true,
        artifactStatus: 'ready',
        downloadUrl: '/api/sessions/session_123/download/lakebed',
      }),
    ])
    installUrlMocks()
    silenceAnchorClick()
    const fetchMock = vi.fn(
      async () =>
        new Response('<!doctype html><h1>Gateway failure</h1>', {
          headers: { 'content-type': 'text/html' },
          status: 502,
        }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const view = render(<ExportPanel sessionId="session_123" />)
    const button = view.getByText('Lakebed').closest('button')
    expect(button).toBeTruthy()
    if (button) fireEvent.click(button)

    await waitFor(() => expect(view.getByText(/download failed/i)).toBeTruthy())
    expect(view.container.textContent).not.toMatch(/doctype|gateway failure/i)
    expect(view.container.querySelector('.border-rose-500\\/30')).toBeTruthy()
  })

  it('loading state (useQuery undefined) renders the 4 target skeletons', () => {
    setLoading()

    const view = render(<ExportPanel sessionId="session_123" />)

    // The loading fallback renders all 4 targets with their labels.
    expect(view.getByText('HTML')).toBeTruthy()
    expect(view.getByText('React')).toBeTruthy()
    expect(view.getByText('Next.js')).toBeTruthy()
    expect(view.getByText('Lakebed')).toBeTruthy()
    // No error rendered while loading.
    expect(view.queryByText(/Download failed/)).toBeNull()
    expect(view.queryByText('Payment required')).toBeNull()
  })

  it('keeps every loading target disabled until its current artifact status resolves', () => {
    setLoading()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const view = render(<ExportPanel sessionId="session_123" />)

    for (const label of ['HTML', 'React', 'Next.js', 'Lakebed']) {
      const button = view.getByText(label).closest('button')
      expect(button).not.toBeNull()
      expect(button?.hasAttribute('disabled')).toBe(true)
      if (button) fireEvent.click(button)
    }
    expect(fetchMock).not.toHaveBeenCalled()
    expect(exportTargetsState.ensureExportArtifact).not.toHaveBeenCalled()
  })
})

describe('artifactProgressPercent', () => {
  const baseTarget = {
    target: 'html' as const,
    label: 'HTML',
    status: 'available',
    requiresPayment: false,
    fileCount: null,
    downloadUrl: null,
  }

  it('regression: a stale "ready" flag from the legacy exports table never masks a genuinely in-progress rebuild', () => {
    // Real bug found via live browser verification: `ready` comes from the
    // separate `exports` table and stays true from the LAST successful
    // build while a fresh same-previewVersion force-rebuild is genuinely
    // underway in `exportArtifacts`. The percent must follow the LIVE
    // artifactStatus/artifactProgressPercent, never the stale `ready` flag.
    expect(
      artifactProgressPercent({
        ...baseTarget,
        ready: true, // stale — left over from the previous successful build
        artifactReady: false, // the fresh rebuild has NOT finished
        artifactStatus: 'building',
        artifactProgressPercent: 26,
      }),
    ).toBe(26)
  })

  it('also holds for the "queued" stage, before any progress event has landed', () => {
    expect(
      artifactProgressPercent({
        ...baseTarget,
        ready: true,
        artifactReady: false,
        artifactStatus: 'queued',
        artifactProgressPercent: 4,
      }),
    ).toBe(4)
  })

  it('returns 100 once the artifact is genuinely ready', () => {
    expect(
      artifactProgressPercent({
        ...baseTarget,
        ready: true,
        artifactReady: true,
        artifactStatus: 'ready',
        artifactProgressPercent: 100,
      }),
    ).toBe(100)
  })

  it('falls back to the legacy ready flag only outside an active build (e.g. failed/not_ready)', () => {
    expect(
      artifactProgressPercent({
        ...baseTarget,
        ready: true,
        artifactReady: false,
        artifactStatus: 'failed',
      }),
    ).toBe(100)
  })
})
