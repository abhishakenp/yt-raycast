import { existsSync, statSync } from 'node:fs'
import { extname, join, resolve, sep } from 'node:path'
import { resolveLanguageModeFromPreference } from '@ship-fast/engine/pipeline/detect-language.js'
import { injectStorefrontCartUi } from '@ship-fast/engine/pipeline/storefront-cart-ui.js'

const MARK = 'data-sf-preview-tools="1"'

// Single canonical, self-hosted Tailwind v3 Play (JIT) bundle. The renderers
// (buildThemeHead / SSR shells) already emit this exact file; the rewrite below
// reconciles legacy CDN tags AND the old `/scripts/tailwind-runtime.js` path onto
// it so every preview — fresh stream or saved session — loads one working engine.
const TAILWIND_RUNTIME_SRC = '/scripts/tailwind-browser.js'
const TAILWIND_RUNTIME_TAG = `<script src="${TAILWIND_RUNTIME_SRC}"></script>`

/**
 * Rewrite Tailwind script tags to the single vendored JIT runtime.
 * Removes the external CDN dependency, silences the production warning, and
 * repoints the legacy `tailwind-runtime.js` path (which shipped truncated/corrupt)
 * onto the verified `tailwind-browser.js` bundle.
 * @param {string} html - The HTML content to rewrite
 * @returns {string} HTML with Tailwind scripts pointing at the canonical runtime
 */
export function rewriteTailwindCdn(html) {
  if (typeof html !== 'string') return html
  // Already on the canonical bundle — nothing to do.
  if (html.includes(TAILWIND_RUNTIME_SRC)) return html
  let out = html
  // Repoint the legacy local runtime path onto the canonical bundle.
  out = out.replace(
    /<script[^>]*src=["'][^"']*\/scripts\/tailwind-runtime\.js[^"']*["'][^>]*><\/script>/gi,
    TAILWIND_RUNTIME_TAG,
  )
  // Replace any CDN script tag with the local vendored runtime.
  out = out.replace(
    /<script[^>]*src=["']https?:\/\/cdn\.tailwindcss\.com[^"']*["'][^>]*><\/script>\s*/gi,
    `${TAILWIND_RUNTIME_TAG}`,
  )
  return out
}

// Design-token color vars the registry blocks theme themselves with. Opacity
// modifiers (bg-background/95, bg-primary/80) only decompose when the var holds
// bare RGB channels ("240 240 240") and the Tailwind config maps the color to
// `rgb(var(--X) / <alpha-value>)`. Saved sessions written by the legacy renderer
// stored hex vars + `var(--X)` colors, so those modifiers rendered transparent.
const THEME_COLOR_VAR_KEYS = [
  'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
  'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
  'accent', 'accent-foreground', 'destructive', 'destructive-foreground', 'border', 'input', 'ring',
  'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
  'sidebar', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground',
  'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring',
]
const THEME_COLOR_VAR_SET = new Set(THEME_COLOR_VAR_KEYS)

function hexToRgbChannels(hex) {
  const h = String(hex).replace(/^#/, '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = Number.parseInt(full, 16)
  if (Number.isNaN(n)) return null
  return `${(n >> 16) & 0xff} ${(n >> 8) & 0xff} ${n & 0xff}`
}

/**
 * Normalize a legacy preview theme head so Tailwind opacity modifiers resolve.
 * 1. Converts hex `--color: #rrggbb` :root vars (only the design-token color keys)
 *    to bare RGB channels.
 * 2. Rewrites a tailwind.config `colors` map of `"key":"var(--key)"` to
 *    `"key":"rgb(var(--key) / <alpha-value>)"`.
 * Idempotent: heads already in channel form (new renderer output) are untouched.
 * @param {string} html
 * @returns {string}
 */
export function normalizeThemeHead(html) {
  if (typeof html !== 'string') return html
  let out = html

  // 1) Tailwind config colors: "background":"var(--background)" -> alpha form.
  out = out.replace(
    /"([a-z0-9-]+)"\s*:\s*"var\(--\1\)"/gi,
    (match, key) =>
      THEME_COLOR_VAR_SET.has(key) ? `"${key}":"rgb(var(--${key}) / <alpha-value>)"` : match,
  )

  // 2) :root hex color tokens -> bare RGB channels.
  out = out.replace(/--([a-z0-9-]+)\s*:\s*(#(?:[0-9a-f]{3}|[0-9a-f]{6}))\b/gi, (match, key, hex) => {
    if (!THEME_COLOR_VAR_SET.has(key)) return match
    const channels = hexToRgbChannels(hex)
    return channels ? `--${key}: ${channels}` : match
  })

  // 3) body background/color set from `var(--background)` -> rgb(var(--background)).
  out = out.replace(
    /background-color:\s*var\(--background\)/gi,
    'background-color: rgb(var(--background))',
  )
  out = out.replace(/(?<![-\w])color:\s*var\(--foreground\)/gi, 'color: rgb(var(--foreground))')

  return out
}

export function stripPreviewArtifactsFromHtml(html) {
  return String(html)
    .replace(/<base\b[^>]*href\s*=\s*["']\/preview\/[a-f0-9]{12,64}\/?["'][^>]*>\s*/gi, '')
    .replace(/<script>window\.__SF_PREVIEW_SESSION_ID__=[^<]*<\/script>\s*/gi, '')
    .replace(/<script>window\.__SF_PREVIEW_AI__=[^<]*<\/script>\s*/gi, '')
    .replace(/<script>window\.__SF_PERSISTED_PALETTE__=[^<]*<\/script>\s*/gi, '')
    .replace(/<script\b[^>]*data-sf-preview-tools="1"[^>]*><\/script>\s*/gi, '')
}

export function injectPreviewToolsHtml(html, sessionId, preferredLanguage, sessionWorkspace, palette) {
  if (typeof html !== 'string') return html
  html = rewriteTailwindCdn(html)
  html = normalizeThemeHead(html)
  html = injectStorefrontCartUi(html, sessionWorkspace ? { workspace: sessionWorkspace } : {})
  const sid =
    sessionId != null && /^[a-f0-9]{12,64}$/i.test(String(sessionId)) ? String(sessionId) : ''
  if (sid && !/<base\b/i.test(html) && /<head\b[^>]*>/i.test(html)) {
    html = html.replace(/<head\b[^>]*>/i, (open) => `${open}\n<base href="/preview/${sid}/">`)
  }
  if (html.includes(MARK)) return html
  const mode = resolveLanguageModeFromPreference(preferredLanguage)
  const aiOpts = {
    canIndian: mode.isIndian === true,
    indianLabel:
      mode.isIndian && mode.language
        ? `${mode.language.name} (${mode.language.nativeName})`
        : mode.isIndian
          ? mode.name
          : '',
  }
  const paletteGlobal =
    palette && typeof palette === 'object'
      ? `<script>window.__SF_PERSISTED_PALETTE__=${JSON.stringify(palette)}</script>\n`
      : ''
  const cfg = `<script>window.__SF_PREVIEW_SESSION_ID__=${JSON.stringify(sessionId ?? '')}</script>\n<script>window.__SF_PREVIEW_AI__=${JSON.stringify(aiOpts)}</script>\n${paletteGlobal}`
  const snippet = `${cfg}<script src="/scripts/preview-tools-runtime.js" defer ${MARK}></script>`
  const lower = html.toLowerCase()
  const idx = lower.lastIndexOf('</body>')
  if (idx !== -1) return `${html.slice(0, idx)}${snippet}\n${html.slice(idx)}`
  return `${html}\n${snippet}`
}

function candidatesForUrlPath(decodedPath) {
  const clean = String(decodedPath || '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\\/g, '')
  if (!clean) return ['index.html']
  if (clean.endsWith('/')) return [`${clean}index.html`]
  if (extname(clean)) return [clean]
  return [`${clean}.html`, `${clean}/index.html`]
}

export function filePathForPreviewRequest(workspace, req) {
  const base = `/preview/${req.params.sessionId}`
  const url = String(req.originalUrl || '').split('?')[0]
  if (!url.startsWith(base)) return null
  const sub = url.slice(base.length) || '/'
  const decoded = decodeURIComponent(sub)
  if (decoded.includes('\0')) return null
  const root = resolve(workspace)
  for (const rel of candidatesForUrlPath(decoded)) {
    const parts = rel.split('/').filter(Boolean)
    if (parts.some((p) => p === '..')) continue
    const abs = resolve(join(root, ...parts))
    if (abs !== root && !abs.startsWith(root + sep)) continue
    if (existsSync(abs) && statSync(abs).isFile()) return abs
  }
  return null
}
