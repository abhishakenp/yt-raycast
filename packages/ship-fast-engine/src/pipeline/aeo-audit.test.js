import { describe, expect, it } from 'vitest'
import { siteSpecPassesAeoAudit } from './aeo-audit.js'

describe('aeo-audit', () => {
  it('warns when the home page lacks a direct-answer section', () => {
    const result = siteSpecPassesAeoAudit({
      projectName: 'Acme',
      siteType: 'saas',
      seo: { siteName: 'Acme', siteUrl: 'https://acme.example', description: 'Acme helps teams plan work.' },
      pages: [
        {
          route: '/',
          title: 'Home',
          description: 'Acme helps teams plan work.',
          seo: { title: 'Acme | Project management', description: 'Acme helps teams plan work.' },
          sections: [{ type: 'hero', headline: 'Plan work clearly' }],
        },
      ],
    })

    expect(result.ok).toBe(true)
    expect(result.warnings.some((issue) => issue.code === 'missing_direct_answer')).toBe(true)
  })

  it('flags missing metadata as errors', () => {
    const result = siteSpecPassesAeoAudit({
      pages: [{ route: '/', title: '', description: '', seo: { title: '', description: '' }, sections: [] }],
    })

    expect(result.ok).toBe(false)
    expect(result.errors.some((issue) => issue.code === 'missing_title')).toBe(true)
  })
})
