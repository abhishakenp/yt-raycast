const SHIP_FAST_BADGE_MARKER = 'data-ship-fast-export-badge="1"'
const SHIP_FAST_BADGE_RE = /\s*<a\b[^>]*data-ship-fast-export-badge="1"[\s\S]*?<\/a>/i
const SHIP_FAST_BADGE_LOGO_SVG =
  '<svg viewBox="0 0 52 52" width="16" height="16" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><path d="M26 4 8 20l6 2 12-12 12 12 6-2L26 4Z" fill="#7c3aed"/><path d="M14 22v18l8-4V24l-8-2Z" fill="#6d28d9"/><path d="M38 22v18l-8-4V24l8-2Z" fill="#6d28d9"/><path d="M22 24v12l4 2 4-2V24l-4-4-4 4Z" fill="#a78bfa"/><path d="m22 38 4 10 4-10-4 2-4-2Z" fill="#c4b5fd"/></svg>'

export interface HtmlExportOptions {
  includeBadge?: boolean
}

export function injectShipFastBadge(html: string): string {
  const clean = String(html || '').replace(SHIP_FAST_BADGE_RE, '')
  const badge = `<a ${SHIP_FAST_BADGE_MARKER} href="https://ship-fast.io" target="_blank" rel="noopener noreferrer" style="position:fixed;right:16px;bottom:16px;z-index:2147483000;display:inline-flex;align-items:center;gap:6px;padding:8px 10px;border-radius:999px;background:rgba(8,10,18,.86);color:#fff;font:600 12px/1.1 Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;text-decoration:none;box-shadow:0 10px 30px rgba(0,0,0,.22);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)"><span style="display:inline-grid;width:16px;height:16px;place-items:center;border-radius:50%;background:#fff;color:#0b0d12">${SHIP_FAST_BADGE_LOGO_SVG}</span><span>Built with Ship Fast</span></a>`
  if (/<\/body>/i.test(clean)) return clean.replace(/<\/body>/i, `${badge}</body>`)
  return `${clean}${badge}`
}

export function buildHtmlExport(previewHtml: string, options: HtmlExportOptions = {}): string {
  const { includeBadge = true } = options
  if (!includeBadge) return previewHtml
  return injectShipFastBadge(previewHtml)
}
