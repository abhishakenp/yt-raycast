import { describe, expect, it } from 'vitest'

import { lakebedArtifactMediaType } from './lakebed-deploy-service'

describe('Lakebed deployment artifact media type', () => {
  it('matches the anonymous artifact upload contract', () => {
    expect(lakebedArtifactMediaType).toBe(
      'application/vnd.lakebed.artifact+json',
    )
  })
})
