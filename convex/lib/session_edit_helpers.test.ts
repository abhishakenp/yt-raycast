import { describe, expect, it } from 'vitest'

import {
  applyImageSwap,
  applyPreviewTextEdit,
  applyStyleEdit,
} from './session_edit_helpers'

describe('session edit helpers', () => {
  it('replaces the selected text occurrence by document order', () => {
    const html = '<nav>Start</nav><main><h1>Start</h1></main>'

    expect(applyPreviewTextEdit(html, 'Start', 'Launch', 1)).toEqual({
      html: '<nav>Start</nav><main><h1>Launch</h1></main>',
      replaced: true,
    })
  })

  it('tolerates inline markup and escapes tolerant replacements', () => {
    const html = '<h1>One <strong>paw</strong> forward</h1>'

    const result = applyPreviewTextEdit(
      html,
      'One paw forward',
      '<script>alert(1)</script>',
    )

    expect(result.replaced).toBe(true)
    expect(result.html).toBe('<h1>&lt;script&gt;alert(1)&lt;/script&gt;</h1>')
  })

  it('does not replace text inside script or style blocks', () => {
    const html =
      '<script>const copy = "Launch";</script><main><h1>Launch</h1></main>'

    expect(applyPreviewTextEdit(html, 'Launch', 'Ship').html).toBe(
      '<script>const copy = "Launch";</script><main><h1>Ship</h1></main>',
    )
  })

  it('updates only the targeted style attribute occurrence', () => {
    const html =
      '<div class="tile" style="color:red">A</div><div class="tile">B</div>'

    expect(applyStyleEdit(html, 'tile', 'color: blue', 1)).toEqual({
      html: '<div class="tile" style="color:red">A</div><div class="tile" style="color: blue">B</div>',
      replaced: true,
    })
  })

  it('replaces image src attributes by alt and occurrence', () => {
    const html =
      '<img alt="product" src="/old-a.png"><img alt="product" src="/old-b.png"><img alt="second" src="/other.png">'

    expect(applyImageSwap(html, 'product', '/new.png', 1)).toEqual({
      html: '<img alt="product" src="/old-a.png"><img alt="product" src="/new.png"><img alt="second" src="/other.png">',
      replaced: true,
    })
  })
})
