import { describe, it, expect } from 'vitest'
import {
  compileSvelteBlock,
  validateSvelteSource,
  compileSvelteWithRetries,
} from './svelte-compiler'

describe('validateSvelteSource', () => {
  it('validates a simple Svelte component', () => {
    const src = '<script>let count = 0</script><div>{count}</div>'
    const result = validateSvelteSource(src)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects malformed Svelte (unclosed tag)', () => {
    const src = '<script>let count = 0</script><div>{count}</div'
    const result = validateSvelteSource(src)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('validates a component with props and reactivity', () => {
    const src =
      '<script>export let name = "World"; $: upper = name.toUpperCase()</script><h1>Hello {upper}!</h1>'
    const result = validateSvelteSource(src)
    expect(result.valid).toBe(true)
  })

  it('validates a component with each blocks', () => {
    const src =
      '<script>let items = ["a", "b", "c"]</script><ul>{#each items as item}<li>{item}</li>{/each}</ul>'
    const result = validateSvelteSource(src)
    expect(result.valid).toBe(true)
  })
})

describe('compileSvelteBlock', () => {
  it('compiles a simple counter component and returns SSR HTML + DOM JS', async () => {
    const src =
      '<script>let count = 0; $: doubled = count * 2</script><div><button on:click={() => count++}>+</button><span>{count}</span><p>{doubled}</p></div>'
    const result = await compileSvelteBlock(src, 'counter')
    expect(result.ssrHtml).toContain('<div>')
    expect(result.ssrHtml).toContain('<span>0</span>')
    expect(result.ssrHtml).toContain('<p>0</p>')
    expect(result.domJs.length).toBeGreaterThan(0)
    expect(result.domJs).toContain('count')
  })

  it('compiles a component with props using default values', async () => {
    const src =
      '<script>export let name = "World"</script><h1>Hello {name}!</h1>'
    const result = await compileSvelteBlock(src, 'greeting')
    expect(result.ssrHtml).toContain('Hello World!')
  })

  it('compiles a component with scoped CSS', async () => {
    const src =
      '<div class="box">Hello</div><style>.box { color: red; }</style>'
    const result = await compileSvelteBlock(src, 'styled')
    expect(result.ssrHtml).toContain('Hello')
    expect(result.css).toContain('.box')
    expect(result.css).toContain('color')
  })

  it('throws on invalid Svelte source', async () => {
    const src = '<script>let count = 0</script><div>{count}</div'
    await expect(compileSvelteBlock(src, 'broken')).rejects.toThrow()
  })

  it('compiles a component with each block and array data', async () => {
    const src =
      '<script>let tasks = [{text: "Buy groceries", done: false}, {text: "Walk dog", done: true}]</script><ul>{#each tasks as task}<li>{task.text}</li>{/each}</ul>'
    const result = await compileSvelteBlock(src, 'todolist')
    expect(result.ssrHtml).toContain('Buy groceries')
    expect(result.ssrHtml).toContain('Walk dog')
  })
})

describe('compileSvelteWithRetries', () => {
  it('succeeds on first attempt with valid source', async () => {
    const src = '<script>let x = 1</script><div>{x}</div>'
    const result = await compileSvelteWithRetries(
      src,
      'simple',
      3,
      async () => null,
    )
    expect(result).not.toBeNull()
    expect(result!.ssrHtml).toContain('<div>1</div>')
  })

  it('returns null when all retries fail and no correction provided', async () => {
    const src = '<div>{count}</div' // malformed
    const result = await compileSvelteWithRetries(
      src,
      'broken',
      2,
      async () => null,
    )
    expect(result).toBeNull()
  })

  it('retries with corrected source from callback', async () => {
    const badSrc = '<div>{count}</div' // malformed
    const goodSrc = '<script>let count = 0</script><div>{count}</div>'
    let attempt = 0
    const result = await compileSvelteWithRetries(
      badSrc,
      'fixable',
      3,
      async (_err, att) => {
        attempt = att
        return goodSrc // provide fix on first retry
      },
    )
    expect(result).not.toBeNull()
    expect(result!.ssrHtml).toContain('<div>0</div>')
    expect(attempt).toBe(1)
  })

  it('stops retrying after maxAttempts', async () => {
    const badSrc = '<div>{count}</div' // malformed
    let calls = 0
    const result = await compileSvelteWithRetries(
      badSrc,
      'unfixable',
      2,
      async () => {
        calls++
        return badSrc // always return broken
      },
    )
    expect(result).toBeNull()
    // maxAttempts=2 → 2 attempts → 1 retry callback invocation
    expect(calls).toBe(1)
  })
})
