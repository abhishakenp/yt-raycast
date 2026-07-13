import { beforeEach, describe, expect, it, vi } from 'vitest'

const artifactFileMocks = vi.hoisted(() => ({
  buildDownloadFromArtifactFiles: vi.fn(),
  buildOpenUIArtifactFiles: vi.fn(),
}))

vi.mock('../services/openui-artifact-files', () => artifactFileMocks)

import { createExportResponse } from './create-export-response'

const queryMock = vi.fn()
const setAuthMock = vi.fn()
const fakeClient = { query: queryMock, setAuth: setAuthMock }

describe('stored HTML export integrity release gate', () => {
  beforeEach(() => {
    queryMock.mockReset()
    setAuthMock.mockReset()
    artifactFileMocks.buildOpenUIArtifactFiles.mockReset()
    artifactFileMocks.buildDownloadFromArtifactFiles.mockReset()
    vi.unstubAllGlobals()
  })

  it('rejects an outdated generator revision before fetching cached bytes', async () => {
    queryMock.mockResolvedValueOnce({
      artifact: {
        contentType: 'text/html; charset=utf-8',
        filename: 'index.html',
        generatorRevision: 'html-export-v1',
        previewVersion: 2,
        status: 'ready',
      },
      currentGeneratorRevision: 'html-export-v2',
      export: {
        previewVersion: 2,
        requiresPayment: false,
        status: 'ready',
      },
      latestPreviewVersion: 2,
      storageUrl: 'https://storage.test/outdated-index.html',
    })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await createExportResponse(
      'release-html-integrity',
      'html',
      fakeClient,
    )
    const message = await response.text()

    expect.soft(response.status).toBe(409)
    expect.soft(message).toMatch(/stale|outdated|regenerate/i)
    expect.soft(fetchMock).not.toHaveBeenCalled()
    expect
      .soft(artifactFileMocks.buildOpenUIArtifactFiles)
      .not.toHaveBeenCalled()
    expect.soft(queryMock).toHaveBeenCalledOnce()
  })
})
