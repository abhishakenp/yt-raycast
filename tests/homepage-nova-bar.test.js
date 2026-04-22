import test from 'node:test'
import assert from 'node:assert/strict'
import {
  explainNovaMarketingBarFailures,
  htmlFailsNovaMarketingBar,
  htmlLooksDegenerate,
  promptExpectsNovaDenseMarketing,
} from '../src/pipeline/homepage-degeneracy.js'

const head = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><script src="https://cdn.tailwindcss.com"></script></head><body>`
const foot = `</body></html>`

const novaLikeBands = (extraWords) => {
  const filler = (extraWords || [])
    .concat(Array.from({ length: 120 }, (_, i) => `word${i}`))
    .join(' ')
  return `${head}
<section id="hero" class="relative overflow-hidden"><div class="blur-3xl bg-gradient-to-tr absolute inset-0 from-violet-600/20"></div><div class="bg-gradient-to-bl absolute inset-0 from-teal-500/10"></div><h1 class="text-4xl">Ship faster</h1><p>${filler}</p></section>
<section id="proof"><p>${filler}</p></section>
<section id="features"><p>${filler}</p></section>
<section id="capabilities"><p>${filler}</p></section>
<section id="pricing"><h2>Pricing</h2><p>Pro tier</p><div data-pricing-billing>$29/mo $290/yr</div></section>
<section id="faq"><div data-accordion><p>${filler}</p></div></section>
<footer class="grid md:grid-cols-4 gap-8">${filler}</footer>
${foot}`
}

test('promptExpectsNovaDenseMarketing matches saas and ai product prompts', () => {
  assert.equal(promptExpectsNovaDenseMarketing('A vague saas landing for teams'), true)
  assert.equal(promptExpectsNovaDenseMarketing('B2B software for invoices'), true)
  assert.equal(promptExpectsNovaDenseMarketing('An AI tool for product managers'), true)
  assert.equal(promptExpectsNovaDenseMarketing(''), false)
})

test('promptExpectsNovaDenseMarketing excludes storefront and dashboard', () => {
  assert.equal(promptExpectsNovaDenseMarketing('Online store with shopping cart checkout'), false)
  assert.equal(promptExpectsNovaDenseMarketing('Retail store DTC merch'), false)
  assert.equal(promptExpectsNovaDenseMarketing('Admin panel analytics workspace'), false)
})

test('htmlFailsNovaMarketingBar is false for dense tailwind marketing', () => {
  const html = novaLikeBands()
  assert.equal(htmlFailsNovaMarketingBar(html), false)
})

test('htmlFailsNovaMarketingBar is true when sections or pricing/faq/visual hook missing', () => {
  const bad = `${head}<section><p>a</p></section>${foot}`
  assert.equal(htmlFailsNovaMarketingBar(bad), true)
  assert.ok(explainNovaMarketingBarFailures(bad).length >= 1)
})

test('explainNovaMarketingBarFailures is empty for dense tailwind marketing', () => {
  const html = novaLikeBands()
  assert.deepEqual(explainNovaMarketingBarFailures(html), [])
})

test('htmlLooksDegenerate applies Nova bar when prompt matches', () => {
  const ok = novaLikeBands()
  const bad = ok
    .replace(/id="pricing"/, 'id="plans-missing"')
    .replace(/<div data-pricing-billing>[^<]*<\/div>/, '<div>Contact sales</div>')
  assert.equal(htmlLooksDegenerate(ok, { prompt: 'Marketing homepage for a devtools SaaS' }), false)
  assert.equal(htmlLooksDegenerate(bad, { prompt: 'Marketing homepage for a devtools SaaS' }), true)
})
