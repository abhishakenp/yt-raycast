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
export const isOpenUiErrorHtml = (html: string | undefined | null): boolean => {
  if (typeof html !== 'string' || html.length === 0) return false
  const isFullDocument =
    /^\s*<!doctype\s+html/i.test(html) || /^\s*<html[\s>]/i.test(html)
  if (!isFullDocument) return false
  return (
    /class=["'][^"']*\bopenui-error\b/i.test(html) ||
    /Failed to render:/i.test(html)
  )
}

export const isOpenUiHandoffHtml = (
  html: string | undefined | null,
): boolean => {
  if (typeof html !== 'string' || html.length === 0) return false
  const isFullDocument =
    /^\s*<!doctype\s+html/i.test(html) || /^\s*<html[\s>]/i.test(html)
  if (!isFullDocument) return false
  return (
    /data-openui-ready=["']source["']/i.test(html) ||
    /id=["']ship-fast-openui-source["']/i.test(html) ||
    /Generated OpenUI source is ready/i.test(html)
  )
}

export const isUnsafePublicPreviewHtml = (
  html: string | undefined | null,
): boolean => isOpenUiErrorHtml(html) || isOpenUiHandoffHtml(html)
