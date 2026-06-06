import { describe, expect, it } from 'vitest'
import {
  isIpWhitelisted,
  MAX_FREE_PER_MONTH,
  MAX_PAID_PER_MONTH,
  parseWhitelistedIps,
} from './constants'

describe('billing limits', () => {
  it('keeps the paid generation quota above the free quota', () => {
    expect(MAX_PAID_PER_MONTH).toBe(30)
    expect(MAX_PAID_PER_MONTH).toBeGreaterThan(MAX_FREE_PER_MONTH)
  })
})

describe('isIpWhitelisted', () => {
  it('returns true for a configured IP and false for others', () => {
    const whitelist = parseWhitelistedIps('1.2.3.4,5.6.7.8')
    expect(isIpWhitelisted('1.2.3.4', whitelist)).toBe(true)
    expect(isIpWhitelisted('5.6.7.8', whitelist)).toBe(true)
    expect(isIpWhitelisted('9.9.9.9', whitelist)).toBe(false)
  })

  it('trims surrounding whitespace from configured IPs', () => {
    const whitelist = parseWhitelistedIps(' 1.2.3.4 ,  5.6.7.8 ')
    expect(isIpWhitelisted('1.2.3.4', whitelist)).toBe(true)
    expect(isIpWhitelisted('5.6.7.8', whitelist)).toBe(true)
  })

  it('returns false for null, undefined, or empty IPs', () => {
    const whitelist = parseWhitelistedIps('1.2.3.4')
    expect(isIpWhitelisted(null, whitelist)).toBe(false)
    expect(isIpWhitelisted(undefined, whitelist)).toBe(false)
    expect(isIpWhitelisted('', whitelist)).toBe(false)
  })

  it('whitelists nothing when the env var is unset', () => {
    expect(isIpWhitelisted('1.2.3.4', parseWhitelistedIps(undefined))).toBe(false)
  })
})
