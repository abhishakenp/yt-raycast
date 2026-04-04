import { existsSync, statSync } from 'node:fs'
import { extname, join, resolve, sep } from 'node:path'
import { resolveLanguageModeFromPreference } from '../pipeline/detect-language.js'

const MARK = 'data-sf-preview-tools="1"'

export function stripPreviewArtifactsFromHtml(html) {
  return String(html)
    .replace(/<script>window\.__SF_PREVIEW_SESSION_ID__=[^<]*<\/script>\s*/gi, '')
    .replace(/<script>window\.__SF_PREVIEW_AI__=[^<]*<\/script>\s*/gi, '')
    .replace(/<script\b[^>]*data-sf-preview-tools="1"[^>]*><\/script>\s*/gi, '')
}

export function injectPreviewToolsHtml(html, sessionId, preferredLanguage) {
  if (typeof html !== 'string' || html.includes(MARK)) return html
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
  const cfg = `<script>window.__SF_PREVIEW_SESSION_ID__=${JSON.stringify(sessionId ?? '')}</script>\n<script>window.__SF_PREVIEW_AI__=${JSON.stringify(aiOpts)}</script>\n`
  const snippet = `${cfg}<script src="/preview-tools-runtime.js" defer ${MARK}></script>`
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
