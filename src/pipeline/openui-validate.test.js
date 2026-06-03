import { describe, expect, it } from 'vitest'
import { validateOpenUISource } from './openui-validate.js'

const thinButParseable = `root = Stack([main])
main = Section([title, card])
title = Heading("Preview")
card = Text("Minimal preview body.")
`

describe('openui fixtures', () => {
  it('validates parser requirements only', () => {
    expect(validateOpenUISource('').ok).toBe(false)
    expect(validateOpenUISource(thinButParseable).ok).toBe(true)
  })

  it('rejects old and unknown component names', () => {
    const legacy = `root = LegacyPageTemplate([title])
title = Heading("Legacy")
`
    const unknown = `root = MadeUpComponent([title])
title = Heading("Unknown")
`
    expect(validateOpenUISource(legacy).ok).toBe(false)
    expect(validateOpenUISource(unknown).ok).toBe(false)
  })
})
