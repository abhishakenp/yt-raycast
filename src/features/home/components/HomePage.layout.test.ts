import { describe, expect, it } from 'vitest'

import { HomePage } from './HomePage'

describe('HomePage layout', () => {
  it('exports the HomePage component for the homepage route', () => {
    expect(HomePage).toBeTypeOf('function')
  })
})
