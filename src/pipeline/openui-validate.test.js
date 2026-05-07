import { describe, expect, it } from 'vitest'
import { OPENUI_HOME_FALLBACK } from './phase-openui-home.js'
import { validateOpenUISource } from './openui-validate.js'

/** Minimal multiline program that should parse; used as base for heuristics. */
const thinButParseable = `root = PageShell([main], "Ship Fast", "Preview", "light")
main = Section("Preview", "Ship Fast", [card])
card = FeatureCard("Preview", "Minimal preview body.", "default")
`

describe('openui fixtures', () => {
  it('validates parser requirements only', () => {
    expect(validateOpenUISource('').ok).toBe(false)
    expect(validateOpenUISource(thinButParseable).ok).toBe(true)
  })

  it('pipeline fallback is valid', () => {
    expect(validateOpenUISource(OPENUI_HOME_FALLBACK).ok).toBe(true)
  })
})
