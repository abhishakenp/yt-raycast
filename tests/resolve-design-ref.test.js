import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { resolveDesignRef } from '../src/prompts/resolve-design-ref.js'
import { VALID_SITE_TYPES } from '../src/config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const goldenPath = join(__dirname, 'fixtures', 'design-ref-golden.json')

test('resolveDesignRef: golden expectations', () => {
  const cases = JSON.parse(readFileSync(goldenPath, 'utf-8'))
  for (const c of cases) {
    const r = resolveDesignRef({
      prompt: c.prompt,
      siteType: c.siteType,
      businessProfile: c.businessProfile || {},
      respectWorkspaceOverride: false,
    })
    assert.equal(r.refId, c.expectRefId, `prompt="${c.prompt}" siteType=${c.siteType}`)
  }
})

test('resolveDesignRef: each VALID_SITE_TYPE has a base path', () => {
  for (const siteType of VALID_SITE_TYPES) {
    const r = resolveDesignRef({
      prompt: 'x',
      siteType,
      businessProfile: {},
      respectWorkspaceOverride: false,
    })
    assert.ok(r.designRef?.content?.length > 50, `missing base content for ${siteType} got ${r.refId}`)
  }
})

test('institutional-aurora sets injectAuroraLiquid', () => {
  const r = resolveDesignRef({
    prompt: 'government ministry portal for citizens',
    siteType: 'institutional',
    businessProfile: {},
    respectWorkspaceOverride: false,
  })
  assert.equal(r.refId, 'institutional-aurora')
  assert.equal(r.injectAuroraLiquid, true)
  assert.equal(r.stashName, 'aurora')
})
