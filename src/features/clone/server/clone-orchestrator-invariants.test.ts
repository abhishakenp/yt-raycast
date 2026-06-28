import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import {
  rewriteResidualAnchorNavigation,
  NAV_SHIM_SCRIPT,
} from '@ship-fast/engine/clone/verbatim.ts'

// ---------------------------------------------------------------------------
// Contract / invariant tests for the clone orchestrator flow.
//
// runCloneJob needs a real Playwright browser + Convex client + network, so it
// cannot be exercised directly here. Instead we assert the SOURCE-LEVEL
// structural contract (the flow must call the right engine stages, persist the
// expected page shape, guard SSRF, self-contain, and apply targeted edits) and
// we behaviorally test the PURE self-containment primitive that the orchestrator
// depends on (rewriteResidualAnchorNavigation + NAV_SHIM_SCRIPT) to prove the
// "self-contained, no escape back to source domain" invariant holds.
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const readSrc = (rel: string): string =>
  readFileSync(path.resolve(__dirname, rel), 'utf-8')

const ORCHESTRATOR_SRC = readSrc('./clone-orchestrator-response.ts')
const EDIT_PASS_SRC = readSrc('./targeted-edit-pass.ts')
const VERBATIM_SRC = readSrc(
  '../../../../packages/ship-fast-engine/src/clone/verbatim.ts',
)

describe('clone orchestrator source contract', () => {
  it('exports runCloneJob as the server entry point', () => {
    expect(ORCHESTRATOR_SRC).toContain('export async function runCloneJob')
  })

  it('accepts the documented input shape (sessionId, seedUrl, brief, bearer, anonymousOwnerSecret)', () => {
    expect(ORCHESTRATOR_SRC).toMatch(/sessionId:\s*string/)
    expect(ORCHESTRATOR_SRC).toMatch(/seedUrl:\s*string/)
    expect(ORCHESTRATOR_SRC).toMatch(/brief:\s*string/)
    expect(ORCHESTRATOR_SRC).toMatch(/anonymousOwnerSecret\?:\s*string/)
    expect(ORCHESTRATOR_SRC).toMatch(/bearer\?:\s*string/)
  })

  it('SSRF-guards the seed url before any crawl (assertPublicUrl)', () => {
    expect(ORCHESTRATOR_SRC).toContain('assertPublicUrl')
    expect(ORCHESTRATOR_SRC).toMatch(/await engine\.assertPublicUrl\(seedUrl\)/)
  })

  it('loads the clone engine via dynamic import (keeps playwright out of the static graph)', () => {
    expect(ORCHESTRATOR_SRC).toContain(
      "import('@ship-fast/engine/clone/security.ts')",
    )
    expect(ORCHESTRATOR_SRC).toContain(
      "import('@ship-fast/engine/clone/crawler.ts')",
    )
    expect(ORCHESTRATOR_SRC).toContain(
      "import('@ship-fast/engine/clone/capture.ts')",
    )
    expect(ORCHESTRATOR_SRC).toContain(
      "import('@ship-fast/engine/clone/verbatim.ts')",
    )
  })

  it('launches the browser exactly once and always closes it in finally', () => {
    expect(ORCHESTRATOR_SRC).toMatch(/pw\.chromum\.launch|chromium\.launch/)
    expect(ORCHESTRATOR_SRC).toMatch(/chromium\.launch\(/)
    // The single launch is followed by a finally that closes the browser.
    expect(ORCHESTRATOR_SRC).toContain('} finally {')
    expect(ORCHESTRATOR_SRC).toMatch(/await browser\.close\(\)/)
  })

  it('captures HOME first, persists it, then finalizes the preview before the rest stream in', () => {
    expect(ORCHESTRATOR_SRC).toContain('orderPages')
    expect(ORCHESTRATOR_SRC).toMatch(/isHome:\s*true/)
    expect(ORCHESTRATOR_SRC).toContain('finalizeClonePreview')
    // The rest are captured after finalize, with isHome: false.
    expect(ORCHESTRATOR_SRC).toMatch(/isHome:\s*false/)
  })

  it('self-contains every captured page before persisting', () => {
    expect(ORCHESTRATOR_SRC).toMatch(/engine\.selfContainPage\(/)
    // Both home and rest paths call selfContainPage.
    const matches = ORCHESTRATOR_SRC.match(/selfContainPage\(/g) ?? []
    expect(matches.length).toBeGreaterThanOrEqual(2)
  })

  it('persists pages with the expected page-doc shape', () => {
    const requiredFields = [
      'pathname',
      'title',
      'html',
      'isHome',
      'failed',
      'order',
      'byteLength',
      'truncated',
    ]
    for (const field of requiredFields) {
      expect(ORCHESTRATOR_SRC).toContain(field)
    }
    // Large pages spill to Convex file storage via a storageId.
    expect(ORCHESTRATOR_SRC).toContain('storageId')
    expect(ORCHESTRATOR_SRC).toContain('generateCloneUploadUrl')
    expect(ORCHESTRATOR_SRC).toContain('STORAGE_THRESHOLD_BYTES')
  })

  it('writes page docs through the Convex writeClonePageDoc mutation', () => {
    expect(ORCHESTRATOR_SRC).toContain('api.sessions.writeClonePageDoc')
  })

  it('bounds the job with an overall wall-clock abort timer', () => {
    expect(ORCHESTRATOR_SRC).toContain('JOB_TIMEOUT_MS')
    expect(ORCHESTRATOR_SRC).toContain('AbortController')
    expect(ORCHESTRATOR_SRC).toMatch(
      /setTimeout\(\(\)\s*=>\s*controller\.abort\(\)/,
    )
  })

  it('never aborts the whole batch on a single page capture failure', () => {
    // Each capture path writes a failed doc and continues; the catch never rethrows.
    expect(ORCHESTRATOR_SRC).toMatch(/failed:\s*true/)
    expect(ORCHESTRATOR_SRC).toContain('.catch(() => undefined)')
  })

  it('runs prompt-driven targeted edits only after home is finalized + homeHtml exists + brief is non-empty', () => {
    expect(ORCHESTRATOR_SRC).toContain('runTargetedEdits')
    expect(ORCHESTRATOR_SRC).toMatch(
      /if\s*\(finalized\s*&&\s*homeHtml\s*&&\s*brief\.trim\(\)\)/,
    )
  })

  it('is generic — contains no per-site / slug conditionals', () => {
    // No hardcoded site names or slug branches in the orchestrator.
    expect(ORCHESTRATOR_SRC).not.toMatch(/if\s*\(\s*seedUrl\.includes\(['"]/)
    expect(ORCHESTRATOR_SRC).not.toContain('blog-dogs')
    expect(ORCHESTRATOR_SRC).not.toContain('Paws & Tales')
  })
})

describe('targeted edit pass source contract', () => {
  it('exports runTargetedEdits', () => {
    expect(EDIT_PASS_SRC).toContain('export async function runTargetedEdits')
  })

  it('caps ops and candidates to bounded constants', () => {
    expect(EDIT_PASS_SRC).toMatch(/MAX_OPS\s*=\s*12/)
    expect(EDIT_PASS_SRC).toMatch(/MAX_CANDIDATES\s*=\s*40/)
    expect(EDIT_PASS_SRC).toMatch(/MAX_CANDIDATE_CHARS\s*=\s*160/)
  })

  it('bounds the edit pass with its own timeout', () => {
    expect(EDIT_PASS_SRC).toMatch(/EDIT_PASS_TIMEOUT_MS\s*=\s*25_000/)
    expect(EDIT_PASS_SRC).toContain('AbortController')
  })

  it('is a no-op when the brief is empty/whitespace', () => {
    expect(EDIT_PASS_SRC).toMatch(/if\s*\(!trimmedBrief\)\s*return/)
  })

  it('extracts candidates from the cloned home html (title, h1-h3, hero/CTA, brand)', () => {
    expect(EDIT_PASS_SRC).toContain('extractCandidates')
    expect(EDIT_PASS_SRC).toContain("querySelector('title')")
    for (const sel of ['h1', 'h2', 'h3']) {
      expect(EDIT_PASS_SRC).toContain(`'${sel}'`)
    }
    expect(EDIT_PASS_SRC).toContain('button')
    expect(EDIT_PASS_SRC).toContain('header')
    expect(EDIT_PASS_SRC).toContain('nav')
  })

  it('tolerantly parses the model JSON array (strips code fences, extracts first [...])', () => {
    expect(EDIT_PASS_SRC).toContain('parseReplaceOps')
    expect(EDIT_PASS_SRC).toMatch(/```(?:json)?/)
    expect(EDIT_PASS_SRC).toMatch(/indexOf\('\['\)/)
    expect(EDIT_PASS_SRC).toMatch(/lastIndexOf\('\]'\)/)
  })

  it('verifies every `before` literally appears in homeHtml before applying (no hallucinated edits)', () => {
    expect(EDIT_PASS_SRC).toContain('homeHtml.includes(op.before)')
  })

  it('skips empty, identical, and duplicate ops', () => {
    expect(EDIT_PASS_SRC).toMatch(/op\.before\s*===\s*op\.after/)
    expect(EDIT_PASS_SRC).toMatch(/applied\.has\(op\.before\)/)
  })

  it('applies edits as text edits via createEdit', () => {
    expect(EDIT_PASS_SRC).toContain('api.sessions.createEdit')
    expect(EDIT_PASS_SRC).toMatch(/editType:\s*'text'/)
    expect(EDIT_PASS_SRC).toMatch(/beforeText:\s*op\.before/)
    expect(EDIT_PASS_SRC).toMatch(/afterText:\s*op\.after/)
  })

  it('never aborts the pass on a single failed edit', () => {
    expect(EDIT_PASS_SRC).toContain('A single failed edit must not abort')
    // The apply loop wraps each mutation in try/catch and continues.
    expect(EDIT_PASS_SRC).toMatch(/targeted-edit apply failed/)
  })

  it('restricts the model to brand/heading/tagline/hero/CTA copy only', () => {
    expect(EDIT_PASS_SRC).toContain('brand names')
    expect(EDIT_PASS_SRC).toContain('headings')
    expect(EDIT_PASS_SRC).toContain('taglines')
    expect(EDIT_PASS_SRC).toContain('hero/CTA')
  })
})

describe('self-containment engine source contract (verbatim.ts)', () => {
  it('exports selfContainPage and the nav shim', () => {
    expect(VERBATIM_SRC).toContain('export async function selfContainPage')
    expect(VERBATIM_SRC).toContain('export const NAV_SHIM_SCRIPT')
    expect(VERBATIM_SRC).toContain(
      'export function rewriteResidualAnchorNavigation',
    )
  })

  it('strips ALL source scripts and on* handlers (only the nav shim remains)', () => {
    expect(VERBATIM_SRC).toMatch(
      /for\s*\(const script of[^)]*querySelectorAll\('script'\)\)/,
    )
    expect(VERBATIM_SRC).toMatch(/script\.remove\(\)/)
    expect(VERBATIM_SRC).toMatch(/\/\^on\/i/)
    expect(VERBATIM_SRC).toMatch(/removeAttribute\(name\)/)
  })

  it('inlines external stylesheets and processes inline <style> blocks', () => {
    expect(VERBATIM_SRC).toContain("rel.split(/\\s+/).includes('stylesheet')")
    expect(VERBATIM_SRC).toMatch(/link\.replaceWith\(styleEl\)/)
    expect(VERBATIM_SRC).toContain('processCss')
  })

  it('absolutizes asset urls (img/source/link/use, inline style url())', () => {
    expect(VERBATIM_SRC).toContain('toAbsolute')
    expect(VERBATIM_SRC).toContain('absolutizeSrcset')
    expect(VERBATIM_SRC).toContain('absolutizeCssUrls')
  })

  it('rewrites http(s) anchors into clone-nav anchors (no escape back to source)', () => {
    expect(VERBATIM_SRC).toContain('data-clone-path')
    expect(VERBATIM_SRC).toContain('data-clone-abs')
    expect(VERBATIM_SRC).toMatch(/setAttribute\('href',\s*'#'\)/)
  })

  it('SSRF-guards every network egress in the self-containment layer', () => {
    expect(VERBATIM_SRC).toContain('assertPublicUrl')
    expect(VERBATIM_SRC).toContain('safeFetch')
  })

  it('returns the self-contained page shape the orchestrator persists', () => {
    expect(VERBATIM_SRC).toMatch(/pathname:\s*string/)
    expect(VERBATIM_SRC).toMatch(/title:\s*string/)
    expect(VERBATIM_SRC).toMatch(/html:\s*string/)
    expect(VERBATIM_SRC).toMatch(/byteLength:\s*number/)
    expect(VERBATIM_SRC).toMatch(/truncated:\s*boolean/)
  })
})

describe('rewriteResidualAnchorNavigation — self-containment invariant', () => {
  const finalUrl = 'https://example.com/about'
  const finalHost = 'example.com'

  it('rewrites same-origin http anchors to # with data-clone-path + data-clone-abs and strips target/rel', () => {
    const html = `<a href="https://example.com/contact" target="_blank" rel="noopener">Contact</a>`
    const out = rewriteResidualAnchorNavigation(html, finalUrl, finalHost)
    expect(out).toContain('href="#"')
    expect(out).toContain('data-clone-path="/contact"')
    expect(out).toContain('data-clone-abs="https://example.com/contact"')
    expect(out).not.toContain('target=')
    expect(out).not.toContain('rel=')
    // No surviving http(s) href that could navigate back to the source.
    expect(out).not.toMatch(/href="https?:\/\//i)
  })

  it('rewrites external http anchors to # with data-clone-abs only (no data-clone-path)', () => {
    const html = `<a href="https://other.site/x">External</a>`
    const out = rewriteResidualAnchorNavigation(html, finalUrl, finalHost)
    expect(out).toContain('href="#"')
    expect(out).toContain('data-clone-abs="https://other.site/x"')
    expect(out).not.toContain('data-clone-path')
    expect(out).not.toMatch(/href="https?:\/\//i)
  })

  it('leaves non-http anchors (mailto, tel, #, data:) untouched', () => {
    const html =
      `<a href="mailto:a@b.com">mail</a>` +
      `<a href="tel:+1">tel</a>` +
      `<a href="#section">hash</a>` +
      `<a href="data:text/plain,hi">data</a>`
    const out = rewriteResidualAnchorNavigation(html, finalUrl, finalHost)
    expect(out).toContain('href="mailto:a@b.com"')
    expect(out).toContain('href="tel:+1"')
    expect(out).toContain('href="#section"')
    expect(out).toContain('href="data:text/plain,hi"')
  })

  it('resolves relative anchors against finalUrl before classifying origin', () => {
    const html = `<a href="/pricing">Pricing</a>`
    const out = rewriteResidualAnchorNavigation(html, finalUrl, finalHost)
    expect(out).toContain('href="#"')
    expect(out).toContain('data-clone-path="/pricing"')
    expect(out).toContain('data-clone-abs="https://example.com/pricing"')
  })

  it('produces zero surviving http(s) hrefs across a mixed anchor set', () => {
    const html =
      `<a href="https://example.com/a">a</a>` +
      `<a href="https://other.com/b">b</a>` +
      `<a href="/c">c</a>` +
      `<a href="#d">d</a>` +
      `<a href="mailto:e@f.com">e</a>`
    const out = rewriteResidualAnchorNavigation(html, finalUrl, finalHost)
    const surviving = out.match(/href="https?:\/\/[^"]*"/gi) ?? []
    expect(surviving).toHaveLength(0)
  })

  it('does not reference the source domain as a navigable href anywhere in output', () => {
    const html = `<a href="https://example.com/secret">x</a><a href="https://example.com/other">y</a>`
    const out = rewriteResidualAnchorNavigation(html, finalUrl, finalHost)
    // The source host may appear inside data-clone-abs (intentional, for nav),
    // but must NEVER appear as a navigable href.
    expect(out).not.toMatch(/href="https?:\/\/example\.com/i)
  })
})

describe('NAV_SHIM_SCRIPT — clone nav shim invariant', () => {
  it('is a self-invoking script that postMessages ship-clone-nav to the parent', () => {
    expect(NAV_SHIM_SCRIPT).toMatch(/^\(function\(\)\{/)
    expect(NAV_SHIM_SCRIPT).toContain('ship-clone-nav')
    expect(NAV_SHIM_SCRIPT).toContain('window.parent.postMessage')
    expect(NAV_SHIM_SRC()).toContain('data-clone-path')
    expect(NAV_SHIM_SRC()).toContain('data-clone-abs')
  })

  it('does not fetch from or reference any source domain (offline-renderable)', () => {
    expect(NAV_SHIM_SCRIPT).not.toMatch(/fetch\(/)
    expect(NAV_SHIM_SCRIPT).not.toMatch(/XMLHttpRequest/)
    expect(NAV_SHIM_SCRIPT).not.toMatch(/https?:\/\//i)
  })

  it('only prevents default + toggles UI state; never navigates the top window', () => {
    expect(NAV_SHIM_SCRIPT).toContain('e.preventDefault()')
    expect(NAV_SHIM_SCRIPT).not.toMatch(/window\.location\s*=/)
    expect(NAV_SHIM_SCRIPT).not.toMatch(/location\.href\s*=/)
  })
})

// small helper so we can assert on the shim source without re-reading the file
function NAV_SHIM_SRC(): string {
  return NAV_SHIM_SCRIPT
}
