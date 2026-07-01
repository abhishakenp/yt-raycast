// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'

import { initRocketExhaust } from './odysseus-animated-backgrounds.js'

describe('public odysseus background fallback', () => {
  it('exports a safe no-op initializer for generated pages', () => {
    document.body.innerHTML = '<main><button>Generate</button></main>'

    expect(() => initRocketExhaust()).not.toThrow()
    expect(document.body.innerHTML).toContain('Generate')
  })
})
