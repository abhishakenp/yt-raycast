import { describe, it, expect } from 'vitest'

import { shouldEnableLogRocket } from './logrocket-init'

const PROD_HOST = 'ship-fast.ai'

describe('shouldEnableLogRocket', () => {
  it('returns false when window is undefined (SSR)', () => {
    expect(shouldEnableLogRocket(false, 'izp1ek/ship-fast', true, PROD_HOST)).toBe(false)
  })

  it('returns false when app ID is undefined', () => {
    expect(shouldEnableLogRocket(true, undefined, true, PROD_HOST)).toBe(false)
  })

  it('returns false when app ID is empty string', () => {
    expect(shouldEnableLogRocket(true, '', true, PROD_HOST)).toBe(false)
  })

  it('returns false when app ID is whitespace only', () => {
    expect(shouldEnableLogRocket(true, '  ', true, PROD_HOST)).toBe(false)
  })

  it('returns false in development even with app ID and production host', () => {
    expect(shouldEnableLogRocket(true, 'izp1ek/ship-fast', false, PROD_HOST)).toBe(false)
  })

  it('returns false on staging domain (*.devliv.io)', () => {
    expect(shouldEnableLogRocket(true, 'izp1ek/ship-fast', true, 'ship-fast.devliv.io')).toBe(false)
  })

  it('returns false on localhost', () => {
    expect(shouldEnableLogRocket(true, 'izp1ek/ship-fast', true, 'localhost')).toBe(false)
  })

  it('returns false on localhost with port', () => {
    expect(shouldEnableLogRocket(true, 'izp1ek/ship-fast', true, 'localhost:3000')).toBe(false)
  })

  it('returns false on preview subdomain', () => {
    expect(shouldEnableLogRocket(true, 'izp1ek/ship-fast', true, 'preview.ship-fast.ai')).toBe(false)
  })

  it('returns false on www subdomain', () => {
    expect(shouldEnableLogRocket(true, 'izp1ek/ship-fast', true, 'www.ship-fast.ai')).toBe(false)
  })

  it('returns true only on exact production host with app ID and prod build', () => {
    expect(shouldEnableLogRocket(true, 'izp1ek/ship-fast', true, PROD_HOST)).toBe(true)
  })

  it('returns true with a valid app ID containing slashes', () => {
    expect(shouldEnableLogRocket(true, 'org/app-id', true, PROD_HOST)).toBe(true)
  })
})
