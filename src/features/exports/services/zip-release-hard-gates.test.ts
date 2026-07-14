import { Buffer } from 'node:buffer'

import { strFromU8, unzipSync } from 'fflate'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { buildDownloadFromArtifactFiles } from './openui-artifact-files'
import { createZipBuffer } from './zip-builder'

type ZipTarget = 'lakebed' | 'next' | 'react'

const zipTargets: ZipTarget[] = ['react', 'next', 'lakebed']

const unsafeFileMaps: Array<[string, Record<string, string>]> = [
  ['parent traversal', { '../escape.txt': 'outside' }],
  ['nested parent traversal', { 'public/../../escape.txt': 'outside' }],
  ['absolute POSIX path', { '/etc/export-secret': 'outside' }],
  ['protocol-relative path', { '//server/share.txt': 'outside' }],
  ['Windows drive path', { 'C:\\export-secret.txt': 'outside' }],
  ['Windows parent traversal', { 'public\\..\\escape.txt': 'outside' }],
  ['NUL-delimited path', { 'public/safe.txt\0../../escape.txt': 'outside' }],
  ['empty path', { '': 'unnamed' }],
]

function unzipEntries(archive: Uint8Array) {
  return unzipSync(archive)
}

function unzipTextEntries(archive: Uint8Array) {
  return Object.fromEntries(
    Object.entries(unzipEntries(archive)).map(([path, value]) => [
      path,
      strFromU8(value),
    ]),
  )
}

function createArtifactDownload(
  target: ZipTarget,
  files: Record<string, string>,
  sessionId = 'release-session',
) {
  return buildDownloadFromArtifactFiles(
    {
      sessionId,
      source: '<main><h1>Release artifact</h1></main>',
      target,
    },
    files,
  )
}

afterEach(() => {
  vi.useRealTimers()
})

describe('release ZIP integrity and path safety', () => {
  it('round-trips UTF-8 text, empty files, and binary bytes without corruption', () => {
    const binary = Buffer.from([0, 1, 2, 127, 128, 254, 255])
    const archive = createZipBuffer({
      'assets/binary.dat': binary,
      'content/हिन्दी.txt': 'नमस्ते दुनिया',
      'empty.txt': '',
      'index.html': '<!doctype html><title>Release</title>',
    })
    const entries = unzipEntries(archive)

    expect(Object.keys(entries).sort()).toEqual([
      'assets/binary.dat',
      'content/हिन्दी.txt',
      'empty.txt',
      'index.html',
    ])
    expect(entries['assets/binary.dat']).toEqual(new Uint8Array(binary))
    expect(strFromU8(entries['content/हिन्दी.txt'] ?? new Uint8Array())).toBe(
      'नमस्ते दुनिया',
    )
    expect(entries['empty.txt']).toEqual(new Uint8Array())
  })

  it.each(unsafeFileMaps)(
    'rejects %s entries before writing bytes',
    (_, files) => {
      expect(() => createZipBuffer(files)).toThrow(/path|entry|unsafe|invalid/i)
    },
  )

  it('rejects entries that collide after portable path normalization', () => {
    expect(() =>
      createZipBuffer({
        'app/./index.html': 'second',
        'app/index.html': 'first',
      }),
    ).toThrow(/duplicate|collision|path|entry/i)
  })

  it('produces identical bytes regardless of the wall clock', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
    const first = createZipBuffer({ 'index.html': '<h1>Stable</h1>' })
    vi.setSystemTime(new Date('2035-12-31T23:59:58.000Z'))
    const second = createZipBuffer({ 'index.html': '<h1>Stable</h1>' })

    expect(second).toEqual(first)
  })

  it('produces identical bytes regardless of input object insertion order', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-13T00:00:00.000Z'))
    const first = createZipBuffer({
      'README.md': 'Read me',
      'assets/site.css': 'body { color: black; }',
      'index.html': '<h1>Stable</h1>',
    })
    const second = createZipBuffer({
      'index.html': '<h1>Stable</h1>',
      'assets/site.css': 'body { color: black; }',
      'README.md': 'Read me',
    })

    expect(second).toEqual(first)
  })
})

describe('generated artifact ZIP hard gates', () => {
  it.each(zipTargets)(
    '%s downloads round-trip the exact generated file map',
    async (target) => {
      const files = {
        'README.md': '# Release artifact',
        'assets/site.css': 'body { color: black; }',
        'index.html': '<!doctype html><title>Release artifact</title>',
      }
      const download = await createArtifactDownload(target, files)
      if (typeof download.body === 'string') {
        throw new Error(`${target} produced text instead of ZIP bytes`)
      }

      expect(download.contentType).toBe('application/zip')
      expect(download.fileCount).toBe(Object.keys(files).length)
      expect(unzipTextEntries(download.body)).toEqual(files)
    },
  )

  it.each(zipTargets)(
    '%s downloads reject unsafe artifact paths before packaging',
    async (target) => {
      await expect(
        createArtifactDownload(target, {
          '../outside.txt': 'must never escape an extraction directory',
          'index.html': '<h1>Release artifact</h1>',
        }),
      ).rejects.toThrow(/path|entry|unsafe|invalid/i)
    },
  )

  it.each(zipTargets)(
    '%s downloads are reproducible across file-map insertion order',
    async (target) => {
      const first = await createArtifactDownload(target, {
        'README.md': 'Read me',
        'index.html': '<h1>Stable</h1>',
      })
      const second = await createArtifactDownload(target, {
        'index.html': '<h1>Stable</h1>',
        'README.md': 'Read me',
      })
      if (typeof first.body === 'string' || typeof second.body === 'string') {
        throw new Error(`${target} produced text instead of ZIP bytes`)
      }

      expect(second.body).toEqual(first.body)
    },
  )

  it('sanitizes Lakebed download names without generator identity or header delimiters', async () => {
    const download = await createArtifactDownload(
      'lakebed',
      { 'index.html': '<h1>Release artifact</h1>' },
      '../../Release Demo\r\nX-Injected: yes',
    )

    expect(download.filename).toMatch(/^[a-z0-9][a-z0-9.-]*-lakebed\.zip$/)
    expect(download.filename.toLowerCase()).not.toContain('ship-fast')
    expect(download.filename).not.toMatch(/[\\/\r\n:"']/)
  })
})
