import { describe, expect, it } from 'vitest'
import { renderShipFastLlmsTxt } from './llms-txt'

describe('Ship Fast llms.txt', () => {
  it('summarizes product scope, canonical pages, and export capabilities', () => {
    const body = renderShipFastLlmsTxt({
      siteUrl: 'https://ship-fast.devliv.io',
    })

    expect(body).toContain('# Ship Fast')
    expect(body).toContain('## Summary')
    expect(body).toContain('## Product')
    expect(body).toContain('## Capabilities')
    expect(body).toContain('[Home](https://ship-fast.devliv.io/)')
    expect(body).toContain('[Terms](https://ship-fast.devliv.io/terms)')
    expect(body).toContain(
      'Export generated sites as HTML, React, or Next.js projects.',
    )
    expect(body).toContain('robots.txt, sitemap.xml, and llms.txt')
  })
})
