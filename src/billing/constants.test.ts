import { afterEach, describe, expect, it, vi } from 'vitest'
import { MAX_FREE_PER_MONTH, MAX_PAID_PER_MONTH } from './constants'

describe('billing limits', () => {
  it('keeps the paid generation quota above the free quota', () => {
    expect(MAX_PAID_PER_MONTH).toBe(30)
    expect(MAX_PAID_PER_MONTH).toBeGreaterThan(MAX_FREE_PER_MONTH)
  })
})

// Single source of truth for the owner IP rate-limit bypass (used across src/server/index.js).
// WHITELISTED_IPS is parsed from env at module load, so re-import with reset modules per case.
const loadWhitelist = async (envValue?: string) => {
  vi.resetModules()
  if (envValue === undefined) {
    delete process.env.WHITELISTED_IPS
  } else {
    process.env.WHITELISTED_IPS = envValue
  }
  return import('./constants')
}

describe('isIpWhitelisted', () => {
  afterEach(() => {
    delete process.env.WHITELISTED_IPS
  })

  it('returns true for a configured IP and false for others', async () => {
    const { isIpWhitelisted } = await loadWhitelist('1.2.3.4,5.6.7.8')
    expect(isIpWhitelisted('1.2.3.4')).toBe(true)
    expect(isIpWhitelisted('5.6.7.8')).toBe(true)
    expect(isIpWhitelisted('9.9.9.9')).toBe(false)
  })

  it('trims surrounding whitespace from configured IPs', async () => {
    const { isIpWhitelisted } = await loadWhitelist(' 1.2.3.4 ,  5.6.7.8 ')
    expect(isIpWhitelisted('1.2.3.4')).toBe(true)
    expect(isIpWhitelisted('5.6.7.8')).toBe(true)
  })

  it('returns false for null, undefined, or empty IPs', async () => {
    const { isIpWhitelisted } = await loadWhitelist('1.2.3.4')
    expect(isIpWhitelisted(null)).toBe(false)
    expect(isIpWhitelisted(undefined)).toBe(false)
    expect(isIpWhitelisted('')).toBe(false)
  })

  it('whitelists nothing when the env var is unset', async () => {
    const { isIpWhitelisted } = await loadWhitelist(undefined)
    expect(isIpWhitelisted('1.2.3.4')).toBe(false)
  })
})
