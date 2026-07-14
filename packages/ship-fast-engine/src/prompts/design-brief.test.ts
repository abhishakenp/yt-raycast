import { describe, expect, it } from 'vitest'

import { GROQ_MODEL } from '../config'
import { designBriefPrompt } from './design-brief'

describe('designBriefPrompt', () => {
  it('infers commerce briefs and requires native storefront depth', () => {
    const result = designBriefPrompt(
      'Build a premium online store for handmade watches with product cards and a cart',
    )

    expect(result.user).toContain('DTC retail depth')
    expect(result.user).toContain('minimum six cards')
    expect(result.user).toContain('Cart with count')
    expect(result.user).toContain('conversion rate')
  })

  it('states that explicit design references override exemplar aesthetics', () => {
    const result = designBriefPrompt(
      'Build a storefront',
      null,
      'ecommerce',
      true,
    )

    expect(result.user).toContain(
      'user reference URLs in the prompt override exemplar aesthetics',
    )
  })

  it('does not prescribe Framer Motion for game output', () => {
    const result = designBriefPrompt('Build a puzzle game', null, 'game')

    expect(result.user).not.toContain('plan Framer Motion')
  })

  it('locks Mobbin anchor colors into both system doctrine and user palette', () => {
    const result = designBriefPrompt(
      'Build a finance dashboard',
      null,
      'dashboard',
      false,
      {
        app: 'Linear',
        category: 'productivity',
        palette: ['#101014', '#5E6AD2'],
        accents: ['#5E6AD2'],
        dna: { doctrine: ['compact density'] },
        copyExamples: null,
      },
    )

    expect(result.system).toContain('Linear')
    expect(result.user).toContain('MOBBIN PRO ANCHOR PALETTE LOCK')
    expect(result.user).toContain('#5E6AD2')
    expect(result.user).toContain('DO NOT substitute or "round" them')
  })

  it('falls back to DNA accents when direct anchor accents are absent', () => {
    const result = designBriefPrompt(
      'Build a productivity app',
      null,
      'saas',
      false,
      {
        app: 'Notion',
        category: 'productivity',
        palette: null,
        dna: { accents: ['#F7F6F3'] },
        copyExamples: null,
      },
    )

    expect(result.user).toContain('#F7F6F3')
  })

  it('returns the pinned generation parameters', () => {
    const result = designBriefPrompt('Build a software landing page')

    expect(result.model).toBe(GROQ_MODEL)
    expect(result.temperature).toBe(0.4)
    expect(result.maxTokens).toBe(3000)
    expect(result.system).toContain('Output ONLY markdown')
  })
})
