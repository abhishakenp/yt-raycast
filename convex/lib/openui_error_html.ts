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

/**
 * Detect DB-observed OpenUI handoff placeholder HTML — a full standalone
 * document stored when OpenUI rendering fails or returns an error shell. It
 * contains the `data-openui-ready="source"` marker, the
 * `ship-fast-openui-source` script tag, and/or the
 * "Generated OpenUI source is ready." placeholder text. This is NOT real
 * preview content and must never be exposed as public preview/gallery/
 * thumbnail/raw-preview content.
 *
 * Only full documents (`<!doctype html>` / `<html>`) are flagged so that bare
 * source fragments are left untouched.
 */
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

/**
 * Detect any preview HTML that is unsafe to expose publicly — either a real
 * OpenUI renderer-error document or a DB-observed OpenUI handoff placeholder.
 */
export const isUnsafePublicPreviewHtml = (
  html: string | undefined | null,
): boolean => isOpenUiErrorHtml(html) || isOpenUiHandoffHtml(html)
