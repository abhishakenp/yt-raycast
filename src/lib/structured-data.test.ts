import { describe, expect, it } from 'vitest'

import { SITE_NAME, SITE_URL } from './site-config'
import { homeStructuredDataJson } from './structured-data'

describe('homeStructuredDataJson', () => {
  it('emits software application and website JSON-LD for the homepage', () => {
    const data = JSON.parse(
      homeStructuredDataJson('Generate production-ready websites fast.'),
    )

    expect(data).toHaveLength(2)
    expect(data[0]).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      url: SITE_URL,
      description: 'Generate production-ready websites fast.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    })
    expect(data[1]).toMatchObject({
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      description: 'Generate production-ready websites fast.',
    })
  })
})
