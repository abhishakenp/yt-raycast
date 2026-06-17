import { describe, expect, it } from 'vitest'

import { loadOpenUIRuntimeComponent } from '../runtime-library'

describe('PortfolioDevKimiPage capsule', () => {
  it('loads through the runtime component loader after icon extraction', async () => {
    const capsule = await loadOpenUIRuntimeComponent('PortfolioDevKimiPage')

    expect(capsule.client).toBeTruthy()
  })
})
