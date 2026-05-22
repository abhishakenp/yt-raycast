import { describe, expect, it } from 'vitest'
import { isTruncatedFragment, stitchHybridHtml, trimIncompleteSuffix } from './hybrid-seam-repair.js'

describe('hybrid-seam-repair', () => {
  it('detects truncated class attribute from Gemini cutoff', () => {
    const bad = '<div class="flex transition-'
    expect(isTruncatedFragment(bad)).toBe(true)
  })

  it('trims incomplete benefits section before tail stitch', () => {
    const top = `<section id="benefits" class="w-full py-24">
      <div class="mx-auto max-w-7xl px-6">
        <div class="grid grid-cols-3 gap-8">
          <div class="p-8 transition-
</div></div></div></div>`
    const tail = `<section class="w-full py-20"><div class="mx-auto max-w-7xl px-6"><h2>Partners</h2></div></section>`
    const trimmed = trimIncompleteSuffix(top)
    expect(trimmed).not.toMatch(/transition-\s*$/)
    const { html, validation } = stitchHybridHtml(trimmed, tail)
    expect(html).toMatch(/<section[^>]*>\s*<div class="mx-auto max-w-7xl px-6">\s*<h2>Partners<\/h2>/)
    expect(validation.ok).toBe(true)
  })
})
