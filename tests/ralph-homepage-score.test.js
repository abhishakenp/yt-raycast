import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { passesHomepagePublicDesignVerification, scoreRalphHomepage } from '../src/pipeline/ralph-homepage-score.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ref = join(root, 'public/designs/design-03-saas-homepage.html')

test('scoreRalphHomepage marks design-03 reference as passing', () => {
  if (!existsSync(ref)) return
  const html = readFileSync(ref, 'utf8')
  const sc = scoreRalphHomepage(html, {
    prompt: 'B2B SaaS marketing homepage for a workflow product',
    refPath: ref,
    minScore: 85,
  })
  assert.equal(sc.ok, true)
  assert.ok(sc.score >= 85)
})

test('scoreRalphHomepage fails thin html', () => {
  const sc = scoreRalphHomepage('<!doctype html><html><body><p>x</p></body></html>', {
    prompt: 'SaaS landing page',
    minScore: 85,
  })
  assert.equal(sc.ok, false)
})

test('passesHomepagePublicDesignVerification accepts design-03', () => {
  if (!existsSync(ref)) return
  const html = readFileSync(ref, 'utf8')
  const v = passesHomepagePublicDesignVerification(html, 'B2B SaaS marketing site', ref, 'saas')
  assert.equal(v.ok, true)
})

test('passesHomepagePublicDesignVerification accepts design-04 as docs', () => {
  const p = join(root, 'public/designs/design-04-docs-site.html')
  if (!existsSync(p)) return
  const html = readFileSync(p, 'utf8')
  const v = passesHomepagePublicDesignVerification(html, 'Developer docs hub', p, 'docs')
  assert.equal(v.ok, true)
})
