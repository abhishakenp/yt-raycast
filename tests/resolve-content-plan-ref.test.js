import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveContentPlanRef } from '../src/prompts/resolve-content-plan-ref.js'
import { VALID_SITE_TYPES } from '../src/config.js'

test('resolveContentPlanRef: each VALID_SITE_TYPE resolves base content', () => {
  for (const siteType of VALID_SITE_TYPES) {
    const r = resolveContentPlanRef({
      prompt: 'generic project',
      siteType,
      businessProfile: {},
      respectWorkspaceOverride: false,
    })
    assert.ok(
      r.contentPlanRef?.content?.length > 40,
      `missing content plan for ${siteType} (${r.refId})`,
    )
  }
})

test('resolveContentPlanRef: ecommerce fashion keyword merges overlay', () => {
  const r = resolveContentPlanRef({
    prompt: 'luxury fashion apparel boutique',
    siteType: 'ecommerce',
    businessProfile: {},
    respectWorkspaceOverride: false,
  })
  assert.equal(r.refId, 'ecommerce-fashion')
  assert.ok(r.contentPlanRef?.content?.includes('Fashion'))
})

test('resolveContentPlanRef: institutional government uses aurora plan', () => {
  const r = resolveContentPlanRef({
    prompt: 'municipal government citizen portal',
    siteType: 'institutional',
    businessProfile: {},
    respectWorkspaceOverride: false,
  })
  assert.equal(r.refId, 'institutional-aurora')
  assert.ok(r.contentPlanRef?.content?.includes('Citizen'))
})
