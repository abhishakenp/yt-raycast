import { describe, expect, it } from 'vitest'

import { loadOpenUIRuntimeComponent } from '../runtime-library'

describe('MusicArtistKimiPage2 capsule', () => {
  it('loads through the runtime component loader after icon extraction', async () => {
    const capsule = await loadOpenUIRuntimeComponent('MusicArtistKimiPage2')

    expect(capsule.client).toBeTruthy()
  })
})
