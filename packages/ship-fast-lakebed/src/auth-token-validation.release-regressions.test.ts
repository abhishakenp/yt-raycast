import { describe, expect, it } from 'vitest'

import {
  createGoogleAuthFromToken,
  decodeIdentityClaims,
} from './auth-shared.ts'

function base64Url(value: unknown) {
  return btoa(JSON.stringify(value))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function tokenFor(payload: unknown) {
  return `${base64Url({ alg: 'RS256', typ: 'JWT' })}.${base64Url(payload)}.signature`
}

describe('Lakebed identity token validation', () => {
  it('returns null for malformed base64 instead of throwing during auth initialization', () => {
    expect(() => decodeIdentityClaims('header.%%%.signature')).not.toThrow()
    expect(decodeIdentityClaims('header.%%%.signature')).toBeNull()
  })

  it.each([
    { label: 'empty array', payload: [] },
    { label: 'populated array', payload: ['pairwise_sub'] },
    { label: 'number', payload: 42 },
    { label: 'string', payload: 'identity' },
    { label: 'boolean', payload: true },
  ])(
    'rejects a non-record identity payload: $label',
    function rejectsNonRecord({ payload }) {
      expect(decodeIdentityClaims(tokenFor(payload))).toBeNull()
    },
  )

  it('does not create authenticated state from an expired identity token', () => {
    const token = tokenFor({
      exp: Math.floor(Date.now() / 1_000) - 60,
      pairwise_sub: 'expired-user',
    })

    expect(createGoogleAuthFromToken(token)).toBeNull()
  })

  it('creates authenticated state for a valid unexpired identity control', () => {
    const token = tokenFor({
      exp: Math.floor(Date.now() / 1_000) + 3_600,
      name: 'Ada',
      pairwise_sub: 'valid-user',
    })

    expect(createGoogleAuthFromToken(token)).toMatchObject({
      displayName: 'Ada',
      isAuthenticated: true,
      isGuest: false,
      userId: 'google:valid-user',
    })
  })
})
