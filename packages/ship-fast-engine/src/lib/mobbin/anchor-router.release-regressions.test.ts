import { beforeEach, describe, expect, it, vi } from 'vitest'

const groqMock = vi.hoisted(() => vi.fn())

vi.mock('../../config', () => ({ SHIPFAST_MOBBIN: true }))
vi.mock('../../llm/groq', () => ({ groq: groqMock }))

import {
  anchorMatchesBrief,
  inferMobbinAnchor,
  isMobbinEnabled,
} from './anchor-router'

beforeEach(() => {
  groqMock.mockReset()
})

describe('Mobbin anchor routing', () => {
  it('reports the compile-time feature gate', () => {
    expect(isMobbinEnabled()).toBe(true)
  })

  it('rejects an empty anchor name', () => {
    expect(anchorMatchesBrief('Build a developer tool', {}, '')).toBe(false)
  })

  it('rejects fintech and generic SaaS anchors for ecommerce briefs', () => {
    const brief = 'Build an online gadget store with a cart and product grid'

    expect(anchorMatchesBrief(brief, {}, 'Stripe')).toBe(false)
    expect(anchorMatchesBrief(brief, {}, 'Mercury')).toBe(false)
    expect(anchorMatchesBrief(brief, {}, 'Linear')).toBe(false)
    expect(anchorMatchesBrief(brief, {}, 'Vercel')).toBe(false)
    expect(anchorMatchesBrief(brief, {}, 'Apple')).toBe(true)
  })

  it('uses project context when the prompt omits the site category', () => {
    expect(
      anchorMatchesBrief(
        'Build a polished website',
        { site_type: 'ecommerce', features: ['Wishlist', 'Free shipping'] },
        'Notion',
      ),
    ).toBe(false)
    expect(
      anchorMatchesBrief(
        'Build a polished website',
        { site_type: 'ecommerce', features: ['Wishlist', 'Free shipping'] },
        'Nike',
      ),
    ).toBe(true)
  })

  it('rejects SaaS and fintech DNA for consumer-tech comparison sites', () => {
    expect(
      anchorMatchesBrief(
        'Interactive consumer tech product comparison',
        {},
        'Plaid',
      ),
    ).toBe(false)
    expect(
      anchorMatchesBrief(
        'Interactive consumer tech product comparison',
        {},
        'Cloudflare',
      ),
    ).toBe(false)
    expect(
      anchorMatchesBrief(
        'Interactive consumer tech product comparison',
        {},
        'Apple',
      ),
    ).toBe(true)
  })

  it('allows category-compatible anchors for non-commerce briefs', () => {
    expect(
      anchorMatchesBrief(
        'Observability API for engineering teams',
        { mood: 'precise', color_direction: 'neutral' },
        'Sentry',
      ),
    ).toBe(true)
  })

  it('skips inference for missing or trivial briefs', async () => {
    await expect(inferMobbinAnchor()).resolves.toBeNull()
    await expect(inferMobbinAnchor({ brief: 'short' })).resolves.toBeNull()
    expect(groqMock).not.toHaveBeenCalled()
  })

  it('returns null when the model request fails', async () => {
    groqMock.mockRejectedValue(new Error('network unavailable'))

    await expect(
      inferMobbinAnchor({ brief: 'Developer platform for release operations' }),
    ).resolves.toBeNull()
  })

  it('returns null for empty, errored, malformed, or app-free model output', async () => {
    groqMock
      .mockResolvedValueOnce({ content: '' })
      .mockResolvedValueOnce({ content: '{}', error: 'provider error' })
      .mockResolvedValueOnce({ content: 'not json' })
      .mockResolvedValueOnce({ content: '{"app":null}' })
      .mockResolvedValueOnce({ content: '{"app":7}' })

    const input = { brief: 'Developer platform for release operations' }

    await expect(inferMobbinAnchor(input)).resolves.toBeNull()
    await expect(inferMobbinAnchor(input)).resolves.toBeNull()
    await expect(inferMobbinAnchor(input)).resolves.toBeNull()
    await expect(inferMobbinAnchor(input)).resolves.toBeNull()
    await expect(inferMobbinAnchor(input)).resolves.toBeNull()
  })

  it('rejects a syntactically valid but category-incompatible model choice', async () => {
    groqMock.mockResolvedValue({
      content: JSON.stringify({
        app: 'Stripe',
        category: 'Finance',
        reason: 'Checkout was mentioned',
      }),
    })

    await expect(
      inferMobbinAnchor({
        brief: 'Online gadget store with cart and checkout',
      }),
    ).resolves.toBeNull()
  })

  it('rejects model choices that are not in the curated DNA bank', async () => {
    groqMock.mockResolvedValue({
      content: JSON.stringify({
        app: 'Imaginary Product',
        category: 'Other',
        reason: 'Invented by the model',
      }),
    })

    await expect(
      inferMobbinAnchor({ brief: 'Developer platform for release operations' }),
    ).resolves.toBeNull()
  })

  it('returns curated DNA, valid accents, and parsed routing metadata', async () => {
    groqMock.mockResolvedValue({
      content: JSON.stringify({
        app: 'Linear',
        category: 'Work Management',
        reason: 'Precise product workflow register',
      }),
    })

    const result = await inferMobbinAnchor({
      brief: 'Developer workflow platform for planning releases',
      projectContext: {
        project_name: 'Release Desk',
        tagline: 'Plan and ship with evidence',
        site_type: 'software',
        mood: 'precise',
        style_keywords: 'clean, dense, product-led',
        color_direction: 'cool neutral',
      },
    })

    expect(result).toMatchObject({
      app: 'Linear',
      category: 'Work Management',
      reason: 'Precise product workflow register',
    })
    expect(result?.dna).toBeTruthy()
    expect(result?.accents).toEqual(
      result?.accents.filter((color) => /^#[0-9a-f]{6}$/i.test(color)),
    )
    expect(result?.palette).toEqual(result?.accents)
    expect(groqMock).toHaveBeenCalledTimes(1)
    expect(groqMock.mock.calls[0]?.[0]).toContain('Release Desk')
    expect(groqMock.mock.calls[0]?.[0]).toContain('cool neutral')
  })

  it('derives a stable category and empty reason when the model omits both', async () => {
    groqMock.mockResolvedValue({
      content: JSON.stringify({ app: 'Sentry' }),
    })

    await expect(
      inferMobbinAnchor({ brief: 'Observability for engineering teams' }),
    ).resolves.toMatchObject({
      app: 'Sentry',
      category: 'Developer Tools',
      reason: '',
    })
  })

  it.each([
    ['Airbnb', 'Travel & Hospitality'],
    ['Apple', 'Consumer & Retail'],
    ['Headspace', 'Wellness'],
    ['Spotify', 'Media & Editorial'],
    ['Linear', 'Developer Tools'],
    ['OpenAI', 'AI'],
    ['Notion', 'Productivity'],
    ['Stripe', 'Finance'],
    ['Figma', 'Design'],
    ['HubSpot', 'Marketing'],
    ['Posthog', 'Data & Analytics'],
    ['Cloudflare', 'Infrastructure'],
    ['Webflow', 'Other'],
  ])('derives the curated category for %s', async (app, expectedCategory) => {
    groqMock.mockResolvedValue({
      content: JSON.stringify({ app }),
    })

    await expect(
      inferMobbinAnchor({
        brief: 'A polished business website for a real product',
      }),
    ).resolves.toMatchObject({ category: expectedCategory })
  })
})
