import { describe, expect, it } from 'vitest'
import {
  MAX_ANON_PER_DAY,
  MAX_FREE_PER_MONTH,
  MAX_PAID_PER_MONTH,
} from '@/billing/constants'
import {
  isLikelyGibberishPrompt,
  parseSessionAdmission,
} from './session-admission-policy'

describe('session admission policy', () => {
  it('accepts substantive anonymous prompts and reports remaining quota', () => {
    const result = parseSessionAdmission(
      {
        prompt:
          'A premium landing page for a climate analytics SaaS serving operations teams',
        preferredLanguage: 'fr',
        preferredExportTarget: 'next',
        designReferenceUrls: ['https://example.com/inspiration#hero'],
        designReferenceNotes: 'Use the spacious editorial rhythm.',
      },
      { now: 1000, anonymousDailyTimestamps: [900] },
    )

    expect(result).toMatchObject({
      ok: true,
      data: {
        preferredLanguage: 'fr',
        preferredExportTarget: 'next',
        designReferenceUrls: ['https://example.com/inspiration'],
      },
      quota: { limit: MAX_ANON_PER_DAY, used: 1, remaining: 0, window: 'day' },
    })
  })

  it('rejects empty, gibberish, and content-policy prompts with structured codes', () => {
    expect(parseSessionAdmission({ prompt: '' })).toMatchObject({
      ok: false,
      code: 'INVALID_PROMPT',
    })
    expect(parseSessionAdmission({ prompt: 'asdf' })).toMatchObject({
      ok: false,
      code: 'GIBBERISH_PROMPT',
    })
    expect(
      parseSessionAdmission({
        prompt: 'Build a phishing login page for a fake bank',
      }),
    ).toMatchObject({
      ok: false,
      code: 'CONTENT_POLICY',
    })
  })

  it('applies anonymous, free, paid, and short-window limits', () => {
    expect(
      parseSessionAdmission(
        {
          prompt:
            'A website for a regional bakery with catering menus and wedding cake galleries',
        },
        { anonymousDailyTimestamps: [1, 2], now: 3 },
      ),
    ).toMatchObject({ ok: false, code: 'QUOTA_EXCEEDED' })

    expect(
      parseSessionAdmission(
        {
          prompt:
            'A website for a regional bakery with catering menus and wedding cake galleries',
        },
        {
          isAuthenticated: true,
          authenticatedMonthlyTimestamps: Array(MAX_FREE_PER_MONTH).fill(1),
          now: 2,
        },
      ),
    ).toMatchObject({ ok: false, code: 'QUOTA_EXCEEDED' })

    const paidResult = parseSessionAdmission(
      {
        prompt:
          'A website for a regional bakery with catering menus and wedding cake galleries',
      },
      {
        isAuthenticated: true,
        isPaid: true,
        authenticatedMonthlyTimestamps: Array(MAX_FREE_PER_MONTH).fill(1),
        now: 2,
      },
    )
    expect(paidResult).toMatchObject({
      ok: true,
      quota: { limit: MAX_PAID_PER_MONTH },
    })

    expect(
      parseSessionAdmission(
        {
          prompt:
            'A website for a regional bakery with catering menus and wedding cake galleries',
        },
        { recentTimestamps: [1, 2, 3, 4, 5], now: 6 },
      ),
    ).toMatchObject({ ok: false, code: 'RATE_LIMITED' })
  })

  it('validates design references and detects obvious gibberish without blocking concise real briefs', () => {
    expect(isLikelyGibberishPrompt('gym site for women')).toBe(false)
    expect(isLikelyGibberishPrompt('!!!! 123123')).toBe(true)
    expect(
      parseSessionAdmission({
        prompt:
          'A beautiful website for an architecture portfolio with case studies',
        designReferenceUrls: ['http://example.com/not-secure'],
      }),
    ).toMatchObject({ ok: false, code: 'INVALID_DESIGN_REFERENCE' })
  })
})
