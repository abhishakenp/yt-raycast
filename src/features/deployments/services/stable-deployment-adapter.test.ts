import { describe, expect, it } from 'vitest'

import { deployStableArtifactToLakebed } from './stable-deployment-adapter'

describe('deployStableArtifactToLakebed', () => {
  it('deploys final HTML without generation source', async () => {
    const requests: string[] = []
    const result = await deployStableArtifactToLakebed(
      {
        html: '<!doctype html><html><body><h1>Stable deploy</h1></body></html>',
        siteSpec: { projectName: 'Stable deploy' },
      },
      {
        sessionId: 'stable-deploy',
        api: 'https://lakebed.test',
        fetchImpl: (async (_url, init) => {
          requests.push(String(init?.body ?? ''))
          return new Response(JSON.stringify({
            deployId: 'stable-deploy-id',
            url: 'https://stable-deploy.lakebed.test',
          }), { headers: { 'content-type': 'application/json' } })
        }) as typeof fetch,
      },
    )

    expect(result.url).toBe('https://stable-deploy.lakebed.test')
    expect(requests).toHaveLength(1)
  })
})
