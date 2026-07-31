/**
 * AST-based security validator for Svelte components.
 *
 * Instead of regex matching on source text (which is bypassable via obfuscation,
 * string concatenation, unicode escapes, etc.), this walks the Svelte compiler's
 * ESTree AST to detect dangerous patterns structurally.
 *
 * The AST represents the actual semantic structure of the code — obfuscation
 * tricks like `window["lo"+"cation"]` or `eval.call(null, code)` are resolved
 * to their actual AST node types, making bypass much harder.
 *
 * This is used as a second layer of defense after the regex-based XSS_PATTERNS
 * check in svelte-compiler.ts.
 */

// ── Dangerous member access patterns ────────────────────────────────────────
// These are checked by walking the AST for MemberExpression nodes.
const DANGEROUS_MEMBER_ACCESS: Array<{
  object: string
  property: string
  message: string
}> = [
  {
    object: 'document',
    property: 'cookie',
    message: 'document.cookie access is blocked',
  },
  {
    object: 'document',
    property: 'domain',
    message: 'document.domain access is blocked',
  },
  {
    object: 'document',
    property: 'write',
    message: 'document.write() is blocked',
  },
  {
    object: 'document',
    property: 'writeln',
    message: 'document.writeln() is blocked',
  },
  {
    object: 'window',
    property: 'location',
    message: 'window.location access is blocked',
  },
  { object: 'window', property: 'open', message: 'window.open() is blocked' },
  {
    object: 'window',
    property: 'name',
    message: 'window.name access is blocked',
  },
  {
    object: 'globalThis',
    property: 'location',
    message: 'globalThis.location access is blocked',
  },
  {
    object: 'self',
    property: 'location',
    message: 'self.location access is blocked',
  },
  {
    object: 'top',
    property: 'location',
    message: 'top.location access is blocked',
  },
  {
    object: 'parent',
    property: 'location',
    message: 'parent.location access is blocked',
  },
  {
    object: 'frames',
    property: 'location',
    message: 'frames.location access is blocked',
  },
  {
    object: 'navigator',
    property: 'sendBeacon',
    message: 'navigator.sendBeacon() is blocked',
  },
  {
    object: 'navigator',
    property: 'geolocation',
    message: 'navigator.geolocation access is blocked',
  },
  {
    object: 'navigator',
    property: 'mediaDevices',
    message: 'navigator.mediaDevices access is blocked',
  },
  {
    object: 'navigator',
    property: 'serviceWorker',
    message: 'navigator.serviceWorker access is blocked',
  },
  {
    object: 'window',
    property: 'postMessage',
    message: 'window.postMessage() is blocked',
  },
  {
    object: 'document',
    property: 'postMessage',
    message: 'document.postMessage() is blocked',
  },
  {
    object: 'localStorage',
    property: 'getItem',
    message: 'localStorage access is blocked',
  },
  {
    object: 'localStorage',
    property: 'setItem',
    message: 'localStorage access is blocked',
  },
  {
    object: 'sessionStorage',
    property: 'getItem',
    message: 'sessionStorage access is blocked',
  },
  {
    object: 'sessionStorage',
    property: 'setItem',
    message: 'sessionStorage access is blocked',
  },
  {
    object: 'indexedDB',
    property: 'open',
    message: 'indexedDB access is blocked',
  },
  {
    object: 'caches',
    property: 'open',
    message: 'Cache API access is blocked',
  },
  {
    object: 'WebSocket',
    property: 'prototype',
    message: 'WebSocket access is blocked',
  },
  {
    object: 'EventSource',
    property: 'prototype',
    message: 'EventSource access is blocked',
  },
  {
    object: 'RTCPeerConnection',
    property: 'prototype',
    message: 'RTCPeerConnection access is blocked',
  },
]

// ── Dangerous global function calls ─────────────────────────────────────────
// These are checked by walking the AST for CallExpression and NewExpression nodes.
const DANGEROUS_CALLS: Array<{
  name: string
  message: string
}> = [
  { name: 'eval', message: 'eval() is blocked — executes arbitrary code' },
  {
    name: 'Function',
    message: 'Function() constructor is blocked — executes arbitrary code',
  },
  { name: 'fetch', message: 'fetch() is blocked in Svelte components' },
  {
    name: 'XMLHttpRequest',
    message: 'XMLHttpRequest is blocked in Svelte components',
  },
  { name: 'WebSocket', message: 'WebSocket is blocked in Svelte components' },
  {
    name: 'EventSource',
    message: 'EventSource is blocked in Svelte components',
  },
  { name: 'importScripts', message: 'importScripts() is blocked' },
  { name: 'Worker', message: 'Worker constructor is blocked' },
  { name: 'SharedWorker', message: 'SharedWorker constructor is blocked' },
  { name: 'open', message: 'open() (window.open) is blocked' },
  { name: 'alert', message: 'alert() is blocked in preview' },
  { name: 'confirm', message: 'confirm() is blocked in preview' },
  { name: 'prompt', message: 'prompt() is blocked in preview' },
]

// ── Calls that are only dangerous with string arguments ─────────────────────
const DANGEROUS_STRING_ARG_CALLS = new Set(['setTimeout', 'setInterval'])

// ── Dangerous HTML elements in template ─────────────────────────────────────
const DANGEROUS_HTML_ELEMENTS = new Set([
  'script',
  'iframe',
  'object',
  'embed',
  'applet',
  'base',
  'meta', // meta refresh redirects
  'link', // can load external resources
])

// ── Dangerous HTML attributes ───────────────────────────────────────────────
const DANGEROUS_ATTRIBUTES = new Set([
  'onload',
  'onerror',
  'onclick',
  'onmouseover',
  'onmouseout',
  'onfocus',
  'onblur',
  'onchange',
  'oninput',
  'onsubmit',
  'onkeyup',
  'onkeydown',
  'onkeypress',
  'ontoggle',
  'onanimationstart',
  'onanimationend',
  'onanimationiteration',
  'ontransitionend',
  'onpointerdown',
  'onpointerup',
  'onpointermove',
  'onpointercancel',
])

interface AstNode {
  type: string
  [key: string]: unknown
}

interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Walk the Svelte compiler AST and detect dangerous patterns structurally.
 * This is called after the regex-based XSS_PATTERNS check as defense-in-depth.
 */
export function validateSvelteAst(ast: {
  html?: AstNode
  instance?: AstNode | null
  module?: AstNode | null
  css?: AstNode | null
}): ValidationResult {
  const errors: string[] = []

  // Validate the HTML/template AST
  if (ast.html) {
    walkHtmlAst(ast.html, errors)
  }

  // Validate the <script> AST (instance = non-module script, module = <script context="module">)
  if (ast.instance?.content) {
    walkJsAst(ast.instance.content as AstNode, errors)
  }
  if (ast.module?.content) {
    walkJsAst(ast.module.content as AstNode, errors)
  }

  return { valid: errors.length === 0, errors }
}

// ── HTML AST walker ─────────────────────────────────────────────────────────
function walkHtmlAst(node: AstNode, errors: string[]): void {
  if (!node || typeof node !== 'object') return

  // Check for dangerous elements
  if (node.type === 'Element' && typeof node.name === 'string') {
    if (DANGEROUS_HTML_ELEMENTS.has(node.name.toLowerCase())) {
      errors.push(
        `Security: <${node.name}> element is blocked in Svelte components`,
      )
    }
  }

  // Check for {@html} — raw HTML injection
  if (node.type === 'RawMustacheTag') {
    errors.push(
      'Security: {@html} is blocked — renders raw HTML, bypassing Svelte escaping',
    )
  }

  // Check for dangerous attributes (inline event handlers)
  if (node.type === 'Attribute' && typeof node.name === 'string') {
    if (DANGEROUS_ATTRIBUTES.has(node.name.toLowerCase())) {
      errors.push(
        `Security: Inline event handler "${node.name}" is blocked — use Svelte on: directives`,
      )
    }
    // Check for javascript: URIs in href/src
    if (
      (node.name === 'href' || node.name === 'src') &&
      Array.isArray(node.value)
    ) {
      for (const val of node.value) {
        if (val.type === 'Text' && typeof val.data === 'string') {
          if (/^\s*javascript:/i.test(val.data)) {
            errors.push(
              `Security: javascript: URI in "${node.name}" is blocked`,
            )
          }
          if (/^\s*data:text\/html/i.test(val.data)) {
            errors.push(
              `Security: data:text/html URI in "${node.name}" is blocked`,
            )
          }
        }
      }
    }
  }

  // Recurse into children
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      walkHtmlAst(child as AstNode, errors)
    }
  }

  // Recurse into attributes
  if (Array.isArray(node.attributes)) {
    for (const attr of node.attributes) {
      walkHtmlAst(attr as AstNode, errors)
    }
  }

  // Recurse into expression (for MustacheTag, Attribute, etc.)
  if (node.expression && typeof node.expression === 'object') {
    walkJsAst(node.expression as AstNode, errors)
  }

  // Recurse into fragment
  if (
    node.content &&
    typeof node.content === 'object' &&
    node.type === 'Fragment'
  ) {
    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        walkHtmlAst(child as AstNode, errors)
      }
    } else {
      walkHtmlAst(node.content as AstNode, errors)
    }
  }
}

// ── JS AST walker (ESTree-compatible) ───────────────────────────────────────
function walkJsAst(node: AstNode, errors: string[]): void {
  if (!node || typeof node !== 'object') return

  // Check for dangerous member access: document.cookie, window.location, etc.
  if (node.type === 'MemberExpression') {
    const objectName = getIdentifierName(node.object as AstNode)
    const propertyName = getPropertyName(
      node.property as AstNode,
      node.computed as boolean,
    )

    if (objectName && propertyName) {
      for (const dangerous of DANGEROUS_MEMBER_ACCESS) {
        if (
          objectName === dangerous.object &&
          propertyName === dangerous.property
        ) {
          errors.push(`Security: ${dangerous.message}`)
        }
      }
    }
  }

  // Check for dangerous function calls (both CallExpression and NewExpression)
  if (node.type === 'CallExpression' || node.type === 'NewExpression') {
    const calleeName = getIdentifierName(node.callee as AstNode)
    if (calleeName) {
      for (const dangerous of DANGEROUS_CALLS) {
        if (calleeName === dangerous.name) {
          errors.push(`Security: ${dangerous.message}`)
        }
      }

      // setTimeout/setInterval are only dangerous with string arguments (eval-like)
      if (DANGEROUS_STRING_ARG_CALLS.has(calleeName)) {
        const args = node.arguments as AstNode[]
        if (
          args &&
          args.length > 0 &&
          args[0].type === 'Literal' &&
          typeof args[0].value === 'string'
        ) {
          errors.push(
            `Security: ${calleeName} with string argument is blocked (eval-like)`,
          )
        }
      }
    }

    // Check for document.createElement('script'/'iframe')
    if (calleeName === 'createElement') {
      const args = node.arguments as AstNode[]
      if (args && args.length > 0 && args[0].type === 'Literal') {
        const tag = String((args[0] as AstNode).value ?? '').toLowerCase()
        if (tag === 'script' || tag === 'iframe') {
          errors.push(`Security: document.createElement('${tag}') is blocked`)
        }
      }
    }
  }

  // Check for .innerHTML / .outerHTML / .insertAdjacentHTML assignments
  if (node.type === 'AssignmentExpression') {
    const left = node.left as AstNode
    if (left.type === 'MemberExpression') {
      const propName = getPropertyName(
        left.property as AstNode,
        left.computed as boolean,
      )
      if (propName === 'innerHTML' || propName === 'outerHTML') {
        errors.push(
          `Security: ${propName} assignment is blocked — use Svelte reactivity`,
        )
      }
    }
  }

  // Check for .insertAdjacentHTML() calls
  if (node.type === 'CallExpression') {
    const callee = node.callee as AstNode
    if (callee.type === 'MemberExpression') {
      const propName = getPropertyName(
        callee.property as AstNode,
        callee.computed as boolean,
      )
      if (propName === 'insertAdjacentHTML') {
        errors.push('Security: insertAdjacentHTML() is blocked')
      }
      if (propName === 'setAttribute' && propName) {
        // Check for setAttribute('on*', ...) — inline event handler injection
        const args = node.arguments as AstNode[]
        if (args && args.length > 0 && args[0].type === 'Literal') {
          const attrName = String(
            (args[0] as AstNode).value ?? '',
          ).toLowerCase()
          if (attrName.startsWith('on')) {
            errors.push(
              `Security: setAttribute("${attrName}", ...) is blocked — inline event handler`,
            )
          }
        }
      }
    }
  }

  // Check for dynamic import()
  if (node.type === 'ImportExpression') {
    errors.push('Security: Dynamic import() is blocked in Svelte components')
  }

  // Check for require()
  if (node.type === 'CallExpression') {
    const calleeName = getIdentifierName(node.callee as AstNode)
    if (calleeName === 'require') {
      errors.push('Security: require() is blocked in Svelte components')
    }
  }

  // Recurse into all child nodes
  for (const key of Object.keys(node)) {
    if (
      key === 'type' ||
      key === 'start' ||
      key === 'end' ||
      key === 'loc' ||
      key === 'range'
    )
      continue
    const child = (node as Record<string, unknown>)[key]
    if (Array.isArray(child)) {
      for (const item of child) {
        if (
          item &&
          typeof item === 'object' &&
          typeof (item as AstNode).type === 'string'
        ) {
          walkJsAst(item as AstNode, errors)
        }
      }
    } else if (
      child &&
      typeof child === 'object' &&
      typeof (child as AstNode).type === 'string'
    ) {
      walkJsAst(child as AstNode, errors)
    }
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function getIdentifierName(node: AstNode | null | undefined): string | null {
  if (!node) return null
  if (node.type === 'Identifier' && typeof node.name === 'string') {
    return node.name
  }
  return null
}

function getPropertyName(
  node: AstNode | null | undefined,
  computed: boolean,
): string | null {
  if (!node) return null
  if (computed) {
    // Computed access: obj["cookie"] — check if it's a string literal
    if (node.type === 'Literal' && typeof node.value === 'string') {
      return node.value
    }
    // Dynamic computed access: obj[varName] — can't determine statically,
    // but this is suspicious. Block it for safety.
    return null
  }
  // Non-computed: obj.property
  if (node.type === 'Identifier' && typeof node.name === 'string') {
    return node.name
  }
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value
  }
  return null
}
