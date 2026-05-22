import { describe, expect, it } from 'vitest'
import { inferSiteHint, selectAnchorPair } from '../src/router.js'
import { pickGrammar } from '../src/grammars.js'

describe('router site hints', () => {
  it('splits portfolio from agency briefs', () => {
    const portfolio = inferSiteHint('Personal portfolio for Maya Chen, a freelance brand designer')
    const agency = inferSiteHint('Homepage for Sutter Creative, a brand identity and digital design agency')
    expect(portfolio).toBe('portfolio')
    expect(agency).toBe('agency')
  })

  it('routes fitness before generic studio local-experience', () => {
    const fitness = inferSiteHint('Vertex Fitness, a HIIT and strength training studio in Brooklyn. Class packs.')
    expect(fitness).toBe('fitness')
  })

  it('routes blog before commerce product keywords', () => {
    const blog = inferSiteHint('A blog about dogs — training tips, breed guides, adoption stories, and product reviews for dog owners.')
    expect(blog).toBe('blog')
    const route = selectAnchorPair('A blog about dogs — training tips and product reviews', { seed: 'blog-dogs' })
    expect(route.siteHint).toBe('blog')
    expect(route.grammar.id).toBe('editorial-blog-index')
  })

  it('forces distinct grammars for portfolio vs agency', () => {
    const portfolioRoute = selectAnchorPair('Personal portfolio for Maya Chen, freelance designer', { seed: 'a' })
    const agencyRoute = selectAnchorPair('Sutter Creative agency homepage', { seed: 'a' })
    expect(portfolioRoute.siteHint).toBe('portfolio')
    expect(agencyRoute.siteHint).toBe('agency')
    expect(portfolioRoute.grammar.id).toBe('gallery-masonry')
    expect(agencyRoute.grammar.id).toBe('hero-editorial-split')
    expect(pickGrammar({ siteHint: 'fitness', seed: 'x' }).id).toBe('timeline-led')
  })
})
