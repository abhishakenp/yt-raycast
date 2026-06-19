import { existsSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  buildLakebedAnonymousDeployRequest,
  deployLakebedProjectFiles,
} from './lakebed-deploy-service'

const files = {
  'server/index.ts': `import { capsule, query, string, table } from "lakebed/server";

const schema = {
  notes: table({
    title: string(),
  }),
};

export default capsule({
  name: "Memory Deploy",
  schema,
  queries: {
    listNotes: query((ctx) => ctx.db.notes.all()),
  },
  mutations: {},
});
`,
  'client/index.tsx': `export function App() {
  return <main><h1>Memory Deploy</h1></main>;
}
`,
  'shared/content.ts': `export const title = "Memory Deploy";
`,
}

describe('lakebed deploy service', () => {
  it('builds the anonymous deploy payload in memory without sourcemaps', async () => {
    const lakebedRoot = join(process.cwd(), '.lakebed')
    await rm(lakebedRoot, { recursive: true, force: true })

    const result = await buildLakebedAnonymousDeployRequest(files)

    expect(existsSync(lakebedRoot)).toBe(false)
    expect(result.requestBody).not.toContain('sourceMappingURL')
    expect(result.requestBody).not.toContain('sourcesContent')
    expect(result.clientBundleBytes).toBeLessThan(50_000)
    expect(result.requestBodyBytes).toBeLessThan(200_000)
    expect(result.artifact.deployTarget).toBe('anonymous-source')
    expect(result.artifact.server.source.bytes).toBe(result.serverBundleBytes)
    expect(result.sourceFileCount).toBe(Object.keys(files).length)
  })

  it('posts the minified in-memory payload directly to Lakebed', async () => {
    const requests: Array<{ body: string; url: string }> = []
    const logs: Array<{ details?: Record<string, unknown>; message: string }> =
      []
    const fetchImpl = (async (url: RequestInfo | URL, init?: RequestInit) => {
      requests.push({ body: String(init?.body ?? ''), url: String(url) })
      return new Response(
        JSON.stringify({
          deployId: 'dep_memory',
          url: 'https://memory-deploy.lakebed.app',
          updatedAt: '2026-06-18T00:00:00.000Z',
          limits: { artifactBytes: 1_048_576 },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      )
    }) as typeof fetch

    const result = await deployLakebedProjectFiles({
      api: 'http://localhost:4321',
      fetchImpl,
      files,
      log: (message, details) => logs.push({ message, details }),
    })

    expect(requests).toHaveLength(1)
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
    expect(requests[0]?.url).toBe('http://localhost:4321/v1/anonymous-deploys')
    expect(requests[0]?.body).not.toContain('sourceMappingURL')
    expect(JSON.parse(requests[0]?.body ?? '{}')).toMatchObject({
      artifact: { deployTarget: 'anonymous-source' },
      clientVersion: expect.any(String),
    })
    expect(result).toMatchObject({
      deployId: 'dep_memory',
      url: 'https://memory-deploy.lakebed.app',
      requestBodyBytes: requests[0]?.body.length,
    })
  })
})
