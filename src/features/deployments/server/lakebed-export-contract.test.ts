import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { unzipSync, strFromU8 } from 'fflate'
import { afterEach, describe, expect, it } from 'vitest'

import { buildOpenUILakebedExport } from '../../exports/services/openui-lakebed-export-builder'
import { deployLakebedProjectFiles } from './lakebed-deploy-service'

const fixturesDir = join(process.cwd(), '__fixtures__', 'openui-sources')
const originalFetch = globalThis.fetch
const originalPexelsKey = process.env.PEXELS_API_KEY

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalPexelsKey === undefined) {
    delete process.env.PEXELS_API_KEY
  } else {
    process.env.PEXELS_API_KEY = originalPexelsKey
  }
})

function loadFixture(name: string): string {
  return readFileSync(join(fixturesDir, `${name}.openui`), 'utf8')
}

function unzipExportFiles(body: string | Uint8Array): Record<string, string> {
  const bytes = typeof body === 'string' ? Buffer.from(body) : body
  const entries = unzipSync(new Uint8Array(bytes))
  const files: Record<string, string> = {}
  for (const [name, contents] of Object.entries(entries)) {
    files[name] = strFromU8(contents)
  }
  return files
}

function createMockFetch(requests: Array<{ body: string; url: string }>) {
  return (async (url, init?) => {
    requests.push({ body: String(init?.body ?? ''), url: String(url) })
    return new Response(
      JSON.stringify({
        deployId: 'dep_contract',
        url: 'https://contract-deploy.lakebed.app',
        updatedAt: '2026-06-18T00:00:00.000Z',
        limits: { artifactBytes: 1_048_576 },
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    )
  }) as typeof fetch
}

async function deployFixture(fixtureName: string) {
  // Pexels image resolution hits the network when the key is present; force the
  // offline fallback (picsum) so the contract test is hermetic.
  delete process.env.PEXELS_API_KEY
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ photos: [] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })) as typeof fetch

  const source = loadFixture(fixtureName)
  const built = await buildOpenUILakebedExport({
    source,
    sessionId: `contract-${fixtureName}`,
    target: 'lakebed',
  })

  expect(built.contentType).toBe('application/zip')
  expect(built.fileCount).toBeGreaterThan(0)

  const files = unzipExportFiles(built.body)
  expect(files['server/index.ts']).toBeTruthy()
  expect(files['client/index.tsx']).toBeTruthy()

  const requests: Array<{ body: string; url: string }> = []
  const logs: Array<{ details?: Record<string, unknown>; message: string }> = []
  const fetchImpl = createMockFetch(requests)

  const result = await deployLakebedProjectFiles({
    api: 'http://localhost:4321',
    fetchImpl,
    files,
    log: (message, details) => logs.push({ message, details }),
  })

  return { files, requests, logs, result }
}

describe('lakebed export contract (real fixtures)', () => {
  it('deploys a real food-blog export artifact end-to-end', async () => {
    const { files, requests, logs, result } = await deployFixture('food-blog')

    expect(requests).toHaveLength(1)
    expect(requests[0]?.url).toBe('http://localhost:4321/v1/anonymous-deploys')
    expect(requests[0]?.body).not.toContain('sourceMappingURL')
    expect(JSON.parse(requests[0]?.body ?? '{}')).toMatchObject({
      artifact: { deployTarget: 'anonymous-source' },
      clientVersion: expect.any(String),
    })

    expect(logs.map((entry) => entry.message)).toEqual(
      expect.arrayContaining([
        'anonymous-request:start',
        'bundle:server:start',
        'bundle:server:complete',
        'bundle:client:start',
        'bundle:client:complete',
        'bundle:server-module-import:start',
        'bundle:server-module-import:complete',
        'anonymous-request:source-files:start',
        'anonymous-request:diagnostics:complete',
        'anonymous-request:stringify:complete',
        'anonymous-request:complete',
        'post:start',
        'post:response',
        'post:json:complete',
        'post:complete',
      ]),
    )

    expect(
      logs.find((entry) => entry.message === 'anonymous-request:complete')
        ?.details,
    ).toMatchObject({
      clientBundleBytes: expect.any(Number),
      requestBodyBytes: expect.any(Number),
      sourceFileCount: Object.keys(files).length,
    })

    expect(result).toMatchObject({
      deployId: 'dep_contract',
      url: 'https://contract-deploy.lakebed.app',
      requestBodyBytes: requests[0]?.body.length,
    })
  })

  it('deploys a real popcorn-mania export artifact end-to-end', async () => {
    const { files, requests, logs, result } =
      await deployFixture('popcorn-mania')

    expect(requests).toHaveLength(1)
    expect(requests[0]?.url).toBe('http://localhost:4321/v1/anonymous-deploys')
    expect(requests[0]?.body).not.toContain('sourceMappingURL')
    expect(JSON.parse(requests[0]?.body ?? '{}')).toMatchObject({
      artifact: { deployTarget: 'anonymous-source' },
      clientVersion: expect.any(String),
    })

    expect(logs.map((entry) => entry.message)).toEqual(
      expect.arrayContaining([
        'anonymous-request:start',
        'bundle:server:complete',
        'bundle:client:complete',
        'anonymous-request:diagnostics:complete',
        'anonymous-request:complete',
        'post:start',
        'post:response',
        'post:complete',
      ]),
    )

    expect(
      logs.find((entry) => entry.message === 'anonymous-request:complete')
        ?.details,
    ).toMatchObject({
      sourceFileCount: Object.keys(files).length,
    })

    expect(result).toMatchObject({
      deployId: 'dep_contract',
      url: 'https://contract-deploy.lakebed.app',
      requestBodyBytes: requests[0]?.body.length,
    })
  })
})
