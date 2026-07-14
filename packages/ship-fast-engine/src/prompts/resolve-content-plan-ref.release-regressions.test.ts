import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { stashContentPlanRefName } from './content-refs'
import { DESIGN_REF_ENTRIES } from './design-refs/registry'
import { resolveContentPlanRef } from './resolve-content-plan-ref'

describe('content-plan reference resolution', () => {
  it('uses the landing base for default input', () => {
    const result = resolveContentPlanRef()

    expect(result).toMatchObject({
      refId: 'landing-base',
      stashName: 'landing-base',
      reason: 'site-base',
    })
    expect(result.contentPlanRef?.name).toBe('landing-base')
    expect(result.contentPlanRef?.content.length).toBeGreaterThan(100)
  })

  it('normalizes an unknown site type to the landing base', () => {
    const result = resolveContentPlanRef({ siteType: 'unknown-target' })

    expect(result.refId).toBe('landing-base')
    expect(result.reason).toBe('site-base')
  })

  it('selects a site-specific base when no specialized keyword matches', () => {
    const result = resolveContentPlanRef({
      siteType: 'blog',
      prompt: 'A thoughtful publication about everyday craft',
    })

    expect(result).toMatchObject({
      refId: 'blog-base',
      stashName: 'blog-base',
      reason: 'site-base',
    })
    expect(result.contentPlanRef?.name).toBe('blog-base')
  })

  it('selects the highest-priority compatible keyword reference', () => {
    const result = resolveContentPlanRef({
      siteType: 'saas',
      prompt: 'A fintech API and developer SDK for payments infrastructure',
    })

    expect(result).toMatchObject({
      refId: 'saas-fintech',
      stashName: 'saas-fintech',
      reason: 'keyword',
    })
  })

  it('merges a specialized reference over its site base before generation', () => {
    const result = resolveContentPlanRef({
      siteType: 'ecommerce',
      prompt: 'Luxury fashion and jewelry storefront',
    })

    expect(result.contentPlanRef?.name).toBe('ecommerce-base+ecommerce-fashion')
    expect(result.contentPlanRef?.content).toContain(
      '--- Overlay (ecommerce-fashion) ---',
    )
    expect(result.contentPlanRef?.content).toContain('## PDP')
    expect(result.contentPlanRef?.content).toContain('variant matrix')
  })

  it('uses business industry as routing evidence', () => {
    const result = resolveContentPlanRef({
      siteType: 'institutional',
      prompt: 'A reliable public information website',
      businessProfile: { industry: 'municipal citizen services' },
    })

    expect(result).toMatchObject({
      refId: 'institutional-aurora',
      stashName: 'aurora',
      reason: 'keyword',
    })
    expect(result.contentPlanRef?.name).toBe('institutional-base+aurora')
  })

  it('does not apply a keyword reference to an incompatible site type', () => {
    const result = resolveContentPlanRef({
      siteType: 'docs',
      prompt: 'Luxury fashion and jewelry documentation',
    })

    expect(result.refId).toBe('docs-base')
    expect(result.reason).toBe('site-base')
  })

  it('honors a persisted workspace override only when explicitly enabled', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-content-plan-'))

    try {
      stashContentPlanRefName(workspace, 'portfolio-creative')

      const ignored = resolveContentPlanRef({
        siteType: 'portfolio',
        workspace,
        respectWorkspaceOverride: false,
      })
      const honored = resolveContentPlanRef({
        siteType: 'portfolio',
        workspace,
        respectWorkspaceOverride: true,
      })

      expect(ignored.refId).toBe('portfolio-base')
      expect(honored).toMatchObject({
        refId: 'portfolio-creative',
        stashName: 'portfolio-creative',
        reason: 'workspace',
      })
      expect(honored.contentPlanRef?.name).toBe('portfolio-creative')
    } finally {
      rmSync(workspace, { recursive: true, force: true })
    }
  })

  it('falls back normally when a workspace override names no real reference', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-content-plan-'))

    try {
      stashContentPlanRefName(workspace, 'missing-reference')

      const result = resolveContentPlanRef({
        siteType: 'dashboard',
        workspace,
        respectWorkspaceOverride: true,
      })

      expect(result.refId).toBe('dashboard-base')
      expect(result.reason).toBe('site-base')
    } finally {
      rmSync(workspace, { recursive: true, force: true })
    }
  })

  it('accepts a valid workspace reference even without registry metadata', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-content-plan-'))

    try {
      stashContentPlanRefName(workspace, 'global-spec-rules')

      const result = resolveContentPlanRef({
        workspace,
        respectWorkspaceOverride: true,
      })

      expect(result).toMatchObject({
        refId: 'global-spec-rules',
        stashName: 'global-spec-rules',
        reason: 'workspace',
      })
      expect(result.contentPlanRef?.content.length).toBeGreaterThan(100)
    } finally {
      rmSync(workspace, { recursive: true, force: true })
    }
  })

  it('does not duplicate a site base when a specialized entry uses the same file', () => {
    const specialized = DESIGN_REF_ENTRIES.find(
      (entry) => entry.id === 'ecommerce-fashion',
    )
    expect(specialized).toBeDefined()
    if (!specialized) return

    const original = specialized.contentPlanFile
    try {
      specialized.contentPlanFile = 'ecommerce-base'
      const result = resolveContentPlanRef({
        siteType: 'ecommerce',
        prompt: 'Luxury fashion storefront',
      })

      expect(result.contentPlanRef?.name).toBe('ecommerce-base')
      expect(result.contentPlanRef?.content).not.toContain('--- Overlay')
    } finally {
      specialized.contentPlanFile = original
    }
  })

  it('keeps the specialized plan when its site base file is unavailable', () => {
    const base = DESIGN_REF_ENTRIES.find(
      (entry) => entry.id === 'ecommerce-base',
    )
    expect(base).toBeDefined()
    if (!base) return

    const original = base.contentPlanFile
    try {
      base.contentPlanFile = 'missing-base-reference'
      const result = resolveContentPlanRef({
        siteType: 'ecommerce',
        prompt: 'Luxury fashion storefront',
      })

      expect(result.contentPlanRef?.name).toBe('ecommerce-fashion')
      expect(result.contentPlanRef?.content).not.toContain('--- Overlay')
    } finally {
      base.contentPlanFile = original
    }
  })

  it('keeps the specialized plan when no site base entry exists', () => {
    const index = DESIGN_REF_ENTRIES.findIndex(
      (entry) => entry.id === 'ecommerce-base',
    )
    expect(index).toBeGreaterThanOrEqual(0)
    const removed = DESIGN_REF_ENTRIES.splice(index, 1)

    try {
      const result = resolveContentPlanRef({
        siteType: 'ecommerce',
        prompt: 'Luxury fashion storefront',
      })

      expect(result.contentPlanRef?.name).toBe('ecommerce-fashion')
      expect(result.reason).toBe('keyword')
    } finally {
      DESIGN_REF_ENTRIES.splice(index, 0, ...removed)
    }
  })

  it('uses the global fallback when a valid site has no base entry', () => {
    const index = DESIGN_REF_ENTRIES.findIndex(
      (entry) => entry.id === 'dashboard-base',
    )
    expect(index).toBeGreaterThanOrEqual(0)
    const removed = DESIGN_REF_ENTRIES.splice(index, 1)

    try {
      const result = resolveContentPlanRef({
        siteType: 'dashboard',
        prompt: 'A plain operations workspace',
      })

      expect(result).toMatchObject({
        refId: 'landing-base',
        stashName: 'landing-base',
        reason: 'fallback',
      })
    } finally {
      DESIGN_REF_ENTRIES.splice(index, 0, ...removed)
    }
  })

  it('returns the final landing reference when registry metadata is empty', () => {
    const original = DESIGN_REF_ENTRIES.splice(0)

    try {
      const result = resolveContentPlanRef({ siteType: 'docs' })

      expect(result).toMatchObject({
        refId: 'landing-base',
        stashName: 'landing-base',
        reason: 'empty',
      })
      expect(result.contentPlanRef?.name).toBe('landing-base')
    } finally {
      DESIGN_REF_ENTRIES.push(...original)
    }
  })
})
