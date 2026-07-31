/**
 * SVG sanitizer — strips dangerous elements and attributes from SVG strings
 * before they are injected via dangerouslySetInnerHTML.
 *
 * SVGs from Brandfetch or data URIs can contain <script> tags, inline event
 * handlers (onclick, onerror), javascript: URIs, and external resource loads
 * that would execute in the browser. This sanitizer uses a tag/attribute
 * allowlist approach rather than regex blocking, making it resistant to
 * obfuscation tricks (unicode escapes, string concatenation, encoding).
 */

// ── Allowlist of SVG elements that are safe for inline rendering ──────────
const SAFE_SVG_ELEMENTS = new Set([
  'svg',
  'g',
  'defs',
  'symbol',
  'use',
  'path',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'text',
  'tspan',
  'textPath',
  'linearGradient',
  'radialGradient',
  'stop',
  'clipPath',
  'mask',
  'pattern',
  'filter',
  'feGaussianBlur',
  'feOffset',
  'feMerge',
  'feMergeNode',
  'feColorMatrix',
  'feComposite',
  'feBlend',
  'feFlood',
  'feComponentTransfer',
  'feFuncR',
  'feFuncG',
  'feFuncB',
  'feFuncA',
  'feMorphology',
  'feTile',
  'feTurbulence',
  'feDisplacementMap',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feSpecularLighting',
  'feDistantLight',
  'fePointLight',
  'feSpotLight',
  'image',
  'foreignObject',
  'desc',
  'title',
  'metadata',
  'marker',
  'hatch',
  'hatchpath',
  'animate',
  'animateMotion',
  'animateTransform',
  'set',
  'mpath',
  'switch',
  'a',
])

// ── Allowlist of SVG attributes that are safe for inline rendering ────────
const SAFE_SVG_ATTRIBUTES = new Set([
  // Core
  'id',
  'class',
  'style',
  'tabindex',
  'lang',
  'dir',
  // Presentation
  'fill',
  'fill-opacity',
  'fill-rule',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-opacity',
  'opacity',
  'visibility',
  'display',
  'cursor',
  'color',
  'color-interpolation',
  'color-rendering',
  // Text
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'font-variant',
  'font-stretch',
  'text-anchor',
  'text-decoration',
  'text-rendering',
  'letter-spacing',
  'word-spacing',
  'dominant-baseline',
  'baseline-shift',
  // Geometry
  'x',
  'y',
  'x1',
  'y1',
  'x2',
  'y2',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'width',
  'height',
  'd',
  'points',
  'transform',
  'viewBox',
  'preserveAspectRatio',
  'offset',
  'pathLength',
  // Gradient / pattern
  'gradientUnits',
  'gradientTransform',
  'spreadMethod',
  'patternUnits',
  'patternTransform',
  'patternContentUnits',
  // Clip / mask
  'clip-path',
  'clip-rule',
  'mask',
  'mask-type',
  'maskUnits',
  'maskContentUnits',
  'mask-type',
  // Filter
  'filter',
  'filterUnits',
  'primitiveUnits',
  'x',
  'y',
  'width',
  'height',
  'in',
  'in2',
  'result',
  'mode',
  'type',
  'values',
  'tableValues',
  'operator',
  'k1',
  'k2',
  'k3',
  'k4',
  'dx',
  'dy',
  'stdDeviation',
  'flood-color',
  'flood-opacity',
  'lighting-color',
  'surfaceScale',
  'diffuseConstant',
  'specularConstant',
  'specularExponent',
  'kernelMatrix',
  'kernelUnitLength',
  'order',
  'divisor',
  'bias',
  'targetX',
  'targetY',
  'edgeMode',
  'preserveAlpha',
  'seed',
  'numOctaves',
  'baseFrequency',
  'stitchTiles',
  'type',
  'scale',
  'xChannelSelector',
  'yChannelSelector',
  // Animation
  'begin',
  'end',
  'dur',
  'repeatCount',
  'repeatDur',
  'restart',
  'calcMode',
  'keyTimes',
  'keySplines',
  'keyPoints',
  'path',
  'rotate',
  'from',
  'to',
  'by',
  'values',
  'attributeName',
  'attributeType',
  'additive',
  'accumulate',
  'fill',
  // Links
  'href',
  'xlink:href',
  'target',
  'rel',
  // Image
  'preserveAspectRatio',
  'image-rendering',
  // Marker
  'marker-start',
  'marker-mid',
  'marker-end',
  'markerUnits',
  'markerWidth',
  'markerHeight',
  'orient',
  'refX',
  'refY',
  // Misc
  'role',
  'aria-label',
  'aria-hidden',
  'aria-labelledby',
  'aria-describedby',
  'focusable',
  'alignment-baseline',
  'shape-rendering',
  'stop-color',
  'stop-opacity',
  'vector-effect',
  'paint-order',
  'clipPathUnits',
])

// ── Attributes that can contain URIs — check for javascript: scheme ───────
const URI_ATTRIBUTES = new Set(['href', 'xlink:href', 'src', 'from', 'to'])

/**
 * Sanitize an SVG string by removing dangerous elements, attributes, and
 * URI schemes. Uses a DOMParser-based approach for robust parsing.
 *
 * In Node.js (no DOMParser), falls back to regex-based stripping of the
 * most dangerous patterns. This is less precise but covers the primary
 * attack vectors (script tags, event handlers, javascript: URIs).
 */
export function sanitizeSvg(svg: string): string {
  if (!svg || typeof svg !== 'string') return ''
  if (!/<svg/i.test(svg)) return ''

  // If we have a DOMParser (browser context), use it for robust parsing
  if (typeof DOMParser !== 'undefined') {
    return sanitizeSvgWithDomParser(svg)
  }

  // Node.js fallback — regex-based sanitization
  return sanitizeSvgWithRegex(svg)
}

function sanitizeSvgWithDomParser(svg: string): string {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svg, 'image/svg+xml')
    sanitizeDomNode(doc.documentElement)
    return new XMLSerializer().serializeToString(doc)
  } catch {
    // If parsing fails, return a minimal safe SVG
    return '<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Brand logo"/>'
  }
}

function sanitizeDomNode(node: Element): void {
  // Remove child elements not in the allowlist
  const children = Array.from(node.children)
  for (const child of children) {
    const tag = child.tagName.toLowerCase()
    if (!SAFE_SVG_ELEMENTS.has(tag)) {
      node.removeChild(child)
      continue
    }
    // Recurse into allowed elements
    sanitizeDomNode(child)
  }

  // Remove dangerous attributes
  const attrs = Array.from(node.attributes)
  for (const attr of attrs) {
    const name = attr.name.toLowerCase()
    const value = attr.value

    // Block all event handler attributes (on*)
    if (name.startsWith('on')) {
      node.removeAttribute(attr.name)
      continue
    }

    // Block style attributes that contain expression() or javascript:
    if (name === 'style' && /expression\s*\(|javascript:/i.test(value)) {
      node.removeAttribute(attr.name)
      continue
    }

    // Check URI attributes for javascript: scheme
    if (URI_ATTRIBUTES.has(name)) {
      if (/^\s*javascript:/i.test(value)) {
        node.removeAttribute(attr.name)
        continue
      }
    }

    // Block data: URIs in href/src (can embed HTML)
    if (URI_ATTRIBUTES.has(name) && /^\s*data:/i.test(value)) {
      node.removeAttribute(attr.name)
      continue
    }

    // Remove attributes not in the allowlist (defense-in-depth)
    if (!SAFE_SVG_ATTRIBUTES.has(name)) {
      // Allow namespaced attributes like xlink:href, xml:space, xmlns
      if (!name.includes(':') && name !== 'xmlns') {
        node.removeAttribute(attr.name)
      }
    }
  }
}

/**
 * Regex-based SVG sanitization for Node.js environments without DOMParser.
 * Strips the most dangerous patterns: <script> tags, event handlers,
 * javascript: URIs, and external resource references.
 */
function sanitizeSvgWithRegex(svg: string): string {
  let result = svg

  // Remove <script> tags and their content
  result = result.replace(/<script[\s\S]*?<\/script>/gi, '')

  // Remove <foreignObject> tags (can embed arbitrary HTML)
  result = result.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')

  // Remove event handler attributes (on*=)
  result = result.replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
  result = result.replace(/\son\w+\s*=\s*'[^']*'/gi, '')
  result = result.replace(/\son\w+\s*=\s*[^\s>]+/gi, '')

  // Remove javascript: URIs in href, xlink:href, src
  result = result.replace(
    /((?:xlink:)?href|src)\s*=\s*"[^"]*javascript:[^"]*"/gi,
    '',
  )
  result = result.replace(
    /((?:xlink:)?href|src)\s*=\s*'[^']*javascript:[^']*'/gi,
    '',
  )

  // Remove data: URIs in href (can embed HTML)
  result = result.replace(
    /((?:xlink:)?href|src)\s*=\s*"[^"]*data:text\/html[^"]*"/gi,
    '',
  )
  result = result.replace(
    /((?:xlink:)?href|src)\s*=\s*'[^']*data:text\/html[^']*'/gi,
    '',
  )

  // Remove style attributes containing expression() or javascript:
  result = result.replace(/style\s*=\s*"[^"]*expression\s*\([^"]*"/gi, '')
  result = result.replace(/style\s*=\s*"[^"]*javascript:[^"]*"/gi, '')

  // Remove <use> elements that reference external URLs (data exfiltration)
  result = result.replace(/<use[^>]*href\s*=\s*"(?!#)[^"]*"[^>]*>/gi, '')
  result = result.replace(/<use[^>]*xlink:href\s*=\s*"(?!#)[^"]*"[^>]*>/gi, '')

  return result
}
