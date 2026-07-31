/**
 * Sanitizes crawled HTML body content before it is injected via
 * dangerouslySetInnerHTML in generated clone pages.
 *
 * This is a defense-in-depth measure — the crawled HTML comes from external
 * sites and could contain malicious scripts, event handlers, or dangerous
 * URIs. The sanitizer strips:
 *
 * - <script> tags and their content
 * - Inline event handler attributes (on*=)
 * - javascript: URIs in href/src
 * - data:text/html URIs
 * - <iframe>, <object>, <embed>, <applet> tags
 * - <base> tags (can redirect resource loading)
 * - <meta http-equiv="refresh"> tags (can redirect the page)
 *
 * This is NOT a full HTML sanitizer like DOMPurify — it uses regex-based
 * stripping. However, since the bodyHtml is rendered inside a sandboxed
 * iframe (without allow-same-origin), the risk of bypass is significantly
 * reduced. The sandbox prevents script execution even if a bypass occurs.
 */

export function sanitizeCloneHtml(html: string): string {
  if (!html || typeof html !== 'string') return ''

  let result = html

  // Remove <script> tags and their content
  result = result.replace(/<script[\s\S]*?<\/script>/gi, '')

  // Remove <iframe> tags (with and without closing tags)
  result = result.replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
  result = result.replace(/<iframe[^>]*>/gi, '')

  // Remove <object>, <embed>, <applet> tags
  result = result.replace(/<object[\s\S]*?<\/object>/gi, '')
  result = result.replace(/<object[^>]*>/gi, '')
  result = result.replace(/<embed[^>]*>/gi, '')
  result = result.replace(/<applet[\s\S]*?<\/applet>/gi, '')
  result = result.replace(/<applet[^>]*>/gi, '')

  // Remove <base> tags (can redirect resource loading)
  result = result.replace(/<base[^>]*>/gi, '')

  // Remove <meta http-equiv="refresh"> tags (can redirect the page)
  result = result.replace(
    /<meta[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*>/gi,
    '',
  )

  // Remove inline event handler attributes (on*=)
  result = result.replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
  result = result.replace(/\son\w+\s*=\s*'[^']*'/gi, '')
  result = result.replace(/\son\w+\s*=\s*[^\s>]+/gi, '')

  // Remove javascript: URIs in href, src, xlink:href, action, formaction
  result = result.replace(
    /((?:xlink:)?href|src|action|formaction)\s*=\s*"[^"]*javascript:[^"]*"/gi,
    '',
  )
  result = result.replace(
    /((?:xlink:)?href|src|action|formaction)\s*=\s*'[^']*javascript:[^']*'/gi,
    '',
  )
  result = result.replace(
    /((?:xlink:)?href|src|action|formaction)\s*=\s*javascript:[^\s>]+/gi,
    '',
  )

  // Remove data:text/html URIs
  result = result.replace(
    /((?:xlink:)?href|src)\s*=\s*"[^"]*data:text\/html[^"]*"/gi,
    '',
  )
  result = result.replace(
    /((?:xlink:)?href|src)\s*=\s*'[^']*data:text\/html[^']*'/gi,
    '',
  )

  return result
}
