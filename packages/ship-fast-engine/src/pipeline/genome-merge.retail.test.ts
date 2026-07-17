import { describe, expect, it } from 'vitest'

import {
  GENOME_NAMES,
  mergeWithGenome,
  pickGenome,
  pickRetailGenome,
} from './genome-merge.js'

describe('retail genome routing', () => {
  it('registers the retail sub-skins as real genomes', () => {
    for (const g of [
      'luxury-gallery',
      'street-bold',
      'pop-retail',
      'tech-mono',
      'boutique-organic',
    ]) {
      expect(GENOME_NAMES).toContain(g)
    }
  })

  it('routes commerce briefs by category semantics, not one fixed skin', () => {
    expect(pickRetailGenome('a fine jewelry and watches boutique')).toBe(
      'luxury-gallery',
    )
    expect(pickRetailGenome('limited sneaker drops for streetwear fans')).toBe(
      'street-bold',
    )
    expect(pickRetailGenome('a candy and toys shop for kids')).toBe(
      'pop-retail',
    )
    expect(pickRetailGenome('headphones and camera gadgets store')).toBe(
      'tech-mono',
    )
    expect(pickRetailGenome('a shop for nice things')).toBe('boutique-organic')
  })

  it('pickGenome uses the brief for ecommerce/dtc/retail site types', () => {
    expect(
      pickGenome({ siteType: 'ecommerce', brief: 'luxury watch atelier' }),
    ).toEqual({ genome: 'luxury-gallery', source: 'retail:ecommerce' })
    expect(
      pickGenome({ siteType: 'dtc', brief: 'sneaker drop store' }),
    ).toEqual({ genome: 'street-bold', source: 'retail:dtc' })
    expect(pickGenome({ siteType: 'retail', brief: '' })).toEqual({
      genome: 'boutique-organic',
      source: 'retail:retail',
    })
    // Non-commerce site types keep their existing mapping.
    expect(pickGenome({ siteType: 'saas', brief: 'luxury watches' })).toEqual({
      genome: 'vercel-apple',
      source: 'siteType:saas',
    })
  })

  it('retail skins rewrite neutral families onto their target ground', () => {
    const html =
      '<body class="bg-white"><section class="bg-slate-50 text-slate-900"><p class="text-gray-500">hi</p></section></body>'
    const luxury = mergeWithGenome(html, 'luxury-gallery')
    expect(luxury).toContain('bg-stone-50')
    expect(luxury).toContain('text-stone-900')
    expect(luxury).not.toContain('text-gray-500')

    const street = mergeWithGenome(html, 'street-bold')
    expect(street).toContain('bg-zinc-950')
    expect(street).not.toContain('bg-slate-50')
  })
})
