import assert from 'node:assert/strict'
import test from 'node:test'
import { reconcileExpandedSiteSpec } from '../src/spec/reconcile-expanded-spec.js'

test('reconcileExpandedSiteSpec: moves homepage id to index 0', () => {
  const thin = { pages: [{ id: 'page-home', route: '/', name: 'Home' }] }
  const expanded = {
    pages: [
      { id: 'page-about', route: '/about', name: 'About' },
      { id: 'page-home', route: '/', name: 'Home' },
    ],
  }
  const r = reconcileExpandedSiteSpec(thin, expanded, () => {})
  assert.equal(r.pages[0].id, 'page-home')
  assert.equal(r.pages.length, 2)
})

test('reconcileExpandedSiteSpec: prepends thin homepage when id missing', () => {
  const thin = { pages: [{ id: 'page-home', route: '/', name: 'Home' }] }
  const expanded = { pages: [{ id: 'page-other', route: '/x', name: 'X' }] }
  const r = reconcileExpandedSiteSpec(thin, expanded, () => {})
  assert.equal(r.pages[0].id, 'page-home')
  assert.equal(r.pages.length, 2)
})
