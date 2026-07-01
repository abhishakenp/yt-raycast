import { describe, expect, it } from 'vitest'

import { cn } from './utils'

describe('cn', () => {
  it('joins truthy class names and skips falsy values without adding extra spaces', () => {
    expect(cn('base', false, undefined, null, 'active')).toBe('base active')
  })
})
