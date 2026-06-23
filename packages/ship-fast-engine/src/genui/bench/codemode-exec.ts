import { topLevelArgNames } from '../openui-signature.ts'

/**
 * Controlled "code mode": the model emits a small JS program that calls a tiny,
 * typed API (`home`/`page`) with NAMED props. We execute it in a restricted
 * scope and map the named props to POSITIONAL OpenUI via the component spec
 * signature — so the output is valid-by-construction (no free-form OpenUI to
 * mis-parse, no fallback needed). Execution here uses `new Function` for
 * benchmarking; production must run this in a real sandbox (isolated-vm /
 * QuickJS) since the program is model-authored.
 */
export type CodemodePage = {
  id: string
  label: string
  component: string
  props: Record<string, unknown>
}
export type CodemodeResult = {
  home?: { component: string; props: Record<string, unknown> }
  pages: CodemodePage[]
}

const stripFences = (s: string): string =>
  s
    .replace(/^[\s\S]*?```(?:js|javascript|ts|typescript)?\s*/i, (m) =>
      m.includes('```') ? '' : m,
    )
    .replace(/```[\s\S]*$/, '')
    .trim()

export function runCodemodeProgram(code: string): CodemodeResult {
  const out: CodemodeResult = { pages: [] }
  const home = (component: string, props?: Record<string, unknown>) => {
    out.home = { component, props: props ?? {} }
  }
  const page = (
    id: string,
    label: string,
    component: string,
    props?: Record<string, unknown>,
  ) => {
    out.pages.push({ id, label, component, props: props ?? {} })
  }
  // Restricted: only `home`/`page` are passed in. (Benchmark-grade isolation.)
  const fn = new Function(
    'home',
    'page',
    `"use strict";\n${stripFences(code)}`,
  )
  fn(home, page)
  return out
}

/** Map named props → positional OpenUI call using the spec signature order. */
export function toPositionalStatement(input: {
  id: string
  component: string
  props: Record<string, unknown>
  brand: string
  nav: string[]
}): string {
  const order = topLevelArgNames(input.component)
  if (order.length === 0) {
    return `${input.id} = ${input.component}(${JSON.stringify(input.brand)}, ${JSON.stringify(input.nav)})`
  }
  const vals = order.map((field) => {
    if (field === 'brand') return JSON.stringify(input.brand)
    if (field === 'nav') return JSON.stringify(input.nav)
    return field in input.props ? JSON.stringify(input.props[field]) : undefined
  })
  while (vals.length && vals[vals.length - 1] === undefined) vals.pop()
  const filled = vals.map((v) => (v === undefined ? 'null' : v))
  return `${input.id} = ${input.component}(${filled.join(', ')})`
}
