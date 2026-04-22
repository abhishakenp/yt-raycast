import test from 'node:test'
import assert from 'node:assert/strict'
import { shouldReplaceLlmHomepageWithRenderer } from '../src/pipeline/homepage-substance.js'

const siteSpec = { siteType: 'landing', pages: [{ id: 'page-home', route: '/' }] }

test('keeps Tailwind CDN page with 2+ sections and moderate word count (vague SaaS)', () => {
  const text = Array.from({ length: 45 }, (_, i) => `word${i}`).join(' ')
  const html = `<!doctype html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body>
<section class="py-12"><h1>Hero</h1><p>${text}</p></section>
<section class="py-12"><h2>Features</h2><p>More copy here for the second band.</p></section>
</body></html>`
  assert.equal(shouldReplaceLlmHomepageWithRenderer(html, siteSpec), false)
})

test('still replaces nearly empty HTML', () => {
  const html =
    '<!doctype html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body><main>Hi</main></body></html>'
  assert.equal(shouldReplaceLlmHomepageWithRenderer(html, siteSpec), true)
})
