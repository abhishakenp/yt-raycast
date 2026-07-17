import { describe, expect, it } from 'vitest'

import { isPartnerProgramClientEnabled } from './partner-config'

describe('partner client config', () => {
  it('enables partners only for an explicit true flag', () => {
    expect(isPartnerProgramClientEnabled({})).toBe(false)
    expect(
      isPartnerProgramClientEnabled({
        VITE_DUB_PARTNERS_ENABLED: 'false',
      }),
    ).toBe(false)
    expect(
      isPartnerProgramClientEnabled({
        VITE_DUB_PARTNERS_ENABLED: ' TRUE ',
      }),
    ).toBe(true)
  })
})
