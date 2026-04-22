import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectHomepageQualityIssues } from '../src/pipeline/homepage-quality-audit.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

test('collectHomepageQualityIssues is empty for public exemplars', () => {
  const rows = [
    ['public/designs/design-01-government-portal.html', 'institutional'],
    ['public/designs/design-02-admin-panel.html', 'dashboard'],
    ['public/designs/design-03-saas-homepage.html', 'saas'],
    ['public/designs/design-04-docs-site.html', 'docs'],
    ['public/designs/design-05-ecommerce.html', 'ecommerce'],
  ]
  for (const [rel, st] of rows) {
    const p = join(root, rel)
    if (!existsSync(p)) continue
    const html = readFileSync(p, 'utf8')
    const issues = collectHomepageQualityIssues(html, { siteType: st, prompt: '' })
    assert.deepEqual(issues, [])
  }
})

test('collectHomepageQualityIssues flags thin pages', () => {
  const html = '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" /><script src="https://cdn.tailwindcss.com"></script><script>tailwind.config={theme:{extend:{colors:{x:"#fff"}}}}</script></head><body><h1>x</h1><p>y</p></body></html>'
  const issues = collectHomepageQualityIssues(html, { siteType: 'saas', prompt: '' })
  assert.ok(issues.length > 0)
})

test('Nova-tier SaaS requires canvas mesh motion and contrast discipline', () => {
  const flat =
    '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"/><script src="https://cdn.tailwindcss.com"></script><script>tailwind.config={theme:{extend:{keyframes:{liquid:{"0%":{transform:"rotate(-1deg)"},"100%":{transform:"rotate(2deg)"}}},animation:{liquid:"liquid 26s infinite"}}}}</script></head><body class="bg-zinc-950"><h1 class="text-white">X</h1><p class="text-lg text-slate-500">weak contrast marketing body</p></body></html>'
  const issues = collectHomepageQualityIssues(flat, { siteType: 'saas', prompt: '' })
  assert.ok(issues.some((x) => x.includes('canvas')))
  assert.ok(issues.some((x) => x.includes('radial-gradient')))
  assert.ok(issues.some((x) => x.toLowerCase().includes('contrast')))
})
