import { describe, expect, it } from 'vitest'

import { loadOpenUIRuntimeComponent } from '../runtime-library'

describe('BeautyStoreKimiPage capsule', () => {
  it('loads through the runtime component loader after icon extraction', async () => {
    const capsule = await loadOpenUIRuntimeComponent('BeautyStoreKimiPage')

    expect(capsule.client).toBeTruthy()
  })
})
