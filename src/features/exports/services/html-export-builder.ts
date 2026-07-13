const SHIP_FAST_BADGE_MARKER = 'data-ship-fast-export-badge="1"'
const SHIP_FAST_BADGE_RE =
  /\s*<a\b[^>]*data-ship-fast-export-badge="1"[\s\S]*?<\/a>/i
const SHIP_FAST_BADGE_LOGO_SVG =
  '<svg viewBox="0 0 52 52" width="16" height="16" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><path d="M26 4 8 20l6 2 12-12 12 12 6-2L26 4Z" fill="#7c3aed"/><path d="M14 22v18l8-4V24l-8-2Z" fill="#6d28d9"/><path d="M38 22v18l-8-4V24l8-2Z" fill="#6d28d9"/><path d="M22 24v12l4 2 4-2V24l-4-4-4 4Z" fill="#a78bfa"/><path d="m22 38 4 10 4-10-4 2-4-2Z" fill="#c4b5fd"/></svg>'
const URL_ATTRIBUTE_PATTERN =
  /(\s+)(href|src|action|formaction)(\s*=\s*)("[^"]*"|'[^']*'|[^\s"'`=<>]+)/gi
const SAFE_DATA_IMAGE_PATTERN =
  /^data:image\/(?:avif|gif|jpe?g|png|webp)(?:;|,)/i

const decodeUrlEntities = (value: string): string =>
  value
    .replace(/&(?:colon|tab|newline);?/gi, (entity) => {
      const name = entity.replace(/[&;]/g, '').toLowerCase()
      if (name === 'colon') return ':'
      return name === 'tab' ? '\t' : '\n'
    })
    .replace(/&#(?:x([0-9a-f]+)|(\d+));?/gi, (entity, hex, decimal) => {
      const codePoint = Number.parseInt(hex ?? decimal ?? '', hex ? 16 : 10)
      if (!Number.isSafeInteger(codePoint) || codePoint > 0x10ffff)
        return entity
      return String.fromCodePoint(codePoint)
    })

const stripUrlControls = (value: string): string =>
  [...value]
    .filter((character) => {
      const codePoint = character.codePointAt(0)
      return (
        codePoint !== undefined &&
        codePoint > 0x20 &&
        (codePoint < 0x7f || codePoint > 0x9f)
      )
    })
    .join('')

const isExecutableUrl = (value: string): boolean => {
  const normalized = stripUrlControls(decodeUrlEntities(value)).toLowerCase()
  if (normalized.startsWith('javascript:')) return true
  if (normalized.startsWith('vbscript:')) return true
  return (
    normalized.startsWith('data:') && !SAFE_DATA_IMAGE_PATTERN.test(normalized)
  )
}

const removeExecutableUrlAttributes = (html: string): string =>
  html.replace(
    URL_ATTRIBUTE_PATTERN,
    (attribute, whitespace, name, separator, encodedValue) => {
      const value = /^(['"])/.test(encodedValue)
        ? encodedValue.slice(1, -1)
        : encodedValue
      return isExecutableUrl(value)
        ? ''
        : `${whitespace}${name}${separator}${encodedValue}`
    },
  )

export interface HtmlExportOptions {
  includeBadge?: boolean
  canonicalUrl?: string
}

export function injectCanonicalUrl(html: string, canonicalUrl: string): string {
  const clean = String(html || '')
  const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`

  if (/<head>/i.test(clean)) {
    return clean.replace(/(<head>)/i, `$1${canonicalTag}`)
  }

  return `${canonicalTag}${clean}`
}

export function injectShipFastBadge(html: string): string {
  const clean = String(html || '').replace(SHIP_FAST_BADGE_RE, '')
  const badge = `<a ${SHIP_FAST_BADGE_MARKER} href="https://ship-fast.io" target="_blank" rel="noopener noreferrer" style="position:fixed;right:16px;bottom:16px;z-index:2147483000;display:inline-flex;align-items:center;gap:6px;padding:8px 10px;border-radius:999px;background:rgba(8,10,18,.86);color:#fff;font:600 12px/1.1 Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;text-decoration:none;box-shadow:0 10px 30px rgba(0,0,0,.22);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)"><span style="display:inline-grid;width:16px;height:16px;place-items:center;border-radius:50%;background:#fff;color:#0b0d12">${SHIP_FAST_BADGE_LOGO_SVG}</span><span>Built with Ship Fast</span></a>`
  if (/<\/body>/i.test(clean))
    return clean.replace(/<\/body>/i, `${badge}</body>`)
  return `${clean}${badge}`
}

export function buildHtmlExport(
  previewHtml: string,
  options: HtmlExportOptions = {},
): string {
  const { includeBadge = true, canonicalUrl } = options
  let html = previewHtml

  if (canonicalUrl) {
    html = injectCanonicalUrl(html, canonicalUrl)
  }

  if (includeBadge) {
    html = injectShipFastBadge(html)
  }

  return removeExecutableUrlAttributes(html)
}
