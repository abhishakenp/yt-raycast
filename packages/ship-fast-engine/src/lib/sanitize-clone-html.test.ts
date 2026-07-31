import { describe, expect, it } from 'vitest'

import { sanitizeCloneHtml } from './sanitize-clone-html'

describe('sanitizeCloneHtml', () => {
  it('returns empty string for falsy input', () => {
    expect(sanitizeCloneHtml('')).toBe('')
    expect(sanitizeCloneHtml(undefined as unknown as string)).toBe('')
  })

  it('preserves safe HTML', () => {
    const html = '<div><h1>Hello</h1><p>World</p></div>'
    expect(sanitizeCloneHtml(html)).toBe(html)
  })

  it('removes <script> tags and content', () => {
    const html = '<div>safe</div><script>alert("xss")</script><p>also safe</p>'
    expect(sanitizeCloneHtml(html)).toBe('<div>safe</div><p>also safe</p>')
  })

  it('removes <script> tags with attributes', () => {
    const html =
      '<script type="text/javascript" src="evil.js"></script><div>safe</div>'
    expect(sanitizeCloneHtml(html)).toBe('<div>safe</div>')
  })

  it('removes <iframe> tags', () => {
    const html = '<iframe src="https://evil.com"></iframe><div>safe</div>'
    expect(sanitizeCloneHtml(html)).toBe('<div>safe</div>')
  })

  it('removes self-closing <iframe> tags', () => {
    const html = '<iframe src="https://evil.com" /><div>safe</div>'
    expect(sanitizeCloneHtml(html)).toBe('<div>safe</div>')
  })

  it('removes <object> tags', () => {
    const html = '<object data="evil.swf"></object><div>safe</div>'
    expect(sanitizeCloneHtml(html)).toBe('<div>safe</div>')
  })

  it('removes <embed> tags', () => {
    const html = '<embed src="evil.swf"><div>safe</div>'
    expect(sanitizeCloneHtml(html)).toBe('<div>safe</div>')
  })

  it('removes <base> tags', () => {
    const html = '<base href="https://evil.com/"><div>safe</div>'
    expect(sanitizeCloneHtml(html)).toBe('<div>safe</div>')
  })

  it('removes <meta http-equiv="refresh"> tags', () => {
    const html =
      '<meta http-equiv="refresh" content="0;url=https://evil.com"><div>safe</div>'
    expect(sanitizeCloneHtml(html)).toBe('<div>safe</div>')
  })

  it('preserves safe <meta> tags', () => {
    const html = '<meta name="description" content="safe"><div>safe</div>'
    expect(sanitizeCloneHtml(html)).toBe(html)
  })

  it('removes inline event handlers with double quotes', () => {
    const html = '<div onclick="alert(1)">safe</div>'
    expect(sanitizeCloneHtml(html)).toBe('<div>safe</div>')
  })

  it('removes inline event handlers with single quotes', () => {
    const html = "<div onclick='alert(1)'>safe</div>"
    expect(sanitizeCloneHtml(html)).toBe('<div>safe</div>')
  })

  it('removes inline event handlers without quotes', () => {
    const html = '<div onclick=alert(1)>safe</div>'
    expect(sanitizeCloneHtml(html)).toBe('<div>safe</div>')
  })

  it('removes javascript: URIs in href', () => {
    const html = '<a href="javascript:alert(1)">click</a>'
    expect(sanitizeCloneHtml(html)).toBe('<a >click</a>')
  })

  it('removes javascript: URIs in src', () => {
    const html = '<img src="javascript:alert(1)" alt="img">'
    expect(sanitizeCloneHtml(html)).toBe('<img  alt="img">')
  })

  it('removes data:text/html URIs', () => {
    const html = '<a href="data:text/html,<script>alert(1)</script>">click</a>'
    expect(sanitizeCloneHtml(html)).toBe('<a >click</a>')
  })

  it('preserves safe href URIs', () => {
    const html = '<a href="https://example.com">click</a>'
    expect(sanitizeCloneHtml(html)).toBe(html)
  })

  it('removes javascript: URIs in action and formaction', () => {
    const html1 =
      '<form action="javascript:alert(1)"><button>submit</button></form>'
    const html2 = '<button formaction="javascript:alert(1)">submit</button>'
    expect(sanitizeCloneHtml(html1)).toBe(
      '<form ><button>submit</button></form>',
    )
    expect(sanitizeCloneHtml(html2)).toBe('<button >submit</button>')
  })

  it('handles complex mixed content', () => {
    const html = `
      <div class="hero">
        <h1 onclick="steal()">Title</h1>
        <script>document.cookie</script>
        <iframe src="evil.com"></iframe>
        <a href="javascript:alert(1)">link</a>
        <p>Safe content</p>
        <img src="https://safe.com/img.jpg" onload="alert(1)" />
      </div>
    `
    const result = sanitizeCloneHtml(html)
    expect(result).not.toContain('<script')
    expect(result).not.toContain('<iframe')
    expect(result).not.toContain('onclick')
    expect(result).not.toContain('onload')
    expect(result).not.toContain('javascript:')
    expect(result).toContain('Safe content')
    expect(result).toContain('https://safe.com/img.jpg')
  })
})
