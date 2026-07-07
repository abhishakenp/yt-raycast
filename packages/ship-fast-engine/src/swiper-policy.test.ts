import { describe, expect, it } from 'vitest'

import { shouldUseSwiper } from './lib/swiper-policy'

describe('swiper export policy', () => {
  it('enables swiper for ecommerce exports even without prompt keywords', () => {
    expect(shouldUseSwiper({ siteType: 'ecommerce', userPrompt: '' })).toBe(
      true,
    )
  })

  it.each([
    ['portfolio with an image gallery'],
    ['agency homepage with a customer logo slider'],
    ['conference page with a speaker slideshow'],
    ['product launch with swipeable feature cards'],
    ['fashion editorial with a hero marquee'],
  ])('enables swiper for explicit carousel-style prompt: %s', (userPrompt) => {
    expect(shouldUseSwiper({ siteType: 'marketing', userPrompt })).toBe(true)
  })

  it('keeps static exports free of swiper when the site spec does not need it', () => {
    expect(
      shouldUseSwiper({
        siteType: 'saas',
        userPrompt: 'analytics platform with pricing and contact forms',
      }),
    ).toBe(false)
    expect(shouldUseSwiper(null)).toBe(false)
    expect(shouldUseSwiper({ siteType: 'blog' })).toBe(false)
  })
})
