import test from 'node:test'
import assert from 'node:assert/strict'
import { inferSiteTypeHint } from '../src/lib/infer-site-type.js'
import { shouldExpandVagueMarketing } from '../src/prompts/vague-marketing-brief.js'

test('inferSiteTypeHint detects SaaS from marketing fluff', () => {
  assert.equal(
    inferSiteTypeHint('Modern SaaS landing page, clean UI, fast, scalable, AI-powered UX flow'),
    'saas',
  )
  assert.equal(inferSiteTypeHint('B2B SaaS platform for enterprise workflows'), 'saas')
})

test('shouldExpandVagueMarketing true for saas site type without saas keyword', () => {
  assert.equal(shouldExpandVagueMarketing('clean fast minimal scalable', 'saas'), true)
})
