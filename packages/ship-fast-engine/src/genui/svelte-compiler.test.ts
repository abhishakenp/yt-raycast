import { describe, expect, it } from 'vitest'
import { validateSvelteSource } from './svelte-compiler.ts'

describe('validateSvelteSource XSS blocking', () => {
  it('blocks {@html} which bypasses Svelte escaping', () => {
    const result = validateSvelteSource('<div>{@html userInput}</div>')
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('{@html}'))).toBe(true)
  })

  it('blocks inline onclick handler', () => {
    const result = validateSvelteSource(
      '<button onclick="alert(1)">Click</button>',
    )
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('event handler'))).toBe(true)
  })

  it('blocks inline onerror handler', () => {
    const result = validateSvelteSource('<img src="x" onerror="alert(1)" />')
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('event handler'))).toBe(true)
  })

  it('blocks javascript: URI', () => {
    const result = validateSvelteSource(
      '<a href="javascript:alert(1)">link</a>',
    )
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('javascript:'))).toBe(true)
  })

  it('blocks external <script src=> imports', () => {
    const result = validateSvelteSource(
      '<script src="evil.js"></script><div>hi</div>',
    )
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('script src'))).toBe(true)
  })

  it('allows inline <script> for Svelte component logic', () => {
    const result = validateSvelteSource(
      '<script>let count = 0</script><button on:click={() => count++}>{count}</button>',
    )
    const xssErrors = result.errors.filter((e) => e.startsWith('Security:'))
    expect(xssErrors).toHaveLength(0)
  })

  it('blocks <iframe> tags', () => {
    const result = validateSvelteSource('<iframe src="evil.com"></iframe>')
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('<iframe>'))).toBe(true)
  })

  it('blocks document.cookie access', () => {
    const result = validateSvelteSource('<div>{document.cookie}</div>')
    expect(result.valid).toBe(false)
    expect(
      result.errors.some(
        (e) => e.includes('document.cookie') || e.includes('DOM access'),
      ),
    ).toBe(true)
  })

  it('blocks eval()', () => {
    const result = validateSvelteSource('<div>{eval("alert(1)")}</div>')
    expect(result.valid).toBe(false)
    expect(
      result.errors.some((e) => e.includes('eval') || e.includes('DOM access')),
    ).toBe(true)
  })

  it('allows safe Svelte with on: directive (not inline onclick)', () => {
    const result = validateSvelteSource(
      '<button on:click={() => count += 1}>Count: {count}</button>',
    )
    // Should not have XSS errors (may have compile errors if svelte not installed)
    const xssErrors = result.errors.filter((e) => e.startsWith('Security:'))
    expect(xssErrors).toHaveLength(0)
  })

  it('allows safe Svelte with text interpolation', () => {
    const result = validateSvelteSource('<div>Hello {name}!</div>')
    const xssErrors = result.errors.filter((e) => e.startsWith('Security:'))
    expect(xssErrors).toHaveLength(0)
  })
})
