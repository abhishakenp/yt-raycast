import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { createElement, useState, Fragment, type ReactNode } from 'react'
import { Button as UIButton } from '#/components/ui/button.tsx'
import {
  Card as UICard,
  CardHeader as UICardHeader,
  CardTitle as UICardTitle,
  CardDescription as UICardDescription,
  CardContent as UICardContent,
  CardFooter as UICardFooter,
} from '#/components/ui/card.tsx'
import { Input as UIInput } from '#/components/ui/input.tsx'
import { Badge as UIBadge } from '#/components/ui/badge.tsx'
import { Progress as UIProgress } from '#/components/ui/progress.tsx'

// ── Types ──────────────────────────────────────────────────────────────────

interface FreeformDef {
  state: Record<string, string>
  actions: Record<string, string>
  layout: string
}

// ── Primitive component registry ────────────────────────────────────────────

type PrimitiveComponent = React.ComponentType<Record<string, unknown>>

const PRIMITIVES: Record<string, PrimitiveComponent> = {
  Button: UIButton as PrimitiveComponent,
  Card: UICard as PrimitiveComponent,
  CardHeader: UICardHeader as PrimitiveComponent,
  CardTitle: UICardTitle as PrimitiveComponent,
  CardDescription: UICardDescription as PrimitiveComponent,
  CardContent: UICardContent as PrimitiveComponent,
  CardFooter: UICardFooter as PrimitiveComponent,
  Input: UIInput as PrimitiveComponent,
  Badge: UIBadge as PrimitiveComponent,
  Progress: UIProgress as PrimitiveComponent,
}

// ── HTML attribute name → React prop name mapping ──────────────────────────

const HTML_ATTR_MAP: Record<string, string> = {
  class: 'className',
  for: 'htmlFor',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  tabindex: 'tabIndex',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  cellspacing: 'cellSpacing',
  cellpadding: 'cellPadding',
  usemap: 'useMap',
  frameborder: 'frameBorder',
  srcset: 'srcSet',
  crossorigin: 'crossOrigin',
  autocomplete: 'autoComplete',
  autofocus: 'autoFocus',
  autoplay: 'autoPlay',
  enctype: 'encType',
  novalidate: 'noValidate',
  datetime: 'dateTime',
  pubdate: 'pubDate',
  maxvalue: 'maxValue',
}

// Boolean attrs that React expects as actual booleans
const BOOLEAN_ATTRS = new Set([
  'checked',
  'disabled',
  'readonly',
  'selected',
  'multiple',
  'hidden',
  'required',
  'autoplay',
  'controls',
  'loop',
  'muted',
  'open',
  'reversed',
  'async',
  'defer',
  'nomodule',
])

// Void elements that cannot have children
const VOID_TAGS = new Set([
  'input',
  'br',
  'hr',
  'img',
  'meta',
  'link',
  'area',
  'base',
  'col',
  'embed',
  'source',
  'track',
  'wbr',
])

// ── Minimal HTML-to-React-element parser ────────────────────────────────────

interface ParsedNode {
  tag: string
  attrs: Record<string, string>
  children: (ParsedNode | string)[]
}

function parseHtml(html: string): ParsedNode[] {
  const tokens = tokenize(html)
  const roots: ParsedNode[] = []
  let i = 0
  while (i < tokens.length) {
    const t = tokens[i]
    if (t.type === 'text') {
      i++
      continue
    }
    if (t.type === 'open') {
      const [node, next] = parseElement(tokens, i)
      if (node) roots.push(node)
      i = next
    } else {
      i++
    }
  }
  return roots
}

type Token =
  | {
      type: 'open'
      tag: string
      attrs: Record<string, string>
      selfClosing: boolean
    }
  | { type: 'close'; tag: string }
  | { type: 'text'; value: string }

function tokenize(jsx: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < jsx.length) {
    if (/\s/.test(jsx[i])) {
      i++
      continue
    }
    if (jsx[i] === '<') {
      // Skip comments <!-- -->
      if (jsx.startsWith('<!--', i)) {
        const end = jsx.indexOf('-->', i + 4)
        i = end === -1 ? jsx.length : end + 3
        continue
      }
      if (jsx[i + 1] === '/') {
        const end = jsx.indexOf('>', i + 2)
        if (end === -1) break
        tokens.push({ type: 'close', tag: jsx.slice(i + 2, end).trim() })
        i = end + 1
        continue
      }
      const end = findTagEnd(jsx, i + 1)
      if (end === -1) break
      const tagContent = jsx.slice(i + 1, end)
      const selfClosing = tagContent.endsWith('/')
      const body = selfClosing
        ? tagContent.slice(0, -1).trim()
        : tagContent.trim()
      const spaceIdx = body.search(/\s/)
      const tag = spaceIdx === -1 ? body : body.slice(0, spaceIdx).trim()
      const attrsStr = spaceIdx === -1 ? '' : body.slice(spaceIdx).trim()
      tokens.push({
        type: 'open',
        tag,
        attrs: parseAttrs(attrsStr),
        selfClosing,
      })
      i = end + 1
      continue
    }
    const nextLt = jsx.indexOf('<', i)
    const text = nextLt === -1 ? jsx.slice(i) : jsx.slice(i, nextLt)
    if (text.trim().length > 0)
      tokens.push({ type: 'text', value: text.trim() })
    i = nextLt === -1 ? jsx.length : nextLt
  }
  return tokens
}

function findTagEnd(jsx: string, start: number): number {
  let i = start
  let inQuote = false
  let quoteChar = ''
  while (i < jsx.length) {
    const ch = jsx[i]
    if (inQuote) {
      if (ch === quoteChar) inQuote = false
    } else if (ch === '"' || ch === "'") {
      inQuote = true
      quoteChar = ch
    } else if (ch === '>') {
      return i
    }
    i++
  }
  return -1
}

function parseAttrs(str: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  let i = 0
  while (i < str.length) {
    while (i < str.length && /\s/.test(str[i])) i++
    if (i >= str.length) break
    const nameStart = i
    while (i < str.length && !/[\s=]/.test(str[i])) i++
    const name = str.slice(nameStart, i).trim()
    if (name.length === 0) break
    while (i < str.length && /\s/.test(str[i])) i++
    if (str[i] === '=') {
      i++
      while (i < str.length && /\s/.test(str[i])) i++
      const quote = str[i]
      if (quote === '"' || quote === "'") {
        i++
        const valStart = i
        while (i < str.length && str[i] !== quote) i++
        attrs[name] = str.slice(valStart, i)
        i++
      } else {
        const valStart = i
        while (i < str.length && !/\s/.test(str[i])) i++
        attrs[name] = str.slice(valStart, i)
      }
    } else {
      attrs[name] = ''
    }
  }
  return attrs
}

function parseElement(
  tokens: Token[],
  idx: number,
): [ParsedNode | null, number] {
  if (idx >= tokens.length) return [null, idx]
  const token = tokens[idx]
  if (token.type !== 'open') return [null, idx]
  const node: ParsedNode = { tag: token.tag, attrs: token.attrs, children: [] }
  if (token.selfClosing) return [node, idx + 1]
  let i = idx + 1
  while (i < tokens.length) {
    const t = tokens[i]
    if (t.type === 'close') {
      if (t.tag === token.tag) return [node, i + 1]
      return [node, i]
    }
    if (t.type === 'text') {
      node.children.push(t.value)
      i++
    } else if (t.type === 'open') {
      const [child, next] = parseElement(tokens, i)
      if (child) node.children.push(child)
      i = next
    } else {
      i++
    }
  }
  return [node, i]
}

// ── State helpers ───────────────────────────────────────────────────────────

type StateValue = string | number | boolean

function parseStateValue(raw: string): StateValue {
  if (raw === 'true') return true
  if (raw === 'false') return false
  const num = Number(raw)
  return isNaN(num) ? raw : num
}

function stateToString(val: StateValue): string {
  if (val === true) return 'true'
  if (val === false) return 'false'
  return String(val)
}

/** Interpolate {varname} in text content. Strips JSX expressions (non-variable). */
function interpolateText(
  text: string,
  state: Record<string, StateValue>,
): string {
  // First, strip JSX expression containers that contain JS code (not simple var names)
  // e.g. {tasks.map(...)}, {task.done ? 'x' : 'y'}, {() => foo()}
  let cleaned = text.replace(/\{[^}]*\}/g, (match) => {
    const inner = match.slice(1, -1).trim()
    // Simple variable name → keep for interpolation
    if (/^\w+$/.test(inner)) return match
    // Everything else (JS expressions) → remove
    return ''
  })
  // Then interpolate simple {varname} references
  cleaned = cleaned.replace(/\{(\w+)\}/g, (_, name) => {
    const val = state[name]
    return val !== undefined ? stateToString(val) : `{${name}}`
  })
  return cleaned
}

/** Interpolate {varname} in attribute values. Strips JSX expressions. */
function interpolateAttr(
  val: string,
  state: Record<string, StateValue>,
): string {
  let cleaned = val.replace(/\{[^}]*\}/g, (match) => {
    const inner = match.slice(1, -1).trim()
    if (/^\w+$/.test(inner)) return match
    return ''
  })
  cleaned = cleaned.replace(/\{(\w+)\}/g, (_, name) => {
    const v = state[name]
    return v !== undefined ? stateToString(v) : `{${name}}`
  })
  return cleaned
}

/** Evaluate a mutation expression (or multi-expression) against state. */
function evalMutation(
  expr: string,
  state: Record<string, StateValue>,
): Record<string, StateValue> {
  const next = { ...state }
  // Multi-assignment: "task1done=false task2done=false task3done=false"
  // Split on spaces, but only when we have multiple assignment expressions
  const parts = expr.split(/\s+/)
  if (parts.length > 1 && parts.every((p) => /^\w+=/.test(p))) {
    for (const part of parts) {
      const eqIdx = part.indexOf('=')
      if (eqIdx > 0) {
        const target = part.slice(0, eqIdx).trim()
        const val = part.slice(eqIdx + 1).trim()
        next[target] = parseStateValue(val)
      }
    }
    return next
  }
  // Arithmetic: count+1, count-1, total*2, price/3
  const m = expr.match(/^(\w+)\s*([+\-*/])\s*(\w+|-?\d+\.?\d*)$/)
  if (m) {
    const [, target, op, operand] = m
    const current = Number(state[target] ?? 0)
    const val = isNaN(Number(operand))
      ? Number(state[operand] ?? 0)
      : Number(operand)
    switch (op) {
      case '+':
        next[target] = current + val
        break
      case '-':
        next[target] = current - val
        break
      case '*':
        next[target] = current * val
        break
      case '/':
        next[target] = current / val
        break
    }
    return next
  }
  // Assignment: count=0, name=hello, status=Done
  const assignMatch = expr.match(/^(\w+)=(.+)$/)
  if (assignMatch) {
    const [, target, val] = assignMatch
    next[target] = parseStateValue(val.trim())
    return next
  }
  // Toggle boolean: just a variable name
  if (expr in state) {
    next[expr] = state[expr] === true ? false : true
    return next
  }
  return next
}

// ── Render parsed node tree into React elements ────────────────────────────

function renderNode(
  node: ParsedNode,
  state: Record<string, StateValue>,
  dispatch: (actionName: string) => void,
): ReactNode {
  const { tag, attrs, children } = node
  const isPrimitive = tag in PRIMITIVES

  // Map HTML attrs → React props
  const reactProps: Record<string, unknown> = {}
  for (const [key, rawVal] of Object.entries(attrs)) {
    // Interpolate {varname} in attribute values
    const val = interpolateAttr(rawVal, state)

    // Map known HTML attr names to React
    const reactKey = HTML_ATTR_MAP[key] ?? key

    if (key === 'onclick') {
      reactProps.onClick = () => dispatch(val)
    } else if (key === 'oninput') {
      reactProps.onInput = () => dispatch(val)
    } else if (key === 'onchange') {
      reactProps.onChange = () => dispatch(val)
    } else if (BOOLEAN_ATTRS.has(key)) {
      // Boolean attrs: "true"/"false" strings → actual booleans
      const boolVal = val === 'true' || val === '' || val === key
      // For checkboxes, use defaultChecked + key to force re-mount when state changes
      // This avoids React controlled component feedback loops while still updating visually
      if (key === 'checked' && tag === 'input') {
        reactProps.defaultChecked = boolVal
        // Force re-mount when the checked state changes by using a key
        reactProps.key = `chk-${boolVal}`
      } else {
        reactProps[reactKey] = boolVal
      }
    } else if (key === 'style') {
      const styleObj: Record<string, string> = {}
      for (const decl of val.split(';')) {
        const colonIdx = decl.indexOf(':')
        if (colonIdx > 0) {
          const prop = decl.slice(0, colonIdx).trim()
          const value = decl.slice(colonIdx + 1).trim()
          styleObj[prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value
        }
      }
      reactProps.style = styleObj
    } else if (key === 'value' && (tag === 'Progress' || tag === 'progress')) {
      reactProps.value = Number(val)
    } else if (
      key === 'variant' ||
      key === 'size' ||
      key === 'type' ||
      key === 'placeholder' ||
      key === 'href' ||
      key === 'src' ||
      key === 'alt' ||
      key === 'id' ||
      key === 'name' ||
      key === 'min' ||
      key === 'max' ||
      key === 'step' ||
      key === 'width' ||
      key === 'height' ||
      key === 'colspan' ||
      key === 'rowspan' ||
      key === 'target' ||
      key === 'rel' ||
      key === 'download'
    ) {
      reactProps[reactKey] = val
    } else if (!isPrimitive) {
      // Pass through other attrs for raw HTML tags
      reactProps[reactKey] = val
    } else {
      // For primitives, pass through mapped attrs
      reactProps[reactKey] = val
    }
  }

  const renderedChildren = children.map((child) => {
    if (typeof child === 'string') return interpolateText(child, state)
    return renderNode(child, state, dispatch)
  })

  // Use primitive component if tag matches, otherwise raw HTML tag
  const Component = isPrimitive ? PRIMITIVES[tag] : tag

  // Void elements cannot have children — React throws
  if (!isPrimitive && VOID_TAGS.has(tag)) {
    return createElement(Component as string, reactProps)
  }
  return createElement(
    Component as React.ComponentType<Record<string, unknown>>,
    reactProps,
    ...renderedChildren,
  )
}

/** Sanitize layout HTML: strip JSX expression containers that contain JS code.
 *  Keeps simple {varname} interpolations. Removes {tasks.map(...)}, {x ? a : b}, etc.
 *  Also removes React-specific attributes like onChange, onSubmit, onClick with function values,
 *  className (converts to class), and key props. */
function sanitizeLayout(html: string): string {
  // First pass: remove React event handler attributes with JSX function values
  // These have the form: onChange={...} where ... can contain nested braces
  let result = removeReactEventHandlers(html)
  // Remove key={...} props
  result = removeJsxAttribute(result, 'key')
  // Convert className to class
  result = result.replace(/\bclassName=/g, 'class=')
  // Remove JSX expression containers in text that contain JS code (not simple \w+ vars)
  // e.g. {tasks.map(...)}, {x ? a : b}, {() => foo()}
  result = removeJsxExpressions(result)

  return result
}

/** Remove a JSX attribute with brace-delimited value, handling nested braces. */
function removeJsxAttribute(html: string, attrName: string): string {
  const pattern = new RegExp(`\\s${attrName}=\\{`, 'g')
  let result = ''
  let lastEnd = 0
  let match: RegExpExecArray | null
  while ((match = pattern.exec(html)) !== null) {
    result += html.slice(lastEnd, match.index)
    // Skip the attribute: find matching closing brace
    let depth = 1
    let i = match.index + match[0].length
    while (i < html.length && depth > 0) {
      if (html[i] === '{') depth++
      else if (html[i] === '}') depth--
      i++
    }
    lastEnd = i
    pattern.lastIndex = i
  }
  result += html.slice(lastEnd)
  return result
}

/** Remove React event handler attributes (onChange, onClick, onSubmit, etc.) with JSX values. */
function removeReactEventHandlers(html: string): string {
  const eventAttrs = [
    'onChange',
    'onClick',
    'onSubmit',
    'onInput',
    'onBlur',
    'onFocus',
    'onKeyDown',
    'onKeyUp',
    'onKeyPress',
    'onMouseEnter',
    'onMouseLeave',
    'onMouseDown',
    'onMouseUp',
  ]
  let result = html
  for (const attr of eventAttrs) {
    result = removeJsxAttribute(result, attr)
  }
  return result
}

/** Remove JSX expression containers {expr} that contain JS code.
 *  Keeps simple {varname} where varname is \w+. */
function removeJsxExpressions(html: string): string {
  // Find all {...} expressions, handling nested braces
  const result: string[] = []
  let i = 0
  while (i < html.length) {
    if (html[i] === '{') {
      // Find matching closing brace
      let depth = 1
      let j = i + 1
      while (j < html.length && depth > 0) {
        if (html[j] === '{') depth++
        else if (html[j] === '}') depth--
        j++
      }
      const inner = html.slice(i + 1, j - 1).trim()
      // Keep simple variable names: {count}, {name}, {task1}
      if (/^\w+$/.test(inner)) {
        result.push(html.slice(i, j))
      }
      // Otherwise strip it (JS expression like tasks.map(...), ternary, arrow function, etc.)
      i = j
    } else {
      result.push(html[i])
      i++
    }
  }
  return result.join('')
}

// ── Freeform capsule ────────────────────────────────────────────────────────

export const Freeform = defineCapsule({
  name: 'Freeform',
  description:
    'Renders an LLM-generated freeform component with reactive state and action handlers. Supports raw HTML tags + Tailwind classes, and our UI primitives (Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input, Badge, Progress). Used when no existing section component matches a role.',
  props: z.object({
    spec: z.string().optional(),
  }),
  component: ({ props }) => {
    const freeformJson = props.spec
    if (!freeformJson || typeof freeformJson !== 'string') {
      return createElement(
        'div',
        { className: 'p-8 text-muted-foreground' },
        'Freeform: no data',
      )
    }

    let def: FreeformDef
    try {
      def = JSON.parse(freeformJson) as FreeformDef
    } catch {
      return createElement(
        'div',
        { className: 'p-8 text-muted-foreground' },
        'Freeform: invalid JSON',
      )
    }

    // Parse all state variables into typed values
    const stateVars = Object.keys(def.state)
    const stateRef: Record<string, StateValue> = {}
    const setters: Record<string, (val: StateValue) => void> = {}

    // useState must be called unconditionally (hooks rules)
    for (const name of stateVars) {
      const initVal = parseStateValue(def.state[name])
      const [val, setVal] = useState<StateValue>(initVal)
      stateRef[name] = val
      setters[name] = setVal
    }

    const dispatch = (actionName: string) => {
      const expr = def.actions[actionName]
      if (!expr) return
      const next = evalMutation(expr, stateRef)
      console.log(
        '[freeform] dispatch',
        actionName,
        'stateRef.task1done:',
        stateRef['task1done'],
        'next.task1done:',
        next['task1done'],
      )
      for (const name of Object.keys(next)) {
        if (setters[name]) setters[name](next[name])
      }
    }

    try {
      // Sanitize layout: strip JSX expression containers that aren't simple {varname}
      // This handles LLM outputs that incorrectly use JSX syntax like {tasks.map(...)}
      const sanitizedLayout = sanitizeLayout(def.layout)
      const roots = parseHtml(sanitizedLayout)
      if (roots.length === 0) {
        return createElement(
          'div',
          { className: 'p-8 text-muted-foreground' },
          'Freeform: invalid layout',
        )
      }
      // Single root → return directly. Multiple roots → wrap in Fragment.
      if (roots.length === 1) {
        return renderNode(roots[0], stateRef, dispatch)
      }
      return createElement(
        Fragment,
        null,
        ...roots.map((r) => renderNode(r, stateRef, dispatch)),
      )
    } catch {
      return createElement(
        'div',
        { className: 'p-8 text-muted-foreground' },
        'Freeform: render error',
      )
    }
  },
})
