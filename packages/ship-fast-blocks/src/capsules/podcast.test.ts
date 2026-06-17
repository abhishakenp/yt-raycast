import { describe, expect, it } from 'vitest'

import { loadOpenUIRuntimeComponent } from '../runtime-library'

describe('PodcastKimiPage capsule', () => {
  it('loads through the runtime component loader after icon extraction', async () => {
    const capsule = await loadOpenUIRuntimeComponent('PodcastKimiPage')

    expect(capsule.client).toBeTruthy()
  })
})
