import { describe, expect, it } from 'vitest'

import {
  classifyReferralEmail,
  DISPOSABLE_EMAIL_DOMAINS,
  extractEmailDomain,
  isDisposableEmail,
  isValidEmail,
} from './disposable_email'

describe('disposable_email', () => {
  it('flags the burners the user explicitly called out', () => {
    expect(isDisposableEmail('someone@mailinator.com')).toBe(true)
    expect(isDisposableEmail('someone@yopmail.com')).toBe(true)
    expect(isDisposableEmail('someone@yopmail.fr')).toBe(true)
    expect(isDisposableEmail('someone@guerrillamail.com')).toBe(true)
    expect(isDisposableEmail('someone@temp-mail.org')).toBe(true)
    expect(isDisposableEmail('someone@10minutemail.com')).toBe(true)
  })

  it('is case- and whitespace-insensitive', () => {
    expect(isDisposableEmail('  Person@MAILINATOR.com  ')).toBe(true)
    expect(extractEmailDomain('  A.B@Gmail.COM ')).toBe('gmail.com')
  })

  it('catches sub-domained burners', () => {
    expect(isDisposableEmail('x@inbox.mailinator.com')).toBe(true)
    expect(isDisposableEmail('x@a.b.yopmail.com')).toBe(true)
  })

  it('allows real mailboxes', () => {
    expect(isDisposableEmail('founder@gmail.com')).toBe(false)
    expect(isDisposableEmail('jane@acme.co')).toBe(false)
    expect(isDisposableEmail('user@outlook.com')).toBe(false)
    expect(isDisposableEmail('loicmancino.work@gmail.com')).toBe(false)
  })

  it('does not false-positive on lookalike domains', () => {
    // mailinator is blocked, but "mailinatorx.com" is a different domain
    expect(isDisposableEmail('x@mailinatorx.com')).toBe(false)
    // gmail must never be in the blocklist
    expect(DISPOSABLE_EMAIL_DOMAINS.has('gmail.com')).toBe(false)
  })

  it('validates email shape', () => {
    expect(isValidEmail('a@b.com')).toBe(true)
    expect(isValidEmail('not-an-email')).toBe(false)
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('a@@b.com')).toBe(false)
  })

  it('classifies for referral qualification', () => {
    expect(classifyReferralEmail('founder@gmail.com')).toEqual({
      email: 'founder@gmail.com',
      valid: true,
      disposable: false,
      acceptable: true,
    })
    expect(classifyReferralEmail('burner@mailinator.com')).toEqual({
      email: 'burner@mailinator.com',
      valid: true,
      disposable: true,
      acceptable: false,
    })
    expect(classifyReferralEmail('garbage')).toEqual({
      email: 'garbage',
      valid: false,
      disposable: false,
      acceptable: false,
    })
    expect(classifyReferralEmail(null)).toEqual({
      email: '',
      valid: false,
      disposable: false,
      acceptable: false,
    })
  })
})
