import { describe, expect, it } from 'vitest'
import {
  closeTopSegmentSafely,
  isTruncatedFragment,
  sealTopBeforeTail,
  stripOrphanCloseBurst,
  validateStitchedHtml,
} from '../src/utils/seam-repair.js'

describe('seam-repair', () => {
  it('flags truncated class attribute', () => {
    const bad = '<section><div class="flex text-[10px] font'
    expect(isTruncatedFragment(bad)).toBe(true)
  })

  it('strips orphan close burst before next section', () => {
    const raw = '<div class="x">\n</div></div></div>\n<section>'
    expect(stripOrphanCloseBurst(raw)).not.toMatch(/<\/div>\s*<\/div>\s*<\/div>/)
  })

  it('caps top segment div closes', () => {
    const top = '<div><div><div><div><div><div><div><div><div><div>'
    const closed = closeTopSegmentSafely(top, { maxClose: 3 })
    expect((closed.match(/<\/div>/g) || []).length).toBe(3)
  })

  it('seals top before tail when section would nest in grid', () => {
    const top = '<nav></nav><header><div class="hero">x</div></header><section><div class="grid"><div class="card">'
    const tail = '<section id="x"><p>ok</p></section>'
    const sealed = sealTopBeforeTail(top, tail)
    expect(sealed).toContain('</header>')
    expect(sealed).not.toContain('grid')
  })

  it('validates stitched html without orphan burst', () => {
    const ok = `<!DOCTYPE html><html><body>
<section class="w-full"><div></div></section>
<footer></footer></body></html>`
    expect(validateStitchedHtml(ok).ok).toBe(true)
  })
})
