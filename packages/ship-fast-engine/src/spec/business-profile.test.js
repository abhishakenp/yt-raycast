import { describe, expect, it } from 'vitest'

import {
  buildHeuristicBusinessProfile,
  normalizeBusinessProfile,
} from './business-profile.js'

describe('buildHeuristicBusinessProfile', () => {
  it('infers EU fintech compliance posture from a prompt', () => {
    const profile = buildHeuristicBusinessProfile({
      prompt: 'Berlin fintech platform for enterprise payments with SOC 2',
      siteType: 'saas',
    })

    expect(profile.customerModel).toBe('B2B / B2C financial services')
    expect(profile.industry).toBe('Financial technology')
    expect(profile.jurisdiction).toBe('European Union')
    expect(profile.segment).toBe('Enterprise')
    expect(profile.taxFootprint).toContain('EU VAT')
    expect(profile.trustSignals).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Financial compliance'),
        'SOC2 / security program (as stated in prompt)',
      ]),
    )
  })

  it('classifies wholesale ecommerce separately from direct-to-consumer retail', () => {
    const profile = buildHeuristicBusinessProfile({
      prompt: 'B2B wholesale online store for luxury leather goods',
      siteType: 'ecommerce',
    })

    expect(profile.customerModel).toBe('B2B wholesale / retail')
    expect(profile.industry).toBe('Retail — apparel & accessories')
    expect(profile.industryCode).toMatchObject({
      system: 'NACE',
      code: '47.91',
    })
    expect(profile.revenueModel).toBe(
      'Product revenue + shipping & fulfillment',
    )
  })
})

describe('normalizeBusinessProfile', () => {
  it('fills missing and blank fields from fallback while preserving explicit values', () => {
    const fallback = buildHeuristicBusinessProfile({
      prompt: 'health clinic patient portal',
      siteType: 'landing',
    })

    const normalized = normalizeBusinessProfile(
      {
        customerModel: '  ',
        industry: 'Clinical analytics',
        industryCode: { system: 'NAICS', code: '', label: 'Analytics' },
        legalForm: '',
        jurisdiction: 'Canada',
        trustSignals: ['HIPAA-ready', '', 42],
      },
      fallback,
    )

    expect(normalized.customerModel).toBe(fallback.customerModel)
    expect(normalized.industry).toBe('Clinical analytics')
    expect(normalized.industryCode).toEqual({
      system: 'NAICS',
      code: fallback.industryCode.code,
      label: 'Analytics',
    })
    expect(normalized.legalForm).toBe(fallback.legalForm)
    expect(normalized.jurisdiction).toBe('Canada')
    expect(normalized.revenueModel).toBe(fallback.revenueModel)
    expect(normalized.trustSignals).toEqual(['HIPAA-ready', '42'])
  })

  it('returns a cloned fallback for non-object input', () => {
    const fallback = buildHeuristicBusinessProfile({
      prompt: 'nonprofit foundation for donors',
      siteType: 'institutional',
    })

    const normalized = normalizeBusinessProfile(null, fallback)

    expect(normalized).toEqual(fallback)
    expect(normalized).not.toBe(fallback)
  })
})
