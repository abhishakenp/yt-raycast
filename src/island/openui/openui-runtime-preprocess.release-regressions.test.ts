import { describe, expect, it } from 'vitest'

import {
  preprocessOpenUIRuntimeResponse,
  stripNullsFromArrays,
} from './openui-runtime-preprocess'

describe('OpenUI runtime preprocessing release regressions', () => {
  it('preserves null-like text inside quoted array values', () => {
    const source = '["Keep, null, as copy", null, "Publish"]'

    expect(stripNullsFromArrays(source)).toBe(
      '["Keep, null, as copy", "Publish"]',
    )
  })

  it('preserves Action-like phrases inside user-visible quoted copy', () => {
    const source = 'root = Text("Use Action(foo) carefully")'

    expect(preprocessOpenUIRuntimeResponse(source)).toBe(source)
  })
})
