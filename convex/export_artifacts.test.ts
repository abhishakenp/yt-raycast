import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ActionCtx } from './_generated/server'
import type { Id } from './_generated/dataModel'
import type { ExportTarget } from '../src/features/exports/services/openui-export-types'
import { build } from './export_artifacts'

// Mock the dynamically-imported artifact files module.
vi.mock('../src/features/exports/services/openui-artifact-files', () => ({
  buildOpenUIArtifactFiles: vi.fn(),
  buildDownloadFromArtifactFiles: vi.fn(),
}))

// Mock the lakebed deploy service (only invoked for auto-deploy-public).
vi.mock('../src/features/deployments/server/lakebed-deploy-service', () => ({
  deployLakebedProjectFiles: vi.fn(),
}))

import {
  buildOpenUIArtifactFiles,
  buildDownloadFromArtifactFiles,
} from '../src/features/exports/services/openui-artifact-files'

type BuildArgs = {
  sessionId: Id<'sessions'>
  target: ExportTarget
  previewVersion: number
  autoDeployPublic?: boolean
}

type BuildResult =
  | { target: ExportTarget; status: 'stale' }
  | { target: ExportTarget; status: 'ready' }

/** The Convex action object stores the raw handler on `_handler` at runtime. */
type ActionWithHandler = {
  _handler: (ctx: ActionCtx, args: BuildArgs) => Promise<BuildResult>
}

const handler = (build as unknown as ActionWithHandler)._handler

const SESSION_ID = 'session_export_test' as Id<'sessions'>
const TARGET: ExportTarget = 'html'

const baseArgs: BuildArgs = {
  sessionId: SESSION_ID,
  target: TARGET,
  previewVersion: 1,
}

type PreparedExportArtifact = {
  sessionId: Id<'sessions'>
  prompt: string
  target: ExportTarget
  previewVersion: number
  source: string
  html: string
  siteSpecJson?: string
  previewHtml?: string
  themeName?: string
  isDark?: boolean
  locale?: string
  isPrivate: boolean
}

function preparedFixture(): PreparedExportArtifact {
  return {
    sessionId: SESSION_ID,
    prompt: 'Build a test site',
    target: TARGET,
    previewVersion: 1,
    source: 'root = Text("Hello")',
    html: '<html><body><h1>Hello</h1></body></html>',
    siteSpecJson: JSON.stringify({ projectName: 'Test' }),
    isPrivate: false,
  }
}

type BuiltExport = {
  body: string | Uint8Array
  contentType: string
  filename: string
  fileCount: number
}

function downloadFixture(): BuiltExport {
  return {
    body: 'fake-zip-bytes',
    contentType: 'application/zip',
    filename: 'test-site.zip',
    fileCount: 3,
  }
}

/**
 * Build a mock ActionCtx with controllable runMutation, runQuery, and
 * storage.store stubs.
 */
function mockActionCtx(overrides?: {
  prepareResult?: PreparedExportArtifact | null
}): {
  ctx: ActionCtx
  runMutation: ReturnType<typeof vi.fn>
  runQuery: ReturnType<typeof vi.fn>
  storageStore: ReturnType<typeof vi.fn>
} {
  const runMutation = vi.fn().mockResolvedValue(undefined)
  const runQuery = vi
    .fn()
    .mockResolvedValue(
      overrides?.prepareResult === undefined
        ? preparedFixture()
        : overrides.prepareResult,
    )
  const storageStore = vi
    .fn()
    .mockResolvedValue('storage_id_1' as Id<'_storage'>)
    .mockResolvedValueOnce('storage_id_1' as Id<'_storage'>)
    .mockResolvedValueOnce('storage_id_files' as Id<'_storage'>)

  const ctx = {
    runMutation,
    runQuery,
    storage: { store: storageStore },
  } as unknown as ActionCtx

  return { ctx, runMutation, runQuery, storageStore }
}

describe('export_artifacts build action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns {status: "stale"} when prepareExportArtifactBuildInput returns null', async () => {
    const { ctx, runMutation } = mockActionCtx({ prepareResult: null })

    const result = await handler(ctx, baseArgs)

    expect(result).toEqual({ target: TARGET, status: 'stale' })
    // markExportArtifactBuildStarted is called first, but no ready/failure mutation.
    expect(runMutation).toHaveBeenCalledTimes(1)
  })

  it('returns {status: "ready"} on a successful build and records the ready mutation', async () => {
    const files = {
      'index.html': '<html><body><h1>Hello</h1></body></html>',
      'style.css': 'body { color: red; }',
    }
    ;(buildOpenUIArtifactFiles as ReturnType<typeof vi.fn>).mockResolvedValue({
      files,
      download: downloadFixture(),
    })
    ;(
      buildDownloadFromArtifactFiles as ReturnType<typeof vi.fn>
    ).mockResolvedValue(downloadFixture())

    const { ctx, runMutation, runQuery, storageStore } = mockActionCtx()

    const result = await handler(ctx, baseArgs)

    expect(result).toEqual({ target: TARGET, status: 'ready' })

    // markExportArtifactBuildStarted + 3 real-progress events (packaging,
    // saving, ready) + recordExportArtifactBuildReady.
    expect(runMutation).toHaveBeenCalledTimes(5)
    // prepareExportArtifactBuildInput query was called
    expect(runQuery).toHaveBeenCalledTimes(1)

    // The ready mutation should include hash and byteLength derived from the body.
    const readyCall = runMutation.mock.calls[4]
    const readyArgs = readyCall[1] as Record<string, unknown>
    expect(readyArgs.storageId).toBeDefined()
    expect(readyArgs.filesStorageId).toBeDefined()
    expect(readyArgs.filename).toBe('test-site.zip')
    expect(readyArgs.contentType).toBe('application/zip')
    expect(readyArgs.fileCount).toBe(3)
    // bodyBytes converts the string body to a Uint8Array; byteLength should match.
    expect(readyArgs.byteLength).toBe(
      new TextEncoder().encode('fake-zip-bytes').byteLength,
    )
    // hashBytes produces a SHA-256 hex digest (64 hex chars).
    expect(readyArgs.hash).toMatch(/^[0-9a-f]{64}$/)

    // Two storage.store calls: one for the download bytes, one for the files JSON.
    expect(storageStore).toHaveBeenCalledTimes(2)
  })

  it('records the failure mutation and rethrows when buildGitHubFiles throws', async () => {
    ;(buildOpenUIArtifactFiles as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('File build exploded'),
    )

    const { ctx, runMutation } = mockActionCtx()
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(handler(ctx, baseArgs)).rejects.toThrow('File build exploded')

    // markExportArtifactBuildStarted + recordExportArtifactBuildFailure
    expect(runMutation).toHaveBeenCalledTimes(2)
    const failureCall = runMutation.mock.calls[1]
    const failureArgs = failureCall[1] as Record<string, unknown>
    // errorMessage extracts the Error.message.
    expect(failureArgs.errorMessage).toBe('File build exploded')

    errorSpy.mockRestore()
  })

  it('records failure and rethrows when a non-Error value is thrown', async () => {
    ;(buildOpenUIArtifactFiles as ReturnType<typeof vi.fn>).mockRejectedValue(
      'string error boom',
    )

    const { ctx, runMutation } = mockActionCtx()
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(handler(ctx, baseArgs)).rejects.toBe('string error boom')

    const failureCall = runMutation.mock.calls[1]
    const failureArgs = failureCall[1] as Record<string, unknown>
    // errorMessage falls back to String(error) for non-Error throws.
    expect(failureArgs.errorMessage).toBe('string error boom')

    errorSpy.mockRestore()
  })

  it('detects broken files with openui-error class and throws', async () => {
    ;(buildOpenUIArtifactFiles as ReturnType<typeof vi.fn>).mockResolvedValue({
      files: {
        'index.html': '<div class="openui-error">Something went wrong</div>',
      },
      download: downloadFixture(),
    })

    const { ctx, runMutation } = mockActionCtx()
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(handler(ctx, baseArgs)).rejects.toThrow(
      /openui renderer error/i,
    )

    // markExportArtifactBuildStarted + recordExportArtifactBuildFailure
    expect(runMutation).toHaveBeenCalledTimes(2)
    const failureArgs = runMutation.mock.calls[1][1] as Record<string, unknown>
    expect(failureArgs.errorMessage).toMatch(/openui renderer error/i)

    errorSpy.mockRestore()
  })

  it('detects broken files with "Failed to render:" text and throws', async () => {
    ;(buildOpenUIArtifactFiles as ReturnType<typeof vi.fn>).mockResolvedValue({
      files: {
        'page.html': '<div>Failed to render: component X</div>',
      },
      download: downloadFixture(),
    })

    const { ctx, runMutation } = mockActionCtx()
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(handler(ctx, baseArgs)).rejects.toThrow(
      /openui renderer error/i,
    )

    expect(runMutation).toHaveBeenCalledTimes(2)
    errorSpy.mockRestore()
  })

  it('computes the correct SHA-256 hash for the download body (hashBytes)', async () => {
    const download = downloadFixture()
    ;(buildOpenUIArtifactFiles as ReturnType<typeof vi.fn>).mockResolvedValue({
      files: { 'index.html': '<html></html>' },
      download,
    })
    ;(
      buildDownloadFromArtifactFiles as ReturnType<typeof vi.fn>
    ).mockResolvedValue(download)

    const { ctx, runMutation } = mockActionCtx()

    await handler(ctx, baseArgs)

    const readyArgs = runMutation.mock.calls[4][1] as Record<string, unknown>
    // Verify hashBytes produces the correct SHA-256 of the body string.
    const { createHash } = await import('node:crypto')
    const expectedHash = createHash('sha256')
      .update(new TextEncoder().encode(download.body as string))
      .digest('hex')
    expect(readyArgs.hash).toBe(expectedHash)
  })

  it('handles Uint8Array download bodies correctly (bodyBytes passthrough)', async () => {
    const bodyBytes = new Uint8Array([1, 2, 3, 4, 5])
    const download: BuiltExport = {
      body: bodyBytes,
      contentType: 'application/zip',
      filename: 'binary.zip',
      fileCount: 1,
    }
    ;(buildOpenUIArtifactFiles as ReturnType<typeof vi.fn>).mockResolvedValue({
      files: { 'index.html': '<html></html>' },
      download,
    })
    ;(
      buildDownloadFromArtifactFiles as ReturnType<typeof vi.fn>
    ).mockResolvedValue(download)

    const { ctx, runMutation } = mockActionCtx()

    await handler(ctx, baseArgs)

    const readyArgs = runMutation.mock.calls[4][1] as Record<string, unknown>
    // bodyBytes passes through Uint8Array unchanged.
    expect(readyArgs.byteLength).toBe(5)
    // hashBytes computes SHA-256 of the raw bytes.
    const { createHash } = await import('node:crypto')
    const expectedHash = createHash('sha256').update(bodyBytes).digest('hex')
    expect(readyArgs.hash).toBe(expectedHash)
  })
})
