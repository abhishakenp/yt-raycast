import { beforeEach, describe, expect, it, vi } from 'vitest'

const artifactFileMocks = vi.hoisted(() => ({
  buildDownloadFromArtifactFiles: vi.fn(),
  buildOpenUIArtifactFiles: vi.fn(),
}))

vi.mock('../services/openui-artifact-files', () => artifactFileMocks)

import { exportGeneratorRevision } from '../services/export-generator-revision'
import { createExportResponse } from './create-export-response'

type Target = 'html' | 'lakebed' | 'next' | 'react'

type ReadyOptions = {
  artifactContentType?: string
  artifactFilename?: string
  artifactPreviewVersion?: number
  generatorRevision?: string
  storageUrl?: string
  target?: Target
}

type ReadyDownloadFactory = (options?: ReadyOptions) => {
  artifact: {
    contentType: string
    filename: string
    generatorRevision?: string
    previewVersion: number
    status: string
  }
  export: {
    previewVersion: number
    requiresPayment: boolean
    status: string
  }
  latestPreviewVersion: number
  storageUrl: string
}

const readyDownload: ReadyDownloadFactory = (options = {}) => {
  const target = options.target ?? 'react'
  const generatorRevision =
    options.generatorRevision ?? exportGeneratorRevision(target)
  return {
    export: {
      status: 'ready',
      requiresPayment: false,
      previewVersion: 7,
    },
    artifact: {
      status: 'ready',
      filename:
        options.artifactFilename ??
        (target === 'html' ? 'index.html' : `release-${target}.zip`),
      contentType:
        options.artifactContentType ??
        (target === 'html' ? 'text/html; charset=utf-8' : 'application/zip'),
      previewVersion: options.artifactPreviewVersion ?? 7,
      ...(generatorRevision === '' ? {} : { generatorRevision }),
    },
    storageUrl: options.storageUrl ?? `https://storage.release.test/${target}`,
    latestPreviewVersion: 7,
  }
}

const queryMock = vi.fn()
const setAuthMock = vi.fn()
const client = { query: queryMock, setAuth: setAuthMock }

function fetchResponse(body: BodyInit | null, init?: ResponseInit) {
  const fetchMock = vi.fn(async () => new Response(body, init))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

beforeEach(() => {
  queryMock.mockReset()
  setAuthMock.mockReset()
  artifactFileMocks.buildDownloadFromArtifactFiles.mockReset()
  artifactFileMocks.buildOpenUIArtifactFiles.mockReset()
  vi.unstubAllGlobals()
})

describe('cached export release integrity', () => {
  it('rejects ready artifacts that have no generator revision', async () => {
    const payload = readyDownload({ generatorRevision: '' })
    queryMock.mockResolvedValueOnce(payload)
    const fetchMock = fetchResponse(new Uint8Array([80, 75, 5, 6]))

    const response = await createExportResponse(
      'release-session',
      'react',
      client,
    )

    expect(response.status).toBe(409)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects a cached artifact built from a different preview revision', async () => {
    queryMock.mockResolvedValueOnce(
      readyDownload({ artifactPreviewVersion: 6 }),
    )
    const fetchMock = fetchResponse(new Uint8Array([80, 75, 5, 6]))

    const response = await createExportResponse(
      'release-session',
      'react',
      client,
    )

    expect(response.status).toBe(409)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does not return an empty cached ZIP as a successful download', async () => {
    queryMock.mockResolvedValueOnce(readyDownload()).mockResolvedValueOnce(null)
    fetchResponse(new Uint8Array())

    const response = await createExportResponse(
      'release-session',
      'react',
      client,
    )

    expect(response.status).toBe(502)
    expect(response.headers.get('content-disposition')).toBeNull()
  })

  it('does not return corrupt cached bytes as an application/zip download', async () => {
    queryMock.mockResolvedValueOnce(readyDownload()).mockResolvedValueOnce(null)
    fetchResponse(new TextEncoder().encode('not a ZIP archive'))

    const response = await createExportResponse(
      'release-session',
      'react',
      client,
    )

    expect(response.status).toBe(502)
    expect(response.headers.get('content-disposition')).toBeNull()
  })

  it('does not publish cached OpenUI renderer-error HTML', async () => {
    queryMock
      .mockResolvedValueOnce(readyDownload({ target: 'html' }))
      .mockResolvedValueOnce(null)
    fetchResponse(
      '<!doctype html><main><div class="openui-error">Internal render failed</div></main>',
      { headers: { 'content-type': 'text/html' } },
    )

    const response = await createExportResponse(
      'release-session',
      'html',
      client,
    )
    const body = await response.text()

    expect(response.status).toBeGreaterThanOrEqual(400)
    expect(response.headers.get('content-disposition')).toBeNull()
    expect(body).not.toContain('Internal render failed')
  })

  it('rejects cached media types that do not match the requested target', async () => {
    queryMock
      .mockResolvedValueOnce(
        readyDownload({
          artifactContentType: 'text/html; charset=utf-8',
          artifactFilename: 'unexpected.html',
          target: 'next',
        }),
      )
      .mockResolvedValueOnce(null)
    fetchResponse('<!doctype html><title>Not a Next ZIP</title>')

    const response = await createExportResponse(
      'release-session',
      'next',
      client,
    )

    expect(response.status).toBeGreaterThanOrEqual(400)
    expect(response.headers.get('content-disposition')).toBeNull()
  })

  it('never fetches cached artifacts from local or private network URLs', async () => {
    queryMock.mockResolvedValueOnce(
      readyDownload({ storageUrl: 'http://127.0.0.1:8421/internal.zip' }),
    )
    const fetchMock = fetchResponse(new Uint8Array([80, 75, 5, 6]))

    const response = await createExportResponse(
      'release-session',
      'react',
      client,
    )

    expect(response.status).toBeGreaterThanOrEqual(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('emits one unambiguous attachment filename for hostile cached metadata', async () => {
    queryMock.mockResolvedValueOnce(
      readyDownload({
        artifactFilename: 'release.zip"; filename="spoofed.zip',
      }),
    )
    fetchResponse(new Uint8Array([80, 75, 5, 6]))

    const response = await createExportResponse(
      'release-session',
      'react',
      client,
    )
    const disposition = response.headers.get('content-disposition') ?? ''

    expect(response.status).toBe(200)
    expect(disposition).toMatch(/^attachment; filename="[A-Za-z0-9._-]+"$/)
    expect(disposition.match(/filename=/g)).toHaveLength(1)
  })
})
