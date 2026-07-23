import { afterEach, describe, expect, it } from 'vitest'
import {
  MAX_ANON_PER_DAY,
  MAX_ANON_PER_MONTH,
  MAX_FREE_PER_MONTH,
  MAX_PAID_PER_MONTH,
  SHARE_BONUS_EXTRA,
} from '@/billing/constants'
import {
  isLikelyGibberishPrompt,
  normalizePromptCacheKey,
  parseSessionAdmission,
} from './session-admission-policy'

describe('session admission policy', () => {
  afterEach(() => {
    delete process.env.IS_DEV
    delete process.env.DISABLE_LIMIT
  })

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
      quota: {
        limit: MAX_ANON_PER_MONTH,
        used: 1,
        remaining: MAX_ANON_PER_MONTH - 2,
        window: 'month',
      },
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
    // Anonymous: 4 daily timestamps (MAX_ANON_PER_DAY + SHARE_BONUS_EXTRA) hits daily cap
    expect(
      parseSessionAdmission(
        {
          prompt:
            'A website for a regional bakery with catering menus and wedding cake galleries',
        },
        {
          anonymousDailyTimestamps: Array(
            MAX_ANON_PER_DAY + SHARE_BONUS_EXTRA,
          ).fill(1),
          now: 2,
        },
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

  it('bypasses rate and quota limits when Convex dev mode is enabled', () => {
    process.env.IS_DEV = 'true'

    expect(
      parseSessionAdmission(
        {
          prompt:
            'A website for a regional bakery with catering menus and wedding cake galleries',
        },
        {
          anonymousDailyTimestamps: Array(
            MAX_ANON_PER_DAY + SHARE_BONUS_EXTRA,
          ).fill(1),
          recentTimestamps: [1, 2, 3, 4, 5],
          now: 6,
        },
      ),
    ).toMatchObject({ ok: true })
  })

  it('bypasses rate and quota limits when bypassLimits is true', () => {
    process.env.IS_DEV = ''
    process.env.DISABLE_LIMIT = ''

    expect(
      parseSessionAdmission(
        {
          prompt:
            'A website for a regional bakery with catering menus and wedding cake galleries',
        },
        {
          anonymousDailyTimestamps: Array(
            MAX_ANON_PER_DAY + SHARE_BONUS_EXTRA,
          ).fill(1),
          recentTimestamps: [1, 2, 3, 4, 5],
          now: 6,
          bypassLimits: true,
        },
      ),
    ).toMatchObject({ ok: true })
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

  it('keeps duplicate-prompt cache keys language scoped', () => {
    const prompt = 'Build a bakery homepage'

    expect(normalizePromptCacheKey(prompt, 'en')).toBe(
      'en:build a bakery homepage',
    )
    expect(normalizePromptCacheKey(prompt, 'hi')).toBe(
      'hi:build a bakery homepage',
    )
    expect(normalizePromptCacheKey(prompt, 'en')).not.toBe(
      normalizePromptCacheKey(prompt, 'hi'),
    )
  })
})
