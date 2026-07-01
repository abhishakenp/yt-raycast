import { describe, expect, it } from 'vitest'
import { applyPreviewTextEdit } from './preview-text-edit'

describe('applyPreviewTextEdit', () => {
  it('replaces only the first visible match', () => {
    const result = applyPreviewTextEdit(
      '<main><h1>Old headline</h1><p>Old headline</p></main>',
      {
        oldText: 'Old headline',
        newText: 'New headline',
      },
    )

    expect(result.replaced).toBe(true)
    expect(result.html).toContain('<h1>New headline</h1>')
    expect(result.html).toContain('<p>Old headline</p>')
  })

  it('does not edit script or style content', () => {
    const result = applyPreviewTextEdit(
      '<main><script>const x = "Old headline"</script><style>.x:after{content:"Old headline"}</style><p>Old headline</p></main>',
      { oldText: 'Old headline', newText: 'Visible headline' },
    )

    expect(result.html).toContain('const x = "Old headline"')
    expect(result.html).toContain('content:"Old headline"')
    expect(result.html).toContain('<p>Visible headline</p>')
  })

  it('does not report a replacement when the only match is inside protected template content', () => {
    const result = applyPreviewTextEdit(
      '<main><template><p>Draft headline</p></template><noscript>Draft headline</noscript><p>Live headline</p></main>',
      { oldText: 'Draft headline', newText: 'Published headline' },
    )

    expect(result.replaced).toBe(false)
    expect(result.html).toBe(
      '<main><template><p>Draft headline</p></template><noscript>Draft headline</noscript><p>Live headline</p></main>',
    )
  })

  it('preserves the original HTML for blank edit requests and missing visible matches', () => {
    const html = '<main><h1>Original headline</h1></main>'

    expect(
      applyPreviewTextEdit(html, {
        oldText: '   ',
        newText: 'Replacement headline',
      }),
    ).toEqual({ html, replaced: false })
    expect(
      applyPreviewTextEdit(html, {
        oldText: 'Missing headline',
        newText: 'Replacement headline',
      }),
    ).toEqual({ html, replaced: false })
  })
})
