import { describe, expect, it } from 'vitest'

import { resolveDesignRefSearch } from './design-ref-search'

describe('resolveDesignRefSearch', () => {
  it('resolves known design brands from partial names', () => {
    expect(resolveDesignRefSearch('str')).toEqual({
      url: 'https://stripe.com',
      title: 'Stripe',
    })
    expect(resolveDesignRefSearch('Next')).toEqual({
      url: 'https://nextjs.org',
      title: 'Next.js',
    })
  })

  it('normalizes direct domains into HTTPS design references', () => {
    expect(resolveDesignRefSearch('www.example.com')).toEqual({
      url: 'https://www.example.com',
      title: 'Example',
    })
  })

  it('returns null for empty and unknown searches', () => {
    expect(resolveDesignRefSearch('')).toBeNull()
    expect(
      resolveDesignRefSearch('definitely-not-a-known-design-ref'),
    ).toBeNull()
  })
})
