import test from 'node:test'
import assert from 'node:assert/strict'
import {
  isVagueMarketingPrompt,
  shouldExpandVagueMarketing,
} from '../src/prompts/vague-marketing-brief.js'

test('flags short fluffy marketing prompts', () => {
  assert.equal(
    isVagueMarketingPrompt('Modern SaaS landing page, clean UI, fast, scalable, AI-powered UX flow'),
    true,
  )
  assert.equal(isVagueMarketingPrompt('x'), true)
  assert.equal(
    isVagueMarketingPrompt(
      'Acme is a SOC2 observability platform for platform teams; compare to Datadog on cost, ship SLO dashboards in 48h, integrate with Kubernetes and Terraform; primary ICP is Series B infra leads.',
    ),
    false,
  )
})

test('shouldExpandVagueMarketing respects site type', () => {
  assert.equal(
    shouldExpandVagueMarketing('Modern SaaS landing page, clean UI, fast', 'landing'),
    true,
  )
  assert.equal(shouldExpandVagueMarketing('Modern SaaS landing page, clean UI, fast', 'ecommerce'), false)
  assert.equal(shouldExpandVagueMarketing('Shopify store for hiking boots', 'ecommerce'), false)
})
