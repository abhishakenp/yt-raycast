import { describe, expect, it } from 'vitest'

import { capsuleCategories, findSimilarCapsules } from './capsule-categories'

describe('capsuleCategories', () => {
  it('contains entries for known capsules', () => {
    expect(capsuleCategories['SaasHero']).toBeDefined()
    expect(capsuleCategories['SaasHero'].category).toBe('saas')
    expect(capsuleCategories['SaasHero'].functionalType).toBe('Hero')
  })

  it('categorizes ecommerce capsules under ecommerce', () => {
    expect(capsuleCategories['EcommerceNavbar']?.category).toBe('ecommerce')
    expect(capsuleCategories['EcommerceNavbar']?.functionalType).toBe('Navbar')
  })

  it('excludes primitives from the catalog (engine building blocks, not example sites)', () => {
    // Raw shadcn atoms (Button, Card, Stack, Dialog…) remain in the engine's
    // component-spec but are omitted from the capsule category catalog, so they
    // never surface as a browsable examples category or similar-capsule target.
    expect(capsuleCategories['Button']).toBeUndefined()
    expect(capsuleCategories['Stack']).toBeUndefined()
    expect(
      Object.values(capsuleCategories).some(
        (info) => info.category === 'primitives',
      ),
    ).toBe(false)
  })
})

describe('findSimilarCapsules', () => {
  it('finds capsules in the same category', () => {
    const similar = findSimilarCapsules('EcommerceNavbar')
    expect(similar.length).toBeGreaterThan(0)
    // Should include other ecommerce capsules
    expect(similar.some((name) => name.startsWith('Ecommerce'))).toBe(true)
  })

  it('finds capsules with the same functional type (other navbars)', () => {
    const similar = findSimilarCapsules('SaasNavbar', 20)
    expect(similar.length).toBeGreaterThan(0)
    // Should include other Navbar capsules from different categories
    expect(similar.some((name) => name.endsWith('Navbar'))).toBe(true)
  })

  it('excludes the input capsule from results', () => {
    const similar = findSimilarCapsules('SaasHero')
    expect(similar).not.toContain('SaasHero')
  })

  it('respects the limit parameter', () => {
    const similar = findSimilarCapsules('SaasHero', 3)
    expect(similar.length).toBeLessThanOrEqual(3)
  })

  it('returns empty array for unknown capsule name', () => {
    expect(findSimilarCapsules('NonExistentCapsule')).toEqual([])
  })
})

describe('@ship-fast/blocks generated package subpaths', () => {
  it('imports capsule category helpers through the stable generated package export', async () => {
    const module = await import('@ship-fast/blocks/generated')

    expect(module.findSimilarCapsules('SaasHero').length).toBeGreaterThan(0)
    expect(module.capsuleCategories['SaasHero']?.functionalType).toBe('Hero')
  })

  it('imports capsule category helpers through the package export map', async () => {
    const module =
      await import('@ship-fast/blocks/generated/capsule-categories')

    expect(module.findSimilarCapsules('SaasHero').length).toBeGreaterThan(0)
    expect(module.capsuleCategories['SaasHero']?.functionalType).toBe('Hero')
  })

  it('imports runtime component loaders through the package export map', async () => {
    const module =
      await import('@ship-fast/blocks/generated/runtime-component-loaders')

    expect(typeof module.runtimeComponentLoaders.SaasHero).toBe('function')
  })
})
