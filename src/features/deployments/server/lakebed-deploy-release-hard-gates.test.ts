import { describe, expect, it, vi } from 'vitest'

import {
  buildLakebedAnonymousDeployRequest,
  deployLakebedProjectFiles,
} from './lakebed-deploy-service'

const deployFiles = {
  'server/index.ts': `import { capsule, query, string, table } from 'lakebed/server'

const schema = {
  notes: table({ title: string() }),
}

export default capsule({
  name: 'Release Gate',
  schema,
  queries: {
    listNotes: query((ctx) => ctx.db.notes.all()),
  },
  mutations: {},
})
`,
  'client/index.tsx': `export function App() {
  return <main><h1>Release Gate</h1></main>
}
`,
  'shared/content.ts': `export const title = 'Release Gate'
`,
}

type FetchFactory = (body: unknown, status?: number) => typeof fetch

const responseFetch: FetchFactory = (body, status = 200) =>
  vi.fn(async () =>
    Response.json(body, {
      status,
      headers: { 'content-type': 'application/json' },
    }),
  )

describe('Lakebed deployment release hard gates', () => {
  it('builds byte-identical deployment requests from reordered file maps', async () => {
    const first = await buildLakebedAnonymousDeployRequest(deployFiles)
    const second = await buildLakebedAnonymousDeployRequest({
      'shared/content.ts': deployFiles['shared/content.ts'],
      'client/index.tsx': deployFiles['client/index.tsx'],
      'server/index.ts': deployFiles['server/index.ts'],
    })

    expect(second.artifactHash).toBe(first.artifactHash)
    expect(second.clientBundleHash).toBe(first.clientBundleHash)
    expect(second.serverBundleHash).toBe(first.serverBundleHash)
    expect(second.requestBody).toBe(first.requestBody)
  })

  it('rejects source files that escape the generated project root', async () => {
    await expect(
      buildLakebedAnonymousDeployRequest({
        ...deployFiles,
        '../outside-project.ts': `export const leaked = true`,
      }),
    ).rejects.toThrow(/path|source|outside|traversal|invalid/i)
  })

  it('rejects absolute source file paths before compiling the deployment', async () => {
    await expect(
      buildLakebedAnonymousDeployRequest({
        ...deployFiles,
        '/tmp/outside-project.ts': `export const leaked = true`,
      }),
    ).rejects.toThrow(/path|source|absolute|invalid/i)
  })

  it('rejects a successful deploy response without a deployment id', async () => {
    await expect(
      deployLakebedProjectFiles({
        api: 'http://localhost:4321',
        fetchImpl: responseFetch({
          url: 'https://release-gate.lakebed.app',
        }),
        files: deployFiles,
      }),
    ).rejects.toThrow(/deployId|deployment id|invalid response/i)
  })

  it('rejects a successful deploy response without a public deployment URL', async () => {
    await expect(
      deployLakebedProjectFiles({
        api: 'http://localhost:4321',
        fetchImpl: responseFetch({ deployId: 'dep_release_gate' }),
        files: deployFiles,
      }),
    ).rejects.toThrow(/url|deployment url|invalid response/i)
  })

  it('rejects executable deployment URL schemes returned by the service', async () => {
    await expect(
      deployLakebedProjectFiles({
        api: 'http://localhost:4321',
        fetchImpl: responseFetch({
          deployId: 'dep_release_gate',
          url: 'javascript:alert(document.domain)',
        }),
        files: deployFiles,
      }),
    ).rejects.toThrow(/url|scheme|https|invalid response/i)
  })

  it('rejects a different deployment id during an in-place update', async () => {
    await expect(
      deployLakebedProjectFiles({
        api: 'http://localhost:4321',
        existingDeployment: {
          claimUrl:
            'http://localhost:4321/claim/dep_release_gate/release-token',
          deployId: 'dep_release_gate',
          url: 'https://release-gate.lakebed.app',
        },
        fetchImpl: responseFetch({
          deployId: 'dep_different_project',
          url: 'https://different-project.lakebed.app',
        }),
        files: deployFiles,
      }),
    ).rejects.toThrow(/deployId|deployment id|mismatch|invalid response/i)
  })

  it('does not forward a claim token sourced from an unrelated origin', async () => {
    const requests: Array<{
      authorization: string | null
      method: string
      url: string
    }> = []
    const fetchImpl: typeof fetch = vi.fn(async (input, init) => {
      requests.push({
        authorization: new Headers(init?.headers).get('authorization'),
        method: init?.method ?? 'GET',
        url: String(input),
      })
      return Response.json({
        deployId: 'dep_release_gate',
        url: 'https://release-gate.lakebed.app',
      })
    })

    await deployLakebedProjectFiles({
      api: 'http://localhost:4321',
      existingDeployment: {
        claimUrl:
          'https://attacker.example/claim/dep_release_gate/stolen-token',
        deployId: 'dep_release_gate',
        url: 'https://release-gate.lakebed.app',
      },
      fetchImpl,
      files: deployFiles,
    })

    expect(requests).toEqual([
      {
        authorization: null,
        method: 'POST',
        url: 'http://localhost:4321/v1/anonymous-deploys',
      },
    ])
  })
})
