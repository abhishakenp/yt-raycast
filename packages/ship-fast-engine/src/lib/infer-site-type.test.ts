import { describe, expect, it } from 'vitest'
import { inferSiteTypeHint } from './infer-site-type'

describe('inferSiteTypeHint', () => {
  it('detects game from "playable"', () => {
    expect(inferSiteTypeHint('A playable 3D flight simulator')).toBe('game')
  })

  it('detects game from "flight simulator"', () => {
    expect(inferSiteTypeHint('flight simulator game')).toBe('game')
  })

  it('detects game from "simulator"', () => {
    expect(inferSiteTypeHint('3D simulator with physics')).toBe('game')
  })

  it('detects game from existing patterns', () => {
    expect(inferSiteTypeHint('build a game')).toBe('game')
    expect(inferSiteTypeHint('3D arcade game')).toBe('game')
  })

  it('returns null for non-game prompts', () => {
    expect(inferSiteTypeHint('a simple landing page')).toBe(null)
    expect(inferSiteTypeHint('portfolio website')).toBe('portfolio')
  })
})
