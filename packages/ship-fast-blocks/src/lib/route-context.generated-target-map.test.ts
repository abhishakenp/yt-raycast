import { describe, expect, it } from 'vitest'

import {
  parseRouteTarget,
  resolveRouteHref,
  resolveRouteTarget,
} from './route-context.tsx'

describe('generated route target maps', () => {
  it('ignores null target-map entries while resolving semantic route labels', () => {
    const targetMap = {
      Broken: null,
      home_hero: 'Home#home_hero',
    }

    expect(parseRouteTarget(null)).toBeNull()
    expect(
      resolveRouteTarget('Learn More', ['Home', 'Gallery'], targetMap),
    ).toBeNull()
    expect(resolveRouteHref('Learn More', ['Home', 'Gallery'], targetMap)).toBe(
      '#learn-more',
    )
  })
})
