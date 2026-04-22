import test from 'node:test'
import assert from 'node:assert/strict'
import { stripDestructiveEmptyDesignTheme } from '../src/pipeline/homepage-theme-sanitize.js'
import { htmlFailsNovaMarketingBar } from '../src/pipeline/homepage-degeneracy.js'

const badTheme = `<!-- sf-design-theme -->
<script>
tailwind.config = { theme: { extend: { colors: {}, fontFamily: {} } } }
</script>
<!-- /sf-design-theme -->`

const goodMerge = `<!-- sf-design-theme -->
<script>
(function(){ var patchColors = {"primary":"#7c5cf5"}; tailwind.config = tailwind.config || { theme: { extend: {} } };
var ex = tailwind.config.theme.extend = tailwind.config.theme.extend || {};
ex.colors = Object.assign({}, ex.colors || {}, patchColors);
})()
</script>
<!-- /sf-design-theme -->`

test('stripDestructiveEmptyDesignTheme removes empty clobber', () => {
  const before = `<head><script src="https://cdn.tailwindcss.com"></script><script>tailwind.config={theme:{extend:{colors:{a:'#111'}}}}</script>${badTheme}</head>`
  const after = stripDestructiveEmptyDesignTheme(before)
  assert.match(after, /colors:\{a:/)
  assert.doesNotMatch(after, /colors:\s*\{\s*\}/)
})

test('stripDestructiveEmptyDesignTheme keeps merge inject', () => {
  assert.equal(stripDestructiveEmptyDesignTheme(`<head>${goodMerge}</head>`).includes('patchColors'), true)
})

test('htmlFailsNovaMarketingBar accepts /pricing href without #pricing section', () => {
  const raw = `<!doctype html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body>
<section id="hero"><div class="blur-3xl bg-gradient-to-r from-x to-y"></div><p>${'w '.repeat(200)}</p></section>
<section id="a"><p>${'x '.repeat(80)}</p></section>
<section id="b"><p>${'y '.repeat(80)}</p></section>
<section id="c"><p>${'z '.repeat(80)}</p></section>
<section id="d"><nav><a href="/pricing">Pricing</a></nav><p>${'p '.repeat(80)}</p></section>
<section id="faq" data-accordion><p>${'f '.repeat(80)}</p></section>
</body></html>`
  assert.equal(htmlFailsNovaMarketingBar(raw), false)
})
