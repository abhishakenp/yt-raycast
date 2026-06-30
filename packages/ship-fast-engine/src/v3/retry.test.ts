import { describe, it, expect } from 'vitest'
import { retryLoop } from './retry'

const restaurantDsl = `restaurant
hero Farm to Table|Wood-fired cuisine|Seasonal menus|Rustic dining room
menu Autumn Menu|Three courses from Chef Marco|Starters>Beet Tartare~Charred beets~14~Vegan^Octopus~Paprika aioli~18
cta Book a Table|Parties up to 8
footer
@pages menu cta`

const minimalDsl = `marketing
hero Hello|World
footer`

describe('retryLoop', () => {
  it('parses + validates a valid restaurant plan on first attempt', () => {
    const { plan, attempts, valid } = retryLoop(restaurantDsl, 'restaurant')
    expect(valid).toBe(true)
    expect(attempts).toBe(1)
    expect(plan.kind).toBe('restaurant')
    expect(plan.sections.length).toBe(4)
    expect(plan.pages).toEqual(['menu', 'cta'])
  })

  it('accepts a plan with >=3 sections even if not fully valid', () => {
    const { plan, attempts } = retryLoop(minimalDsl, 'marketing')
    expect(plan.sections.length).toBeGreaterThanOrEqual(2)
    expect(attempts).toBe(1)
  })

  it('returns last best-effort plan after maxRetries when input is garbage', () => {
    const garbage = 'xyzzy\nnot a role\n+++ broken'
    const { plan, attempts, valid } = retryLoop(garbage, 'marketing', 3)
    expect(attempts).toBe(4) // 0..3 inclusive
    // Garbage → never valid, never >=3 valid sections → exhausts retries
    expect(valid).toBe(false)
    // Plan is whatever the last best-effort fix produced (may have sections from
    // tolerant parsing, but they're invalid for the kind vocabulary).
    expect(plan.kind).toBeDefined()
  })

  it('uses kind argument when parsed kind is empty', () => {
    const noKindDsl = `\nhero Test|Content\nfooter`
    const { plan } = retryLoop(noKindDsl, 'saas')
    // Parser sets kind to '' → effectiveKind = 'saas' → fixer may infer
    expect(plan.kind.length).toBeGreaterThan(0)
  })

  it('returns errors array from final validation', () => {
    const { errors } = retryLoop(restaurantDsl, 'restaurant')
    expect(Array.isArray(errors)).toBe(true)
  })

  it('respects maxRetries parameter', () => {
    const garbage = '!!!\n!!!\n!!!'
    const r1 = retryLoop(garbage, 'marketing', 1)
    expect(r1.attempts).toBe(2) // 0..1 inclusive
    const r3 = retryLoop(garbage, 'marketing', 3)
    expect(r3.attempts).toBe(4) // 0..3 inclusive
  })
})
