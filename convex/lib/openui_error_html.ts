/**
 * Detect real OpenUI renderer-error preview HTML — a complete standalone HTML
 * document whose body contains the SSR runtime's error marker (e.g.
 * `te is not a function`). Such preview HTML is a broken artifact and must
 * never be exposed through public API responses, gallery lists, deployment
 * payloads, or raw preview endpoints.
 *
 * Only full documents (`<!doctype html>` / `<html>`) are flagged so that bare
 * error fragments used as fallback placeholders are left untouched.
 */
export function isOpenUiErrorHtml(html: string | undefined | null): boolean {
  if (typeof html !== 'string' || html.length === 0) return false
  const isFullDocument =
    /^\s*<!doctype\s+html/i.test(html) || /^\s*<html[\s>]/i.test(html)
  if (!isFullDocument) return false
  return (
    /class=["'][^"']*\bopenui-error\b/i.test(html) ||
    /Failed to render:/i.test(html)
  )
}

export function isOpenUiHandoffHtml(html: string | undefined | null): boolean {
  if (typeof html !== 'string' || html.length === 0) return false
  const isFullDocument =
    /^\s*<!doctype\s+html/i.test(html) || /^\s*<html[\s>]/i.test(html)
  if (!isFullDocument) return false
  return (
    (/id=["']ship-fast-openui-source["']/i.test(html) ||
      /Generated OpenUI source is ready/i.test(html)) &&
    /data-openui-ready=["']source["']/i.test(html)
  )
}

export function isUnsafePublicPreviewHtml(
  html: string | undefined | null,
): boolean {
  return isOpenUiErrorHtml(html) || isOpenUiHandoffHtml(html)
}

/**
 * Detect OpenUI handoff markers in arbitrary text (e.g. bundled source files)
 * without requiring a full HTML document. Used to scan export artifacts for
 * leaked handoff placeholders before publishing.
 */
export function containsOpenUiHandoffMarkers(
  text: string | undefined | null,
): boolean {
  if (typeof text !== 'string' || text.length === 0) return false
  return (
    /id=["']ship-fast-openui-source["']/i.test(text) ||
    /Generated OpenUI source is ready/i.test(text)
  )
}
