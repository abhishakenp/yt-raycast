import { describe, expect, it } from 'vitest'
import {
  createDefaultDeploymentSlug,
  createGeneratedSubdomainUrl,
  getGeneratedSubdomainSlug,
  normalizeDeploymentSlug,
} from '@/features/publish/services/deployment-slug'

describe('deployment slug', () => {
  it('normalizes user-facing slugs for generated subdomains', () => {
    expect(normalizeDeploymentSlug('  Privacy Analytics MVP!! ')).toBe('privacy-analytics-mvp')
  })

  it('derives a default slug from the first prompt words', () => {
    expect(createDefaultDeploymentSlug('A launch site for privacy analytics with pricing', 'kh123')).toBe(
      'a-launch-site-for',
    )
  })

  it('builds generated ship-fast subdomain URLs', () => {
    expect(createGeneratedSubdomainUrl('Privacy Analytics')).toBe('https://privacy-analytics.ship-fast.io')
  })

  it('extracts a generated slug from ship-fast hostnames', () => {
    expect(getGeneratedSubdomainSlug('privacy-analytics.ship-fast.io:443')).toBe('privacy-analytics')
    expect(getGeneratedSubdomainSlug('ship-fast.io')).toBeUndefined()
  })
})
